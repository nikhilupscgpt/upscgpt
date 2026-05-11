import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRawUnsafe("SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE event_object_table = 'PreviousYearQuestion'");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
