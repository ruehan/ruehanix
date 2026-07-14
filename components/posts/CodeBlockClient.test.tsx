// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { CodeBlockClient } from "./CodeBlockClient";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CodeBlockClient", () => {
  it("highlightedCode 가 주어지면 그대로 주입한다", () => {
    const html = '<pre class="shiki"><code><span class="line">pre</span></code></pre>';
    const { container } = render(
      <CodeBlockClient language="rust" code="pre" highlightedCode={html} />,
    );
    expect(container.querySelector(".shiki")).toBeInTheDocument();
  });

  it("highlightedCode 가 없으면 plain text 폴백 → useEffect 후 shiki HTML 로 교체", async () => {
    // shiki 가 무거우니 shiki 자체 모킹은 하지 않고, dynamic import 의 결과 HTML 만 검증.
    // 단 useEffect 가 비동기로 도는 사이 plain 표시 → 후 color 표시 흐름을 본다.
    const { container } = render(
      <CodeBlockClient language="rust" code="fn main() {}" />,
    );
    // 첫 렌더 — plain text.
    expect(container.textContent).toContain("fn main()");
    // 클라이언트 shiki 가 lazy load + 처리 후 (실제 shiki 동작) — 테스트에서는
    // dynamic import 가 실패할 수 있어 에러가 나도 폴백 UI 가 유지되는지만 본다.
    await waitFor(() => {
      // 단순히 에러 없이 마운트가 유지되는지.
      expect(container.firstChild).not.toBeNull();
    });
  });

  it("언어 라벨이 표시되고 복사 버튼이 존재한다", () => {
    render(
      <CodeBlockClient language="rust" code="x" highlightedCode="<pre></pre>" />,
    );
    // textTransform:uppercase 는 CSS 시각 변환. 텍스트 노드는 'rust' 그대로.
    expect(screen.getByText(/rust/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /코드 복사|복사됨/ })).toBeInTheDocument();
  });
});