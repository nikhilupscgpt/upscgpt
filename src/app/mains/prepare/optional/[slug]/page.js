import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OptionalStudyClient from './OptionalStudyClient';
import { seedOptionalSyllabus } from '@/lib/optional-seeder';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const optional = await prisma.optionalSubject.findUnique({
    where: { slug }
  });
  
  if (!optional) return { title: 'Subject Not Found' };
  
  return {
    title: `${optional.name} Optional — Mains Neural Base`,
    description: `Syllabus-mapped study base and active pgvector RAG system for ${optional.name} preparation.`
  };
}

export default async function OptionalSubjectWorkspace({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const lang = resolvedSearchParams?.lang || 'en';
  
  const optional = await prisma.optionalSubject.findUnique({
    where: { slug }
  });

  if (!optional) {
    notFound();
  }

  // Seed optional syllabus tree into database if not seeded yet
  await seedOptionalSyllabus(slug, optional.id);

  // Fetch optional syllabus tree nodes from database
  const issues = await prisma.issue.findMany({
    where: {
      domain: `OPTIONAL_${slug.toUpperCase()}`
    },
    orderBy: {
      orderIndex: 'asc'
    }
  });

  // Fetch syllabus content chunks linked to this optional (include issueId for explicit node links)
  const contents = await prisma.subjectContent.findMany({
    where: {
      optionalId: optional.id,
      isOptional: true,
      language: lang,
    },
    select: {
      id: true,
      title: true,
      subject: true,
      examType: true,
      contentMarkdown: true,
      sourceUrl: true,
      issueId: true,
    },
    orderBy: {
      title: 'asc'
    }
  });

  // Fetch previous year questions linked to this optional
  const pyqs = await prisma.previousYearQuestion.findMany({
    where: {
      optionalId: optional.id,
      language: lang,
    },
    select: {
      id: true,
      year: true,
      paper: true,
      subject: true,
      questionText: true,
      marks: true,
      modelAnswer: true,
      exam: true,
      metadata: true,
    },
    orderBy: {
      year: 'desc'
    }
  });

  const serializedOptional = JSON.parse(JSON.stringify(optional));
  const serializedContents = JSON.parse(JSON.stringify(contents));
  const serializedPyqs = JSON.parse(JSON.stringify(pyqs));
  const serializedIssues = JSON.parse(JSON.stringify(issues));

  return (
    <OptionalStudyClient 
      optional={serializedOptional}
      contents={serializedContents}
      pyqs={serializedPyqs}
      issues={serializedIssues}
    />
  );
}
