# Changelog rules

Rules for writing `CHANGELOG.md` entries. Readers are end users of sparecores.com, not developers.

## What to include

- Add each user-facing change (new features, UI/UX improvements, visible fixes) in the same PR, under the section of the month the PR is merged (`## November 2026`); create the section if it is missing. If a PR is still open when a new month starts, move its entry to the new month before merging.
- Skip tooling, CI, tests, refactors, dependency upgrades and SDK regenerations unless they have a visible effect; then describe that effect (e.g. faster page load), not the change behind it.
- Months are listed newest first. Skip a month with no entries.

## Subsections

- Use these subsections in this order and omit empty ones. Keep the headings exactly as written, in the plural even for a single entry, so the file stays easy to parse:
  - `Breaking changes:`
  - `New features:`
  - `Improvements:`
  - `Fixes:`
  - `New content:`
- A breaking change is a changed or removed public URL, route, query param or embed parameter that no longer works. A route that redirects to its new URL is not breaking; list it under improvements.

## Entries

- Describe what the user gets or sees now, not what the developer did. Write each entry as a noun phrase or in the present tense; do not start with a verb in any tense (`Add`, `Added`, `Fix`, `Fixed`).
  - New feature: `Bookmarks page for signed-in users to manage saved searches and comparisons (#260)`
  - Improvement: `The Servers listing applies search filters on Enter instead of on every keystroke (#256)`
  - Fix: `The "Active only" and "Orderable only" filters of the Databases listing are checkboxes again (#323)`, not `Fix the "Active only" filter …`
- Focus on the benefit and the visible behavior, not implementation details (components, services, libraries).
- Name pages and controls as they appear in the UI (Servers listing, Server details page, Compare page), and use backticks for URL paths and query params (`/servers/compare`, `columns`).
- Group related small changes into one entry, and be specific: name the page, filter, column or chart instead of writing "various improvements".
- End each entry with the PR number(s) when known, e.g. `(#123)` or `(#251, #254)`; no trailing period.

## New content

- List slides first, then articles, each as a sublist (even with one item), and order the items within each sublist by date, newest first:

  ```markdown
  New content:

  - Slides:
    - [Data-Driven Instance Selection](https://sparecores.com/assets/slides/sreday-amsterdam-2026.html) (SREday Amsterdam 2026)
  - Articles:
    - [New PostgreSQL Benchmark: A First Look](https://sparecores.com/article/pgbench-early-results-graviton)
    - [Bookmark Your Searches and Comparisons](https://sparecores.com/article/registered-users)
  ```

- Put an article in the month of its `date:` front matter, and slides in the month of the talk (`date:` in the slides' `.Rmd`), not the month of the commit.
- Take the title from the article's `title:` or the slides' `title:`, and the event name from the slides' `conference:` field.

## Formatting

- Wrap entries at about 88 characters and indent continuation lines by two spaces; do not wrap links in `New content:`.
- Run `npx prettier --write CHANGELOG.md` after editing, and make sure `npm run prettier:check` passes.

## References

- GitLab, [Changelog entries](https://docs.gitlab.com/development/changelog/): describe the change by its benefit to the user, not its implementation.
- Google developer documentation style guide, [Present tense](https://developers.google.com/style/tense) and [Timeless documentation](https://developers.google.com/style/timeless-documentation): prefer the present tense; time-bound wording is fine in release notes.
