# /pm:task:list - List tasks

List all tasks in the project.

## Usage

```bash
/pm/task/list
```

## Steps

1.  **Read Task Database**
    Read the content of `.project-log/tasks/tasks.json`.

2.  **Format Output**
    - Parse the JSON.
    - Filter for active tasks (status != "done" and status != "archived") unless `--all` is specified (if you want to support flags, otherwise just list active).
    - Format the list as a table or a clean list:
      `#<id> [<status>] <title> (Priority: <priority>)`

3.  **Display Tasks**
    - Print the formatted list to the user.
    - If no tasks are found, say "No active tasks found."

