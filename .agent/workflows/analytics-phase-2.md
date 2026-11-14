---
description: Analytics Phase 2 - Messaging, OTP guards, cost ledger
---

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
