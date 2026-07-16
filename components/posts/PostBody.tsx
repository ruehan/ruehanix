import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/lib/sanity/image";
import { CodeBlockClient } from "./CodeBlockClient";

const mono = "'JetBrains Mono', ui-monospace, monospace";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p style={{ margin: "0 0 20px", fontSize: "var(--rh-body-fs, 16px)", lineHeight: 1.85, color: "var(--sub1)" }}>{children}</p>,
    h2: ({ value, children }) => <h2 id={(value as { _key?: string })._key} style={{ margin: "36px 0 14px", fontSize: 22, fontWeight: 800, letterSpacing: "-.01em", color: "var(--text)", scrollMarginTop: 16 }}>{children}</h2>,
    h3: ({ value, children }) => <h3 id={(value as { _key?: string })._key} style={{ margin: "28px 0 12px", fontSize: 18, fontWeight: 700, color: "var(--text)", scrollMarginTop: 16 }}>{children}</h3>,
    h4: ({ value, children }) => <h4 id={(value as { _key?: string })._key} style={{ margin: "22px 0 10px", fontSize: 15, fontWeight: 700, color: "var(--text)", scrollMarginTop: 16 }}>{children}</h4>,
    hr: () => <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid var(--surf0)" }} />,
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
    // codeBlock: highlightedCode 가 있으면 그대로, 없으면 CodeBlockClient 가 클라이언트
    // shiki 동적 import 로 폴백. ADR 0035.
    codeBlock: ({ value }) => {
      const v = value as { language?: string; code?: string; highlightedCode?: string };
      return (
        <CodeBlockClient
          language={v.language}
          code={v.code ?? ""}
          highlightedCode={v.highlightedCode}
        />
      );
    },
  },
};

/** 글 본문 Portable Text 리치 렌더. Reader 앱·글 라우트 양쪽에서 공용. */
export function PostBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
