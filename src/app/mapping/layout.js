export const metadata = {
  title: 'UPSC Geography Mapping & Places in News (PIN) Atlas | UPSCGPT',
  description: 'Interactive UPSC Geography Atlas covering National Parks, Tiger Reserves, Ramsar Wetlands, Biosphere Reserves, Rivers, Mountain Passes, and Strategic Locations linked directly to Prelims PYQs.',
  keywords: [
    'UPSC Geography Mapping',
    'Places in News UPSC',
    'PIN Geography UPSC',
    'National Parks UPSC',
    'Tiger Reserves UPSC Map',
    'Ramsar Sites India UPSC',
    'UPSC Map Questions',
    'UPSC Prelims Geography'
  ],
  alternates: {
    canonical: '/mapping',
  },
  openGraph: {
    title: 'UPSC Geography Mapping & Places in News Atlas | UPSCGPT',
    description: 'Interactive GIS mapping for UPSC CSE covering National Parks, Ramsar sites, Mountain Passes, and Rivers linked directly to Prelims PYQs.',
    url: 'https://www.upscgpt.in/mapping',
    siteName: 'UPSCGPT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPSC Geography Mapping & Places in News Atlas | UPSCGPT',
    description: 'Interactive GIS mapping for UPSC CSE linked to Prelims PYQs.',
  },
};

export default function MappingLayout({ children }) {
  return children;
}
