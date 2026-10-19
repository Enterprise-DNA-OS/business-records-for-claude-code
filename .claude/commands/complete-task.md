---
name: complete-task
description: "Close work with evidence"
---
# Close work with evidence

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything.

```bash
node scripts/records.mjs complete-task "<task>" --evidence="<completion reference>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
