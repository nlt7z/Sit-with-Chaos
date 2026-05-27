// Flat config for ESLint 9 (the legacy .eslintrc.json is incompatible, and
// `next lint` was removed in Next 16). eslint-config-next v16 ships native
// flat-config arrays, so we just spread them.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "next-env.d.ts",
      "registry/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // eslint-plugin-react-hooks v6 added this rule as an error. It flags the
      // standard SSR-safe mount pattern used throughout this codebase — reading
      // window.matchMedia / location.hash / localStorage in a mount effect and
      // calling setState with the result. There is no render-time equivalent
      // (those globals don't exist during SSR, and seeding them in a lazy
      // initializer would cause hydration mismatches), so these are false
      // positives here. Kept as a warning so genuine cascading-setState cases
      // still surface without blocking.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
