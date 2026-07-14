# 리뷰 기록 — frontmatter 파서 드프트 진단

- 날짜: 2026-07-14
- 브랜치: feat/frontmatter-drift-check
- 최종 판정: 통과 (1라운드, 작은 변경이라 self-review)

## 1라운드

- 검증: vitest 28 files / 214 tests 통과(check-drift 는 vitest 외부 도구 — verify.sh 와 별도).
  `npm run sync-posts:check` 로컬 실행 — `2 파일 일치. ✓`.

### 검토 결과

- `scripts/check-frontmatter-drift.mjs` — .ts 정본과 .mjs 인라인을 모두 import(동적)해
  동일 입력에서 비교. 차이 시 diff 출력 + exit 1.
- `package.json` `sync-posts:check` — `node --experimental-strip-types` 옵션으로 .ts import 활성화.
- `.github/workflows/ci.yml` — Build 다음 step 으로 추가. PR/푸시 시 자동 차단.
- `docs/decisions/0032-frontmatter-drift-check.md` — 결정 근거.

### 결함

없음.

### 보강 (선택, 차기 작업)

- [P3] `[MODULE_TYPELESS_PACKAGE_JSON]` 경고는 `package.json` 에 `"type": "module"`
  추가 시 사라진다. 다만 .mjs 스크립트가 package.json type 변경과 함께 일관성을 가져야
  하므로 별도 검토.
- [P3] check-drift 의 비교는 `JSON.stringify` 동등성이다. 키 순서가 다르면 false negative.
  두 파서가 모두 같은 순서로 키를 생성하므로 현 시점 OK. 만약 향후 정규화 순서가
  달라지면 false negative 가능 — Object.keys 정렬 후 비교로 강화 가능.

## 후속 가능 작업

- `package.json` `type: "module"` 도입 검토 (위 P3 첫 항목).
- check-drift 비교 키 순서 정규화 (위 P3 둘째).
- 차기: MusicApp 이미지 next/image, WebApp/MusicApp 전체 dynamic import.