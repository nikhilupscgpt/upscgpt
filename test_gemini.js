import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API key:", apiKey?.substring(0, 10) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);

  const modelName = "gemma-4-31b-it";
  try {
    console.log(`Testing JSON mode for model: ${modelName}`);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent("Return a JSON list of three colors: Red, Blue, Green. Output only the JSON.");
    console.log(` -> Success JSON: ${result.response.text().trim()}`);
  } catch (e) {
    console.log(` -> Failed: ${e.message}`);
  }
}

main();
