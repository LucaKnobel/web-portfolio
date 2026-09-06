---
title: "Food Track Blockchain"
description: "Ein verteiltes System zur transparenten Verwaltung von Lebensmittelbeständen auf Basis einer vereinfachten Blockchain-Architektur."
date: "2025-03"
lang: "de"
tags: ["gRPC", "C#", "Blockchain", "Microservices", "Protobuf"]
cover: "../images/food-track-blockchain/activity-diagram.png"
url: "https://github.com/LucaKnobel/food-track-blockchain"
---

# Projekt in Kürze

Food Track Blockchain entstand im Rahmen der Vertiefung Objektorientierte Programmierung meiner Weiterbildung zum dipl. Informatiker HF. Ziel war die Entwicklung eines verteilten Systems, das mehrere autonome Knoten miteinander verbindet und Bestandsdaten mithilfe einer vereinfachten Blockchain-Architektur nachvollziehbar speichert.

Jeder Standort wird durch eine eigene Node repräsentiert und kann neue Blöcke mit Bestandsinformationen erzeugen. Diese werden zunächst in einer zentralen FIFO-Warteschlange zwischengespeichert und anschliessend durch eine andere Node validiert. Eigene Blöcke dürfen dabei nicht selbst validiert werden. Erfolgreich geprüfte Blöcke werden dauerhaft in die Blockchain übernommen und mit ihrem jeweiligen Vorgänger verkettet.

Das Projekt wurde mit C# umgesetzt. Die Kommunikation zwischen den einzelnen Services erfolgt über gRPC und Protocol Buffers.

# Technische Umsetzung

Das System besteht aus drei zentralen Komponenten: dem Node Service, der Block Queue und dem Blockchain Service. Die einzelnen Nodes erzeugen neue Blöcke, übernehmen die Validierung fremder Blöcke und können den aktuellen Zustand der Blockchain abrufen. Die Block Queue koordiniert die noch nicht validierten Blöcke nach dem FIFO-Prinzip, während der Blockchain Service für die endgültige Speicherung und Verkettung validierter Blöcke verantwortlich ist.

![Context Map](../images/food-track-blockchain/context-map.png)

Die Kommunikation zwischen den Services wurde über gRPC-Schnittstellen realisiert. Die zugehörigen Nachrichten und Service-Verträge werden mit Protocol Buffers definiert und gemeinsam von den beteiligten Komponenten verwendet. Dadurch sind die Schnittstellen zwischen den Services explizit beschrieben und die benötigten Client- und Servertypen können aus den Protobuf-Definitionen generiert werden.

Bei der Verarbeitung wird ein neuer Block zunächst ohne endgültigen Hash in die Block Queue übertragen. Eine andere Node übernimmt den Block, validiert dessen Inhalt und übermittelt ihn bei erfolgreicher Prüfung an den Blockchain Service. Dort werden Index, Hash des vorherigen Blocks und der eigene Hash bestimmt und der Block anschliessend in die bestehende Kette aufgenommen.

# Qualitätssicherung

Die Funktionsweise des Systems wurde anhand der zentralen Abläufe überprüft. Dazu gehörten insbesondere das Erstellen und Einreihen neuer Blöcke, die FIFO-Verarbeitung, die Validierung durch unterschiedliche Nodes sowie die anschliessende Aufnahme gültiger Blöcke in die Blockchain.

Zusätzlich wurde geprüft, dass eine Node keine selbst erzeugten Blöcke validiert und dass die gespeicherten Blöcke korrekt mit ihren jeweiligen Vorgängern verkettet werden.

# Erkenntnisse

Das Projekt gab mir einen praktischen Einstieg in die Entwicklung verteilter Anwendungen und insbesondere in die Kommunikation zwischen voneinander getrennten Services. Dabei arbeitete ich erstmals mit gRPC und Protocol Buffers und setzte die definierten Service-Schnittstellen praktisch in C# um.

Besonders interessant war das Zusammenspiel der einzelnen Komponenten: Daten werden nicht innerhalb eines einzigen Prozesses verarbeitet, sondern durchlaufen mehrere Services mit unterschiedlichen Verantwortlichkeiten. Dadurch konnte ich praktische Erfahrungen mit Servicegrenzen, asynchroner Verarbeitung und der Koordination verteilter Komponenten sammeln.

Gleichzeitig setzte ich mich mit grundlegenden Konzepten einer Blockchain auseinander, insbesondere mit der Verkettung von Blöcken über kryptografische Hashes und der Validierung durch andere Teilnehmer des Systems.

# Ausführliche Dokumentation

Zu diesem Projekt existiert eine ausführliche deutschsprachige Dokumentation mit weiteren Informationen zur Konzeption, Architektur, Implementierung und Verifikation sowie zusätzlichen Diagrammen und Codebeispielen.

Bei Interesse stelle ich die vollständige Dokumentation auf Anfrage gerne zur Verfügung. Kontaktieren Sie mich dazu über das [Kontaktformular](/de/contact).
