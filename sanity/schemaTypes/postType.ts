import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "글",
  type: "document",
  fields: [
    defineField({ name: "title", title: "제목", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "슬러그(URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "카테고리",
      type: "string",
      options: {
        list: [
          { title: "dev", value: "dev" },
          { title: "racing(sim)", value: "sim" },
          { title: "moto", value: "moto" },
          { title: "music", value: "music" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "publishedAt", title: "발행일", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "excerpt", title: "요약", type: "text", rows: 3 }),
    defineField({ name: "readingTime", title: "읽는 시간", type: "string", description: "예: 9분" }),
    defineField({ name: "cover", title: "커버 이미지", type: "image", options: { hotspot: true } }),
    defineField({
      name: "body",
      title: "본문",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
  ],
  orderings: [{ title: "발행일 최신순", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "category", media: "cover" } },
});
