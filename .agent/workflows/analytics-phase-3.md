---
description: Analytics Phase 3 - Event pipeline and consent
---

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
