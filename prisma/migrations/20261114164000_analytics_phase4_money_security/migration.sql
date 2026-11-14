-- Phase 4: Order, PaymentEvent, AuditLog (insert-only), UserDevice, UNLOGGED rate_limit_hit

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "amountPaise" INTEGER NOT NULL,
  "listPricePaise" INTEGER NOT NULL,
  "couponCode" TEXT,
  "partnerCode" TEXT,
  "razorpayOrderId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_userId_status_idx" ON "Order"("userId", "status");

CREATE TABLE IF NOT EXISTS "PaymentEvent" (
  "id" TEXT NOT NULL,
  "razorpayEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "orderId" TEXT,
  "userId" TEXT,
  "amountPaise" INTEGER,
  "feePaise" INTEGER,
  "taxOnFeePaise" INTEGER,
  "signatureValid" BOOLEAN NOT NULL,
  "isRenewal" BOOLEAN NOT NULL DEFAULT false,
  "payload" JSONB NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentEvent_razorpayEventId_key" ON "PaymentEvent"("razorpayEventId");
CREATE INDEX IF NOT EXISTS "PaymentEvent_type_receivedAt_idx" ON "PaymentEvent"("type", "receivedAt");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "ip" TEXT,
  "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- Enforce insert-only AuditLog
REVOKE UPDATE, DELETE ON "AuditLog" FROM PUBLIC;

CREATE TABLE IF NOT EXISTS "UserDevice" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "uaFamily" TEXT,
  "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserDevice_userId_deviceId_key" ON "UserDevice"("userId", "deviceId");
CREATE INDEX IF NOT EXISTS "UserDevice_userId_revokedAt_idx" ON "UserDevice"("userId", "revokedAt");

-- Rate-limit UNLOGGED table (replaces ActionLog RL:* rows)
CREATE UNLOGGED TABLE IF NOT EXISTS rate_limit_hit (
  bucket     TEXT NOT NULL,
  key_hash   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rate_limit_hit_lookup_idx ON rate_limit_hit (bucket, key_hash, created_at);
