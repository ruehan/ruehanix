import type { CSSProperties } from "react";
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
import { DESKTOP_DOCK_RESERVE, MOBILE_TOPBAR, isMobileWidth, mobileAppRect } from "@/lib/ruehanix/responsive";
import type { AppKey, CatKey } from "@/lib/ruehanix/types";
import type { RuehanixApi } from "./useRuehanix";

const C = {
  base: "var(--base)",
  mantle: "var(--mantle)",
  surf0: "var(--surf0)",
  ov0: "var(--ov0)",
} as const;

export interface RowPost {
  id: string;
  title: string;
  date: string;
  read: string;
  excerpt: string;
  catLabel: string;
  catColor: string;
  rowBg: string;
  open: () => void;
}

export function buildVm(api: RuehanixApi) {
  const { st, sys, vp, prefersLight, handlers } = api;
  const ui = st.ui;
  const accent = accentEff(ui.mode, ui.accent, prefersLight);
  const lightMode = effMode(ui.mode, prefersLight) === "light";
  const rad = ui.rounded ? 11 : 2;

  const mobile = isMobileWidth(vp.W);
  // 데스크톱은 항상 보이는 독이 타일 창을 가리지 않게 하단 자리를 비운다.
  const reserve = mobile ? 0 : DESKTOP_DOCK_RESERVE;
  const curIds = st.order.filter((k) => st.open[k] && st.open[k]!.ws === st.ws);
  const lay = computeLayout(curIds, area(vp, ui.gap, reserve), st.ratios, st.ws, ui.gap);

  // --- 창 타일 스타일 ---
  const tiles = {} as Record<AppKey, CSSProperties>;
  for (const k of APP_KEYS) {
    if (mobile) {
      // 모바일: 포커스된 앱 하나만 풀스크린, 나머지는 숨긴다(타일링/거터 없음).
      const visM = st.focused === k && st.open[k] && !st.booting;
      if (!visM) {
        tiles[k] = { position: "absolute", display: "none" };
        continue;
      }
      const mr = mobileAppRect(vp);
      tiles[k] = {
        position: "absolute",
        left: mr.x,
        top: mr.y,
        width: mr.w,
        height: mr.h,
        overflow: "hidden",
        background: C.base,
        zIndex: 120,
      };
      continue;
    }
    const r = lay.rects[k];
    const vis = st.open[k] && st.open[k]!.ws === st.ws && !st.booting && r;
    if (!vis || !r) {
      tiles[k] = { position: "absolute", display: "none" };
      continue;
    }
    const foc = st.focused === k;
    const shadow = foc
      ? ui.glow
        ? `0 0 0 1px ${hexA(accent, 0.45)},0 0 22px ${hexA(accent, 0.35)},0 14px 40px rgba(0,0,0,.5)`
        : "0 14px 40px rgba(0,0,0,.5)"
      : "0 8px 24px rgba(0,0,0,.35)";
    const op = ui.transp ? (foc ? 0.97 : 0.82) : 1;
    tiles[k] = {
      position: "absolute",
      left: r.x,
      top: r.y,
      width: r.w,
      height: r.h,
      borderRadius: rad,
      overflow: "hidden",
      border: `2px solid ${foc ? accent : C.surf0}`,
      opacity: op,
      ...(ui.transp ? { backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)" } : {}),
      boxShadow: shadow,
      transition:
        "left .17s ease,top .17s ease,width .17s ease,height .17s ease,border-color .15s,opacity .15s,box-shadow .15s",
      zIndex: foc ? 120 : 110,
    };
  }

  const gutters = (mobile ? [] : lay.gutters).map((g) => ({
    key: g.key,
    onMouseDown: (e: React.MouseEvent) => handlers.startGutter(g, e),
    style: {
      position: "absolute",
      left: g.x,
      top: g.y,
      width: g.w,
      height: g.h,
      zIndex: 300,
      cursor: g.dir === "v" ? "col-resize" : "row-resize",
    } as CSSProperties,
  }));

  const focus = {} as Record<AppKey, () => void>;
  const close = {} as Record<AppKey, (e?: React.MouseEvent) => void>;
  for (const k of APP_KEYS) {
    focus[k] = () => handlers.focusApp(k);
    close[k] = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      handlers.close(k);
    };
  }

  const wsList = [1, 2, 3, 4, 5, 6].map((n) => {
    const occupied = st.order.some((k) => st.open[k] && st.open[k]!.ws === n);
    const active = st.ws === n;
    const color = active ? "var(--on-accent)" : occupied ? accent : "var(--ov0)";
    return {
      n,
      onClick: () => handlers.gotoWs(n),
      style: {
        minWidth: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 6px",
        borderRadius: 6,
        fontSize: 12,
        cursor: "pointer",
        color,
        ...(active ? { background: accent, fontWeight: 700 } : occupied ? { background: hexA(accent, 0.16) } : {}),
      } as CSSProperties,
    };
  });

  const fm = st.focused ? APP_META[st.focused] : null;
  const focusTitle = fm ? fm.name : "ruehanix · Hyprland";
  const focusDot = fm ? fm.color : "var(--ov0)";

  const appList = APP_KEYS.map((k) => ({
    key: k,
    name: APP_META[k].name,
    color: APP_META[k].color,
    hint: APP_META[k].hint,
    onClick: () => handlers.openApp(k),
  }));

  // 모바일 하단 독(앱 전환) + 홈(포커스 닫기).
  const dock = APP_KEYS.map((k) => ({
    key: k,
    name: APP_META[k].name,
    color: APP_META[k].color,
    active: st.focused === k,
    onClick: () => handlers.openApp(k),
  }));
  const homeClick = () => {
    if (st.focused) handlers.close(st.focused);
  };

  // --- 블로그 데이터 ---
  const catC = catColors(lightMode);
  const catOf = (id: CatKey) => ({ label: CATS[id].label, color: catC[id] || CATS[id].color });
  const decorate = (p: (typeof POSTS)[number]): RowPost => {
    const c = catOf(p.cat);
    return {
      id: p.id,
      title: p.title,
      date: p.date,
      read: p.read,
      excerpt: p.excerpt,
      catLabel: c.label,
      catColor: c.color,
      rowBg: p.id === st.selected ? hexA(accent, 0.14) : "transparent",
      open: () => handlers.openPost(p.id),
    };
  };
  const fc = st.finderCat;
  const finderPosts = POSTS.filter((p) => fc === "all" || p.cat === fc).map(decorate);
  const finderCount = finderPosts.length + " items · " + POSTS.length + " total";
  const catList: { key: "all" | CatKey; label: string }[] = [
    { key: "all", label: "all" },
    ...(Object.keys(CATS) as CatKey[]).map((k) => ({ key: k, label: CATS[k].label })),
  ];
  const finderCats = catList.map((c) => ({
    key: c.key,
    label: c.label,
    onClick: () => handlers.setFinderCat(c.key),
    chipStyle: {
      padding: "3px 11px",
      borderRadius: 7,
      fontSize: 12,
      cursor: "pointer",
      whiteSpace: "nowrap",
      ...(c.key === fc
        ? { background: accent, color: "var(--on-accent)", fontWeight: 700 }
        : { background: "var(--surf0)", color: "var(--sub0)" }),
    } as CSSProperties,
  }));

  const selP = POSTS.find((p) => p.id === st.selected) || POSTS[0];
  const selC = catOf(selP.cat);
  const post = {
    title: selP.title,
    date: selP.date,
    read: selP.read,
    catLabel: selC.label,
    catColor: selC.color,
    paras: selP.body.map((t, i) => ({ id: i, text: t })),
  };

  const readerList = POSTS.map((p) => {
    const c = catOf(p.cat);
    return {
      id: p.id,
      title: p.title,
      catColor: c.color,
      date: p.date,
      bg: p.id === st.selected ? hexA(accent, 0.14) : "transparent",
      open: () => handlers.setReaderSel(p.id),
    };
  });

  const photos = PHOTOS.map((ph, i) => ({
    id: i,
    title: ph.t,
    tag: ph.tag,
    tileStyle: {
      position: "relative",
      aspectRatio: "4 / 3",
      borderRadius: 9,
      overflow: "hidden",
      cursor: "pointer",
      background: `linear-gradient(135deg,${ph.c1},${ph.c2})`,
      border: "1px solid var(--surf0)",
    } as CSSProperties,
  }));

  const laps = LAPS.map((l, i) => ({
    id: i,
    track: l.track,
    car: l.car,
    time: l.time,
    delta: l.delta,
    best: l.best,
    deltaColor: l.delta.startsWith("-") ? "#a6e3a1" : "#f38ba8",
    rowBg: l.best ? "rgba(243,139,168,.08)" : "transparent",
  }));

  const allPosts = POSTS.map(decorate);

  // --- 설정 (라이브) ---
  const togTrack = (on: boolean): CSSProperties => ({
    width: 38,
    height: 22,
    borderRadius: 11,
    position: "relative",
    cursor: "pointer",
    background: on ? accent : "var(--surf0)",
    transition: "background .15s",
  });
  const togKnob = (on: boolean): CSSProperties => ({
    position: "absolute",
    top: 2,
    left: on ? 18 : 2,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: on ? "var(--on-accent)" : "var(--ov0)",
    transition: "left .15s",
  });
  const modeOpts = THEME_MODES.map((m) => ({
    key: m.k,
    label: m.label,
    onClick: () => handlers.setMode(m.k),
    swatchStyle: {
      width: 84,
      height: 54,
      borderRadius: 9,
      background: m.prev,
      marginBottom: 6,
      border: `2px solid ${ui.mode === m.k ? accent : "var(--surf0)"}`,
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
    } as CSSProperties,
    labelStyle: {
      fontSize: 11,
      ...(ui.mode === m.k ? { fontWeight: 700, color: "var(--text)" } : { color: "var(--ov0)" }),
    } as CSSProperties,
  }));
  const accentOpts = ACCENT_PALETTE.map((c) => ({
    key: c,
    onClick: () => handlers.setAccent(c),
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      cursor: "pointer",
      background: c,
      ...(ui.accent === c ? { boxShadow: `0 0 0 2px var(--base),0 0 0 3.5px ${c}` } : {}),
    } as CSSProperties,
  }));
  const set = {
    modeOpts,
    accentOpts,
    gapPct: Math.round((ui.gap / 28) * 100) + "%",
    gapLabel: ui.gap + "px",
    startSlider: handlers.startSlider,
    toggles: [
      { label: "Window transparency", on: ui.transp, track: togTrack(ui.transp), knob: togKnob(ui.transp), onClick: () => handlers.toggleUi("transp") },
      { label: "Rounded corners", on: ui.rounded, track: togTrack(ui.rounded), knob: togKnob(ui.rounded), onClick: () => handlers.toggleUi("rounded") },
      { label: "Active border glow", on: ui.glow, track: togTrack(ui.glow), knob: togKnob(ui.glow), onClick: () => handlers.toggleUi("glow") },
    ],
  };

  const bootLines = BOOT_SEQ.slice(0, st.bootN).map((l, i) => ({ id: i, ok: l[0] === "ok", pre: l[1], post: l[2] }));

  return {
    accent,
    wallpaper: wallpaper(lightMode, accent),
    mod: { clock: sys.clock, cpu: sys.cpu + "%", ram: sys.ram + "%", vol: "64", batt: "87%" },
    booting: st.booting,
    bootLines,
    tiles,
    gutters,
    focus,
    close,
    chrome: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: C.base,
    } as CSSProperties,
    tbar: {
      flex: "none",
      height: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 10px",
      background: C.mantle,
      borderBottom: `1px solid ${C.surf0}`,
      fontSize: 12,
      cursor: "default",
    } as CSSProperties,
    xbtn: {
      width: 18,
      height: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      color: C.ov0,
      fontSize: 11,
      cursor: "pointer",
    } as CSSProperties,
    bodyWrap: { flex: 1, minHeight: 0, overflow: "auto" } as CSSProperties,
    wsList,
    focusTitle,
    focusDot,
    appList,
    isMobile: mobile,
    mobileHome: mobile && !st.booting && !st.focused,
    dock,
    homeClick,
    showLauncher: st.showLauncher,
    showKeys: st.showKeys,
    toggleLauncher: handlers.toggleLauncher,
    toggleKeys: handlers.toggleKeys,
    reboot: handlers.reboot,
    stop: (e: React.MouseEvent) => e.stopPropagation(),
    finderPosts,
    finderCount,
    finderCats,
    post,
    readerList,
    photos,
    laps,
    allPosts,
    set,
  };
}

export type Vm = ReturnType<typeof buildVm>;
