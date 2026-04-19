const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const article = await prisma.newsArticle.findFirst({
    orderBy: { id: 'desc' },
    include: { facts: true }
  });
  console.log(JSON.stringify(article, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
