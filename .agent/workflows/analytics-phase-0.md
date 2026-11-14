---
description: Analytics Phase 0 - Audit and foundations
---

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
