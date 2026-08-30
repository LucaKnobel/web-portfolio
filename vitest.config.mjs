import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    reporters: ["default", "json"],
    outputFile: {
      json: "reports/vitest.json",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
      outputDir: "reports",
      include: ["src/**/*.{ts,js,tsx,jsx}"],
      exclude: ["node_modules", "dist", "**/*.astro", "**/*.vue"],
    },
  },
});
