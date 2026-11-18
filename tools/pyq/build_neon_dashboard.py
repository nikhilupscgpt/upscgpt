"""Turn the Neon export into the dashboard + chat data (questions.json, insights.json), years 2011–2026,
using Neon's own subjects and topics. No LLM: everything below is counting, rules and Naive Bayes.

Usage:  python3 build_neon_dashboard.py <neon_pyqs_with_solutions.json>
Writes: analysis/dashboard_neon/{questions.json, insights.json, theme_map.json, build_report.md}

Per question:
- subject / theme      = Neon subject / topic
- format               = taken from the old dataset when the question is there, else a rule on the stem and options
- sub-topic, CA tag    = from the old dataset when the question is there (same theme), else Naive Bayes trained on
                         the questions that do have them (marked subAuto / caAuto)
Insights:
- numbers (subject overview, key findings, priority reasons) are regenerated from the Neon data
- teaching notes (sub-topics, repeated concepts, what to study, strategy) are carried over from the 2011–2023 analysis
  where the theme exists; their example ids are re-pointed at Neon ids
"""
import collections
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OLD = os.path.join(HERE, "dashboard")
OUT = os.path.join(HERE, "dashboard_neon")
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Desktop/PYQ Dashboard/data/neon_pyqs_with_solutions.json")
PERIODS = [(2011, 2015, "avgEarly"), (2016, 2020, "avgMid"), (2021, 2026, "avgRecent")]

R = json.load(open(SRC, encoding="utf-8"))
OQ = json.load(open(os.path.join(OLD, "questions.json"), encoding="utf-8"))
OI = json.load(open(os.path.join(OLD, "insights.json"), encoding="utf-8"))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower().replace("&", " ")).strip("_")


def key_of(stem):
    return re.sub(r"\W+", " ", (stem or "").lower()).strip()[:100]


STOP = set("a an the of in on to for with by from at is are was were be been it its this that these those which what who how "
           "following given below above statements statement consider correct incorrect select answer using code only both "
           "neither nor and or not none all one two three four with reference regard regarding respect".split())


def toks(s):
    out = []
    for w in re.findall(r"[a-z][a-z0-9]+", (s or "").lower()):
        if w in STOP or len(w) < 3:
            continue
        if len(w) > 4:
            w = re.sub(r"(ies)$", "y", w)
            w = re.sub(r"(ing|ed|es|s)$", "", w)
        out.append(w)
    return out


# ---------- format rule ----------
def fmt_rule(stem, opts):
    s = stem or ""
    o = " ".join(opts).lower()
    if re.search(r"statement[\s-]*(i|1)\b[\s\S]*statement[\s-]*(ii|2)\b", s, re.I) and re.search(r"statement[\s-]*ii", s + " " + o, re.I):
        return "Statement I–II"
    if re.search(r"\bhow many\b", s, re.I) or re.search(r"\bonly (one|two|three)\b", o) and re.search(r"\b(all three|all four|none)\b", o):
        return "How many correct"
    if re.search(r"\b(match|matched|pairs?)\b|list[\s-]*i\b", s, re.I):
        return "Pairs / match"
    if len(re.findall(r"(?m)^\s*\d\s*[.)]\s+\S", s)) >= 2 or re.search(r"\b1 and 2\b|\b2 and 3\b|\b1, 2 and 3\b", o):
        return "Multi-statement"
    return "Direct"


# ---------- Naive Bayes ----------
class NB:
    def __init__(self, alpha=0.5):
        self.alpha, self.cnt, self.tot, self.docs, self.vocab = alpha, collections.defaultdict(collections.Counter), collections.Counter(), collections.Counter(), set()

    def add(self, label, words, w=1):
        self.docs[label] += w
        for t in words:
            self.cnt[label][t] += w
            self.tot[label] += w
            self.vocab.add(t)

    def scores(self, words, labels=None):
        labels = labels or list(self.docs)
        N = sum(self.docs[l] for l in labels) or 1
        V = len(self.vocab) or 1
        out = {}
        for l in labels:
            s = math.log((self.docs[l] + 1) / (N + len(labels)))
            for t in words:
                s += math.log((self.cnt[l][t] + self.alpha) / (self.tot[l] + self.alpha * V))
            out[l] = s
        return out

    def best(self, words, labels=None):
        sc = self.scores(words, labels)
        return max(sc, key=sc.get) if sc else None


# ---------- 1. questions ----------
old_by = {}
for q in OQ:
    old_by.setdefault(key_of(q["stem"]), q)

name_to_neon = collections.defaultdict(set)
for r in R:
    name_to_neon[r["topic"]].add(r["subject"])

qs = []
for r in R:
    subject, theme = r["subject"], r["topic"]
    sk = slug(subject)
    opts = r.get("options") or []
    ans = str(r.get("correctLabel") or "").lower()
    ans = ans if ans in [str(o["label"]).lower() for o in opts] else ""
    o = old_by.get(key_of(r["stem"]))
    q = {"id": r["id"], "year": r["examYear"], "subject": subject, "subjectKey": sk, "theme": theme, "themeKey": sk + "--" + slug(theme),
         "sub": "", "ca": False, "format": "", "stem": (r["stem"] or "").strip(),
         "options": "\n".join(f"({str(x['label']).lower()}) {x['text']}" for x in opts),
         "answer": ans, "answerText": next((x["text"] for x in opts if str(x["label"]).lower() == ans), ""),
         "tentative": not ans, "map": "", "hasSolution": bool(r.get("hasSolution")), "neonNo": r.get("questionNo"),
         "oldId": o["id"] if o else None}
    if o:
        q["format"], q["ca"], q["map"] = o["format"], o["ca"], o.get("map", "")
        if o["theme"] == theme:
            q["sub"] = o["sub"]
    if not q["format"]:
        q["format"] = fmt_rule(q["stem"], [x["text"] for x in opts])
        q["formatAuto"] = True
    qs.append(q)

# format rule accuracy on questions we know
known = [(q, old_by.get(key_of(q["stem"]))) for q in qs if q["oldId"]]
fmt_ok = sum(1 for q, o in known if fmt_rule(q["stem"], [l[4:] for l in q["options"].split("\n")]) == o["format"])

# sub-topics: Naive Bayes within each theme, trained on questions that kept their old sub
old_ins_by_name = {}
for k, v in OI["themes"].items():
    old_ins_by_name.setdefault(k.split("--", 1)[1], (k, v))
sub_nb = collections.defaultdict(NB)
for q in qs:
    if q["sub"]:
        sub_nb[q["themeKey"]].add(q["sub"], toks(q["stem"] + " " + q["options"]))
for q in qs:   # sub-topic descriptions from the old notes count as one extra example each
    pass
for tk, nb in sub_nb.items():
    name = tk.split("--", 1)[1]
    if name in old_ins_by_name:
        for st in old_ins_by_name[name][1].get("subTopics", []):
            if st["name"] in nb.docs:
                nb.add(st["name"], toks(st["name"] + " " + st.get("desc", "")), 1)
sub_auto = 0
for q in qs:
    if not q["sub"]:
        nb = sub_nb.get(q["themeKey"])
        if nb and nb.docs:
            q["sub"] = nb.best(toks(q["stem"] + " " + q["options"]))
        else:
            q["sub"] = "General"
        q["subAuto"] = True
        sub_auto += 1

# current-affairs tag: Naive Bayes on the old labels, with year as a feature
ca_nb = NB()
lab = [q for q in qs if q["oldId"]]
def ca_feats(q):
    return toks(q["stem"] + " " + q["options"]) + ["__y%d" % q["year"], "__s" + q["subjectKey"]]
# held-out check (every 5th labelled question)
test = lab[::5]
train = [q for i, q in enumerate(lab) if i % 5]
for q in train:
    ca_nb.add(bool(q["ca"]), ca_feats(q))
ca_acc = sum(1 for q in test if ca_nb.best(ca_feats(q)) == bool(q["ca"])) / max(1, len(test))
base_acc = max(sum(1 for q in test if q["ca"]), sum(1 for q in test if not q["ca"])) / max(1, len(test))
ca_nb = NB()
for q in lab:
    ca_nb.add(bool(q["ca"]), ca_feats(q))
NEWS = re.compile(r"\b(recent(ly)?|in (the )?news|news|launched|announced|this year|last year)\b", re.I)
STATIC = {"ancient_history", "medieval_history", "art_culture", "modern_history"}
for q in qs:
    if not q["oldId"]:
        if NEWS.search(q["stem"]):
            q["ca"] = True                      # the question itself says it is about something recent
        elif q["subjectKey"] in STATIC:
            q["ca"] = False                     # history and culture: no labelled examples to learn from
        else:
            # years 2024–26 have no labelled examples, so the year feature is left out for them
            q["ca"] = bool(ca_nb.best(toks(q["stem"] + " " + q["options"]) + ["__s" + q["subjectKey"]]))
        q["caAuto"] = True

# ---------- 2. insights ----------
r1 = lambda v: round(v + 1e-9, 1)
YEARS = list(range(2011, 2027))
NP = len(YEARS)
by_s = collections.defaultdict(list)
by_t = collections.defaultdict(list)
for q in qs:
    by_s[q["subjectKey"]].append(q)
    by_t[q["themeKey"]].append(q)
id_map = {q["oldId"]: q["id"] for q in qs if q["oldId"]}


def periods(lst):
    return {n: r1(sum(1 for q in lst if a <= q["year"] <= b) / (b - a + 1)) for a, b, n in PERIODS}


def trend(n, a, c):
    return "Too few" if n < 4 else "Rising" if (c >= a * 1.5 and c - a >= 0.5) else "Falling" if (a >= c * 1.5 and a - c >= 0.5) else "Steady"


theme_stats = {}
for tk, lst in by_t.items():
    p = periods(lst)
    yrs = sorted({q["year"] for q in lst})
    theme_stats[tk] = dict(n=len(lst), years=len(yrs), first=yrs[0], last=yrs[-1], **p, trend=trend(len(lst), p["avgEarly"], p["avgRecent"]))

themes_out, carried = {}, 0
for tk, lst in by_t.items():
    st = theme_stats[tk]
    subj = lst[0]["subject"]
    sn = len(by_s[lst[0]["subjectKey"]])
    name = tk.split("--", 1)[1]
    old = old_ins_by_name.get(name)
    # old IR / thin-data themes that moved: match by theme name only
    reason = (f"{st['n']} of {sn} {subj} questions ({r1(100 * st['n'] / sn)}%), asked in {st['years']} of {NP} papers; "
              f"{st['avgEarly']} → {st['avgMid']} → {st['avgRecent']} a paper (2011–15 → 2016–20 → 2021–26).")
    share = st["n"] / sn
    auto_pri = "High" if (share >= 0.12 or st["avgRecent"] >= 2) else "Medium" if (share >= 0.05 or st["avgRecent"] >= 0.8) else "Low"
    subs = collections.Counter(q["sub"] for q in lst)
    if old:
        v = old[1]
        carried += 1
        old_subs = {s["name"]: s for s in v.get("subTopics", [])}
        themes_out[tk] = {
            "summary": v.get("summary", ""),
            "subTopics": [old_subs.get(s, {"name": s, "desc": ""}) for s, _ in subs.most_common()],
            "repeatedConcepts": v.get("repeatedConcepts", []), "nature": v.get("nature", ""),
            "priority": v.get("priority") or auto_pri, "priorityReason": reason, "whatToStudy": v.get("whatToStudy", []),
            "exampleIds": [id_map[i] for i in v.get("exampleIds", []) if i in id_map] or [q["id"] for q in sorted(lst, key=lambda q: -q["year"])[:3]],
            "notesFrom": "2011–2023 analysis",
        }
    else:
        lead = f"{lst[0]['theme']}: {st['n']} question{'s' if st['n'] > 1 else ''} from {st['first']} to {st['last']}, asked in {st['years']} of {NP} papers."
        themes_out[tk] = {"summary": lead, "subTopics": [{"name": s, "desc": ""} for s, _ in subs.most_common()],
                          "repeatedConcepts": [], "nature": "", "priority": auto_pri, "priorityReason": reason, "whatToStudy": [],
                          "exampleIds": [q["id"] for q in sorted(lst, key=lambda q: -q["year"])[:3]], "notesFrom": "generated from counts"}

old_subj = OI["subjects"]
subjects_out = {}
for sk, lst in by_s.items():
    p = periods(lst)
    subj = lst[0]["subject"]
    tcount = collections.Counter(q["themeKey"] for q in lst)
    tname = {q["themeKey"]: q["theme"] for q in lst}
    fmts = collections.Counter(q["format"] for q in lst)
    yc = collections.Counter(q["year"] for q in lst)
    top = tcount.most_common(3)
    rising = [tname[t] for t in tcount if theme_stats[t]["trend"] == "Rising"]
    steady = [tname[t] for t in tcount if theme_stats[t]["years"] >= NP - 3]
    solved = sum(1 for q in lst if q["hasSolution"])
    peak = max(yc.items(), key=lambda x: (x[1], x[0]))
    f1, fn = fmts.most_common(1)[0]
    ov = (f"{subj}: {len(lst)} questions in 2011–2026 ({r1(100 * len(lst) / len(qs))}% of the dataset), asked in {len(yc)} of {NP} papers. "
          f"Per paper it went {p['avgEarly']} → {p['avgMid']} → {p['avgRecent']} (2011–15 → 2016–20 → 2021–26). "
          f"The biggest theme is {tname[top[0][0]]} ({top[0][1]} questions). The most common format is {f1} ({round(100 * fn / len(lst))}%).")
    kf = [f"Top themes: " + "; ".join(f"{tname[t]} ({n})" for t, n in top) + "."]
    if steady:
        kf.append(f"Asked in at least {NP - 3} of {NP} papers: " + ", ".join(steady[:6]) + ".")
    if rising:
        kf.append("Gaining weight since 2011–15: " + ", ".join(rising[:6]) + ".")
    kf.append(f"Most questions in one paper: {peak[1]} in {peak[0]}.")
    kf.append(f"Solutions added: {solved} of {len(lst)}.")
    old = old_subj.get(sk, {})
    rc = []
    for c in old.get("recurringConcepts", []):
        ids = [id_map[i] for i in c.get("ids", []) if i in id_map]
        rc.append({**c, "ids": ids})
    subjects_out[sk] = {"overview": ov, "keyFindings": kf, "recurringConcepts": rc, "studyStrategy": old.get("studyStrategy", []),
                        "notesFrom": "2011–2023 analysis" if old else "generated from counts"}

# old theme key → new theme key (for the chat's aliases, glossary and tests)
theme_map = {}
for q in OQ:
    if q["themeKey"] in theme_map:
        continue
    tname = q["theme"].split(": ", 1)[-1]
    cands = [k for k in by_t if k.split("--", 1)[1] == slug(tname)]
    if len(cands) > 1:
        same = [k for k in cands if k.startswith(q["subjectKey"] + "--")]
        cands = same or cands
    if cands:
        theme_map[q["themeKey"]] = cands[0]
        continue
    # theme renamed: where did its questions go?
    dest = collections.Counter(n["themeKey"] for n in qs if n["oldId"] and old_by.get(key_of(n["stem"]), {}).get("themeKey") == q["themeKey"])
    if dest:
        theme_map[q["themeKey"]] = dest.most_common(1)[0][0]

os.makedirs(OUT, exist_ok=True)
json.dump(qs, open(os.path.join(OUT, "questions.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
json.dump({"subjects": subjects_out, "themes": themes_out}, open(os.path.join(OUT, "insights.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(theme_map, open(os.path.join(OUT, "theme_map.json"), "w", encoding="utf-8"), indent=1)

rep = [f"# Neon → dashboard build", "",
       f"- {len(qs)} questions, {len(by_s)} subjects, {len(by_t)} themes, years 2011–2026.",
       f"- {len(known)} questions found in the 2011–2023 dataset (format, CA tag and, where the theme is the same, sub-topic copied).",
       f"- Format rule agrees with the hand labels on {fmt_ok}/{len(known)} known questions ({round(100 * fmt_ok / max(1, len(known)))}%); used for {sum(1 for q in qs if q.get('formatAuto'))} new ones.",
       f"- Sub-topic guessed by Naive Bayes for {sub_auto} questions.",
       f"- CA tag guessed for {sum(1 for q in qs if q.get('caAuto'))} questions; held-out accuracy {round(100 * ca_acc)}% (always-'not CA' would score {round(100 * base_acc)}%).",
       f"- Teaching notes carried over for {carried} of {len(by_t)} themes; the rest have generated summaries only.",
       f"- Old theme keys mapped: {len(theme_map)} of {len({q['themeKey'] for q in OQ})}."]
open(os.path.join(OUT, "build_report.md"), "w").write("\n".join(rep) + "\n")
print("\n".join(rep))
