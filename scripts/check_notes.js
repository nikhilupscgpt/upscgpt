import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const issuesWithNotes = await prisma.issue.findMany({
    where: {
      OR: [
        { cumulativeSummary: { not: null } },
        { backgroundNote: { not: null } }
      ]
    },
    select: {
      id: true,
      title: true,
      cumulativeSummary: true,
      backgroundNote: true
    }
  });

  console.log("Topics with notes:");
  issuesWithNotes.forEach(issue => {
    const hasSummary = issue.cumulativeSummary && issue.cumulativeSummary.length > 10;
    const hasNote = issue.backgroundNote && issue.backgroundNote.length > 10;
    if (hasSummary || hasNote) {
      console.log(`- ${issue.title} (ID: ${issue.id})`);
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
