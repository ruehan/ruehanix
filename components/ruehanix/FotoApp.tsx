import Image from "next/image";
import type { Vm } from "./viewModel";

export function FotoApp({ vm }: { vm: Vm }) {
  if (vm.photos.length === 0) {
    return (
      <div style={{ height: "100%", minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ov0)", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sub1)" }}>사진이 없습니다</div>
        <div style={{ fontSize: 11.5 }}>/studio 에서 사진(photo)을 추가하세요</div>
      </div>
    );
  }
  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 13, padding: "0 2px" }}>
        <span style={{ fontSize: 13, color: "var(--text)" }}>~/Pictures</span>
        <span style={{ fontSize: 11, color: "var(--ov0)" }}>{vm.photos.length} images</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
        {vm.photos.map((ph) => (
          <div key={ph.id} style={{ position: "relative", overflow: "hidden", ...ph.tileStyle }}>
            <Image
              src={ph.url}
              alt={ph.title}
              fill
              sizes="(max-width: 768px) 33vw, 200px"
              style={{ objectFit: "cover" }}
            />
            {ph.tag ? <span style={{ position: "absolute", top: 7, left: 7, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: "rgba(17,17,27,.5)", color: "var(--text)", backdropFilter: "blur(3px)" }}>#{ph.tag}</span> : null}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "20px 9px 8px", fontSize: 11.5, color: "#fff", background: "linear-gradient(transparent,rgba(0,0,0,.6))" }}>{ph.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}