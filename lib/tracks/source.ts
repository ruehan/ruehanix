// 플레이리스트 소스 단일 진입점. 셸은 이 모듈만 import한다.
// Sanity Content Lake를 단일 소스로 사용한다(ADR 0013). 곡이 0개면 빈 배열을 반환하고,
// 소비 측(셸)이 "곡 없음"(미니플레이어 숨김) 빈 상태를 처리한다.
export { getAllTracks } from "./queries";
