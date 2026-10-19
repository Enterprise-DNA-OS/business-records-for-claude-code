# CLI reference

Node 22. Run npm run migrate before first use. Every write requires --actor="Operator name". Flags use --key=value. Add --json to read structured output. Use a unique record ID prefix or a case-insensitive name. Ambiguous names list candidates and return exit code 1.

The command recipes below show complete syntax. Replace angle-bracket values with your own data. Do not enter real data in examples/.

Dates are calendar YYYY-MM-DD. retain is the explicit retention end. period is the tax-period end for nz-tax records. review is the initial review due date. next is a future date for the next review. reference is a business identifier. personal is yes/no. A review records the current metadata revision and original version.

Edit accepts --name, --owner, --reference, --class, --period, --retain, --review and --personal. It invalidates the previous review. Attach copies a file to FILES_DIR under its SHA-256 hash. Identical consecutive attachments are skipped. Retention reviews verify file checksums before recording evidence. log-control accepts access-review, restore-test or storage-location.

Import accepts only docuware, with --cabinet and --map. --dry-run is for import only. Read the switching guide before use. Export and drafts accept --out=<new-file-path>, refuse to overwrite an existing file and otherwise create a private timestamped file. JSON export contains all register data and history, but not originals. It is not a restore tool.

Set DATA_DIR and FILES_DIR together for isolated local workspaces. Without FILES_DIR, originals live beside DATA_DIR in originals/. With a remote database, set FILES_DIR to its own private archive directory. OUTPUT_DIR controls views, documents, drafts and exports. Back up the database and originals together.

## add-cabinet

```bash
node scripts/records.mjs add-cabinet "<name>" --source="<exact DocuWare cabinet>" --actor="<operator>"
```

## add-task

```bash
node scripts/records.mjs add-task "<record>" --name="<task>" --owner="<owner>" --due=<YYYY-MM-DD> --actor="<operator>"
```

## add

```bash
node scripts/records.mjs add "<title>" --cabinet="<cabinet>" --class=business-general --date=<YYYY-MM-DD> --retain=<YYYY-MM-DD> --review=<YYYY-MM-DD> --owner="<owner>" --actor="<operator>"
```

## archive

```bash
node scripts/records.mjs archive "<record>" --evidence="<reason>" --actor="<operator>"
```

## attach

```bash
node scripts/records.mjs attach "<record>" "<local file>" --evidence="<source reference>" --actor="<operator>"
```

## attention

```bash
node scripts/records.mjs attention
```

## cabinets

```bash
node scripts/records.mjs cabinets
```

## classes

```bash
node scripts/records.mjs classes
```

## complete-task

```bash
node scripts/records.mjs complete-task "<task>" --evidence="<completion reference>" --actor="<operator>"
```

## compliance

```bash
node scripts/records.mjs compliance
```

## draft-handover

```bash
node scripts/records.mjs draft-handover "<record>"
```

## draft-review

```bash
node scripts/records.mjs draft-review
```

## duplicates

```bash
node scripts/records.mjs duplicates
```

## edit

```bash
node scripts/records.mjs edit "<record>" --owner="<owner>" --actor="<operator>"
```

## export

```bash
node scripts/records.mjs export
```

## history

```bash
node scripts/records.mjs history "<record>"
```

## hold

```bash
node scripts/records.mjs hold "<record>" --name="<hold name>" --reason="<authority reference and reason>" --actor="<operator>"
```

## holds

```bash
node scripts/records.mjs holds
```

## import

```bash
node scripts/records.mjs import docuware "<export.csv>" --cabinet="<cabinet>" --map=examples/column-map.json --dry-run --actor="<operator>"
```

## init

```bash
node scripts/records.mjs init "<business>" --actor="<operator>"
```

## insights

```bash
node scripts/records.mjs insights
```

## integrity

```bash
node scripts/records.mjs integrity
```

## log-control

```bash
node scripts/records.mjs log-control access-review --next=<YYYY-MM-DD> --evidence="<review reference>" --actor="<operator>"
```

## propose-disposal

```bash
node scripts/records.mjs propose-disposal "<record>" --next=<YYYY-MM-DD> --evidence="<authority and rationale>" --actor="<operator>"
```

## records

```bash
node scripts/records.mjs records
```

## release-hold

```bash
node scripts/records.mjs release-hold "<hold>" --evidence="<written release authority>" --actor="<operator>"
```

## retention-due

```bash
node scripts/records.mjs retention-due
```

## review-queue

```bash
node scripts/records.mjs review-queue
```

## review

```bash
node scripts/records.mjs review "<record>" --next=<YYYY-MM-DD> --evidence="<review reference and purpose>" --actor="<operator>"
```

## search

```bash
node scripts/records.mjs search "<text>"
```

## show

```bash
node scripts/records.mjs show "<record>"
```

## tasks

```bash
node scripts/records.mjs tasks
```

## versions

```bash
node scripts/records.mjs versions "<record>"
```

## weekly-review

```bash
node scripts/records.mjs weekly-review
```
