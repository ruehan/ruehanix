# 0032. frontmatter 파서 드프트 진단 모드

- 상태: 채택
- 날짜: 2026-07-14

## 배경

`lib/posts/frontmatter.ts`(정본, 4 케이스 테스트)와 `scripts/sync-posts.mjs`
(인라인, 테스트 0)의 두 frontmatter 파서가 있다. 둘은 동일 로직을 두 번 적은
것으로, 정본을 변경할 때 인라인을 동기화하지 않으면 sync-posts 가 잘못된
NDJSON 을 만든다. 라운드 5 리뷰에서 "지금 일치하지만 동기화 의무는 주석만"
으로 정리된 후속 작업이다.

## 결정

`scripts/check-frontmatter-drift.mjs` 를 신설한다. 다음을 수행한다.

1. `content/posts/*.md` 를 모두 읽는다.
2. 각 파일을 .ts 정본 파서(`lib/posts/frontmatter.ts`)와 인라인 파서로 각각 파싱.
3. 두 결과를 `JSON.stringify` 비교.
4. 차이 발견 시 파일별 diff 출력 + exit 1.
5. 모두 일치 시 `[check-drift] N 파일 일치. ✓` 출력 + exit 0.

.npm script 로 등록 (`npm run sync-posts:check`). CI 의 Build 단계 다음에
추가해 PR/푸시마다 자동 검증되게 한다.

.ts 직접 import 는 Node 22 의 `--experimental-strip-types` 로 옵트인한다.
npm script 의 `node` 옵션으로 자동 부여된다. 외부 의존성 0.

## 이유와 대안

- **tsx 같은 devDep 도입** — 도구 추가. YAGNI. Node 기본 옵션으로 충분. 거절.
- **gray-matter 도입으로 두 구현 모두 제거** — 더 큰 작업. 이번 범위 밖.
- **인라인 파서를 .ts 호출로 단순 치환** — sync-posts 가 매번 .ts 로더 비용.
  정작 진짜 동기화 부담(테스트가 인라인 변경을 검출하지 못함)은 해소 안 됨. 거절.

## 영향

- PR/푸시 시 두 파서 일치 보장. 정본 변경 후 인라인 동기화 누락을 CI 가 즉시 차단.
- Node strip-types 의 `[MODULE_TYPELESS_PACKAGE_JSON]` 경고는 무해하지만
  `package.json` 에 `"type": "module"` 추가 시 사라진다 — 별도 결정으로 보류.
- 만약 어떤 PR 에서 의도적으로 두 파서를 일시 어긋나게 만들면(예: 인라인을 먼저
  갈아엎고 .ts 를 뒤따라 가는 리팩터), `sync-posts:check` 가 빨간불. 그 PR 은
  마지 시 인라인만 통과시키거나 .ts 를 동시 갱신해야 머지 가능.