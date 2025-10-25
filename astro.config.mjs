import { defineConfig } from "astro/config";
import icon from "astro-icon";
import node from "@astrojs/node";
import vue from "@astrojs/vue";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),

  site: "https://lucaknobel.ch",

  security: {
    checkOrigin: true,
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

  experimental: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' https: data:",
        "font-src 'self'",
        "connect-src 'self' https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
        // DO NOT add style-src or script-src here!
        // Inline style attributes (e.g. style="...") require 'unsafe-inline' automatically in Astro SSR CSP.
        // Astro will inject hashes for <style> and <script> tags, but not for style attributes.
      ]
    }
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