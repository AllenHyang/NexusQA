# Workflow Execution Rules & Best Practices

This document defines the strict operational rules for executing Project Manager (pm) workflows.

## 1. Atomic Execution Principle
- **Workflows are Atomic**: Each workflow (e.g., `/pm:task:start`, `/pm:task:create`, `/pm:task:done`) is a discrete, isolated unit of work.
- **No Chaining**: The agent must **NEVER** automatically trigger a subsequent workflow immediately after completing the current one.
  - *Example*: After `/pm:task:start`, do NOT automatically start coding unless explicitly told.
  - *Example*: After implementing changes, do NOT automatically run `/pm:task:done`.
- **Await Instruction**: After a workflow completes its defined steps, the agent must **STOP**, report the status to the user, and await the next explicit command.

## 2. Task Lifecycle Boundaries
- **Start**: Ends when the branch is checked out and context is synced.
- **Implementation**: (General coding) Ends when changes are verified (build/lint pass).
  - **CRITICAL**: The agent must **NEVER** merge code or close a task during the implementation phase.
  - **CRITICAL**: The `/pm:task:done` command is the ONLY mechanism to close a task and merge code. It must be invoked explicitly.
- **Done**: Ends when the code is merged and the task is marked as "done" in the database.

## 3. State Transitions
- Any action that changes the **Lifecycle State** of a task (e.g., `todo` -> `in_progress` -> `done`) requires strict adherence to the specific workflow defining that transition.
- Do not manually edit `tasks.json` status fields outside of these defined workflows.

## 4. Verification & Safety
- Always run verification (build, lint, test) before declaring the implementation phase complete.
- If verification fails, **STOP** and report the errors. Do not proceed to ask about the next step until fixed.
