# PYQ Tutor + solution checker

No LLM, no AI model and no network calls. The tutor reads what the student types (fixing typos and some Marathi/Hindi words), finds the question or keyword, and shows the solution fields already stored in Neon.

## Files

| File | What it is |
|---|---|
| `check_solutions.py` | Checks a batch of solutions before upload. Writes `check-report.md` and `check-report.csv`, and exits with code 1 if it finds errors. |
| `build_tutor_data.py` | Neon export → `data/tutor-data.js`. Cleans as it goes: drops empty similar-PYQ placeholders, wraps text-only value additions, and links each similar PYQ to its question id. |
| `index.html`, `tutor.js`, `tutor.css`, `tokens.css` | The tutor page. Open `index.html` through any static server. |
| `tutor-tests.json`, `tutor-test.js`, `run_tests.js` | Test set. Run `node run_tests.js`, or open `index.html?test`. |

## Run

```bash
python3 check_solutions.py neon_pyqs_with_solutions.json --subject "Indian Polity"
python3 build_tutor_data.py neon_pyqs_with_solutions.json
node run_tests.js
python3 -m http.server 8770      # then open http://127.0.0.1:8770
```

## What the tutor understands

- **Quiz:** "quiz me on polity", "test me on 5 polity questions since 2020", "quiz on fundamental rights". Answer with a, b, c or d; "next", "skip" and "stop" also work. At the end it shows the score and misses by topic, and can retry the missed ones.
- **Open a question:** "random economy question", "give one question on banking", "open 3" (from the last list), "2019 q 14". Question numbers repeat in the data, so it asks which one.
- **About the open question:**
  - "answer", "explain", "statement 2", "why not b", "pair II";
  - "keywords", "value addition", "in news", "similar pyq", "table", "takeaway";
  - "next" and "previous".

  A button appears only if the question has that field.
- **Keywords:** "what is judicial review", "fdi meaning", "fiscal deficit kay aahe". It shows the keyword note from the solutions and every PYQ the term appears in.
- **Trends:** "how has UPSC asked about article 21", "pyqs on inflation", "what did upsc ask on panchayats". It shows a count per year and the list.
- **Overview:** "polity topics" (bars show solved vs total), "which subjects have solutions".

## Moving it to Next.js

- Use `tutor.js` as a client component. The logic doesn't depend on the page: `PQTutor.answer(text)` returns `{intent, meta, nodes, chips}`.
- Swap `data/tutor-data.js` for a build-time JSON generated from Neon, using the same shape as `build_tutor_data.py`.
- Run `check_solutions.py` in the ingest step. A non-zero exit means "don't publish this batch".
- When a subject's solutions land, rebuild the data. The new buttons appear on their own.

## Scores

65/65 on `tutor-tests.json`. Like the chat tests, these were written by us, so the score is optimistic. Real student questions (log the ones that get no answer) are the honest test.
