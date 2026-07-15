"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
import {
  LAYOUT_STORAGE_KEY,
  parseLayoutSnapshot,
  serializeLayoutSnapshot,
} from "@/lib/ruehanix/layout-storage";
import { accentEff, catColors, effMode, hexA, wallpaper } from "@/lib/ruehanix/theme";
import { area, computeLayout } from "@/lib/ruehanix/layout";
import { isMobileWidth } from "@/lib/ruehanix/responsive";
import { BOOT_SESSION_KEY, shouldPlayBoot } from "@/lib/ruehanix/boot";
import { UI_STORAGE_KEY, DEFAULT_UI, parseUiState, serializeUiState } from "@/lib/ruehanix/ui-storage";
import { recordVisitStore } from "@/lib/ruehanix/visits";
import { matchCommands, type Command } from "@/lib/ruehanix/commands";
import { close as closeState, gotoWs as gotoWsState, minimize as minimizeState, moveTile as moveTileState, moveToWs as moveToWsState, openApp as openAppState, openPostReader as openPostReaderState, setFloatRect as setFloatRectState, toggleFloating as toggleFloatingState, toggleMaximize as toggleMaximizeState } from "@/lib/ruehanix/windowState";
import type { AppKey, ArtistInfo, Album, CatKey, FloatRect, Photo, PlayerState, ThemeMode, Track, UiState } from "@/lib/ruehanix/types";
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
  showCommandPalette: boolean;
  open: Partial<Record<AppKey, { ws: number }>>;
  order: AppKey[];
  ratios: Record<string, number>;
  minimized: Partial<Record<AppKey, boolean>>;
  maximized: AppKey | null;
  floating: Partial<Record<AppKey, FloatRect>>;
  ui: UiState;
  player: PlayerState;
}

type Drag =
  | { type: "slider"; left: number; width: number }
  | { type: "gutter"; key: string; dir: "v" | "h"; total: number; sx: number; sy: number; start: number }
  | { type: "float"; app: AppKey; sx: number; sy: number; orig: FloatRect }
  | { type: "floatresize"; app: AppKey; sx: number; sy: number; orig: FloatRect }
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
  showCommandPalette: false,
  // 기본 빈 워크스페이스(Hyprland 첫 로그인처럼 깨끗한 시작). 앱은 런처/독에서 사용자가 엶.
  open: {},
  order: [],
  ratios: {},
  minimized: {},
  maximized: null,
  floating: {},
  ui: DEFAULT_UI,
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

/** 셸에 주입되는 콘텐츠(서버에서 Sanity fetch). 동형 배열이 많아 순서 혼동을 피하려 객체로 받는다. */
export interface ShellContent {
  posts: BlogPost[];
  tracks: Track[];
  photos: Photo[];
  artists: ArtistInfo[];
  albums: Album[];
}

export function useRuehanix({ posts, tracks, photos, artists, albums }: ShellContent) {
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
  const layoutSavedRef = useRef(false);

  // --- 핸들러 (수동 메모이제이션 없이 — React Compiler 친화) ---
  const toggleLauncher = useCallback(() => {
    setLauncherQuery("");
    setSt((s) => ({ ...s, showLauncher: !s.showLauncher, showKeys: false, showMusic: false, showCommandPalette: false }));
  }, [setSt, setLauncherQuery]);
  const toggleKeys = useCallback(() => setSt((s) => ({ ...s, showKeys: !s.showKeys, showLauncher: false, showMusic: false, showCommandPalette: false })), [setSt]);
  const toggleMusic = useCallback(() => setSt((s) => ({ ...s, showMusic: !s.showMusic, showLauncher: false, showKeys: false, showCommandPalette: false })), [setSt]);
  const toggleCommandPalette = useCallback(() => setSt((s) => ({ ...s, showCommandPalette: !s.showCommandPalette, showLauncher: false, showKeys: false, showMusic: false })), [setSt]);
  const gotoWs = useCallback((n: number) => setSt((s) => ({ ...s, ...gotoWsState(s, n), showLauncher: false })), [setSt]);
  const openApp = useCallback((k: AppKey) => {
    setLauncherQuery("");
    setSt((s) => ({ ...s, ...openAppState(s, k), showLauncher: false }));
  }, [setSt, setLauncherQuery]);
  const close = useCallback((k: AppKey) => setSt((s) => ({ ...s, ...closeState(s, k) })), [setSt]);
  const focusApp = useCallback((k: AppKey) => setSt((s) => ({ ...s, focused: k })), [setSt]);
  const minimize = useCallback((k: AppKey) => setSt((s) => ({ ...s, ...minimizeState(s, k) })), [setSt]);
  const toggleMaximize = useCallback((k: AppKey) => setSt((s) => ({ ...s, ...toggleMaximizeState(s, k) })), [setSt]);
  const moveToWs = useCallback((k: AppKey, n: number) => setSt((s) => ({ ...s, ...moveToWsState(s, k, n), showLauncher: false })), [setSt]);
  const moveTile = useCallback((k: AppKey, dir: "left" | "right") => setSt((s) => ({ ...s, ...moveTileState(s, k, dir) })), [setSt]);
  const toggleFloating = useCallback((k: AppKey, rect: FloatRect) => setSt((s) => ({ ...s, ...toggleFloatingState(s, k, rect) })), [setSt]);
  const startFloatDrag = (k: AppKey, e: React.MouseEvent) => {
    const orig = st.floating[k];
    if (!orig) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { type: "float", app: k, sx: e.clientX, sy: e.clientY, orig };
  };
  const startFloatResize = (k: AppKey, e: React.MouseEvent) => {
    const orig = st.floating[k];
    if (!orig) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { type: "floatresize", app: k, sx: e.clientX, sy: e.clientY, orig };
  };
  // 플로팅 기본 rect — 뷰포트 60%×70% 중앙, 최소 360×240.
  const defaultFloatRect = (): FloatRect => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const w = Math.max(360, Math.round(W * 0.6));
    const h = Math.max(240, Math.round(H * 0.7));
    return { x: Math.round((W - w) / 2), y: Math.round((H - h) / 2 - 20), w, h };
  };
  const openPost = useCallback((id: string) => {
    recordVisitStore(id);
    setSt((s) => {
      const w = openPostReaderState(s, id);
      return { ...s, ...w, showLauncher: false };
    });
  }, [setSt]);
  const setReaderSel = useCallback((id: string) => setSt((s) => ({ ...s, selected: id })), [setSt]);
  const setFinderCat = useCallback((c: "all" | CatKey) => setSt((s) => ({ ...s, finderCat: c })), [setSt]);
  const setMode = useCallback((mode: ThemeMode) => setSt((s) => ({ ...s, ui: { ...s.ui, mode } })), [setSt]);
  const setAccent = useCallback((accent: string) => setSt((s) => ({ ...s, ui: { ...s.ui, accent } })), [setSt]);
  const toggleUi = useCallback((key: "transp" | "rounded" | "glow") => setSt((s) => ({ ...s, ui: { ...s.ui, [key]: !s.ui[key] } })), [setSt]);
  const setGap = useCallback((gap: number) => setSt((s) => ({ ...s, ui: { ...s.ui, gap } })), [setSt]);
  const resetUi = useCallback(() => setSt((s) => ({ ...s, ui: DEFAULT_UI })), [setSt]);
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
    // Ctrl/Cmd+K — 명령 팔레트(브라우저 기본 검색 회피 위해 preventDefault).
    if ((e.ctrlKey || e.metaKey) && (k === "k" || k === "K")) {
      e.preventDefault();
      toggleCommandPalette();
      return;
    }
    // 숫자키는 e.code(물리 키)로 판정 — Shift+숫자가 e.key로는 "!@#$%^"로 와서 Super+Shift+1-6이 불발.
    const digit = e.code.startsWith("Digit") ? +e.code.slice(5) : 0;
    if (e.metaKey || e.altKey) {
      if (k === "d" || k === "D") {
        e.preventDefault();
        toggleLauncher();
      }
      if (k === "/") {
        e.preventDefault();
        toggleKeys();
      }
      if (digit >= 1 && digit <= 6) {
        e.preventDefault();
        if (e.shiftKey && st.focused) moveToWs(st.focused, digit);
        else gotoWs(digit);
      }
      if ((k === "q" || k === "Q") && st.focused) close(st.focused);
      // Super+F: 브라우저 기본 검색(Cmd/Ctrl+F) 충돌 회피 위해 preventDefault.
      if ((k === "f" || k === "F") && st.focused) {
        e.preventDefault();
        toggleMaximize(st.focused);
      }
      // Super+G: 포커스 창 플로팅 토글(Hyprland togglefloating).
      if ((k === "g" || k === "G") && st.focused) {
        e.preventDefault();
        toggleFloating(st.focused, defaultFloatRect());
      }
      // Super+Shift+←/→: 포커스 창을 order 상 인접 타일과 자리바꿈.
      if (e.shiftKey && st.focused && (k === "ArrowLeft" || k === "ArrowRight")) {
        e.preventDefault();
        moveTile(st.focused, k === "ArrowLeft" ? "left" : "right");
      }
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

  // --- layout 영속 — ws/open/order/ratios/minimized/maximized 변경 시
  //     localStorage `rh-layout` 에 저장. drag/resize 중 매 프레임 저장을 피하려
  //     200ms debounce. ui/player 와 동일 패턴 — post-mount useEffect 에서
  //     1회 read-then-setSt (SSR safe) + 이후 변경 시 debounce write.
  //     첫 effect 실행은 layoutSavedRef 로 skip (mount 후 INITIAL → 복원
  //     setSt 직전 1회의 redundant write 방지).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!layoutSavedRef.current) {
      // read 도 try/catch — Safari 프라이빗/iframe sandboxed 등에서 SecurityError 가능.
      // ui/player 복원 패턴과 일관.
      let raw: string | null = null;
      try {
        raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
      } catch {
        // 무시 — parseLayoutSnapshot(null) 가 DEFAULT 로 폴백.
      }
      const snap = parseLayoutSnapshot(raw);
      setSt((p) => ({
        ...p,
        ws: snap.ws,
        open: snap.open,
        order: snap.order,
        ratios: snap.ratios,
        minimized: snap.minimized,
        maximized: snap.maximized,
        floating: snap.floating ?? {},
      }));
      layoutSavedRef.current = true;
      return;
    }
    const t = setTimeout(() => {
      try {
        const snap = {
          version: 2 as const,
          ws: st.ws,
          open: st.open,
          order: st.order,
          ratios: st.ratios,
          minimized: st.minimized,
          maximized: st.maximized,
          floating: st.floating,
        };
        window.localStorage.setItem(LAYOUT_STORAGE_KEY, serializeLayoutSnapshot(snap));
      } catch {
        // quota/permission — 무시.
      }
    }, 200);
    return () => clearTimeout(t);
  }, [st.ws, st.open, st.order, st.ratios, st.minimized, st.maximized, st.floating]);

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
      if (d.type === "float") {
        const W = window.innerWidth;
        const H = window.innerHeight;
        // 창이 화면 밖으로 완전히 나가지 않게(최소 80px는 보이게) 클램프.
        const x = Math.max(-d.orig.w + 80, Math.min(W - 80, d.orig.x + (e.clientX - d.sx)));
        const y = Math.max(0, Math.min(H - 40, d.orig.y + (e.clientY - d.sy)));
        setSt((s) => ({ ...s, ...setFloatRectState(s, d.app, { ...d.orig, x, y }) }));
        return;
      }
      if (d.type === "floatresize") {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const w = Math.max(320, Math.min(W - d.orig.x, d.orig.w + (e.clientX - d.sx)));
        const h = Math.max(200, Math.min(H - d.orig.y, d.orig.h + (e.clientY - d.sy)));
        setSt((s) => ({ ...s, ...setFloatRectState(s, d.app, { ...d.orig, w, h }) }));
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

  // 명령 팔레트 — 셸의 모든 액션을 자연어 fuzzy 로 검색/실행.
  // 핸들러는 useCallback 으로 안정화 — commands 가 매 렌더 새로 만들어지지 않게.
  const commands: Command[] = useMemo(() => {
    const appKeys: AppKey[] = ["files", "reader", "foto", "hotlap", "terminal", "web", "music", "settings", "about"];
    return [
      ...appKeys.map((k) => ({
        id: `app:${k}`,
        title: `${APP_META[k].name} 열기`,
        group: "app" as const,
        keywords: [k, APP_META[k].name.toLowerCase(), APP_META[k].hint.toLowerCase()],
        run: () => openApp(k),
      })),
      ...[1, 2, 3, 4, 5, 6].map((n) => ({
        id: `ws:${n}`,
        title: `워크스페이스 ${n}`,
        group: "ws" as const,
        keywords: [`ws ${n}`, `workspace ${n}`, String(n), `워크스페이스 ${n}`],
        run: () => gotoWs(n),
      })),
      ...(["light", "dark", "auto"] as const).map((m) => ({
        id: `theme:${m}`,
        title: `테마: ${m === "auto" ? "Auto" : m === "light" ? "Light" : "Dark"}`,
        group: "theme" as const,
        keywords: ["theme", m, m === "light" ? "라이트" : m === "dark" ? "다크" : "자동"],
        run: () => setMode(m),
      })),
      {
        id: "shell:sync-posts",
        title: "콘텐츠 동기화 (md → Sanity)",
        group: "shell" as const,
        keywords: ["sync", "posts", "동기화", "sanity", "import"],
        run: () => { window.location.assign("/api/sync-posts"); },
      },
      {
        id: "shell:keybindings",
        title: "단축키 보기",
        group: "shell" as const,
        keywords: ["keybindings", "단축키", "shortcut", "keys"],
        run: () => toggleKeys(),
      },
      {
        id: "nav:home",
        title: "홈으로",
        group: "nav" as const,
        keywords: ["home", "홈", "/"],
        run: () => { window.location.assign("/"); },
      },
      {
        id: "nav:posts",
        title: "모든 글",
        group: "nav" as const,
        keywords: ["posts", "글", "list", "목록"],
        run: () => { window.location.assign("/posts"); },
      },
      {
        id: "nav:studio",
        title: "Sanity Studio",
        group: "nav" as const,
        keywords: ["studio", "스튜디오", "sanity", "content"],
        run: () => { window.location.assign("/studio"); },
      },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps -- openApp/gotoWs/setMode/toggleKeys 가 useCallback 으로 안정화됨.
  }, [openApp, gotoWs, setMode, toggleKeys]);

  return {
    st,
    sys,
    vp,
    posts,
    launcherQuery,
    prefersLight,
    commands,
    handlers: {
      setLauncherQuery,
      toggleLauncher,
      toggleKeys,
      toggleMusic,
      toggleCommandPalette,
      gotoWs,
      openApp,
      close,
      focusApp,
      minimize,
      toggleMaximize,
      moveToWs,
      moveTile,
      toggleFloating,
      defaultFloatRect,
      startFloatDrag,
      startFloatResize,
      openPost,
      setReaderSel,
      setFinderCat,
      setMode,
      setAccent,
      toggleUi,
      resetUi,
      setGap,
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
    artists,
    albums,
    data: { APP_KEYS, APP_META, CATS, LAPS, BOOT_SEQ, ACCENT_PALETTE, THEME_MODES },
  };
}

export type RuehanixApi = ReturnType<typeof useRuehanix>;
