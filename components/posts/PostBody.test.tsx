import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// PostBody → lib/sanity/image → lib/sanity/env 가 import 시 env vars 를 강제.
// table 렌더 검증에는 Sanity 이미지 불필요하므로 모킹.
vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({ width: () => ({ fit: () => ({ auto: () => ({ url: () => "" }) }) }) }),
}));

import { PostBody } from "./PostBody";
import type { PortableTextBlock } from "@portabletext/types";

const block = (text: string, _key: string) =>
  ({ _type: "block", _key, style: "normal", children: [{ _type: "span", _key: `${_key}s`, text, marks: [] }], markDefs: [] } as unknown as PortableTextBlock);

const table = {
  _type: "table",
  _key: "t1",
  headerRows: 1,
  rows: [
    {
      _type: "row",
      _key: "r1",
      cells: [
        { _type: "cell", _key: "c1", value: [block("축", "b1")] },
        { _type: "cell", _key: "c2", value: [block("Daily.md", "b2")] },
      ],
    },
    {
      _type: "row",
      _key: "r2",
      cells: [
        { _type: "cell", _key: "c3", value: [block("형태", "b3")] },
        { _type: "cell", _key: "c4", value: [block("데스크톱 네이티브", "b4")] },
      ],
    },
  ],
};

describe("PostBody — table 렌더", () => {
  it("table 블록 → <table> 안에 header <th> + 데이터 <td>", () => {
    const html = renderToStaticMarkup(
      <PostBody value={[table] as unknown as PortableTextBlock[]} />,
    );
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
    expect(html).toContain("축");
    expect(html).toContain("데스크톱 네이티브");
    expect(html).toContain("Daily.md");
  });
});
