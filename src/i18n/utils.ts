import { ui, defaultLang } from "./ui";

export type Language = keyof typeof ui;
export type TranslationKey = keyof (typeof ui)[typeof defaultLang];
export type Translator = (key: TranslationKey) => string;

export function getLangFromUrl(url: URL): Language {
  const [, lang = ""] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function getAlternatePath(pathname: string, language: Language): string {
  return pathname.replace(/^\/(de|en)(?=\/|$)/, `/${language}`);
}

export function useTranslations(lang: Language): Translator {
  return function t(key: TranslationKey) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
