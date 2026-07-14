import { ART_TERM } from "./icons";

export function TerminalApp() {
  const fast: [string, string][] = [
    ["OS", "ruehanix 1.0 x86_64"],
    ["Kernel", "6.9.2-rue"],
    ["WM", "Hyprland (Wayland)"],
    ["Theme", "Catppuccin Mocha"],
    ["Shell", "zsh 5.9"],
    ["Role", "Full-stack Dev · SW Lead"],
    ["Stack", "TypeScript · Go · React"],
    ["Hobby", "Sim Racing · F1/WEC · Bass"],
  ];
  const sw = ["#f38ba8", "#fab387", "#f9e2af", "#a6e3a1", "#89b4fa", "#cba6f7"];
  return (
    <div style={{ padding: "16px 16px", fontSize: 12.5, lineHeight: 1.6, color: "var(--text)" }}>
      <div style={{ color: "var(--ov0)" }}>ruehan@ruehanix:~$ fastfetch</div>
      <div style={{ display: "flex", gap: 18, margin: "12px 0 8px", flexWrap: "wrap" }}>
        <pre style={{ margin: 0, color: "#cba6f7", fontSize: 11, lineHeight: 1.3 }}>{ART_TERM}</pre>
        <div style={{ fontSize: 12.5 }}>
          <div>
            <span style={{ color: "#cba6f7", fontWeight: 700 }}>ruehan</span>
            <span style={{ color: "var(--ov0)" }}>@</span>
            <span style={{ color: "#cba6f7", fontWeight: 700 }}>ruehanix</span>
          </div>
          <div style={{ color: "var(--surf1)" }}>───────────────</div>
          {fast.map(([k, val]) => (
            <div key={k}>
              <span style={{ color: "#89b4fa" }}>{k}</span>
              <span style={{ color: "var(--ov0)" }}>: </span>
              {val}
            </div>
          ))}
          <div style={{ marginTop: 7, display: "flex", gap: 4 }}>
            {sw.map((c) => (
              <span key={c} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ color: "#a6e3a1" }}>ruehan@ruehanix</span>
        <span style={{ color: "var(--ov0)" }}>:</span>
        <span style={{ color: "#89b4fa" }}>~</span>
        <span style={{ color: "var(--ov0)" }}>$ </span>
        whoami
      </div>
      <div style={{ color: "var(--sub1)" }}>한규 — 코드를 짓고, 랩타임을 줄이고, 베이스를 친다.</div>
      <div style={{ marginTop: 4 }}>
        <span style={{ color: "#a6e3a1" }}>ruehan@ruehanix</span>
        <span style={{ color: "var(--ov0)" }}>:</span>
        <span style={{ color: "#89b4fa" }}>~</span>
        <span style={{ color: "var(--ov0)" }}>$ </span>
        <span style={{ display: "inline-block", width: 8, height: 14, background: "var(--text)", verticalAlign: "-2px", animation: "rh-blink 1.1s steps(1) infinite" }} />
      </div>
    </div>
  );
}