import { clickable } from "./clickable";
import { EmptyPosts } from "./EmptyPosts";
import type { Vm } from "./viewModel";

const mono = "'JetBrains Mono',monospace";

export function WebApp({ vm }: { vm: Vm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div onMouseDown={vm.stop} style={{ flex: "none", display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", background: "var(--mantle)", borderBottom: "1px solid var(--surf0)" }}>
        <span style={{ color: "var(--ov0)", fontSize: 14 }}>‹ ›</span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, height: 26, borderRadius: 7, background: "var(--crust)", padding: "0 11px", fontSize: 11.5, color: "var(--sub0)" }}>
          <span style={{ color: "#a6e3a1" }}>●</span>https://ruehan.dev
        </div>
      </div>
      <div className="rh-sans" style={{ flex: 1, minHeight: 0, overflow: "auto", background: "var(--base)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 30px", borderBottom: "1px solid var(--surf0)", position: "sticky", top: 0, background: "color-mix(in srgb, var(--base) 92%, transparent)", backdropFilter: "blur(8px)", zIndex: 1, fontFamily: mono }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
            ruehan<span style={{ color: "#cba6f7" }}>.dev</span>
          </span>
          <div style={{ display: "flex", gap: 18, fontSize: 12.5, color: "var(--ov0)" }}>
            <span>posts</span>
            <span>projects</span>
            <span>racing</span>
            <span>about</span>
          </div>
        </div>
        <div style={{ padding: "54px 30px 42px", textAlign: "center", background: "radial-gradient(120% 100% at 50% 0%,color-mix(in srgb, var(--accent) 14%, transparent),transparent 70%)" }}>
          <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: "#cba6f7", letterSpacing: ".06em", marginBottom: 14 }}>FULL-STACK DEVELOPER · SW LEAD</div>
          <h1 style={{ margin: "0 0 16px", fontSize: 36, lineHeight: 1.18, fontWeight: 800, letterSpacing: "-.03em", color: "var(--text)", textWrap: "balance" }}>
            코드를 짓고, 랩타임을 줄이고,
            <br />
            베이스를 친다.
          </h1>
          <p style={{ margin: "0 auto", maxWidth: 480, fontSize: 15, lineHeight: 1.7, color: "var(--sub0)" }}>한규(ruehan)의 기술 블로그. 서버 컴포넌트와 모노레포, 그리고 트랙 위의 0.1초에 대한 기록.</p>
        </div>
        <div style={{ padding: "6px 30px 44px", maxWidth: 840, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, fontFamily: mono }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>최근 글</h2>
            <span style={{ fontSize: 12, color: "var(--ov0)" }}>all posts →</span>
          </div>
          {vm.allPosts.length === 0 && <EmptyPosts compact />}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {vm.allPosts.map((p) => (
              <div key={p.id} className="rh-webcard" {...clickable(p.open, `${p.title} 열기`)} style={{ border: "1px solid var(--surf0)", borderRadius: 13, padding: "18px 20px", cursor: "pointer", background: "var(--mantle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11, fontFamily: mono }}>
                  <span style={{ padding: "2px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: p.catColor }}>#{p.catLabel}</span>
                  <span style={{ fontSize: 11, color: "var(--ov0)" }}>{p.date}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 7, color: "var(--text)", letterSpacing: "-.01em", textWrap: "balance" }}>{p.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ov1)" }}>{p.excerpt}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "28px 30px", textAlign: "center", borderTop: "1px solid var(--surf0)", fontSize: 11.5, color: "var(--ov0)", fontFamily: mono }}>© 2026 ruehan.dev · built on ruehanix · 서울</div>
      </div>
    </div>
  );
}