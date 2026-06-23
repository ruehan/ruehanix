export type AppKey =
  | "files"
  | "reader"
  | "foto"
  | "hotlap"
  | "terminal"
  | "web"
  | "music"
  | "settings"
  | "about";

export type CatKey = "dev" | "sim" | "moto" | "music";
export type ThemeMode = "light" | "dark" | "auto";

export interface AppMeta {
  name: string;
  color: string;
  hint: string;
}

/** 소스(Sanity 등)에서 정규화된 사진. */
export interface Photo {
  url: string;
  title: string;
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

/** 플레이리스트 한 곡. videoId는 YouTube 영상 ID(11자). */
/** 아티스트 외부 링크(공식·인스타·유튜브 등). */
export interface ArtistLink {
  label: string;
  url: string;
}

/** 가수 정보(Sanity artist 문서/참조에서 정규화). */
export interface ArtistInfo {
  id: string; // Sanity _id (디렉터리 key·강조 비교용, 없으면 "")
  name: string;
  photoUrl: string; // 없으면 ""
  bio: string;
  genre: string;
  origin: string;
  links: ArtistLink[];
}

export interface Track {
  videoId: string;
  title: string;
  artist: string; // 표시 라벨(참조 없어도 유지)
  artistInfo: ArtistInfo | null; // artistRef 참조가 있을 때만
}

/** 반복 모드: 끔 · 전체 반복 · 한 곡 반복. */
export type Repeat = "off" | "all" | "one";

/** 음악 플레이어의 순수 상태(엔진과 무관한 로직 부분). */
export interface PlayerState {
  index: number; // TRACKS 내 현재 곡 인덱스
  playing: boolean;
  volume: number; // 0..100
  repeat: Repeat;
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
