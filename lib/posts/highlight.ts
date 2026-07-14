/**
 * Shiki 듀얼 테마 하이라이트. SSR 시점에 HTML 문자열을 생성한다 —
 * 클라이언트 JS 토큰화 없음, 사이트의 다크/라이트 토글은 CSS 변수만으로 전환.
 *
 * 테마: catppuccin-mocha (다크) + catppuccin-latte (라이트). 사이트 기존 팔레트와 정합.
 * html.rh-light (셸 토글) 가 라이트 테마를 활성화한다.
 */
import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["catppuccin-mocha", "catppuccin-latte"],
      // 자주 쓰는 언어 위주. 필요 시 빌드 시점에 lazy load.
      langs: [
        "rust",
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "bash",
        "shell",
        "html",
        "css",
        "markdown",
        "yaml",
        "toml",
        "sql",
        "python",
        "go",
        "swift",
        "kotlin",
        "java",
        "ruby",
        "php",
        "diff",
        "text",
      ],
    });
  }
  return highlighterPromise;
}

/**
 * 코드 + 언어를 받아 shiki 듀얼 테마 HTML 로 감싼다.
 * - lang 가 없거나 미지원이면 plain text 폴백.
 * - 결과는 이미 escape 된 HTML 이라 그대로 dangerouslySetInnerHTML 로 주입 가능.
 */
export async function highlightCode(code: string, lang?: string): Promise<string> {
  const hl = await getHighlighter();
  const resolved = lang && hl.getLoadedLanguages().includes(lang as never) ? lang : "text";
  return hl.codeToHtml(code, {
    lang: resolved,
    themes: {
      dark: "catppuccin-mocha",
      light: "catppuccin-latte",
    },
    defaultColor: false, // CSS 변수(--shiki-dark/light)로 출력
  });
}