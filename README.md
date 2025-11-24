# NexusQA

**NexusQA** is a modern, AI-powered software development test framework designed to streamline the Quality Assurance process. Built with **React 19** and **TypeScript**, it integrates **Google's Gemini AI** to automate test case generation, create visual UI mockups, and manage test executions intelligently.

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-Fast-purple?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5-orange?logo=google" alt="Gemini AI" />
</div>

## 🚀 Key Features

- **🤖 AI-Driven Test Generation**: Automatically generates detailed test steps (actions and expected results) from simple descriptions using `gemini-2.5-flash`.
- **🎨 Visual UI Mockups**: Instantly generates visual references and UI mockups for test cases using `gemini-2.5-flash-image`.
- **📂 Smart Project Management**: Organize projects with AI-generated cover art and comprehensive metadata.
- **📊 Execution Tracking**: Track test runs, status (Pass/Fail/Block), and history with a clean, intuitive dashboard.
- **👥 User Management**: Role-based access (Admin, QA Lead, Tester) with AI-generated user avatars.
- **🌍 Internationalization**: Built-in support for English and Chinese (简体中文).

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Prisma + SQLite
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Testing & E2E**: Jest + Playwright (plus Puppeteer for log/debug helpers)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- A **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:AllenHyang/NexusQA.git
   cd NexusQA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🛡️ Testing & Quality Gates

We enforce strict quality standards using automated tools and workflows.

### 🧪 Running Tests

We use **Jest** for Unit and Integration testing.

*   **Run all tests**:
    ```bash
    npm test
    ```
*   **Run tests with coverage report**:
    ```bash
    npm test -- --coverage
    ```

### 🧹 Linting

We use **ESLint** to ensure code quality and consistency.

*   **Check for issues**:
    ```bash
    npm run lint
    ```

### ✅ Automated Validation

Before pushing code, you can run the all-in-one validation script:

```bash
./scripts/validate.sh
```
This script runs both **Linting** and **Tests**, ensuring your code is ready for review.

### 🔒 Git Hooks (Husky)

We use **Husky** and **lint-staged** to automatically validate your code when you commit.
*   **Pre-commit Hook**: Automatically runs `eslint --fix` and related unit tests on staged files. If checks fail, the commit is blocked.

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server at `http://localhost:3000`. |
| `npm run build` | Builds the Next.js application for production. |
| `npm start` | Starts the production server (after `npm run build`). |
| `npm run lint` | Runs ESLint checks. |
| `npm test` | Runs Jest unit/integration tests. |
| `./start_debug.sh` | **Recommended for Dev:** Starts the server and a visible Chrome instance for detailed logging (`server.log` & `browser.log`). |

## 📂 Project Structure

```
/
├── app/                    # Next.js app router pages & API routes (app/api/*)
├── components/             # Reusable UI components (modals, history, lists, etc.)
├── contexts/               # React Contexts (language, UI state)
├── views/                  # Page-level views (Dashboard, Login, ProjectDetail, etc.)
├── store/                  # Zustand store and feature slices
├── prisma/                 # Prisma schema, migrations, and local SQLite DB
├── tests/                  # Playwright E2E specs under tests/e2e
├── lib/                    # Shared helpers (formatters, import/export, Prisma client)
├── scripts/                # Utility scripts (validation, data cleanup)
├── public/                 # Static assets
└── ...
```

## 📐 SOP Alignment

This repository ships with a detailed testing SOP in `NexusQA_SOP.md`, which defines BDD-style requirements, review gates, and execution rules.

- **User Story & AC** – Mapped to `userStory`, `preconditions`, and `acceptanceCriteria` fields on each Test Case.
- **Review Gate** – `reviewStatus` (`PENDING`/`APPROVED`/`CHANGES_REQUESTED`) is stored per case; the UI warns when executing non-approved cases, but hard blocking may still require additional implementation.
- **Execution History** – Every run records status, executor, env, evidence, and `bugId`, and is surfaced in dashboards and history panels.
- **Test Plans** – Test Plans and Runs model test cycles; E2E tests under `tests/e2e` cover the main SOP flows.

When extending features, keep SOP red lines in mind (e.g., fail must have bug ID, unreviewed cases should not enter formal execution).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
