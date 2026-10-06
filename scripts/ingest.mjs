import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const fileManager = new GoogleAIFileManager(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: node scripts/ingest.mjs <path-to-pdf>");
        process.exit(1);
    }

    const pdfPath = args[0];
    if (!fs.existsSync(pdfPath)) {
        console.error(`File not found: ${pdfPath}`);
        process.exit(1);
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    let sourceDoc = await prisma.sourceDocument.findUnique({ where: { fileHash } });
    if (!sourceDoc) {
        console.log("Registering new SourceDocument...");
        sourceDoc = await prisma.sourceDocument.create({
            data: {
                fileName: path.basename(pdfPath),
                fileHash,
                storageUrl: 'local',
                kind: 'QUESTION_PAPER',
                uploadedBy: 'admin',
            }
        });
    } else {
        console.log(`Document already exists in database (ID: ${sourceDoc.id}). Continuing ingestion...`);
    }

    const run = await prisma.ingestionRun.create({
        data: {
            documentId: sourceDoc.id,
            status: 'RUNNING',
            model: 'gemini-2.5-flash',
        }
    });

    console.log(`Loading PDF: ${pdfPath}`);
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const totalPages = pdfDoc.getPageCount();
    console.log(`Total pages: ${totalPages}`);

    // CHUNK SIZE: 20 pages to fit a 300 page PDF into ~16 requests
    const CHUNK_SIZE = 20;
    const OVERLAP = 1;
    let extractedItems = [];

    const tempDir = path.join(process.cwd(), 'temp_pdf_chunks');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    for (let start = 0; start < totalPages; start += (CHUNK_SIZE - OVERLAP)) {
        const end = Math.min(start + CHUNK_SIZE, totalPages);
        console.log(`\nProcessing pages ${start + 1} to ${end}...`);

        const chunkDoc = await PDFDocument.create();
        const pageIndices = Array.from({ length: end - start }, (_, i) => start + i);
        const copiedPages = await chunkDoc.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => chunkDoc.addPage(page));

        const chunkPath = path.join(tempDir, `chunk_${start + 1}_to_${end}.pdf`);
        fs.writeFileSync(chunkPath, await chunkDoc.save());

        console.log("Uploading chunk to Gemini API...");
        const uploadResponse = await fileManager.uploadFile(chunkPath, {
            mimeType: 'application/pdf',
            displayName: `Chunk ${start + 1} to ${end}`,
        });
        
        let file = uploadResponse.file;
        console.log(`Uploaded file ${file.uri}. Waiting for processing...`);
        while (file.state === 'PROCESSING') {
            await sleep(2000);
            file = await fileManager.getFile(file.name);
        }

        if (file.state === 'FAILED') {
            console.error("File processing failed.");
            continue;
        }

        console.log("Extracting data via Gemini...");
        const items = await extractWithGemini(file.uri);
        console.log(`Extracted ${items.length} items from chunk.`);
        
        extractedItems.push(...items);

        await fileManager.deleteFile(uploadResponse.file.name);
        fs.unlinkSync(chunkPath);

        console.log("Waiting 5 seconds for rate limit...");
        await sleep(5000);

        if (end >= totalPages) break;
    }

    console.log(`\nFinished extraction. Total items extracted (raw): ${extractedItems.length}`);
    
    await processItems(extractedItems, run.id, sourceDoc.id);

    await prisma.ingestionRun.update({
        where: { id: run.id },
        data: { status: 'DONE', finishedAt: new Date() }
    });

    console.log("Ingestion run completed successfully!");
}

async function extractWithGemini(fileUri) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                description: "Array of extracted questions. We use an array-of-arrays to save tokens. Order MUST be exact.",
                items: {
                    type: SchemaType.ARRAY,
                    description: "A single question represented as an array of 9 strings.",
                    items: { type: SchemaType.STRING }
                }
            }
        }
    });

    const prompt = `
    Analyze the provided PDF document chunk. It contains a list of multiple-choice questions.
    Extract every single complete question you find.
    
    Because this chunk is large, you MUST output a highly compressed array-of-arrays format to save tokens.
    
    For each question, add an array containing exactly 9 strings in this EXACT order:
    Index 0: Question Number (e.g., "76" from Q76)
    Index 1: Exam Year (e.g., "2026")
    Index 2: Subject (e.g., "Indian Polity")
    Index 3: Topic (e.g., "Political Theory & Concepts")
    Index 4: Question Stem (The main text of the question)
    Index 5: Option A text
    Index 6: Option B text
    Index 7: Option C text
    Index 8: Option D text
    Index 9: Correct Answer Label (e.g., "c" from Answer: (c))
    
    If any question is cut off at the end of the pages and is missing its answer or options, DO NOT INCLUDE IT. Only include fully complete questions.
    Do NOT skip any questions that are complete.
    `;

    let retries = 3;
    let delay = 10000;

    while (retries > 0) {
        try {
            const result = await Promise.race([
                model.generateContent([
                    { fileData: { fileUri, mimeType: 'application/pdf' } },
                    { text: prompt }
                ]),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after 300 seconds")), 300000))
            ]);
            
            const responseText = result.response.text();
            const data = JSON.parse(responseText);
            
            if (data.length === 0) {
                console.log("⚠️ Zero items extracted.");
            }
            
            return data;
        } catch (e) {
            if (e.message.includes("Quota exceeded")) {
                console.error(`\n🚨 FATAL ERROR: API Quota Exceeded for this model! \n${e.message}\nExiting script so we don't lose data.`);
                process.exit(1);
            }
            console.error(`Gemini Extraction Error: ${e.message}. Retrying in ${delay/1000}s...`);
            retries--;
            if (retries === 0) return [];
            await sleep(delay);
            delay *= 2;
        }
    }
    return [];
}

async function processItems(rawItems, runId, documentId) {
    const uniqueQuestions = new Map();

    for (const arr of rawItems) {
        if (!Array.isArray(arr) || arr.length < 10) continue;
        
        const q = {
            questionNo: parseInt(arr[0]) || 0,
            examName: "UPSC",
            examYear: parseInt(arr[1]) || 0,
            srcSubject: arr[2],
            srcTopic: arr[3],
            stem: arr[4],
            options: [
                { label: 'a', text: arr[5] },
                { label: 'b', text: arr[6] },
                { label: 'c', text: arr[7] },
                { label: 'd', text: arr[8] },
            ],
            correctLabel: arr[9] ? arr[9].replace(/[\(\)]/g, '').toLowerCase() : null
        };

        const dedupHash = crypto.createHash('md5')
            .update(`${q.examYear || ''}_${q.questionNo || ''}_${q.stem || ''}`.toLowerCase().replace(/\s+/g, ''))
            .digest('hex');
            
        if (!uniqueQuestions.has(dedupHash)) {
            uniqueQuestions.set(dedupHash, { ...q, dedupHash });
        }
    }

    console.log(`\nFound ${uniqueQuestions.size} unique questions after deduplication.`);

    let savedCount = 0;
    for (const q of uniqueQuestions.values()) {
        const flags = [];
        if (!q.correctLabel) flags.push("MISSING_ANSWER");
        
        await prisma.questionDraft.create({
            data: {
                runId,
                documentId,
                rawText: JSON.stringify(q),
                status: 'PENDING',
                flags,
                
                examName: q.examName,
                examYear: q.examYear,
                questionNo: q.questionNo,
                stem: q.stem || "MISSING_STEM",
                options: q.options ? q.options : [],
                correctLabel: q.correctLabel,
                
                srcSubject: q.srcSubject,
                srcTopic: q.srcTopic,
                
                dedupHash: q.dedupHash
            }
        });
        savedCount++;
    }
    
    console.log(`Saved ${savedCount} QuestionDrafts to database.`);
}

main().catch(console.error);
