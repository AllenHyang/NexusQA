# /pm:refactor:done - Complete refactor

Complete the refactoring task.

## Usage

```bash
/pm/refactor/done
```

## Steps

1.  **Identify Task**
    - Read `.pm/context.json` to get `currentTaskId`.
    - Verify it is a refactor task.

2.  **Run Tests (Optional)**
    - Ask user if they want to run tests.
    - If yes, run `npm test` (or equivalent).

3.  **Merge and Finish**
    - Merge branch to main (if applicable).
    - Update task status to "done" in `tasks.json`.
    - Clear `currentTaskId` in `context.json`.

4.  **Notify User**
    - "✅ Refactor Task #<id> completed."

