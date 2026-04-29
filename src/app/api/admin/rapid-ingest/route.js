import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateJSON } from '@/lib/ai';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text, source } = await req.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Text too short for meaningful extraction.' }, { status: 400 });
    }

    const systemInstruction = `
      You are a UPSC Current Affairs Specialist. 
      Analyze the following text provided by an admin (pasted from a newspaper or website).
      Identify key Articles and Editorials relevant to the UPSC Civil Services Exam.
      
      For each item:
      - title: Concise strategic title
      - type: "ARTICLE" or "EDITORIAL"
      - source: "${source || 'Manual Paste'}"
      - rawContent: The relevant section of text
      - gemmaAnalysis: A 1-sentence strategic significance for UPSC
      
      Return as a JSON array of objects.
    `;

    const extractedItems = await generateJSON(text.slice(0, 15000), systemInstruction);

    return NextResponse.json({
      success: true,
      count: extractedItems?.length || 0,
      items: extractedItems || []
    });

  } catch (error) {
    console.error('[Rapid Ingest API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
