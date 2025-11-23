# /pm:task:create - Create a new task

Create a new task.

## Usage

```bash
/pm/task/create "Fix email sync bug" --description "User reports timeout..." --priority high --tags "bug,email"
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

4.  **Quality Check (Strict)**
    - **Read Prompt**: Read `.agent/prompts/task-quality-gate.md`.
    - **Evaluate**: Check title, description, and TDD compliance.
    - **Feedback**:
      - **Score < 30 (REJECT)**: 
        - "🔴 Task #<id> created but **REJECTED** by Quality Gate."
        - "⚠️ YOU MUST IMPROVE THIS TASK BEFORE STARTING."
        - Show missing items.
      - **30 <= Score < 40 (NEEDS IMPROVEMENT)**:
        - "🟠 Task #<id> created. Quality is low."
        - "Suggest adding: <missing items>"
      - **Score >= 50 (EXCELLENT)**:
        - "🟢 Task #<id> created. Ready to start!"

5.  **Notify User**
    - Display the created task details and the Quality Gate result.

