import { defineConfig } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
  output: "server",
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
