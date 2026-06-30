/**
 * 설정 앱(SettingsApp)의 순수 데이터.
 * - SETTINGS_TABS: 사이드바 탭 목록(구현 여부 포함).
 * - KEYBINDINGS: 단축키 [combo, 설명]. shell 오버레이와 Keybindings 탭이 공유(DRY).
 * - ABOUT_META: About 탭 정적 메타.
 * @see docs/decisions/0019-settings-tabs-revamp.md
 */

export interface SettingsTab {
  key: "general" | "appearance" | "windowrules" | "keybindings" | "displays" | "wallpaper" | "about";
  label: string;
  ready: boolean;
}

/** 사이드바 순서 = 표시 순서. 미구현 탭은 ready:false로 비활성 표시. */
export const SETTINGS_TABS: SettingsTab[] = [
  { key: "general", label: "General", ready: false },
  { key: "appearance", label: "Appearance", ready: true },
  { key: "windowrules", label: "Window Rules", ready: false },
  { key: "keybindings", label: "Keybindings", ready: true },
  { key: "displays", label: "Displays", ready: false },
  { key: "wallpaper", label: "Wallpaper", ready: false },
  { key: "about", label: "About", ready: true },
];

/** 단축키. Hyprland 스타일. shell 오버레이(RuehanixShell)와 Keybindings 탭이 공유. */
export const KEYBINDINGS: [string, string][] = [
  ["Super + D", "앱 실행기"],
  ["Super + 1-6", "워크스페이스 이동"],
  ["Super + Shift + 1-6", "창을 ws로 이동"],
  ["Super + Q", "창 닫기"],
  ["Super + F", "창 최대화/복원"],
  ["Super + Shift + ←/→", "타일 자리바꿈"],
  ["Super + /", "이 도움말"],
  ["Esc", "오버레이 닫기"],
  ["↑ / ↓ / Enter", "런처 결과 탐색"],
  ["드래그", "타일 경계 크기조절"],
  ["워크스페이스 클릭", "바에서 전환"],
  ["앱 클릭", "포커스 이동"],
];

export interface AboutMeta {
  name: string;
  version: string;
  kernel: string;
  /** 부팅 시퀀스(BOOT_SEQ) 마지막 줄과 일치 — 회전하는 셸 메타포. */
  build: string;
  stack: string;
}

export const ABOUT_META: AboutMeta = {
  name: "ruehanix",
  version: "1.0",
  kernel: "6.9.2-rue",
  build: "Hyprland · Catppuccin Mocha",
  stack: "Next.js · React · Sanity",
};
