import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { execFileSync } from 'child_process';
import os from 'os';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { generateJSON } from '@/lib/ai';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let filePath = null;
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File too large (max 25 MB)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Temp file goes to the OS temp dir (never under public/, which is web-served)
    filePath = path.join(os.tmpdir(), `ocr_temp_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.pdf`);
    fs.writeFileSync(filePath, buffer);

    // 1. Run OCR Tool (Swift) — execFile, no shell interpolation
    console.log(`[OCR API] Running OCR on: ${filePath}`);
    const ocrOutput = execFileSync('swift', [path.join(process.cwd(), 'scripts', 'ocr.swift'), filePath], {
      encoding: 'utf-8', 
      timeout: 600000, // 10 minutes
      maxBuffer: 50 * 1024 * 1024 // 50MB
    });

    if (!ocrOutput || ocrOutput.trim().length < 50) {
      return NextResponse.json({ error: 'OCR failed or produced too little text.' }, { status: 422 });
    }

    // 2. Use AI to parse the giant wall of text into logical news items
    const systemInstruction = `
      You are a UPSC Current Affairs Specialist. 
      Analyze the following OCR text extracted from a newspaper (The Hindu/Indian Express/PIB).
      Identify key Articles and Editorials relevant to the UPSC Civil Services Exam.
      
      For each item:
      - title: Concise strategic title
      - type: "ARTICLE" or "EDITORIAL"
      - source: Original newspaper source if mentioned (e.g., "The Hindu")
      - rawContent: A summary or the specific section of text for this item
      - gemmaAnalysis: A 1-sentence strategic significance for UPSC
      
      Return as a JSON array of objects.
    `;

    const prompt = `OCR Text:\n\n${ocrOutput.slice(0, 15000)}`; // Truncate if too large for context
    
    console.log(`[OCR API] Parsing text with AI...`);
    const extractedItems = await generateJSON(prompt, systemInstruction);

    return NextResponse.json({
      success: true,
      count: extractedItems?.length || 0,
      items: extractedItems || [],
      rawTextLength: ocrOutput.length
    });

  } catch (error) {
    console.error('[OCR API] Error:', error);
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 });
  } finally {
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch { /* already gone */ }
    }
  }
}
