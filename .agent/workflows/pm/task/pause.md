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

