import { ui, defaultLang } from "./ui";

export type Language = keyof typeof ui;

export function getLangFromUrl(url: URL) {
  const [, lang = ""] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function getAlternatePath(pathname: string, language: Language): string {
  return pathname.replace(/^\/(de|en)(?=\/|$)/, `/${language}`);
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
