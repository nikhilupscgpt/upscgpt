---
description: Analytics Phase 4 - Money and security
---

Follow docs/analytics/PRD.md §3.3, §3.5, §6 and Phase 4; obey the guardrails.
Branch: analytics/phase-4-money-security. Plan first, wait for approval.
1. Order statuses (created/paid/failed/abandoned/refunded) with coupon + partner code.
2. PaymentEvent: verify Razorpay signature, idempotent on razorpayEventId, store fee and
   tax on fee, detect renewals, log bad signatures as SecurityEvent.
3. Move rate limiting out of ActionLog (Redis if already in the stack, otherwise an UNLOGGED
   Postgres table with TTL cleanup). Key by userId → deviceId → ip24.
4. UserDevice + PRO device limit (default 2, configurable): 3rd device revokes oldest, sends email.
5. Login failure tracking with backoff; scraping detection (>300 distinct items/hour) + page-size cap 50.
6. AuditLog on every admin mutation; raw SQL REVOKE UPDATE, DELETE for the app role.
7. Reconciliation cron (paid-not-PRO, PRO-without-payment, refunded-still-PRO) → alert.
8. Tests: webhook replay, device eviction, reconciliation on seeded mismatch.
