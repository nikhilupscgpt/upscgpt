---
description: Analytics Phase 5 - Rollups and admin dashboard
---

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
