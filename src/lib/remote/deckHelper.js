import prisma from '@/lib/prisma';
import { CURATED_MAPPING_NODES } from '@/lib/static-mapping-data';

export async function fetchDeckBySetId(setId) {
  if (!setId) return [];

  let query = {};
  if (typeof setId === 'string') {
    if (setId.startsWith('{')) {
      try {
        query = JSON.parse(setId);
      } catch {
        query = { id: setId };
      }
    } else if (setId.includes('=') || setId.startsWith('?')) {
      const sp = new URLSearchParams(setId.startsWith('?') ? setId.slice(1) : setId);
      query = {
        id: sp.get('id') || undefined,
        ids: sp.get('ids') || undefined,
        topicId: sp.get('topicId') || undefined,
        topicIds: sp.get('topicIds') || undefined,
        mappingId: sp.get('mappingId') || undefined,
        mappingIds: sp.get('mappingIds') || undefined,
        mode: sp.get('mode') || 'pyq',
        subject: sp.get('subject') || undefined,
        topic: sp.get('topic') || undefined,
      };
    } else {
      query = { ids: setId };
    }
  } else if (typeof setId === 'object') {
    query = setId;
  }

  const singleId = query.id;
  const multiIds = query.ids ? String(query.ids).split(',').map(s => s.trim()).filter(Boolean) : (singleId ? [singleId] : []);
  const topicIds = query.topicIds ? String(query.topicIds).split(',').map(s => s.trim()).filter(Boolean) : (query.topicId ? [query.topicId] : []);
  const mappingIds = query.mappingIds ? String(query.mappingIds).split(',').map(s => s.trim()).filter(Boolean) : (query.mappingId ? [query.mappingId] : []);
  const mode = query.mode || 'pyq';

  const deckItems = [];

  // 1. Topics
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
    const map = new Map(issues.map(i => [i.id, i]));
    for (const tid of topicIds) {
      const issue = map.get(tid);
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

  // 2. Mapping
  if (mode === 'mapping' || mappingIds.length > 0) {
    const staticMap = new Map();
    for (const node of CURATED_MAPPING_NODES) {
      staticMap.set(node.id, node);
      if (node.slug) staticMap.set(node.slug, node);
    }
    const idsToSearch = mappingIds.length > 0 ? mappingIds : (multiIds.length > 0 ? multiIds : []);
    for (const mid of idsToSearch) {
      if (staticMap.has(mid)) {
        const node = staticMap.get(mid);
        deckItems.push({
          id: node.id,
          type: 'mapping',
          place: node.place,
          title: node.place,
          placeType: node.placeType || 'Geographical Feature',
          regionScope: node.regionScope || 'India',
          locatedIn: node.locatedIn || { stateOrProvince: 'India' },
          lat: node.lat,
          lng: node.lng,
          shape: node.shape || null,
          mapCategory: node.mapCategory || [],
          staticFacts: node.staticFacts || [],
          riverDetails: node.riverDetails || null,
          stem: node.upscAngle?.sampleQuestion || `Explain the strategic and geographical significance of ${node.place}.`,
          options: node.upscAngle?.sampleOptions || [],
          correctLabel: node.upscAngle?.sampleCorrect || 'A',
          explanation: node.upscAngle?.significance || (node.staticFacts ? node.staticFacts.join('\n\n') : ''),
        });
      }
    }
  }

  // 3. QuestionDrafts (PYQs)
  const andConditions = [];
  if (multiIds.length > 0 && mode !== 'mapping') {
    andConditions.push({ id: { in: multiIds } });
  } else if (query.subject && query.subject !== 'ALL') {
    andConditions.push({ srcSubject: query.subject });
    if (query.topic && query.topic !== 'ALL') {
      andConditions.push({ srcTopic: query.topic });
    }
  }

  if (andConditions.length > 0) {
    const drafts = await prisma.questionDraft.findMany({
      where: { AND: andConditions },
      take: 50,
      orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
    });

    let orderedDrafts = drafts;
    if (multiIds.length > 0) {
      const map = new Map(drafts.map(d => [d.id, d]));
      orderedDrafts = multiIds.map(id => map.get(id)).filter(Boolean);
    }

    // Fallback to published Question table if not found in drafts
    if (orderedDrafts.length === 0 && multiIds.length > 0) {
      const questions = await prisma.question.findMany({
        where: { id: { in: multiIds } },
        take: 50,
      });
      const qMap = new Map(questions.map(q => [q.id, q]));
      orderedDrafts = multiIds.map(id => qMap.get(id)).filter(Boolean);
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

  // If still empty and no specific query, provide recent sample questions
  if (deckItems.length === 0 && (!multiIds.length && !topicIds.length)) {
    const recent = await prisma.questionDraft.findMany({
      take: 10,
      orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
    });
    for (const q of recent) {
      let opts = [];
      if (Array.isArray(q.options)) opts = q.options;
      else if (typeof q.options === 'string') {
        try { opts = JSON.parse(q.options); } catch { opts = []; }
      }
      deckItems.push({
        id: q.id,
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

  return deckItems;
}
