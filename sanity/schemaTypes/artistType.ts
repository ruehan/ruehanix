import { defineArrayMember, defineField, defineType } from "sanity";

export const artistType = defineType({
  name: "artist",
  title: "아티스트",
  type: "document",
  fields: [
    defineField({ name: "name", title: "이름", type: "string", validation: (r) => r.required() }),
    defineField({ name: "photo", title: "프로필 사진", type: "image", options: { hotspot: true } }),
    defineField({ name: "genre", title: "장르", type: "string", description: "예: 포크록, lo-fi" }),
    defineField({ name: "origin", title: "출신", type: "string", description: "예: 서울, 한국" }),
    defineField({ name: "bio", title: "소개", type: "text", rows: 5 }),
    defineField({
      name: "links",
      title: "링크",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            { name: "label", title: "라벨", type: "string", description: "예: 공식, Instagram, YouTube" },
            { name: "url", title: "URL", type: "url" },
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "members",
      title: "멤버",
      type: "array",
      description: "밴드/그룹 멤버. 솔로면 비워두세요.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            { name: "name", title: "이름", type: "string", validation: (r) => r.required() },
            { name: "role", title: "역할", type: "string", description: "예: 보컬, 기타" },
            { name: "photo", title: "사진", type: "image", options: { hotspot: true } },
          ],
          preview: { select: { title: "name", subtitle: "role", media: "photo" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "name", subtitle: "genre", media: "photo" } },
});
