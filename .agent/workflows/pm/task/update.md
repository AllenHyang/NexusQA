# /pm:task:update - Update a task

Update task details.

## Usage

```bash
/pm/task/update <id> --title "New Title" --description "New Desc" --priority high
```

## Steps

1.  **Find Task File**
    - Check if `.project-log/tasks/<id>.json` exists.

2.  **Update Fields**
    - Read existing JSON.
    - Update provided fields (title, description, priority, tags).
    - Set `updated_at` to current timestamp.
    - Write updated JSON back to `.project-log/tasks/<id>.json`.

3.  **Notify User**
    - "✅ Updated Task #<id>"

