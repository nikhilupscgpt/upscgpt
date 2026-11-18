"""Check a batch of PYQ solutions before it goes into Neon (or after an export from Neon).

Usage:
  python3 check_solutions.py <file.json|file.jsonl> [--subject "Indian Polity"] [--out report_dir]

The file is a list of question records in the Neon format (stem, options, correctLabel, hasSolution, analysis{...}).
Prints a summary and writes check-report.md and check-report.csv to --out (default: next to the input file).
Exit code 1 when any ERROR is found, so it can run in a build step.

ERROR   = will show wrong or broken content to a student; fix before upload.
WARN    = works, but looks odd; a person should look.
"""
import argparse
import collections
import csv
import json
import os
import re
import sys

# ---------- verdict words → right / wrong ----------
WRONG = re.compile(r"\b(incorrect|incorrectly|not correct|invalid|wrong|false|not matched|mismatch|would not|would NOT|cannot|does not|is not)\b", re.I)
RIGHT = re.compile(r"\b(correct|correctly|valid|true|matched|would do|right)\b", re.I)
STANDARD = {"correct", "incorrect", "correctly matched", "incorrectly matched"}


def verdict(v):
    """'right', 'wrong' or None (can't tell)."""
    if not isinstance(v, str) or not v.strip():
        return None
    if WRONG.search(v):
        return "wrong"
    if RIGHT.search(v):
        return "right"
    return None


# ---------- reading the stem ----------
STMT_RE = re.compile(r"(?m)^\s*(\d{1,2})\s*[.)]\s+\S")
PAIR_RE = re.compile(r"(?m)^\s*(I{1,3}|IV|V|VI{0,3})\s*[.)]\s+\S")
NUM_WORDS = {"none": 0, "no": 0, "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6}


def statements_in(stem):
    nums = [int(n) for n in STMT_RE.findall(stem or "")]
    # keep the run 1..k only (ignores years, list items further down)
    out = []
    for n in nums:
        if n == len(out) + 1:
            out.append(n)
    return out


def option_set(text, n):
    """'1 and 3 only' → {1,3}; 'Both 1 and 2' → {1,2}; 'Neither 1 nor 2' → set(); None when it isn't such an option."""
    t = (text or "").lower().strip()
    if re.fullmatch(r"(neither .*|none of (the )?(above|these|them)?.*)", t):
        return set()
    if re.match(r"all (of )?(the )?(above|four|three|five)", t):
        return set(range(1, n + 1))
    if re.fullmatch(r"[\d,\sandonlybth]+", t) and re.search(r"\d", t):
        return {int(x) for x in re.findall(r"\d+", t)}
    return None


def option_count(text):
    t = (text or "").lower()
    m = re.match(r"\s*(only\s+)?(none|no|zero|one|two|three|four|five|six|all)\b", t)
    if not m:
        return None
    w = m.group(2)
    return "all" if w == "all" else NUM_WORDS[w]


CODE_LINE = re.compile(r"(select|choose|mark) the (correct|right) (answer|option|code)s?[^.?\n]*", re.I)


def asks_correct(stem):
    """True when the question asks which statements are correct (not 'not correct', 'incorrect', 'would not')."""
    tail = CODE_LINE.sub("", (stem or "").lower())[-220:]
    if re.search(r"(\bnot\b|incorrect|untrue|false|wrong)", tail):
        return False
    return bool(re.search(r"(correct|true|right|valid)", tail))


def option_verdicts(ob):
    """label → 'right'/'wrong'/None. An option tagged '(Correct Answer)' is the answer even if it reads 'Invalid Statement'."""
    tagged = [o.get("label") for o in ob if re.search(r"(correct|right) answer|\banswer\b", o.get("verdict") or "", re.I)]
    if len(tagged) == 1:
        return {o.get("label"): ("right" if o.get("label") == tagged[0] else "wrong") for o in ob}
    return {o.get("label"): verdict(o.get("verdict")) for o in ob}


# ---------- the checks ----------
def check(rec, issues):
    key = f"{rec.get('subject')} {rec.get('examYear')} Q{rec.get('questionNo')}"
    rid = rec.get("id", "")

    def add(level, code, msg):
        issues.append({"level": level, "code": code, "question": key, "id": rid, "message": msg})

    raw_labels = [o.get("label") for o in rec.get("options") or []]
    labels = [str(l).lower() for l in raw_labels]
    ans = str(rec.get("correctLabel")).lower()
    if ans not in labels:
        add("ERROR", "answer-not-an-option", f"correctLabel '{rec.get('correctLabel')}' is not one of the option labels {raw_labels}")
    if raw_labels != ["a", "b", "c", "d"]:
        add("WARN", "option-labels", f"option labels are {raw_labels}, expected a b c d")

    if rec.get("explanation"):
        add("WARN", "legacy-explanation", "old 'explanation' field is filled; 'analysis' is what the site uses — empty it")

    a = rec.get("analysis")
    if not rec.get("hasSolution"):
        if a:
            add("WARN", "solution-flag", "has analysis but hasSolution is false")
        return
    if not isinstance(a, dict) or not a:
        add("ERROR", "no-analysis", "hasSolution is true but analysis is empty")
        return

    # options
    ob = a.get("optionBreakdown")
    if not isinstance(ob, list) or not ob:
        add("ERROR", "no-option-breakdown", "optionBreakdown is missing")
    else:
        obl = [str(o.get("label")).lower() for o in ob]
        if sorted(obl) != sorted(labels):
            add("ERROR", "option-breakdown-labels", f"optionBreakdown labels {obl} don't match the options {labels}")
        ov = option_verdicts(ob)
        right = [str(l).lower() for l, v in ov.items() if v == "right"]
        wrong = [str(l).lower() for l, v in ov.items() if v == "wrong"]
        if len(right) != 1 and wrong == [ans] and len(right) == len(ob) - 1:
            add("WARN", "option-verdict-inverted",
                f"options describe the statements (answer '{ans}' is the one marked wrong) — mark the answer option 'Correct' and the rest 'Incorrect'")
        elif len(right) != 1:
            add("ERROR", "option-correct-count", f"{len(right)} options marked correct in optionBreakdown ({right}); expected exactly 1")
        elif right[0] != ans:
            add("ERROR", "option-vs-answer", f"optionBreakdown marks '{right[0]}' correct but correctLabel is '{ans}'")
        for o in ob:
            if not (o.get("explanation") or "").strip():
                add("WARN", "option-no-explanation", f"option {o.get('label')} has no explanation")
            if (o.get("verdict") or "").strip().lower() not in STANDARD:
                add("WARN", "verdict-word", f"option {o.get('label')} verdict is '{o.get('verdict')}' — use Correct / Incorrect")

    # statements
    nums = statements_in(rec.get("stem"))
    sb = a.get("statementBreakdown") or []
    pb = a.get("pairBreakdown") or []
    if len(nums) >= 2 and not sb and not pb:
        add("ERROR", "no-statement-breakdown", f"stem has {len(nums)} numbered statements but no statementBreakdown")
    if sb:
        got = [s.get("statementNo") for s in sb]
        if nums and len(got) != len(nums):
            add("WARN", "statement-count", f"stem has {len(nums)} statements, statementBreakdown has {len(got)}")
        for s in sb:
            if verdict(s.get("verdict")) is None:
                add("WARN", "verdict-word", f"statement {s.get('statementNo')} verdict '{s.get('verdict')}' can't be read as right/wrong")
            elif (s.get("verdict") or "").strip().lower() not in STANDARD:
                add("WARN", "verdict-word", f"statement {s.get('statementNo')} verdict is '{s.get('verdict')}' — use Correct / Incorrect")
            if not (s.get("explanation") or "").strip():
                add("WARN", "statement-no-explanation", f"statement {s.get('statementNo')} has no explanation")
        # does the statement verdict lead to the keyed answer?
        vs = {s.get("statementNo"): verdict(s.get("verdict")) for s in sb}
        if all(v in ("right", "wrong") for v in vs.values()) and asks_correct(rec.get("stem")):
            good = {n for n, v in vs.items() if v == "right"}
            opt = {str(o.get("label")).lower(): o.get("text") for o in rec.get("options") or []}
            n = len(vs)
            sets = {l: option_set(t, n) for l, t in opt.items()}
            counts = {l: option_count(t) for l, t in opt.items()}
            expect = None
            if all(v is not None for v in sets.values()):
                expect = [l for l, s in sets.items() if s == good]
            elif re.search(r"how many", (rec.get("stem") or "").lower()) and all(v is not None for v in counts.values()):
                expect = [l for l, c in counts.items() if c == len(good) or (c == "all" and len(good) == n)]
            if expect is not None and expect != [ans]:
                add("ERROR", "statements-vs-answer",
                    f"statements marked correct are {sorted(good) or 'none'}, which points to option {expect or 'none'}, but correctLabel is '{ans}'")

    # keywords
    for k in a.get("keywords") or []:
        if not (k.get("term") or "").strip():
            add("WARN", "keyword-no-term", f"keyword has no term (concept: '{(k.get('concept') or '')[:60]}')")
        elif not (k.get("shortNote") or "").strip():
            add("WARN", "keyword-no-note", f"keyword '{k.get('term')}' has no shortNote")
    if not a.get("keywords"):
        add("WARN", "no-keywords", "no keywords")

    # value addition
    va = a.get("valueAddition")
    if va and not isinstance(va, list):
        add("ERROR", "value-addition-type", f"valueAddition is a {type(va).__name__}, expected a list of {{title, tag, bullets}}")
    elif isinstance(va, list):
        for i, v in enumerate(va, 1):
            if not isinstance(v, dict) or not v.get("title") or not isinstance(v.get("bullets"), list):
                add("ERROR", "value-addition-item", f"valueAddition item {i} needs a title and a bullets list")
    if not va:
        add("WARN", "no-value-addition", "no valueAddition")

    # in news
    n = a.get("inNews")
    if n and (not isinstance(n, dict) or not n.get("headline")):
        add("WARN", "in-news-shape", "inNews has no headline")

    # similar PYQ
    sp = a.get("similarPyq")
    if isinstance(sp, dict):
        y = sp.get("examYear")
        if not (sp.get("stem") or "").strip() or not isinstance(y, int) or y < 1990:
            add("WARN", "similar-placeholder", f"similarPyq is an empty placeholder (examYear {y}, no stem) — set it to null or fill it")
    elif sp is not None:
        add("WARN", "similar-type", f"similarPyq is a {type(sp).__name__}, expected an object or null")

    # table
    vsug = a.get("visualSuggestion")
    if isinstance(vsug, dict) and vsug.get("tableData"):
        td = vsug["tableData"]
        h = td.get("headers") or []
        for i, row in enumerate(td.get("rows") or [], 1):
            if len(row) != len(h):
                add("WARN", "table-row", f"table row {i} has {len(row)} cells, header has {len(h)}")


def load(path):
    text = open(path, encoding="utf-8").read().strip()
    if text.startswith("["):
        return json.loads(text)
    return [json.loads(line) for line in text.splitlines() if line.strip()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--subject", help="only check this subject")
    ap.add_argument("--out", help="folder for check-report.md / .csv")
    args = ap.parse_args()

    recs = load(args.file)
    if args.subject:
        recs = [r for r in recs if (r.get("subject") or "").lower() == args.subject.lower()]
    issues = []
    for r in recs:
        check(r, issues)

    # duplicates
    seen = collections.defaultdict(list)
    for r in recs:
        seen[re.sub(r"\W+", " ", (r.get("stem") or "").lower()).strip()[:160]].append(r)
    for group in seen.values():
        if len(group) > 1:
            names = ", ".join(f"{r.get('subject')} {r.get('examYear')} Q{r.get('questionNo')}" for r in group)
            for r in group:
                issues.append({"level": "WARN", "code": "duplicate-stem", "id": r.get("id", ""),
                               "question": f"{r.get('subject')} {r.get('examYear')} Q{r.get('questionNo')}",
                               "message": f"same question text as: {names}"})

    # coverage per subject
    cov = collections.defaultdict(lambda: [0, 0])
    for r in recs:
        cov[r.get("subject")][1] += 1
        cov[r.get("subject")][0] += 1 if r.get("hasSolution") else 0

    errs = [i for i in issues if i["level"] == "ERROR"]
    warns = [i for i in issues if i["level"] == "WARN"]
    by_code = collections.Counter((i["level"], i["code"]) for i in issues)

    out = args.out or os.path.dirname(os.path.abspath(args.file))
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "check-report.csv"), "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["level", "code", "question", "id", "message"])
        w.writeheader()
        for i in sorted(issues, key=lambda i: (i["level"], i["code"], i["question"])):
            w.writerow(i)

    lines = [f"# Solution check — {os.path.basename(args.file)}", "",
             f"{len(recs)} questions · {sum(1 for r in recs if r.get('hasSolution'))} with solutions · "
             f"**{len(errs)} errors** · {len(warns)} warnings", "",
             "## Coverage", "", "| Subject | Solved | Total | Missing |", "|---|---:|---:|---:|"]
    for s, (d, t) in sorted(cov.items(), key=lambda x: -x[1][0]):
        lines.append(f"| {s} | {d} | {t} | {t - d} |")
    lines += ["", "## Issue types", "", "| Level | Check | Count |", "|---|---|---:|"]
    for (lvl, code), n in sorted(by_code.items()):
        lines.append(f"| {lvl} | {code} | {n} |")
    for lvl, group in (("ERROR", errs), ("WARN", warns)):
        if not group:
            continue
        lines += ["", f"## {'Errors — fix before upload' if lvl == 'ERROR' else 'Warnings'}", ""]
        for i in sorted(group, key=lambda i: (i["code"], i["question"])):
            lines.append(f"- **{i['question']}** <small>({i['id'][-6:]})</small> · `{i['code']}` — {i['message']}")
    open(os.path.join(out, "check-report.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")

    print(f"{len(recs)} questions, {len(errs)} errors, {len(warns)} warnings")
    for (lvl, code), n in sorted(by_code.items()):
        print(f"  {lvl:5} {code:28} {n}")
    print("report:", os.path.join(out, "check-report.md"))
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
