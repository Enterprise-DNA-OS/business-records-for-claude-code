---
name: add-task
description: "Assign records follow-up work"
---
# Assign records follow-up work

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything.

```bash
node scripts/records.mjs add-task "<record>" --name="<task>" --owner="<owner>" --due=<YYYY-MM-DD> --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
