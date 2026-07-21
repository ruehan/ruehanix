import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts/source";
import { CATS } from "@/lib/ruehanix/data";
import { catColors } from "@/lib/ruehanix/theme";

const mono = "'JetBrains Mono', ui-monospace, monospace";
const catC = catColors(false);

export const revalidate = 60;

export const metadata: Metadata = {
  title: "모든 글",
  description: "한규(ruehan)의 글 목록 — 개발, 심레이싱, 모터스포츠, 음악.",
  alternates: { canonical: "/posts" },
};

export default async function PostsPage() {
  const posts = await getAllPosts();
  return (
    <main style={{ minHeight: "100vh", background: "var(--base)", color: "var(--text)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--surf0)", fontFamily: mono, position: "sticky", top: 0, background: "color-mix(in srgb, var(--base) 92%, transparent)", backdropFilter: "blur(8px)", zIndex: 1 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", textDecoration: "none" }}>
          ruehan<span style={{ color: "var(--accent)" }}>.dev</span>
        </Link>
        <span style={{ fontSize: 12.5, color: "var(--ov0)" }}>{posts.length} posts</span>
      </header>

      <div className="rh-sans" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", fontFamily: mono }}>모든 글</h1>
        {posts.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--ov0)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--sub1)" }}>아직 글이 없습니다</div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/posts/${p.slug}`}
              style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "16px 12px", borderBottom: "1px solid var(--surf0)", textDecoration: "none", color: "inherit" }}
            >
              <span style={{ flex: "none", width: 8, height: 8, borderRadius: 2, background: catC[p.category], transform: "translateY(-1px)" }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, color: "var(--text)", marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 13.5, color: "var(--ov1)", lineHeight: 1.5 }}>{p.excerpt}</div>
              </div>
              <span style={{ flex: "none", fontSize: 11.5, color: catC[p.category], fontFamily: mono }}>#{CATS[p.category].label}</span>
              <span style={{ flex: "none", fontSize: 11.5, color: "var(--ov0)", fontFamily: mono, width: 86, textAlign: "right" }}>{p.date}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
