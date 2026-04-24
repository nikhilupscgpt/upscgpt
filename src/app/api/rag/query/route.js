import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateEmbedding, searchSimilarContent } from '@/lib/rag-utils';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  // 1. Optional Auth (Depends on if you want free users to use this)
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { query, subject, examType } = body;

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // 2. Embed the User Query
    const queryEmbedding = await generateEmbedding(query);

    // 3. Retrieve Context from Vector DB
    // Limit to 5 chunks to stay within context windows and keep it highly relevant
    const results = await searchSimilarContent(queryEmbedding, subject, examType, 5);

    if (!results || results.length === 0) {
      return NextResponse.json({ 
        response: "I couldn't find any specific materials in the UPSC portal database regarding your query. Please broaden your search or ask about a different subject.",
        sources: [] 
      });
    }

    // 4. Construct the RAG Prompt
    const contextStrs = results.map((r, i) => `[Source ${i+1}: ${r.title}]\n${r.contentMarkdown}`).join('\n\n---\n\n');
    const sources = results.map(r => ({ title: r.title, url: r.sourceUrl, subject: r.subject }));

    const instruction = examType === 'MAINS' 
      ? 'You are an expert UPSC Mains evaluator. Answer the student\'s question comprehensively and analytically using ONLY the provided context blocks. Do not introduce outside facts. Structure your answer with an introduction, key points (bulleted), and a synthesized conclusion. Read like an official UPSC model answer.'
      : 'You are an expert UPSC Prelims tutor. Answer the student\'s question concisely based ONLY on the provided context blocks. Ignore any irrelevant context blocks. If the context does not contain the answer, politely say you don\'t have that information in the database.';

    const finalPrompt = `
Instruction: ${instruction}

Context Blocks:
${contextStrs}

Student Query: ${query}
    `;

    // 5. Generate Answer with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const aiResponse = await model.generateContent(finalPrompt);
    const answerMarkdown = aiResponse.response.text();

    return NextResponse.json({ 
      success: true, 
      response: answerMarkdown,
      sources: sources
    });

  } catch (error) {
    console.error('[RAG Query] Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
