# /pm:task:create - Create a new task

Create a new task.

## Usage

```bash
/pm/task/create "Fix email sync bug" --description "User reports timeout..." --priority high --tags "bug,email"
```

## Steps

1.  **Read Meta Info**
    - Read `.project-log/tasks/meta.json`.
    - Get `nextId`.

2.  **Prepare Task Data**
    - Construct new task object:
      - `id`: `nextId`
      - `status`: "todo"
      - `created_at`: Current Timestamp
      - `updated_at`: Current Timestamp
      - ...other fields

3.  **Create Task File**
    - Write task data to `.project-log/tasks/<nextId>.json`.

4.  **Update Meta Info**
    - Increment `nextId` in `.project-log/tasks/meta.json`.
    - Write `meta.json`.

5.  **Quality Check (Strict)**
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

6.  **Notify User**
    - Display the created task details and the Quality Gate result.

