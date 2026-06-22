export type AppKey =
  | "files"
  | "reader"
  | "foto"
  | "hotlap"
  | "terminal"
  | "web"
  | "settings"
  | "about";

export type CatKey = "dev" | "sim" | "moto" | "music";
export type ThemeMode = "light" | "dark" | "auto";

export interface AppMeta {
  name: string;
  color: string;
  hint: string;
}

export interface Photo {
  t: string;
  c1: string;
  c2: string;
  tag: string;
}

export interface Lap {
  track: string;
  car: string;
  time: string;
  delta: string;
  best: boolean;
}

export type BootLine = ["ok" | "info", string, string];

export interface UiState {
  mode: ThemeMode;
  accent: string;
  gap: number;
  rounded: boolean;
  glow: boolean;
  transp: boolean;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Gutter {
  key: string;
  dir: "v" | "h";
  total: number;
  x: number;
  y: number;
  w: number;
  h: number;
}
