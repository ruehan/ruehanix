// 콘텐츠 소스 단일 진입점. 라우트·셸은 이 모듈만 import한다.
// Sanity Content Lake를 소스로 사용한다(ADR 0006/0010). 글이 0개면 빈 배열을 반환하고,
// 소비 측(라우트·셸)이 "아직 글 없음" 빈 상태를 처리한다.
export { getAllPosts, getPost, getSlugs } from "./queries";
