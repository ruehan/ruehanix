import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: ["scripts/**", "index.html", ".next/**", "node_modules/**", "out/**"],
  },
];

export default eslintConfig;
