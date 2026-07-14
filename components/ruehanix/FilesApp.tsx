import { Folder } from "./icons";
import { clickable } from "./clickable";
import { EmptyPosts } from "./EmptyPosts";
import type { Vm } from "./viewModel";

export function FilesApp({ vm }: { vm: Vm }) {
  const folders: [string, boolean][] = [
    ["posts", true],
    ["series", false],
    ["tags", false],
    ["drafts", false],
  ];
  return (
    <div style={{ display: "flex", height: "100%", fontSize: 12.5, color: "var(--text)" }}>
      <div style={{ flex: "none", width: 152, background: "var(--mantle)", borderRight: "1px solid var(--surf0)", padding: "12px 8px", overflow: "auto" }}>
        <div style={{ color: "var(--ov0)", fontSize: 11, padding: "0 6px 7px" }}>~/blog</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {folders.map(([name, active]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 7px", borderRadius: 6, ...(active ? { background: "rgba(137,180,250,.12)", color: "#89b4fa" } : { color: "var(--sub0)" }) }}>
              <Folder />
              {name}
            </div>
          ))}
        </div>
        <div style={{ color: "var(--ov0)", fontSize: 11, padding: "14px 6px 7px" }}>devices</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 7px", borderRadius: 6, color: "var(--sub0)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="12" rx="1.5" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          /dev/nvme0
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div onMouseDown={vm.stop} style={{ flex: "none", display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid var(--surf0)" }}>
          {vm.finderCats.map((c) => (
            <div key={c.key} {...clickable(c.onClick, `${c.label} 필터`)} style={c.chipStyle}>
              {c.label}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          {vm.finderPosts.length === 0 && <EmptyPosts compact />}
          {vm.finderPosts.map((p) => (
            <div key={p.id} {...clickable(p.open, `${p.title} 열기`)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 14px", borderBottom: "1px solid var(--surf0)", cursor: "pointer", background: p.rowBg }}>
              <span style={{ flex: "none", width: 8, height: 8, borderRadius: 2, background: p.catColor }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)" }}>{p.title}.md</div>
                <div style={{ fontSize: 11, color: "var(--ov0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.excerpt}</div>
              </div>
              <span style={{ flex: "none", fontSize: 11, color: p.catColor }}>{p.catLabel}</span>
              <span style={{ flex: "none", fontSize: 11, color: "var(--ov0)", width: 74, textAlign: "right" }}>{p.date}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: "none", padding: "7px 14px", borderTop: "1px solid var(--surf0)", fontSize: 11, color: "var(--ov0)" }}>{vm.finderCount}</div>
      </div>
    </div>
  );
}