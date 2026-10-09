import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const drafts = await prisma.questionDraft.findMany({
        where: { status: 'PENDING' }
    });

    console.log(`Found ${drafts.length} pending drafts to publish...`);

    let published = 0;

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
                correctLabel: draft.correctLabel || 'X',
                examName: draft.examName || 'UPSC',
                examYear: draft.examYear,
                questionNo: draft.questionNo,
                subjectId,
                topicId
            },
            create: {
                origin: 'PYQ',
                status: 'PUBLISHED',
                examName: draft.examName || 'UPSC',
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
        if (published % 50 === 0) {
            console.log(`Published ${published}/${drafts.length}...`);
        }
    }

    console.log(`\n🎉 Successfully published all ${published} questions to the live Question bank!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
