TRUNCATE "Question" CASCADE;
-- CreateEnum
CREATE TYPE "PaperType" AS ENUM ('GS1', 'CSAT');

-- CreateEnum
CREATE TYPE "QuestionOrigin" AS ENUM ('PYQ', 'PRACTICE', 'MOCK');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "DifficultySource" AS ENUM ('SOURCE', 'AI', 'MANUAL', 'COMPUTED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CORRECT', 'MULTI_STATEMENT', 'MATCH_FOLLOWING', 'ASSERTION_REASON', 'PASSAGE_BASED', 'OTHER');

-- CreateEnum
CREATE TYPE "AnswerStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'CONFLICT');

-- CreateEnum
CREATE TYPE "DocKind" AS ENUM ('QUESTION_PAPER', 'ANSWER_KEY', 'PRACTICE_SET', 'MIXED');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('QUEUED', 'RUNNING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DUPLICATE', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "TaxLevel" AS ENUM ('SUBJECT', 'TOPIC', 'THEME');

-- CreateEnum
CREATE TYPE "AttemptMode" AS ENUM ('PRACTICE', 'TEST');

-- DropForeignKey
ALTER TABLE "PYQLink" DROP CONSTRAINT "PYQLink_issueId_fkey";

-- DropForeignKey
ALTER TABLE "PreviousYearQuestion" DROP CONSTRAINT "PreviousYearQuestion_optionalId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_issueId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_testPackId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "TestPack" DROP CONSTRAINT "TestPack_issueId_fkey";

-- DropForeignKey
ALTER TABLE "_TestPackQuestions" DROP CONSTRAINT "_TestPackQuestions_A_fkey";

-- DropForeignKey
ALTER TABLE "_TestPackQuestions" DROP CONSTRAINT "_TestPackQuestions_B_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "domain",
DROP COLUMN "explanation_hi",
DROP COLUMN "explanation_mr",
DROP COLUMN "gsPaper",
DROP COLUMN "issueId",
DROP COLUMN "options_hi",
DROP COLUMN "options_mr",
DROP COLUMN "tags",
DROP COLUMN "text",
DROP COLUMN "text_hi",
DROP COLUMN "text_mr",
ADD COLUMN     "analysis" JSONB,
ADD COLUMN     "answerStatus" "AnswerStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "assets" JSONB,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "dedupHash" TEXT NOT NULL,
ADD COLUMN     "difficultySource" "DifficultySource",
ADD COLUMN     "embedding" vector(768),
ADD COLUMN     "examName" TEXT DEFAULT 'UPSC',
ADD COLUMN     "examYear" INTEGER,
ADD COLUMN     "origin" "QuestionOrigin" NOT NULL,
ADD COLUMN     "paper" "PaperType" NOT NULL,
ADD COLUMN     "passageId" TEXT,
ADD COLUMN     "questionNo" INTEGER,
ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'SINGLE_CORRECT',
ADD COLUMN     "searchVector" tsvector,
ADD COLUMN     "setCode" TEXT,
ADD COLUMN     "status" "QuestionStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "stem" TEXT NOT NULL,
ADD COLUMN     "subjectId" TEXT,
ADD COLUMN     "topicId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "explanation" DROP NOT NULL,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty";

-- DropTable
DROP TABLE "PYQLink";

-- DropTable
DROP TABLE "PreviousYearQuestion";

-- DropTable
DROP TABLE "QuizAttempt";

-- DropTable
DROP TABLE "QuizPack";

-- DropTable
DROP TABLE "TestPack";

-- DropTable
DROP TABLE "_TestPackQuestions";

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "paper" "PaperType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroTheme" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MicroTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyAlias" (
    "id" TEXT NOT NULL,
    "level" "TaxLevel" NOT NULL,
    "label" TEXT NOT NULL,
    "publisher" TEXT,
    "subjectId" TEXT,
    "topicId" TEXT,
    "themeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxonomyAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceDocument" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "publisher" TEXT,
    "kind" "DocKind" NOT NULL,
    "yearHint" INTEGER,
    "paperHint" "PaperType",
    "pageCount" INTEGER,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'QUEUED',
    "model" TEXT,
    "stats" JSONB,
    "errorLog" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionDraft" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "pageNo" INTEGER,
    "rawText" TEXT NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'PENDING',
    "flags" TEXT[],
    "confidence" DOUBLE PRECISION,
    "examName" TEXT,
    "examYear" INTEGER,
    "paper" "PaperType",
    "setCode" TEXT,
    "questionNo" INTEGER,
    "stem" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctLabel" TEXT,
    "explanation" TEXT,
    "questionType" "QuestionType",
    "difficulty" "Difficulty",
    "srcSubject" TEXT,
    "srcTopic" TEXT,
    "srcTheme" TEXT,
    "srcDifficulty" TEXT,
    "subjectId" TEXT,
    "topicId" TEXT,
    "themeIds" TEXT[],
    "passageText" TEXT,
    "assets" JSONB,
    "dedupHash" TEXT NOT NULL,
    "duplicateOfId" TEXT,
    "publishedId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passage" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "assets" JSONB,
    "examYear" INTEGER,
    "paper" "PaperType",

    CONSTRAINT "Passage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionMicroTheme" (
    "questionId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "QuestionMicroTheme_pkey" PRIMARY KEY ("questionId","themeId")
);

-- CreateTable
CREATE TABLE "QuestionSource" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "draftId" TEXT,
    "pageNo" INTEGER,
    "sourceLabels" JSONB,

    CONSTRAINT "QuestionSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionRevision" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedBy" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestPaper" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationMins" INTEGER NOT NULL DEFAULT 0,
    "negativeMarking" DOUBLE PRECISION NOT NULL DEFAULT 0.33,
    "marksPerQuestion" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestPaperQuestion" (
    "testPaperId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "TestPaperQuestion_pkey" PRIMARY KEY ("testPaperId","questionId")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "AttemptMode" NOT NULL,
    "testPaperId" TEXT,
    "filterSpec" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedLabel" TEXT,
    "isCorrect" BOOLEAN,
    "timeSpentSec" INTEGER,
    "flagged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBookmark" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionBookmark_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_paper_slug_key" ON "Subject"("paper", "slug");

-- CreateIndex
CREATE INDEX "Topic_subjectId_idx" ON "Topic"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_slug_key" ON "Topic"("subjectId", "slug");

-- CreateIndex
CREATE INDEX "MicroTheme_topicId_idx" ON "MicroTheme"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "MicroTheme_topicId_slug_key" ON "MicroTheme"("topicId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyAlias_level_label_publisher_key" ON "TaxonomyAlias"("level", "label", "publisher");

-- CreateIndex
CREATE UNIQUE INDEX "SourceDocument_fileHash_key" ON "SourceDocument"("fileHash");

-- CreateIndex
CREATE INDEX "IngestionRun_documentId_idx" ON "IngestionRun"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionDraft_publishedId_key" ON "QuestionDraft"("publishedId");

-- CreateIndex
CREATE INDEX "QuestionDraft_runId_status_idx" ON "QuestionDraft"("runId", "status");

-- CreateIndex
CREATE INDEX "QuestionDraft_dedupHash_idx" ON "QuestionDraft"("dedupHash");

-- CreateIndex
CREATE INDEX "QuestionMicroTheme_themeId_idx" ON "QuestionMicroTheme"("themeId");

-- CreateIndex
CREATE INDEX "QuestionSource_questionId_idx" ON "QuestionSource"("questionId");

-- CreateIndex
CREATE INDEX "QuestionSource_documentId_idx" ON "QuestionSource"("documentId");

-- CreateIndex
CREATE INDEX "QuestionRevision_questionId_idx" ON "QuestionRevision"("questionId");

-- CreateIndex
CREATE INDEX "Attempt_userId_startedAt_idx" ON "Attempt"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "AttemptAnswer_questionId_idx" ON "AttemptAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptAnswer_attemptId_questionId_key" ON "AttemptAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_dedupHash_key" ON "Question"("dedupHash");

-- CreateIndex
CREATE INDEX "Question_paper_examYear_idx" ON "Question"("paper", "examYear");

-- CreateIndex
CREATE INDEX "Question_subjectId_idx" ON "Question"("subjectId");

-- CreateIndex
CREATE INDEX "Question_topicId_idx" ON "Question"("topicId");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "Question_origin_status_idx" ON "Question"("origin", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Question_examName_examYear_paper_setCode_questionNo_key" ON "Question"("examName", "examYear", "paper", "setCode", "questionNo");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroTheme" ADD CONSTRAINT "MicroTheme_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxonomyAlias" ADD CONSTRAINT "TaxonomyAlias_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxonomyAlias" ADD CONSTRAINT "TaxonomyAlias_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxonomyAlias" ADD CONSTRAINT "TaxonomyAlias_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "MicroTheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SourceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionDraft" ADD CONSTRAINT "QuestionDraft_runId_fkey" FOREIGN KEY ("runId") REFERENCES "IngestionRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionDraft" ADD CONSTRAINT "QuestionDraft_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SourceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "Passage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMicroTheme" ADD CONSTRAINT "QuestionMicroTheme_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMicroTheme" ADD CONSTRAINT "QuestionMicroTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "MicroTheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSource" ADD CONSTRAINT "QuestionSource_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSource" ADD CONSTRAINT "QuestionSource_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SourceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionRevision" ADD CONSTRAINT "QuestionRevision_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestPaperQuestion" ADD CONSTRAINT "TestPaperQuestion_testPaperId_fkey" FOREIGN KEY ("testPaperId") REFERENCES "TestPaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestPaperQuestion" ADD CONSTRAINT "TestPaperQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_testPaperId_fkey" FOREIGN KEY ("testPaperId") REFERENCES "TestPaper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBookmark" ADD CONSTRAINT "QuestionBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBookmark" ADD CONSTRAINT "QuestionBookmark_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Manual additions for pgvector and full-text search on Question table

-- Add vector index
CREATE INDEX "Question_embedding_idx" ON "Question" USING hnsw ("embedding" vector_cosine_ops);

-- Add full text search index
CREATE INDEX "Question_searchVector_idx" ON "Question" USING GIN ("searchVector");

-- Function to update the searchVector
CREATE OR REPLACE FUNCTION update_question_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" =
    setweight(to_tsvector('english', coalesce(NEW.stem, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.explanation, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function
CREATE TRIGGER "question_search_vector_trigger"
BEFORE INSERT OR UPDATE ON "Question"
FOR EACH ROW
EXECUTE FUNCTION update_question_search_vector();
