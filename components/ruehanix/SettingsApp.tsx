import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { clickable } from "./clickable";
import { isActivateKey } from "@/lib/ruehanix/a11y";
import { ABOUT_META, KEYBINDINGS, SETTINGS_TABS, type SettingsTab } from "@/lib/ruehanix/settings";
import { notify } from "@/lib/ruehanix/toast";
import type { Vm } from "./viewModel";

const mono = "'JetBrains Mono',monospace";

export function SettingsApp({ vm }: { vm: Vm }) {
  const [tab, setTab] = useState<SettingsTab["key"]>("appearance");

  // 활성 탭 결정 — 미구현 탭이 선택돼 있으면(안전망) Appearance로.
  const activeTab = SETTINGS_TABS.find((t) => t.key === tab && t.ready) ?? SETTINGS_TABS.find((t) => t.key === "appearance")!;

  return (
    <div style={{ display: "flex", height: "100%", fontSize: 12.5, color: "var(--text)" }}>
      <SettingsSidebar active={activeTab.key} onSelect={setTab} />
      <div style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "22px 24px" }}>
        {activeTab.key === "appearance" && <AppearancePanel vm={vm} notify={notify} />}
        {activeTab.key === "keybindings" && <KeybindingsPanel />}
        {activeTab.key === "about" && <AboutPanel accent={vm.accent} />}
      </div>
    </div>
  );
}

function SettingsSidebar({ active, onSelect }: { active: SettingsTab["key"]; onSelect: (k: SettingsTab["key"]) => void }) {
  return (
    <div style={{ flex: "none", width: 170, background: "var(--mantle)", borderRight: "1px solid var(--surf0)", padding: "12px 8px", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 12px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, flex: "none", background: "linear-gradient(135deg,#cba6f7,#89b4fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)", fontWeight: 800 }}>한</div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>ruehan</div>
          <div style={{ fontSize: 10.5, color: "var(--ov0)" }}>localhost</div>
        </div>
      </div>
      <nav aria-label="설정 섹션" style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {SETTINGS_TABS.map((t) => {
          const isActive = active === t.key;
          const baseStyle: CSSProperties = { padding: "6px 9px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between" };
          const style: CSSProperties = isActive
            ? { ...baseStyle, background: "rgba(250,179,135,.12)", color: "#fab387", fontWeight: 600 }
            : t.ready
              ? { ...baseStyle, color: "var(--sub0)", cursor: "pointer" }
              : { ...baseStyle, color: "var(--ov0)", opacity: 0.5, cursor: "not-allowed" };
          if (!t.ready) {
            return (
              <div key={t.key} aria-disabled="true" style={style}>
                <span>{t.label}</span>
                <span style={{ fontSize: 9.5, fontWeight: 500 }}>준비 중</span>
              </div>
            );
          }
          return (
            <div key={t.key} {...clickable(() => onSelect(t.key), `${t.label} 탭`)} aria-current={isActive ? "page" : undefined} style={style}>
              <span>{t.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function AppearancePanel({ vm, notify }: { vm: Vm; notify: (m: string) => void }) {
  const s = vm.set;
  const wrap = (fn: () => void, msg: string) => () => { fn(); notify(msg); };
  const modeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accentRefs = useRef<(HTMLDivElement | null)[]>([]);
  // 드래그-밖 릴리즈에서도 최종 gap을 읽기 위한 최신값 ref.
  const gapRef = useRef(s.gapValue);
  useEffect(() => { gapRef.current = s.gapValue; }, [s.gapValue]);
  // window mouseup 리스너를 ref로 들어 언마운트/중복 down에서도 잔류·이중 notify 방지.
  const upRef = useRef<(() => void) | null>(null);
  useEffect(() => () => { if (upRef.current) window.removeEventListener("mouseup", upRef.current); }, []);

  const onGapKey = (e: ReactKeyboardEvent) => {
    const next = e.key === "ArrowRight" || e.key === "ArrowUp" ? s.gapValue + 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? s.gapValue - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const clamped = Math.max(0, Math.min(28, next));
    s.setGap(clamped);
    notify(`창 간격 ${clamped}px`);
  };
  // 슬라이더 마우스 down: 드래그 시작 + window mouseup 1회 리스너(영역 밖 릴리즈도 notify).
  const onSliderDown = (e: React.MouseEvent) => {
    if (upRef.current) window.removeEventListener("mouseup", upRef.current);
    s.startSlider(e);
    const onUp = () => {
      window.removeEventListener("mouseup", onUp);
      upRef.current = null;
      notify(`창 간격 ${gapRef.current}px`);
    };
    upRef.current = onUp;
    window.addEventListener("mouseup", onUp);
  };
  // radiogroup 방향키 탐색: 화살표로 옵션 순회 + 즉시 선택 + 포커스 이동(APG 패턴).
  const onRadioArrow = (
    e: ReactKeyboardEvent,
    opts: { selected: boolean }[],
    refs: React.RefObject<(HTMLDivElement | null)[]>,
    onPick: (i: number) => void,
  ) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowDown" && e.key !== "ArrowLeft" && e.key !== "ArrowUp") return;
    e.preventDefault();
    if (opts.length === 0) return;
    const cur = opts.findIndex((o) => o.selected);
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const nextIdx = (cur + dir + opts.length) % opts.length;
    onPick(nextIdx);
    refs.current[nextIdx]?.focus();
  };
  return (
    <section aria-label="외관 설정">
      <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>Appearance</h2>

      <div style={{ fontSize: 11, color: "var(--ov0)", marginBottom: 11, letterSpacing: ".04em" }}>테마 모드</div>
      <div
        role="radiogroup"
        aria-label="테마 모드"
        onKeyDown={(e) => onRadioArrow(e, s.modeOpts, modeRefs, (i) => { s.modeOpts[i].onClick(); notify(`${s.modeOpts[i].label} 모드`); })}
        style={{ display: "flex", gap: 11, marginBottom: 24 }}
      >
        {s.modeOpts.map((m, i) => (
          <div
            key={m.key}
            ref={(el) => { modeRefs.current[i] = el; }}
            role="radio"
            aria-checked={m.selected}
            tabIndex={m.selected ? 0 : -1}
            aria-label={`${m.label} 모드`}
            onClick={wrap(m.onClick, `${m.label} 모드`)}
            onKeyDown={(e) => { if (isActivateKey(e.key)) { e.preventDefault(); m.onClick(); notify(`${m.label} 모드`); } }}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <div style={m.swatchStyle} />
            <div style={m.labelStyle}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderTop: "1px solid var(--surf0)" }}>
        <span>Accent color</span>
        <div
          role="radiogroup"
          aria-label="강조색"
          onKeyDown={(e) => onRadioArrow(e, s.accentOpts, accentRefs, (i) => { s.accentOpts[i].onClick(); notify(`강조색 ${s.accentOpts[i].name}`); })}
          style={{ display: "flex", gap: 8 }}
        >
          {s.accentOpts.map((a, i) => (
            <div
              key={a.key}
              ref={(el) => { accentRefs.current[i] = el; }}
              role="radio"
              aria-checked={a.selected}
              tabIndex={a.selected ? 0 : -1}
              aria-label={`강조색 ${a.name}`}
              onClick={wrap(a.onClick, `강조색 ${a.name}`)}
              onKeyDown={(e) => { if (isActivateKey(e.key)) { e.preventDefault(); a.onClick(); notify(`강조색 ${a.name}`); } }}
              style={a.style}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderTop: "1px solid var(--surf0)" }}>
        <span>Window gaps</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ov0)" }}>
          <div
            role="slider"
            aria-label="창 간격"
            aria-valuemin={0}
            aria-valuemax={28}
            aria-valuenow={s.gapValue}
            aria-valuetext={`${s.gapValue}px`}
            tabIndex={0}
            onMouseDown={onSliderDown}
            onKeyDown={onGapKey}
            style={{ width: 120, height: 14, display: "flex", alignItems: "center", cursor: "pointer", position: "relative" }}
          >
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
          <div
            role="switch"
            aria-checked={t.on}
            aria-label={t.label}
            tabIndex={0}
            onClick={wrap(t.onClick, `${t.label} ${t.on ? "끔" : "켬"}`)}
            onKeyDown={(e) => { if (isActivateKey(e.key)) { e.preventDefault(); t.onClick(); notify(`${t.label} ${t.on ? "끔" : "켬"}`); } }}
            style={t.track as CSSProperties}
          >
            <span style={t.knob as CSSProperties} />
          </div>
        </div>
      ))}

      <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={wrap(s.resetUi, "기본값으로 복원됨")}
          style={{ font: "inherit", fontSize: 11.5, fontWeight: 600, color: "var(--text)", background: "var(--surf0)", border: "1px solid var(--surf1)", borderRadius: 7, padding: "7px 13px", cursor: "pointer" }}
        >
          기본값으로 복원
        </button>
      </div>

      <div style={{ marginTop: 18, fontSize: 11, color: "var(--ov0)", lineHeight: 1.7 }}>
        변경 사항은 모든 워크스페이스의 창에 즉시 반영됩니다. <span style={{ color: vm.accent }}>Super + 1-6</span> 으로 확인해 보세요.
      </div>
    </section>
  );
}

function KeybindingsPanel() {
  return (
    <section aria-label="키보드 단축키">
      <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>Keybindings</h2>
      <div style={{ fontSize: 11, color: "var(--ov0)", marginBottom: 18 }}>Hyprland 스타일 · Super = ⊞</div>
      <div role="table" aria-label="단축키 목록" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px 26px" }}>
        {KEYBINDINGS.map(([combo, desc]) => (
          <div key={combo} role="row" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
            <span style={{ color: "var(--text)", background: "var(--surf0)", borderRadius: 6, padding: "3px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>{combo}</span>
            <span style={{ color: "var(--sub0)" }}>{desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutPanel({ accent }: { accent: string }) {
  const rows: [string, string][] = [
    ["이름", ABOUT_META.name],
    ["버전", ABOUT_META.version],
    ["커널", ABOUT_META.kernel],
    ["데스크톱", ABOUT_META.build],
    ["스택", ABOUT_META.stack],
  ];
  return (
    <section aria-label="시스템 정보">
      <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>About</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "var(--mantle)", border: "1px solid var(--surf0)", borderRadius: 12, marginBottom: 18 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, flex: "none", background: `linear-gradient(135deg, ${accent}, #89b4fa)`, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)", fontWeight: 800, fontSize: 20 }}>한</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{ABOUT_META.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--ov0)", fontFamily: mono }}>v{ABOUT_META.version} · kernel {ABOUT_META.kernel}</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 1 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--surf0)", fontSize: 12.5 }}>
            <span style={{ color: "var(--ov0)" }}>{k}</span>
            <span style={{ color: "var(--text)", fontFamily: mono }}>{v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}