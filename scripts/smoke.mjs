// ruehanix Next.js 스모크 검증 (재현 가능한 센서).
// vitest 단위 테스트(verify.sh)를 보완하는 브라우저 동작 검증.
//
// 실행:  npm run build                      # 최초/변경 후
//        npx playwright install chromium    # 최초 1회
//        npm run smoke
// 종료코드 0 = 통과, 1 = 실패. 콘솔 앱 에러가 있으면 실패 처리.
//
// 검증 시나리오:
//   1. 부팅 시퀀스가 끝나고 boot 오버레이가 사라진다
//   2. waybar 런처 버튼이 렌더된다
//   3. 워크스페이스 2로 전환하면 시드된 창들이 타일링된다
//   4. 런처를 열어 앱(Foto)을 띄울 수 있다
//   5. 테마를 Light로 바꾸면 즉시 반영된다 (html.rh-light)
//   6. 실행 동안 콘솔 앱 에러 0

import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 8733;
const BASE = `http://localhost:${PORT}`;

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
  env: process.env,
});

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("next start 서버가 30초 안에 뜨지 않음");
};

const checks = [];
const ok = (name, cond) => checks.push({ name, pass: !!cond });

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });

  const appErrors = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("favicon")) return;
    appErrors.push(t);
  });
  page.on("pageerror", (e) => appErrors.push(String(e)));

  await page.goto(BASE);

  await page.getByText("login:").waitFor({ state: "hidden", timeout: 8000 });
  ok("boot 완료", true);

  ok("waybar 런처 버튼", await page.getByTestId("launcher").isVisible());

  await page.getByTestId("ws-2").click();
  await page.getByText("React 서버 컴포넌트", { exact: false }).first().waitFor({ timeout: 4000 });
  ok("ws2 타일링", true);

  await page.getByTestId("launcher").click();
  await page.getByText("Foto사진").click();
  await page.getByText("~/Pictures").waitFor({ timeout: 3000 });
  ok("런처에서 앱 오픈", true);

  await page.getByTestId("launcher").click();
  await page.getByText("Settings설정").click();
  await page.getByText("Light").click();
  await page.waitForFunction(() => document.documentElement.classList.contains("rh-light"), { timeout: 3000 });
  ok("Light 테마 전환", true);

  // 7. 데스크톱 독 — 항상 보이는 하단 독으로 앱을 연다
  ok("데스크톱 독 표시", await page.getByTestId("desktop-dock").isVisible());
  await page.getByTestId("ddock-web").click();
  await page.getByText("https://ruehan.dev").first().waitFor({ timeout: 3000 });
  ok("데스크톱 독 앱 오픈", true);

  // 8. 모바일 모드 — 폭을 좁히면 하단 독이 뜨고, 독으로 앱을 풀스크린 전환
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("dock-terminal").click();
  await page.getByText("fastfetch").waitFor({ timeout: 3000 });
  ok("모바일 독 앱 전환", true);
  ok("모바일 하단 독 표시", await page.getByTestId("dock-files").isVisible());

  ok("콘솔 앱 에러 0", appErrors.length === 0);
  if (appErrors.length) console.error("앱 에러:", appErrors);
} catch (e) {
  ok(`예외 없음: ${e.message}`, false);
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}

let failed = 0;
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.name}`);
  if (!c.pass) failed++;
}
console.log(`\n${checks.length - failed}/${checks.length} 통과`);
process.exit(failed ? 1 : 0);
