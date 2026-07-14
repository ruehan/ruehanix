export function AboutApp() {
  const specs: [string, string][] = [
    ["CPU", "Ryzen 9 7950X · 16C/32T"],
    ["GPU", "Radeon RX 7900 XTX"],
    ["Memory", "64GB DDR5-6000"],
    ["WM", "Hyprland · Wayland"],
    ["Uptime", "7 yrs in the industry"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "30px 26px", color: "var(--text)" }}>
      <div style={{ width: 62, height: 62, borderRadius: 16, background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 28px rgba(203,166,247,.3)" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--on-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" />
          <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
          <circle cx="9.5" cy="7.5" r="0.7" fill="var(--on-accent)" />
          <circle cx="14.5" cy="7.5" r="0.7" fill="var(--on-accent)" />
        </svg>
      </div>
      <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>ruehanix</div>
      <div style={{ fontSize: 12, color: "var(--ov0)", marginTop: 3 }}>1.0 · kernel 6.9.2-rue · x86_64</div>
      <div style={{ width: "100%", marginTop: 20, fontSize: 12.5 }}>
        {specs.map(([k, val]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px", borderBottom: "1px solid var(--surf0)" }}>
            <span style={{ color: "var(--ov0)" }}>{k}</span>
            <span style={{ fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ width: "100%", marginTop: 16, padding: "14px 15px", borderRadius: 11, background: "var(--mantle)", border: "1px solid var(--surf0)", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", flex: "none", background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)", fontWeight: 800, fontSize: 16 }}>한</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>한규 · ruehan</div>
          <div style={{ fontSize: 11, color: "var(--ov0)", lineHeight: 1.5 }}>
            full-stack dev · SW Lead
            <br />
            sim racing · F1/WEC · bass
          </div>
        </div>
      </div>
    </div>
  );
}