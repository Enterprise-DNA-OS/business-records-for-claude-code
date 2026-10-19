# Business Records for Claude Code: operating instructions

Read README.md, docs/cli.md and docs/compliance.md before acting. One business and one trusted operator per database. The operator identifies the workspace and supplies their name for every change. Keep live credentials, originals, exports and drafts private.

## Working rules

Read the record and its history before changing it. Run the matching recipe, then answer from its output. Resolve ambiguous names by presenting the candidates. Never invent evidence, a retention authority or a completed action. Report missing originals plainly. Use --json for composition.

Nothing sends or publishes. Drafts stay in drafts/. There is no deletion workflow. A disposal proposal is not authority to destroy a record. Never release a hold without its written authority. Archive retains originals and holds. Real legal and retention decisions belong to the operator.

Use one numbered migration per change and never edit an applied migration. Run npm test after code changes. Back up the database and originals together before live migrations. Do not seed a real workspace. Do not use the owner database credential for untrusted multi-user access.

## Routing

| Recurring job | Recipe |
|---|---|
| add-cabinet | Read .claude/commands/add-cabinet.md |
| add-task | Read .claude/commands/add-task.md |
| add | Read .claude/commands/add.md |
| archive | Read .claude/commands/archive.md |
| attach | Read .claude/commands/attach.md |
| attention | Read .claude/commands/attention.md |
| cabinets | Read .claude/commands/cabinets.md |
| classes | Read .claude/commands/classes.md |
| complete-task | Read .claude/commands/complete-task.md |
| compliance | Read .claude/commands/compliance.md |
| draft-handover | Read .claude/commands/draft-handover.md |
| draft-review | Read .claude/commands/draft-review.md |
| duplicates | Read .claude/commands/duplicates.md |
| edit | Read .claude/commands/edit.md |
| export | Read .claude/commands/export.md |
| history | Read .claude/commands/history.md |
| hold | Read .claude/commands/hold.md |
| holds | Read .claude/commands/holds.md |
| import | Read .claude/commands/import.md |
| init | Read .claude/commands/init.md |
| insights | Read .claude/commands/insights.md |
| integrity | Read .claude/commands/integrity.md |
| log-control | Read .claude/commands/log-control.md |
| propose-disposal | Read .claude/commands/propose-disposal.md |
| records | Read .claude/commands/records.md |
| release-hold | Read .claude/commands/release-hold.md |
| retention-due | Read .claude/commands/retention-due.md |
| review-queue | Read .claude/commands/review-queue.md |
| review | Read .claude/commands/review.md |
| search | Read .claude/commands/search.md |
| show | Read .claude/commands/show.md |
| tasks | Read .claude/commands/tasks.md |
| versions | Read .claude/commands/versions.md |
| weekly-review | Read .claude/commands/weekly-review.md |
| Add a field or rule | /customise |
| Add a read-only report | /new-view |

Commands live in .claude/commands. The only CLI is scripts/records.mjs. SQL migrations are in supabase/migrations. Generated views and documents are read-only. brand.json controls their business name and colours. DATABASE_URL selects private Postgres, otherwise DATA_DIR selects local PGlite. FILES_DIR contains originals, separate from the database. OUTPUT_DIR sets the private report destination.

If the request needs OCR, signatures, shared permissions or a capture interface, scope the installed version instead of pretending this base already provides it.

Built and run for you through Omni by Enterprise DNA: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=docuware&utm_medium=agent
