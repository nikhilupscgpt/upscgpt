import { PrismaClient } from '@prisma/client';
import ReviewUI from './ReviewUI';

const prisma = new PrismaClient();

// Server Actions
export async function getPendingDrafts() {
    return await prisma.questionDraft.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
    });
}

export default async function PrelimsReviewPage() {
    const drafts = await getPendingDrafts();
    
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                PrelimsGPT Ingestion Review
            </h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>
                {drafts.length} questions waiting for review.
            </p>
            <ReviewUI initialDrafts={drafts} />
        </div>
    );
}
