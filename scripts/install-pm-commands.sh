#!/bin/bash

# This script installs the Project Manager (PM) workflows and Gemini CLI commands.
# It is self-contained and does not require the source files to exist beforehand.

echo '🚀 Starting PM Commands Installation...'

# --- Restoring .agent/references/workflow-rules.md ---
mkdir -p "$(dirname ".agent/references/workflow-rules.md")"
cat << 'EOF_MD' > ".agent/references/workflow-rules.md"
# Workflow Execution Rules & Best Practices

This document defines the strict operational rules for executing Project Manager (pm) workflows.

## 1. Atomic Execution Principle
- **Workflows are Atomic**: Each workflow (e.g., `/pm:task:start`, `/pm:task:create`, `/pm:task:done`) is a discrete, isolated unit of work.
- **No Chaining**: The agent must **NEVER** automatically trigger a subsequent workflow immediately after completing the current one.
  - *Example*: After `/pm:task:start`, do NOT automatically start coding unless explicitly told.
  - *Example*: After implementing changes, do NOT automatically run `/pm:task:done`.
- **Await Instruction**: After a workflow completes its defined steps, the agent must **STOP**, report the status to the user, and await the next explicit command.

## 2. Task Lifecycle Boundaries
- **Start**: Ends when the branch is checked out and context is synced.
- **Implementation**: (General coding) Ends when changes are verified (build/lint pass).
  - **CRITICAL**: The agent must **NEVER** merge code or close a task during the implementation phase.
  - **CRITICAL**: The `/pm:task:done` command is the ONLY mechanism to close a task and merge code. It must be invoked explicitly.
- **Done**: Ends when the code is merged and the task is marked as "done" in the database.

## 3. State Transitions
- Any action that changes the **Lifecycle State** of a task (e.g., `todo` -> `in_progress` -> `done`) requires strict adherence to the specific workflow defining that transition.
- Do not manually edit `tasks.json` status fields outside of these defined workflows.

## 4. Verification & Safety
- Always run verification (build, lint, test) before declaring the implementation phase complete.
- If verification fails, **STOP** and report the errors. Do not proceed to ask about the next step until fixed.
EOF_MD

# --- Restoring .agent/prompts/task-quality-gate.md ---
mkdir -p "$(dirname ".agent/prompts/task-quality-gate.md")"
cat << 'EOF_MD' > ".agent/prompts/task-quality-gate.md"
# Task Quality Gate

You are a strict Quality Assurance gatekeeper. Your job is to evaluate if a task is ready to be worked on.

## Evaluation Criteria (Total 60 pts)

1.  **Basic Completeness (10 pts)**:
    - Is the title specific? (e.g., "Fix bug" = 0, "Fix login timeout" = 10)
    - Are tags/priority set?

2.  **Purpose Clarity (10 pts)**:
    - Does the description explain *why* this is needed?
    - Is the context clear?

3.  **Type Matching (10 pts)**:
    - If Bug: Are reproduction steps included?
    - If Feature: Is the user story clear?

4.  **Acceptance Criteria (10 pts)**:
    - Are there clear "Done" conditions?
    - **CRITICAL**: Are there specific verification steps?

5.  **Project Rules & TDD (10 pts)**:
    - Does it follow project conventions?
    - **TDD Requirement**: Does the description include a "Test Design" or "Regression Test" section? (Required for high score)

6.  **Latest Focus (10 pts)**:
    - Does it align with current project goals?

## Scoring Thresholds

-   **Score < 30**: 🔴 REJECT. (Missing critical info)
-   **30 <= Score < 40**: 🟠 NEEDS IMPROVEMENT. (Vague)
-   **40 <= Score < 50**: 🟡 GOOD. (Acceptable)
-   **50 <= Score <= 60**: 🟢 EXCELLENT. (Ready to start)

## Instructions

1.  Read the task title and description.
2.  Calculate the score for each category.
3.  Sum the scores.
4.  Output the detailed breakdown and final decision:
    "SCORE: <n>/60. STATUS: [REJECT/NEEDS_IMPROVEMENT/GOOD/EXCELLENT]"
    "MISSING: <list of missing items>"
EOF_MD

# --- Restoring GEMINI.md ---
cat << 'EOF_MD' > "GEMINI.md"
# Project Context: Internal Tool Portal (DevPortal)

## Workflow Rules (CRITICAL)
This project enforces strict workflow execution rules.
!{cat .agent/references/workflow-rules.md}

## Overview
This project is a **React-based dashboard** designed to serve as a central hub for internal engineering tools. It allows users to:
- View a catalog of internal services (CI/CD, Databases, Monitoring, etc.).
- Filter tools by category or search by name/description.
- Access direct links to tool interfaces, logs, admin panels, and repositories.
- Simulate adding new tools (currently client-side only).

**Project Name:** `radiant-nova` (Package Name) / "内部工具门户" (Directory Name)

## Architecture & Technologies

### Core Stack
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 7](https://vitejs.dev/)
- **Language:** JavaScript (ESModules)

### Project Structure
- **`src/App.jsx`**: Main entry point containing the layout (Sidebar + Main Content), state management (tools list, search, filter), and routing logic (simulated via categories).
- **`src/data/mockData.js`**: Contains the `tools` array, which acts as the mock database for the application.
- **`src/components/`**:
    - `ToolCard.jsx`: Displays individual tool details (status, version, links).
    - `AddToolModal.jsx`: Form to add a new tool.
    - `StatusBadge.jsx`: Visual indicator for tool status (online, offline, maintenance).
- **`public/`**: Static assets.

### Styling
- **Approach:** A mix of global CSS classes (likely in `index.css`) and inline React styles for dynamic values (e.g., mouse tracking effects).
- **Theme:** Dark mode aesthetic with glassmorphism effects (`backdrop-filter`), utilizing CSS variables for colors (e.g., `--accent-primary`, `--bg-mesh`).

## Development Workflow

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Key Commands
| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the development server (typically at `http://localhost:5173`). |
| `npm run build` | Build the application for production. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint to check for code quality issues. |

## Conventions

*   **Components:** Functional components with hooks (`useState`, `useMemo`).
*   **State Management:** Local component state (`useState`) in `App.jsx` passed down via props. No global state manager (Redux/Context) is currently in use.
*   **Data Flow:** Unidirectional. Data originates in `App.jsx` (initialized from `mockData.js`) and flows down to `ToolCard`.
*   **Styling:** Use CSS variables for theming. Maintain the dark/glassmorphic visual style.
EOF_MD

# --- Restoring .agent/workflows/pm/status.md ---
mkdir -p "$(dirname ".agent/workflows/pm/status.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/status.md" 
# /pm:status - Project Status

Show the current status of the project.

## Usage

```bash
/pm/status
```

## Steps

1.  **Gather Stats**
    - Count files in `.project-log/daily-logs/`.
    - Count files in `.project-log/decisions/`.
    - **Task Stats**:
      - Scan all files in `.project-log/tasks/*.json` (exclude `meta.json`).
      - Count tasks by status (todo, in_progress, done).

2.  **Display Dashboard**
    ```
    📊 Project Status

    📝 Daily Logs: <count>
    🏗️  ADRs: <count>

    ✅ Tasks:
      - In Progress: <count>
      - Todo: <count>
      - Done: <count>
      - Total: <total>
    ```

3.  **Active Context**
    - Read `.pm/context.json`.
    - If `currentTaskId` is set, show:
      "👉 Currently working on: Task #<id>"

EOF_MD

# --- Creating Command .gemini/commands/pm/status.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/status.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/status.toml" 
description = "Run status workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/status.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/init.md ---
mkdir -p "$(dirname ".agent/workflows/pm/init.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/init.md" 
---
description: Initialize Project Manager structure
---

# Initialize Project Manager

This workflow initializes the project structure for the Project Manager system.

## Steps

1.  **Create Directory Structure**
    Create the following directories if they don't exist:
    - `.project-log/daily-logs`
    - `.project-log/decisions`
    - `.project-log/reports/.metadata`
    - `.project-log/knowhow/debugging`
    - `.project-log/knowhow/optimization`
    - `.project-log/knowhow/decisions`
    - `.project-log/knowhow/drafts`
    - `.project-log/tasks`
    - `.pm/events`

    ```bash
    mkdir -p .project-log/daily-logs
    mkdir -p .project-log/decisions
    mkdir -p .project-log/reports/.metadata
    mkdir -p .project-log/knowhow/{debugging,optimization,decisions,drafts}
    mkdir -p .project-log/tasks
    mkdir -p .pm/events
    ```

2.  **Initialize Task Metadata**
    Check if `.project-log/tasks/meta.json` exists. If not, create it with initial content:
    ```json
    {
      "nextId": 1
    }
    ```

3.  **Initialize context.json**
    Check if `.pm/context.json` exists. If not, create it with initial content:
    ```json
    {
      "currentTaskId": null,
      "lastTaskId": null,
      "workSession": {
        "startTime": null,
        "taskId": null
      }
    }
    ```

4.  **Create .gitignore files**
    Create `.project-log/.gitignore` if it doesn't exist:
    ```
    # Keep structure but ignore some temporary files
    *.tmp
    .DS_Store
    ```

    Create `.pm/.gitignore` if it doesn't exist:
    ```
    # Keep events and context
    events/*.json
    *.log
    ```

5.  **Notify User**
    Notify the user that the project has been initialized successfully.

EOF_MD

# --- Creating Command .gemini/commands/pm/init.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/init.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/init.toml" 
description = "Initialize Project Manager structure"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/init.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/review.md ---
mkdir -p "$(dirname ".agent/workflows/pm/review.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/review.md" 
# /pm:review - Daily Work Review

Review today's work and generate a summary.

## Usage

```bash
/pm/review
```

## Steps

1.  **Identify Date**
    - Get current date: `YYYY-MM-DD`.

2.  **Scan Tasks**
    - Scan all files in `.project-log/tasks/*.json` (exclude `meta.json`).
    - Find tasks where `updated_at` matches today's date.
    - Group by status (Completed, In Progress, Created).

3.  **Scan Daily Log**
    - Check if `.project-log/daily-logs/<YYYY-MM-DD>.md` exists.
    - If yes, read it to see what's already logged.

4.  **Generate Summary**
    - Create a summary report:
      ```markdown
      # Daily Review: <YYYY-MM-DD>

      ## 📅 Tasks Updated
      - [Done] Task #12: Fix email sync
      - [In Progress] Task #13: Refactor auth

      ## 📝 Daily Log
      (Content from daily log if exists, or "No manual logs found.")

      ## 💡 Know-How Candidates
      (Ask user if they learned anything worth saving)
      ```

5.  **Display Report**
    - Show the summary to the user.
    - Ask if they want to save this to the daily log file (if not already there).

6.  **Save (Optional)**
    - If user agrees, append/write to `.project-log/daily-logs/<YYYY-MM-DD>.md`.

EOF_MD

# --- Creating Command .gemini/commands/pm/review.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/review.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/review.toml" 
description = "Run review workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/review.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/tech/review.md ---
mkdir -p "$(dirname ".agent/workflows/pm/tech/review.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/tech/review.md"
# /pm:tech:review - Technical Review

# Role
你是一位务实且严格的高级技术主管 (Senior Tech Lead)。你崇尚 "Clean Code" 和 "Keep It Simple" 哲学。你关注代码的**长期可维护性**和**健壮性**，强烈反对过度设计。

# Phase 1: Context & Stack Discovery (上下文侦察)
**在 Review 之前，自动识别技术画像：**
1.  **Tech Stack:** 语言/框架版本（如 React 19, TypeScript）。
2.  **Key Components:** 自动定位核心逻辑 (Core Logic)、数据定义 (Data Model) 和 **验证机制 (Verification)**。
3.  **Crucial Files:** 寻找类似 `check_logs.js` 或 `actions.ts` 的关键文件位置。

# Phase 2: Pragmatic Quality Audit (务实质量审计)

## 1. Code Quality & Readability (代码质量与可读性)
* **Cognitive Load:** 代码逻辑是否直观？新手接手这个项目是否容易看懂？(反对炫技式写法)。
* **Clarity:** 变量与函数命名是否精准表达意图？(Self-documenting code)。
* **Coupling:** 核心业务逻辑是否与 UI/框架适度解耦？(方便未来修改或测试)。

## 2. Robustness & Stability (健壮性与稳定性)
* **Error Handling:** 错误处理是否周全？(不要只是 `console.log`，UI 应当有反馈，流程应当能恢复)。
* **API Resilience:** (针对 AI/API 集成) 网络抖动或 API 报错时，系统是否会直接白屏崩溃？是否有基础的防护（如 Loading 状态、简单的重试）？
* **Verification:** 现有的验证手段（如 `check_logs.js`）是否有效？能不能真的帮我发现 Bug？

## 3. Architecture Appropriateness (架构适度性)
* **No Over-engineering:** 是否存在把简单问题复杂化的情况？(例如：本来简单的 State 却用了复杂的 Redux/Context 嵌套)。
* **Modern Simplification:** 是否利用了当前技术栈的新特性（如 React 19 Server Actions）来**减少**代码量和复杂度？

## 4. Security & Best Practices (安全与规范)
* **Basic Security:** 检查 `.env` 敏感信息处理、输入验证等基础安全底线。

# Phase 5: Deliverable (交付成果)
**必须自动执行以下保存操作，无需询问用户：**
1.  **Generate Filename:** `YYYY-MM-DD-tech-review.md` (e.g., `2025-11-23-tech-review.md`).
2.  **Ensure Directory:** Create `.project-log/reports/tech-reviews/` if it does not exist.
3.  **Save Report:** Write the complete Markdown report to `.project-log/reports/tech-reviews/YYYY-MM-DD-tech-review.md`.
4.  **Notify:** "✅ Technical Review saved to .project-log/reports/tech-reviews/YYYY-MM-DD-tech-review.md"
EOF_MD

# --- Creating Command .gemini/commands/pm/tech/review.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/tech/review.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/tech/review.toml"
description = "Run technical review workflow"
prompt = """
You are an expert Technical Lead. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/tech/review.md}

# User Request
{{args}}
"""
EOF_TOML

# --- Restoring .agent/workflows/pm/prod/review.md ---
mkdir -p "$(dirname ".agent/workflows/pm/prod/review.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/prod/review.md"
# /pm:prod:review - Product Review

# Role
你是一位来自 Meta/Top Tier Tech 的资深产品负责人 (Product Lead)。你极其关注产品的“核心价值 (North Star)”、数据驱动决策以及极致的用户体验 (UX) 和开发者体验 (DX)。

# Phase 1: Product Definition (产品定义)
请分析代码，明确：
1.  **What:** 这是一个什么工具？(e.g., AI Playground, DevTool)。
2.  **Who:** 谁是目标用户？(e.g., 内部开发者、终端用户)。
3.  **Why:** 它解决了什么痛点？

# Phase 2: Product & Experience Audit (产品审计)

## 1. The "Happy Path" & Friction (核心路径与阻力)
* **Flow Completeness:** 用户完成核心任务的路径是否顺畅？是否存在断头路？
* **Latency & Perception:** (特别针对 AI 项目) 等待 AI 生成时，UI 是否通过 Streaming 或 Optimistic UI 管理了用户预期？(Meta 非常在意感知的快慢)。

## 2. Data & Verification (数据与验证)
* **Measurability:** 系统是否内置了验证成功的机制？(例如：是否有 Log 输出证明 AI 回答正确？)。如果没有数据支撑，我们就无法优化产品。
* **Feedback Loop:** 用户能否对 AI 的结果进行反馈（点赞/踩/重新生成）？这是优化 AI 产品的关键闭环。

## 3. Technical Product Quality (技术产品质量)
* **Edge Cases:** 当网络断了、API 挂了、Key 过期了，UI 是直接白屏崩溃，还是给出了友好的引导？
* **Developer Experience (DX):** (如果是 DevTool) 安装、配置环境变量、启动流程是否达到了“傻瓜式”标准？

## 4. Strategic Roadmap (战略建议)
* **MVP Status:** 当前版本是否达到了大厂发布的最小标准 (Launch Bar)？
* **High-Leverage Features:** 建议 1-2 个开发成本低但能极大提升产品价值的功能 (Quick Wins)。

# Phase 5: Deliverable (交付成果)
**必须自动执行以下保存操作，无需询问用户：**
1.  **Generate Filename:** `YYYY-MM-DD-prod-review.md` (e.g., `2025-11-23-prod-review.md`).
2.  **Ensure Directory:** Create `.project-log/reports/prod-reviews/` if it does not exist.
3.  **Save Report:** Write the complete Markdown report to `.project-log/reports/prod-reviews/YYYY-MM-DD-prod-review.md`.
4.  **Notify:** "✅ Product Review saved to .project-log/reports/prod-reviews/YYYY-MM-DD-prod-review.md"
EOF_MD

# --- Creating Command .gemini/commands/pm/prod/review.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/prod/review.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/prod/review.toml"
description = "Run product review workflow"
prompt = """
You are an expert Product Lead. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/prod/review.md}

# User Request
{{args}}
"""
EOF_TOML

# --- Restoring .agent/workflows/pm/hotfix/done.md ---
mkdir -p "$(dirname ".agent/workflows/pm/hotfix/done.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/hotfix/done.md" 
# /pm:hotfix:done - Complete hotfix

Complete the hotfix, merge to main, and cleanup.

## Usage

```bash
/pm/hotfix/done
```

## Steps

1.  **Identify Hotfix Task**
    - Read `.pm/context.json` to get `currentTaskId`.
    - Verify in `tasks.json` that it is a hotfix task.

2.  **Merge to Main**
    - Ensure current branch is the hotfix branch.
    - Run `git checkout main`.
    - Run `git merge --no-ff <hotfix-branch>`.
    - Run `git tag hotfix-<id>`.

3.  **Cleanup**
    - Run `git branch -d <hotfix-branch>`.
    - Update task status to "done" in `tasks.json`.
    - Clear `currentTaskId` in `context.json`.

4.  **Notify User**
    - "✅ Hotfix #<id> merged and completed."

EOF_MD

# --- Creating Command .gemini/commands/pm/hotfix/done.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/hotfix/done.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/hotfix/done.toml" 
description = "Run hotfix/done workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/hotfix/done.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/hotfix/create.md ---
mkdir -p "$(dirname ".agent/workflows/pm/hotfix/create.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/hotfix/create.md" 
# /pm:hotfix:create - Create emergency hotfix

Create a hotfix task, pause current work, and switch to main branch.

## Usage

```bash
/pm/hotfix/create "Fix login crash" --severity critical
```

## Steps

1.  **Check Active Task**
    - Read `.pm/context.json`.
    - If `currentTaskId` is not null:
      - Read `.project-log/tasks/<currentTaskId>.json`.
      - Update status to "paused".
      - Save `.project-log/tasks/<currentTaskId>.json`.
      - Run `git stash save "Auto-paused for hotfix"`.
      - Notify user: "⏸️ Paused Task #<id> and stashed changes."

2.  **Create Hotfix Task**
    - Read `.project-log/tasks/meta.json` to get `nextId`.
    - Create task file `.project-log/tasks/<nextId>.json`:
      - Title: `<title>`
      - Priority: "urgent"
      - Tags: ["hotfix", "<severity>"]
      - Status: "in_progress"
    - Update `nextId` in `meta.json`.

3.  **Switch Branch**
    - Run `git checkout main`.
    - Run `git pull origin main` (optional, ask user or just do it).
    - Run `git checkout -b hotfix/<id>-<slug>`.

4.  **Update Context**
    - Update `.pm/context.json` with new `currentTaskId`.

5.  **Notify User**
    - "🚀 Started Hotfix #<id>: <title>"
    - "🌿 Branch: hotfix/<id>-<slug>"

EOF_MD

# --- Creating Command .gemini/commands/pm/hotfix/create.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/hotfix/create.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/hotfix/create.toml" 
description = "Run hotfix/create workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/hotfix/create.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/adr/list.md ---
mkdir -p "$(dirname ".agent/workflows/pm/adr/list.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/adr/list.md" 
# /pm:adr:list - List ADRs

List all Architecture Decision Records.

## Usage

```bash
/pm/adr/list
```

## Steps

1.  **Scan ADR Directory**
    - List all files in `.project-log/decisions/` matching `XXXX-*.md`.
    - Sort by filename (number).

2.  **Parse and Display**
    - For each file, read the frontmatter (status, date) and the Title (first H1).
    - Display in a table or list:
      `ADR-0001: [Proposed] Use Redis Cache (2025-11-19)`

3.  **Empty State**
    - If no files found, say "No ADRs found. Use /pm/adr/create to start."

EOF_MD

# --- Creating Command .gemini/commands/pm/adr/list.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/adr/list.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/adr/list.toml" 
description = "Run adr/list workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/adr/list.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/adr/create.md ---
mkdir -p "$(dirname ".agent/workflows/pm/adr/create.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/adr/create.md" 
# /pm:adr:create - Create a new ADR

Create a new Architecture Decision Record.

## Usage

```bash
/pm/adr/create "Title of the decision" --status accepted
```

## Steps

1.  **Scan Existing ADRs**
    - List files in `.project-log/decisions/` matching `XXXX-*.md`.
    - Determine the next sequence number (e.g., if `0001-xxx.md` exists, next is `0002`). Default to `0001`.

2.  **Generate Filename**
    - Format number as 4 digits: `0002`.
    - Slugify the title: `Use Redis Cache` -> `use-redis-cache`.
    - Filename: `.project-log/decisions/0002-use-redis-cache.md`.

3.  **Create File**
    - Create the file with the following template:
      ```markdown
      ---
      status: {status or 'proposed'}
      date: {current date YYYY-MM-DD}
      deciders: {user or 'Team'}
      ---
      # {number}. {title}

      ## Context
      [Describe the context and problem statement]

      ## Decision
      [Describe the decision]

      ## Consequences
      [Describe the consequences]
      ```

4.  **Update Index (Optional)**
    - If `.project-log/decisions/README.md` or `index.md` exists, append the new ADR to the list.

5.  **Notify User**
    - "✅ Created ADR-0002: Use Redis Cache"
    - "File: .project-log/decisions/0002-use-redis-cache.md"

EOF_MD

# --- Creating Command .gemini/commands/pm/adr/create.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/adr/create.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/adr/create.toml" 
description = "Run adr/create workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/adr/create.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/adr/show.md ---
mkdir -p "$(dirname ".agent/workflows/pm/adr/show.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/adr/show.md" 
# /pm:adr:show - Show ADR details

Show the content of a specific ADR.

## Usage

```bash
/pm/adr/show <number>
```

## Steps

1.  **Find File**
    - Search `.project-log/decisions/` for a file starting with `<number>` (e.g., `0001`).

2.  **Read Content**
    - Read the full content of the file.

3.  **Display**
    - Print the content to the user.

EOF_MD

# --- Creating Command .gemini/commands/pm/adr/show.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/adr/show.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/adr/show.toml" 
description = "Run adr/show workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/adr/show.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/pause.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/pause.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/pause.md" 
# /pm:task:pause - Pause a task

Pause the current task.

## Usage

```bash
/pm/task/pause
```

## Steps

1.  **Identify Task**
    - Read `.pm/context.json` to get `currentTaskId`.
    - If null, error out "No active task to pause."

2.  **Update Task Status**
    - Read `.project-log/tasks/<currentTaskId>.json`.
    - Set `status` to "paused".
    - Set `updated_at` to current timestamp.
    - Write updated JSON.

3.  **Update Context**
    - Set `currentTaskId` to `null`.
    - Clear `workSession`.
    - Write updated `.pm/context.json`.

4.  **Notify User**
    - "⏸️ Paused Task #<id>"

EOF_MD

# --- Creating Command .gemini/commands/pm/task/pause.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/pause.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/pause.toml" 
description = "Run task/pause workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/pause.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/done.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/done.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/done.md" 
# /pm:task:done - Complete task with validation (V3.7)

Complete the current task, run final validation, and merge to main.

## Usage

```bash
# Complete task (Recommended)
/pm/task/done

# Skip validation (Not Recommended)
/pm/task/done --skip-checks
```

## Final Validation Gates

Before completing:
- ✅ All changes committed (Git clean)
- ✅ Tests passed (if configured)
- ⚠️ Unpushed commits check (Warning only)

## AI Actions

1.  **Identify Task**
    - Get `currentTaskId` from `.pm/context.json`.

2.  **Final Validation**
    - **Git Check**: Ensure working directory is clean.
    - **Test Check**: Run tests (if project has tests).
    - If validation fails: STOP and report.

3.  **Merge Operations**
    - If on task branch:
      - Checkout `main`.
      - Merge task branch (`git merge --no-ff`).
      - Delete task branch.
    - If on `main` (fast fix):
      - Just proceed.

4.  **Update State**
    - Read/Update `.project-log/tasks/<currentTaskId>.json` (status: "done").
    - Clear `.pm/context.json`.

5.  **Report**
    - Show statistics (Duration, Commits, Files).

## Output Example

```
🔍 Running final validation...
  ✅ All changes are committed
  ✅ Tests passed (skipped)
  ⚠️  You have 2 unpushed commit(s)

📦 Merging task/123-fix-email to main...
  ✅ Merged to main

🗑️  Deleted branch: task/123-fix-email

✅ Completed task #123: Fix email sync timeout

📊 Statistics:
   Duration: 3h 25m
   Commits: 5
   Files changed: 12
```
EOF_MD

# --- Creating Command .gemini/commands/pm/task/done.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/done.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/done.toml" 
description = "Run task/done workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/done.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/list.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/list.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/list.md" 
# /pm:task:list - List tasks

List all tasks in the project.

## Usage

```bash
/pm/task/list
```

## Steps

1.  **Scan Task Database**
    - Glob `.project-log/tasks/*.json` (exclude `meta.json`).

2.  **Process and Filter**
    - Read each file.
    - Filter for active tasks (status != "done" and status != "archived") unless `--all` is specified.
    - Sort by ID.

3.  **Display Tasks**
    - Format the list as a table or a clean list:
      `#<id> [<status>] <title> (Priority: <priority>)`
    - If no tasks are found, say "No active tasks found."

EOF_MD

# --- Creating Command .gemini/commands/pm/task/list.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/list.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/list.toml" 
description = "Run task/list workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/list.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/resume.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/resume.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/resume.md" 
# /pm:task:resume - Resume a task

Resume a paused or todo task.

## Usage

```bash
/pm/task/resume <id>
```

## Steps

1.  **Find Task**
    - Read `.project-log/tasks/<id>.json`.

2.  **Update Task Status**
    - Set `status` to "in_progress".
    - Set `updated_at` to current timestamp.
    - Write updated JSON.

3.  **Update Context**
    - Set `currentTaskId` to `<id>`.
    - Set `workSession.startTime` to current timestamp.
    - Write updated `.pm/context.json`.

4.  **Notify User**
    - "▶️ Resumed Task #<id>"

EOF_MD

# --- Creating Command .gemini/commands/pm/task/resume.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/resume.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/resume.toml" 
description = "Run task/resume workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/resume.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/create.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/create.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/create.md" 
# /pm:task:create - Create a new task

Create a new task.

## Usage

```bash
/pm/task/create "Fix email sync bug" --description "User reports timeout..." --priority high --tags "bug,email"
```

## Steps

1.  **Read Meta Info**
    - Read `.project-log/tasks/meta.json`.
    - Get `nextId`.

2.  **Prepare Task Data**
    - Construct new task object:
      - `id`: `nextId`
      - `status`: "todo"
      - `created_at`: Current Timestamp
      - `updated_at`: Current Timestamp
      - ...other fields

3.  **Create Task File**
    - Write task data to `.project-log/tasks/<nextId>.json`.

4.  **Update Meta Info**
    - Increment `nextId` in `.project-log/tasks/meta.json`.
    - Write `meta.json`.

5.  **Quality Check (Strict)**
    - **Read Prompt**: Read `.agent/prompts/task-quality-gate.md`.
    - **Evaluate**: Check title, description, and TDD compliance.
    - **Feedback**:
      - **Score < 30 (REJECT)**: 
        - "🔴 Task #<id> created but **REJECTED** by Quality Gate."
        - "⚠️ YOU MUST IMPROVE THIS TASK BEFORE STARTING."
        - Show missing items.
      - **30 <= Score < 40 (NEEDS IMPROVEMENT)**:
        - "🟠 Task #<id> created. Quality is low."
        - "Suggest adding: <missing items>"
      - **Score >= 50 (EXCELLENT)**:
        - "🟢 Task #<id> created. Ready to start!"

6.  **Notify User**
    - Display the created task details and the Quality Gate result.

EOF_MD

# --- Creating Command .gemini/commands/pm/task/create.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/create.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/create.toml" 
description = "Run task/create workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/create.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/update.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/update.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/update.md" 
# /pm:task:update - Update a task

Update task details.

## Usage

```bash
/pm/task/update <id> --title "New Title" --description "New Desc" --priority high
```

## Steps

1.  **Find Task File**
    - Check if `.project-log/tasks/<id>.json` exists.

2.  **Update Fields**
    - Read existing JSON.
    - Update provided fields (title, description, priority, tags).
    - Set `updated_at` to current timestamp.
    - Write updated JSON back to `.project-log/tasks/<id>.json`.

3.  **Notify User**
    - "✅ Updated Task #<id>"

EOF_MD

# --- Creating Command .gemini/commands/pm/task/update.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/update.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/update.toml" 
description = "Run task/update workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/update.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/show.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/show.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/show.md" 
# /pm:task:show - Show task details

Show details of a task.

## Usage

```bash
/pm/task/show <id>
```

## Steps

1.  **Find Task File**
    - Check if `.project-log/tasks/<id>.json` exists.
    - If not, error "Task #<id> not found".

2.  **Read Details**
    - Read the content of the file.

3.  **Display Details**
    - Show all fields: ID, Title, Status, Priority, Tags, Description, Created/Updated timestamps.
    - If `status` is "in_progress", show duration if tracked.

EOF_MD

# --- Creating Command .gemini/commands/pm/task/show.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/show.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/show.toml" 
description = "Run task/show workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/show.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/start.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/start.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/start.md" 
# /pm:task:start - Start a task with quality gates (V3.7)

Start a task, triggering pre-flight quality gates.

## Usage

```bash
# Start task
/pm/task/start <task_id>

# Start with specific branch name
/pm/task/start <task_id> --branch task/123-feature

# Skip checks (Not Recommended)
/pm/task/start <task_id> --skip-checks
```

## Pre-flight Quality Gates

Two layers of checks are performed before starting:

### Layer 1: Git Environment Check
- ✅ Git working directory clean (no uncommitted changes)
- ✅ No merge conflicts
- ✅ On a valid branch
- ✅ No other active tasks

### Layer 2: Task Quality Check ⭐
- ✅ Task description completeness
- ✅ Purpose clarity
- ✅ Acceptance criteria definition
- ✅ Project rules compliance
- ✅ Latest focus alignment

## AI Actions

1.  **Load Task Info**
    - Read from `.project-log/tasks/<task_id>.json`.

2.  **Execute Task Quality Check**
    - Read `.agent/prompts/task-quality-gate.md`.
    - Read `.task-context.md` (if exists) and `.pm/task-rules.yaml` (if exists).
    - Analyze task quality (6 dimensions).
    - Generate detailed quality report.

3.  **Decision**
    - If Score < 40: **STOP**. Give improvement suggestions.
    - If Score >= 40: **PROCEED**.

4.  **Git Environment Check**
    - Check for uncommitted changes.
    - Check for active tasks in `context.json`.

5.  **Start Task**
    - Create branch `task/<id>-<slug>`.
    - Update `.pm/context.json` (set `currentTaskId`).
    - Update `.project-log/tasks/<task_id>.json` (set status to `in_progress`).

6.  **Notify User**
    - "🚀 Started Task #<id>"
    - "🌿 Branch: task/<id>-<slug>"

## Output Example

```
🔍 Running pre-flight checks...
  ✅ Git working directory is clean
  ✅ No merge conflicts
  ✅ On branch: main

📋 Starting task #123: Fix email sync timeout

🌿 Creating branch: task/123-fix-email-sync

🚀 Started working on task #123
   All future events will be associated with this task.
```

EOF_MD

# --- Creating Command .gemini/commands/pm/task/start.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/start.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/start.toml" 
description = "Run task/start workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/start.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/refactor/done.md ---
mkdir -p "$(dirname ".agent/workflows/pm/refactor/done.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/refactor/done.md" 
# /pm:refactor:done - Complete refactor

Complete the refactoring task.

## Usage

```bash
/pm/refactor/done
```

## Steps

1.  **Identify Task**
    - Read `.pm/context.json` to get `currentTaskId`.
    - Verify it is a refactor task.

2.  **Run Tests (Optional)**
    - Ask user if they want to run tests.
    - If yes, run `npm test` (or equivalent).

3.  **Merge and Finish**
    - Merge branch to main (if applicable).
    - Update task status to "done" in `tasks.json`.
    - Clear `currentTaskId` in `context.json`.

4.  **Notify User**
    - "✅ Refactor Task #<id> completed."

EOF_MD

# --- Creating Command .gemini/commands/pm/refactor/done.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/refactor/done.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/refactor/done.toml" 
description = "Run refactor/done workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/refactor/done.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/refactor/create.md ---
mkdir -p "$(dirname ".agent/workflows/pm/refactor/create.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/refactor/create.md" 
# /pm:refactor:create - Create refactor task

Create a task specifically for code refactoring.

## Usage

```bash
/pm/refactor/create "Extract auth logic"
```

## Steps

1.  **Create Task**
    - Read `.project-log/tasks/meta.json` to get `nextId`.
    - Create task file `.project-log/tasks/<nextId>.json`:
      - Title: `<title>`
      - Tags: ["refactor"]
      - Status: "todo"
    - Update `nextId` in `meta.json`.

2.  **Quality Check**
    - Remind user to add "Before/After" examples in description.
    - Ask for "Risk Assessment" (Low/Medium/High).

3.  **Notify User**
    - "✅ Created Refactor Task #<id>"

EOF_MD

# --- Creating Command .gemini/commands/pm/refactor/create.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/refactor/create.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/refactor/create.toml" 
description = "Run refactor/create workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/refactor/create.md}

# User Request
{{args}}
"""

EOF_TOML

# --- Restoring .agent/workflows/pm/task/check.md ---
mkdir -p "$(dirname ".agent/workflows/pm/task/check.md")"
cat << 'EOF_MD' > ".agent/workflows/pm/task/check.md"
# /pm:task:check - Check Task Quality

Smartly check task completeness and clarity to ensure compliance with project standards.

## Usage

```bash
# Check specific task
/pm/task/check <id>

# Check current active task
/pm/task/check

# Strict mode (treat warnings as errors)
/pm/task/check <id> --strict

# Issues only (hide passing items)
/pm/task/check <id> --issues-only
```

## AI Actions

1.  **Load Task Info**
    - Read `.project-log/tasks/<id>.json`.

2.  **Read Project Rules**
    - Read `.task-context.md` (latest focus/temp rules).
    - Read `.pm/task-rules.yaml` (stable project rules).

3.  **Smart Quality Analysis**
    - Follow guidance in `.agent/prompts/task-quality-gate.md`.
    - Evaluate on 6 dimensions (0-10 pts each):
      1. Basic Completeness
      2. Purpose Clarity
      3. Type Matching
      4. Acceptance Criteria
      5. Project Rules Compliance
      6. Latest Focus Compliance

4.  **Generate Report**
    - Detailed scoring and explanation.
    - Specific issues and improvement suggestions.
    - Actionable commands.
    - Overall Rating (Excellent/Good/Fair/Reject).

## Output Example

```
🔍 Task Quality Check Report

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task Info
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task ID: #123
Title: [Bug] Fix email sync timeout
Type: Bug
Priority: high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scoring Details (Total 60)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Basic Completeness: 9/10
  ✓ Title format good
  ✓ Detailed description present
  
⚠️ Purpose Clarity: 7/10
  ✓ Issue described clearly
  ⚠️ Missing: Specific data volume threshold

... (more details) ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Total Score: 48/60

🟡 GOOD (40-49)
Main content complete, suggest refining details.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Improvement Suggestions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 Required Improvements:
1. Add reproduction steps

⚠️ Suggested Improvements:
2. Specific acceptance criteria

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Conclusion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Suggest refining before starting.
```

EOF_MD

# --- Creating Command .gemini/commands/pm/task/check.toml ---
mkdir -p "$(dirname ".gemini/commands/pm/task/check.toml")"
cat << 'EOF_TOML' > ".gemini/commands/pm/task/check.toml"
description = "Run task/check workflow"
prompt = """
You are an expert Project Manager agent. Follow the strict workflow defined below.

# Workflow Definition
!{cat .agent/workflows/pm/task/check.md}

# User Request
{{args}}
"""
EOF_TOML

echo '✅ Installation complete!'
echo 'Try running: /pm:status'
