/**
 * One-shot script: Reset the streak.living.summary.synthesis prompt override in DB.
 * Run: node scripts/reset-streak-prompt.mjs
 *
 * This removes any custom override stored in platformConfig so that the
 * new clean defaultValue from aiPromptRegistry.js takes effect.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PROMPT_KEY = 'AI_PROMPT__streak.living.summary.synthesis';

async function main() {
  console.log(`\n🔍 Checking for DB override: "${PROMPT_KEY}"...`);

  const existing = await prisma.platformConfig.findUnique({
    where: { key: PROMPT_KEY }
  });

  if (!existing) {
    console.log('✅ No DB override found. The code defaultValue is already active.\n');
    return;
  }

  console.log('⚠️  Found DB override. Preview (first 200 chars):');
  console.log('  ' + (existing.value || '').substring(0, 200) + '...\n');

  await prisma.platformConfig.delete({
    where: { key: PROMPT_KEY }
  });

  console.log('✅ DB override deleted. The new clean prompt defaultValue is now active.\n');
  console.log('Next step: Go to Admin → News Streaks → click "✨ Auto-Synthesize via Gemini AI" on your streak.\n');
}

main()
  .catch(e => {
    console.error('❌ Script failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
