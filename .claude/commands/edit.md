---
name: edit
description: "Correct metadata and invalidate its review"
---
# Correct metadata and invalidate its review

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything.

```bash
node scripts/records.mjs edit "<record>" --owner="<owner>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
