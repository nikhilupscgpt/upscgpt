import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

const bridgingFilePath = path.resolve('./data/medieval_history_node_bridging.json');

async function main() {
  console.log('--- Applying Medieval History Bridging JSON to Database ---');
  if (!fs.existsSync(bridgingFilePath)) {
    throw new Error(`File not found: ${bridgingFilePath}`);
  }

  const raw = fs.readFileSync(bridgingFilePath, 'utf8');
  const data = JSON.parse(raw);

  console.log(`Loaded ${data.newNodesToCreate?.length} nodes to create for Medieval History.`);

  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

  let processedCount = 0;
  for (const newNode of data.newNodesToCreate || []) {
    const slug = slugify(newNode.title);
    const existing = await prisma.issue.findUnique({ where: { slug } });
    const formattedNote = Array.isArray(newNode.prelimsNote)
      ? newNode.prelimsNote.map(p => `• ${p}`).join('\n\n')
      : (typeof newNode.prelimsNote === 'string' ? newNode.prelimsNote : '');

    const targetOrderIndex = newNode.syllabusOrder ? Math.round(Number(newNode.syllabusOrder) * 100) : 500;

    if (!existing) {
      await prisma.issue.create({
        data: {
          title: newNode.title,
          slug,
          domain: 'MEDIEVAL HISTORY',
          topic: newNode.topic || 'Medieval History',
          category: 'HISTORY',
          nodeType: newNode.nodeType || 'STATIC',
          status: 'ACTIVE',
          orderIndex: targetOrderIndex,
          prelimsNote: formattedNote,
        }
      });
      console.log(`   + Created node: ${newNode.title} (slug: ${slug})`);
    } else {
      await prisma.issue.update({
        where: { id: existing.id },
        data: {
          domain: 'MEDIEVAL HISTORY',
          topic: newNode.topic || 'Medieval History',
          prelimsNote: formattedNote,
          orderIndex: targetOrderIndex,
        }
      });
      console.log(`   ~ Updated already existing node: ${newNode.title}`);
    }
    processedCount++;
  }
  console.log(`✅ Successfully processed ${processedCount} Medieval History syllabus nodes.`);

  // Canonical topic-to-order map for Medieval History
  const topicOrderMap = {};
  const topicModuleMap = {
    'Early Medieval Kingdoms': 'Early Medieval & Sultanate',
    'Delhi Sultanate': 'Early Medieval & Sultanate',
    'Vijayanagara & Bahmani': 'Deccan & Regional States',
    'Marathas & Regional States': 'Deccan & Regional States',
    'Mughal Empire': 'The Mughal Era',
    'Medieval History – General': 'General & Survey',
  };

  const topicsInOrder = [
    'Early Medieval Kingdoms',
    'Delhi Sultanate',
    'Vijayanagara & Bahmani',
    'Marathas & Regional States',
    'Mughal Empire',
    'Medieval History – General',
  ];

  topicsInOrder.forEach((t, idx) => {
    topicOrderMap[t] = {
      topic: t,
      syllabusOrder: idx + 1,
      module: topicModuleMap[t] || 'General',
    };
  });

  fs.writeFileSync('./data/medieval_history_topic_sequence_map.json', JSON.stringify(topicOrderMap, null, 2));
  console.log(`✅ Saved canonical Medieval History topic sequence map with ${Object.keys(topicOrderMap).length} topics.`);

  console.log('--- Finished Applying Medieval History Bridging ---');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error applying bridging:', err);
  process.exit(1);
});
