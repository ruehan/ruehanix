"use client";

import type { CSSProperties, ReactNode } from "react";
import { APP_META } from "@/lib/ruehanix/data";
import type { AppKey } from "@/lib/ruehanix/types";
import { useRuehanix } from "./useRuehanix";
import { buildVm, type Vm } from "./viewModel";
import { ART_DESK, LineIcon } from "./icons";
import { AboutApp, FilesApp, FotoApp, HotlapApp, ReaderApp, SettingsApp, TerminalApp, WebApp } from "./apps";

const KEYBINDS: [string, string][] = [
  ["Super + D", "앱 실행기"],
  ["Super + 1-6", "워크스페이스 이동"],
  ["Super + Q", "창 닫기"],
  ["Super + /", "이 도움말"],
  ["Esc", "오버레이 닫기"],
  ["드래그", "타일 경계 크기조절"],
  ["워크스페이스 클릭", "바에서 전환"],
  ["앱 클릭", "포커스 이동"],
];

const PALETTE = ["#f38ba8", "#fab387", "#f9e2af", "#a6e3a1", "#89b4fa", "#cba6f7"];

function Win({ vm, app, children }: { vm: Vm; app: AppKey; children: ReactNode }) {
  const meta = APP_META[app];
  return (
    <div style={vm.tiles[app]}>
      <div style={vm.chrome}>
        <div onMouseDown={vm.focus[app]} style={vm.tbar}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", color: meta.color }}>
            <LineIcon app={app} size={14} />
            <span style={{ color: "var(--text)" }}>{meta.name}</span>
          </span>
          <div onClick={vm.close[app]} style={vm.xbtn}>
            ✕
          </div>
        </div>
        <div style={vm.bodyWrap}>{children}</div>
      </div>
    </div>
  );
}

function BarChip({ bg, color, children }: { bg: string; color: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 7, background: bg, color }}>
      {children}
    </div>
  );
}

export function RuehanixShell() {
  const api = useRuehanix();
  const vm = buildVm(api);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "var(--crust)", color: "var(--text)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", userSelect: "none" }}>
      {/* WALLPAPER */}
      <div style={{ position: "absolute", inset: 0, background: vm.wallpaper }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(205,214,244,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(205,214,244,.025) 1px,transparent 1px)", backgroundSize: "42px 42px", pointerEvents: "none" }} />

      {/* DESKTOP WIDGETS */}
      <div style={{ position: "absolute", left: 46, top: 90, zIndex: 30, display: "flex", gap: 22, alignItems: "flex-start", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>
        <pre style={{ margin: 0, color: "#cba6f7", fontSize: 13, lineHeight: 1.3 }}>{ART_DESK}</pre>
        <div style={{ fontSize: 13, lineHeight: 1.65, color: "var(--sub0)" }}>
          <div>
            <span style={{ color: "#cba6f7", fontWeight: 700 }}>ruehan</span>
            <span style={{ color: "var(--ov0)" }}>@</span>
            <span style={{ color: "#cba6f7", fontWeight: 700 }}>ruehanix</span>
          </div>
          <div style={{ color: "var(--surf1)" }}>─────────────────</div>
          <div><span style={{ color: "#89b4fa" }}>OS</span><span style={{ color: "var(--ov0)" }}>   </span>ruehanix 1.0</div>
          <div><span style={{ color: "#f5c2e7" }}>WM</span><span style={{ color: "var(--ov0)" }}>   </span>Hyprland</div>
          <div><span style={{ color: "#a6e3a1" }}>DE</span><span style={{ color: "var(--ov0)" }}>   </span>Catppuccin Mocha</div>
          <div><span style={{ color: "#fab387" }}>SH</span><span style={{ color: "var(--ov0)" }}>   </span>zsh 5.9</div>
          <div><span style={{ color: "#f38ba8" }}>WHO</span><span style={{ color: "var(--ov0)" }}>  </span>한규 · full-stack dev</div>
          <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
            {PALETTE.map((c) => (
              <span key={c} style={{ width: 16, height: 16, borderRadius: 4, background: c }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", right: 34, top: 84, zIndex: 30, width: 236, padding: "16px 18px", borderRadius: 13, background: "color-mix(in srgb, var(--mantle) 58%, transparent)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(69,71,90,.5)", fontSize: 11.5, color: "var(--sub0)", textShadow: "0 1px 6px rgba(0,0,0,.3)" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-.02em", lineHeight: 1 }}>
          {vm.mod.clock}
          <span style={{ fontSize: 12, color: "var(--ov0)", fontWeight: 500 }}> KST</span>
        </div>
        <div style={{ color: "var(--ov0)", marginBottom: 14 }}>Mon 22 Jun 2026 · up 4h 12m</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#a6e3a1" }}>CPU</span><span>{vm.mod.cpu}</span></div>
        <div style={{ height: 5, borderRadius: 3, background: "var(--surf0)", marginBottom: 10, overflow: "hidden" }}><div style={{ height: "100%", width: vm.mod.cpu, background: "#a6e3a1", borderRadius: 3 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#f9e2af" }}>RAM</span><span>{vm.mod.ram} · 30/64G</span></div>
        <div style={{ height: 5, borderRadius: 3, background: "var(--surf0)", marginBottom: 10, overflow: "hidden" }}><div style={{ height: "100%", width: vm.mod.ram, background: "#f9e2af", borderRadius: 3 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#89b4fa" }}>DISK</span><span>61% · 1.2/2T</span></div>
        <div style={{ height: 5, borderRadius: 3, background: "var(--surf0)", marginBottom: 13, overflow: "hidden" }}><div style={{ height: "100%", width: "61%", background: "#89b4fa", borderRadius: 3 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", whiteSpace: "nowrap", color: "var(--ov0)" }}><span style={{ color: "#cba6f7" }}>NET</span><span>↓2.4M ↑312K</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, whiteSpace: "nowrap", color: "var(--ov0)" }}><span style={{ color: "#f5c2e7" }}>PROC</span><span>312 · 0.84</span></div>
      </div>

      <div style={{ position: "absolute", left: 46, bottom: 34, zIndex: 30, fontSize: 12, color: "var(--ov0)", lineHeight: 1.9, whiteSpace: "nowrap" }}>
        <div><span style={{ color: "#cba6f7" }}>Super</span> + <span style={{ color: "#89b4fa" }}>D</span>  앱 실행기</div>
        <div><span style={{ color: "#cba6f7" }}>Super</span> + <span style={{ color: "#89b4fa" }}>1-6</span>  워크스페이스</div>
        <div><span style={{ color: "#cba6f7" }}>Super</span> + <span style={{ color: "#89b4fa" }}>/</span>  단축키 전체보기</div>
      </div>

      {/* WAYBAR */}
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, height: 34, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", borderRadius: 11, background: "color-mix(in srgb, var(--mantle) 86%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid var(--surf0)", fontSize: 12.5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div data-testid="launcher" onClick={vm.toggleLauncher} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 7, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5" />
              <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
              <circle cx="9" cy="7.5" r="0.6" fill="currentColor" />
              <circle cx="15" cy="7.5" r="0.6" fill="currentColor" />
            </svg>
            ruehanix
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {vm.wsList.map((w) => (
              <div key={w.n} data-testid={"ws-" + w.n} onClick={w.onClick} style={w.style}>
                {w.n}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, color: "var(--sub1)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: vm.focusDot }} />
          {vm.focusTitle}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <BarChip bg="rgba(137,180,250,.14)" color="#89b4fa">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><circle cx="12" cy="20" r="0.5" fill="currentColor" /></svg>
            wlan0
          </BarChip>
          <BarChip bg="rgba(166,227,161,.14)" color="#a6e3a1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></svg>
            {vm.mod.cpu}
          </BarChip>
          <BarChip bg="rgba(249,226,175,.14)" color="#f9e2af">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="9" rx="1.5" /><path d="M6 8V6M10 8V6M14 8V6M18 8V6" /></svg>
            {vm.mod.ram}
          </BarChip>
          <BarChip bg="rgba(245,194,231,.14)" color="#f5c2e7">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M16 9a4 4 0 0 1 0 6" /></svg>
            {vm.mod.vol}
          </BarChip>
          <BarChip bg="rgba(166,227,161,.14)" color="#a6e3a1">
            <svg width="15" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="2" y="7" width="17" height="10" rx="2" /><rect x="4" y="9" width="11" height="6" rx="1" fill="currentColor" stroke="none" /><path d="M21 10v4" strokeLinecap="round" /></svg>
            {vm.mod.batt}
          </BarChip>
          <div style={{ padding: "3px 11px", borderRadius: 7, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: "var(--accent)", fontWeight: 700 }}>{vm.mod.clock}</div>
          <div onClick={vm.reboot} title="reboot" style={{ display: "flex", alignItems: "center", padding: "3px 8px", borderRadius: 7, background: "rgba(243,139,168,.14)", color: "#f38ba8", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v9" /><path d="M6.5 7a8 8 0 1 0 11 0" /></svg>
          </div>
        </div>
      </div>

      {/* WINDOWS */}
      <div style={{ position: "absolute", inset: 0, zIndex: 100 }}>
        <Win vm={vm} app="files"><FilesApp vm={vm} /></Win>
        <Win vm={vm} app="reader"><ReaderApp vm={vm} /></Win>
        <Win vm={vm} app="foto"><FotoApp vm={vm} /></Win>
        <Win vm={vm} app="hotlap"><HotlapApp vm={vm} /></Win>
        <Win vm={vm} app="terminal"><TerminalApp /></Win>
        <Win vm={vm} app="web"><WebApp vm={vm} /></Win>
        <Win vm={vm} app="settings"><SettingsApp vm={vm} /></Win>
        <Win vm={vm} app="about"><AboutApp /></Win>
        {vm.gutters.map((g) => (
          <div key={g.key} onMouseDown={g.onMouseDown} style={g.style} />
        ))}
      </div>

      {/* LAUNCHER */}
      {vm.showLauncher && (
        <div onClick={vm.toggleLauncher} style={{ position: "absolute", inset: 0, zIndex: 9000, background: "rgba(17,17,27,.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 118 }}>
          <div onClick={vm.stop} style={{ width: 420, background: "color-mix(in srgb, var(--mantle) 97%, transparent)", border: "1px solid var(--surf1)", borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.55)", animation: "rh-fadeup .16s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 16px", borderBottom: "1px solid var(--surf0)", color: "var(--ov0)" }}>
              <span style={{ color: "var(--accent)" }}>❯</span>
              <span style={{ color: "var(--text)" }}>앱 검색…</span>
              <span style={{ width: 7, height: 15, background: "#cba6f7", animation: "rh-blink 1.1s steps(1) infinite" }} />
            </div>
            <div style={{ padding: 8, maxHeight: 340, overflow: "auto" }}>
              {vm.appList.map((a) => (
                <div key={a.key} className="rh-launch-item" onClick={a.onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, cursor: "pointer" }}>
                  <span style={{ color: a.color, display: "flex" }}>
                    <LineIcon app={a.key} size={20} />
                  </span>
                  <span style={{ fontSize: 13.5, color: "var(--text)", flex: 1 }}>{a.name}</span>
                  <span style={{ fontSize: 11, color: "var(--ov0)" }}>{a.hint}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KEYBIND OVERLAY */}
      {vm.showKeys && (
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
    </div>
  );
}
