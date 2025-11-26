# /pm:task:create - Create a new task

Create a new task.

## Usage

```bash
/pm/task/create "Fix email sync bug" --description "User reports timeout" --priority high --tags "bug,email"
```

## Steps

1.  **Read Task Database**
    - Read `.project-log/tasks/tasks.json`.

2.  **Prepare Task Data**
    - Get `nextId`.
    - Construct new task object (status: "todo").

3.  **Create Task**
    - Append task to `tasks.json`.
    - Increment `nextId`.
    - Write `tasks.json`.

4.  **Quality Check (Advisory)**
    - **Read Prompt**: Read `.agent/prompts/task-quality-gate.md`.
    - **Evaluate**: Check title and description.
    - **Feedback**:
      - If Score < 30: "⚠️ Task created, but quality is low. You will need to improve it before starting."
      - If Score >= 30: "✅ Task created."

5.  **Notify User**
    - "✅ Created Task #<id>"
    - Show advisory warning if applicable.

