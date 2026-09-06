import { getEntry, render } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { Language } from "@/i18n/utils.js";

/**
 * Loads and renders a project by language and slug.
 * Returns { project, Content } or null if not found.
 */
export async function getProjectDetail(
  lang: Language,
  slug: string,
): Promise<{
  project: CollectionEntry<"projects">;
  Content: Awaited<ReturnType<typeof render>>["Content"];
} | null> {
  if (!slug) return null;
  const project = await getEntry("projects", `${lang}/${slug}`);
  if (!project) return null;
  const { Content } = await render(project);
  return { project, Content };
}
