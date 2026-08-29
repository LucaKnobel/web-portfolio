import { defineConfig } from "astro/config";
import icon from "astro-icon";
import node from "@astrojs/node";
import vue from "@astrojs/vue";

export default defineConfig({
  /* CSP experimental feature from Astro doesn't work, using custom middleware instead */
  output: "server",
  adapter: node({
    mode: "standalone",
  }),

  site: "https://lucaknobel.ch",

  security: {
    /* TEMPORARY: disabled to diagnose 403 origin-check false positive; re-enable ASAP */
    checkOrigin: false,
    allowedDomains: [
      {
        hostname: "lucaknobel.ch",
        protocol: "https:"
      },
      {
        hostname: "www.lucaknobel.ch",
        protocol: "https:"
      }
    ]
  },

  markdown: {
    syntaxHighlight: "prism"
  },

  compressHTML: true,

  /* Vitest configuration */
  test: {
    globals: true,
    environment: "node",
  },

  i18n: {
    locales: ["de", "en"],
    defaultLocale: "de",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    }
  },

  prefetch: {
    prefetchAll: true
  },

  integrations: [icon({
    iconDir: "src/assets/icons",
  }), vue()],
});