# 0018. 하네스 마이그레이션 — Claude Code(.claude/) → opencode(~/.config/opencode/)

- 상태: 채택
- 날짜: 2026-06-23

## 배경

이 프로젝트는 `.claude/` 디렉터리(CLAUDE.md·CONVENTIONS.md·agents/code-reviewer.md·commands/feature.md·
scripts/verify.sh·settings.json)로 개발 하네스를 운영해 왔다. 이 하네스는 원래 user-level 의도(모든
프로젝트에 공통 적용)였으나 프로젝트에 복사본이 들어 있었다. AI 코딩 도구를 Claude Code에서 opencode로
전환하면서 하네스도 옮겨야 했다.

## 결정

하네스를 **opencode 글로벌(`~/.config/opencode/`)로 이전**하고, 프로젝트 로컬 `.claude/`는 제거.

- `CLAUDE.md`·`CONVENTIONS.md` → `opencode.jsonc`의 `instructions` 배열로 로드(`@import` 폐지).
- `settings.json`(권한 allow/ask/deny) → opencode `permission` 객체(툴별, 마지막 매칭 규칙 승).
- `code-reviewer` 에이전트 → `~/.config/opencode/agent/`(`mode: subagent`, `edit: deny`로 읽기 전용 강화,
  bash는 verify.sh·git diff·git log만 허용).
- `/feature` 커맨드 → `~/.config/opencode/command/`(`agent: build` 바인딩).
- `verify.sh` → `~/.config/opencode/scripts/`(내용 동일, 본문/에이전트의 경로 참조만 갱신).

스코프는 글로벌(원래 의도에 부합). 리뷰어 모델은 `zai-coding-plan/glm-5.2`.

## 이유와 대안

- **글로벌 vs 프로젝트 로컬** — 하네스가 모든 프로젝트에 공통 적용되도록 의도됐으므로 글로벌. 프로젝트별
  오버라이드가 필요하면 그 프로젝트의 `.opencode/opencode.json`으로.
- **`@import` → `instructions` 배열** — opencode는 `@import` 미지원. 두 문서를 `instructions`에 명시해
  시스템 컨텍스트로 주입.
- **권한 배열 → 툼별 객체** — opencode `permission`은 툴별 객체이고 규칙 순서가 의미(`*` 먼저, 구체적 뒤,
  마지막 매칭 승). 거부(`git reset --hard`·`rm -rf`·`alembic`)를 마지막에 둬 가드레일이 항상 이기도록 보장.
- **버린 안: `.claude/` 프로젝트 유지(듀얼)** — Claude Code와 opencode가 같은 파일을 공유하면 중복·불일치
  위험이 커서 기각.

## 영향

- 이 레포엔 더 이상 개발 하네스 파일이 없다. 하네스 동작은 전역 opencode 설정에 의존.
- 다른 제로원 프로젝트에도 동일 하네스가 자동 적용된다(글로벌).
- 커밋 메시지 규칙(도구 서명·`Co-Authored-By` 금지 포함)은 동일하게 유효 — CONVENTIONS.md에 명시되어
  opencode `instructions`로 로드됨.
