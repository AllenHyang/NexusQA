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

