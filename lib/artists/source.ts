// 아티스트 소스 단일 진입점. 셸은 이 모듈만 import한다.
// Sanity Content Lake를 단일 소스로 사용한다(ADR 0016). 아티스트가 0개면 빈 배열을 반환하고,
// 소비 측(MusicApp 아티스트 탭)이 빈 상태를 처리한다.
export { getAllArtists } from "./queries";
