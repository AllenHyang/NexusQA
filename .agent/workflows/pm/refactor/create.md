# /pm:refactor:create - Create refactor task

Create a task specifically for code refactoring.

## Usage

```bash
/pm/refactor/create "Extract auth logic"
```

## Steps

1.  **Create Task**
    - Read `.project-log/tasks/meta.json` to get `nextId`.
    - Create task file `.project-log/tasks/<nextId>.json`:
      - Title: `<title>`
      - Tags: ["refactor"]
      - Status: "todo"
    - Update `nextId` in `meta.json`.

2.  **Quality Check**
    - Remind user to add "Before/After" examples in description.
    - Ask for "Risk Assessment" (Low/Medium/High).

3.  **Notify User**
    - "✅ Created Refactor Task #<id>"

