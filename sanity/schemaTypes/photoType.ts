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
    defineField({ name: "order", title: "순서", type: "number", description: "작을수록 앞. 비우면 제목순." }),
  ],
  orderings: [{ title: "순서 오름차순", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "tag", media: "image" } },
});
