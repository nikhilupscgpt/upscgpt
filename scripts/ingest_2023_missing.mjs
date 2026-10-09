import fs from 'fs';
import readline from 'readline';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subjectMap = {
  'International Relations': 'Indian Polity',
  'Miscellaneous': 'Modern History',
};

const topicMap = {
  'Indian Polity': {
    'International Agreements & Institutions': 'International Organisations & Relations',
    'West Asia': 'International Organisations & Relations',
  },
  'Geography': {
    'Mapping (Places in News)': 'World Geography & Places',
  },
  'Modern History': {
    'Sports & Awards': 'Personalities, Press & Culture',
  },
};

async function main() {
  const filePath = '/Users/nikhilwandhe/Downloads/upsc_2023_missing_pyq.jsonl';
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  // Ensure ingestion run
  let run = await prisma.ingestionRun.findFirst();
  if (!run) {
    const doc = await prisma.sourceDocument.create({
      data: {
        fileName: 'upsc_2023_missing_pyq.jsonl',
        fileHash: 'upsc_2023_missing_v1',
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
  console.log(`Processing ${lines.length} missing questions from 2023...`);

  // Also save a copy to pyq_data
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
    const embedOpts = q.options.map(o => `(${o.label}) ${o.text}`).join('\n');
    const embedText = `${subj} | ${topic} | UPSC CSE Pre 2023\nQuestion: ${q.stem}\n${embedOpts}\nAnswer: (${q.correctLabel})`;

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
          examYear: 2023,
          paper: 'GS1',
          questionNo: q.questionNo,
          stem: q.stem,
          options: q.options,
          correctLabel: q.correctLabel,
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
          srcSubject: subj,
          srcTopic: topic,
          questionNo: q.questionNo,
        }
      });
      updated++;
    }
  }

  // Save to pyq_data/upsc_2023_missing_pyq.jsonl
  fs.writeFileSync(
    'pyq_data/upsc_2023_missing_pyq.jsonl',
    normalizedRows.map(r => JSON.stringify(r)).join('\n') + '\n'
  );

  console.log(`Ingestion into QuestionDraft complete: ${inserted} inserted, ${updated} updated.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
