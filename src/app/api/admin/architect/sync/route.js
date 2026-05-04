import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/admin/architect/sync
 * Fetches a public Google Doc and parses it into a syllabus structure.
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { docUrl } = await req.json();
    if (!docUrl) return NextResponse.json({ error: 'Google Doc URL required' }, { status: 400 });

    // Extract Doc ID
    const docIdMatch = docUrl.match(/\/d\/(.*?)(\/|$)/);
    if (!docIdMatch) return NextResponse.json({ error: 'Invalid Google Doc URL' }, { status: 400 });
    const docId = docIdMatch[1];

    // Fetch as Plain Text (Fastest way)
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const res = await fetch(exportUrl);
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Could not fetch Doc. Ensure it is "Anyone with the link can view"' }, { status: 404 });
    }

    const text = await res.text();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const parsedNodes = [];
    let currentGs = 'GS1';
    let currentDomain = 'GENERAL';
    let currentTopic = 'Core Concept';

    // 🧠 Intelligent Parser
    // Pattern: 
    // # GS1 (GS Paper)
    // ## GEOGRAPHY (Domain)
    // ### Physical Geography (Topic)
    // - Plate Tectonics (Node)
    lines.forEach(line => {
      if (line.startsWith('# GS')) {
        currentGs = line.replace('# ', '').trim();
      } else if (line.startsWith('## ')) {
        currentDomain = line.replace('## ', '').trim().toUpperCase();
      } else if (line.startsWith('### ')) {
        currentTopic = line.replace('### ', '').trim();
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const title = line.replace(/^[-*]\s+/, '').trim();
        parsedNodes.push({
          title,
          gsPaper: currentGs,
          domain: currentDomain,
          topic: currentTopic
        });
      } else if (!line.startsWith('#')) {
        // Treat plain lines as nodes if they are not headers
        parsedNodes.push({
          title: line,
          gsPaper: currentGs,
          domain: currentDomain,
          topic: currentTopic
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      nodes: parsedNodes,
      stats: {
        total: parsedNodes.length,
        domains: [...new Set(parsedNodes.map(n => n.domain))].length
      }
    });
  } catch (error) {
    console.error('[Syllabus Sync API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
