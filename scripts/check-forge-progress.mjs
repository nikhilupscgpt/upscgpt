import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.issue.count();
  const done = await prisma.issue.count({ where: { mainsNote: { not: null } } });
  console.log(`Progress: ${done}/${total} nodes (${Math.round((done / total) * 100)}%)`);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
