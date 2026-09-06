import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { getPrivacyPolicy } from "@/content/get-privacy-policy";

vi.mock("astro:content", () => ({ getCollection: vi.fn(), render: vi.fn() }));

function policy(id: string): CollectionEntry<"privacyPolicy"> {
  return { id, collection: "privacyPolicy", data: {}, body: "Policy" };
}

const Content = vi.fn<Awaited<ReturnType<typeof render>>["Content"]>();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(render).mockResolvedValue({
    Content,
    headings: [],
    remarkPluginFrontmatter: {},
  });
});

describe("getPrivacyPolicy", () => {
  it.each(["de", "en"] as const)(
    "renders only the requested %s policy",
    async (lang) => {
      const entries = [
        policy("en/privacy-policy"),
        policy("de/privacy-policy"),
      ];
      vi.mocked(getCollection).mockResolvedValue(entries);

      expect(await getPrivacyPolicy(lang)).toEqual({ Content });
      expect(getCollection).toHaveBeenCalledWith("privacyPolicy");
      expect(render).toHaveBeenCalledExactlyOnceWith(
        entries.find((entry) => entry.id === `${lang}/privacy-policy`),
      );
    },
  );

  it("keeps the existing first-match lookup independent of the filename", async () => {
    const first = policy("en/custom-policy");
    vi.mocked(getCollection).mockResolvedValue([
      first,
      policy("en/another-policy"),
    ]);

    await getPrivacyPolicy("en");
    expect(render).toHaveBeenCalledExactlyOnceWith(first);
  });

  it("returns null for missing languages without rendering unrelated content", async () => {
    vi.mocked(getCollection).mockResolvedValue([
      policy("de/privacy-policy"),
      policy("english/privacy-policy"),
    ]);

    expect(await getPrivacyPolicy("en")).toBeNull();
    expect(render).not.toHaveBeenCalled();
  });

  it("returns null for an empty collection", async () => {
    vi.mocked(getCollection).mockResolvedValue([]);
    expect(await getPrivacyPolicy("de")).toBeNull();
    expect(render).not.toHaveBeenCalled();
  });

  it("propagates loading failures for the page to return HTTP 500", async () => {
    const error = new Error("Content store unavailable");
    vi.mocked(getCollection).mockRejectedValue(error);
    await expect(getPrivacyPolicy("de")).rejects.toBe(error);
    expect(render).not.toHaveBeenCalled();
  });

  it("propagates rendering failures instead of treating them as missing content", async () => {
    vi.mocked(getCollection).mockResolvedValue([policy("de/privacy-policy")]);
    const error = new Error("Cannot render policy");
    vi.mocked(render).mockRejectedValue(error);
    await expect(getPrivacyPolicy("de")).rejects.toBe(error);
  });
});
