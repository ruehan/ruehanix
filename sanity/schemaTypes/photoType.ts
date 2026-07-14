import { defineField, defineType } from "sanity";

export const photoType = defineType({
  name: "photo",
  title: "사진",
  type: "document",
  fields: [
    defineField({ name: "title", title: "제목", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "image",
      title: "이미지",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: "tag", title: "태그", type: "string", description: "예: track, music, moto, sim, dev" }),
    defineField({
      name: "folder",
      title: "폴더",
      type: "string",
      description: "1단계 분류. 자유 입력. 비우면 (미분류) 폴더에 모임.",
    }),
    defineField({
      name: "description",
      title: "설명",
      type: "text",
      rows: 1,
      description: "1줄 설명. 사진 윈도우의 info 패널에 표시.",
    }),
    defineField({ name: "order", title: "순서", type: "number", description: "작을수록 앞. 비우면 제목순." }),
  ],
  orderings: [
    { title: "순서 오름차순", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
    { title: "폴더 → 순서", name: "folderOrder", by: [{ field: "folder", direction: "asc" }, { field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "title", subtitle: "folder", media: "image" } },
});
