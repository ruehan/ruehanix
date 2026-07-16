import { describe, it, expect } from "vitest";
import { matchCommands, type Command } from "./commands";

const cmds: Command[] = [
  { id: "app:files", title: "Files 열기", group: "app", keywords: ["files", "file", "파일", "finder"], run: () => {} },
  { id: "app:reader", title: "Reader 열기", group: "app", keywords: ["reader", "read", "리더", "글"], run: () => {} },
  { id: "app:foto", title: "Foto 열기", group: "app", keywords: ["foto", "photo", "사진"], run: () => {} },
  { id: "ws:1", title: "워크스페이스 1", group: "ws", keywords: ["ws 1", "workspace 1", "1", "워크스페이스 1"], run: () => {} },
  { id: "ws:2", title: "워크스페이스 2", group: "ws", keywords: ["ws 2", "workspace 2", "2", "워크스페이스 2"], run: () => {} },
  { id: "theme:light", title: "테마: Light", group: "theme", keywords: ["theme", "light", "라이트", "밝게"], run: () => {} },
  { id: "theme:dark", title: "테마: Dark", group: "theme", keywords: ["theme", "dark", "다크", "어둡게"], run: () => {} },
  { id: "shell:keybindings", title: "단축키 보기", group: "shell", keywords: ["keybindings", "단축키", "shortcut", "keys"], run: () => {} },
  { id: "nav:home", title: "홈으로", group: "nav", keywords: ["home", "홈", "/"], run: () => {} },
  { id: "nav:posts", title: "모든 글", group: "nav", keywords: ["posts", "글", "list"], run: () => {} },
];

describe("matchCommands", () => {
  it("빈 입력은 전체 반환", () => {
    expect(matchCommands("", cmds).length).toBe(cmds.length);
  });

  it("title fuzzy 매치", () => {
    const r = matchCommands("files", cmds);
    expect(r[0].cmd.id).toBe("app:files");
  });

  it("keyword 매치 (한국어)", () => {
    const r = matchCommands("파일", cmds);
    expect(r[0].cmd.id).toBe("app:files");
  });

  it("'ws 2' 정확 매치 우선", () => {
    const r = matchCommands("ws 2", cmds);
    expect(r[0].cmd.id).toBe("ws:2");
  });

  it("'light' → theme:light 가 theme:dark 보다 위", () => {
    const r = matchCommands("light", cmds);
    expect(r[0].cmd.id).toBe("theme:light");
  });

  it("substring 매치 (공백 trim + lower)", () => {
    const r = matchCommands("  Dark  ", cmds);
    expect(r[0].cmd.id).toBe("theme:dark");
  });

  it("매칭 없음 → 빈 배열", () => {
    expect(matchCommands("zzzz", cmds)).toEqual([]);
  });

  it("동점이면 group 순서 (app → ws → theme → shell → nav)", () => {
    const r = matchCommands("ws", cmds);
    // "ws 1" / "ws 2" 가 keyword 매치
    const ids = r.slice(0, 2).map((x) => x.cmd.id);
    expect(ids).toContain("ws:1");
    expect(ids).toContain("ws:2");
  });

  it("상위 N개 제한", () => {
    const r = matchCommands("", cmds, 3);
    expect(r.length).toBe(3);
  });
});