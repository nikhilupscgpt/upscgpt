// One-off: fold the ad-hoc topic tags used for the 2024/2025 papers into the canonical taxonomy
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const byTopic = [
  ['Indian Polity', 'Constitutional Framework & Amendment', 'Constitutional Amendments'],
  ['Indian Polity', 'Constitutional Framework & Assembly', 'Constituent Assembly'],
  ['Indian Polity', 'Constitutional Framework', 'Salient Features of the Constitution'],
  ['Indian Polity', 'Constitutional & Executive Bodies', 'Statutory & Non-Constitutional Bodies'],
  ['Indian Polity', 'Constitutional & Statutory Bodies', 'Statutory & Non-Constitutional Bodies'],
  ['Indian Polity', 'Constitutional Bodies', 'Statutory & Non-Constitutional Bodies'],
  ['Indian Polity', 'Federal Relations & Seventh Schedule', 'Centre-State Relations'],
  ['Indian Polity', 'Executive & Defense Administration', 'Union Executive & Ministries'],
  ['Indian Polity', 'Executive & Governance', 'Union Executive & Ministries'],
  ['Indian Polity', 'Judiciary', 'Fundamental Rights'],
  ['Indian Polity', 'Local Bodies', 'Inter-State Relations'],
  ['Economy', 'Health, Diseases & Medicine', 'Social Sector Schemes'],
];
// Per-question overrides (dedupHash -> topic)
const byId = {
  'UPSC-2025-54': 'Governor',
  'UPSC-2025-59': 'Governor',
  'UPSC-2025-86': 'President',
  'UPSC-2025-91': 'Panchayati Raj',
  'UPSC-2024-70': 'Inter-State Relations',
};

let n = 0;
for (const [id, topic] of Object.entries(byId)) {
  const r = await prisma.questionDraft.updateMany({ where: { dedupHash: id }, data: { srcTopic: topic } });
  n += r.count;
}
for (const [subject, from, to] of byTopic) {
  const r = await prisma.questionDraft.updateMany({
    where: { srcSubject: subject, srcTopic: from, examYear: { gte: 2024 } },
    data: { srcTopic: to },
  });
  n += r.count;
}
console.log('Re-tagged', n, 'questions');
await prisma.$disconnect();
