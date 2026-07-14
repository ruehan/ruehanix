// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { TerminalApp } from "./TerminalApp";

afterEach(() => {
  cleanup();
});

describe("TerminalApp", () => {
  it("프롬프트 줄을 렌더한다", () => {
    render(<TerminalApp />);
    // prompt "ruehan@ruehanix" 는 여러 줄에 등장. 모두 렌더됨만 확인.
    const prompts = screen.getAllByText(/ruehan@ruehanix/);
    expect(prompts.length).toBeGreaterThanOrEqual(2);
  });

  it("fastfetch OS 라벨과 값을 렌더한다", () => {
    render(<TerminalApp />);
    expect(screen.getByText("OS")).toBeInTheDocument();
    expect(screen.getByText("ruehanix 1.0 x86_64")).toBeInTheDocument();
  });
});