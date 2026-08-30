import { defineMiddleware } from "astro:middleware";
import { APP_VERSION } from "astro:env/server";

/* Baked into the image at build time (see Dockerfile ARG/ENV) so the CD
 * pipeline can verify which commit is actually serving traffic. */
export const version = defineMiddleware(async (_, next) => {
  const res = await next();
  res.headers.set("X-App-Version", APP_VERSION);
  return res;
});
