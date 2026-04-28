import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Strategic Audit: User & Log Mapping...");
  
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  });
  console.log("Users in DB:", JSON.stringify(users, null, 2));

  const logs = await prisma.actionLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Latest Logs:", JSON.stringify(logs, null, 2));

  if (users.length > 0 && logs.length > 0) {
    const firstLogUserId = logs[0].userId;
    const userExists = users.some(u => u.id === firstLogUserId);
    console.log(`Match Check: Log User ID (${firstLogUserId}) exists in User table? ${userExists}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
