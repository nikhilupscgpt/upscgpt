import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample mock test...');

  const mockTest = await prisma.testPack.create({
    data: {
      title: 'UPSC GS Prelims 2024 — Full Length Mock 01',
      description: 'A comprehensive mock test covering History, Geography, Polity, and Economy. Calibrated to the 2023 difficulty level with 0.66 negative marking.',
      type: 'MOCK',
      durationMins: 120,
      passingScore: 50, // 100/200 marks
      negativeMarking: 0.66,
      marksPerQuestion: 2.0,
      questions: {
        create: [
          {
            text: 'With reference to the "Gupta Empire", consider the following statements:\n1. Chandragupta I was the first ruler to adopt the title of Maharajadhiraja.\n2. The Gupta era started in 319-320 AD.\n3. Fahien visited India during the reign of Samudragupta.\nWhich of the statements given above is/are correct?',
            options: [
              { label: 'a', text: '1 and 2 only' },
              { label: 'b', text: '2 and 3 only' },
              { label: 'c', text: '1 and 3 only' },
              { label: 'd', text: '1, 2 and 3' }
            ],
            correctLabel: 'a',
            explanation: 'Chandragupta I was indeed the first to use the title Maharajadhiraja. The Gupta era began with his accession in 319-320 AD. However, Fahien visited India during the reign of Chandragupta II, not Samudragupta.',
            difficulty: 'MEDIUM',
            domain: 'HISTORY'
          },
          {
            text: 'Which of the following describes the "Equatorial Climate" correctly?',
            options: [
              { label: 'a', text: 'High temperature and high humidity throughout the year.' },
              { label: 'b', text: 'High temperature in summer and extreme cold in winter.' },
              { label: 'c', text: 'Moderate temperature with distinct seasons.' },
              { label: 'd', text: 'Low temperature and low rainfall.' }
            ],
            correctLabel: 'a',
            explanation: 'The equatorial climate is characterized by high temperatures (around 27°C) and high humidity with convectional rainfall almost every afternoon throughout the year.',
            difficulty: 'EASY',
            domain: 'GEOGRAPHY'
          },
          {
            text: 'Consider the following statements regarding the "Governor" of a State in India:\n1. The Governor can be a member of either House of Parliament.\n2. The oath of office to the Governor is administered by the Chief Justice of the concerned State High Court.\n3. The Governor holds office during the pleasure of the President.\nWhich of the statements given above are correct?',
            options: [
              { label: 'a', text: '1 and 2 only' },
              { label: 'b', text: '2 and 3 only' },
              { label: 'c', text: '1 and 3 only' },
              { label: 'd', text: '1, 2 and 3' }
            ],
            correctLabel: 'b',
            explanation: 'Statement 1 is incorrect. The Governor shall not be a member of either House of Parliament or of a House of the Legislature of any State specified in the First Schedule. If a member of either House of Parliament or of a House of the Legislature of any such State be appointed Governor, he shall be deemed to have vacated his seat in that House on the date on which he enters upon his office as Governor.',
            difficulty: 'HARD',
            domain: 'POLITY'
          },
          {
            text: 'Which of the following is NOT a part of the "Capital Budget" of the Government of India?',
            options: [
              { label: 'a', text: 'Loans to State Governments' },
              { label: 'b', text: 'Investment in shares of Public Sector Undertakings' },
              { label: 'c', text: 'Interest payments on public debt' },
              { label: 'd', text: 'Expenditure on acquisition of land' }
            ],
            correctLabel: 'c',
            explanation: 'Interest payments on public debt fall under Revenue Expenditure, not Capital Expenditure. Capital Budget includes items that create assets or reduce liabilities.',
            difficulty: 'MEDIUM',
            domain: 'ECONOMY'
          }
        ]
      }
    }
  });

  console.log(`Mock test created with ID: ${mockTest.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
