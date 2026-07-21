import { describe, it, expect, vi } from "vitest";

// @sanity/image-url 이 projectId/dataset 를 빌더 모듈 로드 시점에 캡처한다.
// photo-url.ts 가 import 하는 image.ts 가 env 를 거치므로, 모듈 로드 전에
// projectId/dataset 가 결정돼야 한다. vi.mock 은 hoisted 되므로 안전.
vi.mock("@/lib/sanity/env", () => ({
  projectId: "test",
  dataset: "production",
  apiVersion: "2025-01-01",
  readToken: undefined,
}));

import { photoThumbSrc, photoPanelSrc, photoLightboxSrc, photoAvatarSrc } from "./photo-url";

// _id 형식: image-{id}-{w}x{h}-{ext} — @sanity/image-url 의 parseAssetId 가 split('-') 한다.
const ASSET_3X4 = { _id: "image-abc123-2000x3000-jpg" } as const;

describe("photoThumbSrc", () => {
  it("falsy asset → 빈 문자열 (방어적 fallback)", () => {
    expect(photoThumbSrc(null)).toBe("");
    expect(photoThumbSrc(undefined)).toBe("");
  });

  it("truthy asset → Sanity CDN URL 형식 (https://cdn.sanity.io/images/{projectId}/{dataset}/...)", () => {
    const url = photoThumbSrc(ASSET_3X4);
    expect(url.startsWith("https://cdn.sanity.io/images/test/production/abc123-2000x3000.jpg")).toBe(true);
  });

  it("width/height 가 URL query 에 들어감 (thumb 은 4:3)", () => {
    const url = photoThumbSrc(ASSET_3X4, 480);
    expect(url).toContain("w=480");
    expect(url).toContain("h=360");
  });

  it("fit/auto/quality 가 URL 에 들어감", () => {
    const url = photoThumbSrc(ASSET_3X4);
    expect(url).toContain("fit=crop");
    expect(url).toContain("auto=format");
    expect(url).toContain("q=85");
  });

  it("size 파라미터로 width/height 가 비례 조정", () => {
    const url = photoThumbSrc(ASSET_3X4, 320);
    expect(url).toContain("w=320");
    expect(url).toContain("h=240");
  });
});

describe("photoPanelSrc", () => {
  it("falsy asset → 빈 문자열", () => {
    expect(photoPanelSrc(null)).toBe("");
  });

  it("720x540 + quality 88", () => {
    const url = photoPanelSrc(ASSET_3X4);
    expect(url.startsWith("https://cdn.sanity.io/images/test/production/abc123-2000x3000.jpg")).toBe(true);
    expect(url).toContain("w=720");
    expect(url).toContain("h=540");
    expect(url).toContain("fit=crop");
    expect(url).toContain("auto=format");
    expect(url).toContain("q=88");
  });
});

describe("photoLightboxSrc", () => {
  it("falsy asset → 빈 문자열", () => {
    expect(photoLightboxSrc(null)).toBe("");
  });

  it("width 1600 + auto + quality 92 (fit 없음 — 비율 유지)", () => {
    const url = photoLightboxSrc(ASSET_3X4);
    expect(url.startsWith("https://cdn.sanity.io/images/test/production/abc123-2000x3000.jpg")).toBe(true);
    expect(url).toContain("w=1600");
    expect(url).toContain("auto=format");
    expect(url).toContain("q=92");
    expect(url).not.toContain("fit=");
  });
});

describe("photoAvatarSrc", () => {
  it("falsy asset → 빈 문자열", () => {
    expect(photoAvatarSrc(null)).toBe("");
  });

  it("정사각형 crop, size 기본값 96", () => {
    const url = photoAvatarSrc(ASSET_3X4);
    expect(url.startsWith("https://cdn.sanity.io/images/test/production/abc123-2000x3000.jpg")).toBe(true);
    expect(url).toContain("w=96");
    expect(url).toContain("h=96");
    expect(url).toContain("fit=crop");
    expect(url).toContain("auto=format");
    expect(url).toContain("q=85");
  });

  it("size 파라미터로 width/height 동기 적용", () => {
    const url = photoAvatarSrc(ASSET_3X4, 22);
    expect(url).toContain("w=22");
    expect(url).toContain("h=22");
  });
});
