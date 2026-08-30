# Architecture Documentation

This document describes the overall system architecture of the web portfolio, covering both the **Frontend Architecture** based on Astro conventions and Islands Architecture, and the **Backend Architecture** based on Clean Architecture principles.

---

## High-Level Project Structure

```
src/
├── actions/             # Astro Actions (Type-safe Controllers)
├── assets/              # Static & processed media assets (Images, Icons)
├── components/          # Astro UI components & UI framework islands (Vue)
├── composables/         # Reusable client-side logic & UI state
├── content/             # Astro Content Collections (Markdown & JSON data)
├── content.config.ts    # Content Collections Schema Definitions
├── i18n/                # Internationalization dictionaries & helpers
├── layouts/             # Shared HTML document layouts
├── middleware/          # Server request pipeline middleware (CSP, Security)
├── pages/               # File-based routing (SSR HTML routes)
├── server/              # Clean Architecture Backend Core
│   ├── config/          # Domain & server configurations
│   ├── application/     # Core Business Logic & Contracts
│   └── infrastructure/  # Framework & External Adapters
└── styles/              # Design tokens & global CSS primitives
```

---

## 1. Frontend Architecture

The frontend follows official **Astro architectural patterns**, focusing on server-first rendering, zero-JS by default, and selective hydration (**Islands Architecture**).

### Key Frontend Responsibilities

- **Pages & Routing (`src/pages/`)**:
  - File-based routing providing SSR HTML pages.
  - Multi-language routing handling localized page endpoints.

- **Layouts (`src/layouts/`)**:
  - Wraps pages with common HTML document scaffolding, meta tags, and global stylesheets.

- **Components & Islands (`src/components/`)**:
  - **Astro Components (`.astro`)**: Static HTML templates rendered exclusively on the server with zero client-side JavaScript bundle overhead.
  - **UI Framework Islands (`.vue`)**: Client-side interactive components hydrated selectively using Astro directives (e.g. `client:load` or `client:idle`).

- **Content Collections (`src/content/` & `src/content.config.ts`)**:
  - Structured content management for Markdown and JSON documents.
  - Schema validation using Zod guarantees strict type safety when querying content entries across pages.

- **Internationalization (`src/i18n/`)**:
  - Dictionary-based translation utilities and locale detection helpers.

- **Composables & State (`src/composables/`)**:
  - Encapsulated reactive state logic for interactive UI islands.

---

## 2. Backend Architecture (Clean Architecture)

The backend (`src/server/` and `src/actions/`) is structured following **Clean Architecture** principles to ensure decoupling, testability, and framework independence.

### Architectural Layers

The architecture strictly enforces the **Dependency Inversion Principle (DIP)**: higher-level application logic depends on abstractions (interfaces) rather than concrete infrastructure details.

```
+-----------------------------------------------------------------------+
| Controller Layer (src/actions/)                                       |
| - Astro Actions, Input Validation, Action Error Mapping               |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
| Application Core (src/server/application/)                            |
| - Business Contracts & Interfaces (EmailSender, RateLimiter, Logger)  |
| - Custom Domain/Application Errors                                     |
| - Use Cases / Service Closures                                        |
+-----------------------------------------------------------------------+
                                  ^
                                  |
+-----------------------------------------------------------------------+
| Infrastructure Layer (src/server/infrastructure/)                     |
| - Concrete Driver Implementations (SMTP, In-Memory Caching, Pino)      |
| - Composition Root (src/server/infrastructure/composition.ts)        |
+-----------------------------------------------------------------------+
```

### Core Backend Responsibilities

1. **Controller Layer (`src/actions/`)**:
   - Acts as the entrypoint for client requests.
   - Validates incoming form input schemas, invokes application use cases, and maps application errors to typed client responses.

2. **Application Core (`src/server/application/`)**:
   - Contains pure TypeScript domain logic, custom error classes, and contract interfaces.
   - Operates without any direct dependencies on third-party frameworks, HTTP engines, or external drivers.

3. **Infrastructure Layer (`src/server/infrastructure/`)**:
   - Contains concrete technical implementations (e.g., logging adapters, rate limiters, email dispatchers).
   - Hosts the **Composition Root** (`composition.ts`), where concrete infrastructure instances are wired into application use cases via functional dependency injection (closures).

4. **Configuration (`src/server/config/`) & Environment (`astro:env`)**:
   - Centralized, type-safe configuration values validated through Astro's `astro:env` API.
