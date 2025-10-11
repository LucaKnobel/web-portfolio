import { defineConfig, envField } from "astro/config";
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
    environment: 'node',
  },

  env: {
    schema: {
      DATABASE_URL: envField.string({ context: "server", access: "secret"}),
      SMTP_HOST: envField.string({ context: "server", access: "secret" }),
      SMTP_PORT: envField.string({ context: "server", access: "secret" }),
      SMTP_USER: envField.string({ context: "server", access: "secret" }),
      SMTP_PASS: envField.string({ context: "server", access: "secret" }),
      SMTP_FROM: envField.string({ context: "server", access: "secret" }),
      SMTP_TO: envField.string({ context: "server", access: "secret" }),
    }
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