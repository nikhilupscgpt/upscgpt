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
  const imageCaption = q.imageCaption || customAssets.imageCaption || 'Diagram';

  // -------------------------------------------------------------
  // STEP 0: Question Spotlight & Initial Read
  // -------------------------------------------------------------
  steps.push({
    id: 'intro',
    type: 'intro',
    label: 'The question',
    title: 'Read the question',
    subtitle: [q.srcSubject, q.srcTopic, /\n\s*(?:[1-6]|I{1,3}|IV)\s*[.:)]/.test(String(q.stem || '')) ? 'Statement-based' : null].filter(Boolean).join(' · '),
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
      label: 'Each statement',
      title: 'Checking each statement',
      subtitle: 'True or false, and where the trap is',
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
        label: 'Option by option',
        title: totalParts > 1 ? `Option by option (${partNum} of ${totalParts})` : 'Option by option',
        subtitle: 'Why each one is right or wrong',
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
      label: 'Diagram',
      title: imageCaption,
      subtitle: "Let's mark it on the diagram",
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
      label: 'Whiteboard',
      title: "Let's draw it out",
      subtitle: null,
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
    label: 'The answer',
    title: !correctLabel
      ? 'The answer'
      : correctOpt && String(correctOpt.text).length <= 40
        ? `Answer: (${correctLabel}) ${correctOpt.text}`
        : `Answer: (${correctLabel})`,
    subtitle: correctOpt && String(correctOpt.text).length > 40 ? correctOpt.text : null,
    correctLabel,
    explanationText: explanationText || (correctOpt ? correctOpt.text : 'As per the official UPSC answer key.'),
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
          label: 'Key terms',
          title: totalParts > 1 ? `Key terms to know (${partNum} of ${totalParts})` : 'Key terms to know',
          subtitle: null,
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
          label: 'Beyond this question',
          title: totalParts > 1 ? `Beyond this question (${partNum} of ${totalParts})` : 'Beyond this question',
          subtitle: 'Related points UPSC can ask next',
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
      label: 'Why now',
      title: q.examYear ? `Why UPSC asked this in ${q.examYear}` : 'Why this was in the news',
      subtitle: null,
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
      label: 'Asked before',
      title: 'UPSC has asked this before',
      subtitle: null,
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
      label: 'At a glance',
      title: analysis.visualSuggestion.title || 'At a glance',
      subtitle: analysis.visualSuggestion.caption || null,
      tableData: analysis.visualSuggestion.tableData || null,
      caption: analysis.visualSuggestion.caption || '',
      showAnswer: true,
      highlightedOption: correctLabel,
      verdicts,
    });
  }

  return numberSteps(steps);
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
    label: 'Overview',
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
      label: 'Background',
      title: 'How it came about',
      subtitle: null,
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
      label: 'Diagram',
      title: imageCaption,
      subtitle: null,
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
      label: 'Whiteboard',
      title: "Let's draw it out",
      subtitle: null,
    });
  }

  // -------------------------------------------------------------
  // STAGE 4: Core Dimensions & Value Addition
  // -------------------------------------------------------------
  if (topic.valueAddition && topic.valueAddition.trim()) {
    steps.push({
      id: 'topic_value_add',
      type: 'topic_value_add',
      label: 'Key points',
      title: 'Key points to remember',
      subtitle: 'Cases, committees and provisions worth quoting',
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
      label: 'Facts & data',
      title: 'Facts and data for your answers',
      subtitle: null,
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
      label: 'Practice',
      title: 'Questions to practise',
      subtitle: null,
      content: topic.possibleQuestions,
    });
  }

  // Append any custom outline steps if present
  if (Array.isArray(customAssets.customSlides)) {
    for (const cs of customAssets.customSlides) {
      steps.push(cs);
    }
  }

  return numberSteps(steps);
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
  const imageCaption = item.imageCaption || customAssets.imageCaption || `${item.place || item.title || 'Location'} on the map`;
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
      label: 'Course',
      title: `${item.place}: where it rises and flows`,
      subtitle: 'Source, length and the states it flows through',
      riverDetails: rd,
      item,
      locationText,
      categories,
    });

    // STAGE 2: Left-Bank Tributaries (Cyan Layer)
    steps.push({
      id: 'river_left_tributaries',
      type: 'river_left_tributaries',
      label: 'Left bank',
      title: 'Left-bank tributaries',
      subtitle: `Rivers that join the ${item.place} from the left`,
      riverDetails: rd,
      item,
    });

    // STAGE 3: Right-Bank Tributaries (Amber Layer)
    steps.push({
      id: 'river_right_tributaries',
      type: 'river_right_tributaries',
      label: 'Right bank',
      title: 'Right-bank tributaries',
      subtitle: `Rivers that join the ${item.place} from the right`,
      riverDetails: rd,
      item,
    });

    // STAGE 4: Sangams & Major Dams (with States)
    steps.push({
      id: 'river_dams_confluences',
      type: 'river_dams_confluences',
      label: 'Sangams & dams',
      title: 'Where rivers meet, and the big dams',
      subtitle: 'Sangams and major dams, with their states',
      riverDetails: rd,
      item,
    });

    // STAGE 5: National Parks, Historic Cities & Indicator Species
    steps.push({
      id: 'river_ecology_towns',
      type: 'river_ecology_towns',
      label: 'Parks, towns & wildlife',
      title: 'Parks, towns and wildlife along the river',
      subtitle: null,
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
        label: 'Asked before',
        title: 'How UPSC asked about this river',
        subtitle: `${pyqFormatted.exam || 'UPSC CSE Pre'} ${pyqFormatted.examYear || ''}`.trim(),
        pyq: pyqFormatted,
      });
    }

    // STAGE 7: Custom Diagram / Satellite Ingestion Slide (if custom image attached)
    if (imageUrl) {
      steps.push({
        id: 'map_visual',
        type: 'image',
        label: 'Map',
        title: imageCaption,
        subtitle: null,
        imageUrl,
        caption: imageCaption,
      });
    }

    return numberSteps(steps);
  }

  // -------------------------------------------------------------
  // BRANCH B: Standard Mapping Slide Sequence (Hills, Seas, PIN)
  // -------------------------------------------------------------
  // STAGE 1: Location & Overview
  steps.push({
    id: 'map_overview',
    type: 'mapping_overview',
    label: 'Location',
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
      label: 'Key facts',
      title: 'What to remember',
      subtitle: null,
      facts,
    });
  }

  // STAGE 3: Common Mistakes & Traps
  if (item.upscAngle || item.newsHook) {
    steps.push({
      id: 'map_angle',
      type: 'mapping_angle',
      label: 'Traps',
      title: 'Where students slip up',
      subtitle: 'Common mistakes, and how UPSC frames it',
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
      label: 'Asked before',
      title: 'How UPSC asked about this place',
      subtitle: `${pyqFormatted.exam || 'UPSC CSE Pre'} ${pyqFormatted.examYear || ''}`.trim(),
      pyq: pyqFormatted,
    });
  }

  // STAGE 5: Custom Diagram / Satellite Ingestion Slide (if custom image attached)
  if (imageUrl) {
    steps.push({
      id: 'map_visual',
      type: 'image',
      label: 'Map',
      title: imageCaption,
      subtitle: null,
      imageUrl,
      caption: imageCaption,
    });
  }

  return numberSteps(steps);
}

/**
 * Gives each step a small label like "3 of 9 · Key terms", so numbers never skip
 * when a stage has no data. Steps that already carry a badge (custom slides) keep it.
 */
export function numberSteps(steps) {
  const total = steps.length;
  return steps.map((st, i) => (st.badge && !st.label ? st : { ...st, badge: `${i + 1} of ${total} · ${st.label || 'Slide'}` }));
}
