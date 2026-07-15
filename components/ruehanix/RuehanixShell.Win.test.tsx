// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect, vi } from "vitest";
import type { CSSProperties } from "react";
import type { AppKey } from "@/lib/ruehanix/types";

// Sanity chain 가 next-sanity + env 모듈을 require 해서 win-test 의 import 가 깨짐.
// vi.mock 으로 무력화 — Win 의 chrome/button 만 검증하면 충분.
vi.mock("@/lib/sanity/client", () => ({ client: { fetch: vi.fn() } }));
vi.mock("@/lib/sanity/env", () => ({
  apiVersion: "2025-01-01",
  dataset: "production",
  projectId: "test",
  readToken: "test-token",
}));
vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({ width: () => ({ fit: () => ({ auto: () => ({ url: () => "https://x/i" }) }) }) }),
}));

const { Win } = await import("./RuehanixShell");

afterEach(() => cleanup());

function makeVm(opts: {
  display?: CSSProperties["display"];
  floating?: boolean;
  preserveLocalState?: boolean;
}) {
  const app: AppKey = "files";
  const tiles: Record<AppKey, CSSProperties> = {
    files: { position: "absolute", display: opts.display ?? "block", left: 0, top: 0, width: 800, height: 600 },
    reader: { position: "absolute", display: "none" },
    foto: { position: "absolute", display: "none" },
    hotlap: { position: "absolute", display: "none" },
    terminal: { position: "absolute", display: "none" },
    web: { position: "absolute", display: "none" },
    music: { position: "absolute", display: "none" },
    settings: { position: "absolute", display: "none" },
    about: { position: "absolute", display: "none" },
  };
  const focus = vi.fn();
  const toggleMaximize = vi.fn();
  const minimize = vi.fn();
  const close = vi.fn();
  const toggleFloating = vi.fn();
  const startFloatDrag = vi.fn();
  const startFloatResize = vi.fn();
  return {
    vm: {
      tiles,
      chrome: { background: "var(--mantle)", border: "1px solid var(--surf0)" },
      bodyWrap: { position: "relative" },
      tbar: { display: "flex", alignItems: "center", padding: "4px 8px" },
      wbtn: { fontSize: 11, padding: "2px 6px" },
      xbtn: { fontSize: 11, padding: "2px 6px" },
      isMobile: false,
      focus: Object.fromEntries(["files", "reader", "foto", "hotlap", "terminal", "web", "music", "settings", "about"].map((k) => [k, focus])),
      toggleMaximize: Object.fromEntries(["files", "reader", "foto", "hotlap", "terminal", "web", "music", "settings", "about"].map((k) => [k, toggleMaximize])),
      minimize: Object.fromEntries(["files", "reader", "foto", "hotlap", "terminal", "web", "music", "settings", "about"].map((k) => [k, minimize])),
      close: Object.fromEntries(["files", "reader", "foto", "hotlap", "terminal", "web", "music", "settings", "about"].map((k) => [k, close])),
      floating: { files: opts.floating ? { x: 0, y: 0, w: 800, h: 600 } : undefined } as Record<AppKey, unknown>,
      toggleFloating,
      startFloatDrag,
      startFloatResize,
    } as never,
    app,
    focus,
    toggleMaximize,
    minimize,
    close,
    toggleFloating,
    startFloatDrag,
    startFloatResize,
  };
}

describe("Win (visible-기반 children mount)", () => {
  it("hidden + preserveLocalState=false → outer div + aria-hidden, children 미렌더", () => {
    const { vm, app } = makeVm({ display: "none", preserveLocalState: false });
    render(
      <Win vm={vm} app={app}>
        <div data-testid="kid">child</div>
      </Win>,
    );
    expect(screen.queryByTestId("kid")).toBeNull();
  });

  it("visible → chrome + children 렌더", () => {
    const { vm, app } = makeVm({ display: "block" });
    render(
      <Win vm={vm} app={app}>
        <div data-testid="kid">child</div>
      </Win>,
    );
    expect(screen.getByTestId("kid")).toBeInTheDocument();
  });

  it("hidden + preserveLocalState=true → children 마운트 유지 (FotoApp 회귀 방지)", () => {
    const { vm, app } = makeVm({ display: "none", preserveLocalState: true });
    render(
      <Win vm={vm} app={app} preserveLocalState>
        <div data-testid="kid">child</div>
      </Win>,
    );
    expect(screen.getByTestId("kid")).toBeInTheDocument();
  });

  it("chrome 의 최소화 버튼이 onClick 으로 vm.minimize 호출", async () => {
    const { vm, app, minimize } = makeVm({ display: "block" });
    const user = userEvent.setup();
    render(
      <Win vm={vm} app={app}>
        <div>child</div>
      </Win>,
    );
    await user.click(screen.getByLabelText("Files 최소화"));
    expect(minimize).toHaveBeenCalled();
  });
});