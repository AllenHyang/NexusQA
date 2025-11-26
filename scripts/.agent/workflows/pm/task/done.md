# /pm:task:done - Complete a task

Mark a task as completed, run tests, and merge changes.

## Usage

```bash
/pm/task/done <id>
```

## Steps

1.  **Identify Task**
    - Get `currentTaskId` from `.pm/context.json` or argument.

2.  **Automated Testing**
    - **Detect Project Type**:
      - If `package.json` exists: `npm test`
      - If `pom.xml` exists: `mvn test`
      - If `go.mod` exists: `go test ./...`
      - If `pytest.ini` or `requirements.txt` exists: `pytest`
      - If `Cargo.toml` exists: `cargo test`
    - **Run Test**: Execute the detected command.
    - **Failure Handling**:
      - If tests fail, **STOP**.
      - "❌ Tests failed. Please fix them before completing the task."

3.  **Git Operations**
    - **Check Branch**: Confirm we are on the task branch.
    - **Commit**: Ensure clean working directory.
    - **Checkout Main**: `git checkout main`.
    - **Merge**: `git merge --no-ff <task-branch>`.
    - **Conflict Handling**:
      - If merge fails (exit code != 0):
        - **STOP**.
        - "⚠️ Merge conflicts detected."
        - "Please resolve conflicts manually, then run `/pm/task/done` again."
        - (Optional) Restore state if needed, or leave in merging state for user to fix.

4.  **Cleanup & Update**
    - **Delete Branch**: `git branch -d <task-branch>` (only if merge successful).
    - **Update Status**: Set `status` to "done" in `tasks.json`.
    - **Clear Context**: Clear `currentTaskId` in `context.json`.

5.  **Notify User**
    - "✅ Completed Task #<id>"
    - "🧪 Tests passed"
    - "🔀 Merged to main"

