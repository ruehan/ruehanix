import type { CatKey } from "@/lib/ruehanix/types";

/** ISO 날짜를 표시용 YYYY.MM.DD로. 빈 값/유효하지 않으면 빈 문자열.
 *  타임존 무관하게 UTC 기준으로 포맷한다(서버/클라 렌더 불일치·하루 어긋남 방지). */
export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
