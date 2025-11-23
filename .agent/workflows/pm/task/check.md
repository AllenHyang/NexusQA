# /pm:task:check - Check Task Quality

Smartly check task completeness and clarity to ensure compliance with project standards.

## Usage

```bash
# Check specific task
/pm/task/check <id>

# Check current active task
/pm/task/check

# Strict mode (treat warnings as errors)
/pm/task/check <id> --strict

# Issues only (hide passing items)
/pm/task/check <id> --issues-only
```

## AI Actions

1.  **Load Task Info**
    - Read `.project-log/tasks/<id>.json`.

2.  **Read Project Rules**
    - Read `.task-context.md` (latest focus/temp rules).
    - Read `.pm/task-rules.yaml` (stable project rules).

3.  **Smart Quality Analysis**
    - Follow guidance in `.agent/prompts/task-quality-gate.md`.
    - Evaluate on 6 dimensions (0-10 pts each):
      1. Basic Completeness
      2. Purpose Clarity
      3. Type Matching
      4. Acceptance Criteria
      5. Project Rules Compliance
      6. Latest Focus Compliance

4.  **Generate Report**
    - Detailed scoring and explanation.
    - Specific issues and improvement suggestions.
    - Actionable commands.
    - Overall Rating (Excellent/Good/Fair/Reject).

## Output Example

```
🔍 Task Quality Check Report

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task Info
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task ID: #123
Title: [Bug] Fix email sync timeout
Type: Bug
Priority: high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scoring Details (Total 60)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Basic Completeness: 9/10
  ✓ Title format good
  ✓ Detailed description present
  
⚠️ Purpose Clarity: 7/10
  ✓ Issue described clearly
  ⚠️ Missing: Specific data volume threshold

... (more details) ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Total Score: 48/60

🟡 GOOD (40-49)
Main content complete, suggest refining details.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Improvement Suggestions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 Required Improvements:
1. Add reproduction steps

⚠️ Suggested Improvements:
2. Specific acceptance criteria

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Conclusion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Suggest refining before starting.
```

