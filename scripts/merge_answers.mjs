import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const answers = JSON.parse(fs.readFileSync('./pyq_data/answers.json', 'utf8'));
    let updated = 0;
    
    const drafts = await prisma.questionDraft.findMany({ where: { status: 'PENDING' } });
    
    for (const ans of answers) {
        // Find matching draft by questionNo
        const draft = drafts.find(d => d.questionNo === ans.questionNo);
        if (draft) {
            // Remove the 'MISSING_ANSWER' flag
            const newFlags = draft.flags.filter(f => f !== 'MISSING_ANSWER');
            
            await prisma.questionDraft.update({
                where: { id: draft.id },
                data: { 
                    correctLabel: ans.correctLabel,
                    flags: newFlags
                }
            });
            updated++;
        }
    }
    console.log(`Successfully merged ${updated} answers into the database!`);
}
main().catch(console.error);
