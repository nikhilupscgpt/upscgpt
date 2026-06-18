import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const optionalId = 'cmpxs56id0000g35mfi11az04'; // Geography
  
  const countEn = await prisma.previousYearQuestion.count({
    where: {
      optionalId: optionalId,
      year: 2025,
      exam: 'MPSC',
      language: 'en'
    }
  });

  const countMr = await prisma.previousYearQuestion.count({
    where: {
      optionalId: optionalId,
      year: 2025,
      exam: 'MPSC',
      language: 'mr'
    }
  });

  console.log(`Verification:`);
  console.log(`- 2025 MPSC Geography (English) Questions: ${countEn}`);
  console.log(`- 2025 MPSC Geography (Marathi) Questions: ${countMr}`);

  // Print a sample to make sure the structure is correct
  const sample = await prisma.previousYearQuestion.findFirst({
    where: {
      optionalId: optionalId,
      year: 2025,
      exam: 'MPSC'
    },
    select: {
      paper: true,
      questionText: true,
      marks: true,
      language: true,
      exam: true,
      metadata: true
    }
  });

  console.log("\nSample Question in DB:");
  console.log(sample);

  await prisma.$disconnect();
}

main();
