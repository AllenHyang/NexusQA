# /pm:task:show - Show task details

Show details of a task.

## Usage

```bash
/pm/task/show <id>
```

## Steps

1.  **Find Task File**
    - Check if `.project-log/tasks/<id>.json` exists.
    - If not, error "Task #<id> not found".

2.  **Read Details**
    - Read the content of the file.

3.  **Display Details**
    - Show all fields: ID, Title, Status, Priority, Tags, Description, Created/Updated timestamps.
    - If `status` is "in_progress", show duration if tracked.

