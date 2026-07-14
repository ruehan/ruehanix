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
 *   - 추가 키는 무시(하위 호환).
 *   - 일부 필드만 foreign 일 땐 해당 필드만 DEFAULT 값으로 부분 폴백.
 */
import { APP_KEYS } from "./data";
import type { AppKey } from "./types";

export const LAYOUT_STORAGE_KEY = "rh-layout";

export const LAYOUT_VERSION = 1 as const;

const WS_MIN = 1;
const WS_MAX = 6;

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

const REQUIRED_KEYS = ["version", "ws", "open", "order", "ratios", "minimized", "maximized"] as const;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateWs(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return DEFAULT_LAYOUT_SNAPSHOT.ws;
  if (v < WS_MIN || v > WS_MAX) return DEFAULT_LAYOUT_SNAPSHOT.ws;
  return v;
}

function validateOpen(v: unknown): LayoutSnapshot["open"] {
  if (!isObject(v)) return {};
  const out: Partial<Record<AppKey, { ws: number }>> = {};
  for (const [k, raw] of Object.entries(v)) {
    if (!APP_KEYS.includes(k as AppKey)) continue;
    if (!isObject(raw)) continue;
    const ws = typeof raw.ws === "number" && Number.isFinite(raw.ws) ? raw.ws : 1;
    if (ws < WS_MIN || ws > WS_MAX) continue;
    out[k as AppKey] = { ws };
  }
  return out;
}

function validateOrder(v: unknown): AppKey[] {
  if (!Array.isArray(v)) return [];
  const out: AppKey[] = [];
  for (const x of v) {
    if (typeof x === "string" && APP_KEYS.includes(x as AppKey)) out.push(x as AppKey);
  }
  return out;
}

function validateRatios(v: unknown): Record<string, number> {
  if (!isObject(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, raw] of Object.entries(v)) {
    if (typeof raw === "number" && Number.isFinite(raw)) out[k] = raw;
  }
  return out;
}

function validateMinimized(v: unknown): LayoutSnapshot["minimized"] {
  if (!isObject(v)) return {};
  const out: Partial<Record<AppKey, boolean>> = {};
  for (const [k, raw] of Object.entries(v)) {
    if (!APP_KEYS.includes(k as AppKey)) continue;
    if (typeof raw === "boolean") out[k as AppKey] = raw;
  }
  return out;
}

function validateMaximized(v: unknown): AppKey | null {
  if (v === null) return null;
  if (typeof v === "string" && APP_KEYS.includes(v as AppKey)) return v as AppKey;
  return null;
}

/** raw JSON → LayoutSnapshot. 방어적 — 검증 실패 시 DEFAULT.
 *  부분 필드 foreign 일 땐 해당 필드만 DEFAULT 값으로 폴백. */
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
  for (const k of REQUIRED_KEYS) {
    if (!(k in o)) return DEFAULT_LAYOUT_SNAPSHOT;
  }
  return {
    version: LAYOUT_VERSION,
    ws: validateWs(o.ws),
    open: validateOpen(o.open),
    order: validateOrder(o.order),
    ratios: validateRatios(o.ratios),
    minimized: validateMinimized(o.minimized),
    maximized: validateMaximized(o.maximized),
  };
}

export function serializeLayoutSnapshot(s: LayoutSnapshot): string {
  return JSON.stringify(s);
}