import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ruehan.dev";
const TITLE = "ruehanix — 한규 / ruehan";
const DESCRIPTION = "한규(ruehan)의 기술 블로그/포트폴리오 — Hyprland 스타일 데스크톱 셸. 서버 컴포넌트와 모노레포, 그리고 트랙 위의 0.1초에 대한 기록.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · ruehanix" },
  description: DESCRIPTION,
  applicationName: "ruehanix",
  authors: [{ name: "한규", url: SITE_URL }],
  creator: "한규",
  keywords: ["ruehan", "ruehanix", "기술 블로그", "full-stack", "Next.js", "sim racing", "Hyprland"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ruehanix",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#11111b" },
    { media: "(prefers-color-scheme: light)", color: "#dce0e8" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router에는 pages/_document가 없어 이 규칙은 오탐이다. 디자인 충실도를 위해
            원본과 동일한 Google Fonts 링크 방식을 유지한다. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
