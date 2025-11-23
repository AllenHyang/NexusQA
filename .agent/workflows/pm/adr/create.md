# /pm:adr:create - Create a new ADR

Create a new Architecture Decision Record.

## Usage

```bash
/pm/adr/create "Title of the decision" --status accepted
```

## Steps

1.  **Scan Existing ADRs**
    - List files in `.project-log/decisions/` matching `XXXX-*.md`.
    - Determine the next sequence number (e.g., if `0001-xxx.md` exists, next is `0002`). Default to `0001`.

2.  **Generate Filename**
    - Format number as 4 digits: `0002`.
    - Slugify the title: `Use Redis Cache` -> `use-redis-cache`.
    - Filename: `.project-log/decisions/0002-use-redis-cache.md`.

3.  **Create File**
    - Create the file with the following template:
      ```markdown
      ---
      status: {status or 'proposed'}
      date: {current date YYYY-MM-DD}
      deciders: {user or 'Team'}
      ---
      # {number}. {title}

      ## Context
      [Describe the context and problem statement]

      ## Decision
      [Describe the decision]

      ## Consequences
      [Describe the consequences]
      ```

4.  **Update Index (Optional)**
    - If `.project-log/decisions/README.md` or `index.md` exists, append the new ADR to the list.

5.  **Notify User**
    - "✅ Created ADR-0002: Use Redis Cache"
    - "File: .project-log/decisions/0002-use-redis-cache.md"

