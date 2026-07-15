/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Sanity CDN 호스트 — next/image 가 외부 호스트 사용하려면 명시 필요.
    // FotoApp 그리드의 큰 사진이 Sanity images 를 가리키므로 fill 모드로 변환한다.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  // vendor tree-shake — 큰 import 표면 줄이기. ADR 0042 후속.
  experimental: {
    optimizePackageImports: ["@sanity/image-url", "next-sanity", "@sanity/vision"],
  },
};

export default nextConfig;