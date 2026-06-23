import type { JSX } from "react";
import type { AppKey } from "@/lib/ruehanix/types";

/** neofetch 스타일 아스키 아트 (데스크톱 위젯 / 터미널은 들여쓰기만 다름). */
export const ART_DESK = [
  "      .---.",
  "     /     \\",
  "     \\.@-@./",
  "     /`\\_/`\\",
  "    //  _  \\\\",
  "   | \\     )|_",
  " /`\\_`>  <_/ \\",
  " \\__/'---'\\__/",
].join("\n");

export const ART_TERM = [
  "    .---.",
  "   /     \\",
  "   \\.@-@./",
  "   /`\\_/`\\",
  "  //  _  \\\\",
  " | \\     )|_",
  "/`\\_`>  <_/ \\",
  "\\__/'---'\\__/",
].join("\n");

/** Files 사이드바 폴더 아이콘. */
export function Folder({ color }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="1.7" strokeLinejoin="round">
      <path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
    </svg>
  );
}

const PATHS: Record<AppKey, JSX.Element[]> = {
  files: [<path key={1} d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />],
  reader: [
    <path key={1} d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2V5z" />,
    <path key={2} d="M12 3h6a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2h-6" />,
  ],
  foto: [
    <rect key={1} x={3} y={4} width={18} height={16} rx={2} />,
    <circle key={2} cx={8.5} cy={9.5} r={1.5} />,
    <path key={3} d="M4 18l5-5 4 4 3-3 4 4" />,
  ],
  hotlap: [
    <circle key={1} cx={12} cy={12} r={9} />,
    <circle key={2} cx={12} cy={12} r={2.2} />,
    <path key={3} d="M12 3v5M3.8 9.5l4.8 2.2M20.2 9.5l-4.8 2.2" />,
  ],
  terminal: [
    <rect key={1} x={3} y={4} width={18} height={16} rx={2} />,
    <path key={2} d="M7 9l3 3-3 3M12.5 15h4" />,
  ],
  web: [
    <circle key={1} cx={12} cy={12} r={9} />,
    <path key={2} d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />,
  ],
  music: [
    <path key={1} d="M9 18V5l10-2v13" />,
    <circle key={2} cx={6} cy={18} r={3} />,
    <circle key={3} cx={16} cy={16} r={3} />,
  ],
  settings: [
    <circle key={1} cx={12} cy={12} r={3} />,
    <path key={2} d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />,
  ],
  about: [
    <circle key={1} cx={12} cy={12} r={9} />,
    <path key={2} d="M12 11v5" />,
    <circle key={3} cx={12} cy={7.8} r={0.7} fill="currentColor" />,
  ],
};

/** 앱별 라인 아이콘. */
export function LineIcon({ app, size = 22 }: { app: AppKey; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[app]}
    </svg>
  );
}
