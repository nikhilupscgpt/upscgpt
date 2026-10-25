import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CURATED_MAPPING_NODES } from "@/lib/static-mapping-data";
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
  const mode = sp?.mode || 'pyq'; // 'pyq' | 'topic' | 'hybrid' | 'mapping'
  const questionIds = sp?.ids ? sp.ids.split(',').map(s => s.trim()).filter(Boolean) : (sp?.id ? [sp.id] : []);
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

  // 3. Process Mapping items if mode === 'mapping' or mappingIds are present
  if (mode === 'mapping' || mappingIds.length > 0) {
    const requestedIds = mappingIds;
    const staticMap = new Map();
    for (const node of CURATED_MAPPING_NODES) {
      staticMap.set(node.id, node);
      if (node.slug) staticMap.set(node.slug, node);
    }

    // Match from static nodes
    const matchedStatic = [];
    if (requestedIds.length > 0) {
      for (const id of requestedIds) {
        if (staticMap.has(id)) {
          matchedStatic.push(staticMap.get(id));
        }
      }
    } else {
      matchedStatic.push(...CURATED_MAPPING_NODES.slice(0, 25));
    }

    // Match from database PlaceInNews
    let matchedPins = [];
    if (requestedIds.length > 0) {
      try {
        matchedPins = await prisma.placeInNews.findMany({
          where: {
            OR: [
              { id: { in: requestedIds } },
              { pinId: { in: requestedIds } },
              { slug: { in: requestedIds } },
            ],
          },
        });
      } catch (e) {
        console.error('[Studio Present] Error fetching PIN records from DB:', e);
      }
    }

    const pinMap = new Map();
    for (const pin of matchedPins) {
      pinMap.set(pin.id, pin);
      if (pin.pinId) pinMap.set(pin.pinId, pin);
      if (pin.slug) pinMap.set(pin.slug, pin);
    }

    // Collect all linked PYQ IDs from requested IDs, static nodes, and matched PINs
    const allLinkedPyqIds = new Set(requestedIds);
    for (const node of matchedStatic) {
      if (Array.isArray(node.similarPYQ)) {
        node.similarPYQ.forEach(id => {
          if (id) allLinkedPyqIds.add(id);
        });
      }
    }
    for (const pin of matchedPins) {
      if (Array.isArray(pin.similarPYQ)) {
        pin.similarPYQ.forEach(id => {
          if (id) allLinkedPyqIds.add(id);
        });
      }
    }

    // Query all referenced Mapping PYQs from the database
    let matchedPyqs = [];
    if (allLinkedPyqIds.size > 0) {
      try {
        matchedPyqs = await prisma.mappingPyq.findMany({
          where: { id: { in: Array.from(allLinkedPyqIds) } },
        });
      } catch (e) {
        console.error('[Studio Present] Error fetching mapping PYQs from DB:', e);
      }
    }

    const pyqMap = new Map();
    for (const q of matchedPyqs) {
      pyqMap.set(q.id, q);
    }

    const idOrder = requestedIds.length > 0 ? requestedIds : matchedStatic.map(n => n.id);
    const addedKeys = new Set();

    for (const id of idOrder) {
      if (addedKeys.has(id)) continue;

      if (staticMap.has(id)) {
        const node = staticMap.get(id);
        addedKeys.add(id);
        const locText = node.locatedIn?.stateOrProvince || node.locatedIn?.country || (node.regionScope === 'World' ? 'Global' : 'India');
        const resolvedPyqs = (node.similarPYQ || [])
          .map(qId => pyqMap.get(qId))
          .filter(Boolean);
        const primaryPyq = resolvedPyqs[0] || null;

        deckItems.push({
          id: node.id,
          type: 'mapping',
          title: node.place,
          place: node.place,
          regionScope: node.regionScope || 'India',
          mapCategory: Array.isArray(node.mapCategory) ? node.mapCategory.join(', ') : (node.mapCategory || 'Physical Geography'),
          category: Array.isArray(node.mapCategory) ? node.mapCategory[0] : (node.mapCategory || 'Physical Geography'),
          placeType: node.placeType || 'Geographical Feature',
          locationText: locText,
          locatedIn: node.locatedIn,
          lat: node.lat,
          lng: node.lng,
          shape: Array.isArray(node.shape) ? node.shape : null,
          aliases: node.aliases || [],
          staticFacts: node.staticFacts || [],
          upscAngle: node.upscAngle || null,
          newsHook: node.newsHook || null,
          similarPYQs: resolvedPyqs.length > 0 ? resolvedPyqs : (node.similarPYQ || []),
          resolvedPyq: primaryPyq,
          pyq: primaryPyq,
          imageUrl: node.imageUrl || null,
          imageCaption: `${node.place} Physical Map`,
          priority: node.priority || 'High',
          riverDetails: node.riverDetails || null,
        });
      } else if (pinMap.has(id)) {
        const pin = pinMap.get(id);
        addedKeys.add(id);
        const loc = pin.locatedIn && typeof pin.locatedIn === 'object'
          ? Object.values(pin.locatedIn).filter(Boolean).join(', ')
          : (pin.regionScope === 'World' ? 'World' : 'India');
        const resolvedPyqs = (pin.similarPYQ || [])
          .map(qId => pyqMap.get(qId))
          .filter(Boolean);
        const primaryPyq = resolvedPyqs[0] || null;

        deckItems.push({
          id: pin.id || pin.pinId,
          type: 'mapping',
          title: pin.place,
          place: pin.place,
          regionScope: pin.regionScope || 'India',
          mapCategory: Array.isArray(pin.mapCategory) && pin.mapCategory.length > 0 ? pin.mapCategory.join(', ') : 'Places in News',
          category: Array.isArray(pin.mapCategory) && pin.mapCategory.length > 0 ? pin.mapCategory[0] : 'Places in News',
          placeType: pin.placeType || 'Place in News',
          locationText: loc,
          locatedIn: pin.locatedIn,
          lat: pin.lat || pin.coordinates?.lat,
          lng: pin.lng || pin.coordinates?.lng,
          shape: Array.isArray(pin.shape) ? pin.shape : null,
          aliases: pin.aliases || [],
          staticFacts: Array.isArray(pin.staticFacts) ? pin.staticFacts : [],
          upscAngle: pin.upscAngle || null,
          newsHook: Array.isArray(pin.newsTriggers) && pin.newsTriggers.length > 0 ? pin.newsTriggers[0]?.newsHook : null,
          similarPYQs: resolvedPyqs.length > 0 ? resolvedPyqs : (pin.similarPYQ || []),
          resolvedPyq: primaryPyq,
          pyq: primaryPyq,
          imageUrl: null,
          imageCaption: `${pin.place} Satellite & Map Context`,
          priority: pin.priority || 'High',
        });
      } else if (pyqMap.has(id)) {
        const q = pyqMap.get(id);
        addedKeys.add(id);
        const catList = Array.isArray(q.mapCategory) && q.mapCategory.length > 0 ? q.mapCategory : ['India – rivers, lakes & reservoirs'];
        const isIndia = catList.some(c => c.toLowerCase().includes('india'));

        deckItems.push({
          id: q.id,
          type: 'mapping',
          title: `Mapping PYQ: ${q.exam} ${q.examYear}`,
          place: catList[0] || 'Mapping Question',
          regionScope: isIndia ? 'India' : 'World',
          mapCategory: catList.join(', '),
          category: catList[0],
          placeType: 'Official UPSC PYQ',
          locationText: `${q.exam} ${q.examYear}`,
          stem: q.stem,
          options: q.options || [],
          correctLabel: q.correctLabel || '',
          staticFacts: q.answerText ? [q.answerText] : [],
          pyq: {
            stem: q.stem,
            options: q.options,
            correctLabel: q.correctLabel,
            answerText: q.answerText,
            exam: q.exam,
            examYear: q.examYear,
          },
          imageUrl: null,
          imageCaption: `${q.exam} ${q.examYear} Map Slide`,
          priority: 'High',
        });
      }
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
