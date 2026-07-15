# 0039. sync-posts Sanity dataset 자동 import

- 상태: 채택
- 날짜: 2026-07-15

## 배경

`npm run sync-posts` 가 .ndjson (Sanity dataset import 용 백업) 까지 생성하지만,
실제 Sanity dataset 에 publish 하려면 사용자가 별도로 `npx sanity dataset
import` 를 호출해야 했다. 이로 인해 md 로 작성한 글이 사이트에 반영되려면
Studio 진입 → 수동 import 의 추가 단계가 필요. 운영 마찰.

## 결정

`scripts/sync-posts.mjs` 의 `main()` 끝에 `importToSanity()` 추가. 모든
ndjson 을 순회하며 `npx sanity dataset import` 호출.

- `_id` 가 `post.${slug}` 로 결정되어 있어 같은 slug 재실행 시 upsert(덮어쓰기)
  동작. 누적 모드(default) 사용. dataset 의 다른 문서(사진/아티스트/앨범)는 영향 X.
- `SANITY_IMPORT_TOKEN` env 사용. 없으면 ndjson 만 생성 + 경고 출력(에러 아님).
  CI 에서만 token 주입 → 로컬 dry-run 가능.
- `--no-import` 또는 `--dry-run` 플래그로 import skip.
- 실패 시 throw + exit 1. CI 가 즉시 실패.

## `--replace` 의미 (라운드 1 P1 모순 정정)

`--replace` 는 동일 `_id` 의 `createOrReplace` (upsert) 모드. dataset 의
*다른* doc (photo/artist/album) 은 ndjson 에 포함돼 있지 않으므로 절대
건드리지 않는다. "dataset 전체 교체" 가 아니다. 즉 `--replace` 는 동일 slug
재실행 시 upsert 로 *필수*다. 플래그 없이 호출 시 default 모드(`create`)는
같은 `_id` 가 이미 있으면 409로 실패한다. (Sanity CLI `@sanity/import`
소스의 `createOrReplace` 분기로 확인.)

따라서 본 작업의 `--replace` 사용은 의도한 upsert 동작을 위한 필수 선택이며
ADR 초안의 "dataset replace — 거절" 은 다른 의미의 dataset 전체 교체와 혼동한
오류. 이 단락으로 정정.

## 이유와 대안

- **별도 sync-posts:push 명령** — 분리 가치 있으나 md 작성자(= 본인)이 한 번에
  끝내는 흐름이 압도적. 가시적 분리보다 단일 트랜잭션 안전.
- **CI 단계에서 import** — 현재 CI 는 typecheck/lint/test/build 만. import 추가 시
  `SANITY_IMPORT_TOKEN` 시크릿 주입 + 매 PR 마다 dataset 변경 위험. 명시적
  트리거(수동) 선호.
- **Studio 에서 publish 만 사용** — 사용자가 채택했던 흐름. 그러나 md 가
  진실이라는 정책과 어긋남(ADR 0030).
- **`--replace` 제거** — createOrReplace 미동작. 같은 slug 재실행 시 409
  실패. 거절.

## 영향

- `npm run sync-posts` 한 번에 .ndjson + dataset 갱신.
- `SANITY_IMPORT_TOKEN` env 가 .env.local 에 이미 존재. 시크릿 노출 위험은
  git history 에 commit 되지 않는 한 없음(`.env.local` gitignore).
- dataset 의 다른 doc(photoType/artistType/albumType)은 영향 없음.
- Studio 에서 직접 수정한 필드는 md 의 다음 sync 시 덮어써짐. 정책 결정 —
  md 가 진실. ADR 0030 정합.

## 후속 작업

- CI 에 sync-posts:verify (CI import 없이 dry-run 만) 단계 추가 — PR 에서
  sync-posts.mjs 의 변경이 ndjson 생성을 깨지 않는지 확인.
- Sanity webhook — Studio publish 가 들어오면 local md 갱신(양방향). 차기.