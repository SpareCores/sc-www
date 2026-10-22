# AGENTS.md

Repository-level rules for AI coding agents. Global rules apply to every task; the TypeScript, HTML template, and styling sections apply to `*.ts`, `*.html`, and `*.css` files respectively.

## Global Rules

### Chat Behavior

- Answer concisely. Drop filler words and hedging.
- No post-task summaries or change reports. Respond with at most one short sentence upon completion, except for the disclosures required below.
- Always state what was not verified and any steps the user must run (e.g. lockfile updates, baseline regeneration), even if that takes more than one sentence.

### Engineering Guards

- Keep Angular components presentation-only; offload business logic to services.
- Prefer composition via content projection or shared directives over deep component hierarchies.
- Never add code comments, JSDoc, or TODOs. Do not reorganize existing imports.
- **Anti-Guessing Guard**: If a task is structurally ambiguous, ask a binary or multiple-choice question before editing. Never guess UI placement or backend contracts.
- Verify third-party APIs (exports, signatures, options) against the installed types in `node_modules` before using them; never rely on memory.

### Commands & Dependencies

- You may run non-mutating checks: `npm run prettier:check`, `npm run lint`, `npm run build`, and `npm run test:ci`. Run anything else (e.g. `ng serve`, Cypress) only when explicitly requested.
- Never add, remove, or upgrade packages, and never run `npm install`, `uninstall`, or `update`. Ask the user and let them update the lockfile.

### Context & Tool Management

- Read and edit only files explicitly referenced by the task or tagged by the user, unless the user approved a plan for a multi-file change; list those files in the plan.
- Do not perform blind repository-wide scans. Use targeted search or symbol lookup only when a missing import, type interface, or dependency blocks immediate execution.
- Ignore structural config files unless directly required. You are explicitly allowed to inspect `src/app/services/keeper-api.ts` to resolve server endpoints.

### Testing

- Keep tests in sync: update existing unit specs and Cypress specs or selectors affected by your change.
- Generate minimal `.spec.ts` files (component creation and core triggers only) when creating a new element or when explicitly requested.
- Never regenerate visual regression baselines locally unless explicitly asked; they are regenerated in CI.

### Formatting

- Follow the repo's Prettier defaults (`npm run prettier:check`): double quotes, semicolons, trailing commas, 2-space indentation, 80-character lines.

### Commits & Pull Requests

- Commit, amend, push, or rewrite history only when explicitly asked. Before rewriting, check the remote (`git status -sb`) and confirm before any force push.
- Use Conventional Commits with a scope: `<type>(<scope>): <description>`, e.g. `fix(server-listing): keep benchmark state consistent with the URL`.
- Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `ci`.
- Scope is the affected feature, component, or folder in kebab-case (`auth`, `server-details`, `toasts`, `http`). For tests use `e2e`, `visual-tests`, or the tested feature; for agent rules use `agents`.
- Subject: lowercase, imperative mood, no trailing period, at most 72 characters.
- Add a body only when the change needs context: blank line after the subject, wrapped at 72 characters, explaining what changed and why (bullet lists are fine).
- Linear IDs are tracked via the branch name; add one to the message only when referencing a different issue.
- Order commits so each one builds on its own.
- Write PR descriptions following `.github/pull_request_template.md`.
- **Never add `Co-Authored-By` or any other AI attribution trailer** to commits or PR descriptions, even if older commits contain one.

### Auth (Clerk)

- Clerk runs headless via `@clerk/clerk-js`; never reintroduce `@clerk/ui` or Clerk's prebuilt components.
- Access Clerk only through the `src/app/core/auth` services (`ClerkClient`, `AuthState`, `Profile`); components never import from `@clerk/*`.
- Keep user-facing auth strings in `AUTH_MESSAGES` (`src/app/core/auth/auth.constants.ts`).

## TypeScript Files (`*.ts`)

### Angular 21 & TS Architecture Standards

- Framework: Angular 21 standalone architecture with SSR enabled, using zone-based change detection.
- Name components, services and directives without a type suffix, and name each file after its class in kebab-case (`LandingPage` in `landing-page.ts`, with `landing-page.html`, `.css` and `.spec.ts` alongside). Pipes keep the `Pipe` class suffix; pipe, guard, interceptor and store files use a hyphenated type (`storage-pipe.ts`, `auth-guard.ts`).
- Never use `any`.
- DI & Reactivity: Always use the functional `inject()` API instead of constructor injection. Use Signals for local state in new code, and `computed()` for derived state.
- RxJS Management: Use `takeUntilDestroyed()` within an active injection context when observables are strictly required.

### Effects & Charts

- Prefer `computed()` for derived state; use `effect()` only for side effects such as DOM or Chart.js updates, syncing non-signal APIs, or resetting state.
- Keep `ng2-charts` configurations strongly typed.

### SSR Safety Guardrails

- Ensure SSR safety using browser guards (`isPlatformBrowser`) or the Angular 21 `afterNextRender()` / `afterEveryRender()` hooks.
- Never access global browser primitives (`window`, `document`, `localStorage`) directly in the main component lifecycle execution path without an SSR safety guard.

## HTML Templates (`*.html`)

### Angular 21 Template Standards

- Always use modern control flow (`@if`, `@else`, `@for`, `@switch`); never legacy `*ngIf` or `*ngFor` directives.
- For template local variables, use the `@let` syntax (e.g., `@let user = userSignal()`).

### UI Components & Analytics

- **Icons (@lucide/angular)**: Always use native `<svg>` tags with a lucide directive; never legacy component selectors or inline raw SVGs.
  - _Static example_: `<svg lucideCircleCheck></svg>`
  - _Dynamic example_: `<svg [lucideIcon]="item.icon"></svg>`
  - Icons used by name must be registered in `lucideIcons` (`src/app/lucide-icons.ts`).
  - Brand icons (`github`, `linkedin`, `twitter`, `facebook`, `youtube`, `codesandbox`) are custom definitions in that file with no static directive; use them by name, e.g. `<svg lucideIcon="github"></svg>`.
- **Analytics**: Always use PostHog autocapture HTML attributes (for example: `data-ph-capture-attribute-sc-event="landing slot machine start"` + context targets like `data-ph-capture-attribute-slot-machine-action="start"`). Avoid manual TS tracking.

## Styling (`*.html`, `*.css`)

- Prefer Tailwind CSS v3 utilities. Mirror nearby design patterns (margins, padding, components) from currently opened or referenced files.
- When extending a component that already has its own stylesheet (e.g. the auth modals' `auth-modal.css`), follow that stylesheet's conventions instead.
