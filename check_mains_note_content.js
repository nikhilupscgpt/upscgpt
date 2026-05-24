import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const issues = await prisma.issue.findMany({
      select: {
        title: true,
        mainsNote: true
      }
    });

    const issuesWithMainsNote = issues.filter(i => i.mainsNote !== null);

    console.log("Issues with mainsNote (non-null):", issuesWithMainsNote.length);
    issuesWithMainsNote.slice(0, 3).forEach(i => {
      console.log("\n----------------");
      console.log("Issue Title:", i.title);
      console.log("mainsNote type:", typeof i.mainsNote);
      console.log("mainsNote keys:", Object.keys(i.mainsNote));
      console.log("mainsNote sample content:", JSON.stringify(i.mainsNote).slice(0, 500));
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
