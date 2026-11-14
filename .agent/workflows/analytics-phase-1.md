---
description: Analytics Phase 1 - Server grading and attempts
---

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
