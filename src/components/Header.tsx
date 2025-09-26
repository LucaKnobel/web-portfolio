import { useEffect, useRef, useState } from "react";
import { getLangFromUrl, useTranslations } from "@/i18n/utils";
import styles from "./Header.module.css";

interface HeaderProps {
  url: URL;
}

export default function Header({ url }: HeaderProps) {
  const lang = getLangFromUrl(url);
  const t = useTranslations(lang);

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<string>(
    typeof window !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || "light"
      : "light"
  );

  const burgerBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax; Secure`;
  }, [theme]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        burgerBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href={`/${lang}/`} className={styles.logo}>
          Luca Knobel
        </a>
        {/* Burger only mobile */}
        <button
          className={styles.burger}
          aria-label={t("aria.openMenu")}
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          ref={burgerBtnRef}
        >
          <svg
            className={styles["burger-icon"]}
            width="24"
            height="24"
            viewBox="0 -960 960 960"
            aria-hidden="true"
            focusable="false"
            fill="currentColor"
          >
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
          </svg>
        </button>
        {/* Desktop navigation */}
        <nav className={styles["nav-desktop"]} aria-label={t("aria.navMain")}>
          <a href={`/${lang}/projects`}>{t("nav.projects")}</a>
          <a href={`/${lang}/career`}>{t("nav.career")}</a>
          <a href={`/${lang}/contact`}>{t("nav.contact")}</a>
        </nav>
        <div className={styles["desktop-selects"]}>
          <select
            onChange={(e) => (window.location.href = e.target.value)}
            aria-label={t("aria.languageSelect")}
            value={`/${lang}/`}
          >
            <option value="/de/">🌐 Deutsch</option>
            <option value="/en/">🌐 English</option>
          </select>
          <select
            className={styles["theme-select"]}
            aria-label={t("aria.themeSelect")}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">☀️ {t("theme.light")}</option>
            <option value="dark">🌙 {t("theme.dark")}</option>
          </select>
        </div>
      </div>

      {/* Overlay and Mobile Menu */}
      {menuOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className={styles["mobile-menu"]}
            role="dialog"
            aria-modal="true"
          >
            <button
              className={styles["close-btn"]}
              aria-label={t("aria.closeMenu")}
              onClick={() => setMenuOpen(false)}
              ref={closeBtnRef}
            >
              <svg
                className={styles["close-icon"]}
                width="24"
                height="24"
                viewBox="0 -960 960 960"
                aria-hidden="true"
                focusable="false"
                fill="currentColor"
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
              </svg>
            </button>
            <nav className={styles["nav-mobile"]} aria-label={t("aria.navMain")}>
              <div className={styles["nav-links"]}>
                <a href={`/${lang}/projects`}>{t("nav.projects")}</a>
                <a href={`/${lang}/career`}>{t("nav.career")}</a>
                <a href={`/${lang}/contact`}>{t("nav.contact")}</a>
              </div>
              <div className={styles["mobile-selects"]}>
                <select
                  onChange={(e) => (window.location.href = e.target.value)}
                  aria-label={t("aria.languageSelect")}
                  value={`/${lang}/`}
                >
                  <option value="/de/">🌐 Deutsch</option>
                  <option value="/en/">🌐 English</option>
                </select>
                <select
                  className={styles["theme-select"]}
                  aria-label={t("aria.themeSelect")}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">☀️ {t("theme.light")}</option>
                  <option value="dark">🌙 {t("theme.dark")}</option>
                </select>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}