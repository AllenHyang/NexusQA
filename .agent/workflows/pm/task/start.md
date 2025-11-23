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
    - Read from `.project-log/tasks/tasks.json`.

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
    - Update `tasks.json` (set status to `in_progress`).

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

