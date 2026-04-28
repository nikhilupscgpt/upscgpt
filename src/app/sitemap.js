import prisma from '@/lib/prisma'

export default async function sitemap() {
  const baseUrl = 'https://upscatlas.com'

  // Fetch all Issues (Syllabus Nodes)
  const issues = await prisma.issue.findMany({
    select: { slug: true, lastUpdatedAt: true },
    where: { status: 'ACTIVE' }
  })

  // Fetch all Atlas Entries
  const entries = await prisma.mapEntry.findMany({
    select: { id: true, updatedAt: true }
  })

  const issueUrls = issues.map((issue) => ({
    url: `${baseUrl}/issues/${issue.slug}`,
    lastModified: issue.lastUpdatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const atlasUrls = entries.map((entry) => ({
    url: `${baseUrl}/atlas/map?entry=${entry.id}`,
    lastModified: entry.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
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
    ...issueUrls,
    ...atlasUrls,
  ]
}
