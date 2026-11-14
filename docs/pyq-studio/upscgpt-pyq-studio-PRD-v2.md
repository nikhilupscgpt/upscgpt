# PRD: PYQ Studio, Section Recording & UI Cleanup

| | |
|---|---|
| **Version** | 2.1 (Reconciled against existing `Question`, `Subject`, `Topic`, `MicroTheme`, `globals.css`, and Analytics PRD helpers) |
| **Builder** | Antigravity agent, phase by phase |
| **Stack in Repo** | Next.js 16 (App Router) · JS/TS (`allowJs: true`) · Prisma · PostgreSQL (`neondb`) · NextAuth (`ADMIN`, `FACULTY`) · Midnight Library CSS (`src/app/globals.css`, no Tailwind) |
| **Related** | `docs/analytics/PRD.md`: reuse existing `QuestionReport`, `SecurityEvent`, `AuditLog`, `writeAuditLog`, `writeSecurityEvent`, and `checkScrapeGuard` (`src/lib/security/guards.ts`, `src/lib/rateLimit.js`). Never duplicate them. |

### Names used in this PRD (use them in the UI too)

| Name | What it is | Route today |
|---|---|---|
| **PYQ Studio** | Faculty workspace to browse by syllabus, build decks, present and record | `/admin/studio/pyq` |
| **Present mode** | Full-screen teaching / recording screen | `/admin/studio/present?mode=pyq` |
| **Recording studio** | Existing recording stage | `/admin/recording-studio` (wrap/merge into Record flow, §8) |
| **PYQ Editor** | Admin-only page to fix question content | `/admin/pyq` |
| **Mapping atlas** | Map-based study module | `/mapping` |

"Editor" always means content editing (Admin). "Studio" always means teaching and recording (Faculty + Admin).

---

## 1. Problems this solves

### 1.1 Content and data (to be re-measured in Phase 0 against `Question` where `origin = PYQ`)

| Finding | Baseline (14 Nov 2026) |
|---|---|
| UPSC CSE Pre 2011–2026 / CDS | 1,512 / 1,016 |
| No explanation | **2,127 (84%)** |
| Explained but no `coreTakeaway` | 362 of 401 |
| `difficulty` empty | 2,526 |
| `themes` (`QuestionMicroTheme` / source theme) empty | **2,178 (86%)**; `topicId` (`Topic`) is the primary grouping |
| No `correctLabel` / label not among options | 3 / 1 |
| Exam name missing I/II ("CDS 2015" etc.) | 14 |
| UPSC papers with > 100 questions | 2020 (101), 2021 (103), 2022 (101), 2025 (101) |
| Groups sharing exam + year + question number | 292 |
| Near-duplicate stems missed by `dedupHash` | 12 groups |
| List API payload | ~3.7 KB per question (explanation included) |
| Full-bank download by one Faculty account | 26 requests, no rate limit |

### 1.2 Workflow
Recording one syllabus section takes ~8–12 steps with no progress tracking, pre-flight checks, or automatic part splitting.

### 1.3 UI clutter
- **PYQ Studio list:** bold stems, 4 coloured all-caps badges per card, repeated row actions on all 25 cards, 8 open filter dropdowns, long header subtitle, disabled glowing Launch button.
- **Present mode:** ~25 unlabelled toolbar icons; empty right half when no explanation exists.
- **Mapping atlas:** 5 rows of controls above the map, 3 competing columns, repeated per-section "Map" toggles, two numbering colour systems, duplicate basin chips.

### 1.4 Goals
1. **Section-first:** reach any syllabus section's questions in 2–3 clicks, or 1 with "Continue".
2. **Record by section** in 3 clicks: Record → check → Start, with progress tracked per section.
3. Calm UI: one accent colour, contextual row actions, main content gets the space.
4. Clean, consistent `Question` bank.
5. No bulk download by a single account; consistent `requireRole()` access rules.

### 1.5 Non-goals
- Authoring the 2,127 missing explanations (this PRD builds the workflow, tracking, and editor tools).
- Rebranding (preserve existing Midnight Library CSS variables, fonts, and dark/light themes).

---

## 2. UI cleanup rules (apply to every screen in this PRD)

1. **One accent colour for actions** (`--brand-blue` / `--brand-gradient`). Status colours only: red (`--color-rose`) = Broken, amber (`--color-amber`) = Needs explanation, green (`--color-emerald`) = Recorded/Ready.
2. **Show actions where they're used** (hover/focus or "⋯" menu). Never repeat action buttons on every row.
3. **Type weight on purpose:** regular weight for question stems and body text; bold only for headings, selected answer, and counts.
4. **Metadata is one quiet line**, not badges: `UPSC CSE 2026 · Q64 · Polity › Historical Background`. Badges only for status.
5. **Filters:** at most 3 visible; rest under "More filters"; active filters as removable chips; URL-synced state.
6. **One header row per screen:** breadcrumb left, primary action right. No explanatory subtitles.
7. **Primary actions hidden/compact until usable:** no disabled glowing buttons.
8. **Main content gets the most space:** side panels collapse to a narrow rail.
9. **No emoji in controls.** Linked `<label>` / `aria-labelledby` and visible focus rings on every control.
10. **Toolbars:** ≤ 6 always-visible tools; rest behind one "Tools" button. Every icon has a tooltip with its shortcut.

**Implementation Note (Codebase Reconciliation):** Build shared components (`MetaLine`, `StatusBadge`, `RowActions`, `FilterBar`, `PageHeader`, `CollapsibleRail`, `Toolbar`) using `src/app/globals.css` CSS variables + CSS modules / `styled-jsx` + `lucide-react` (NOT Tailwind).

---

## 3. Data model (Reconciled with existing `prisma/schema.prisma`)

### 3.1 Extend existing `model QuestionDraft` (active 2,528-row PYQ bank)
`QuestionDraft` is the live model queried by `/api/admin/pyq`, `/admin/studio/pyq`, and `/admin/pyq`. It already has: `id`, `examName`, `examYear`, `paper` (`PaperType?`), `setCode`, `questionNo`, `srcSubject`, `srcTopic`, `srcTheme`, `stem`, `options`, `correctLabel`, `explanation`, `difficulty` (`Difficulty?`), `dedupHash`, `assets`, `publishedId`, `createdAt`. (Do NOT create a duplicate `PyqQuestion` or duplicate `Difficulty` enum.)

Add to `QuestionDraft`:
```prisma
enum ExamCode {
  UPSC_CSE_PRE
  CDS_I
  CDS_II
  CDS // legacy, to be cleaned up in Phase 2
}

// Fields added to existing model QuestionDraft:
// examCode        ExamCode?
// explanationJson Json?      // validated structured explanation/analysis
// contentStatus   String     @default("incomplete") // ready | incomplete | broken
// missingFlags    String[]   @default([])
// stemFormat      String?    // statements | pairs | assertion | plain
// syllabusOrder   Int?       // position within srcTopic in NCERT/syllabus sequence
// updatedAt       DateTime   @updatedAt
// updatedById     String?
// @@index([contentStatus])
// @@index([srcSubject, srcTopic, srcTheme])
```

### 3.2 Syllabus tree (Reuse existing `Subject` → `Topic` → `MicroTheme`)
`Subject` (`sortOrder`, `slug`, `paper`), `Topic` (`sortOrder`, `slug`, `subjectId`), and `MicroTheme` (`slug`, `topicId`) already exist in `prisma/schema.prisma`.
- Add `sortOrder Int @default(0)` to `MicroTheme` if ordered themes are needed.
- Backfill/sync `Subject.sortOrder` and `Topic.sortOrder` to match NCERT/Syllabus sequence rather than maintaining a redundant `SyllabusNode` table.

### 3.3 Explanation structure (`src/lib/pyq/explanation-schema.ts`, zod)
Same schema (`explanation` + `analysis` with `coreTakeaway`, `keywords`, `optionBreakdown`, `statementBreakdown`, `pairBreakdown`, `similarPyq`, `inNews`, `valueAddition`, `visualSuggestion`, `reelData`).
An explanation is **present** when `explanation.trim()` is non-empty or `analysis` has `optionBreakdown` or `statementBreakdown`.

### 3.4 Studio models (New tables in `prisma/schema.prisma`)
- `Deck` (`id`, `ownerId`, `title`, `sectionPath`, `notes`, `isShared`, `items: DeckItem[]`, `createdAt`, `updatedAt`)
- `DeckItem` (`deckId`, `questionId`, `position`, `@@id([deckId, questionId])`)
- `RecordingSession` (`id`, `facultyId`, `sectionPath`, `deckId`, `part`, `totalParts`, `questionIds String[]`, `includeCds`, `status`, `startedAt`, `endedAt`, `durationSec`, `timestamps Json`, `lastIndex`, `videoRef`, `title`, `description`)
- `LectureUsage` (`id`, `questionId`, `facultyId`, `sessionId`, `presentedAt`)
- `TeacherNote` (`facultyId`, `questionId`, `body`, `updatedAt`, `@@id([facultyId, questionId])`)
- `FacultyPrefs` (`facultyId @id`, `defaultExam`, `includeCds`, `sortOrder`, `partSize`, `secondsPerQuestion`, `lastSectionPath`)

---

## 4–14. Core Rules & Phases
- **Content status (`src/lib/pyq/content-status.ts`):** `broken` (`answer`, `answer_mismatch`, `options`), `incomplete` (`explanation`), `ready` (warnings: `takeaway`, `theme`, `difficulty`, `exam`).
- **APIs & Access (§5):** `requireRole()` helper; light list `/api/admin/pyq` (< 1 KB/row, page size 25/50/100); `GET /api/admin/pyq/:id`; `/api/admin/pyq/tree` (5 min cache); `/api/admin/pyq/health`; `/api/admin/pyq/search-sections`; Decks, Recordings, TeacherNote, FacultyPrefs; reuse `checkScrapeGuard` + `SecurityEvent(scrape_suspect)` for 60 list req/10m & 400 distinct questions/hr limits.
- **UI & Flows (§6–§11):** Syllabus tree home → Section view & Decks → 3-click Record by section → Present mode (with no-explanation right panel + `TeacherNote`) → PYQ Editor (Admin only) → Mapping atlas cleanup (`/mapping`).
- **Phases 0–9:** Executed one phase at a time per `.agent/rules/pyq-studio-guardrails.md`.

---

## Appendix: File Map (Filled in Phase 0)

| Area | Current file(s) | Change |
|---|---|---|
| PYQ Studio list `/admin/studio/pyq` | `src/app/admin/studio/pyq/page.js`, `PyqStudioClient.js`, `pyq-studio.css` | Phase 1: light list; Phase 3: UI kit cleanup; Phase 4–5: Syllabus tree + Section view & Decks |
| Present mode `/admin/studio/present` | `src/app/admin/studio/present/page.js`, `src/app/admin/pyq/present/PyqPresenterClient.js`, `SlideBody.js`, `PyqAnnotationCanvas.js`, `StudioPresenterMap.js`, `present.css` | Phase 1: detail API + prefetch; Phase 3: Toolbar (≤ 6 visible); Phase 7: counter, no-explanation panel, TeacherNote |
| Recording studio `/admin/recording-studio` | `src/app/admin/recording-studio/present/RecordingPresenterClient.js`, `pyq/PyqRecordingStudioClient.js`, `src/lib/recordingVaultDb.js`, `RecordingsVaultBanner.js` | Phase 6: wrap IndexedDB vault + MediaRecorder capture & `formatYouTubeChapters` into `RecordingSession` without rewriting capture |
| PYQ Editor `/admin/pyq` | `src/app/admin/pyq/page.js`, `PyqAdminClient.js`, `[id]/page.js`, `[id]/PyqVisualEditorClient.js` | Phase 1: `ADMIN`-only guard + Faculty redirect notice; Phase 8: §10 validation, backlog table, bulk theme/exam/difficulty, AuditLog |
| `/api/admin/pyq` | `src/app/api/admin/pyq/route.js`, `[id]/route.js`, `bulk/route.js`, `taxonomy/route.js`, `clusters/route.js`, `similar/route.js` | Phase 1: light list (< 1 KB), page size whitelist, `requireRole()`, rate limit + `scrape_suspect`; Phase 4: `/tree`, `/search-sections`, `/health` |
| Role guards (pages + APIs) | Inline `getServerSession(authOptions)` checks per route + `src/lib/security/guards.ts`, `src/lib/rateLimit.js` | Phase 1: central `requireRole()` helper + reuse `checkScrapeGuard` / `writeSecurityEvent` / `writeAuditLog` |
| Stem formatter | `src/app/prelims/pyq/StemView.js` (`parseStem`), `src/lib/pyqStemParser.js`, `src/lib/pyqPattern.js`, `src/lib/pyqExplanationHelper.js` | Phase 3: reuse `parseStem` on PYQ Studio list cards (regular weight) |
| Map/diagram attachments | `src/app/admin/pyq/present/StudioPresenterMap.js`, `QuestionDraft.assets` | Preserve attachment flow; move card button to hover/row menu in Phase 3 |
| Mapping atlas `/mapping` + components | `src/app/mapping/page.js`, `src/app/atlas/page.js`, `src/components/MappingWorkspace.js`, `src/components/MappingCanvas.js`, `src/components/AtlasTimeTracker.js` | Phase 9: single top bar, collapsible rail, "Layers" dropdown, one numbering colour, ≥ 55% map width, "Quiz passed" |
| PYQ & taxonomy models in `schema.prisma` | `prisma/schema.prisma`: **`QuestionDraft`** (active PYQ bank queried by Studio/Editor, 2,528 rows), `Question`, `Subject`, `Topic`, `MicroTheme`, `TaxonomyAlias` | Phase 2: extend **`QuestionDraft`** (`examCode`, `explanationJson`, `contentStatus`, `missingFlags`, `stemFormat`, `syllabusOrder`, `updatedById`) + add `Deck`, `DeckItem`, `RecordingSession`, `LectureUsage`, `TeacherNote`, `FacultyPrefs` |
| Syllabus ordering | `src/app/prelims/pyq/topicGroups.js` (`SUBJECT_ORDER`, `TOPIC_GROUPS`, `getTopicSyllabusOrder`), `src/lib/syllabusTaxonomy.js` (`sortQuestionsBySyllabus`) | Phase 2/4: backfill/align `syllabusOrder` & tree ordering from `TOPIC_GROUPS` |
