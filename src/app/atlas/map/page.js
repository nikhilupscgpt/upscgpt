import prisma from '@/lib/prisma'
import MapPageLoader from './MapPageLoader'

export async function generateMetadata({ searchParams }) {
  const { entry: entryId } = await searchParams;
  
  if (entryId) {
    const entry = await prisma.mapEntry.findUnique({
      where: { id: entryId },
      select: { name: true, category: true, aiNodeSummaryMarkdown: true }
    })
    
    if (entry) {
      return {
        title: `${entry.name} | Strategic Atlas`,
        description: entry.aiNodeSummaryMarkdown?.slice(0, 160) || `Strategic analysis of ${entry.name} (${entry.category}) for UPSC preparation.`,
        openGraph: {
          title: entry.name,
          description: entry.aiNodeSummaryMarkdown?.slice(0, 160),
        }
      }
    }
  }

  return {
    title: 'Strategic Geographic Atlas',
    description: 'Explore conflict zones, natural resources, and geopolitical hotspots annotated for UPSC preparation.',
  }
}

export default function MapPage() {
  return <MapPageLoader />
}
