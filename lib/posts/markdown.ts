import type { PortableTextBlock } from "@portabletext/types";
import { formatDate } from "./normalize";
import { parsePostFrontmatter, type PostMeta } from "./frontmatter";
import type { BlogPost } from "./types";
import { markdownToPortableText as mdToPt } from "@portabletext/markdown";

/**
 * md → 우리 스키마의 Portable Text.
 * @portabletext/markdown (Sanity 공식) 사용. table 은 사전 분리하여 _type:"table" 블록
 * (rows/cells) 으로 emit — PostBody 가 <table> 로 렌더.
 *  - code → codeBlock (rename, language·code 보존)
 *  - horizontal-rule → block style "hr" (PostBody 의 block renderer)
 */
export function toPortableText(md: string): PortableTextBlock[] {
  const segments = splitMarkdownByTables(md);
  const out: PortableTextBlock[] = [];
  for (const seg of segments) {
    if (seg.type === "text") {
      const raw = mdToPt(seg.content) as unknown as PortableTextBlock[];
      for (const b of raw) {
        const bb = b as unknown as { _type?: string; _key?: string; language?: string; code?: string };
        if (bb._type === "code") {
          out.push({ _type: "codeBlock", _key: bb._key, language: bb.language ?? "text", code: bb.code ?? "" } as unknown as PortableTextBlock);
          continue;
        }
        if (bb._type === "horizontal-rule") {
          out.push({ _type: "block", _key: bb._key, style: "hr", children: [], markDefs: [] } as unknown as PortableTextBlock);
          continue;
        }
        out.push(b);
      }
    } else {
      out.push(buildTableBlock(seg.content));
    }
  }
  return out;
}

/** GFM 표 행: `| a | b |` 형태 (앞뒤 공백 허용). */
function isTableRow(line: string): boolean {
  return /^\s*\|.*\|\s*$/.test(line) && line.trim().length > 1;
}

/** GFM 표 구분선: `|---|` / `|:---|` / `|---:|` / `|:---:|` 등 (셀 1개 이상, 각 셀이 콜론+대시). */
function isTableSeparator(line: string): boolean {
  const stripped = line.trim().replace(/^\|/, "").replace(/\|$/, "").trim();
  if (!stripped) return false;
  const cells = stripped.split("|").map((c) => c.trim());
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));
}

/** 한 행의 셀 배열 추출. | 양끝 제거 후 | 로 split, trim. */
function parseRowCells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

/** md 를 table 구간과 일반 텍스트 구간으로 분리. */
function splitMarkdownByTables(md: string): Array<{ type: "text" | "table"; content: string }> {
  const lines = md.split("\n");
  const out: Array<{ type: "text" | "table"; content: string }> = [];
  let textBuf: string[] = [];
  const flushText = () => {
    const t = textBuf.join("\n").trim();
    if (t) out.push({ type: "text", content: t });
    textBuf = [];
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushText();
      const tableLines = [line];
      i += 2; // 헤더 + 구분선
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      out.push({ type: "table", content: tableLines.join("\n") });
      continue;
    }
    textBuf.push(line);
    i++;
  }
  flushText();
  return out;
}

const key = () => Math.random().toString(36).slice(2, 10);

/** table md 한 덩어리 → _type:"table" Portable Text 블록. */
function buildTableBlock(tableMd: string): PortableTextBlock {
  const lines = tableMd.split("\n");
  const headerCells = parseRowCells(lines[0]);
  const dataLines = lines.slice(1); // 구분선 이미 분리됨
  const toCell = (cellMd: string) => ({
    _type: "cell" as const,
    _key: key(),
    value: mdToPt(cellMd) as unknown as PortableTextBlock[],
  });
  return {
    _type: "table",
    _key: key(),
    headerRows: 1,
    rows: [
      { _type: "row", _key: key(), cells: headerCells.map(toCell) },
      ...dataLines.map((line) => ({ _type: "row" as const, _key: key(), cells: parseRowCells(line).map(toCell) })),
    ],
  } as unknown as PortableTextBlock;
}

const VALID_CATEGORIES = new Set<BlogPost["category"]>(["dev", "sim", "moto", "music", "blog"]);

export function buildPost(meta: PostMeta, body: string): BlogPost {
  // "false" string 또는 false boolean 만 unpublish. 누락 / "true" / true → publish.
  const isUnpublished = meta.published === "false" || meta.published === (false as unknown);
  const hasDate = !!meta.publishedAt;
  const rawCat = meta.category;
  const category: BlogPost["category"] = rawCat && VALID_CATEGORIES.has(rawCat as BlogPost["category"])
    ? (rawCat as BlogPost["category"])
    : "dev";
  const post: BlogPost = {
    slug: meta.slug ?? "",
    title: meta.title ?? "",
    category,
    date: hasDate ? formatDate(meta.publishedAt!) : "",
    excerpt: meta.excerpt ?? "",
    readingTime: meta.readingTime ?? "",
    body: toPortableText(body),
  };
  if (hasDate) post.publishedAt = meta.publishedAt!;
  post.published = !isUnpublished;
  return post;
}
