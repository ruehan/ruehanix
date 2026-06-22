import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "404 · 페이지를 찾을 수 없음" };

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--crust)",
        color: "var(--text)",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 520, fontSize: 14, lineHeight: 1.8 }}>
        <div style={{ color: "var(--ov0)" }}>
          <span style={{ color: "#a6e3a1" }}>ruehan@ruehanix</span>
          <span style={{ color: "var(--ov0)" }}>:</span>
          <span style={{ color: "#89b4fa" }}>~</span>
          <span style={{ color: "var(--ov0)" }}>$ </span>
          cd /requested/path
        </div>
        <div style={{ color: "#f38ba8", marginTop: 4 }}>
          bash: cd: 그런 파일이나 디렉터리가 없습니다 <span style={{ color: "var(--ov0)" }}>(404)</span>
        </div>
        <div style={{ marginTop: 18, color: "var(--sub1)" }}>요청한 경로가 존재하지 않습니다.</div>
        <div style={{ marginTop: 18 }}>
          <span style={{ color: "#a6e3a1" }}>ruehan@ruehanix</span>
          <span style={{ color: "var(--ov0)" }}>:</span>
          <span style={{ color: "#89b4fa" }}>~</span>
          <span style={{ color: "var(--ov0)" }}>$ </span>
          <Link
            href="/"
            style={{
              color: "var(--accent)",
              fontWeight: 700,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            cd ~
          </Link>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 15,
              marginLeft: 6,
              background: "var(--text)",
              verticalAlign: "-2px",
              animation: "rh-blink 1.1s steps(1) infinite",
            }}
          />
        </div>
      </div>
    </main>
  );
}
