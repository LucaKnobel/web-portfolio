---
title: "Web-Portfolio"
description: "Modernes Web-Portfolio mit Astro 7 und TypeScript, entwickelt mit Fokus auf Performance, Security und wartbare Webarchitektur."
date: "2025-11"
lang: "de"
tags: ["Astro", "TypeScript", "SSR", "DevSecOps", "Nodemailer"]
cover: "../images/web-portfolio/cover.png"
url: "https://github.com/LucaKnobel/web-portfolio"
---

# Projekt in Kürze

Dieses Web-Portfolio ist nicht nur die Präsentationsplattform für meine Projekte und meinen beruflichen Werdegang, sondern gleichzeitig ein eigenes Webentwicklungsprojekt. Es wurde mit Astro 7 und TypeScript entwickelt und wird kontinuierlich weiterentwickelt.

Der technische Fokus liegt auf einer möglichst schlanken und wartbaren Architektur, hoher Performance sowie der konsequenten Berücksichtigung von Web-Security. Das Portfolio ist vollständig auf Deutsch und Englisch verfügbar und umfasst unter anderem dynamisch generierte Projektseiten, Dark und Light Mode sowie ein serverseitig verarbeitetes Kontaktformular.

Die Anwendung wird mit Node.js betrieben und über meine eigene Hosting-Infrastruktur bereitgestellt.

# Technische Umsetzung

Astro bildet die Grundlage der Anwendung und übernimmt Routing, Rendering, Layouts und die Generierung der Inhaltsseiten. Inhalte wie Projekte werden strukturiert verwaltet und daraus die jeweiligen deutsch- und englischsprachigen Seiten erzeugt.

Das Portfolio verwendet Server-Side Rendering für die serverseitig benötigten Funktionen und hält clientseitiges JavaScript bewusst möglichst gering. Interaktivität wird nur dort eingesetzt, wo sie tatsächlich benötigt wird, beispielsweise bei Navigation, Sprach- und Theme-Auswahl.

Das Kontaktformular wird vollständig serverseitig verarbeitet. Nachrichten werden über SMTP mit Nodemailer versendet und nicht dauerhaft in einer eigenen Datenbank gespeichert. Eine serverseitige Begrenzung der Anfragen reduziert zusätzlich automatisierten Missbrauch.

Für die Gestaltung verwende ich eigenes CSS mit zentralen Design-Tokens und wiederverwendbaren Komponenten anstelle eines UI-Frameworks. Responsive Design, Dark und Light Mode sowie Accessibility werden dabei direkt in den Komponenten und globalen Styles berücksichtigt.

# Security & Qualitätssicherung

Security wird sowohl bei der Architektur als auch im Entwicklungsprozess berücksichtigt. Serverseitige Verarbeitung, Eingabevalidierung, restriktive Security Header und eine Content Security Policy reduzieren die Angriffsfläche der öffentlich erreichbaren Anwendung. Secrets wie SMTP-Zugangsdaten stehen ausschliesslich serverseitig zur Verfügung und werden nicht an den Browser ausgeliefert.

Änderungen werden über eine CI-Pipeline geprüft. Dabei kommen unter anderem automatisierte Tests sowie Semgrep und Trivy für statische Codeanalyse und Security-Scans zum Einsatz. Zusätzlich wird darauf geachtet, möglichst wenige externe Abhängigkeiten und clientseitige Ressourcen einzusetzen.

Das Portfolio verzichtet auf Tracking und Analytics von Drittanbietern. Die Anwendung wird auf eigener Infrastruktur bei Infomaniak in der Schweiz betrieben.

# Erkenntnisse

Durch die kontinuierliche Weiterentwicklung des Portfolios konnte ich mich vertieft mit moderner Webarchitektur, serverseitigem Rendering, TypeScript, CSS und den Möglichkeiten von Astro auseinandersetzen. Ein wichtiger Bestandteil war dabei die Entscheidung, welche Funktionalität tatsächlich clientseitiges JavaScript benötigt und welche vollständig durch Astro und Webplattform-Standards umgesetzt werden kann.

Besonders wertvoll war ausserdem die praktische Verbindung von Softwareentwicklung und Betrieb. Neben der eigentlichen Anwendung beschäftigte ich mich mit Security Headern, Content Security Policy, SMTP, CI/CD, Containerisierung und dem Betrieb der Anwendung auf eigener Infrastruktur.

Das Projekt hat sich dadurch von einer einfachen persönlichen Website zu einer langfristig gepflegten Anwendung entwickelt, an der ich neue Ansätze in den Bereichen Webentwicklung, Security, Performance und Deployment praktisch anwenden kann.
