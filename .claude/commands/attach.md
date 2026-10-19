---
name: attach
description: "Add an original to the owned archive"
---
# Add an original to the owned archive

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything.

```bash
node scripts/records.mjs attach "<record>" "<local file>" --evidence="<source reference>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
