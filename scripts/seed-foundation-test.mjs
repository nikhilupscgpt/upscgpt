import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemma-3-27b-it';

async function generateJSON(prompt, systemInstruction) {
  const contents = `${systemInstruction}\n\nTask: ${prompt}\n\nReturn ONLY valid JSON, no markdown fences.`;
  const result = await client.models.generateContent({ model, contents });
  console.log("AI Result Keys:", Object.keys(result));
  if (result.candidates && result.candidates[0]) {
    const text = result.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  }
  throw new Error("No candidates in AI response");
}

const prisma = new PrismaClient();

async function seedFirstTest() {
  const issueId = 'cmoder43l008owe0sfsc92zci'; // Agricultural Debt & Farmer Suicide
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });

  if (!issue) {
    console.error("Issue not found");
    process.exit(1);
  }

  console.log(`Generating Foundation Test for: ${issue.title}`);

  const systemInstruction = `
    You are a UPSC Senior Examiner known for creating nuanced, analytical Prelims questions.
    Generate 5 MCQs based on the provided Strategic Summary.
    
    Question Formats to use (mix them):
    1. Statement-based (Which of the following is/are correct?)
    2. Assertion-Reasoning
    3. Direct factual but nuanced
    4. 2023 Style (How many of the following statements are correct? Only one, Only two, All three, None)

    JSON Format Required:
    {
      "questions": [
        {
          "text": "...",
          "options": [
            {"label": "a", "text": "..."},
            {"label": "b", "text": "..."},
            {"label": "c", "text": "..."},
            {"label": "d", "text": "..."}
          ],
          "correctLabel": "a",
          "explanation": "...",
          "difficulty": "MEDIUM",
          "domain": "ECONOMY",
          "gsPaper": "GS3",
          "tags": ["Agriculture", "Distress", "Finance"]
        }
      ]
    }
  `;

  const prompt = `Strategic Summary:\n${issue.cumulativeSummary}\n\nGenerate 5 foundation questions.`;

  try {
    const result = await generateJSON(prompt, systemInstruction);
    
    if (result && result.questions) {
      const testPack = await prisma.testPack.create({
        data: {
          title: `${issue.title} — Foundation Test`,
          description: `Master the conceptual and strategic dimensions of ${issue.title}. This test is Phase 4 of your Mastery Lab.`,
          type: 'PRACTICE',
          issueId: issue.id,
          questions: {
            create: result.questions.map(q => ({
              text: q.text,
              options: q.options,
              correctLabel: q.correctLabel,
              explanation: q.explanation,
              difficulty: q.difficulty,
              domain: q.domain,
              gsPaper: q.gsPaper,
              tags: q.tags
            }))
          }
        }
      });

      console.log(`Success! Created TestPack: ${testPack.title} (ID: ${testPack.id})`);
    }
  } catch (error) {
    console.error("Generation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFirstTest();
