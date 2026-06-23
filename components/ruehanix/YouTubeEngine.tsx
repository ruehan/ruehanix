"use client";

import { useEffect, useEffectEvent, useRef } from "react";

// --- YouTube IFrame Player API 최소 타입 (전역 any 회피) ---
interface YTPlayer {
  loadVideoById(id: string): void;
  cueVideoById(id: string): void;
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  destroy(): void;
}
interface YTPlayerEvent {
  data: number;
  target: YTPlayer;
}
interface YTPlayerOptions {
  videoId?: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (e: YTPlayerEvent) => void;
    onStateChange?: (e: YTPlayerEvent) => void;
  };
}
interface YTNamespace {
  Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
  PlayerState: { ENDED: number };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";

/** IFrame API 스크립트를 1회 로드하고 준비되면 YT 네임스페이스를 돌려준다. */
function loadApi(): Promise<YTNamespace> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = API_SRC;
      document.head.appendChild(s);
    }
  });
}

interface EngineProps {
  videoId: string | null;
  playing: boolean;
  volume: number;
  onEnded: () => void;
}

/** 화면 밖에 상주하는 숨긴 YouTube 오디오 엔진.
 *  셸 루트에 마운트돼 앱/워크스페이스 전환에도 언마운트되지 않아 재생이 끊기지 않는다.
 *  스토어 상태(videoId·playing·volume)를 따라가는 부수효과 계층이다. */
export function YouTubeEngine({ videoId, playing, volume, onEnded }: EngineProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const loadedIdRef = useRef<string | null>(null);

  // 비동기 API 콜백에서 최신 props를 안전하게 읽는다(ref 미러 대신 effect event).
  const handleEnded = useEffectEvent(() => onEnded());
  const applyInitial = useEffectEvent((target: YTPlayer) => {
    target.setVolume(volume);
    if (videoId) {
      loadedIdRef.current = videoId;
      if (playing) target.loadVideoById(videoId);
      else target.cueVideoById(videoId);
    }
  });

  // 마운트 1회: API 로드 + 플레이어 생성.
  useEffect(() => {
    let cancelled = false;
    loadApi().then((YT) => {
      if (cancelled || !hostRef.current || playerRef.current) return;
      playerRef.current = new YT.Player(hostRef.current, {
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: (e) => {
            readyRef.current = true;
            applyInitial(e.target);
          },
          onStateChange: (e) => {
            if (window.YT && e.data === window.YT.PlayerState.ENDED) handleEnded();
          },
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
      loadedIdRef.current = null;
    };
  }, []);

  // 곡 변경 / 재생·정지 반영.
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    if (videoId && videoId !== loadedIdRef.current) {
      loadedIdRef.current = videoId;
      if (playing) p.loadVideoById(videoId);
      else p.cueVideoById(videoId);
      return;
    }
    if (playing) p.playVideo();
    else p.pauseVideo();
  }, [videoId, playing]);

  // 볼륨 반영.
  useEffect(() => {
    const p = playerRef.current;
    if (p && readyRef.current) p.setVolume(volume);
  }, [volume]);

  return (
    <div aria-hidden style={{ position: "fixed", left: -9999, top: -9999, width: 320, height: 180, opacity: 0, pointerEvents: "none" }}>
      <div ref={hostRef} />
    </div>
  );
}
