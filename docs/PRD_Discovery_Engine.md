# PRD: UPSC Atlas Discovery Engine & Search Infrastructure

[USER: PASTE YOUR COMPLETE PRD CONTENT BELOW THIS LINE]
Here is the final locked PRD.

***

# PRD: UPSC Atlas — Universal Search Engine

**Version:** 3.0 (Final) | **Date:** May 2026 | **Status:** Locked for Development

***

## 1. Problem Statement

Students on UPSC Atlas have no unified way to discover content. They navigate manually — browsing the Map, scrolling PYQs, hunting through nodes. This creates friction at the most critical moment: when a student has a topic in mind and needs the right resource instantly.

The Search Engine is the **primary entry point** to the entire Atlas ecosystem — one bar, four result types, everything accessible, zero cloud cost for V1.

***

## 2. Goals & Success Metrics

**Goals:**

- Make every piece of Atlas content discoverable from a single bar
- Work with zero cloud API cost and zero Ollama live dependency
- Deliver a demo-ready experience in 7 days on existing infrastructure

**Success Metrics:**

- Search returns results in under 200ms
- 30–40 nodes fully indexed with quality metadata
- Investor types any GS2/GS3 topic → gets a rich result with node card + PYQs
- All 4 tabs visible and functional (Latest News tab honest about status)

***

## 3. Scope

### In Scope — V1 (Demo Ready)

- Single universal search bar: *"Search or Ask..."*
- Four result tabs: **Answer · Article · PYQ · Latest News**
- **Postgres full-text search** (`tsvector`) across node metadata, PYQ metadata — no Ollama live dependency
- Answer tab: rich metadata card (no LLM generation) — keyThemes, subtopics, linked PYQs
- AI Forge: one-time Gemma batch (local Ollama) to generate metadata for all 545 nodes
- Embeddings: one-time `nomic-embed-text` batch (local Ollama) stored in Neon pgvector — ready for V2 semantic upgrade
- Empty nodes still appear — show metadata + PYQs, content area marked "Coming Soon"

### Out of Scope — Post-Funding (V2)

- Live semantic search (pgvector cosine similarity replacing full-text)
- LLM-generated Answer tab (Gemma RAG streaming)
- Latest News tab
- Personalised search ranking
- ScaNN migration (when vectors exceed 50K)

***

## 4. User Stories

| As a... | I want to... | So that... |
|---|---|---|
| UPSC student | Type "Article 356" and see the relevant node card with key themes and PYQs | I get oriented instantly without manual navigation |
| UPSC student | Click the PYQ tab and find all past questions on that topic | I can practice directly from search |
| UPSC student | Click the Article tab and see ranked study nodes on the topic | I can go deep when needed |
| Investor | Type any UPSC topic and see a rich, structured result appear fast | They trust the product is real and working |

***

## 5. UI Specification

### 5.1 Search Bar — Home Page Hero

```
┌──────────────────────────────────────────────────────┐  ┌─────┐
│  🔍  Search or Ask...                                │  │ Go  │
└──────────────────────────────────────────────────────┘  └─────┘

     [ Answer ]   [ Article ]   [ PYQ ]   [ Latest News ]
```

- Full-width, center-aligned, prominent on landing
- Placeholder: *"Search or Ask..."*
- Go button on right + Enter key triggers search
- Tabs appear below bar after first search, persist across queries
- `Cmd/Ctrl + K` focuses bar from anywhere in app

### 5.2 Answer Tab (Default)

No LLM. Pure DB retrieval. Looks rich, costs nothing.

```
┌──────────────────────────────────────────────────────────┐
│ 📌 Governors Discretionary Powers                        │
│ GS2 · Polity & Governance · High Relevance               │
│                                                          │
│ Key Themes:                                              │
│ Article 356 · Sarkaria Commission · Centre-State         │
│ Relations · Constitutional Crisis · Misuse of Office     │
│                                                          │
│ Subtopics:                                               │
│ Appointment & Removal · Dismissal of CM ·                │
│ Reservation of Bills · Prorogation of Assembly           │
│                                                          │
│ 📝 PYQs on this topic:                                   │
│  • 2019 GS2 — Critically examine the role of...         │
│  • 2022 GS2 — Has Article 356 been misused?              │
│                                                          │
│      [Open Full Node →]        [View on Map →]           │
└──────────────────────────────────────────────────────────┘
```

- Top result = highest full-text match score
- Shows: title, domain, GS tag, examRelevance, keyThemes, subtopics, linked PYQs
- Two CTAs: open the node page, jump to map location
- If content empty: body shows *"Content coming soon — themes and PYQs available now"*

### 5.3 Article Tab

```
┌──────────────────────────────────────────────────┐
│ 🏛  Governors Discretionary Powers               │
│ GS2 · Polity & Governance · High Relevance       │
│ Article 356 · Federalism · Sarkaria Commission   │
│ 📝 4 PYQs   🗺 View on Map                       │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ 🏛  Centre-State Relations                       │
│ GS2 · Polity & Governance · High Relevance       │
│ ...                                              │
└──────────────────────────────────────────────────┘
```

- Node cards ranked by full-text match score
- Each card: title, domain, GS tag, examRelevance, theme chips, PYQ count, Map link

### 5.4 PYQ Tab

```
┌──────────────────────────────────────────────────────────┐
│ 📝 2019 — GS2 Mains                                      │
│ "Critically examine the role of the Governor in          │
│  Centre-State relations in India."                       │
│ 🏷  Governors Powers · Article 356 · Federalism          │
│ [View Model Answer →]                                    │
└──────────────────────────────────────────────────────────┘
```

- PYQs ranked by full-text match against question text + topicTags
- Each card: year, paper, full question, topic tags, model answer CTA

### 5.5 Latest News Tab

```
┌──────────────────────────────────────────────────────────┐
│ 📰 Latest News                              [Coming Soon]│
│                                                          │
│  Current affairs linked to Issue Nodes.                  │
│  Launching with the News Engine.                         │
└──────────────────────────────────────────────────────────┘
```

- Tab visible, clearly labelled Coming Soon — not hidden, not broken
- Signals roadmap to investors without pretending it's built

***

## 6. Architecture

### 6.1 Full System Flow

```
ONE-TIME BATCH (runs locally on M1 Mac, Ollama):
─────────────────────────────────────────────────
[545 Nodes from DB]
       ↓
[AI Forge: Gemma 27B prompt per node]
       ↓
[Metadata JSON written to Neon DB]
       ↓
[nomic-embed-text: metadata → vector]
       ↓
[pgvector stored in Neon — ready for V2]


LIVE PRODUCT (zero Ollama dependency):
─────────────────────────────────────────────────
[User types query in search bar]
       ↓
[/api/search?q= receives query]
       ↓
[Postgres tsvector full-text search]
[across: node titles, keyThemes,      ]
[subtopics, linkedConcepts, pyqAngles ]
[+ PYQ: questionText, topicTags       ]
       ↓
[Ranked results returned]
       ↓
[Answer tab]  [Article tab]  [PYQ tab]
 Top node      Node cards     PYQ cards
 rich card     by score       by score
```

### 6.2 Search Index Fields (tsvector)

**Nodes indexed on:**

- `title` (weight A — highest)
- `keyThemes[]` (weight A)
- `subtopics[]` (weight B)
- `linkedConcepts[]` (weight B)
- `pyqAngles[]` (weight C)
- `domain`, `gsPaper` (weight C)

**PYQs indexed on:**

- `questionText` (weight A)
- `topicTags[]` (weight A)
- `keywordsToAddress[]` (weight B)

### 6.3 Node Metadata Schema

```json
{
  "nodeId": "governors-discretionary-powers",
  "title": "Governors Discretionary Powers",
  "domain": "Polity & Governance",
  "gsPaper": ["GS2"],
  "examRelevance": "High",
  "keyThemes": [
    "Article 356", "Centre-State Relations",
    "Constitutional Crisis", "Misuse of Governor's Office",
    "Sarkaria Commission"
  ],
  "subtopics": [
    "Appointment & Removal", "Dismissal of Chief Minister",
    "Reservation of Bills", "Prorogation of Assembly",
    "Report to President"
  ],
  "linkedConcepts": ["Federalism", "President's Rule", "Constitutional Morality"],
  "pyqAngles": [
    "Critically examine the role of Governor in Centre-State relations",
    "Has the Governor become an agent of the Centre?",
    "Discuss constitutional provisions vs. actual practice"
  ],
  "contentStatus": "EMPTY | PARTIAL | FILLED",
  "embeddingVector": "[pgvector — ready for V2 semantic search]"
}
```

### 6.4 PYQ Metadata Schema

```json
{
  "pyqId": "pyq-2019-gs2-governor-role",
  "questionText": "Critically examine the role of the Governor in Centre-State relations in India.",
  "year": 2019,
  "paper": "GS2",
  "exam": "UPSC Mains",
  "topicTags": ["Governors Discretionary Powers", "Centre-State Relations", "Federalism"],
  "linkedNodeIds": ["governors-discretionary-powers", "centre-state-relations"],
  "questionType": "Critical Analysis",
  "keywordsToAddress": ["Article 356", "Sarkaria Commission", "constitutional morality"],
  "modelAnswerStatus": "AVAILABLE | PENDING",
  "examRelevance": "High",
  "embeddingVector": "[pgvector — ready for V2]"
}
```

### 6.5 Tech Stack

| Layer | V1 Tool | V2 Upgrade Path |
|---|---|---|
| Database | Neon PostgreSQL | Same |
| Search method | `tsvector` full-text search | pgvector cosine similarity |
| Embeddings (batch) | `nomic-embed-text` via Ollama | Same |
| Metadata generation | Gemma 27B via Ollama (one-time) | Same |
| Answer tab | Pure DB retrieval | Gemma RAG streaming (local) |
| Live inference | None required | Gemma 27B (or cloud when funded) |
| Vector index (future) | pgvector HNSW | ScaNN when >50K vectors |

***

## 7. AI Forge — Batch Metadata Generation

**Prompt template (per node):**
> *"You are building a UPSC preparation knowledge base. For the syllabus node '[NODE TITLE]' under domain '[DOMAIN]', paper '[GS PAPER]': Generate a JSON with — 5 keyThemes (specific UPSC concepts), 5 subtopics, 3 linkedConcepts, 3 pyqAngles (typical Mains exam question framings), examRelevance (High/Medium/Low). Return only valid JSON, no explanation."*

**Pipeline:**

1. Read all 545 nodes from Neon DB
2. For each node → call Gemma 27B via Ollama with prompt template
3. Parse + validate JSON response → write metadata fields to DB
4. Trigger `nomic-embed-text` embedding on successful write → store in pgvector column
5. Log failures → manual review queue
6. Founder spot-checks 20–30 nodes for quality before going live

**Estimated runtime:** ~30 minutes unattended on M1 Mac

***

## 8. Build Sequence

| Day | Task | Output |
|---|---|---|
| Day 1 | Add `metadata` (JSONB) + `embedding` (vector) + `searchVector` (tsvector) fields to Prisma schema; run migration | Updated schema, Neon migrated |
| Day 2 | Build & run AI Forge batch script (Gemma local) | All 545 nodes have metadata; embeddings stored |
| Day 3 | Build tsvector index on nodes + PYQs; build `/api/search` route | Working search API |
| Day 4 | Build Answer tab UI — rich metadata card with PYQ list | Flagship result working |
| Day 5 | Build Article tab (node cards) + PYQ tab (question cards) | All active tabs functional |
| Day 6 | Add "Coming Soon" state for Latest News tab; polish UI | All 4 tabs present |
| Day 7 | Test with 20 demo queries; founder reviews AI Forge quality; fix edge cases | Investor demo ready |

***

## 9. V2 Upgrade Path (Post-Funding)

The entire V1 infrastructure is forward-compatible. Upgrading to semantic search requires only:

1. **Swap search method:** Replace `tsvector` query in `/api/search` with pgvector cosine similarity — embeddings are already stored in Neon from Day 2
2. **Add live query embedding:** Add `nomic-embed-text` call on incoming query (or switch to `text-embedding-004` if cloud budget available)
3. **Enable Answer tab RAG:** Add Gemma streaming response layer on top of existing metadata retrieval
4. **News tab:** Unlock when News Engine is live

No schema changes. No data migration. One file change to unlock semantic search.

***

## 10. Risks

| Risk | Mitigation |
|---|---|
| Gemma metadata quality inconsistent | Strict JSON schema validation; founder spot-checks 20–30 nodes |
| Full-text search misses semantic matches | UPSC vocabulary is specific enough that keyword matching covers >90% of real queries |
| tsvector doesn't match abbreviations (e.g. "Art 356") | Add common UPSC abbreviation synonyms to search index |
| Node content never gets filled | Empty nodes show metadata + PYQs — product remains useful at full scale |
| M1 Mac unavailable during AI Forge | Batch is one-time; schedule it, not time-critical |

***

This PRD is now fully locked. Every decision is resolved, every dependency is explicit, the V2 path is clear, and a developer (or AI assistant) can start on Day 1 with no open questions. The total live infrastructure cost is **₹0** — Neon free tier + no cloud inference required.

Ready to move to Day 1 implementation — the Prisma schema update?
