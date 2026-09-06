import { describe, expect, it } from "vitest";
import { getAlternatePath } from "@/i18n/utils.js";

describe("getAlternatePath", () => {
  it("keeps the current route path for every available locale", () => {
    expect(getAlternatePath("/de/projects", "en")).toBe("/en/projects");
    expect(getAlternatePath("/en/projects/foo", "de")).toBe("/de/projects/foo");
  });

  it("does not alter paths without a locale prefix", () => {
    expect(getAlternatePath("/404", "en")).toBe("/404");
  });
});
