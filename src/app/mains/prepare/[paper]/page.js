import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SyllabusListingClient from './SyllabusListingClient';

const PAPERS = {
  gs1: {
    code: 'GS Paper I',
    title: 'Heritage, History, Geography & Society',
    color: '#6366f1',
    subjects: [
      { id: 'history_culture', title: 'Indian History & Culture', domains: ['INDIAN CULTURE', 'MODERN HISTORY', 'WORLD HISTORY', 'POST-INDEPENDENCE CONSOLIDATION'] },
      { id: 'geography', title: 'Geography of the World', domains: ['GEOGRAPHY'] },
      { id: 'society', title: 'Indian Society', domains: ['INDIAN SOCIETY'] },
    ]
  },
  gs2: {
    code: 'GS Paper II',
    title: 'Governance, Polity & IR',
    color: '#10b981',
    subjects: [
      { id: 'polity', title: 'Polity & Constitution', domains: ['POLITY'] },
      { id: 'governance', title: 'Governance & Social Justice', domains: ['GOVERNANCE'] },
      { id: 'ir', title: 'International Relations', domains: ['INTERNATIONAL RELATIONS'] },
    ]
  },
  gs3: {
    code: 'GS Paper III',
    title: 'Economy, Tech, Security & Environment',
    color: '#f59e0b',
    subjects: [
      { id: 'economy_agri', title: 'Economy & Agriculture', domains: ['INDIAN ECONOMY', 'AGRICULTURE'] },
      { id: 'environment', title: 'Environment & Disaster Mgmt', domains: ['ENVIRONMENT'] },
      { id: 'scitech', title: 'Science & Technology', domains: ['SCIENCE & TECHNOLOGY'] },
      { id: 'security', title: 'Internal Security', domains: ['INTERNAL SECURITY'] },
    ]
  },
  gs4: {
    code: 'GS Paper IV',
    title: 'Ethics, Integrity & Aptitude',
    color: '#a855f7',
    subjects: [
      { id: 'ethics', title: 'Ethics & Integrity', domains: ['ETHICS'] },
    ]
  },
  essay: {
    code: 'Essay Paper',
    title: 'Philosophical & Socio-Economic Themes',
    color: '#f43f5e',
    subjects: [
      { id: 'philosophical', title: 'Philosophical & Ethical Themes', domains: ['ETHICS', 'INDIAN SOCIETY', 'INDIAN CULTURE'] },
      { id: 'socio_economic', title: 'Socio-Economic Development', domains: ['INDIAN ECONOMY', 'AGRICULTURE', 'GOVERNANCE', 'POLITY'] },
      { id: 'environmental_geo', title: 'Environmental & Geopolitical', domains: ['ENVIRONMENT', 'GEOGRAPHY', 'INTERNATIONAL RELATIONS', 'INTERNAL SECURITY', 'SCIENCE & TECHNOLOGY', 'WORLD HISTORY', 'POST-INDEPENDENCE CONSOLIDATION'] },
    ]
  }
};

export async function generateMetadata({ params }) {
  const { paper } = await params;
  const paperInfo = PAPERS[paper];
  if (!paperInfo) return { title: 'Paper Not Found' };
  return {
    title: `${paperInfo.code} — Mains Neural Base`,
    description: `Browse subjects, topics and syllabus nodes for ${paperInfo.title}.`
  };
}

export default async function SyllabusPaperListing({ params }) {
  const { paper } = await params;
  const paperInfo = PAPERS[paper];
  if (!paperInfo) notFound();

  // Fetch issues related to the domains in the subjects
  const domainsToFetch = Array.from(new Set(paperInfo.subjects.flatMap(s => s.domains)));
  
  const issues = await prisma.issue.findMany({
    where: {
      status: 'ACTIVE',
      parentIssueId: null,
      domain: { in: domainsToFetch },
      ...(paper === 'essay' ? { nodeType: 'CONCEPTUAL' } : {})
    },
    select: {
      id: true,
      title: true,
      slug: true,
      domain: true,
      topic: true,
      category: true,
      gsPapers: true,
      nodeType: true,
      orderIndex: true,
      subNodes: {
        select: {
          id: true,
          title: true,
          nodeType: true
        }
      }
    },
    orderBy: [
      { orderIndex: 'asc' },
      { title: 'asc' }
    ]
  });

  const serializedIssues = JSON.parse(JSON.stringify(issues));

  return (
    <SyllabusListingClient 
      paper={paper}
      paperInfo={paperInfo}
      issues={serializedIssues}
    />
  );
}
