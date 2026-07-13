import { defineCliConfig } from "sanity/cli";

// sanity CLI 설정. 프로젝트/데이터셋은 .env.local에서 가져온다(시크릿 아님).
// import/export 등 작업 전 동일한 projectId·dataset을 보장한다.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  },
});
