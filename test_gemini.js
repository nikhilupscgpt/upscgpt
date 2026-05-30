import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API key:", apiKey?.substring(0, 10) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);

  const models = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-pro", "gemma-2-27b-it", "gemma-2-9b-it"];
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello!");
      console.log(` -> Success: ${result.response.text().trim()}`);
    } catch (e) {
      console.log(` -> Failed: ${e.message}`);
    }
  }
}

main();
