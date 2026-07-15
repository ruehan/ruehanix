#!/usr/bin/env node
// content/posts/*.md 의 frontmatter 를 일괄 인식해 Sanity NDJSON + 백업 NDJSON 생성.
// 단방향 (md -> Sanity). Sanity -> md 다운로드는 이번 범위 밖 (ADR 0030).
//
// 사용:  npm run sync-posts
// 옵션: --dry-run  생성만 하고 파일 쓰기는 생략. CI 안전.
//
// 출력:
//   1. content/posts/<slug>.ndjson   (Sanity dataset import용, _type:"post" 단일 문서)
//
// frontmatter 키: title, slug, category, publishedAt (iso), readingTime, excerpt — 모두 필수.
//
// frontmatter 파서는 lib/posts/frontmatter.ts 의 parsePostFrontmatter 와 동일한 규약.
// .mjs 가 .ts 를 직접 import 하지 못하는 환경을 위해 동일 로직을 인라인.
// 정본은 .ts — 테스트가 이쪽을 검증. 두 구현이 어긋나면 sync가 잘못된 NDJSON 을 만들 수 있으므로
// frontmatter.ts 변경 시 본 함수도 함께 동기화해야 한다.

import { readdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHighlighter } from "shiki";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, "..", "content", "posts");
const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");

const REQUIRED = ["title", "slug", "category", "publishedAt", "readingTime", "excerpt"];

// Sanity dataset import. _id 가 "post.${slug}" 로 동일 → 같은 slug 재실행은
// upsert(덮어쓰기). 운영 안전을 위해 SANITY_IMPORT_TOKEN 미설정 시 import skip
// + 경고 (CI 에서만 token 주입, 로컬 dry-run 가능).
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const IMPORT_TOKEN = process.env.SANITY_IMPORT_TOKEN;
const SKIP_IMPORT = args.has("--no-import") || DRY;

// shiki 듀얼 테마. catppuccin mocha (다크) + latte (라이트). 사이트 기존 팔레트 정합.
const SHIKI_LANGS = [
  "rust", "ts", "tsx", "js", "jsx", "json", "bash", "shell", "html", "css",
  "markdown", "yaml", "toml", "sql", "python", "go", "swift", "kotlin", "java",
  "ruby", "php", "diff", "text",
];

let highlighterPromise;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["catppuccin-mocha", "catppuccin-latte"],
      langs: SHIKI_LANGS,
    });
  }
  return highlighterPromise;
}

async function highlightCode(code, lang) {
  const hl = await getHighlighter();
  const resolved = lang && hl.getLoadedLanguages().includes(lang) ? lang : "text";
  return hl.codeToHtml(code, {
    lang: resolved,
    themes: { dark: "catppuccin-mocha", light: "catppuccin-latte" },
    defaultColor: false,
  });
}

/**
 * frontmatter 파서 — lib/posts/frontmatter.ts 와 동기화 필수.
 * 인라인 구현은 .mjs 환경에서 .ts import 을 피하기 위함.
 */
function parsePostFrontmatter(input) {
  if (!input.startsWith("---")) return { meta: {}, body: input };
  const restNoLeading = input.slice(3).replace(/^\r?\n/, "");
  const closeIdx = restNoLeading.indexOf("\n---");
  if (closeIdx < 0) return { meta: {}, body: input };
  const metaBlock = restNoLeading.slice(0, closeIdx);
  const body = restNoLeading.slice(closeIdx + 4).replace(/^(\r?\n)+/, "");
  const meta = {};
  for (const line of metaBlock.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    meta[m[1]] = m[2].trim();
  }
  return { meta, body };
}

/**
 * 핵심 변환: markdown body -> Sanity Portable Text 블록 배열.
 * h2/h3/blockquote/codeBlock/normal — 기존 md-to-sanity-post.mjs 와 같은 규약.
 * 테이블은 스키마에 없으므로 codeBlock(text) 폴백.
 */
function block(style, text, key) {
  return {
    _type: "block",
    _key: key,
    style,
    children: [{ _type: "span", _key: key + "s", text, marks: [] }],
    markDefs: [],
  };
}

function codeBlock(language, code, key) {
  return { _type: "codeBlock", _key: key, language, code };
}

async function toPortableText(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  let n = 0;
  const key = () => `b${(n++).toString(36)}`;
  while (i < lines.length) {
    const ln = lines[i];
    if (/^```/.test(ln)) {
      const language = ln.slice(3).trim() || "text";
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      if (i < lines.length) i++;
      const code = buf.join("\n");
      const highlighted = await highlightCode(code, language);
      blocks.push({ _type: "codeBlock", _key: key(), language, code, highlightedCode: highlighted });
      continue;
    }
    if (/^## /.test(ln)) { blocks.push(block("h2", ln.slice(3), key())); i++; continue; }
    if (/^### /.test(ln)) { blocks.push(block("h3", ln.slice(4), key())); i++; continue; }
    if (/^> /.test(ln)) { blocks.push(block("blockquote", ln.slice(2), key())); i++; continue; }
    if (ln.trim() === "") { i++; continue; }
    if (/^\|/.test(ln)) {
      const buf = [];
      while (i < lines.length && /^\|/.test(lines[i])) buf.push(lines[i++]);
      const code = buf.join("\n");
      const highlighted = await highlightCode(code, "text");
      blocks.push({ _type: "codeBlock", _key: key(), language: "text", code, highlightedCode: highlighted });
      continue;
    }
    const buf = [ln];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(##|###|>|```|\|)/.test(lines[i])) {
      buf.push(lines[i++]);
    }
    blocks.push(block("normal", buf.join(" ").trim(), key()));
  }
  return blocks;
}

function buildDoc(meta, body, portable) {
  return {
    _type: "post",
    _id: `post.${meta.slug}`,
    title: meta.title,
    slug: { _type: "slug", current: meta.slug },
    category: meta.category,
    publishedAt: meta.publishedAt,
    readingTime: meta.readingTime,
    excerpt: meta.excerpt,
    body: portable,
  };
}

function validate(meta, file) {
  const missing = REQUIRED.filter((k) => !meta[k]);
  if (missing.length > 0) {
    throw new Error(`${file}: frontmatter 누락 — ${missing.join(", ")}`);
  }
}

async function syncFile(file) {
  const src = readFileSync(join(POSTS_DIR, file), "utf8");
  const { meta, body } = parsePostFrontmatter(src);
  validate(meta, file);
  const portable = await toPortableText(body);
  const doc = buildDoc(meta, body, portable);
  const ndjson = JSON.stringify(doc) + "\n";
  const out = join(POSTS_DIR, `${meta.slug}.ndjson`);
  if (DRY) {
    process.stdout.write(`[dry-run] ${file} -> ${out}\n`);
    return;
  }
  writeFileSync(out, ndjson);
  process.stdout.write(`synced ${file} -> ${out}\n`);
}

async function importToSanity() {
  if (SKIP_IMPORT) {
    process.stdout.write("[import] --no-import 또는 --dry-run. import skip.\n");
    return;
  }
  if (!IMPORT_TOKEN) {
    process.stderr.write(
      "[import] SANITY_IMPORT_TOKEN 미설정. ndjson 만 생성. token 주입 후 재실행.\n",
    );
    return;
  }
  if (!PROJECT_ID || !DATASET) {
    process.stderr.write("[import] projectId / dataset env 미설정. skip.\n");
    return;
  }
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".ndjson"));
  if (files.length === 0) {
    process.stdout.write("[import] ndjson 없음. skip.\n");
    return;
  }
  // 모든 ndjson 을 임시 단일 파일로 모아 1회 import 호출.
  // spawn 비용 N → 1. 포스트 수 확장 시 효율.
  const tmpFile = join(POSTS_DIR, ".import-batch.ndjson");
  const lines = files.map((f) => readFileSync(join(POSTS_DIR, f), "utf8")).join("");
  writeFileSync(tmpFile, lines);
  try {
    process.stdout.write(`[import] ${files.length}개 문서 → dataset "${DATASET}"\n`);
    const r = spawnSync(
      "npx",
      [
        "sanity",
        "dataset",
        "import",
        tmpFile,
        DATASET,
        "--project",
        PROJECT_ID,
        "--token",
        IMPORT_TOKEN,
        "--replace",
      ],
      { stdio: "inherit" },
    );
    if (r.status !== 0) {
      throw new Error(`[import] sanity dataset import 실패 (${files.length}개 일괄)`);
    }
  } finally {
    try { unlinkSync(tmpFile); } catch { /* ignore */ }
  }
  process.stdout.write(`[import] ${files.length}개 문서 import 완료.\n`);
}

async function main() {
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    process.stderr.write("content/posts 에 .md 가 없습니다.\n");
    process.exit(1);
  }
  for (const f of files) await syncFile(f);
  await importToSanity();
}

main();