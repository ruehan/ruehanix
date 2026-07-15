import { useMemo, useState } from "react";
import { clickable } from "./clickable";
import { EmptyPosts } from "./EmptyPosts";
import { sortPosts, type SortKey } from "@/lib/ruehanix/files-sort";
import type { Vm } from "./viewModel";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "date-desc", label: "최신순" },
  { key: "date-asc", label: "오래된순" },
  { key: "title-asc", label: "제목 가→하" },
  { key: "title-desc", label: "제목 하→가" },
];

/** FilesApp — 글 검색/정렬/카테고리 필터. Finder 컨셉 유지. */
export function FilesApp({ vm }: { vm: Vm }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date-desc");
  const [density, setDensity] = useState<"comfy" | "compact">("comfy");

  // 검색 + 정렬. 카테고리는 vm.finderCats 가 이미 적용.
  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? vm.finderPosts.filter(
          (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q),
        )
      : vm.finderPosts;
    return sortPosts(base, sortKey);
  }, [vm.finderPosts, query, sortKey]);

  const padY = density === "comfy" ? "11px 14px" : "5px 14px";
  const excerptStyle: React.CSSProperties =
    density === "comfy"
      ? { fontSize: 11, color: "var(--ov0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
      : { display: "none" };

  return (
    <div style={{ display: "flex", height: "100%", fontSize: 12.5, color: "var(--text)" }}>
      {/* 사이드바 — 카테고리 + 정렬 + view 모드 */}
      <aside
        style={{
          flex: "none",
          width: 188,
          background: "var(--mantle)",
          borderRight: "1px solid var(--surf0)",
          padding: "12px 10px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div>
          <div style={{ color: "var(--ov0)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", padding: "0 4px 6px" }}>카테고리</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {vm.finderCats.map((c) => (
              <div
                key={c.key}
                role="button"
                tabIndex={0}
                aria-pressed={c.active}
                aria-label={`${c.label} 필터`}
                onClick={c.onClick}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.onClick(); } }}
                style={c.chipStyle}
              >
                {c.label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ color: "var(--ov0)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", padding: "0 4px 6px" }}>정렬</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {SORT_OPTIONS.map((s) => {
              const active = sortKey === s.key;
              return (
                <div
                  key={s.key}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  onClick={() => setSortKey(s.key)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSortKey(s.key); } }}
                  style={{
                    padding: "5px 8px",
                    borderRadius: 5,
                    fontSize: 12,
                    cursor: "pointer",
                    color: active ? "var(--accent)" : "var(--sub0)",
                    background: active ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ color: "var(--ov0)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", padding: "0 4px 6px" }}>보기</div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["comfy", "compact"] as const).map((d) => (
              <div
                key={d}
                role="button"
                tabIndex={0}
                aria-pressed={density === d}
                onClick={() => setDensity(d)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDensity(d); } }}
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  borderRadius: 5,
                  fontSize: 11,
                  textAlign: "center",
                  cursor: "pointer",
                  color: density === d ? "var(--text)" : "var(--sub0)",
                  background: density === d ? "var(--surf0)" : "transparent",
                  border: `1px solid ${density === d ? "var(--surf1)" : "transparent"}`,
                }}
              >
                {d === "comfy" ? "여유" : "빽빽"}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 본문 — 검색 + 글 list */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div
          onMouseDown={vm.stop}
          style={{ flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid var(--surf0)" }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목·요약 검색…"
            aria-label="글 검색"
            style={{
              flex: 1,
              minWidth: 0,
              padding: "6px 10px",
              font: "inherit",
              fontSize: 12.5,
              color: "var(--text)",
              background: "var(--crust)",
              border: "1px solid var(--surf0)",
              borderRadius: 6,
              outline: "none",
            }}
          />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          {posts.length === 0 && <EmptyPosts compact />}
          {posts.map((p) => (
            <div
              key={p.id}
              tabIndex={0}
              role="button"
              aria-label={`${p.title} 열기`}
              onClick={p.open}
              onDoubleClick={p.open}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.open(); } }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: padY,
                borderBottom: "1px solid var(--surf0)",
                cursor: "pointer",
                background: p.rowBg,
              }}
            >
              <span style={{ flex: "none", width: 8, height: 8, borderRadius: 2, background: p.catColor }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)" }}>{p.title}.md</div>
                <div style={excerptStyle}>{p.excerpt}</div>
              </div>
              <span style={{ flex: "none", fontSize: 11, color: p.catColor }}>{p.catLabel}</span>
              <span style={{ flex: "none", fontSize: 11, color: "var(--ov0)", width: 74, textAlign: "right" }}>{p.date}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 14px",
            borderTop: "1px solid var(--surf0)",
            fontSize: 11,
            color: "var(--ov0)",
          }}
        >
          <span>{posts.length} posts</span>
          {query && vm.finderPosts.length !== posts.length ? (
            <span>{vm.finderPosts.length} 중 {posts.length}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}