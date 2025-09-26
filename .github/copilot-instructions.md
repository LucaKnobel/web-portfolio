# Copilot Instructions for AI Agents — web-portfolio-astro

## Project Overview
- **Astro 5+ (SSR, TypeScript strict)** web portfolio, multi-language (DE/EN), technical audience.
- **React** only as "islands" for real client interactivity. No global state, no SPA routing.
- **Server-side rendering (SSR)** is default. Static or server-rendered content preferred.
- **Infomaniak (CH/EU) hosting, DSG/DSGVO-compliant**. No tracking/analytics without consent.

## Architecture & Patterns
- **Pages:** `src/pages/` (Astro routes, `/de` and `/en` for i18n)
- **Layouts:** `src/layouts/` (shared structure)
- **Components:** `src/components/` (Astro/React, React only for islands)
- **Content:** `src/content/` (collections, i18n JSON, markdown)
- **Assets:** `src/assets/` (images, project media)
- **Styles:** `src/styles/` (CSS custom properties, `base.css` for baseline)
- **Types:** `src/types/` (TypeScript interfaces)

## Key Conventions
- **Security:** Never use `dangerouslySetInnerHTML`/`innerHTML`. Escape all user input. Use `rel="noopener noreferrer"` for external links.
- **Minimal JS:** Prefer Astro/SSR. React only for focused islands. No client-side markdown rendering.
- **i18n:** All text in `/content/*/`, language routes `/de`, `/en`, use `hreflang` and proper meta tags.
- **Styling:** Use CSS tokens, mobile-first, no global leaks. See `base.css`, `tokens.css`.
- **SEO:** Always set meta/OG tags, sitemaps, and `hreflang`.
- **Compliance:** No secrets in frontend, no PII in client code, no 3rd-country data transfer.

## Developer Workflows
- **Build:** `npm run build` (SSR output)
- **Dev:** `npm run dev`
- **Preview:** `npm run preview`
- **Lint:** `npm run lint`
- **Typecheck:** `npm run typecheck`
- **Content:** Add markdown to `src/content/projects/{lang}/`, update JSON for i18n.
- **Testing:** Focus on DOM output, events, accessibility. Defensive programming.

## Examples
- **Astro page:** `src/pages/en/index.astro`
- **React island:** `src/components/Header.tsx` (imported in Astro page)
- **i18n JSON:** `src/content/career/en.json`
- **Content collection:** `src/content/projects/en/bashnet.md`

## If unsure or conflicting:
- **Check Astro docs first.** If project rules conflict, prefer official docs and explain.
- **Warn** if a solution is insecure, non-performant, or not maintainable.
- **Suggest the simplest secure solution first, with brief alternatives.**

---
For more, see `/instructions.md` (project rules, priorities, and rationale).
