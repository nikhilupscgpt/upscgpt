-- Questions the PYQ chat / tutor could not answer well. Written by app/api/pyq-log/route.ts.
-- Run once in the Neon SQL editor (or add to your migrations).
CREATE TABLE IF NOT EXISTS pyq_chat_log (
  id         bigserial PRIMARY KEY,
  asked_at   timestamptz NOT NULL DEFAULT now(),
  question   text        NOT NULL,
  engine     text        NOT NULL DEFAULT '',   -- 'stats' (dashboard numbers) or 'tutor' (solutions)
  intent     text        NOT NULL DEFAULT '',   -- how the question was read
  reason     text        NOT NULL DEFAULT ''    -- no-match | no-results | keyword-not-found | asked-back | flagged
);
CREATE INDEX IF NOT EXISTS pyq_chat_log_asked_at ON pyq_chat_log (asked_at DESC);

-- Most common misses in the last 30 days (use these as new test cases):
-- SELECT lower(question) AS q, reason, count(*) FROM pyq_chat_log
--  WHERE asked_at > now() - interval '30 days' GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 100;
