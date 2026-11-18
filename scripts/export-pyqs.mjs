// Export the PYQs from Neon into the JSON shape rebuild_all.py reads.
//   DATABASE_URL=… node scripts/export-pyqs.mjs [out.json] [query.sql]
// Defaults: out = neon_pyqs_with_solutions.json, query = scripts/export-query.sql (edit it to match your tables).
import { neon } from "@neondatabase/serverless";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || "neon_pyqs_with_solutions.json";
const queryFile = process.argv[3] || join(here, "export-query.sql");
if (!process.env.DATABASE_URL) { console.error("Set DATABASE_URL first."); process.exit(1); }

const text = readFileSync(queryFile, "utf8").split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").trim().replace(/;$/, "");
const sql = neon(process.env.DATABASE_URL);
const rows = await sql.query(text);

const asJson = (v) => (typeof v === "string" ? (() => { try { return JSON.parse(v); } catch { return v; } })() : v);
const need = ["id", "examYear", "subject", "topic", "stem", "options", "correctLabel"];
const missing = need.filter((k) => rows.length && !(k in rows[0]));
if (missing.length) { console.error("The query does not return:", missing.join(", ")); process.exit(1); }

const qs = rows.map((r) => {
  let explanation = r.explanation ?? null;
  let analysis = asJson(r.analysis) || null;
  if (typeof explanation === "string" && explanation.trim().startsWith("{")) {
    const parsed = asJson(explanation);
    if (parsed && typeof parsed === "object") {
      explanation = parsed.explanation ?? null;
      analysis = analysis || parsed.analysis || parsed;
    }
  }
  return {
    id: String(r.id),
    examName: r.examName ?? "UPSC CSE Pre",
    examYear: Number(r.examYear),
    questionNo: r.questionNo == null ? null : Number(r.questionNo),
    subject: r.subject,
    topic: r.topic,
    difficulty: r.difficulty ?? null,
    stem: r.stem,
    options: asJson(r.options) || [],
    correctLabel: r.correctLabel == null ? null : String(r.correctLabel).toLowerCase(),
    hasSolution: !!(analysis && Object.keys(analysis).length),
    explanation,
    analysis,
  };
});
writeFileSync(out, JSON.stringify(qs, null, 1));
const years = [...new Set(qs.map((q) => q.examYear))].sort();
console.log(`${qs.length} questions, ${qs.filter((q) => q.hasSolution).length} with solutions, years ${years[0]}–${years.at(-1)} → ${out}`);
