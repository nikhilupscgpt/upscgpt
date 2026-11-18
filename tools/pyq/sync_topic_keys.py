"""Point the chat's topic words, glossary and tests at topics that still exist after a merge.

Usage:  python3 sync_topic_keys.py topic_merge/topic_redirects.json dashboard_neon/questions.json
Edits export_template/{chat.js, glossary.json, chat-tests.json} in place. Safe to run twice.
Also lists any topic key those files use that is not in the data (so nothing silently stops matching).
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, "export_template")
red = json.load(open(sys.argv[1]))
keys = {q["themeKey"] for q in json.load(open(sys.argv[2], encoding="utf-8"))}
go = lambda k: red.get(k, k)

# chat.js THEME_ALIASES: re-key and merge word lists
p = os.path.join(TPL, "chat.js")
s = open(p, encoding="utf-8").read()
a = s.index("  const THEME_ALIASES = {")
b = s.index("\n  };", a) + 4
merged = {}
for k, v in re.findall(r"    '([a-z0-9_]+--[a-z0-9_]+)': (\[[^\]]*\])", s[a:b]):
    lst = json.loads(v.replace("'", '"'))
    m = merged.setdefault(go(k), [])
    m += [x for x in lst if x not in m]
s = s[:a] + "  const THEME_ALIASES = {\n" + ",\n".join(f"    '{k}': {json.dumps(v)}".replace('"', "'") for k, v in merged.items()) + "\n  };" + s[b:]
open(p, "w", encoding="utf-8").write(s)

p = os.path.join(TPL, "glossary.json")
g = json.load(open(p, encoding="utf-8"))
th = {}
for k, v in g["themes"].items():
    m = th.setdefault(go(k), [])
    m += [x for x in v if x not in m]
g["themes"] = th
json.dump(g, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

p = os.path.join(TPL, "chat-tests.json")
T = json.load(open(p, encoding="utf-8"))
for t in T["tests"]:
    e = t.get("expect", {})
    if isinstance(e.get("theme"), str):
        e["theme"] = go(e["theme"])
    elif isinstance(e.get("theme"), list):
        e["theme"] = list(dict.fromkeys(go(x) for x in e["theme"]))
json.dump(T, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

used = set(merged) | set(th)
for t in T["tests"]:
    v = t.get("expect", {}).get("theme")
    used |= set(v if isinstance(v, list) else [v] if v else [])
missing = sorted(k for k in used if k not in keys)
print(f"chat aliases: {len(merged)} topics · glossary: {len(th)} topics · keys not in data: {missing or 'none'}")
