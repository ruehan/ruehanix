export interface SearchableApp {
  key: string;
  name: string;
  hint: string;
}

/** 런처 검색 — 이름·힌트·키를 대소문자 무시 부분일치로 필터. 빈 질의는 전체 반환. */
export function filterApps<T extends SearchableApp>(apps: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return apps;
  return apps.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.hint.toLowerCase().includes(q) ||
      a.key.toLowerCase().includes(q),
  );
}
