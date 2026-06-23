import type { CSSProperties } from "react";
import Link from "next/link";
import { ART_TERM, Folder } from "./icons";
import { clickable } from "./clickable";
import type { Vm } from "./viewModel";

const mono = "'JetBrains Mono',monospace";

function EmptyPosts({ compact }: { compact?: boolean }) {
  return (
    <div style={{ height: "100%", minHeight: compact ? 120 : 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ov0)", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sub1)" }}>아직 글이 없습니다</div>
    </div>
  );
}

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

export function ReaderApp({ vm }: { vm: Vm }) {
  const p = vm.post;
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: "none", width: 188, background: "var(--mantle)", borderRight: "1px solid var(--surf0)", overflow: "auto", padding: "12px 8px" }}>
        <div style={{ color: "var(--ov0)", fontSize: 11, padding: "0 6px 8px" }}>posts/</div>
        {vm.readerList.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "var(--ov0)", padding: "8px 6px" }}>아직 글 없음</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {vm.readerList.map((it) => (
              <div key={it.id} {...clickable(it.open, it.title)} style={{ display: "flex", flexDirection: "column", gap: 3, padding: "8px 10px", borderRadius: 7, cursor: "pointer", background: it.bg }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", flex: "none", background: it.catColor }} />
                  <span style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.35 }}>{it.title}</span>
                </div>
                <span style={{ fontSize: 10.5, color: "var(--ov0)", paddingLeft: 13 }}>{it.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "auto", background: "var(--base)" }}>
        {!p ? (
          <EmptyPosts />
        ) : (
          <div className="rh-sans" style={{ maxWidth: 760, margin: "0 auto", padding: "46px 56px 64px" }}>
            <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 18, fontFamily: mono, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: p.catColor }}>#{p.catLabel}</div>
            <h1 style={{ margin: "0 0 14px", fontSize: 27, lineHeight: 1.28, fontWeight: 800, letterSpacing: "-.02em", color: "var(--text)", textWrap: "balance" }}>{p.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--ov0)", fontFamily: mono, paddingBottom: 24, marginBottom: 28, borderBottom: "1px solid var(--surf0)" }}>
              <span style={{ color: "var(--sub0)" }}>ruehan</span>
              <span>·</span>
              <span>{p.date}</span>
              <span>·</span>
              <span>{p.read}</span>
            </div>
            {p.paras.map((para) => (
              <p key={para.id} style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.82, color: "var(--sub1)" }}>{para.text}</p>
            ))}
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
        )}
      </div>
    </div>
  );
}

export function FotoApp({ vm }: { vm: Vm }) {
  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 13, padding: "0 2px" }}>
        <span style={{ fontSize: 13, color: "var(--text)" }}>~/Pictures</span>
        <span style={{ fontSize: 11, color: "var(--ov0)" }}>9 images</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
        {vm.photos.map((ph) => (
          <div key={ph.id} style={ph.tileStyle}>
            <span style={{ position: "absolute", top: 7, left: 7, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: "rgba(17,17,27,.5)", color: "var(--text)", backdropFilter: "blur(3px)" }}>#{ph.tag}</span>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "20px 9px 8px", fontSize: 11.5, color: "#fff", background: "linear-gradient(transparent,rgba(0,0,0,.6))" }}>{ph.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HotlapApp({ vm }: { vm: Vm }) {
  const stats: [string, string, string | null][] = [
    ["1,284", "total laps", null],
    ["6", "GT3 cars", null],
    ["4.2k", "iRating", "#f9e2af"],
  ];
  return (
    <div style={{ fontSize: 12.5, color: "var(--text)" }}>
      <div style={{ padding: "18px 18px 16px", borderBottom: "1px solid var(--surf0)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f38ba8", boxShadow: "0 0 8px #f38ba8" }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".18em", color: "#f38ba8" }}>PERSONAL BEST</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ov0)", marginBottom: 3 }}>Nürburgring Nordschleife · BMW M4 GT3</div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>
          6:59<span style={{ fontSize: 24, color: "var(--ov0)" }}>.214</span>
        </div>
        <div style={{ fontSize: 12, color: "#a6e3a1", fontWeight: 700, marginTop: 7 }}>▼ 0.41s · 개인 기록 경신</div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "14px 18px", borderBottom: "1px solid var(--surf0)" }}>
        {stats.map(([n, l, col], i) => (
          <div key={i} style={{ flex: 1, padding: "10px 12px", borderRadius: 9, background: "var(--mantle)", border: "1px solid var(--surf0)" }}>
            <div style={{ fontSize: 20, fontWeight: 800, ...(col ? { color: col } : {}) }}>{n}</div>
            <div style={{ fontSize: 10.5, color: "var(--ov0)", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.1fr .6fr .5fr", gap: 10, padding: "10px 14px", fontSize: 10.5, fontWeight: 700, color: "var(--ov0)", letterSpacing: ".04em", borderBottom: "1px solid var(--surf0)" }}>
        <span>TRACK</span>
        <span>CAR</span>
        <span>TIME</span>
        <span style={{ textAlign: "right" }}>Δ</span>
      </div>
      {vm.laps.map((l) => (
        <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.1fr .6fr .5fr", gap: 10, alignItems: "center", padding: "11px 14px", borderBottom: "1px solid var(--surf0)", background: l.rowBg }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text)" }}>
            {l.best && <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: "#f38ba8", color: "var(--on-accent)" }}>PB</span>}
            {l.track}
          </span>
          <span style={{ color: "var(--ov0)" }}>{l.car}</span>
          <span style={{ fontWeight: 700 }}>{l.time}</span>
          <span style={{ textAlign: "right", fontWeight: 700, color: l.deltaColor }}>{l.delta}</span>
        </div>
      ))}
    </div>
  );
}

export function TerminalApp() {
  const fast: [string, string][] = [
    ["OS", "ruehanix 1.0 x86_64"],
    ["Kernel", "6.9.2-rue"],
    ["WM", "Hyprland (Wayland)"],
    ["Theme", "Catppuccin Mocha"],
    ["Shell", "zsh 5.9"],
    ["Role", "Full-stack Dev · SW Lead"],
    ["Stack", "TypeScript · Go · React"],
    ["Hobby", "Sim Racing · F1/WEC · Bass"],
  ];
  const sw = ["#f38ba8", "#fab387", "#f9e2af", "#a6e3a1", "#89b4fa", "#cba6f7"];
  return (
    <div style={{ padding: "16px 16px", fontSize: 12.5, lineHeight: 1.6, color: "var(--text)" }}>
      <div style={{ color: "var(--ov0)" }}>ruehan@ruehanix:~$ fastfetch</div>
      <div style={{ display: "flex", gap: 18, margin: "12px 0 8px", flexWrap: "wrap" }}>
        <pre style={{ margin: 0, color: "#cba6f7", fontSize: 11, lineHeight: 1.3 }}>{ART_TERM}</pre>
        <div style={{ fontSize: 12.5 }}>
          <div>
            <span style={{ color: "#cba6f7", fontWeight: 700 }}>ruehan</span>
            <span style={{ color: "var(--ov0)" }}>@</span>
            <span style={{ color: "#cba6f7", fontWeight: 700 }}>ruehanix</span>
          </div>
          <div style={{ color: "var(--surf1)" }}>───────────────</div>
          {fast.map(([k, val]) => (
            <div key={k}>
              <span style={{ color: "#89b4fa" }}>{k}</span>
              <span style={{ color: "var(--ov0)" }}>: </span>
              {val}
            </div>
          ))}
          <div style={{ marginTop: 7, display: "flex", gap: 4 }}>
            {sw.map((c) => (
              <span key={c} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ color: "#a6e3a1" }}>ruehan@ruehanix</span>
        <span style={{ color: "var(--ov0)" }}>:</span>
        <span style={{ color: "#89b4fa" }}>~</span>
        <span style={{ color: "var(--ov0)" }}>$ </span>
        whoami
      </div>
      <div style={{ color: "var(--sub1)" }}>한규 — 코드를 짓고, 랩타임을 줄이고, 베이스를 친다.</div>
      <div style={{ marginTop: 4 }}>
        <span style={{ color: "#a6e3a1" }}>ruehan@ruehanix</span>
        <span style={{ color: "var(--ov0)" }}>:</span>
        <span style={{ color: "#89b4fa" }}>~</span>
        <span style={{ color: "var(--ov0)" }}>$ </span>
        <span style={{ display: "inline-block", width: 8, height: 14, background: "var(--text)", verticalAlign: "-2px", animation: "rh-blink 1.1s steps(1) infinite" }} />
      </div>
    </div>
  );
}

export function WebApp({ vm }: { vm: Vm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div onMouseDown={vm.stop} style={{ flex: "none", display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", background: "var(--mantle)", borderBottom: "1px solid var(--surf0)" }}>
        <span style={{ color: "var(--ov0)", fontSize: 14 }}>‹ ›</span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, height: 26, borderRadius: 7, background: "var(--crust)", padding: "0 11px", fontSize: 11.5, color: "var(--sub0)" }}>
          <span style={{ color: "#a6e3a1" }}>●</span>https://ruehan.dev
        </div>
      </div>
      <div className="rh-sans" style={{ flex: 1, minHeight: 0, overflow: "auto", background: "var(--base)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 30px", borderBottom: "1px solid var(--surf0)", position: "sticky", top: 0, background: "color-mix(in srgb, var(--base) 92%, transparent)", backdropFilter: "blur(8px)", zIndex: 1, fontFamily: mono }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
            ruehan<span style={{ color: "#cba6f7" }}>.dev</span>
          </span>
          <div style={{ display: "flex", gap: 18, fontSize: 12.5, color: "var(--ov0)" }}>
            <span>posts</span>
            <span>projects</span>
            <span>racing</span>
            <span>about</span>
          </div>
        </div>
        <div style={{ padding: "54px 30px 42px", textAlign: "center", background: "radial-gradient(120% 100% at 50% 0%,color-mix(in srgb, var(--accent) 14%, transparent),transparent 70%)" }}>
          <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: "#cba6f7", letterSpacing: ".06em", marginBottom: 14 }}>FULL-STACK DEVELOPER · SW LEAD</div>
          <h1 style={{ margin: "0 0 16px", fontSize: 36, lineHeight: 1.18, fontWeight: 800, letterSpacing: "-.03em", color: "var(--text)", textWrap: "balance" }}>
            코드를 짓고, 랩타임을 줄이고,
            <br />
            베이스를 친다.
          </h1>
          <p style={{ margin: "0 auto", maxWidth: 480, fontSize: 15, lineHeight: 1.7, color: "var(--sub0)" }}>한규(ruehan)의 기술 블로그. 서버 컴포넌트와 모노레포, 그리고 트랙 위의 0.1초에 대한 기록.</p>
        </div>
        <div style={{ padding: "6px 30px 44px", maxWidth: 840, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, fontFamily: mono }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>최근 글</h2>
            <span style={{ fontSize: 12, color: "var(--ov0)" }}>all posts →</span>
          </div>
          {vm.allPosts.length === 0 && <EmptyPosts compact />}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {vm.allPosts.map((p) => (
              <div key={p.id} className="rh-webcard" {...clickable(p.open, `${p.title} 열기`)} style={{ border: "1px solid var(--surf0)", borderRadius: 13, padding: "18px 20px", cursor: "pointer", background: "var(--mantle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11, fontFamily: mono }}>
                  <span style={{ padding: "2px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: p.catColor }}>#{p.catLabel}</span>
                  <span style={{ fontSize: 11, color: "var(--ov0)" }}>{p.date}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 7, color: "var(--text)", letterSpacing: "-.01em", textWrap: "balance" }}>{p.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ov1)" }}>{p.excerpt}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "28px 30px", textAlign: "center", borderTop: "1px solid var(--surf0)", fontSize: 11.5, color: "var(--ov0)", fontFamily: mono }}>© 2026 ruehan.dev · built on ruehanix · 서울</div>
      </div>
    </div>
  );
}

export function SettingsApp({ vm }: { vm: Vm }) {
  const s = vm.set;
  const nav: [string, boolean][] = [
    ["General", false],
    ["Appearance", true],
    ["Window Rules", false],
    ["Keybindings", false],
    ["Displays", false],
    ["Wallpaper", false],
  ];
  return (
    <div style={{ display: "flex", height: "100%", fontSize: 12.5, color: "var(--text)" }}>
      <div style={{ flex: "none", width: 170, background: "var(--mantle)", borderRight: "1px solid var(--surf0)", padding: "12px 8px", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 12px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, flex: "none", background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)", fontWeight: 800 }}>한</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>ruehan</div>
            <div style={{ fontSize: 10.5, color: "var(--ov0)" }}>localhost</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {nav.map(([label, active]) => (
            <div key={label} style={{ padding: "6px 9px", borderRadius: 6, ...(active ? { background: "rgba(250,179,135,.12)", color: "#fab387", fontWeight: 600 } : { color: "var(--sub0)" }) }}>{label}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "22px 24px" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>Appearance</h2>
        <div style={{ fontSize: 11, color: "var(--ov0)", marginBottom: 11, letterSpacing: ".04em" }}>APPEARANCE</div>
        <div style={{ display: "flex", gap: 11, marginBottom: 24 }}>
          {s.modeOpts.map((m) => (
            <div key={m.key} {...clickable(m.onClick, `${m.label} 모드`)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={m.swatchStyle} />
              <div style={m.labelStyle}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderTop: "1px solid var(--surf0)" }}>
          <span>Accent color</span>
          <div style={{ display: "flex", gap: 8 }}>
            {s.accentOpts.map((a) => (
              <div key={a.key} {...clickable(a.onClick, "강조색 변경")} style={a.style} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderTop: "1px solid var(--surf0)" }}>
          <span>Window gaps</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ov0)" }}>
            <div onMouseDown={s.startSlider} style={{ width: 120, height: 14, display: "flex", alignItems: "center", cursor: "pointer", position: "relative" }}>
              <div style={{ width: "100%", height: 4, borderRadius: 2, background: "var(--surf0)" }} />
              <div style={{ position: "absolute", left: 0, top: 5, height: 4, width: s.gapPct, borderRadius: 2, background: vm.accent, pointerEvents: "none" }} />
              <div style={{ position: "absolute", left: s.gapPct, top: 1, width: 12, height: 12, borderRadius: "50%", background: "var(--text)", transform: "translateX(-50%)", pointerEvents: "none" }} />
            </div>
            <span style={{ fontVariantNumeric: "tabular-nums", width: 34, textAlign: "right" }}>{s.gapLabel}</span>
          </div>
        </div>
        {s.toggles.map((t) => (
          <div key={t.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderTop: "1px solid var(--surf0)" }}>
            <span>{t.label}</span>
            <div {...clickable(t.onClick, t.label)} style={t.track as CSSProperties}>
              <span style={t.knob as CSSProperties} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 18, fontSize: 11, color: "var(--ov0)", lineHeight: 1.7 }}>
          변경 사항은 모든 워크스페이스의 창에 즉시 반영됩니다. <span style={{ color: vm.accent }}>Super + 1-6</span> 으로 확인해 보세요.
        </div>
      </div>
    </div>
  );
}

function PlayIcon({ playing, size = 16 }: { playing: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
    </svg>
  );
}

export function MusicApp({ vm }: { vm: Vm }) {
  const p = vm.player;
  const accent = vm.accent;
  if (!p.hasTracks) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ov0)", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sub1)" }}>플레이리스트가 비어 있습니다</div>
        <div style={{ fontSize: 11.5 }}>/studio 에서 곡(track)을 추가하세요</div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "var(--text)" }}>
      {/* NOW PLAYING */}
      <div style={{ flex: "none", padding: "22px 22px 18px", borderBottom: "1px solid var(--surf0)", background: "radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.playing ? "#a6e3a1" : "var(--ov0)", boxShadow: p.playing ? "0 0 8px #a6e3a1" : "none" }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".16em", color: p.playing ? "#a6e3a1" : "var(--ov0)" }}>{p.playing ? "NOW PLAYING" : "PAUSED"}</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.01em", lineHeight: 1.25, marginBottom: 4, textWrap: "balance" }}>{p.current?.title}</div>
        <div style={{ fontSize: 13, color: "var(--ov0)" }}>{p.current?.artist}</div>

        {/* CONTROLS */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
          <div {...clickable(p.prev, "이전 곡")} style={{ flex: "none", cursor: "pointer", color: "var(--sub0)", display: "flex" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14l-11-7z" /></svg>
          </div>
          <div {...clickable(p.toggle, p.playing ? "일시정지" : "재생")} style={{ flex: "none", cursor: "pointer", width: 44, height: 44, borderRadius: "50%", background: accent, color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlayIcon playing={p.playing} size={20} />
          </div>
          <div {...clickable(p.next, "다음 곡")} style={{ flex: "none", cursor: "pointer", color: "var(--sub0)", display: "flex" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z" /></svg>
          </div>
          <div {...clickable(p.cycleRepeat, p.repeatLabel)} style={{ flex: "none", cursor: "pointer", marginLeft: 4, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: p.repeat === "off" ? "var(--ov0)" : accent }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
            {p.repeat === "one" ? "1" : p.repeat === "all" ? "∞" : ""}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ov0)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M16 9a4 4 0 0 1 0 6" /></svg>
            <input
              type="range"
              min={0}
              max={100}
              value={p.volume}
              onChange={(e) => p.setVolume(Number(e.target.value))}
              aria-label="볼륨"
              style={{ width: 90, accentColor: accent, cursor: "pointer" }}
            />
          </div>
        </div>
      </div>

      {/* PLAYLIST */}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {p.tracks.map((t) => (
          <div key={t.id} {...clickable(t.onClick, `${t.title} 재생`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: "1px solid var(--surf0)", cursor: "pointer", background: t.current ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent" }}>
            <span style={{ flex: "none", width: 18, textAlign: "center", color: t.current ? accent : "var(--ov0)", fontSize: 12 }}>
              {t.playing ? <PlayIcon playing size={12} /> : t.id + 1}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, color: t.current ? "var(--text)" : "var(--sub1)", fontWeight: t.current ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
              <div style={{ fontSize: 11, color: "var(--ov0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AboutApp() {
  const specs: [string, string][] = [
    ["CPU", "Ryzen 9 7950X · 16C/32T"],
    ["GPU", "Radeon RX 7900 XTX"],
    ["Memory", "64GB DDR5-6000"],
    ["WM", "Hyprland · Wayland"],
    ["Uptime", "7 yrs in the industry"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "30px 26px", color: "var(--text)" }}>
      <div style={{ width: 62, height: 62, borderRadius: 16, background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 28px rgba(203,166,247,.3)" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--on-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" />
          <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
          <circle cx="9.5" cy="7.5" r="0.7" fill="var(--on-accent)" />
          <circle cx="14.5" cy="7.5" r="0.7" fill="var(--on-accent)" />
        </svg>
      </div>
      <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>ruehanix</div>
      <div style={{ fontSize: 12, color: "var(--ov0)", marginTop: 3 }}>1.0 · kernel 6.9.2-rue · x86_64</div>
      <div style={{ width: "100%", marginTop: 20, fontSize: 12.5 }}>
        {specs.map(([k, val]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px", borderBottom: "1px solid var(--surf0)" }}>
            <span style={{ color: "var(--ov0)" }}>{k}</span>
            <span style={{ fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ width: "100%", marginTop: 16, padding: "14px 15px", borderRadius: 11, background: "var(--mantle)", border: "1px solid var(--surf0)", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", flex: "none", background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)", fontWeight: 800, fontSize: 16 }}>한</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>한규 · ruehan</div>
          <div style={{ fontSize: 11, color: "var(--ov0)", lineHeight: 1.5 }}>
            full-stack dev · SW Lead
            <br />
            sim racing · F1/WEC · bass
          </div>
        </div>
      </div>
    </div>
  );
}
