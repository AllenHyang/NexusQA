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
      - Read `.project-log/tasks/tasks.json` to find the task.
      - Update its status to "paused".
      - Run `git stash save "Auto-paused for hotfix"`.
      - Notify user: "⏸️ Paused Task #<id> and stashed changes."

2.  **Create Hotfix Task**
    - Read `.project-log/tasks/tasks.json`.
    - Create new task:
      - Title: `<title>`
      - Priority: "urgent"
      - Tags: ["hotfix", "<severity>"]
      - Status: "in_progress"
    - Save to `tasks.json`.

3.  **Switch Branch**
    - Run `git checkout main`.
    - Run `git pull origin main` (optional, ask user or just do it).
    - Run `git checkout -b hotfix/<id>-<slug>`.

4.  **Update Context**
    - Update `.pm/context.json` with new `currentTaskId`.

5.  **Notify User**
    - "🚀 Started Hotfix #<id>: <title>"
    - "🌿 Branch: hotfix/<id>-<slug>"

