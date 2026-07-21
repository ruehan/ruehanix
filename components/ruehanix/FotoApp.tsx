import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Vm } from "./viewModel";
import { groupByFolder, type PhotoGroup, UNCATEGORIZED } from "@/lib/photos/group-by-folder";
import { photoLightboxSrc, photoPanelSrc, photoThumbSrc } from "@/lib/sanity/photo-url";
import { nextFocusIndex } from "./focus-trap";

type View =
  | { kind: "folders" }
  | { kind: "folder"; group: PhotoGroup; selectedIdx: number };

/**
 * 사진 앱 — 2단계 뷰.
 *  - folders: 폴더 목록 (그리드)
 *  - folder: 폴더 진입 — 좌측 사진 그리드 + 우측 info 패널
 *  - 더블클릭 시 lightbox. ←/→/ESC 키 지원.
 */
export function FotoApp({ vm }: { vm: Vm }) {
  const groups = useMemo(() => groupByFolder(vm.photos), [vm.photos]);
  const [view, setView] = useState<View>({ kind: "folders" });
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // vm.photos 가 바뀌어 view.group 이 groups 에 없으면 folders 로 폴백(파생).
  // useEffect + setView 는 React 19 의 "setState in effect" cascade 회피.
  // 데이터 변경 시 즉시 folders 로 보여 사용자에게 깨진 view 노출 안 함.
  const effectiveView: View =
    view.kind === "folder" && groups.find((g) => g.name === view.group.name)
      ? view
      : { kind: "folders" };
  const currentPhotos = effectiveView.kind === "folder" ? effectiveView.group.photos : [];
  const selectedIdx = effectiveView.kind === "folder" ? effectiveView.selectedIdx ?? 0 : 0;

  const openFolder = (g: PhotoGroup) => setView({ kind: "folder", group: g, selectedIdx: 0 });
  const setSelected = (i: number) => {
    if (effectiveView.kind === "folder") setView({ ...effectiveView, selectedIdx: i });
  };
  const backToFolders = () => setView({ kind: "folders" });

  // lightbox 키 처리 — Esc/←/→ + Tab focus trap.
  useEffect(() => {
    if (lightboxIdx === null) return;
    const focusable = () => Array.from(document.querySelectorAll<HTMLElement>("[data-lightbox-focus]"));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setLightboxIdx(null);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setLightboxIdx((i) => (i === null ? null : (i + 1) % currentPhotos.length));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setLightboxIdx((i) => (i === null ? null : (i - 1 + currentPhotos.length) % currentPhotos.length));
      } else if (e.key === "Tab") {
        // focus trap — lightbox 내부 focusable 사이만 cycle.
        e.preventDefault();
        const els = focusable();
        if (els.length === 0) return;
        const current = els.findIndex((el) => el === document.activeElement);
        const next = nextFocusIndex(current, els.length, e.shiftKey ? -1 : 1);
        els[next]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        setLightboxIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setLightboxIdx(currentPhotos.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, currentPhotos.length]);

  // lightbox 열릴 때 close button 에 focus — 키보드 진입점.
  // (focus 는 외부 시스템 sync 이라 useEffect OK.)
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (lightboxIdx === null) return;
    requestAnimationFrame(() => lightboxCloseRef.current?.focus());
  }, [lightboxIdx]);

  if (vm.photos.length === 0) {
    return (
      <div style={{ height: "100%", minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ov0)", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sub1)" }}>사진이 없습니다</div>
        <div style={{ fontSize: 11.5 }}>/studio 에서 사진(photo)을 추가하세요</div>
      </div>
    );
  }

  if (effectiveView.kind === "folders") {
    return <FolderGrid groups={groups} totalCount={vm.photos.length} onPick={openFolder} />;
  }

  const sel = currentPhotos[Math.max(0, Math.min(selectedIdx, currentPhotos.length - 1))];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: vm.isMobile ? "column" : "row",
        height: "100%",
      }}
    >
      {/* 사진 그리드 (좌측 / 모바일 상단) */}
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, padding: 14, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            {...{ onClick: backToFolders }}
            title="폴더 목록으로"
            style={{ fontSize: 12, color: "var(--ov0)", cursor: "pointer", padding: "3px 8px", borderRadius: 5, border: "1px solid var(--surf0)" }}
          >
            ← 폴더
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{effectiveView.group.name}</div>
          <div style={{ fontSize: 11, color: "var(--ov0)" }}>{currentPhotos.length}장</div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: vm.isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)",
            gap: 9,
          }}
        >
          {currentPhotos.map((p, i) => {
            const isSel = i === selectedIdx;
            return (
              <div
                key={p.asset._id}
                onClick={() => setSelected(i)}
                onDoubleClick={() => setLightboxIdx(i)}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 8,
                  aspectRatio: "4/3",
                  outline: isSel ? "2px solid var(--accent)" : "none",
                  outlineOffset: -2,
                  cursor: "pointer",
                  background: "var(--crust)",
                }}
              >
                <Image
                  src={photoThumbSrc(p.asset)}
                  alt={p.title}
                  fill
                  sizes={vm.isMobile ? "(max-width: 768px) 50vw, 33vw" : "(max-width: 768px) 33vw, 200px"}
                  style={{ objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "16px 8px 6px",
                    fontSize: 11,
                    color: "#fff",
                    background: "linear-gradient(transparent,rgba(0,0,0,.65))",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* info 패널 (우측 240px / 모바일 하단 풀폭) */}
      <aside
        style={{
          flex: "none",
          width: vm.isMobile ? "100%" : 240,
          maxHeight: vm.isMobile ? "45%" : "100%",
          borderLeft: vm.isMobile ? "none" : "1px solid var(--surf0)",
          borderTop: vm.isMobile ? "1px solid var(--surf0)" : "none",
          background: "var(--mantle)",
          padding: "16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflow: "auto",
        }}
      >
        <div style={{ fontSize: 10.5, color: "var(--ov0)", letterSpacing: ".08em", textTransform: "uppercase" }}>선택</div>
        {sel ? (
          <>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4/3",
                borderRadius: 8,
                overflow: "hidden",
                background: "var(--crust)",
                border: "1px solid var(--surf0)",
              }}
            >
              <Image src={photoPanelSrc(sel.asset)} alt={sel.title} fill sizes="240px" style={{ objectFit: "cover" }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", wordBreak: "break-word" }}>{sel.title}</div>
            <div style={{ fontSize: 12, color: "var(--sub1)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {sel.description ?? <span style={{ color: "var(--ov0)" }}>(설명 없음)</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--ov0)" }}>
              {sel.tag ? <div>태그: {sel.tag}</div> : null}
              <div>폴더: {sel.folder ?? UNCATEGORIZED}</div>
            </div>
            {/* 모바일은 더블클릭이 비표준 — 명시적 버튼으로 lightbox 진입 */}
            <button
              type="button"
              onClick={() => setLightboxIdx(selectedIdx)}
              style={{
                font: "inherit",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text)",
                background: "var(--surf0)",
                border: "1px solid var(--surf1)",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              크게 보기
            </button>
            <div style={{ fontSize: 10.5, color: "var(--ov0)", lineHeight: 1.5, marginTop: 4 }}>
              {vm.isMobile ? "위 버튼으로 크게 보기" : "더블클릭 시 크게 보기"} · ←/→ 키 이동 · ESC 닫기
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "var(--ov0)" }}>왼쪽에서 사진을 선택하세요.</div>
        )}
      </aside>

      {/* lightbox */}
      {lightboxIdx !== null && currentPhotos[lightboxIdx] ? (
        <Lightbox
          photo={{
            src: photoLightboxSrc(currentPhotos[lightboxIdx].asset),
            title: currentPhotos[lightboxIdx].title,
            description: currentPhotos[lightboxIdx].description,
          }}
          onPrev={() => setLightboxIdx((i) => (i === null ? null : (i - 1 + currentPhotos.length) % currentPhotos.length))}
          onNext={() => setLightboxIdx((i) => (i === null ? null : (i + 1) % currentPhotos.length))}
          onClose={() => setLightboxIdx(null)}
          hint={`${lightboxIdx + 1} / ${currentPhotos.length}`}
          closeRef={lightboxCloseRef}
        />
      ) : null}
    </div>
  );
}

function FolderGrid({ groups, totalCount, onPick }: { groups: PhotoGroup[]; totalCount: number; onPick: (g: PhotoGroup) => void }) {
  return (
    <div style={{ padding: 14, height: "100%", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 13, padding: "0 2px" }}>
        <span style={{ fontSize: 13, color: "var(--text)" }}>~/Pictures</span>
        <span style={{ fontSize: 11, color: "var(--ov0)" }}>{groups.length} 폴더 · {totalCount}장</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
        {groups.map((g) => {
          const cover = g.photos[0];
          return (
            <div
              key={g.name}
              onClick={() => onPick(g)}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 10,
                border: "1px solid var(--surf0)",
                background: "var(--crust)",
                cursor: "pointer",
                aspectRatio: "4/3",
              }}
              title={`${g.name} (${g.photos.length}장)`}
            >
              {cover ? (
                <Image
                  src={photoThumbSrc(cover.asset)}
                  alt={g.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 240px"
                  style={{ objectFit: "cover" }}
                />
              ) : null}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "10px 12px",
                  background: "linear-gradient(transparent 45%,rgba(0,0,0,.7))",
                  color: "#fff",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.01em" }}>{g.name}</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>{g.photos.length}장</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Lightbox({
  photo,
  onPrev,
  onNext,
  onClose,
  hint,
  closeRef,
}: {
  photo: { src: string; title: string; description?: string };
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  hint: string;
  closeRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div
      role="dialog"
      aria-label="사진 크게 보기"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(0,0,0,.86)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        type="button"
        data-lightbox-focus
        aria-label="이전"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        style={navBtnStyle("left")}
      >
        ‹
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "92vw",
          maxHeight: "88vh",
          width: "min(1100px, 92vw)",
          height: "min(82vh, 88vw)",
        }}
      >
        <Image
          src={photo.src}
          alt={photo.title}
          fill
          sizes="92vw"
          style={{ objectFit: "contain" }}
          priority
        />
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 10,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            color: "rgba(255,255,255,.9)",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            textShadow: "0 1px 2px rgba(0,0,0,.6)",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.title}</span>
            {photo.description ? (
              <span style={{ fontSize: 11, opacity: 0.8, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "rgba(255,255,255,.8)" }}>
                {photo.description}
              </span>
            ) : null}
          </div>
          <span style={{ flex: "none" }}>{hint}</span>
        </div>
      </div>
      <button
        type="button"
        data-lightbox-focus
        aria-label="다음"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        style={navBtnStyle("right")}
      >
        ›
      </button>
      <button
        ref={closeRef}
        type="button"
        data-lightbox-focus
        aria-label="닫기"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          ...navBtnBase,
        }}
      >
        ✕
      </button>
    </div>
  );
}

const navBtnBase = {
  font: "inherit",
  fontSize: 32,
  color: "rgba(255,255,255,.85)",
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.18)",
  borderRadius: 8,
  cursor: "pointer",
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

function navBtnStyle(side: "left" | "right"): React.CSSProperties {
  return { ...navBtnBase, position: "absolute", [side]: 24 } as React.CSSProperties;
}