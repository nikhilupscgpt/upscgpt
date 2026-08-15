import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }
  return session;
}

function sanitizeJsonString(rawText) {
  if (!rawText) return "";
  let cleaned = rawText.trim();

  // Extract content from markdown code block if present
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    cleaned = match[1].trim();
  } else {
    cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "").trim();
  }

  // Find first { and last }
  const startIndex = cleaned.indexOf("{");
  const endIndex = cleaned.lastIndexOf("}");
  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }

  return cleaned;
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const optionalId = formData.get("optionalId");
    const language = formData.get("language") || "en";
    const exam = formData.get("exam") || "BOTH";

    if (!file || !optionalId) {
      return NextResponse.json({ error: "Missing file or optionalId" }, { status: 400 });
    }

    const opt = await prisma.optionalSubject.findUnique({
      where: { id: optionalId }
    });

    if (!opt) {
      return NextResponse.json({ error: "Optional Subject not found" }, { status: 404 });
    }

    // Fetch existing syllabus tree nodes for matching
    const domain = `OPTIONAL_${opt.slug.toUpperCase()}`;
    const treeNodes = await prisma.issue.findMany({
      where: { domain },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        title: true,
        parentIssueId: true,
        slug: true
      }
    });

    // Build node hierarchy lookup text for Gemini context
    const nodeMap = new Map(treeNodes.map(n => [n.id, n]));
    const formattedTree = treeNodes.map(node => {
      const parent = node.parentIssueId ? nodeMap.get(node.parentIssueId)?.title : "Root";
      return `- Node ID: "${node.id}" | Title: "${node.title}" | Parent: "${parent || "Root"}"`;
    }).join("\n");

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "application/pdf";
    const fileName = file.name || "uploaded_document.pdf";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on server." }, { status: 500 });
    }

    const client = new GoogleGenerativeAI(apiKey);
    const modelCandidates = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    const prompt = `
You are an expert UPSC/MPSC Optional Subject Syllabus & Academic Notes Compiler.
Your job is to analyze the provided document for the Optional Subject: "${opt.name}" (Slug: ${opt.slug}).

CRITICAL OBJECTIVE: EXTRACT AND PRESERVE EXACT STRUCTURE & LAYOUT:
1. Preserve all Markdown headings (# H1, ## H2, ### H3, #### H4) reflecting the original outline.
2. Preserve all Markdown tables (| Column 1 | Column 2 |) with full cell fidelity. Do NOT flatten tables into simple text.
3. Preserve bullet points, numbered lists, key definitions, models, equations, theories, scholar quotes, and case studies verbatim.
4. Segment the document into logical study chunks (each chunk should be a self-contained major topic or subtopic, typically 300 - 1500 words).
5. For each chunk, determine which Syllabus Node from the PROVIDED SYLLABUS TREE below it best belongs to:

=== AVAILABLE SYLLABUS TREE NODES FOR ${opt.name.toUpperCase()} ===
${formattedTree || "No pre-seeded tree nodes found."}
=====================================================

TARGET SETTINGS:
- Language: ${language === "mr" ? "Marathi (मराठी)" : "English"}
- Exam Scope: ${exam}
- Document File Name: ${fileName}

OUTPUT FORMAT REQUIREMENTS:
You MUST output a valid JSON object matching EXACTLY this structure:
{
  "documentTitle": "Inferred or extracted title of this document/chapter",
  "source": "Author / Coaching / Source reference if detected (e.g., Savindra Singh, Majid Husain, Vision IAS)",
  "totalChunks": 3,
  "chunks": [
    {
      "chunkIndex": 1,
      "title": "Clear, descriptive title for this chunk (e.g., Demographic Transition Theory & Migration Models)",
      "breadcrumb": "Paper / Section / Topic hierarchy path (e.g., Paper I > Section B > 3. Population Geography)",
      "suggestedNodeId": "Exact Node ID from the syllabus tree above if matched, or null if no exact match",
      "suggestedNodeTitle": "Exact Title of the matched node from the list above, or null",
      "source": "Savindra Singh (or detected source)",
      "contentMarkdown": "# Heading\\n\\nStructured layout-preserved text with markdown tables and lists...",
      "keyConcepts": ["Concept 1", "Concept 2"]
    }
  ]
}

Return ONLY the JSON object.
`;

    let extractedData = null;
    let lastError = null;

    const isBinaryDoc = mimeType.includes("pdf") || mimeType.includes("image");

    for (const modelName of modelCandidates) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        let contentsPayload;
        if (isBinaryDoc) {
          contentsPayload = [
            {
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: mimeType.includes("pdf") ? "application/pdf" : mimeType,
              },
            },
            prompt,
          ];
        } else {
          const textContent = buffer.toString("utf-8");
          contentsPayload = [
            `DOCUMENT CONTENT:\n${textContent.slice(0, 100000)}\n\n${prompt}`
          ];
        }

        const result = await model.generateContent(contentsPayload);
        const responseText = result.response.text();
        
        try {
          extractedData = JSON.parse(responseText);
        } catch {
          const sanitized = sanitizeJsonString(responseText);
          extractedData = JSON.parse(sanitized);
        }

        if (extractedData && Array.isArray(extractedData.chunks)) {
          break;
        }
      } catch (err) {
        console.warn(`[ParseDoc] Model ${modelName} extraction attempt failed:`, err?.message);
        lastError = err;
      }
    }

    if (!extractedData || !Array.isArray(extractedData.chunks)) {
      throw (lastError || new Error("Failed to extract structured chunks from document."));
    }

    return NextResponse.json({
      success: true,
      fileName,
      documentTitle: extractedData.documentTitle || fileName,
      source: extractedData.source || "",
      chunks: extractedData.chunks.map((chunk, idx) => ({
        ...chunk,
        id: `parsed_chunk_${Date.now()}_${idx}`,
        optionalId,
        language,
        exam,
      }))
    });

  } catch (error) {
    console.error("Error parsing document with Gemini:", error);
    return NextResponse.json({
      error: "Failed to process document: " + (error.message || "Unknown error")
    }, { status: 500 });
  }
}
