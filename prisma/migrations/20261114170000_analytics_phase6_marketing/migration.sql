-- Phase 6: Marketing, Growth, Kill Switches, GSC, and Lifecycle Flows

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "marketingOptOut" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "marketingOptOutAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "PartnerCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "partnerName" TEXT NOT NULL,
  "commissionPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "discountPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PartnerCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PartnerCode_code_key" ON "PartnerCode"("code");

CREATE TABLE IF NOT EXISTS "GscDailyMetric" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "page" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GscDailyMetric_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GscDailyMetric_date_page_query_key" ON "GscDailyMetric"("date", "page", "query");
CREATE INDEX IF NOT EXISTS "GscDailyMetric_date_idx" ON "GscDailyMetric"("date");

CREATE TABLE IF NOT EXISTS "FeatureFlag" (
  "key" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "description" TEXT,
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);

INSERT INTO "FeatureFlag" ("key", "enabled", "description", "updatedAt")
VALUES
  ('mapbot_free_cached_only', false, 'Serve only cached MapBot responses for FREE users when AI costs spike', NOW()),
  ('otp_channel_fallback', false, 'Enable fallback OTP channel (WhatsApp/Email) when primary SMS delivery drops', NOW()),
  ('ai_free_tier_paused', false, 'Temporarily pause AI generation for FREE tier users during budget emergencies', NOW())
ON CONFLICT ("key") DO NOTHING;

CREATE TABLE IF NOT EXISTS "LifecycleDispatch" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "flow" TEXT NOT NULL,
  "cycleKey" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'sent',
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LifecycleDispatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LifecycleDispatch_userId_flow_cycleKey_key" ON "LifecycleDispatch"("userId", "flow", "cycleKey");
CREATE INDEX IF NOT EXISTS "LifecycleDispatch_flow_sentAt_idx" ON "LifecycleDispatch"("flow", "sentAt");
