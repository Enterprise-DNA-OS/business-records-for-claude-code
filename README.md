# Business Records for Claude Code

Know which originals are missing, which records must stay, and whose review is overdue. Keep your document index, original versions, retention decisions and preservation holds in a database and file archive you own. MIT licensed. Built by Enterprise DNA.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install, test and import your document index. | Your document classes, retention rules, reports and connections. One setup fee, then a retainer. | Installed and maintained through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=docuware&utm_medium=readme) | [Talk to Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=docuware&utm_medium=readme) |

DocuWare publishes a typical Cloud range of $30 to $125+ per user per month, with the final configuration quoted for the buyer. [Vendor pricing](https://start.docuware.com/faq/docuware-pricing), checked 19 October 2026. This base covers the business records desk. It is not a replica of the vendor's complete document platform.

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/business-records-for-claude-code.git
cd business-records-for-claude-code
npm install
npm test
npm run demo
```

Use Node 22. The demo makes an isolated fictional database, renders the reports and cleans up. It ignores DATABASE_URL. Add -- --keep to keep that temporary example for inspection. For a persistent fictional workspace, run npm run migrate and npm run seed. For a real business, migrate without seeding, then initialise it:

```bash
node scripts/records.mjs init "Your business" --actor="Your operator"
node scripts/records.mjs add-cabinet "Operations" --source="Exact source cabinet" --actor="Your operator"
```

Use local PGlite with DATABASE_URL unset, or a private Postgres database. Remote TLS certificates are verified. This is one trusted operator and one business per database, with no public service or authenticated approval system. Protect both the database and originals with operating-system access controls. Open the folder in Claude Code, Codex, OpenCode or Cursor. Ask for /attention, or describe what you need. No model API is called by this software.

## Five weekly rituals

- /review-queue: find unreviewed originals and overdue reviews.
- /retention-due: see expired dates, missing retention evidence and preservation holds.
- /integrity: compare every original with its recorded checksum.
- /holds: read active preservation instructions and their release evidence.
- /weekly-review: save the attention, retention and compliance queues as an internal draft.

36 workflow commands ship in .claude/commands. [The CLI guide](docs/cli.md) lists every operation. Read output is aligned text by default or --json for machines. Full identifiers, unique prefixes and case-insensitive names work. Ambiguous names list candidates and exit with an error.

## Bring your DocuWare index

DocuWare Export produces configurable index CSV files. Set UTF-8, comma separators, a header row and one row per document, then map your actual headings:

```bash
node scripts/records.mjs import docuware examples/docuware-index.csv --cabinet=Operations --map=examples/column-map.json --dry-run --actor="Demo operator"
```

This example matches the fictional seed. For real data, initialise the correct business and source cabinet first. Check the dry-run counts and ignored columns, then repeat without --dry-run. Repeated identical source IDs are skipped. Conflicting IDs or mixed cabinets roll back the whole import. Unknown document classes become unclassified and appear in the review queue.

**Index export does not include original files.** Export those separately from DocuWare and attach each to its record. The switch guide covers that reconciliation. An attachment is copied into the owned archive under a SHA-256 content hash and registered as a version. Editing metadata or adding a version invalidates the earlier review. Existing reviews and original versions remain visible.

[Switching guide](docs/replace-docuware.md). Do not cancel your existing system until the counts, originals, versions, permissions and required history have been reconciled.

## Documents and views

Set business name, logo and colours in brand.json. npm run view creates weekly, custody and review dashboards. npm run docs creates a record handover and retention review for each record. They are read-only HTML files, printable from a browser. /new-view adds another report. Drafts never send.

The archive is not a document editor, scanner, OCR engine or signing service. Enterprise DNA can build the front end, capture flow and connections your business needs into its installed version.

## Ten questions answered from your records

/insights runs all ten. These are combinations available in this base, not claims that DocuWare cannot produce a custom report.

1. Which originals are missing from the owned archive?
2. Which expired records remain under a hold?
3. Which personal records need a purpose review?
4. Which owners have overdue follow-up tasks?
5. Which tax records have a retention date below the required floor?
6. Which cabinets contain unclassified records?
7. Which current versions have not been reviewed?
8. Which records contain identical original files?
9. Which records qualify for a disposal review with no hold?
10. Which archived records still carry preservation holds?

## Your first hour: ten things to ask for

1. Show missing originals by cabinet.
2. Find every record with a supplier's name in the title.
3. Attach the original we exported and record where it came from.
4. Show whose document reviews are overdue.
5. Correct a record owner and show the review that needs redoing.
6. Record a preservation hold from the written instruction.
7. Show records with expired dates that still have a hold.
8. Draft the handover for one document.
9. Put our name and colours on the weekly review.
10. Add our own field or retention class through /customise.

## Retention and trust

The NZ tax class checks a seven-year floor from the tax-period end supplied by the operator. It does not infer a tax year, decide exceptions or certify compliance. Personal-information reviews follow recorded lawful purpose. Storage, access and restore controls require evidence supplied by the operator. See [compliance](docs/compliance.md) and [local policy](docs/local-policy.md).

A disposal proposal is a review record only. It does not delete a file, authorise destruction or clear a preservation hold. There is no destruction command. Archive removes a record from the active queue while keeping the original and holds. Review, version, control and audit history are append-only through database triggers. A database owner can bypass these controls. Actor names are supplied labels, not verified identities.

Back up the database and original-file directory together, and test restoration. JSON export is a portable index and history archive, not an automatic restore bundle. Original files are not embedded. Do not put real records, drafts, exports or database URLs in git. See [scope](docs/why-no-front-end.md) and [research](docs/research.md).

## Verification

npm test covers repeatable migrations and seed, every CLI operation, import rollback and isolation, missing originals, checksum changes, retention floors, holds, review invalidation, immutable history, drafts and reports. The manual GitHub Actions workflow runs the same command on Windows and Linux. This build was checked locally on Linux with PGlite and PostgreSQL 16. Windows execution remains configured rather than locally verified. The separate Postgres check uses a disposable schema and TEST_DATABASE_URL.
