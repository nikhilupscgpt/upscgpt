// Sidebar grouping of micro-topics (display only — the DB keeps flat srcTopic values).
// Any topic not listed for a subject falls into a trailing "More" group.

export const TOPIC_GROUPS = {
  'Indian Polity': [
    ['Foundations', [
      'Historical Background', 'Constituent Assembly', 'Salient Features of the Constitution', 'Preamble',
      'Basic Structure', 'Constitutional Amendments', 'Schedules of the Constitution',
    ]],
    ['Rights & Duties', ['Fundamental Rights', 'Directive Principles of State Policy', 'Fundamental Duties', 'Citizenship']],
    ['Executive', [
      'President', 'Vice-President', 'Prime Minister & Council of Ministers', 'Union Executive & Ministries',
      'Attorney General & Solicitor General', 'Emergency Provisions', 'Governor',
    ]],
    ['Legislature', [
      'Parliament', 'Parliamentary System', 'Parliamentary Committees', 'Budget & Financial Procedure',
      'Elections & Representation', 'Elections & Political Parties', 'State Legislature',
    ]],
    ['Judiciary', ['Supreme Court', 'High Courts', 'Subordinate Courts', 'Tribunals', 'Judicial Review & Landmark Judgements']],
    ['Federalism & Local Govt', [
      'Centre-State Relations', 'Inter-State Relations', 'Federal System', 'Finance Commission',
      'Panchayati Raj', 'Municipalities', 'Scheduled & Tribal Areas',
    ]],
    ['Bodies & Others', [
      'Statutory & Non-Constitutional Bodies', 'National Commissions (SC/ST/BC/Women/Minorities)',
      'Comptroller and Auditor General', 'Political Theory & Concepts', 'International Organisations & Relations',
      'National Symbols & Awards', 'Miscellaneous',
    ]],
  ],
  Economy: [
    ['Macro Foundations', ['Basic Economic Concepts', 'National Income & Growth', 'Inflation', 'Planning', 'Poverty, Unemployment & Human Development']],
    ['Money & Finance', ['Banking & RBI', 'Monetary Policy', 'Capital Markets & Financial Instruments']],
    ['Government & Trade', [
      'Fiscal Policy & Budget', 'Taxation & GST', 'Balance of Payments & Exchange Rate',
      'International Economic Organisations & Trade', 'Foreign Investment',
    ]],
    ['Sectors & Schemes', ['Industry & Infrastructure', 'Social Sector Schemes']],
  ],
  Geography: [
    ['Physical', ['Geomorphology', 'Climatology', 'Oceanography', 'Universe & Solar System', 'Indian Physiography & Drainage', 'Soils & Natural Vegetation']],
    ['Human & Economic', ['Agriculture & Resources', 'Industry, Transport & Trade', 'Population & Human Geography']],
    ['World', ['World Geography & Places', 'Miscellaneous Geography']],
  ],
  'Science & Technology': [
    ['Core Sciences', ['Physics', 'Chemistry', 'Biology', 'General Science']],
    ['Applied Science', ['Biotechnology & Genetics', 'Health, Diseases & Medicine', 'Nanotechnology & Materials']],
    ['Tech & Energy', ['Space Technology', 'Nuclear & Energy Technology', 'IT, Communication & Computing', 'Defence Technology']],
  ],
  'Modern History': [
    ['Foundations', ['Advent of Europeans & British Expansion', 'Revolt of 1857, Tribal & Peasant Movements']],
    ['Reform & Nationalism', ['Socio-Religious Reform Movements', 'Early Nationalism & Congress (1885-1919)', 'Gandhian Era & Mass Movements (1915-1947)']],
    ['Governance & People', ['Constitutional & Administrative Developments', 'Personalities, Press & Culture', 'Miscellaneous']],
  ],
};

/** Returns [{ label, items: [[topic, count], ...] }] for a subject, given [[topic,count],...] */
export function groupTopics(subject, topicCounts) {
  const groups = TOPIC_GROUPS[subject];
  if (!groups) return [{ label: null, items: topicCounts }];

  const countMap = new Map(topicCounts);
  const used = new Set();
  const out = [];

  for (const [label, names] of groups) {
    const items = names.filter(n => countMap.has(n)).map(n => { used.add(n); return [n, countMap.get(n)]; });
    if (items.length) out.push({ label, items });
  }
  const rest = topicCounts.filter(([n]) => !used.has(n));
  if (rest.length) out.push({ label: out.length ? 'More' : null, items: rest });
  return out;
}

export const SUBJECT_SHORT = {
  'Indian Polity': 'Polity',
  'Science & Technology': 'Sci & Tech',
  'Modern History': 'Modern Hist.',
  'Ancient History': 'Ancient Hist.',
  'Medieval History': 'Medieval Hist.',
  'Art & Culture': 'Art & Culture',
};

export const SUBJECT_ORDER = [
  'Indian Polity', 'Geography', 'Economy', 'Environment', 'Science & Technology',
  'Modern History', 'Ancient History', 'Medieval History', 'Art & Culture', 'Agriculture',
];
