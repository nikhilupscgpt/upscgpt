import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateJSON } from '@/lib/ai'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n)
}

/**
 * Generate a "WHO IS NOT A MEMBER?" question for an organization.
 * Classic UPSC Type B format.
 */
function buildMembershipQuestion(org, allOrgNames) {
  const members = org.members.split(',').map(m => m.trim())
  const nonMembers = allOrgNames.filter(n => !members.includes(n))

  if (members.length < 3 || nonMembers.length < 1) return null

  const correctAnswer = pickRandom(nonMembers, 1)[0] // the non-member
  const distractors = pickRandom(members, 3) // 3 actual members as distractors

  const options = shuffle([correctAnswer, ...distractors])
  const correctIndex = options.indexOf(correctAnswer)
  const labels = ['a', 'b', 'c', 'd']

  return {
    type: 'MEMBERSHIP',
    question: `Which of the following countries is NOT a member of ${org.shortName}?`,
    options: options.map((opt, i) => ({ label: labels[i], text: opt })),
    correctLabel: labels[correctIndex],
    explanation: `${correctAnswer} is not a member of ${org.name}. Members include ${members.slice(0, 5).join(', ')}${members.length > 5 ? ` and ${members.length - 5} more` : ''}.`,
    difficulty: members.length > 15 ? 'HARD' : 'MEDIUM',
  }
}

/**
 * Generate a "CORRECTLY MATCHED PAIRS" question — the most UPSC-frequent format.
 * Uses sea borders data from MapEntry.
 */
async function buildMatchedPairsQuestion(scope) {
  // Get entries with sea border data
  const entries = await prisma.mapEntry.findMany({
    where: {
      worldPart: 'POLITICAL',
      seaBorders: { not: null },
    },
    select: { name: true, seaBorders: true, continent: true },
    take: 100,
  })

  if (entries.length < 5) return null

  // Build correct pairs
  const correctPairs = []
  for (const entry of entries) {
    const seas = entry.seaBorders.split(',').map(s => s.trim()).filter(Boolean)
    for (const sea of seas) {
      correctPairs.push({ country: entry.name, sea, isCorrect: true })
    }
  }

  if (correctPairs.length < 4) return null

  // Pick 2 correct (actually bordering), 2 incorrect (swapped)
  const selectedCorrect = pickRandom(correctPairs, 2)
  const wrongPairs = selectedCorrect.map(p => {
    // Swap the sea with a random other sea
    const otherSeas = correctPairs.filter(cp => cp.sea !== p.sea && cp.country !== p.country)
    const wrongSea = otherSeas[Math.floor(Math.random() * otherSeas.length)]?.sea || 'Persian Gulf'
    return { country: p.country, sea: wrongSea, isCorrect: false }
  })

  const allPairs = shuffle([...selectedCorrect, ...wrongPairs])

  // Format as numbered list
  const pairTexts = allPairs.map((p, i) => `${i + 1}. ${p.sea} → ${p.country}`)
  const correctNumbers = allPairs
    .map((p, i) => p.isCorrect ? (i + 1) : null)
    .filter(Boolean)

  // Build UPSC-style MCQ options
  const optionSets = [
    [1, 2],
    [2, 3],
    [3, 4],
    correctNumbers,
  ]
  const shuffledOptions = shuffle(optionSets)
  const correctOptionIndex = shuffledOptions.findIndex(
    o => JSON.stringify(o.sort()) === JSON.stringify(correctNumbers.sort())
  )
  const labels = ['a', 'b', 'c', 'd']

  return {
    type: 'MATCHED_PAIRS',
    question: `Which of the following pairs (Sea → Country) are correctly matched?\n\n${pairTexts.join('\n')}`,
    options: shuffledOptions.map((opt, i) => ({
      label: labels[i],
      text: `${opt.join(' and ')} only`,
    })),
    correctLabel: labels[correctOptionIndex],
    explanation: `Correct pairs: ${selectedCorrect.map(p => `${p.sea} borders ${p.country}`).join('; ')}. ${wrongPairs.map(p => `${p.country} does NOT border ${p.sea}`).join('; ')}.`,
    difficulty: 'HARD',
  }
}

/**
 * Generate an AI-powered contextual quiz for intelligence zones.
 * Uses Gemini to generate fresh UPSC-style MCQs.
 */
async function buildIntelligenceQuiz(zone) {
  const systemInstruction = `You are a UPSC Prelims question generator specialising in world geography and current affairs.
Generate one MCQ in valid JSON format. The question MUST be in the style of actual UPSC Prelims questions.

Rules:
- Start question with "Consider the following..." or direct factual framing
- 4 options labeled a, b, c, d
- Include a brief explanation for the correct answer
- Focus on the region's strategic, geographic, or political significance

Return ONLY this JSON (no markdown):
{
  "type": "INTELLIGENCE",
  "question": "string",
  "options": [{"label":"a","text":"string"},{"label":"b","text":"string"},{"label":"c","text":"string"},{"label":"d","text":"string"}],
  "correctLabel": "a|b|c|d",
  "explanation": "string",
  "difficulty": "EASY|MEDIUM|HARD"
}`

  const prompt = `Generate a UPSC Prelims MCQ about: ${zone.name} (${zone.nodeSubType} in ${zone.parentCountry}).
Context: ${zone.prelims}
India angle: ${zone.india}`

  try {
    const result = await generateJSON(prompt, systemInstruction)
    if (result?.question && result?.options) {
      return { ...result, type: 'INTELLIGENCE' }
    }
  } catch (e) {
    console.warn('[Quiz] AI question generation failed:', e.message)
  }
  return null
}

export async function POST(req) {
  try {
    const { scope, scopeType } = await req.json()
    // scopeType: 'ORGANIZATION' | 'INTELLIGENCE_ZONE' | 'SEA_BORDERS'

    if (scopeType === 'ORGANIZATION') {
      const org = await prisma.organization.findUnique({ where: { id: scope } })
      if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

      // Get all country names for distractors
      const allCountries = await prisma.mapEntry.findMany({
        where: { worldPart: 'POLITICAL', nodeSubType: { in: ['COUNTRY', null] } },
        select: { name: true }
      })
      const allNames = [...new Set(allCountries.map(c => c.name))]

      const question = buildMembershipQuestion(org, allNames)
      if (!question) return NextResponse.json({ error: 'Not enough data for quiz' }, { status: 400 })

      return NextResponse.json({ question, org: { name: org.name, shortName: org.shortName } })
    }

    if (scopeType === 'INTELLIGENCE_ZONE') {
      const zone = await prisma.mapEntry.findUnique({ where: { id: scope } })
      if (!zone) return NextResponse.json({ error: 'Zone not found' }, { status: 404 })

      const question = await buildIntelligenceQuiz(zone)
      if (!question) return NextResponse.json({ error: 'Quiz generation failed' }, { status: 500 })

      return NextResponse.json({ question, zone: { name: zone.name, parentCountry: zone.parentCountry } })
    }

    if (scopeType === 'SEA_BORDERS') {
      const question = await buildMatchedPairsQuestion(scope)
      if (!question) return NextResponse.json({ error: 'Not enough sea border data' }, { status: 400 })
      return NextResponse.json({ question })
    }

    return NextResponse.json({ error: 'Invalid scopeType' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/quiz error:', error)
    return NextResponse.json({ error: 'Quiz generation failed', details: error.message }, { status: 500 })
  }
}
