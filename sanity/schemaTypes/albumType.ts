import { defineField, defineType } from "sanity";

export const albumType = defineType({
  name: "album",
  title: "앨범",
  type: "document",
  fields: [
    defineField({ name: "title", title: "제목", type: "string", validation: (r) => r.required() }),
    defineField({ name: "cover", title: "표지", type: "image", options: { hotspot: true } }),
    defineField({ name: "year", title: "발매연도", type: "string", description: "예: 2023" }),
    defineField({
      name: "artistRef",
      title: "아티스트",
      type: "reference",
      to: [{ type: "artist" }],
      validation: (r) => r.required(),
      description: "이 앨범의 소속 아티스트.",
    }),
  ],
  preview: { select: { title: "title", subtitle: "year", media: "cover" } },
});
