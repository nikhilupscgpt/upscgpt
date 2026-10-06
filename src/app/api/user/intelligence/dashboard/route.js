import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = session.user.id || session.user.email;

    // 1. KPI DATA
    const [totalNodes, coveredNodes, attempts, aiLogs, nodesLastWeek] = await Promise.all([
      prisma.issue.count().catch(() => 559),
      prisma.issueProgress.count({ where: { userId, status: 'MASTERED' } }).catch(() => 0),
      prisma.quizAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }).catch(() => []),
      prisma.actionLog.count({ where: { userId, action: 'RAG_QUERY' } }).catch(() => 0),
      prisma.issueProgress.count({ 
        where: { 
          userId, 
          status: 'MASTERED', 
          updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        } 
      }).catch(() => 0)
    ]);

    // Calculate Streak (Dynamic)
    const logs = await prisma.actionLog.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    let streak = 0;
    if (logs.length > 0) {
      const dates = new Set(logs.map(l => new Date(l.createdAt).toDateString()));
      const sortedDates = Array.from(dates).map(d => new Date(d)).sort((a, b) => b - a);
      
      let current = new Date();
      current.setHours(0, 0, 0, 0);
      
      for (const date of sortedDates) {
        const diff = Math.floor((current - date) / (1000 * 60 * 60 * 24));
        if (diff === 0 || diff === 1) {
          streak++;
          current = date;
        } else if (diff > 1) {
          break;
        }
      }
    }

    const lastScore = attempts.length > 0 ? attempts[0].score : 0;
    const prevScore = attempts.length > 1 ? attempts[1].score : 0;
    const scoreDelta = lastScore - prevScore;

    // 2. SYLLABUS HEATMAP (Fully Dynamic)
    const allIssues = await prisma.issue.findMany({
      select: { gsPapers: true, id: true, category: true }
    }).catch(() => []);

    const masteredIssues = await prisma.issueProgress.findMany({
      where: { userId, status: 'MASTERED' },
      select: { issueId: true }
    }).catch(() => []);
    const masteredIds = new Set(masteredIssues.map(m => m.issueId));

    const heatmapData = {
      'Modern History': { total: 0, covered: 0, label: 'Modern History' },
      'GS2 Polity': { total: 0, covered: 0, label: 'GS2 Polity' },
      'GS3 Economy': { total: 0, covered: 0, label: 'GS3 Economy' },
      'Geography': { total: 0, covered: 0, label: 'Geography' },
      'Environment': { total: 0, covered: 0, label: 'Environment' },
      'GS4 Ethics': { total: 0, covered: 0, label: 'GS4 Ethics' },
      'Int. Relations': { total: 0, covered: 0, label: 'Int. Relations' },
      'Sci & Tech': { total: 0, covered: 0, label: 'Sci & Tech' },
    };

    allIssues.forEach(issue => {
      const papers = Array.isArray(issue.gsPapers) ? issue.gsPapers : [];
      const cat = issue.category || '';
      
      const mapTo = (key) => {
        heatmapData[key].total++;
        if (masteredIds.has(issue.id)) heatmapData[key].covered++;
      };

      if (papers.includes('GS1') || cat.includes('HISTORY')) mapTo('Modern History');
      if (papers.includes('GS2') || cat.includes('POLITY')) mapTo('GS2 Polity');
      if (papers.includes('GS3') || cat.includes('ECONOMY')) mapTo('GS3 Economy');
      if (cat.includes('GEOGRAPHY')) mapTo('Geography');
      if (cat.includes('ENVIRONMENT')) mapTo('Environment');
      if (papers.includes('GS4') || cat.includes('ETHICS')) mapTo('GS4 Ethics');
      if (cat.includes('RELATIONS')) mapTo('Int. Relations');
      if (cat.includes('SCIENCE') || cat.includes('TECH')) mapTo('Sci & Tech');
    });

    // 3. RECENT NODES (Dynamic)
    const recentLogs = await prisma.actionLog.findMany({
      where: { userId, action: 'VIEW_ISSUE' },
      orderBy: { createdAt: 'desc' },
      take: 3
    }).catch(() => []);

    const recentNodes = await prisma.issue.findMany({
      where: { id: { in: recentLogs.map(l => l.entityId).filter(Boolean) } },
      select: { id: true, title: true, gsPapers: true, _count: { select: {  } } }
    }).catch(() => []);

    // 4. TODAY'S NEWS (Dynamic)
    const todayNews = await prisma.article.findMany({
      where: { publishedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: { issue: { select: { title: true } } }
    }).catch(() => []);

    return new Response(JSON.stringify({
      kpis: {
        nodes: { current: coveredNodes, total: totalNodes || 559, delta: `+${nodesLastWeek}` },
        streak: { current: streak, label: streak > 0 ? 'Burning bright!' : 'Start your streak!' },
        score: { current: lastScore, delta: scoreDelta !== 0 ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta}` : '0' },
        ai: { current: aiLogs, label: 'Sessions active' }
      },
      heatmap: Object.values(heatmapData).map(h => ({
        label: h.label,
        pct: h.total > 0 ? Math.round((h.covered / h.total) * 100) : 0
      })),
      recentNodes: recentNodes.map(n => ({
        id: n.id,
        title: n.title,
        paper: n.gsPapers?.[0] || 'GS',
        pyqCount: n._count?.pyqLinks || 0,
        time: 'Active'
      })),
      news: todayNews.map(n => ({
        id: n.id,
        title: n.title,
        node: n.issue?.title || 'General',
        source: n.source || 'Intel',
        time: 'Today'
      })),
      predictedQuestions: [
        { tag: 'HIGH PROB', subject: 'GS3 · Economy', q: '"Discuss the impact of recent repo rate changes on credit transmission in the Indian banking sector."', conf: '88%', sim: '2023 Mains parallel' },
        { tag: 'MEDIUM', subject: 'GS2 · Polity', q: '"Examine the role of independent institutions in safeguarding democratic values during electoral cycles."', conf: '74%', sim: 'PYQ 2019 reference' }
      ]
    }), { status: 200 });

  } catch (error) {
    console.error('[Dashboard API] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
