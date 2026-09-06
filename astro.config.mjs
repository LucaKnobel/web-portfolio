import { defineConfig, envField } from "astro/config";
import icon from "astro-icon";
import node from "@astrojs/node";

export default defineConfig({
  env: {
    schema: {
      SMTP_HOST: envField.string({ context: "server", access: "secret"}),
      SMTP_PORT: envField.number({ context: "server", access: "secret"}),
      SMTP_USER: envField.string({ context: "server", access: "secret" }),
      SMTP_PASS: envField.string({ context: "server", access: "secret"}),
      SMTP_FROM: envField.string({ context: "server", access: "secret" }),
      SMTP_TO: envField.string({ context: "server", access: "secret" }),
      LOG_LEVEL: envField.enum({
        context: "server",
        access: "public",
        values: ["trace", "debug", "info", "warn", "error"],
        default: "info",
      }),
      APP_VERSION: envField.string({ context: "server", access: "public" }),
    },
  },

  output: "server",
  adapter: node({
    mode: "standalone",
  }),

  site: "https://lucaknobel.ch",

  security: {
    /* Astro's built-in check derives the request protocol from the raw socket
     * instead of X-Forwarded-Proto, so it always sees "http" behind Traefik's
     * TLS termination and rejects every POST. Replaced by src/middleware/origin-check.ts;
     * keep allowedDomains below in sync with src/server/config/trusted-origins.ts. */
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
    ],
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "media-src 'self'",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "manifest-src 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ],
      scriptDirective: {
        resources: [
          { resource: "'self'", kind: "element" },
          { resource: "'none'", kind: "attribute" },
        ],
      },
      styleDirective: {
        resources: [
          { resource: "'self'", kind: "element" },
          { resource: "'none'", kind: "attribute" },
        ],
      },
    },
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
  })],
});