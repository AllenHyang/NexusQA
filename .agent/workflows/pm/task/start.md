# /pm:task:start - Start a task

Start working on a task with strict checks and context syncing.

## Usage

```bash
/pm/task/start <id>
```

## Steps

1.  **Context Sync & Pre-flight**
    - **Auto-Sync**:
      - Get current branch: `git branch --show-current`.
      - If branch matches `task/<id>-*`:
        - Check if `context.json` matches this ID.
        - If not, update `context.json` to reflect this active task.
        - Notify: "🔄 Synced context to Task #<id> from git branch."
    - **Check Active Task**: If `context.json` has a *different* active task, STOP.
    - **Check Git Status**: `git status --porcelain`. If dirty, STOP.

2.  **Read Task Database**
    - Read `.project-log/tasks/tasks.json`.
    - Find task with `<id>`.

3.  **Quality Gate (Strict)**
    - Read `.agent/prompts/task-quality-gate.md`.
    - Evaluate task.
    - **Rule**:
      - If Score < 30: **STOP**. "🔴 Task quality is too low to start. Please run `/pm:task:update` to add details."
      - If Score < 40: **WARN**. "🟠 Task quality is low. Are you sure you want to start? (Proceeding...)"

4.  **Update Task Status**
    - Set `status` to "in_progress".
    - Write `tasks.json`.

5.  **Update Context**
    - Update `.pm/context.json`.

6.  **Git Operations**
    - Checkout/Create branch `task/<id>-<slug>`.

7.  **Notify User**
    - "🚀 Started Task #<id>"

