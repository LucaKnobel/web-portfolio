---
title: "Dezizio – Decision Analysis"
description: "Full-stack web application for structured decision-making using weighted scoring."
date: "2026-02"
lang: "en"
tags: ["Nuxt", "TypeScript", "PostgreSQL", "Prisma", "Docker", "DevSecOps"]
cover: "../images/decision-analysis-app/cover.png"
url: "https://dezizio.lucaknobel.ch/en"
---

# Project at a Glance

Dezizio is a full-stack web application for conducting weighted decision analyses. It was developed as an individual project proposal during my Advanced Federal Diploma studies in Computer Science and implemented from initial concept through to deployment.

Users can define and weight criteria, evaluate different alternatives, and automatically calculate a ranking based on the results. From a technical perspective, the project focused on clean architecture, secure data processing, automated testing, and reproducible deployment.

- [Live Application](https://dezizio.lucaknobel.ch/en)
- [Demo & Guide](https://dezizio.lucaknobel.ch/en/demo)

# Comparing Decisions Systematically

When decisions involve multiple factors, the available options can be difficult to compare directly. Dezizio addresses this by applying a weighted scoring model.

Criteria are defined and weighted according to their importance. Each alternative is then evaluated against these criteria. Based on these inputs, the application calculates weighted overall scores and generates a ranking.

The application does not make the decision itself. Instead, it makes priorities and evaluations explicit, providing a transparent and traceable basis for decision-making.

# Technical Implementation

Dezizio was developed as a full-stack application using Nuxt 4 and TypeScript. Nuxt provides both the Vue-based user interface and the server-side API, allowing the client and server to share a common codebase.

Data is stored in PostgreSQL and managed through Prisma ORM. The relational model represents users, analyses, criteria, alternatives, and their ratings. Derived values such as overall scores and rankings are calculated when needed rather than stored redundantly.

The backend separates HTTP handling, business logic, and infrastructure concerns. API endpoints validate requests and delegate processing to services, while technical dependencies such as database access are encapsulated behind defined interfaces. This keeps the business logic largely independent of HTTP and Prisma and allows it to be tested in isolation.

# Security and Quality Assurance

Security was considered throughout the architecture and implementation. Incoming data is validated server-side using Zod, passwords are hashed with bcrypt, and authentication is handled through secure server-managed sessions.

Additional measures include secure cookie settings, HTTPS, a Content Security Policy, rate limiting, and parameterized database access. The PostgreSQL database is not directly accessible from the internet.

A total of 155 automated tests were implemented for quality assurance: 147 unit tests and 8 integration tests. They cover areas such as business logic, validation, authentication, and error handling.

One integration test covers the application's complete core workflow, from creating an analysis and defining criteria, alternatives, and ratings to calculating the result and verifying the persisted data.

# CI/CD and Deployment

The application runs as a Docker container. Changes pass through automated tests, linting, type checking, and several security checks using GitHub Actions.

Semgrep is used for static code analysis, while Trivy checks dependencies, containers, and configurations for known vulnerabilities and misconfigurations.

After successful checks, a versioned container image is built and used for deployment. Database changes are managed through versioned Prisma migrations, keeping the process from source code to the running application reproducible.

# Key Learnings

The calculation behind a weighted scoring model is relatively straightforward. The more interesting challenge was turning it into a complete web application with structured data persistence, authentication, testing, security, and automated deployment.

Separating business logic from HTTP and infrastructure concerns proved particularly valuable. It simplified further development while also enabling focused unit and integration testing.

In retrospect, the technical scope became larger than strictly necessary for the original project. However, the additional work on architecture, application security, testing, Docker, and CI/CD ultimately became the most valuable part of the project.
