# Daily.md: 로컬 standup 초안 생성기를 만든 이야기

## 왜 만들었나

매일 "어제 한 일 / 오늘 할 일 / 블로커" 형식으로 standup을 작성하는 일은 많은 개발자에게 반복되는 작은 마찰이다.

필요한 데이터는 이미 여기저기에 존재한다. 어제 작성한 git commit, merge한 PR, 남긴 PR 리뷰, 닫은 issue. 문제는 이런 기록이 로컬 git과 GitHub에 흩어져 있어서 매번 직접 찾아보고 다시 정리해야 한다는 점이다.

기존 standup 도구는 대부분 SaaS와 팀 채팅을 중심으로 설계되어 있다. 일부 제품은 AI 요약이나 활동 기반 draft 생성까지 지원하지만, 내가 찾은 범위에서는 다음 네 가지를 동시에 만족하는 도구를 찾지 못했다.

- 데스크톱 네이티브 앱
- 로컬 git 활동 자동 수집
- 사용자가 직접 API 키를 연결하는 BYOK 방식의 AI
- 특정 플랫폼에 종속되지 않는 자유로운 출력 포맷

그래서 직접 만들기로 했다.

**Daily.md의 목표는 이 네 가지를 하나의 제품에서 결합하는 것이다.**

| 축     | 일반적인 접근                   | Daily.md                                          |
| ------ | ------------------------------- | ------------------------------------------------- |
| 형태   | 팀 채팅 봇 / 웹앱               | **데스크톱 네이티브**                             |
| 데이터 | 수동 입력 또는 외부 서비스 연동 | **로컬 git 직접 수집 + GitHub 연동 예정**         |
| AI     | 제품 내장 AI                    | **Claude BYOK + OS Keychain**                     |
| 출력   | 특정 플랫폼 중심                | **Markdown 우선, Slack mrkdwn / Plain 지원 예정** |

현재 dogfood 가능한 버전에서는 로컬 git commit과 사용자 메모를 기반으로 Markdown standup draft를 생성한다.

Daily.md 자체의 별도 서버에는 개발 데이터를 저장하지 않는다. 원본 git 데이터는 로컬에서 직접 읽고, draft 생성에 필요한 컨텍스트만 사용자가 설정한 Claude API로 직접 전송한다.

완전한 local-only 앱이라기보다는 **local-first desktop app**에 가깝다.

---

## 왜 Tauri인가

이 앱에는 세 가지가 동시에 필요했다.

- 데스크톱 네이티브 앱
- 로컬 파일과 git repository 접근
- OS Keychain 같은 시스템 API 사용

Electron도 후보였지만, Rust 백엔드를 중심으로 SQLite, `git2`, `keyring` 같은 생태계를 직접 사용하는 편이 이 프로젝트에는 더 자연스러웠다.

프론트엔드는 Svelte 5를 사용했다.

특히 Runes의 `$state`를 사용하니 AI draft 생성처럼 비동기 요청에 따라 상태가 바뀌는 흐름을 단순하게 관리할 수 있었다. TypeScript 쪽에서는 Feature-Sliced Design 구조를 적용해 `features/clipboard`, `features/editor`처럼 기능 경계를 분리했다.

거대한 앱은 아니지만, 처음부터 경계를 명확하게 잡아두니 기능이 늘어나도 한 영역의 변경이 다른 영역으로 번지는 일을 줄일 수 있었다.

---

## 핵심 결정 4가지

### 1. git2 + vendored libgit2

Rust에서 git repository를 다룰 때 `git2`를 사용했다.

`git2-rs`는 상황에 따라 시스템에 설치된 libgit2를 사용하거나 bundled libgit2를 빌드할 수 있다. 하지만 개발 머신과 CI 환경에 따라 링크 방식이 달라지는 것을 피하고, 가능한 한 동일한 조건에서 재현 가능한 빌드를 만들고 싶었다.

그래서 vendored libgit2를 명시적으로 사용했다.

시스템에 설치된 libgit2 버전이나 환경 차이에 덜 의존하게 되었고, 데스크톱 앱에서는 이로 인한 번들 크기 증가도 충분히 감수할 수 있다고 판단했다.

중요한 것은 "의존성이 완전히 0이 되었다"는 것보다는, **외부 시스템 라이브러리에 대한 런타임 및 빌드 환경 의존성을 줄였다는 점**이다.

---

### 2. Claude API와 HTTP 클라이언트

Claude API 호출에는 `reqwest`와 `rustls-tls`를 사용했다.

OpenSSL에 대한 별도 시스템 의존성을 피하고 싶었기 때문에 TLS 구현은 rustls를 선택했다.

초기 구현에서는 호출 구조를 단순하게 유지하기 위해 blocking client를 사용했지만, 네트워크 요청은 호출 빈도와 관계없이 현재 실행 thread를 오래 점유할 수 있다. 특히 LLM API는 일반적인 HTTP 요청보다 응답 시간이 길어질 수 있기 때문에 UI thread를 차단하지 않는 구조가 중요하다.

따라서 실제 command 경계에서는 별도 blocking task로 분리하거나 async `reqwest::Client` 기반으로 전환할 수 있도록 구조를 유지했다.

현재 시스템 프롬프트의 핵심은 단순하다.

```rust
const SYSTEM_PROMPT: &str = "당신은 개발자의 daily standup 작성을 돕는 도우미입니다. \
입력으로 어제 commit 목록과 오늘 메모, 블로커 메모를 받습니다. \
다음 형식의 마크다운으로만 응답하세요:\n\n\
## 어제\n…\n\n## 오늘 할 일\n…\n\n## 블로커\n…";
```

복잡한 structured output보다, 사람이 바로 읽고 수정할 수 있는 Markdown을 우선했다.

---

### 3. BYOK API 키는 OS Keychain

Claude API 키는 평문 설정 파일이 아니라 OS Keychain에 저장한다.

- macOS Keychain
- Windows Credential Manager
- Linux Secret Service

Rust의 `keyring` 크레이트를 통해 OS별 저장 방식을 추상화했다.

```rust
pub trait Keychain {
    fn set(&self, provider: &str, key: &str) -> Result<(), String>;
    fn get(&self, provider: &str) -> Result<Option<String>, String>;
    fn delete(&self, provider: &str) -> Result<bool, String>;
    fn has(&self, provider: &str) -> Result<bool, String>;
}
```

Keychain 접근을 trait으로 분리한 이유는 테스트 때문이다.

단위 테스트에서는 mock 구현을 사용하고, 실제 OS Keychain에 접근하는 통합 테스트는 `#[ignore]`로 분리했다.

그 결과 CI에서는 외부 OS 환경에 의존하지 않는 88개 테스트를 실행하고, 실제 Keychain 연동을 검증하는 2개 테스트는 개발 머신에서 별도로 실행할 수 있게 했다.

이 구조 덕분에 CI 안정성과 실제 시스템 통합 검증을 둘 다 가져갈 수 있었다.

---

### 4. AI 응답은 단일 Markdown

처음부터 Claude 응답을 복잡한 JSON schema로 만들지는 않았다.

standup 결과에는 세 섹션만 필요하다.

```markdown
## 어제

## 오늘 할 일

## 블로커
```

그래서 시스템 프롬프트를 통해 이 세 섹션만 반환하도록 출력 형식을 강하게 제약했다.

응답을 별도의 복잡한 AST나 데이터 구조로 파싱하지 않고 그대로 editor에 표시할 수 있다는 것이 장점이다.

다만 프롬프트만으로 출력 형식이 100% 보장되는 것은 아니기 때문에, 최소한 다음 세 heading이 존재하는지는 검증할 수 있다.

- `## 어제`
- `## 오늘 할 일`
- `## 블로커`

복잡한 parser까지 만들 필요는 없지만, 예상하지 못한 자유 형식 응답을 그대로 정상 결과로 취급하는 것은 피하고 싶었다.

---

## 흥미로운 함정: revwalk의 Sort::TIME

`collect_commits`를 구현한 뒤 첫 번째 코드 리뷰에서 P1으로 잡힌 문제가 있었다.

`git2::Revwalk::push_head()`만 호출하면 기본 정렬은 `Sort::NONE`이다. 즉, commit이 시간순으로 나온다고 가정할 수 없다.

문제는 당시 코드에 이런 조기 종료 로직이 있었다는 점이다.

```rust
if ts < since {
    break;
}
```

이 코드는 현재 순회 중인 commit이 조회 범위보다 오래됐다면 이후 commit도 모두 더 오래됐을 것이라고 가정한다.

하지만 순회 순서가 시간순이 아니라면 이 가정은 성립하지 않는다.

예를 들어 rebase, cherry-pick, `--committer-date-is-author-date` 같은 상황에서는 비단조적인 commit timestamp가 존재할 수 있고, 그 결과 아직 조회해야 할 commit이 뒤에 남아 있음에도 탐색을 조기에 종료할 수 있다.

더 위험한 점은 crash가 발생하는 것이 아니라 **일부 commit이 누락된 잘못된 결과를 조용히 반환한다는 것**이었다.

해결 자체는 한 줄이었다.

```rust
revwalk.set_sorting(git2::Sort::TIME)?;
```

시간 기준으로 정렬하면 최신 commit부터 오래된 commit 순서로 탐색된다는 전제 아래, `ts < since` 시점에서 안전하게 탐색을 종료할 수 있다.

하지만 코드 한 줄보다 더 중요했던 것은 회귀 테스트였다.

다음 케이스를 추가했다.

> HEAD의 timestamp는 조회 윈도우 이전이지만, parent commit은 조회 윈도우 안에 존재한다.

`Sort::TIME` 설정을 제거하면 이 테스트가 실패한다.

버그를 고치는 것보다, 같은 종류의 버그가 다시 돌아오지 못하게 만드는 것이 더 중요했다.

---

## dogfood 한 단계씩

### Sprint 0: 셋업

Tauri 2 + Svelte 5 기반 프로젝트를 만들고 Rust와 Node 양쪽을 한 번에 검증하는 글로벌 `verify.sh` 스크립트를 구성했다.

```bash
bash ~/.config/opencode/scripts/verify.sh
```

초기 단계부터 ADR, Architecture Decision Record도 작성하기 시작했다.

기술 선택을 할 때마다 다음을 기록했다.

- 무엇을 결정했는가
- 왜 이 방법을 선택했는가
- 어떤 대안을 검토했는가
- 어떤 trade-off를 받아들였는가

작은 프로젝트에서 ADR이 과할 수도 있다고 생각했지만, 시간이 조금만 지나도 "왜 이걸 이렇게 만들었지?"라는 질문이 생겼다.

그때 ADR이 결정의 source of truth 역할을 했다.

---

### Sprint 1: 데이터

첫 번째 핵심은 AI가 아니라 데이터 수집이었다.

구현한 것은 다음과 같다.

- watch roots 도메인과 SQLite 저장
- `git2` 기반 git commit 수집
- 사용자의 로컬 timezone 기준 전날 00:00 이상, 당일 00:00 미만의 commit 조회
- Markdown 변환 및 표시
- `marked` + DOMPurify 기반 렌더링

다중 repository 순회에는 best-effort 정책을 적용했다.

하나의 repository에서 오류가 발생하더라도 다른 repository의 commit 수집까지 중단하지 않는다.

개발자의 로컬 환경에는 깨진 repository, 접근 권한 문제, detached state 등 다양한 예외 상황이 존재할 수 있기 때문이다.

Daily.md에서는 하나의 실패보다 가능한 데이터를 최대한 수집하는 쪽을 선택했다.

---

### Sprint 2: AI

그다음은 AI draft 생성이었다.

구현 순서는 다음과 같았다.

Keychain 통합 → Claude API client → 사용자 메모 입력 → 세 섹션 Markdown draft 생성.

정식 Settings 화면은 아직 없기 때문에 현재는 inline modal을 통해 API 키를 입력한다.

사용자는 다음 세 종류의 데이터를 제공한다.

- 어제의 git commit
- 오늘 할 일 메모
- 블로커 메모

Claude는 이를 다음 형태로 정리한다.

```markdown
## 어제

...

## 오늘 할 일

...

## 블로커

...
```

목표는 완성된 보고서를 대신 작성하는 것이 아니다.

**빈 화면에서 시작하지 않게 하는 것.**

Daily.md가 첫 draft를 만들고, 사용자는 필요한 부분만 수정한다.

---

### Sprint 3: UX

생성된 draft는 일반 `textarea` editor에서 바로 수정할 수 있다.

현재 주요 단축키는 다음과 같다.

- `⌘ + Enter`: 클립보드 복사
- `⌘ + R`: draft 재생성
- `Esc`: editor focus 해제

undo/redo는 별도의 history stack을 구현하지 않고 `<textarea>`의 native browser behavior를 사용한다.

필요하지 않은 추상화를 만들지 않는 것도 하나의 결정이었다.

---

### Sprint 2 후속: 캐싱과 비용 추적

현재 작업 중인 부분이다.

같은 commit 데이터와 같은 메모 조합으로 여러 번 draft를 생성하는 경우가 생각보다 많다.

그래서 24시간 TTL 기반 캐시와 일일·월간 토큰 카운터를 추가하고 있다.

캐시 키에는 단순히 사용자 입력만 넣으면 안 된다.

적어도 다음 정보가 포함되어야 한다.

- commit 데이터
- 오늘 메모
- 블로커 메모
- 사용 모델
- 시스템 프롬프트 버전
- 결과에 영향을 주는 AI 설정

예를 들어 시스템 프롬프트가 바뀌었는데 입력 데이터가 같다는 이유로 이전 결과를 반환해서는 안 된다.

개념적으로는 이런 형태다.

```text
cache_key = hash(
  commits
  + today_memo
  + blocker_memo
  + model
  + prompt_version
)
```

캐싱은 단순한 성능 최적화가 아니다.

LLM API에서는 같은 입력의 불필요한 재호출을 줄여 응답 속도와 비용을 동시에 개선할 수 있다.

---

## 현재 상태와 남은 것

현재 dogfood 가능한 범위는 다음과 같다.

- 로컬 git repository 등록
- 전날 commit 자동 수집
- 오늘 할 일 / 블로커 메모 입력
- Claude BYOK 기반 Markdown standup draft 생성
- editor 수정
- 클립보드 복사
- OS Keychain 기반 API 키 저장

앞으로 남은 작업은 다음과 같다.

### Sprint 2 후속

- 24시간 TTL 캐싱
- 일일 / 월간 토큰 카운터

### Sprint 3 마무리

- Markdown → Slack mrkdwn 변환
- Plain text 출력
- JSON export / import

### Sprint 4

- GitHub OAuth Device Flow
- 전날 PR / issue / review / comment 수집
- 시스템 리마인더
- Onboarding 5단계

### Sprint 5

- 정식 Settings 화면
- 히스토리 뷰
- macOS / Windows / Linux 빌드
- CI 및 release pipeline

---

## 빌드 / 실행

```bash
pnpm install

pnpm tauri:dev
# 데스크톱 개발 모드

pnpm tauri:build
# 패키징

bash ~/.config/opencode/scripts/verify.sh
# Rust + Node 전체 검증
```

---

## 느낀 점

### ADR은 결정의 source of truth가 됐다

ADR을 나중에 정리하지 않고 결정을 내린 바로 그 시점에 적는 습관이 생각보다 효과적이었다.

며칠만 지나도 기술 선택의 세부 이유는 흐려진다.

"왜 SQLite였지?"

"왜 이걸 async로 안 했지?"

"왜 이 dependency를 사용했지?"

그 답이 코드가 아니라 ADR에 남아 있다는 것이 좋았다.

---

### TDD의 가치는 버그를 고친 뒤 더 크게 느꼈다

`revwalk` 문제에서 가장 중요한 것은 `Sort::TIME` 한 줄을 추가한 일이 아니었다.

그 한 줄이 사라지면 반드시 실패하는 테스트를 만든 것이 더 중요했다.

mock 기반 단위 테스트와 `#[ignore]` 기반 실제 OS 통합 테스트를 분리하니 CI 안정성과 실제 환경 검증도 함께 가져갈 수 있었다.

Red → Green 사이클은 단순히 테스트 개수를 늘리는 과정이라기보다, 내가 어떤 동작을 보장하고 싶은지를 코드로 명시하는 과정에 가까웠다.

---

### 4중 결합 identity가 제품 결정의 기준이 됐다

Daily.md의 identity는 네 가지다.

- Desktop native
- Local-first data collection
- BYOK AI
- Format freedom

새로운 feature 아이디어가 생겼을 때 이 네 축 중 어디에 기여하는지를 물으면 우선순위가 조금 더 명확해진다.

기능이 재미있다는 이유만으로 추가하지 않고, 제품의 핵심 identity를 강화하는지 확인할 수 있다.

---

여기까지가 현재 dogfood 가능한 상태다.

이제부터는 기능 목록을 보고 다음 우선순위를 정하기보다, 실제로 매일 사용하면서 생기는 마찰을 기준으로 다음 기능을 정하려 한다.

어떤 버튼이 부족한지보다 중요한 것은 이것이다.

**내가 정말 매일 이 앱을 켜는가?**

그리고 켜지 않는 날이 생긴다면,

**왜 켜지 않았는가?**

앞으로의 우선순위는 그 답에서 결정될 것 같다.
