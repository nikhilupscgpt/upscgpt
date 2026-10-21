import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

const bridgingFilePath = path.resolve('./data/modern_history_node_bridging.json');

async function main() {
  console.log('--- Applying Modern History Bridging JSON to Database ---');
  if (!fs.existsSync(bridgingFilePath)) {
    throw new Error(`File not found: ${bridgingFilePath}`);
  }

  const raw = fs.readFileSync(bridgingFilePath, 'utf8');
  const data = JSON.parse(raw);

  console.log(`Loaded ${data.nodes?.length} existing nodes and ${data.newNodesToCreate?.length} new nodes.`);

  // 1. Update 25 existing nodes with prelimsNote
  let updatedCount = 0;
  for (const node of data.nodes || []) {
    const { nodeId, prelimsNote, syllabusOrder } = node;
    if (!nodeId) continue;

    const formattedNote = Array.isArray(prelimsNote)
      ? prelimsNote.map(p => `• ${p}`).join('\n\n')
      : (typeof prelimsNote === 'string' ? prelimsNote : '');

    const targetOrderIndex = syllabusOrder ? Math.round(Number(syllabusOrder) * 100) : undefined;

    await prisma.issue.update({
      where: { id: nodeId },
      data: {
        prelimsNote: formattedNote,
        ...(targetOrderIndex ? { orderIndex: targetOrderIndex } : {}),
      }
    });
    updatedCount++;
  }
  console.log(`✅ Successfully updated ${updatedCount} existing Modern History nodes with high-yield prelims notes.`);

  // 2. Create the 11 new nodes
  let createdCount = 0;
  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

  for (const newNode of data.newNodesToCreate || []) {
    const slug = slugify(newNode.title);
    const existing = await prisma.issue.findUnique({ where: { slug } });
    const formattedNote = Array.isArray(newNode.prelimsNote)
      ? newNode.prelimsNote.map(p => `• ${p}`).join('\n\n')
      : (typeof newNode.prelimsNote === 'string' ? newNode.prelimsNote : '');

    const targetOrderIndex = newNode.syllabusOrder ? Math.round(Number(newNode.syllabusOrder) * 100) : 800;

    if (!existing) {
      await prisma.issue.create({
        data: {
          title: newNode.title,
          slug,
          domain: 'MODERN HISTORY',
          topic: newNode.module || 'Modern History',
          category: 'HISTORY',
          nodeType: newNode.nodeType || 'STATIC',
          status: 'ACTIVE',
          orderIndex: targetOrderIndex,
          prelimsNote: formattedNote,
        }
      });
      createdCount++;
      console.log(`   + Created node: ${newNode.title} (slug: ${slug})`);
    } else {
      await prisma.issue.update({
        where: { id: existing.id },
        data: {
          prelimsNote: formattedNote,
          orderIndex: targetOrderIndex,
        }
      });
      console.log(`   ~ Updated already existing node: ${newNode.title}`);
    }
  }
  console.log(`✅ Successfully created/updated ${createdCount} new syllabus nodes.`);

  // 3. Build canonical topic-to-order map for Modern History
  const topicOrderMap = {};
  const topicModuleMap = {
    'Advent of Europeans & British Expansion': 'Foundations',
    'Revolt of 1857, Tribal & Peasant Movements': 'Foundations',
    'Socio-Religious Reform Movements': 'Reform & Nationalism',
    'Early Nationalism & Congress (1885-1919)': 'Reform & Nationalism',
    'Gandhian Era & Mass Movements (1915-1947)': 'Reform & Nationalism',
    'Constitutional & Administrative Developments': 'Governance & People',
    'Personalities, Press & Culture': 'Governance & People',
    'Miscellaneous': 'Governance & People',
  };

  const topicsInOrder = [
    'Advent of Europeans & British Expansion',
    'Revolt of 1857, Tribal & Peasant Movements',
    'Socio-Religious Reform Movements',
    'Early Nationalism & Congress (1885-1919)',
    'Gandhian Era & Mass Movements (1915-1947)',
    'Constitutional & Administrative Developments',
    'Personalities, Press & Culture',
    'Miscellaneous',
  ];

  topicsInOrder.forEach((t, idx) => {
    topicOrderMap[t] = {
      topic: t,
      syllabusOrder: idx + 1,
      module: topicModuleMap[t] || 'General',
    };
  });

  fs.writeFileSync('./data/modern_history_topic_sequence_map.json', JSON.stringify(topicOrderMap, null, 2));
  console.log(`✅ Saved canonical Modern History topic sequence map with ${Object.keys(topicOrderMap).length} topics.`);

  console.log('--- Finished Applying Modern History Bridging ---');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error applying bridging:', err);
  process.exit(1);
});
