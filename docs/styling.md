# Styling & UI Architecture

This document defines how CSS and UI are structured in this project: the goals, the file
responsibilities, the decision rules, and the rationale behind them.

It is binding for all new styles. When in doubt, follow the [decision tree](#decision-rule).

---

## 1. Goals

| Goal                          | Meaning                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Low redundancy**            | Every design decision lives in exactly one place.                                                      |
| **Predictable cascade**       | No specificity fights, no ID selectors, no `!important` in normal styling.                             |
| **Theme-agnostic components** | A component never knows whether light or dark mode is active.                                          |
| **Responsive by intent**      | The responsive technique matches the actual dependency, not the newest available feature.              |
| **Modern native CSS**         | No CSS framework. Cascade layers, custom properties, `clamp()`, container queries, logical properties. |
| **Readable over clever**      | A new contributor must find the right file within seconds.                                             |

Explicit non-goal: minimising line count for its own sake. Fewer lines are a _result_ of good
separation, not the target.

### Guiding principle

> Prefer the simplest native CSS solution that expresses the actual design dependency. Centralize
> shared decisions, localize component-specific decisions, and abstract concepts rather than
> coincidental repetition.

This sentence resolves conflicts between DRY, simplicity and abstraction. When two rules in this
document appear to disagree, it wins.

---

## 2. Non-Goals / Anti-Patterns

The following are rejected by design:

- A utility class for every property (a hand-rolled Tailwind).
- A large global `components.css` — reusable UI becomes an Astro component instead (see §8).
- Deeply chained token aliases (`--space-4` → `--stack-md` → `--card-gap`).
- Component-specific tokens in the global token system (`--project-card-padding`).
- Component-scoped dark mode rules (`[data-theme="dark"] .my-card { ... }`).
- Hardcoded colours inside components.
- ID selectors for styling, `!important` in normal styling, nesting deeper than two levels.
- Applying every modern CSS feature everywhere just because it exists.
- Premature abstraction introduced solely to satisfy DRY.

### 2.1 What DRY means here

**DRY does not mean that every repeated CSS declaration must be abstracted.** It means that every
design decision has one source of truth.

| Real redundancy — abstract it   | Coincidental repetition — leave it alone      |
| ------------------------------- | --------------------------------------------- |
| The primary colour value        | Two unrelated components both using `flex`    |
| Markdown table styling          | Two components both having a `1rem` gap       |
| Content width                   | Two components both using `border-radius`     |
| The same real card UI primitive | Two layouts that happen to look similar today |

A repetition becomes a candidate for abstraction only when the same **design decision or UI
structure** exists more than once. Two independent layout decisions that may diverge later are not
redundancy.

---

## 3. File Responsibilities

```
src/styles/
├── tokens.css       Design values only. Declares the layer order.
├── reset.css        Browser normalisation. Not meant to be overridden.
├── base.css         Sensible defaults for bare HTML elements.
├── prose.css        Rendered Markdown content (Content Collections).
├── utilities.css    A small, fixed set of layout primitives.
└── prism-theme.css  Syntax highlighting.
```

```
GLOBAL
│
├── tokens.css       what things look like (values)
├── reset.css        normalisation
├── base.css         how bare HTML behaves
├── prose.css        how authored Markdown looks
├── utilities.css    reusable layout primitives
└── prism-theme.css  code highlighting
        │
        ▼
SCOPED
└── *.astro <style>  everything specific to one component
```

| File                | Contains                                                      | Must not contain                |
| ------------------- | ------------------------------------------------------------- | ------------------------------- |
| `tokens.css`        | `:root` custom properties, layer order                        | Any component selector          |
| `reset.css`         | box-sizing, margin reset, media defaults                      | Opinionated design              |
| `base.css`          | `h1`–`h6`, `a`, `p`, form fundamentals, focus, reduced motion | Class selectors, component UI   |
| `prose.css`         | Everything under `.prose`                                     | Component-specific rules        |
| `utilities.css`     | `.container`, `.stack`, `.cluster`, `.visually-hidden`        | Colours, one-off spacing        |
| Component `<style>` | Structure, layout, appearance and states of that component    | Styling for class-less Markdown |

All global stylesheets are imported once in
[`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro).

### 3.1 Global vs. component-scoped

This table is the primary orientation when adding new styles.

| Global                        | Component-scoped                  |
| ----------------------------- | --------------------------------- |
| Design tokens                 | Component structure               |
| Browser normalisation         | Component layout                  |
| Bare HTML defaults            | Component appearance              |
| Theme semantics               | Component states                  |
| Markdown / prose              | Component-specific responsiveness |
| Generic layout primitives     | Local visual detail               |
| Global accessibility defaults | Component interaction detail      |

---

## 4. Cascade Layers

The layer order is declared **once**, at the top of `tokens.css`:

```css
@layer reset, base, prose, syntax, utilities;
```

Each stylesheet then wraps its own content:

```css
/* base.css */
@layer base {
  /* ... */
}
```

> **Do not** use `@import "./base.css" layer(base);`. Vite inlines `@import` at build time via
> `postcss-import` and the `layer()` function does not survive that reliably. Wrapping the file
> content in an explicit `@layer` block makes the result independent of import order.

Resulting precedence:

```
reset < base < prose < syntax < utilities < Astro scoped styles
```

Astro scoped styles are **unlayered**. In the CSS cascade, normal unlayered author styles take
precedence over normal author styles inside layers; within the layers, the declared order decides.
That cascade behaviour — not the scoping mechanism itself — is why a component can override a
global default without inflating selector specificity.

`syntax` sits after `prose` so that `prism-theme.css` wins for highlighted code blocks. `prose.css`
must therefore exclude them:

```css
.prose :where(pre:not([class*="language-"])) {
  /* ... */
}
```

---

## 5. Design Tokens

### 5.1 Rules

1. Tokens are **values**, never components.
2. One naming scheme, one level of indirection. No alias chains.
3. Semantic names only where a project-wide meaning is genuinely stable. Otherwise use the scale
   directly.
4. Every colour used in a component **must** come from a token.

### 5.2 Three categories

**Primitive tokens** — raw scale values, used directly by components:
`--space-*`, `--text-*`, `--radius-*`, `--duration-*`, `--ease-*`

**Semantic tokens** — roles whose meaning is stable project-wide:
`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`,
`--color-primary`

**Global layout tokens** — single project-wide layout decisions:
`--content-max`, `--measure`, `--gutter`

Component-specific tokens (`--project-card-padding`, `--career-card-gap`,
`--contact-form-radius`) do **not** belong in `tokens.css`. A component consumes primitives
directly:

```css
.project-card {
  padding: var(--space-lg);
}
```

### 5.3 Typography & Spacing — fluid by default

Fluid scales replace responsive token remaps and most component media queries.

```css
:root {
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem);
  --text-xl: clamp(1.375rem, 1.2rem + 0.85vw, 1.75rem);
  --text-2xl: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  --text-3xl: clamp(2.25rem, 1.7rem + 2.5vw, 3.5rem);

  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: clamp(1.5rem, 1.2rem + 1vw, 2rem);
  --space-xl: clamp(2rem, 1.5rem + 2vw, 3rem);
  --space-2xl: clamp(3rem, 2rem + 4vw, 5rem);

  --content-max: 75rem;
  --measure: 70ch;
  --gutter: clamp(1rem, 3vw, 2rem);
}
```

Because these scale with the viewport, `tokens.css` needs **no** `@media` remaps.

### 5.4 Shape, Motion, Elevation

```css
:root {
  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-lg: 1rem;

  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

---

## 6. Dark / Light Mode

### 6.1 Principle

A component **never** references a theme. It only consumes semantic colour tokens:

```css
/* correct */
.project-card {
  background: var(--color-surface);
  color: var(--color-text);
}

/* forbidden */
.project-card {
  background: #fff;
}
[data-theme="dark"] .project-card {
  background: #121212;
}
```

### 6.2 Implementation with `light-dark()`

Both values live in one declaration, which removes the duplicated dark-theme block:

```css
:root {
  color-scheme: light dark;

  --color-bg: light-dark(#ffffff, #0a0c10);
  --color-surface: light-dark(#f6f8fa, #14171c);
  --color-surface-high: light-dark(#ffffff, #1b1f26);

  --color-text: light-dark(#1a2129, #f8f9fa);
  --color-text-muted: light-dark(#5d6b7a, #9ca8b6);

  --color-border: light-dark(rgb(20 30 40 / 15%), rgb(255 255 255 / 12%));

  --color-primary: light-dark(#4a6892, #769ac2);
}

[data-theme="light"] {
  color-scheme: light;
}
[data-theme="dark"] {
  color-scheme: dark;
}
```

Benefits: one source of truth per colour, and native form controls plus scrollbars adapt
automatically via `color-scheme`.

### 6.3 Derived states

Hover and active variants are computed, not hand-maintained:

```css
--color-primary-hover: color-mix(
  in oklab,
  var(--color-primary) 85%,
  var(--color-text)
);
```

### 6.4 Remaining theme block

`light-dark()` only accepts colour values. Non-colour tokens (gradients, glass blur, shadow
colours) keep a `[data-theme="dark"]` override block. Explicit theme overrides should be limited to
values that cannot be expressed cleanly through the shared semantic colour-token system — the block
is judged by responsibility, not by line count.

### 6.5 Theme selection

The theme is resolved server-side from the `theme` cookie in
[`BaseLayout.astro`](../src/layouts/BaseLayout.astro) and written to `<html data-theme="...">`.
This avoids a flash of unstyled theme. Without a cookie, `color-scheme: light dark` makes the page
follow the operating system preference.

---

## 7. Responsiveness

### 7.1 Decision rule

Prefer intrinsic layout, fluid values and container queries where they naturally solve the problem.
Use media queries whenever behaviour genuinely depends on the viewport, input capabilities, user
preferences or another media feature.

| The dependency is…                                                                                 | Tool                        |
| -------------------------------------------------------------------------------------------------- | --------------------------- |
| A value that should scale continuously                                                             | `clamp()`, `min()`, `max()` |
| Layout the browser can derive from available space                                                 | Grid/Flex intrinsic sizing  |
| The space available inside a component's container                                                 | Container query             |
| The viewport or a media feature (`prefers-reduced-motion`, `prefers-contrast`, `hover`, `pointer`) | Media query                 |

No technique is preferred merely because it is newer. Container queries are not "better media
queries" — they model a different dependency. Use the simplest CSS solution that correctly expresses
the actual dependency.

### 7.2 Intrinsic grids

Let the grid compute the column count instead of enumerating breakpoints:

```css
.project-grid {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
}
```

Choose `auto-fill` or `auto-fit` according to the intended behaviour of empty tracks:

- **`auto-fill`** keeps empty tracks. Cards retain their intended width when only a few items
  exist.
- **`auto-fit`** collapses empty tracks. Existing items expand to fill the available space.

For [`ProjectSection`](../src/components/ProjectSection.astro), `auto-fill` is recommended because
cards should keep their width with few projects. That is a component decision, not a global rule.

### 7.3 Container queries

A card should react to its own width, not the viewport:

```css
.card-list {
  container-type: inline-size;
}

.career-card {
  display: grid;
  gap: var(--space-md);
}

@container (width >= 35rem) {
  .career-card {
    grid-template-columns: 10rem 1fr;
  }
}
```

The same component then works in a sidebar, in a three-column grid, and on a detail page without
knowing anything about the viewport.

A threshold like `35rem` may live directly in the component when it describes only that component's
layout switch. Do not invent global `--breakpoint-*` tokens unless a genuinely global breakpoint
exists.

### 7.4 Logical properties

Use `margin-inline`, `padding-block`, `border-inline-start`, `inset` instead of physical
directions. The site is bilingual (DE/EN) and logical properties keep it direction-safe.

---

## 8. Components

### 8.1 Scoped styles are the default

Most component CSS belongs in the component's own `<style>` block. That is good CSS and should not
be forced into a global file.

```astro
<style>
  .project-card {
    display: grid;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }
</style>
```

Prefer component classes for component structure and styling. Bare element selectors are acceptable
when the element is structurally owned by the component and the rule is intentionally local — there
is no need to invent a class for every internal element. Class-less rendered content such as
Markdown belongs in `prose.css`.

### 8.2 When duplication appears

If the same visual structure appears in three or more components, do **not** immediately create a
global `.card` class. First ask:

> Are these conceptually the same UI primitive?

If yes, extract an **Astro component** (`src/components/ui/Card.astro`) that owns its own markup,
its own API, and its own scoped styles. Use Astro as the component model — not CSS.

```astro
<Card>…</Card>   <!-- preferred -->
<div class="card">…</div>   <!-- avoid -->
```

### 8.3 Variants

Use data attributes rather than variant classes. They keep specificity flat and read clearly in
DevTools:

```css
.btn[data-variant="primary"] {
  /* ... */
}
.btn[data-variant="ghost"] {
  /* ... */
}
```

---

## 9. Base Layer & Accessibility

Global defaults use `:where()` so they carry **zero specificity** and can be overridden by any
component without escalation:

```css
@layer base {
  :where(h1, h2, h3, h4, h5, h6) {
    line-height: 1.15;
    text-wrap: balance;
  }
  :where(p, li) {
    text-wrap: pretty;
  }
  :where(button, input, textarea, select) {
    font: inherit;
  }
}
```

`reset.css` deliberately does **not** use `:where()` — a reset is meant to hold.

### 9.1 One focus strategy

Defined once, globally:

```css
:where(a, button, input, textarea, select, summary, [tabindex]):focus-visible {
  outline: var(--focus-ring-width) solid var(--color-primary);
  outline-offset: var(--focus-ring-offset);
}
```

`:focus-visible` avoids showing focus rings on mouse click. Components must not define their own
focus rings.

### 9.2 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`!important` is prohibited for normal component and layout styling. Deliberate global accessibility
overrides may use it where necessary and must be documented — this block is the sanctioned example.

### 9.3 Touch targets

Interactive controls intended as touch targets should provide an adequate target size (≥ 44px).
Enforce this in the relevant UI component rather than globally on every interactive HTML element —
a global `min-height` would also affect inline links inside body copy, which is not intended.

### 9.4 Form responsibilities

`base.css` contains only browser- and project-wide form fundamentals:

- `font: inherit`
- basic `color`
- sensible `textarea` behaviour (e.g. `resize`, `field-sizing`)
- the global focus strategy

The concrete UI of a form field — border, background, padding, error state, field layout — stays
component-scoped. If the same field UI appears repeatedly, evaluate a reusable Astro component such
as `Field.astro` or `Input.astro`. Do not build a global form component library up front.

---

## 10. Prose — Rendered Markdown

Markdown from Content Collections produces class-less HTML, so it can only be styled through
element selectors under a wrapper. All such rules live in `prose.css` and nowhere else.

Affected pages: project details, privacy policy, imprint.

### 10.1 Spacing via the owl selector

```css
.prose > * + * {
  margin-block-start: var(--flow, var(--space-md));
}
```

This replaces every individual `margin-bottom` on `p`, `li`, `ul`, `pre`, `table` and `hr`, and
removes the "last element has trailing space" problem.

### 10.2 Readable measure with breakout

Body text stays narrow; tables, images and code blocks may break out:

```css
.prose {
  display: grid;
  grid-template-columns:
    [full-start] minmax(0, 1fr)
    [content-start] min(100%, var(--measure)) [content-end]
    minmax(0, 1fr) [full-end];
}
.prose > * {
  grid-column: content;
}
.prose > :where(figure, table, pre, img) {
  grid-column: full;
}
```

No negative margins required.

Review which elements should actually break out. Wide tables and figures usually should; a short
code block may read better constrained to the measure. Choose the rule based on the real content.

### 10.3 Tables scroll, they do not squeeze

```css
.prose :where(table) {
  display: block;
  overflow-x: auto;
  width: 100%;
}
```

Percentage column widths are fragile and are not used.

### 10.4 Why global, not scoped

Astro scoped styles apply to elements in the component's own template. Content rendered through
`<Content />` is not part of that template, so relying on scoped styles for Markdown is fragile.
A global `prose.css` removes the ambiguity entirely.

---

## 11. Utilities

A deliberately small, closed set. A new utility is added only if it

1. is semantically independent of any concrete component,
2. is genuinely needed more than once,
3. improves readability, and
4. does not push the project towards a self-built utility framework.

```css
.container {
  width: min(100% - 2 * var(--gutter), var(--content-max));
  margin-inline: auto;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--flow, var(--space-md));
}

.cluster {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
```

Spacing is tuned per instance through the `--flow` custom property rather than through modifier
classes:

```astro
<section class="container stack" style="--flow: var(--space-xl)">
```

---

## 12. Decision Rule

Apply to **every** new CSS rule, in this order:

```
                    New CSS rule
                          │
                          ▼
                Is it a design value?
                    │           │
                   yes         no
                    │           │
              tokens.css        ▼
                        Bare HTML behaviour?
                              │       │
                             yes     no
                              │       │
                          base.css    ▼
                              Rendered Markdown?
                                  │       │
                                 yes     no
                                  │       │
                              prose.css   ▼
                                  Generic layout primitive?
                                      │       │
                                     yes     no
                                      │       │
                            utilities.css     ▼
                                        Component scoped style
```

Second rule:

> If the same UI structure is implemented more than twice, evaluate extracting a reusable **Astro
> component** first — not automatically a global CSS class.

---

## 13. Approved Modern CSS Features

| Feature                         | Use for                                          |
| ------------------------------- | ------------------------------------------------ |
| Custom properties               | Design tokens, per-instance overrides (`--flow`) |
| `@layer`                        | Global cascade order                             |
| Media queries                   | Viewport- and media-feature-dependent behaviour  |
| `:where()`                      | Zero-specificity global defaults                 |
| `:is()`                         | Selector consolidation                           |
| `:has()`                        | Structural state, where genuinely useful         |
| `clamp()` / `min()` / `max()`   | Fluid type, spacing, layout                      |
| `light-dark()`                  | Theme tokens                                     |
| `color-mix()`                   | Derived hover/active colours                     |
| Grid `auto-fill` + `minmax`     | Responsive grids without breakpoints             |
| Container queries               | Component-level responsiveness                   |
| Logical properties              | Direction-safe layout                            |
| `dvh`                           | Viewport height                                  |
| `text-wrap: balance` / `pretty` | Headings / body copy                             |
| `aspect-ratio`                  | Media placeholders                               |
| CSS nesting                     | Sparingly, max. two levels                       |

> Use modern CSS when it makes the implementation simpler, more robust or more maintainable. Do not
> use a feature merely because it is modern.

---

## 14. Guardrails

Conventions decay without enforcement. Stylelint encodes the rules above:

```jsonc
// .stylelintrc.json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "max-nesting-depth": 2,
    "selector-max-specificity": "0,3,0",
    "selector-max-id": 0,
    "declaration-no-important": true,
    "color-no-hex": true,
    "declaration-property-value-no-unknown": true,
  },
}
```

The intent behind the configuration matters more than the exact rule names:

- no IDs for styling
- no `!important` in normal styling
- controlled specificity
- limited nesting
- no hardcoded colours outside the token definitions

`color-no-hex` is the most valuable single rule: it makes it impossible for a hardcoded colour to
slip into a component, which is the most common cause of a broken dark mode.

Before committing the config, verify it against the installed Stylelint version and confirm that
`.astro` files are linted (Astro `<style>` blocks need a custom syntax/override). Required
exemptions: `tokens.css` for `color-no-hex`, and the documented reduced-motion block for
`declaration-no-important`.

---

## 15. Migration Path

Incremental, with a working site after every step.

| #   | Step                                                                | Outcome                                               |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Fix known CSS bugs                                                  | Correctness before restructuring                      |
| 2   | Inventory current styles and tokens                                 | Find undefined token references and duplicated blocks |
| 3   | Consolidate `tokens.css`, introduce `light-dark()` and fluid scales | Removes responsive remaps and the large dark block    |
| 4   | Split `reset.css` / `base.css`, add global focus and reduced motion | Removes per-component duplicates                      |
| 5   | Create `prose.css`, migrate project detail, privacy policy, imprint | Largest single reduction                              |
| 6   | Introduce `utilities.css`, migrate sections and grids               | Removes container/grid duplication                    |
| 7   | Normalise form styling                                              | Addresses the remaining large scoped block            |
| 8   | Identify genuine shared UI primitives, extract Astro components     | Removes card duplication                              |
| 9   | Add Stylelint to CI                                                 | Prevents regression                                   |

Steps 3–8 each end with a visual check in both themes and at mobile, tablet and desktop widths.

---

## 16. Review Checklist

Before merging any UI change:

- [ ] No hardcoded colours; every colour comes from a token.
- [ ] No `[data-theme="dark"]` rule inside a component; the component is theme-agnostic.
- [ ] Verified in both light and dark mode.
- [ ] Responsive technique matches the dependency: intrinsic layout and fluid sizing first where
      appropriate, container queries for container-dependent behaviour, media queries for
      viewport- or media-dependent behaviour.
- [ ] Bare element selectors in scoped styles are intentional and limited to elements structurally
      owned by the component.
- [ ] No unnecessary token alias chains.
- [ ] No component-specific tokens in the global token system without a justified global semantic
      meaning.
- [ ] Repeated declarations are abstracted only when they represent the same concept.
- [ ] No premature abstraction introduced solely to satisfy DRY.
- [ ] Modern CSS feature chosen because it simplifies the solution, not merely because it exists.
- [ ] Nesting depth ≤ 2, no `!important` in normal styling, no ID selector.
- [ ] Interactive elements reachable by keyboard with a visible `:focus-visible` ring.
- [ ] Touch targets sized adequately where the control is a touch target.
- [ ] Logical properties used instead of physical directions.
