# NexusQA – Project Context for Agents

## Workflow Rules (CRITICAL)
This project enforces strict workflow execution rules for agent workflows.
!{cat .agent/references/workflow-rules.md}

## Overview
NexusQA is an **AI-assisted test management system** built for software QA teams. It lets users:
- Organize projects, suites (folders), and detailed test cases.
- Use Gemini to generate test steps, acceptance criteria, and visual mockups.
- Track execution history (Pass/Fail/Blocked/Skipped) with environment, evidence, and bug IDs.
- Plan test cycles via Test Plans and Test Runs.

**Project Name:** `nexus-qa`

## Architecture & Technologies

### Core Stack
- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom UI components
- **State Management:** Zustand store (see `store/`)
- **Database:** Prisma + SQLite (`prisma/schema.prisma`)
- **AI Integration:** Google GenAI SDK (`@google/genai`) for text + image
- **Testing:** Jest (unit/API) + Playwright (E2E under `tests/e2e`)

### Project Structure (High Level)
- `app/` – Next.js routes (pages) and API route handlers under `app/api/*`.
- `views/` – Page-level views (Dashboard, Projects, ProjectDetail, Settings, TestCaseDetail).
- `components/` – Reusable UI (modals, folder tree, plan list, execution history, etc.).
- `store/` – Zustand slices for projects, test cases, test plans, and UI.
- `prisma/` – Prisma schema and migrations; local DB (`dev.db`).
- `tests/e2e/` – Playwright specs for SOP-critical flows.
- `lib/` – Helpers for import/export, formatting, Prisma client.

## Development Workflow

### Prerequisites
- Node.js (LTS)
- npm
- `GEMINI_API_KEY` configured in `.env.local`

### Key Commands
| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the Next.js dev server at `http://localhost:3000`. |
| `npm run build` | Build the application for production. |
| `npm start` | Serve the built app. |
| `npm run lint` | Run ESLint checks. |
| `npm test` | Run Jest unit/API tests. |
| `npx playwright test` | Run Playwright E2E tests in `tests/e2e`. |

## Conventions

- Use BDD-style fields (`userStory`, `acceptanceCriteria`, `preconditions`) when designing test cases.
- Respect review gates: `reviewStatus` should be `APPROVED` before regular execution.
- Keep tests close to code (`components/__tests__`, `lib/__tests__`, `store/slices/__tests__`).
