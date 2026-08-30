/** Single source of truth for domains this deployment serves; keep in sync with astro.config.mjs's security.allowedDomains. */
export const TRUSTED_ORIGINS = [
  "https://lucaknobel.ch",
  "https://www.lucaknobel.ch",
] as const;
