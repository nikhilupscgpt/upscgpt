const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const domains = await prisma.issue.groupBy({
    by: ['domain'],
    _count: { _all: true }
  });
  console.log('--- ACTUAL DOMAINS IN DB ---');
  console.log(JSON.stringify(domains, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
