import type { PortableTextBlock } from "@portabletext/types";

/**
 * 리더(Reader) 순수 로직.
 * - headingText / extractHeadings: Portable Text 본문에서 목차(TOC)용 헤딩 추출.
 *   id는 블록의 안정적인 _key를 써서 PostBody 의 렌더링(id=_key)과 앵커를 맞춘다.
 *   @see components/posts/PostBody.tsx (h2/h3/h4 id), components/ruehanix/apps.tsx ReaderApp TOC.
 */

const HEADING_STYLES = new Set(["h2", "h3", "h4"]);

interface PtSpan {
  _type?: string;
  text?: string;
}

/** 헤딩/블록의 자식에서 텍스트를 이어붙여 반환. 양끝 공백을 다듬는다. */
export function headingText(children: unknown): string {
  if (!Array.isArray(children)) return "";
  return children
    .map((c) => (c as PtSpan)?.text ?? "")
    .join("")
    .trim();
}

export interface Heading {
  id: string; // 블록 _key — PostBody 가 같은 값을 id 로 렌더
  level: number; // 2 | 3 | 4
  text: string;
}

/** 본문에서 h2/h3/h4 헤딩만 추출. 빈 제목(공백만)과 _key가 없는(빈 id) 블록은 건너뛴다
 *  — 빈 id는 querySelector("#") throw를 유발하므로 TOC 앵커로 쓸 수 없다. */
export function extractHeadings(body: PortableTextBlock[] | undefined | null): Heading[] {
  if (!Array.isArray(body)) return [];
  const out: Heading[] = [];
  for (const b of body) {
    const style = (b as { style?: string }).style;
    if (!style || !HEADING_STYLES.has(style)) continue;
    const text = headingText((b as { children?: unknown }).children);
    if (!text) continue;
    const id = (b as { _key?: string })._key;
    if (!id) continue;
    out.push({ id, level: Number(style.slice(1)), text });
  }
  return out;
}
