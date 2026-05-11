import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  try {
    const r = await p.$queryRawUnsafe('SELECT column_name FROM information_schema.columns WHERE table_name = \'PreviousYearQuestion\' AND column_name = \'searchVector\'');
    console.log('PYQ Column exists:', r.length > 0 ? 'YES' : 'NO');
  } catch (e) {
    console.log('Error:', e.message);
  } finally {
    await p.$disconnect();
    process.exit(0);
  }
}

main();
