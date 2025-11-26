# /pm:refactor:create - Create refactor task

Create a task specifically for code refactoring.

## Usage

```bash
/pm/refactor/create "Extract auth logic"
```

## Steps

1.  **Create Task**
    - Read `.project-log/tasks/tasks.json`.
    - Create new task:
      - Title: `<title>`
      - Tags: ["refactor"]
      - Status: "todo"
    - Save to `tasks.json`.

2.  **Quality Check**
    - Remind user to add "Before/After" examples in description.
    - Ask for "Risk Assessment" (Low/Medium/High).

3.  **Notify User**
    - "✅ Created Refactor Task #<id>"

