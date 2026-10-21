import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  SUBJECT_ORDER,
  TOPIC_GROUPS,
  getTopicSyllabusOrder,
  getMicrothemesForTopic,
  buildMicrothemeConditions
} from '@/lib/syllabusTaxonomy';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exam = searchParams.get('exam') || 'ALL';
    const subject = searchParams.get('subject') || 'ALL';
    const topic = searchParams.get('topic') || 'ALL';
    const microtheme = searchParams.get('microtheme') || 'ALL';
    const year = searchParams.get('year') || 'ALL';

    // 1. Get Exams
    const examRows = await prisma.questionDraft.findMany({
      distinct: ['examName'],
      select: { examName: true }
    });
    const rawExams = examRows.map(e => e.examName).filter(Boolean);
    const standardExams = Array.from(new Set(rawExams.map(name => {
      if (/cse/i.test(name)) return 'UPSC CSE';
      if (/cds/i.test(name)) return 'CDS';
      return name;
    })));

    // 2. Get Subjects (Strictly ordered by canonical NCERT syllabus sequence)
    const examWhere = {};
    if (exam !== 'ALL') {
      examWhere.examName = { contains: exam === 'UPSC CSE' ? 'CSE' : exam, mode: 'insensitive' };
    }

    const subjectRows = await prisma.questionDraft.findMany({
      where: examWhere,
      distinct: ['srcSubject'],
      select: { srcSubject: true },
    });
    const rawSubjects = subjectRows.map(s => s.srcSubject).filter(Boolean);
    const subjects = rawSubjects.sort((a, b) => {
      const idxA = SUBJECT_ORDER.indexOf(a);
      const idxB = SUBJECT_ORDER.indexOf(b);
      const rankA = idxA === -1 ? 999 : idxA;
      const rankB = idxB === -1 ? 999 : idxB;
      if (rankA !== rankB) return rankA - rankB;
      return a.localeCompare(b);
    });

    // 3. Get Topics (Themes) & Structured Topic Groups for the chosen Subject
    let topics = [];
    let topicGroups = [];
    if (subject !== 'ALL') {
      const topicRows = await prisma.questionDraft.findMany({
        where: { ...examWhere, srcSubject: subject },
        distinct: ['srcTopic'],
        select: { srcTopic: true },
      });
      const distinctTopics = topicRows.map(t => t.srcTopic).filter(Boolean);

      // Sort topics by official syllabus flow (Foundations -> Executive -> Legislature...)
      topics = distinctTopics.sort((a, b) => {
        const orderA = getTopicSyllabusOrder(subject, a);
        const orderB = getTopicSyllabusOrder(subject, b);
        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b);
      });

      // Construct canonical module groupings matching TOPIC_GROUPS
      const subjectModules = TOPIC_GROUPS[subject] || [];
      const topicSet = new Set(topics);
      const covered = new Set();

      for (const [moduleLabel, topicNames] of subjectModules) {
        const items = topicNames.filter(t => topicSet.has(t));
        if (items.length > 0) {
          items.forEach(t => covered.add(t));
          topicGroups.push({
            label: moduleLabel,
            topics: items
          });
        }
      }
      const rest = topics.filter(t => !covered.has(t));
      if (rest.length > 0) {
        topicGroups.push({
          label: 'Other & Specialized Topics',
          topics: rest
        });
      }
    }

    // 4. Get Microthemes (Subtopics / Neural Nodes)
    let microthemes = [];
    if (topic !== 'ALL') {
      const directBridged = getMicrothemesForTopic(subject, topic);
      const microthemeSet = new Set(directBridged);

      // Complement with live Issue nodes from the DB matching topic keywords
      const dbIssues = await prisma.issue.findMany({
        where: {
          OR: [
            { topic: { contains: topic, mode: 'insensitive' } },
            { title: { contains: topic, mode: 'insensitive' } }
          ]
        },
        select: { title: true },
        take: 50
      });
      for (const iss of dbIssues) {
        if (iss.title) microthemeSet.add(iss.title);
      }

      // Complement with any explicit QuestionDraft.srcTheme
      const themeRows = await prisma.questionDraft.findMany({
        where: { ...examWhere, srcTopic: topic, srcTheme: { not: null } },
        distinct: ['srcTheme'],
        select: { srcTheme: true }
      });
      for (const tr of themeRows) {
        if (tr.srcTheme) microthemeSet.add(tr.srcTheme);
      }

      microthemes = Array.from(microthemeSet);
    }

    // 5. Compute exact matching question count for current selection
    const countWhere = { ...examWhere };
    if (subject !== 'ALL') countWhere.srcSubject = subject;
    if (topic !== 'ALL') countWhere.srcTopic = topic;
    if (year !== 'ALL') {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) countWhere.examYear = parsedYear;
    }
    if (microtheme !== 'ALL') {
      const microCond = buildMicrothemeConditions(microtheme);
      if (microCond) {
        countWhere.AND = [microCond];
      }
    }

    const matchingCount = await prisma.questionDraft.count({ where: countWhere });

    return NextResponse.json({
      success: true,
      exams: standardExams,
      subjects,
      topics,
      topicGroups,
      microthemes,
      matchingCount
    });

  } catch (error) {
    console.error('[Taxonomy API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch taxonomy' }, { status: 500 });
  }
}
