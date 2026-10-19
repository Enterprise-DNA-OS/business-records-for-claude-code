---
name: release-hold
description: "Record authority to release a hold"
---
# Record authority to release a hold

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything. Release only after the operator identifies the written authority. Never infer that a dispute has ended.

```bash
node scripts/records.mjs release-hold "<hold>" --evidence="<written release authority>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
