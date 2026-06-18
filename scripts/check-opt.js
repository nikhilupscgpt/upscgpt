import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.optionalSubject.findMany();
  console.log("Optional Subjects in Database:");
  console.dir(subjects, { depth: null });
  await prisma.$disconnect();
}

main();
