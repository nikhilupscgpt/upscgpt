'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function publishDraft(draftId, editedData) {
    // 1. Ensure Subject exists
    let subjectId = null;
    if (editedData.srcSubject) {
        const slug = editedData.srcSubject.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const subject = await prisma.subject.upsert({
            where: { paper_slug: { paper: editedData.paper || 'GS1', slug } },
            update: {},
            create: {
                name: editedData.srcSubject,
                slug,
                paper: editedData.paper || 'GS1',
            }
        });
        subjectId = subject.id;
    }

    // 2. Ensure Topic exists
    let topicId = null;
    if (subjectId && editedData.srcTopic) {
        const slug = editedData.srcTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const topic = await prisma.topic.upsert({
            where: { subjectId_slug: { subjectId, slug } },
            update: {},
            create: {
                name: editedData.srcTopic,
                slug,
                subjectId
            }
        });
        topicId = topic.id;
    }

    // 3. Create the live Question
    await prisma.question.create({
        data: {
            origin: 'PYQ',
            status: 'PUBLISHED',
            examName: editedData.examName || 'UPSC',
            examYear: parseInt(editedData.examYear) || null,
            paper: editedData.paper || 'GS1',
            questionNo: parseInt(editedData.questionNo) || null,
            stem: editedData.stem,
            options: editedData.options, 
            correctLabel: editedData.correctLabel,
            subjectId,
            topicId,
            dedupHash: editedData.dedupHash || Math.random().toString(36).substring(7),
        }
    });

    // 4. Mark draft as published
    await prisma.questionDraft.update({
        where: { id: draftId },
        data: { status: 'PUBLISHED' }
    });

    revalidatePath('/admin/prelims-review');
    return { success: true };
}

export async function rejectDraft(draftId) {
    await prisma.questionDraft.update({
        where: { id: draftId },
        data: { status: 'REJECTED' }
    });
    revalidatePath('/admin/prelims-review');
    return { success: true };
}
