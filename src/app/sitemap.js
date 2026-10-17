import prisma from '@/lib/prisma'
import { generateQuestionSlug } from '@/lib/pyqSlug'

// Cache sitemap.xml for 24 hours so bot fetches consume 0 database compute
export const revalidate = 86400

export default async function sitemap() {
  const baseUrl = 'https://www.upscgpt.in'

  let issues = []
  let articles = []
  let streaks = []
  let entries = []
  let questions = []

  try {
    ;[issues, articles, streaks, entries, questions] = await Promise.all([
      prisma.issue.findMany({
        select: { slug: true, lastUpdatedAt: true },
        where: { status: 'ACTIVE' },
      }),
      prisma.article.findMany({
        select: { id: true, publishedAt: true, createdAt: true },
        where: { status: 'DONE' },
      }),
      prisma.newsStreak.findMany({
        select: { id: true, updatedAt: true },
        where: { status: 'ACTIVE' },
      }),
      prisma.mapEntry.findMany({
        select: { id: true, updatedAt: true },
      }),
      prisma.questionDraft.findMany({
        select: {
          id: true,
          dedupHash: true,
          stem: true,
          examName: true,
          examYear: true,
          reviewedAt: true,
          createdAt: true,
        },
      }),
    ])
  } catch (err) {
    console.error('[sitemap] Database fetch warning:', err?.message || err)
  }

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
    url: `${baseUrl}/prelims/pyq/${generateQuestionSlug(q)}`,
    lastModified: q.reviewedAt || q.createdAt || new Date(),
    changeFrequency: 'monthly',
    priority: 0.85,
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
      priority: 0.95,
    },
    {
      url: `${baseUrl}/mapping`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
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
