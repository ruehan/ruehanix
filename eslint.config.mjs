import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      // Next 16 동봉 react-hooks v6(React Compiler 린터)의 신규 규칙들.
      // 기존(검토 완료·정상 동작) useRuehanix의 의도된 패턴(이벤트 핸들러용 ref 미러,
      // 수동 useCallback 메모이제이션, 부팅 게이트의 effect 내 setState)을 막는다.
      // 강제된 Next 16 업그레이드(Sanity 6 호환)로 새로 들어온 규칙이라, 차단(error) 대신
      // warn으로 두고 useRuehanix를 React Compiler 친화적으로 리팩터링하는 후속 작업으로 남긴다.
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: ["scripts/**", "index.html", ".next/**", "node_modules/**", "out/**"],
  },
];

export default eslintConfig;
