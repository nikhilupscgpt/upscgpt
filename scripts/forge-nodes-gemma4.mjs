import 'dotenv/config';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();
const WORKER_URL = (process.env.CLOUDFLARE_PYQ_WORKER_URL || 'https://upscgpt-pyq-ai-bot.upscgpt-ai.workers.dev').replace(/\/$/, '');
const SECRET = process.env.INGEST_SECRET || process.env.INTERNAL_USAGE_SECRET;
const MODEL_ID = process.env.FORGE_MODEL || '@cf/google/gemma-4-26b-a4b-it';

function buildPromptForNode(node) {
  const isGeoOptional = node.domain === 'OPTIONAL_GEOGRAPHY';
  const existingMeta = node.metadata || {};
  const existingThemes = Array.isArray(existingMeta.keyThemes) ? existingMeta.keyThemes.slice(0, 8).join(', ') : '';

  const systemPrompt = isGeoOptional
    ? `You are a senior UPSC CSE Geography Optional Faculty. Produce fact-dense, authoritative, academic UPSC Geography Optional study notes in strict JSON format.
ABSOLUTE RULES:
1. NEVER write generic filler sentences like "Core operational facet", "Candidates should substantiate", or "Mastering this node requires".
2. NEVER use generic keys like "Dimension_1", "Challenge_1", or "Term_1". Always use descriptive snake_case keys (e.g., "davisian_cyclical_postulate", "penckian_morphological_system", "static_base_level_critique").
3. Name SPECIFIC geographers/scholars with years/works (e.g., W.M. Davis 1899, Walther Penck 1924, L.C. King 1953, Strahler, Chorley, Thornbury, Savindra Singh, R.L. Singh), specific geomorphic/climatic/spatial equations or classification criteria, real global landforms/regions, and concrete Indian regional examples.
4. Return ONLY a valid JSON object matching the exact schema requested. No markdown fences outside JSON.`
    : `You are a senior UPSC CSE Prelims & Mains Subject Faculty. Produce fact-dense, authoritative, exam-ready UPSC study notes in strict JSON format.
ABSOLUTE RULES:
1. NEVER write generic filler or meta-advice like "Candidates should focus on", "Core operational facet", or "Substantiate with constitutional provisions".
2. NEVER use generic keys like "Dimension_1", "Challenge_1", or "Term_1". Always use descriptive snake_case keys (e.g., "statutory_age_dichotomy", "family_enterprise_loophole", "agrarian_distress_linkage").
3. WRITE the exact Constitutional Articles, Statutory Acts (with section numbers & years), Supreme Court judgments (case name & year), Committee/Commission reports (e.g., 2nd ARC, Punchhi, Sarkaria, Verma, NITI Aayog), international treaties/conventions (with India's ratification status), and official statistics/indices (NFHS-5, NCRB, ILO, Economic Survey, Census 2011).
4. Return ONLY a valid JSON object matching the exact schema requested. No markdown fences outside JSON.`;

  const userPrompt = `Generate complete, fact-dense UPSC JSON content for the following syllabus node:
- Title: "${node.title}"
- Domain: "${node.domain}"
- Module / Topic: "${node.topic}"
- Papers: "${(node.gsPapers || ['General Studies']).join(', ')}"
${existingThemes ? `- Anchor Concepts: ${existingThemes}` : ''}

Return ONLY valid JSON with this exact structure (replace all sub-keys like <descriptive_snake_case_key_1> with real topic-specific descriptive snake_case names):
{
  "cumulativeSummary": "3-4 dense, fact-packed sentences summarizing the core doctrine/mechanism, key statutory/theoretical milestones, and primary contemporary issue (zero meta-advice).",
  "metadata": {
    "keyThemes": ["6 to 8 specific technical terms, acts, articles, scholars, or doctrines"],
    "subtopics": ["6 to 8 specific syllabus sub-dimensions with concrete facts/names"],
    "examAngles": [
      "3 specific UPSC Mains-style directive questions (Critically examine / Discuss / Evaluate) tailored to this node"
    ],
    "linkedConcepts": ["3 to 4 closely linked UPSC syllabus concepts"],
    "examRelevance": "High",
    "importanceNote": "1 specific sentence on what exact trap or analytical distinction UPSC tests on this topic."
  },
  "prelimsNote": {
    "${isGeoOptional ? 'core_theory_and_postulates' : 'constitutional_and_statutory_framework'}": "Specific Articles, Acts, sections, years, or theoretical postulates with scholar names and definitions.",
    "${isGeoOptional ? 'key_scholars_and_models' : 'institutional_mechanisms_and_mandates'}": [
      "4 to 5 bullet strings with exact names, years, mandates, or model mechanisms"
    ],
    "${isGeoOptional ? 'indian_and_global_landform_examples' : 'landmark_judgments_committees_and_treaties'}": [
      "3 to 4 bullet strings naming specific SC cases/committees/conventions or Indian regional examples with exact details"
    ],
    "prelims_traps_and_key_facts": {
      "<specific_term_or_clause_1>": "Fact-dense explanation including common UPSC Prelims statement trap.",
      "<specific_term_or_clause_2>": "Fact-dense explanation with exact threshold/exception/authority.",
      "<specific_term_or_clause_3>": "Fact-dense explanation with empirical or comparative fact."
    }
  },
  "mainsNote": {
    "introduction": "2-3 authoritative sentences defining the concept with a constitutional article, statutory anchor, scholar quote, or official data point.",
    "structural_dimensions_and_mechanisms": {
      "<descriptive_dimension_key_1>": "Concrete analysis with specific facts, provisions, or process steps.",
      "<descriptive_dimension_key_2>": "Concrete analysis with empirical data, regional evidence, or institutional working.",
      "<descriptive_dimension_key_3>": "Concrete analysis with comparative or inter-sectoral linkage."
    },
    "critical_challenges_and_critiques": {
      "<descriptive_challenge_key_1>": "Specific structural, legal, or theoretical limitation with real example.",
      "<descriptive_challenge_key_2>": "Specific implementation, fiscal, or methodological bottleneck.",
      "<descriptive_challenge_key_3>": "Contemporary dilemma or emerging stress point."
    },
    "way_forward_and_reforms": {
      "committee_and_scholarly_synthesis": "Specific recommendation from a named Commission/Committee or modern paradigm.",
      "policy_and_institutional_action": "Actionable reform with existing scheme or best-practice model."
    },
    "conclusion": "2-sentence high-impact Mains conclusion linking the topic to constitutional vision, SDGs, or sustainable regional development."
  },
  "facts": [
    "4 specific empirical data points, official statistics (Census/NFHS/ILO/Economic Survey/ISFR), or quantitative thresholds ready for Mains answers"
  ],
  "valueAddition": "Markdown block with 3 high-scoring Mains value-additions: (1) Constitutional/Theoretical Anchor, (2) Committee/Scholarly Quote or Recommendation, (3) Best-Practice Governance Model or Diagrammatic Framework.",
  "caseStudies": [
    {
      "title": "Name of specific Indian State/District/Global Case Study or Landmark SC Judgment (with year)",
      "content": "2-3 sentences explaining the exact intervention, factual context, and measurable outcome/lesson."
    },
    {
      "title": "Name of second specific Case Study or Regional Illustration",
      "content": "2-3 sentences explaining the exact factual context and takeaway for UPSC Mains."
    }
  ]
}`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

async function forgeSingleNode(node) {
  const messages = buildPromptForNode(node);
  const t0 = Date.now();

  const res = await fetch(`${WORKER_URL}/admin/forge-node`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ingest-secret': SECRET,
    },
    body: JSON.stringify({
      model: MODEL_ID,
      messages,
      max_tokens: 3800,
      temperature: 0.2,
      extraOpts: {
        chat_template_kwargs: { enable_thinking: false },
      },
    }),
  });

  const data = await res.json();
  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);

  if (!res.ok || !data?.ok || !data?.parsed) {
    throw new Error(`Worker returned ok=${data?.ok} status=${res.status}: ${data?.error || JSON.stringify(data?.raw || '').slice(0, 300)}`);
  }

  const p = data.parsed;
  const examAngles = Array.isArray(p.metadata?.examAngles)
    ? p.metadata.examAngles
    : (Array.isArray(p.metadata?.pyqAngles) ? p.metadata.pyqAngles : []);

  const mergedMeta = {
    ...(node.metadata || {}),
    ...(p.metadata || {}),
    nodeId: node.slug || node.id,
    title: node.title,
    domain: node.domain,
    gsPaper: node.gsPapers && node.gsPapers.length > 0 ? node.gsPapers : ['GS1'],
    examAngles,
    pyqAngles: examAngles,
    contentStatus: 'GEMMA4_FORGED',
  };

  const factsArr = Array.isArray(p.facts) ? p.facts.filter(Boolean) : [];
  const caseStudiesArr = Array.isArray(p.caseStudies) ? p.caseStudies.filter(Boolean) : [];
  const possibleQuestionsMd = examAngles.length > 0
    ? examAngles.map((q, idx) => `**Q${idx + 1}.** ${q}`).join('\n\n')
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.issue.update({
      where: { id: node.id },
      data: {
        cumulativeSummary: p.cumulativeSummary || node.cumulativeSummary,
        metadata: mergedMeta,
        prelimsNote: p.prelimsNote || node.prelimsNote,
        mainsNote: p.mainsNote || node.mainsNote,
        ...(p.valueAddition ? { valueAddition: String(p.valueAddition) } : {}),
        ...(possibleQuestionsMd ? { possibleQuestions: possibleQuestionsMd } : {}),
        lastUpdatedAt: new Date(),
      },
    });

    if (factsArr.length > 0 || caseStudiesArr.length > 0) {
      await tx.nodeContent.upsert({
        where: { issueId: node.id },
        update: {
          ...(factsArr.length > 0 ? { facts: factsArr } : {}),
          ...(caseStudiesArr.length > 0 ? { caseStudies: caseStudiesArr } : {}),
          updatedAt: new Date(),
        },
        create: {
          issueId: node.id,
          facts: factsArr,
          caseStudies: caseStudiesArr,
          recommendations: [],
          status: 'PUBLISHED',
        },
      });
    }
  });

  return { slug: node.slug, elapsedSec, usage: data.usage, parsed: p };
}

async function main() {
  if (!SECRET) {
    throw new Error('Missing INGEST_SECRET / INTERNAL_USAGE_SECRET in .env');
  }

  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const gsOnly = args.includes('--gs-only');
  const slugs = args.filter((a) => !a.startsWith('--'));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 175;

  let targetNodes = [];

  if (slugs.length > 0) {
    targetNodes = await prisma.issue.findMany({
      where: { slug: { in: slugs } },
    });
  } else if (gsOnly) {
    targetNodes = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Issue"
       WHERE "metadata"->>'contentStatus' = 'BASELINE_SYNTHESIZED'
         AND "domain" != 'OPTIONAL_GEOGRAPHY'
       ORDER BY "orderIndex" ASC
       LIMIT ${limit}`
    );
  } else {
    targetNodes = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Issue"
       WHERE "metadata"->>'contentStatus' = 'BASELINE_SYNTHESIZED'
       ORDER BY CASE WHEN "domain" != 'OPTIONAL_GEOGRAPHY' THEN 0 ELSE 1 END, "orderIndex" ASC
       LIMIT ${limit}`
    );
  }

  console.log(`🔥 Forging ${targetNodes.length} nodes via Cloudflare Workers AI (${MODEL_ID})...`);

  let totalNeurons = 0;
  let completed = 0;

  for (const node of targetNodes) {
    try {
      const out = await forgeSingleNode(node);
      const neurons = Number(out.usage?.neurons || 0);
      totalNeurons += neurons;
      completed++;
      console.log(`✅ [${completed}/${targetNodes.length}] [${out.elapsedSec}s] ${node.slug} (neurons: ${neurons.toFixed(1)}, cumulative: ${totalNeurons.toFixed(1)})`);
      if (slugs.length > 0) {
        console.log(JSON.stringify(out.parsed, null, 2));
      }
    } catch (err) {
      console.error(`❌ Failed ${node.slug}:`, err.message);
    }
  }

  console.log(`\n🎉 Batch finished! Completed ${completed}/${targetNodes.length} nodes. Total Neurons used: ${totalNeurons.toFixed(1)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
