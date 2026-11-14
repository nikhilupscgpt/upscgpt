-- Present Mode v1 Phase 3: InkLayer and Snapshot tables
CREATE TABLE IF NOT EXISTS "InkLayer" (
    "facultyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "board" TEXT NOT NULL DEFAULT 'none',
    "strokes" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InkLayer_pkey" PRIMARY KEY ("facultyId","questionId","step","board")
);

CREATE INDEX IF NOT EXISTS "InkLayer_facultyId_questionId_idx" ON "InkLayer"("facultyId", "questionId");

CREATE TABLE IF NOT EXISTS "Snapshot" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sessionId" TEXT,
    "imageRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Snapshot_facultyId_questionId_idx" ON "Snapshot"("facultyId", "questionId");
