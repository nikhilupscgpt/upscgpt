import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const TARGETS = [
  { slug: 'origin-of-universe', newIndex: 20 },
  { slug: 'big-bang-theory', newIndex: 21 },
  { slug: 'theories-of-origin', newIndex: 22 },
  { slug: 'origin-and-evolution-of-earth-2', newIndex: 23 },
  { slug: 'geological-time-scale-1777822669981-0', newIndex: 24 },
  { slug: 'internal-structure-of-earth-plate-tectonics', newIndex: 25 },
];

async function main() {
  console.log('Starting Geography Syllabus Node reindexing...');
  try {
    for (const target of TARGETS) {
      const issue = await prisma.issue.findUnique({
        where: { slug: target.slug }
      });

      if (!issue) {
        console.warn(`[Warning] Could not find issue with slug: ${target.slug}`);
        continue;
      }

      const updated = await prisma.issue.update({
        where: { id: issue.id },
        data: { orderIndex: target.newIndex },
        select: { id: true, title: true, orderIndex: true }
      });

      console.log(`Successfully updated: "${updated.title}" -> orderIndex: ${updated.orderIndex}`);
    }
    console.log('Reindexing finished successfully!');
  } catch (error) {
    console.error('Error during reindexing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
