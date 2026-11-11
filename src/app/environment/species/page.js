import EnvironmentAtlasClient from '@/components/EnvironmentAtlasClient';

export const metadata = {
  title: 'Species Atlas — IUCN Red List, WPA 1972 & Distribution | UPSCGPT',
  description:
    'Interactive UPSC CSE Species Atlas: High-yield Species in News, IUCN Red List status, Wildlife Protection Act schedules, CITES appendices, habitat maps, and co-occurring species.',
};

export default function SpeciesAtlasPage() {
  return <EnvironmentAtlasClient />;
}
