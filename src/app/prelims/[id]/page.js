import React from 'react';
import MockTestPortal from '@/components/MockTestPortal';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MockTestPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/prelims/' + id);
  }

  let testPaper = null;

  try {
    if (prisma?.testPaper) {
      testPaper = await prisma.testPaper.findUnique({
        where: { id: id },
        include: {
          questions: {
            include: {
              question: true
            },
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
    }
  } catch (err) {
    console.error('Error fetching test paper:', err);
  }

  if (!testPaper) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px', padding: '32px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px' }}>404</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Mock Test paper not found or not yet published.</p>
          <Link 
            href="/prelims/mocks"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'var(--btn-primary-bg)',
              color: 'var(--btn-primary-text)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            Back to Mocks Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Transform to format expected by MockTestPortal
  const formattedTest = {
    ...testPaper,
    questions: testPaper.questions.map(tq => ({
      id: tq.question.id,
      text: tq.question.stem,
      options: tq.question.options,
      difficulty: tq.question.difficulty
    }))
  };

  return (
    <MockTestPortal 
      testPack={JSON.parse(JSON.stringify(formattedTest))} 
      userId={session.user.id} 
    />
  );
}
