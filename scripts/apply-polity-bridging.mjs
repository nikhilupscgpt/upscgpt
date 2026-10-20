import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

const bridgingFilePath = path.resolve('./data/polity_node_bridging.json');

async function main() {
  console.log('--- Applying Polity Bridging JSON to Database ---');
  if (!fs.existsSync(bridgingFilePath)) {
    throw new Error(`File not found: ${bridgingFilePath}`);
  }

  const raw = fs.readFileSync(bridgingFilePath, 'utf8');
  const data = JSON.parse(raw);

  console.log(`Loaded ${data.nodes?.length} existing nodes and ${data.newNodesToCreate?.length} new nodes.`);

  // 1. Update 76 existing nodes with prelimsNote
  let updatedCount = 0;
  for (const node of data.nodes || []) {
    const { nodeId, prelimsNote, orderIndex } = node;
    if (!nodeId) continue;

    const formattedNote = Array.isArray(prelimsNote)
      ? prelimsNote.map(p => `• ${p}`).join('\n\n')
      : (typeof prelimsNote === 'string' ? prelimsNote : '');

    const targetOrderIndex = orderIndex ? Math.round(Number(orderIndex) * 10) : undefined;

    await prisma.issue.update({
      where: { id: nodeId },
      data: {
        prelimsNote: formattedNote,
        ...(targetOrderIndex ? { orderIndex: targetOrderIndex } : {}),
      }
    });
    updatedCount++;
  }
  console.log(`✅ Successfully updated ${updatedCount} existing Polity nodes with high-yield prelims notes.`);

  // 2. Create the 15 new nodes
  let createdCount = 0;
  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

  for (const newNode of data.newNodesToCreate || []) {
    const slug = slugify(newNode.title);
    const existing = await prisma.issue.findUnique({ where: { slug } });
    const formattedNote = Array.isArray(newNode.prelimsNote)
      ? newNode.prelimsNote.map(p => `• ${p}`).join('\n\n')
      : (typeof newNode.prelimsNote === 'string' ? newNode.prelimsNote : '');

    const targetOrderIndex = newNode.orderIndex ? Math.round(Number(newNode.orderIndex) * 10) : 2400;

    if (!existing) {
      await prisma.issue.create({
        data: {
          title: newNode.title,
          slug,
          domain: 'POLITY',
          topic: newNode.module || 'Polity',
          category: 'POLITY',
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

  // 3. Build canonical topic-to-order map for questions
  const topicOrderMap = {};
  let currentRank = 1;

  // Combine and sort all nodes by orderIndex
  const allNodesCombined = [
    ...(data.nodes || []).map(n => ({ ...n, numericOrder: Number(n.orderIndex) })),
    ...(data.newNodesToCreate || []).map(n => ({ ...n, numericOrder: Number(n.orderIndex) })),
  ].sort((a, b) => a.numericOrder - b.numericOrder);

  for (const node of allNodesCombined) {
    for (const t of node.mappedQuestionTopics || []) {
      if (!topicOrderMap[t]) {
        topicOrderMap[t] = {
          topic: t,
          syllabusOrder: currentRank++,
          module: node.module || node.topic,
          nodeTitle: node.title,
        };
      }
    }
  }

  // Handle unmapped topics (e.g. IR or misc)
  for (const [idx, item] of Object.entries(data.topicMappings || {})) {
    if (item.srcTopic && !topicOrderMap[item.srcTopic]) {
      topicOrderMap[item.srcTopic] = {
        topic: item.srcTopic,
        syllabusOrder: currentRank++,
        module: 'Other / Applied',
        nodeTitle: item.nodeTitle || item.srcTopic,
      };
    }
  }

  fs.writeFileSync('./data/polity_topic_sequence_map.json', JSON.stringify(topicOrderMap, null, 2));
  console.log(`✅ Saved canonical topic sequence map with ${Object.keys(topicOrderMap).length} topics.`);

  console.log('--- Finished Applying Polity Bridging ---');
}

main().catch(err => {
  console.error('Error applying bridging:', err);
  process.exit(1);
});
