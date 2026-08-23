---
title: "Self-Hosting mit Coolify"
description: "Aufbau und Absicherung einer eigenen containerbasierten Hosting-Umgebung auf einem VPS für persönliche und schulische Webprojekte."
date: "2026-08"
lang: "de"
tags: ["Linux", "Docker", "Coolify", "nftables", "DevOps", "Security"]
cover: "../images/coolify/cover.png"
---

# Projekt in Kürze

Um persönliche und schulische Webprojekte unabhängig und kosteneffizient betreiben zu können, habe ich eine eigene Hosting-Umgebung auf einem Virtual Private Server (VPS) bei <a href="https://www.infomaniak.com" target="_blank" rel="noopener noreferrer">Infomaniak</a> aufgebaut.

Der Schwerpunkt lag dabei nicht nur auf der Installation einer Deployment-Plattform, sondern auf dem grundlegenden Aufbau und der Absicherung des Servers. Dazu gehörten die Administration des Linux-Systems, die Härtung des SSH-Zugangs, die Konfiguration einer Firewall mit nftables sowie die anschliessende Einrichtung von Coolify.

<a href="https://coolify.io" target="_blank" rel="noopener noreferrer">Coolify</a> ist eine selbst hostbare Platform-as-a-Service, mit der sich containerisierte Anwendungen, Datenbanken und weitere Services zentral bereitstellen und verwalten lassen. Ich nutze die Plattform als gemeinsame Hosting- und Deployment-Umgebung für verschiedene eigene Projekte.

# Aufbau und Betrieb

Ausgangspunkt war ein eigener Linux-VPS, den ich zunächst für den sicheren Betrieb vorbereitet habe. Der SSH-Zugang wurde gehärtet und der eingehende Netzwerkverkehr über eine restriktive nftables-Firewall auf die benötigten Dienste begrenzt.

Anschliessend wurde Coolify als Deployment-Plattform eingerichtet. Anwendungen werden containerisiert betrieben und über eigene Domains oder Subdomains bereitgestellt. Dadurch kann ich mehrere voneinander getrennte Projekte auf derselben Infrastruktur betreiben, ohne für jede Anwendung eine eigene Hosting-Umgebung zu benötigen.

Die Plattform nutze ich unter anderem für Schul-, Portfolio- und persönliche Projekte. Dadurch kann ich nicht nur Anwendungen entwickeln, sondern auch deren Deployment und Betrieb selbst umsetzen.

# Security und Infrastruktur

Beim Aufbau der Umgebung stand eine möglichst kleine Angriffsfläche im Vordergrund. Administrativer Zugriff erfolgt über einen abgesicherten SSH-Zugang, während nftables den Netzwerkzugriff auf die tatsächlich benötigten Dienste beschränkt.

Die Anwendungen werden mit Docker containerisiert betrieben und können dadurch mit ihren jeweiligen Abhängigkeiten getrennt verwaltet und reproduzierbar bereitgestellt werden.

Im Rahmen des Projekts beschäftigte ich mich neben der eigentlichen Serveradministration auch praktisch mit DNS, TLS/HTTPS, Reverse Proxying, Container-Netzwerken, persistenten Daten sowie dem sicheren Umgang mit Umgebungsvariablen und Secrets.

# Erkenntnisse

Das Projekt gab mir einen praktischen Einblick in den Betrieb von Webanwendungen ausserhalb der lokalen Entwicklungsumgebung.

Besonders wertvoll war das Zusammenspiel von Linux-Administration, Netzwerk- und SSH-Hardening, Docker, DNS und der eigentlichen Deployment-Plattform. Dadurch konnte ich besser nachvollziehen, welche Infrastruktur und Prozesse zwischen einer entwickelten Anwendung beziehungsweise einem Container-Image und einer öffentlich erreichbaren Anwendung liegen.

Die eigene Infrastruktur dient mir gleichzeitig als Lern- und Hosting-Umgebung, auf der ich neue Anwendungen, Technologien und Deployment-Ansätze praktisch ausprobieren kann.
