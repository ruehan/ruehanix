import { describe, expect, it } from "vitest";
import type { AppKey } from "./types";
import { close, gotoWs, minimize, moveTile, moveToWs, openApp, openPostReader, setFloatRect, toggleFloating, toggleMaximize, type WindowState } from "./windowState";

const S = (over: Partial<WindowState> = {}): WindowState => ({
  open: { reader: { ws: 1 }, files: { ws: 1 } },
  order: ["files", "reader"],
  minimized: {},
  maximized: null,
  focused: "reader",
  ws: 1,
  floating: {},
  ...over,
});

describe("openApp", () => {
  it("앱을 현재 ws에 열고 포커스 + order에 추가", () => {
    const n = openApp(S({ open: { files: { ws: 1 } }, order: ["files"], focused: "files" }), "reader" as AppKey);
    expect(n.open.reader).toEqual({ ws: 1 });
    expect(n.order).toEqual(["files", "reader"]);
    expect(n.focused).toBe("reader");
  });
  it("이미 열린 앱도 포커스(중복 추가 없음)", () => {
    const n = openApp(S(), "files" as AppKey);
    expect(n.order).toEqual(["files", "reader"]);
    expect(n.focused).toBe("files");
  });
  it("최소화된 앱 재오픈 시 unminimize", () => {
    const n = openApp(S({ minimized: { reader: true } }), "reader" as AppKey);
    expect(n.minimized.reader).toBe(false);
  });
  it("다른 앱을 열면 최대화 해제(가려짐 방지), 같은 앱이면 유지", () => {
    expect(openApp(S({ maximized: "files" as AppKey }), "reader" as AppKey).maximized).toBeNull();
    expect(openApp(S({ maximized: "reader" as AppKey }), "reader" as AppKey).maximized).toBe("reader");
  });
});

describe("close", () => {
  it("open/minimized에서 제거 + 포커스를 다음 가시 창으로", () => {
    const n = close(S({ focused: "reader", minimized: { reader: true } }), "reader" as AppKey);
    expect(n.open.reader).toBeUndefined();
    expect(n.minimized.reader).toBeUndefined();
    expect(n.focused).toBe("files"); // 같은 ws의 마지막 가시 창
  });
  it("maximized===k면 maximized 해제", () => {
    expect(close(S({ maximized: "reader" as AppKey }), "reader" as AppKey).maximized).toBeNull();
  });
  it("포커스가 아니면 focused 유지", () => {
    expect(close(S({ focused: "files" }), "reader" as AppKey).focused).toBe("files");
  });
  it("닫은 뒤 남은 창이 모두 최소화면 focused=null", () => {
    const n = close(S({ focused: "reader", minimized: { files: true } }), "reader" as AppKey);
    expect(n.focused).toBeNull();
  });
});

describe("minimize", () => {
  it("minimized=true + 포커스를 다음 가시 창으로", () => {
    const n = minimize(S({ focused: "reader" }), "reader" as AppKey);
    expect(n.minimized.reader).toBe(true);
    expect(n.focused).toBe("files");
  });
  it("maximized===k면 maximized 해제", () => {
    expect(minimize(S({ focused: "reader", maximized: "reader" as AppKey }), "reader" as AppKey).maximized).toBeNull();
  });
});

describe("toggleMaximize", () => {
  it("최대화 안 됐으면 최대화 + 포커스", () => {
    const n = toggleMaximize(S({ maximized: null, focused: "files" }), "reader" as AppKey);
    expect(n.maximized).toBe("reader");
    expect(n.focused).toBe("reader");
  });
  it("이미 최대화면 복원(null)", () => {
    expect(toggleMaximize(S({ maximized: "reader" as AppKey }), "reader" as AppKey).maximized).toBeNull();
  });
});

describe("gotoWs", () => {
  it("ws 전환 + 포커스를 새 ws 첫 가시 창으로", () => {
    const n = gotoWs(S({ ws: 1, open: { reader: { ws: 2 } }, order: ["reader"], focused: null }), 2);
    expect(n.ws).toBe(2);
    expect(n.focused).toBe("reader");
  });
  it("maximized가 대상 ws에 열려 있으면 유지, 아니면 null", () => {
    expect(gotoWs(S({ ws: 1, maximized: "reader" as AppKey, open: { reader: { ws: 1 } } }), 1).maximized).toBe("reader");
    expect(gotoWs(S({ ws: 1, maximized: "reader" as AppKey, open: { reader: { ws: 1 } } }), 2).maximized).toBeNull();
  });
  it("대상 ws의 가시 창이 없으면(모두 최소화) focused=null", () => {
    const n = gotoWs(S({ ws: 1, open: { reader: { ws: 2 } }, order: ["reader"], minimized: { reader: true } }), 2);
    expect(n.focused).toBeNull();
  });
});

describe("openPostReader", () => {
  it("reader 열고 selected+포커스 + unminimize + 다른 앱 최대화 해제 (G4 회귀)", () => {
    const n = openPostReader(S({ focused: "files", minimized: { reader: true }, maximized: "files" as AppKey }), "post-1");
    expect(n.open.reader).toEqual({ ws: 1 });
    expect(n.focused).toBe("reader");
    expect((n as WindowState & { selected: string }).selected).toBe("post-1");
    expect(n.minimized.reader).toBe(false);
    expect(n.maximized).toBeNull(); // reader가 아니었으므로 해제
  });
  it("reader 자기 최대화 상태면 유지", () => {
    expect(openPostReader(S({ maximized: "reader" as AppKey }), "x").maximized).toBe("reader");
  });
});

describe("moveToWs", () => {
  it("창을 대상 ws로 이동 + ws 전환 + 포커스 유지(따라가기)", () => {
    const n = moveToWs(S({ ws: 1, focused: "reader" }), "reader" as AppKey, 3);
    expect(n.open.reader).toEqual({ ws: 3 });
    expect(n.ws).toBe(3);
    expect(n.focused).toBe("reader");
  });
  it("다른 ws로 가면 현재 ws엔 더이상 없음 → visibleIds가 반영", () => {
    const n = moveToWs(S({ ws: 1, open: { reader: { ws: 1 }, files: { ws: 1 } }, order: ["files", "reader"], focused: "reader" }), "reader" as AppKey, 2);
    expect(n.open.reader).toEqual({ ws: 2 });
    expect(n.ws).toBe(2);
  });
  it("다른 앱이 maximized면 ws 전환 시 해제(대상 ws에 없으므로), k 자신이면 유지", () => {
    expect(moveToWs(S({ ws: 1, focused: "reader", maximized: "files" as AppKey }), "reader" as AppKey, 2).maximized).toBeNull();
    expect(moveToWs(S({ ws: 1, focused: "reader", maximized: "reader" as AppKey }), "reader" as AppKey, 2).maximized).toBe("reader");
  });
  it("open에 없는 창이면 no-op", () => {
    const s = S({ ws: 1, open: { files: { ws: 1 } } });
    expect(moveToWs(s, "reader" as AppKey, 2)).toBe(s);
  });
});

describe("moveTile", () => {
  it("right: 포커스 창을 order 상 다음과 자리바꿈", () => {
    const n = moveTile(S({ order: ["files", "reader", "terminal"], focused: "reader" }), "reader" as AppKey, "right");
    expect(n.order).toEqual(["files", "terminal", "reader"]);
  });
  it("left: 이전과 자리바꿈", () => {
    const n = moveTile(S({ order: ["files", "reader", "terminal"], focused: "reader" }), "reader" as AppKey, "left");
    expect(n.order).toEqual(["reader", "files", "terminal"]);
  });
  it("경계(맨 끝)면 no-op", () => {
    expect(moveTile(S({ order: ["files", "reader"], focused: "reader" }), "reader" as AppKey, "right").order).toEqual(["files", "reader"]);
    expect(moveTile(S({ order: ["files", "reader"], focused: "files" }), "files" as AppKey, "left").order).toEqual(["files", "reader"]);
  });
  it("order에 없으면 no-op", () => {
    expect(moveTile(S({ order: ["files"], focused: "reader" }), "reader" as AppKey, "right").order).toEqual(["files"]);
  });
});

describe("toggleFloating / setFloatRect", () => {
  const rect = { x: 100, y: 100, w: 600, h: 400 };
  it("toggleFloating: 부재 시 추가", () => {
    const out = toggleFloating(S(), "files", rect);
    expect(out.floating.files).toEqual(rect);
  });
  it("toggleFloating: 존재 시 제거 (타일 복귀)", () => {
    const out = toggleFloating(S({ floating: { files: rect } }), "files", rect);
    expect(out.floating.files).toBeUndefined();
  });
  it("setFloatRect: 위치/크기 갱신", () => {
    const out = setFloatRect(S({ floating: { files: rect } }), "files", { x: 200, y: 200, w: 800, h: 500 });
    expect(out.floating.files).toEqual({ x: 200, y: 200, w: 800, h: 500 });
  });
});
