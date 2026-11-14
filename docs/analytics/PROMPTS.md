# Antigravity prompts: one per phase

Paste one prompt at a time into the Antigravity agent (Planning mode). Wait for the phase to finish, check the "Done when" list in `PRD.md`, merge, then move to the next.

You can also run them as workflows: `/analytics-phase-0`, `/analytics-phase-1` and so on (files in `.agent/workflows/`).

---

## Phase 0: Audit and foundations

```
Read docs/analytics/PRD.md fully and follow .agent/rules/analytics-guardrails.md.
Do Phase 0 only. Do NOT change any runtime behaviour.
1. Explore the codebase and fill Appendix B (file map) in docs/analytics/PRD.md:
   question APIs, PracticeClient, Daily Drill, Mock, /api/quiz, Environment Atlas quiz,
   every ActionLog writer, usage limits/paywall, OTP send/verify, email send,
   every AI call, Razorpay order + webhook, admin routes, existing cron setup.
2. Fill Appendix A with the providers you find in code and env vars. Leave prices blank
   where you can't tell, and list them for me to fill.
3. Compare prisma/schema.prisma with PRD §3. List which models exist, which need new
   fields, and which are new. Don't write the migration yet.
4. Create lib/analytics/events.ts with zod schemas for every event in PRD §4,
   plus a validateEvents() function and unit tests.
5. Report: risks you found (e.g. answers currently sent to the browser), open questions,
   and your plan for Phase 1.
```

## Phase 1: Server grading and attempts

```
Follow docs/analytics/PRD.md §3.1, §6 (items 1–3) and Phase 1; obey .agent/rules/analytics-guardrails.md.
Branch: analytics/phase-1-attempts. Show the plan and wait for approval before editing.
1. Migration: Attempt, AttemptAnswer, QuestionReport, QuestionStats (extend existing models).
2. Remove correctLabel/explanations from every question payload sent to the browser.
3. Add POST /api/attempts (start) and POST /api/attempts/:id/answer (grade on server,
   store, then return isCorrect + correctLabel + explanation). Validate sourceId,
   reject duplicates, clamp timeSpentSec 0–600, log forged answers as SecurityEvent.
4. Wire PYQ Practice, Daily Drill, Mock, Map quiz and Environment Atlas quiz to these endpoints.
   Keep the UI looking and behaving the same.
5. Add a "Report error" button on questions + POST /api/question-report.
6. Tests for grading and duplicate/forged submissions.
Verify every Phase 1 "Done when" item and report how.
```

## Phase 2: Messaging, OTP guards, cost ledger

```
Follow docs/analytics/PRD.md §3.4, §6 item 7, §8 and Phase 2; obey the guardrails.
Branch: analytics/phase-2-cost. Plan first, wait for approval.
1. Migration: UsageLedger, MessageLog, OtpRequest, FixedCost, MarketingSpend, Campaign, BudgetLimit.
2. lib/cost/price-table.ts using Appendix A prices; lib/cost/recordUsage.ts.
3. Wrap EVERY AI, SMS, WhatsApp, email, maps and search call with recordUsage()
   (AI: tokens in/out, model, cacheHit, latencyMs).
4. Log every outgoing message to MessageLog (hash recipient). Add provider delivery
   webhooks that update status (delivered/bounced/failed/complained/clicked/unsubscribed).
5. OTP guards: +91 only; ≤3/number/hour, ≤5/day; ≤5/device/day; CAPTCHA hook after 2 per device.
6. Tests for OTP limits and recordUsage.
Report a list of every billable call site and confirm each is wrapped.
```

## Phase 3: Event pipeline and consent

```
Follow docs/analytics/PRD.md §2, §3.2, §4, §7 and Phase 3; obey the guardrails.
Branch: analytics/phase-3-events. Plan first, wait for approval.
1. Raw SQL migration for partitioned event_raw (+ current and next month partitions) and AnonProfile.
2. lib/analytics/client.ts: anonId cookie, sessionId (30-min inactivity), queue,
   flush every 10s / 20 events / pagehide via sendBeacon, eventId UUID.
   Active-time measurement for entity_view_end (visible tab + recent interaction).
3. POST /api/e: validate with events.ts, enrich (userId, tier, device, ip24), one multi-row insert.
4. Capture first-touch UTM/referrer/partner into AnonProfile; copy to User at signup;
   store last-touch source before payment.
5. Fire the client events from PRD §4 in each module (page_view, module_open, search,
   filter_change, tab_switch, shortcut_used, explanation_open, upgrade_cta_click,
   pricing_view, plan_select, share_click). Server events where the PRD says "server"
   (paywall_hit, practice_*, quiz_*, mapbot_query, coupon_apply, checkout_start).
6. client_error (onerror, unhandledrejection, img onError) and web_vital at 10% sample.
7. Consent banner; load GA4 (page views only) and Microsoft Clarity only after consent.
Verify: < 1 request per 10s per tab, unknown props dropped, nothing loads before consent.
```

## Phase 4: Money and security

```
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
```

## Phase 5: Rollups and admin dashboard

```
Follow docs/analytics/PRD.md §3.6, §5, §9, §10 and Phase 5; obey the guardrails.
Branch: analytics/phase-5-dashboard. Plan first, wait for approval.
1. Create rollup tables: kpi_period, learning_daily, cost_daily, message_daily,
   marketing_daily, feature_daily, search_zero; QuestionStats rebuild.
2. Cron jobs per §10 (IST), using the project's existing scheduler; protect cron routes with a secret.
   Daily job also rebuilds the day before yesterday.
3. Every metric exactly as defined in §5. Weekly/monthly uniques via COUNT(DISTINCT) over the period.
4. /admin/analytics with tabs Overview, Learning, Product, Costs, Marketing, Security;
   Day/Week/Month switch; compare with previous period; reads rollups only, "today" tiles live with 60s cache.
5. Alerts (budget 50/80/100%, 3× spike, OTP verify rate < 40%, reconciliation) to email + Telegram bot.
6. Tests on fixtures: IST midnight boundaries, one user active on 5 days counts once weekly.
Verify the dashboard loads in under 1s and numbers match hand-run SQL.
```

## Phase 6: Marketing and optimisation

```
Follow docs/analytics/PRD.md §5.5, §8 and Phase 6; obey the guardrails.
Branch: analytics/phase-6-marketing. Plan first, wait for approval.
1. Admin CSV import for MarketingSpend and FixedCost.
2. Partner codes: create/manage in admin; attribute signups, PRO and revenue per partner.
3. Google Search Console daily import (pages + queries) into a new table; show on Marketing tab.
4. Campaign + lifecycle flow tracking (welcome, abandoned cart 1h/24h, PRO expiry 7d/1d,
   win-back 14d, Prelims countdown) with consent check and one-click unsubscribe.
5. Kill switches UI: mapbot_free_cached_only, otp_channel_fallback, ai_free_tier_paused.
6. "Check these answer keys" review workflow from QuestionStats (negative discrimination) + QuestionReport.
7. Optional: export event_raw partitions older than 90 days to object storage before dropping.
```
