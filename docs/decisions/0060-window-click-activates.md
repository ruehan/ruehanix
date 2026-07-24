# 0060. 윈도우 어디든 클릭하면 active
- 상태: 채택
- 날짜: 2026-07-24

## 배경
현재 Ruehanix 윈도우는 title bar 를 클릭할 때만 active 상태가 된다. body 영역을 클릭하면 해당 윈도우의 `vm.focus[app]` 가 호출되지 않는다. FilesApp 검색바처럼 children 이 bubble 페이즈에서 `stopPropagation` 을 호출하는 경우에도 윈도우 focus 가 필요하다.

## 결정
`components/ruehanix/RuehanixShell.tsx` 의 `Win` 컴포넌트에서 `vm.chrome` div 에 `onMouseDownCapture={() => vm.focus[app]()}` 를 추가한다. 캡쳐 페이즈에서 chrome 전체의 mousedown 을 처리해 children 의 bubble 페이즈 `stopPropagation` 에 영향을 받지 않도록 한다.

## 이유와 대안
- title bar 에만 focus 핸들러를 두는 방식은 body 클릭 시 active 전환을 놓친다.
- body 각 children 에 개별 focus 핸들러를 추가하는 방식은 누락 가능성이 있고 유지보수 범위가 커진다.
- chrome 전체에 캡쳐 핸들러를 두면 모든 mousedown 을 일관되게 처리하면서 FilesApp 검색바의 bubble stopPropagation 도 무력화할 수 있다.

## 영향
- 윈도우 chrome 안의 모든 mousedown 에서 `vm.focus[app]` 가 호출된다.
- 캡쳐 페이즈 처리이므로 title bar 의 기존 `onMouseDown` 은 그대로 실행되어 floating drag 등 다른 동작을 유지한다.
- children 이 focus 가 아닌 다른 이유로 의도적으로 `stopPropagation` 을 사용했다면 회귀 가능성이 있으며, 전체 회귀 테스트로 확인한다.
