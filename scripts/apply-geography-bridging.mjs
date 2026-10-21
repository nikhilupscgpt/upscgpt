import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

const bridgingFilePath = path.resolve('./data/geography_node_bridging.json');

async function main() {
  console.log('--- Applying Geography Bridging JSON to Database ---');
  if (!fs.existsSync(bridgingFilePath)) {
    throw new Error(`File not found: ${bridgingFilePath}`);
  }

  const raw = fs.readFileSync(bridgingFilePath, 'utf8');
  const data = JSON.parse(raw);

  console.log(`Loaded ${data.nodes?.length} existing nodes and ${data.newNodesToCreate?.length} new nodes.`);

  // 1. Update 45 existing nodes with prelimsNote
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
  console.log(`✅ Successfully updated ${updatedCount} existing Geography nodes with high-yield prelims notes.`);

  // 2. Create the 12 new nodes
  let createdCount = 0;
  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

  for (const newNode of data.newNodesToCreate || []) {
    const slug = slugify(newNode.title);
    const existing = await prisma.issue.findUnique({ where: { slug } });
    const formattedNote = Array.isArray(newNode.prelimsNote)
      ? newNode.prelimsNote.map(p => `• ${p}`).join('\n\n')
      : (typeof newNode.prelimsNote === 'string' ? newNode.prelimsNote : '');

    const targetOrderIndex = newNode.syllabusOrder ? Math.round(Number(newNode.syllabusOrder) * 100) : 1100;

    if (!existing) {
      await prisma.issue.create({
        data: {
          title: newNode.title,
          slug,
          domain: 'GEOGRAPHY',
          topic: newNode.module || 'Geography',
          category: 'GEOGRAPHY',
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

  // 3. Build canonical topic-to-order map for Geography
  const topicOrderMap = {};
  const topicModuleMap = {
    'Universe & Solar System': 'Physical',
    'Geomorphology': 'Physical',
    'Climatology': 'Physical',
    'Oceanography': 'Physical',
    'Indian Physiography & Drainage': 'Physical',
    'Soils & Natural Vegetation': 'Physical',
    'Agriculture & Resources': 'Human & Economic',
    'Industry, Transport & Trade': 'Human & Economic',
    'Population & Human Geography': 'Human & Economic',
    'World Geography & Places': 'World',
    'Miscellaneous Geography': 'World',
  };

  const topicsInOrder = [
    'Universe & Solar System',
    'Geomorphology',
    'Climatology',
    'Oceanography',
    'Indian Physiography & Drainage',
    'Soils & Natural Vegetation',
    'Agriculture & Resources',
    'Industry, Transport & Trade',
    'Population & Human Geography',
    'World Geography & Places',
    'Miscellaneous Geography',
  ];

  topicsInOrder.forEach((t, idx) => {
    topicOrderMap[t] = {
      topic: t,
      syllabusOrder: idx + 1,
      module: topicModuleMap[t] || 'General',
    };
  });

  fs.writeFileSync('./data/geography_topic_sequence_map.json', JSON.stringify(topicOrderMap, null, 2));
  console.log(`✅ Saved canonical Geography topic sequence map with ${Object.keys(topicOrderMap).length} topics.`);

  console.log('--- Finished Applying Geography Bridging ---');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error applying bridging:', err);
  process.exit(1);
});
