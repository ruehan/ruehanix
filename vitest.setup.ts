// 모든 vitest 테스트가 공유하는 환경 설정. setupFiles 로 자동 로드.
// - RTL cleanup() — 각 테스트 간 DOM 잔존물 정리 (멀티 매치 에러 방지).
import "@testing-library/react";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});