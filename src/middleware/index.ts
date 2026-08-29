import { sequence } from "astro:middleware";
import { csp } from "./csp";
import { originCheck } from "./origin-check";
import { version } from "./version";

/* version runs outermost so its header survives the response csp rebuilds. */
export const onRequest = sequence(version, originCheck, csp);
