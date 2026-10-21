import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

const bridgingFilePath = path.resolve('./data/agriculture_node_bridging.json');

async function main() {
  console.log('--- Applying Agriculture Bridging JSON to Database ---');
  if (!fs.existsSync(bridgingFilePath)) {
    throw new Error(`File not found: ${bridgingFilePath}`);
  }

  const raw = fs.readFileSync(bridgingFilePath, 'utf8');
  const data = JSON.parse(raw);

  console.log(`Loaded ${data.nodes?.length} existing nodes and ${data.newNodesToCreate?.length} new nodes.`);

  // 1. Update existing 25 nodes
  let updatedCount = 0;
  for (const node of data.nodes || []) {
    const { nodeId, prelimsNote, syllabusOrder, topic } = node;
    if (!nodeId) continue;

    let formattedNote = '';
    if (Array.isArray(prelimsNote)) {
      formattedNote = prelimsNote.map(p => `• ${p}`).join('\n\n');
    } else if (typeof prelimsNote === 'string') {
      formattedNote = prelimsNote;
    } else if (prelimsNote && typeof prelimsNote === 'object') {
      // If legacy JSON object, format into markdown
      formattedNote = Object.entries(prelimsNote)
        .map(([k, v]) => `### ${k.replace(/_/g, ' ').toUpperCase()}\n${typeof v === 'object' ? JSON.stringify(v, null, 2) : v}`)
        .join('\n\n');
    }

    const targetOrderIndex = syllabusOrder ? Math.round(Number(syllabusOrder) * 100) : undefined;

    await prisma.issue.update({
      where: { id: nodeId },
      data: {
        prelimsNote: formattedNote,
        ...(topic ? { topic } : {}),
        ...(targetOrderIndex ? { orderIndex: targetOrderIndex } : {}),
      }
    });
    updatedCount++;
  }
  console.log(`✅ Successfully updated ${updatedCount} existing Agriculture nodes with high-yield prelims notes.`);

  // 2. Create the new nodes
  let createdCount = 0;
  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

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
          domain: 'AGRICULTURE',
          topic: newNode.topic || 'Agriculture',
          category: 'AGRICULTURE',
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
          domain: 'AGRICULTURE',
          topic: newNode.topic || 'Agriculture',
          prelimsNote: formattedNote,
          orderIndex: targetOrderIndex,
        }
      });
      console.log(`   ~ Updated already existing node: ${newNode.title}`);
    }
  }
  console.log(`✅ Successfully processed ${createdCount} newly created Agriculture nodes.`);

  // 3. Build canonical topic-to-order map for Agriculture
  const topicOrderMap = {};
  const topicModuleMap = {
    'Soil, Fertilizers & Farming Practices': 'Agronomy & Practices',
    'Major Crops': 'Agronomy & Practices',
    'Cropping Patterns & Systems': 'Agronomy & Practices',
    'Irrigation & Water Management': 'Agronomy & Practices',
    'Agriculture & Economy': 'Agricultural Economics & Policy',
    'Agricultural Pricing & Procurement (MSP)': 'Agricultural Economics & Policy',
    'Agricultural Credit & Schemes': 'Agricultural Economics & Policy',
    'Agricultural Marketing & Trade': 'Agricultural Economics & Policy',
  };

  const topicsInOrder = [
    'Soil, Fertilizers & Farming Practices',
    'Major Crops',
    'Cropping Patterns & Systems',
    'Irrigation & Water Management',
    'Agriculture & Economy',
    'Agricultural Pricing & Procurement (MSP)',
    'Agricultural Credit & Schemes',
    'Agricultural Marketing & Trade',
  ];

  topicsInOrder.forEach((t, idx) => {
    topicOrderMap[t] = {
      topic: t,
      syllabusOrder: idx + 1,
      module: topicModuleMap[t] || 'General',
    };
  });

  fs.writeFileSync('./data/agriculture_topic_sequence_map.json', JSON.stringify(topicOrderMap, null, 2));
  console.log(`✅ Saved canonical Agriculture topic sequence map with ${Object.keys(topicOrderMap).length} topics.`);

  console.log('--- Finished Applying Agriculture Bridging ---');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error applying bridging:', err);
  process.exit(1);
});
