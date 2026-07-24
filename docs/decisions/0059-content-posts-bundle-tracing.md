# 0059. content/posts 번들 추적 — Vercel fs.readdirSync 동작
- 상태: 채택
- 날짜: 2026-07-24

## 배경

`lib/posts/queries.ts` 가 런타임에 `fs.readdirSync('content/posts')` 와 `fs.readFileSync('content/posts/*.md')` 를 호출한다 (`lib/posts/queries.ts:29`, `lib/posts/queries.ts:19`). 빌드 산출이 Vercel 에 올라가면 `content/posts/*.md` 가 파일시스템에 그대로 존재하지 않을 수 있다 — Next.js 의 정적 File Tracer 는 정적 import 만 따라가므로 런타임 fs 호출은 추적 대상에서 빠진다. 결과:

- `readdirSync` ENOENT → `catch` 가 빈 배열 반환 (`queries.ts:31`)
- `getAllPosts` 가 빈 목록 반환 → `/`, `/posts`, `/posts/[slug]` 셋 다 글 없음 표시

ADR 0058 에서 셸·/posts·/posts/[slug] 캐시를 `revalidate=0` 으로 끊어 응답 단계 freshness 를 풀었지만, **번들 누락 자체** 는 별개 이슈다. 0058 의 후속 작업.

## 결정

`next.config.mjs` 의 top-level 에 `outputFileTracingIncludes` 를 추가한다:

```js
outputFileTracingIncludes: {
  "**": ["./content/**"],
},
```

glob `./content/**` 가 `content/posts/*.md` 외에 향후 `content/` 하위에 추가될 정적 자산(이미지, 데이터) 도 함께 따라간다. 새 글 푸시는 `content/posts/<slug>.md` 를 추가하는 표준 워크플로이므로 next.config.mjs 수정 없이 재빌드만 하면 된다.

`outputFileTracingIncludes` 는 **Next.js 16.2.9 에서 `experimental` 밖 top-level 로 이동됐다**. 빌드 시 `experimental.outputFileTracingIncludes` 를 쓰면 `Unrecognized key(s) in object: 'outputFileTracingIncludes' at "experimental"` 경고가 나오고 실제로는 적용되지 않는다 (빌드 출력에 `outputFileTracingIncludes (invalid experimental key)` 로 표시).

## 이유와 대안

- 검토한 대안 1: `getStaticProps` + `getStaticPaths` (SSG) — 빌드 시점에 md 를 import 해서 정적 HTML 생성. fs 호출이 사라진다. 단점: ADR 0058 에서 `revalidate=0` 으로 dynamic 전환 결정함. SSG 회귀는 0058 의 의도(캐시 단계 자체를 끊어 race 발생지를 제거) 와 충돌. 보류.
- 검토한 대안 2: Sanity 로 데이터 원본 전환 — `queries.ts` 를 Sanity GROQ 호출로 교체. 단점: 새 인프라(토큰, dataset, 스키마) 의존, 단순 md 파일 발행 워크플로 손실. md 파일을 콘텐츠 진실의 원천으로 쓰는 단순성 포기. 보류.
- 검토한 대안 3: 빌드 시점에 md 를 JSON 으로 변환하고 import — `import posts from "@/generated/posts.json"`. 단점: 빌드 파이프라인 추가, hot reload 깨짐 (md 저장 → import 갱신 사이클 명시 필요), 코드 분기 추가. 변경 폭 큼.
- 검토한 대안 4: `outputFileTracingIncludes` 로 `content/**` 명시 — 정적 File Tracer 에 glob 으로 번들 추적을 명시. 변경은 `next.config.mjs` 한 파일 4줄. 채택.

채택안의 장점: 변경 폭 최소 (config 한 파일), 빌드 파이프라인 추가 없음, hot reload 영향 없음, 향후 `content/` 하위에 추가되는 정적 자산(이미지, 데이터) 도 자동으로 따라옴.

## 영향

- Vercel 배포 시 `fs.readdirSync('content/posts')` 가 실제 md 파일을 본다. `getAllPosts`/`getSlugs`/`getPost` 가 의도대로 동작.
- 번들 사이즈가 md 파일 크기만큼 늘어난다 (현재 `content/posts/` 2 파일, ~수 KB 수준. 무시 가능).
- 빌드 라우트 표: `/`, `/posts`, `/posts/[slug]` 셋은 ADR 0058 영향으로 `ƒ (Dynamic)` 유지. `outputFileTracingIncludes` 는 File Tracing 단계의 변경이지 페이지 캐시 단계와 무관.
- 검증: 빌드 산출 `.next/server/app/page.js.nft.json` 에 `content/posts/*.md` 가 등장하는지 grep.
- 새 글 푸시 시 `content/posts/<slug>.md` 추가만으로 재빌드 시 자동 추적. 추가 설정 변경 불필요.

## 후속 작업 (백로그)

- 로컬 빌드와 Vercel 빌드의 File Tracing 결과가 동일한지 실 배포 1회 확인.
- `content/posts/` 가 아닌 다른 경로(예: `content/photos/`) 가 생기면 glob `./content/**` 가 이미 따라가므로 추가 작업 없음. 단, 매우 큰 정적 자산을 둔다면 glob 범위 재검토.
