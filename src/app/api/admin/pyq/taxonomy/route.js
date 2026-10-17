import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    // 2. Get Subjects
    const examWhere = {};
    if (exam !== 'ALL') {
      examWhere.examName = { contains: exam === 'UPSC CSE' ? 'CSE' : exam, mode: 'insensitive' };
    }

    const subjectRows = await prisma.questionDraft.findMany({
      where: examWhere,
      distinct: ['srcSubject'],
      select: { srcSubject: true },
      orderBy: { srcSubject: 'asc' }
    });
    const subjects = subjectRows.map(s => s.srcSubject).filter(Boolean);

    // 3. Get Topics (Themes) for the chosen Subject
    let topics = [];
    if (subject !== 'ALL') {
      const topicRows = await prisma.questionDraft.findMany({
        where: { ...examWhere, srcSubject: subject },
        distinct: ['srcTopic'],
        select: { srcTopic: true },
        orderBy: { srcTopic: 'asc' }
      });
      topics = topicRows.map(t => t.srcTopic).filter(Boolean);
    }

    // 4. Get Microthemes (Subtopics)
    let microthemes = [];
    if (topic !== 'ALL') {
      const subIssues = await prisma.issue.findMany({
        where: {
          parentIssueId: { not: null },
          OR: [
            { topic: { contains: topic, mode: 'insensitive' } },
            { parentIssue: { title: { contains: topic, mode: 'insensitive' } } }
          ]
        },
        select: { title: true },
        distinct: ['title'],
        take: 100
      });

      if (subIssues.length > 0) {
        microthemes = subIssues.map(s => s.title);
      } else {
        const themeRows = await prisma.questionDraft.findMany({
          where: { ...examWhere, srcTopic: topic, srcTheme: { not: null } },
          distinct: ['srcTheme'],
          select: { srcTheme: true }
        });
        microthemes = themeRows.map(t => t.srcTheme).filter(Boolean);
      }
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
      countWhere.OR = [
        { srcTheme: microtheme },
        { stem: { contains: microtheme, mode: 'insensitive' } },
        { explanation: { contains: microtheme, mode: 'insensitive' } }
      ];
    }

    const matchingCount = await prisma.questionDraft.count({ where: countWhere });

    return NextResponse.json({
      success: true,
      exams: standardExams,
      subjects,
      topics,
      microthemes,
      matchingCount
    });

  } catch (error) {
    console.error('[Taxonomy API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch taxonomy' }, { status: 500 });
  }
}
