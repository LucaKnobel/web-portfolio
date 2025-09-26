import { defineConfig } from "astro/config";
import icon from "astro-icon";

import react from "@astrojs/react";

import node from "@astrojs/node";

import vue from "@astrojs/vue";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),

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
  }), react(), vue()],
});