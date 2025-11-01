import type { APIContext } from "astro";
import crypto from "node:crypto";

const makeNonce = () => crypto.randomBytes(16).toString("base64");  

export const csp = async (_: APIContext, next: (r?: string | URL | Request) => Promise<Response>) => {
  if (process.env.NODE_ENV !== "production") {
    return await next(); /* skips middleware in non-production */
  }

  const res = await next();

  const ct = res.headers.get("content-type") || "";
  if (!ct.startsWith("text/html")) {
    /* Non-HTML: Set only headers (e.g. JSON, CSS, JS) */
    const policy = [
      "default-src 'self'",
      "script-src 'self' 'report-sample'",
      "script-src-attr 'none'",
      "style-src 'self' 'report-sample'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "manifest-src 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");
    res.headers.set("Content-Security-Policy", policy);
    return res;
  }

  /* create nonce for html */
  const nonce = makeNonce();
  const html = await res.text();

  /* carefully only touch tags without existing nonce attribute */
  const withScriptNonce = html.replace(
    /<script(?![^>]*\bnonce=)/gi,
    `<script nonce="${nonce}"`
  );

  const withStyleNonce = withScriptNonce.replace(
    /<style(?![^>]*\bnonce=)/gi,
    `<style nonce="${nonce}"`
  );

  /* Remove empty style="" attributes from iconify/vue to prevent CSP violations */
  const cleaned = withStyleNonce.replace(/\s+style=""\s*/gi, ' ');

  const body = new Response(cleaned, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });

  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'report-sample'`,
    "script-src-attr 'none'",
    `style-src 'self' 'nonce-${nonce}' 'report-sample'`,
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
    "upgrade-insecure-requests"
  ].join("; ");

  body.headers.set("Content-Security-Policy", policy);
  return body;
};


