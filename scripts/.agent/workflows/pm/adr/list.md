# /pm:adr:list - List ADRs

List all Architecture Decision Records.

## Usage

```bash
/pm/adr/list
```

## Steps

1.  **Scan ADR Directory**
    - List all files in `.project-log/decisions/` matching `XXXX-*.md`.
    - Sort by filename (number).

2.  **Parse and Display**
    - For each file, read the frontmatter (status, date) and the Title (first H1).
    - Display in a table or list:
      `ADR-0001: [Proposed] Use Redis Cache (2025-11-19)`

3.  **Empty State**
    - If no files found, say "No ADRs found. Use /pm/adr/create to start."

