import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { getProjects } from "@/content/get-projects";

vi.mock("astro:content", () => ({ getCollection: vi.fn() }));

function project(lang: "de" | "en", date: string): CollectionEntry<"projects"> {
  return {
    id: `${lang}/${date}`, collection: "projects",
    data: {
      lang, date, title: date, description: "Project", tags: [],
      cover: { src: "/cover.png", width: 100, height: 100, format: "png" },
    },
  };
}

beforeEach(() => vi.resetAllMocks());

describe("getProjects", () => {
  it.each(["de", "en"] as const)("filters %s and sorts newest first without changing the collection", async (lang) => {
    const entries = [project("de", "2024-01"), project("en", "2024-01"), project("de", "2025-06"), project("en", "2025-06")];
    vi.mocked(getCollection).mockResolvedValue(entries);
    const original = [...entries];
    expect((await getProjects(lang)).map(({ id }) => id)).toEqual([`${lang}/2025-06`, `${lang}/2024-01`]);
    expect(entries).toEqual(original);
  });

  it("returns an empty list when no projects match", async () => {
    vi.mocked(getCollection).mockResolvedValue([project("de", "2024-01")]);
    expect(await getProjects("en")).toEqual([]);
  });

  it("propagates loading errors for the page to handle", async () => {
    const error = new Error("Content unavailable");
    vi.mocked(getCollection).mockRejectedValue(error);
    await expect(getProjects("de")).rejects.toBe(error);
  });
});
