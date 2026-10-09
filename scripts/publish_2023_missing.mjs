import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ids = [
    'AGR-UPSC-2023-03', 'ECO-UPSC-2023-19', 'POL-UPSC-2023-14',
    'ENV-UPSC-2023-14', 'POL-UPSC-2023-15', 'GEO-UPSC-2023-19',
    'GEO-UPSC-2023-20', 'ENV-UPSC-2023-15', 'MOD-UPSC-2023-02',
    'MOD-UPSC-2023-03', 'IR-UPSC-2023-01', 'GEO-UPSC-2023-21',
    'IR-UPSC-2023-02', 'MISC-UPSC-2023-01', 'MISC-UPSC-2023-02',
    'GEO-UPSC-2023-22', 'SCT-UPSC-2023-10'
  ];

  const drafts = await prisma.questionDraft.findMany({
    where: { dedupHash: { in: ids } }
  });

  console.log(`Found ${drafts.length} drafts to publish...`);

  let count = 0;
  for (const draft of drafts) {
    let subjectId = null;
    if (draft.srcSubject) {
      const slug = draft.srcSubject.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const subject = await prisma.subject.upsert({
        where: { paper_slug: { paper: draft.paper || 'GS1', slug } },
        update: {},
        create: {
          name: draft.srcSubject,
          slug,
          paper: draft.paper || 'GS1',
        }
      });
      subjectId = subject.id;
    }

    let topicId = null;
    if (subjectId && draft.srcTopic) {
      const slug = draft.srcTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const topic = await prisma.topic.upsert({
        where: { subjectId_slug: { subjectId, slug } },
        update: {},
        create: {
          name: draft.srcTopic,
          slug,
          subjectId
        }
      });
      topicId = topic.id;
    }

    await prisma.question.upsert({
      where: { dedupHash: draft.dedupHash },
      update: {
        stem: draft.stem,
        options: draft.options,
        correctLabel: draft.correctLabel,
        examName: draft.examName || 'UPSC CSE Pre',
        examYear: draft.examYear,
        questionNo: draft.questionNo,
        subjectId,
        topicId
      },
      create: {
        origin: 'PYQ',
        status: 'PUBLISHED',
        examName: draft.examName || 'UPSC CSE Pre',
        examYear: draft.examYear,
        paper: draft.paper || 'GS1',
        questionNo: draft.questionNo,
        stem: draft.stem,
        options: draft.options,
        correctLabel: draft.correctLabel,
        subjectId,
        topicId,
        dedupHash: draft.dedupHash
      }
    });

    await prisma.questionDraft.update({
      where: { id: draft.id },
      data: { status: 'PUBLISHED' }
    });
    count++;
  }

  console.log(`Successfully published all ${count} missing 2023 questions!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
