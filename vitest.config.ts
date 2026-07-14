import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.{ts,tsx}"],
    // 컴포넌트(.test.tsx)는 파일 상단 `// @vitest-environment happy-dom` 으로
    // 환경 오버라이드. lib/** 는 node 유지(ADR 0027).
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
