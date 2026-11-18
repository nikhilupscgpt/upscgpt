"""Rebuild data/data.js from data/questions.json and data/insights.json.

Run after editing either JSON file:  python3 make_data.py
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
q = json.load(open(os.path.join(HERE, "data", "questions.json"), encoding="utf-8"))
i = json.load(open(os.path.join(HERE, "data", "insights.json"), encoding="utf-8"))
with open(os.path.join(HERE, "data", "data.js"), "w", encoding="utf-8") as fh:
    fh.write("/* Generated from questions.json and insights.json by make_data.py — do not edit by hand. */\n")
    fh.write("window.PQ_DATA = ")
    json.dump({"questions": q, "insights": i}, fh, ensure_ascii=False, separators=(",", ":"))
    fh.write(";\n")
print("data/data.js written:", len(q), "questions")
