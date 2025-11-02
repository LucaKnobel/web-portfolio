
import { sequence } from "astro:middleware";
import { csp } from "./csp";

export const onRequest = sequence(
  csp    
);
