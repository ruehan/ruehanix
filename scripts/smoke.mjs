// ruehanix 단일 HTML 스모크 검증 (재현 가능한 센서).
// 빌드툴/테스트러너가 없는 프로토타입의 회귀 안전망.
//
// 실행:  npx playwright install chromium   # 최초 1회
//        node scripts/smoke.mjs
// 종료코드 0 = 통과, 1 = 실패. 콘솔 앱 에러가 있으면 실패 처리.
//
// 검증 시나리오 (docs 체크리스트와 동일):
//   1. 부팅 시퀀스가 끝나고 boot 오버레이가 사라진다
//   2. waybar / 데스크톱 위젯이 렌더된다
//   3. 워크스페이스 2로 전환하면 시드된 창들이 타일링된다
//   4. 런처를 열어 앱을 띄울 수 있다
//   5. 테마를 Light로 바꾸면 즉시 반영된다 (html.rh-light)
//   6. 실행 동안 콘솔 앱 에러 0 (Babel dev 경고 / favicon 404 는 무해로 제외)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8732;

const server = createServer(async (req, res) => {
  try {
    const path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const buf = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': path.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404).end('not found');
  }
});

const checks = [];
const ok = (name, cond) => { checks.push({ name, pass: !!cond }); };

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });

const appErrors = [];
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (t.includes('favicon')) return; // 무해
  appErrors.push(t);
});

try {
  await page.goto(`http://localhost:${PORT}/index.html`);

  // 1. 부팅 종료 (boot 오버레이의 'login:' 텍스트가 사라질 때까지)
  await page.getByText('login:').waitFor({ state: 'hidden', timeout: 8000 });
  ok('boot 완료', true);

  // 2. waybar 위젯 (data-testid로 안정 매칭)
  ok('waybar 런처 버튼', await page.getByTestId('launcher').isVisible());

  // 3. 워크스페이스 2 → 타일링
  await page.getByTestId('ws-2').click();
  await page.getByText('React 서버 컴포넌트', { exact: false }).first().waitFor({ timeout: 4000 });
  ok('ws2 타일링', true);

  // 4. 런처 → Foto 앱 열기
  await page.getByTestId('launcher').click();
  await page.getByText('사진', { exact: true }).waitFor({ timeout: 3000 }); // 런처 hint
  await page.getByText('Foto사진').click();
  await page.getByText('~/Pictures').waitFor({ timeout: 3000 });
  ok('런처에서 앱 오픈', true);

  // 5. Settings 열고 Light 모드
  await page.getByTestId('launcher').click();
  await page.getByText('Settings설정').click();
  await page.getByText('Light').click();
  await page.waitForFunction(() => document.documentElement.classList.contains('rh-light'), { timeout: 3000 });
  ok('Light 테마 전환', true);
} catch (e) {
  ok(`예외 없음: ${e.message}`, false);
}

ok('콘솔 앱 에러 0', appErrors.length === 0);
if (appErrors.length) console.error('앱 에러:', appErrors);

await browser.close();
await new Promise((r) => server.close(r));

let failed = 0;
for (const c of checks) {
  console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}`);
  if (!c.pass) failed++;
}
console.log(`\n${checks.length - failed}/${checks.length} 통과`);
process.exit(failed ? 1 : 0);
