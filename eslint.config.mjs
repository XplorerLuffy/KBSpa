import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Deno runtime, type-checked and linted by the Supabase CLI instead.
      "supabase/functions/**",
      // Separate npm projects with their own runtimes and module systems:
      // the Electron main process is CommonJS by design, and the Remotion
      // compositions are only ever rendered by the Remotion CLI.
      "desktop/**",
      "remotion/**",
    ],
  },
];

export default eslintConfig;
