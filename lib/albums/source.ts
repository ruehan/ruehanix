// 앨범 소스 단일 진입점. 셸은 이 모듈만 import한다.
// Sanity Content Lake를 소스로 사용한다(ADR 0024). 앨범이 0개면 빈 배열.
export { getAllAlbums } from "./queries";
