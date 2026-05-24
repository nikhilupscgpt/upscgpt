import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const issue = await prisma.issue.findFirst({
      where: { slug: 'origin-and-evolution-of-earth' }
    });

    if (!issue) {
      console.log('Issue not found');
      return;
    }

    console.log('--- TYPES AND SAMPLES ---');
    console.log('prelimsNote Type:', typeof issue.prelimsNote);
    console.log('prelimsNote Sample:', typeof issue.prelimsNote === 'string' ? issue.prelimsNote.slice(0, 200) : JSON.stringify(issue.prelimsNote)?.slice(0, 200));
    console.log('mainsNote Type:', typeof issue.mainsNote);
    console.log('mainsNote Sample:', typeof issue.mainsNote === 'string' ? issue.mainsNote.slice(0, 200) : JSON.stringify(issue.mainsNote)?.slice(0, 200));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
