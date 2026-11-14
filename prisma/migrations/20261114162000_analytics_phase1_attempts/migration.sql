-- Phase 1: Extend Attempt & AttemptAnswer for server-side grading, add QuestionReport, QuestionStats, SecurityEvent

-- 1. Extend Attempt
ALTER TABLE "Attempt"
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "mode" SET DEFAULT 'PRACTICE';

ALTER TABLE "Attempt"
  ADD COLUMN IF NOT EXISTS "anonId" TEXT,
  ADD COLUMN IF NOT EXISTS "module" TEXT NOT NULL DEFAULT 'pyq_practice',
  ADD COLUMN IF NOT EXISTS "filters" JSONB,
  ADD COLUMN IF NOT EXISTS "ephemeralQuestions" JSONB,
  ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "total" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "correct" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Attempt_module_startedAt_idx" ON "Attempt"("module", "startedAt");

-- 2. Extend AttemptAnswer
ALTER TABLE "AttemptAnswer"
  ALTER COLUMN "questionId" DROP NOT NULL;

ALTER TABLE "AttemptAnswer"
  ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL DEFAULT 'pyq',
  ADD COLUMN IF NOT EXISTS "sourceId" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "subject" TEXT,
  ADD COLUMN IF NOT EXISTS "topic" TEXT,
  ADD COLUMN IF NOT EXISTS "examYear" INTEGER,
  ADD COLUMN IF NOT EXISTS "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "AttemptAnswer"
SET "sourceId" = COALESCE("questionId", "id")
WHERE "sourceId" = '';

ALTER TABLE "AttemptAnswer"
  ALTER COLUMN "isCorrect" SET DEFAULT false,
  ALTER COLUMN "timeSpentSec" SET DEFAULT 0;

DROP INDEX IF EXISTS "AttemptAnswer_attemptId_questionId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "AttemptAnswer_attemptId_sourceType_sourceId_key"
  ON "AttemptAnswer"("attemptId", "sourceType", "sourceId");
CREATE INDEX IF NOT EXISTS "AttemptAnswer_sourceType_sourceId_idx"
  ON "AttemptAnswer"("sourceType", "sourceId");
CREATE INDEX IF NOT EXISTS "AttemptAnswer_answeredAt_idx"
  ON "AttemptAnswer"("answeredAt");

-- 3. QuestionReport
CREATE TABLE IF NOT EXISTS "QuestionReport" (
  "id" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "userId" TEXT,
  "reason" TEXT NOT NULL,
  "note" VARCHAR(500),
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "QuestionReport_status_createdAt_idx"
  ON "QuestionReport"("status", "createdAt");

-- 4. QuestionStats
CREATE TABLE IF NOT EXISTS "QuestionStats" (
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL,
  "pCorrect" DOUBLE PRECISION NOT NULL,
  "discrimination" DOUBLE PRECISION,
  "medianSec" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionStats_pkey" PRIMARY KEY ("sourceType", "sourceId")
);

-- 5. SecurityEvent
CREATE TABLE IF NOT EXISTS "SecurityEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "userId" TEXT,
  "anonId" TEXT,
  "deviceId" TEXT,
  "ipFull" TEXT,
  "detail" JSONB NOT NULL,
  "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SecurityEvent_type_at_idx"
  ON "SecurityEvent"("type", "at");
