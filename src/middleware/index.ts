
import { sequence } from "astro:middleware";
import { csp } from "./csp";
import { debugOrigin } from "./debugOrigin";

export const onRequest = sequence(
  debugOrigin,
  csp
);
