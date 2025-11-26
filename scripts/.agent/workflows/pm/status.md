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
    - Read `.project-log/tasks/tasks.json` and count tasks by status (todo, in_progress, done).

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

