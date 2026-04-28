import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.actionLog.findMany({
    include: { user: true },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Recent Logs:', JSON.stringify(logs, null, 2));
  
  const counts = await prisma.actionLog.count();
  console.log('Total Logs:', counts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
