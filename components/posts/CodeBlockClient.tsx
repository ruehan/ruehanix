"use client";

import { useEffect, useState } from "react";
import { CodeCopyButton } from "./CodeCopyButton";

const mono = "'JetBrains Mono', ui-monospace, monospace";

/**
 * CodeBlock 렌더. 빌드 시점(sync-posts.mjs) 에 미리 생성된 highlightedCode 가
 * 있으면 그대로 주입. 없으면 클라이언트에서 shiki 동적 import 후 lazy highlight
 * — Studio 직접 편집 등 highlightedCode 가 dataset 에 없는 경로의 폴백.
 *
 * shiki 가 무거우므로 dynamic import. 첫 폴백 시점에만 chunk 다운로드.
 * 두 번째부터는 싱글톤 재사용.
 */
let shikiPromise: Promise<typeof import("shiki")> | null = null;
function getShiki() {
  if (!shikiPromise) shikiPromise = import("shiki");
  return shikiPromise;
}

let highlighterPromise: Promise<import("shiki").Highlighter> | null = null;
function getHighlighter() {
  if (highlighterPromise) return highlighterPromise;
  const shiki = getShiki();
  highlighterPromise = shiki.then(({ createHighlighter }) =>
    createHighlighter({
      themes: ["catppuccin-mocha", "catppuccin-latte"],
      langs: [
        "rust", "ts", "tsx", "js", "jsx", "json", "bash", "shell", "html", "css",
        "markdown", "yaml", "toml", "sql", "python", "go", "swift", "kotlin",
        "java", "ruby", "php", "diff", "text",
      ],
    }),
  );
  return highlighterPromise;
}

async function highlightClient(code: string, lang?: string): Promise<string> {
  const hl = await getHighlighter();
  const resolved = lang && hl.getLoadedLanguages().includes(lang as never) ? lang : "text";
  return hl.codeToHtml(code, {
    lang: resolved,
    themes: { dark: "catppuccin-mocha", light: "catppuccin-latte" },
    defaultColor: false,
  });
}

export function CodeBlockClient({
  language,
  code,
  highlightedCode,
}: {
  language?: string;
  code: string;
  highlightedCode?: string;
}) {
  const [html, setHtml] = useState<string | null>(highlightedCode ?? null);

  useEffect(() => {
    if (highlightedCode) return; // 서버/사전 생성 결과 사용 — 폴백 불필요.
    let cancelled = false;
    highlightClient(code, language).then((out) => {
      if (!cancelled) setHtml(out);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language, highlightedCode]);

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
        <span>{language ?? "text"}</span>
        <CodeCopyButton code={code} />
      </div>
      <div
        className="rh-codeblock"
        // eslint-disable-next-line react/no-danger -- shiki 가 escape 한 HTML. XSS 안전.
        dangerouslySetInnerHTML={{ __html: html ?? `<pre><code>${escapeHtml(code)}</code></pre>` }}
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
          // 폴백 전 plain 표시에서도 최소 가독성 유지.
          color: html ? undefined : "var(--sub1)",
        }}
      />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}