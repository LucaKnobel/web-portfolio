---
title: "Evidara – Business Idea Validation"
description: "Design and development of a full-stack web application for structured and evidence-based validation of business ideas."
date: "2026-07"
lang: "en"
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

# Project at a Glance

Evidara was developed as part of my thesis for the Advanced Federal Diploma of Higher Education in Computer Science, with a specialization in Application Security. The goal was to design and develop a web application for validating business ideas at an early stage in a structured and evidence-based way.

The thesis was based on the research question of which requirements, structures, and technological concepts are needed to systematically and securely validate digital business ideas.

To address this question, I first developed a validation model that structures the process from a business idea through assumptions and testable hypotheses to experiments and their results. Based on this model, the requirements for the platform were derived and progressively translated into a technical system design and, ultimately, a functional prototype.

> <a href="https://evidara.app/en" target="_blank" rel="noopener noreferrer">Try Evidara</a>

> <a href="https://evidara.app/en/how-it-works" target="_blank" rel="noopener noreferrer">How Evidara Works</a>

> <a href="https://evidara.app/en/documentation" target="_blank" rel="noopener noreferrer">Extended Evidara Documentation</a>

# From Research Question to Application

The thesis followed a structured process from the initial problem definition through to the technical implementation.

After analysing existing approaches, I developed a model for the structured validation of business ideas. Based on this model, I defined user journeys, use cases, as well as functional and non-functional requirements. These formed the basis for the subsequent system design, including software architecture, data model, security concept, and technology decisions.

This created a traceable connection between the domain model, requirements, architecture, implementation, and final verification.

# Architecture and Implementation

Evidara was developed as a full-stack web application using Nuxt 4 and TypeScript. PostgreSQL and Prisma are used for persistent data storage.

The software architecture follows Clean Architecture principles. Domain models and use cases form the core of the application and are separated from specific frameworks and infrastructure components. Technical dependencies are abstracted through defined interfaces and provided using dependency injection.

As a result, the core business logic remains largely independent of the database, authentication, and other technical details and can be tested in isolation.

The application translates the validation process into a digital workflow. Users can structure business ideas, formulate hypotheses, define metrics and thresholds, plan experiments, and document the resulting evidence. Based on this evidence, assumptions can be evaluated and business ideas can be iteratively refined or adapted.

# Security and Quality Assurance

Security was considered during the system design and treated as an integral part of the architecture. This includes server-side authentication and authorization, secure session management, consistent input validation, and measures to protect against common web vulnerabilities.

Quality assurance was implemented through automated unit and integration tests, complemented by static code analysis and security scanning. Tests were traced back to the previously defined requirements, providing a clear connection between functional requirements and technical verification.

The application runs in Docker containers and is built, verified, and deployed through an automated CI/CD pipeline.

# Key Learnings

The thesis involved considerably more than implementing a web application. One of the most valuable aspects was working through the complete process from an open problem and domain modelling through requirements engineering to architecture, implementation, and quality assurance.

Applying Clean Architecture principles in practice demonstrated the impact that a clear separation between business logic and infrastructure can have on testability, maintainability, and extensibility.

Another key aspect was the connection between domain design and software development. The application was not built as a collection of individual features, but was progressively derived from the validation model and the requirements based on it.

# Thesis

The full thesis describes the developed validation model as well as the requirements analysis, system design, implementation, and quality assurance of Evidara in detail.

If you are interested in reading the full thesis, feel free to contact me via the [contact form](/en/contact). I will be happy to provide a copy upon request.
