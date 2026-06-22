import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getSlugs } from "@/lib/posts/source";
import { CATS } from "@/lib/ruehanix/data";
import { catColors } from "@/lib/ruehanix/theme";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ruehan.dev";
const mono = "'JetBrains Mono', ui-monospace, monospace";
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif";
const catC = catColors(false);

export async function generateStaticParams() {
  const slugs = await getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "글을 찾을 수 없음" };
  const url = `/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.publishedAt,
      authors: ["한규"],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const color = catC[post.category];
  const catLabel = CATS[post.category].label;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: "한규", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/posts/${post.slug}`,
    articleSection: catLabel,
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--base)", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--surf0)", fontFamily: mono, position: "sticky", top: 0, background: "color-mix(in srgb, var(--base) 92%, transparent)", backdropFilter: "blur(8px)", zIndex: 1 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", textDecoration: "none" }}>
          ruehan<span style={{ color: "var(--accent)" }}>.dev</span>
        </Link>
        <Link href="/posts" style={{ fontSize: 12.5, color: "var(--ov0)", textDecoration: "none" }}>
          ← 모든 글
        </Link>
      </header>

      <article className="rh-sans" style={{ maxWidth: 640, margin: "0 auto", padding: "48px 28px 80px" }}>
        <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 18, fontFamily: mono, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color }}>
          #{catLabel}
        </div>
        <h1 style={{ margin: "0 0 14px", fontSize: 30, lineHeight: 1.28, fontWeight: 800, letterSpacing: "-.02em", textWrap: "balance" }}>{post.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--ov0)", fontFamily: mono, paddingBottom: 24, marginBottom: 30, borderBottom: "1px solid var(--surf0)" }}>
          <span style={{ color: "var(--sub0)" }}>ruehan</span>
          <span>·</span>
          <time dateTime={post.publishedAt}>{post.date}</time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        {post.body.map((para, i) => (
          <p key={i} style={{ margin: "0 0 22px", fontSize: 16.5, lineHeight: 1.85, color: "var(--sub1)" }}>{para}</p>
        ))}
        <footer style={{ marginTop: 44, paddingTop: 22, borderTop: "1px solid var(--surf0)", display: "flex", alignItems: "center", gap: 12, fontFamily: sans }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", flex: "none", background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)", fontWeight: 800, fontSize: 16, fontFamily: mono }}>한</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>한규 · ruehan</div>
            <div style={{ fontSize: 11.5, color: "var(--ov0)" }}>full-stack dev · sim racing · bass</div>
          </div>
        </footer>
      </article>
    </main>
  );
}
