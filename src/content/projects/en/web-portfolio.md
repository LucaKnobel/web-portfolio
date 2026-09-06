---
title: "Web Portfolio"
description: "Modern web portfolio built with Astro 7 and TypeScript, with a focus on performance, security, and maintainable web architecture."
date: "2025-11"
lang: "en"
tags: ["Astro", "TypeScript", "SSR", "DevSecOps", "Nodemailer"]
cover: "../images/web-portfolio/cover.png"
url: "https://github.com/LucaKnobel/web-portfolio"
---

# Project at a Glance

This web portfolio is not only a platform for presenting my projects and professional experience, but also a web development project in its own right. It was developed with Astro 7 and TypeScript and is continuously evolving.

The technical focus is on a lean and maintainable architecture, high performance, and the consistent application of web security practices. The portfolio is fully available in German and English and includes dynamically generated project pages, dark and light modes, and a server-side contact form.

The application runs on Node.js and is deployed on my own hosting infrastructure.

# Technical Implementation

Astro provides the foundation of the application and handles routing, rendering, layouts, and the generation of content pages. Content such as projects is managed in a structured format and used to generate the corresponding German and English pages.

The portfolio uses server-side rendering for functionality that requires server-side processing while deliberately keeping client-side JavaScript to a minimum. Interactivity is only added where it is actually needed, such as navigation, language selection, and theme switching.

The contact form is processed entirely on the server. Messages are sent via SMTP using Nodemailer and are not permanently stored in a dedicated database. Server-side request limiting additionally helps reduce automated abuse.

For styling, I use custom CSS with centralized design tokens and reusable components instead of a UI framework. Responsive design, dark and light modes, and accessibility are addressed directly within the components and global styles.

# Security & Quality Assurance

Security is considered both in the application architecture and throughout the development process. Server-side processing, input validation, restrictive security headers, and a Content Security Policy help reduce the attack surface of the publicly accessible application. Secrets such as SMTP credentials are available exclusively on the server and are never exposed to the browser.

Changes are verified through a CI pipeline. This includes automated tests as well as Semgrep and Trivy for static code analysis and security scanning. The project also aims to minimize unnecessary external dependencies and client-side resources.

The portfolio does not use third-party tracking or analytics. The application is hosted on my own infrastructure at Infomaniak in Switzerland.

# Key Learnings

Continuously developing the portfolio has allowed me to deepen my understanding of modern web architecture, server-side rendering, TypeScript, CSS, and Astro. An important aspect has been deciding which functionality actually requires client-side JavaScript and which can be implemented entirely using Astro and native web platform features.

Another valuable aspect has been the practical connection between software development and operations. In addition to the application itself, I worked with security headers, Content Security Policy, SMTP, CI/CD, containerization, and operating the application on my own infrastructure.

As a result, the project has evolved from a simple personal website into a long-term application where I can practically apply and explore new approaches to web development, security, performance, and deployment.
