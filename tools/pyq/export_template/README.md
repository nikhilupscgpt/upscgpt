# UPSC Prelims PYQ Analysis — standalone dashboard

An interactive analysis of **1,512 UPSC CSE Prelims questions (2011–2026)**, built from the Neon database export with its 10 subjects and 118 topics. It has three pages:

1. **Overview** — all subjects across all years:
   - subject cards
   - a grid of each subject's share of each paper
   - the biggest-moving themes
   - question formats by year
   - themes asked almost every year
2. **Subject** — opens when you pick a subject:
   - headline numbers and questions per paper
   - question formats
   - every theme, with a year-by-year mini chart
   - written insights: overview, key findings, repeated concepts and how to prepare
3. **Theme** — opens when you pick a theme:
   - headline numbers and priority
   - year chart and sub-topics
   - written insights
   - every PYQ, with the answer hidden until you click

Plus an **"Ask PYQs" chat box** (bottom-right button, on every page). It is rule-based, with no AI and no server, so every number is exact. See [Chat box](#chat-box-chatjs).

It is plain HTML, CSS and JavaScript, with no build step. Only `d3` and the Google Fonts load from a CDN.

## Run it

- **Quickest:** double-click `index.html`. The data is bundled in `data/data.js`, so it works straight from disk.
- **Local server** (recommended while developing):
  ```bash
  python3 -m http.server 8000
  ```
  Then open http://localhost:8000.

## Files

| File | What it holds |
|---|---|
| `index.html` | Page markup: the step bar and the three page sections (`#home`, `#subject`, `#theme`) |
| `page.css` | Layout and component styles |
| `tokens.css` | Colours, fonts, sizes and the light/dark theme. **Edit this first to restyle.** |
| `app.js` | Calculations (`dash.calc`), helpers (`window.PQ`), page flow (`PQ.show`) and every drawing (`dash.draw`) |
| `data/glossary.json` (+ `glossary.js`) | UPSC glossary: Hindi/Marathi translations, theme terms, subject-only words |
| `test.html`, `chat-test.js`, `data/chat-tests.json` | Chat test page, runner and the 99-question test set |
| `chat.js`, `chat.css` | The "Ask PYQs" chat box: query parser, answer builders, search index and panel UI |
| `dash-shim.js` | A ~150-line stand-in for the dashboard runtime (`dash.data`, `dash.draw`, `dash.setParams`, …) |
| `data/questions.json` | One row per question: `id, year, subject, subjectKey, theme, themeKey, sub, ca, format, stem, options, answer, answerText, tentative, map` |
| `data/insights.json` | `{subjects: {subjectKey: {overview, keyFindings, recurringConcepts, studyStrategy}}, themes: {themeKey: {summary, subTopics, repeatedConcepts, nature, priority, priorityReason, whatToStudy, exampleIds}}}` |
| `data/data.js` | Both JSON files bundled for `file://` use. Regenerate it with `python3 make_data.py` after editing them. |

## How it works

- **Data flow:** everything is computed from `questions.json`. Eight calculations in `app.js` derive the numbers on the page: `year_totals`, `subject_summary`, `subject_year`, `theme_summary`, `theme_year`, `format_mix`, `sub_summary` and `format_year`.
- **Drawing:** every element marked `data-draw="name"` is filled by `dash.draw('name', fn)`. Drawings re-run when the selection changes (`dash.setParams`), when the width changes, and when a hidden page or tab is shown.
- **Navigation:**
  - `PQ.pickSubject(key)` selects a subject and opens the Subject page.
  - `PQ.pickTheme(key, subjectKey?)` selects a theme and opens the Theme page.
  - `PQ.show('home' | 'subject' | 'theme')` switches pages.
  - The URL hash (`#subject`, `#theme`) keeps the current page.
  - The selection is remembered in `localStorage`.
- **Trend rule:** compares questions per paper in 2020–23 with 2011–15. "Rising" or "Falling" means at least 1.5× different and at least 0.5 apart. Themes with fewer than 4 questions show "Too few".

## Chat box (`chat.js`)

The chat box answers by rules, not by an AI model.

**The 4-step reading.** Every question is read in four steps, and each step only searches inside the one before it. The result is shown as a strip above each answer, e.g. *Environment › Biodiversity & Conservation › all › Count · "ramsar"*.

1. **Subject.** Found from names and short forms (*polity*, *eco*, *S&T*…). If none is named, it is inferred from the theme or sub-topic ("from theme").
2. **Theme** (106 themes). Found from aliases and theme-name words. If a subject was named, only that subject's themes are searched. So *"polity budget"* gives Budget & Financial Procedure, not the Economy budget theme.
   - If nothing matches, or the only match is one weak word (*"commission"*, *"rights"*), the **theme guesser** steps in (see below).
3. **Sub-topic** (295 sub-topics). Found from sub-topic-name words inside the theme found so far. A sub-topic typed in full, such as *"presidential election"* or *"73rd amendment"*, also sets its theme.
4. **Query.** The question type (count, when, trend, show questions, top, how to prepare…) plus any leftover keyword. The keyword is searched only inside the levels above: *"ramsar"* gives the 4 Ramsar questions inside Biodiversity, not all 88.

If a keyword has no matches there, it is dropped and the answer says so. Each keyword answer has a button for the whole theme instead.

How the rest of the pipeline runs:

1. **Parse.** It finds subjects (aliases such as *polity*, *eco*, *S&T*), themes (aliases such as *RBI*, *MSP*, *Ramsar*, *monsoon*, plus matching words in theme names), years (*2023*, *2015 to 2019*, *since 2018*, *last 5 years*, *recent*), question formats and "top N".
2. **Pick an intent** from trigger words, in this order: help, compare (*vs*), study strategy, repeated concepts, current affairs, asked every year, formats, show questions, trend, when asked, top, count, then a subject or theme overview, then free-text search.
3. **Answer** from the same calculations as the dashboard (`dash.data('theme_summary')` and so on), or from a ranked keyword index over every question stem and option.
4. **Show** text with exact numbers, mini bar charts, a year-by-year chart, question cards with hidden answers, buttons that open the dashboard page, and follow-up suggestions.

**Questions it handles:**

- "Top 5 themes in Economy" / "most important topics"
- "Which themes are rising?" / "Which polity themes are falling?" / "Is climate change rising?"
- "How many Polity questions in 2023?" / "2019"
- "When was Panchayati Raj asked?"
- "Show questions on Ramsar" / "Show Polity questions in 2021" / "statement I-II questions in economy"
- "Question formats in 2023"
- "Economy vs Environment" / "RBI vs inflation"
- "How to prepare Geography" / "What to study for banking" / "Repeated concepts in polity"

**Spelling mistakes** (no AI):

- Every word you type is checked against a list of known words: subject, theme and alias words, question words such as *rising* or *prepare*, and every word in the question bank.
- An unknown word is replaced by the closest known word by edit distance, which counts letters added, dropped, changed or swapped. Short words may have one typo; words of 7 or more letters may have two. Subject and theme words win ties.
- The answer shows "✎ Read as: polty → polity" with a link to search the text exactly as typed.

**Follow-up questions** (conversation memory):

- The bot remembers the subject or theme, the years and the type of question from its last answer.
- A question with no subject or theme borrows them, for example *"and in 2022?"*, *"show them"* or *"is it rising?"*. So does a question starting with *and*, *what about*, *it* or *these*.
- *"what about economy?"* keeps the last type of question and swaps the subject. *"compare with environment"* compares with the last subject.
- Every answer shows "↻ Following up on …" with a link to ask across all subjects instead. Words like *overall* or *whole paper* skip the memory. Type *reset* to start fresh.

**The bot asks back** instead of guessing:

- *"when was it asked?"* with nothing remembered → "Which subject or theme?" with buttons. Clicking *Polity* finishes the original question.
- Two themes that match equally well → "Did you mean …?" with buttons.
- *"compare"* with only one thing named → asks what to compare with.

**Theme guesser** (a small statistical model, no AI):

- It learns from the 1,114 tagged questions which words belong to which theme. For example, Climate Change questions say *Kyoto, emissions, UNFCCC*, and Judicial Review questions say *basic structure, doctrine*.
- A new question is scored against every theme. This is a Naive Bayes classifier with Dirichlet smoothing, about 60 lines in `guessTheme()` in `chat.js`.
- **50% sure or more:** it uses the theme. The path shows "guessed 63%", and a note lists the words the guess was based on and the next-best themes.
- **30–50% sure:** it asks back: "Did you mean A, B or C?"
- **Below 30%:** it doesn't guess.
- Settings are in `NBP` at the top of the guesser.
- It retrains itself from the data every time the page loads, in under a second. If you add new tagged questions, it learns from them automatically.

**UPSC glossary** (`data/glossary.json`, edit freely):

- **`translate`** (about 230 entries) — Hindi/Marathi words replaced by English before the question is read:
  - subjects and topics: *sanvidhan → constitution*, *mahagai → inflation*, *hamibhav → MSP*, *jalvayu parivartan → climate change*;
  - question words: *kiti/kitne → how many*, *kevha/kab → when*, *dakhva/dikhao → show*, *vadhat → rising*.
- **Filler words** such as *aahe, ka, hai, kya, che, madhe* are ignored.
- **`themes`** (about 1,200 terms) — UPSC terms, short forms and names that point to a theme: *habeas corpus*, *treasury bills*, *subsidiary alliance*, *PSLV*, *ZBNF*.
  - They also train the theme guesser.
  - They are searched as keywords inside the theme. When no question mentions a term, the whole theme is shown.
- **`subjects`** — words that span several themes, such as *vaccines*, *coral* and *groundwater*. They set only the subject, and the answer shows which themes the matches fall in.
- **The data checks the glossary.** On load, every term is matched against the questions. If a term appears in 2 or more questions and under half are in its glossary theme:
  - it moves to the theme the data puts it in (60% or more), e.g. *Ramsar convention → Biodiversity*;
  - or, if there is no clear theme, it stays a plain search word, e.g. *court*, *coal*, *cotton*.
  - About 95 terms are moved this way. Run `PQChat.glossaryReport()` in the browser console to list them.
- **Literal first.** If the typed words appear in 3 or more questions, those questions are searched directly instead of guessing a theme.

**Tests** — open `test.html`:

- It runs the 99 questions in `data/chat-tests.json` through the chat engine and shows the score and every failure at the top of the page.
- Edit `chat-tests.json` to add cases, then run `python3 make_export.py`.
- Scores so far:
  - Before the guesser: 77/99 (paraphrases 19/40).
  - With the guesser: 93/99 (paraphrases 34/40; everything else 100%).
  - With the glossary: 123/123, including 24 new glossary and Marathi/Hindi tests.
    - These glossary tests were written alongside the glossary, so they check its entries rather than measure fresh questions.
    - The real measure is questions from actual students. Add every question the bot gets wrong to `chat-tests.json`.
- **Run the tests after every change.** A change that lowers the score is a regression.

**To extend it:**

- Add words to `SUBJECT_ALIASES` or `THEME_ALIASES` at the top of `chat.js`.
- Add a new intent: write an `ans…` function and add a trigger line in `answer()`.
- `PQChat.answer('…')` and `PQChat.parse('…')` can be called from the browser console to test.

**Limits:**

- It does not understand free-form reasoning ("why is polity rising?").
- It does not understand Hindi or Hinglish.
- It does not fix typos in words shorter than 4 letters.
- Memory only reaches back one answer.

## Data caveats

- **Coverage:** each year has 64–97 of its 100 questions.
- **Thin subjects:** Ancient History, Medieval History and Art & Culture are almost absent. They are grouped as "Other (thin data)".
- **AI-assisted fields:** sub-topics (`sub`), the current-affairs flag (`ca`), priorities and all written insights were assigned by reading every question. They are a study guide, not an official classification.
- **Source data problems:**
  - Some questions are duplicated or filed under the wrong theme.
  - A few answer keys look wrong: MOD-UPSC-2011-08, MOD-UPSC-2018-07 and GEO-UPSC-2022-03.
  - Answers marked `tentative` are flagged on their question cards.

## Prompts to give the Antigravity agent

Paste one of these to keep building:

- *"Read README.md, then serve this folder and open it in the browser. Check all three pages (Overview → Subject → Theme) at desktop and mobile widths and fix any layout problems."*
- *"Convert this into a React + Vite app. Keep `data/questions.json` and `data/insights.json` as the data. Port the calculations in app.js into pure functions, and keep the same three-page flow, with routes `/`, `/subject/:subjectKey` and `/subject/:subjectKey/theme/:themeKey`."*
- *"Add more Marathi/Hindi words to data/glossary.json under 'translate', then run python3 make_export.py and check test.html still passes."*
- *"Add an optional LLM mode to the chat box: send the question plus the matching numbers from chat.js to an API, and show the reply under the rule-based answer."*
- *"Add a 'Practice mode' on the Theme page: one question at a time, pick an option, show right or wrong, and keep a score in localStorage."*
- *"Rebuild from a fresh Neon export: run `python3 build_neon_dashboard.py <export.json>` then `python3 make_export.py` in the analysis folder."*

## Data source (since the Neon remap)

- `build_neon_dashboard.py` turns the Neon export into `data/questions.json` and `data/insights.json`. Its `build_report.md` says how much of each field is copied and how much is estimated.
- Periods: 2011–15, 2016–20 and 2021–26. "Always asked" means 14 or more of the 16 papers.
- Sub-topics and the current-affairs flag come from the 2011–2023 tags where the question was in that set.
  - Otherwise they are estimated by Naive Bayes. Questions that say "recently" or "in news" count as current affairs.
  - Ancient, Medieval, Modern History and Art & Culture default to not current affairs.
- Theme notes (what to study, repeated concepts) are carried over from the 2011–2023 analysis for 94 of 118 themes. The numbers are always recomputed.
- `python3 make_export.py --old` still builds from the old 2011–2023 data, but the chat's topic words now follow the Neon topics.

## One chat box: numbers + solutions (no AI model)

The "Ask PYQs" box answers two kinds of questions and picks the engine itself (`PQChat.route`):

- **Numbers** (`chat.js`) — weightage, trends, years, formats, themes: "top 5 themes in polity", "trend of budget".
- **Solutions** (`tutor.js`, data in `data/tutor-data.js`) — "what is fiscal deficit", "quiz me on economy",
  "explain the 2019 question on …", answers built from the stored solutions. Styles in `tutor.css`.

Both fix spellings (edit distance, plus 3-letter pieces for words that are far off, e.g. "parlimentery").

### Unanswered questions

`pq-log.js` records questions the box couldn't answer, asked back about, or that a student marked
"Not what I wanted". Rows stay in the browser — open `misses.html` to read or download them. To collect them
on the site, set the endpoint in `pq-config.js`:

```js
window.PQ_LOG_ENDPOINT = "/api/pyq-log";
```

The Next.js route and table for that are in `pyq-nextjs-kit.zip` (see its README).

### Files added for this

`tutor.js`, `tutor.css`, `data/tutor-data.js`, `pq-log.js`, `pq-config.js`, `misses.html`. Rebuild all of them
with `python3 rebuild_all.py` in the analysis folder.

## How the box reads a question (rebuilt)

1. **What is it about?** One index holds every subject, theme and sub-topic name, their aliases and glossary words, and
   the keywords of the written solutions. The longest name found wins; for the same words a full name beats a solution
   keyword, which beats an alias. A name that fits two topics equally makes the box ask which one.
2. **What is asked?** Read only from the words outside that name — so "Basic Economic *Concepts*" or "Climate *Change*"
   are never mistaken for "repeated concepts" or "trend".
3. **Which side answers?**
   - quiz, an open question, "explain / why not b / statement 2" → solutions side
   - a numbers question (count, trend, top, when, repeated, compare, how to prepare, formats…) → numbers side
   - a subject / theme / sub-topic name alone → its overview
   - a term (a solution keyword, or a phrase UPSC actually used) → its **term page**: the meaning when one is stored
     (or a note saying none is yet), then the PYQ count, years and every question

## Tests (open test.html)

- **Hand-written** (`chat-tests.json`): 146 questions with the reading they must get.
- **Generated** (`stress-test.js`): every theme × 8 phrasings and ~220 solution keywords × 5 phrasings, each also with a
  typo — about 3,800 questions. Score when rebuilt: 98% (from 60% before the rebuild). The failures list on the page
  shows exactly which phrasings break; most remaining ones are words mangled by the made-up typo.
