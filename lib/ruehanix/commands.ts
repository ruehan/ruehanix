/**
 * 명령 팔레트 — 자연어 fuzzy 매치.
 * 입력 → (점수 높은 순) Command[] 반환. 0개 매치 시 빈 배열.
 *
 * 점수: title 매치 > keyword 매치. 정확 매치 > substring. 한국어 keyword 지원.
 */

export type CommandGroup = "app" | "ws" | "theme" | "shell" | "nav";

export interface Command {
  id: string;
  title: string;
  group: CommandGroup;
  keywords: string[];
  run: () => void;
}

export interface MatchedCommand {
  cmd: Command;
  score: number;
}

const GROUP_ORDER: Record<CommandGroup, number> = {
  app: 0,
  ws: 1,
  theme: 2,
  shell: 3,
  nav: 4,
};

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function score(q: string, candidate: string): number {
  // 정확 일치 > 접두 일치 > substring.
  if (candidate === q) return 100;
  if (candidate.startsWith(q)) return 70;
  if (candidate.includes(q)) return 40;
  return 0;
}

export function matchCommands(query: string, commands: Command[], limit?: number): MatchedCommand[] {
  const q = normalize(query);
  if (!q) {
    const all = commands.map((cmd) => ({ cmd, score: 0 }));
    all.sort((a, b) => GROUP_ORDER[a.cmd.group] - GROUP_ORDER[b.cmd.group]);
    return limit ? all.slice(0, limit) : all;
  }
  const matches: MatchedCommand[] = [];
  for (const cmd of commands) {
    let best = 0;
    best = Math.max(best, score(q, normalize(cmd.title)));
    for (const kw of cmd.keywords) {
      best = Math.max(best, score(q, normalize(kw)));
    }
    if (best > 0) matches.push({ cmd, score: best });
  }
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return GROUP_ORDER[a.cmd.group] - GROUP_ORDER[b.cmd.group];
  });
  return limit ? matches.slice(0, limit) : matches;
}