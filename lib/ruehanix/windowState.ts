import type { AppKey } from "./types";

/** 창 관리 상태 슬라이스. useRuehanix CoreState 중 창(windowing)에 관한 부분.
 *  순수 전환 함수들이 이 슬라이스를 받아 새 슬라이스를 반환 — 훅 밖에서 단위 테스트.
 *
 *  참고: gotoWs/close의 포커스 후보는 **가시 창(최소화 아님)**만 고려한다. 원본 인라인 로직은
 *  minimized 무시 filter였으나, 순수 추출 과정에서 가시 창만으로 좁혔다 — 숨겨진 최소화 창에
 *  포커스가 가는 버그를 고친 의도적 개선(회귀 테스트가 이를 수호). */
export interface WindowState {
  open: Partial<Record<AppKey, { ws: number }>>;
  order: AppKey[];
  minimized: Partial<Record<AppKey, boolean>>;
  maximized: AppKey | null;
  focused: AppKey | null;
  ws: number;
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
