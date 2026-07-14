# 0029. styled-components deps 제거

- 상태: 채택
- 날짜: 2026-07-14

## 배경

`package.json` 에 `styled-components@^6.4.2` 가 dependencies 로 등록되어 있으나
코드베이스 내 사용처가 0건이다.

```bash
$ grep -rn "from ['\"]styled-components" --include="*.tsx" --include="*.ts" .
(0 matches)
```

`StyledComponent` API, `styled.x`, `keyframes`, `<ThemeProvider>` 모두 호출 없음.
스타일은 전부 인라인 `style={{ ... }}` 객체이며, 디자인 토큰은 `app/globals.css` 의
CSS 변수(`--surf0` 등)로 정의되어 `var(...)` 로 참조한다. 스타일드 컴포넌트의 동적
테마·SSR class 추출 기능은 사용되지 않는다.

이 상태에서 deps 는 다음 비용만 발생시킨다.

- node_modules 1~2MB
- 보안/감사 표면 (현재 6.x 에 알려진 취약점은 없으나 미래 패치 부담)
- 신규 개발자에게 "왜 있는 거지?" 라는 의문 + 잘못된 import 유인

## 결정

`styled-components` 를 dependencies 에서 제거한다. 코드 변경 없음(사용처 0).

대신 다음은 유지한다.

- 인라인 `style={{ ... }}` — 의도적으로 보존 (디자인 토큰은 CSS 변수, 동적 값은 props)
- `app/globals.css` 의 CSS 변수 — 디자인 토큰 단일 진실 공급원

만약 추후 동적 테마(class 추출 + SSR hydrate) 필요해지면 **CSS-in-JS 가 아닌**
CSS Modules 또는 `@vanilla-extract` 같은 zero-runtime 대안을 검토한다.

## 이유와 대안

- **유지** — 0 사용이더라도 향후 사용 가능성. YAGNI 위반. 거절.
- **제로 런타임 대안 도입** — 이번 작업 범위 밖. 디자인 토큰은 이미 CSS 변수로 분리됨.

## 영향

- bundle / install 시간 감소
- `next.config.mjs` 의 SSR className 추출 설정이 있다면 정리 가능. 현재 확인 결과 설정 없음.
- README/문서에 styled-components 언급 없음 확인.