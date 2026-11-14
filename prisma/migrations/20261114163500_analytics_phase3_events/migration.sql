-- Phase 3: Partitioned event_raw table, AnonProfile, and User attribution fields

-- 1. User attribution columns
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "firstTouchSource" TEXT,
  ADD COLUMN IF NOT EXISTS "firstTouchMedium" TEXT,
  ADD COLUMN IF NOT EXISTS "firstTouchCampaign" TEXT,
  ADD COLUMN IF NOT EXISTS "firstTouchContent" TEXT,
  ADD COLUMN IF NOT EXISTS "firstTouchReferrer" TEXT,
  ADD COLUMN IF NOT EXISTS "firstTouchLanding" TEXT,
  ADD COLUMN IF NOT EXISTS "firstTouchPartner" TEXT,
  ADD COLUMN IF NOT EXISTS "lastTouchSource" TEXT;

-- 2. AnonProfile
CREATE TABLE IF NOT EXISTS "AnonProfile" (
  "anonId" TEXT NOT NULL,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "utmContent" TEXT,
  "referrer" TEXT,
  "landingPath" TEXT,
  "partnerCode" TEXT,
  "userId" TEXT,
  CONSTRAINT "AnonProfile_pkey" PRIMARY KEY ("anonId")
);

-- 3. Partitioned event_raw (kept 90 days; monthly RANGE partitions)
CREATE TABLE IF NOT EXISTS event_raw (
  event_id    uuid        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  client_ts   timestamptz,
  name        text        NOT NULL,
  user_id     text,
  anon_id     text        NOT NULL,
  session_id  text        NOT NULL,
  tier        text,
  module      text,
  entity_type text,
  entity_id   text,
  props       jsonb       NOT NULL DEFAULT '{}',
  device      text,
  ip24        text,
  PRIMARY KEY (created_at, event_id)
) PARTITION BY RANGE (created_at);

CREATE INDEX IF NOT EXISTS event_raw_name_created_at_idx ON event_raw (name, created_at);
CREATE INDEX IF NOT EXISTS event_raw_user_created_at_idx ON event_raw (user_id, created_at);
CREATE INDEX IF NOT EXISTS event_raw_anon_created_at_idx ON event_raw (anon_id, created_at);

-- Current & next month partitions + default safety partition
CREATE TABLE IF NOT EXISTS event_raw_2026_11 PARTITION OF event_raw
  FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS event_raw_2026_12 PARTITION OF event_raw
  FOR VALUES FROM ('2026-12-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS event_raw_default PARTITION OF event_raw DEFAULT;
