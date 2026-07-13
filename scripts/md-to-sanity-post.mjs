#!/usr/bin/env node
// BLOG.md → Sanity post NDJSON + 백업 markdown 변환기.
// 사용: node scripts/md-to-sanity-post.mjs BLOG.md <slug> <title> <publishedAt-iso> <excerpt> <readingTime>
//
// - 입력: frontmatter 없이 본문만 있는 markdown (# 제목 포함)
// - 출력:
//   1. content/posts/<slug>.ndjson   (Sanity dataset import용, _type:"post" 단일 문서)
//   2. content/posts/<slug>.md       (백업, 기존 컨벤션)
//
// 스키마에서 다루는 본문 요소: block(h2/h3/normal/blockquote) + codeBlock.
// markdown 테이블은 현재 스키마에 테이블 타입이 없어 codeBlock(language:"text")로 변환한다.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [, , SRC, SLUG, TITLE, PUBLISHED_AT, EXCERPT, READING_TIME] = process.argv;
if (!SRC || !SLUG || !TITLE || !PUBLISHED_AT || !EXCERPT || !READING_TIME) {
  console.error(
    "사용법: node scripts/md-to-sanity-post.mjs <src.md> <slug> <title> <publishedAt-iso> <excerpt> <readingTime>",
  );
  process.exit(1);
}

const src = readFileSync(SRC, "utf8").replace(/\r\n/g, "\n");

// ----- 라인 스트림으로 분할 -----
const lines = src.split("\n");

// ----- 1) H1 제목, 2) 본문 블록 리스트 -----
let docTitle = "";
const bodyLines = [];
{
  let i = 0;
  // 첫 번째 줄이 # … 이면 제목으로 빼고 본문에서 제외
  if (lines[0]?.startsWith("# ")) {
    docTitle = lines[0].slice(2).trim();
    i = 1;
    // 제목 다음의 빈 줄 무시
    while (i < lines.length && lines[i].trim() === "") i++;
  }
  for (; i < lines.length; i++) bodyLines.push(lines[i]);
}

// ----- 본문을 섹션(블록/코드/테이블/구분선)으로 분할 -----
const sections = []; // {kind:'h2'|'h3'|'p'|'code'|'table'|'hr', text?, language?, rows?}
{
  let i = 0;
  let buf = [];
  const flushPara = () => {
    const text = buf.join("\n").trim();
    buf = [];
    if (text) sections.push({ kind: "p", text });
  };
  while (i < bodyLines.length) {
    const line = bodyLines[i];

    // 코드 펜스
    if (line.startsWith("```")) {
      flushPara();
      const language = line.slice(3).trim() || "text";
      i++;
      const code = [];
      while (i < bodyLines.length && !bodyLines[i].startsWith("```")) {
        code.push(bodyLines[i]);
        i++;
      }
      i++; // 닫는 펜스 소비
      sections.push({ kind: "code", language, code: code.join("\n") });
      continue;
    }

    // 수평선 ---
    if (/^---+\s*$/.test(line)) {
      flushPara();
      sections.push({ kind: "hr" });
      i++;
      continue;
    }

    // 표 헤더 (| a | b |)
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < bodyLines.length && /^\s*\|[-:|\s]+\|\s*$/.test(bodyLines[i + 1])) {
      flushPara();
      const header = parseRow(line);
      i += 2; // header + separator
      const rows = [];
      while (i < bodyLines.length && /^\s*\|.*\|\s*$/.test(bodyLines[i])) {
        rows.push(parseRow(bodyLines[i]));
        i++;
      }
      sections.push({ kind: "table", header, rows });
      continue;
    }

    // 제목
    if (line.startsWith("### ")) {
      flushPara();
      sections.push({ kind: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      sections.push({ kind: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }

    // 빈 줄 → 단락 경계
    if (line.trim() === "") {
      flushPara();
      i++;
      continue;
    }

    buf.push(line);
    i++;
  }
  flushPara();
}

function parseRow(line) {
  // | a | b | → [a, b]
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

// ----- markdown 인라인 → Portable Text children -----
// 처리: **bold**, `code`, 그 외는 일반 텍스트.
function inlineToSpans(text) {
  const spans = [];
  let rest = text;
  // 패턴 우선순위: **bold** 와 `code`. 단순 greedy 순회로 안전하게.
  // 더 단순한 접근: 한 번에 토큰화. **와 `를 모두 매칭하는 정규식.
  // 토큰 정규식: **…**  |  `…`  |  나머지 텍스트
  const tokenRe = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|([^*`]+)/g;
  let m;
  while ((m = tokenRe.exec(rest)) !== null) {
    if (m[1] !== undefined) {
      // **bold**
      spans.push({ _type: "span", text: m[2], marks: ["strong"] });
    } else if (m[3] !== undefined) {
      // `code`
      spans.push({ _type: "span", text: m[4], marks: ["code"] });
    } else if (m[5] !== undefined) {
      spans.push({ _type: "span", text: m[5], marks: [] });
    }
  }
  if (spans.length === 0) spans.push({ _type: "span", text: "", marks: [] });
  return spans;
}

// 단락: > 인용은 첫 글자가 > 인 줄들의 합으로 보고, 인용 처리한다.
// 위에서 sections 단위로 이미 p/h2/h3/code/table/hr로 나눴으므로
// > …는 별도 분기가 필요. 여기선 입력에 > 단락이 섞여 들어왔을 수 있어
// p.text 안의 줄을 보면서 인용을 분리한다.
// 단순화: BLOG.md에 blockquote가 거의 없으니 (현재 1회) 텍스트 그대로 p로 둔다.
// 단, "> ..." 한 줄로 시작하면 별도 blockquote로 만들고 싶다 → 라인 단계에서 분리.

function makeBlock(style, text) {
  return {
    _type: "block",
    _key: `b${Math.random().toString(36).slice(2, 10)}`,
    style,
    children: inlineToSpans(text),
    markDefs: [],
  };
}

function makeCodeBlock(language, code) {
  return {
    _type: "codeBlock",
    _key: `c${Math.random().toString(36).slice(2, 10)}`,
    language,
    code,
  };
}

// ----- table 행렬을 codeBlock text로 직렬화 (폭 맞춤) -----
function tableToText(header, rows) {
  const widths = header.map((h, idx) =>
    Math.max(h.length, ...rows.map((r) => (r[idx] ?? "").length)),
  );
  const fmt = (arr) =>
    arr.map((cell, i) => (cell ?? "").padEnd(widths[i])).join(" | ");
  const sep = widths.map((w) => "-".repeat(w)).join("-+-");
  return [fmt(header), sep, ...rows.map(fmt)].join("\n");
}

// ----- sections → Portable Text 배열 -----
const body = [];
for (const sec of sections) {
  switch (sec.kind) {
    case "h2":
      body.push(makeBlock("h2", sec.text));
      break;
    case "h3":
      body.push(makeBlock("h3", sec.text));
      break;
    case "p":
      // 단독 "> " 한 줄 blockquote도 본문에 섞여 있음
      body.push(...paragraphOrBlockquote(sec.text));
      break;
    case "code":
      body.push(makeCodeBlock(sec.language, sec.code));
      break;
    case "table":
      body.push(makeCodeBlock("text", tableToText(sec.header, sec.rows)));
      break;
    case "hr":
      // hr 은 무시 (스키마에 divider 없음)
      break;
  }
}

function paragraphOrBlockquote(text) {
  // text가 "> …"로 시작하면 blockquote. 아니면 normal.
  if (/^>\s?/.test(text)) {
    const stripped = text.replace(/^>\s?/gm, "").trim();
    return [makeBlock("blockquote", stripped)];
  }
  return [makeBlock("normal", text)];
}

// ----- Sanity post 문서 -----
const now = new Date().toISOString();
const doc = {
  _id: `post.${SLUG}`,
  _type: "post",
  title: TITLE,
  slug: { _type: "slug", current: SLUG },
  category: "dev",
  publishedAt: PUBLISHED_AT,
  excerpt: EXCERPT,
  readingTime: READING_TIME,
  body,
  _createdAt: now,
  _updatedAt: now,
  _rev: "1",
};

// ----- NDJSON (Sanity dataset import 호환) -----
mkdirSync("content/posts", { recursive: true });
writeFileSync(`content/posts/${SLUG}.ndjson`, JSON.stringify(doc) + "\n", "utf8");

// ----- 백업 markdown (frontmatter + 본문 원문) -----
const backupMd =
  `---\n` +
  `title: ${TITLE}\n` +
  `category: dev\n` +
  `excerpt: ${EXCERPT}\n` +
  `slug: ${SLUG}\n` +
  `readingTime: ${READING_TIME}\n` +
  `publishedAt: ${PUBLISHED_AT.slice(0, 10)}\n` +
  `---\n\n` +
  src;
writeFileSync(`content/posts/${SLUG}.md`, backupMd, "utf8");

console.log(`OK  content/posts/${SLUG}.ndjson`);
console.log(`OK  content/posts/${SLUG}.md`);
console.log(`blocks: ${body.length}, sections: ${sections.length}`);
