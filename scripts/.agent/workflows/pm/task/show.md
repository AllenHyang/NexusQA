# /pm:task:show - Show task details

Show details of a task.

## Usage

```bash
/pm/task/show <id>
```

## Steps

1.  **Read Task Database**
    Read `.project-log/tasks/tasks.json`.

2.  **Find Task**
    Find task by `<id>`.

3.  **Display Details**
    - Show all fields: ID, Title, Status, Priority, Tags, Description, Created/Updated timestamps.
    - If `status` is "in_progress", maybe show duration if tracked (optional).

