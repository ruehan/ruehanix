import type {
  AppKey,
  AppMeta,
  BootLine,
  CatKey,
  Lap,
  Photo,
} from "./types";

export const APP_META: Record<AppKey, AppMeta> = {
  files: { name: "Files", color: "#89b4fa", hint: "파일 탐색" },
  reader: { name: "Reader", color: "#f5c2e7", hint: "글 읽기" },
  foto: { name: "Foto", color: "#a6e3a1", hint: "사진" },
  hotlap: { name: "HOT LAP", color: "#f38ba8", hint: "심레이싱" },
  terminal: { name: "Terminal", color: "#94e2d5", hint: "셸" },
  web: { name: "Web", color: "#89dceb", hint: "ruehan.dev" },
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


export const PHOTOS: Photo[] = [
  { t: "Spa · Eau Rouge", c1: "#1b3a5c", c2: "#3f7cae", tag: "track" },
  { t: "베이스 셋업 · 합주실", c1: "#3a2a1a", c2: "#9a6b3a", tag: "music" },
  { t: "르망 새벽 4시", c1: "#1a1330", c2: "#5b3f8a", tag: "moto" },
  { t: "트리플 모니터 리그", c1: "#10211c", c2: "#2f6f57", tag: "sim" },
  { t: "몬차 · 파라볼리카", c1: "#3a1320", c2: "#b03a52", tag: "track" },
  { t: "주말의 LP", c1: "#2a2410", c2: "#a08a2a", tag: "music" },
  { t: "스즈카 · S자", c1: "#10243a", c2: "#3a86c0", tag: "track" },
  { t: "야간 코딩", c1: "#1a1a22", c2: "#4a4a66", tag: "dev" },
  { t: "WEC 피트월", c1: "#2a160a", c2: "#c0641a", tag: "moto" },
];

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
