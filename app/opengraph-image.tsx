import { ImageResponse } from "next/og";

export const alt = "ruehanix — ruehan's tech blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 정적 브랜딩 OG(공유 미리보기). 글별 동적 OG는 후속(ADR 0006).
export default function OpengraphImage() {
  const dot = (x: number, y: number) => ({
    position: "absolute" as const,
    left: x,
    top: y,
    width: 26,
    height: 26,
    borderRadius: 8,
    background: "#11111b",
  });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 88px",
          background: "linear-gradient(160deg, #1e1e2e 0%, #181825 55%, #11111b 100%)",
          color: "#cdd6f4",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ position: "relative", width: 132, height: 132, borderRadius: 30, background: "#cba6f7", display: "flex" }}>
            <div style={dot(26, 26)} />
            <div style={dot(53, 26)} />
            <div style={dot(80, 26)} />
            <div style={dot(26, 53)} />
            <div style={dot(53, 53)} />
            <div style={dot(80, 53)} />
            <div style={dot(26, 80)} />
            <div style={dot(53, 80)} />
            <div style={dot(80, 80)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-2px" }}>ruehanix</div>
            <div style={{ fontSize: 30, color: "#a6adc8" }}>ruehan · full-stack dev</div>
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 30, color: "#bac2de", maxWidth: 900, lineHeight: 1.4 }}>
          server components · monorepos · 0.1s on the track
        </div>
        <div style={{ marginTop: 48, display: "flex", gap: 12 }}>
          {["#f38ba8", "#fab387", "#f9e2af", "#a6e3a1", "#89b4fa", "#cba6f7"].map((c) => (
            <div key={c} style={{ width: 40, height: 12, borderRadius: 6, background: c }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
