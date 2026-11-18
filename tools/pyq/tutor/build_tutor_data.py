"""Turn the Neon export into the tutor's data file (no LLM anywhere — this only reshapes and cleans).

Usage:  python3 build_tutor_data.py <neon_pyqs_with_solutions.json> [out_dir]
Writes: <out_dir>/data/tutor-data.js  (window.PQ_TUTOR = {...})   default out_dir = this folder

On the Next.js site the same shape can come from a build-time script or an API route reading Neon.
Every solution field is optional: the tutor only offers what a question actually has.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else HERE

R = json.load(open(src, encoding="utf-8"))


def norm(s):
    return re.sub(r"\W+", " ", (s or "").lower()).strip()


def vword(v):
    """right / wrong / '' (can't tell) for a statement or pair verdict."""
    t = (v or "").lower()
    if re.search(r"\b(incorrect|incorrectly|invalid|wrong|false|not|untrue)\b", t):
        return "w"
    if re.search(r"\b(correct|correctly|valid|true|matched|would do)\b", t):
        return "r"
    return ""


stem_index = {norm(r["stem"])[:120]: r["id"] for r in R}

subjects_short = {"Indian Polity": "Polity", "Science & Technology": "Sci & Tech"}
qs = []
stats = {"va_fixed": 0, "similar_dropped": 0, "similar_linked": 0, "kw_fixed": 0}
for r in R:
    q = {
        "id": r["id"], "y": r["examYear"], "n": r["questionNo"], "s": r["subject"], "t": r["topic"],
        "stem": (r["stem"] or "").strip(),
        "o": [[str(o["label"]).lower(), o["text"]] for o in r.get("options") or []],
        "ans": str(r.get("correctLabel") or "").lower() or None,
    }
    if q["ans"] in ("none", ""):
        q["ans"] = None
    a = r.get("analysis") if r.get("hasSolution") else None
    if isinstance(a, dict) and a:
        sol = {}
        kws = []
        for k in a.get("keywords") or []:
            term = (k.get("term") or "").strip()
            note = (k.get("shortNote") or "").strip()
            if not term and k.get("concept"):
                stats["kw_fixed"] += 1
                head, _, rest = k["concept"].partition(":")
                term, note = (head.strip(), rest.strip()) if rest else (k["concept"].strip()[:60], k["concept"].strip())
            if term:
                kws.append([term, note or (k.get("concept") or "").strip(), 1 if k.get("isDistractor") else 0])
        if kws:
            sol["kw"] = kws
        ob = a.get("optionBreakdown") or []
        labels = {l for l, _ in q["o"]}
        ob = [[str(o.get("label")).lower(), o.get("reference") or "", o.get("explanation") or ""] for o in ob
              if str(o.get("label")).lower() in labels]
        if ob:
            sol["ob"] = ob
        sb = [[s.get("statementNo"), vword(s.get("verdict")), s.get("verdict") or "", s.get("reference") or "",
               s.get("explanation") or ""] for s in a.get("statementBreakdown") or []]
        if sb:
            sol["sb"] = sb
        pb = [[p.get("pairNo"), vword(p.get("verdict")), p.get("verdict") or "",
               (p.get("provision") or "") + (" — " + p["statedUnder"] if p.get("statedUnder") else ""),
               p.get("reference") or "", p.get("explanation") or ""] for p in a.get("pairBreakdown") or []]
        if pb:
            sol["pb"] = pb
        va = a.get("valueAddition")
        if isinstance(va, str) and va.strip():
            stats["va_fixed"] += 1
            va = [{"title": "Value addition", "tag": "", "bullets": [va.strip()]}]
        va = [[v.get("title") or "", v.get("tag") or "", [b for b in v.get("bullets") or [] if b]]
              for v in (va or []) if isinstance(v, dict)]
        if va:
            sol["va"] = va
        n = a.get("inNews")
        if isinstance(n, dict) and (n.get("headline") or n.get("relevance")):
            sol["news"] = [n.get("headline") or "", n.get("source") or "", n.get("date") or "", n.get("relevance") or ""]
        sp = a.get("similarPyq")
        if isinstance(sp, dict) and (sp.get("stem") or "").strip() and isinstance(sp.get("examYear"), int) and sp["examYear"] > 1990:
            link = stem_index.get(norm(sp["stem"])[:120])
            if not link:
                # the similar stem often carries the options too; try a shorter prefix
                pre = norm(sp["stem"])[:70]
                link = next((v for k, v in stem_index.items() if k.startswith(pre)), None)
            stats["similar_linked"] += 1 if link else 0
            sol["sim"] = [sp["examYear"], sp["stem"].strip(), sp.get("keyTakeaway") or "", link]
        elif sp:
            stats["similar_dropped"] += 1
        vs = a.get("visualSuggestion")
        if isinstance(vs, dict) and isinstance(vs.get("tableData"), dict) and vs["tableData"].get("rows"):
            sol["tab"] = [vs.get("title") or "", vs["tableData"].get("headers") or [], vs["tableData"]["rows"]]
        if a.get("coreTakeaway"):
            sol["take"] = a["coreTakeaway"].strip()
        hook = ((a.get("reelData") or {}).get("hook") or {})
        if hook.get("headline"):
            sol["hook"] = [hook["headline"], hook.get("teaser") or ""]
        q["sol"] = sol
    qs.append(q)

os.makedirs(os.path.join(out, "data"), exist_ok=True)
path = os.path.join(out, "data", "tutor-data.js")
with open(path, "w", encoding="utf-8") as fh:
    fh.write("/* Generated by build_tutor_data.py from the Neon export — do not edit by hand. */\nwindow.PQ_TUTOR = ")
    json.dump({"questions": qs, "short": subjects_short}, fh, ensure_ascii=False, separators=(",", ":"))
    fh.write(";\n")
solved = sum(1 for q in qs if q.get("sol"))
print(f"{len(qs)} questions, {solved} with solutions -> {path} ({os.path.getsize(path)//1024} KB)")
print(stats)
