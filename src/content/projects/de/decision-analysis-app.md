---
title: "Dezizio – Entscheidungsanalyse"
description: "Fullstack-Webanwendung für strukturierte Entscheidungen mittels gewichteter Nutzwertanalyse."
date: "2026-02"
lang: "de"
tags: ["Nuxt", "TypeScript", "PostgreSQL", "Prisma", "Docker", "DevSecOps"]
cover: "../images/decision-analysis-app/cover.png"
url: "https://dezizio.lucaknobel.ch/de"
---

# Projekt in Kürze

Dezizio ist eine Fullstack-Webanwendung zur Durchführung gewichteter Nutzwertanalysen. Sie entstand als eigener Projektvorschlag im Rahmen meiner Weiterbildung zum dipl. Informatiker HF und wurde von der Konzeption bis zum Deployment vollständig umgesetzt.

Benutzer können Kriterien definieren und gewichten, verschiedene Alternativen bewerten und daraus automatisch eine Rangfolge berechnen lassen. Technisch lag der Fokus auf einer klaren Architektur, sicherer Datenverarbeitung, automatisierten Tests und einem reproduzierbaren Deployment.

- [Live-Anwendung](https://dezizio.lucaknobel.ch/de)
- [Demo & Anleitung](https://dezizio.lucaknobel.ch/de/demo)

# Entscheidungen systematisch vergleichen

Bei Entscheidungen mit mehreren Einflussfaktoren sind die einzelnen Optionen oft nur schwer direkt vergleichbar. Dezizio bildet solche Entscheidungen mit einer gewichteten Nutzwertanalyse ab.

Dazu werden Kriterien definiert und entsprechend ihrer Bedeutung gewichtet. Anschliessend werden die Alternativen pro Kriterium bewertet. Aus diesen Angaben berechnet die Anwendung die gewichteten Gesamtscores und erstellt eine Rangfolge.

Die Anwendung nimmt die eigentliche Entscheidung nicht ab. Sie macht jedoch Prioritäten und Bewertungen explizit und schafft dadurch eine nachvollziehbare Entscheidungsgrundlage.

# Technische Umsetzung

Dezizio wurde mit Nuxt 4 und TypeScript als Fullstack-Anwendung entwickelt. Nuxt übernimmt sowohl die Vue-basierte Benutzeroberfläche als auch die serverseitige API und ermöglicht damit eine gemeinsame Codebasis für Client und Server.

Die Daten werden in PostgreSQL gespeichert und über Prisma ORM verwaltet. Das relationale Modell bildet Benutzer, Analysen, Kriterien, Alternativen und deren Bewertungen ab. Berechnete Werte wie Gesamtscores und Rangfolgen werden nicht redundant gespeichert, sondern bei Bedarf aus den vorhandenen Daten ermittelt.

Im Backend sind HTTP-Verarbeitung, Geschäftslogik und Infrastruktur voneinander getrennt. API-Endpunkte validieren Requests und delegieren die Verarbeitung an Services. Technische Abhängigkeiten wie der Datenbankzugriff werden über definierte Schnittstellen gekapselt. Dadurch bleibt die fachliche Logik weitgehend unabhängig von HTTP und Prisma und kann isoliert getestet werden.

# Security und Qualitätssicherung

Sicherheitsaspekte wurden bereits bei Architektur und Implementierung berücksichtigt. Eingehende Daten werden serverseitig mit Zod validiert, Passwörter mit bcrypt gehasht und die Authentifizierung erfolgt über sichere, serverseitig verwaltete Sessions.

Ergänzend kommen unter anderem sichere Cookie-Einstellungen, HTTPS, Content Security Policy, Rate Limiting und parametrisierte Datenbankzugriffe zum Einsatz. Die PostgreSQL-Datenbank ist nicht direkt aus dem Internet erreichbar.

Für die Qualitätssicherung wurden insgesamt 155 automatisierte Tests umgesetzt: 147 Unit-Tests und 8 Integrationstests. Sie prüfen unter anderem Geschäftslogik, Validierung, Authentifizierung und Fehlerfälle.

Ein Integrationstest bildet den vollständigen Kernprozess der Anwendung ab – vom Erstellen einer Analyse über Kriterien, Alternativen und Bewertungen bis zur Berechnung des Ergebnisses und der Überprüfung der gespeicherten Daten.

# CI/CD und Deployment

Die Anwendung wird als Docker-Container betrieben. Änderungen durchlaufen über GitHub Actions automatisierte Tests, Linting, Type-Checking und verschiedene Sicherheitsprüfungen.

Mit Semgrep wird der Quellcode statisch analysiert, während Trivy unter anderem Abhängigkeiten, Container und Konfigurationen auf bekannte Schwachstellen und Fehlkonfigurationen prüft.

Nach erfolgreichen Prüfungen wird ein versioniertes Container-Image gebaut und für das Deployment verwendet. Datenbankänderungen werden über versionierte Prisma-Migrationen verwaltet. Dadurch bleibt der Weg vom Quellcode bis zur laufenden Anwendung reproduzierbar.

# Erkenntnisse

Die eigentliche Berechnung einer Nutzwertanalyse ist vergleichsweise überschaubar. Die interessantere Herausforderung bestand darin, daraus eine vollständige Webanwendung mit sauberer Datenhaltung, Authentifizierung, Tests, Security und automatisiertem Deployment zu entwickeln.

Besonders hilfreich war die Trennung der Geschäftslogik von HTTP- und Infrastrukturdetails. Sie vereinfachte nicht nur die Weiterentwicklung, sondern ermöglichte auch gezielte Unit- und Integrationstests.

Rückblickend wurde der technische Umfang für eine Praxisarbeit teilweise grösser als notwendig. Gerade die zusätzliche Auseinandersetzung mit Architektur, Application Security, Testing, Docker und CI/CD war jedoch der wertvollste Teil des Projekts.
