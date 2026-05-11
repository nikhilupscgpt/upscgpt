import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const articleCount = await prisma.article.count();
  const editorialCount = await prisma.editorial.count();
  const pendingArticles = await prisma.article.count({ where: { status: 'PENDING' } });
  const doneArticles = await prisma.article.count({ where: { status: 'DONE' } });
  
  console.log('--- News Engine Status ---');
  console.log(`Articles: ${articleCount} total (${doneArticles} processed, ${pendingArticles} pending)`);
  console.log(`Editorials: ${editorialCount} total`);
}

main().finally(() => prisma.$disconnect());
