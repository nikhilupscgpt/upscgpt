import PyqAssistant from '@/components/PyqAssistant';

export const metadata = {
  title: 'UPSC Prelims PYQ Analysis & Chat (2011–2026) | UPSCGPT',
  description:
    'Interactive UPSC CSE Prelims PYQ analysis dashboard (2011–2026) with rule-based PYQ statistics & tutor assistant.',
};

export default function PyqPage() {
  return <PyqAssistant height="100vh" />;
}
