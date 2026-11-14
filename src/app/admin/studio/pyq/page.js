import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import PyqStudioClient from './PyqStudioClient';
import { SyllabusTreeHome } from '@/components/pyq-studio';
import { TOPIC_GROUPS, SUBJECT_ORDER } from '@/lib/syllabusTaxonomy';
import {
  getCachedPyqTree,
  getFacultyPrefs,
  normalizeExamFilter,
} from '@/lib/pyq/tree-service';
import './pyq-studio.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'PYQ Lecture Studio Workstation | Admin',
  description:
    'Syllabus-aligned UPSC Prelims PYQ workstation with recording queue, map attachments, and 1080p broadcast presenter.',
};

export default async function PyqStudioPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    redirect('/admin-login');
  }

  const sp = (await searchParams) || {};
  const view = typeof sp.view === 'string' ? sp.view : '';
  const subjectParam = typeof sp.subject === 'string' ? sp.subject : '';
  const topicParam = typeof sp.topic === 'string' ? sp.topic : '';
  const hasListFilters =
    view === 'list' ||
    Boolean(sp.search || sp.ids || sp.year || sp.pattern || sp.status || sp.sort);

  const prefs = await getFacultyPrefs(session.user?.id);
  const examFilter = sp.exam ? normalizeExamFilter(String(sp.exam)) : prefs.defaultExam;
  const tree = await getCachedPyqTree(examFilter);

  let openListDirectly = hasListFilters;
  if (!openListDirectly && subjectParam && topicParam) {
    const subjNode = tree.subjects.find((s) => s.name === subjectParam);
    const topicNode = subjNode?.topics.find((t) => t.name === topicParam);
    if (!topicNode || topicNode.themes.length === 0) {
      openListDirectly = true;
    }
  }

  if (!openListDirectly) {
    return (
      <SyllabusTreeHome
        initialTree={tree}
        initialPrefs={prefs}
        initialSubject={subjectParam}
        initialTopic={topicParam}
        userRole={session.user.role}
      />
    );
  }

  const [subjectsRaw, yearsRaw, examsRaw] = await Promise.all([
    prisma.questionDraft.findMany({
      select: { srcSubject: true },
      distinct: ['srcSubject'],
    }),
    prisma.questionDraft.findMany({
      select: { examYear: true },
      distinct: ['examYear'],
      orderBy: { examYear: 'desc' },
    }),
    prisma.questionDraft.findMany({
      select: { examName: true },
      distinct: ['examName'],
    }),
  ]);

  const subjects = subjectsRaw.map((s) => s.srcSubject).filter(Boolean);
  const years = yearsRaw.map((y) => y.examYear).filter(Boolean);
  const exams = examsRaw.map((e) => e.examName).filter(Boolean);

  subjects.sort((a, b) => {
    const ia = SUBJECT_ORDER.indexOf(a);
    const ib = SUBJECT_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <PyqStudioClient
      userRole={session.user.role}
      initialFilterOptions={{
        subjects,
        years,
        exams,
        topicGroups: TOPIC_GROUPS,
      }}
    />
  );
}
