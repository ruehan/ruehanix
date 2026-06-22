/** 키보드로 버튼형 요소를 활성화하는 키인지(Enter 또는 Space). */
export function isActivateKey(key: string): boolean {
  return key === "Enter" || key === " " || key === "Spacebar";
}
