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
    // YouTube 임베드(서드파티)의 네트워크/콘솔 노이즈는 우리 앱 에러가 아니다.
    if (/youtube|ytimg|googlevideo|gstatic|google\.com|doubleclick|jsapi/i.test(t)) return;
    appErrors.push(t);
  });
  page.on("pageerror", (e) => appErrors.push(String(e)));

  await page.goto(BASE);

  await page.getByText("login:").waitFor({ state: "hidden", timeout: 8000 });
  ok("boot 완료", true);

  ok("waybar 런처 버튼", await page.getByTestId("launcher").isVisible());

  await page.getByTestId("ws-2").click();
  await page.getByText("~/blog").first().waitFor({ timeout: 4000 }); // Files 사이드바(글 유무 무관)
  ok("ws2 타일링", true);

  await page.getByTestId("launcher").click();
  await page.getByText("Foto사진").click();
  // 사진 유무 무관(Sanity 소스): 사진이 있으면 ~/Pictures, 0개면 빈 상태 문구.
  await page.getByText(/~\/Pictures|사진이 없습니다/).first().waitFor({ timeout: 3000 });
  ok("런처에서 앱 오픈", true);

  await page.getByTestId("launcher").click();
  await page.getByText("Settings설정").click();
  await page.getByText("Light").click();
  await page.waitForFunction(() => document.documentElement.classList.contains("rh-light"), { timeout: 3000 });
  ok("Light 테마 전환", true);

  // 7. 데스크톱 독 — 항상 보이는 하단 독으로 앱을 연다 + 호버 시 이름 라벨
  ok("데스크톱 독 표시", await page.getByTestId("desktop-dock").isVisible());
  await page.getByTestId("ddock-terminal").hover();
  let labelShown = false;
  try {
    // opacity뿐 아니라 라벨이 실제로 화면 최상단에 보이는지(클리핑/가림 없음) 검사한다.
    // 라벨은 pointer-events:none이라 hit-test 동안만 임시로 auto로 바꿔 elementFromPoint로 확인.
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="ddock-terminal"] .rh-dock-label');
        if (!el || getComputedStyle(el).opacity !== "1") return false;
        const prev = el.style.pointerEvents;
        el.style.pointerEvents = "auto";
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.top < 0) {
          el.style.pointerEvents = prev;
          return false;
        }
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        el.style.pointerEvents = prev;
        return !!hit && el.contains(hit);
      },
      { timeout: 2000 },
    );
    labelShown = true;
  } catch {
    /* 라벨이 끝내 안 보임(클리핑/가림) */
  }
  ok("독 호버 이름 라벨", labelShown);
  await page.getByTestId("ddock-web").click();
  await page.getByText("https://ruehan.dev").first().waitFor({ timeout: 3000 });
  ok("데스크톱 독 앱 오픈", true);

  // 7.5 음악 플레이어 — 트랙 유무 무관(Sanity 소스). 트랙이 있으면 팝오버 컨트롤러를 검증한다.
  const hasMini = await page
    .getByTestId("miniplayer")
    .isVisible()
    .catch(() => false);
  if (hasMini) {
    await page.getByTestId("miniplayer").click();
    await page.getByTestId("music-popover").waitFor({ timeout: 3000 });
    ok("미니플레이어 클릭 → 팝오버 표시", true);
    // 팝오버 안 재생 버튼으로 재생 → NOW PLAYING (플레이리스트 "...재생" 항목과 구분 위해 exact)
    await page.getByTestId("music-popover").getByRole("button", { name: "재생", exact: true }).click();
    await page.getByTestId("music-popover").getByText("NOW PLAYING").waitFor({ timeout: 3000 });
    ok("팝오버 재생 → NOW PLAYING", true);
    // 아티스트 탭 전환(데이터 무관 — 정보 있으면 표시, 없으면 안내).
    await page.getByTestId("music-popover").getByRole("button", { name: "아티스트" }).click();
    await page.getByTestId("music-popover").getByRole("button", { name: "재생목록" }).waitFor({ timeout: 3000 });
    ok("아티스트 탭 전환", true);
    await page.keyboard.press("Escape");
    await page.getByTestId("music-popover").waitFor({ state: "hidden", timeout: 3000 });
    // 다른 앱으로 전환해도 미니플레이어(셸 상주)가 유지된다 — 재생 지속의 대용 신호.
    await page.getByTestId("ddock-terminal").click();
    await page.getByText("fastfetch").waitFor({ timeout: 3000 });
    ok("앱 전환 후 미니플레이어 유지", await page.getByTestId("mini-title").isVisible());
    // 정지로 되돌려 이후 시나리오에 영향 없게 한다.
    await page.getByTestId("miniplayer").click();
    await page.getByTestId("music-popover").getByRole("button", { name: "일시정지", exact: true }).click();
    await page.keyboard.press("Escape");
  } else {
    // Sanity에 곡이 0개면 미니플레이어가 숨겨진다(빈 상태). 회귀 아님.
    ok("음악 미니플레이어 숨김(Sanity 트랙 0)", true);
  }

  // 8. 모바일 모드 — 폭을 좁히면 하단 독이 뜨고, 독으로 앱을 풀스크린 전환
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("dock-terminal").click();
  await page.getByText("fastfetch").waitFor({ timeout: 3000 });
  ok("모바일 독 앱 전환", true);
  ok("모바일 하단 독 표시", await page.getByTestId("dock-files").isVisible());

  // 9. 런처 검색 필터 + 키보드 접근성
  await page.setViewportSize({ width: 1280, height: 820 });
  await page.getByTestId("launcher").click();
  await page.locator('input[aria-label="검색"]').fill("ter");
  ok("런처 검색 필터", (await page.locator(".rh-launch-item").count()) === 1);
  ok("a11y 키보드 활성화(role/tabindex)", (await page.getByTestId("launcher").getAttribute("role")) === "button" && (await page.getByTestId("launcher").getAttribute("tabindex")) === "0");
  await page.keyboard.press("Escape");

  // 10. 부팅 세션 1회 — 재로드 시 부팅 애니메이션 건너뜀
  await page.reload();
  await page.waitForTimeout(800);
  const reBoot = await page
    .getByText("login:")
    .isVisible()
    .catch(() => false);
  ok("부팅 세션 1회(재로드 스킵)", reBoot === false);
  // 부팅 스킵 직후 시계가 즉시 실제 시각으로 시드(외부 스토어). "00:00"에 머물면 회귀.
  const clockText = await page.evaluate(() => {
    const m = document.body.innerText.match(/\b\d\d:\d\d\b/);
    return m ? m[0] : "";
  });
  ok("재로드 후 시계 즉시 시드(00:00 아님)", clockText !== "" && clockText !== "00:00");

  // 11. 글 목록 라우트(/posts) + sitemap (글 유무 무관)
  await page.goto(`${BASE}/posts`);
  await page.getByRole("heading", { name: "모든 글" }).waitFor({ timeout: 3000 });
  ok("글 목록 라우트 렌더", true);
  const sm = await page.goto(`${BASE}/sitemap.xml`);
  const smText = (await sm.text()) || "";
  ok("sitemap 정적 경로 포함", smText.includes("/posts"));

  // 12. UI 설정 영속화 — localStorage 설정이 재로드 후 복원
  await page.goto(BASE); // 직전 시나리오가 sitemap.xml에 있으므로 앱으로 복귀
  await page.evaluate(() => {
    localStorage.setItem("rh-ui", JSON.stringify({ mode: "light", accent: "#a6e3a1", gap: 20, rounded: false, glow: false, transp: false }));
  });
  await page.reload();
  await page.waitForTimeout(800);
  const restored = await page.evaluate(() => ({
    light: document.documentElement.classList.contains("rh-light"),
    accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
  }));
  ok("UI 설정 재접속 복원", restored.light === true && restored.accent === "#40a02b");

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
