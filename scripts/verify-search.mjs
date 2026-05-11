import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const query = 'economy';
  try {
    const nodes = await prisma.$queryRaw`
      SELECT id, title, slug
      FROM "Issue"
      WHERE "searchVector" @@ plainto_tsquery('english', ${query})
      LIMIT 5
    `;
    console.log('Search Results for "economy":');
    console.log(JSON.stringify(nodes, null, 2));
  } catch (error) {
    console.error('Search Test Failed:', error.message);
  }
  process.exit(0);
}

main();
