-- PYQ Studio Phase 2: QuestionDraft extensions + Studio models (Deck, RecordingSession, LectureUsage, TeacherNote, FacultyPrefs)

DO $$ BEGIN
  CREATE TYPE "ExamCode" AS ENUM ('UPSC_CSE_PRE', 'CDS_I', 'CDS_II', 'CDS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "QuestionDraft"
  ADD COLUMN IF NOT EXISTS "examCode" "ExamCode",
  ADD COLUMN IF NOT EXISTS "explanationJson" JSONB,
  ADD COLUMN IF NOT EXISTS "contentStatus" TEXT NOT NULL DEFAULT 'incomplete',
  ADD COLUMN IF NOT EXISTS "missingFlags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "stemFormat" TEXT,
  ADD COLUMN IF NOT EXISTS "syllabusOrder" INTEGER,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedById" TEXT;

CREATE INDEX IF NOT EXISTS "QuestionDraft_contentStatus_idx" ON "QuestionDraft"("contentStatus");
CREATE INDEX IF NOT EXISTS "QuestionDraft_srcSubject_srcTopic_srcTheme_idx" ON "QuestionDraft"("srcSubject", "srcTopic", "srcTheme");

CREATE TABLE IF NOT EXISTS "Deck" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sectionPath" TEXT,
  "notes" TEXT,
  "isShared" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DeckItem" (
  "deckId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  CONSTRAINT "DeckItem_pkey" PRIMARY KEY ("deckId", "questionId"),
  CONSTRAINT "DeckItem_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "RecordingSession" (
  "id" TEXT NOT NULL,
  "facultyId" TEXT NOT NULL,
  "sectionPath" TEXT NOT NULL,
  "deckId" TEXT,
  "part" INTEGER NOT NULL,
  "totalParts" INTEGER NOT NULL,
  "questionIds" TEXT[] NOT NULL,
  "includeCds" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "durationSec" INTEGER,
  "timestamps" JSONB NOT NULL,
  "lastIndex" INTEGER NOT NULL DEFAULT 0,
  "videoRef" TEXT,
  "title" TEXT,
  "description" TEXT,
  CONSTRAINT "RecordingSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RecordingSession_facultyId_sectionPath_idx" ON "RecordingSession"("facultyId", "sectionPath");
CREATE INDEX IF NOT EXISTS "RecordingSession_sectionPath_status_idx" ON "RecordingSession"("sectionPath", "status");

CREATE TABLE IF NOT EXISTS "LectureUsage" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "facultyId" TEXT NOT NULL,
  "sessionId" TEXT,
  "presentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LectureUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LectureUsage_questionId_idx" ON "LectureUsage"("questionId");

CREATE TABLE IF NOT EXISTS "TeacherNote" (
  "facultyId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherNote_pkey" PRIMARY KEY ("facultyId", "questionId")
);

CREATE TABLE IF NOT EXISTS "FacultyPrefs" (
  "facultyId" TEXT NOT NULL,
  "defaultExam" TEXT NOT NULL DEFAULT 'UPSC_CSE_PRE',
  "includeCds" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" TEXT NOT NULL DEFAULT 'syllabus',
  "partSize" INTEGER NOT NULL DEFAULT 20,
  "secondsPerQuestion" INTEGER NOT NULL DEFAULT 75,
  "lastSectionPath" TEXT,
  CONSTRAINT "FacultyPrefs_pkey" PRIMARY KEY ("facultyId")
);
