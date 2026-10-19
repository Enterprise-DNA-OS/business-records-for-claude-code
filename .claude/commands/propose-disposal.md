---
name: propose-disposal
description: "Draft a disposal review without deleting anything"
---
# Draft a disposal review without deleting anything

For changes, read the record with show first. Confirm the source evidence and the operator name. An ambiguous match must be resolved before changing anything. This creates a proposal only. It neither authorises nor performs destruction. Read docs/compliance.md and reconcile every active hold before any external decision.

```bash
node scripts/records.mjs propose-disposal "<record>" --next=<YYYY-MM-DD> --evidence="<authority and rationale>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
