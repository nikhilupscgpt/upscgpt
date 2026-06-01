import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import prisma from '@/lib/prisma';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my',
  'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her',
  'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'how',
  'not', 'no', 'nor', 'as', 'if', 'then', 'than', 'too', 'very',
  'just', 'about', 'above', 'after', 'again', 'all', 'also', 'any',
  'because', 'before', 'between', 'both', 'each', 'few', 'more',
  'most', 'other', 'over', 'same', 'some', 'such', 'only', 'own',
  'so', 'up', 'out', 'into', 'through', 'during', 'under', 'while',
]);

function extractKeywords(text) {
  const words = text
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.toLowerCase().trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Deduplicate and sort by length descending, take top 5
  const unique = [...new Set(words)];
  unique.sort((a, b) => b.length - a.length);
  return unique.slice(0, 5);
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteContent } = await req.json();

    if (!noteContent) {
      return NextResponse.json({ error: 'noteContent is required' }, { status: 400 });
    }

    const keywords = extractKeywords(noteContent);

    if (keywords.length === 0) {
      return NextResponse.json({ nodes: [] });
    }

    // Search for issues matching any of the keywords
    const matchingIssues = await prisma.issue.findMany({
      where: {
        OR: keywords.map((keyword) => ({
          title: { contains: keyword, mode: 'insensitive' },
        })),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        domain: true,
      },
      take: 3,
    });

    return NextResponse.json({ nodes: matchingIssues });
  } catch (error) {
    console.error('Failed to link nodes:', error);
    return NextResponse.json({ error: 'Failed to link nodes' }, { status: 500 });
  }
}
