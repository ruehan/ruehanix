import type {
  AppKey,
  AppMeta,
  BootLine,
  CatKey,
  Lap,
  Photo,
  Post,
} from "./types";

export const APP_META: Record<AppKey, AppMeta> = {
  files: { name: "Files", color: "#89b4fa", hint: "파일 탐색" },
  reader: { name: "Reader", color: "#f5c2e7", hint: "글 읽기" },
  foto: { name: "Foto", color: "#a6e3a1", hint: "사진" },
  hotlap: { name: "HOT LAP", color: "#f38ba8", hint: "심레이싱" },
  terminal: { name: "Terminal", color: "#94e2d5", hint: "셸" },
  web: { name: "Web", color: "#89dceb", hint: "ruehan.dev" },
  settings: { name: "Settings", color: "#fab387", hint: "설정" },
  about: { name: "About", color: "#cba6f7", hint: "시스템 정보" },
};

export const APP_KEYS = Object.keys(APP_META) as AppKey[];

export const CATS: Record<CatKey, { label: string; color: string }> = {
  dev: { label: "dev", color: "#89b4fa" },
  sim: { label: "racing", color: "#f38ba8" },
  moto: { label: "moto", color: "#fab387" },
  music: { label: "music", color: "#cba6f7" },
};

export const POSTS: Post[] = [
  {
    id: "p1",
    cat: "dev",
    title: "React 서버 컴포넌트, 1년 굴려보고 남은 생각",
    date: "2026.06.18",
    read: "9분",
    excerpt: "RSC를 프로덕션에 올린 지 1년. 빛났던 부분과, 솔직히 후회한 선택을 나눠봤다.",
    body: [
      '서버 컴포넌트를 처음 도입할 때 가장 끌렸던 건 "번들에서 통째로 사라지는 코드"였다. 마크다운 파서, 날짜 라이브러리, 무거운 하이라이터 ― 클라이언트로 한 글자도 내려가지 않는다는 점은 측정 가능한 이득이었다.',
      '실제로 이 블로그의 초기 JS 페이로드는 도입 전 대비 41% 줄었다. 문제는 "어디까지 서버고 어디부터 클라이언트인가"라는 경계가 코드 리뷰의 절반을 잡아먹기 시작했다는 것이다.',
      "1년이 지난 지금의 결론은 단순하다. 데이터를 읽어 그리기만 하는 화면은 서버로, 상태가 사는 조각은 작게 잘라 클라이언트로. 경계를 흐리게 두면 RSC의 장점은 빠르게 증발한다.",
      "다음 글에서는 캐시 무효화 전략 ― 특히 revalidateTag를 어떻게 도메인 이벤트에 묶었는지 ― 를 코드와 함께 정리할 예정이다.",
    ],
  },
  {
    id: "p2",
    cat: "dev",
    title: "모노레포에서 빌드 시간 70% 줄인 이야기",
    date: "2026.05.30",
    read: "7분",
    excerpt: "turbo 캐시와 의존성 그래프를 다시 그렸더니 CI가 12분에서 3분대로 내려왔다.",
    body: [
      "패키지 14개짜리 모노레포에서 한 줄만 고쳐도 전체가 다시 빌드되는 게 일상이었다. 원인의 8할은 잘못 선언된 패키지 간 의존성이었다.",
      '먼저 graph를 시각화해 "사실은 안 쓰는데 import만 걸려 있는" 엣지를 18개 끊었다. 그것만으로 영향 범위가 절반으로 줄었다.',
      "그다음 원격 캐시를 붙였다. 같은 입력이면 동료의 머신에서 만든 결과물을 그대로 내려받는다. CI 평균이 12분 20초에서 3분 40초로 떨어졌다.",
    ],
  },
  {
    id: "p3",
    cat: "sim",
    title: "iRacing GT3, 뉘르부르크링 7분 벽 깨기",
    date: "2026.06.10",
    read: "6분",
    excerpt: "노르드슐라이페 6분 59초. 1년을 매달린 개인 목표를 드디어 넘었다.",
    body: [
      "24.4km, 코너 154개. 노르드슐라이페는 외우는 게 아니라 몸에 새기는 트랙이다. 한 바퀴를 7분 밑으로 넣는다는 건 실수 허용치가 거의 0이라는 뜻이다.",
      '벽을 넘은 결정적 차이는 브레이킹이 아니라 "코너 탈출에서 얼마나 빨리 풀 스로틀로 복귀하느냐"였다. Pflanzgarten 구간에서 0.3초를 통째로 줍는다.',
      "BMW M4 GT3, 셋업은 거의 베이스. 결국 장비보다 반복이었다. 리플레이를 30바퀴어치 돌려보며 같은 코너에서 같은 실수를 지웠다.",
    ],
  },
  {
    id: "p4",
    cat: "moto",
    title: "2026 르망 24시, 하이퍼카 판도가 바뀐다",
    date: "2026.06.15",
    read: "8분",
    excerpt: "LMDh와 LMH가 한 그리드에서 맞붙는 시대. 올해 르망의 관전 포인트를 정리했다.",
    body: [
      "하이퍼카 클래스에 9개 제조사가 모였다. 페라리, 토요타, 포르쉐, 캐딜락, BMW… 2000년대 이후 가장 빽빽한 그리드다.",
      "BoP(성능 균등화)에 대한 불만은 여전하지만, 역설적으로 그 덕에 24시간 내내 선두권이 1분 안쪽에 묶인다. 밤사이 순위가 다섯 번 뒤집히는 레이스가 됐다.",
      "개인적으로는 토요타의 연료 전략을 주목하고 있다. 스틴트를 한 랩 더 끌고 가는 도박이 새벽에 통할지가 승부처다.",
    ],
  },
  {
    id: "p5",
    cat: "moto",
    title: "F1 2026 레귤레이션, 무엇이 바뀌나",
    date: "2026.04.22",
    read: "10분",
    excerpt: "파워유닛 전기 비중 50%, 액티브 에어로, 경량화. 새 규정의 핵심을 짚어본다.",
    body: [
      "2026년 파워유닛은 내연 기관과 전기 모터의 출력 비중이 거의 반반이 된다. MGU-H는 사라지고 배터리 회생에 더 의존한다.",
      "액티브 에어로가 도입되면서 직선에서 다운포스를 흘리고 코너에서 잡는 모드 전환이 가능해진다. DRS의 역할이 사실상 재정의되는 셈이다.",
      "차량은 더 좁고 가벼워진다. 무게 30kg 감량 목표는 최근 10년 흐름을 거스르는 방향이라 팀들의 패키징 싸움이 치열할 것이다.",
    ],
  },
  {
    id: "p6",
    cat: "music",
    title: "베이스 입문 6개월, 손가락이 기억하기까지",
    date: "2026.03.12",
    read: "5분",
    excerpt: "메트로놈과의 지루한 싸움. 그리고 어느 날 갑자기 그루브가 붙던 순간.",
    body: [
      "처음 석 달은 솔직히 재미없었다. 60bpm 메트로놈에 맞춰 루트 음만 반복하는 연습은 음악이 아니라 노동에 가까웠다.",
      '전환점은 좋아하던 곡의 베이스 라인을 통째로 카피하면서 왔다. 음을 외우는 게 아니라 "왜 여기서 이 음으로 움직이는가"가 들리기 시작했다.',
      "지금은 밴드 합주에서 드럼과 호흡을 맞추는 게 가장 즐겁다. 베이스는 튀지 않으면서 곡 전체를 밀고 가는 악기라는 말을 이제야 체감한다.",
    ],
  },
  {
    id: "p7",
    cat: "music",
    title: "내가 매일 듣는 플레이리스트와 톤",
    date: "2026.02.08",
    read: "4분",
    excerpt: "코딩할 때, 운전할 때, 잠들기 전. 상황별로 다른 베이스 톤의 음악들.",
    body: [
      "집중이 필요할 때는 보컬이 없는 퓨전 재즈를 튼다. 베이스가 전면에 나오는 트랙은 오히려 산만해서 피한다.",
      "운전할 때는 펑크와 모타운. 그루브가 분명한 곡은 페이스를 일정하게 잡아준다 ― 이건 심레이싱에서도 똑같이 통한다.",
      "잠들기 전엔 앰비언트. 톤이 둥글고 어택이 약한 음악이 하루의 긴장을 풀어준다.",
    ],
  },
  {
    id: "p8",
    cat: "dev",
    title: "TypeScript 타입 좁히기, 실전 패턴 모음",
    date: "2026.01.20",
    read: "8분",
    excerpt: "discriminated union부터 assertion 함수까지, 실무에서 자주 쓰는 좁히기 패턴.",
    body: [
      '타입 좁히기(narrowing)는 결국 "컴파일러에게 내가 아는 사실을 증명하는 일"이다. 가장 깔끔한 도구는 discriminated union이다.',
      "kind 같은 태그 필드를 두면 switch 한 번으로 분기마다 타입이 자동으로 좁혀진다. as 단언을 쓰고 싶어질 때 대부분은 이 패턴으로 대체할 수 있다.",
      "외부 경계(네트워크, 폼)에서는 assertion 함수나 zod 같은 런타임 검증으로 타입과 실제 값을 일치시키는 게 안전하다.",
    ],
  },
];

export const PHOTOS: Photo[] = [
  { t: "Spa · Eau Rouge", c1: "#1b3a5c", c2: "#3f7cae", tag: "track" },
  { t: "베이스 셋업 · 합주실", c1: "#3a2a1a", c2: "#9a6b3a", tag: "music" },
  { t: "르망 새벽 4시", c1: "#1a1330", c2: "#5b3f8a", tag: "moto" },
  { t: "트리플 모니터 리그", c1: "#10211c", c2: "#2f6f57", tag: "sim" },
  { t: "몬차 · 파라볼리카", c1: "#3a1320", c2: "#b03a52", tag: "track" },
  { t: "주말의 LP", c1: "#2a2410", c2: "#a08a2a", tag: "music" },
  { t: "스즈카 · S자", c1: "#10243a", c2: "#3a86c0", tag: "track" },
  { t: "야간 코딩", c1: "#1a1a22", c2: "#4a4a66", tag: "dev" },
  { t: "WEC 피트월", c1: "#2a160a", c2: "#c0641a", tag: "moto" },
];

export const LAPS: Lap[] = [
  { track: "Nürburgring Nordschleife", car: "BMW M4 GT3", time: "6:59.214", delta: "-0.41", best: true },
  { track: "Spa-Francorchamps", car: "Ferrari 296 GT3", time: "2:17.882", delta: "-0.12", best: false },
  { track: "Monza", car: "Porsche 992 GT3 R", time: "1:47.503", delta: "+0.08", best: false },
  { track: "Suzuka", car: "BMW M4 GT3", time: "2:00.661", delta: "-0.27", best: false },
  { track: "Le Mans · La Sarthe", car: "Toyota GR010", time: "3:24.119", delta: "-0.55", best: false },
];

export const BOOT_SEQ: BootLine[] = [
  ["ok", "Reached target ", "Basic System"],
  ["ok", "Started ", "Network Manager"],
  ["ok", "Mounted ", "/home/ruehan"],
  ["ok", "Started ", "Bluetooth service"],
  ["ok", "Started ", "PipeWire Multimedia"],
  ["ok", "Reached target ", "Graphical Interface"],
  ["ok", "Started ", "Hyprland session"],
  ["info", "Loading ", "Catppuccin Mocha theme"],
  ["info", "Spawning ", "waybar · conky · fastfetch"],
  ["ok", "Welcome to ", "ruehanix 1.0 (kernel 6.9.2-rue)"],
];

export const ACCENT_PALETTE = ["#f38ba8", "#fab387", "#a6e3a1", "#cba6f7", "#89b4fa", "#f5c2e7"];

export const THEME_MODES = [
  { k: "light", label: "Light", prev: "linear-gradient(135deg,#eff1f5,#ccd0da)" },
  { k: "dark", label: "Dark", prev: "linear-gradient(135deg,#1e1e2e,#45475a)" },
  { k: "auto", label: "Auto", prev: "linear-gradient(135deg,#eff1f5 0%,#eff1f5 48%,#1e1e2e 52%,#1e1e2e 100%)" },
] as const;
