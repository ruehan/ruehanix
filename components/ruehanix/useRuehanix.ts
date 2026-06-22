"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCENT_PALETTE,
  APP_KEYS,
  APP_META,
  BOOT_SEQ,
  CATS,
  LAPS,
  PHOTOS,
  POSTS,
  THEME_MODES,
} from "@/lib/ruehanix/data";
import { accentEff, catColors, effMode, hexA, wallpaper } from "@/lib/ruehanix/theme";
import { area, computeLayout } from "@/lib/ruehanix/layout";
import type { AppKey, CatKey, ThemeMode, UiState } from "@/lib/ruehanix/types";

interface CoreState {
  booting: boolean;
  bootN: number;
  ws: number;
  focused: AppKey | null;
  selected: string;
  finderCat: "all" | CatKey;
  showLauncher: boolean;
  showKeys: boolean;
  open: Partial<Record<AppKey, { ws: number }>>;
  order: AppKey[];
  ratios: Record<string, number>;
  ui: UiState;
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
  selected: "p1",
  finderCat: "all",
  showLauncher: false,
  showKeys: false,
  open: { reader: { ws: 2 }, files: { ws: 2 }, terminal: { ws: 3 }, hotlap: { ws: 3 }, foto: { ws: 3 } },
  order: ["files", "reader", "terminal", "hotlap", "foto"],
  ratios: {},
  ui: { mode: "dark", accent: "#cba6f7", gap: 10, rounded: true, glow: true, transp: false },
};

export function useRuehanix() {
  const [st, setSt] = useState<CoreState>(INITIAL);
  const [vp, setVp] = useState({ W: 1280, H: 800 });
  const [sys, setSys] = useState({ clock: "00:00", cpu: 14, ram: 47 });

  const stRef = useRef(st);
  stRef.current = st;
  const dragRef = useRef<Drag>(null);
  const prefersLightRef = useRef(false);

  // --- 테마 적용 ---
  const applyTheme = useCallback((s: CoreState) => {
    const light = effMode(s.ui.mode, prefersLightRef.current) === "light";
    document.documentElement.classList.toggle("rh-light", light);
    document.documentElement.style.setProperty(
      "--accent",
      accentEff(s.ui.mode, s.ui.accent, prefersLightRef.current),
    );
  }, []);

  useEffect(() => {
    applyTheme(stRef.current);
  }, [st.ui.mode, st.ui.accent, applyTheme]);

  // --- 부팅 ---
  const runBoot = useCallback(() => {
    setSt((s) => ({ ...s, booting: true, bootN: 0 }));
    let n = 0;
    const bt = setInterval(() => {
      n++;
      setSt((s) => ({ ...s, bootN: Math.min(n, BOOT_SEQ.length) }));
      if (n >= BOOT_SEQ.length) {
        clearInterval(bt);
        setTimeout(() => setSt((s) => ({ ...s, booting: false })), 700);
      }
    }, 200);
    return bt;
  }, []);

  // --- 마운트: 리스너 / 인터벌 / 부팅 ---
  useEffect(() => {
    setVp({ W: window.innerWidth, H: window.innerHeight });
    const onResize = () => setVp({ W: window.innerWidth, H: window.innerHeight });

    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (d.type === "slider") {
        let pct = (e.clientX - d.left) / d.width;
        pct = Math.max(0, Math.min(1, pct));
        setSt((s) => ({ ...s, ui: { ...s.ui, gap: Math.round(pct * 28) } }));
        return;
      }
      const delta = d.dir === "v" ? e.clientX - d.sx : e.clientY - d.sy;
      let r = d.start + delta / d.total;
      r = Math.max(0.18, Math.min(0.82, r));
      setSt((s) => ({ ...s, ratios: { ...s.ratios, [d.key]: r } }));
    };
    const onUp = () => {
      dragRef.current = null;
    };
    const onKey = (e: KeyboardEvent) => {
      const s = stRef.current;
      if (s.booting) return;
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
        if (k === "q" || k === "Q") {
          if (s.focused) close(s.focused);
        }
      }
      if (k === "Escape") setSt((p) => ({ ...p, showLauncher: false, showKeys: false }));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    let mq: MediaQueryList | undefined;
    let mqh: ((e: MediaQueryListEvent) => void) | undefined;
    if (window.matchMedia) {
      mq = window.matchMedia("(prefers-color-scheme: light)");
      prefersLightRef.current = mq.matches;
      mqh = (e) => {
        prefersLightRef.current = e.matches;
        if (stRef.current.ui.mode === "auto") applyTheme(stRef.current);
      };
      mq.addEventListener("change", mqh);
    }

    applyTheme(stRef.current);
    setSys((p) => ({ ...p, clock: fmtClock() }));
    const bt = runBoot();
    const clockT = setInterval(
      () =>
        setSys({
          clock: fmtClock(),
          cpu: 8 + Math.floor(Math.random() * 26),
          ram: 44 + Math.floor(Math.random() * 12),
        }),
      1400,
    );

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      if (mq && mqh) mq.removeEventListener("change", mqh);
      clearInterval(bt);
      clearInterval(clockT);
    };
    // 마운트 시 1회만 — 핸들러는 ref/함수형 업데이트로 최신 상태를 읽는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 핸들러 ---
  const toggleLauncher = useCallback(() => setSt((s) => ({ ...s, showLauncher: !s.showLauncher, showKeys: false })), []);
  const toggleKeys = useCallback(() => setSt((s) => ({ ...s, showKeys: !s.showKeys, showLauncher: false })), []);
  const gotoWs = useCallback((n: number) => {
    setSt((s) => {
      const ids = s.order.filter((k) => s.open[k] && s.open[k]!.ws === n);
      return { ...s, ws: n, focused: ids[0] || null, showLauncher: false };
    });
  }, []);
  const openApp = useCallback((k: AppKey) => {
    setSt((s) => {
      const open = { ...s.open };
      let order = s.order;
      open[k] = { ws: s.ws };
      if (!order.includes(k)) order = [...order, k];
      return { ...s, open, order, focused: k, showLauncher: false };
    });
  }, []);
  const close = useCallback((k: AppKey) => {
    setSt((s) => {
      const open = { ...s.open };
      delete open[k];
      const ids = s.order.filter((x) => open[x] && open[x]!.ws === s.ws);
      return { ...s, open, focused: s.focused === k ? ids[ids.length - 1] || null : s.focused };
    });
  }, []);
  const focusApp = useCallback((k: AppKey) => setSt((s) => ({ ...s, focused: k })), []);
  const openPost = useCallback((id: string) => {
    setSt((s) => {
      const open = { ...s.open, reader: { ws: s.ws } };
      const order = s.order.includes("reader") ? s.order : [...s.order, "reader" as AppKey];
      return { ...s, open, order, selected: id, focused: "reader" };
    });
  }, []);
  const setReaderSel = useCallback((id: string) => setSt((s) => ({ ...s, selected: id })), []);
  const setFinderCat = useCallback((c: "all" | CatKey) => setSt((s) => ({ ...s, finderCat: c })), []);
  const setMode = useCallback((mode: ThemeMode) => setSt((s) => ({ ...s, ui: { ...s.ui, mode } })), []);
  const setAccent = useCallback((accent: string) => setSt((s) => ({ ...s, ui: { ...s.ui, accent } })), []);
  const toggleUi = useCallback(
    (key: "transp" | "rounded" | "glow") => setSt((s) => ({ ...s, ui: { ...s.ui, [key]: !s.ui[key] } })),
    [],
  );
  const reboot = useCallback(() => runBoot(), [runBoot]);
  const startSlider = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = { type: "slider", left: rect.left, width: rect.width };
    let pct = (e.clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    setSt((s) => ({ ...s, ui: { ...s.ui, gap: Math.round(pct * 28) } }));
  }, []);
  const startGutter = useCallback(
    (g: { key: string; dir: "v" | "h"; total: number }, e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = {
        type: "gutter",
        key: g.key,
        dir: g.dir,
        total: g.total,
        sx: e.clientX,
        sy: e.clientY,
        start: stRef.current.ratios[g.key] ?? 0.5,
      };
    },
    [],
  );

  return {
    st,
    sys,
    vp,
    prefersLight: prefersLightRef.current,
    handlers: {
      toggleLauncher,
      toggleKeys,
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
    },
    // 파생 헬퍼 — 뷰모델 빌더가 사용
    derive: { area, computeLayout, accentEff, catColors, effMode, hexA, wallpaper },
    data: { APP_KEYS, APP_META, CATS, POSTS, PHOTOS, LAPS, BOOT_SEQ, ACCENT_PALETTE, THEME_MODES },
  };
}

export type RuehanixApi = ReturnType<typeof useRuehanix>;
