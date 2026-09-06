import { expectTypeOf, it } from "vitest";
import type { ComponentProps } from "astro/types";
import type { CollectionEntry, render } from "astro:content";
import type ProjectCard from "@/components/ProjectCard.astro";
import type ProjectDetail from "@/components/ProjectDetail.astro";
import type { getProjectDetail } from "@/content/get-project-detail";

type Project = CollectionEntry<"projects">;
type Detail = NonNullable<Awaited<ReturnType<typeof getProjectDetail>>>;

it("keeps project loading and rendering tied to Astro content types", () => {
  expectTypeOf<Detail["project"]>().not.toBeAny();
  expectTypeOf<Detail["project"]>().toEqualTypeOf<Project>();
  expectTypeOf<Detail["Content"]>().not.toBeAny();
  expectTypeOf<Detail["Content"]>().toEqualTypeOf<
    Awaited<ReturnType<typeof render>>["Content"]
  >();
});

it("exposes typed project detail props to callers", () => {
  expectTypeOf<
    ComponentProps<typeof ProjectDetail>["project"]
  >().toEqualTypeOf<Project>();
  expectTypeOf<ComponentProps<typeof ProjectDetail>["Content"]>().toEqualTypeOf<
    Detail["Content"]
  >();
});

it("derives project card content from the collection", () => {
  type Card = ComponentProps<typeof ProjectCard>;
  expectTypeOf<
    Pick<Card, "title" | "description" | "date" | "tags">
  >().toEqualTypeOf<
    Pick<Project["data"], "title" | "description" | "date" | "tags">
  >();
  expectTypeOf<Card["coverSrc"]>().toEqualTypeOf<Project["data"]["cover"]>();
});
