import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allIssues = await prisma.issue.findMany({
    select: { id: true, metadata: true, title: true, domain: true }
  });
  const missing = allIssues.filter(i => !i.metadata);
  console.log(`Found ${missing.length} issues missing metadata.`);
  if (missing.length > 0) {
    console.log('First 5 missing:', missing.slice(0, 5));
  }
}

main().finally(() => prisma.$disconnect());
