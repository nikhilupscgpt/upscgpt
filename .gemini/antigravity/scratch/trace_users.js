import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Strategic Audit: Current Session Trace...");
  
  // Since I can't get getServerSession here without a request, 
  // I'll list all users and their last activity.
  const users = await prisma.user.findMany({
    include: {
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  console.log("System Users Trace:");
  users.forEach(u => {
    console.log(`User: ${u.email} | ID: ${u.id} | Tier: ${u.tier} | Last Activity: ${u.logs[0]?.action || 'None'}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
