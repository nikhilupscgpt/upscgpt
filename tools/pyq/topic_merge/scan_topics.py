"""Find overlapping topics in the Neon export, using only the Neon data (topic names, question text, solution keywords)."""
import json, re, math, collections, sys, os
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Desktop/PYQ Dashboard/data/neon_pyqs_with_solutions.json")
R = json.load(open(SRC, encoding="utf-8"))
STOP = set("a an the of in on to for with by from at is are was were be been it its this that these those which what who how following given below above statements statement consider correct incorrect select answer using code only both neither nor and or not none all one two three four with reference regard regarding respect india indian".split())
def toks(s):
    out = []
    for w in re.findall(r"[a-z][a-z0-9]+", (s or "").lower()):
        if w in STOP or len(w) < 3: continue
        if len(w) > 4: w = re.sub(r"(ies)$", "y", w); w = re.sub(r"(ing|ed|es|s)$", "", w)
        out.append(w)
    return out
by = collections.defaultdict(list)
for r in R: by[(r["subject"], r["topic"])].append(r)
def text(r):
    kw = " ".join(k.get("term") or "" for k in ((r.get("analysis") or {}).get("keywords") or []))
    return r["stem"] + " " + " ".join(o["text"] for o in r.get("options") or []) + " " + kw
df = collections.Counter()
vec = {}
for k, lst in by.items():
    c = collections.Counter(t for r in lst for t in toks(text(r)))
    vec[k] = c; df.update(set(c))
N = len(vec)
def tfidf(c): 
    v = {t: (1 + math.log(n)) * math.log(N / df[t]) for t, n in c.items()}
    s = math.sqrt(sum(x * x for x in v.values())) or 1
    return {t: x / s for t, x in v.items()}
V = {k: tfidf(c) for k, c in vec.items()}
def cos(a, b): return sum(x * b.get(t, 0) for t, x in a.items())
GEN = {"general", "miscellaneous", "misc", "other", "and", "the", "of"}
def name_sim(a, b):
    A = set(toks(a)) - GEN; B = set(toks(b)) - GEN
    return len(A & B) / max(1, len(A | B))
keys = sorted(by)
rows = []
for i, a in enumerate(keys):
    for b in keys[i+1:]:
        n, c = name_sim(a[1], b[1]), cos(V[a], V[b])
        if n >= 0.3 or c >= 0.25:
            rows.append((round(c, 2), round(n, 2), a, b))
rows.sort(key=lambda x: -(x[0] + x[1]))
for c, n, a, b in rows:
    print(f"{c:4} {n:4} | {a[0]} › {a[1]} ({len(by[a])})  ~  {b[0]} › {b[1]} ({len(by[b])})")
print("\nGeneral / Miscellaneous buckets:")
for k in keys:
    if re.search(r"general|miscellaneous", k[1], re.I): print(" ", k, len(by[k]))
print("\nSmall topics (≤2 questions):")
for k in keys:
    if len(by[k]) <= 2: print(" ", k, len(by[k]))
# same question text filed under two topics
st = collections.defaultdict(list)
for r in R: st[re.sub(r"\W+", " ", r["stem"].lower()).strip()[:160]].append(r)
print("\nSame question in two topics:")
for g in st.values():
    if len(g) > 1: print("  ", " | ".join(f"{r['subject']} › {r['topic']} {r['examYear']} ({r['id'][-6:]})" for r in g))
