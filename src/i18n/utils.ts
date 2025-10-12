import { ui, defaultLang } from "./ui";

export function getLangFromUrl(url: URL) {
    const [, lang=""] = url.pathname.split('/');
    if (lang in ui) return lang as keyof typeof ui;
    return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
    return function t(key: keyof typeof ui[typeof defaultLang]) {
        return ui[lang][key] || ui[defaultLang][key];
    }
}

/* Client-side helper that mirrors the Astro pattern */
export function useClientTranslations() {
    if (typeof window === "undefined") {
        /* SSR fallback */
        return {
            lang: defaultLang,
            t: useTranslations(defaultLang)
        };
    }

    /* Client-side: equivalent to getLangFromUrl(Astro.url) */
    const url = new URL(window.location.href);
    const lang = getLangFromUrl(url);
    const t = useTranslations(lang);
    
    return { lang, t };
}

