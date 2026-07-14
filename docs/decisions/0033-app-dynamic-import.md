# 0033. 셸 콘텐츠 앱 3개 lazy 분리

- 상태: 채택 (라운드1 P1 반영으로 5→3 좁힘)
- 날짜: 2026-07-14

## 배경

`RuehanixShell` 이 9개 앱을 모두 정적 import 해서 초기 번들에 합류시키고 있었다.
사용자가 한 번에 모든 앱을 쓸 일은 드물고(데스크톱 셸이라 몇 개만 동시 노출),
lazy 분리가 효과적인 앱은 코드량이 큰 앱에 한정된다.

ADR 0031 에서 YouTubeEngine 만 lazy 분리한 후속으로 메인 콘텐츠 앱을 다룬다.

## 결정

**3개 앱을 `next/dynamic` + `ssr: false` 로 lazy 분리한다.**

- `ReaderApp` (265줄), `MusicApp` (219줄), `SettingsApp` (268줄)
- 200줄 이상인 앱 + 자식 헬퍼(`ArtistDirectory`·`AppearancePanel`·`ReaderSidebar` 등)
  무게가 큰 3개.
- 나머지 6개(`AboutApp` 41 / `FilesApp` 59 / `FotoApp` 35 / `HotlapApp` 48 /
  `TerminalApp` 57 / `WebApp` 59)는 정적 유지. 정적 후보 중 가장 큰 `FilesApp` /
  `WebApp` (각 59줄)도 동적 후보의 절반 미만이고 자체 deps 가 가벼움
  (Folder / EmptyPosts / clickable). 분리 이득 미미.
- `apps.tsx` 배럴은 그대로 유지 — 외부 import 호환.

## 영향 — 실측치 기반

`.next/server/app/index.html` 기준 chunk gzip 합산 비교:

- main 단일 chunk 1개 (185,931 B gzip)
- feat/app-dynamic-import: 2개 chunk 합산 (233,146 B gzip)
- delta: **+47,215 B gzip (증가)**

증가 원인 두 가지.

1. Turbopack 이 3앱 코드를 별도 chunk 에 묶지만 그 chunk 도 `index.html` 의
   `<script async>` 에 포함되어 초기 로드에 함께 전송됨. 진정한 lazy chunk 요청은
   일어나지 않음.
2. 단일 chunk 가 둘로 쪼개지면서 gzip 압축 효율 저하.

게다가 `RuehanixShell.tsx` 의 9개 `<Win>` 컴포넌트가 항상 마운트되므로 dynamic
wrapper 도 즉시 마운트 → manifest 의 lazy chunk 가 사실상 즉시 요청됨.

따라서 이번 커밋이 달성한 것은 **chunk 그래프 분리 + manifest 항목 생성**이지,
실측 가능한 초기 전송량 감소는 아니다. 진정한 lazy 효과는 다음 후속작업
"visible-기반 lazy mount" 가 적용되어야 실현된다 (9개 Win 중 보이는 것만 마운트).

## 이유와 대안

- **9개 전부 dynamic** — 작은 앱의 분할 이득 미미. 임팩트 큰 3개에 집중.
- **visible-기반 lazy mount** — 큰 변경. 다음 단계에서 별도 ADR.
- **chunk 분리 없이 끝** — 정적 분할 그래프만 유지. 후속의 mount 게이팅으로
  효과를 살릴 기반.

## 후속 작업

- `Win` 의 children 을 `visibleIds` 기반으로 조건부 마운트 → dynamic 3앱이 정말
  가시 시점에만 로드. 초기 전송량 감소가 비로소 실현됨.
- 9개 전부 dynamic 일관성 검토 — 임팩트 측정 후.

## 라운드1 리뷰 P1 반영

- 5앱 → 3앱 좁힘 (Reader/Music/Settings 만). 줄 수 기준 명시.
- 사이즈 영향 추정 → 실측치로 교체. 가짜 감소 약속 삭제.
- "lazy chunk 다운로드" 는 visible-기반 mount 후 실현됨을 분명히.