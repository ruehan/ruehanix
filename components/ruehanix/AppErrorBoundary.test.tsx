// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type * as React from "react";
import { AppErrorBoundary } from "./AppErrorBoundary";
import * as toast from "@/lib/ruehanix/toast";

function Boom(): never {
  throw new Error("boom");
}

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    // React 가 boundary catch 후 console.error 로 로깅하므로 침묵.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("정상 children은 그대로 렌더한다", () => {
    render(
      <AppErrorBoundary appName="files">
        <div>hello</div>
      </AppErrorBoundary>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("자식이 throw하면 fallback UI를 보여주고 토스트로 알린다", () => {
    const notify = vi.spyOn(toast, "notify");
    render(
      <AppErrorBoundary appName="reader">
        <Boom />
      </AppErrorBoundary>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("reader 앱에 문제가 생겼어요");
    expect(notify).toHaveBeenCalledWith("reader 앱 오류");
  });

  it("재시도 시 children으로 돌아간다", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;
    function Toggle(): React.ReactElement {
      if (shouldThrow) throw new Error("boom");
      return <div>recovered</div>;
    }

    render(
      <AppErrorBoundary appName="files">
        <Toggle />
      </AppErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // children 이 더 이상 throw 하지 않도록 뒤집고 retry.
    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("recovered")).toBeInTheDocument();
  });

  it("onRetry prop이 있으면 재시도 시 함께 호출된다", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <AppErrorBoundary appName="music" onRetry={onRetry}>
        <Boom />
      </AppErrorBoundary>,
    );
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});