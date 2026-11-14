-- Present Mode v1 Phase 4: PresenterPrefs and BrandingSettings
CREATE TABLE IF NOT EXISTS "PresenterPrefs" (
    "facultyId" TEXT NOT NULL,
    "defaultTool" TEXT NOT NULL DEFAULT 'select',
    "rememberLastTool" BOOLEAN NOT NULL DEFAULT false,
    "recordTheme" TEXT NOT NULL DEFAULT 'light',
    "countdown" BOOLEAN NOT NULL DEFAULT true,
    "pauseCue" BOOLEAN NOT NULL DEFAULT true,
    "toolbarPosition" TEXT NOT NULL DEFAULT 'bottom',
    "webcamCorner" TEXT NOT NULL DEFAULT 'bottom-right',
    "webcamSize" TEXT NOT NULL DEFAULT 'm',
    "fontScale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "toolSettings" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresenterPrefs_pkey" PRIMARY KEY ("facultyId")
);

CREATE TABLE IF NOT EXISTS "BrandingSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "logoLightRef" TEXT NOT NULL DEFAULT '/logo-light.png',
    "logoDarkRef" TEXT NOT NULL DEFAULT '/logo-dark.png',
    "showUrl" BOOLEAN NOT NULL DEFAULT true,
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "heightPct" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
    "corner" TEXT NOT NULL DEFAULT 'top-right',
    "facultyLabel" BOOLEAN NOT NULL DEFAULT true,
    "facultyLabelSec" INTEGER NOT NULL DEFAULT 5,
    "openingCard" BOOLEAN NOT NULL DEFAULT true,
    "openingSec" INTEGER NOT NULL DEFAULT 3,
    "closingCard" BOOLEAN NOT NULL DEFAULT true,
    "closingText" TEXT NOT NULL DEFAULT 'Practise all PYQs free at upscgpt.in',
    "closingSec" INTEGER NOT NULL DEFAULT 10,
    "facultyMayToggleCards" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandingSettings_pkey" PRIMARY KEY ("id")
);
