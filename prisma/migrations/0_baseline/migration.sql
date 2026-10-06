-- Baseline of schema as built with db push (already applied to Supabase)
CREATE EXTENSION IF NOT EXISTS vector;
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('POLITY', 'GOVERNANCE', 'INTERNATIONAL_RELATIONS', 'ECONOMY', 'AGRICULTURE', 'SCIENCE_TECHNOLOGY', 'ENVIRONMENT', 'INTERNAL_SECURITY', 'SOCIETY', 'ANCIENT_INDIA', 'MEDIEVAL_INDIA', 'MODERN_INDIA', 'ART_CULTURE', 'HISTORY', 'GEOGRAPHY', 'CULTURE', 'ETHICS', 'DISASTER_MANAGEMENT', 'CURRENT_AFFAIRS', 'CSAT', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "IssueNodeType" AS ENUM ('NEWS', 'CONCEPTUAL', 'STATIC', 'MAINS_QUESTION');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('ACTIVE', 'DORMANT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('NEWS', 'PIB', 'REPORT', 'THE_HINDU_TEXT_AND_CONTEXT', 'INDIAN_EXPRESS_EXPLAINED');

-- CreateEnum
CREATE TYPE "ExamStage" AS ENUM ('PRELIMS_ONLY', 'MAINS_ONLY', 'BOTH');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('UNSTARTED', 'READING', 'MASTERED', 'REVISION_NEEDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT DEFAULT 'USER',
    "tier" TEXT DEFAULT 'FREE',
    "validUntil" TIMESTAMP(3),
    "razorpayCustomerId" TEXT,
    "username" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferences" JSONB DEFAULT '{}',
    "examYear" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT,
    "expires" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'EMAIL_OTP'
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpaySubId" TEXT NOT NULL,
    "razorpayPlanId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentStart" TIMESTAMP(3) NOT NULL,
    "currentEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapEntry" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "name" TEXT NOT NULL,
    "name_hi" TEXT,
    "name_mr" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "year" INTEGER,
    "shape" TEXT,
    "prelims" TEXT,
    "prelims_hi" TEXT,
    "prelims_mr" TEXT,
    "mains" TEXT,
    "mains_hi" TEXT,
    "mains_mr" TEXT,
    "india" TEXT,
    "india_hi" TEXT,
    "india_mr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastNewsDate" TIMESTAMP(3),
    "newsMentions" TEXT,
    "aiNodeSummaryFollowups" TEXT,
    "aiNodeSummaryMarkdown" TEXT,
    "aiNodeSummaryMarkdown_hi" TEXT,
    "aiNodeSummaryMarkdown_mr" TEXT,
    "aiNodeSummarySourceHash" TEXT,
    "aiNodeSummaryTitle" TEXT,
    "aiNodeSummaryTitle_hi" TEXT,
    "aiNodeSummaryTitle_mr" TEXT,
    "aiNodeSummaryUpdatedAt" TIMESTAMP(3),
    "aiNewsSummaryFollowups" TEXT,
    "aiNewsSummaryMarkdown" TEXT,
    "aiNewsSummaryMarkdown_hi" TEXT,
    "aiNewsSummaryMarkdown_mr" TEXT,
    "aiNewsSummarySourceHash" TEXT,
    "aiNewsSummaryTitle" TEXT,
    "aiNewsSummaryTitle_hi" TEXT,
    "aiNewsSummaryTitle_mr" TEXT,
    "aiNewsSummaryUpdatedAt" TIMESTAMP(3),
    "admRegion" TEXT,
    "capital" TEXT,
    "continent" TEXT,
    "geoGroup" TEXT,
    "worldPart" TEXT DEFAULT 'POLITICAL',
    "isCurrentAffairs" BOOLEAN DEFAULT false,
    "isLandlocked" BOOLEAN DEFAULT false,
    "mountainType" TEXT,
    "nodeSubType" TEXT,
    "organizations" TEXT,
    "parentCountry" TEXT,
    "riverOutflow" TEXT,
    "seaBorders" TEXT,
    "upscFrequency" INTEGER,
    "countriesSpread" TEXT,
    "highestPeak" TEXT,

    CONSTRAINT "MapEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_hi" TEXT,
    "name_mr" TEXT,
    "shortName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "members" TEXT NOT NULL,
    "hqCity" TEXT,
    "hqLat" DOUBLE PRECISION,
    "hqLon" DOUBLE PRECISION,
    "founded" INTEGER,
    "description" TEXT,
    "description_hi" TEXT,
    "description_mr" TEXT,
    "upscContext" TEXT,
    "upscContext_hi" TEXT,
    "upscContext_mr" TEXT,
    "indiaRole" TEXT,
    "indiaRole_hi" TEXT,
    "indiaRole_mr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_hi" TEXT,
    "title_mr" TEXT,
    "slug" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "topic_hi" TEXT,
    "topic_mr" TEXT,
    "category" "IssueCategory" NOT NULL,
    "gsPapers" TEXT[],
    "nodeType" "IssueNodeType" NOT NULL DEFAULT 'NEWS',
    "status" "IssueStatus" NOT NULL DEFAULT 'ACTIVE',
    "backgroundNote" TEXT,
    "backgroundNote_hi" TEXT,
    "backgroundNote_mr" TEXT,
    "cumulativeSummary" TEXT,
    "cumulativeSummary_hi" TEXT,
    "cumulativeSummary_mr" TEXT,
    "valueAddition" TEXT,
    "valueAddition_hi" TEXT,
    "valueAddition_mr" TEXT,
    "possibleQuestions" TEXT,
    "possibleQuestions_hi" TEXT,
    "possibleQuestions_mr" TEXT,
    "prelimsNote" JSONB,
    "mainsNote" JSONB,
    "searchVector" tsvector,
    "mainsFacts" TEXT,
    "imageUrl" TEXT,
    "embedding" vector,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentIssueId" TEXT,
    "mainsFacts_hi" TEXT,
    "mainsFacts_mr" TEXT,
    "mainsNote_hi" TEXT,
    "mainsNote_mr" TEXT,
    "prelimsNote_hi" TEXT,
    "prelimsNote_mr" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeContent" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "prelimsNote" TEXT,
    "mainsNote" TEXT,
    "facts" JSONB DEFAULT '[]',
    "caseStudies" JSONB DEFAULT '[]',
    "recommendations" JSONB DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "lastEditedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NodeContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_hi" TEXT,
    "title_mr" TEXT,
    "url" TEXT,
    "source" TEXT,
    "contentType" "ContentType" NOT NULL DEFAULT 'NEWS',
    "examStage" "ExamStage",
    "importanceScore" INTEGER NOT NULL DEFAULT 1,
    "rawContent" TEXT,
    "rawContent_hi" TEXT,
    "rawContent_mr" TEXT,
    "structuredData" JSONB,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "addedManually" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newsStreakId" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Editorial" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_hi" TEXT,
    "title_mr" TEXT,
    "url" TEXT,
    "author" TEXT,
    "source" TEXT,
    "importanceScore" INTEGER NOT NULL DEFAULT 1,
    "rawContent" TEXT,
    "rawContent_hi" TEXT,
    "rawContent_mr" TEXT,
    "structuredData" JSONB,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newsStreakId" TEXT,

    CONSTRAINT "Editorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "eventText" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "itemType" TEXT NOT NULL,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PYQLink" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "paperType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "gsTag" TEXT,
    "questionText" TEXT NOT NULL,
    "relevanceNote" TEXT,
    "howToUse" TEXT,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PYQLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityId" TEXT,
    "entityType" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "userId" TEXT,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionInsightCache" (
    "id" TEXT NOT NULL,
    "regionKey" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contextLabel" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "suggestedFollowups" TEXT,
    "sourceHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionInsightCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizPack" (
    "id" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contextLabel" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "suggestedFollowups" TEXT,
    "sourceHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "content" TEXT,
    "recipient" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SubjectContent" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentMarkdown" TEXT NOT NULL,
    "embedding" vector,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "exam" TEXT NOT NULL DEFAULT 'BOTH',
    "optionalId" TEXT,
    "issueId" TEXT,

    CONSTRAINT "SubjectContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionalSubject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptionalSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'UNSTARTED',
    "readSummary" BOOLEAN NOT NULL DEFAULT false,
    "viewedNews" BOOLEAN NOT NULL DEFAULT false,
    "solvedPYQs" BOOLEAN NOT NULL DEFAULT false,
    "solvedMCQs" BOOLEAN NOT NULL DEFAULT false,
    "lastStudiedAt" TIMESTAMP(3),
    "timeSpentSecs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "text_hi" TEXT,
    "text_mr" TEXT,
    "options" JSONB NOT NULL,
    "options_hi" JSONB,
    "options_mr" JSONB,
    "correctLabel" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "explanation_hi" TEXT,
    "explanation_mr" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "domain" TEXT NOT NULL,
    "gsPaper" TEXT,
    "tags" TEXT[],
    "issueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestPack" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_hi" TEXT,
    "title_mr" TEXT,
    "description" TEXT,
    "description_hi" TEXT,
    "description_mr" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PRACTICE',
    "subType" TEXT DEFAULT 'FULL_LENGTH',
    "durationMins" INTEGER NOT NULL DEFAULT 0,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "negativeMarking" DOUBLE PRECISION NOT NULL DEFAULT 0.33,
    "marksPerQuestion" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "issueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testPackId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "timeTakenSecs" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "issueId" TEXT,
    "articleId" TEXT,
    "editorialId" TEXT,
    "streakId" TEXT,
    "subject" TEXT,
    "topic" TEXT,
    "linkedNodeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviousYearQuestion" (
    "id" TEXT NOT NULL,
    "paper" TEXT NOT NULL,
    "optionalId" TEXT,
    "subject" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "marks" INTEGER,
    "modelAnswer" TEXT,
    "embedding" vector,
    "searchVector" tsvector,
    "metadata" JSONB,
    "language" TEXT NOT NULL DEFAULT 'en',
    "exam" TEXT NOT NULL DEFAULT 'UPSC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreviousYearQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsStreak" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_hi" TEXT,
    "title_mr" TEXT,
    "slug" TEXT NOT NULL,
    "livingSummary" TEXT,
    "livingSummary_hi" TEXT,
    "livingSummary_mr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "importanceScore" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NewsStreakIssues" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_IssueRelations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TestPackQuestions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_razorpayCustomerId_key" ON "User"("razorpayCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpaySubId_key" ON "Subscription"("razorpaySubId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteEntry_userId_entryId_key" ON "FavoriteEntry"("userId", "entryId");

-- CreateIndex
CREATE INDEX "MapEntry_name_idx" ON "MapEntry"("name");

-- CreateIndex
CREATE INDEX "MapEntry_category_idx" ON "MapEntry"("category");

-- CreateIndex
CREATE INDEX "MapEntry_worldPart_idx" ON "MapEntry"("worldPart");

-- CreateIndex
CREATE INDEX "MapEntry_nodeSubType_idx" ON "MapEntry"("nodeSubType");

-- CreateIndex
CREATE UNIQUE INDEX "MapEntry_name_lat_lon_key" ON "MapEntry"("name", "lat", "lon");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_category_idx" ON "Organization"("category");

-- CreateIndex
CREATE INDEX "Organization_shortName_idx" ON "Organization"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_slug_key" ON "Issue"("slug");

-- CreateIndex
CREATE INDEX "Issue_category_idx" ON "Issue"("category");

-- CreateIndex
CREATE INDEX "Issue_domain_idx" ON "Issue"("domain");

-- CreateIndex
CREATE INDEX "Issue_nodeType_idx" ON "Issue"("nodeType");

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "Issue_slug_idx" ON "Issue"("slug");

-- CreateIndex
CREATE INDEX "Issue_orderIndex_idx" ON "Issue"("orderIndex");

-- CreateIndex
CREATE INDEX "Issue_title_idx" ON "Issue"("title");

-- CreateIndex
CREATE UNIQUE INDEX "NodeContent_issueId_key" ON "NodeContent"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE INDEX "Article_issueId_idx" ON "Article"("issueId");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_source_idx" ON "Article"("source");

-- CreateIndex
CREATE INDEX "Article_contentType_idx" ON "Article"("contentType");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Editorial_issueId_idx" ON "Editorial"("issueId");

-- CreateIndex
CREATE INDEX "Editorial_status_idx" ON "Editorial"("status");

-- CreateIndex
CREATE INDEX "Editorial_source_idx" ON "Editorial"("source");

-- CreateIndex
CREATE INDEX "TimelineEvent_issueId_idx" ON "TimelineEvent"("issueId");

-- CreateIndex
CREATE INDEX "TimelineEvent_date_idx" ON "TimelineEvent"("date");

-- CreateIndex
CREATE INDEX "TimelineEvent_itemType_idx" ON "TimelineEvent"("itemType");

-- CreateIndex
CREATE INDEX "PYQLink_issueId_idx" ON "PYQLink"("issueId");

-- CreateIndex
CREATE INDEX "PYQLink_paperType_idx" ON "PYQLink"("paperType");

-- CreateIndex
CREATE INDEX "PYQLink_year_idx" ON "PYQLink"("year");

-- CreateIndex
CREATE INDEX "ActionLog_action_idx" ON "ActionLog"("action");

-- CreateIndex
CREATE INDEX "ActionLog_userId_idx" ON "ActionLog"("userId");

-- CreateIndex
CREATE INDEX "ActionLog_entityType_entityId_idx" ON "ActionLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActionLog_createdAt_idx" ON "ActionLog"("createdAt");

-- CreateIndex
CREATE INDEX "RegionInsightCache_regionKey_idx" ON "RegionInsightCache"("regionKey");

-- CreateIndex
CREATE INDEX "RegionInsightCache_mode_idx" ON "RegionInsightCache"("mode");

-- CreateIndex
CREATE UNIQUE INDEX "RegionInsightCache_regionKey_mode_key" ON "RegionInsightCache"("regionKey", "mode");

-- CreateIndex
CREATE INDEX "QuizPack_scopeType_scopeId_idx" ON "QuizPack"("scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "QuizPack_mode_idx" ON "QuizPack"("mode");

-- CreateIndex
CREATE UNIQUE INDEX "QuizPack_scopeType_scopeId_mode_key" ON "QuizPack"("scopeType", "scopeId", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLog_razorpayId_key" ON "PaymentLog"("razorpayId");

-- CreateIndex
CREATE INDEX "SubjectContent_subject_idx" ON "SubjectContent"("subject");

-- CreateIndex
CREATE INDEX "SubjectContent_examType_idx" ON "SubjectContent"("examType");

-- CreateIndex
CREATE INDEX "SubjectContent_optionalId_idx" ON "SubjectContent"("optionalId");

-- CreateIndex
CREATE INDEX "SubjectContent_issueId_idx" ON "SubjectContent"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "OptionalSubject_name_key" ON "OptionalSubject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OptionalSubject_slug_key" ON "OptionalSubject"("slug");

-- CreateIndex
CREATE INDEX "OptionalSubject_slug_idx" ON "OptionalSubject"("slug");

-- CreateIndex
CREATE INDEX "IssueProgress_userId_status_idx" ON "IssueProgress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "IssueProgress_userId_issueId_key" ON "IssueProgress"("userId", "issueId");

-- CreateIndex
CREATE UNIQUE INDEX "IssueFollow_userId_issueId_key" ON "IssueFollow"("userId", "issueId");

-- CreateIndex
CREATE INDEX "UserNote_userId_issueId_idx" ON "UserNote"("userId", "issueId");

-- CreateIndex
CREATE INDEX "UserNote_userId_articleId_idx" ON "UserNote"("userId", "articleId");

-- CreateIndex
CREATE INDEX "UserNote_userId_editorialId_idx" ON "UserNote"("userId", "editorialId");

-- CreateIndex
CREATE INDEX "UserNote_userId_streakId_idx" ON "UserNote"("userId", "streakId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_itemType_itemId_key" ON "Bookmark"("userId", "itemType", "itemId");

-- CreateIndex
CREATE INDEX "PreviousYearQuestion_paper_idx" ON "PreviousYearQuestion"("paper");

-- CreateIndex
CREATE INDEX "PreviousYearQuestion_subject_idx" ON "PreviousYearQuestion"("subject");

-- CreateIndex
CREATE INDEX "PreviousYearQuestion_year_idx" ON "PreviousYearQuestion"("year");

-- CreateIndex
CREATE UNIQUE INDEX "NewsStreak_slug_key" ON "NewsStreak"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_NewsStreakIssues_AB_unique" ON "_NewsStreakIssues"("A", "B");

-- CreateIndex
CREATE INDEX "_NewsStreakIssues_B_index" ON "_NewsStreakIssues"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_IssueRelations_AB_unique" ON "_IssueRelations"("A", "B");

-- CreateIndex
CREATE INDEX "_IssueRelations_B_index" ON "_IssueRelations"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TestPackQuestions_AB_unique" ON "_TestPackQuestions"("A", "B");

-- CreateIndex
CREATE INDEX "_TestPackQuestions_B_index" ON "_TestPackQuestions"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteEntry" ADD CONSTRAINT "FavoriteEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MapEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteEntry" ADD CONSTRAINT "FavoriteEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_parentIssueId_fkey" FOREIGN KEY ("parentIssueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeContent" ADD CONSTRAINT "NodeContent_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_newsStreakId_fkey" FOREIGN KEY ("newsStreakId") REFERENCES "NewsStreak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Editorial" ADD CONSTRAINT "Editorial_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Editorial" ADD CONSTRAINT "Editorial_newsStreakId_fkey" FOREIGN KEY ("newsStreakId") REFERENCES "NewsStreak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_refId_fkey" FOREIGN KEY ("refId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PYQLink" ADD CONSTRAINT "PYQLink_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectContent" ADD CONSTRAINT "SubjectContent_optionalId_fkey" FOREIGN KEY ("optionalId") REFERENCES "OptionalSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectContent" ADD CONSTRAINT "SubjectContent_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueProgress" ADD CONSTRAINT "IssueProgress_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueProgress" ADD CONSTRAINT "IssueProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestPack" ADD CONSTRAINT "TestPack_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_testPackId_fkey" FOREIGN KEY ("testPackId") REFERENCES "TestPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueFollow" ADD CONSTRAINT "IssueFollow_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueFollow" ADD CONSTRAINT "IssueFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_editorialId_fkey" FOREIGN KEY ("editorialId") REFERENCES "Editorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "NewsStreak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviousYearQuestion" ADD CONSTRAINT "PreviousYearQuestion_optionalId_fkey" FOREIGN KEY ("optionalId") REFERENCES "OptionalSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsStreakIssues" ADD CONSTRAINT "_NewsStreakIssues_A_fkey" FOREIGN KEY ("A") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsStreakIssues" ADD CONSTRAINT "_NewsStreakIssues_B_fkey" FOREIGN KEY ("B") REFERENCES "NewsStreak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IssueRelations" ADD CONSTRAINT "_IssueRelations_A_fkey" FOREIGN KEY ("A") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IssueRelations" ADD CONSTRAINT "_IssueRelations_B_fkey" FOREIGN KEY ("B") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestPackQuestions" ADD CONSTRAINT "_TestPackQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestPackQuestions" ADD CONSTRAINT "_TestPackQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "TestPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

