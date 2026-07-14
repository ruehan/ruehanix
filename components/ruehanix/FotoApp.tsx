import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Vm } from "./viewModel";
import { groupByFolder, type PhotoGroup, UNCATEGORIZED } from "@/lib/photos/group-by-folder";

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

  // 폴더 진입/이탈 시 선택 인덱스(파생) — view 와 함께 묶어 cascade 회피.
  // selectedIdx 는 useState 대신 view 에 인덱스 동봉하는 setter 사용.
  const currentPhotos = view.kind === "folder" ? view.group.photos : [];
  const selectedIdx = view.kind === "folder" ? view.selectedIdx ?? 0 : 0;

  const openFolder = (g: PhotoGroup) => setView({ kind: "folder", group: g, selectedIdx: 0 });
  const setSelected = (i: number) => {
    if (view.kind === "folder") setView({ ...view, selectedIdx: i });
  };
  const backToFolders = () => setView({ kind: "folders" });

  // lightbox 키 처리
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      else if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : (i + 1) % currentPhotos.length));
      else if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : (i - 1 + currentPhotos.length) % currentPhotos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, currentPhotos.length]);

  if (vm.photos.length === 0) {
    return (
      <div style={{ height: "100%", minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ov0)", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sub1)" }}>사진이 없습니다</div>
        <div style={{ fontSize: 11.5 }}>/studio 에서 사진(photo)을 추가하세요</div>
      </div>
    );
  }

  if (view.kind === "folders") {
    return <FolderGrid groups={groups} totalCount={vm.photos.length} onPick={openFolder} />;
  }

  const sel = currentPhotos[Math.max(0, Math.min(selectedIdx, currentPhotos.length - 1))];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* 좌측 사진 그리드 */}
      <div style={{ flex: 1, minWidth: 0, padding: 14, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            {...{ onClick: backToFolders }}
            title="폴더 목록으로"
            style={{ fontSize: 12, color: "var(--ov0)", cursor: "pointer", padding: "3px 8px", borderRadius: 5, border: "1px solid var(--surf0)" }}
          >
            ← 폴더
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{view.group.name}</div>
          <div style={{ fontSize: 11, color: "var(--ov0)" }}>{currentPhotos.length}장</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
          {currentPhotos.map((p, i) => {
            const isSel = i === selectedIdx;
            return (
              <div
                key={p.url}
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
                  src={p.url}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
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

      {/* 우측 info 패널 */}
      <aside
        style={{
          flex: "none",
          width: 240,
          borderLeft: "1px solid var(--surf0)",
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
              <Image src={sel.url} alt={sel.title} fill sizes="240px" style={{ objectFit: "cover" }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", wordBreak: "break-word" }}>{sel.title}</div>
            <div style={{ fontSize: 12, color: "var(--sub1)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {sel.description ?? <span style={{ color: "var(--ov0)" }}>(설명 없음)</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--ov0)" }}>
              {sel.tag ? <div>태그: {sel.tag}</div> : null}
              <div>폴더: {sel.folder ?? UNCATEGORIZED}</div>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--ov0)", lineHeight: 1.5, marginTop: 4 }}>
              더블클릭 시 크게 보기 · ←/→ 키로 이동 · ESC 닫기
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "var(--ov0)" }}>왼쪽에서 사진을 선택하세요.</div>
        )}
      </aside>

      {/* lightbox */}
      {lightboxIdx !== null && currentPhotos[lightboxIdx] ? (
        <Lightbox
          photo={currentPhotos[lightboxIdx]}
          onPrev={() => setLightboxIdx((i) => (i === null ? null : (i - 1 + currentPhotos.length) % currentPhotos.length))}
          onNext={() => setLightboxIdx((i) => (i === null ? null : (i + 1) % currentPhotos.length))}
          onClose={() => setLightboxIdx(null)}
          hint={`${lightboxIdx + 1} / ${currentPhotos.length}`}
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
                  src={cover.url}
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
}: {
  photo: { url: string; title: string; description?: string };
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  hint: string;
}) {
  return (
    <div
      role="dialog"
      aria-label="사진 크게 보기"
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
          src={photo.url}
          alt={photo.title}
          fill
          sizes="92vw"
          style={{ objectFit: "contain" }}
          priority
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -34,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "rgba(255,255,255,.85)",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }}
        >
          <span>{photo.title}</span>
          <span>{hint}</span>
        </div>
        {photo.description ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -58,
              color: "rgba(255,255,255,.7)",
              fontSize: 11.5,
              textAlign: "center",
            }}
          >
            {photo.description}
          </div>
        ) : null}
      </div>
      <button
        type="button"
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
        type="button"
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