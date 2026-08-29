import { defineConfig } from "vitest/config";

export default defineConfig({
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
