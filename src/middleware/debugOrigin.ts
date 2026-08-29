import type { APIContext } from "astro";

/**
 * TEMPORARY: logs the headers Astro's origin-check relies on to diagnose the
 * 403 "Cross-site POST form submissions are forbidden" issue in production.
 * Remove once the reverse-proxy header forwarding is confirmed correct.
 */
export const debugOrigin = async (
  { request, url }: APIContext,
  next: (r?: string | URL | Request) => Promise<Response>,
) => {
  if (request.method === "POST") {
    console.log("[DEBUG origin-check]", {
      method: request.method,
      "origin header": request.headers.get("origin"),
      "host header": request.headers.get("host"),
      "x-forwarded-proto": request.headers.get("x-forwarded-proto"),
      "x-forwarded-host": request.headers.get("x-forwarded-host"),
      "x-forwarded-for": request.headers.get("x-forwarded-for"),
      "resolved url.origin": url.origin,
      "content-type": request.headers.get("content-type"),
      timestamp: new Date().toISOString(),
    });
  }

  return await next();
};
