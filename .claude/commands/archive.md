---
name: archive
description: "Remove a record from the active work queue while retaining it"
---
# Remove a record from the active work queue while retaining it

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything.

```bash
node scripts/records.mjs archive "<record>" --evidence="<reason>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
