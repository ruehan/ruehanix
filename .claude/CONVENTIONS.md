# 제로원 개발 표준 (CONVENTIONS)

위치: `~/.claude/CONVENTIONS.md`. CLAUDE.md가 이 문서를 참조한다.
개발 직원과 리뷰 직원은 코드 작성·검토 시 이 문서를 따른다.

## 적용 범위

- **새 프로젝트(상황 A)** — 이 문서의 구조·방법론을 그대로 적용한다.
- **기존 프로젝트(상황 B)** — 그 레포의 기존 패턴을 **우선**한다. 이 문서는 신규 코드의 기본값이자
  점진적으로 수렴해갈 목표일 뿐, 기존 레포를 임의로 갈아엎는 근거가 아니다.
- **단발성 작업(상황 C)** — 구조 규칙은 면제. 단 결과는 직접 실행해 확인한다.

---

## 프론트엔드 — Feature-Sliced Design (FSD)

React/TypeScript 프로젝트는 FSD를 따른다. 권위 있는 스펙: https://feature-sliced.design

### 레이어 (위 → 아래)

`app` → `pages` → `widgets` → `features` → `entities` → `shared`

- `app`, `shared` — 슬라이스 없이 segment로 직접 구성한다.
- `pages`, `widgets`, `features`, `entities` — slice(비즈니스 도메인) 안에 segment를 둔다.
- (구버전의 `processes` 레이어는 폐기됐다. 쓰지 않는다.)

### segment (슬라이스 내부, 관용 이름)

`ui`(표시), `api`(외부 통신), `model`(상태·비즈니스 로직), `lib`(헬퍼), `config`

### 불변 규칙 — 리뷰어가 강제한다

1. 한 레이어의 모듈은 **자기보다 엄격히 아래**에 있는 레이어만 import한다. 위·동일 레이어 import 금지.
2. 같은 레이어의 슬라이스끼리 서로 import하지 않는다.
3. 슬라이스 외부에서는 그 슬라이스의 public API(`index.ts`)를 통해서만 접근한다.

### 디렉터리 예시

```
src/
  app/
  pages/        cart/ui/
  widgets/      header/ui/
  features/     add-to-cart/{ui,model}/
  entities/     product/{api,model,ui}/
  shared/       {api,config,ui,lib}/
```

---

## 백엔드 — FastAPI 도메인 모듈 구조

도메인별로 모듈을 묶는다. 기술 유형별(모든 router를 한 폴더에)로 묶지 않는다.

```
src/
  <도메인>/
    router.py        # 엔드포인트 (얇게)
    schemas.py       # Pydantic 모델
    models.py        # DB 모델
    service.py       # 비즈니스 로직
    dependencies.py
    exceptions.py
  core/              # config, db 연결, 공통 유틸
  main.py
```

규칙:

- 라우터는 얇게 유지하고, 비즈니스 로직은 `service.py`에 둔다.
- 도메인 간 의존은 `service` 레이어를 통해서만 한다. 다른 도메인의 model을 직접 import하지 않는다.

---

## 개발 방법론 — TDD (Test-Driven Development)

모든 기능 작업은 테스트 우선으로 진행한다.

1. **Red** — 실패하는 테스트를 먼저 작성한다. 이 테스트가 "성공 기준"의 실행 가능한 정의다.
2. **Green** — 테스트를 통과시키는 최소한의 코드를 작성한다.
3. **Refactor** — 테스트 green을 유지하며 구조를 정리한다.

- `~/.claude/scripts/verify.sh`가 검증 센서다.
- 버그 수정도 먼저 그 버그를 재현하는 실패 테스트를 작성한 뒤 고친다.
- 단발성 작업(상황 C)은 TDD를 면제할 수 있으나 결과는 직접 실행해 확인한다.

---

## Git 워크플로

### 브랜치

- `main`은 항상 green 상태(verify 통과)를 유지한다. main에 직접 작업하지 않는다.
- 작업을 시작할 때 짧게 쓰고 버릴 feature 브랜치를 만든다.
- 브랜치 이름은 커밋 type을 접두사로 쓴다: `feat/<간단한-설명>`, `fix/<간단한-설명>`,
  `refactor/<간단한-설명>` 등. 설명은 영문 소문자-하이픈.
  예: `feat/todo-filter`, `fix/storage-null-guard`
- 작업이 끝나고 검증·리뷰를 모두 통과하면 `main`으로 병합한다. 병합 후 feature 브랜치는 삭제한다.

### 커밋

- **단위**: 의미 있는 논리적 단계마다 커밋한다(기능 끝에 한 번 몰아서 하지 않는다).
  예: entity 모델+테스트 한 커밋, feature 슬라이스 한 커밋.
- **green 규칙**: 모든 커밋은 그 시점에 verify.sh를 통과하는 상태여야 한다. 깨진 상태로 커밋하지 않는다.
  TDD의 Red→Green을 한 묶음으로 보고 Green 도달 후 커밋한다.
- **형식**: Conventional Commits — `<type>(<scope>): <제목>`
  - type: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`
  - **제목은 한국어로 쓴다.** 명령형으로 간결하게.
  - 예: `feat(todo): 할 일 필터 기능 추가`, `test(todo): reducer 엣지 케이스 테스트 추가`

### 커밋 메시지 금지 사항 (필수)

- 커밋 메시지에 Claude, AI, 또는 자동 생성 도구가 작성했다는 어떤 언급도 넣지 않는다.
- `Co-Authored-By` 트레일러를 넣지 않는다.
- "Generated with", "🤖" 등 도구 서명/푸터를 넣지 않는다.
- 커밋 메시지는 사람이 쓴 것처럼 작업 내용만 담는다.

### 푸시

- `git push`는 가드레일 대상이다. 절대 자동 실행하지 않고 사용자 승인을 받는다.
- 로컬 작업(브랜치 생성·전환, 커밋, 로컬 병합)은 자율적으로 진행한다.

---

## 기록 — 의사결정 · 리뷰 · 작업 로그 (관측성)

프로젝트는 세 종류의 기록을 남긴다. 기록 파일은 **프로젝트 레포 안**에 둔다 (user-level 아님).
기록 파일을 만들거나 갱신하는 커밋은 `docs` type을 쓴다.

### 의사결정 기록 (ADR) — `docs/decisions/`

- 위치: `docs/decisions/NNNN-제목.md` — 4자리 번호, `0001`부터 순차.
- 시점: 중요한 결정을 내리는 **그 자리에서** 작성한다. 나중에 몰아 쓰지 않는다.
- "중요한 결정"의 범위: 기술/라이브러리 선택, 아키텍처·구조 결정, 명시적 트레이드오프,
  요구사항의 모호함을 가정으로 메운 경우. 사소한 것은 기록하지 않는다 —
  나중에 "왜 이렇게 했지?"가 나올 만한 것만.
- 형식:
  ```
  # NNNN. 제목
  - 상태: 채택 | 대체됨(→ NNNN) | 폐기
  - 날짜: YYYY-MM-DD

  ## 배경
  어떤 상황·문제였는가.

  ## 결정
  무엇으로 정했는가.

  ## 이유와 대안
  왜 그것을 골랐는가. 어떤 대안을 검토하고 버렸는가.

  ## 영향
  이 결정이 만드는 결과·제약.
  ```

### 리뷰 기록 — `docs/reviews/`

- 위치: `docs/reviews/YYYY-MM-DD-작업제목.md` — 작업(=`/feature` 실행)마다 파일 하나.
- 작성자: 개발 직원이 작성한다(리뷰 직원이 아니다). 지적사항뿐 아니라 그것을 **어떻게 고쳤는지**까지 담아야 하기 때문이다.
- 시점: 리뷰 직원의 검토가 끝나고 최종 판정이 난 뒤 작성한다. 라운드가 여러 번이면 라운드별로 모두 남긴다.
- 목적: 리뷰어가 자주 잡는 패턴을 누적해, 반복되는 지적은 CONVENTIONS.md에 반영하는 하네스 진화의 입력으로 쓴다.
- 형식:
  ```
  # 리뷰 기록 — <작업 제목>
  - 날짜: YYYY-MM-DD
  - 브랜치: feat/...
  - 최종 판정: 통과 (N라운드)

  ## 1라운드
  - 판정: 수정 필요
  - 검증: verify 결과 요약
  - 지적사항:
    - [P1] 파일·라인 — 내용
    - [P2] 파일·라인 — 내용
  - 반영: 각 지적을 어떻게 고쳤는지

  ## 2라운드
  - 판정: 통과
  - 검증: verify 결과 요약
  - 신규 결함: 없음
  ```

### 작업 로그 — `docs/worklog.md`

- 위치: 프로젝트 루트의 `docs/worklog.md` 단일 파일. 새 항목을 **맨 위에** 추가(최신이 위).
- 시점: `/feature` 작업 하나가 끝날 때 항목 하나를 추가한다.
- 항목 형식:
  ```
  ## YYYY-MM-DD — <작업 제목>
  - 브랜치: feat/...
  - 한 일: 핵심 변경 요약
  - 검증: verify 결과 (예: 테스트 28개 통과)
  - 리뷰: 최종 판정 요약 (예: 통과 2라운드) — 상세: docs/reviews/YYYY-MM-DD-작업제목.md
  - 가정: 진행 중 합리적 가정으로 메운 부분 (없으면 생략)
  - 관련 결정: docs/decisions/NNNN (있으면)
  ```
