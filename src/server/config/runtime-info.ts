/* Module-level, so this runs once when the server process boots and stays
 * constant across requests - unlike a value computed inside an Astro
 * component, which would re-run on every render. */
export const SERVER_STARTED_AT = new Date();
