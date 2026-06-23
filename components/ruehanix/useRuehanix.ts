"use client";

import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import {
  ACCENT_PALETTE,
  APP_KEYS,
  APP_META,
  BOOT_SEQ,
  CATS,
  LAPS,
  THEME_MODES,
} from "@/lib/ruehanix/data";
import {
  PLAYER_INITIAL,
  cycleRepeat,
  onEnded,
  playerNext,
  playerPrev,
  selectTrack,
  setVolume,
  toggle,
} from "@/lib/ruehanix/player";
import { PLAYER_STORAGE_KEY, parsePlayerState, serializePlayerState } from "@/lib/ruehanix/player-storage";
import { accentEff, catColors, effMode, hexA, wallpaper } from "@/lib/ruehanix/theme";
import { area, computeLayout } from "@/lib/ruehanix/layout";
import { isMobileWidth } from "@/lib/ruehanix/responsive";
import { BOOT_SESSION_KEY, shouldPlayBoot } from "@/lib/ruehanix/boot";
import { UI_STORAGE_KEY, parseUiState, serializeUiState } from "@/lib/ruehanix/ui-storage";
import type { AppKey, CatKey, Photo, PlayerState, ThemeMode, Track, UiState } from "@/lib/ruehanix/types";
import type { BlogPost } from "@/lib/posts/types";

interface CoreState {
  booting: boolean;
  bootN: number;
  ws: number;
  focused: AppKey | null;
  selected: string;
  finderCat: "all" | CatKey;
  showLauncher: boolean;
  showKeys: boolean;
  showMusic: boolean;
  open: Partial<Record<AppKey, { ws: number }>>;
  order: AppKey[];
  ratios: Record<string, number>;
  ui: UiState;
  player: PlayerState;
}

type Drag =
  | { type: "slider"; left: number; width: number }
  | { type: "gutter"; key: string; dir: "v" | "h"; total: number; sx: number; sy: number; start: number }
  | null;

const fmtClock = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
};

const INITIAL: CoreState = {
  booting: true,
  bootN: 0,
  ws: 1,
  focused: null,
  selected: "",
  finderCat: "all",
  showLauncher: false,
  showKeys: false,
  showMusic: false,
  open: { reader: { ws: 2 }, files: { ws: 2 }, terminal: { ws: 3 }, hotlap: { ws: 3 }, foto: { ws: 3 } },
  order: ["files", "reader", "terminal", "hotlap", "foto"],
  ratios: {},
  ui: { mode: "dark", accent: "#cba6f7", gap: 10, rounded: true, glow: true, transp: false },
  player: PLAYER_INITIAL,
};

// --- 외부 스토어: 뷰포트 크기 (resize 구독) ---
const VP_SERVER = { W: 1280, H: 800 };
let vpCache = { W: 1280, H: 800 };
function subscribeViewport(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
function getViewport() {
  if (vpCache.W !== window.innerWidth || vpCache.H !== window.innerHeight) {
    vpCache = { W: window.innerWidth, H: window.innerHeight };
  }
  return vpCache;
}

// --- 외부 스토어: OS 라이트 선호 (matchMedia 구독) ---
function subscribePrefersLight(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getPrefersLight() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
}

// --- 외부 스토어: 시계/리소스 (1.4초 틱) ---
const SYS_SERVER = { clock: "00:00", cpu: 14, ram: 47 };
let sysCache = { clock: "00:00", cpu: 14, ram: 47 };
function subscribeSys(cb: () => void) {
  // 구독 즉시 1회 시드 — 시계가 "00:00"에 머무르지 않게(재방문·reduced-motion 스킵 경로).
  sysCache = { ...sysCache, clock: fmtClock() };
  cb();
  const t = setInterval(() => {
    sysCache = {
      clock: fmtClock(),
      cpu: 8 + Math.floor(Math.random() * 26),
      ram: 44 + Math.floor(Math.random() * 12),
    };
    cb();
  }, 1400);
  return () => clearInterval(t);
}
function getSys() {
  return sysCache;
}

export function useRuehanix(posts: BlogPost[], tracks: Track[], photos: Photo[]) {
  const [st, setSt] = useState<CoreState>(() => ({ ...INITIAL, selected: posts[0]?.slug ?? "" }));
  const trackCount = tracks.length;
  const [launcherQuery, setLauncherQuery] = useState("");

  const vp = useSyncExternalStore(subscribeViewport, getViewport, () => VP_SERVER);
  const prefersLight = useSyncExternalStore(subscribePrefersLight, getPrefersLight, () => false);
  const sys = useSyncExternalStore(subscribeSys, getSys, () => SYS_SERVER);

  const dragRef = useRef<Drag>(null);
  const bootTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const uiSavedRef = useRef(false);
  const playerSavedRef = useRef(false);

  // --- 핸들러 (수동 메모이제이션 없이 — React Compiler 친화) ---
  const toggleLauncher = () => {
    setLauncherQuery("");
    setSt((s) => ({ ...s, showLauncher: !s.showLauncher, showKeys: false, showMusic: false }));
  };
  const toggleKeys = () => setSt((s) => ({ ...s, showKeys: !s.showKeys, showLauncher: false, showMusic: false }));
  const toggleMusic = () => setSt((s) => ({ ...s, showMusic: !s.showMusic, showLauncher: false, showKeys: false }));
  const gotoWs = (n: number) =>
    setSt((s) => {
      const ids = s.order.filter((k) => s.open[k] && s.open[k]!.ws === n);
      return { ...s, ws: n, focused: ids[0] || null, showLauncher: false };
    });
  const openApp = (k: AppKey) => {
    setLauncherQuery("");
    setSt((s) => {
      const open = { ...s.open };
      let order = s.order;
      open[k] = { ws: s.ws };
      if (!order.includes(k)) order = [...order, k];
      return { ...s, open, order, focused: k, showLauncher: false };
    });
  };
  const close = (k: AppKey) =>
    setSt((s) => {
      const open = { ...s.open };
      delete open[k];
      const ids = s.order.filter((x) => open[x] && open[x]!.ws === s.ws);
      return { ...s, open, focused: s.focused === k ? ids[ids.length - 1] || null : s.focused };
    });
  const focusApp = (k: AppKey) => setSt((s) => ({ ...s, focused: k }));
  const openPost = (id: string) =>
    setSt((s) => {
      const open = { ...s.open, reader: { ws: s.ws } };
      const order = s.order.includes("reader") ? s.order : [...s.order, "reader" as AppKey];
      return { ...s, open, order, selected: id, focused: "reader" };
    });
  const setReaderSel = (id: string) => setSt((s) => ({ ...s, selected: id }));
  const setFinderCat = (c: "all" | CatKey) => setSt((s) => ({ ...s, finderCat: c }));
  const setMode = (mode: ThemeMode) => setSt((s) => ({ ...s, ui: { ...s.ui, mode } }));
  const setAccent = (accent: string) => setSt((s) => ({ ...s, ui: { ...s.ui, accent } }));
  const toggleUi = (key: "transp" | "rounded" | "glow") => setSt((s) => ({ ...s, ui: { ...s.ui, [key]: !s.ui[key] } }));
  const setGap = (gap: number) => setSt((s) => ({ ...s, ui: { ...s.ui, gap } }));
  const setRatio = (key: string, r: number) => setSt((s) => ({ ...s, ratios: { ...s.ratios, [key]: r } }));

  // --- 음악 플레이어 핸들러 (순수 reducer 위임) ---
  const playerToggle = () => setSt((s) => ({ ...s, player: trackCount > 0 ? toggle(s.player) : s.player }));
  const playerSkipNext = () => setSt((s) => ({ ...s, player: playerNext(s.player, trackCount) }));
  const playerSkipPrev = () => setSt((s) => ({ ...s, player: playerPrev(s.player, trackCount) }));
  const playerSelect = (i: number) => setSt((s) => ({ ...s, player: selectTrack(s.player, i, trackCount) }));
  const playerSetVolume = (v: number) => setSt((s) => ({ ...s, player: setVolume(s.player, v) }));
  const playerCycleRepeat = () => setSt((s) => ({ ...s, player: cycleRepeat(s.player) }));
  const playerEnded = () => setSt((s) => ({ ...s, player: onEnded(s.player, trackCount) }));

  const startSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = { type: "slider", left: rect.left, width: rect.width };
    let pct = (e.clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    setGap(Math.round(pct * 28));
  };
  const startGutter = (g: { key: string; dir: "v" | "h"; total: number }, e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      type: "gutter",
      key: g.key,
      dir: g.dir,
      total: g.total,
      sx: e.clientX,
      sy: e.clientY,
      start: st.ratios[g.key] ?? 0.5,
    };
  };

  const startBootTimer = () => {
    clearInterval(bootTimerRef.current);
    let n = 0;
    bootTimerRef.current = setInterval(() => {
      n++;
      setSt((s) => ({ ...s, bootN: Math.min(n, BOOT_SEQ.length) }));
      if (n >= BOOT_SEQ.length) {
        clearInterval(bootTimerRef.current);
        setTimeout(() => {
          setSt((s) => ({ ...s, booting: false }));
          try {
            window.sessionStorage.setItem(BOOT_SESSION_KEY, "1");
          } catch {
            /* sessionStorage 불가 환경 무시 */
          }
        }, 700);
      }
    }, 200);
  };
  const reboot = () => {
    setSt((s) => ({ ...s, booting: true, bootN: 0 }));
    startBootTimer();
  };

  // 키보드 단축키 — useEffectEvent로 최신 상태/핸들러를 읽되 effect 재실행은 막는다.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (st.booting) return;
    if (isMobileWidth(window.innerWidth)) return; // 모바일엔 워크스페이스/런처 개념 없음
    const k = e.key;
    if (e.metaKey || e.altKey) {
      if (k === "d" || k === "D") {
        e.preventDefault();
        toggleLauncher();
      }
      if (k === "/") {
        e.preventDefault();
        toggleKeys();
      }
      if (k >= "1" && k <= "6") {
        e.preventDefault();
        gotoWs(+k);
      }
      if ((k === "q" || k === "Q") && st.focused) close(st.focused);
    }
    if (k === "Escape") {
      setLauncherQuery("");
      setSt((p) => ({ ...p, showLauncher: false, showKeys: false, showMusic: false }));
    }
  });

  // --- 테마 적용 (DOM 쓰기, setState 아님) ---
  useEffect(() => {
    const light = effMode(st.ui.mode, prefersLight) === "light";
    document.documentElement.classList.toggle("rh-light", light);
    document.documentElement.style.setProperty("--accent", accentEff(st.ui.mode, st.ui.accent, prefersLight));
  }, [st.ui.mode, st.ui.accent, prefersLight]);

  // --- 마우스 드래그 / 키보드 리스너 (마운트 1회) ---
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (d.type === "slider") {
        let pct = (e.clientX - d.left) / d.width;
        pct = Math.max(0, Math.min(1, pct));
        setGap(Math.round(pct * 28));
        return;
      }
      const delta = d.dir === "v" ? e.clientX - d.sx : e.clientY - d.sy;
      let r = d.start + delta / d.total;
      r = Math.max(0.18, Math.min(0.82, r));
      setRatio(d.key, r);
    };
    const onUp = () => {
      dragRef.current = null;
    };
    const onKeyDown = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // --- 마운트 1회: UI 설정 복원 + 부팅 결정 ---
  useEffect(() => {
    let rawUi: string | null = null;
    try {
      rawUi = window.localStorage.getItem(UI_STORAGE_KEY);
    } catch {
      /* 무시 */
    }
    const savedUi = parseUiState(rawUi);
    let rawPlayer: string | null = null;
    try {
      rawPlayer = window.localStorage.getItem(PLAYER_STORAGE_KEY);
    } catch {
      /* 무시 */
    }
    // 트랙은 비동기(Sanity)로 들어오므로 마운트 시 곡 수를 단정할 수 없다.
    // 범위 밖 인덱스는 뷰모델에서 표시 시점에 클램프한다(reducer는 모듈러로 자가 보정).
    const savedPlayer = parsePlayerState(rawPlayer);
    let booted = false;
    try {
      booted = !!window.sessionStorage.getItem(BOOT_SESSION_KEY);
    } catch {
      /* 무시 */
    }
    const reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const skipBoot = !shouldPlayBoot(booted, reduced);
    if (savedUi || savedPlayer || skipBoot) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 1회: 브라우저 전용 상태(설정·플레이어 복원·부팅 결정) 초기화. 렌더/SSR 단계에서 불가.
      setSt((s) => ({
        ...s,
        ...(savedUi ? { ui: savedUi } : {}),
        ...(savedPlayer ? { player: savedPlayer } : {}),
        ...(skipBoot ? { booting: false } : {}),
      }));
    }
    if (!skipBoot) startBootTimer();
    return () => clearInterval(bootTimerRef.current);
  }, []);

  // --- UI 설정 영속화 (마운트 첫 실행은 복원 전이라 저장 건너뜀) ---
  useEffect(() => {
    if (!uiSavedRef.current) {
      uiSavedRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(UI_STORAGE_KEY, serializeUiState(st.ui));
    } catch {
      /* 무시 */
    }
  }, [st.ui]);

  // --- 플레이어 상태 영속화 (마운트 첫 실행은 복원 전이라 저장 건너뜀) ---
  useEffect(() => {
    if (!playerSavedRef.current) {
      playerSavedRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(PLAYER_STORAGE_KEY, serializePlayerState(st.player));
    } catch {
      /* 무시 */
    }
  }, [st.player]);

  return {
    st,
    sys,
    vp,
    posts,
    launcherQuery,
    prefersLight,
    handlers: {
      setLauncherQuery,
      toggleLauncher,
      toggleKeys,
      toggleMusic,
      gotoWs,
      openApp,
      close,
      focusApp,
      openPost,
      setReaderSel,
      setFinderCat,
      setMode,
      setAccent,
      toggleUi,
      reboot,
      startSlider,
      startGutter,
      playerToggle,
      playerSkipNext,
      playerSkipPrev,
      playerSelect,
      playerSetVolume,
      playerCycleRepeat,
      playerEnded,
    },
    // 파생 헬퍼 — 뷰모델 빌더가 사용
    derive: { area, computeLayout, accentEff, catColors, effMode, hexA, wallpaper },
    tracks,
    photos,
    data: { APP_KEYS, APP_META, CATS, LAPS, BOOT_SEQ, ACCENT_PALETTE, THEME_MODES },
  };
}

export type RuehanixApi = ReturnType<typeof useRuehanix>;
