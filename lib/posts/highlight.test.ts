import { describe, it, expect } from "vitest";
import { highlightCode } from "./highlight";

describe("highlightCode", () => {
  it("Rust 코드를 catppuccin 듀얼 테마 HTML 로 반환한다", async () => {
    const html = await highlightCode('const x: u32 = 1;', "rust");
    expect(html).toContain("<pre");
    // shiki 듀얼 테마 출력 — 라이트/다크 CSS 변수 class 또는 style 포함
    expect(html).toMatch(/--shiki-light|--shiki-dark|color-scheme/i);
  });

  it("언어가 없거나 미지원이면 plain text 로 감싼다", async () => {
    const html = await highlightCode("plain text", undefined);
    expect(html).toContain("plain text");
    expect(html).toContain("<pre");
  });

  it("HTML 메타문자를 이스케이프한다 (XSS 방어)", async () => {
    const html = await highlightCode("<script>alert(1)</script>", "ts");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});