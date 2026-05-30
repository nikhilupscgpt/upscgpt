import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("=== Fetching Recent Action Logs ===");
    const logs = await prisma.actionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    logs.forEach((log, idx) => {
      console.log(`\nLog #${idx + 1}:`);
      console.log(`  Action: ${log.action}`);
      console.log(`  Entity Type: ${log.entityType}`);
      console.log(`  Entity ID: ${log.entityId}`);
      console.log(`  Status: ${log.status}`);
      console.log(`  Message: ${log.message}`);
      console.log(`  Created At: ${log.createdAt}`);
    });

  } catch (e) {
    console.error("Database query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
