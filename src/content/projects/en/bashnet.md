---
title: "Semantic Bash Knowledge Management Software"
description: "A CLI application for structured knowledge management and context-aware search of Bash concepts using a semantic network."
date: "2025-07"
lang: "en"
tags: ["Python", "UML", "Knowledge Graphs", "Pytest", "CLI"]
cover: "../images/bashnet/cover.png"
url: "https://github.com/LucaKnobel/bashnet-public"
---

# Project at a Glance

This project was developed as part of the Software Engineering coursework in my continuing education program in Computer Science (HF). The goal was to develop a prototype for structuring, storing, and searching knowledge using a semantic network.

As a concrete use case, I developed a CLI application for managing knowledge related to Bash, command-line tools, and scripting concepts. Information is modeled as interconnected nodes and can be queried using different search mechanisms.

In addition to importing structured knowledge data, I implemented a simple search for individual terms as well as a deep search that takes typed relationships between stored concepts into account. The resulting knowledge network can also be visualized interactively.

# Technical Implementation

The application was developed in Python and follows a modular structure. The semantic network is based on a directed graph with different node types and typed relationships. The knowledge base is built from structured JSON files and can subsequently be stored as a complete network and loaded again.

A central feature is the deep search. While the simple search directly retrieves an individual term, the deep search also considers its relationships to other nodes. Depending on the type of node found, the application retrieves related commands, options, or concepts, for example. If no exact match is found, a fallback mechanism suggests relevant alternatives.

![Activity diagram for the deep search process](../images/bashnet/activity-diagram.png)

The application separates CLI interaction, the graph model, data import and export, and visualization into distinct areas of responsibility. The main components and their relationships are shown in the following class diagram.

![Class diagram](../images/bashnet/class-diagram.png)

The semantic network can additionally be rendered as an interactive graph in the browser using PyVis. This makes it possible to explore the stored concepts and their relationships visually in addition to querying them through the CLI.

# Quality Assurance

The application's core functionality was covered by automated unit tests using `pytest`. A total of 12 tests were implemented for key functionality such as data import, simple and deep search, and the handling of different node types and relationships.

The CLI output and interactive visualization were additionally verified manually. This allowed both the underlying logic and the user-visible results to be tested.

# Key Learnings

The project gave me practical experience in modeling and processing graph-based data structures. A particularly interesting aspect was exploring how information can be stored not only hierarchically, but also connected through typed relationships and searched based on its context.

At the same time, I was able to deepen my knowledge of Python, object-oriented software development, and automated testing. Structuring the application into clearly separated areas of responsibility also demonstrated in practice how a modular design can improve testability and make an application easier to extend.

# Detailed Documentation

A comprehensive technical documentation is available for this project, including further details on its design, architecture, implementation, and quality assurance.

If you are interested, I would be happy to provide the complete German-language documentation upon request. Please contact me via the [contact form](/en/contact).
