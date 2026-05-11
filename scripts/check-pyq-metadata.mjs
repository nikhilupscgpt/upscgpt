import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name = 'PreviousYearQuestion' AND column_name = 'metadata'");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
