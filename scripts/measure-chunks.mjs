#!/usr/bin/env node
// 클라이언트 chunk 사이즈 측정 + 회귀 감지.
// ADR 0042 — 빌드 후 호출, gzip 합산 출력 + 임계치 초과 시 exit 1.
//
// 실행:  npm run build
//        npm run measure-chunks
// 종료:   0 = 통과, 1 = 임계치 초과, 2 = .next 없음
//
// 임계치: app-only gzip 3.2MB (2026-07-15 측정 2.98MB + 7% 여유).
//         — 다음 큰 작업에서 회귀 시 즉시 감지.
//
// 측정 방식: .next/static/chunks/*.js 합산.
//   - framework 2 chunks (2xil8, 2fznq) 제외 → app-only 산정.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHUNKS_DIR = join(__dirname, "..", ".next", "static", "chunks");
const APP_GZIP_LIMIT = 3.2 * 1024 * 1024; // 3.2 MB
const FRAMEWORK_PATTERNS = [/2xil8rtu_o0jp/, /2fznqtkmnr52z/]; // ADR 0042

if (!existsSync(CHUNKS_DIR)) {
  process.stderr.write(
    `[measure] .next/static/chunks 없음. 먼저 \`npm run build\` 실행.\n`,
  );
  process.exit(2);
}

const files = readdirSync(CHUNKS_DIR).filter((f) => f.endsWith(".js"));
if (files.length === 0) {
  process.stderr.write("[measure] chunk 파일 없음. 빌드 확인.\n");
  process.exit(2);
}

let totalRaw = 0;
let totalGzip = 0;
let appRaw = 0;
let appGzip = 0;
let frameworkRaw = 0;
let frameworkGzip = 0;

for (const f of files) {
  const buf = readFileSync(join(CHUNKS_DIR, f));
  const gz = gzipSync(buf, { level: 6 });
  const isFramework = FRAMEWORK_PATTERNS.some((p) => p.test(f));
  totalRaw += buf.length;
  totalGzip += gz.length;
  if (isFramework) {
    frameworkRaw += buf.length;
    frameworkGzip += gz.length;
  } else {
    appRaw += buf.length;
    appGzip += gz.length;
  }
}

const fmt = (b) => `${(b / 1024).toFixed(1)} KB (${(b / 1024 / 1024).toFixed(2)} MB)`;
process.stdout.write(`[measure] client chunks\n`);
process.stdout.write(`  files:     ${files.length}\n`);
process.stdout.write(`  total:     ${fmt(totalRaw)} raw, ${fmt(totalGzip)} gzip\n`);
process.stdout.write(`  framework: ${fmt(frameworkRaw)} raw, ${fmt(frameworkGzip)} gzip\n`);
process.stdout.write(`  app-only:  ${fmt(appRaw)} raw, ${fmt(appGzip)} gzip\n`);
process.stdout.write(`  limit:     ${fmt(APP_GZIP_LIMIT)} gzip\n`);

if (appGzip > APP_GZIP_LIMIT) {
  process.stderr.write(
    `\n[measure] ❌ app gzip ${fmt(appGzip)} > limit ${fmt(APP_GZIP_LIMIT)}. 회귀.\n`,
  );
  process.exit(1);
}
process.stdout.write(`\n[measure] ✓ app gzip 한도 내.\n`);