import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

const bridgingFilePath = path.resolve('./data/economy_node_bridging.json');

async function main() {
  console.log('--- Applying Indian Economy Bridging JSON to Database ---');
  if (!fs.existsSync(bridgingFilePath)) {
    throw new Error(`File not found: ${bridgingFilePath}`);
  }

  const raw = fs.readFileSync(bridgingFilePath, 'utf8');
  const data = JSON.parse(raw);

  console.log(`Loaded ${data.nodes?.length} existing nodes and ${data.newNodesToCreate?.length} new nodes.`);

  // 1. Update 40 existing nodes with prelimsNote
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
  console.log(`✅ Successfully updated ${updatedCount} existing Economy nodes with high-yield prelims notes.`);

  // 2. Create the 12 new nodes
  let createdCount = 0;
  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

  for (const newNode of data.newNodesToCreate || []) {
    const slug = slugify(newNode.title);
    const existing = await prisma.issue.findUnique({ where: { slug } });
    const formattedNote = Array.isArray(newNode.prelimsNote)
      ? newNode.prelimsNote.map(p => `• ${p}`).join('\n\n')
      : (typeof newNode.prelimsNote === 'string' ? newNode.prelimsNote : '');

    const targetOrderIndex = newNode.syllabusOrder ? Math.round(Number(newNode.syllabusOrder) * 100) : 1500;

    if (!existing) {
      await prisma.issue.create({
        data: {
          title: newNode.title,
          slug,
          domain: 'INDIAN ECONOMY',
          topic: newNode.module || 'Economy',
          category: 'ECONOMY',
          nodeType: newNode.nodeType || 'CONCEPTUAL',
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

  // 3. Build canonical topic-to-order map for Economy
  const topicOrderMap = {};
  const topicModuleMap = {
    'Basic Economic Concepts': 'Macro Foundations',
    'National Income & Growth': 'Macro Foundations',
    'Inflation': 'Macro Foundations',
    'Planning': 'Macro Foundations',
    'Poverty, Unemployment & Human Development': 'Macro Foundations',
    'Banking & RBI': 'Money & Finance',
    'Monetary Policy': 'Money & Finance',
    'Capital Markets & Financial Instruments': 'Money & Finance',
    'Fiscal Policy & Budget': 'Government & Trade',
    'Taxation & GST': 'Government & Trade',
    'Balance of Payments & Exchange Rate': 'Government & Trade',
    'International Economic Organisations & Trade': 'Government & Trade',
    'Foreign Investment': 'Government & Trade',
    'Industry & Infrastructure': 'Sectors & Schemes',
    'Social Sector Schemes': 'Sectors & Schemes',
  };

  const topicsInOrder = [
    'Basic Economic Concepts',
    'National Income & Growth',
    'Inflation',
    'Planning',
    'Poverty, Unemployment & Human Development',
    'Banking & RBI',
    'Monetary Policy',
    'Capital Markets & Financial Instruments',
    'Fiscal Policy & Budget',
    'Taxation & GST',
    'Balance of Payments & Exchange Rate',
    'International Economic Organisations & Trade',
    'Foreign Investment',
    'Industry & Infrastructure',
    'Social Sector Schemes',
  ];

  topicsInOrder.forEach((t, idx) => {
    topicOrderMap[t] = {
      topic: t,
      syllabusOrder: idx + 1,
      module: topicModuleMap[t] || 'General',
    };
  });

  fs.writeFileSync('./data/economy_topic_sequence_map.json', JSON.stringify(topicOrderMap, null, 2));
  console.log(`✅ Saved canonical economy topic sequence map with ${Object.keys(topicOrderMap).length} topics.`);

  console.log('--- Finished Applying Economy Bridging ---');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error applying bridging:', err);
  process.exit(1);
});
