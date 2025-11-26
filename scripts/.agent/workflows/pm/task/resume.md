# /pm:task:resume - Resume a task

Resume a paused or todo task.

## Usage

```bash
/pm/task/resume <id>
```

## Steps

1.  **Read Task Database**
    Read `.project-log/tasks/tasks.json`.

2.  **Find Task**
    Find task by `<id>`.

3.  **Update Task Status**
    - Set `status` to "in_progress".
    - Set `updated_at` to current timestamp.
    - Write updated JSON.

4.  **Update Context**
    - Set `currentTaskId` to `<id>`.
    - Set `workSession.startTime` to current timestamp.
    - Write updated `.pm/context.json`.

5.  **Notify User**
    - "▶️ Resumed Task #<id>"

