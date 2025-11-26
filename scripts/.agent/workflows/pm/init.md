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

2.  **Initialize tasks.json**
    Check if `.project-log/tasks/tasks.json` exists. If not, create it with initial content:
    ```json
    {
      "tasks": [],
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

