---
name: review
description: "Record a review of the current original"
---
# Record a review of the current original

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything.

```bash
node scripts/records.mjs review "<record>" --next=<YYYY-MM-DD> --evidence="<review reference and purpose>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
