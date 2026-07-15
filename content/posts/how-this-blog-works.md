---
title: 이 블로그의 셸, 어떻게 동작하나
category: dev
excerpt: Hyprland 스타일 데스크톱 셸을 닮은 블로그. 9개 앱 + floating + persistence + Sanity 자동 발행. 셸·콘텐츠 운영·번들 측정까지 한 페이지 요약.
slug: how-this-blog-works
readingTime: 7분
publishedAt: 2026-07-15
---

# 이 블로그의 셸, 어떻게 동작하나

이 블로그는 데모이자 실제 운영 블로그다. Hyprland 의 데스크톱 셸을 닮은 UI 안에서
콘텐츠가 동작한다 — `Files`/`Reader`/`Foto`/`Music` 같은 앱이 윈도우로 떠 있고,
단축키로 워크스페이스를 옮긴다. 이 글은 그 셸과 운영 흐름을 한 페이지로 정리한다.

## 셸 아키텍처

셸은 **9개 앱 + floating + persistence** 세 축으로 동작한다.

```ts
// components/ruehanix/RuehanixShell.tsx
const ReaderApp = dynamic(() => import("./ReaderApp").then((m) => m.ReaderApp), { ssr: false });
const MusicApp = dynamic(() => import("./MusicApp").then((m) => m.MusicApp), { ssr: false });
const SettingsApp = dynamic(() => import("./SettingsApp").then((m) => m.SettingsApp), { ssr: false });
// ... 6개 더 (About/Files/Foto/Hotlap/Terminal/Web)
```

- **9개 앱 모두 `next/dynamic` + `ssr: false`** — 초기 번들에서 제외. 첫 진입 시
  visibleIds 가 비어 chunk 0회 다운로드. 가시 시점 + dynamic loader 캐시로
  minimize/restore 즉시.
- **Win 가시 게이트** — `vm.tiles[app].display === "none"` 이면 chrome+children
  미렌더. `preserveLocalState` 옵션으로 FotoApp 폴더 view 는 ws 전환 사이
  유지.
- **floating** — `Super+G` 토글, titlebar 드래그, 우하단 리사이즈 핸들. free rect
  + 150+ z-index, focused 시 200. `rh-layout` v2 슬라이스로 영속.
- **단축키** — Hyprland 스타일: `Super+1-6` ws, `Super+Shift+1-6` move-to-ws,
  `Super+Shift+←/→` tile swap, `Super+F` maximize, `Super+G` floating,
  `Super+Q` close, `Super+D` 런처, `Super+/` Keybindings.

## 콘텐츠 운영

`content/posts/<slug>.md` 가 **단일 진실**. `npm run sync-posts` 가 md → Sanity
Portable Text NDJSON 변환 + dataset 일괄 import.

```bash
npm run sync-posts              # ndjson 생성 + Sanity import
npm run sync-posts:check        # 정합성 검사 (드리프트 감지)
npm run sync-posts -- --no-import  # ndjson 만, Sanity 호출 skip
```

`SANITY_IMPORT_TOKEN` env 가 `.env.local` 에 있으면 자동 import. 없으면
ndjson 만 + 경고. `--replace` 플래그로 동일 `_id` (`post.${slug}`) 의
`createOrReplace` — 다른 doc (photo/artist/album) 영향 0.

`/api/revalidate` 가 Sanity import 후 자동 호출. `REVALIDATE_SECRET` env
설정 시 secret header 검사 + `revalidatePath('/'·'/posts'·'/feed.xml'·'/sitemap.xml')`.

## 코드 블록 — shiki 듀얼 테마

빌드 시점에 shiki 가 catppuccin mocha/latte 듀얼 테마 HTML 로 변환,
`codeBlock.highlightedCode` 필드에 박는다. 사이트 fetch 시 그대로
`dangerouslySetInnerHTML` 주입 — 클라이언트 JS 토큰화 0.

Studio 직접 편집(필드 부재)시는 `CodeBlockClient` 가 클라이언트 dynamic
import shiki 로 lazy 폴백. 두 경로 모두 색 적용.

## 운영 측정

| 항목 | 값 |
|---|---|
| 전체 client chunks gzip | 4.57 MB |
| App-only gzip | 2.94 MB |
| 압축률 | 79% |
| 첫 진입 다운로드 | ~300KB (visibleIds 비어 0개 앱) |

`scripts/measure-chunks.mjs` 가 빌드 후 자동 측정. 임계치 3.2MB (app gzip)
초과 시 exit 1. CI 단계로 추가 가능.

## 결론

데스크톱 셸 + Sanity 의 결합은 콘텐츠 운영을 단순하게 유지한다 — md 가
진실, sync-posts 가 자동화, Studio 는 보조. floating + visible 게이트 +
dynamic lazy 가 초기 전송량을 의도된 만큼만 유지한다. 작은 셸 + 작은 사이트.

다음 글: 새 글 작성 → `content/posts/<slug>.md` + `npm run sync-posts`.