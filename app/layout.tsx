import type { Metadata, Viewport } from "next";
import { MOCHA_TO_LATTE } from "@/lib/ruehanix/theme";
import { DEFAULT_UI, UI_STORAGE_KEY } from "@/lib/ruehanix/ui-storage";
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

/**
 * 페인트 전 테마 적용 인라인 스크립트. 첫 페인트 전에 localStorage UI 설정을 읽어
 * html.rh-light 클래스 + --accent를 적용 → 재방문 시 테마 깜빡임(flash) 제거.
 * 로직은 lib/ruehanix/theme.ts 의 resolveEarlyTheme과 동일(순수 함수 테스트가 값을 수호).
 * 맵·기본값·저장 키는 import해 단일 진실 소스로 유지. ADR 0011 백로그, 0020에서 채택.
 */
const EARLY_THEME_SCRIPT = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(UI_STORAGE_KEY)});var mode=${JSON.stringify(DEFAULT_UI.mode)},accent=${JSON.stringify(DEFAULT_UI.accent)};if(raw){try{var o=JSON.parse(raw);if(o&&(o.mode==="light"||o.mode==="dark"||o.mode==="auto")&&typeof o.accent==="string"&&/^#[0-9a-fA-F]{6}$/.test(o.accent)){mode=o.mode;accent=o.accent;}}catch(e){}}var pl=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches;var light=mode==="light"||(mode==="auto"&&pl);var m=${JSON.stringify(MOCHA_TO_LATTE)};var a=light?(m[accent]||accent):accent;if(light)document.documentElement.classList.add("rh-light");document.documentElement.style.setProperty("--accent",a);}catch(e){}})();`;


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
        {/* 페인트 전 실행 — 본문 애니메이션/리액트 하이드레이션보다 먼저 테마 적용. blocking. */}
        <script dangerouslySetInnerHTML={{ __html: EARLY_THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
