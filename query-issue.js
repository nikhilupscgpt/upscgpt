import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const issue = await prisma.issue.findUnique({
    where: { slug: 'origin-and-evolution-of-universe' },
    select: {
      id: true,
      title: true,
      prelimsNote: true,
      mainsNote: true,
      prelimsNote_hi: true,
      mainsNote_hi: true,
      prelimsNote_mr: true,
      mainsNote_mr: true,
    }
  });
  console.log(JSON.stringify(issue, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
