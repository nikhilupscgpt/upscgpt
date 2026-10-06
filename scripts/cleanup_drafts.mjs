import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const deletedDrafts = await prisma.questionDraft.deleteMany();
    console.log(`Deleted ${deletedDrafts.count} draft questions from the database.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
