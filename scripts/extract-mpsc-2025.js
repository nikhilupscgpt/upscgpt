import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in the environment.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Using gemini-2.5-flash as it is fast and supports PDF multimodal input
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
  }
});

async function callWithRetry(model, contents, maxRetries = 5) {
  let attempt = 0;
  while (true) {
    try {
      return await model.generateContent(contents);
    } catch (error) {
      attempt++;
      const isTransient = 
        error.status === 500 || 
        error.status === 503 || 
        error.status === 429 ||
        error.message?.includes('500') ||
        error.message?.includes('503') ||
        error.message?.includes('429');
      
      if (isTransient && attempt < maxRetries) {
        const waitTime = Math.min(attempt * 8000, 40000);
        console.warn(`[AI Retry] Transient error (${error.status || error.message}) on attempt ${attempt}. Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
}

async function extractQuestions(pdfPath, paperName) {
  console.log(`Reading PDF file: ${pdfPath}`);
  const fileBuffer = fs.readFileSync(pdfPath);
  const base64Data = fileBuffer.toString('base64');

  console.log(`Sending to Gemini for ${paperName}...`);

  const prompt = `
You are an expert UPSC/MPSC exam scraper. You are given a scanned bilingual question paper PDF containing questions in both English and Marathi.
Analyze the PDF page-by-page. Extract all questions.

For each question:
1. Identify the question number/identifier (e.g. "1(a)", "1(b)", "2", "3(a)", etc.).
2. Extract the complete English question text.
3. Extract the complete Marathi (Devanagari) question text.
4. Extract the marks allocated to that question (usually written at the end of the question in parentheses, e.g. (10), (15), (20)).

Make sure to align each English question with its correct Marathi translation. Do not miss any question.
The output MUST be a JSON array of objects.

JSON schema:
[
  {
    "paper": "${paperName}",
    "questionNumber": "string",
    "questionEn": "string",
    "questionMr": "string",
    "marks": integer
  }
]

Please return only the JSON array containing the extracted questions.
`;

  const response = await callWithRetry(model, [
    {
      inlineData: {
        data: base64Data,
        mimeType: 'application/pdf'
      }
    },
    prompt
  ]);

  const resultText = response.response.text();
  try {
    const parsed = JSON.parse(resultText);
    return parsed;
  } catch (err) {
    console.error("Failed to parse JSON response:", resultText);
    throw err;
  }
}

async function main() {
  const paper2Path = './data/optional/MPSC Geography Optional Paper 2 2025.pdf';

  try {
    if (!fs.existsSync('./scripts/paper1_extracted.json')) {
      const paper1Path = './data/optional/MPSC Geography Optional Paper 1 2025.pdf';
      const paper1Questions = await extractQuestions(paper1Path, 'Paper I');
      fs.writeFileSync('./scripts/paper1_extracted.json', JSON.stringify(paper1Questions, null, 2));
      console.log(`Successfully extracted ${paper1Questions.length} questions from Paper 1.`);
    } else {
      console.log("Paper 1 already extracted. Skipping.");
    }

    const paper2Questions = await extractQuestions(paper2Path, 'Paper II');
    fs.writeFileSync('./scripts/paper2_extracted.json', JSON.stringify(paper2Questions, null, 2));
    console.log(`Successfully extracted ${paper2Questions.length} questions from Paper 2.`);

    console.log("Extraction completed successfully!");
  } catch (err) {
    console.error("Error during extraction:", err);
  }
}

main();
