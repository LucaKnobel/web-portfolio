import type { APIContext } from "astro";
import crypto from "node:crypto";

const makeNonce = () => crypto.randomBytes(16).toString("base64");

/**
 * Builds CSP policy string with optional nonce for HTML responses
 */
const buildCSPPolicy = (nonce?: string): string => {
  const scriptSrc = nonce 
    ? `'self' 'nonce-${nonce}' 'report-sample'`
    : "'self' 'report-sample'";
  
  const styleSrc = nonce
    ? `'self' 'nonce-${nonce}' 'report-sample'`
    : "'self' 'report-sample'";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "script-src-attr 'none'",
    `style-src ${styleSrc}`,
    "style-src-attr 'none'",
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
};

/**
 * Sets additional security headers on response
 */
const setSecurityHeaders = (headers: Headers): void => {
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
};

export const csp = async (_: APIContext, next: (r?: string | URL | Request) => Promise<Response>) => {
  if (process.env.NODE_ENV !== "production") {
    return await next(); /* skips middleware in non-production */
  }

  const res = await next();
  const ct = res.headers.get("content-type") || "";

  if (!ct.startsWith("text/html")) {
    /* Non-HTML: Set CSP without nonce */
    res.headers.set("Content-Security-Policy", buildCSPPolicy());
    setSecurityHeaders(res.headers);
    return res;
  }

  /* HTML: Generate nonce and inject into script/style tags */
  const nonce = makeNonce();
  const html = await res.text();

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

  body.headers.set("Content-Security-Policy", buildCSPPolicy(nonce));
  setSecurityHeaders(body.headers);
  
  return body;
};