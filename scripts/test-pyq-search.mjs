import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const query = 'himalaya';
  try {
    const pyqs = await prisma.$queryRaw`
      SELECT id, "questionText", year, paper
      FROM "PreviousYearQuestion"
      WHERE "searchVector" @@ plainto_tsquery('english', ${query})
      LIMIT 5
    `;
    console.log('PYQ Search Results for "himalaya":');
    console.log(JSON.stringify(pyqs, null, 2));
  } catch (error) {
    console.error('PYQ Search Test Failed:', error.message);
  }
  process.exit(0);
}

main();
