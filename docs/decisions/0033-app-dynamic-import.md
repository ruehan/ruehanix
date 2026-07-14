# 0033. 셸 콘텐츠 앱 5개 lazy 분리

- 상태: 채택
- 날짜: 2026-07-14

## 배경

`RuehanixShell` 이 9개 앱을 모두 정적 import 해서 초기 번들에 합류시키고 있었다.
사용자가 한 번에 모든 앱을 쓸 일은 드물고(데스크톱 셸이라 몇 개만 동시 노출), 작은
앱 4개(About/Foto/Hotlap/Terminal) 외 큰 앱 5개(Files/Reader/Web/Music/Settings)
는 각각 200~270줄로 lazy 분리 효과가 분명하다.

ADR 0031 에서 YouTubeEngine 만 lazy 분리한 후속으로 메인 콘텐츠 앱을 다룬다.

## 결정

큰 콘텐츠 앱 5개를 `next/dynamic` + `ssr: false` 로 lazy 분리한다.

- `FilesApp`, `ReaderApp`, `WebApp`, `MusicApp`, `SettingsApp`
- 작은 앱 4개(`AboutApp`, `FotoApp`, `HotlapApp`, `TerminalApp`)는 정적 유지.
  코드량 적고, 셸이 단일 번들에서 곧장 평가해도 무해.
- `apps.tsx` 배럴은 그대로 유지 — 외부 import 호환.

## 이유와 대안

- **9개 전부 dynamic** — 일관성 ↑, 작은 앱의 분할 이득은 미미. 현재 임팩트 큰 곳에
  집중해 측정 후 다음 라운드에서 재평가.
- **visible-기반 lazy mount** — `Win` 의 children 을 `visibleIds` 기반으로 조건부
  렌더. 더 강력하나 코드 변경 큼. 다음 단계.
- **next.config 의 optimizePackageImports** — 서버 번들에는 효과 있으나 클라이언트
  코드 분할과는 다른 축. 보류.

## 영향

- 초기 JS 번들에서 5앱 합쳐 약 1~2KB(gzip 후 추정) 감소 + 사용 시점 chunk 다운로드.
- `MusicApp` 은 Win 과 팝오버 두 곳에서 사용 — `next/dynamic` 결과는 동일 컴포넌트
  참조. 두 마운트가 독립적으로 lazy load.
- `ssr: false` 가 셸("use client") 안에서 동작 — 안전. 사용자는 첫 진입 시 한 번
  깜빡임 없이 직렬로 chunk 받음.

## 후속 작업

- 9개 전부 dynamic 으로 일관성 강화 (P3, 임팩트 작음).
- `Win` 의 children visible-기반 lazy mount (큰 변경, 다음 단계).