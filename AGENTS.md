# AGENTS.md

Repository-level rules for AI coding agents. Global rules apply to every task; the TypeScript and HTML template sections apply to `*.ts` and `*.html` files respectively.

## Global Rules

### Chat Behavior

- Answer concisely. Drop filler words and hedging.
- Do not echo full files or unchanged code in chat when editing via tools.
- No post-task summaries or change reports. Respond with at most one short sentence upon completion.

### Engineering Guards

- Keep Angular components presentation-only; offload business logic to services.
- Prefer composition via content projection or shared directives over deep component hierarchies.
- Never inject comments, JSDocs, TODOs, or annotations. Do not reorganize imports.
- **Anti-Guessing Guard**: If a task is structurally ambiguous, ask a binary or multiple-choice question before editing. Never guess UI placement or backend contracts.
- Never run builds, tests, or package manager commands autonomously unless explicitly requested.
- Never add `Co-Authored-By` or any other AI attribution trailer to commit messages or PR descriptions, even if older commits contain one.

### Context & Tool Management

- Read and edit only files explicitly referenced by the task or tagged by the user.
- Do not perform blind repository-wide scans. Use targeted search or symbol lookup ONLY when a missing import, type interface, or dependency blocks immediate execution.
- Ignore structural config files unless directly required. You are explicitly allowed to inspect `src/app/services/keeper-api.service.ts` to resolve server endpoints.

### Formatting

- Follow the repo's Prettier defaults (`npm run prettier:check`): double quotes, semicolons, trailing commas, 2-space indentation, 80-character lines.

## TypeScript Files (`*.ts`)

### Angular 20 & TS Architecture Standards

- Framework: Angular 20 standalone architecture with SSR enabled, using zone-based change detection.
- Do not append file-level suffixes (like `.component.ts`) to filenames unless already established in the folder.
- Zero usage of `any`. Use safe navigation (`?.`) to prevent runtime undefined errors. No mock data generation.
- DI & Reactivity: Always use the functional `inject()` API instead of constructor injection. Use Signals for local state, and `computed()` for derived state.
- RxJS Management: Use `takeUntilDestroyed()` within an active injection context when observables are strictly required.
- Generate minimal `.spec.ts` files (testing component creation and core triggers only) ONLY when creating a brand new element or explicitly requested.

### Data Visualization Standards (ng2-charts)

- Keep `ng2-charts` configurations strongly typed. Use the Angular 20 `effect()` API strictly for data visualization side effects (e.g., Chart.js rendering context updates or instantiation).

### SSR Safety Guardrails

- Ensure SSR safety using browser guards (`isPlatformBrowser`) or the Angular 20 `afterNextRender()` / `afterEveryRender()` hooks.
- Never access global browser primitives (`window`, `document`, `localStorage`) directly in the main component lifecycle execution path without an SSR safety guard.

## HTML Templates (`*.html`)

### Tailwind

- Use Tailwind CSS v3 utilities. Mirror nearby design patterns (margins, padding, components) from currently opened or referenced files.

### Angular 20 Template Standards

- Exclusively use Modern Control Flow (`@if`, `@else`, `@for`, `@switch`). Zero legacy `*ngIf` or `*ngFor` directives.
- For template local variables, use the `@let` syntax (e.g., `@let user = userSignal()`).

### UI Components & Analytics

- **Icons (@lucide/angular)**: Strictly use native `<svg>` tags with the appropriate lucide directive. Never use legacy component selectors or inline raw SVGs.
  - _Static example_: `<svg lucideCircleCheck></svg>`
  - _Dynamic example_: `<svg [lucideIcon]="item.icon"></svg>`
- **Analytics**: Always use PostHog autocapture HTML attributes (for example: `data-ph-capture-attribute-sc-event="landing slot machine start"` + context targets like `data-ph-capture-attribute-slot-machine-action="start"`). Avoid manual TS tracking.
