import { describe, expect, it } from "vitest";
import type { PortableTextBlock } from "@portabletext/types";
import { extractHeadings, headingText } from "./reader";

const span = (text: string): unknown => ({ _key: "k-" + text, _type: "span", text });
const block = (style: string, children: unknown[], key = style + "-key"): PortableTextBlock =>
  ({ _key: key, _type: "block", style, children: children as never, markDefs: [] } as never);

describe("headingText", () => {
  it("자식 span의 text를 순서대로 이어붙인다", () => {
    expect(headingText([span("Hello, "), span("world")] as never)).toBe("Hello, world");
  });
  it("text가 없는 자식은 무시, 양끝 공백 다듬기", () => {
    expect(headingText([span("  제목  "), span("")] as never)).toBe("제목");
  });
});

describe("extractHeadings", () => {
  const body: PortableTextBlock[] = [
    block("normal", [span("도입")]),
    block("h2", [span("첫 번째 장")], "k1"),
    block("normal", [span("본문")]),
    block("h3", [span("세부"), span(" A")], "k2"),
    block("h4", [span("더 깊이")], "k3"),
    block("h2", [span("")], "k4"),
  ];

  it("h2/h3/h4만 추출(일반 문단 제외) — level은 숫자", () => {
    const hs = extractHeadings(body);
    expect(hs.map((h) => h.level)).toEqual([2, 3, 4]);
  });
  it("id는 블록 _key(안정적·고유) — TOC 앵커와 PostBody가 공유", () => {
    const hs = extractHeadings(body);
    expect(hs.map((h) => h.id)).toEqual(["k1", "k2", "k3"]);
  });
  it("text는 자식을 이어붙이고 다듬은 결과", () => {
    const hs = extractHeadings(body);
    expect(hs.map((h) => h.text)).toEqual(["첫 번째 장", "세부 A", "더 깊이"]);
  });
  it("빈 제목(공백만)은 건너뛴다", () => {
    const hs = extractHeadings(body);
    expect(hs.find((h) => h.id === "k4")).toBeUndefined();
  });
  it("빈 본문이거나 헤딩이 없으면 빈 배열", () => {
    expect(extractHeadings([])).toEqual([]);
    expect(extractHeadings([block("normal", [span("x")])])).toEqual([]);
  });
  it("style이 없는(normal) 블록은 헤딩이 아니다", () => {
    const noStyle = { _key: "n", _type: "block", children: [span("x")] } as unknown as PortableTextBlock;
    expect(extractHeadings([noStyle])).toEqual([]);
  });
  it("_key가 없는 헤딩은 빈 id로 querySelector throw를 유발 → 제외", () => {
    const noKey = { _type: "block", style: "h2", children: [span("제목")] } as unknown as PortableTextBlock;
    expect(extractHeadings([noKey])).toEqual([]);
  });
});
