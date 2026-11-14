# Analytics build guardrails

These rules apply whenever you work on analytics, telemetry, payments, cost tracking or security for upscgpt+.

## Source of truth
- The spec is `docs/analytics/PRD.md`. Read the relevant section before writing code. If code and PRD disagree, stop and ask.
- Work on **one phase at a time**. Do not start the next phase until the current phase's "Done when" checks pass and the user approves.

## Before changing anything
- Read `prisma/schema.prisma` and the files listed in PRD Appendix B. Extend existing models; never create a duplicate of an existing model.
- Create a git branch per phase: `analytics/phase-N-<short-name>`.
- Show the plan (files to touch, migrations to add) and wait for approval before editing.

## Database
- Every schema change goes through a Prisma migration. Partitioned tables and REVOKE statements go in a raw SQL migration file.
- Never run `prisma migrate reset`, `db push --force-reset`, `DROP TABLE` or any destructive command against a shared or production database. Ask first.
- Money is integer paise. Times are stored as UTC `timestamptz`; all reporting converts to `Asia/Kolkata`.
- Weekly and monthly unique counts use `COUNT(DISTINCT …)` over the whole period. Never sum daily uniques.

## Data rules
- Grading, payments, signups and entitlements are computed on the server only. Never trust values sent by the browser for these.
- Event `props` must pass the zod allow-list in `lib/analytics/events.ts`. No email, phone, name, token or free text in events (only exception: zero-result search query, trimmed to 60 chars).
- Phone numbers and emails are stored only as sha256 hashes outside the `User` table.
- Store IPs as `/24` in analytics. Full IP only in `SecurityEvent`.
- GA4 and Microsoft Clarity load only after consent.

## Cost
- Every call to a paid provider (AI, SMS, WhatsApp, email, maps, search) goes through `recordUsage()`.
- Unit prices live only in `lib/cost/price-table.ts`.
- Do not add any paid SaaS or analytics vendor. Ask first if one seems necessary.

## Behaviour
- Do not change user-facing behaviour beyond what the PRD lists.
- Add tests for grading, event validation, metric SQL (including IST midnight edge cases) and webhook idempotency.
- At the end of each phase, report: files changed, migrations added, how each "Done when" check was verified, and anything left undone.
