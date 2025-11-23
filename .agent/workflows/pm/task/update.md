# /pm:task:update - Update a task

Update task details.

## Usage

```bash
/pm/task/update <id> --title "New Title" --description "New Desc" --priority high
```

## Steps

1.  **Read Task Database**
    Read `.project-log/tasks/tasks.json`.

2.  **Find Task**
    Find task by `<id>`.

3.  **Update Fields**
    - Update provided fields (title, description, priority, tags).
    - Set `updated_at` to current timestamp.
    - Write updated JSON.

4.  **Notify User**
    - "✅ Updated Task #<id>"

