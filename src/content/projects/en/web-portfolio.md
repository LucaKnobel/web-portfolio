---
title: "Web Portfolio"
description: "Modern SSR portfolio with Astro 5, Vue Islands, and TypeScript. Optimized for performance and security best practices with automated scans."
date: "2025-11"
lang: "en"
tags: ["Astro", "Vue", "TypeScript", "SSR", "SQLite", "DevSecOps", "Nodemailer"]
cover: "../images/web-portfolio/cover.png"
url: "https://github.com/LucaKnobel/web-portfolio"

---

# Web Portfolio

## Project Overview

A technical portfolio project that combines modern web technologies with a security-first approach. The portfolio uses **Server-Side Rendering** with Astro 5, **Vue Islands** for targeted interactivity, and achieves a **Lighthouse Score of 90+ on mobile**. Automated security scans (Semgrep, Trivy) run on every pull request to ensure code quality and security. The project demonstrates practical implementation of TypeScript, SQLite, Nodemailer, and modern web standards and is under continuous development.


## Motivation & Project Goals

This portfolio should not only appeal visually but also convince technically. The central goals were performance, security, and maintainability – combined with the desire to practically apply and understand modern web technologies.

The result is an SSR-based portfolio with a minimalist JavaScript footprint, comprehensive security scans, and a consistent Lighthouse score of over 90 points on mobile devices.


## Technology Stack

### Core Technologies

- **Astro 5** – SSR framework with Island Architecture
- **TypeScript** – Type-safety for more robust code
- **Vue 3** – Interactive components as Islands
- **Node.js 22** – Modern runtime for server-side rendering
- **SQLite (better-sqlite3)** – Synchronous database for rate limiting
- **Nodemailer** – SMTP-based email delivery

### Infrastructure & Tools

- **Infomaniak** – GDPR-compliant Node.js hosting (Switzerland)
- **GitHub Actions** – Automated security scans on pull requests
- **Semgrep & Trivy** – SAST, dependency scans, secret detection


## Astro & Island Architecture

**Astro** is a modern web framework with flexible rendering modes: As a Static Site Generator (SSG) for purely static websites or with Server-Side Rendering (SSR) for dynamic content. The core idea: HTML is pre-rendered, JavaScript only reaches the client where it's actually needed.

This concept is called **Island Architecture** – static content remains static, interactive components are selectively activated as "islands". In this project, Astro components deliver static HTML, while Vue components are only initialized client-side when needed. The result: minimal JavaScript footprint with full interactivity.

More on the architecture: [astro.build/concepts](https://docs.astro.build/en/concepts/islands/)


## Project Architecture

The project structure follows Astro's conventions and is modularly structured:

```
src/
├── pages/          # Routing (SSR) with DE/EN language versions
├── components/     # UI components (Astro + Vue Islands)
├── layouts/        # Base layout with SEO meta tags
├── content/        # Markdown & JSON for projects, career, education
├── middleware/     # CSP headers, rate limiting
├── services/       # Email delivery, rate limit logic
├── db/             # SQLite schema with Drizzle ORM
├── i18n/           # Translations (DE/EN)
└── styles/         # CSS tokens, primitives, global styles
```

The routing is based on URL paths (`/de/`, `/en/`) for clear language selection. Dynamic routes like `/de/projects/[slug].astro` load content from Markdown files and render them server-side.



## Core Features

The portfolio is divided into several main sections that present various aspects of my professional background and skills:

### Intro Section

The landing page provides a first impression with an introduction and direct contact options. Clear navigation to the different areas of the portfolio.

### Career Section

Presents my professional background in a timeline with positions, companies, and technologies used. The presentation is chronologically structured and fully available in two languages.

### Projects Section

Shows technical projects with images, short descriptions, and tags. Each project can be clicked on and leads to a detail page with comprehensive documentation and code examples.

### Contact Section

Functional contact form for directly sending messages. The form is protected against spam and does not permanently store personal data.

### Cross-Cutting Features

**Language Switching:** Toggle between German and English via a dropdown menu in the navigation.

**Dark/Light Mode:** Theme switching via a toggle button, preference is saved.

**Mobile Navigation:** Responsive menu for optimal operation on smartphones and tablets.


## Performance & Lighthouse

The portfolio achieves a **Lighthouse Score of 90+ on mobile devices** through:

- **Minimal JavaScript:** Island Architecture reduces the JS footprint
- **Server-Side Rendering:** Instant First Contentful Paint
- **CSS Tokens:** No framework bloat, hand-optimized styles
- **Lazy Loading:** Images are loaded on demand and optimized


## Security & Automated Scans

Automated tests and security scans (Semgrep, Trivy) run on every pull request. These must pass successfully before code can be merged.

## Lessons Learned & Challenges

**Astro & Island Architecture:** Making decisions about which components need JavaScript and which are sufficient as static HTML. Using Vue Islands only where real interactivity is necessary.

**TypeScript & Type-Safety:** Strict typing helps catch errors early. Particularly with structured content (Career, Projects), this pays off.

**HTML, CSS & Performance:** Hand-optimized styles instead of framework bloat. CSS Custom Properties for theme switching. Responsive design without additional libraries.

**DevSecOps Integration:** Integrating automated security scans directly into the development process. Tests and scans must run before code goes live.

**Linux Hosting & Data Protection:** GDPR-compliant hosting in Switzerland. No tracking cookies, no data transmission to third countries.

**Server-Side Rendering:** Understanding how SSR works and when it makes more sense than client-side rendering. Rate limiting and security on the server, not in the browser.

## Project Status & Outlook

The portfolio is functional and in productive use. Core features like multilingualism, theme switching, contact form, and security scans are implemented and tested.

This project is a continuous learning process. Some areas are intentionally kept simple or are still being expanded.

## Conclusion

This portfolio combines modern web development practices with security best practices. From server-side rendering to automated security scans to GDPR compliance, every feature was practically implemented and every problem solved hands-on.

The project shows that performance and security are not opposites and that modern frameworks like Astro make it possible to achieve both with minimal overhead. The continuous development process reflects that good software is never truly "finished".



