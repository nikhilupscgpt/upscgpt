-- Phase 2: UsageLedger, MessageLog, OtpRequest, FixedCost, MarketingSpend, Campaign, BudgetLimit

CREATE TABLE IF NOT EXISTS "UsageLedger" (
  "id" TEXT NOT NULL,
  "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "provider" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "costPaise" INTEGER NOT NULL,
  "userId" TEXT,
  "tier" TEXT,
  "meta" JSONB,
  CONSTRAINT "UsageLedger_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "UsageLedger_at_category_idx" ON "UsageLedger"("at", "category");
CREATE INDEX IF NOT EXISTS "UsageLedger_userId_at_idx" ON "UsageLedger"("userId", "at");

CREATE TABLE IF NOT EXISTS "MessageLog" (
  "id" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerMsgId" TEXT,
  "userId" TEXT,
  "toHash" TEXT NOT NULL,
  "campaignId" TEXT,
  "status" TEXT NOT NULL,
  "costPaise" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MessageLog_providerMsgId_key" ON "MessageLog"("providerMsgId");
CREATE INDEX IF NOT EXISTS "MessageLog_channel_purpose_createdAt_idx" ON "MessageLog"("channel", "purpose", "createdAt");

CREATE TABLE IF NOT EXISTS "OtpRequest" (
  "id" TEXT NOT NULL,
  "phoneHash" TEXT NOT NULL,
  "deviceId" TEXT,
  "ip24" TEXT,
  "channel" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedAt" TIMESTAMP(3),
  CONSTRAINT "OtpRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OtpRequest_phoneHash_createdAt_idx" ON "OtpRequest"("phoneHash", "createdAt");
CREATE INDEX IF NOT EXISTS "OtpRequest_deviceId_createdAt_idx" ON "OtpRequest"("deviceId", "createdAt");

CREATE TABLE IF NOT EXISTS "FixedCost" (
  "id" TEXT NOT NULL,
  "month" TIMESTAMP(3) NOT NULL,
  "item" TEXT NOT NULL,
  "amountPaise" INTEGER NOT NULL,
  CONSTRAINT "FixedCost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MarketingSpend" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "channel" TEXT NOT NULL,
  "campaign" TEXT NOT NULL,
  "amountPaise" INTEGER NOT NULL,
  CONSTRAINT "MarketingSpend_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Campaign" (
  "id" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3),
  CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BudgetLimit" (
  "category" TEXT NOT NULL,
  "monthlyPaise" INTEGER NOT NULL,
  "alertAt" JSONB NOT NULL,
  CONSTRAINT "BudgetLimit_pkey" PRIMARY KEY ("category")
);
