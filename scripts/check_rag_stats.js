import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.subjectContent.groupBy({
    by: ['subject', 'isOptional'],
    _count: { _all: true }
  });
  console.log('Subject Content Stats:');
  console.table(stats.map(s => ({
    Subject: s.subject,
    IsOptional: s.isOptional,
    Count: s._count._all
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
