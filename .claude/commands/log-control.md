---
name: log-control
description: "Record a storage, access or recovery check"
---
# Record a storage, access or recovery check

Report the evidence returned by the command. Do not invent records or infer a completed review.

```bash
node scripts/records.mjs log-control access-review --next=<YYYY-MM-DD> --evidence="<review reference>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
