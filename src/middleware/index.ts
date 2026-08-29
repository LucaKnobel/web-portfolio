import { sequence } from "astro:middleware";
import { csp } from "./csp";
import { originCheck } from "./origin-check";

export const onRequest = sequence(originCheck, csp);
