import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp, rateLimit, tooManyRequests } from '@/lib/rateLimit';

const MAX_QUERY_CHARS = 300;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim().slice(0, MAX_QUERY_CHARS);
  const type = searchParams.get('type') || 'all'; // all, issues, pyqs

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const rl = await rateLimit({
    bucket: 'discovery-search',
    key: `ip:${getClientIp(req)}`,
    limit: 300,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return tooManyRequests(NextResponse, rl.retryAfterSec, 'Too many searches. Please try again shortly.');
  }

  try {
    let results: any = { issues: [], pyqs: [] };

    // 1. Keyword Search (Always perform this for high precision)
    if (type === 'all' || type === 'issues') {
      results.issues = await prisma.$queryRawUnsafe(`
        SELECT 
          id, slug, title, domain, metadata,
          ts_rank("searchVector", plainto_tsquery('english', $1)) as rank
        FROM "Issue"
        WHERE "searchVector" @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT 10;
      `, query);
    }

    if (type === 'all' || type === 'pyqs') {
      results.pyqs = await prisma.$queryRawUnsafe(`
        SELECT 
          id, "questionText", "sourceExam", "examYear", metadata
        FROM "PreviousYearQuestion"
        WHERE "searchVector" @@ plainto_tsquery('english', $1)
        LIMIT 10;
      `, query);
    }

    // 3. Format and Merge Results
    const formattedIssues = results.issues.map((i: any) => ({
      id: i.id,
      type: 'ISSUE',
      icon: getIconForDomain(i.domain),
      title: i.title,
      subtitle: (i.metadata?.keyThemes || []).slice(0, 3).join(' • '),
      link: `/node/${i.slug}`,
      rank: i.rank || i.similarity || 0,
      domain: i.domain
    }));

    const formattedPyqs = results.pyqs.map((p: any) => ({
      id: p.id,
      type: 'PYQ',
      icon: '🎯',
      title: `PYQ ${p.sourceExam} ${p.examYear}`,
      subtitle: p.questionText.substring(0, 120) + '...',
      link: `/prelims/pyq/${p.id}`,
      rank: p.rank || 0,
      domain: 'PYQ'
    }));

    // Merge and sort by rank
    const mergedResults = [...formattedIssues, ...formattedPyqs].sort((a, b) => b.rank - a.rank);

    return NextResponse.json({ results: mergedResults });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

function getIconForDomain(domain: string) {
  const icons: Record<string, string> = {
    'AGRICULTURE': '🚜',
    'GEOGRAPHY': '🌍',
    'ECONOMY': '📈',
    'GOVERNANCE': '🏛️',
    'ENVIRONMENT': '🌿',
    'INTERNATIONAL RELATIONS': '🤝',
    'SCIENCE': '🧪',
    'ETHICS': '⚖️',
    'INDIAN SOCIETY': '👥',
    'WORLD HISTORY': '📜'
  };
  return icons[domain] || '✨';
}
