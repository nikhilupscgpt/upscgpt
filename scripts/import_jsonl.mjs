import fs from 'fs';
import readline from 'readline';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importJsonl(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`\n🚀 Starting streaming ingestion for: ${filePath}`);

    // Ensure we have an ingestion run and document
    let run = await prisma.ingestionRun.findFirst();
    if (!run) {
        const doc = await prisma.sourceDocument.create({
            data: {
                fileName: 'upsc_cds_polity_rag.jsonl',
                fileHash: 'rag_jsonl_v1',
                storageUrl: 'local',
                kind: 'QUESTION_PAPER',
                uploadedBy: 'admin'
            }
        });
        run = await prisma.ingestionRun.create({
            data: { documentId: doc.id, status: 'DONE', model: 'rag_jsonl' }
        });
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    let created = 0;
    let skipped = 0;

    for await (const line of rl) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
            const q = JSON.parse(trimmed);
            count++;

            const dedupHash = q.id || `${q.examYear}_${q.questionNo}_${q.stem}`.toLowerCase().replace(/\s+/g, '');

            const existing = await prisma.questionDraft.findFirst({
                where: { dedupHash }
            });

            if (!existing) {
                await prisma.questionDraft.create({
                    data: {
                        runId: run.id,
                        documentId: run.documentId,
                        rawText: trimmed,
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
                created++;
            } else {
                skipped++;
            }

            if (count % 50 === 0) {
                console.log(`Processed ${count} questions... (Created: ${created}, Skipped: ${skipped})`);
            }
        } catch (err) {
            console.error(`Error parsing line ${count}:`, err.message);
        }
    }

    console.log(`\n🎉 Ingestion complete for ${filePath}!`);
    console.log(`Total read: ${count} | Newly inserted: ${created} | Already existing: ${skipped}`);
}

async function main() {
    const files = process.argv.slice(2);
    if (files.length === 0) {
        console.log("Usage: node scripts/import_jsonl.mjs <file1.jsonl> [file2.jsonl ...]");
        process.exit(1);
    }

    for (const f of files) {
        await importJsonl(f);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
