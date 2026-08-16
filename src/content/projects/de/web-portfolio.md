---
title: "Web-Portfolio"
description: "Modernes SSR-Portfolio mit Astro 7, Vue Islands und TypeScript. Optimiert für Performance und Security-Best-Practices mit automatisierten Scans."
date: "2025-11"
lang: "de"
tags: ["Astro", "Vue", "TypeScript", "SSR", "DevSecOps", "Nodemailer"]
cover: "../images/web-portfolio/cover.png"
url: "https://github.com/LucaKnobel/web-portfolio"
---

# Web-Portfolio

## Projekt in Kürze

Ein technisches Portfolio-Projekt, das moderne Web-Technologien mit einem Security-First-Ansatz verbindet. Das Portfolio nutzt **Server-Side Rendering** mit Astro 7, **Vue Islands** für gezielte Interaktivität und erreicht einen **Lighthouse Score von 90+ auf Mobile**. Automatisierte Security-Scans (Semgrep, Trivy) laufen bei jedem Pull Request, um Code-Qualität und Sicherheit zu gewährleisten. Das Projekt demonstriert den praktischen Einsatz von TypeScript, serverseitigem Schutz, Nodemailer und modernen Web-Standards und befindet sich in kontinuierlicher Weiterentwicklung.

## Motivation & Projektziele

Dieses Portfolio sollte nicht nur optisch ansprechen, sondern auch technisch überzeugen. Die zentralen Ziele waren Performance, Security und Wartbarkeit – kombiniert mit dem Wunsch, moderne Web-Technologien praktisch anzuwenden und zu verstehen.

Das Ergebnis ist ein SSR-basiertes Portfolio mit minimalistischem JavaScript-Footprint, umfassenden Security-Scans und einem konsistenten Lighthouse Score von über 90 Punkten auf Mobile-Geräten.

## Technologie-Stack

### Core Technologien

- **Astro 7** – SSR Framework mit Island Architecture
- **TypeScript** – Type-Safety für robusteren Code
- **Vue 3** – Interaktive Komponenten als Islands
- **Node.js 24** – Moderne Runtime für Server-Side Rendering
- **Nodemailer** – SMTP-basierter E-Mail-Versand

### Infrastruktur & Tools

- **Infomaniak** – DSG-konformes Node.js Hosting (Schweiz)
- **GitHub Actions** – Automatisierte Security-Scans bei Pull Requests
- **Semgrep & Trivy** – SAST, Dependency-Scans, Secret Detection

## Astro & Island Architecture

**Astro** ist ein modernes Web-Framework mit flexiblen Rendering-Modi: Als Static Site Generator (SSG) für rein statische Websites oder mit Server-Side Rendering (SSR) für dynamische Inhalte. Die zentrale Idee: HTML wird vorab gerendert, JavaScript kommt nur dort zum Client, wo es tatsächlich benötigt wird.

Dieses Konzept nennt sich **Island Architecture** – statische Inhalte bleiben statisch, interaktive Komponenten werden als "Inseln" gezielt aktiviert. In diesem Projekt liefern Astro-Komponenten statisches HTML, während Vue-Komponenten nur bei Bedarf clientseitig initialisiert werden. Das Ergebnis: minimaler JavaScript-Footprint bei voller Interaktivität.

Mehr zur Architektur: [astro.build/concepts](https://docs.astro.build/en/concepts/islands/)

## Projekt-Architektur

Die Projektstruktur folgt Astros Konventionen und ist modular aufgebaut:

```
src/
├── pages/          # Routing (SSR) mit DE/EN Sprachversionen
├── components/     # UI-Komponenten (Astro + Vue Islands)
├── layouts/        # Basis-Layout mit SEO-Meta-Tags
├── content/        # Markdown & JSON für Projekte, Career, Education
├── middleware/     # CSP Headers
├── services/       # E-Mail-Versand, Rate-Limit-Logic
├── i18n/           # Übersetzungen (DE/EN)
└── styles/         # CSS Tokens, Primitives, Global Styles
```

Das Routing basiert auf URL-Pfaden (`/de/`, `/en/`) für klare Sprachauswahl. Dynamische Routen wie `/de/projects/[slug].astro` laden Inhalte aus Markdown-Dateien und rendern diese serverseitig.

## Zentrale Features

Das Portfolio ist in mehrere Hauptsektionen gegliedert, die verschiedene Aspekte meines beruflichen Werdegangs und meiner Fähigkeiten präsentieren:

### Intro Section

Die Startseite bietet einen ersten Eindruck mit Vorstellung und direkten Kontaktmöglichkeiten. Klare Navigation zu den verschiedenen Bereichen des Portfolios.

### Career Section

Präsentiert meinen beruflichen Werdegang in einer Timeline mit Positionen, Unternehmen und eingesetzten Technologien. Die Darstellung ist chronologisch aufgebaut und vollständig zweisprachig verfügbar.

### Projects Section

Zeigt technische Projekte mit Bildern, kurzen Beschreibungen und Tags. Jedes Projekt kann angeklickt werden und führt zu einer Detailseite mit ausführlicher Dokumentation und Code-Beispielen.

### Contact Section

Funktionales Kontaktformular zum direkten Versenden von Nachrichten. Das Formular ist gegen Spam geschützt, verwendet eine schlanke In-Memory-Tagesbegrenzung und speichert keine persönlichen Daten dauerhaft.

### Übergreifende Features

**Sprachumschaltung:** Wechsel zwischen Deutsch und Englisch über ein Dropdown-Menü in der Navigation.

**Dark/Light Mode:** Theme-Wechsel über einen Toggle-Button, Präferenz wird gespeichert.

**Mobile Navigation:** Responsive Menü für optimale Bedienung auf Smartphones und Tablets.

## Performance & Lighthouse

Das Portfolio erreicht einen **Lighthouse Score von 90+ auf Mobile-Geräten** durch:

- **Minimales JavaScript:** Island Architecture reduziert den JS-Footprint
- **Server-Side Rendering:** Sofortiges First Contentful Paint
- **CSS Tokens:** Kein Framework-Bloat, handoptimierte Styles
- **Lazy Loading:** Bilder werden erst bei Bedarf geladen und sind optimiert

## Security & Automatisierte Scans

Bei jedem Pull Request laufen automatisierte Tests und Security-Scans (Semgrep, Trivy). Diese müssen erfolgreich sein, bevor Code gemerged werden kann.

## Gelerntes & Herausforderungen

**Astro & Island Architecture:** Entscheidung treffen, welche Komponenten JavaScript benötigen und welche als statisches HTML ausreichen. Vue-Islands nur dort einsetzen, wo echte Interaktivität nötig ist.

**TypeScript & Type-Safety:** Strikte Typisierung hilft, Fehler früh zu erkennen. Besonders bei strukturierten Inhalten (Career, Projects) zahlt sich das aus.

**HTML, CSS & Performance:** Handoptimierte Styles statt Framework-Bloat. CSS Custom Properties für Theme-Switching. Responsive Design ohne zusätzliche Libraries.

**DevSecOps-Integration:** Automatisierte Security-Scans direkt in den Entwicklungsprozess integrieren. Tests und Scans müssen laufen, bevor Code live geht.

**Linux Hosting & Datenschutz:** DSG-konformes Hosting in der Schweiz. Keine Tracking-Cookies, keine Datenübermittlung in Drittstaaten.

**Server-Side Rendering:** Verstehen, wie SSR funktioniert und wann es sinnvoller ist als Client-Side Rendering. Rate Limiting und Security auf dem Server, nicht im Browser.

## Projektstand & Ausblick

Das Portfolio ist funktional und produktiv im Einsatz. Core-Features wie Mehrsprachigkeit, Theme-Switching, Kontaktformular und Security-Scans sind implementiert und getestet.

Dieses Projekt ist ein kontinuierlicher Lernprozess. Einige Bereiche sind bewusst einfach gehalten oder werden noch erweitert.

## Fazit

Dieses Portfolio verbindet moderne Web-Development-Praktiken mit Security-Best-Practices. Von Server-Side Rendering über automatisierte Security-Scans bis hin zu DSG-Konformität wurde jedes Feature praktisch implementiert und jedes Problem hands-on gelöst.

Das Projekt zeigt, dass Performance und Security keine Gegensätze sind und dass moderne Frameworks wie Astro es ermöglichen, beides mit minimalem Overhead zu erreichen. Der kontinuierliche Entwicklungsprozess spiegelt wider, dass gute Software nie wirklich "fertig" ist.
