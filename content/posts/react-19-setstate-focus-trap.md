---
title: React 19 setState-in-effect 회피 — focus trap 으로 풀기
category: blog
excerpt: React 19 의 "Calling setState synchronously within an effect" 린트 회피. modal 의 focus trap 을 만들며 만난 useCallback 안정화 + 순수 함수 + safeSelected derive 패턴. 3개 사례.
slug: react-19-setstate-focus-trap
readingTime: 7분
publishedAt: 2026-07-15
published: true
---

# React 19 setState-in-effect 회피 — focus trap 으로 풀기

이미지 갤러리(사진 앱)에 키보드 포커스 트랩을 만들며 React 19 의 새 린트와
만났다. 이 글은 그 과정에서 정착한 3개 패턴을 정리한다.

## 문제 — `setState synchronously within an effect`

React 19 의 새 `react-hooks/exhaustive-deps` 변형이다. effect body 안에서
`setX(...)` 를 동기 호출하면 연속 render 가 발생한다.

```ts
useEffect(() => {
  if (selected >= matches.length) setSelected(0);
}, [matches.length, selected]);
```

effect 가 의도하는 것: "matches 가 줄면 selected 를 clamp 하자". 동기 setState
가 이 의도와 충돌한다. effect 는 외부 시스템(브라우저·스토리지·서버)을 React
state 와 동기화하는 도구지, React state 를 또 다른 React state 로 변환하는
도구가 아니다. setState in effect 는 캐스케이드 렌더를 일으켜 성능을 해친다.

modal 의 focus trap 도 같은 카테고리다. "Tab 시 list 내부 cycle" — React
state 사이의 변환이라 effect 안 setState 가 자연스러워 보이지만, 같은 린트가
발동한다.

## 해결 1 — 순수 함수로 분리

`nextFocusIndex(current, count, direction)` — effect 와 무관한 순수 함수.
테스트 가능.

```ts
// lib/ruehanix/focus-trap.ts
export function nextFocusIndex(
  current: number,
  count: number,
  direction: 0 | 1 | -1,
): number {
  if (count <= 0) return 0;
  if (count === 1 || direction === 0) return 0;
  const safe = Math.max(0, Math.min(count - 1, current));
  if (direction === 1) return (safe + 1) % count;
  return (safe - 1 + count) % count;
}
```

```ts
// focus-trap.test.ts
it("forward: 다음 index, 마지막에서 0", () => {
  expect(nextFocusIndex(0, 3, 1)).toBe(1);
  expect(nextFocusIndex(2, 3, 1)).toBe(0);
});

it("backward: -1 → 마지막, 0 → 마지막-1", () => {
  expect(nextFocusIndex(0, 3, -1)).toBe(2);
  expect(nextFocusIndex(2, 3, -1)).toBe(1);
});

it("out-of-range current → wrap", () => {
  expect(nextFocusIndex(5, 3, 1)).toBe(0);   // safe=2 → 0
  expect(nextFocusIndex(-1, 3, 1)).toBe(1);  // safe=0 → 1
});
```

순수 함수 — TDD. 모듈 레벨 export. effect 와 무관. 호출자(useEffect 또는
이벤트 핸들러)가 적절히 import.

## 해결 2 — `useCallback` 안정화

effect deps 에 들어가는 함수가 매 렌더 새로 만들어지면 effect 가 매번 재실행된다.
의미상 동일해도 객체 reference 가 달라서. `useCallback` 으로 안정화.

```ts
const gotoWs = useCallback(
  (n: number) => setSt((s) => ({ ...s, ...gotoWsState(s, n), showLauncher: false })),
  [setSt],
);
```

`setSt` 는 useState 의 setter — React 가 안정 reference 보장. 따라서 deps 가
`[setSt]` 하나. effect deps 가 안정화되면 effect 가 마운트 1회만 실행.

명령 팔레트(`CommandPalette`)는 `useMemo` 로 commands 배열을 만들었었다. deps
가 매 렌더 새로 만들어지면 commands 도 새로 만들어진다. handlers 4 개
(`openApp`/`gotoWs`/`setMode`/`toggleKeys`)를 `useCallback` 으로 감싸니
commands 가 안정화됐다.

```ts
const commands: Command[] = useMemo(() => {
  return [
    ...appKeys.map((k) => ({
      id: `app:${k}`,
      title: `${APP_META[k].name} 열기`,
      group: "app",
      keywords: [k, APP_META[k].name.toLowerCase()],
      run: () => openApp(k),
    })),
    // ...
  ];
}, [openApp, gotoWs, setMode, toggleKeys]);
```

`react-hooks/exhaustive-deps` 가 즉시 만족. `eslint-disable` 디렉티브 불필요.

## 해결 3 — `safeSelected` derive

effect 안 setState 가 금지라면, "clamp" 를 effect 가 아니라 렌더에서 직접
계산하면 된다. React 19 의 [공식 가이드](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
가 정확히 이 케이스다.

```ts
// CommandPalette.tsx
const matches = useMemo(() => matchCommands(query, commands, 20), [query, commands]);
const safeSelected = Math.max(
  0,
  Math.min(selected, Math.max(0, matches.length - 1)),
);
```

`safeSelected` 는 effect 가 아니라 매 렌더 순수 계산. matches 가 변하면
자동으로 clamp. effect 안 setState 제거.

이벤트 핸들러는 setter 그대로 사용:

```ts
const onKey = (e: React.KeyboardEvent) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (matches.length === 0) return;
    setSelected(safeSelected + 1);
  }
  // ...
};
```

`safeSelected` 가 즉시 clamp 해주므로 `setSelected(safeSelected + 1)` 도
범위 안의 값. 다음 렌더에서 다시 clamp.

## 3개 사례 종합

| 사례 | 효과 | 의도 |
|---|---|---|
| `nextFocusIndex` (순수 함수) | 테스트 가능. effect 무관. | focus trap 의 핵심 로직 |
| `useCallback` 안정화 | handlers 21개 → 안정 reference. commands/메모이즈 deps 안정. | 매 렌더 새 effect 실행 회피 |
| `safeSelected` derive | `useState` 1개 감소. `useEffect` 0. | "matches 변경 시 clamp" — setState 없이 |

3개 모두 **"effect 안 setState 회피"** 라는 한 가지 원칙에서 파생된다.
React 19 의 새 린트는 단순한 회피가 아니라 **"effect 는 외부 시스템
sync 도구"** 라는 본래 의미를 다시 강조한다. 같은 원칙은 다음 케이스에도
적용된다.

- `useEffect(() => { setX(prop.y) }, [prop.y])` — derive 로.
- `useEffect(() => { setX(x => expensive(x)) }, [deps])` — `useMemo` 로.
- `useEffect(() => { setX(x => x + 1) }, [])` — 이벤트 핸들러 안 `setX(x => x + 1)` 로.

## 결론

React 19 의 `setState-in-effect` 린트는 단순한 lint 가 아니라 **"어디서 state
를 변환할 것인가"** 의 신호다. 변환은 렌더에서, 동기화는 effect 에서. focus
trap 이 그 경계를 가장 깔끔하게 보여주는 사례.

코드 3개 사례 (`nextFocusIndex` 순수 / `useCallback` 안정화 / `safeSelected`
derive) 가 같은 원칙의 변주. 다음 모달·드롭다운·자동완성 구현 시에도 같은
패턴.