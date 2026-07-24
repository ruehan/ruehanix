# 0062. SettingsApp 한글화 + Wallpaper 탭 활성화

- 상태: 채택
- 날짜: 2026-07-24
- 관련: [[0019-settings-tabs-revamp]]

## 배경

1. `SettingsApp` 본문과 사이드바 라벨에 영어 잔존이 있다.
   - SETTINGS_TABS 라벨: General / Appearance / Window Rules / Keybindings / Displays / Wallpaper / About — 셸의 다른 컴포넌트(런처·키바인드 오버레이·About 메타)는 이미 한국어인데 설정 앱만 영어로 남아 있다.
   - SettingsApp 본문: `<h2>Appearance</h2>`, `<span>Accent color</span>`, `<span>Window gaps</span>`, `<h2>Keybindings</h2>`, `<h2>About</h2>` — 강조색/창 간격은 `aria-label` 만 한국어로 처리하고 시각 라벨은 영어. 일관성 깨짐.
2. `wallpaper` 탭이 `SETTINGS_TABS` 에는 등록돼 있으나 `ready: false` — 사이드바에서 비활성. ADR 0019 가 의도적으로 미구현으로 남겨둔 항목이다. 이제 사용자에게 배경화면 선택권을 줄 단계.

## 결정

### 1. SettingsApp 전체 한글화

`lib/ruehanix/settings.ts` SETTINGS_TABS 의 라벨을 한국어로 변경한다.

| key | label |
|---|---|
| general | 일반 |
| appearance | 외관 |
| windowrules | 창 규칙 |
| keybindings | 단축키 |
| displays | 디스플레이 |
| wallpaper | 배경화면 |
| about | 정보 |

`components/ruehanix/SettingsApp.tsx` 본문의 영어 시각 라벨도 한국어로 통일한다.

- `<h2>Appearance</h2>` → `<h2>외관</h2>`
- `<h2>Keybindings</h2>` → `<h2>단축키</h2>`
- `<h2>About</h2>` → `<h2>정보</h2>`
- `<span>Accent color</span>` → `<span>강조색</span>` (`aria-label="강조색"` 과 일치)
- `<span>Window gaps</span>` → `<span>창 간격</span>` (`aria-label="창 간격"` 과 일치)

설정 탭의 토글 항목(`Window transparency` / `Rounded corners` / `Active border glow`)과 키바인드 표의 "Hyprland 스타일 · Super = ⊞" 같은 부속 텍스트, About 의 메타데이터(이름/버전/커널/데스크톱/스택)는 그대로 둔다 — 이 셸에서 의도적으로 영문 디자인 용어로 쓰는 항목. 이번 결정의 범위는 "라벨 잔존" 만 정리하는 것이지 셸 디자인 어휘 전반을 한글로 바꾸는 것이 아니다.

### 2. WallpaperKey 도입 + 5 프리셋

`lib/ruehanix/types.ts` 에 `WallpaperKey = "aurora" | "deep-space" | "sunset" | "forest" | "mono"` 와 타입 가드 `isWallpaperKey(v): v is WallpaperKey` 를 추가한다.

`lib/ruehanix/theme.ts` 에 `WallpaperOption` 인터페이스와 5 프리셋을 정의한다.

```ts
export interface WallpaperOption {
  key: WallpaperKey;
  name: string;       // 한국어
  description: string; // 한국어
  background: (lightMode: boolean, accent: string) => string;
}
```

| key | name | description |
|---|---|---|
| aurora | 오로라 | 강조색을 비춘 부드러운 빛. 기본값. |
| deep-space | 딥 스페이스 | 차분한 보라·네이비 그라디언트. |
| sunset | 선셋 | 따뜻한 오렌지·핑크 노을. |
| forest | 포레스트 | 녹색 그늘, 차분한 산림 톤. |
| mono | 모노 | 단색 · 가장 빠르고 정적. |

`aurora` 는 기존 그라디언트(accent 기반 radial + 3-stop linear) 로직을 그대로 가져온다. 나머지 4 종은 정적 그라디언트(accent 인자는 무시) — `aurora` 와 시각적 차별을 위해 accent 의존을 끊는다. `mono` 는 단색 linear 만으로 가장 가볍다.

`wallpaper(key, lightMode, accent): string` 시그니처로 통합 — 단일 진입점, `WALLPAPER_BY_KEY` 룩업으로 키별 `background` 를 호출.

### 3. UiState.wallpaper + 영속화

`lib/ruehanix/types.ts` 의 `UiState` 에 `wallpaper: WallpaperKey` 필드 추가. `lib/ruehanix/ui-storage.ts`:

- `DEFAULT_UI.wallpaper = "aurora"`
- `parseUiState` 에 `isWallpaperKey(r.wallpaper)` 검증 추가. wallpaper 누락 또는 잘못된 키면 `null` 반환 — 저장값 전체가 무효가 되도록(다른 필드와 동일한 "전부 유효해야 복원" 정책).

`components/ruehanix/useRuehanix.ts`:

- `INITIAL.ui` = `DEFAULT_UI` (이미 동일 참조) — wallpaper 포함 자동.
- 핸들러에 `setWallpaperKey(key)` 추가 — `setSt(s => ({ ...s, ui: { ...s.ui, wallpaper } }))`. 기존 ui 영속 effect 가 자동 저장.
- handlers 에 `setWallpaperKey` 노출.

`components/ruehanix/viewModel.ts`:

- `set.wallpaperKey` (= `ui.wallpaper`), `set.wallpaperOpts` (= `WALLPAPERS`), `set.setWallpaperKey` (= `handlers.setWallpaperKey`) 노출.
- 기존 `wallpaper: wallpaper(lightMode, accent)` → `wallpaper: wallpaper(ui.wallpaper, lightMode, accent)` 로 변경.

### 4. WallpaperPanel 컴포넌트

`components/ruehanix/SettingsApp.tsx` 에 새 패널 추가:

- 사이드바에서 "배경화면" 탭 클릭 시 활성.
- `<section aria-label="배경화면">` 안에 `<h2>배경화면</h2>` + 안내문.
- `role="radiogroup"` 그리드(반응형, `repeat(auto-fill, minmax(220px, 1fr))`) 에 5개 카드.
- 각 카드(`WallpaperCard`):
  - 상단: 다크/라이트 모드 미리보기 썸네일 2개 (각 80×48, 라운드 6, `o.background(false, accent)` / `o.background(true, accent)`). 사용자가 현재 모드와 무관하게 두 상태를 비교할 수 있게 한다.
  - 하단: 한국어 이름(`o.name`) + 짧은 설명(`o.description`) + 선택 시 "✓ 선택" 라벨.
  - 클릭/Enter/Space 시 `setWallpaperKey(o.key)` + `notify(`배경화면: ${o.name}`)`.
  - 선택 상태는 `2px solid ${selected ? accent : "var(--surf0)"}` + `aria-checked`.

## 이유와 대안

- **라벨을 다국어 키로 추상화하지 않고 직접 한국어로 교체** — 셸이 단일 언어(한국어) 환경을 가정한다. 추상화는 오버엔지니어링이고, About 의 "kernel" / "Hyprland" 처럼 의도된 영문 디자인 어휘를 보존하기 위해선 "교체하지 말 것" 의 의도가 분명해야 한다. 이번 결정은 라벨만 정리. (대안: i18n 인프라 — 기각, 범위 초과.)
- **aurora 외 프리셋은 accent 무시** — aurora 가 강조색 변화에 따라 동적으로 반응하는 유일한 프리셋이고, 다른 프리셋은 자체 색 정체성을 가진다. accent 인자를 시그니처에 남겨 미래에 다시 결합하기 쉽게 둔다. (대안: preset 이 accent 를 받게 — 각 preset 의 정체성이 흐려진다.)
- **5개 프리셋** — Aurora(기본) / 분위기 3종(Deep Space·Sunset·Forest) / 미니멀 1종(Mono). Hyprland/GNOME 의 배경화면 셀렉터가 보통 4~8 옵션을 노출하는 범위 안. (대안: 3개만 — 다양성 부족. 8개 — 색 정의 부담 + 유지보수.)
- **그라디언트 미리보기 2개(다크+라이트)** — 단일이면 사용자가 보고 있는 모드의 미리보기만 보게 되고 라이트 모드일 때 다크 결과를 미리볼 수 없다. 카드 두 장의 div 로 해결. (대안: 단일 + 토글 — 인터랙션 비용. 라이트/다크 둘 다 inline — 채택.)
- **wallpaper 검증 실패 시 UiState 전체 null** — 부분 채움(예: mode 만 valid) 보다 엄격. 인라인 head 스크립트의 `resolveEarlyTheme` 도 같은 DEFAULT 로 폴백한다 — 어긋나면 FOUC 가 생긴다. (대안: 부분 채움 + wallpaper 만 기본값 — 정책 분기로 일관성 깨짐, 기각.)
- **그라디언트 문자열은 그대로** — 이전 결정(ADR 0020 "UX foundation: theme & toast") 의 radial + 3-stop linear 패턴을 유지. CSS `background` 값은 단일 속성에 다중 그라디언트 합성이 가능하므로 별도 레이어 추가가 불필요.

## 영향

- `lib/ruehanix/types.ts` — WallpaperKey, isWallpaperKey, UiState.wallpaper 추가.
- `lib/ruehanix/ui-storage.ts` — DEFAULT_UI.wallpaper, parseUiState wallpaper 검증.
- `lib/ruehanix/ui-storage.test.ts` — wallpaper 라운드트립·기본값·잘못된 키 null 검증 케이스.
- `lib/ruehanix/theme.ts` — WallpaperOption, WALLPAPERS, wallpaper(key, light, accent) 시그니처 변경.
- `lib/ruehanix/theme.test.ts` — wallpaper 시그니처 변경 반영 + 5 프리셋 키 검증 + `WALLPAPERS` 일관성 검증.
- `lib/ruehanix/settings.ts` — SETTINGS_TABS 한국어 + wallpaper ready:true.
- `lib/ruehanix/settings.test.ts` — wallpaper ready:true 반영.
- `components/ruehanix/useRuehanix.ts` — setWallpaperKey 핸들러 + handlers 노출.
- `components/ruehanix/viewModel.ts` — wallpaper 시그니처 호출 변경 + set.wallpaperKey/Opts/setWallpaperKey 노출.
- `components/ruehanix/SettingsApp.tsx` — h2/span 한국어 + WallpaperPanel·WallpaperCard 컴포넌트 추가.
- 저장값(구버전 `UiState`): wallpaper 필드가 없는 기존 localStorage 는 `parseUiState` 가 `wallpaper === null` 로 평가되어 전체가 무효 → DEFAULT_UI 로 폴백. 첫 로드 시 aurora 로 자동 복원되며 토스트/크래시 없이 다음 setMode/setAccent 등에서 직렬화되며 wallpaper 키가 추가된다.
- 검증 4종(typecheck/lint/test/build) 모두 통과.