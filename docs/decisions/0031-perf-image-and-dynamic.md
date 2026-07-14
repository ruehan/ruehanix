# 0031. FotoApp next/image + YouTubeEngine dynamic import

- 상태: 채택
- 날짜: 2026-07-14

## 배경

사진 그리드와 음악 재생 엔진에서 다음 비효율이 있었다.

- FotoApp 의 사진 그리드 — Sanity CDN 외부 호스트 `<img>` 직접 사용. lazy 만 켜 있고
  차세대 포맷(WebP/AVIF)·sizes 기반 srcset·LQIP placeholder·CLS 방어가 없음.
- YouTubeEngine(138줄 + 외부 IFrame API) — 셸 루트에서 정적 import. 초기 번들에 합류.
  사용자가 음악을 듣지 않아도 다운로드/파싱 비용 발생.
- music 앱 내부의 작은 아바타/앨범 커버 (`<img src={photoUrl} alt={name} style={{width:size,height:size,...}}>`)
  — 22~42px 수준. 차세대 포맷 가성비 적음. 이번 작업에선 그대로 둔다.

## 결정

### FotoApp 그리드
- Sanity CDN 호스트를 `next.config.mjs` 의 `images.remotePatterns` 에 등록.
- 그리드 셀의 `<img>` 를 `next/image fill` 모드로 교체. 부모는 `position: relative` 추가.
- `sizes="(max-width: 768px) 33vw, 200px"` 로 모바일/데스크톱 srcset 분리.

### YouTubeEngine
- `next/dynamic` 으로 lazy 로드. `ssr: false` 로 클라이언트 전용.
- 게이팅은 `vm.player.hasTracks` (트랙 0개일 때만 엔진 미마운트). 트랙이 한 번이라도
  있으면 이후 모든 세션에서 chunk 가 로드된다. 즉 "음악 미사용 세션 비용 0" 은
  트랙이 0개인 사용자에 한해 진실.

### 변경하지 않음
- MusicApp 의 작은 아바타/앨범 커버 — 현재 22~42px. next/image 변환 시 width/height 가
  명시되어 있긴 하나 캐시·srcset 차이가 거의 없음. 차기 작업 후보.

## 이유와 대안

- **모든 `<img>` 를 일괄 next/image 로** — 작아 가성비 안 되는 곳까지 작업하면 비용 ↑
  (테스트·검토). 큰 임팩트만 우선.
- **WebApp/MusicApp 자체도 dynamic import** — 큰 작업. 셸이 한 번에 9앱을 다 import 하지
  않는 구조가 다음 단계. 차기 작업.
- **Image CDN (Cloudinary 등) 도입** — 외부 의존성. Sanity 자체 image pipeline 이 cdn.sanity.io
  로 자동 변환을 제공. Sanity 의 url-builder 사용이 다음 단계.

## 영향

- FotoApp 첫 진입 시 이미지 요청 수·용량 감소 (특히 모바일)
- YouTubeEngine lazy 분리 — 음악 미사용 세션 초기 JS ~수 KB 감소
- next.config 에 외부 호스트 정책 1건 추가 — 향후 다른 외부 호스트 사용 시에도 같은 패턴