import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRawUnsafe("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'update_pyq_search_vector'");
    console.log(res[0]?.routine_definition);
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
