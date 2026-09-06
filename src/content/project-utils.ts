import type { CollectionEntry } from "astro:content";

type Project = CollectionEntry<"projects">;
type ProjectDate = Project["data"]["date"];

// Both supported languages retain the existing MM/YYYY presentation.
export const formatProjectDate = (date: ProjectDate): string => {
  const [year, month] = date.split("-");
  return `${month}/${year}`;
};

// The collection validates fixed-width YYYY-MM, so lexical order is chronological.
export const compareProjectsByDate = (
  first: Project,
  second: Project,
): number => second.data.date.localeCompare(first.data.date);
