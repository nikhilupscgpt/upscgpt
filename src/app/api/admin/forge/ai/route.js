import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getGeminiModel } from '@/lib/gemini';
import { getRenderedPrompt } from '@/lib/aiPromptRegistry';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Admin Auth Required' }), { status: 401 });
  }

  try {
    const { nodeId, task } = await req.json();
    if (!nodeId || !task) return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });

    const issue = await prisma.issue.findUnique({
      where: { id: nodeId },
      include: { articles: { take: 8 } }
    });
    if (!issue) return new Response(JSON.stringify({ error: 'Node not found' }), { status: 404 });

    const context = issue.articles.map(a => `[Source: ${a.source || 'Intel'}] ${a.title}\n${a.contentMarkdown?.substring(0, 1000) || ''}`).join('\n\n');

    const isMarathi = task.toUpperCase().includes('MARATHI') || task.toUpperCase().includes('MR');
    const isHindi = task.toUpperCase().includes('HINDI') || task.toUpperCase().includes('HI');
    const targetLang = isMarathi ? 'Marathi' : (isHindi ? 'Hindi' : 'English');

    const prompt = await getRenderedPrompt('forge.ai.content.system', {
      task,
      issueTitle: issue.title,
      domain: issue.domain,
      targetLang,
      context,
    });

    const ai = getGeminiModel('analysis');
    const result = await ai.generateContent(prompt);
    let aiText = typeof result.text === 'function' ? result.text() : result.text;

    // --- NEURAL MUZZLE: Post-Processing Sanitization ---
    // 1. Force-strip thinking blocks and anything that looks like a repeated instruction block
    aiText = aiText.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    
    // 2. Identify the first major header or bold content as the true start
    let lines = aiText.split('\n');
    let contentStarted = false;
    const finalLines = [];

    const metaTokens = [
      'start immediately', 'no meta-talk', 'administrative tone', 'structure:', 
      'clean markdown', 'requirements:', 'task:', 'here is', 'certainly',
      'examiner mode', 'checklist', 'context + pestel'
    ];

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (contentStarted) finalLines.push(line);
        continue;
      }

      // If we haven't started, check if this line is meta-talk
      if (!contentStarted) {
        const isMeta = metaTokens.some(token => trimmed.toLowerCase().includes(token));
        const isInstructionBullet = /^\* \s*(Start|No|Sophisticated|Structure|Clean)/i.test(trimmed);
        
        if (isMeta || isInstructionBullet) continue;
        
        // Content starts when we find a real header or a substantial paragraph
        if (trimmed.startsWith('#') || trimmed.startsWith('**') || trimmed.length > 50) {
          contentStarted = true;
          finalLines.push(line);
        }
      } else {
        finalLines.push(line);
      }
    }
    
    const cleanOutput = finalLines.join('\n').trim();

    return new Response(JSON.stringify({ success: true, content: cleanOutput }), { status: 200 });

  } catch (error) {
    console.error('[Forge Muzzle] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
