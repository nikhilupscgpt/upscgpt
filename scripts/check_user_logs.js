import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userLogs = await prisma.actionLog.findMany({
    where: { userId: { not: null } },
    include: { user: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('User Action Logs:', JSON.stringify(userLogs, null, 2));
  
  const totalUserLogs = await prisma.actionLog.count({
    where: { userId: { not: null } }
  });
  console.log('Total User Logs:', totalUserLogs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
