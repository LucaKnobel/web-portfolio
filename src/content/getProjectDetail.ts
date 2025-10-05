import { getEntry, render } from "astro:content";
import type { CollectionEntry } from "astro:content";

/**
 * Loads and renders a project by language and slug.
 * Returns { project, Content } or null if not found.
 */
export async function getProjectDetail(lang: string, slug: string): Promise<{ project: CollectionEntry<"projects">; Content: any } | null> {
    if (!slug) return null;
    const project = await getEntry("projects", `${lang}/${slug}`);
    if (!project) return null;
    const { Content } = await render(project);
    return { project, Content };
}
