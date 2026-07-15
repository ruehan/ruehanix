"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { matchCommands, type Command } from "@/lib/ruehanix/commands";

const mono = "'JetBrains Mono', ui-monospace, monospace";

/** Ctrl+K 명령 팔레트 모달. 자연어 fuzzy 매치 + ↑↓/Enter/Esc.
 *  commands prop 으로 useRuehanix 의 모든 셸 액션 주입. */
export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  // 모달이 닫혔다 열릴 때마다 fresh mount — useState 초기값으로 매번 깨끗.
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => matchCommands(query, commands, 20), [query, commands]);

  // mount 시 input focus. query/selected 초기화는 useState lazy initial 로 충분
  // (모달이 open 전환 시 remount 됨 — if (!open) return null).
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // matches 길이 변화 시 selected 범위 보정 — setter function form 으로 inline.
  // useEffect 외부에서 setState 호출은 React 가 자동 처리(연속 render 회피).
  const safeSelected = Math.max(0, Math.min(selected, Math.max(0, matches.length - 1)));

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(safeSelected + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(safeSelected - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const m = matches[safeSelected];
      if (m) {
        m.cmd.run();
        onClose();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-label="명령 팔레트"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9500,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKey}
        style={{
          width: "min(640px, 92vw)",
          background: "var(--mantle)",
          border: "1px solid var(--surf1)",
          borderRadius: 12,
          boxShadow: "0 24px 60px rgba(0,0,0,.55)",
          overflow: "hidden",
          fontFamily: mono,
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          placeholder="명령 입력… (예: files, ws 2, light, sync)"
          aria-label="명령 입력"
          style={{
            width: "100%",
            padding: "16px 18px",
            font: "inherit",
            fontSize: 15,
            color: "var(--text)",
            background: "transparent",
            border: "none",
            outline: "none",
            borderBottom: "1px solid var(--surf0)",
          }}
        />
        <div
          role="listbox"
          style={{ maxHeight: 380, overflow: "auto" }}
        >
          {matches.length === 0 ? (
            <div style={{ padding: "20px 18px", fontSize: 12, color: "var(--ov0)" }}>매칭 없음</div>
          ) : (
            matches.map((m, i) => (
              <div
                key={m.cmd.id}
                role="option"
                aria-selected={i === selected}
                onMouseEnter={() => setSelected(i)}
                onClick={() => {
                  m.cmd.run();
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 18px",
                  fontSize: 13,
                  color: i === selected ? "var(--text)" : "var(--sub1)",
                  background: i === selected ? "color-mix(in srgb, var(--accent) 18%, transparent)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 9.5,
                      color: "var(--ov0)",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      width: 56,
                    }}
                  >
                    {m.cmd.group}
                  </span>
                  <span style={{ fontWeight: i === selected ? 700 : 400 }}>{m.cmd.title}</span>
                </span>
                <span style={{ fontSize: 10.5, color: "var(--ov0)" }}>↵</span>
              </div>
            ))
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 18px",
            fontSize: 10.5,
            color: "var(--ov0)",
            borderTop: "1px solid var(--surf0)",
            background: "var(--crust)",
          }}
        >
          <span>↑↓ 이동</span>
          <span>↵ 실행</span>
          <span>Esc 닫기</span>
          <span style={{ marginLeft: "auto" }}>Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}