import { describe, expect, it } from "vitest";
import type { CollectionEntry } from "astro:content";
import {
  compareProjectsByDate,
  formatProjectDate,
} from "@/content/project-utils";

type Project = CollectionEntry<"projects">;
function project(id: string, date: string): Project {
  return {
    id,
    collection: "projects",
    data: {
      title: id,
      description: "Description",
      date,
      lang: "de",
      tags: [],
      cover: { src: "/cover.png", width: 100, height: 100, format: "png" },
    },
  };
}

describe("formatProjectDate", () => {
  it.each([
    ["2025-01", "01/2025"],
    ["2025-12", "12/2025"],
    ["2000-02", "02/2000"],
  ])("preserves month/year display for %s", (input, expected) => {
    expect(formatProjectDate(input)).toBe(expected);
  });
});

describe("compareProjectsByDate", () => {
  it("sorts newest first across months and years and keeps tied projects stable", () => {
    const projects = [
      project("old", "2024-12"),
      project("tie-first", "2025-02"),
      project("january", "2025-01"),
      project("new", "2026-01"),
      project("tie-second", "2025-02"),
    ];
    expect(projects.sort(compareProjectsByDate).map(({ id }) => id)).toEqual([
      "new",
      "tie-first",
      "tie-second",
      "january",
      "old",
    ]);
  });

  it("returns zero for the same project month", () => {
    expect(
      compareProjectsByDate(
        project("first", "2025-02"),
        project("second", "2025-02"),
      ),
    ).toBe(0);
  });
});
