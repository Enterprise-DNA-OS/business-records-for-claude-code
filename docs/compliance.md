# Record checks and their sources

Checked 19 October 2026. These checks identify missing or contradictory evidence. They do not establish complete legal compliance. The operator remains responsible for classification, jurisdiction, preservation instructions and the lawful use of the documents.

| Check | Source | What the software actually checks |
|---|---|---|
| NZ-TAX-7 | [Inland Revenue record keeping](https://www.ird.govt.nz/records) | For the nz-tax class, require the operator's tax-period end and a retention date at least seven years after it. The effective retention end never falls below that floor. |
| NZ-PRIVACY-9 | [Privacy Commissioner, principle 9](https://www.privacy.org.nz/privacy-principles/9/) | Personal records without a current purpose review or with an expired next-review date are flagged. The recorded purpose and interval are the operator's decision. |
| NZ-PRIVACY-5 | [Privacy Commissioner, principle 5](https://www.privacy.org.nz/privacy-principles/5/) | Flag missing or overdue access-review and restore-test evidence. Recording evidence does not prove security or recovery. |
| Storage location | [Inland Revenue record keeping](https://www.ird.govt.nz/records) | Ask for current storage-location evidence. IRD describes offshore-storage approval and language requirements. The software cannot determine approval or document language from a checksum. |

The tax floor uses a supplied period end, not a guessed anniversary of the document date. IRD specifies tax years. Tax periods, extensions, disputes and records subject to another obligation require human review. Seven years is not a permission to destroy anything. Tax records must remain readable and accessible, not merely represented by an index row.

The business-general class has no statutory period assigned. The operator sets retain-until and review dates from lawful purpose and applicable obligations. The unclassified class blocks a completed review until it is classified. No Australian legal retention period is assumed. An Australian installation needs its own reviewed classes and sources before reliance.

## Preservation controls

Active holds block disposal proposals regardless of the retention end. A hold records the instruction, reason and person who entered it. Releasing it requires written-authority evidence. These are local controls, not a legal determination that a litigation hold exists or has ended.

Original versions, reviews, control checks and events are append-only through database triggers. Metadata edits invalidate reviews, as does a new original version. A proposal records the revision and version examined. Any subsequent hold or change requires a fresh decision. Proposals never authorise destruction.

The register has no deletion workflow. Actual destruction requires a separate, authorised process covering originals, prior versions, exports and backups. Do not use an expired date or a proposal as that authority. Keep the minimum personal information needed in the index and apply an authorised retention process to the index and audit history as well.

## Permission boundary

Use one database per business and one trusted operator. There is no user sign-in or row-level multi-user application. Tables have row-level security enabled with no public policies, and no public grants. The owner connection bypasses those restrictions. Do not expose it to untrusted people. Authenticated approvals, separation of duties and tamper-resistant external audit require a custom installation.
