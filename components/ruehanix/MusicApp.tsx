import { useState } from "react";
import Image from "next/image";
import { clickable } from "./clickable";
import { photoAvatarSrc, type PhotoAsset } from "@/lib/sanity/photo-url";
import type { Vm } from "./viewModel";

export function MusicApp({ vm }: { vm: Vm }) {
  const p = vm.player;
  const accent = vm.accent;
  const [tab, setTab] = useState<"playlist" | "artist">("playlist");
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

      {/* TABS */}
      <div style={{ flex: "none", display: "flex", borderBottom: "1px solid var(--surf0)" }}>
        {([["playlist", "재생목록"], ["artist", "아티스트"]] as const).map(([key, label]) => (
          <div
            key={key}
            {...clickable(() => setTab(key), label)}
            style={{ flex: 1, textAlign: "center", padding: "9px 0", fontSize: 12, fontWeight: tab === key ? 700 : 500, cursor: "pointer", color: tab === key ? accent : "var(--ov0)", borderBottom: `2px solid ${tab === key ? accent : "transparent"}`, marginBottom: -1 }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {tab === "playlist"
          ? p.tracks.map((t) => (
              <div key={t.id} {...clickable(t.onClick, `${t.title} 재생`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: "1px solid var(--surf0)", cursor: "pointer", background: t.current ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent" }}>
                <span style={{ flex: "none", width: 18, textAlign: "center", color: t.current ? accent : "var(--ov0)", fontSize: 12 }}>
                  {t.playing ? <PlayIcon playing size={12} /> : t.id + 1}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, color: t.current ? "var(--text)" : "var(--sub1)", fontWeight: t.current ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ov0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.artist}</div>
                </div>
              </div>
            ))
          : <ArtistDirectory views={p.artistViews} currentId={p.currentArtistId} accent={accent} onPlay={p.play} />}
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

function ArtistAvatar({ photoAsset, name, size }: { photoAsset: PhotoAsset | null; name: string; size: number }) {
  if (photoAsset) {
    return <Image src={photoAvatarSrc(photoAsset, size)} alt={name} width={size} height={size} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flex: "none", border: "1px solid var(--surf0)" }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flex: "none", background: "var(--surf0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 800, color: "var(--ov0)" }}>{name.slice(0, 1)}</div>
  );
}

function ArtistDirectory({ views, currentId, accent, onPlay }: { views: Vm["player"]["artistViews"]; currentId: string | null; accent: string; onPlay: (i: number) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (views.length === 0) {
    return (
      <div style={{ height: "100%", minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ov0)", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sub1)" }}>아티스트가 없습니다</div>
        <div style={{ fontSize: 11.5 }}>/studio 에서 아티스트(artist)를 추가하세요</div>
      </div>
    );
  }
  return (
    <div>
      {views.map((view) => {
        const a = view.info;
        const open = openId === a.id;
        const isCurrent = !!currentId && a.id === currentId;
        const meta = [a.genre, a.origin].filter(Boolean).join(" · ");
        const hasDetail = !!a.bio || a.links.length > 0 || a.members.length > 0 || view.albums.length > 0 || view.songs.length > 0;
        return (
          <div key={a.id || a.name} style={{ borderBottom: "1px solid var(--surf0)", background: isCurrent ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent" }}>
            <div {...clickable(() => setOpenId(open ? null : a.id), `${a.name} ${open ? "접기" : "펼치기"}`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", cursor: "pointer" }}>
              <ArtistAvatar photoAsset={a.photoAsset} name={a.name} size={42} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</span>
                  {isCurrent ? <span style={{ flex: "none", fontSize: 9.5, fontWeight: 800, padding: "1px 6px", borderRadius: 5, background: accent, color: "var(--on-accent)" }}>재생 중</span> : null}
                </div>
                {meta ? <div style={{ fontSize: 11, color: "var(--ov0)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta}</div> : null}
              </div>
              {hasDetail ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ov0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}><path d="M6 9l6 6 6-6" /></svg>
              ) : null}
            </div>
            {open && hasDetail ? (
              <div style={{ padding: "0 18px 16px 72px" }}>
                {a.bio ? <p style={{ margin: "0 0 12px", fontSize: 12.5, lineHeight: 1.7, color: "var(--sub1)", whiteSpace: "pre-wrap" }}>{a.bio}</p> : null}

                {a.members.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ov0)", marginBottom: 7 }}>멤버</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {a.members.map((m) => (
                        <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 9px 4px 4px", borderRadius: 20, background: "var(--surf0)" }}>
                          <ArtistAvatar photoAsset={m.photoAsset} name={m.name} size={22} />
                          <span style={{ fontSize: 11.5, color: "var(--text)" }}>{m.name}</span>
                          {m.role ? <span style={{ fontSize: 10.5, color: "var(--ov0)" }}>· {m.role}</span> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {view.albums.map((al) => (
                  <div key={al.id} style={{ display: "flex", gap: 11, marginBottom: 12, padding: 10, borderRadius: 9, background: "var(--mantle)", border: "1px solid var(--surf0)" }}>
                    <div style={{ position: "relative", width: 52, height: 52, flex: "none", borderRadius: 7, overflow: "hidden", background: "var(--surf1)" }}>
                      {al.coverUrl ? (
                        <Image src={al.coverUrl} alt={al.title} fill sizes="52px" style={{ objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ov0)", fontSize: 18 }}>♪</div>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{al.title}</span>
                        {al.year ? <span style={{ fontSize: 10.5, color: "var(--ov0)" }}>{al.year}</span> : null}
                      </div>
                      {al.songs.length > 0 ? (
                        <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 1 }}>
                          {al.songs.map((s) => (
                            <button key={s.index} type="button" onClick={() => onPlay(s.index)} title={`${s.title} 재생`} style={{ font: "inherit", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", fontSize: 11.5, color: "var(--sub1)" }}>
                              <span style={{ color: "var(--ov0)", marginRight: 6 }}>▸</span>{s.title}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: "var(--ov0)", marginTop: 4 }}>수록곡 없음</div>
                      )}
                    </div>
                  </div>
                ))}

                {view.songs.length > 0 ? (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ov0)", marginBottom: 5 }}>{view.albums.length > 0 ? "기타 곡" : "곡"}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {view.songs.map((s) => (
                        <button key={s.index} type="button" onClick={() => onPlay(s.index)} title={`${s.title} 재생`} style={{ font: "inherit", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", fontSize: 11.5, color: "var(--sub1)" }}>
                          <span style={{ color: "var(--ov0)", marginRight: 6 }}>▸</span>{s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {a.links.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                    {a.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, fontWeight: 600, padding: "5px 11px", borderRadius: 7, textDecoration: "none", background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: accent }}>
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}