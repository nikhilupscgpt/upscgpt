import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking DB Connection...");
    const count = await prisma.issue.count();
    console.log("SUCCESS: Issue Count =", count);
    
    const sample = await prisma.issue.findFirst({ select: { id: true, title: true, nodeType: true } });
    console.log("SAMPLE NODE:", sample);
  } catch (err) {
    console.error("DATABASE CRITICAL FAILURE:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
