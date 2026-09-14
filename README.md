# Web Portfolio

My personal web portfolio, built with Astro 7 and TypeScript with a focus on security, performance, maintainability, and minimal client-side JavaScript.

The application presents my professional experience, education, and software projects in German and English. It also serves as an ongoing project for applying and evaluating modern web development, security, and deployment practices.

## Tech Stack

- **Astro 7** – application framework, routing, rendering, and content
- **TypeScript** – type-safe application development
- **Zod** – schema validation for content collections and form input
- **Node.js 24** – server runtime
- **Nodemailer** – SMTP-based email delivery
- **Pino** – structured, level-based server logging with secret redaction
- **CSS** – custom design system without a UI framework
- **Vitest** – unit and type-level testing
- **ESLint & Stylelint** – code and style linting
- **GitHub Actions** – CI (tests, type checks, linting, security scans) and CD (build, scan, deploy)
- **Semgrep & Trivy** – static analysis, dependency scanning, and container image scanning
- **Docker** – containerized build, published to GitHub Container Registry
- **Coolify** – self-hosted deployment platform on my own infrastructure
- **Infomaniak** – hosting infrastructure in Switzerland

## Architecture

Astro forms the foundation of the application. Pages, layouts, and most UI components are rendered using Astro, while client-side JavaScript is kept to a minimum and only used where interactivity is required.

Portfolio content such as projects, career information, education, and privacy-related content is maintained separately from the UI and provided in German and English.

Server-side functionality is primarily required for the contact form. Astro Actions provide the entry point for processing form submissions, while the underlying application logic is separated from infrastructure concerns.

The server-side code is structured around three main areas:

- **Application** – use cases, interfaces, and application-specific errors
- **Infrastructure** – SMTP email delivery, logging, rate limiting, and validation
- **Composition** – creation and wiring of concrete infrastructure dependencies

This keeps the core email workflow independent of concrete implementations such as Nodemailer or the in-memory rate limiter.

## Contact Form

The contact form is processed entirely on the server. Submitted data is validated before being passed to the application service responsible for sending the message.

Email delivery is abstracted behind an application interface and implemented using Nodemailer for production. Rate limiting is handled server-side to reduce automated abuse without requiring persistent storage of contact requests.

SMTP credentials and other secrets are restricted to the server environment and are never exposed to client-side code.

## Security

Security is considered both at runtime and throughout the development process.

The application includes measures such as:

- Content Security Policy and additional security headers
- Origin validation for relevant server requests
- Server-side input validation
- Server-side rate limiting
- Separation of secrets from client-side code
- No third-party tracking or analytics
- Structured server-side logging with automatic redaction of credentials and cookies
- Automated static analysis and security scans

Semgrep and Trivy run in CI on every change (source code, dependencies, and configuration) and Trivy scans the built container image again in the CD workflow before it is pushed, to catch issues introduced by the base image or installed packages.

## Content & Internationalization

The portfolio is fully available in German and English under dedicated language routes.

Projects and other larger content are maintained separately from the presentation layer. Project pages are generated from structured Markdown content, while reusable UI components remain independent of the actual project data.

This separation keeps translations and portfolio content maintainable without coupling them directly to individual UI components.

## Styling

The interface uses custom CSS rather than a UI framework. Global styles are divided into focused layers for design tokens, reset and base styles, reusable primitives, prose, syntax highlighting, and utilities.

Dark and light themes are implemented using CSS custom properties. The interface is responsive and designed to work without requiring a large client-side styling or component library.

## Development & Quality Assurance

Changes are checked through automated CI workflows before being merged. The project uses automated testing, type checking, linting, and security analysis to detect regressions and implementation issues early.

Tests run on Vitest and cover server-side logic (validation, rate limiting, email sending, error handling), content schemas, i18n utilities, CSP headers, colour-contrast of the design tokens, and type-level checks tying Astro components to their content collection types.

- `npm run test`: run tests in watch mode.
- `npm run test:run`: run tests once (used by CI).

Linting uses ESLint with the recommended JavaScript, TypeScript, and Astro rules, plus Stylelint for CSS and Astro styles. Generated output is excluded from ESLint.

- `npm run lint`: run both linters (also used by CI).
- `npm run lint:code`: check JavaScript, TypeScript, and Astro components.
- `npm run lint:styles`: check CSS and Astro styles.
- `npm run lint:fix`: apply available automatic fixes; review the resulting diff.
- `npm run typecheck`: run Astro's separate type checks.

VS Code recommends the ESLint extension and enables linting for Astro and TypeScript files.

The application is continuously developed and serves as both my public portfolio and a practical environment for improving my knowledge of Astro, TypeScript, web security, accessibility, performance, and software architecture.

## Deployment

The application runs on Node.js and is deployed as a container on my own hosting infrastructure at Infomaniak in Switzerland.

On every push to `main`, the CD workflow builds the production image, scans it with Trivy, and pushes it to the GitHub Container Registry tagged with the commit SHA. It then triggers a deployment on [Coolify](https://coolify.io) — the self-hosted platform documented in my [Coolify project](src/content/projects/en/coolify.md) — and polls the live site's `X-App-Version` response header until it matches the deployed commit, so a deployment only counts as successful once the new version is actually serving traffic. The `/system-info` page exposes the same version and the server start time for manual verification.

Application configuration and secrets stay outside the container image and are provided at runtime.

## License

Apache License 2.0 © 2026 Luca Knobel

See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
