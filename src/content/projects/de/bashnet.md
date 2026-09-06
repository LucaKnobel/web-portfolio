---
title: "Semantische Bash-Wissensverwaltungssoftware"
description: "Eine CLI-Anwendung zur strukturierten Verwaltung und kontextbezogenen Suche von Bash-Wissen mithilfe eines semantischen Netzwerks."
date: "2025-07"
lang: "de"
tags: ["Python", "UML", "Knowledge Graphs", "Pytest", "CLI"]
cover: "../images/bashnet/cover.png"
url: "https://github.com/LucaKnobel/bashnet-public"
---

# Projekt in Kürze

Dieses Projekt entstand im Rahmen des Software-Engineering-Unterrichts meiner Weiterbildung zum dipl. Informatiker HF. Ziel war die Entwicklung eines Prototyps zur strukturierten Speicherung und Suche von Wissen mithilfe eines semantischen Netzwerks.

Als konkreten Anwendungsfall entwickelte ich eine CLI-Anwendung zur Verwaltung von Wissen rund um Bash, Kommandozeilenbefehle und Scripting-Konzepte. Informationen werden als miteinander verknüpfte Knoten modelliert und können über unterschiedliche Suchmechanismen abgefragt werden.

Neben dem Import strukturierter Wissensdaten implementierte ich eine einfache Suche nach einzelnen Begriffen sowie eine vertiefte Suche, welche typisierte Beziehungen zwischen den gespeicherten Konzepten berücksichtigt. Das entstandene Wissensnetz kann zusätzlich interaktiv visualisiert werden.

# Technische Umsetzung

Die Anwendung wurde mit Python entwickelt und modular aufgebaut. Das semantische Netzwerk basiert auf einem gerichteten Graphen mit unterschiedlichen Knotentypen und typisierten Beziehungen. Die Wissensbasis wird aus strukturierten JSON-Dateien aufgebaut und kann anschliessend als vollständiges Netzwerk gespeichert und erneut geladen werden.

Eine zentrale Funktion ist die vertiefte Suche. Während die einfache Suche einen einzelnen Begriff direkt ermittelt, berücksichtigt die Deep Search dessen Beziehungen zu weiteren Knoten. Abhängig vom Typ eines gefundenen Knotens werden beispielsweise zugehörige Befehle, Optionen oder verwandte Konzepte ermittelt. Wird kein exakter Treffer gefunden, schlägt ein Fallback-Mechanismus relevante Alternativen vor.

![Aktivitätsdiagramm für den Deep-Search-Prozess](../images/bashnet/activity-diagram.png)

Die Anwendung trennt CLI-Interaktion, Graphmodell, Datenimport und -export sowie Visualisierung in unterschiedliche Verantwortungsbereiche. Die wichtigsten Komponenten und ihre Beziehungen sind im folgenden Klassendiagramm dargestellt.

![Klassendiagramm](../images/bashnet/class-diagram.png)

Das semantische Netzwerk kann zusätzlich mit PyVis als interaktiver Graph im Browser dargestellt werden. Dadurch lassen sich die gespeicherten Konzepte und ihre Beziehungen nicht nur über die CLI abfragen, sondern auch visuell untersuchen.

# Qualitätssicherung

Die Kernfunktionen der Anwendung wurden mit `pytest` durch automatisierte Unit-Tests abgesichert. Insgesamt entstanden 12 Tests für zentrale Funktionen wie den Datenimport, die einfache und vertiefte Suche sowie den Umgang mit unterschiedlichen Knotentypen und Relationen.

Die CLI-Ausgabe und die interaktive Visualisierung wurden ergänzend manuell geprüft. Dadurch wurden sowohl die zugrunde liegende Logik als auch die für Benutzer sichtbaren Ergebnisse getestet.

# Erkenntnisse

Das Projekt gab mir einen praktischen Einstieg in die Modellierung und Verarbeitung graphbasierter Datenstrukturen. Besonders interessant war die Frage, wie Informationen nicht nur hierarchisch gespeichert, sondern über typisierte Beziehungen miteinander verknüpft und kontextbezogen durchsucht werden können.

Gleichzeitig konnte ich meine Kenntnisse in Python, objektorientierter Softwareentwicklung und automatisiertem Testing vertiefen. Die Aufteilung der Anwendung in klar abgegrenzte Verantwortungsbereiche zeigte mir zudem praktisch, wie eine modulare Struktur die Testbarkeit und Weiterentwicklung einer Anwendung erleichtert.

# Ausführliche Dokumentation

Zu diesem Projekt existiert eine ausführliche technische Dokumentation mit weiteren Informationen zu Konzeption, Architektur, Implementierung und Qualitätssicherung.

Bei Interesse stelle ich die vollständige Dokumentation auf Anfrage gerne zur Verfügung. Kontaktieren Sie mich dazu über das [Kontaktformular](/de/contact).
