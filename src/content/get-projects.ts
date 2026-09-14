import { getCollection } from "astro:content";
import { compareProjectsByDate } from "@/content/project-utils";
import type { Language } from "@/i18n/utils";

export async function getProjects(lang: Language) {
  const projects = await getCollection("projects");
  return projects.filter((project) => project.data.lang === lang).sort(compareProjectsByDate);
}
