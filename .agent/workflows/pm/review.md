# /pm:review - Daily Work Review

Review today's work and generate a summary.

## Usage

```bash
/pm/review
```

## Steps

1.  **Identify Date**
    - Get current date: `YYYY-MM-DD`.

2.  **Scan Tasks**
    - Read `.project-log/tasks/tasks.json`.
    - Find tasks where `updated_at` matches today's date.
    - Group by status (Completed, In Progress, Created).

3.  **Scan Daily Log**
    - Check if `.project-log/daily-logs/<YYYY-MM-DD>.md` exists.
    - If yes, read it to see what's already logged.

4.  **Generate Summary**
    - Create a summary report:
      ```markdown
      # Daily Review: <YYYY-MM-DD>

      ## 📅 Tasks Updated
      - [Done] Task #12: Fix email sync
      - [In Progress] Task #13: Refactor auth

      ## 📝 Daily Log
      (Content from daily log if exists, or "No manual logs found.")

      ## 💡 Know-How Candidates
      (Ask user if they learned anything worth saving)
      ```

5.  **Display Report**
    - Show the summary to the user.
    - Ask if they want to save this to the daily log file (if not already there).

6.  **Save (Optional)**
    - If user agrees, append/write to `.project-log/daily-logs/<YYYY-MM-DD>.md`.

