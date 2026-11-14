import EnvironmentHubClient from '@/components/EnvironmentHubClient';
import curatedSpecies from '@/lib/curated-env-species.json';

export const metadata = {
  title: 'Environment & Ecology Hub — Species, Protected Areas, Acts & Conventions | UPSCGPT',
  description:
    'Dedicated UPSC CSE & Prelims Environment Atlas: High-yield Species Atlas, National Parks, Tiger Reserves, Ramsar Sites, Conventions, and Statutory Bodies with UPSC traps.',
};

export default function EnvironmentHubPage() {
  const items = Array.isArray(curatedSpecies?.items) ? curatedSpecies.items : [];
  const starters = items
    .filter((item) => item.isStarter || item.startWith)
    .slice(0, 5)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      iucn: (item.statusBadges?.iucn || 'EN').toUpperCase(),
      category: item.category || '',
    }));

  const counts = {
    total: items.length,
    cr: items.filter((i) => (i.statusBadges?.iucn || '').toUpperCase() === 'CR').length,
    en: items.filter((i) => (i.statusBadges?.iucn || '').toUpperCase() === 'EN').length,
    vu: items.filter((i) => (i.statusBadges?.iucn || '').toUpperCase() === 'VU').length,
  };

  return <EnvironmentHubClient counts={counts} starters={starters} />;
}
