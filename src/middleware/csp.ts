// src/middleware/csp-report.ts
export const csp = async (_ctx, next) => {
  const res = await next();
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",            // add 'nonce-...' + 'strict-dynamic' if you use nonces
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "require-trusted-types-for 'script'",
    "trusted-types default",
  ].join("; ");
  res.headers.set("Content-Security-Policy-Report-Only", csp);
  return res;
};
