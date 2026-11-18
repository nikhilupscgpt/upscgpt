"""One command to rebuild everything from a Neon export.

Usage:  python3 rebuild_all.py [neon_export.json] [--no-merge] [--site DIR] [--endpoint URL] [--no-zip]

  neon_export.json  default: input/neon_pyqs_with_solutions.json next to this script
  --no-merge        skip topic_merge (use once topic_merge/neon_fixes.sql has been applied in Neon)
  --site DIR        also copy the built site into DIR (e.g. the Next.js app's public/pyq), replacing it
  --endpoint URL    write pq-config.js so unanswered questions are POSTed there (e.g. /api/pyq-log)
  --no-zip          don't write the zips in export/

  1. topic_merge/apply_merges.py   merge_list.csv applied to a copy
  2. tutor/check_solutions.py      check report (does not stop the build; read tutor/check-report.md)
  3. build_neon_dashboard.py       dashboard + chat data
  4. sync_topic_keys.py            chat words / glossary / tests follow merged topics
  5. tutor/build_tutor_data.py     tutor data (stand-alone tutor and the dashboard chat box)
  6. make_export.py                export/pyq-dashboard (dashboard + chat + tutor in one box)
  7. tutor/run_tests.js            tutor tests (node) — the build exits with code 1 if any fail
  8. --site copy, zips
Then open <site>/test.html: hand-written chat tests + the generated test (~3,800 questions).
"""
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def opt(name):
    if name in sys.argv:
        i = sys.argv.index(name)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
        sys.exit(f"{name} needs a value")
    return None


SITE, ENDPOINT = opt("--site"), opt("--endpoint")
taken = {i + 1 for i, a in enumerate(sys.argv) if a in ("--site", "--endpoint")}
args = [a for i, a in enumerate(sys.argv) if i and i not in taken and not a.startswith("--")]
local = os.path.join(HERE, "input", "neon_pyqs_with_solutions.json")
SRC = os.path.abspath(args[0]) if args else local if os.path.exists(local) else os.path.expanduser("~/Desktop/PYQ Dashboard/data/neon_pyqs_with_solutions.json")
if not os.path.exists(SRC):
    sys.exit(f"Neon export not found: {SRC}")
MERGE = "--no-merge" not in sys.argv


def run(*cmd, cwd=HERE, check=True):
    print("\n$", " ".join(cmd))
    r = subprocess.run(cmd, cwd=cwd)
    if check and r.returncode:
        sys.exit(f"stopped: {' '.join(cmd)} failed")
    return r.returncode


data = SRC
if MERGE:
    run(sys.executable, "apply_merges.py", SRC, cwd=os.path.join(HERE, "topic_merge"))
    data = os.path.join(HERE, "topic_merge", "neon_merged.json")
run(sys.executable, "check_solutions.py", data, "--out", ".", cwd=os.path.join(HERE, "tutor"), check=False)
run(sys.executable, "build_neon_dashboard.py", data)
if MERGE:
    run(sys.executable, "sync_topic_keys.py", "topic_merge/topic_redirects.json", "dashboard_neon/questions.json")
run(sys.executable, "build_tutor_data.py", data, cwd=os.path.join(HERE, "tutor"))
run(sys.executable, "make_export.py")
tutor_failed = run("node", "run_tests.js", cwd=os.path.join(HERE, "tutor"), check=False)

built = os.path.join(HERE, "export", "pyq-dashboard")
if ENDPOINT is not None:
    with open(os.path.join(built, "pq-config.js"), "w", encoding="utf-8") as fh:
        fh.write("/* Site settings for the chat box (written by rebuild_all.py --endpoint). */\n")
        fh.write(f"window.PQ_LOG_ENDPOINT = {ENDPOINT!r};\n".replace("'", '"'))
    print("log endpoint:", ENDPOINT)
if SITE:
    site = os.path.abspath(SITE)
    if os.path.exists(site):
        shutil.rmtree(site)
    shutil.copytree(built, site)
    print("site copied to:", site)
if "--no-zip" not in sys.argv:
    exp = os.path.join(HERE, "export")
    for name, folder in (("pyq-dashboard", built), ("pyq-tutor", os.path.join(HERE, "tutor"))):
        z = os.path.join(exp, name)
        if os.path.exists(z + ".zip"):
            os.remove(z + ".zip")
        shutil.make_archive(z, "zip", os.path.dirname(folder), os.path.basename(folder))
        print("zip:", z + ".zip")
if tutor_failed:
    sys.exit("tutor tests failed — see the FAIL lines above")
print("\nBuilt. Open test.html in the site to check the chat tests.")
