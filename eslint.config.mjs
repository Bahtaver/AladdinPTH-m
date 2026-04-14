import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/** Next.js 16+ ships flat ESLint config; FlatCompat with extends() hits circular JSON bugs. */
const eslintConfig = [...nextCoreWebVitals];

export default eslintConfig;
