import { defineConfig } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
  i18n: {
    locales: ["de", "en"],
    defaultLocale: "de",
    routing: {
      prefixDefaultLocale: true
    }
  },
   integrations: [
    icon({
      iconDir: "src/assets/icons",
    })
  ]

});
