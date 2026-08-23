---
title: "Ticket System – Support Ticketing Platform"
description: "Full-stack ticketing system built with Vue, Hono, and PostgreSQL, focusing on software architecture, security, testing, and CI/CD."
date: "2026-08"
lang: "en"
tags:
  ["Vue", "TypeScript", "Hono", "PostgreSQL", "Clean Architecture", "DevSecOps"]
cover: "../images/ticket-system/cover.png"
url: "https://github.com/LucaKnobel/ticket-system"
---

# Project at a Glance

The Ticket System was developed as part of a practical project during my Advanced Federal Diploma studies in Computer Science, with a specialization in Application Security. The goal was to implement the complete lifecycle of a modern full-stack web application – from requirements analysis and architecture to frontend, backend, database, security, testing, CI/CD, and deployment.

The functional scope was deliberately kept minimal. The application provides authentication and the core functionality required to manage support tickets. Users can create and manage their own tickets, while administrators have additional capabilities for editing, assigning, and managing ticket statuses. Features such as user registration, comments, file attachments, and notifications were intentionally left out.

The objective was not to build a feature-rich or production-ready enterprise ticketing system, but to understand and implement how the different parts of a full-stack application work together from end to end.

> <a href="https://ticket-system.lucaknobel.ch/login" target="_blank" rel="noopener noreferrer">Try the Ticket System</a>

Preconfigured accounts are available for the demo:

| Role          | Email                 | Password             |
| ------------- | --------------------- | -------------------- |
| Administrator | `admin@example.com`   | `Admin!Ticket2026#`  |
| User          | `alice@example.com`   | `TicketSystem!2026#` |
| User          | `bob@example.com`     | `TicketSystem!2026#` |
| User          | `charlie@example.com` | `TicketSystem!2026#` |

# Architecture and Implementation

The system follows a client-server architecture. The frontend was implemented as a Single Page Application using Vue 3 and TypeScript and communicates through a REST API with a separate Node.js backend based on Hono. PostgreSQL provides the central persistent data storage.

The backend follows Clean Architecture principles. HTTP handling, application logic, and technical infrastructure are separated from each other. The application layer defines its dependencies through interfaces, while concrete implementations such as Prisma repositories reside in the infrastructure layer. Dependencies are assembled centrally through a composition root.

![Ticket System component architecture](../images/ticket-system/component.png)

The project is structured as a monorepo with separate workspaces for the frontend, backend, and shared contracts. A shared package provides DTOs and Zod schemas, allowing the frontend and backend to use the same API contracts, types, and validation rules.

# Security and Quality Assurance

Authentication and authorization are enforced server-side. The application uses database-backed sessions with HttpOnly cookies, while only hashes of the session tokens are persisted. Roles and resource ownership are verified by the backend to ensure that users can only perform authorized operations on tickets.

Incoming data is validated using Zod, and passwords are hashed with Argon2. Security headers and centralized error handling provide additional safeguards.

Quality assurance is implemented across multiple levels. Unit tests verify application logic in isolation, while integration tests cover the interaction between the REST API, persistence layer, and PostgreSQL. Additional frontend tests cover key user flows.

# CI/CD and Infrastructure

The operating environment was also set up as part of the project. The application runs in containers on a self-managed Debian VPS with secured SSH access and a firewall. Docker provides the foundation for containerized operation, while Coolify manages and deploys the individual services.

GitHub Actions automates the build, test, and deployment process. Changes pass through builds, automated tests, type checking, and several security checks, including dependency auditing, static code analysis with Semgrep, and vulnerability scanning with Trivy.

When changes are merged into the main branch, the affected container images are automatically built, scanned, versioned, and published to a container registry. The deployment is then triggered through Coolify.

# Key Learnings

The main learning outcome of this project was not the complexity of the individual ticketing features, but understanding how the different parts of a complete web application work together.

By deliberately limiting the functional scope, I was able to focus more deeply on software architecture, API design, authentication, data modelling, automated testing, containerization, CI/CD, and operating the application on my own infrastructure.

Particularly valuable was experiencing the complete path from local development through frontend, backend, and database integration to automated tests, container images, and a running deployment. Hono as a backend framework and independently setting up, securing, and operating a containerized application on a VPS were also new experiences for me in this combination.

# Documentation

The complete project documentation covers requirements analysis, system design, software architecture, data modelling, implementation, security, testing, CI/CD, and infrastructure in detail.

If you are interested in reading the full documentation, feel free to contact me via the [contact form](/en/contact). I will be happy to provide a copy upon request.
