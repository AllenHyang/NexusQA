# /pm:task:done - Complete task with validation (V3.7)

Complete the current task, run final validation, and merge to main.

## Usage

```bash
# Complete task (Recommended)
/pm/task/done

# Skip validation (Not Recommended)
/pm/task/done --skip-checks
```

## Final Validation Gates

Before completing:
- ✅ All changes committed (Git clean)
- ✅ Tests passed (if configured)
- ⚠️ Unpushed commits check (Warning only)

## AI Actions

1.  **Identify Task**
    - Get `currentTaskId` from `.pm/context.json`.

2.  **Final Validation**
    - **Git Check**: Ensure working directory is clean.
    - **Test Check**: Run tests (if project has tests).
    - If validation fails: STOP and report.

3.  **Merge Operations**
    - If on task branch:
      - Checkout `main`.
      - Merge task branch (`git merge --no-ff`).
      - Delete task branch.
    - If on `main` (fast fix):
      - Just proceed.

4.  **Update State**
    - Update `tasks.json` (status: "done").
    - Clear `.pm/context.json`.

5.  **Report**
    - Show statistics (Duration, Commits, Files).

## Output Example

```
🔍 Running final validation...
  ✅ All changes are committed
  ✅ Tests passed (skipped)
  ⚠️  You have 2 unpushed commit(s)

📦 Merging task/123-fix-email to main...
  ✅ Merged to main

🗑️  Deleted branch: task/123-fix-email

✅ Completed task #123: Fix email sync timeout

📊 Statistics:
   Duration: 3h 25m
   Commits: 5
   Files changed: 12
```
