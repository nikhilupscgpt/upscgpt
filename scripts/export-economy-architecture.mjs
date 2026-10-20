import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('--- Exporting Indian Economy Architecture for Claude Bridging ---');

  // 1. Fetch all 40 existing nodes
  const existingNodes = await prisma.issue.findMany({
    where: { domain: 'INDIAN ECONOMY' },
    select: {
      id: true,
      title: true,
      slug: true,
      topic: true,
      category: true,
      nodeType: true,
      orderIndex: true,
      prelimsNote: true,
    },
    orderBy: { orderIndex: 'asc' }
  });

  // 2. Fetch all Prelims PYQ topics and question counts for Economy
  const drafts = await prisma.questionDraft.findMany({
    where: { srcSubject: 'Economy' },
    select: {
      id: true,
      questionNo: true,
      examName: true,
      examYear: true,
      srcTopic: true,
      stem: true,
    }
  });

  const topicMap = {};
  drafts.forEach(d => {
    if (!topicMap[d.srcTopic]) {
      topicMap[d.srcTopic] = { count: 0, sampleStems: [] };
    }
    topicMap[d.srcTopic].count++;
    if (topicMap[d.srcTopic].sampleStems.length < 3) {
      topicMap[d.srcTopic].sampleStems.push(`[${d.examName} ${d.examYear}] ${d.stem.slice(0, 100)}...`);
    }
  });

  // 3. Define the canonical Prelims syllabus sequence for Economy
  const syllabusFlow = [
    {
      syllabusOrder: 1,
      module: 'Macro Foundations',
      topic: 'Basic Economic Concepts',
      questionCount: topicMap['Basic Economic Concepts']?.count || 0,
      coreThemes: ['Opportunity Cost', 'Giffen vs Veblen Goods', 'Factors of Production', 'Economic vs Non-Economic Goods', 'Positive vs Normative Economics', 'Externalities']
    },
    {
      syllabusOrder: 2,
      module: 'Macro Foundations',
      topic: 'National Income & Growth',
      questionCount: topicMap['National Income & Growth']?.count || 0,
      coreThemes: ['GDP vs GNP vs NNP', 'Factor Cost vs Market Price', 'Real vs Nominal GDP', 'GDP Deflator', 'Gross Value Added (GVA)', 'Base Year Changes', 'Potential Output']
    },
    {
      syllabusOrder: 3,
      module: 'Macro Foundations',
      topic: 'Inflation',
      questionCount: topicMap['Inflation']?.count || 0,
      coreThemes: ['CPI vs WPI weights & coverage', 'Headline vs Core Inflation', 'Demand-Pull vs Cost-Push', 'Phillips Curve', 'Stagflation', 'Deflation vs Disinflation', 'Base Effect', 'Shrinkflation']
    },
    {
      syllabusOrder: 4,
      module: 'Macro Foundations',
      topic: 'Planning',
      questionCount: topicMap['Planning']?.count || 0,
      coreThemes: ['Historical Five Year Plans (1st to 12th)', 'Planning Commission vs NITI Aayog structure', 'Governing Council of NITI Aayog', 'Team India vs Knowledge Hub']
    },
    {
      syllabusOrder: 5,
      module: 'Macro Foundations',
      topic: 'Poverty, Unemployment & Human Development',
      questionCount: topicMap['Poverty, Unemployment & Human Development']?.count || 0,
      coreThemes: ['Poverty Line Estimation (Alagh, Lakdawala, Tendulkar, Rangarajan)', 'Multidimensional Poverty Index (MPI) dimensions', 'Gini Coefficient & Lorenz Curve', 'Types of Unemployment (Disguised, Structural, Frictional)', 'Periodic Labour Force Survey (PLFS)', 'Human Development Index (HDI)']
    },
    {
      syllabusOrder: 6,
      module: 'Money & Banking',
      topic: 'Banking & RBI',
      questionCount: topicMap['Banking & RBI']?.count || 0,
      coreThemes: ['RBI Functions & Structure', 'Quantitative Tools (CRR, SLR, Repo, Reverse Repo, SDF, MSF, OMO)', 'Qualitative Tools (Margin requirements, Moral Suasion)', 'Money Supply (M0, M1, M2, M3, M4)', 'Money Multiplier', 'High-Powered Money', 'Priority Sector Lending (PSL targets)', 'Prompt Corrective Action (PCA)', 'Cooperative Banks & Regulation Amendment', 'Payments Banks & Small Finance Banks', 'Bad Bank (NARCL/IDRCL)', 'Basel III Capital Adequacy (CAR/CRAR)', 'Insolvency & Bankruptcy Code (IBC)']
    },
    {
      syllabusOrder: 7,
      module: 'Money & Banking',
      topic: 'Monetary Policy',
      questionCount: topicMap['Monetary Policy']?.count || 0,
      coreThemes: ['Monetary Policy Framework Agreement 2016', 'Monetary Policy Committee (MPC) - 6 members, casting vote of Governor', 'Inflation Target (4% +/- 2% CPI)', 'Stances (Accommodative, Neutral, Calibrated Tightening, Withdrawal of Accommodation)']
    },
    {
      syllabusOrder: 8,
      module: 'Money & Banking',
      topic: 'Capital Markets & Financial Instruments',
      questionCount: topicMap['Capital Markets & Financial Instruments']?.count || 0,
      coreThemes: ['Money Market vs Capital Market', 'Treasury Bills (91, 182, 364 days)', 'Commercial Paper (CP)', 'Certificate of Deposit (CD)', 'Cash Management Bills (CMBs)', 'Call/Notice Money', 'Government Securities (G-Secs), Yields & Yield Curve inversion', 'Participatory Notes (P-Notes)', 'Sovereign Gold Bonds (SGB)', 'Green Bonds & Masala Bonds', 'REITs and InvITs', 'SEBI Powers & Role', 'Credit Rating Agencies (CRAs)']
    },
    {
      syllabusOrder: 9,
      module: 'Public Finance & Trade',
      topic: 'Fiscal Policy & Budget',
      questionCount: topicMap['Fiscal Policy & Budget']?.count || 0,
      coreThemes: ['Revenue Receipts (Tax + Non-tax) vs Capital Receipts (Borrowing, Disinvestment, Loan recovery)', 'Revenue Expenditure vs Capital Expenditure', 'Fiscal Deficit formula & financing', 'Revenue Deficit & Effective Revenue Deficit', 'Primary Deficit', 'Monetized Deficit', 'FRBM Act 2003 & NK Singh Committee targets', 'Article 266 (Consolidated Fund & Public Account) & Article 267 (Contingency Fund)', 'Finance Commission devolution formula']
    },
    {
      syllabusOrder: 10,
      module: 'Public Finance & Trade',
      topic: 'Taxation & GST',
      questionCount: topicMap['Taxation & GST']?.count || 0,
      coreThemes: ['Direct vs Indirect Taxes', 'Progressive vs Regressive Tax', 'Tax Buoyancy vs Tax Elasticity', 'GST Architecture (101st Constitutional Amendment)', 'GST Council (Article 279A, voting power 1/3 Centre, 2/3 States, 3/4 majority)', 'Cess vs Surcharge (Article 270/271)', 'Anti-Profiteering, E-way bill', 'Direct Tax Code, Minimum Alternate Tax (MAT), Equalisation Levy, GAAR']
    },
    {
      syllabusOrder: 11,
      module: 'Public Finance & Trade',
      topic: 'Balance of Payments & Exchange Rate',
      questionCount: topicMap['Balance of Payments & Exchange Rate']?.count || 0,
      coreThemes: ['Current Account (Trade Balance + Invisibles/Services/Remittances) vs Capital Account (FDI, FPI, ECB, NRI deposits)', 'Current Account Deficit (CAD) causes & remedies', 'Capital Account Convertibility (Tarapore Committee recommendations)', 'Foreign Exchange Reserves composition (Foreign Currency Assets, Gold, SDR, Reserve Tranche Position)', 'Nominal Effective Exchange Rate (NEER) vs Real Effective Exchange Rate (REER)', 'Depreciation vs Devaluation', 'Currency swaps & Internationalisation of Rupee']
    },
    {
      syllabusOrder: 12,
      module: 'Public Finance & Trade',
      topic: 'International Economic Organisations & Trade',
      questionCount: topicMap['International Economic Organisations & Trade']?.count || 0,
      coreThemes: ['WTO Boxes (Green Box, Blue Box, Amber Box/AMS, Peace Clause)', 'WTO Agreements (TRIPS, TRIMS, Agreement on Agriculture, SPS, TBT, Trade Facilitation Agreement)', 'IMF Structure, Quotas & Special Drawing Rights (SDR basket of 5 currencies)', 'World Bank Group (IBRD, IDA, IFC, MIGA, ICSID - India not in ICSID)', 'Asian Development Bank (ADB), Asian Infrastructure Investment Bank (AIIB - India 2nd largest shareholder), New Development Bank (NDB/BRICS)', 'Regional Trade Agreements (RCEP, ASEAN-India FTA, CEPA, CPTPP)']
    },
    {
      syllabusOrder: 13,
      module: 'Public Finance & Trade',
      topic: 'Foreign Investment',
      questionCount: topicMap['Foreign Investment']?.count || 0,
      coreThemes: ['FDI vs FPI (10% threshold rule by Mayaram Committee)', 'Automatic Route vs Government Approval Route', 'Prohibited sectors for FDI (Atomic Energy, Lottery, Gambling, Chit funds, Nidhi companies, Real estate business)', 'Round-tripping & Double Tax Avoidance Agreements (DTAA)', 'FPI Categories (Category I & II)']
    },
    {
      syllabusOrder: 14,
      module: 'Real Sector & Schemes',
      topic: 'Industry & Infrastructure',
      questionCount: topicMap['Industry & Infrastructure']?.count || 0,
      coreThemes: ['Index of Eight Core Industries (Refinery 28.04% > Electricity 19.85% > Steel > Coal > Crude Oil > Natural Gas > Cement > Fertilizers 2.63%)', 'Index of Industrial Production (IIP) base year & releasing agency (NSO/MoSPI)', 'PM Gati Shakti National Master Plan', 'National Infrastructure Pipeline (NIP)', 'PPP Models (Build-Operate-Transfer BOT, Hybrid Annuity Model HAM, Engineering-Procurement-Construction EPC, Swiss Challenge)', 'Disinvestment & Strategic Sale (DIPAM)']
    },
    {
      syllabusOrder: 15,
      module: 'Real Sector & Schemes',
      topic: 'Social Sector Schemes',
      questionCount: topicMap['Social Sector Schemes']?.count || 0,
      coreThemes: ['Social Security & Pension Schemes (Atal Pension Yojana APY, PM-SYM, PM-KMY)', 'Insurance Schemes (PMJJBY, PMSBY, PMFBY)', 'Financial Inclusion Schemes (PMJDY, Stand Up India, PM MUDRA Yojana with Shishu/Kishore/Tarun limits)', 'Urban & Rural Livelihood (MGNREGA wage indexing, PM SVANidhi, DAY-NRLM)']
    }
  ];

  const payload = {
    subject: 'Indian Economy',
    totalPrelimsQuestions: drafts.length,
    totalExistingNodesInDB: existingNodes.length,
    syllabusFlow,
    existingNodes: existingNodes.map(n => ({
      nodeId: n.id,
      title: n.title,
      slug: n.slug,
      topic: n.topic,
      nodeType: n.nodeType,
      orderIndex: n.orderIndex,
      hasPrelimsNote: Boolean(n.prelimsNote)
    }))
  };

  const localPath = path.resolve('./data/economy_nodes_architecture.json');
  fs.writeFileSync(localPath, JSON.stringify(payload, null, 2));

  const downloadPath = '/Users/nikhilwandhe/Downloads/economy_nodes_architecture.json';
  fs.writeFileSync(downloadPath, JSON.stringify(payload, null, 2));

  console.log(`✅ Saved Economy architecture to:\n   - ${localPath}\n   - ${downloadPath}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
