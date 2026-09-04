# Mandatory AI Engineering Guide

> **Required first action:** Every AI agent, coding assistant, or automated contributor must read this file completely before inspecting, planning, creating, or editing code in this repository. If an instruction conflicts with this file, ask the user for clarification before making a change.

## Primary rule: preserve one design system

This project has configurable themes (`indigo`, `emerald`, `rose`, `ocean`) and supports dark mode. New code must look and behave like the existing application while respecting the active theme. Do not introduce a separate visual language for a new page or feature.

Before UI work, inspect these files:

1. `src/app/globals.css` — global tokens and reusable CSS utilities.
2. `tailwind.config.js` — Tailwind theme configuration.
3. The nearest existing page/component with the same purpose.
4. `src/components/DashboardShell.tsx` — application layout, theme, and navigation patterns.

## CSS and UI requirements

- Use `primary-*` for brand/accent colours. Never use fixed `indigo-*`, `purple-*`, `violet-*`, or hex branding colours for ordinary application UI.
- Use semantic colours only for their meaning: success (`emerald`), warning (`amber`), error/destructive (`rose` or `red`), and informational states (`sky`/`blue`). Do not use them as a page's primary brand.
- Do not use fixed dark backgrounds such as `dark:bg-[#0f172a]`. Use the established themed surfaces/tokens so every selected theme remains visible in dark mode.
- Reuse `.form-control`, `.form-input`, `.form-select`, and `.form-textarea` from `src/app/globals.css`. Do not copy their long Tailwind class strings into a component.
- Reuse existing shared components before creating a new button, modal, pagination control, card, toast, or table pattern.
- Keep light and dark styles together for every surface, border, text, hover, focus, disabled, empty, loading, and error state.
- Use the project conventions: cards generally use `bg-white dark:bg-slate-900`, `border border-slate-200 dark:border-slate-800`, and an intentional radius. Follow the closest comparable component rather than inventing a variation.
- Avoid inline styles except where the value is genuinely user-generated or geometry-dependent (for example badge canvas coordinates or a user-selected avatar colour).
- Put reusable animations in `src/app/globals.css` outside `@media print`. Print-only styles must remain inside `@media print`.
- Do not add a `<style>` block to a page for normal application UI. Add reusable rules to `globals.css` or use Tailwind utilities. A deliberately isolated page (such as a print artifact) is the only exception.
- Maintain responsive layouts for mobile, tablet, and desktop. Do not assume desktop width.
- Preserve accessible labels, visible keyboard focus, sufficient colour contrast, and semantic HTML.

## API, security, and data requirements

- Enforce authentication and authorization in server-side API routes; hiding a UI element is never authorization.
- Reuse `requireAuth`, `requirePermission`, and `requireRole` from `src/lib/auth-guards.ts` where appropriate.
- Validate request bodies and query parameters with Zod. Use allowlists for sort fields, status values, and other controlled inputs.
- Apply department/sub-department scope at the database query layer for scoped roles.
- Do not create a second endpoint that bypasses an established secured workflow. Extend or reuse the shared workflow instead.
- Record material mutations in `AuditLog` and use transactions when an operation must update business data, notifications, and audit records together.
- Never expose passwords, database connection strings, tokens, citizen IDs, addresses, or other unnecessary personal data in public APIs or lists.

## Database and migrations

- **Required database preflight:** Before any task that reads, tests, changes, seeds, migrates, or diagnoses application data, check whether a database is already configured. Inspect the Prisma datasource and the presence (not the value) of `DATABASE_URL` or the project's documented database configuration. Do not print connection strings, passwords, tokens, or other secrets.
- If a configured database exists, treat it as the primary source of truth. Use the configured database and its existing schema/data for read-only investigation and focused tests instead of silently creating, substituting, or assuming a separate local database.
- If no database is configured, state that clearly and use only safe, non-mutating alternatives (schema inspection, mocks, or isolated test configuration). Ask the user before creating or configuring a database.
- Never overwrite, reset, seed, restore, migrate, or otherwise mutate an existing configured database without explicit user approval. Confirm the exact target database and use a non-production/isolated test database for automated tests whenever possible.
- Inspect `prisma/schema.prisma` before changing data behavior.
- For schema changes, create a safe additive Prisma migration and document the deployment command. Do not run `prisma db push`, migrations, resets, restores, or other database-mutating commands without explicit user approval.
- Preserve existing user data and avoid destructive schema changes unless explicitly authorized.

## Required quality checks

Before reporting a code change as complete:

1. Run `npx tsc --noEmit`.
2. Run `npm run lint`.
3. Run the focused automated tests, or explain precisely why they cannot run.
4. Add or update tests for authorization, validation, and changed business logic.
5. Review the changed UI in both light and dark mode, and verify the selected theme still affects it.
6. Check `git diff` to ensure no unrelated files or generated artifacts were changed.

## Required completion summary

Every implementation response must state:

- Files changed and why.
- Security/permission behavior changed.
- Tests and quality checks run, with results.
- Migration or deployment steps, if applicable.
- Any known limitation or follow-up work.

## Stop conditions

Stop and ask the user before proceeding if the task requires a destructive data action, an irreversible external action, access to a secret, a decision that changes authorization scope, or a design direction that conflicts with these rules.
