import { getStructuredExplanation } from './pyqExplanationHelper';
import { normalizeKeywordsList } from './pyqKeywords';

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

  // -------------------------------------------------------------
  // STEP 1+: Elimination Breakdown (Statement by statement)
  // -------------------------------------------------------------
  if (analysis?.optionBreakdown && Array.isArray(analysis.optionBreakdown) && analysis.optionBreakdown.length > 0) {
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
      points = analysis.valueAddition.map(item => {
        if (typeof item === 'string') return item;
        return item.title ? `${item.title}: ${item.description || ''}` : JSON.stringify(item);
      });
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
