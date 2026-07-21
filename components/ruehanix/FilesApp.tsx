import { useMemo, useState } from "react";
import { EmptyPosts } from "./EmptyPosts";
import { sortPosts, type SortKey } from "@/lib/ruehanix/files-sort";
import { catShortcut, sortShortcut } from "@/lib/ruehanix/files-shortcuts";
import type { CatKey } from "@/lib/ruehanix/types";
import type { Vm } from "./viewModel";

const SORT_OPTIONS: { key: SortKey; label: string; arrow: string; ariaLabel: string }[] = [
  { key: "date-desc", label: "latest", arrow: "▾", ariaLabel: "최신순 정렬" },
  { key: "date-asc", label: "oldest", arrow: "▴", ariaLabel: "오래된순 정렬" },
  { key: "title-asc", label: "title a→z", arrow: "▴", ariaLabel: "제목 가→하 정렬" },
  { key: "title-desc", label: "title z→a", arrow: "▾", ariaLabel: "제목 하→가 정렬" },
];

// 카테고리 키 → 모노스페이스 심볼. 디자인 HTML 의 의도(아이콘 14px 폭, mono)를 그대로.
const CAT_ICON: Record<string, string> = {
  all: "◇",
  dev: "▸",
  sim: "◆",
  moto: "▣",
  music: "◦",
  blog: "▤",
};

// 카테고리 색 — 디자인 HTML 의 mocha 팔레트와 1:1. row 의 catColor 와는 별도이며
// 사이드바 아이콘·accent bar 에서만 쓰인다(라이트 모드 적응은 추후 보강).
const CAT_COLOR: Record<string, string> = {
  all: "#cba6f7",
  dev: "#89b4fa",
  sim: "#f38ba8",
  moto: "#fab387",
  music: "#cba6f7",
  blog: "#a6e3a1",
};

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
        aria-label="사이드바"
        style={{
          flex: "none",
          width: 200,
          background: "linear-gradient(180deg, var(--mantle) 0%, #1a1a28 100%)",
          borderRight: "1px solid var(--surf0)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 상단 strip — 윈도우 타이틀바와 본문 사이 중간층 */}
        <div
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 12px 8px",
            borderBottom: "1px solid var(--surf0)",
          }}
        >
          <span style={{ color: "var(--accent)", fontSize: 13, lineHeight: 1 }}>◇</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", letterSpacing: "0.02em" }}>files</span>
          <span
            aria-hidden
            style={{
              marginLeft: "auto",
              fontSize: 9.5,
              color: "var(--ov0)",
              letterSpacing: "0.06em",
              border: "1px solid var(--surf0)",
              borderRadius: 3,
              padding: "1px 5px",
              background: "var(--base)",
              fontWeight: 600,
            }}
          >
            ⌘F
          </span>
        </div>

        {/* 스크롤 영역 — 3개 그룹 */}
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "6px 6px 8px" }}>
          {/* ============ LIBRARY ============ */}
          <div>
            <GroupLabel>library <Count>6</Count> <Chev /></GroupLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 2px" }}>
              {vm.finderCats.map((c) => {
                const kbd = catShortcut(c.key as CatKey | "all");
                return (
                  <SideRow
                    key={c.key}
                    active={c.active}
                    onClick={c.onClick}
                    ariaLabel={`${c.label} 필터`}
                    icon={CAT_ICON[c.key] ?? "◇"}
                    catColor={CAT_COLOR[c.key] ?? "var(--sub0)"}
                    label={c.label}
                    kbd={kbd}
                  />
                );
              })}
            </div>
          </div>

          {/* ============ SORT ============ */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--surf0)" }}>
            <GroupLabel>sort <Count>4</Count> <Chev /></GroupLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 2px" }}>
              {SORT_OPTIONS.map((s) => {
                const active = sortKey === s.key;
                return (
                  <SideRow
                    key={s.key}
                    active={active}
                    onClick={() => setSortKey(s.key)}
                    ariaLabel={s.ariaLabel}
                    icon={s.arrow}
                    iconColor="var(--ov0)"
                    catColor="var(--sub0)"
                    label={s.label}
                    kbd={sortShortcut(s.key)}
                    variant="sort"
                  />
                );
              })}
            </div>
          </div>

          {/* ============ VIEW ============ */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--surf0)" }}>
            <GroupLabel>view <Chev /></GroupLabel>
            <div
              role="radiogroup"
              aria-label="밀도"
              style={{ display: "flex", gap: 2, padding: "4px 10px 6px" }}
            >
              {(["comfy", "compact"] as const).map((d) => {
                const checked = density === d;
                return (
                  <div
                    key={d}
                    role="radio"
                    tabIndex={checked ? 0 : -1}
                    aria-checked={checked}
                    aria-label={d === "comfy" ? "여유 보기" : "빽빽한 보기"}
                    onClick={() => setDensity(d)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setDensity(d);
                      }
                    }}
                    style={{
                      flex: 1,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      color: checked ? "var(--text)" : "var(--sub0)",
                      background: checked ? "var(--base)" : "transparent",
                      borderRadius: 4,
                      cursor: "pointer",
                      border: `1px solid ${checked ? "var(--surf1)" : "transparent"}`,
                      outline: "none",
                      fontWeight: checked ? 600 : 400,
                      boxShadow: checked ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
                      transition: "background .1s, color .1s, border-color .1s",
                    }}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 사이드바 footer — 상태 표시 + 네비 힌트 */}
        <div
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 12px 8px",
            borderTop: "1px solid var(--surf0)",
            background: "rgba(17, 17, 27, 0.45)",
            fontSize: 10.5,
            color: "var(--ov0)",
            letterSpacing: "0.02em",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--sub0)",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent)",
              }}
            />
            {vm.finderCount}
          </span>
          <span aria-hidden>↑↓ nav</span>
        </div>
      </aside>

      {/* 본문 — 검색 + 글 list */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div
          onMouseDown={vm.stop}
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderBottom: "1px solid var(--surf0)",
            height: 44,
          }}
        >
          <label
            style={{
              flex: 1,
              minWidth: 0,
              position: "relative",
              display: "flex",
              alignItems: "center",
              background: "var(--crust)",
              border: "1px solid var(--surf0)",
              borderRadius: 6,
              padding: "0 6px 0 10px",
              height: 28,
            }}
          >
            <span
              aria-hidden
              style={{
                fontSize: 12,
                color: "var(--accent)",
                marginRight: 7,
                userSelect: "none",
                fontWeight: 700,
              }}
            >
              $
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목·요약 검색…"
              aria-label="글 검색"
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: 0,
                outline: 0,
                font: "inherit",
                fontSize: 12,
                color: "var(--text)",
              }}
            />
            <span
              aria-hidden
              style={{
                fontSize: 9.5,
                color: "var(--ov0)",
                border: "1px solid var(--surf0)",
                borderRadius: 3,
                padding: "1px 5px",
                background: "var(--base)",
                fontWeight: 600,
                marginLeft: 6,
              }}
            >
              ⌘K
            </span>
          </label>
          <div
            aria-label="목록 통계"
            style={{
              flex: "none",
              fontSize: 11,
              color: "var(--ov0)",
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ color: "var(--sub1)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{posts.length}</span>
            posts
            <span style={{ color: "var(--surf2)", margin: "0 2px" }}>·</span>
            <span style={{ color: "var(--sub1)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{vm.allPosts.length}</span>
            total
          </div>
        </div>

        {/* sticky 컬럼 헤더 — Finder/Explorer cue */}
        <div
          aria-hidden
          style={{
            flex: "none",
            display: "grid",
            gridTemplateColumns: "14px 1fr 96px 86px",
            gap: 12,
            alignItems: "center",
            padding: "0 16px",
            height: 26,
            borderBottom: "1px solid var(--surf1)",
            background: "linear-gradient(180deg, var(--mantle) 0%, var(--base) 100%)",
            fontSize: 9.5,
            letterSpacing: "0.16em",
            fontWeight: 700,
            color: "var(--ov0)",
            textTransform: "uppercase",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <span />
          <span>
            name
            <span style={{ display: "inline-block", width: 7, color: sortKey.startsWith("title") ? "var(--accent)" : "transparent", marginLeft: 3 }}>
              {sortKey.startsWith("title") ? (sortKey === "title-asc" ? "▴" : "▾") : "▾"}
            </span>
          </span>
          <span style={{ textAlign: "right" }}>category</span>
          <span style={{ textAlign: "right" }}>
            date
            <span style={{ display: "inline-block", width: 7, color: sortKey.startsWith("date") ? "var(--accent)" : "transparent", marginLeft: 3 }}>
              {sortKey.startsWith("date") ? (sortKey === "date-asc" ? "▴" : "▾") : "▾"}
            </span>
          </span>
        </div>

        <div role="listbox" aria-label="글 목록" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
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
                position: "relative",
                display: "grid",
                gridTemplateColumns: "14px 1fr 96px 86px",
                gap: 12,
                alignItems: "center",
                padding: padY,
                borderBottom: "1px solid rgba(49, 50, 68, 0.45)",
                cursor: "pointer",
                background: p.rowBg,
                outline: "none",
                transition: "background .08s ease",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 1, background: p.catColor, justifySelf: "center", alignSelf: "center" }} />
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, minWidth: 0, fontSize: 12.5, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                  <span style={{ color: "var(--ov0)", fontSize: 11, flex: "none" }}>.md</span>
                </div>
                <div style={excerptStyle}>{p.excerpt}</div>
              </div>
              <span style={{ textAlign: "right", fontSize: 11, color: p.catColor, letterSpacing: "0.02em", fontWeight: 500 }}>{p.catLabel}</span>
              <span style={{ textAlign: "right", fontSize: 11, color: "var(--ov0)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>{p.date}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 14px",
            borderTop: "1px solid var(--surf0)",
            background: "var(--mantle)",
            fontSize: 10.5,
            color: "var(--ov0)",
            letterSpacing: "0.02em",
          }}
        >
          <span>
            <b style={{ color: "var(--sub1)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{posts.length}</b> posts
            {query ? <> · <b style={{ color: "var(--sub1)", fontWeight: 700 }}>esc</b> clear</> : null}
          </span>
          <span style={{ display: "flex", gap: 12 }}>
            <span>
              <Kbd>↵</Kbd>open
            </span>
            <span>
              <Kbd>⌘K</Kbd>search
            </span>
            <span>
              <Kbd>⌘⇧S</Kbd>cycle sort
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** 사이드바 그룹 라벨 — 9.5px / 0.16em / uppercase / var(--ov0). */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px 4px",
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: "0.16em",
        color: "var(--ov0)",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontWeight: 600, color: "var(--ov1)", letterSpacing: "0.04em" }}>{children}</span>
  );
}

/** 디자인 HTML 의 chevron 표시 — 마우스 없이도 그룹 라벨 마감감만 살림. */
function Chev() {
  return (
    <span
      aria-hidden
      style={{ marginLeft: "auto", fontSize: 9, color: "var(--ov1)" }}
    >
      ▾
    </span>
  );
}

/** 사이드바 인터랙티브 row — 카테고리/정렬 공통. */
function SideRow({
  active,
  onClick,
  ariaLabel,
  icon,
  iconColor,
  catColor,
  label,
  kbd,
  variant = "cat",
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  icon: string;
  iconColor?: string;
  catColor: string;
  label: string;
  kbd: string;
  variant?: "cat" | "sort";
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 26,
        padding: "0 8px 0 9px",
        borderRadius: 5,
        fontSize: 12,
        color: active ? "var(--text)" : "var(--sub1)",
        background: active ? "var(--surf0)" : "transparent",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
        transition: "background .1s ease, color .1s ease",
      }}
    >
      {active && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: -6,
            top: 5,
            bottom: 5,
            width: 2,
            borderRadius: 1,
            background: "var(--accent)",
            boxShadow: "0 0 6px rgba(203, 166, 247, 0.6)",
          }}
        />
      )}
      <span
        aria-hidden
        style={{
          width: 14,
          flex: "none",
          textAlign: "center",
          fontSize: variant === "sort" ? 10 : 13,
          lineHeight: 1,
          color: active
            ? variant === "sort"
              ? "var(--accent)"
              : catColor
            : (iconColor ?? catColor),
        }}
      >
        {icon}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {kbd && (
        <span
          aria-hidden
          style={{
            flex: "none",
            fontSize: 9.5,
            color: active ? "var(--sub1)" : "var(--ov0)",
            border: `1px solid ${active ? "var(--surf1)" : "var(--surf0)"}`,
            borderRadius: 3,
            padding: "0 5px",
            lineHeight: 1.5,
            background: "var(--base)",
            fontWeight: 600,
          }}
        >
          {kbd}
        </span>
      )}
    </div>
  );
}

/** 상태바 안의 kbd 칩 — 디자인 HTML 과 동일한 small mono style. */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <b
      style={{
        color: "var(--sub1)",
        fontWeight: 600,
        border: "1px solid var(--surf0)",
        borderRadius: 3,
        padding: "0 4px",
        marginRight: 4,
        background: "var(--base)",
        fontSize: 9.5,
        lineHeight: 1.4,
      }}
    >
      {children}
    </b>
  );
}