import { defineField, defineType } from "sanity";

/** YouTube 영상 ID 11자(주소 watch?v= 뒤 / youtu.be/ 뒤). */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export const trackType = defineType({
  name: "track",
  title: "곡",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "제목",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "artist",
      title: "아티스트(표시 이름)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "artistRef",
      title: "아티스트 정보(선택)",
      type: "reference",
      to: [{ type: "artist" }],
      description: "연결하면 음악 앱 '아티스트' 탭에 사진·소개·링크가 표시됩니다.",
    }),
    defineField({
      name: "videoId",
      title: "YouTube 영상 ID",
      type: "string",
      description: "주소 watch?v= 뒤 11자 (예: jfKfPfyJRdk). 전체 URL이 아니라 ID만.",
      validation: (r) =>
        r.required().custom((v) => (typeof v === "string" && YOUTUBE_ID.test(v) ? true : "11자 YouTube 영상 ID를 입력하세요")),
    }),
    defineField({
      name: "order",
      title: "순서",
      type: "number",
      description: "작을수록 위. 비우면 제목순.",
    }),
  ],
  orderings: [{ title: "순서 오름차순", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "artist" } },
});
