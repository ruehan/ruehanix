// 콘텐츠 소스 단일 진입점. 라우트·SEO·셸은 이 모듈만 import한다.
// 지금은 하드코딩 어댑터를 쓰고, Sanity에 글을 채운 뒤 './queries'(Sanity 어댑터)로
// 교체하면 소비 측 코드는 그대로 동작한다(ADR 0006/0008의 소스 추상화).
export { getAllPosts, getPost, getSlugs, slugForId } from "./hardcoded";
