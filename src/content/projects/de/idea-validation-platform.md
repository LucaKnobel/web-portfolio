---
title: "Evidara – Validierung von Geschäftsideen"
description: "Konzeption und Entwicklung einer Fullstack-Webanwendung zur strukturierten und evidenzbasierten Validierung von Geschäftsideen."
date: "2026-07"
lang: "de"
tags:
  [
    "Nuxt",
    "TypeScript",
    "Clean Architecture",
    "DevSecOps",
    "Docker",
    "System Design",
  ]
cover: "../images/idea-validation-platform/cover.png"
url: "https://github.com/LucaKnobel/idea-validation-platform"
---

# Projekt in Kürze

Evidara entstand im Rahmen meiner Diplomarbeit zum dipl. Informatiker HF mit Schwerpunkt Application Security. Ziel war die Konzeption und Entwicklung einer Webanwendung, mit der Geschäftsideen frühzeitig, strukturiert und evidenzbasiert validiert werden können.

Ausgangspunkt der Arbeit war die Forschungsfrage, welche Anforderungen, Strukturen und technologischen Konzepte erforderlich sind, um digitale Geschäftsideen systematisch und sicher zu validieren.

Dafür entwickelte ich zunächst ein fachliches Validierungsmodell, das den Weg von einer Geschäftsidee über Annahmen und überprüfbare Hypothesen bis zu Experimenten und deren Ergebnissen strukturiert. Auf dieser Grundlage wurden die Anforderungen an die Plattform abgeleitet und schrittweise in eine technische Systemkonzeption und schliesslich in einen funktionsfähigen Prototyp überführt.

> <a href="https://evidara.app/de" target="_blank" rel="noopener noreferrer">Evidara ausprobieren</a>

> <a href="https://evidara.app/de/how-it-works" target="_blank" rel="noopener noreferrer">Funktionsweise von Evidara</a>

> <a href="https://evidara.app/de/documentation" target="_blank" rel="noopener noreferrer">Erweiterte Dokumentation von Evidara</a>

# Von der Forschungsfrage zur Anwendung

Die Diplomarbeit folgte einem schrittweisen Vorgehen von der fachlichen Problemstellung bis zur technischen Umsetzung.

Nach der Analyse bestehender Ansätze entstand zunächst ein Modell zur strukturierten Validierung von Geschäftsideen. Darauf aufbauend wurden User Journeys, Use Cases sowie funktionale und nicht-funktionale Anforderungen erarbeitet. Diese bildeten die Grundlage für die anschliessende Systemkonzeption mit Softwarearchitektur, Datenmodell, Sicherheitskonzept und technologischen Entscheidungen.

Damit entstand eine nachvollziehbare Verbindung zwischen fachlichem Modell, Anforderungen, Architektur, Implementierung und abschliessender Verifikation.

# Architektur und Umsetzung

Evidara wurde als Fullstack-Webanwendung mit Nuxt 4 und TypeScript entwickelt. Für die persistente Datenhaltung kommen PostgreSQL und Prisma zum Einsatz.

Die Softwarearchitektur orientiert sich an den Prinzipien der Clean Architecture. Fachliche Modelle und Use Cases bilden den Kern der Anwendung und werden von konkreten Frameworks und Infrastrukturkomponenten getrennt. Technische Abhängigkeiten werden über definierte Interfaces abstrahiert und mittels Dependency Injection eingebunden.

Dadurch bleibt die zentrale Geschäftslogik weitgehend unabhängig von Datenbank, Authentifizierung und anderen technischen Details und kann isoliert getestet werden.

Die Anwendung bildet den entwickelten Validierungsprozess digital ab. Benutzer können Geschäftsideen strukturieren, Hypothesen formulieren, Metriken und Schwellenwerte festlegen, Experimente planen und die gewonnenen Ergebnisse dokumentieren. Auf Basis dieser Evidenz können Annahmen bewertet und Geschäftsideen iterativ weiterentwickelt oder angepasst werden.

# Sicherheit und Qualitätssicherung

Security wurde bereits während der Systemkonzeption berücksichtigt und als Bestandteil der Architektur behandelt. Dazu gehören unter anderem serverseitige Authentifizierung und Autorisierung, sichere Session-Verwaltung, konsequente Eingabevalidierung sowie Schutzmassnahmen gegen typische Web-Schwachstellen.

Die Qualitätssicherung erfolgte über automatisierte Unit- und Integrationstests sowie ergänzende statische Code- und Sicherheitsanalysen. Die Tests wurden auf die zuvor definierten Anforderungen zurückgeführt, sodass sich die fachlichen Anforderungen bis zur technischen Verifikation nachvollziehen lassen.

Die Anwendung wird containerisiert mit Docker betrieben und über eine automatisierte CI/CD-Pipeline gebaut, geprüft und bereitgestellt.

# Erkenntnisse

Die Diplomarbeit umfasste wesentlich mehr als die eigentliche Implementierung einer Webanwendung. Besonders wertvoll war der vollständige Weg von einer offenen Problemstellung über Modellbildung und Requirements Engineering bis zu Architektur, Implementierung und Qualitätssicherung.

Die praktische Umsetzung der Clean-Architecture-Prinzipien zeigte mir insbesondere, welchen Einfluss eine konsequente Trennung von Fachlogik und Infrastruktur auf Testbarkeit, Wartbarkeit und Erweiterbarkeit einer Anwendung hat.

Gleichzeitig war die Verbindung zwischen fachlicher Konzeption und Softwareentwicklung ein zentraler Bestandteil der Arbeit: Die Anwendung entstand nicht aus einzelnen Features, sondern wurde schrittweise aus dem zuvor entwickelten Validierungsmodell und den daraus abgeleiteten Anforderungen aufgebaut.

# Diplomarbeit

Die vollständige Diplomarbeit beschreibt das entwickelte Validierungsmodell sowie die Anforderungsanalyse, Systemkonzeption, Implementierung und Qualitätssicherung von Evidara im Detail.

Bei Interesse an der vollständigen Diplomarbeit können Sie mich gerne über das [Kontaktformular](/de/contact) kontaktieren. Gerne stelle ich Ihnen die Arbeit auf Anfrage zur Verfügung.
