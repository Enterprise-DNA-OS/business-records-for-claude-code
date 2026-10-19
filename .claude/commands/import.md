---
name: import
description: "Bring across a DocuWare index export"
---
# Bring across a DocuWare index export

Read docs/replace-docuware.md. Configure a UTF-8, comma-separated, one-row-per-document index export. Reconcile the dry run, cabinet and mapped columns. Only then repeat without --dry-run. Originals are a separate export and attachment step.

```bash
node scripts/records.mjs import docuware "<export.csv>" --cabinet="<cabinet>" --map=examples/column-map.json --dry-run --actor="<operator>"
```

Use --json when composing a report. Keep originals and outputs private. Nothing sends, publishes or deletes from this workflow.
