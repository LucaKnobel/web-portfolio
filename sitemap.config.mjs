/**
 * @astrojs/sitemap setup, kept out of astro.config.mjs because it needs
 * project-specific route knowledge that would otherwise clutter the main config.
 *
 * Background: this site runs entirely under `output: "server"` with no
 * `prerender = true` anywhere. @astrojs/sitemap can still discover any route
 * with a fixed pathname (career, contact, imprint, privacy-policy, projects,
 * the localized index pages) through Astro's route manifest - the "no SSR
 * support" note in the sitemap docs only applies to genuinely dynamic routes.
 * The one dynamic route here, src/pages/[lang]/projects/[slug].astro, has no
 * getStaticPaths, so its pathname isn't known at the route level and has to
 * be added explicitly via `customPages`.
 */
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";

export const SITE_URL = "https://lucaknobel.ch";

const LOCALES = ["de", "en"];

/** Slugs of the markdown project entries for one locale, e.g. ["bashnet", "coolify", ...]. */
function projectSlugs(lang) {
  const dir = fileURLToPath(new URL(`./src/content/projects/${lang}/`, import.meta.url));
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

/** Project detail pages, read from disk so new projects are picked up automatically. */
const customPages = LOCALES.flatMap((lang) =>
  projectSlugs(lang).map((slug) => `${SITE_URL}/${lang}/projects/${slug}`),
);

/**
 * Astro's i18n router (prefixDefaultLocale + redirectToDefaultLocale) internally
 * registers routes with a trailing slash, while every in-site link (see
 * src/components/Header.astro) is built without one. Left alone, the sitemap
 * would list both forms of every static page as separate, duplicate URLs.
 */
function stripTrailingSlash(url) {
  const parsed = new URL(url);
  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.href;
}

export const sitemapIntegration = sitemap({
  customPages,

  /* Generates <xhtml:link rel="alternate" hreflang="..."> entries between the
   * de/en versions of each page. Codes match BaseLayout.astro's og:locale values. */
  i18n: {
    defaultLocale: "de",
    locales: {
      de: "de-DE",
      en: "en-US",
    },
  },

  serialize(item) {
    /* The bare domain root ("/") only exists to redirect to "/de/" and has
     * no content of its own - excluding it avoids an empty, non-canonical entry. */
    if (item.url === `${SITE_URL}/`) {
      return undefined;
    }

    item.url = stripTrailingSlash(item.url);
    if (item.links) {
      item.links = item.links.map((link) => ({
        ...link,
        url: stripTrailingSlash(link.url),
      }));
    }
    return item;
  },
});
