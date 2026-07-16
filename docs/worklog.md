## 2026-07-16 — md → Portable Text 변환기 교체 (ADR 0054)
- 브랜치: feat/post-md-pt
- 한 일: `@portabletext/markdown` (Sanity 공식, v1.4.4) 도입. 줄 단위 파싱 직접 구현을 라이브러리로 교체. `code` → `codeBlock` rename, `horizontal-rule` → `block style:hr` (PostBody handler 추가), `image` 는 raw `{src, alt}` 그대로 (PostBody 가 분기 처리). 표 (table) 미처리 — 차기 과제.
- 검증: typecheck 0 / eslint 0 / vitest 281 / build 13/13 / smoke 24/24.
- 리뷰: 통과 1라운드(자체) — 상세: docs/reviews/2026-07-16-post-md-pt.md
- 가정: `PostBody.tsx` 의 image handler 가 원래 `asset` 만 처리 — md 이미지(`{src, alt}`) 통째로 null 렌더되던 회귀(P0)를 라운드 1 리뷰에서 발견. `v.src` 분기 추가 + 테스트 image 분기 강화.
- 후속 작업: table 처리. `---` 다음 머리말 충돌 방지.
- 관련 결정: docs/decisions/0054-md-to-portable-text.md

# 작업 로그

## 2026-07-16 — Sanity fetch 제거, 블로그 글은 md 직접 (ADR 0053)
- 브랜치: feat/posts-from-md
- 한 일: `lib/posts/markdown.ts` (toPortableText + buildPost, 11→13 케이스 TDD), `lib/posts/queries.ts` (fs 직접 fetch), `lib/posts/normalize.ts` 정리(removePost/SanityPostDoc), `lib/posts/types.ts` (SanityPostDoc 제거), `lib/posts/normalize.test.ts` 정리. `CatKey` + `CATS` + `theme` + `VALID_CATEGORIES` 에 "blog" 추가. 5개 routes 정적 생성(generateStaticParams). `lib/ruehanix/commands.test.ts`/useRuehanix.ts 에서 `shell:sync-posts` 제거.
- 제거: scripts/sync-posts.mjs, scripts/check-frontmatter-drift.mjs, app/api/revalidate/route.ts, sanity/schemaTypes/postType.ts, package.json sync-posts* scripts. .gitignore: content/posts/*.ndjson.
- 검증: typecheck 0 / eslint 0 / vitest 287 / build 11/11 / smoke 24/24.
- 리뷰: 통과 2라운드(R1 P1·P3 → 반영 → R2 P2·P3·HARNESS → 반영) — 상세: docs/reviews/2026-07-16-posts-from-md.md
- 가정: `lib/posts/normalize.ts` 의 `formatDate` 만 유지. `SanityPostDoc` 와 `normalizePost` 는 post 전용으로 Sanity fetch 제거 후 dead code. `published: 'blog'` 카테고리 의도 보존(라운드 1 P1 fix).
- 후속 작업: Sanity dataset 옛 post doc 정리(Studio 외 안 보임). `.env.local` `SANITY_IMPORT_TOKEN` 제거. `blog` 카테고리 단위 테스트 보강(라운드 2 P3).
- 관련 결정: docs/decisions/0053-posts-from-md.md

## 2026-07-15 — ux-floating G2 (WIP 단계 commit, ADR 0040)
- 브랜치: feat/ux-floating-g2
- 한 일: stash `wip:feat/ux-floating G2 carry-over` 복원 + main 의 visible-기반 children mount(ADR 0038) 와 Stash 의 floating 토글·드래그·리사이즈 핸들 통합. `FloatRect` 타입·WindowState.floating·toggleFloating/setFloatRect stub. viewModel 의 6인자 visibleIds 호출 → 5인자 fallback (WIP 부채 정리). build 가능 상태로 WIP commit. G2 실동작(드래그·리사이즈·storage v2·tiles 적용) 은 다음 세션.
- 검증: typecheck 0 / eslint 0 / vitest 33 files / 245 tests / build 11/11 / smoke 24/24.
- 리뷰: 단일 세션 G2 전체 완성 위험 → 사용자와 "WIP commit + 다음 세션" 합의. reviewer 호출 생략(self-verify). — 상세: docs/reviews/2026-07-15-ux-floating-g2-wip.md
- 가정: 단일 세션에 G2 전체 완성(드래그·리사이즈·storage v2·tiles) 은 깊이 + 시간 둘 다 부족. WIP commit 으로 보존 후 다음 세션 완성. G2 실동작은 stub — UI 표시만 가능.
- 후속 작업 (다음 세션): useRuehanix dragRef float case 동작. viewModel tiles floating 우선. layout-storage v2 bump. toggleFloating/setFloatRect 실동작 + 회귀 테스트. 모바일 비활성. 키바인딩. ADR 0025 신설.
- 가정: `git stash drop stash@{0}` 는 commit 으로 보존된 상태에서 사용자 명시적 요청 시 진행.
- 관련 결정: docs/decisions/0040-ux-floating-g2-wip.md

## 2026-07-15 — sync-posts Sanity dataset 자동 import (ADR 0039)
- 브랜치: feat/sanity-auto-import
- 한 일: `scripts/sync-posts.mjs` 의 `main()` 끝에 `importToSanity()` 추가. 모든 ndjson 순회하며 `npx sanity dataset import` 호출. `--replace` (createOrReplace) 모드로 동일 _id upsert — 다른 doc (photo/artist/album) 영향 X. `SANITY_IMPORT_TOKEN` env 사용. 미설정 시 ndjson 만 + 경고. `--no-import` / `--dry-run` 플래그로 import skip. 실패 시 throw + exit 1. 동적 import → 정적. 데드 코드(tmpDir/mkdirSync) 제거. ADR 의 결정 섹션 모순 정정.
- 검증: typecheck 0 / eslint 0 / vitest 33 files / 245 tests / build 11/11 / smoke 24/24. --no-import dry-run 2 파일 OK.
- 리뷰: 통과 2라운드(R1 P1 ADR 모순·P1 데드 코드·P2 동적 import → 반영 → R2 P1 결정 섹션 잔존 모순·P2 docs → 반영) — 상세: docs/reviews/2026-07-15-sanity-auto-import.md
- 가정: --replace 가 createOrReplace 로 동일 _id 만 덮어쓰는 의미(Sanity CLI `@sanity/import` 소스 확인). 누락 정책 X(같은 slug 재실행은 upsert). SANITY_IMPORT_TOKEN 미설정은 non-fatal(ndjson 만 생성).
- 후속 작업: N회 spawn → 1회 통합(포스트 수 확장). importToSanity 단위 테스트. CI sync-posts:verify 단계.
- 관련 결정: docs/decisions/0039-sanity-auto-import.md

## 2026-07-15 — Win visible-기반 children mount (ADR 0038)
- 브랜치: feat/win-visible-mount
- 한 일: `lib/ruehanix/win-visibility.ts` — `isHidden(style)` 헬퍼 (`display: "none"` 만). `Win` 컴포넌트 inline 수정 — hidden 시 chrome+children 미렌더, outer div + aria-hidden 만. visible 일 때만 mount. dynamic loader 가 chunk 캐시하므로 minimize/restore 시 즉시 재로드. `preserveLocalState` prop — FotoApp 한 곳만 true 로 ws 전환·minimize·close 사이 local state 보호. ADR 0038.
- 검증: typecheck 0 / eslint 0 / vitest 33 files / 245 tests (isHidden 4/4 신규) / build 11/11 / smoke 24/24.
- 리뷰: 통과 2라운드(R1 P1-2 FotoApp 회귀·P1 사실 오류 → 반영 → R2 P1 커밋 메시지 정정·P1 close 케이스 ADR 보강 → 반영) — 상세: docs/reviews/2026-07-15-win-visible-mount.md
- 가정: 단순 visible-기반 게이트 채택(useState/useRef/useSyncExternalStore 모두 React 19 lint 회피 불가). minimize 와 ws 전환은 동일하게 "hidden" — preserve 가 양쪽 모두 cover. close 케이스도 preserve — FotoApp 는 "탐색 흐름" 보존, fresh state 원하면 명시적 backToFolders/ESC.
- 후속 작업: Win 컴포넌트 단위 테스트. dynamic 3개 chunk 즉시 재로드 실제 비용 측정.
- 관련 결정: docs/decisions/0038-win-visible-mount.md

## 2026-07-14 — 사진 폴더 뷰 + 우측 info 패널 + lightbox (ADR 0037)
- 브랜치: feat/photo-folder-view
- 한 일: Sanity photoType 에 folder (string, optional) + description (text, 1줄) 필드. GROQ 에 folder/description 추가. Photo 타입 + normalize 확장. `lib/photos/group-by-folder.ts` 순수 함수 — 명시 folder 사전순(localeCompare "ko") + UNCATEGORIZED 항상 마지막. FotoApp 2-depth (folders grid → folder view) — 우측 info 패널 + lightbox (←/→/ESC). 모바일 분기(`vm.isMobile`): column 스택 + 그리드 2-col + info 하단 100%. 모바일 lightbox 진입은 info 패널의 "크게 보기" 버튼. view derive — useEffect+setView 의 setState-in-effect cascade 회피(React 19 lint). normalize 회귀 테스트 4 케이스 추가.
- 검증: typecheck 0 / eslint 0 / vitest 32 files / 241 tests (group-by-folder 5/5 + normalize 4/4 신규) / build 11/11 / smoke 24/24.
- 리뷰: 통과 2라운드(R1 수정필요 P1 모바일 레이아웃·P1 모바일 lightbox 진입·P2 view reset·P2 normalize 회귀·P3 EOF/lightbox desc → 반영 → R2 수정필요 P2 docs 3건 → 반영) — 상세: docs/reviews/2026-07-14-photo-folder-view.md
- 가정: folder 자유 입력 채택(predefined list 강제 안 함). 미분류 폴더 자동 모음(기존 데이터 호환). next/image 그대로(fill+priority). lightbox title/description/hint 모두 image container 내부 하단 오버레이(viewport 밖 잘림 회피).
- 후속 작업: 폴더 진입 키보드(← 폴더, Enter). 슬라이드쇼 자동 진행. subfolder(2단계). P3 "크게 보기" 버튼 모바일 한정 + `?? 0` 정리.
- 관련 결정: docs/decisions/0037-photo-folder-view.md

## 2026-07-14 — 창/워크스페이스 layout 영속화 (ADR 0036)
- 브랜치: feat/window-state-persistence
- 한 일: `lib/ruehanix/layout-storage.ts` — localStorage `rh-layout` 키로 ws/open/order/ratios/minimized/maximized 슬라이스 영속. schema version 1 + DEFAULT 폴백 + 6개 필드 validator (APP_KEYS 화이트리스트, ws 1..6, finite 강제). `useRuehanix` post-mount useEffect 1회 read+setSt + 변경 시 200ms debounce write. layoutSavedRef 로 첫 redundant skip. SSR safe (typeof window 가드 + read try/catch).
- 검증: typecheck 0 / eslint 0 / vitest 31 files / 232 tests (layout-storage 12/12) / build 11/11 / smoke 24/24.
- 리뷰: 통과 2라운드(R1 수정필요 P1 SSR mismatch·P1 layoutSavedRef·P2 parser·P2 ws·P3 ADR 보강 → 반영 → R2 수정필요 P2 read try/catch → 반영) — 상세: docs/reviews/2026-07-14-window-state-persistence.md
- 가정: floating G2 미머지 — 별도 슬라이스 + version 2 bump 정책. focused 슬라이스 미저장(ephemeral). v1→v2 migration 시 전체 DEFAULT(사용자 layout 손실, 안전 우선). read+write 모두 try/catch (Safari 프라이빗·iframe sandboxed 안전).
- 후속 작업: G2 floating 슬라이스 통합. 다중 디바이스 sync.
- 관련 결정: docs/decisions/0036-window-state-persistence.md

## 2026-07-14 — CodeBlockClient shiki 폴백 (ADR 0035)
- 브랜치: feat/codeblock-client-fallback
- 한 일: `components/posts/CodeBlockClient.tsx` 신설. PostBody 의 codeBlock renderer 위임. `highlightedCode` 가 있으면 그대로 주입, 없으면 useEffect + dynamic import shiki 로 lazy highlight. SSR 시 plain → hydration 후 color. PostBody 자체는 server component 유지. 3 케이스 테스트(있다 / 없다 / 라벨+복사 버튼).
- 검증: typecheck 0 / eslint 0 / vitest 28 files / 217 tests / build 11/11 / smoke 24/24.
- 리뷰: 통과 1라운드(self-review) — 상세: docs/reviews/2026-07-14-codeblock-client-fallback.md
- 가정: shiki dynamic import 가 첫 폴백 시점만 chunk 다운로드. singleton 재사용. SSR ↔ hydration 사이 시각적 미세 flicker (수십 ms) 는 의도된 trade-off.
- 후속 작업: Sanity dataset auto import. Studio publish 시 highlightedCode 자동 생성 plugin.
- 관련 결정: docs/decisions/0035-codeblock-client-fallback.md

## 2026-07-14 — shiki 코드 하이라이트 (ADR 0034)
- 브랜치: feat/code-highlight
- 한 일: 빌드 시점(sync-posts.mjs) 에서 shiki 듀얼 테마 HTML 생성 → codeBlock.highlightedCode 필드. PostBody 는 dangerouslySetInnerHTML 로 주입만 — 클라이언트 JS 0. 테마: catppuccin mocha(다크) + latte(라이트). globals.css 의 `.rh-codeblock` + `html.rh-light` 로 CSS 변수 토글. 언어 라벨 상단 + `CodeCopyButton` (작은 client island, navigator.clipboard). lib/posts/highlight.ts (highlightCode 순수 + 3 케이스 테스트).
- 검증: typecheck 0 / eslint 0 / vitest 28 files / 214 tests (highlightCode 3/3 신규) / build 11/11 / smoke 24/24. 로컬 `npm run sync-posts` 2 파일 재생성(highlightedCode 포함). `sync-posts:check` 2 파일 일치 ✓.
- 리뷰: 통과 1라운드(self-review) — 상세: docs/reviews/2026-07-14-shiki-code-highlight.md
- 가정: PostBody 가 client context(ReaderApp 자식)라 async 못 함 → 빌드 시점 분리. shiki 가 escape 한 HTML 만 주입 — XSS 안전. `prefers-color-scheme` 자동 토글은 사이트 정책(html.rh-light 명시) 우선이므로 미반영.
- 후속 작업: shiki grammar lazy load(24개 pre-load 적정, 추가 시). 줄 번호는 사용자 요청 시.
- 관련 결정: docs/decisions/0034-shiki-code-highlight.md

## 2026-07-14 — 셸 콘텐츠 앱 3개 lazy 분리 (ADR 0033)
- 브랜치: feat/app-dynamic-import
- 한 일: `components/ruehanix/RuehanixShell.tsx` — ReaderApp·MusicApp·SettingsApp 3개를 `next/dynamic` + `ssr:false` 로 lazy 분리. 작은 6개(About/Files/Foto/Hotlap/Terminal/Web) 정적 유지. `apps.tsx` 배럴 그대로.
- 검증: typecheck 0 / eslint 0 / vitest 28 files / 214 tests / build 11/11 / smoke 24/24.
- 리뷰: 통과 3라운드(R1 수정필요 P1-1 동적 5→3 좁힘·P1-2 사이즈 영향 실측치 교체 → 반영 → R2 수정필요 P2 magnitude 재정정(+47KB→+1.6KB/+11.7KB) + P3 worklog/review 부재·MusicApp 표현 → 반영 → R3 통과, docs-only 변경, 신규 결함 없음) — 상세: docs/reviews/2026-07-14-app-dynamic-import.md
- 가정: 진정한 초기 전송량 감소는 아님 — Turbopack이 3앱 chunk 도 `index.html` 의 `<script>` 에 포함, 9개 `<Win>` 항상 마운트로 dynamic wrapper 가 사실상 즉시 마운트. chunk 그래프 분리·manifest 생성만. 진정한 lazy 효과는 후속 visible-기반 lazy mount 에서 실현.
- 후속 작업: `Win` children `visibleIds` 기반 조건부 마운트(별도 ADR). 9개 전부 dynamic 일관성 검토.
- 관련 결정: docs/decisions/0033-app-dynamic-import.md

## 2026-07-14 — frontmatter 파서 드프트 진단 (ADR 0032)
- 브랜치: feat/frontmatter-drift-check
- 한 일: `scripts/check-frontmatter-drift.mjs` 신설 — `.ts` 정본(`lib/posts/frontmatter.ts`)과 `.mjs` 인라인(`scripts/sync-posts.mjs`)을 동일 md 에서 호출해 JSON 비교. 차이 시 파일별 diff + exit 1. `npm run sync-posts:check`. CI 의 Build 다음 step 으로 추가해 PR/푸시마다 자동 차단. .ts import 는 Node 22 `--experimental-strip-types` 로 옵트인(외부 의존성 0).
- 검증: vitest 28 files / 214 tests 통과. 로컬 `sync-posts:check` — `2 파일 일치. ✓`.
- 리뷰: 통과 1라운드(self-review, 작은 변경) — 상세: docs/reviews/2026-07-14-frontmatter-drift-check.md
- 가정: Node 22 의 experimental strip-types 경고([MODULE_TYPELESS_PACKAGE_JSON])는 무해. 비교는 JSON.stringify 동등성 — 현 시점 두 파서가 같은 키 순서로 생성하므로 OK.
- 후속 작업: `package.json` `type: "module"` 도입 검토(경고 제거), 키 순서 정규화 비교로 강화.
- 관련 결정: docs/decisions/0032-frontmatter-drift-check.md

## 2026-07-14 — 잔여 4개 작업 묶음 (3·4·5·6)
- 브랜치: (작업별 feat-a11y-tests / feat-sc-cleanup / feat-readme-sync-posts / feat-perf-dynamic-image, 모두 main 머지 완료)
- 한 일: 4 작업을 한 세션에서 차례로 수행.
  - **3번 deps** — `styled-components` 미사용 0건 확인 후 deps 제거(코드 변경 0). lockfile 의 peer 패키지들 동시 정리. ADR 0029.
  - **4번 a11y 테스트** — `eslint-config-next/core-web-vitals` 가 jsx-a11y 권장 이미 활성(lint 0 깨끗). 보강 가치 있는 것은 컴포넌트 스모크. `TerminalApp.test.tsx`·`AboutApp.test.tsx` 각 2 케이스 추가 — vm 의존 0 이라 가장 단순한 회귀 베이스.
  - **5번 README + sync-posts** — `lib/posts/frontmatter.ts`(정본, 4 테스트) + `scripts/sync-posts.mjs`(frontmatter 자동 인식, Sanity Portable Text NDJSON 일괄 변환) + `npm run sync-posts` + `README.md`(quick start·폴더·콘텐츠 운영·CI·라이선스). 기존 `daily-md-local-standup.ndjson` 재생성 + `ruehanix-desktop-blog.ndjson` 신규. ADR 0030.
  - **6번 perf** — `next.config.mjs` 에 `cdn.sanity.io` remotePatterns 추가 + FotoApp 그리드 `<img>` → `next/image fill` + `sizes` + YouTubeEngine을 `next/dynamic` `ssr:false` 로 lazy 분리. ADR 0031.
- 검증: typecheck 0 / eslint 0 / vitest 28 files / 214 tests / build 11/11 / smoke 24/24.
- 리뷰: 통과 1 통합 라운드(라운드 3·6 자체 통과, 라운드 4·5·6 P3 일부 즉시 반영 — setupFile 추출·README NDJSON 정책 1줄·ADR 0031 문구 좁힘) — 상세: docs/reviews/2026-07-14-remix-3-6.md
- 가정: styled-components 결정은 거의 명백(사용 0)이라 reviewer self-merge. sync-posts.mjs 의 frontmatter 파서는 .ts 직접 import 불가로 인라인(드프트 위험 — 후속 작업에서 진단 모드 또는 gray-matter 검토). MusicApp 작은 아바타는 next/image 변환 가성비 적음(22~42px). YouTubeEngine lazy 의 "비용 0" 은 트랙 0개일 때만 진실 — ADR 표현 수정.
- 후속 작업: frontmatter 파서 드프트 메커니즘(옵션: sync-posts 자체 진단 모드). README 공개 후 유지보수. 콘텐츠 자동 운영 워크플로 점검.
- 관련 결정: docs/decisions/0029·0030·0031

## 2026-07-14 — CI 워크플로 + Node v22 고정
- 브랜치: feat/ci-workflow
- 한 일: `.github/workflows/ci.yml` 추가 — PR·main 푸시 트리거, 같은 ref 중복 실행 cancel-in-progress, Node 22 (`.nvmrc` 잠금 + actions/setup-node node-version-file), npm 캐시, typecheck·lint·test·build 4 센서. 잡 권한은 least-privilege (`contents: read`). build 시 `NEXT_TELEMETRY_DISABLED=1`. `.nvmrc` 로 로컬·CI 의 Node 버전 일치.
- 검증: typecheck 0 / eslint 0 / vitest 206/206 / build 11/11 / smoke 24/24. CI yaml 스크립트명 = package.json 스크립트명 일치 → verify.sh 와 의미 동치. 푸시 후 GitHub Actions 첫 실행으로 실제 게이트 동작 확인 예정.
- 리뷰: 통과 1라운드(P3 trailing newline·permissions 누락·ADR 후보 → 같은 커밋에서 즉시 반영) — 상세: docs/reviews/2026-07-14-ci-workflow.md
- 가정: smoke(playwright chromium) 는 본 잡에서 제외. 시간·리소스 비용 vs 라운드 속도 트레이드오프. 별도 야간/수동 잡 도입은 차기 작업. ADR 0028.
- 관련 결정: docs/decisions/0028-smoke-out-of-ci.md

## 2026-07-14 — apps.tsx 분리 + AppErrorBoundary + 컴포넌트 테스트 인프라
- 브랜치: feat/apps-split-boundary
- 한 일: 컴포넌트 단위 테스트 인프라 도입(happy-dom + RTL, vitest `node` 기본 유지 + 파일 상단 `// @vitest-environment happy-dom` 오버라이드 패턴 — ADR 0027). `components/ruehanix/AppErrorBoundary.tsx` 추가 — class component, `componentDidCatch` 시 notify + console.error, fallback UI role=alert + alertRef focus 마이그레이션(tabIndex=-1 + outline:none), onRetry prop 지원. `RuehanixShell.tsx` 의 Win body 를 `<AppErrorBoundary appName={meta.name}>` 으로 래핑 → 단일 앱 throw 가 셸 전체 백지로 번지지 않게. `apps.tsx` 1042→13줄, 9개 앱 파일로 분리(AboutApp/FilesApp/FotoApp/HotlapApp/MusicApp/ReaderApp/SettingsApp/TerminalApp/WebApp), 13개 단일 앱 헬퍼는 각 앱 파일 안에 머무름, EmptyPosts 는 Files/Web 두 곳 공유라 별도 추출, apps.tsx 는 배럴(재수출 only)로 환원.
- 검증: typecheck 0 / eslint 0 / vitest 25 files / 206 tests (AppErrorBoundary 7 신규 — 정상·throw·retry·onRetry·onRetry 미지정·연속 throw·null children) / next build 성공 / smoke 24/24.
- 리뷰: 통과 2라운드(R1 수정필요 P1 CSS 변수 오타·P2 focus 부재·P2 retry 순서·P3 테스트 보강·P3 배럴 주석 → 반영 → R2 통과 + 신규 결함 없음, 보강 제안 2건은 차기 작업용) — 상세: docs/reviews/2026-07-14-apps-split-boundary.md
- 가정: EmptyPosts 는 2곳 공유라 단일 앱 헬퍼 규칙에서 합리적 이탈(별도 모듈로 추출). onRetry 미전달 경로는 현재 Win 통합에서 사용처 없음(시맨틱만 보장). happy-dom + RTL 채택 — jsdom 대비 가볍고 React 19 호환. ADR 0027.
- 관련 결정: docs/decisions/0027-component-test-infra.md

## 2026-06-30 — 창 자유도 G1 — ws/타일 제어 + 기본 빈 워크스페이스
- 브랜치: feat/ux-window-control
- 한 일: 창 자유도 개선 3사이클 중 G1. 기본 빈 워크스페이스(INITIAL.open/order 비움 — Hyprland 첫 로그인처럼
  깨끗한 시작). moveToWs(Super+Shift+1-6 — 포커스 창을 대상 ws로 이동+따라가기). moveTile(Super+Shift+←/→ —
  order 상 인접 타일과 자리바꿈, 1D dwindle 근사). 순수 전환 lib/ruehanix/windowState.ts(+moveToWs/moveTile)
  + 테스트. KEYBINDINGS 갱신. 라운드1에서 Super+Shift+1-6 가 Shift+digit=e.key '!@#' 로 안 되던 결함을
  e.code(Digit1-6) 기반 판정으로 수정, moveToWs maximized 정리(gotoWs와 대칭)+open 가드.
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 199/199 — windowState 25), build 성공, smoke 24/24.
- 리뷰: 통과 2라운드(R1 수정필요 P1 단축키 결함·P2 maximized 발산·P3 가드 → 반영 → R2 통과) —
  상세: docs/reviews/2026-06-30-window-control-g1.md
- 가정: moveToWs는 ws 전환+따라가기, moveTile은 1D 근사(공간 up/down는 백로그), e.code 기반 숫자키(국제화 견고),
  기본 빈 ws. windowState 헤더 주석으로 1D 한계 명시.
- 관련 결정: (ADR 신규 없음 — windowState 헤더/커밋으로 의도 명시)

## 2026-06-30 — 백로그 소화(B) + 상태 리팩터(D)
- 브랜치: feat/ux-backlog
- 한 일: B — 런처 키보드 탐색(Launcher 컴포넌트 추출, ↑↓ 순환/Enter 활성 오픈/활성 스크롤/aria-activedescendant),
  DesktopDock 실행 점(open)+최소화 흐림, Super+F 최대화 단축키, KEYBINDINGS·데스크톱 위젯 힌트 갱신.
  D — 창 상태전환(openApp/close/minimize/toggleMaximize/gotoWs/openPostReader)을 lib/ruehanix/windowState.ts
  순수 함수로 추출 + 17 테스트. useRuehanix가 위임. 회귀 방어(G4 openPost 가시성·minimize/close maximized·
  gotoWs ws밖 maximized). 라운드1에서 gotoWs/close의 가시 창-only 포커스를 의도적 버그 수정으로 인정+엣지.
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 191/191 — windowState 17 신규), build 성공, smoke 23/23.
- 리뷰: 통과 2라운드(R1 수정필요 P2 gotoWs/close 발산 인정+엣지·P3 dead code/주석/힌트 → 반영 → R2 통과) —
  상세: docs/reviews/2026-06-30-ux-backlog-quality.md
- 가정: B+D 한 브랜치(D가 B의 창 흐름 회귀 방어), gotoWs/close 가시 창-only는 버그 수정, Super+F preventDefault는
  브라우저 검색 충돌 회피. ADR 대신 windowState 헤더 주석으로 의도 기록(사소).
- 관련 결정: (ADR 신규 없음 — windowState 헤더 주석으로 의도 명시)

## 2026-06-29 — 음악 앨범·멤버 (A) — WIP 마무리
- 브랜치: feat/music-albums-members
- 한 일: working tree에 잔존하던 WIP types.ts(ArtistMember·Album·SongRef·AlbumView·ArtistView +
  ArtistInfo.members·Track.albumId, typecheck red)를 end-to-end으로 마무리. 새 album 문서(title/cover/year/
  artistRef) + track albumRef + artist members 배열. 순수 buildArtistViews(lib/artists/views.ts — 앨범별 수록곡
  그룹화·재생인덱스·year 정렬·앨범 밖 폴백) + 테스트. Sanity 스키마(members·albumRef·albumType) + GROQ 투영 +
  lib/albums 도메인(queries/source). page.tsx·useRuehanix ShellContent에 albums 주입. 아티스트 상세에 멤버·앨범
  (표지/연도/수록곡)·bio/링크 표시 + 수록곡 클릭 재생.
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 174/174 — artists members·tracks albumId·albums 3·views 7 신규),
  build 성공, smoke 23/23. (이번엔 WIP가 곧 첫 커밋이라 stash 분리 없이 진행.)
- 리뷰: 통과 2라운드(R1 수정필요 P2 교차 아티스트 앨범 곡 증발·P3 정리 → 반영 → R2 통과 + aid! 단언 제거) —
  상세: docs/reviews/2026-06-29-music-albums-members.md
- 가정: album 별도 문서 + track albumRef(중복 회피), members 선택(솔로면 빈 배열), 조인을 순수 함수로(회귀 권고),
  교차 아티스트 앨범은 songs 폴백. ADR 0024.
- 관련 결정: docs/decisions/0024-music-albums-members.md

## 2026-06-29 — 창 관리(최소화/최대화) [그룹 4/4]
- 브랜치: feat/ux-window-minmax
- 한 일: 9개 UX 피처 중 마지막(창 계열 I). 순수 visibleIds(lib/ruehanix/layout.ts — 현재 ws 타일링 대상,
  최소화 제외·최대화 시 단일). CoreState에 minimized/maximized 추가, curIds를 visibleIds로 위임.
  핸들러 minimize/toggleMaximize + openApp/openPost가 unminimize + 다른 앱 최대화 해제(가시성 보장),
  close/minimize가 maximized·focused 정리, gotoWs가 ws 밖 maximized 정리. 타이틀바에 —/□/✕ 버튼 +
  더블클릭 최대화 토글(모바일은 단일 풀스크린이라 —/□·더블클릭 생략). 단일 id로 computeLayout → 전체 rect·거터 없음.
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 162/162 — layout +6), build 성공, smoke 23/23.
  WIP types.ts stash로 분리 후 복원.
- 리뷰: 통과 2라운드(R1 수정필요 P1 openPost 가시성 평행경로 누락·P2 모바일 min/max 숨김·P3 title/표현 →
  반영 → R2 통과 + N1 표현 통일) — 상세: docs/reviews/2026-06-29-window-minimize-maximize.md
- 가정: 최대화 = 단일 id 타일(별도 fullscreen 분기 회피), 최소화 = open 유지+minimized 플래그(dock 복귀),
  openApp/openPost가 maximized 정리(가려짐 방지), 모바일은 데스크톱 전용(이미 단일 풀스크린). ADR 0023.
- 관련 결정: docs/decisions/0023-window-minimize-maximize.md

## 2026-06-25 — 탐색/저장(통합 검색·최근 글·북마크) [그룹 3/4]
- 브랜치: feat/ux-search-save
- 한 일: 9개 UX 피처 중 탐색/저장 계열(A/B/F).
  A — 순수 searchAll(앱·글·아티스트·사진 동시 검색, 빈 질의는 앱만, 제네릭으로 onClick/color 보존).
  런처를 카테고리 그룹 렌더. 글→openPost, 아티스트→music, 사진→foto. Enter=첫 결과(앱>글>아티스트>사진).
  B — visit-storage(순수 LRU, MAX 8) + visits 외부스토어(useSyncExternalStore, write-through). openPost가
  기록. 리더 사이드바 '최근'. F — bookmark-storage(순수, MAX 24) + bookmarks 외부스토어. 리더 헤더 별 토글 +
  사이드바 '북마크'. 방문/북마크는 외부스토어(토스트 패턴, CoreState 아님 — ADR 근거).
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 156/156 — 신규 22: search 7·bookmark 8·visit 7),
  build 성공, smoke 23/23. WIP types.ts stash로 분리 후 복원.
- 리뷰: 통과 2라운드(R1 수정필요 P2 북마크 순서·P2 필드명 거짓말·P3 ADR/smoke 정정 → 반영 →
  R2 통과 + dead code 3종/ADR smoke 수 폴딩 정리) — 상세: docs/reviews/2026-06-25-search-save-launcher-recent-bookmarks.md
- 가정: 방문/북마크 외부스토어(CoreState 부풀림 회피), searchAll 제네릭(확장 필드 보존), 빈 질의 앱만
  (기존 브라우징 회귀 방지), 방문은 openPost 단일 지점, 섹션 중복 표시는 의도(컨텍스트별 접근). ADR 0022.
- 관련 결정: docs/decisions/0022-search-save-unified-launcher-recent-bookmarks.md

## 2026-06-25 — 리더 UX(목차·진행률·포커스·표시설정) [그룹 2/4]
- 브랜치: feat/ux-reader
- 한 일: 9개 UX 피처 중 Reader 계열(C/D/E).
  C — 순수 extractHeadings(lib/ruehanix/reader.ts, id=블록 _key) + PostBody h2/h3/h4에 id 부여(TOC 앵커).
  우측 TOC(IntersectionObserver로 활성 섹션 하이라이트, 클릭 시 getBoundingClientRect 차분 부드러운 스크롤).
  상단 진행률 바(onScroll).
  D — 포커스 모드 토글(좌측 글 목록 사이드바 숨김 → 본문 전폭).
  E — 폰트 크기·본문 폭 툴바(A−/A+/⇠/⇢), ReaderPrefs localStorage 영속(reader-storage, ui-storage 대칭).
  PostBody 본문 p/ul/ol font-size를 --rh-body-fs CSS var로(/posts 라우트는 set 안 함→기본 16px 무영향).
  변경 시 글로벌 notify(ADR 0020) 피드백.
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 134/134 — reader 9·reader-storage 6 신규), build 성공,
  smoke 22/22. WIP types.ts stash로 분리 후 복원.
- 리뷰: 통과 2라운드(R1 수정필요 P1 updater 부작호·P2 빈 id throw·P3 TOC 다듬 → 반영 → R2 통과) —
  상세: docs/reviews/2026-06-25-reader-ux-toc-focus-prefs.md
- 가정: 헤딩 id=블록 _key(한글 slug 불안정 회피), 폰트 크기 CSS var(/posts 무영향), 포커스는 reader 내부
  (워크스페이스 최대화는 G4와 분리), TOC 항목 native button(clickable spread는 react-hooks/refs 오탐). ADR 0021.
- 관련 결정: docs/decisions/0021-reader-ux-toc-focus-prefs.md

## 2026-06-25 — UX 기반층(테마 플래시 제거 + 글로벌 토스트) [그룹 1/4]
- 브랜치: feat/ux-foundation
- 한 일: G 테마 플래시 제거 + H 글로벌 토스트(9개 UX 피처 중 기반 계열).
  G — 순수 함수 resolveEarlyTheme(lib/ruehanix/theme.ts, 저장값→{light,accent}) + layout head
  인라인 스크립트가 첫 페인트 전 localStorage를 읽어 html.rh-light·--accent 적용. 맵·기본값·키는
  import해 단일 진실 소스(ADR 0011 백로그 해소). useRuehanix 테마 effect는 마운트 후 동일값 idempotent.
  H — lib/ruehanix/toast.ts 외부 스토어(notify/clearToast/subscribeToast + useToast, useSyncExternalStore,
  ttl 자동소멸·재호출 리셋·스티키(0)·SSR 안전). ToastHost를 셸 루트에 추가(z9999, 모바일 오프셋, 말줄임).
  SettingsApp 로컬 토스트(state/타이머/SettingsToast) 제거 → 글로벌 notify로 마이그레이션.
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 118/118 — toast 7·resolveEarlyTheme 5 신규),
  build 성공, smoke 22/22. WIP types.ts stash로 분리 후 복원.
- 리뷰: 통과 2라운드(R1 수정필요 P2 gap 드리프트·P2 dead code·P3 모바일 오프셋/말줄임 → 반영 →
  R2 통과) — 상세: docs/reviews/2026-06-25-ux-foundation-theme-toast.md.
  ※ R2는 code-reviewer 에이전트가 인프라 결함(3회 연속 DB 오류)으로 불가해 self-review로 대체.
- 가정: 인라인 스크립트 로직은 순수 함수의 거울 이미지(맵은 import로 주입), 토스트는 외부스토어(React 19 권장),
  ToastHost 단일 인스턴스. ADR 0020.
- 관련 결정: docs/decisions/0020-ux-foundation-theme-toast.md

## 2026-06-25 — 설정 앱 탭/네비 재작성
- 브랜치: feat/settings-revamp
- 한 일: SettingsApp 재작성. 사이드바 6개 탭이 하드코딩 bool이라 클릭 불가·항상 Appearance만
  표시하던 것을 SETTINGS_TABS 상수 기반 실동작(탭 전환)으로. Appearance(기본값 복원 버튼 추가)·
  Keybindings(공유 목록)·About(정적 메타) 패널 구현, 미구현 탭(General/Window Rules/Displays/Wallpaper)은
  "준비 중" 비활성. 토글 role=switch·테마/강조색 role=radio(방향키 탐색+포커스 이동)·gap 슬라이더
  role=slider+방향키. 변경 시 인라인 토스트 피드백. KEYBINDS를 lib/ruehanix/settings.ts로 이동해
  shell 오버레이와 Keybindings 탭이 공유(DRY). DEFAULT_UI를 ui-storage에 두고 reset/INITIAL이 단일 소스 사용,
  resetUi 핸들러 추가. ACCENT_PALETTE를 {hex,name}[]로 변경(색 이름 a11y 라벨/토스트).
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 107/107 — settings 6·ui-storage DEFAULT_UI 2·
  data 5 신규), build 성공, smoke 22/22. WIP types.ts(ArtistMember/Album 등)는 stash로 분리 후 복원.
- 리뷰: 통과 4라운드(R1 수정필요 P2×3·P3×2 → R2 P2-1·P3-1·P3-2 → R3 P3 리스너 강건성 → R4 통과) —
  상세: docs/reviews/2026-06-25-settings-revamp.md
- 가정: 미구현 탭은 제거 말고 비활성(데스크톱 셸 감성), KEYBINDS를 lib로(DRY), About은 정적 메타,
  토스트는 SettingsApp 국소 피드백. ADR 0019.
- 관련 결정: docs/decisions/0019-settings-tabs-revamp.md

## 2026-06-23 — .claude/ 하네스 제거 (opencode 마이그레이션)
- 브랜치: chore/remove-claude-dir
- 한 일: 프로젝트 로컬 `.claude/` 하네스 6파일 제거. 하네스를 opencode 글로벌(`~/.config/opencode/`)로
  이전 — CLAUDE.md·CONVENTIONS.md·code-reviewer 에이전트·`/feature` 커맨드·verify.sh·settings(권한)을
  opencode 형식(`instructions` 배열·`permission` 객체·agent/command 프론트매터)으로 변환해 설치.
  같은 커밋에 `content/posts/` 첫 글 원본·0017 ADR(아티스트 브라우저 설계) 포함(사용자 결정).
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 94/94). 단 `lib/ruehanix/types.ts`의 WIP 타입
  (ArtistMember·Album·SongRef·AlbumView·ArtistView)이 normalize 미대응으로 typecheck red를 만들어 stash로
  분리 후 제외 → 커밋 후 working tree에 복원. 라우트 무관 변경이라 build/smoke는 생략.
- 리뷰: 통과 1라운드(P3 권고 3 — 범위 혼합[사용자 결정]·0017 미구현 상태 "채택"[향후 갱신]·worklog 누락[본 항목으로 반영]) —
  상세: docs/reviews/2026-06-23-claude-하네스-제거.md
- 가정: 하네스 마이그레이션은 글로벌(모든 프로젝트에 적용), 프로젝트 로컬 복사본 불필요. ADR 0018.
- 관련 결정: docs/decisions/0018-opencode-harness-migration.md

## 2026-06-23 — 전체 아티스트 디렉터리
- 브랜치: feat/artist-directory
- 한 일: MusicApp 아티스트 탭을 현재 곡 가수 → 전체 아티스트 디렉터리로. lib/artists(getAllArtists·normalize)
  추가, artist 컬렉션 직접 쿼리해 셸 주입. ArtistInfo에 id(_id) 추가, toArtistInfo를 lib/artists로 이전해
  tracks와 공유(DRY). 디렉터리: 카드 목록(사진/이니셜 아바타), 재생 중 가수 강조("재생 중" 배지), 카드 클릭 시
  소개·링크 인라인 펼침. useRuehanix 인자를 content 객체({posts,tracks,photos,artists})로 정리(positional 혼동 방지).
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 94/94 — artists normalize 5), build 성공,
  smoke 22/22. 스텁 아티스트 3명 주입으로 디렉터리·강조·확장 시각 확인 후 원복.
- 리뷰: 통과 1라운드(지적 없음, 회귀 없음, 0015 positional footgun 권고도 반영) — 상세: docs/reviews/2026-06-23-아티스트-디렉터리.md
- 가정: 전체 디렉터리(원래 의도), content 객체 주입, id 폴백 ""(정상 데이터엔 _id 항상). ADR 0016.
- 관련 결정: docs/decisions/0016-artist-directory.md

## 2026-06-23 — 음악 아티스트 정보 (artist 문서 + 탭)
- 브랜치: feat/artist-info
- 한 일: 가수 정보 입력·제공. Sanity artist 문서(name·photo·bio·genre·origin·links) 추가, track이
  선택적 artistRef로 참조(비파괴 — 기존 artist 문자열 라벨 유지). track 쿼리에서 역참조, normalize가
  ArtistInfo로 정규화(이름 없으면 null·링크 label/url 필터). MusicApp에 재생목록↔아티스트 탭(로컬 state),
  ArtistPanel(사진/이니셜 아바타·이름·장르·출신·소개·링크 버튼). 정보 없으면 안내.
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 89/89 — tracks normalize 7), build 성공,
  smoke 22/22(아티스트 탭 전환). 스텁 artistInfo 주입으로 패널 렌더 시각 확인 후 원복.
- 리뷰: 통과 1라운드(지적 없음, 회귀 없음) — 상세: docs/reviews/2026-06-23-아티스트-정보.md
- 가정: 별도 artist 문서 + 참조(DRY), artistRef 선택(비파괴), bio plain text(리치는 백로그), 탭 상태 로컬. ADR 0015.
- 관련 결정: docs/decisions/0015-artist-info.md

## 2026-06-23 — 라이트 모드 데스크톱 위젯 대비 개선
- 브랜치: fix/light-widget-contrast
- 한 일: 데스크톱 위젯(neofetch·conky·키바인드 힌트)이 다크 팔레트 hex·다크 textShadow를 하드코딩해
  라이트 모드에서 washout되던 문제 수정. theme.ts의 LATTE(accent 6색)를 MOCHA_TO_LATTE(보조색 yellow·
  teal·sky 추가)로 일반화하고 순수 toLatte(hex, lightMode) 매퍼 추가(accentEff와 맵 공유). viewModel에
  widget 팔레트 파생(라이트면 Latte 색·그림자 제거·밝은 border), 셸 위젯이 vm.widget 사용. 미사용 PALETTE 제거.
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 86/86 — theme +4 toLatte), build 성공,
  smoke 21/21(Light 전환 PASS). 라이트 모드 강제 후 위젯 가독성 시각 확인(washout 해소).
- 리뷰: 통과 1라운드(지적 없음, 회귀 없음) — 상세: docs/reviews/2026-06-23-라이트-위젯-대비.md
- 가정: 위젯 색을 테마 시스템(theme→vm→shell)으로 흡수. ADR 없음(기존 패턴 연장 수정).

## 2026-06-23 — 본문 Portable Text 리치 렌더 + 사진 Sanity 전환
- 브랜치: feat/rich-content
- 한 일: ①글 본문을 평문 문단 → 원본 Portable Text로. 공용 PostBody(@portabletext/react)로 헤딩·리스트·
  인용·링크·인라인코드·코드블록·본문이미지 렌더(Reader 앱·/posts/[slug] 공용). post 스키마 body에
  image(alt)·codeBlock 추가. BlogPost.body 타입 string[]→PortableTextBlock[]. ②사진을 Sanity photo
  스키마로 전환(image·title·tag·order, tracks 패턴 미러링). lib/photos, image.asset->url 투영,
  FotoApp 실제 이미지 렌더 + 빈 상태. 하드코딩 PHOTOS 제거. 순수 Sanity·폴백 없음.
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 통과 — photos normalize 4·posts image 정제 테스트 추가,
  죽은 portableTextToParagraphs 제거), build 성공(slug SSG), smoke 21/21(사진·곡 유무 무관). /posts/[slug] PT 렌더 시각 확인.
- 리뷰: 통과 2라운드(1R P1: asset 없는 본문 image 블록이 urlFor throw → normalize sanitizeBody 제외 +
  PostBody 가드 + 테스트; P2 죽은 함수 제거) — 상세: docs/reviews/2026-06-23-portable-text-사진-sanity.md
- 가정: 코드 하이라이트 플러그인(@sanity/code-input) 미도입(단순 codeBlock). 순수 Sanity·폴백 없음. ADR 0014.
- 백로그: next/image 설정(외부 CDN 이미지), 코드 신택스 하이라이트.
- 관련 결정: docs/decisions/0014-portable-text-and-photos.md

## 2026-06-23 — 팝오버 아이콘 수정 + 플레이리스트 Sanity 전환
- 브랜치: feat/sanity-tracks
- 한 일: ①팝오버 재생 버튼이 세로 타원으로 찌그러지던 문제 수정(컨트롤 아이콘에 flex:none — 좁은
  플렉스 width 축소 차단). ②플레이리스트를 하드코딩 → Sanity 단일 소스로 전환(posts 패턴 미러링,
  ADR 0013). Sanity track 스키마(title·artist·videoId 11자 검증·order) + studio 등록, lib/tracks
  (queries·normalize·source·types), page.tsx가 글·곡 Promise.all 서버 fetch해 셸 주입,
  useRuehanix(posts, tracks). 하드코딩 TRACKS 제거. 곡은 /studio에서 관리.
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 78/78 — tracks normalize 4 + player 클램프 6 추가),
  build 성공, smoke 19/19(현재 Sanity 트랙 0개 → 숨김 경로; 클램프는 순수 단위 테스트로 결정 검증).
  스텁 트랙 임시 주입으로 팝오버·원형 아이콘·플레이리스트 렌더 시각 확인 후 원복.
- 리뷰: 통과 2라운드(1R P1: 곡 수가 줄어 저장 index가 범위 밖일 때 표시 곡과 reducer skip 기준 불일치
  → reducer 진입 clampIdx 정규화 + 단위 테스트 6개; P2 클램프 단위 테스트로 못박음) —
  상세: docs/reviews/2026-06-23-sanity-트랙-아이콘.md
- 가정: 순수 Sanity·폴백 없음(사용자 선택). 곡 0개면 미니플레이어 숨김. ADR 0013.
- 백로그: smoke 콘솔필터 URL 기반 보강(이전 작업서 이월).
- 관련 결정: docs/decisions/0013-sanity-tracks-source.md

## 2026-06-23 — 음악 컨트롤러 팝오버 + 메뉴바 칩 제거
- 브랜치: feat/music-popover
- 한 일: 데스크톱 메뉴바의 가짜 시스템 칩 5개(wlan0·CPU·RAM·볼륨·배터리)와 BarChip 컴포넌트 제거 →
  우측엔 미니플레이어·시계·재부팅만. 미니플레이어를 단일 버튼(재생상태 아이콘+제목)으로 바꿔 클릭 시
  음악 컨트롤러 팝오버 토글. 팝오버는 MusicApp(컨트롤+플레이리스트) 재사용, 외부 클릭·Esc로 닫힘,
  런처·단축키·팝오버 3자 상호배타. showMusic 상태·toggleMusic 핸들러 추가.
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 68/68), build 성공,
  smoke 23/23(미니플레이어 클릭→팝오버→재생 NOW PLAYING→Esc 닫힘 시나리오 추가). 수동(playwright):
  팝오버 우상단 렌더·칩 제거 시각 확인.
- 리뷰: 통과 1라운드(P3 죽은 mod.vol 제거 반영; P4 smoke 콘솔필터 URL기반 보강은 백로그) —
  상세: docs/reviews/2026-06-23-음악-팝오버.md
- 가정: music 창 앱(rhx-play) 유지(제거 지시 없음, 팝오버=빠른 접근·창=타일). UI 재구성이라 ADR 미작성.
- 백로그: smoke 콘솔 에러 필터를 텍스트→m.location() URL 기반으로 보강.

## 2026-06-23 — 음악 플레이어 (rhx-play)
- 브랜치: feat/music-player
- 한 일: 데스크톱 셸에 YouTube 기반 음악 플레이어 추가. 2겹 구조 — ①셸 루트 상주 숨긴 iframe 엔진
  (YouTubeEngine, IFrame API로 재생 제어, 비동기 콜백은 useEffectEvent로 최신화) ②항상 보이는 메뉴바
  미니플레이어 ③풀 UI인 `music` 창 앱(MusicApp). 순수 reducer(player.ts: next/prev/select/toggle/volume/
  repeat/onEnded, wrap-around·빈목록 가드)와 영속화(player-storage.ts: 트랙·볼륨·반복모드 복원, playing은
  autoplay 회피로 항상 false)를 엔진과 분리해 단위 테스트. 앱/워크스페이스 전환 시 셸이 언마운트되지 않아
  재생이 끊기지 않음. TRACKS는 사용자 편집용 시드 4곡.
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 68/68), build 성공,
  smoke 3회 연속 21/21(미니플레이어·재생 토글→NOW PLAYING·앱 전환 유지·콘솔 앱 에러 0). 수동(playwright):
  재생 시 youtube embed iframe 생성·MusicApp UI 시각 확인.
- 리뷰: 통과 2라운드(1R P1: 미니플레이어 추가로 메뉴바 중앙 타이틀이 포인터 가로채 smoke flaky →
  focus-title pointerEvents:none·폭 상한; P3 toggle 빈목록 가드) — 상세: docs/reviews/2026-06-23-음악-플레이어.md
- 가정: YouTube IFrame API 채택(자가호스팅 대비 호스팅 0·미디어키 제한 트레이드오프). 재생 지속 범위 =
  셸 내부 전환(공짜). /posts 풀 라우트 이동은 v1 범위 밖(셸 언마운트로 정지). 셔플 미구현(반복만). ADR 0012.
- 백로그: 엔진을 layout.tsx로 올려 크로스 라우트 지속, 셔플, Sanity track 스키마 전환, 비주얼라이저.
- 관련 결정: docs/decisions/0012-music-player.md

## 2026-06-22 — UI 설정 영속화 + 빈 상태 문구 정리
- 브랜치: feat/persist-ui-settings
- 한 일: 셸 UI 설정(테마 모드·accent·gap·rounded·glow·transp)을 localStorage에 영속화해 재접속 복원.
  parseUiState/serializeUiState 순수 함수(검증 포함). 마운트 복원을 부팅 결정과 한 setState로 합쳐
  disable 1줄 유지, [st.ui] 변경 저장(uiSavedRef로 첫 실행 스킵). 빈 상태에서 "/studio 작성" 문구 제거.
- 검증: verify exit 0(typecheck·eslint 0 error/0 warn·vitest 49/49), build OK, smoke 18/18
  (UI 재접속 복원 단언 추가). 시각 확인: 저장 설정이 재로드 후 복원(rh-light + accent 매핑).
- 리뷰: 통과 1라운드(P3 dev StrictMode 관찰 — prod 무영향·수정 불요) — 상세: docs/reviews/2026-06-22-ui-설정-영속화.md
- 가정: 재방문 theme flash는 수용(완전 제거는 백로그). ADR 0011.
- 백로그: theme flash 제거(layout head 인라인 스크립트).
- 관련 결정: docs/decisions/0011-persist-ui-settings.md

## 2026-06-22 — 블로그 글 Sanity 소스 전환 (하드코딩 제거)
- 브랜치: feat/sanity-posts-source
- 한 일: 블로그 글 소스를 하드코딩 → Sanity로 교체("처음부터"). source.ts를 queries(Sanity)로,
  하드코딩 어댑터·POSTS·Post 타입 제거. 셸이 page.tsx 서버 fetch한 글을 props로 받음(ISR 60s),
  식별자 id→slug 전환(slugForId 제거). 글 0개면 Files·Reader·Web·/posts에 "아직 글 없음" 안내.
  posts만 전환(사진·랩타임 유지).
- 검증: verify exit 0(typecheck·eslint 0 error/0 warn·vitest 44/44), build OK(/posts·[slug] SSG),
  smoke 17/17(글-무관 재작성). 빈 데이터셋 빈 상태 시각 확인. /posts 404·sitemap 실측.
- 리뷰: 통과 1라운드(P3: 죽은 Post 타입·INITIAL.selected 정리, 스모크 복원 백로그) — 상세: docs/reviews/2026-06-22-sanity-글-소스-전환.md
- 가정: 단일 소스(Sanity), id→slug 통일, 빌드/스모크의 Sanity 네트워크 의존 수용. ADR 0010.
- 백로그: Portable Text 리치 렌더·동적 OG·사진/랩타임 DB·초안 미리보기·글 렌더 스모크 복원.
- 관련 결정: docs/decisions/0010-sanity-posts-source.md

## 2026-06-22 — useRuehanix React Compiler 리팩터링
- 브랜치: refactor/usereuhanix-react-compiler
- 한 일: useRuehanix를 React 19.2 권장 패턴으로 재작성 — useSyncExternalStore(뷰포트·OS 선호·시계),
  useEffectEvent(키보드), useCallback·ref 미러 전면 제거. eslint.config의 react-hooks v6 완화 4종
  삭제(규칙 error 복귀). 부팅 스킵 1줄만 정당한 disable. 품질 빚(12 warn) 청산.
- 검증: verify EXIT 0(typecheck·eslint 0 error/0 warn·vitest 48/48), build OK, smoke 17/17
  (시계 즉시 시드 단언 추가). 재방문 경로 시계 즉시 표시 수동 확인.
- 리뷰: 통과 2라운드(1R P2: 재방문 시 시계 ~1.4초 "00:00" 회귀 → subscribeSys 즉시 시드 + 스모크 박제) — 상세: docs/reviews/2026-06-22-usereuhanix-react-compiler.md
- 가정: React Compiler 정식 활성화는 보류(useCallback 제거로 경고는 이미 해소). 후속 후보.
- 백로그: reboot 타이머 정리(선존·비회귀), React Compiler babel-plugin 활성화.
- 관련 결정: docs/decisions/0009-usereuhanix-react-compiler-refactor.md

## 2026-06-22 — 글 라우트(/posts) + SEO
- 브랜치: feat/posts-routes-seo
- 한 일: 콘텐츠 소스 추상화(source.ts 단일 진입점=하드코딩 어댑터, BlogPost.body 문단 통일,
  영문 slug·ISO 발행일) + `/posts/[slug]`(RSC·SSG·generateMetadata·JSON-LD BlogPosting)·`/posts`(목록)
  + sitemap·robots(/studio 차단)·RSS(feed.xml). 셸 Reader에 "전체 페이지로 보기" 링크.
  Sanity CORS 대기라 하드코딩 소스로 먼저 완성(나중 어댑터 한 줄 교체).
- 검증: verify EXIT 0(typecheck·lint 0 error/12 warn·vitest 48/48), build(/posts·[slug] SSG 8글·
  sitemap·robots·feed 생성), smoke 16/16(글 라우트·sitemap 시나리오 추가). curl로 메타·sitemap·RSS 확인.
- 리뷰: 통과 1라운드(P3: slugForId source 경유·RSS 빈 발행일 가드) — 상세: docs/reviews/2026-06-22-글라우트-seo.md
- 가정: slug 영문 수동(한글 제목→slug 모호함 회피), body 문단 배열 통일. ADR 0008.
- 백로그: 하드코딩→Sanity 어댑터 교체(CORS 후), Portable Text 리치 렌더, 글별 동적 OG, 카테고리 필터.
- 관련 결정: docs/decisions/0008-post-routes-and-seo.md

## 2026-06-22 — Sanity 임베드 스튜디오 (+ 강제 Next 16 업그레이드)
- 브랜치: feat/sanity-embedded-studio
- 한 일: `/studio` 임베드 Sanity 스튜디오(클라이언트 전용 ssr:false) + post 스키마 +
  env 클라이언트(읽기토큰 서버 전용) + post 정규화·GROQ 어댑터(normalizePost 순수 TDD).
  Sanity 6/next-sanity 13 호환 위해 react 19.2·**Next 16(major)** 강제 업그레이드, next lint 제거로
  ESLint flat config 이전, react-hooks v6 신규 규칙 4종 warn 완화. `.env*` gitignore + `.env.example`.
- 검증: verify exit 0(typecheck·lint 0 error/12 warn·vitest 38/38), 빌드 OK(/studio=ƒ),
  smoke 14/14(Next 16에서 앱 회귀 없음). /studio mount·프로젝트 접속 확인(CORS는 포트 미등록 환경 이슈).
- 리뷰: 통과 1라운드(P2: formatDate UTC 고정·readToken 백로그 주석; P3: ADR 보강·.env.example·cover 백로그) — 상세: docs/reviews/2026-06-22-sanity-임베드-스튜디오.md
- 시크릿 안전: 토큰값이 git·클라이언트 번들 어디에도 없음(리뷰어 스캔 확인).
- 백로그: /posts/[slug]·sitemap·RSS·동적 OG·8글 마이그레이션(ADR 0006 순서), readToken 배선,
  cover 매핑, useRuehanix react-compiler 리팩터링.
- 관련 결정: docs/decisions/0007-sanity-embedded-studio.md

## 2026-06-22 — 완성도 패스(메타·부팅·검색·접근성) + 콘텐츠/SEO 계획
- 브랜치: feat/polish-and-content-plan
- 한 일: (1) 메타데이터 확장·9-dot favicon·터미널 스타일 404·브랜딩 OG 이미지(next/og).
  (2) 부팅 세션 1회(sessionStorage)+prefers-reduced-motion 건너뜀. (3) 런처 실제 검색
  (filterApps·Enter 첫 결과·결과없음·query 초기화). (4) 핵심+콘텐츠 클릭 요소 키보드 접근성
  (clickable: role/tabIndex/Enter·Space/aria-label), :focus-visible, reduced-motion 애니 비활성.
  (5) 콘텐츠 관리·SEO 운영 계획 ADR 수립(구현은 후속 분리).
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 32/32), build 5/5(og·icon·404),
  smoke 14/14(검색 필터·a11y role·부팅 1회 시나리오 추가).
- 리뷰: 통과 1라운드(P2: summary_large_image인데 og:image 없음 → 브랜딩 OG 이미지 추가) — 상세: docs/reviews/2026-06-22-완성도패스-접근성-계획.md
- 가정: 콘텐츠/SEO는 계획만, 구현은 후속. gap 슬라이더 키보드 미지원은 비차단(나머지 설정은 접근 가능).
- 백로그: 콘텐츠 소스(Sanity 등) 도입+/posts/[slug]+sitemap/RSS/동적 OG(ADR 0006 순서), 슬라이더 키보드.
- 관련 결정: docs/decisions/0006-content-seo-strategy.md

## 2026-06-22 — 첫 방문 힌트 제거 · 독 호버 이름 라벨
- 브랜치: feat/dock-tooltip-remove-hint
- 한 일: 사용자 피드백 반영 2건. (1) 첫 방문 힌트(튜토리얼 말풍선) 완전 제거 — AppsHint·hint 상태/
  9초 타이머/localStorage·onboarding 로직·rh-pulse 삭제. (2) 데스크톱 독 아이콘 호버 시 위에 앱 이름
  라벨 표시(순수 CSS, .rh-dock-label). title→aria-label. 독·버튼 강화는 유지.
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 22/22), build 4/4, smoke 11/11(호버 라벨 가시성
  히트테스트 시나리오 포함).
- 리뷰: 통과 2라운드(1R P1: 호버 라벨이 overflowX 클리핑으로 안 보임 → overflowX/maxWidth 제거+
  z-index, 스모크를 elementFromPoint 가시성 검사로 강화; P3 라벨색 var(--text)) — 상세: docs/reviews/2026-06-22-힌트제거-독호버라벨.md
- 가정: 호버 표시는 순수 CSS(:hover)로, React state 불필요. ADR 0005(0004 힌트 부분 폐기).
- 관련 결정: docs/decisions/0005-remove-hint-dock-tooltip.md

## 2026-06-22 — 앱 발견성 (데스크톱 독·버튼 강화·첫 방문 힌트)
- 브랜치: feat/app-discoverability
- 한 일: 데스크톱(≥768) 앱 실행 발견성 3종. (1) 하단 중앙 floating 독 — 8앱 클릭 실행·활성 강조·호버,
  타일 영역에 독 자리 확보(area bottomReserve). (2) 좌상단 런처 버튼을 9-dot 앱그리드 아이콘 +
  툴팁 + 호버로 강화. (3) 첫 방문 시 독 위 펄스 말풍선 힌트 — localStorage 1회, 9초/클릭 시 닫힘.
  표시 게이팅(shouldShowHint)·area reserve는 순수 함수로 분리해 vitest.
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 26/26), build 4/4(/ 18.1kB),
  smoke 10/10(데스크톱 독 시나리오 추가). Playwright 시각 확인(독·버튼·힌트 렌더).
- 리뷰: 통과 1라운드(P3: 타이머 cleanup 반영, a11y 백로그) — 상세: docs/reviews/2026-06-22-앱발견성.md
- 가정: 세 기능 모두 데스크톱 한정, 모바일 무변경. 버튼 라벨 "ruehanix" 유지(아이콘만 교체). ADR 0004 기록.
- 백로그: 클릭 요소 전반 키보드 접근성(div+onClick → role/tabIndex/Enter), 독 자동숨김 토글, 힌트 다국어.
- 관련 결정: docs/decisions/0004-app-discoverability.md

## 2026-06-22 — 반응형 / 모바일 모드
- 브랜치: feat/responsive-mobile
- 한 일: RueHanix에 768px 경계 반응형 추가. <768px에서 폰 OS 메타포(포커스 앱 풀스크린 +
  하단 독 8앱 전환 + 상단바 간소화 + 홈 아바타 카드)로 전환, 데스크톱 위젯·런처·키바인드·
  드래그 거터·Super 단축키 비활성. ≥768px 타일링 WM은 무변경. 순수 로직(isMobileWidth·
  mobileAppRect)을 lib로 분리해 vitest 테스트.
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 21/21), build 4/4(/ 17.5kB),
  smoke 8/8(모바일 독 전환 시나리오 포함). Playwright 시각 확인(390x844) 정상.
- 리뷰: 통과 1라운드(P3 보완: 기록·모바일 키보드 가드·음수높이 방어) — 상세: docs/reviews/2026-06-22-반응형-모바일.md
- 가정: 단일 경계 768px, 폭 기준 판정(포인터 무관) — 사용자 선택, ADR 0003 기록.
- 백로그: 모바일 스와이프 제스처, safe-area-inset, 독 길게 눌러 닫기.
- 관련 결정: docs/decisions/0003-responsive-mobile-strategy.md

## 2026-06-22 — RueHanix Next.js 변환
- 브랜치: feat/nextjs-conversion
- 한 일: 단일 `index.html`(React CDN, ADR 0001)을 Next.js 15 App Router + TypeScript로 변환.
  App 클래스를 `useRuehanix` 훅 + `viewModel.ts` 순수 빌더로 재작성, 8개 앱·waybar·타일링 WM·
  드래그·런처·키보드 단축키·라이브 테마 엔진을 함수형+훅으로 이식. 타일링/테마 로직을
  `lib/ruehanix`의 순수 함수로 분리(vitest 16개). 스타일은 globals.css + 인라인 객체.
  기능·UI·스타일 원본과 동치(시각 확인 포함).
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 16/16), `npm run build` 정적 프리렌더 4/4,
  `npm run smoke` 6/6.
- 리뷰: 통과 1라운드(병합 전 기록 보완) — 상세: docs/reviews/2026-06-22-nextjs-변환.md
- 가정: 구조는 사용자 선택대로 실용적 분해(풀 FSD 아님) — ADR 0002로 예외 기록.
  index.html은 참조용 보관(미삭제).
- 백로그(비차단): smoke에 키보드 단축키·드래그 거터 시나리오 추가, index.html 제거,
  콘텐츠 MDX/CMS 분리, 접근성(div→role/키보드).
- 관련 결정: docs/decisions/0002-nextjs-conversion.md

## 2026-06-22 — ruehanix 데스크톱 셸 구현
- 브랜치: feat/ruehanix-desktop
- 한 일: Claude Design 프로토타입 `RueHanix.dc.html`(Design Composer 런타임 의존, 단독 실행 불가)을
  빌드툴 없는 단일 `index.html`로 포팅. React(CDN)+Babel standalone. 부팅 시퀀스, waybar, 타일링 WM +
  드래그 거터, 앱 런처, 키보드 단축키, 라이브 테마 엔진(light/dark/auto·accent·gap·투명도·라운드·glow),
  6 워크스페이스, 8개 앱(Files/Reader/Foto/HotLap/Terminal/Web/Settings/About).
  재현 가능한 Playwright 스모크(`scripts/smoke.mjs`, `npm run smoke`) 추가.
- 검증: `npm run smoke` 6/6 통과 (boot·waybar·ws2 타일링·런처 앱 오픈·Light 테마·콘솔 앱 에러 0).
  verify.sh는 HARNESS GAP(빌드툴 없는 정적 HTML) — ADR 0001로 사유 문서화, 스모크로 센서 대체.
- 리뷰: 통과 2라운드 (1라운드 수정 필요: 기록물 누락·스모크 재현불가·P3 3건) — 상세: docs/reviews/2026-06-22-ruehanix-데스크톱-셸.md
- 가정: 사용자가 "지금은 HTML, 이후 React/Next 변환"으로 범위 지정 → FSD 대신 단일 HTML 채택.
  콘텐츠(블로그 글·랩타임·사진)는 원본대로 하드코딩, 백엔드 없음.
- 백로그(React/Next 전환 시): 접근성(div onClick → role/tabIndex/키보드), Babel 런타임 트랜스파일 제거,
  FSD 슬라이스 분해, `S()` 인라인 스타일 → CSS 모듈.
- 관련 결정: docs/decisions/0001-html-first-implementation.md
