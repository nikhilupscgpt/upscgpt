import prisma from '@/lib/prisma'

export default async function sitemap() {
  const baseUrl = 'https://www.upscgpt.in'

  // Fetch all Issues (Syllabus Nodes)
  const issues = await prisma.issue.findMany({
    select: { slug: true, lastUpdatedAt: true },
    where: { status: 'ACTIVE' }
  })

  // Fetch all Articles (Daily Current Affairs)
  const articles = await prisma.article.findMany({
    select: { id: true, publishedAt: true, createdAt: true },
    where: { status: 'DONE' }
  })

  // Fetch all News Streaks
  const streaks = await prisma.newsStreak.findMany({
    select: { id: true, updatedAt: true },
    where: { status: 'ACTIVE' }
  })

  // Fetch all Atlas Entries
  const entries = await prisma.mapEntry.findMany({
    select: { id: true, updatedAt: true }
  })

  // Fetch all Questions (PYQ Archive)
  const questions = await prisma.questionDraft.findMany({
    select: { id: true, dedupHash: true, createdAt: true }
  })

  const issueUrls = issues.map((issue) => ({
    url: `${baseUrl}/issues/${issue.slug}`,
    lastModified: issue.lastUpdatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const nodeUrls = issues.map((issue) => ({
    url: `${baseUrl}/node/${issue.slug}`,
    lastModified: issue.lastUpdatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const mainsNodeUrls = issues.map((issue) => ({
    url: `${baseUrl}/mains/node/${issue.slug}`,
    lastModified: issue.lastUpdatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/news/article/${article.id}`,
    lastModified: article.publishedAt || article.createdAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const streakUrls = streaks.map((streak) => ({
    url: `${baseUrl}/news/streak/${streak.id}`,
    lastModified: streak.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const atlasUrls = entries.map((entry) => ({
    url: `${baseUrl}/atlas/map?entry=${entry.id}`,
    lastModified: entry.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const pyqUrls = questions.map((q) => ({
    url: `${baseUrl}/prelims/pyq/${encodeURIComponent(q.dedupHash || q.id)}`,
    lastModified: q.createdAt || new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/prelims/pyq`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/atlas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/issues`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...issueUrls,
    ...nodeUrls,
    ...mainsNodeUrls,
    ...articleUrls,
    ...streakUrls,
    ...atlasUrls,
    ...pyqUrls,
  ]
}
