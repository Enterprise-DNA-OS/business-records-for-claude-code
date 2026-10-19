# Replace the business records desk in DocuWare

## Export the index

[DocuWare's export documentation](https://knowledgecenter.docuware.com/docs/docuware-export), checked 19 October 2026, distinguishes index-only CSV export from document export. DocuWare Export is a configured desktop export. Have the administrator assign an export configuration, or use the available result-list CSV export.

Configure UTF-8, comma separators, one header row and one document per row. Include stable document ID, cabinet, title and document date. Include document type, owner, retention date, review date, personal-information flag, tax-period end and reference when your cabinet has those fields. The example headings are one possible configuration, not fixed DocuWare defaults. Repeated invoice line items, footer totals and multiline report structures are not accepted as document rows.

Copy examples/column-map.json into your private import directory and map each internal field to an exact heading. Remove optional mappings for columns not in the export. Keep the four required mappings: cabinet, source_id, name and document_date. Map your known document types explicitly under classes. Dates must be YYYY-MM-DD. Personal flags accept yes/no, true/false or 1/0. Empty personal flags remain unknown and are flagged for classification. Inspect the original before recording yes or no.

For exports using another delimiter or date convention, change the export configuration before import. The parser supports quoted commas, doubled quotes, embedded newlines, CRLF and a UTF-8 byte-order mark. Duplicate or missing headings, malformed rows and invalid dates fail.

## One-command index import

Initialise a database for the correct business without demo seed, add a cabinet with its exact source name, and run:

```bash
node scripts/records.mjs import docuware imports/index.csv --cabinet="Operations" --map=imports/map.json --dry-run --actor="Your operator"
```

Reconcile added, skipped and ignored-column counts. Then repeat without --dry-run. The whole file is transactional. A mixed cabinet, invalid row or conflicting source ID rolls everything back. Identical rows are skipped. Changed source IDs do not silently overwrite local corrections. Review a changed record explicitly with edit. IDs are scoped to the selected cabinet, so the same ID in a different cabinet is a different record.

Unknown document types become unclassified. Original coverage is zero for new index-only rows. This is intentional: an index is not evidence that the original was migrated.

## Bring the originals and required history

Export the original documents separately. DocuWare documents docXporter as an additional-license option that can export documents and index data. Other export methods depend on your installation and permissions. Confirm the route and required versions with your administrator before switching.

Attach each exported file to its matched record:

```bash
node scripts/records.mjs attach "<exact record ID>" "imports/original.pdf" --evidence="DocuWare export reference" --actor="Your operator"
```

The file is copied into the owned archive with a checksum. Each changed attachment becomes a new numbered version. No DocuWare login or API call is made. The command accepts any regular file up to 50 MB, but does not scan its contents, run OCR or infer fields.

The CSV import does not carry access permissions, workflow tasks, electronic signatures, annotations, audit history or original versions. Export and preserve required evidence separately, then configure the rules and permissions your business needs. Enterprise DNA can map and reconcile this as part of the installed version.

## Reconcile before leaving

Compare cabinet and document counts, source identifiers, titles, dates and owner assignments. Run integrity and review-queue. Open a representative sample of originals in a trusted viewer and verify readability. Reconcile required earlier versions and audit evidence, inspect preservation holds, and test a full backup restore of both the database and originals. Run both desks until the business agrees that all required work and history are covered.

The index import itself is a one-command operation. Full migration time depends on the export size, file access, mapping, history and permissions. Do not promise an entire archive migration in one day without inspecting those dependencies.
