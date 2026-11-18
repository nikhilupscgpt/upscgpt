-- The query export-pyqs.mjs runs. It must return one row per question with these columns:
--   id, "examName", "examYear", "questionNo", subject, topic, difficulty, stem, options (json array of {text,label}),
--   "correctLabel", explanation, analysis (jsonb, the solution; NULL when not written yet)
-- Edit the table / column names to match your schema. If subject and topic are separate tables,
-- join them and select their names, e.g.  s.name AS subject, t.name AS topic.
SELECT q.id,
       q."examName",
       q."examYear",
       q."questionNo",
       q."srcSubject" AS subject,
       q."srcTopic" AS topic,
       q.difficulty,
       q.stem,
       q.options,
       q."correctLabel",
       q.explanation,
       q."explanationJson" AS analysis
FROM "QuestionDraft" q
WHERE q."examName" IS NULL OR q."examName" NOT ILIKE '%CDS%'
ORDER BY q."examYear" DESC, q."srcSubject" ASC, q."questionNo" ASC;
