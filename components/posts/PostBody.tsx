import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/lib/sanity/image";
import { CodeCopyButton } from "./CodeCopyButton";

const mono = "'JetBrains Mono', ui-monospace, monospace";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p style={{ margin: "0 0 20px", fontSize: "var(--rh-body-fs, 16px)", lineHeight: 1.85, color: "var(--sub1)" }}>{children}</p>,
    h2: ({ value, children }) => <h2 id={(value as { _key?: string })._key} style={{ margin: "36px 0 14px", fontSize: 22, fontWeight: 800, letterSpacing: "-.01em", color: "var(--text)", scrollMarginTop: 16 }}>{children}</h2>,
    h3: ({ value, children }) => <h3 id={(value as { _key?: string })._key} style={{ margin: "28px 0 12px", fontSize: 18, fontWeight: 700, color: "var(--text)", scrollMarginTop: 16 }}>{children}</h3>,
    h4: ({ value, children }) => <h4 id={(value as { _key?: string })._key} style={{ margin: "22px 0 10px", fontSize: 15, fontWeight: 700, color: "var(--text)", scrollMarginTop: 16 }}>{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote style={{ margin: "0 0 20px", padding: "6px 16px", borderLeft: "3px solid var(--accent)", color: "var(--sub0)", fontStyle: "italic" }}>{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul style={{ margin: "0 0 20px", paddingLeft: 22, color: "var(--sub1)", fontSize: "var(--rh-body-fs, 16px)", lineHeight: 1.8 }}>{children}</ul>,
    number: ({ children }) => <ol style={{ margin: "0 0 20px", paddingLeft: 22, color: "var(--sub1)", fontSize: "var(--rh-body-fs, 16px)", lineHeight: 1.8 }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li style={{ margin: "0 0 6px" }}>{children}</li>,
    number: ({ children }) => <li style={{ margin: "0 0 6px" }}>{children}</li>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = (value as { href?: string })?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 2 }} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
    code: ({ children }) => (
      <code style={{ fontFamily: mono, fontSize: ".88em", padding: "1px 6px", borderRadius: 5, background: "var(--surf0)", color: "var(--text)" }}>{children}</code>
    ),
  },
  types: {
    image: ({ value }) => {
      const v = value as { alt?: string; asset?: unknown };
      // asset 없는 image 블록(업로드 전 저장 등)은 urlFor가 throw → 렌더하지 않는다(normalize에서도 거름).
      if (!v.asset) return null;
      // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN 이미지(외부 호스트), next/image 설정은 백로그.
      return <img src={urlFor(value).width(1400).fit("max").auto("format").url()} alt={v.alt ?? ""} style={{ display: "block", maxWidth: "100%", height: "auto", borderRadius: 10, margin: "8px 0 22px" }} />;
    },
    // codeBlock: 빌드 시점(sync-posts.mjs) 에서 shiki 듀얼 테마 HTML 이 `highlightedCode` 로 미리 박혀 있다.
    // PostBody 는 그 HTML 을 그대로 주입만 하면 끝 — 클라이언트 JS 토큰화 없음.
    codeBlock: ({ value }) => {
      const v = value as { language?: string; code?: string; highlightedCode?: string };
      return (
        <div style={{ position: "relative", margin: "0 0 22px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 12px",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              background: "var(--crust)",
              border: "1px solid var(--surf0)",
              borderBottom: "none",
              fontFamily: mono,
              fontSize: 10.5,
              color: "var(--ov0)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            <span>{v.language ?? "text"}</span>
            <CodeCopyButton code={v.code ?? ""} />
          </div>
          <div
            className="rh-codeblock"
            // eslint-disable-next-line react/no-danger -- shiki 가 escape 한 HTML. XSS 안전.
            dangerouslySetInnerHTML={{ __html: v.highlightedCode ?? `<pre><code>${v.code ?? ""}</code></pre>` }}
            style={{
              padding: "14px 16px",
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              border: "1px solid var(--surf0)",
              borderTop: "none",
              background: "var(--crust)",
              overflow: "auto",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          />
        </div>
      );
    },
  },
};

/** 글 본문 Portable Text 리치 렌더. Reader 앱·글 라우트 양쪽에서 공용. */
export function PostBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
