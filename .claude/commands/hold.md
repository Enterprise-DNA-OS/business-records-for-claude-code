---
name: hold
description: "Preserve a record under a documented hold"
---
# Preserve a record under a documented hold

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything.

```bash
node scripts/records.mjs hold "<record>" --name="<hold name>" --reason="<authority reference and reason>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
