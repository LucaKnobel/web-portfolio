import { defineConfig } from "astro/config";

export default defineConfig({
  i18n: {
    locales: ["de", "en"],
    defaultLocale: "de",
    routing: {
      prefixDefaultLocale: true
    }
  }
});
