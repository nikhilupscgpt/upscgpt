import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const issues = await prisma.issue.findMany({
      where: { gsPapers: { has: 'GS1' } },
      select: { domain: true, topic: true, gsPapers: true }
    });

    const domains = [...new Set(issues.map(i => i.domain))];
    console.log("--- ACTUAL GS1 DOMAINS IN DB ---");
    console.log(domains);
    
    const gsCount = {};
    issues.forEach(i => {
       i.gsPapers.forEach(p => {
         gsCount[p] = (gsCount[p] || 0) + 1;
       });
    });
    console.log("\n--- GS DISTRIBUTION ---");
    console.log(gsCount);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
