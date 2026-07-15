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
  /** Sanity photoType.folder (string, optional). 미지정 시 groupByFolder 가 "(미분류)"로 모음. */
  folder?: string;
  /** Sanity photoType.description (text, optional). 1줄 권장. */
  description?: string;
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

/** 밴드 멤버(이름·역할·사진). */
export interface ArtistMember {
  name: string;
  role: string; // 없으면 ""
  photoUrl: string; // 없으면 ""
}

/** 가수 정보(Sanity artist 문서/참조에서 정규화). */
export interface ArtistInfo {
  id: string; // Sanity _id (디렉터리 key·강조 비교용, 없으면 "")
  name: string;
  photoUrl: string; // 대표 사진, 없으면 ""
  bio: string;
  genre: string;
  origin: string;
  links: ArtistLink[];
  members: ArtistMember[];
}

/** 앨범(Sanity album 문서에서 정규화). */
export interface Album {
  id: string;
  title: string;
  coverUrl: string; // 없으면 ""
  year: string; // 발매연도 표시용, 없으면 ""
  artistId: string; // 소속 아티스트 _id
}

export interface Track {
  videoId: string;
  title: string;
  artist: string; // 표시 라벨(참조 없어도 유지)
  artistInfo: ArtistInfo | null; // artistRef 참조가 있을 때만
  albumId: string | null; // albumRef 참조가 있을 때만
}

/** 조인 결과: 가수 상세에 쓰는 노래 참조(재생 인덱스 = 전체 tracks 내 위치). */
export interface SongRef {
  index: number;
  title: string;
  artist: string;
}

/** 조인 결과: 앨범 + 수록곡. */
export interface AlbumView {
  id: string;
  title: string;
  coverUrl: string;
  year: string;
  songs: SongRef[];
}

/** 조인 결과: 아티스트 상세(카드 + 앨범 + 노래). */
export interface ArtistView {
  info: ArtistInfo;
  albums: AlbumView[];
  songs: SongRef[];
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

/**
 * 플로팅 창(타일 레이아웃에서 벗어나 자유 위치) 의 사각형.
 * useRuehanix CoreState.floating 의 값. layout-storage v2 슬라이스로 영속.
 * ADR 0025 — Hyprland floating 동등.
 */
export interface FloatRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
