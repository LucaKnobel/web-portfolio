import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([".astro/**", "dist/**", "coverage/**", "reports/**"]),
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,astro}"],
    extends: [js.configs.recommended],
  },
  {
    files: ["**/*.{ts,tsx,astro}"],
    extends: [tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  ...astro.configs.recommended,
  {
    files: ["**/*.astro"],
    // Astro frontmatter is TypeScript; astro check resolves its global types.
    rules: { "no-undef": "off" },
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,astro}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
]);
