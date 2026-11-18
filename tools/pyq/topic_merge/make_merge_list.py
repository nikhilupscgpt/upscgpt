"""Draft topic merge list for the Neon PYQ table. Targets are existing Neon topic names only — no new topics.
Writes merge_list.csv (one row per question to change) and merge_list.md. Nothing is changed in Neon."""
import json, os, csv, collections, re
R = json.load(open(os.path.expanduser("~/Desktop/PYQ Dashboard/data/neon_pyqs_with_solutions.json")))
P = "Indian Polity"
# 1. whole-topic merges: (subject, from topic) -> (to topic, why)
MERGE = {
    (P, "International Organisations & Groupings"): ("International Organisations & Relations", "same scope (UN bodies, BRICS, BIMSTEC); 7 vs 38 questions"),
    (P, "Elections & Political Parties"): ("Elections & Representation", "same scope (ECI, nominations, representation); 3 vs 5"),
    (P, "Country Profiles"): ("International Organisations & Relations", "single question on another country"),
    (P, "Federal System"): ("Centre-State Relations", "features of federalism sit with Centre-State Relations; 2 questions"),
    (P, "Historical Background"): ("Constituent Assembly", "single question on how the Constitution came about"),
}
# 2. single questions to move (id suffix -> (to topic, why)); same subject unless noted
MOVE = {
    "di6qgs": (P, "Parliament", "private member's bill — Parliament procedure, not elections"),
    "bch7sr": (P, "Parliament", "Deputy Speaker of Lok Sabha"),
    "et555v": (P, "Statutory & Non-Constitutional Bodies", "North Eastern Council is a statutory body (only question in Inter-State Relations)"),
    "vr80fd": (P, "Statutory & Non-Constitutional Bodies", "Central Administrative Tribunal"),
    "83nyut": (P, "Fundamental Rights", "NGT Act in line with Article 21"),
    "br6z2v": (P, "Elections & Representation", "Delimitation Commission"),
    "a17ukn": (P, "Parliament", "Parliament (Prevention of Disqualification) Act — MPs' disqualification"),
    "7qzq3r": (P, "Judicial Review & Landmark Judgements", "Aadhaar judgment"),
    "497bqq": (P, "International Organisations & Relations", "UN-Habitat"),
    "93okre": ("Modern History", "Constitutional & Administrative Developments", "dyarchy — Government of India Act 1919"),
}
# 3. no existing topic fits — your call (left out of the CSV moves)
NOFIT = {
    "qukx6n": "ethics case study (mediation by an official)",
    "ayq8zk": "ethics case study (civil servant)",
    "htyqka": "ethics case study (officer during a pandemic) — filed under Union Executive & Ministries",
    "j3bgh2": "Indian Army corps and their headquarters — defence, not polity",
    "gadmuo": "Chief of Defence Staff duties — filed under Union Executive & Ministries",
    "govynp": "Army civic-action operations — filed under Union Executive & Ministries",
    "kt5g2s": "equivalent ranks in the three services — filed under Statutory & Non-Constitutional Bodies",
    "ax9lt1": "economic results of British rule (Modern History › Miscellaneous) — nearest is Advent of Europeans & British Expansion",
}
sfx = lambda r: r["id"][-6:]
rows, used = [], set()
for r in R:
    k = (r["subject"], r["topic"])
    if k in MERGE and sfx(r) not in MOVE:
        rows.append([r["id"], r["examYear"], r["subject"], r["topic"], r["subject"], MERGE[k][0], "merge topic: " + MERGE[k][1], r["stem"][:90].replace("\n", " ")])
    if sfx(r) in MOVE:
        s, t, why = MOVE[sfx(r)]
        rows.append([r["id"], r["examYear"], r["subject"], r["topic"], s, t, "move question: " + why, r["stem"][:90].replace("\n", " ")])
        used.add(sfx(r))
assert used == set(MOVE), set(MOVE) - used
topics = {(r["subject"], r["topic"]) for r in R}
for s, t, _ in MOVE.values(): assert (s, t) in topics, (s, t)
for (s, _), (t, _) in MERGE.items(): assert (s, t) in topics, t
with open("merge_list.csv", "w", newline="", encoding="utf-8") as fh:
    w = csv.writer(fh); w.writerow(["id", "year", "subject", "current_topic", "new_subject", "new_topic", "reason", "question_start"]); w.writerows(rows)
# before/after counts
cnt = collections.Counter((r["subject"], r["topic"]) for r in R)
after = cnt.copy()
for row in rows: after[(row[2], row[3])] -= 1; after[(row[4], row[5])] += 1
gone = [k for k in cnt if after[k] == 0]
# same question filed twice
st = collections.defaultdict(list)
for r in R: st[re.sub(r"\W+", " ", r["stem"].lower()).strip()[:160]].append(r)
dups = [g for g in st.values() if len(g) > 1]
byid = {sfx(r): r for r in R}
L = ["# Topic merge list (draft)", "",
     f"Based only on the Neon export ({len(R)} questions, {len(cnt)} topics). Every target is an existing Neon topic. Nothing has been changed in Neon.", "",
     f"Result: {len(cnt)} → {len(cnt) - len(gone)} topics; {len(rows)} questions change topic (all listed in `merge_list.csv`).", "",
     "## 1. Merge whole topics", "", "| Subject | Merge | Into | Questions | Why |", "|---|---|---|---:|---|"]
for (s, f), (t, why) in MERGE.items():
    L.append(f"| {s} | {f} | {t} | {cnt[(s, f)]} | {why} |")
L += ["", "## 2. Move single questions", "", "| Question | Now in | Move to | Why |", "|---|---|---|---|"]
for k, (s, t, why) in MOVE.items():
    r = byid[k]; L.append(f"| {r['examYear']} · {r['stem'][:60].strip()}… ({k}) | {r['subject']} › {r['topic']} | {s} › {t} | {why} |")
L += ["", "After these moves Inter-State Relations is empty. Indian Polity › Miscellaneous keeps 6 questions and Modern History › Miscellaneous keeps 1 (see section 3).", "",
      "## 3. No existing topic fits — your decision", "",
      "These look like a pattern the current topic list has no place for (ethics case studies; defence forces). Options: leave them where they are, or add one topic each.", "",
      "| Question | Now in | Note |", "|---|---|---|"]
for k, note in NOFIT.items():
    r = byid[k]; L.append(f"| {r['examYear']} · {r['stem'][:60].strip()}… ({k}) | {r['subject']} › {r['topic']} | {note} |")
L += ["", "## 4. Same question stored twice", "", "Each pair has the same text under two subjects and two different years, so one copy is probably wrong. Check the year against the paper and delete the other.", "",
      "| Copy 1 | Copy 2 |", "|---|---|"]
for g in dups:
    L.append(" | ".join([""] + [f"{r['subject']} › {r['topic']} {r['examYear']} ({sfx(r)})" for r in g] + [""]).strip())
L += ["", "## Left as they are", "",
      "- **High Courts / Supreme Court / Subordinate Courts:** separate institutions; Subordinate Courts has 1 question (Gram Nyayalaya) but is a real topic.",
      "- **Economy › International Economic Organisations & Trade vs Polity › International Organisations & Relations:** overlap on bodies like WTO and IMF, but one is economic and one is diplomatic.",
      "- **Banking & RBI vs Capital Markets & Financial Instruments**, **Schedules vs Scheduled & Tribal Areas:** similar words, different content.",
      "- **'General' buckets** (Ancient History – General 7, Medieval History – General 9, General Science 11, Miscellaneous Geography 10): not checked question by question."]
open("merge_list.md", "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L[:8])); print("empty after:", gone)
