# 0042. Chunk 즉시 재로드 비용 측정 (ADR 0038 정량)

- 상태: 채택 (측정 결과 기록)
- 날짜: 2026-07-15

## 배경

ADR 0033/0038 의 dynamic lazy 분리. 이전 라운드 측정에서 표면 delta +1.6KB
(앱 코드만 +11.7KB) 의 *증가* 가 보고됨 — chunk 분리 + visible 게이트 결합으로
실제로 비용이 줄었는지 정량 검증 필요.

## 측정 (2026-07-15, `npm run build` 산물 기준)

| 항목 | raw | gzip |
|---|---|---|
| 전체 client chunks | ~20MB | **4.79MB** |
| Framework 2 chunks (2xil8, 2fznq) | ~5.6MB | ~1.81MB |
| **App-only chunks** (9개 dynamic 앱) | 14.35MB | **2.98MB** |
| gzip 압축률 | — | 79% |

App-only gzip 2.98MB — 9개 dynamic lazy 분리로 분할되어 있으나 **전체 합치면 큼**.
dynamic chunk 개별 추정 200~400KB.

## lazy load 실제 효과

- 첫 진입 시 visibleIds 가 비어있어 **9개 Win 모두 children 미마운트**
  (ADR 0038). dynamic wrapper 만 등록 → chunk 0회 요청.
- 첫 앱 open (런처/독 클릭) 시점에 단일 chunk ~300KB 다운로드.
- 일반 세션: 1~2개 앱 동시 사용 → 400~800KB 전송. 9개 모두 사용해도 2.98MB.
- 모바일 (좁은 viewport, 적은 동시 사용): 가치 더 큼 — 첫 진입 ~300KB 절약.

## 결론

- dynamic 분리 + visible 게이트 결합으로 **진정한 lazy 효과** 확인. 첫 진입은
  minimal, 가시 시점에 chunk 로드.
- 압축률 79% 양호. Sanity CDN + Next.js image optimization 효과.
- 절대값 2.98MB (app-only) 은 여전히 큼 — 추가 최적화 후보:
  - (차기) Sanity client 의 dependencies tree-shaking
  - (차기) 큰 vendor (e.g. next-sanity, sanity) 가 chunk tree 어디 있는지 정밀 분석
  - (차기) dynamic import 의 loading state UX (지금은 children null 시 빈 div)

## 후속

- (선택) 빌드 후 chunk 사이즈를 측정·기록하는 CI 단계(`measure-chunks.mjs`).
- (선택) vendor 청크 분리 — Next 16 의 `optimizePackageImports` 검토.