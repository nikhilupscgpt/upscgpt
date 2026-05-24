import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const issuesCount = await prisma.issue.count();
    const articlesCount = await prisma.article.count();
    const editorialsCount = await prisma.editorial.count();
    const pyqLinksCount = await prisma.pYQLink.count();
    const nodeContentsCount = await prisma.nodeContent.count();

    console.log("Issues:", issuesCount);
    console.log("Articles:", articlesCount);
    console.log("Editorials:", editorialsCount);
    console.log("PYQLinks:", pyqLinksCount);
    console.log("NodeContents:", nodeContentsCount);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
