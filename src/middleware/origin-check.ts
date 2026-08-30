import type { APIContext } from "astro";
import { TRUSTED_ORIGINS } from "@/server/config/trusted-origins.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
];

const ALLOWED_ORIGINS = new Set<string>(TRUSTED_ORIGINS);

const isLocalOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const hasFormLikeContentType = (contentType: string | null): boolean => {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return FORM_CONTENT_TYPES.some((type) => lower.includes(type));
};

/**
 * Replaces Astro's built-in origin check (security.checkOrigin, disabled in
 * astro.config.mjs). @astrojs/node's standalone mode derives the request
 * protocol from the raw socket instead of X-Forwarded-Proto, so behind a
 * TLS-terminating reverse proxy Astro always sees "http" and rejects every
 * same-site POST. This checks the Origin header against TRUSTED_ORIGINS
 * instead, which is unaffected by that bug. Keep TRUSTED_ORIGINS in sync
 * with astro.config.mjs's security.allowedDomains. In local development,
 * localhost origins are allowed.
 */
export const originCheck = async (
  { request }: APIContext,
  next: (r?: string | URL | Request) => Promise<Response>,
) => {
  if (
    !SAFE_METHODS.has(request.method) &&
    hasFormLikeContentType(request.headers.get("content-type"))
  ) {
    const origin = request.headers.get("origin");

    const isAllowed =
      origin !== null &&
      (ALLOWED_ORIGINS.has(origin) ||
        (import.meta.env.DEV && isLocalOrigin(origin)));

    if (!origin || !isAllowed) {
      return new Response(
        `Cross-site ${request.method} form submissions are forbidden`,
        {
          status: 403,
        },
      );
    }
  }

  return await next();
};
