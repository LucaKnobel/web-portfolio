import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

/* draft */
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src *",
      "script-src * 'unsafe-inline' 'unsafe-eval' data:",
      "style-src * 'unsafe-inline' data:",
    ].join("; ")
  );


  return response;
});