import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

function classify(stem) {
    const s = stem.toLowerCase();
    if (s.includes("election") || s.includes("voting") || s.includes("parti") || s.includes("electoral") || s.includes("delimitation")) return "Elections & Political Parties";
    if (s.includes("lok sabha") || s.includes("rajya sabha") || s.includes("parliament") || s.includes("bill") || s.includes("budget") || s.includes("legislative")) return "Parliament & State Legislature";
    if (s.includes("right to") || s.includes("article 21") || s.includes("fundamental right") || s.includes("liberty") || s.includes("human right") || s.includes("social equality") || s.includes("minority")) return "Fundamental Rights";
    if (s.includes("directive principle") || s.includes("dpsp")) return "Directive Principles of State Policy";
    if (s.includes("court") || s.includes("tribunal") || s.includes("judge") || s.includes("judicial")) return "Judiciary";
    if (s.includes("president") || s.includes("prime minister") || s.includes("minister") || s.includes("cabinet") || s.includes("collector")) return "Union & State Executive";
    if (s.includes("panchayat") || s.includes("municipal") || s.includes("local") || s.includes("gram sabha")) return "Local Government";
    if (s.includes("commission") || s.includes("cag") || s.includes("attorney") || s.includes("board")) return "Constitutional & Statutory Bodies";
    if (s.includes("amendment") || s.includes("constitution") || s.includes("article")) return "Constitutional Framework";
    if (s.includes("democracy") || s.includes("socialism") || s.includes("marxism") || s.includes("gandhism") || s.includes("polyarchy") || s.includes("totalitarianism") || s.includes("legitimacy")) return "Political Theory & Ideologies";
    if (s.includes("united nations") || s.includes("un ") || s.includes("foreign policy") || s.includes("international") || s.includes("panchsheel") || s.includes("treaty") || s.includes("globalization")) return "International Relations";
    if (s.includes("award") || s.includes("bharat ratna") || s.includes("padma") || s.includes("anthem") || s.includes("flag") || s.includes("calendar")) return "National Symbols & Awards";
    if (s.includes("aadhaar") || s.includes("act") || s.includes("scheme")) return "Governance & Public Policy";
    return "Miscellaneous Polity";
}

async function main() {
    let data = JSON.parse(fs.readFileSync('./pyq_data/questions_chunk1.json', 'utf8'));
    
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
        q.srcSubject = "Indian Polity";
        q.srcTopic = classify(q.stem);
        
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
                    srcSubject: q.srcSubject,
                    srcTopic: q.srcTopic,
                    flags: ["MISSING_ANSWER"],
                    dedupHash
                }
            });
            saved++;
        }
    }
    
    // Save updated JSON back
    fs.writeFileSync('./pyq_data/questions_chunk1.json', JSON.stringify(data, null, 2));
    
    console.log(`Categorized and saved ${saved} questions!`);
}
main().catch(console.error);
