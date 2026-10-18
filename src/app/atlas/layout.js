export const metadata = {
  title: 'Interactive UPSC Geography Atlas & Places in News (PIN) | UPSCGPT',
  description: 'Interactive GIS Atlas for UPSC Civil Services Examination. Explore National Parks, Tiger Reserves, Ramsar Wetlands, Rivers, Mountain Passes, and Global Geopolitics linked directly to PYQs.',
  keywords: [
    'UPSC Atlas',
    'UPSC Geography Mapping',
    'Places in News UPSC',
    'National Parks India UPSC',
    'Ramsar Sites UPSC',
    'Tiger Reserves Map',
    'UPSC Map Practice'
  ],
  alternates: {
    canonical: '/atlas',
  },
  openGraph: {
    title: 'Interactive UPSC Geography Atlas & Places in News | UPSCGPT',
    description: 'Explore National Parks, Tiger Reserves, Ramsar Wetlands, Rivers, and Mountain Passes linked to PYQs.',
    url: 'https://www.upscgpt.in/atlas',
    siteName: 'UPSCGPT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive UPSC Geography Atlas | UPSCGPT',
    description: 'Explore National Parks, Tiger Reserves, Ramsar Wetlands, and Mountain Passes linked to PYQs.',
  },
};

export default function AtlasLayout({ children }) {
  return children;
}
