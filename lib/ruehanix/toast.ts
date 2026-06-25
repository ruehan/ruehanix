import { useEffect, useSyncExternalStore } from "react";

/**
 * 글로벌 토스트 외부 스토어.
 * 어디서든 notify(msg) 를 부르면 ToastHost 가 화면 하단에 짧은 메시지를 띄운다.
 * useSyncExternalStore 로 구독해 컴포넌트 트리 어디서나 일관된 단일 토스트를 표시.
 * - ttl(기본 1300ms) 후 자동 소멸. ttl=0 은 스티키(명시 clearToast 까지 유지).
 * - 재호출은 타이머를 리셋 → 마지막 메시지가 ttl 만큼 살게 된다.
 *
 * SSR 안전: getServerSnapshot 은 항상 null. 토스트는 브라우저 전용 상태다.
 */

let current: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

/** 현재 토스트 메시지(없으면 null). useSyncExternalStore getSnapshot. */
export function getToast(): string | null {
  return current;
}

/** 토스트 변경 구독. useSyncExternalStore subscribe. 해지 함수 반환. */
export function subscribeToast(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** 토스트 표시. ttl(ms) 후 자동 소멸, 0이면 스티키. */
export function notify(msg: string, ttl = 1300): void {
  current = msg;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (ttl > 0) {
    timer = setTimeout(() => {
      current = null;
      timer = null;
      emit();
    }, ttl);
  }
  emit();
}

/** 토스트 즉시 소거. */
export function clearToast(): void {
  current = null;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  emit();
}

/** React 바인딩 — 현재 토스트를 구독. SSR 중엔 null. */
export function useToast(): string | null {
  return useSyncExternalStore(
    subscribeToast,
    getToast,
    () => null,
  );
}

/** 토스트 호스트용: 마운트 시 잔류 타이머 정리(안전망). */
export function useToastCleanup(): void {
  useEffect(() => () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }, []);
}
