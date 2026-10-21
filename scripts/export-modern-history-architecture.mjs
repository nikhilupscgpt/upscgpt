import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('--- Exporting Modern History Architecture for Claude Bridging ---');

  // 1. Fetch all 25 existing nodes in MODERN HISTORY
  const existingNodes = await prisma.issue.findMany({
    where: { domain: 'MODERN HISTORY' },
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

  // 2. Fetch all Prelims PYQ topics and question counts
  const drafts = await prisma.questionDraft.findMany({
    where: { srcSubject: 'Modern History' },
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

  // 3. Define the canonical Prelims syllabus sequence for Modern History
  const syllabusFlow = [
    {
      syllabusOrder: 1,
      module: 'Foundations',
      topic: 'Advent of Europeans & British Expansion',
      questionCount: topicMap['Advent of Europeans & British Expansion']?.count || 0,
      coreThemes: [
        'Arrival Order of Europeans (Portuguese > Dutch > English > Danish > French) & Factories (Calicut, Cochin, Surat, Masulipatnam, Pulicat)',
        'Carnatic Wars (Dupleix, Treaty of Aix-la-Chapelle, Battle of Wandiwash 1760)',
        'British Conquest of Bengal (Battle of Plassey 1757, Battle of Buxar 1764, Treaty of Allahabad 1765 & Dual System by Clive)',
        'Anglo-Mysore Wars (Haidar Ali, Tipu Sultan, Treaty of Seringapatam 1792)',
        'Anglo-Maratha Wars (Treaty of Salbai, Treaty of Bassein, Peshwaship abolition 1818)',
        'Anglo-Sikh Wars (Ranjit Singh, Treaty of Amritsar, Annexation of Punjab 1849)',
        'British Expansionist Policies (Ring Fence by Warren Hastings, Subsidiary Alliance by Wellesley, Doctrine of Lapse by Dalhousie - Satara, Sambalpur, Jhansi, Nagpur, Awadh annexation on misgovernance 1856)'
      ]
    },
    {
      syllabusOrder: 2,
      module: 'Foundations',
      topic: 'Revolt of 1857, Tribal & Peasant Movements',
      questionCount: topicMap['Revolt of 1857, Tribal & Peasant Movements']?.count || 0,
      coreThemes: [
        'Revolt of 1857 (Causes: Enfield rifle, greased cartridges, General Service Enlistment Act; Centers & Leaders: Delhi / Bahadur Shah Zafar & Bakht Khan, Kanpur / Nana Saheb & Tantia Tope, Lucknow / Begum Hazrat Mahal, Jhansi / Rani Lakshmibai, Bihar / Kunwar Singh, Faizabad / Maulvi Ahmadullah; British Commanders: John Nicholson, Colin Campbell, Hugh Rose)',
        'Tribal Uprisings (Santhal Hool 1855-56 / Sidhu & Kanhu, Munda Ulgulan 1899-1900 / Birsa Munda, Kol Uprising / Buddho Bhagat, Khasi Revolt / Tirot Sing, Rampa Rebellion / Alluri Sitarama Raju, Chenchu Movement, Koya Revolt)',
        'Civil & Peasant Rebellions (Sanyasi Rebellion & Anandamath, Paika Rebellion 1817 / Bakshi Jagabandhu, Indigo Revolt 1859-60 & Nil Darpan, Pabna Agrarian Leagues 1873, Deccan Riots 1875 & Deccan Agriculturists Relief Act 1879, Moplah / Malabar Rebellion 1921, Bardoli Satyagraha 1928 / Sardar Patel title)'
      ]
    },
    {
      syllabusOrder: 3,
      module: 'Reform & Nationalism',
      topic: 'Socio-Religious Reform Movements',
      questionCount: topicMap['Socio-Religious Reform Movements']?.count || 0,
      coreThemes: [
        'Bengal Renaissance (Raja Ram Mohan Roy, Atmiya Sabha 1814, Brahmo Samaj 1828, Sambad Kaumudi, Mirat-ul-Akbar, Abolition of Sati 1829; Debendranath Tagore / Tattvabodhini Sabha; Keshub Chandra Sen / Brahmo Samaj of India; Ishwar Chandra Vidyasagar & Hindu Widows Remarriage Act 1856; Young Bengal Movement / Henry Vivian Derozio)',
        'Western India Reforms (Prarthana Samaj 1867 / Atmaram Pandurang & M.G. Ranade; Satyashodhak Samaj 1873 / Jyotirao Phule, Gulamgiri; Gopal Hari Deshmukh / Lokahitawadi; Servants of India Society 1905 / G.K. Gokhale; B.R. Ambedkar / Bahishkrit Hitakarini Sabha, Mahad Satyagraha 1927, Mooknayak)',
        'Northern India Reforms (Arya Samaj 1875 / Swami Dayanand Saraswati, "Go Back to the Vedas", Satyarth Prakash, Shuddhi Movement, DAV College vs Gurukul Kangri; Ramakrishna Mission 1897 / Swami Vivekananda, Chicago Parliament of Religions 1893)',
        'South India Reforms (Self-Respect Movement / Periyar E.V. Ramasamy, Kudi Arasu; SNDP Yogam / Sri Narayana Guru, "One Caste, One Religion, One God for Man", Aravippuram Movement 1888; Vaikom Satyagraha 1924)',
        'Muslim Reform Movements (Aligarh Movement / Sir Syed Ahmad Khan, MAO College; Deoband Movement / Mohammad Qasim Nanautavi & Rashid Ahmad Gangohi; Faraizi Movement / Haji Shariatullah; Ahmadiyya Movement / Mirza Ghulam Ahmad)'
      ]
    },
    {
      syllabusOrder: 4,
      module: 'Reform & Nationalism',
      topic: 'Early Nationalism & Congress (1885-1919)',
      questionCount: topicMap['Early Nationalism & Congress (1885-1919)']?.count || 0,
      coreThemes: [
        'Pre-Congress Associations (Landholders Society 1838, British Indian Association 1851, East India Association 1866 / Dadabhai Naoroji, Poona Sarvajanik Sabha 1870 / Ranade, Indian Association 1876 / Surendranath Banerjee, Madras Mahajana Sabha 1884, Bombay Presidency Association 1885)',
        'Indian National Congress Foundation (1885 at Bombay / A.O. Hume, W.C. Bonnerjee, Safety Valve Theory)',
        'Moderate Phase (1885-1905: Dadabhai Naoroji, Pherozeshah Mehta, Dinshaw Wacha, Gokhale; Economic Critique of Imperialism / Drain of Wealth Theory - Poverty and Un-British Rule in India)',
        'Partition of Bengal 1905 by Curzon & Swadeshi / Boycott Movement (Vande Mataram, National Council of Education 1906, Bengal Chemical Swadeshi Stores / P.C. Ray, Amar Sonar Bangla; Annulment in 1911 by Hardinge)',
        'Surat Split 1907 (Moderates vs Extremists / Lal-Bal-Pal, Rash Behari Ghosh president)',
        'Muslim League Foundation (1906 at Dhaka / Nawab Salimullah, Aga Khan)',
        'Morley-Minto Reforms 1909 (Separate Electorates for Muslims)',
        'First World War & Home Rule League Movement (1916: Bal Gangadhar Tilak / Kesari, Mahratta; Annie Besant / New India, Commonweal; Lucknow Pact 1916 / INC-Muslim League joint demands, Moderate-Extremist reunion)',
        'Revolutionary Activities in India & Abroad (Anushilan Samiti, Jugantar, Abhinav Bharat / V.D. Savarkar; Ghadar Movement 1913 / Lala Har Dayal, Sohan Singh Bhakna, San Francisco; Komagata Maru Incident 1914; Berlin Committee / Virendranath Chattopadhyaya; Kakori Robbery 1925 / HRA)'
      ]
    },
    {
      syllabusOrder: 5,
      module: 'Reform & Nationalism',
      topic: 'Gandhian Era & Mass Movements (1915-1947)',
      questionCount: topicMap['Gandhian Era & Mass Movements (1915-1947)']?.count || 0,
      coreThemes: [
        'Mahatma Gandhi Return to India (9 Jan 1915) & Early Satyagrahas (Champaran 1917 / Tinkathia system, Rajkumar Shukla; Ahmedabad Mill Strike 1918 / First hunger strike, plague bonus; Kheda Satyagraha 1918 / First non-cooperation, revenue remission)',
        'Rowlatt Act 1919, Jallianwala Bagh Massacre (13 April 1919 / General Dyer, Rabindranath Tagore renounces Knighthood, Hunter Committee)',
        'Khilafat Movement (Ali Brothers - Shaukat Ali & Mohammad Ali, Maulana Azad) & Non-Cooperation Movement (1920-22: Nagpur Session 1920, Chauri Chaura incident 4 Feb 1922, Bardoli resolution withdrawal)',
        'Swarajists vs No-Changers (C.R. Das, Motilal Nehru / Congress-Khilafat Swarajya Party 1923 vs Rajagopalachari, Vallabhbhai Patel)',
        'Simon Commission 1927 (All-white, boycott, death of Lala Lajpat Rai)',
        'Nehru Report 1928 (Dominion Status, Fundamental Rights, rejection of separate electorates) vs Jinnah 14 Points',
        'Lahore Session 1929 (Jawaharlal Nehru president, Purna Swaraj declaration, 26 Jan 1930 as Independence Day)',
        'Civil Disobedience Movement (Dandi March 12 March to 6 April 1930, Salt Satyagraha; Dharasana Satyagraha / Sarojini Naidu, Manilal; Red Shirts / Khan Abdul Ghaffar Khan / Khudai Khidmatgar in NWFP; Chittagong Armoury Raid 1930 / Surya Sen)',
        'Gandhi-Irwin Pact 1931 & Karachi Session 1931 (Fundamental Rights & National Economic Programme resolution / Vallabhbhai Patel president)',
        'Round Table Conferences (1st 1930, 2nd 1931 - Gandhi attended, 3rd 1932)',
        'Communal Award 1932 (Ramsay MacDonald) & Poona Pact 1932 (Gandhi & Ambedkar, reserved seats instead of separate electorates)',
        'Congress Ministries (1937-1939) & Resignation on outbreak of WWII',
        'August Offer 1940 (Linlithgow) & Individual Satyagraha (Vinoba Bhave 1st, Nehru 2nd)',
        'Cripps Mission 1942 ("Post-dated cheque on a crashing bank")',
        'Quit India Movement (8 Aug 1942 at Gowalia Tank Bombay / "Do or Die", Aruna Asaf Ali, Usha Mehta underground radio, Parallel Governments / Ballia - Chittu Pandey, Tamluk - Jatiya Sarkar, Satara - Prati Sarkar)',
        'Indian National Army (INA / Azad Hind Fauj: Mohan Singh, Subhas Chandra Bose, Provisional Govt of Free India in Singapore, INA Trials at Red Fort 1945 / Bhulabhai Desai, Tej Bahadur Sapru)',
        'CR Formula 1944, Wavell Plan & Simla Conference 1945, Royal Indian Navy (RIN) Mutiny Feb 1946',
        'Cabinet Mission 1946 (Pethick-Lawrence, Stafford Cripps, A.V. Alexander; rejected Pakistan, grouping of provinces A/B/C, Constituent Assembly)',
        'Direct Action Day (16 Aug 1946), Interim Government (Sept 1946), Mountbatten Plan / 3rd June Plan 1947, Indian Independence Act 1947, Radcliife Boundary Commission'
      ]
    },
    {
      syllabusOrder: 6,
      module: 'Governance & People',
      topic: 'Constitutional & Administrative Developments',
      questionCount: topicMap['Constitutional & Administrative Developments']?.count || 0,
      coreThemes: [
        'Regulating Act 1773 (Governor of Bengal -> Governor-General of Bengal / Warren Hastings, Supreme Court at Calcutta 1774)',
        'Pitts India Act 1784 (Board of Control for political, Court of Directors for commercial - Double Government)',
        'Charter Act 1793 (Company monopoly renewed for 20 years)',
        'Charter Act 1813 (Ended commercial monopoly except tea and trade with China, Rs 1 lakh for education, Christian missionaries allowed)',
        'Charter Act 1833 (Governor-General of Bengal -> Governor-General of India / William Bentinck, ended all commercial activities, Law Member added / Macaulay, Indian Law Commission)',
        'Charter Act 1853 (Separation of executive and legislative functions, open competition for Civil Services / Macaulay Committee 1854)',
        'Government of India Act 1858 (Act for Better Government of India, abolition of Court of Directors & Board of Control, Secretary of State for India with 15-member council, Viceroy title / Canning)',
        'Indian Councils Act 1861 (Portfolio system / Canning, ordinance making power, restored legislative powers to Bombay & Madras)',
        'Indian Councils Act 1892 (Indirect election for non-official members, right to discuss budget and ask questions without supplementary questions)',
        'Indian Councils Act 1909 / Morley-Minto (Separate Electorates for Muslims, non-official majority in provincial councils, Satyendra Prasad Sinha first Indian in Viceroy Executive Council)',
        'Government of India Act 1919 / Montagu-Chelmsford (Dyarchy in Provinces - Transferred vs Reserved subjects, Bicameralism at Centre, direct elections, Public Service Commission established 1926)',
        'Government of India Act 1935 (All-India Federation, Provincial Autonomy - Dyarchy abolished in provinces and introduced at Centre, Federal Court established 1937, Reserve Bank of India, 3 Legislative Lists)',
        'Judicial & Police Reforms (Cornwallis Code 1793 - separation of revenue and judicial administration; Police Commission 1860 / Indian Police Act 1861)',
        'Civil Services Evolution (Wellesley / Fort William College 1800, Haileybury College, Aitchison Commission 1886, Lee Commission 1924)',
        'Land Revenue Systems (Permanent Settlement 1793 / Cornwallis in Bengal, Bihar, Orissa; Ryotwari System / Thomas Munro & Alexander Read in Madras, Bombay; Mahalwari System / Holt Mackenzie in NWFP, Punjab, Central India)'
      ]
    },
    {
      syllabusOrder: 7,
      module: 'Governance & People',
      topic: 'Personalities, Press & Culture',
      questionCount: topicMap['Personalities, Press & Culture']?.count || 0,
      coreThemes: [
        'Evolution of Press (James Augustus Hicky / Bengal Gazette 1780; Censorship of Press Act 1799 / Wellesley; Licensing Regulations 1823 / John Adams; Charles Metcalfe / "Liberator of Indian Press" 1835; Vernacular Press Act 1878 / Lytton - "Gagging Act", Amrita Bazar Patrika overnight switched to English; Repealed by Ripon 1882)',
        'Major Nationalist Newspapers & Editors (The Hindu / G. Subramaniya Aiyar; The Bengalee / Surendranath Banerjee; Voice of India / Dadabhai Naoroji; Kesari & Mahratta / Tilak; Young India, Harijan, Navjivan / Gandhi; Al-Hilal / Abul Kalam Azad; National Herald / Nehru; Independent / Motilal Nehru; Comrade / Mohammad Ali; Bandi Jivan / Sachindra Nath Sanyal; Pather Dabi / Sarat Chandra Chattopadhyay)',
        'Educational Developments (Charles Grant / father of modern education in India; Calcutta Madrasa 1781 / Warren Hastings; Asiatic Society of Bengal 1784 / William Jones; Sanskrit College Varanasi 1791 / Jonathan Duncan; Macaulay Minute 1835 / Downward Filtration Theory, English medium; Woods Despatch 1854 / "Magna Carta of English Education in India", primary education in vernacular, university creation at Calcutta/Bombay/Madras 1857; Hunter Education Commission 1882; Raleigh Commission & Indian Universities Act 1904 / Curzon; Saddler University Commission 1917; Wardha Scheme of Basic Education 1937 / Zakir Husain Committee / Nai Talim; Sergeant Plan 1944)',
        'Famine Commissions (Campbell Commission 1866, Strachey Commission 1880 / Famine Code, Lyall Commission 1897, MacDonnell Commission 1901)'
      ]
    },
    {
      syllabusOrder: 8,
      module: 'Governance & People',
      topic: 'Miscellaneous',
      questionCount: topicMap['Miscellaneous']?.count || 0,
      coreThemes: [
        'Foreign Policy of Colonial India (Anglo-Afghan Wars & Forward Policy, Anglo-Burmese Wars, Anglo-Tibetan Relations & Younghusband Expedition 1904)',
        'Integration of Princely States (Instrument of Accession, Standstill Agreement, Role of Sardar Patel & V.P. Menon, Junagadh, Hyderabad / Operation Polo, Kashmir)',
        'Historical Chronology & Contemporary World Events (French Revolution impact, American Civil War & Cotton Boom in India, Russo-Japanese War 1905 impact, Bolshevik Revolution 1917)'
      ]
    }
  ];

  const payload = {
    subject: 'Modern History',
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

  const localPath = path.resolve('./data/modern_history_nodes_architecture.json');
  fs.writeFileSync(localPath, JSON.stringify(payload, null, 2));

  const downloadPath = '/Users/nikhilwandhe/Downloads/modern_history_nodes_architecture.json';
  fs.writeFileSync(downloadPath, JSON.stringify(payload, null, 2));

  console.log(`✅ Saved Modern History architecture to:\n   - ${localPath}\n   - ${downloadPath}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
