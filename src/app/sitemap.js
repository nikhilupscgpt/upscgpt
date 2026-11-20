import prisma from '@/lib/prisma'
import { generateQuestionSlug } from '@/lib/pyqSlug'
import { isIssueJsonPopulated, isJsonPopulated, isQuestionPopulated } from '@/lib/seo'

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
        select: {
          slug: true,
          lastUpdatedAt: true,
          metadata: true,
          prelimsNote: true,
          mainsNote: true,
          cumulativeSummary: true,
        },
        where: { status: 'ACTIVE' },
      }),
      prisma.article.findMany({
        select: {
          id: true,
          publishedAt: true,
          createdAt: true,
          structuredData: true,
          rawContent: true,
        },
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
          options: true,
          correctLabel: true,
          explanationJson: true,
          explanation: true,
          contentStatus: true,
          examName: true,
          examYear: true,
          updatedAt: true,
          reviewedAt: true,
          createdAt: true,
        },
      }),
    ])
  } catch (err) {
    console.error('[sitemap] Database fetch warning:', err?.message || err)
  }

  // Consolidate all syllabus/topic nodes under the master /node/[slug] canonical route
  // to prevent self-cannibalization across /issues/[slug] and /mains/node/[slug]
  // Only include URLs where the JSON content columns are populated
  const nodeUrls = issues
    .filter((issue) => isIssueJsonPopulated(issue))
    .map((issue) => ({
      url: `${baseUrl}/node/${issue.slug}`,
      lastModified: issue.lastUpdatedAt,
      changeFrequency: 'weekly',
      priority: 0.85,
    }))

  const articleUrls = articles
    .filter((article) => isJsonPopulated(article.structuredData) || Boolean(article.rawContent?.trim()))
    .map((article) => ({
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

  const pyqUrls = questions
    .filter((q) => isQuestionPopulated(q))
    .map((q) => ({
      url: `${baseUrl}/prelims/pyq/${generateQuestionSlug(q)}`,
      lastModified: q.updatedAt || q.reviewedAt || q.createdAt || new Date(),
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
      url: `${baseUrl}/environment`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/environment/species`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/mains`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
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
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...nodeUrls,
    ...articleUrls,
    ...streakUrls,
    ...atlasUrls,
    ...pyqUrls,
  ]
}
