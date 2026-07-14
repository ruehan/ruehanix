# 0037. 사진 폴더 뷰 + 우측 info 패널 + lightbox

- 상태: 채택
- 날짜: 2026-07-14

## 배경

`FotoApp` 이 단순 그리드 — 모든 사진을 평면 나열. 폴더·카테고리·상세 정보가
없음. Sanity photoType 도 `folder` / `description` 필드 부재로 사용자가 Studio 에서
설명을 한 줄 적을 곳이 없었음.

## 결정

### Sanity schema (photoType)
- `folder` (string, optional) — 1단계 분류. 자유 입력. 비우면 "(미분류)" 폴더로
  자동 모음.
- `description` (text, 1줄, optional) — info 패널에 표시.
- `orderings` 에 `folder → order` 추가.

### Data layer
- `lib/photos/group-by-folder.ts` (순수) — `groupByFolder(photos)` → 명시 folder 는
  이름 사전순(localeCompare "ko"), UNCATEGORIZED 는 항상 마지막, 각 그룹 내
  photos 는 입력 순서.
- `lib/photos/normalize.ts` — `folder` / `description` trim + undefined 폴백.
- `lib/photos/queries.ts` GROQ — `folder, description` 추가 투영.
- `lib/ruehanix/types.ts` `Photo` — `folder?` / `description?` optional.

### UI (FotoApp)
- 2단계 뷰:
  - `folders`: 폴더 그리드 (첫 화면). 각 폴더의 첫 사진을 커버.
  - `folder`: 진입 — 좌측 사진 그리드 + 우측 info 패널(240px).
- 클릭: 그리드에서 사진 선택 → info 패널 갱신.
- 더블클릭: lightbox (full-screen modal) — ←/→/ESC.
- 폴더 진입/이탈/그리드 선택은 `View` 단일 state 의 selectedIdx 파생 — useEffect
  + setState cascade 회피 (Next 16 React 19 의 새 lint "Calling setState
  synchronously within an effect" 대응).

## 이유와 대안

- **folder predefined list** — 자유 입력 채택. list 강제는 사용자가 Studio 매번
  list 추가해야 함.
- **info panel bottom** — right sidebar 채택. 사진 그리드 좌측이 메인이라는
  데스크톱 셸 정합.
- **lightbox 슬라이드 없음** — 채택(←→ 키).
- **folder 없는 사진 root 표시** — 미분류 폴더 자동 모음 채택. 기존 데이터 호환.
- **3+ 단계 (folder > subfolder > photos)** — 단일 folder 만. 향후 필요 시 확장.

## 영향

- Studio 에서 photo 문서에 folder/description 추가 가능. 기존 문서는 영향 없음
  (optional).
- FotoApp 진입 시 폴더 그리드 → 폴더 진입 → 그리드 + info. 2-depth.
- next/image 그대로 사용 (lightbox 도 fill 모드 + sizes).

## 후속 작업

- 폴더 진입 키보드 (← 폴더, Enter 진입).
- 슬라이드쇼 자동 진행 옵션.
- subfolder (2단계 분류) — 필요 시.
