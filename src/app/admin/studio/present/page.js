import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  getMappingWorkspaceData,
  resolveMappingDeckItems,
} from "@/lib/mapping/workspace-service";
import StudioPresentSwitcher from "./StudioPresentSwitcher";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Lecture Studio Broadcast Mode | Admin',
  description: '1080p full-screen broadcast studio for recording UPSC Prelims & Thematic Lectures with dual-layer pen annotations and pinned concept stage.',
};

export default async function StudioPresentPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    redirect("/admin-login");
  }

  const sp = await searchParams;
  const mode = sp?.mode || 'pyq'; // 'pyq' | 'topic' | 'hybrid' | 'mapping'
  const sessionId = typeof sp?.sessionId === 'string' ? sp.sessionId.trim() : '';
  const initialRecordingSession = sessionId
    ? await prisma.recordingSession.findUnique({ where: { id: sessionId } })
    : null;
  const questionIds = sp?.ids
    ? sp.ids.split(',').map(s => s.trim()).filter(Boolean)
    : (sp?.id ? [sp.id] : (initialRecordingSession?.questionIds || []));
  const topicIds = sp?.topicIds ? sp.topicIds.split(',').map(s => s.trim()).filter(Boolean) : (sp?.topicId ? [sp.topicId] : []);
  const mappingIds = sp?.mappingIds
    ? sp.mappingIds.split(',').map(s => s.trim()).filter(Boolean)
    : (sp?.mappingId ? [sp.mappingId] : (mode === 'mapping' && sp?.ids ? sp.ids.split(',').map(s => s.trim()).filter(Boolean) : []));
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

  // 3. Process Mapping items using unified Mapping Workspace service
  if (mode === 'mapping' || mappingIds.length > 0) {
    try {
      const workspace = await getMappingWorkspaceData();
      const resolved = resolveMappingDeckItems(mappingIds, workspace);
      for (const item of resolved) {
        const primaryPyq = item.resolvedPYQs?.[0] || null;
        deckItems.push({
          id: item.id,
          type: 'mapping',
          sourceType: item.sourceType,
          pillar: item.pillar,
          title: item.sourceType === 'PYQ' ? `Mapping PYQ: ${item.exam} ${item.examYear}` : item.place,
          place: item.place,
          regionScope: item.regionScope || 'India',
          mapCategory: Array.isArray(item.category) ? item.category.join(', ') : (item.category || 'Physical Geography'),
          category: Array.isArray(item.category) ? item.category[0] : (item.category || 'Physical Geography'),
          placeType: item.placeType || 'Geographic Feature',
          locationText: item.locationText,
          lat: item.coordinates?.lat ?? null,
          lng: item.coordinates?.lng ?? null,
          shape: Array.isArray(item.shape) ? item.shape : null,
          staticFacts: item.staticFacts || [],
          upscAngle: item.upscAngle || null,
          newsHook: item.newsHook || null,
          newsTriggers: item.newsTriggers || [],
          similarPYQs: item.resolvedPYQs?.length > 0 ? item.resolvedPYQs : (item.similarPYQs || []),
          resolvedPyq: primaryPyq,
          pyq: primaryPyq,
          stem: item.stem || primaryPyq?.stem || null,
          options: item.options || primaryPyq?.options || [],
          correctLabel: item.correctLabel || primaryPyq?.correctLabel || '',
          explanation: item.explanation || primaryPyq?.explanation || null,
          analysis: item.analysis || primaryPyq?.analysis || null,
          imageUrl: item.imageUrl || null,
          imageCaption: item.sourceType === 'PYQ' ? `${item.exam} ${item.examYear} Map Slide` : `${item.place} Map`,
          priority: item.priority || 'High',
          riverDetails: item.riverDetails || null,
        });
      }
    } catch (e) {
      console.error('[Studio Present] Error resolving mapping deck from workspace service:', e);
    }
  }

  // 4. Fetch Questions if questionIds or filters are provided
  if (mode !== 'mapping' && (questionIds.length > 0 || (mode === 'pyq' && !scratchpadRaw && topicIds.length === 0 && mappingIds.length === 0))) {
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
        explanationJson: true,
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

      const expJson = q.explanationJson && typeof q.explanationJson === 'object' ? q.explanationJson : null;
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
        explanation: q.explanation || expJson?.explanation || null,
        explanationJson: expJson,
        analysis: expJson?.analysis || null,
        difficulty: q.difficulty || null,
      });
    }
  }

  const defaultView = sp?.view === 'slides' ? 'slides' : 'broadsheet';
  return (
    <StudioPresentSwitcher
      questions={deckItems}
      initialRecordingSession={initialRecordingSession}
      defaultView={defaultView}
    />
  );
}
