import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

const bridgingFilePath = path.resolve('./data/scitech_node_bridging.json');

async function main() {
  console.log('--- Applying Science & Technology Bridging JSON to Database ---');
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
  console.log(`✅ Successfully updated ${updatedCount} existing Science & Technology nodes with high-yield prelims notes.`);

  // 2. Create the 11 new nodes
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
          domain: 'SCIENCE & TECHNOLOGY',
          topic: newNode.module || 'Science & Technology',
          category: 'SCIENCE_TECHNOLOGY',
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

  // 3. Build canonical topic-to-order map for Science & Technology
  const topicOrderMap = {};
  const topicModuleMap = {
    'General Science': 'Core Sciences',
    'Physics': 'Core Sciences',
    'Chemistry': 'Core Sciences',
    'Biology': 'Core Sciences',
    'Biotechnology & Genetics': 'Applied Science',
    'Health, Diseases & Medicine': 'Applied Science',
    'Nanotechnology & Materials': 'Applied Science',
    'IT, Communication & Computing': 'Tech & Energy',
    'Space Technology': 'Tech & Energy',
    'Nuclear & Energy Technology': 'Tech & Energy',
    'Defence Technology': 'Tech & Energy',
  };

  const topicsInOrder = [
    'General Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Biotechnology & Genetics',
    'Health, Diseases & Medicine',
    'Nanotechnology & Materials',
    'IT, Communication & Computing',
    'Space Technology',
    'Nuclear & Energy Technology',
    'Defence Technology',
  ];

  topicsInOrder.forEach((t, idx) => {
    topicOrderMap[t] = {
      topic: t,
      syllabusOrder: idx + 1,
      module: topicModuleMap[t] || 'General',
    };
  });

  fs.writeFileSync('./data/scitech_topic_sequence_map.json', JSON.stringify(topicOrderMap, null, 2));
  console.log(`✅ Saved canonical Science & Technology topic sequence map with ${Object.keys(topicOrderMap).length} topics.`);

  console.log('--- Finished Applying Science & Technology Bridging ---');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error applying bridging:', err);
  process.exit(1);
});
