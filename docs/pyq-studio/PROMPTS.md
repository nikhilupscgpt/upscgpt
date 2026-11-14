# Antigravity prompts: PYQ Studio (PRD v2)

Paste one at a time into the Antigravity agent (Planning mode), or run `/pyq-studio-phase-0` … `/pyq-studio-phase-9`.

---

## Phase 0: Audit

```
Read docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md (v2) fully and follow .agent/rules/pyq-studio-guardrails.md.
Do Phase 0 only. Do NOT change runtime behaviour or data.
1. Fill the Appendix file map: PYQ Studio list, present mode, recording studio, PYQ Editor,
   /api/admin/pyq, role guards, stem formatter, attachments, Mapping atlas, Question model.
2. Write scripts/pyq/baseline.ts (read-only) that re-measures every number in PRD §1.1 against `Question` and saves
   reports/pyq-cleanup/baseline.md. Run it and show me the result.
3. Inspect the PYQ Editor and the recording studio code. Propose focused plans for PRD §10 and for
   wrapping the recording stage into the Record-by-section flow (§8) without rewriting capture/storage.
4. List the distinct Subject/Topic/MicroTheme values and how the current "Syllabus Sequence (NCERT)" order
   is produced.
5. Check which analytics-PRD helpers already exist (QuestionReport, SecurityEvent, AuditLog, rate limiter).
6. Take "before" screenshots (1440 px and 390 px) of PYQ Studio, present mode and the Mapping atlas.
7. Report risks, open questions and the plan for Phase 1.
```

## Phase 1: API and access

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §5 and Phase 1; obey .agent/rules/pyq-studio-guardrails.md.
Branch: pyq-studio/phase-1-api-access. Show the plan and wait for approval.
1. requireRole() helper used by all /admin pages and /api/admin routes.
2. /api/admin/pyq returns light rows only, page size 25/50/100 else 400, default exam UPSC_CSE_PRE,
   includeCds flag. Update PYQ Studio to use it.
3. GET /api/admin/pyq/:id; switch present mode to it with next-question prefetch.
4. /admin/pyq: Faculty gets an "Admin only" page linking back to PYQ Studio (not the login screen).
   Hide Editor links for Faculty.
5. Rate limits (§5) with 429 + SecurityEvent(scrape_suspect).
6. Tests: role matrix, page-size whitelist, 429, row size < 1 KB.
```

## Phase 2: Data integrity

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §3, §4, §12 and Phase 2; obey the guardrails.
Branch: pyq-studio/phase-2-data. Plan first, wait for approval.
1. Migration for §3.1–§3.4 fields and models (Question fields, Deck, DeckItem,
   RecordingSession, LectureUsage, TeacherNote, FacultyPrefs). No new unique constraint yet.
2. lib/pyq/explanation-schema.ts and lib/pyq/content-status.ts with unit tests on real samples.
3. Cleanup scripts 1–9 (§12) under scripts/pyq/, dry run by default, CSV reports in reports/pyq-cleanup/.
4. Run them in dry-run mode and summarise the reports. Wait for my approval before any --apply.
5. After approved --apply and manual fixes: tighten unique constraint if needed and confirm zero violations.
```

## Phase 3: UI kit and cleanup

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §2 and Phase 3; obey the guardrails.
Branch: pyq-studio/phase-3-ui-kit. Plan first, wait for approval.
1. Build shared components using Midnight Library CSS variables (no Tailwind): MetaLine, StatusBadge, RowActions (hover/focus + "⋯"), FilterBar
   (3 visible + More + removable chips + URL state), PageHeader, CollapsibleRail, Toolbar (≤ 6 visible + Tools).
2. Apply them to the existing PYQ Studio list: regular-weight stems using the present-mode formatter,
   one metadata line instead of 4 badges, row actions on hover, compact header, no disabled glowing button,
   no emoji in controls, labels linked to controls.
3. Apply Toolbar to present mode (pen, highlighter, 3 colours, undo, prev/next visible; rest under Tools; "?" sheet).
4. Before/after screenshots at 1440 and 390 px; axe check with no label errors.
```

## Phase 4: Syllabus tree home

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §6 and Phase 4; obey the guardrails.
Branch: pyq-studio/phase-4-tree. Plan first, wait for approval.
1. GET /api/admin/pyq/tree with per-node counts (total, CSE, CDS, ready, needs explanation, broken,
   recorded %, last recorded, parts done), cached 5 min and invalidated on save/recording finish.
2. GET /api/admin/pyq/search-sections for jump-to-topic.
3. PYQ Studio home: Exam switch (UPSC CSE default, remembered in FacultyPrefs), search, Continue card,
   subject boxes → topic boxes → micro-theme boxes only when themes exist, breadcrumb,
   "All questions in <subject>" link, progress filter (All / Not started / In progress / Recorded).
4. Boxes are links; arrow-key navigation; responsive grid.
Verify: any topic is reachable in ≤ 3 clicks and box counts equal the section list counts.
```

## Phase 5: Section view and decks

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §7 and Phase 5; obey the guardrails.
Branch: pyq-studio/phase-5-section. Plan first, wait for approval.
1. Section view header: breadcrumb, counts (questions, est. minutes, needs explanation, broken),
   Record section / Present / ⋯ actions.
2. FilterBar with Year, Format, Status visible; rest under More; "+ Include CDS (n more)" toggle with live count.
3. Selection on hover/after first pick, selection bar, persistence across pages/filters/reload.
4. Deck tray rail: reorder, remove, save as deck, share; My decks / Shared decks.
5. Keyboard j/k/x/p/r. Playwright test: select across 2 pages → reorder → save → reload.
```

## Phase 6: Record by section

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §8 and Phase 6, using the recording-stage plan approved in Phase 0;
obey the guardrails (never delete or overwrite recording files).
Branch: pyq-studio/phase-6-record. Plan first, wait for approval.
1. POST/PATCH/GET /api/admin/recordings; draft from a section (current exam + CDS toggle,
   syllabus order, broken excluded), parts from FacultyPrefs.partSize.
2. Check screen: counts, duration estimate, suggested parts, inline warnings (teacher note / open in Editor),
   reorder/drop, mic/camera/screen check, title preview.
3. Start → present mode with recording on (wrap the existing recording stage). Auto timestamps per question,
   pause/resume, stop after this question, discard part, crash-safe resume at lastIndex.
4. After recording: tree status update, upload pack (title, description, YouTube chapters, tags,
   copy buttons), next-section suggestion, re-record one question.
5. Playwright E2E from PRD §14.
Verify: Record → check → Start in 3 clicks; chapters correct; resume continues at the right question.
```

## Phase 7: Present mode

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §9 and Phase 7; obey the guardrails.
Branch: pyq-studio/phase-7-present. Plan first, wait for approval.
1. Counter "Question X of N · Step Y of M".
2. No-explanation right panel: answer step, statement/pair checklist, private autosaved TeacherNote,
   "Report missing explanation".
3. Detail API prefetch; LectureUsage after 30s.
4. Keep the current serif question styling.
Verify: no question shows an empty right half; notes persist after reload.
```

## Phase 8: PYQ Editor

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §10 and Phase 8, using the plan approved in Phase 0; obey the guardrails.
Branch: pyq-studio/phase-8-editor. Plan first, wait for approval.
1. Apply §2 cleanup rules and shared components.
2. Save validation (4 options, answer among options, explanation schema, exam code) with clear messages.
3. Status badge, missing flags, "Next incomplete".
4. Backlog table (exam × year × subject) here, not in the Studio.
5. Bulk set theme/topic/difficulty/exam code; theme tagging helper.
6. AuditLog on every save; recompute content status.
7. Optional, ask me first: per-account invisible watermark in present mode.
```

## Phase 9: Mapping atlas cleanup

```
Follow docs/pyq-studio/upscgpt-pyq-studio-PRD-v2.md §2 and §11 and Phase 9; obey the guardrails.
Branch: pyq-studio/phase-9-mapping. Plan first, wait for approval.
1. One top bar (breadcrumb left; view switch, Study/Practice, progress right); remove the duplicate rows and basin chips.
2. Left list as a collapsible rail; layers in one "Layers" dropdown with counts.
3. Right panel one step at a time; remove per-section Map toggles (open section = what the map shows).
4. One numbering colour; neutral river lines; status colours per §2.
5. Map ≥ 55% width on desktop; bottom sheet on phones. "Learned" → "Quiz passed".
6. Before/after screenshots at 1440 and 390 px.
```
