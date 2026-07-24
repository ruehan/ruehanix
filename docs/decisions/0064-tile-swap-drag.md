# 0064. title bar 드래그로 같은 ws 내 타일 swap
- 상태: 채택
- 날짜: 2026-07-24

## 배경
키보드 `moveTile` 은 인접 창만 교환한다. 같은 워크스페이스에서 비인접 창을 직접 교환할 수 있고, 사용자가 창 위치를 직관적으로 바꿀 수 있는 상호작용이 필요하다.

## 결정
타일 창 title bar 에 HTML5 drag-and-drop 을 부착한다. `draggable={!floating}` 으로 타일 창만 드래그 소스로 허용하고, drop 시 `swapTileState` 로 `st.order` 의 두 index 를 교환한다. floating 창은 기존 mousedown 기반 위치 드래그를 우선한다.

## 이유와 대안
HTML5 drag-and-drop 은 별도 포인터 상태나 레이아웃 계산 없이 title bar 간 source/target 을 전달할 수 있다. floating 창까지 draggable 로 만들면 기존 위치 드래그와 충돌할 수 있어 tiled 창에만 적용한다.

## 영향
같은 워크스페이스의 tiled 창끼리 자유롭게 위치를 swap 할 수 있다. floating 창의 기존 위치 드래그 동작과 키보드 `moveTile` 의 인접 swap 은 유지된다. 후속으로 드래그 중 fade/highlight 피드백, 멀티 모니터 및 edge drag 를 검토한다.
