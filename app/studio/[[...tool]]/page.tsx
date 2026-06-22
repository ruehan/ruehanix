"use client";

import dynamic from "next/dynamic";

// 스튜디오는 클라이언트 전용(Sanity 플러그인이 브라우저 의존). SSR 평가를 막는다.
const Studio = dynamic(() => import("./Studio").then((m) => m.Studio), { ssr: false });

export default function StudioPage() {
  return <Studio />;
}
