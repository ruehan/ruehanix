"use client";

import { useState } from "react";

/** 코드 블록 우상단 복사 버튼. 클립보드 API + 1.5s 토스트.
 *  CodeBlockHighlighted 안에서만 사용. client island. */
export function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard 권한 없거나 비-secure 컨텍스트 — 무시.
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "복사됨" : "코드 복사"}
      style={{
        font: "inherit",
        fontSize: 10.5,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        color: copied ? "var(--accent)" : "var(--ov0)",
        background: "var(--surf0)",
        border: "1px solid var(--surf1)",
        borderRadius: 5,
        padding: "3px 8px",
        cursor: "pointer",
        letterSpacing: ".04em",
      }}
    >
      {copied ? "복사됨" : "복사"}
    </button>
  );
}