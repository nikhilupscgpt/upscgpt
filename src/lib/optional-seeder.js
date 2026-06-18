import { GEOGRAPHY_SYLLABUS } from './syllabus-data.js';
import prisma from './prisma.js';


export async function seedOptionalSyllabus(optionalSlug, optionalId) {
  const domain = `OPTIONAL_${optionalSlug.toUpperCase()}`;
  
  // Check if we already have nodes for this optional
  const count = await prisma.issue.count({
    where: { domain }
  });
  if (count > 0) return; // Already seeded

  // If it is geography, seed it from syllabus-data
  if (optionalSlug === 'geography') {
    console.log(`[Seeder] Seeding Geography Optional syllabus tree...`);
    const syllabus = GEOGRAPHY_SYLLABUS['en']; // Seed English as primary
    if (!syllabus) return;

    let orderIndex = 0;
    for (const paperKey of ['paper1', 'paper2']) {
      const paperData = syllabus[paperKey];
      // Create Paper Node
      const paperNode = await prisma.issue.create({
        data: {
          title: paperData.title,
          slug: `geography-${paperKey}`,
          domain,
          topic: paperKey === 'paper1' ? 'Paper I' : 'Paper II',
          category: 'OPTIONAL',
          orderIndex: orderIndex++
        }
      });

      for (const sectionKey of Object.keys(paperData.sections)) {
        const sectionData = paperData.sections[sectionKey];
        // Create Section Node
        const sectionNode = await prisma.issue.create({
          data: {
            title: sectionData.title,
            slug: `geography-${paperKey}-${sectionKey}`,
            domain,
            topic: sectionData.title,
            category: 'OPTIONAL',
            parentIssueId: paperNode.id,
            orderIndex: orderIndex++
          }
        });

        for (const topic of sectionData.topics) {
          // Create Topic Node
          const topicNode = await prisma.issue.create({
            data: {
              title: topic.title,
              slug: `geography-${paperKey}-${sectionKey}-${topic.id}`,
              domain,
              topic: topic.title,
              category: 'OPTIONAL',
              parentIssueId: sectionNode.id,
              orderIndex: orderIndex++
            }
          });

          for (let i = 0; i < topic.subtopics.length; i++) {
            const subtopicText = topic.subtopics[i];
            
            // Clean slug to avoid duplicate key violations or special character issues
            const cleanSubtopicText = subtopicText
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            const subtopicSlug = `geography-${paperKey}-${sectionKey}-${topic.id}-${cleanSubtopicText.slice(0, 50)}-${i}`;

            // Create Subtopic Node
            await prisma.issue.create({
              data: {
                title: subtopicText,
                slug: subtopicSlug,
                domain,
                topic: topic.title,
                category: 'OPTIONAL',
                parentIssueId: topicNode.id,
                orderIndex: orderIndex++
              }
            });
          }
        }
      }
    }
    console.log(`[Seeder] Seeded Geography Optional syllabus tree.`);
  }
}
