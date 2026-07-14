import type { Vm } from "./viewModel";

export function HotlapApp({ vm }: { vm: Vm }) {
  const stats: [string, string, string | null][] = [
    ["1,284", "total laps", null],
    ["6", "GT3 cars", null],
    ["4.2k", "iRating", "#f9e2af"],
  ];
  return (
    <div style={{ fontSize: 12.5, color: "var(--text)" }}>
      <div style={{ padding: "18px 18px 16px", borderBottom: "1px solid var(--surf0)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f38ba8", boxShadow: "0 0 8px #f38ba8" }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".18em", color: "#f38ba8" }}>PERSONAL BEST</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ov0)", marginBottom: 3 }}>Nürburgring Nordschleife · BMW M4 GT3</div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>
          6:59<span style={{ fontSize: 24, color: "var(--ov0)" }}>.214</span>
        </div>
        <div style={{ fontSize: 12, color: "#a6e3a1", fontWeight: 700, marginTop: 7 }}>▼ 0.41s · 개인 기록 경신</div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "14px 18px", borderBottom: "1px solid var(--surf0)" }}>
        {stats.map(([n, l, col], i) => (
          <div key={i} style={{ flex: 1, padding: "10px 12px", borderRadius: 9, background: "var(--mantle)", border: "1px solid var(--surf0)" }}>
            <div style={{ fontSize: 20, fontWeight: 800, ...(col ? { color: col } : {}) }}>{n}</div>
            <div style={{ fontSize: 10.5, color: "var(--ov0)", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.1fr .6fr .5fr", gap: 10, padding: "10px 14px", fontSize: 10.5, fontWeight: 700, color: "var(--ov0)", letterSpacing: ".04em", borderBottom: "1px solid var(--surf0)" }}>
        <span>TRACK</span>
        <span>CAR</span>
        <span>TIME</span>
        <span style={{ textAlign: "right" }}>Δ</span>
      </div>
      {vm.laps.map((l) => (
        <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.1fr .6fr .5fr", gap: 10, alignItems: "center", padding: "11px 14px", borderBottom: "1px solid var(--surf0)", background: l.rowBg }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text)" }}>
            {l.best && <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: "#f38ba8", color: "var(--on-accent)" }}>PB</span>}
            {l.track}
          </span>
          <span style={{ color: "var(--ov0)" }}>{l.car}</span>
          <span style={{ fontWeight: 700 }}>{l.time}</span>
          <span style={{ textAlign: "right", fontWeight: 700, color: l.deltaColor }}>{l.delta}</span>
        </div>
      ))}
    </div>
  );
}