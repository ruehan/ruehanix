#!/usr/bin/env node
// frontmatter 파서 드프트 진단. .ts 정본과 .mjs 인라인이 동일 입력에서 같은 결과를
// 내는지 매 release 전 확인한다.
//
// 실행:  npm run sync-posts:check
// 종료:  0 = 일치, 1 = 드프트 발견, 2 = .ts 파서 로드 실패(Node strip-types 부재)
//
// .ts 직접 import 는 Node 22 의 --experimental-strip-types 로 옵트인된다.
// (npm script 의 node 옵션 참조) — 외부 의존성 추가를 피한다.

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, "..", "content", "posts");

let tsParse;
try {
  const mod = await import("../lib/posts/frontmatter.ts");
  tsParse = mod.parsePostFrontmatter;
} catch (e) {
  process.stderr.write(
    "[check-drift] .ts 파서를 로드하지 못했습니다. `node --experimental-strip-types` 옵션으로 실행하세요.\n" +
      `  err: ${e.message}\n`,
  );
  process.exit(2);
}

function inlineParse(input) {
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

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
if (files.length === 0) {
  process.stderr.write("content/posts 에 .md 가 없습니다.\n");
  process.exit(0);
}

let drifts = 0;
for (const f of files) {
  const src = readFileSync(join(POSTS_DIR, f), "utf8");
  const a = tsParse(src);
  const b = inlineParse(src);
  if (!eq(a, b)) {
    drifts++;
    process.stderr.write(`[drift] ${f}\n`);
    process.stderr.write(`  ts:    ${JSON.stringify(a)}\n`);
    process.stderr.write(`  inline:${JSON.stringify(b)}\n`);
  }
}

if (drifts > 0) {
  process.stderr.write(`\n[check-drift] ${drifts} 파일에서 드프트 발견. 두 구현을 동기화하세요.\n`);
  process.exit(1);
}
process.stdout.write(`[check-drift] ${files.length} 파일 일치. ✓\n`);