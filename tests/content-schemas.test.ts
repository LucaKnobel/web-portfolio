import { describe, expect, it, vi } from "vitest";
import { z } from "astro/zod";
import { ui } from "@/i18n/ui";
import { collections } from "@/content.config";

// Vitest does not load Astro's virtual content module. Keep the real schemas.
vi.mock("astro:content", () => ({
  defineCollection: <T>(config: T) => config,
}));

const projectSchemaFactory = collections.projects.schema;
if (typeof projectSchemaFactory !== "function")
  throw new Error("Expected project schema factory");
const schema = projectSchemaFactory({
  image: () =>
    z.object({
      src: z.string(),
      width: z.number(),
      height: z.number(),
      format: z.union([
        z.literal("png"),
        z.literal("jpg"),
        z.literal("jpeg"),
        z.literal("tiff"),
        z.literal("webp"),
        z.literal("gif"),
        z.literal("svg"),
        z.literal("avif"),
      ]),
    }),
});
const project = {
  title: "Project",
  description: "Description",
  date: "2025-07",
  lang: "de",
  tags: ["TypeScript"],
  cover: { src: "/cover.png", width: 100, height: 100, format: "png" },
};

describe("project content schema", () => {
  it("accepts exactly the supported UI languages", () => {
    expect(schema.shape.lang.options).toEqual(Object.keys(ui));
    for (const lang of Object.keys(ui))
      expect(schema.safeParse({ ...project, lang }).success).toBe(true);
    for (const lang of ["fr", "DE", "", "en-US"])
      expect(schema.safeParse({ ...project, lang }).success).toBe(false);
  });

  it.each(["2025-01", "2025-12", "2000-02"])(
    "accepts year-month %s",
    (date) => {
      expect(schema.safeParse({ ...project, date }).success).toBe(true);
    },
  );

  it.each([
    "2025-00",
    "2025-13",
    "2025-1",
    "25-01",
    "2025-01-01",
    "2025-01junk",
    "",
    " 2025-01",
    "2025-01\n",
  ])("rejects invalid date %j", (date) => {
    expect(schema.safeParse({ ...project, date }).success).toBe(false);
  });

  it("allows an absent repository URL and empty tags", () => {
    expect(schema.safeParse({ ...project, tags: [] }).success).toBe(true);
    expect(
      schema.safeParse({
        ...project,
        url: "https://github.com/example/project",
      }).success,
    ).toBe(true);
  });

  it.each(["title", "description", "date", "lang", "tags", "cover"])(
    "requires %s",
    (field) => {
      expect(schema.safeParse({ ...project, [field]: undefined }).success).toBe(
        false,
      );
    },
  );

  it.each([
    "http://example.com",
    "javascript:alert(1)",
    "data:text/html,test",
    "//example.com",
    "/project",
    "",
    null,
  ])("rejects repository URL %j", (url) => {
    expect(schema.safeParse({ ...project, url }).success).toBe(false);
  });
});

it("keeps organization websites required and HTTPS-only", () => {
  for (const collection of [collections.career, collections.education]) {
    const collectionSchema = collection.schema;
    if (!collectionSchema || typeof collectionSchema === "function")
      throw new Error("Expected array schema");
    const website = collectionSchema.element.shape.organizationWebsite;
    expect(website.safeParse("https://example.com").success).toBe(true);
    for (const value of [
      undefined,
      "",
      "http://example.com",
      "javascript:alert(1)",
      "/relative",
    ]) {
      expect(website.safeParse(value).success).toBe(false);
    }
  }
});
