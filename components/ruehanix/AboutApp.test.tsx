// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AboutApp } from "./AboutApp";

describe("AboutApp", () => {
  it("시스템 타이틀과 부제목을 렌더한다", () => {
    render(<AboutApp />);
    expect(screen.getByText("ruehanix")).toBeInTheDocument();
    expect(screen.getByText(/kernel 6\.9\.2-rue/)).toBeInTheDocument();
  });

  it("하드웨어 스펙 행을 렌더한다", () => {
    render(<AboutApp />);
    // "CPU" 라벨과 값이 모두 표시됨 — getAllByText 로 다중 매치 허용.
    expect(screen.getAllByText("CPU").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Ryzen 9 7950X/)).toBeInTheDocument();
  });
});