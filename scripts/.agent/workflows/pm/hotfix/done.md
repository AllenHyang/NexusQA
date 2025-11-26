# /pm:hotfix:done - Complete hotfix

Complete the hotfix, merge to main, and cleanup.

## Usage

```bash
/pm/hotfix/done
```

## Steps

1.  **Identify Hotfix Task**
    - Read `.pm/context.json` to get `currentTaskId`.
    - Verify in `tasks.json` that it is a hotfix task.

2.  **Merge to Main**
    - Ensure current branch is the hotfix branch.
    - Run `git checkout main`.
    - Run `git merge --no-ff <hotfix-branch>`.
    - Run `git tag hotfix-<id>`.

3.  **Cleanup**
    - Run `git branch -d <hotfix-branch>`.
    - Update task status to "done" in `tasks.json`.
    - Clear `currentTaskId` in `context.json`.

4.  **Notify User**
    - "✅ Hotfix #<id> merged and completed."

