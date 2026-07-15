# 0045. GitHub Actions CI 제거

- 상태: 채택
- 날짜: 2026-07-15

## 배경

2026-07-14 (ADR 0028) 에 typecheck/eslint/vitest/build 의 자동 게이트로
`.github/workflows/ci.yml` 도입. 1주일 사용 후 다음 이유로 제거:

- **Vercel 이 빌드 + typecheck + lint + preview deploy 동시 제공.** PR 단위
  게이트가 중복.
- **CI 빌드 오류 빈번** — `verify.sh` 로컬 통과 ≠ GitHub Actions 통과 (node
  버전, npm ci, 캐시 차이). 가성비 ↓.
- **라운드 1·2 회귀는 로컬 verify 가 잡음** — typecheck/eslint/vitest 로컬에서
  모두 발견. CI 의 실효성 낮음.
- **sync-posts:check (frontmatter drift)** — CI 의 진짜 가치였으나, PR 리뷰어가
  직접 확인 가능. 손실 수용.

## 결정

`.github/workflows/ci.yml` 삭제. `.github/` 디렉터리 전체 제거 (workflows 만 있었음).

## 영향

- main 보호는 PR 리뷰 + Vercel preview + 로컬 `verify.sh` 의 3중 안전망.
- sync-posts:check 자동 검증 X. frontmatter drift 는 PR 시 reviewer 가
  `npm run sync-posts:check` 로 확인.
- measure-chunks (ADR 0042 후속 CI 단계) 도 미적용. 로컬 측정만.

## 후속

- (선택) pre-push hook — `verify.sh` 자동 실행. 로컬 안전망.
- (선택) Vercel 의 build log 에서 typecheck/lint 실패 시 PR 차단. Vercel 설정.