// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilesApp } from "./FilesApp";
import type { Vm } from "./viewModel";
import type { CatKey } from "@/lib/ruehanix/types";

function mkVm(opts?: { cats?: ("all" | CatKey)[]; posts?: Array<{ id: string; title: string; date: string; excerpt: string; cat: CatKey }>; selected?: "all" | CatKey }) {
  const cats = (opts?.cats ?? ["all", "dev", "sim", "moto", "music", "blog"]) as ("all" | CatKey)[];
  const catSet = new Set(cats);
  const selected = opts?.selected ?? "all";
  const finders = (opts?.posts ?? [
    { id: "a", title: "alpha", date: "2026-07-10", excerpt: "alpha body", cat: "dev" as CatKey },
    { id: "b", title: "beta",  date: "2026-06-01", excerpt: "beta body",  cat: "sim" as CatKey },
    { id: "c", title: "gamma", date: "2026-05-20", excerpt: "gamma body", cat: "blog" as CatKey },
  ]);
  const colorOf: Record<string, string> = {
    all: "#cba6f7", dev: "#89b4fa", sim: "#f38ba8", moto: "#fab387", music: "#cba6f7", blog: "#a6e3a1",
  };
  const labelOf: Record<string, string> = {
    all: "all", dev: "dev", sim: "racing", moto: "moto", music: "music", blog: "blog",
  };
  // 카테고리 필터 (vm 의 finderPosts 와 동치). open 핸들러는 id 별로 단일 인스턴스 공유.
  const openById: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const p of finders) openById[p.id] = vi.fn();
  const visible = selected === "all" ? finders : finders.filter((p) => p.cat === selected);
  const finderPosts = visible.map((p) => ({
    id: p.id,
    title: p.title,
    date: p.date,
    read: "1 min",
    excerpt: p.excerpt,
    catLabel: labelOf[p.cat],
    catColor: colorOf[p.cat],
    rowBg: "transparent" as const,
    open: openById[p.id],
  }));
  const allPosts = finders.map((p) => ({
    id: p.id,
    title: p.title,
    date: p.date,
    read: "1 min",
    excerpt: p.excerpt,
    catLabel: labelOf[p.cat],
    catColor: colorOf[p.cat],
    rowBg: "transparent" as const,
    open: openById[p.id],
  }));
  const finderCats = cats
    .filter((k) => catSet.has(k))
    .map((k) => ({
      key: k,
      label: labelOf[k],
      active: k === selected,
      onClick: vi.fn(),
      chipStyle: {},
    }));
  const fakeVm = {
    finderCats,
    finderPosts,
    finderCount: `${finderPosts.length} items · ${finders.length} total`,
    allPosts,
    stop: vi.fn(),
  } as unknown as Vm;
  return { fakeVm, finderCats, finderPosts, allPosts, openById };
}

describe("FilesApp", () => {
  it("사이드바에 3개 그룹 라벨(library / sort / view) 표시", () => {
    const { fakeVm } = mkVm();
    render(<FilesApp vm={fakeVm} />);
    const aside = screen.getByRole("complementary", { name: "사이드바" });
    expect(within(aside).getByText("library")).toBeInTheDocument();
    expect(within(aside).getByText("sort")).toBeInTheDocument();
    expect(within(aside).getByText("view")).toBeInTheDocument();
  });

  it("카테고리 클릭 → finderCats 의 onClick 호출", () => {
    const { fakeVm, finderCats } = mkVm();
    render(<FilesApp vm={fakeVm} />);
    const aside = screen.getByRole("complementary", { name: "사이드바" });
    // "dev" 라벨의 row 클릭
    const dev = within(aside).getByRole("button", { name: "dev 필터" });
    fireEvent.click(dev);
    expect(finderCats.find((c) => c.key === "dev")!.onClick).toHaveBeenCalledTimes(1);
  });

  it("카테고리 active 항목은 aria-pressed=true", () => {
    const { fakeVm } = mkVm({ selected: "sim" });
    render(<FilesApp vm={fakeVm} />);
    const aside = screen.getByRole("complementary", { name: "사이드바" });
    const simBtn = within(aside).getByRole("button", { name: "racing 필터" });
    expect(simBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("정렬 클릭 → 정렬 결과 재정렬 (title a→z)", () => {
    const { fakeVm } = mkVm();
    render(<FilesApp vm={fakeVm} />);
    const aside = screen.getByRole("complementary", { name: "사이드바" });
    fireEvent.click(within(aside).getByRole("button", { name: "제목 가→하 정렬" }));
    // 정렬 후 첫 행은 alpha (가나다…에서 "alpha" 가 first)
    const main = screen.getByRole("listbox", { name: "글 목록" });
    const firstRow = within(main).getAllByRole("button")[0];
    expect(within(firstRow).getByText("alpha")).toBeInTheDocument();
  });

  it("density radiogroup: 활성 항목만 aria-checked=true + tabIndex=0, 비활성은 -1", () => {
    const { fakeVm } = mkVm();
    render(<FilesApp vm={fakeVm} />);
    const aside = screen.getByRole("complementary", { name: "사이드바" });
    const group = within(aside).getByRole("radiogroup", { name: "밀도" });
    const comfy = within(group).getByRole("radio", { name: "여유 보기" });
    const compact = within(group).getByRole("radio", { name: "빽빽한 보기" });
    expect(comfy).toHaveAttribute("aria-checked", "true");
    expect(comfy).toHaveAttribute("tabindex", "0");
    expect(compact).toHaveAttribute("aria-checked", "false");
    expect(compact).toHaveAttribute("tabindex", "-1");
  });

  it("density compact 클릭 → 다음 클릭부터 compact 가 active (aria-checked 토글)", () => {
    const { fakeVm } = mkVm();
    render(<FilesApp vm={fakeVm} />);
    const aside = screen.getByRole("complementary", { name: "사이드바" });
    const group = within(aside).getByRole("radiogroup", { name: "밀도" });
    const compact = within(group).getByRole("radio", { name: "빽빽한 보기" });
    fireEvent.click(compact);
    expect(compact).toHaveAttribute("aria-checked", "true");
    expect(compact).toHaveAttribute("tabindex", "0");
    expect(within(group).getByRole("radio", { name: "여유 보기" })).toHaveAttribute("aria-checked", "false");
  });

  it("검색 입력 → 결과 필터링, 0개면 EmptyPosts 표시", () => {
    const { fakeVm } = mkVm();
    render(<FilesApp vm={fakeVm} />);
    const input = screen.getByRole("textbox", { name: "글 검색" });
    fireEvent.change(input, { target: { value: "없는키워드" } });
    expect(screen.getByText("아직 글이 없습니다")).toBeInTheDocument();
  });

  it("글 row 클릭 → open 핸들러 호출", () => {
    const { fakeVm, openById } = mkVm();
    render(<FilesApp vm={fakeVm} />);
    const row = screen.getByRole("button", { name: "alpha 열기" });
    fireEvent.click(row);
    expect(openById["a"]).toHaveBeenCalledTimes(1);
  });

  it("Enter 키로 row 활성화", () => {
    const { fakeVm, openById } = mkVm();
    render(<FilesApp vm={fakeVm} />);
    const row = screen.getByRole("button", { name: "beta 열기" });
    fireEvent.keyDown(row, { key: "Enter" });
    expect(openById["b"]).toHaveBeenCalledTimes(1);
  });

  it("사이드바 카테고리 row 의 kbd chip 표시 (⌘1~⌘6)", () => {
    const { fakeVm } = mkVm();
    const { container } = render(<FilesApp vm={fakeVm} />);
    // 디자인 의도: 각 카테고리 row 의 단축키 표시
    expect(container.textContent).toContain("⌘1");
    expect(container.textContent).toContain("⌘2");
    expect(container.textContent).toContain("⌘6");
  });

  it("sticky 컬럼 헤더 표시 (name / category / date)", () => {
    const { fakeVm } = mkVm();
    const { container } = render(<FilesApp vm={fakeVm} />);
    expect(container.textContent).toContain("name");
    expect(container.textContent).toContain("category");
    expect(container.textContent).toContain("date");
  });

  it("상태바 단축키 (open / search / cycle sort) 표시", () => {
    const { fakeVm } = mkVm();
    const { container } = render(<FilesApp vm={fakeVm} />);
    expect(container.textContent).toContain("open");
    expect(container.textContent).toContain("search");
    expect(container.textContent).toContain("cycle sort");
    expect(container.textContent).toContain("↵");
    expect(container.textContent).toContain("⌘K");
    expect(container.textContent).toContain("⌘⇧S");
  });
});