import type { CSSProperties } from "react";
import {
  ACCENT_PALETTE,
  APP_KEYS,
  APP_META,
  BOOT_SEQ,
  CATS,
  LAPS,
  THEME_MODES,
} from "@/lib/ruehanix/data";
import { WALLPAPERS, accentEff, catColors, effMode, hexA, toLatte, wallpaper } from "@/lib/ruehanix/theme";
import { area, computeLayout, visibleIds } from "@/lib/ruehanix/layout";
import { DESKTOP_DOCK_RESERVE, MOBILE_TOPBAR, isMobileWidth, mobileAppRect } from "@/lib/ruehanix/responsive";
import { searchAll } from "@/lib/ruehanix/search";
import { buildArtistViews } from "@/lib/artists/views";
import type { AppKey, CatKey } from "@/lib/ruehanix/types";
import type { BlogPost } from "@/lib/posts/types";
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
  const { st, sys, vp, posts, tracks, photos: photoSrc, artists, albums, prefersLight, handlers } = api;
  const ui = st.ui;
  const accent = accentEff(ui.mode, ui.accent, prefersLight);
  const lightMode = effMode(ui.mode, prefersLight) === "light";
  const rad = ui.rounded ? 11 : 2;

  const mobile = isMobileWidth(vp.W);
  // 데스크톱은 항상 보이는 독이 타일 창을 가리지 않게 하단 자리를 비운다.
  const reserve = mobile ? 0 : DESKTOP_DOCK_RESERVE;
  const curIds = visibleIds(st.order, st.open, st.ws, st.minimized, st.maximized);
  const lay = computeLayout(curIds, area(vp, ui.gap, reserve), st.ratios, st.ws, ui.gap);
  const isMaximized = !!st.maximized && curIds.length === 1 && curIds[0] === st.maximized;

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
    const f = st.floating[k];
    // 플로팅 창 — 자유 rect, 타일 위에 뜸(z 150+). 포커스면 최상(z 200).
    if (f && st.open[k] && st.open[k]!.ws === st.ws && !st.booting && !mobile) {
      const foc = st.focused === k;
      tiles[k] = {
        position: "absolute",
        left: f.x,
        top: f.y,
        width: f.w,
        height: f.h,
        borderRadius: Math.max(rad, 11),
        overflow: "hidden",
        border: `2px solid ${foc ? accent : C.surf0}`,
        boxShadow: foc
          ? ui.glow
            ? `0 0 0 1px ${hexA(accent, 0.45)},0 0 26px ${hexA(accent, 0.35)},0 18px 48px rgba(0,0,0,.55)`
            : "0 18px 48px rgba(0,0,0,.55)"
          : "0 12px 32px rgba(0,0,0,.42)",
        zIndex: foc ? 200 : 150,
      };
      continue;
    }
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
  const close = {} as Record<AppKey, (e?: React.SyntheticEvent) => void>;
  const minimize = {} as Record<AppKey, (e?: React.SyntheticEvent) => void>;
  const toggleMaximize = {} as Record<AppKey, (e?: React.SyntheticEvent) => void>;
  for (const k of APP_KEYS) {
    focus[k] = () => handlers.focusApp(k);
    close[k] = (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      handlers.close(k);
    };
    minimize[k] = (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      handlers.minimize(k);
    };
    toggleMaximize[k] = (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      handlers.toggleMaximize(k);
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

  // 통합 검색 — 앱·글·아티스트·사진. 빈 질의는 앱만(기존 브라우징 유지). 결과에 onClick 부여.
  const search = searchAll(
    {
      apps: appList,
      posts: posts.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt })),
      artists: artists.map((a) => ({ id: a.id || a.name, name: a.name })),
      photos: photoSrc.map((ph) => ({ id: ph.asset?._id ?? ph.title, title: ph.title })),
    },
    api.launcherQuery,
  );
  const launcherResults = {
    apps: search.apps,
    posts: search.posts.map((p) => ({ ...p, onClick: () => handlers.openPost(p.slug) })),
    artists: search.artists.map((a) => ({ ...a, onClick: () => handlers.openApp("reader") })),
    photos: search.photos.map((ph) => ({ ...ph, onClick: () => handlers.openApp("foto") })),
  };
  const hasResults =
    launcherResults.apps.length + launcherResults.posts.length + launcherResults.artists.length + launcherResults.photos.length > 0;

  // 모바일 하단 독(앱 전환) + 홈(포커스 닫기).
  const dock = APP_KEYS.map((k) => ({
    key: k,
    name: APP_META[k].name,
    color: APP_META[k].color,
    active: st.focused === k,
    open: !!st.open[k],
    minimized: !!st.minimized[k],
    onClick: () => handlers.openApp(k),
  }));
  const homeClick = () => {
    if (st.focused) handlers.close(st.focused);
  };

  // --- 블로그 데이터 ---
  const catC = catColors(lightMode);
  const catOf = (id: CatKey) => ({ label: CATS[id].label, color: catC[id] || CATS[id].color });
  const decorate = (p: BlogPost): RowPost => {
    const c = catOf(p.category);
    return {
      id: p.slug,
      title: p.title,
      date: p.date,
      read: p.readingTime,
      excerpt: p.excerpt,
      catLabel: c.label,
      catColor: c.color,
      rowBg: p.slug === st.selected ? hexA(accent, 0.14) : "transparent",
      open: () => handlers.openPost(p.slug),
    };
  };
  const fc = st.finderCat;
  const finderPosts = posts.filter((p) => fc === "all" || p.category === fc).map(decorate);
  const finderCount = finderPosts.length + " items · " + posts.length + " total";
  const noPosts = posts.length === 0;
  const catList: { key: "all" | CatKey; label: string }[] = [
    { key: "all", label: "all" },
    ...(Object.keys(CATS) as CatKey[]).map((k) => ({ key: k, label: CATS[k].label })),
  ];
  const finderCats = catList.map((c) => ({
    key: c.key,
    label: c.label,
    active: c.key === fc,
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

  const selP = posts.find((p) => p.slug === st.selected) ?? posts[0] ?? null;
  const post = selP
    ? {
        slug: selP.slug,
        title: selP.title,
        date: selP.date,
        read: selP.readingTime,
        catLabel: catOf(selP.category).label,
        catColor: catOf(selP.category).color,
        body: selP.body,
      }
    : null;

  const readerList = posts.map((p) => {
    const c = catOf(p.category);
    return {
      id: p.slug,
      title: p.title,
      catColor: c.color,
      date: p.date,
      bg: p.slug === st.selected ? hexA(accent, 0.14) : "transparent",
      open: () => handlers.setReaderSel(p.slug),
    };
  });

  const photos = photoSrc.map((ph, i) => ({
    id: i,
    title: ph.title,
    tag: ph.tag,
    folder: ph.folder,
    description: ph.description,
    asset: ph.asset,
    tileStyle: {
      position: "relative",
      aspectRatio: "4 / 3",
      borderRadius: 9,
      overflow: "hidden",
      cursor: "pointer",
      background: "var(--surf0)",
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

  const allPosts = posts.map(decorate);

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
    selected: ui.mode === m.k,
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
    key: c.hex,
    name: c.name,
    selected: ui.accent === c.hex,
    onClick: () => handlers.setAccent(c.hex),
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      cursor: "pointer",
      background: c.hex,
      ...(ui.accent === c.hex ? { boxShadow: `0 0 0 2px var(--base),0 0 0 3.5px ${c.hex}` } : {}),
    } as CSSProperties,
  }));
  const set = {
    modeOpts,
    accentOpts,
    gapPct: Math.round((ui.gap / 28) * 100) + "%",
    gapLabel: ui.gap + "px",
    gapValue: ui.gap,
    startSlider: handlers.startSlider,
    setGap: handlers.setGap,
    resetUi: handlers.resetUi,
    toggles: [
      { label: "Window transparency", on: ui.transp, track: togTrack(ui.transp), knob: togKnob(ui.transp), onClick: () => handlers.toggleUi("transp") },
      { label: "Rounded corners", on: ui.rounded, track: togTrack(ui.rounded), knob: togKnob(ui.rounded), onClick: () => handlers.toggleUi("rounded") },
      { label: "Active border glow", on: ui.glow, track: togTrack(ui.glow), knob: togKnob(ui.glow), onClick: () => handlers.toggleUi("glow") },
    ],
    wallpaperKey: ui.wallpaper,
    wallpaperOpts: WALLPAPERS,
    setWallpaperKey: handlers.setWallpaperKey,
  };

  // --- 음악 플레이어 ---
  const pl = st.player;
  // 트랙은 Sanity에서 비동기로 오므로 저장된 index가 범위를 벗어날 수 있다 → 표시 시점에 클램프.
  const curIndex = tracks.length > 0 ? Math.min(pl.index, tracks.length - 1) : 0;
  const curTrack = tracks[curIndex] ?? null;
  const repeatLabel = pl.repeat === "off" ? "반복 끔" : pl.repeat === "all" ? "전체 반복" : "한 곡 반복";
  const player = {
    hasTracks: tracks.length > 0,
    videoId: curTrack?.videoId ?? null,
    playing: pl.playing,
    volume: pl.volume,
    repeat: pl.repeat,
    repeatLabel,
    current: curTrack ? { title: curTrack.title, artist: curTrack.artist } : null,
    artistInfo: curTrack?.artistInfo ?? null,
    artists, // 전체 아티스트 디렉터리
    artistViews: buildArtistViews(artists, albums, tracks), // 아티스트별 앨범+수록곡 조인(상세 표시용)
    currentArtistId: curTrack?.artistInfo?.id ?? null, // 재생 중 가수 강조용
    play: (i: number) => handlers.playerSelect(i),
    popoverOpen: false, // 음악 비활성 (ADR 0047)
    togglePopover: () => {}, // 음악 비활성 (ADR 0047)
    tracks: tracks.map((t, i) => ({
      id: i,
      title: t.title,
      artist: t.artist,
      current: i === curIndex,
      playing: i === curIndex && pl.playing,
      onClick: () => handlers.playerSelect(i),
    })),
    toggle: handlers.playerToggle,
    next: handlers.playerSkipNext,
    prev: handlers.playerSkipPrev,
    cycleRepeat: handlers.playerCycleRepeat,
    setVolume: handlers.playerSetVolume,
    onEnded: handlers.playerEnded,
  };

  // --- 데스크톱 위젯 팔레트(라이트 모드 적응) ---
  // neofetch·conky 위젯이 하드코딩 다크 hex/그림자 대신 이 값으로 라이트에서 가독성 확보.
  const w = (hex: string) => toLatte(hex, lightMode);
  const widget = {
    shadow: lightMode ? "none" : "0 1px 8px rgba(0,0,0,.4)",
    shadowSm: lightMode ? "none" : "0 1px 6px rgba(0,0,0,.3)",
    border: lightMode ? "var(--surf1)" : "rgba(69,71,90,.5)",
    mauve: w("#cba6f7"),
    blue: w("#89b4fa"),
    pink: w("#f5c2e7"),
    green: w("#a6e3a1"),
    peach: w("#fab387"),
    red: w("#f38ba8"),
    yellow: w("#f9e2af"),
    swatches: ["#f38ba8", "#fab387", "#f9e2af", "#a6e3a1", "#89b4fa", "#cba6f7"].map(w),
  };

  const bootLines = BOOT_SEQ.slice(0, st.bootN).map((l, i) => ({ id: i, ok: l[0] === "ok", pre: l[1], post: l[2] }));

  return {
    accent,
    wallpaper: wallpaper(ui.wallpaper, lightMode, accent),
    mod: { clock: sys.clock, cpu: sys.cpu + "%", ram: sys.ram + "%", batt: "87%" },
    booting: st.booting,
    bootLines,
    tiles,
    gutters,
    focus,
    close,
    minimize,
    toggleMaximize,
    isMaximized,
    floating: st.floating,
    toggleFloating: (k: AppKey) => handlers.toggleFloating(k, handlers.defaultFloatRect()),
    swapTiles: handlers.swapTiles,
    startFloatDrag: handlers.startFloatDrag,
    startFloatResize: handlers.startFloatResize,
    wbtn: {
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
    launcherQuery: api.launcherQuery,
    setLauncherQuery: handlers.setLauncherQuery,
    launcherResults,
    hasResults,
    isMobile: mobile,
    mobileHome: mobile && !st.booting && !st.focused,
    commands: api.commands,
    showCommandPalette: st.showCommandPalette,
    toggleCommandPalette: handlers.toggleCommandPalette,
    dock,
    homeClick,
    showLauncher: st.showLauncher,
    showKeys: st.showKeys,
    toggleLauncher: handlers.toggleLauncher,
    toggleKeys: handlers.toggleKeys,
    reboot: handlers.reboot,
    // 빈 데스크탑 wheel → ws±1 전환용 (ADR 0063). 기존 viewModel 패턴(handlers 컨테이너 없이 직접 노출) 따름.
    ws: st.ws,
    gotoWs: handlers.gotoWs,
    stop: (e: React.MouseEvent) => e.stopPropagation(),
    finderPosts,
    finderCount,
    noPosts,
    finderCats,
    post,
    readerList,
    photos,
    laps,
    allPosts,
    set,
    player,
    widget,
  };
}

export type Vm = ReturnType<typeof buildVm>;
