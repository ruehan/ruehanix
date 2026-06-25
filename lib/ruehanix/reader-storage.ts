/** 리더(Reader) 본문 표시 설정 — 폰트 크기·콘텐츠 폭. localStorage 영속.
 *  검증/직렬화 패턴은 ui-storage 와 대칭. @see lib/ruehanix/ui-storage.ts */

export interface ReaderPrefs {
  fontSize: number; // px (13..22)
  width: number; // 본문 max-width px (560..960)
}

export const READER_STORAGE_KEY = "rh-reader";

export const DEFAULT_READER_PREFS: ReaderPrefs = {
  fontSize: 16,
  width: 760,
};

/** 저장 JSON → ReaderPrefs. 형식/범위 어긋나면 null(저장값 무시, 기본값 사용). */
export function parseReaderPrefs(raw: string | null | undefined): ReaderPrefs | null {
  if (!raw) return null;
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;
  const fontSize = typeof r.fontSize === "number" && r.fontSize >= 13 && r.fontSize <= 22 ? Math.round(r.fontSize) : null;
  const width = typeof r.width === "number" && r.width >= 560 && r.width <= 960 ? Math.round(r.width) : null;
  if (fontSize === null || width === null) return null;
  return { fontSize, width };
}

/** ReaderPrefs → 저장 문자열. */
export function serializeReaderPrefs(p: ReaderPrefs): string {
  return JSON.stringify(p);
}
