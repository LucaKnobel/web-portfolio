import { getCollection, render } from "astro:content";
import type { Language } from "@/i18n/utils";

/** Finds and renders the first policy for a language; pages own HTTP errors. */
export async function getPrivacyPolicy(lang: Language) {
  const entries = await getCollection("privacyPolicy");
  const entry = entries.find((item) => item.id.startsWith(`${lang}/`));
  if (!entry) return null;

  const { Content } = await render(entry);
  return { Content };
}
