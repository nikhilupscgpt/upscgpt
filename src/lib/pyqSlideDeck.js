import { getStructuredExplanation } from './pyqExplanationHelper';
import { normalizeKeywordsList } from './pyqKeywords';
import { CURATED_MAPPING_NODES } from './static-mapping-data';

/**
 * Builds structured presentation slide steps for a given PYQ.
 * The left panel holds the pinned question; the right panel moves
 * through these steps progressively.
 *
 * Supports conditional high-res image slides and on-demand sketch canvas.
 */
export function buildQuestionSteps(q, customAssets = {}) {
  if (!q) return [];
  const { explanationText, analysis } = getStructuredExplanation(q);
  const steps = [];

  const correctLabel = q.correctLabel ? String(q.correctLabel).toUpperCase() : null;
  const options = Array.isArray(q.options) ? q.options : [];
  const correctOpt = options.find(o => String(o.label).toUpperCase() === correctLabel);

  // Collect statement / option verdicts if available
  const verdicts = {};
  if (analysis?.optionBreakdown && Array.isArray(analysis.optionBreakdown)) {
    for (const ob of analysis.optionBreakdown) {
      if (ob.label) {
        verdicts[String(ob.label).toUpperCase()] = ob.verdict || '';
      }
    }
  }

  const imageUrl = q.imageUrl || customAssets.imageUrl || null;
  const imageCaption = q.imageCaption || customAssets.imageCaption || 'High-Resolution Diagram / Map';

  // -------------------------------------------------------------
  // STEP 0: Question Spotlight & Initial Read
  // -------------------------------------------------------------
  steps.push({
    id: 'intro',
    type: 'intro',
    badge: 'STAGE 1 · QUESTION SPOTLIGHT',
    title: 'Question Stem & Statements Framing',
    subtitle: `${q.examName || 'UPSC CSE Pre'} ${q.examYear || ''} · ${q.srcSubject || 'General Studies'} · ${q.srcTopic || 'General'}`,
    showAnswer: false,
    highlightedOption: null,
    verdicts: {},
  });

  const hasStatementBreakdown = Boolean(analysis?.statementBreakdown && Array.isArray(analysis.statementBreakdown) && analysis.statementBreakdown.length > 0);

  // -------------------------------------------------------------
  // STEP 2: Stem Statements Evaluation OR Option Elimination Breakdown
  // (Mutually exclusive: statement-based questions evaluate the statements directly;
  // direct single-choice questions evaluate options a, b, c, d)
  // -------------------------------------------------------------
  if (hasStatementBreakdown) {
    steps.push({
      id: 'statement_breakdown',
      type: 'statement_breakdown',
      badge: 'STAGE 2 · STEM STATEMENTS EVALUATION',
      title: 'Stem Statements Evaluation',
      subtitle: 'Evaluate statutory citations, factual veracity, and examiner traps for each numbered statement',
      items: analysis.statementBreakdown,
      showAnswer: false,
      highlightedOption: null,
      verdicts,
    });
  } else if (analysis?.optionBreakdown && Array.isArray(analysis.optionBreakdown) && analysis.optionBreakdown.length > 0) {
    const chunkSize = 3;
    const totalParts = Math.ceil(analysis.optionBreakdown.length / chunkSize);

    for (let i = 0; i < analysis.optionBreakdown.length; i += chunkSize) {
      const chunk = analysis.optionBreakdown.slice(i, i + chunkSize);
      const partNum = Math.floor(i / chunkSize) + 1;

      // Active verdicts visible up to this chunk
      const activeChunkVerdicts = {};
      const itemsSoFar = analysis.optionBreakdown.slice(0, i + chunkSize);
      for (const item of itemsSoFar) {
        if (item.label) {
          activeChunkVerdicts[String(item.label).toUpperCase()] = item.verdict || '';
        }
      }

      steps.push({
        id: `breakdown_${partNum}`,
        type: 'breakdown',
        badge: totalParts > 1 ? `STAGE 2 · ELIMINATION BREAKDOWN (${partNum}/${totalParts})` : 'STAGE 2 · ELIMINATION BREAKDOWN',
        title: 'Option & Statement Elimination Analysis',
        subtitle: 'Evaluate validity, historical/constitutional accuracy, and distractor traps',
        items: chunk,
        showAnswer: false,
        highlightedOption: null,
        verdicts: activeChunkVerdicts,
      });
    }
  }

  // -------------------------------------------------------------
  // CONDITIONAL STEP: Visual Explainer / Map / Diagram Slide
  // Rendered ONLY if an image exists; completely omitted if not!
  // -------------------------------------------------------------
  if (imageUrl) {
    steps.push({
      id: 'visual_explainer',
      type: 'image',
      badge: 'STAGE 3 · VISUAL EXPLAINER & MAP INSIGHT',
      title: imageCaption,
      subtitle: 'High-resolution diagram: annotate boundaries, river systems, or schematic structures',
      imageUrl,
      caption: imageCaption,
      showAnswer: false,
      highlightedOption: null,
      verdicts,
    });
  }

  // -------------------------------------------------------------
  // CONDITIONAL STEP: On-Demand Blank Sketch Canvas
  // -------------------------------------------------------------
  if (customAssets.hasSketchCanvas) {
    steps.push({
      id: 'sketch_canvas',
      type: 'sketch',
      badge: 'STAGE 3B · FREEHAND DIAGRAM CANVAS',
      title: 'Handwritten Concept Flow & Schematic',
      subtitle: 'Draw freely with XP-Pen tablet stylus',
      showAnswer: false,
      highlightedOption: null,
      verdicts,
    });
  }

  // -------------------------------------------------------------
  // STEP 2: Official Answer & Logic Summary
  // -------------------------------------------------------------
  steps.push({
    id: 'answer',
    type: 'answer',
    badge: 'STAGE 4 · VERIFIED ANSWER & CORE LOGIC',
    title: correctLabel ? `Official Answer: Option (${correctLabel})` : 'Verified Answer & Key Takeaway',
    subtitle: correctOpt ? correctOpt.text : 'Verified official UPSC answer key logic',
    correctLabel,
    explanationText: explanationText || (correctOpt ? correctOpt.text : 'Official UPSC answer verified against official key.'),
    showAnswer: true,
    highlightedOption: correctLabel,
    verdicts,
  });

  // -------------------------------------------------------------
  // STEP 3+: Keywords & Core Concepts (Chunked to fit 1080p)
  // -------------------------------------------------------------
  if (analysis?.keywords && Array.isArray(analysis.keywords) && analysis.keywords.length > 0) {
    const normalized = normalizeKeywordsList(analysis.keywords);
    if (normalized.length > 0) {
      const chunkSize = 3;
      const totalParts = Math.ceil(normalized.length / chunkSize);

      for (let i = 0; i < normalized.length; i += chunkSize) {
        const chunk = normalized.slice(i, i + chunkSize);
        const partNum = Math.floor(i / chunkSize) + 1;

        steps.push({
          id: `keywords_${partNum}`,
          type: 'keywords',
          badge: totalParts > 1 ? `STAGE 5 · CORE CONCEPTS & TERMINOLOGY (${partNum}/${totalParts})` : 'STAGE 5 · CORE CONCEPTS & TERMINOLOGY',
          title: 'High-Yield Prelims Concept Cards',
          subtitle: 'Definitions, constitutional articles, doctrines, and syllabus linkages',
          keywords: chunk,
          showAnswer: true,
          highlightedOption: correctLabel,
          verdicts,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 4+: High-Yield Value Addition (Chunked to fit 1080p)
  // -------------------------------------------------------------
  if (analysis?.valueAddition) {
    let points = [];
    if (typeof analysis.valueAddition === 'string') {
      const rawLines = analysis.valueAddition.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of rawLines) {
        if (line.includes(' • ')) {
          const parts = line.split(/\s*•\s*/).filter(Boolean);
          for (const p of parts) {
            const cleaned = p.replace(/^[•*\-\s]+/, '').trim();
            if (cleaned) points.push(cleaned);
          }
        } else {
          const cleaned = line.replace(/^[•*\-\s]+/, '').trim();
          if (cleaned) points.push(cleaned);
        }
      }
    } else if (Array.isArray(analysis.valueAddition)) {
      for (const card of analysis.valueAddition) {
        if (typeof card === 'string') {
          points.push(card);
        } else if (card && typeof card === 'object') {
          const rawTitle = card.title || card.heading || '';
          const cardTitle = rawTitle ? `[${rawTitle}]` : '';
          const cardBullets = card.bullets || card.points || card.items || [];
          if (Array.isArray(cardBullets) && cardBullets.length > 0) {
            for (const b of cardBullets) {
              const text = typeof b === 'string' ? b : (b?.text || JSON.stringify(b));
              points.push(cardTitle ? `${cardTitle} ${text}` : text);
            }
          } else if (Array.isArray(card.sections)) {
            for (const sec of card.sections) {
              const secHead = (sec.heading || sec.title) ? `(${sec.heading || sec.title})` : '';
              const secPts = sec.points || sec.bullets || [];
              for (const pt of secPts) {
                const ptText = typeof pt === 'string' ? pt : JSON.stringify(pt);
                points.push(`${cardTitle} ${secHead} ${ptText}`.trim());
              }
            }
          } else if (card.description) {
            points.push(cardTitle ? `${cardTitle} ${card.description}` : card.description);
          }
        }
      }
    }

    if (points.length > 0) {
      const chunkSize = 3;
      const totalParts = Math.ceil(points.length / chunkSize);

      for (let i = 0; i < points.length; i += chunkSize) {
        const chunk = points.slice(i, i + chunkSize);
        const partNum = Math.floor(i / chunkSize) + 1;

        steps.push({
          id: `valueAddition_${partNum}`,
          type: 'valueAddition',
          badge: totalParts > 1 ? `STAGE 6 · HIGH-YIELD VALUE ADDITION (${partNum}/${totalParts})` : 'STAGE 6 · HIGH-YIELD VALUE ADDITION',
          title: 'Exhaustive Value Addition & Facts',
          subtitle: 'Crucial dimensions, landmark judgments, constitutional provisions, and facts',
          points: chunk,
          showAnswer: true,
          highlightedOption: correctLabel,
          verdicts,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 5: Current Affairs & In News Connection
  // -------------------------------------------------------------
  if (analysis?.inNews && (analysis.inNews.headline || analysis.inNews.source || typeof analysis.inNews === 'string')) {
    steps.push({
      id: 'inNews',
      type: 'inNews',
      badge: 'STAGE 7 · CONTEMPORARY / CURRENT AFFAIRS LINKAGE',
      title: 'Current Affairs & News Context',
      subtitle: 'Why UPSC chose this theme in this exam year',
      inNews: analysis.inNews,
      showAnswer: true,
      highlightedOption: correctLabel,
      verdicts,
    });
  }

  // -------------------------------------------------------------
  // STEP 6: Interlinked Similar PYQ & Family
  // -------------------------------------------------------------
  if (analysis?.similarPyq && (analysis.similarPyq.stem || typeof analysis.similarPyq === 'string')) {
    steps.push({
      id: 'similarPyq',
      type: 'similarPyq',
      badge: 'STAGE 8 · RECURRING THEME & PYQ FAMILY',
      title: 'Interlinked Previous Year Question',
      subtitle: 'How UPSC tests this recurring theme across multiple examination years',
      similarPyq: analysis.similarPyq,
      showAnswer: true,
      highlightedOption: correctLabel,
      verdicts,
    });
  }

  // -------------------------------------------------------------
  // STEP 7: High-Yield Comparison Matrix Table (if present)
  // -------------------------------------------------------------
  if (analysis?.visualSuggestion && (analysis.visualSuggestion.tableData || analysis.visualSuggestion.caption || analysis.visualSuggestion.title)) {
    steps.push({
      id: 'visual_table',
      type: 'table',
      badge: 'STAGE 9 · HIGH-YIELD COMPARISON MATRIX',
      title: analysis.visualSuggestion.title || 'High-Yield Comparison Matrix',
      subtitle: analysis.visualSuggestion.caption || 'Side-by-side comparative examination framework',
      tableData: analysis.visualSuggestion.tableData || null,
      caption: analysis.visualSuggestion.caption || '',
      showAnswer: true,
      highlightedOption: correctLabel,
      verdicts,
    });
  }

  return steps;
}

/**
 * Builds structured presentation slide steps for a given Thematic Topic Node.
 * Left panel holds the pinned Concept Anchor; right panel moves through deep-dive stages.
 */
export function buildTopicSteps(topic, customAssets = {}) {
  if (!topic) return [];
  const steps = [];

  const imageUrl = topic.imageUrl || customAssets.imageUrl || null;
  const imageCaption = topic.imageCaption || customAssets.imageCaption || topic.title;

  // -------------------------------------------------------------
  // STAGE 1: Thematic Spotlight & Foundational Doctrine
  // -------------------------------------------------------------
  steps.push({
    id: 'topic_spotlight',
    type: 'topic_spotlight',
    badge: 'STAGE 1 · THEMATIC OVERVIEW',
    title: topic.title,
    subtitle: `${topic.domain || 'General Studies'} · ${topic.topic || 'Core Concept'} · ${Array.isArray(topic.gsPapers) ? topic.gsPapers.join(', ') : (topic.gsPapers || 'GS')}`,
    summary: topic.cumulativeSummary || topic.overview || topic.backgroundNote || 'Core syllabus conceptual overview.',
  });

  // -------------------------------------------------------------
  // STAGE 2: Historical & Statutory Evolution
  // -------------------------------------------------------------
  if (topic.backgroundNote && topic.backgroundNote.trim()) {
    steps.push({
      id: 'topic_evolution',
      type: 'topic_evolution',
      badge: 'STAGE 2 · HISTORICAL & STATUTORY EVOLUTION',
      title: 'Genesis, Evolution & Legal Framework',
      subtitle: 'How this doctrine, institution, or concept developed over time',
      content: topic.backgroundNote,
    });
  }

  // -------------------------------------------------------------
  // CONDITIONAL STAGE 3: Visual Explainer (ONLY if imageUrl exists!)
  // -------------------------------------------------------------
  if (imageUrl) {
    steps.push({
      id: 'topic_visual',
      type: 'image',
      badge: 'STAGE 3 · INFOGRAPHIC & DIAGRAM',
      title: imageCaption,
      subtitle: 'Visual reference: flowcharts, geographic maps, and structural schematics',
      imageUrl,
      caption: imageCaption,
    });
  }

  // -------------------------------------------------------------
  // CONDITIONAL STAGE 3B: Freehand Sketch Canvas
  // -------------------------------------------------------------
  if (customAssets.hasSketchCanvas) {
    steps.push({
      id: 'topic_sketch',
      type: 'sketch',
      badge: 'STAGE 3B · FREEHAND CONCEPT SKETCH',
      title: 'Handwritten Flowchart / Mindmap',
      subtitle: 'Draw freely with XP-Pen tablet stylus',
    });
  }

  // -------------------------------------------------------------
  // STAGE 4: Core Dimensions & Value Addition
  // -------------------------------------------------------------
  if (topic.valueAddition && topic.valueAddition.trim()) {
    steps.push({
      id: 'topic_value_add',
      type: 'topic_value_add',
      badge: 'STAGE 4 · HIGH-YIELD VALUE ADDITION',
      title: 'Landmark Cases, Committees & Core Dimensions',
      subtitle: 'Judicial precedents, constitutional articles, and committee recommendations',
      content: topic.valueAddition,
    });
  }

  // -------------------------------------------------------------
  // STAGE 5: Mains Data & Key Facts
  // -------------------------------------------------------------
  if (topic.mainsFacts && topic.mainsFacts.trim()) {
    steps.push({
      id: 'topic_facts',
      type: 'topic_facts',
      badge: 'STAGE 5 · MAINS DATA & KEY FACTS',
      title: 'High-Impact Facts, Data & Case Studies',
      subtitle: 'Statistical backing and factual fodder for answer writing',
      content: topic.mainsFacts,
    });
  }

  // -------------------------------------------------------------
  // STAGE 6: Exam Application & Model Questions
  // -------------------------------------------------------------
  if (topic.possibleQuestions && topic.possibleQuestions.trim()) {
    steps.push({
      id: 'topic_questions',
      type: 'topic_questions',
      badge: 'STAGE 6 · EXAM APPLICATION & MODEL QUESTIONS',
      title: 'Exam Traps & Model Mains Questions',
      subtitle: 'How to structure high-scoring answers on this topic',
      content: topic.possibleQuestions,
    });
  }

  // Append any custom outline steps if present
  if (Array.isArray(customAssets.customSlides)) {
    for (const cs of customAssets.customSlides) {
      steps.push(cs);
    }
  }

  return steps;
}

// ---------------------------------------------------------------------------
// MAPPING LECTURE STUDIO DECK BUILDER (Spatial & Geo-Intelligence)
// Stages: 1. Spatial Overview -> 2. Visual Map Slide -> 3. High-Yield Facts
//         -> 4. UPSC Examiner Traps -> 5. Associated Mapping PYQ
// ---------------------------------------------------------------------------
export function buildMappingSteps(item, customAssets = {}) {
  if (!item) return [];
  const steps = [];

  const imageUrl = item.imageUrl || customAssets.imageUrl || null;
  const imageCaption = item.imageCaption || customAssets.imageCaption || `${item.place || item.title || 'Location'} Spatial Map`;
  const locationText = item.locatedIn 
    ? (typeof item.locatedIn === 'object' ? Object.values(item.locatedIn).filter(Boolean).join(', ') : String(item.locatedIn))
    : (item.location || item.state || item.country || 'India');
  const categories = Array.isArray(item.mapCategory) ? item.mapCategory.join(', ') : (item.mapCategory || item.category || 'Physical Geography');

  // Look up curated riverDetails if not passed directly
  const matchedCurated = (item?.id || item?.slug || item?.place)
    ? CURATED_MAPPING_NODES.find(
        (n) => n.id === item.id || (item.slug && n.slug === item.slug) || (item.place && n.place === item.place)
      )
    : null;
  const rd = item?.riverDetails || matchedCurated?.riverDetails || null;

  // -------------------------------------------------------------
  // BRANCH A: Dedicated 9-Point Humanized River Slide Sequence
  // -------------------------------------------------------------
  if (rd) {
    // STAGE 1: Course, Origin & States
    steps.push({
      id: 'river_course',
      type: 'river_course',
      badge: 'STAGE 1 · WHERE IT STARTS & ENDS',
      title: `${item.place} — Origin, Course & Basin States`,
      subtitle: 'Where it starts, how long it is, and the states it passes through',
      riverDetails: rd,
      item,
      locationText,
      categories,
    });

    // STAGE 2: Left-Bank Tributaries (Cyan Layer)
    steps.push({
      id: 'river_left_tributaries',
      type: 'river_left_tributaries',
      badge: 'STAGE 2 · LEFT-BANK TRIBUTARIES',
      title: `${item.place} — Left-Bank Tributaries`,
      subtitle: 'Which tributaries join from the left bank (and key facts to remember)',
      riverDetails: rd,
      item,
    });

    // STAGE 3: Right-Bank Tributaries (Amber Layer)
    steps.push({
      id: 'river_right_tributaries',
      type: 'river_right_tributaries',
      badge: 'STAGE 3 · RIGHT-BANK TRIBUTARIES',
      title: `${item.place} — Right-Bank Tributaries`,
      subtitle: 'Which tributaries join from the right bank (and key facts to remember)',
      riverDetails: rd,
      item,
    });

    // STAGE 4: Sangams & Major Dams (with States)
    steps.push({
      id: 'river_dams_confluences',
      type: 'river_dams_confluences',
      badge: 'STAGE 4 · IMPORTANT SANGAMS & MAJOR DAMS',
      title: `${item.place} — Confluences & Major Dams`,
      subtitle: 'Where tributaries meet the main river and major dams (with their states)',
      riverDetails: rd,
      item,
    });

    // STAGE 5: National Parks, Historic Cities & Indicator Species
    steps.push({
      id: 'river_ecology_towns',
      type: 'river_ecology_towns',
      badge: 'STAGE 5 · PARKS, TOWNS & ANIMALS',
      title: `${item.place} — National Parks, Cities & River Wildlife`,
      subtitle: 'National parks it flows through, historical towns on its banks, and animals/birds',
      riverDetails: rd,
      item,
    });

    // STAGE 6: Linked UPSC Prelims PYQ
    if (item.pyq || item.resolvedPyq || (Array.isArray(item.similarPYQs) && item.similarPYQs.length > 0) || (Array.isArray(matchedCurated?.similarPYQ) && matchedCurated.similarPYQ.length > 0)) {
      const pyqObj = item.pyq || item.resolvedPyq || (Array.isArray(item.similarPYQs) && item.similarPYQs.length > 0 ? item.similarPYQs[0] : null) || (Array.isArray(matchedCurated?.similarPYQ) && matchedCurated.similarPYQ.length > 0 ? matchedCurated.similarPYQ[0] : null);
      let pyqFormatted = typeof pyqObj === 'string'
        ? { stem: `Previous UPSC examination question linked to ${item.place} (${pyqObj})`, exam: 'UPSC CSE Pre' }
        : { ...pyqObj };

      if (typeof pyqFormatted.options === 'string') {
        try {
          pyqFormatted.options = JSON.parse(pyqFormatted.options);
        } catch {
          pyqFormatted.options = [];
        }
      }

      steps.push({
        id: 'map_pyq',
        type: 'mapping_pyq',
        badge: 'STAGE 6 · PAST UPSC PRELIMS QUESTION',
        title: 'How UPSC Asked About This River',
        subtitle: `${pyqFormatted.exam || 'UPSC CSE Pre'} ${pyqFormatted.examYear || ''}`.trim(),
        pyq: pyqFormatted,
      });
    }

    // STAGE 7: Custom Diagram / Satellite Ingestion Slide (if custom image attached)
    if (imageUrl) {
      steps.push({
        id: 'map_visual',
        type: 'image',
        badge: 'STAGE 7 · MAP DIAGRAM & SATELLITE VIEW',
        title: imageCaption,
        subtitle: 'Draw freely on the river course and boundaries with your stylus',
        imageUrl,
        caption: imageCaption,
      });
    }

    return steps;
  }

  // -------------------------------------------------------------
  // BRANCH B: Standard Mapping Slide Sequence (Hills, Seas, PIN)
  // -------------------------------------------------------------
  // STAGE 1: Location & Overview
  steps.push({
    id: 'map_overview',
    type: 'mapping_overview',
    badge: 'STAGE 1 · BASIC LOCATION & OVERVIEW',
    title: item.place || item.title || 'Location Overview',
    subtitle: `${item.regionScope || 'India'} · ${categories} · ${locationText}`,
    item,
    locationText,
    categories,
  });

  // STAGE 2: Important Facts for Prelims
  const facts = Array.isArray(item.staticFacts) 
    ? item.staticFacts 
    : (typeof item.staticFacts === 'string' && item.staticFacts.trim() ? [item.staticFacts] : []);

  if (facts.length > 0) {
    steps.push({
      id: 'map_facts',
      type: 'mapping_facts',
      badge: 'STAGE 2 · IMPORTANT FACTS FOR PRELIMS',
      title: 'Key Facts & What to Remember',
      subtitle: 'Important geography facts, terrain, and background for prelims',
      facts,
    });
  }

  // STAGE 3: Common Mistakes & Traps
  if (item.upscAngle || item.newsHook) {
    steps.push({
      id: 'map_angle',
      type: 'mapping_angle',
      badge: 'STAGE 3 · COMMON MISTAKES & UPSC TRAPS',
      title: "Examiner's Trap & Ordering Traps",
      subtitle: 'Watch out for North-to-South ordering, border questions, and news context',
      upscAngle: item.upscAngle,
      newsHook: item.newsHook,
    });
  }

  // STAGE 4: Linked UPSC Prelims PYQ
  if (item.pyq || item.resolvedPyq || (Array.isArray(item.similarPYQs) && item.similarPYQs.length > 0)) {
    const pyqObj = item.pyq || item.resolvedPyq || item.similarPYQs[0];
    let pyqFormatted = typeof pyqObj === 'string'
      ? { stem: `Previous UPSC examination question linked to ${item.place} (${pyqObj})`, exam: 'UPSC CSE Pre' }
      : { ...pyqObj };

    if (typeof pyqFormatted.options === 'string') {
      try {
        pyqFormatted.options = JSON.parse(pyqFormatted.options);
      } catch {
        pyqFormatted.options = [];
      }
    }

    steps.push({
      id: 'map_pyq',
      type: 'mapping_pyq',
      badge: 'STAGE 4 · PAST UPSC PRELIMS QUESTION',
      title: 'How UPSC Tested This Location',
      subtitle: `${pyqFormatted.exam || 'UPSC CSE Pre'} ${pyqFormatted.examYear || ''}`.trim(),
      pyq: pyqFormatted,
    });
  }

  // STAGE 5: Custom Diagram / Satellite Ingestion Slide (if custom image attached)
  if (imageUrl) {
    steps.push({
      id: 'map_visual',
      type: 'image',
      badge: 'STAGE 5 · CUSTOM DIAGRAM & SATELLITE OVERLAY',
      title: imageCaption,
      subtitle: 'Annotate river courses, mountain passes, buffer zones & borders with XP-Pen stylus',
      imageUrl,
      caption: imageCaption,
    });
  }

  return steps;
}
