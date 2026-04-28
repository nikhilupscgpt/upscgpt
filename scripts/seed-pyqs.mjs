import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const pyqDataPath = path.join(process.cwd(), 'scripts', 'pyqs_geography.json');
  const pyqs = JSON.parse(fs.readFileSync(pyqDataPath, 'utf-8'));

  console.log(`Seeding ${pyqs.length} PYQs...`);

  for (const pyq of pyqs) {
    try {
      // Find matching issue by title similarity or slug if possible
      // For now, we'll just seed them and later link them via embeddings
      await prisma.previousYearQuestion.create({
        data: {
          paper: pyq.paper,
          year: pyq.year,
          subject: pyq.subject,
          marks: pyq.marks,
          questionText: pyq.question,
          // We can add logic here to link to an Issue if we want,
          // but vector search is better for this.
        }
      });
    } catch (err) {
      console.error(`Failed to seed PYQ: ${pyq.question.substring(0, 30)}...`, err.message);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
