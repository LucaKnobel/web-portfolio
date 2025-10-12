import { defineConfig } from "astro/config";
import icon from "astro-icon";
import node from "@astrojs/node";
import vue from "@astrojs/vue";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),

  // Vitest configuration
  test: {
    globals: true,
    environment: "node",
  },

  i18n: {
    locales: ["de", "en"],
    defaultLocale: "de",
    routing: {
      prefixDefaultLocale: true
    }
  },

  prefetch: {
    prefetchAll: true
  },

  integrations: [icon({
    iconDir: "src/assets/icons",
  }), vue()],
});