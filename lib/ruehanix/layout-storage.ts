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
import type { AppKey, FloatRect } from "./types";

export const LAYOUT_STORAGE_KEY = "rh-layout";

// v2 — floating 슬라이스 추가 (ADR 0025 G2, ADR 0040).
// v1 → v2 마이그레이션 정책(ADR 0036): 전체 DEFAULT 폴백(사용자 layout 손실).
export const LAYOUT_VERSION = 2 as const;

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
  /** v2+ — floating 윈도우의 (x, y, w, h). Hyprland floating 동등. */
  floating?: Partial<Record<AppKey, FloatRect>>;
}

export const DEFAULT_LAYOUT_SNAPSHOT: LayoutSnapshot = {
  version: LAYOUT_VERSION,
  ws: 1,
  open: {},
  order: [],
  ratios: {},
  minimized: {},
  maximized: null,
  floating: {},
};

const REQUIRED_KEYS = ["version", "ws", "open", "order", "ratios", "minimized", "maximized", "floating"] as const;

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
    floating: validateFloating(o.floating),
  };
}

function validateFloating(v: unknown): LayoutSnapshot["floating"] {
  if (!isObject(v)) return {};
  const out: Partial<Record<AppKey, FloatRect>> = {};
  for (const [k, raw] of Object.entries(v)) {
    if (!APP_KEYS.includes(k as AppKey)) continue;
    if (!isObject(raw)) continue;
    const x = typeof raw.x === "number" && Number.isFinite(raw.x) ? raw.x : 0;
    const y = typeof raw.y === "number" && Number.isFinite(raw.y) ? raw.y : 0;
    const w = typeof raw.w === "number" && Number.isFinite(raw.w) ? raw.w : 600;
    const h = typeof raw.h === "number" && Number.isFinite(raw.h) ? raw.h : 400;
    if (w < 320 || h < 200) continue; // 너무 작은 값은 무시
    out[k as AppKey] = { x, y, w, h };
  }
  return out;
}

export function serializeLayoutSnapshot(s: LayoutSnapshot): string {
  return JSON.stringify(s);
}