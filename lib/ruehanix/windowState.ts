import type { AppKey, FloatRect } from "./types";

/** 창 관리 상태 슬라이스. useRuehanix CoreState 중 창(windowing)에 관한 부분.
 *  순수 전환 함수들이 이 슬라이스를 받아 새 슬라이스를 반환 — 훅 밖에서 단위 테스트.
 *
 *  참고: gotoWs/close의 포커스 후보는 **가시 창(최소화 아님)**만 고려한다. 원본 인라인 로직은
 *  minimized 무시 filter였으나, 순수 추출 과정에서 가시 창만으로 좁혔다 — 숨겨진 최소화 창에
 *  포커스가 가는 버그를 고친 의도적 개선(회귀 테스트가 이를 수호).
 *
 *  G2 (ADR 0025) — floating: 윈도우를 타일에서 벗어나 자유 위치/크기로. Hyprland floating 동등.
 *  현재 WIP — useRuehanix 의 dragRef 'float'/'floatresize' 케이스가 의존. 다음 세션 완성. */
export interface WindowState {
  open: Partial<Record<AppKey, { ws: number }>>;
  order: AppKey[];
  minimized: Partial<Record<AppKey, boolean>>;
  maximized: AppKey | null;
  focused: AppKey | null;
  ws: number;
  floating: Partial<Record<AppKey, FloatRect>>;
}

/** 현재 워크스페이스의 가시(open + 같은 ws + 최소화 아님) 창 목록(order 순). */
function visible(s: WindowState, ws: number, minimized = s.minimized): AppKey[] {
  return s.order.filter((k) => s.open[k] && s.open[k]!.ws === ws && !minimized[k]);
}

/** 앱 오픈 — 현재 ws에 열고 포커스. 최소화 해제(트레이 복귀). 다른 앱 최대화 중이면 해제(가려짐 방지). */
export function openApp(s: WindowState, k: AppKey): WindowState {
  const open = { ...s.open, [k]: { ws: s.ws } };
  const order = s.order.includes(k) ? s.order : [...s.order, k];
  const minimized = s.minimized[k] ? { ...s.minimized, [k]: false } : s.minimized;
  const maximized = s.maximized === k ? s.maximized : null;
  return { ...s, open, order, minimized, maximized, focused: k };
}

/** 창 닫기 — open/minimized에서 제거. maximized===k면 해제. 포커스가 k면 같은 ws 마지막 가시 창으로. */
export function close(s: WindowState, k: AppKey): WindowState {
  const open = { ...s.open };
  delete open[k];
  const minimized = { ...s.minimized };
  delete minimized[k];
  const maximized = s.maximized === k ? null : s.maximized;
  const ids = visible({ ...s, open, minimized }, s.ws, minimized);
  const focused = s.focused === k ? ids[ids.length - 1] || null : s.focused;
  return { ...s, open, minimized, maximized, focused };
}

/** 최소화 — minimized[k]=true. maximized===k면 해제. 포커스가 k면 같은 ws 마지막 가시 창으로. */
export function minimize(s: WindowState, k: AppKey): WindowState {
  const minimized = { ...s.minimized, [k]: true };
  const maximized = s.maximized === k ? null : s.maximized;
  const ids = visible(s, s.ws, minimized);
  const focused = s.focused === k ? ids[ids.length - 1] || null : s.focused;
  return { ...s, minimized, maximized, focused };
}

/** 최대화 토글 — k가 아니면 k로(포커스), k면 복원(null). */
export function toggleMaximize(s: WindowState, k: AppKey): WindowState {
  const maximized = s.maximized === k ? null : k;
  return { ...s, maximized, focused: k };
}

/** 워크스페이스 전환 — ws=n, 포커스를 n의 첫 가시 창으로. maximized는 n에 열려 있을 때만 유지. */
export function gotoWs(s: WindowState, n: number): WindowState {
  const ids = visible(s, n);
  const maximized = s.maximized && s.open[s.maximized] && s.open[s.maximized]!.ws === n ? s.maximized : null;
  return { ...s, ws: n, focused: ids[0] || null, maximized };
}

/** 글 오픈(Reader) — reader 열고 selected 지정. openApp과 동일한 가시성 규칙(unminimize + 다른 앱 최대화 해제).
 *  selected는 창 슬라이스 밖 필드라 별도 반환 — useRuehanix가 합친다. */
export function openPostReader(s: WindowState, slug: string): WindowState & { selected: string } {
  const next = openApp(s, "reader");
  return { ...next, selected: slug };
}

/** 창을 다른 워크스페이스로 이동 + 현재 ws를 그쪽으로 전환(따라가기). Hyprland movetoworkspace.
 *  k가 open에 없으면 no-op. maximized는 대상 ws에 열려 있을 때만 유지(gotoWs와 대칭). */
export function moveToWs(s: WindowState, k: AppKey, n: number): WindowState {
  if (!s.open[k]) return s;
  const open = { ...s.open, [k]: { ws: n } };
  const maximized = s.maximized && open[s.maximized] && open[s.maximized]!.ws === n ? s.maximized : null;
  return { ...s, open, ws: n, focused: k, maximized };
}

/** 타일 자리바꿈 — 포커스 창을 order 상 인접 창과 교체(left/right). 경계/미존재면 no-op.
 *  1D dwindle 근사(공간적 up/down는 별도 레이아웃 필요 — 백로그). */
export function moveTile(s: WindowState, k: AppKey, dir: "left" | "right"): WindowState {
  const i = s.order.indexOf(k);
  if (i < 0) return s;
  const j = dir === "right" ? i + 1 : i - 1;
  if (j < 0 || j >= s.order.length) return s;
  const order = s.order.slice();
  [order[i], order[j]] = [order[j], order[i]];
  return { ...s, order };
}

/**
 * G2 WIP — 플로팅 토글. 현재 rect 가 있으면 타일 복귀(제거), 없으면 새 rect 로
 * 플로팅 진입. 다음 세션에서 실동작 완성 — 현재 stub (call site 와 시그니처만 맞춤).
 */
export function toggleFloating(s: WindowState, k: AppKey, rect: FloatRect): WindowState {
  if (s.floating[k]) {
    const { [k]: _, ...rest } = s.floating;
    return { ...s, floating: rest };
  }
  return { ...s, floating: { ...s.floating, [k]: rect } };
}

/**
 * G2 WIP — 플로팅 위치/크기 갱신 (드래그·리사이즈 결과). stub.
 */
export function setFloatRect(s: WindowState, k: AppKey, rect: FloatRect): WindowState {
  return { ...s, floating: { ...s.floating, [k]: rect } };
}
