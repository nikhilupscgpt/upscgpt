---
description: Analytics Phase 6 - Marketing and optimisation
---

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
