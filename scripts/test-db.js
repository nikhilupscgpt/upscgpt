import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Attempting to connect to database...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Connection successful:', result);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
