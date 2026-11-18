"""Build a standalone copy of the PYQ dashboard (plain HTML/CSS/JS) for Antigravity or any web host.

Inputs:  analysis/dashboard/live_index.html (the dashboard page), analysis/dashboard/{questions,insights}.json,
         analysis/export_template/{dash-shim.js,tokens.css}
Output:  analysis/export/pyq-dashboard/  (index.html, page.css, app.js, dash-shim.js, tokens.css, data/…, README.md)
"""
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DASH = os.path.join(HERE, "dashboard")
# data: the Neon export (built by build_neon_dashboard.py) unless --old is passed
OLD_DATA = "--old" in sys.argv
DATA_DIR = DASH if OLD_DATA else os.path.join(HERE, "dashboard_neon")
SPAN = "2011–2023" if OLD_DATA else "2011–2026"
TPL = os.path.join(HERE, "export_template")
OUT = os.path.join(HERE, "export", "pyq-dashboard")

page = open(os.path.join(DASH, "live_index.html"), encoding="utf-8").read()
page = page.replace('<meta name="dash-one-writer">', "").strip()


def neonize(page):
    """The page was written for 2011–2023 with periods 2011–15 / 2016–19 / 2020–23. Re-point it at 2011–2026."""
    rep = [
        ("avg2011_15", "avgEarly"), ("avg2016_19", "avgMid"), ("avg2020_23", "avgRecent"),
        ("[[2011, 2015, 'avgEarly'], [2016, 2019, 'avgMid'], [2020, 2023, 'avgRecent']]",
         "[[2011, 2015, 'avgEarly'], [2016, 2020, 'avgMid'], [2021, 2026, 'avgRecent']]"),
        ("y <= 2023", "y <= 2026"), ("d3.range(2011, 2024)", "d3.range(2011, 2027)"),
        ("2011–15 → 2020–23", "2011–15 → 2021–26"), ("2020–23 with 2011–15", "2021–26 with 2011–15"),
        ("2011–2023", "2011–2026"), ("2011 to 2023", "2011 to 2026"), ("of 13 papers", "of 16 papers"), ("'/13'", "'/16'"),
        ("Themes in 12 or 13 of the 13 papers", "Themes in 14 or more of the 16 papers"), ("r.yearsAsked >= 12", "r.yearsAsked >= 14"),
        ("All subjects, by year. Note the shift in 2022–23.", "All subjects, by year."),
        (" Ancient History, Medieval History and Art & Culture are almost absent; 2024–25 papers are not included.", ""),
        ("Themes come from the source files; sub-topics, priorities and the current-affairs flag are AI-assisted from reading each question.",
         "Subjects and themes come from the Neon database. Sub-topics and the current-affairs flag were tagged for the 2011–2023 questions; "
         "for the others they are estimated by a Naive Bayes model trained on those tags (the CA flag is right about 4 times in 5). "
         "Theme notes (what to study, repeated concepts) were written from the 2011–2023 papers."),
    ]
    for a, b in rep:
        if a not in page:
            raise SystemExit(f"neonize: '{a[:50]}' not found in the page — update make_export.py")
        page = page.replace(a, b)
    return page


if not OLD_DATA:
    page = neonize(page)

styles = re.findall(r"<style>([\s\S]*?)</style>", page)
scripts = re.findall(r"<script>([\s\S]*?)</script>", page)
markup = re.sub(r"<style>[\s\S]*?</style>|<script>[\s\S]*?</script>", "", page).strip()

if os.path.exists(OUT):
    shutil.rmtree(OUT)
os.makedirs(os.path.join(OUT, "data"))

with open(os.path.join(OUT, "page.css"), "w", encoding="utf-8") as fh:
    fh.write("/* Page styles: layout, cards, charts, tabs, questions. Colours and sizes come from tokens.css. */\n")
    fh.write("\n".join(s.strip("\n") for s in styles) + "\n")

with open(os.path.join(OUT, "app.js"), "w", encoding="utf-8") as fh:
    fh.write("/* Page logic: calculations (dash.calc), helpers (window.PQ), page flow and drawings (dash.draw).\n"
             "   Each block runs in its own scope, as it did in the dashboard. */\n")
    for i, s in enumerate(scripts, 1):
        fh.write(f"\n// ===== block {i} =====\n(function () {{\n{s.strip(chr(10))}\n}})();\n")

for name in ("dash-shim.js", "tokens.css", "chat.js", "chat.css", "pq-log.js", "misses.html"):
    shutil.copy(os.path.join(TPL, name), os.path.join(OUT, name))
# site settings: on the Next.js site set PQ_LOG_ENDPOINT to "/api/pyq-log" so unanswered questions reach Neon
open(os.path.join(OUT, "pq-config.js"), "w", encoding="utf-8").write(
    "/* Site settings for the chat box. Leave the endpoint empty to keep the log in the browser only (see misses.html). */\n"
    "window.PQ_LOG_ENDPOINT = \"\";  // e.g. \"/api/pyq-log\" on the Next.js site\n")
# PYQ Tutor (solutions) runs inside the same chat box: engine, answer styles, data (built by tutor/build_tutor_data.py)
TUT = os.path.join(HERE, "tutor")
for name in ("tutor.js", "tutor.css"):
    shutil.copy(os.path.join(TUT, name), os.path.join(OUT, name))
shutil.copy(os.path.join(TUT, "data", "tutor-data.js"), os.path.join(OUT, "data", "tutor-data.js"))

questions = json.load(open(os.path.join(DATA_DIR, "questions.json"), encoding="utf-8"))
insights = json.load(open(os.path.join(DATA_DIR, "insights.json"), encoding="utf-8"))
shutil.copy(os.path.join(DATA_DIR, "questions.json"), os.path.join(OUT, "data", "questions.json"))
shutil.copy(os.path.join(DATA_DIR, "insights.json"), os.path.join(OUT, "data", "insights.json"))
with open(os.path.join(OUT, "data", "data.js"), "w", encoding="utf-8") as fh:
    fh.write("/* Generated from questions.json and insights.json by make_data.py — do not edit by hand. */\n")
    fh.write("window.PQ_DATA = ")
    json.dump({"questions": questions, "insights": insights}, fh, ensure_ascii=False, separators=(",", ":"))
    fh.write(";\n")

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>UPSC Prelims PYQ Analysis</title>
<meta name="description" content="Subject- and theme-level analysis of UPSC CSE Prelims questions, {SPAN}.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="page.css">
<link rel="stylesheet" href="tutor.css">
<link rel="stylesheet" href="chat.css">
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script src="data/data.js"></script>
<script src="data/glossary.js"></script>
<script src="dash-shim.js"></script>
</head>
<body>
<div id="dash-root">
{markup}
</div>
<script src="app.js"></script>
<script src="pq-config.js"></script>
<script src="pq-log.js"></script>
<script src="data/tutor-data.js"></script>
<script src="tutor.js"></script>
<script src="chat.js"></script>
</body>
</html>
"""
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)

# UPSC glossary for the chat box (edit export_template/glossary.json)
shutil.copy(os.path.join(TPL, "glossary.json"), os.path.join(OUT, "data", "glossary.json"))
with open(os.path.join(OUT, "data", "glossary.js"), "w", encoding="utf-8") as fh:
    fh.write("/* Generated from glossary.json — edit that file. */\nwindow.PQ_GLOSSARY = ")
    fh.write(open(os.path.join(TPL, "glossary.json"), encoding="utf-8").read().strip())
    fh.write(";\n")

# test page: same page + the chat test set and runner (open test.html to see the score)
shutil.copy(os.path.join(TPL, "chat-test.js"), os.path.join(OUT, "chat-test.js"))
shutil.copy(os.path.join(TPL, "stress-test.js"), os.path.join(OUT, "stress-test.js"))
shutil.copy(os.path.join(TPL, "chat-tests.json"), os.path.join(OUT, "data", "chat-tests.json"))
with open(os.path.join(OUT, "data", "chat-tests.js"), "w", encoding="utf-8") as fh:
    fh.write("/* Generated from chat-tests.json — edit that file. */\nwindow.PQ_TESTS = ")
    fh.write(open(os.path.join(TPL, "chat-tests.json"), encoding="utf-8").read().strip())
    fh.write(";\n")
open(os.path.join(OUT, "test.html"), "w", encoding="utf-8").write(
    html.replace("<title>UPSC Prelims PYQ Analysis</title>", "<title>Chat tests — UPSC Prelims PYQ Analysis</title>")
        .replace('<script src="chat.js"></script>', '<script src="chat.js"></script>\n<script src="data/chat-tests.js"></script>\n<script src="chat-test.js"></script>\n<script src="stress-test.js"></script>'))

make_data = '''"""Rebuild data/data.js from data/questions.json and data/insights.json.

Run after editing either JSON file:  python3 make_data.py
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
q = json.load(open(os.path.join(HERE, "data", "questions.json"), encoding="utf-8"))
i = json.load(open(os.path.join(HERE, "data", "insights.json"), encoding="utf-8"))
with open(os.path.join(HERE, "data", "data.js"), "w", encoding="utf-8") as fh:
    fh.write("/* Generated from questions.json and insights.json by make_data.py — do not edit by hand. */\\n")
    fh.write("window.PQ_DATA = ")
    json.dump({"questions": q, "insights": i}, fh, ensure_ascii=False, separators=(",", ":"))
    fh.write(";\\n")
print("data/data.js written:", len(q), "questions")
'''
open(os.path.join(OUT, "make_data.py"), "w", encoding="utf-8").write(make_data)
shutil.copy(os.path.join(TPL, "README.md"), os.path.join(OUT, "README.md"))
print("export written to", OUT)
for f in sorted(os.listdir(OUT)):
    p = os.path.join(OUT, f)
    print(" ", f, os.path.getsize(p) if os.path.isfile(p) else "(dir)")
