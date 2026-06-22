import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ruehanix — 한규 / ruehan",
  description: "한규(ruehan)의 기술 블로그/포트폴리오 — Hyprland 스타일 데스크톱 셸",
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
