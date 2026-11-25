# Changelog rules

Rules for writing `CHANGELOG.md` entries. Readers are end users, not developers.

## What to include

- Add each user-facing change (new features, UI/UX improvements, visible fixes) in the same PR, under the current month's section (`## November 2026`); create the section if it is missing.
- Skip tooling, CI, tests, refactors, dependency upgrades and SDK regenerations unless they have a visible effect.

## Subsections

- Use these subsections in this order and omit empty ones: breaking changes, new features, improvements, fixes, new content.
- Match the heading to the number of entries: `New feature:` for one, `New features:` for more. Never write `(s)`.
  - `Breaking change:` / `Breaking changes:`
  - `New feature:` / `New features:`
  - `Improvement:` / `Improvements:`
  - `Fix:` / `Fixes:`
  - `New content:` (always this form)
- A breaking change is a changed or removed public URL, route, query param or embed parameter that no longer works. A route that redirects to its new URL is not breaking; list it under improvements.

## Entries

- Name pages as they appear in the UI, and end each entry with the PR number when known, e.g. `(#123)`.
- Write fixes in the past tense: `Fixed the "Active only" filter …`, not `Fix the …`.

## New content

- List slides first, then articles, each as a sublist, even with one item:

  ```markdown
  New content:

  - Slides:
    - [Data-Driven Instance Selection](https://sparecores.com/assets/slides/sreday-amsterdam-2026.html) (SREday Amsterdam 2026)
  - Articles:
    - [New PostgreSQL Benchmark: A First Look](https://sparecores.com/article/pgbench-early-results-graviton)
    - [Bookmark Your Searches and Comparisons](https://sparecores.com/article/registered-users)
  ```

- Put an article in the month of its `date:`, and slides in the month of the talk. Articles dated before the site launch (April 2024) go under April 2024.
