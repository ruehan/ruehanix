/**
 * 창/워크스페이스 layout 영속화 — localStorage 키 `rh-layout`.
 * ui-storage 의 parse/serialize 패턴을 답습하되 schema version + 다중 필드.
 *
 * 저장 슬라이스: ws(현재 워크스페이스), open(앱→ws), order(앱 나열), ratios
 * (워크스페이스 분할 비율), minimized, maximized. floating rect 는 G2 가
 * main 머지 시점에 추가 예정 — 별도 슬라이스로 확장 가능 (schema version bump).
 *
 * 형식: { version: 1, ws, open, order, ratios, minimized, maximized }.
 *   - 부재/잘못된 JSON/version 불일치 시 DEFAULT_LAYOUT_SNAPSHOT 로 폴백.
 *   - 새 필드 추가 시 version bump 후 DEFAULT 의 형태 유지.
 */
import type { AppKey } from "./types";

export const LAYOUT_STORAGE_KEY = "rh-layout";

export const LAYOUT_VERSION = 1 as const;

export interface LayoutSnapshot {
  readonly version: typeof LAYOUT_VERSION;
  ws: number;
  open: Partial<Record<AppKey, { ws: number }>>;
  order: AppKey[];
  ratios: Record<string, number>;
  minimized: Partial<Record<AppKey, boolean>>;
  maximized: AppKey | null;
}

export const DEFAULT_LAYOUT_SNAPSHOT: LayoutSnapshot = {
  version: LAYOUT_VERSION,
  ws: 1,
  open: {},
  order: [],
  ratios: {},
  minimized: {},
  maximized: null,
};

const VALID_KEYS = new Set([
  "version",
  "ws",
  "open",
  "order",
  "ratios",
  "minimized",
  "maximized",
]);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** raw JSON → LayoutSnapshot. 방어적 — 검증 실패 시 DEFAULT. */
export function parseLayoutSnapshot(raw: string | null | undefined): LayoutSnapshot {
  if (!raw) return DEFAULT_LAYOUT_SNAPSHOT;
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return DEFAULT_LAYOUT_SNAPSHOT;
  }
  if (!isObject(o)) return DEFAULT_LAYOUT_SNAPSHOT;
  if (o.version !== LAYOUT_VERSION) return DEFAULT_LAYOUT_SNAPSHOT;
  // 필수 키 모두 존재 + 추가 키 무시(타이트 검증)
  for (const k of VALID_KEYS) {
    if (!(k in o)) return DEFAULT_LAYOUT_SNAPSHOT;
  }
  // 타입 좁히기
  const snap: LayoutSnapshot = {
    version: LAYOUT_VERSION,
    ws: typeof o.ws === "number" && Number.isFinite(o.ws) ? o.ws : DEFAULT_LAYOUT_SNAPSHOT.ws,
    open: isObject(o.open) ? (o.open as LayoutSnapshot["open"]) : {},
    order: Array.isArray(o.order) ? (o.order as AppKey[]) : [],
    ratios: isObject(o.ratios) ? (o.ratios as Record<string, number>) : {},
    minimized: isObject(o.minimized) ? (o.minimized as LayoutSnapshot["minimized"]) : {},
    maximized:
      typeof o.maximized === "string" || o.maximized === null
        ? (o.maximized as AppKey | null)
        : null,
  };
  return snap;
}

export function serializeLayoutSnapshot(s: LayoutSnapshot): string {
  return JSON.stringify(s);
}