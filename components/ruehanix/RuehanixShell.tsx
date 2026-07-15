"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { APP_META } from "@/lib/ruehanix/data";
import { DESKTOP_DOCK, MOBILE_DOCK, MOBILE_TOPBAR } from "@/lib/ruehanix/responsive";
import type { AppKey } from "@/lib/ruehanix/types";
import { useRuehanix, type ShellContent } from "./useRuehanix";
import { clickable } from "./clickable";
import { buildVm, type Vm } from "./viewModel";
import { ART_DESK, LineIcon } from "./icons";
import { AboutApp, FilesApp, FotoApp, HotlapApp, TerminalApp, WebApp } from "./apps";
import { KEYBINDINGS as KEYBINDS } from "@/lib/ruehanix/settings";
import { useToast } from "@/lib/ruehanix/toast";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { isHidden } from "@/lib/ruehanix/win-visibility";
import dynamic from "next/dynamic";

// 큰 콘텐츠 앱 3개 — 초기 번들에서 chunk 분리. 첫 사용 시점에 다운로드(ADR 0033).
// ssr: false 로 클라이언트 전용. 작은 앱 6개(About/Files/Foto/Hotlap/Terminal/Web) 정적 유지.
const ReaderApp = dynamic(() => import("./ReaderApp").then((m) => m.ReaderApp), { ssr: false });
const MusicApp = dynamic(() => import("./MusicApp").then((m) => m.MusicApp), { ssr: false });
const SettingsApp = dynamic(() => import("./SettingsApp").then((m) => m.SettingsApp), { ssr: false });

// YouTube IFrame Player API + 138줄 엔진 — 초기 번들에서 제외. 재생 시작 시 lazy 로드.
// ssr: false — "use client" 컴포넌트지만 더 작은 초기 핸드오프를 위해 클라이언트 전용까지 강제.
const YouTubeEngine = dynamic(
  () => import("./YouTubeEngine").then((m) => m.YouTubeEngine),
  { ssr: false },
);

export function Win({
  vm,
  app,
  children,
  preserveLocalState = false,
}: {
  vm: Vm;
  app: AppKey;
  children: ReactNode;
  /** true 면 hidden 일 때도 children 마운트 유지(local state 보호).
   *  FotoApp 의 폴더 네비게이션·라이트박스가 ws 전환·minimize 사이에 reset 되는
   *  회귀를 막기 위함. dynamic loader 가 chunk 캐시하므로 추가 비용 없음. */
  preserveLocalState?: boolean;
}) {
  const meta = APP_META[app];
  const tileStyle = vm.tiles[app];
  const hidden = isHidden(tileStyle);
  const floating = !!vm.floating[app];

  // visibleIds 계산 결과가 hidden 인 앱: chrome/children 미렌더, outer div 만 남김.
  // children 은 visible 일 때만 마운트. dynamic loader 가 chunk 캐시하므로
  // minimize/restore 시 즉시 재로드. setState cascade 회피 + 단순.
  // preserveLocalState=true 인 앱(FotoApp)은 local state 보호를 위해 항상 mount.
  if (hidden && !preserveLocalState) {
    return <div style={tileStyle} aria-hidden="true" />;
  }

  return (
    <div style={tileStyle}>
      <div style={vm.chrome}>
        <div
          onMouseDown={(e) => {
            vm.focus[app]();
            if (floating) vm.startFloatDrag(app, e);
          }}
          onDoubleClick={
            vm.isMobile
              ? undefined
              : floating
                ? (e: React.MouseEvent) => { e.stopPropagation(); vm.toggleFloating(app); }
                : (e: React.MouseEvent) => { e.stopPropagation(); vm.toggleMaximize[app](); }
          }
          style={{ ...vm.tbar, cursor: floating ? "move" : vm.tbar.cursor }}
          title={vm.isMobile ? undefined : floating ? "드래그: 이동 · 더블클릭: 타일 복귀" : vm.isMaximized ? "더블클릭: 복원" : "더블클릭: 최대화"}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", color: meta.color }}>
            <LineIcon app={app} size={14} />
            <span style={{ color: "var(--text)" }}>{meta.name}</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {!vm.isMobile && (
              <>
                <div {...clickable(vm.minimize[app], `${meta.name} 최소화`)} style={vm.wbtn}>—</div>
                <div {...clickable(vm.toggleMaximize[app], vm.isMaximized ? `${meta.name} 복원` : `${meta.name} 최대화`)} style={vm.wbtn}>{vm.isMaximized ? "❐" : "□"}</div>
                <div {...clickable(() => vm.toggleFloating(app), floating ? `${meta.name} 타일 복귀` : `${meta.name} 플로팅`)} style={vm.wbtn} aria-pressed={floating}>{floating ? "❏" : "◌"}</div>
              </>
            )}
            <div {...clickable(vm.close[app], `${meta.name} 닫기`)} style={vm.xbtn}>
              ✕
            </div>
          </div>
        </div>
        <div style={vm.bodyWrap}>
          <AppErrorBoundary appName={meta.name}>{children}</AppErrorBoundary>
          {/* 플로팅 창 모서리 리사이즈 핸들 */}
          {floating && !vm.isMobile && (
            <div
              onMouseDown={(e) => { e.stopPropagation(); vm.startFloatResize(app, e); }}
              aria-hidden="true"
              title="크기 조절"
              style={{ position: "absolute", right: 0, bottom: 0, width: 16, height: 16, cursor: "nwse-resize", zIndex: 5 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MobileTopbar({ vm }: { vm: Vm }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: MOBILE_TOPBAR, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", background: "color-mix(in srgb, var(--mantle) 90%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid var(--surf0)", fontSize: 12.5 }}>
      <div {...clickable(vm.homeClick, "홈")} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" />
          <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
          <circle cx="9" cy="7.5" r="0.6" fill="currentColor" />
          <circle cx="15" cy="7.5" r="0.6" fill="currentColor" />
        </svg>
        ruehanix
      </div>
      <span style={{ color: "var(--sub1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "45%" }}>{vm.focusTitle}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--sub0)" }}>
        <span>{vm.mod.batt}</span>
        <span style={{ padding: "2px 9px", borderRadius: 6, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: "var(--accent)", fontWeight: 700 }}>{vm.mod.clock}</span>
      </div>
    </div>
  );
}

function MobileDock({ vm }: { vm: Vm }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: MOBILE_DOCK, zIndex: 500, display: "flex", alignItems: "center", gap: 6, padding: "0 10px", overflowX: "auto", background: "color-mix(in srgb, var(--mantle) 90%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid var(--surf0)" }}>
      {vm.dock.map((d) => (
        <div key={d.key} data-testid={"dock-" + d.key} {...clickable(d.onClick, d.name)} style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 56, padding: "6px 0", borderRadius: 10, cursor: "pointer", color: d.color, background: d.active ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "transparent" }}>
          <LineIcon app={d.key} size={22} />
          <span style={{ fontSize: 9.5, color: d.active ? "var(--text)" : "var(--ov0)", maxWidth: 52, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
        </div>
      ))}
    </div>
  );
}

function MobileHome() {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: MOBILE_TOPBAR, bottom: MOBILE_DOCK, zIndex: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, pointerEvents: "none" }}>
      <div style={{ width: 84, height: 84, borderRadius: 22, background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)", fontWeight: 800, fontSize: 34, boxShadow: "0 12px 36px rgba(203,166,247,.35)" }}>한</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-.02em" }}>ruehanix</div>
        <div style={{ fontSize: 12.5, color: "var(--sub0)", marginTop: 4 }}>한규 · full-stack dev</div>
        <div style={{ fontSize: 11.5, color: "var(--ov0)", marginTop: 2 }}>아래 독에서 앱을 열어보세요</div>
      </div>
    </div>
  );
}

function DesktopDock({ vm }: { vm: Vm }) {
  return (
    <div data-testid="desktop-dock" style={{ position: "absolute", left: "50%", bottom: 14, transform: "translateX(-50%)", height: DESKTOP_DOCK, zIndex: 400, display: "flex", alignItems: "center", gap: 4, padding: "0 8px", borderRadius: 16, background: "color-mix(in srgb, var(--mantle) 80%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid var(--surf0)", boxShadow: "0 12px 36px rgba(0,0,0,.4)" }}>
      {vm.dock.map((d) => (
        <div key={d.key} data-testid={"ddock-" + d.key} {...clickable(d.onClick, d.name)} className="rh-dock-item" title={d.minimized ? `${d.name} (최소화됨)` : d.name} style={{ position: "relative", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 11, cursor: "pointer", color: d.color, opacity: d.minimized ? 0.5 : 1, background: d.active ? "color-mix(in srgb, var(--accent) 18%, transparent)" : "transparent" }}>
          <LineIcon app={d.key} size={22} />
          <span className="rh-dock-label">{d.name}</span>
          {/* 실행 중 표시 — macOS식 점. 포커스면 강조. */}
          {d.open && <span aria-hidden="true" style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: d.active ? 6 : 4, height: d.active ? 6 : 4, borderRadius: "50%", background: d.active ? "var(--accent)" : "var(--ov0)" }} />}
        </div>
      ))}
    </div>
  );
}


export function RuehanixShell(content: ShellContent) {
  const api = useRuehanix(content);
  const vm = buildVm(api);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "var(--crust)", color: "var(--text)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", userSelect: "none" }}>
      {/* 숨긴 오디오 엔진 — 셸 루트 상주(앱 전환에도 재생 유지) */}
      {vm.player.hasTracks && (
        <YouTubeEngine videoId={vm.player.videoId} playing={vm.player.playing} volume={vm.player.volume} onEnded={vm.player.onEnded} />
      )}

      {/* WALLPAPER */}
      <div style={{ position: "absolute", inset: 0, background: vm.wallpaper }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(205,214,244,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(205,214,244,.025) 1px,transparent 1px)", backgroundSize: "42px 42px", pointerEvents: "none" }} />

      {/* DESKTOP WIDGETS (데스크톱 전용) */}
      {!vm.isMobile && (
        <>
      <div style={{ position: "absolute", left: 46, top: 90, zIndex: 30, display: "flex", gap: 22, alignItems: "flex-start", textShadow: vm.widget.shadow }}>
        <pre style={{ margin: 0, color: vm.widget.mauve, fontSize: 13, lineHeight: 1.3 }}>{ART_DESK}</pre>
        <div style={{ fontSize: 13, lineHeight: 1.65, color: "var(--sub0)" }}>
          <div>
            <span style={{ color: vm.widget.mauve, fontWeight: 700 }}>ruehan</span>
            <span style={{ color: "var(--ov0)" }}>@</span>
            <span style={{ color: vm.widget.mauve, fontWeight: 700 }}>ruehanix</span>
          </div>
          <div style={{ color: "var(--surf1)" }}>─────────────────</div>
          <div><span style={{ color: vm.widget.blue }}>OS</span><span style={{ color: "var(--ov0)" }}>   </span>ruehanix 1.0</div>
          <div><span style={{ color: vm.widget.pink }}>WM</span><span style={{ color: "var(--ov0)" }}>   </span>Hyprland</div>
          <div><span style={{ color: vm.widget.green }}>DE</span><span style={{ color: "var(--ov0)" }}>   </span>Catppuccin Mocha</div>
          <div><span style={{ color: vm.widget.peach }}>SH</span><span style={{ color: "var(--ov0)" }}>   </span>zsh 5.9</div>
          <div><span style={{ color: vm.widget.red }}>WHO</span><span style={{ color: "var(--ov0)" }}>  </span>한규 · full-stack dev</div>
          <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
            {vm.widget.swatches.map((c) => (
              <span key={c} style={{ width: 16, height: 16, borderRadius: 4, background: c }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", right: 34, top: 84, zIndex: 30, width: 236, padding: "16px 18px", borderRadius: 13, background: "color-mix(in srgb, var(--mantle) 58%, transparent)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: `1px solid ${vm.widget.border}`, fontSize: 11.5, color: "var(--sub0)", textShadow: vm.widget.shadowSm }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-.02em", lineHeight: 1 }}>
          {vm.mod.clock}
          <span style={{ fontSize: 12, color: "var(--ov0)", fontWeight: 500 }}> KST</span>
        </div>
        <div style={{ color: "var(--ov0)", marginBottom: 14 }}>Mon 22 Jun 2026 · up 4h 12m</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: vm.widget.green }}>CPU</span><span>{vm.mod.cpu}</span></div>
        <div style={{ height: 5, borderRadius: 3, background: "var(--surf0)", marginBottom: 10, overflow: "hidden" }}><div style={{ height: "100%", width: vm.mod.cpu, background: vm.widget.green, borderRadius: 3 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: vm.widget.yellow }}>RAM</span><span>{vm.mod.ram} · 30/64G</span></div>
        <div style={{ height: 5, borderRadius: 3, background: "var(--surf0)", marginBottom: 10, overflow: "hidden" }}><div style={{ height: "100%", width: vm.mod.ram, background: vm.widget.yellow, borderRadius: 3 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: vm.widget.blue }}>DISK</span><span>61% · 1.2/2T</span></div>
        <div style={{ height: 5, borderRadius: 3, background: "var(--surf0)", marginBottom: 13, overflow: "hidden" }}><div style={{ height: "100%", width: "61%", background: vm.widget.blue, borderRadius: 3 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", whiteSpace: "nowrap", color: "var(--ov0)" }}><span style={{ color: vm.widget.mauve }}>NET</span><span>↓2.4M ↑312K</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, whiteSpace: "nowrap", color: "var(--ov0)" }}><span style={{ color: vm.widget.pink }}>PROC</span><span>312 · 0.84</span></div>
      </div>

      <div style={{ position: "absolute", left: 46, bottom: 34, zIndex: 30, fontSize: 12, color: "var(--ov0)", lineHeight: 1.9, whiteSpace: "nowrap", textShadow: vm.widget.shadow }}>
        <div><span style={{ color: vm.widget.mauve }}>Super</span> + <span style={{ color: vm.widget.blue }}>D</span>  앱 실행기</div>
        <div><span style={{ color: vm.widget.mauve }}>Super</span> + <span style={{ color: vm.widget.blue }}>1-6</span>  워크스페이스</div>
        <div><span style={{ color: vm.widget.mauve }}>Super</span> + <span style={{ color: vm.widget.blue }}>F</span>  최대화/복원</div>
        <div><span style={{ color: vm.widget.mauve }}>Super</span> + <span style={{ color: vm.widget.blue }}>/</span>  단축키 전체보기</div>
      </div>
        </>
      )}

      {/* WAYBAR (데스크톱) / MOBILE TOPBAR */}
      {vm.isMobile && <MobileTopbar vm={vm} />}
      {!vm.isMobile && (
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, height: 34, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", borderRadius: 11, background: "color-mix(in srgb, var(--mantle) 86%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid var(--surf0)", fontSize: 12.5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div data-testid="launcher" {...clickable(vm.toggleLauncher, "앱 실행기")} title="앱 실행기 (Super + D)" className="rh-launcher-btn" style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 11px", borderRadius: 7, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="5" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
              <circle cx="5" cy="19" r="2" /><circle cx="12" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
            </svg>
            ruehanix
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {vm.wsList.map((w) => (
              <div key={w.n} data-testid={"ws-" + w.n} {...clickable(w.onClick, `워크스페이스 ${w.n}`)} style={w.style}>
                {w.n}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, color: "var(--sub1)", maxWidth: 240, overflow: "hidden", whiteSpace: "nowrap", pointerEvents: "none" }}>
          <span style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: vm.focusDot }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{vm.focusTitle}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {vm.player.hasTracks && (
            <div
              data-testid="miniplayer"
              {...clickable(vm.player.togglePopover, "음악 컨트롤러")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 9px", borderRadius: 7, cursor: "pointer", maxWidth: 200, background: vm.player.popoverOpen ? "color-mix(in srgb, var(--accent) 26%, transparent)" : "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {vm.player.playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
              </svg>
              <span data-testid="mini-title" style={{ fontSize: 11.5, color: "var(--sub1)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vm.player.current?.title}</span>
            </div>
          )}
          <div style={{ padding: "3px 11px", borderRadius: 7, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: "var(--accent)", fontWeight: 700 }}>{vm.mod.clock}</div>
          <div {...clickable(vm.reboot, "재부팅")} title="reboot" style={{ display: "flex", alignItems: "center", padding: "3px 8px", borderRadius: 7, background: "rgba(243,139,168,.14)", color: "#f38ba8", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v9" /><path d="M6.5 7a8 8 0 1 0 11 0" /></svg>
          </div>
        </div>
      </div>
      )}

      {/* MOBILE HOME / DOCK */}
      {vm.mobileHome && <MobileHome />}
      {vm.isMobile && <MobileDock vm={vm} />}

      {/* DESKTOP DOCK */}
      {!vm.isMobile && <DesktopDock vm={vm} />}

      {/* WINDOWS */}
      <div style={{ position: "absolute", inset: 0, zIndex: 100 }}>
        <Win vm={vm} app="files"><FilesApp vm={vm} /></Win>
        <Win vm={vm} app="reader"><ReaderApp vm={vm} /></Win>
        <Win vm={vm} app="foto" preserveLocalState><FotoApp vm={vm} /></Win>
        <Win vm={vm} app="hotlap"><HotlapApp vm={vm} /></Win>
        <Win vm={vm} app="terminal"><TerminalApp /></Win>
        <Win vm={vm} app="web"><WebApp vm={vm} /></Win>
        <Win vm={vm} app="music"><MusicApp vm={vm} /></Win>
        <Win vm={vm} app="settings"><SettingsApp vm={vm} /></Win>
        <Win vm={vm} app="about"><AboutApp /></Win>
        {vm.gutters.map((g) => (
          <div key={g.key} onMouseDown={g.onMouseDown} style={g.style} />
        ))}
      </div>

      {/* 음악 컨트롤러 팝오버 (데스크톱) — 미니플레이어 클릭으로 토글 */}
      {!vm.isMobile && vm.player.popoverOpen && vm.player.hasTracks && (
        <div onClick={vm.player.togglePopover} style={{ position: "absolute", inset: 0, zIndex: 8000 }}>
          <div data-testid="music-popover" onClick={vm.stop} style={{ position: "absolute", top: 48, right: 8, width: 300, height: 380, background: "color-mix(in srgb, var(--mantle) 98%, transparent)", border: "1px solid var(--surf1)", borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.5)", animation: "rh-fadeup .16s ease" }}>
            <MusicApp vm={vm} />
          </div>
        </div>
      )}

      {/* LAUNCHER */}
      {!vm.isMobile && vm.showLauncher && <Launcher vm={vm} />}

      {/* KEYBIND OVERLAY */}
      {!vm.isMobile && vm.showKeys && (
        <div onClick={vm.toggleKeys} style={{ position: "absolute", inset: 0, zIndex: 9100, background: "rgba(17,17,27,.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={vm.stop} style={{ width: 560, background: "color-mix(in srgb, var(--mantle) 98%, transparent)", border: "1px solid var(--surf1)", borderRadius: 16, padding: "26px 30px", boxShadow: "0 30px 80px rgba(0,0,0,.55)", animation: "rh-fadeup .16s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>키보드 단축키</span>
              <span style={{ fontSize: 12, color: "var(--ov0)" }}>Hyprland 스타일 · Super = ⊞</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px 26px" }}>
              {KEYBINDS.map(([combo, desc]) => (
                <div key={combo} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                  <span style={{ color: "var(--text)", background: "var(--surf0)", borderRadius: 6, padding: "3px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>{combo}</span>
                  <span style={{ color: "var(--sub0)" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOOT */}
      {vm.booting && (
        <div style={{ position: "absolute", inset: 0, zIndex: 9900, background: "var(--crust)", padding: "34px 40px", fontSize: 13, lineHeight: 1.7, color: "var(--sub0)", overflow: "hidden" }}>
          {vm.bootLines.map((l) => (
            <div key={l.id}>
              <span style={{ color: "var(--ov0)" }}>[ </span>
              {l.ok ? <span style={{ color: "#a6e3a1" }}>  OK  </span> : <span style={{ color: "#89b4fa" }}> INFO </span>}
              <span style={{ color: "var(--ov0)" }}> ] </span>
              <span style={{ color: "var(--sub0)" }}>{l.pre}</span>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{l.post}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, color: "var(--text)" }}>
            <span style={{ color: "#a6e3a1" }}>ruehan@ruehanix</span>
            <span style={{ color: "#89b4fa" }}>~</span>
            <span>login:</span>
            <span style={{ width: 8, height: 15, background: "var(--text)", animation: "rh-blink 1.1s steps(1) infinite" }} />
          </div>
        </div>
      )}

      <ToastHost bottomOffset={vm.isMobile ? MOBILE_DOCK + 12 : 26} />
    </div>
  );
}

function ToastHost({ bottomOffset }: { bottomOffset: number }) {
  const msg = useToast();
  if (!msg) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ position: "absolute", bottom: bottomOffset, left: "50%", transform: "translateX(-50%)", zIndex: 9999, maxWidth: "80vw", background: "var(--crust)", border: "1px solid var(--surf1)", color: "var(--text)", fontSize: 12, padding: "8px 14px", borderRadius: 9, boxShadow: "0 10px 30px rgba(0,0,0,.4)", animation: "rh-fadeup .14s ease", pointerEvents: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
    >
      {msg}
    </div>
  );
}

function LauncherGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ov0)", padding: "8px 12px 4px" }}>{label}</div>
      {children}
    </div>
  );
}

function Launcher({ vm }: { vm: Vm }) {
  const res = vm.launcherResults;
  // 평면 순서: 앱 > 글 > 아티스트 > 사진. 오프셋으로 카테고리 내 인덱스 → 전체 인덱스.
  const offsets = {
    app: 0,
    post: res.apps.length,
    artist: res.apps.length + res.posts.length,
    photo: res.apps.length + res.posts.length + res.artists.length,
  };
  const total = offsets.photo + res.photos.length;
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  // 결과 수 축소 시 범위 밖이면 클램프(파생값 — setState-in-effect 회피).
  const safeActive = total > 0 ? Math.min(active, total - 1) : 0;
  // 활성 항목이 보이도록 스크롤.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-launch-idx="${safeActive}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [safeActive]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (total > 0 ? (a + 1) % total : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (total > 0 ? (a - 1 + total) % total : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = [res.apps, res.posts, res.artists, res.photos].flat()[safeActive];
      (pick as { onClick?: () => void } | undefined)?.onClick?.();
    }
  };

  const activeStyle = (idx: number): CSSProperties => (idx === safeActive ? { background: "var(--surf0)" } : {});

  const appItem = (a: Vm["launcherResults"]["apps"][number], i: number) => (
    <div key={a.key} data-launch-idx={offsets.app + i} id={"launch-" + (offsets.app + i)} className="rh-launch-item" {...clickable(() => { a.onClick(); }, a.name)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, cursor: "pointer", ...activeStyle(offsets.app + i) }}>
      <span style={{ color: a.color, display: "flex" }}><LineIcon app={a.key} size={20} /></span>
      <span style={{ fontSize: 13.5, color: "var(--text)", flex: 1 }}>{a.name}</span>
      <span style={{ fontSize: 11, color: "var(--ov0)" }}>{a.hint}</span>
    </div>
  );
  const postItem = (p: Vm["launcherResults"]["posts"][number], i: number) => (
    <div key={p.slug} data-launch-idx={offsets.post + i} id={"launch-" + (offsets.post + i)} className="rh-launch-item" {...clickable(() => { p.onClick(); }, `${p.title} 열기`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, cursor: "pointer", ...activeStyle(offsets.post + i) }}>
      <span style={{ color: "var(--accent)", display: "flex", fontSize: 16 }}>📄</span>
      <span style={{ fontSize: 13.5, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
      <span style={{ fontSize: 11, color: "var(--ov0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{p.excerpt}</span>
    </div>
  );
  const artistItem = (a: Vm["launcherResults"]["artists"][number], i: number) => (
    <div key={a.id} data-launch-idx={offsets.artist + i} id={"launch-" + (offsets.artist + i)} className="rh-launch-item" {...clickable(() => { a.onClick(); }, `${a.name} 열기`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, cursor: "pointer", ...activeStyle(offsets.artist + i) }}>
      <span style={{ color: "var(--accent)", display: "flex", fontSize: 16 }}>♪</span>
      <span style={{ fontSize: 13.5, color: "var(--text)", flex: 1 }}>{a.name}</span>
      <span style={{ fontSize: 11, color: "var(--ov0)" }}>music</span>
    </div>
  );
  const photoItem = (ph: Vm["launcherResults"]["photos"][number], i: number) => (
    <div key={ph.id} data-launch-idx={offsets.photo + i} id={"launch-" + (offsets.photo + i)} className="rh-launch-item" {...clickable(() => { ph.onClick(); }, `${ph.title} 열기`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, cursor: "pointer", ...activeStyle(offsets.photo + i) }}>
      <span style={{ color: "var(--accent)", display: "flex", fontSize: 16 }}>▣</span>
      <span style={{ fontSize: 13.5, color: "var(--text)", flex: 1 }}>{ph.title}</span>
      <span style={{ fontSize: 11, color: "var(--ov0)" }}>foto</span>
    </div>
  );

  return (
    <div onClick={vm.toggleLauncher} style={{ position: "absolute", inset: 0, zIndex: 9000, background: "rgba(17,17,27,.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 118 }}>
      <div onClick={vm.stop} style={{ width: 420, background: "color-mix(in srgb, var(--mantle) 97%, transparent)", border: "1px solid var(--surf1)", borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.55)", animation: "rh-fadeup .16s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 16px", borderBottom: "1px solid var(--surf0)", color: "var(--ov0)" }}>
          <span style={{ color: "var(--accent)" }}>❯</span>
          <input
            value={vm.launcherQuery}
            onChange={(e) => { vm.setLauncherQuery(e.target.value); setActive(0); }}
            onKeyDown={onInputKey}
            placeholder="앱·글·아티스트·사진 검색…"
            aria-label="검색"
            aria-autocomplete="list"
            aria-activedescendant={total > 0 ? `launch-${safeActive}` : undefined}
            autoFocus
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontFamily: "inherit", fontSize: "13.5px" }}
          />
        </div>
        <div ref={listRef} style={{ padding: 8, maxHeight: 340, overflow: "auto" }}>
          {!vm.hasResults && (
            <div style={{ padding: "12px", fontSize: 12.5, color: "var(--ov0)", textAlign: "center" }}>결과 없음</div>
          )}
          {res.apps.length > 0 && <LauncherGroup label="앱">{res.apps.map(appItem)}</LauncherGroup>}
          {res.posts.length > 0 && <LauncherGroup label="글">{res.posts.map(postItem)}</LauncherGroup>}
          {res.artists.length > 0 && <LauncherGroup label="아티스트">{res.artists.map(artistItem)}</LauncherGroup>}
          {res.photos.length > 0 && <LauncherGroup label="사진">{res.photos.map(photoItem)}</LauncherGroup>}
        </div>
      </div>
    </div>
  );
}
