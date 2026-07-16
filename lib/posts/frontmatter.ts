/**
 * Markdown 글의 frontmatter(--- 사이 YAML-flat 키:값)를 파싱한다.
 * 진짜 YAML 은 아니다 — `key: value` 한 줄 형식만 지원한다.
 * 복잡한 YAML 이 필요해지면 gray-matter 등 도입 검토.
 */

export interface PostMeta {
  title?: string;
  slug?: string;
  category?: string;
  publishedAt?: string;
  readingTime?: string;
  excerpt?: string;
  /** "true" / "false" string (md frontmatter). buildPost 가 boolean 으로 변환. */
  published?: string;
  [k: string]: string | undefined;
}

export interface ParsedPost {
  meta: PostMeta;
  body: string;
}

/**
 * 입력: `---` 으로 시작하고 다음 `---` 까지 키-값. 본문은 그 뒤.
 * - `---` 로 시작하지 않으면 메타 없음, 전체를 본문으로.
 * - 종료 `---` 가 없으면 메타 없음 (안전망).
 */
export function parsePostFrontmatter(input: string): ParsedPost {
  if (!input.startsWith("---")) {
    return { meta: {}, body: input };
  }
  const rest = input.slice(3);
  // 시작의 첫 줄바꿈만 제거 (frontmatter 의 첫 줄을 본문으로 잘못 잘라내지 않게).
  const restNoLeading = rest.replace(/^\r?\n/, "");
  const closeIdx = restNoLeading.indexOf("\n---");
  if (closeIdx < 0) {
    return { meta: {}, body: input };
  }
  const metaBlock = restNoLeading.slice(0, closeIdx);
  // 본문은 닫는 `---` 직후의 모든 선행 줄바꿈을 제거해 깔끔히 시작.
  const body = restNoLeading.slice(closeIdx + 4).replace(/^(\r?\n)+/, "");

  const meta: PostMeta = {};
  for (const line of metaBlock.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const [, key, raw] = m;
    meta[key] = raw.trim();
  }
  return { meta, body };
}