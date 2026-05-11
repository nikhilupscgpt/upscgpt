import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Adding tsvector to PreviousYearQuestion...');
    await prisma.$executeRawUnsafe('ALTER TABLE "PreviousYearQuestion" ADD COLUMN IF NOT EXISTS "searchVector" tsvector');
    
    console.log('Creating index for PYQ search...');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "pyq_search_idx" ON "PreviousYearQuestion" USING GIN ("searchVector")');
    
    console.log('Populating PYQ search vector...');
    await prisma.$executeRawUnsafe("UPDATE \"PreviousYearQuestion\" SET \"searchVector\" = to_tsvector('english', coalesce(\"questionText\", ''))");
    
    console.log('PYQ SEARCH INITIALIZED.');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
