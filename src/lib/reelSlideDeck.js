import { getStructuredExplanation } from './pyqExplanationHelper';
import { normalizeKeywordsList } from './pyqKeywords';
import { CURATED_MAPPING_NODES } from './static-mapping-data';

/**
 * Builds a streamlined 3-slide vertical (9:16) Reel / Short deck for a UPSC PYQ:
 * 1. Question & Options
 * 2. Statement / Option Analysis + Official Answer Key
 * 3. High-Yield Keywords & Exam Takeaways
 * (Omits bulky Value Addition, Similar PYQs, and In-News blocks to keep Reels punchy)
 */
export function buildPyqReelSteps(q, customAssets = {}) {
  if (!q) return [];
  const { explanationText, analysis } = getStructuredExplanation(q);
  const steps = [];

  const correctLabel = q.correctLabel ? String(q.correctLabel).toUpperCase() : null;
  const options = Array.isArray(q.options) ? q.options : [];
  const correctOpt = options.find((o) => String(o.label).toUpperCase() === correctLabel);

  const hasStatementBreakdown = Boolean(
    analysis?.statementBreakdown &&
      Array.isArray(analysis.statementBreakdown) &&
      analysis.statementBreakdown.length > 0
  );
  const hasOptionBreakdown = Boolean(
    analysis?.optionBreakdown &&
      Array.isArray(analysis.optionBreakdown) &&
      analysis.optionBreakdown.length > 0
  );

  // -------------------------------------------------------------
  // SLIDE 1: QUESTION & OPTIONS
  // -------------------------------------------------------------
  steps.push({
    id: 'reel_question',
    type: 'reel_question',
    tabLabel: '1. Question',
    badge: `${q.examName || 'UPSC CSE'} ${q.examYear || ''} · ${q.srcSubject || 'GS'}`,
    title: q.srcTopic || q.srcSubject || 'UPSC Prelims Challenge',
    correctLabel,
    correctOptionText: correctOpt ? correctOpt.text : null,
  });

  // -------------------------------------------------------------
  // SLIDE 2: STATEMENT / OPTION ANALYSIS + ANSWER KEY
  // -------------------------------------------------------------
  steps.push({
    id: 'reel_analysis',
    type: 'reel_analysis',
    tabLabel: '2. Statement Analysis',
    badge: hasStatementBreakdown ? 'STATEMENT ANALYSIS' : 'ELIMINATION ANALYSIS',
    title: hasStatementBreakdown ? 'Stem Statements Evaluation' : 'Option Breakdown & Answer',
    isStatementMode: hasStatementBreakdown,
    items: hasStatementBreakdown
      ? analysis.statementBreakdown
      : hasOptionBreakdown
      ? analysis.optionBreakdown
      : [],
    correctLabel,
    correctOptionText: correctOpt ? correctOpt.text : null,
    explanationText:
      explanationText ||
      (correctOpt ? correctOpt.text : 'Official UPSC verified answer.'),
  });

  // -------------------------------------------------------------
  // SLIDE 3: HIGH-YIELD KEYWORDS
  // -------------------------------------------------------------
  const normalizedKeywords =
    analysis?.keywords && Array.isArray(analysis.keywords)
      ? normalizeKeywordsList(analysis.keywords)
      : [];

  steps.push({
    id: 'reel_keywords',
    type: 'reel_keywords',
    tabLabel: '3. Keywords',
    badge: 'HIGH-YIELD KEYWORDS',
    title: 'Key Concepts to Remember',
    keywords: normalizedKeywords.slice(0, 4),
    fallbackTakeaway:
      explanationText ||
      (Array.isArray(analysis?.valueAddition) && analysis.valueAddition[0]) ||
      'Master core statutory definitions and elimination anchors for UPSC Prelims.',
    correctLabel,
  });

  // Optional visual map/diagram slide if attached
  const imageUrl = q.imageUrl || customAssets.imageUrl || null;
  if (imageUrl) {
    steps.push({
      id: 'reel_visual',
      type: 'reel_visual',
      tabLabel: '4. Diagram',
      badge: 'VISUAL EXPLAINER',
      title: q.imageCaption || customAssets.caption || 'Map & Diagram Insight',
      imageUrl,
    });
  }

  return steps;
}

/**
 * Builds a streamlined 3-slide vertical (9:16) Reel / Short deck for a Mapping / River node:
 * 1. Map + Location / River Hook
 * 2. Tributaries / Core Spatial Analysis
 * 3. Keywords & Common UPSC Examiner Trap
 */
export function buildMappingReelSteps(item, customAssets = {}) {
  if (!item) return [];
  const steps = [];

  let rd = item.riverDetails || null;
  if (!rd && (item.id || item.place || item.title)) {
    const matchedStatic = CURATED_MAPPING_NODES.find(
      (n) =>
        n.id === item.id ||
        (n.place &&
          (n.place === item.place || n.place === item.title) &&
          n.riverDetails)
    );
    if (matchedStatic?.riverDetails) {
      rd = matchedStatic.riverDetails;
    }
  }

  const placeName = item.place || item.title || 'Mapping Spotlight';

  // SLIDE 1: MAP & LOCATION HOOK
  steps.push({
    id: 'reel_map_hook',
    type: 'reel_map_hook',
    tabLabel: '1. Map & Hook',
    badge: `${item.regionScope || 'India'} · ${item.placeType || 'Atlas Node'}`,
    title: placeName,
    riverDetails: rd,
    locationText: item.locationText || 'India',
    stem: item.stem || item.pyq?.stem || null,
    options: item.options || item.pyq?.options || [],
    mapLayer: 'course',
  });

  // SLIDE 2: TRIBUTARIES OR KEY SPATIAL ANALYSIS
  steps.push({
    id: 'reel_map_analysis',
    type: 'reel_map_analysis',
    tabLabel: '2. Analysis',
    badge: rd ? 'TRIBUTARIES & BASIN ANALYSIS' : 'SPATIAL BREAKDOWN',
    title: rd ? `${placeName}: Left & Right Bank` : `${placeName}: Key Facts`,
    riverDetails: rd,
    staticFacts: Array.isArray(item.staticFacts) ? item.staticFacts.slice(0, 4) : [],
    correctLabel: item.correctLabel || item.pyq?.correctLabel || null,
    answerText: item.pyq?.answerText || null,
    mapLayer: rd ? 'left_tributaries' : 'overview',
  });

  // SLIDE 3: KEYWORDS, PROTECTED AREAS & UPSC TRAP
  steps.push({
    id: 'reel_map_keywords',
    type: 'reel_map_keywords',
    tabLabel: '3. Keywords & Trap',
    badge: 'KEYWORDS & EXAMINER TRAP',
    title: `${placeName}: High-Yield Anchor`,
    riverDetails: rd,
    upscTrap:
      rd?.commonMistake ||
      item.upscAngle ||
      item.newsHook ||
      'Frequently tested in North-to-South / West-to-East spatial arrangement questions.',
    aliases: Array.isArray(item.aliases) ? item.aliases : [],
    mapLayer: rd ? 'dams_confluences' : 'overview',
  });

  const imageUrl = item.imageUrl || customAssets.imageUrl || null;
  if (imageUrl) {
    steps.push({
      id: 'reel_visual',
      type: 'reel_visual',
      tabLabel: '4. Diagram',
      badge: 'MAP DIAGRAM',
      title: item.imageCaption || `${placeName} Map`,
      imageUrl,
    });
  }

  return steps;
}
