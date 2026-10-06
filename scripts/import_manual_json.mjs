import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

async function main() {
    const file = process.argv[2] || './pyq_data/questions_chunk1.json';
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    let run = await prisma.ingestionRun.findFirst();
    if (!run) {
        const doc = await prisma.sourceDocument.create({
            data: { fileName: 'manual_upload', fileHash: 'manual', storageUrl: 'local', kind: 'QUESTION_PAPER', uploadedBy: 'admin' }
        });
        run = await prisma.ingestionRun.create({
            data: { documentId: doc.id, status: 'DONE', model: 'manual' }
        });
    }

    let saved = 0;
    for (const q of data) {
        const dedupHash = crypto.createHash('md5').update(`${q.examYear}_${q.questionNo}_${q.stem}`.toLowerCase().replace(/\s+/g, '')).digest('hex');
        
        const existing = await prisma.questionDraft.findFirst({
            where: { dedupHash }
        });
        
        if (!existing) {
            await prisma.questionDraft.create({
                data: {
                    runId: run.id,
                    documentId: run.documentId,
                    rawText: JSON.stringify(q),
                    status: 'PENDING',
                    examName: q.examName,
                    examYear: parseInt(q.examYear) || null,
                    questionNo: parseInt(q.questionNo) || null,
                    stem: q.stem,
                    options: q.options,
                    correctLabel: q.correctLabel || null,
                    srcSubject: q.srcSubject || "Indian Polity",
                    srcTopic: q.srcTopic || "General",
                    flags: q.correctLabel ? [] : ["MISSING_ANSWER"],
                    dedupHash
                }
            });
            saved++;
        }
    }
    console.log(`Successfully pushed ${saved} questions to the database!`);
}
main().catch(console.error);
