import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const issues = await prisma.issue.findMany({
    orderBy: { domain: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      domain: true,
      gsPapers: true,
      metadata: true
    }
  });

  const headers = ['id', 'slug', 'title', 'domain', 'gsPapers', 'keyThemes', 'subtopics', 'linkedConcepts', 'pyqAngles', 'examRelevance'];
  const rows = issues.map(n => {
    const meta = n.metadata || {};
    return [
      n.id,
      n.slug,
      n.title,
      n.domain,
      (n.gsPapers || []).join('; '),
      (meta.keyThemes || []).join('; '),
      (meta.subtopics || []).join('; '),
      (meta.linkedConcepts || []).join('; '),
      (meta.pyqAngles || []).join('; '),
      meta.examRelevance || ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync('MASTER_DISCOVERY_NODES.csv', csvContent);
  console.log(`Successfully generated MASTER_DISCOVERY_NODES.csv with ${issues.length} nodes.`);
}

main().finally(() => prisma.$disconnect());
