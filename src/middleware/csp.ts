import type { APIContext } from "astro";

/**
 * Sets additional security headers on response
 */
const setSecurityHeaders = (headers: Headers): void => {
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()",
  );
};

export const csp = async (
  _: APIContext,
  next: (r?: string | URL | Request) => Promise<Response>,
) => {
  const res = await next();
  setSecurityHeaders(res.headers);
  return res;
};
