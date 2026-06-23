import type {
  AppKey,
  AppMeta,
  BootLine,
  CatKey,
  Lap,
} from "./types";

export const APP_META: Record<AppKey, AppMeta> = {
  files: { name: "Files", color: "#89b4fa", hint: "파일 탐색" },
  reader: { name: "Reader", color: "#f5c2e7", hint: "글 읽기" },
  foto: { name: "Foto", color: "#a6e3a1", hint: "사진" },
  hotlap: { name: "HOT LAP", color: "#f38ba8", hint: "심레이싱" },
  terminal: { name: "Terminal", color: "#94e2d5", hint: "셸" },
  web: { name: "Web", color: "#89dceb", hint: "ruehan.dev" },
  music: { name: "rhx-play", color: "#cba6f7", hint: "음악" },
  settings: { name: "Settings", color: "#fab387", hint: "설정" },
  about: { name: "About", color: "#cba6f7", hint: "시스템 정보" },
};

export const APP_KEYS = Object.keys(APP_META) as AppKey[];

export const CATS: Record<CatKey, { label: string; color: string }> = {
  dev: { label: "dev", color: "#89b4fa" },
  sim: { label: "racing", color: "#f38ba8" },
  moto: { label: "moto", color: "#fab387" },
  music: { label: "music", color: "#cba6f7" },
};


export const LAPS: Lap[] = [
  { track: "Nürburgring Nordschleife", car: "BMW M4 GT3", time: "6:59.214", delta: "-0.41", best: true },
  { track: "Spa-Francorchamps", car: "Ferrari 296 GT3", time: "2:17.882", delta: "-0.12", best: false },
  { track: "Monza", car: "Porsche 992 GT3 R", time: "1:47.503", delta: "+0.08", best: false },
  { track: "Suzuka", car: "BMW M4 GT3", time: "2:00.661", delta: "-0.27", best: false },
  { track: "Le Mans · La Sarthe", car: "Toyota GR010", time: "3:24.119", delta: "-0.55", best: false },
];

export const BOOT_SEQ: BootLine[] = [
  ["ok", "Reached target ", "Basic System"],
  ["ok", "Started ", "Network Manager"],
  ["ok", "Mounted ", "/home/ruehan"],
  ["ok", "Started ", "Bluetooth service"],
  ["ok", "Started ", "PipeWire Multimedia"],
  ["ok", "Reached target ", "Graphical Interface"],
  ["ok", "Started ", "Hyprland session"],
  ["ok", "Started ", "rhx-play audio daemon"],
  ["info", "Loading ", "Catppuccin Mocha theme"],
  ["info", "Spawning ", "waybar · conky · fastfetch"],
  ["ok", "Welcome to ", "ruehanix 1.0 (kernel 6.9.2-rue)"],
];

export const ACCENT_PALETTE = ["#f38ba8", "#fab387", "#a6e3a1", "#cba6f7", "#89b4fa", "#f5c2e7"];

export const THEME_MODES = [
  { k: "light", label: "Light", prev: "linear-gradient(135deg,#eff1f5,#ccd0da)" },
  { k: "dark", label: "Dark", prev: "linear-gradient(135deg,#1e1e2e,#45475a)" },
  { k: "auto", label: "Auto", prev: "linear-gradient(135deg,#eff1f5 0%,#eff1f5 48%,#1e1e2e 52%,#1e1e2e 100%)" },
] as const;
