import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subjectMap = {
  'International Relations': 'Indian Polity',
};

const topicMap = {
  'Geography': {
    'Mapping (Places in News)': 'World Geography & Places',
  },
  'Medieval History': {
    'Bhakti & Sufi Movements': 'Medieval History – General',
  },
};

async function main() {
  const filePath = '/Users/nikhilwandhe/Downloads/upsc_2014_missing_pyq.jsonl';
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  // Ensure ingestion run
  let run = await prisma.ingestionRun.findFirst();
  if (!run) {
    const doc = await prisma.sourceDocument.create({
      data: {
        fileName: 'upsc_2014_missing_pyq.jsonl',
        fileHash: 'upsc_2014_missing_v1',
        storageUrl: 'local',
        kind: 'QUESTION_PAPER',
        uploadedBy: 'admin'
      }
    });
    run = await prisma.ingestionRun.create({
      data: { documentId: doc.id, status: 'DONE', model: 'jsonl_import' }
    });
  }

  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  console.log(`Processing ${lines.length} missing questions from 2014...`);

  // Save copy to pyq_data
  const normalizedRows = [];
  let inserted = 0;
  let updated = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    const q = JSON.parse(line.trim());

    let subj = subjectMap[q.srcSubject] || q.srcSubject;
    let topic = (topicMap[subj] && topicMap[subj][q.srcTopic]) || q.srcTopic;

    const dedupHash = q.id;

    // Build embed text
    const embedOpts = (q.options || []).map(o => `(${o.label}) ${o.text}`).join('\n');
    const embedText = `${subj} | ${topic} | UPSC CSE Pre 2014\nQuestion: ${q.stem}\n${embedOpts}\nAnswer: (${q.correctLabel})`;

    const normalized = {
      ...q,
      srcSubject: subj,
      srcTopic: topic,
      embedText
    };
    normalizedRows.push(normalized);

    const existingDraft = await prisma.questionDraft.findFirst({
      where: { dedupHash }
    });

    if (!existingDraft) {
      await prisma.questionDraft.create({
        data: {
          runId: run.id,
          documentId: run.documentId,
          rawText: JSON.stringify(normalized),
          status: 'PENDING',
          examName: q.examName || 'UPSC CSE Pre',
          examYear: 2014,
          paper: 'GS1',
          questionNo: q.questionNo,
          stem: q.stem,
          options: q.options,
          correctLabel: q.correctLabel,
          explanation: q.explanation || null,
          srcSubject: subj,
          srcTopic: topic,
          flags: [],
          dedupHash
        }
      });
      inserted++;
    } else {
      await prisma.questionDraft.update({
        where: { id: existingDraft.id },
        data: {
          stem: q.stem,
          options: q.options,
          correctLabel: q.correctLabel,
          explanation: q.explanation || null,
          srcSubject: subj,
          srcTopic: topic,
          questionNo: q.questionNo,
        }
      });
      updated++;
    }
  }

  // Save copy to pyq_data
  fs.writeFileSync(
    'pyq_data/upsc_2014_missing_pyq.jsonl',
    normalizedRows.map(r => JSON.stringify(r)).join('\n') + '\n'
  );

  console.log(`Ingestion into QuestionDraft complete: ${inserted} inserted, ${updated} updated.`);

  // Now publish all 2014 missing drafts to Question table
  console.log('Publishing 2014 missing questions to Question table...');
  const draftsToPublish = await prisma.questionDraft.findMany({
    where: { dedupHash: { in: normalizedRows.map(r => r.id) } }
  });

  let published = 0;
  for (const draft of draftsToPublish) {
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
        correctLabel: draft.correctLabel || 'X',
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
        correctLabel: draft.correctLabel || 'X',
        subjectId,
        topicId,
        dedupHash: draft.dedupHash
      }
    });

    await prisma.questionDraft.update({
      where: { id: draft.id },
      data: { status: 'PUBLISHED' }
    });
    published++;
  }

  console.log(`Successfully published ${published} missing 2014 questions!`);

  // Final count check
  const finalDraftCount = await prisma.questionDraft.count({
    where: { examYear: 2014, examName: 'UPSC CSE Pre' }
  });
  const finalQuestionCount = await prisma.question.count({
    where: { examYear: 2014, examName: 'UPSC CSE Pre' }
  });
  console.log(`Final 2014 DB counts: QuestionDraft = ${finalDraftCount}, Question = ${finalQuestionCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
