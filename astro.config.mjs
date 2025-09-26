import { defineConfig } from "astro/config";
import icon from "astro-icon";

import react from "@astrojs/react";

export default defineConfig({
  output: "server",
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
   }), react()]
});