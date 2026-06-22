import { describe, expect, it } from "vitest";
import { getAllPosts, getPost, getSlugs } from "./hardcoded";

describe("hardcoded 소스", () => {
  it("8글 전부, 발행일 최신순", async () => {
    const posts = await getAllPosts();
    expect(posts).toHaveLength(8);
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].publishedAt >= posts[i].publishedAt).toBe(true);
    }
  });
  it("각 글은 슬러그·ISO 발행일·문단 body를 가진다", async () => {
    const posts = await getAllPosts();
    for (const p of posts) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(Array.isArray(p.body)).toBe(true);
      expect(p.body.length).toBeGreaterThan(0);
    }
  });
  it("getPost: 슬러그로 찾고, 없으면 null", async () => {
    const slugs = await getSlugs();
    const one = await getPost(slugs[0]);
    expect(one?.slug).toBe(slugs[0]);
    expect(await getPost("없는-슬러그")).toBeNull();
  });
  it("슬러그는 유일", async () => {
    const slugs = await getSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
