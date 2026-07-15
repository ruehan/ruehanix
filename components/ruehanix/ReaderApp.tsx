import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { clickable } from "./clickable";
import { PostBody } from "@/components/posts/PostBody";
import { extractHeadings } from "@/lib/ruehanix/reader";
import { DEFAULT_READER_PREFS, READER_STORAGE_KEY, parseReaderPrefs, serializeReaderPrefs, type ReaderPrefs } from "@/lib/ruehanix/reader-storage";
import { toggleBookmarkStore, useBookmarks } from "@/lib/ruehanix/bookmarks";
import { useVisits } from "@/lib/ruehanix/visits";
import { notify } from "@/lib/ruehanix/toast";
import type { Vm } from "./viewModel";
import { EmptyPosts } from "./EmptyPosts";

const mono = "'JetBrains Mono',monospace";

export function ReaderApp({ vm }: { vm: Vm }) {
  const p = vm.post;
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULT_READER_PREFS);
  const savedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  // E: 표시 설정 영속 — 마운트 1회 복원, 변경 시 저장(ui-storage 패턴).
  useEffect(() => {
    try {
      const r = parseReaderPrefs(window.localStorage.getItem(READER_STORAGE_KEY));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 1회: 브라우저 전용 localStorage 복원. 렌더/SSR 단계에서 불가.
      if (r) setPrefs(r);
    } catch { /* 무시 */ }
  }, []);
  useEffect(() => {
    if (!savedRef.current) { savedRef.current = true; return; }
    try { window.localStorage.setItem(READER_STORAGE_KEY, serializeReaderPrefs(prefs)); } catch { /* 무시 */ }
  }, [prefs]);

  const headings = useMemo(() => (p ? extractHeadings(p.body) : []), [p]);
  // 활성 헤딩 — observer가 잡으면 activeId, 아니면 첫 헤딩(초기/상단 폴백).
  const activeHeading = activeId ?? headings[0]?.id ?? null;

  // 활성 섹션 추적 — 헤딩이 상단 30% 영역에 들어오면 활성(IntersectionObserver).
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || headings.length === 0) return;
    const els = headings.map((h) => root.querySelector(`#${CSS.escape(h.id)}`)).filter((e): e is Element => !!e);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActiveId((vis[0].target as Element).id);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [headings]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
  };

  const changeFont = (delta: number) => {
    const fontSize = Math.max(13, Math.min(22, prefs.fontSize + delta));
    setPrefs((prev) => ({ ...prev, fontSize }));
    notify(`글씨 ${fontSize}px`);
  };
  const changeWidth = (delta: number) => {
    const width = Math.max(560, Math.min(960, prefs.width + delta));
    setPrefs((prev) => ({ ...prev, width }));
    notify(`본문 폭 ${width}px`);
  };

  const showToc = !vm.isMobile && headings.length > 0 && !!p;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
        <div ref={scrollRef} onScroll={onScroll} style={{ flex: 1, minWidth: 0, overflow: "auto", background: "var(--base)", position: "relative", ["--rh-body-fs" as string]: `${prefs.fontSize}px` }}>
          {!p ? (
            <EmptyPosts />
          ) : (
            <>
              {/* 툴바 + 진행률 바 (sticky) */}
              <div style={{ position: "sticky", top: 0, zIndex: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, padding: "8px 14px", background: "color-mix(in srgb, var(--mantle) 92%, transparent)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--surf0)" }}>
                <ReaderBtn label="글씨 작게" onClick={() => changeFont(-1)}>A−</ReaderBtn>
                <ReaderBtn label="글씨 크게" onClick={() => changeFont(1)}>A+</ReaderBtn>
                <ReaderBtn label="본문 폭 좁게" onClick={() => changeWidth(-40)}>⇠</ReaderBtn>
                <ReaderBtn label="본문 폭 넓게" onClick={() => changeWidth(40)}>⇢</ReaderBtn>
                {/* 진행률 바 */}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "transparent" }}>
                  <div style={{ height: "100%", width: `${Math.round(progress * 100)}%`, background: "var(--accent)", transition: "width .12s linear" }} />
                </div>
              </div>

              <div className="rh-sans" style={{ maxWidth: prefs.width, margin: "0 auto", padding: "46px 56px 64px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                  <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: mono, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: p.catColor }}>#{p.catLabel}</div>
                  <BookmarkToggle slug={p.slug} />
                </div>
                <h1 style={{ margin: "0 0 14px", fontSize: 27, lineHeight: 1.28, fontWeight: 800, letterSpacing: "-.02em", color: "var(--text)", textWrap: "balance" }}>{p.title}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--ov0)", fontFamily: mono, paddingBottom: 24, marginBottom: 28, borderBottom: "1px solid var(--surf0)" }}>
                  <span style={{ color: "var(--sub0)" }}>ruehan</span>
                  <span>·</span>
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.read}</span>
                </div>
                <PostBody value={p.body} />
                <Link href={`/posts/${p.slug}`} style={{ display: "inline-block", marginTop: 8, fontSize: 13, fontWeight: 700, color: "var(--accent)", textDecoration: "none", fontFamily: mono }}>
                  전체 페이지로 보기 →
                </Link>
                <div style={{ marginTop: 40, paddingTop: 22, borderTop: "1px solid var(--surf0)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", flex: "none", background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)", fontWeight: 800, fontSize: 15, fontFamily: mono }}>한</div>
                  <div style={{ fontFamily: mono }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>한규 · ruehan</div>
                    <div style={{ fontSize: 11.5, color: "var(--ov0)" }}>full-stack dev · sim racing · bass</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* TOC — 활성 섹션 하이라이트. 헤딩 있고 충분히 넓을 때. */}
        {showToc && (
          <nav aria-label="목차" style={{ flex: "none", width: 196, background: "var(--mantle)", borderLeft: "1px solid var(--surf0)", overflow: "auto", padding: "16px 10px", fontSize: 11.5, lineHeight: 1.5 }}>
            <div style={{ color: "var(--ov0)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", padding: "0 6px 10px" }}>목차</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {headings.map((h) => {
                const on = h.id === activeHeading;
                return (
                  <button
                    key={h.id}
                    type="button"
                    aria-label={`${h.text}로 이동`}
                    aria-current={on ? "true" : undefined}
                    title={h.text}
                    onClick={() => {
                      const root = scrollRef.current;
                      if (!root) return;
                      const el = root.querySelector(`#${CSS.escape(h.id)}`) as HTMLElement | null;
                      if (!el) return;
                      // sticky 툴바(약 44px) 아래로 헤딩이 오도록 오프셋.
                      const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 44;
                      root.scrollTo({ top, behavior: "smooth" });
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      font: "inherit",
                      padding: "4px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: on ? "var(--accent)" : "var(--ov1)",
                      fontWeight: on ? 700 : 400,
                      background: on ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                      border: "none",
                      paddingLeft: 8 + (h.level - 2) * 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.text}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function ReaderBtn({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      style={{ font: "inherit", fontSize: 11.5, fontWeight: 600, color: pressed ? "var(--accent)" : "var(--sub0)", background: pressed ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent", border: "1px solid var(--surf0)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", lineHeight: 1.3 }}
    >
      {children}
    </button>
  );
}

function ReaderListItem({ it }: { it: Vm["readerList"][number] }) {
  return (
    <div {...clickable(it.open, it.title)} style={{ display: "flex", flexDirection: "column", gap: 3, padding: "8px 10px", borderRadius: 7, cursor: "pointer", background: it.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", flex: "none", background: it.catColor }} />
        <span style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</span>
      </div>
      <span style={{ fontSize: 10.5, color: "var(--ov0)", paddingLeft: 13 }}>{it.date}</span>
    </div>
  );
}

function ReaderSidebarSection({ label, items }: { label: string; items: Vm["readerList"] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ov0)", padding: "0 6px 5px" }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((it) => <ReaderListItem key={it.id} it={it} />)}
      </div>
    </div>
  );
}

function ReaderSidebar({ vm }: { vm: Vm }) {
  const bookmarks = useBookmarks();
  const visits = useVisits();
  const bookmarkItems = bookmarks
    .map((s) => vm.readerList.find((it) => it.id === s))
    .filter((it): it is Vm["readerList"][number] => !!it);
  const recentItems = visits.map((s) => vm.readerList.find((it) => it.id === s)).filter((it): it is Vm["readerList"][number] => !!it).slice(0, 6);

  return (
    <div style={{ flex: "none", width: 188, background: "var(--mantle)", borderRight: "1px solid var(--surf0)", overflow: "auto", padding: "12px 8px" }}>
      <ReaderSidebarSection label="★ 북마크" items={bookmarkItems} />
      <ReaderSidebarSection label="최근" items={recentItems} />
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ov0)", padding: "8px 6px 5px" }}>모든 글</div>
      {vm.readerList.length === 0 ? (
        <div style={{ fontSize: 11.5, color: "var(--ov0)", padding: "8px 6px" }}>아직 글 없음</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {vm.readerList.map((it) => <ReaderListItem key={it.id} it={it} />)}
        </div>
      )}
    </div>
  );
}

function BookmarkToggle({ slug }: { slug: string }) {
  const bookmarks = useBookmarks();
  const on = bookmarks.includes(slug);
  return (
    <button
      type="button"
      aria-label={on ? "북마크 제거" : "북마크 추가"}
      aria-pressed={on}
      title={on ? "북마크 제거" : "북마크 추가"}
      onClick={() => { toggleBookmarkStore(slug); notify(on ? "북마크 해제" : "북마크 추가"); }}
      style={{ flex: "none", font: "inherit", fontSize: 18, lineHeight: 1, color: on ? "var(--accent)" : "var(--ov0)", background: "transparent", border: "1px solid var(--surf0)", borderRadius: 8, padding: "4px 9px", cursor: "pointer" }}
    >
      {on ? "★" : "☆"}
    </button>
  );
}