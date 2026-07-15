/**
 * 모달 focus trap — Tab/Shift+Tab 시 focusable elements 사이 cycle.
 * direction: +1 (Tab, 다음) / -1 (Shift+Tab, 이전).
 * current 가 범위 밖이면 0 으로 clamp. 0개/1개 focusable 이면 0 고정.
 */
export function nextFocusIndex(current: number, count: number, direction: 0 | 1 | -1): number {
  if (count <= 0) return 0;
  if (count === 1 || direction === 0) return 0;
  const safe = Math.max(0, Math.min(count - 1, current));
  if (direction === 1) return (safe + 1) % count;
  return (safe - 1 + count) % count;
}