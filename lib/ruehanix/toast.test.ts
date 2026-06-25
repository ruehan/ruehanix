import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearToast, getToast, notify, subscribeToast } from "./toast";

beforeEach(() => {
  vi.useFakeTimers();
  clearToast();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("toast 외부 스토어", () => {
  it("초기값은 null", () => {
    expect(getToast()).toBeNull();
  });

  it("notify는 메시지를 설정하고 구독자에게 알린다", () => {
    const seen: (string | null)[] = [];
    const unsub = subscribeToast(() => seen.push(getToast()));
    notify("저장됨");
    expect(getToast()).toBe("저장됨");
    expect(seen).toEqual(["저장됨"]);
    unsub();
  });

  it("ttl 이후 자동으로 null 로 복귀", () => {
    notify("잠깐", 1000);
    expect(getToast()).toBe("잠깐");
    vi.advanceTimersByTime(999);
    expect(getToast()).toBe("잠깐");
    vi.advanceTimersByTime(2);
    expect(getToast()).toBeNull();
  });

  it("재호출은 타이머를 리셋(갱신 전 만료 방지)", () => {
    notify("A", 1000);
    vi.advanceTimersByTime(800);
    notify("B", 1000);
    vi.advanceTimersByTime(900); // A 기준 1700ms but B 기준 900ms
    expect(getToast()).toBe("B"); // 아직 만료 아님
    vi.advanceTimersByTime(200);
    expect(getToast()).toBeNull();
  });

  it("ttl=0 은 스티키(자동 소멸 없음)", () => {
    notify("고정", 0);
    vi.advanceTimersByTime(60000);
    expect(getToast()).toBe("고정");
  });

  it("clearToast는 즉시 비운다", () => {
    notify("X", 5000);
    clearToast();
    expect(getToast()).toBeNull();
  });

  it("구독 해지 후에는 알림 오지 않음", () => {
    const fn = vi.fn();
    const unsub = subscribeToast(fn);
    unsub();
    notify("무시");
    expect(fn).not.toHaveBeenCalled();
  });
});
