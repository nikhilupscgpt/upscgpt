import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PyqPresenterClient from "../../pyq/present/PyqPresenterClient";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Lecture Studio Broadcast Mode | Admin',
  description: '1080p full-screen broadcast studio for recording UPSC Prelims & Thematic Lectures with dual-layer pen annotations and pinned concept stage.',
};

export default async function StudioPresentPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect("/login");
  }

  const sp = await searchParams;
  const mode = sp?.mode || 'pyq'; // 'pyq' | 'topic' | 'hybrid'
  const questionIds = sp?.ids ? sp.ids.split(',').map(s => s.trim()).filter(Boolean) : (sp?.id ? [sp.id] : []);
  const topicIds = sp?.topicIds ? sp.topicIds.split(',').map(s => s.trim()).filter(Boolean) : (sp?.topicId ? [sp.topicId] : []);
  const scratchpadRaw = sp?.scratchpad;

  const deckItems = [];

  // 1. Process Scratchpad Custom Outline if present
  if (scratchpadRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(scratchpadRaw));
      if (parsed && parsed.title) {
        deckItems.push({
          id: `scratchpad_${parsed.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          type: 'topic',
          title: parsed.title,
          domain: parsed.domain || 'Custom Masterclass',
          topic: parsed.topic || 'Concept Outline',
          gsPapers: parsed.gsPapers || ['GS'],
          cumulativeSummary: parsed.summary || parsed.overview || '',
          backgroundNote: parsed.background || '',
          valueAddition: parsed.valueAddition || '',
          mainsFacts: parsed.mainsFacts || '',
          possibleQuestions: parsed.questions || '',
          imageUrl: parsed.imageUrl || null,
          customAssets: {
            hasSketchCanvas: Boolean(parsed.hasSketchCanvas),
            imageUrl: parsed.imageUrl || null,
          },
        });
      }
    } catch (e) {
      console.error('[Studio Present] Error parsing scratchpad:', e);
    }
  }

  // 2. Fetch Topic Nodes if topicIds are provided
  if (topicIds.length > 0) {
    const issues = await prisma.issue.findMany({
      where: { id: { in: topicIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        domain: true,
        topic: true,
        gsPapers: true,
        cumulativeSummary: true,
        backgroundNote: true,
        valueAddition: true,
        mainsFacts: true,
        possibleQuestions: true,
        imageUrl: true,
      },
    });

    const issueMap = new Map(issues.map(i => [i.id, i]));
    for (const tid of topicIds) {
      const issue = issueMap.get(tid);
      if (issue) {
        deckItems.push({
          id: issue.id,
          type: 'topic',
          title: issue.title,
          domain: issue.domain || 'Thematic Lecture',
          topic: issue.topic || 'Syllabus Node',
          gsPapers: issue.gsPapers || [],
          cumulativeSummary: issue.cumulativeSummary || '',
          backgroundNote: issue.backgroundNote || '',
          valueAddition: issue.valueAddition || '',
          mainsFacts: issue.mainsFacts || '',
          possibleQuestions: issue.possibleQuestions || '',
          imageUrl: issue.imageUrl || null,
        });
      }
    }
  }

  // 3. Fetch Questions if questionIds or filters are provided
  if (questionIds.length > 0 || (mode === 'pyq' && !scratchpadRaw && topicIds.length === 0)) {
    const andConditions = [];
    if (questionIds.length > 0) {
      andConditions.push({ id: { in: questionIds } });
    } else {
      if (sp?.subject && sp.subject !== 'ALL') {
        andConditions.push({ srcSubject: sp.subject });
      }
      if (sp?.topic && sp.topic !== 'ALL') {
        andConditions.push({ srcTopic: sp.topic });
      }
      if (sp?.year && sp.year !== 'ALL') {
        andConditions.push({ examYear: parseInt(sp.year, 10) });
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const drafts = await prisma.questionDraft.findMany({
      where,
      take: 50,
      orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
      select: {
        id: true,
        dedupHash: true,
        examName: true,
        examYear: true,
        questionNo: true,
        srcSubject: true,
        srcTopic: true,
        stem: true,
        options: true,
        correctLabel: true,
        explanation: true,
        difficulty: true,
      },
    });

    let orderedDrafts = drafts;
    if (questionIds.length > 0) {
      const map = new Map(drafts.map(d => [d.id, d]));
      orderedDrafts = questionIds.map(id => map.get(id)).filter(Boolean);
    }

    for (const q of orderedDrafts) {
      let opts = [];
      if (Array.isArray(q.options)) {
        opts = q.options;
      } else if (typeof q.options === 'string') {
        try {
          const parsed = JSON.parse(q.options);
          if (Array.isArray(parsed)) opts = parsed;
        } catch {
          opts = [];
        }
      }

      deckItems.push({
        id: q.id,
        type: 'pyq',
        dedupHash: q.dedupHash,
        examName: q.examName || 'UPSC CSE Pre',
        examYear: q.examYear || '',
        questionNo: q.questionNo || '',
        srcSubject: q.srcSubject || 'General Studies',
        srcTopic: q.srcTopic || 'General',
        stem: q.stem || '',
        options: opts,
        correctLabel: q.correctLabel || null,
        explanation: q.explanation || null,
        difficulty: q.difficulty || null,
      });
    }
  }

  return <PyqPresenterClient questions={deckItems} />;
}
