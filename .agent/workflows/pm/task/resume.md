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

