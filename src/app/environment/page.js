import EnvironmentAtlasClient from '@/components/EnvironmentAtlasClient';

export const metadata = {
  title: 'Environment Atlas — Species, Protected Areas, Acts & Conventions | UPSCGPT',
  description:
    'Interactive UPSC CSE & Prelims Environment Atlas: High-yield Species in News, National Parks, Tiger Reserves, Ramsar Sites, Conventions, and Statutory Bodies with UPSC traps.',
};

export default function EnvironmentAtlasPage() {
  return <EnvironmentAtlasClient />;
}
