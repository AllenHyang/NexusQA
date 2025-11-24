# Repository Guidelines

This document is a concise contributor guide for NexusQA. Treat it as the default reference for structure, style, and workflow when making changes.

## Project Structure & Modules
- `app/` – Next.js 15 routes and API handlers under `app/api/*`.
- `components/` – Reusable React 19 UI components and Jest tests in `components/__tests__`.
- `contexts/` & `store/` – React contexts and Zustand state (`store/slices`, `useAppStore.ts`).
- `lib/` – Shared utilities (formatters, import/export helpers, Prisma client).
- `prisma/` – Prisma schema, migrations, and local SQLite database (`dev.db`).
- `tests/e2e/` – Playwright end‑to‑end specs for core flows.

## Build, Test & Development
- `npm run dev` – Start the Next.js dev server on `http://localhost:3000`.
- `npm run build` / `npm start` – Build and run the production server.
- `npm run lint` – Run ESLint (`next/core-web-vitals`, TypeScript rules).
- `npm test` – Run Jest unit/integration tests (lib, store, components, API).
- `npx playwright test` – Run Playwright E2E tests in `tests/e2e`.
- `./scripts/validate.sh` – Lint + Jest test gate; run before pushing.
- `./start_debug.sh` – Dev server with enhanced logging to `server.log` / `browser.log`.

## Coding Style & Naming
- Language: TypeScript, React 19, Next.js app router; Tailwind for styling.
- Follow existing files: 2‑space indentation, semicolons, double quotes, strict types.
- Components/pages: PascalCase (`TestCaseModal`, `ProjectListView`).
- Functions, variables, hooks: camelCase (`useAppStore`, `formatExportData`).
- Types/interfaces: PascalCase in `types.ts` or local `types.ts`.

## Testing Guidelines
- Unit tests live alongside code: `lib/__tests__`, `components/__tests__`, `store/**/*.test.ts`, `app/api/**/*.test.ts`.
- Name Jest tests `*.test.ts` / `*.test.tsx`; name E2E specs `*.spec.ts` under `tests/e2e`.
- When changing behavior, add/adjust tests in the matching folder and run `npm test` (and `npx playwright test` if flows change).
- Use `npm test -- --coverage` to check that coverage does not regress for critical modules.

## Commit & Pull Request Guidelines
- Use Conventional Commit–style prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, optionally with scope (e.g. `feat(project): ...`).
- Keep messages imperative and focused, referencing task/issue IDs when relevant (e.g. `feat(project): implement project import (Task #10)`).
- For PRs, include: scope/summary, linked issue or SOP task, screenshots or GIFs for UI changes, DB migration notes (if Prisma schema changed), and a short test plan (commands run such as `./scripts/validate.sh` and targeted `npx playwright test ...`).

## Security & Configuration
- Do not commit secrets, `.env*` files, or database files meant for local use only.
- Configure `.env.local` with `GEMINI_API_KEY` and `DATABASE_URL` (SQLite) before running the app or tests.
- Treat logs, fixtures, and test data as non‑sensitive; never use real customer data in this repository.

