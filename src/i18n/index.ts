import de from "@/i18n/de";
import en from "@/i18n/en";


const translations = {
    de,
    en
};

export function useTranslation(locale: string) {
    return translations[locale as keyof typeof translations] ?? translations.en;
}
