/**
 * 비어 있는 글 목록을 보여주는 자리표시. FilesApp 와 WebApp 두 곳에서 사용하므로
 * 앱 폴더에 머무르지 않고 별도 모듈로 둔다.
 */
export function EmptyPosts({ compact }: { compact?: boolean }) {
  return (
    <div style={{ height: "100%", minHeight: compact ? 120 : 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ov0)", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sub1)" }}>아직 글이 없습니다</div>
    </div>
  );
}