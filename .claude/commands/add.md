---
name: add
description: "Register a business document"
---
# Register a business document

Report the evidence returned by the command. Do not invent records or infer a completed review.

```bash
node scripts/records.mjs add "<title>" --cabinet="<cabinet>" --class=business-general --date=<YYYY-MM-DD> --retain=<YYYY-MM-DD> --review=<YYYY-MM-DD> --owner="<owner>" --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
