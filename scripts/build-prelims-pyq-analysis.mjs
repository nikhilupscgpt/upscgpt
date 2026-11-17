import fs from 'node:fs';
import path from 'node:path';
import { TOPIC_GROUPS, SUBJECT_ORDER } from '../src/app/prelims/pyq/topicGroups.js';

const YEARS = [
  2011, 2012, 2013, 2014, 2015,
  2016, 2017, 2018, 2019, 2020,
  2021, 2022, 2023, 2024, 2025,
];

/**
 * Curated UPSC CSE Prelims domain intelligence per Subject and Theme
 * (recurring concepts, signature UPSC traps, and 2026 focus predictions),
 * combined with empirical 2011-2025 question mining.
 */
const SUBJECT_STRATEGY = {
  'Indian Polity': {
    overview:
      'Indian Polity is one of the highest-ROI pillars in UPSC CSE Prelims, averaging ~15 questions per year with high conceptual repeatability around constitutional text, parliamentary procedure, and fundamental rights.',
    recurringConcepts: [
      'Scope and enforceability of Fundamental Rights (Articles 14, 19, 21) vs DPSP and Fundamental Duties',
      'Parliamentary devices, money bills vs financial bills, joint sitting exceptions, and committee mandates',
      'Discretionary powers of President and Governor, ordinance-making limits, and pardoning powers',
      'Supreme Court original vs appellate jurisdiction, judicial review, Basic Structure doctrine, and writ contours',
      'Fifth & Sixth Schedules, 73rd/74th Amendments, and asymmetric federalism provisions',
    ],
    traps: [
      'Swapping "Constitution explicitly defines/mentions" with "regulated by Parliamentary statute or convention" (e.g., office of profit, judicial review grounds, no-confidence motion).',
      'Confusing "all members of Parliament" with "elected members only" in electoral colleges vs impeachment/removal processes.',
      'Assuming DPSPs or Fundamental Duties are enforceable by writs, or that Constitutional Amendment Bills can go to a Joint Sitting.',
      'Over-generalising exclusive Rajya Sabha powers (Article 249, 312) vs Lok Sabha dominance in financial matters.',
    ],
    predictions2026: [
      'Delimitation & Women Reservation implementation mechanics (106th Amendment) and census-linked seat freezes.',
      'Governor reservation of bills (Articles 200/201), Pocket Veto vs Supreme Court timelines, and Speaker disqualification jurisdiction (10th Schedule).',
      'Sixth Schedule autonomous councils, PESA operational rules, and sub-categorisation within Scheduled Castes.',
      'Parliamentary privileges, Ethics Committee vs Privileges Committee, and Sovereign Green Bonds / Public Account custody.',
    ],
  },
  Economy: {
    overview:
      'Economy consistently contributes 15–18 questions every year, testing transmission mechanisms (monetary/fiscal), BoP accounting, financial instruments, and RBI/SEBI regulatory boundaries rather than rote statistics.',
    recurringConcepts: [
      'RBI monetary policy tools (LAF, Repo, SDF, MSF, CRR, SLR, OMO) and money multiplier determinants',
      'Inflation dynamics (CPI vs WPI weightage, core inflation, imported inflation, bond yield relationship)',
      'Balance of Payments (Current vs Capital account components, NEER/REER, external debt composition, forex reserves)',
      'Fiscal deficit, primary deficit, FRBM glide path, capital vs revenue receipts/expenditure',
      'Digital public infrastructure, NBFC/Urban Co-operative Bank regulation, and sovereign/corporate debt instruments',
    ],
    traps: [
      'Reversing bond price and bond yield directions when interest rates or inflation expectations change.',
      'Treating disinvestment receipts, loan recoveries, or RBI dividend transfers in the wrong budget account (Capital vs Revenue).',
      'Assuming "steadily increased/decreased over the last decade" for GDP growth, tax-to-GDP, or fiscal deficit trends.',
      'Confusing demand-pull vs cost-push liquidity effects of sterilization and Open Market Operations.',
    ],
    predictions2026: [
      'CBDC (e-Rupee) programmable offline features, tokenization, and RBI Unified Lending Interface (ULI) vs UPI architecture.',
      'Inclusion of Indian Government Bonds (FAR) in global bond indices — impact on Capital Account, rupee yield curve, and forex sterilization.',
      ' T+0 settlement cycle, Alternative Investment Funds (AIFs), InvITs/REITs taxation, and sovereign green/thematic bonds.',
      'Carbon border adjustments (CBAM), WTO agricultural subsidies (Peace Clause / Amber Box), and Free Trade Agreement rules of origin.',
    ],
  },
  Geography: {
    overview:
      'Geography combines conceptual physical processes (climatology, oceanography, geomorphology) with high-precision Indian drainage, resource distribution, and contemporary world mapping.',
    recurringConcepts: [
      'Monsoon mechanism, IOD, El Niño/La Niña, Westerly Jet Streams, and tropical cyclone formation conditions',
      'Himalayan vs Peninsular drainage systems, East-flowing vs West-flowing rivers, gorges, and tributaries',
      'Global heat budget, insolation, temperature inversion, cloud types, and ocean salinity/currents',
      'Indian soil types (Black, Laterite, Alluvial, Red), natural vegetation belts, and critical mineral belts',
      'Chokepoints, straits, seas, border countries, and conflict/resource zones in world geography',
    ],
    traps: [
      'Swapping river bank directions (left-bank vs right-bank tributaries) or source hills in the Eastern/Western Ghats.',
      'Confusing tropical vs temperate cyclone characteristics (frontal origin, eye formation, landfall dissipation).',
      'Misidentifying critical mineral reserves vs top producer states in India (Lithium, Cobalt, Rare Earths, Monazite, Bauxite).',
      'Reversing insolation/moisture relationships (e.g., relative humidity vs temperature changes, equatorial vs subtropical salinity).',
    ],
    predictions2026: [
      'Critical & Strategic Minerals (30 listed minerals, offshore polymetallic nodules, Lithium/REE belts in J&K, Rajasthan, Karnataka).',
      'Red Sea–Bab-el-Mandeb–Hormuz–Eastern Mediterranean maritime corridors and Arctic Northern Sea Route.',
      'Glacial Lake Outburst Floods (GLOFs), Teesta/Chenab/Subansiri basin hydro-geography, and Western Disturbances anomalies.',
      'Atmospheric rivers, sudden stratospheric warming, heat domes, and Deep Ocean Mission hydrothermal vents.',
    ],
  },
  Environment: {
    overview:
      'Environment & Ecology ( boosted by IFoS Prelims integration) accounts for 14–18 questions annually, heavily testing Indian species behaviour/distribution, WPA 1972 schedules, protected area hydro-geography, and climate/pollution treaties.',
    recurringConcepts: [
      'IUCN status, habitat specificity, and behavioural traits of Indian flagship and endemic species',
      'National Parks, Tiger Reserves, Ramsar Wetlands, and Biosphere Reserves paired with rivers and vegetation',
      'Wildlife (Protection) Act 1972 (2022 rationalised schedules), EPA 1986, Forest Rights Act 2006, and Biodiversity Act',
      'Global conventions & funds: UNFCCC, CBD (Kunming-Montreal GBF), Ramsar, CITES, CMS, Stockholm/Minamata/Basel',
      'Biogeochemical cycles (Nitrogen, Carbon, Phosphorus), trophic dynamics, and emerging pollutants (PFAS, microplastics, fly ash)',
    ],
    traps: [
      'Extreme words like "found ONLY in India" or "naturally found in no other state" — verify endemic range carefully.',
      'Confusing statutory parent acts of bodies (e.g., NBWL & NTCA under WPA 1972 vs Animal Welfare Board under PCA 1960 vs NGT).',
      'Mixing up UNFCCC mechanisms/funds (GEF, GCF, Adaptation Fund, Loss & Damage Fund) and whether India is a party/signatory.',
      'Swapping Nitrogen-fixing organisms, mycorrhizal associations, or primary vs secondary air pollutants.',
    ],
    predictions2026: [
      'Carbon Credit Trading Scheme (CCTS) under Energy Conservation Amendment Act, Green Credit Rules, and Article 6 carbon markets.',
      'WPA 1972 (2022 Amendment) 4-schedule structure (Schedules I, II, III-Plants, IV-CITES) and captive elephant transfer rules.',
      'Newly notified Ramsar sites, 58th Tiger Reserve (Madhav TR), ECo-Sensitive Zones (ESZ) Supreme Court rulings, and grassland birds.',
      'Methane abatement (Global Methane Pledge, coal-bed/rice-paddy emissions), blue carbon ecosystems (MISHTI), and e-waste EPR rules.',
    ],
  },
  'Science & Technology': {
    overview:
      'Science & Technology has grown to 12–15 questions per year, focusing on applied biotechnology, immune/disease biology, space orbits & propulsion, telecom standards, and emerging materials/AI.',
    recurringConcepts: [
      'Genetic engineering: CRISPR-Cas9, RNAi, mRNA vaccines, mitochondrial replacement, CAR-T cell therapy, stem cells',
      'Space technology: LEO/MEO/GEO/GTO/SSO/Lagrange orbits, PSLV vs GSLV/LVM3 cryogenic stages, ISRO & global missions',
      'Communication & computing: 5G/6G spectrum, Li-Fi, NFC, RFID, Blockchain, Quantum Key Distribution, Web 3.0, AI/LLMs',
      'Disease biology: Viral vs bacterial vs protozoan pathogens, antimicrobial resistance, Wolbachia, T-cell/B-cell immunity',
      'Energy & materials: Fuel cells (Hydrogen/SOFC), Lithium-ion vs Sodium-ion batteries, small modular reactors, metamaterials',
    ],
    traps: [
      'In "can it be used for X, Y, Z?" application questions on emerging tech, narrow exclusions are usually false — broad multi-domain applicability is the norm unless physically impossible.',
      'Confusing DNA vs RNA viral genomes, or bacterial vs viral targets for antibiotics and vaccines.',
      'Mixing up fission vs fusion fuels (Thorium-232 fertile vs Uranium-233 fissile in India’s 3-stage nuclear programme).',
      'Confusing geostationary (equatorial plane, 35,786 km) vs geosynchronous / sun-synchronous polar orbits.',
    ],
    predictions2026: [
      'Gene therapy & sickle-cell editing (Casgevy / indigenous CAR-T), mRNA therapeutics beyond COVID, and One Health AMR surveillance.',
      'Gaganyaan human-rating, Bharatiya Antariksh Station, Aditya-L1 / LUPEX / NISAR radar bands, and semi-cryogenic engines.',
      'Quantum computing (National Quantum Mission qubits, QKD), Small Language Models / Neuromorphic chips, and Deepfakes provenance.',
      'Green Hydrogen electrolyzers (PEM vs Alkaline), Sodium-ion/Solid-state batteries, and Thorium-based Advanced Heavy Water Reactors.',
    ],
  },
  'Modern History': {
    overview:
      'Modern History tests chronological clarity, constitutional acts (1773–1935), socio-religious reform literature/institutions, peasant/tribal uprisings, and the exact ideological strands within the freedom struggle.',
    recurringConcepts: [
      'Charter Acts (1793, 1813, 1833, 1853) and Government of India Acts (1858, 1909, 1919, 1935)',
      'Gandhian mass movements (Non-Cooperation, Civil Disobedience, Quit India) — participants, parallel governments, and pacts',
      'Socio-religious reformers, newspapers/journals, and educational commissions (Wood’s Despatch, Hunter, Sadler, Macaulay)',
      'Peasant, tribal, and working-class movements (Santhal, Munda/Ulgulan, Indigo, Pabna, Deccan Riots, Tebhaga, Factory Acts)',
      'Economic critique of colonialism (Dadabhai Naoroji, R.C. Dutt), land revenue systems (Permanent, Ryotwari, Mahalwari)',
    ],
    traps: [
      'Swapping provisions between GOI Act 1919 (Dyarchy in Provinces) and GOI Act 1935 (Provincial Autonomy + Dyarchy at Centre, residuary powers with Governor-General).',
      'Associating a newspaper, book, or sabha with the wrong contemporary reformer (e.g., Bengal vs Maharashtra reformers).',
      'Chronological traps mixing events of 1905–1909 (Swadeshi, Surat Split, Morley-Minto) or 1940–1946 (August Offer, Cripps, Wavell, Cabinet Mission).',
    ],
    predictions2026: [
      'Centenary/milestone clusters: 1924–1926 events (Belgaum Congress, Vaikom Satyagraha, Kanpur Bolshevik Conspiracy, Swaraj Party).',
      'Constitutional & judicial milestones under Company/Crown rule (Lex Loci Act, Ilbert Bill, Whitley Commission, Lee Commission).',
      'Lesser-known women freedom fighters, revolutionary networks abroad (Ghadar, Berlin Committee, INA trials), and tribal forest satyagrahas.',
    ],
  },
  'Art & Culture': {
    overview:
      'Art & Culture is tightly integrated with Ancient & Medieval India, heavily testing Buddhist/Jaina philosophy and literature, rock-cut & temple architecture, classical arts, and UNESCO/GI cultural heritage.',
    recurringConcepts: [
      'Buddhist & Jaina sects (Theravada, Mahayana, Vajrayana; Svetambara, Digambara), councils, canonical texts, and bodhisattvas',
      'Rock-cut caves (Ajanta, Ellora, Elephanta, Barabar, Nasik, Udayagiri-Khandagiri) and stupa/vihara architecture',
      'Temple architecture styles (Nagara sub-schools, Dravida Chola/Pallava/Vijayanagara, Vesara Hoysala/Chalukya) and sculptures',
      'Six orthodox (Astika) philosophical schools (Samkhya, Yoga, Nyaya, Vaisheshika, Mimamsa, Vedanta) and Bhakti/Sufi saints',
      'Classical & folk dances, musical traditions (Hindustani vs Carnatic), miniature paintings, and ancient Sanskrit/Pali/Prakrit plays',
    ],
    traps: [
      'Swapping Jain and Buddhist texts/concepts (e.g., Sthanakvasi, Paramitas, Sautrantika, Sammatiya,Nayaputta).',
      'Attributing a rock-cut monument or temple to the wrong dynasty or century (e.g., Kailashanatha Ellora vs Mahabalipuram vs Tanjore).',
      'Confusing contemporaneous Bhakti/Sufi saints with Mughal emperors or regional rulers.',
    ],
    predictions2026: [
      'Newly inscribed UNESCO World Heritage Sites (Moidams of Assam, Hoysala ensembles) and Classical Language status criteria (Marathi, Pali, Prakrit, Assamese, Bengali).',
      'Buddhist & Jaina epigraphy, sangha monastic rules (Vinaya Pitaka), and philosophical debates (Madhyamaka vs Yogachara, Syadvada).',
      'Chola/Pallava/Chalukya port towns, temple guild inscriptions, and bronze/stone sculptural iconography.',
    ],
  },
  'Ancient History': {
    overview:
      'Ancient History rewards precision on Harappan sites, Vedic/post-Vedic terminology, Mauryan Ashokan edicts, Sangam polity/trade, and Gupta administrative/land-grant terms.',
    recurringConcepts: [
      'Indus Valley Civilisation: site-specific archaeological finds (Dholavira water harnessing, Lothal dockyard, Kalibangan, Rakhigarhi)',
      'Ashokan Major & Minor Rock Edicts, pillar inscriptions, Dhamma officers (Rajukas, Dhamma Mahamattas), and Mauryan economy',
      'Sangam literature (Tolkappiyam, Silappadikaram, Manimekalai, Ettuthokai), tinai eco-zones, and Indo-Roman ports (Muziris, Korkai, Arikamedu)',
      'Administrative, revenue, and guild terms (Vishti, Bhaga, Shreni, Eripatti, Ghatika, Agrahara) across Maurya–Gupta–Harsha eras',
    ],
    traps: [
      'Assuming Harappans used iron, horse-drawn chariots, or monumental stone temples.',
      'Confusing administrative/judicial terms across dynasties (e.g., Mauryan vs Gupta vs Chola village assemblies and land classifications).',
      'Misplacing ancient ports between the Malabar (West) and Coromandel (East) coasts.',
    ],
    predictions2026: [
      'Harappan DNA/archaeobotanical findings (Rakhigarhi, Vadnagar, Karanpura) and Chalcolithic/Megalithic cultures.',
      'Ashokan edicts site-to-state mapping (Sannati/Kanganahalli, Dhauli, Jaugada, Girnar, Erragudi) and Prakrit/Brahmi palaeography.',
      'Sangam & Post-Mauryan maritime trade (Periplus of the Erythraean Sea ports, Roman coinage hoards, Satavahana/Kushana guilds).',
    ],
  },
  'Medieval History': {
    overview:
      'Medieval History focuses on administrative/agrarian vocabulary (Iqta, Jagir, Mansab, Amaram), Vijayanagara–Bahmani travellers and architecture, Chola local self-government, and Delhi Sultanate/Mughal reforms.',
    recurringConcepts: [
      'Vijayanagara Empire: Krishnadevaraya’s reign, Amara-nayaka system, Mahanavami Dibba, waterworks, and foreign travellers (Abdur Razzaq, Domingo Paes, Nuniz, Nicolo Conti)',
      'Delhi Sultanate administrative departments (Diwan-i-Arz, Diwan-i-Kohi, Diwan-i-Bandagan, Diwan-i-Khairat) and market/land reforms of Alauddin Khalji & Muhammad bin Tughlaq',
      'Mughal Mansabdari (Zat & Sawar), Zabti/Dahsala revenue system, jagirdari crisis, and provincial officers (Faujdar, Amil, Kotwal, Mir Bakshi)',
      'Early Medieval tripartite struggle (Palas, Pratiharas, Rashtrakutas), Chola Uttaramerur sabha committees, and Kakatiya/Hoysala ports',
    ],
    traps: [
      'Treating Iqta or Jagir as hereditary private property by default rather than transferable revenue assignments.',
      'Swapping Delhi Sultanate departments between Balban, Alauddin Khalji, Muhammad bin Tughlaq, and Firoz Shah Tughlaq.',
      'Mismatching foreign travellers with the Vijayanagara or Mughal ruler whose court they visited.',
    ],
    predictions2026: [
      'Ahom kingdom administration (Paik system, Buranjis, Moidams), Deccan Sultanates, and Maratha Ashtapradhan / Chauth-Sardeshmukhi.',
      'Medieval agrarian & hydraulic terms (Araghatta/Persian wheel, Karez, Karkhanas, Hundi, Sarais) and Indo-Islamic coins.',
      'Regional dynasties (Kakatiyas of Warangal/Motupalli, Hoysalas, Gajapatis of Odisha, Karkota/Utpala of Kashmir).',
    ],
  },
  Agriculture: {
    overview:
      'Agriculture bridges Geography, Economy, and Ecology (4–8 questions/year), testing crop climatic requirements, sustainable farming practices, soil chemistry, and MSP/procurement policy.',
    recurringConcepts: [
      'Climatic & soil requirements of Kharif, Rabi, and Zaid crops (Millets/Shree Anna, Pulses, Oilseeds, Cotton, Sugarcane, Rice, Tea)',
      'Sustainable practices: Zero-tillage, Conservation Agriculture, System of Rice Intensification (SRI), Direct Seeded Rice (DSR), Fertigation, Mulching',
      'Nitrogen Use Efficiency, Nano-Urea/DAP, Neem-coated urea, bio-fertilizers (Rhizobium, Azolla, Azotobacter, Mycorrhiza), and green manuring',
      'MSP calculation (A2+FL vs C2), CACP recommendations vs CCEA approval, e-NAM, FPOs, and edible oil/pulse import dependence',
    ],
    traps: [
      'Assuming CACP approves MSP (CACP only recommends; Cabinet Committee on Economic Affairs approves) or that MSP is legally mandatory for private traders.',
      'Confusing Kharif vs Rabi classification of pulses/oilseeds (e.g., Tur/Arhar vs Gram/Chana, Groundnut vs Mustard).',
      'Overstating that SRI or DSR eliminates methane or water need completely rather than reducing it substantially.',
    ],
    predictions2026: [
      'Oilseeds & Pulses self-reliance missions (Yellow Revolution 2.0, Mustard/Palm oil agro-climatic zones, Tur/Masoor buffer procurement).',
      'Climate-resilient crop varieties, genome-edited crops (SDN-1/SDN-2 exemption rules), and digital crop survey (AgriStack).',
      'Soil organic carbon sequestration, biochar, precision micro-irrigation, and millet value-chain processing.',
    ],
  },
};

function classifyQuestionPattern(stem = '', options = []) {
  const s = String(stem || '');
  const optText = Array.isArray(options) ? options.map((o) => o?.text || '').join(' ') : '';
  const combined = `${s} ${optText}`;

  if (/Statement[\s-]*I\b[\s\S]*Statement[\s-]*II\b/i.test(s) || /Statement-I and Statement-II/i.test(combined)) {
    return 'statementI_II';
  }
  if (/How many of the (above|following) pairs/i.test(combined) || /correctly matched/i.test(s) || /\bpairs\b[\s\S]*(correct|matched)/i.test(combined)) {
    return 'pairMatching';
  }
  if (/How many of the (above|following)/i.test(combined) || /Only one|Only two|Only three|All four|All five/i.test(optText)) {
    return 'howManyOnly';
  }
  if (/\b1\.\s|\bI\.\s|Consider the following statements/i.test(s) || /1 and 2 only|1, 2 and 3/i.test(optText)) {
    return 'multiStatement';
  }
  return 'singleMcq';
}

function getThemeForTopic(subject, topic) {
  const groups = TOPIC_GROUPS[subject] || [];
  for (const [themeName, topics] of groups) {
    if (topics.includes(topic)) return themeName;
  }

  const t = String(topic || '').toLowerCase();
  if (subject === 'Indian Polity') {
    if (/body|bodies|commission|cag|auditor|tribunal/i.test(t) && !/judicial|court/i.test(t)) {
      return 'Constitutional & Statutory Bodies';
    }
    if (/judic|court|tribunal|writ/i.test(t)) return 'The Judiciary';
    if (/execut|president|governor|minister|cabinet|attorney|emergency/i.test(t)) return 'The Executive';
    if (/parliam|legislat|speaker|bill|budget|committee|rajya|lok sabha/i.test(t)) return 'The Legislature';
    if (/federal|centre-state|inter-state|local|panchayat|municipal|schedule|tribal/i.test(t)) {
      return 'Federalism & Local Govt';
    }
    if (/elect|party|parties|representation|anti-defection|delimitation/i.test(t)) {
      return 'Elections & Representation';
    }
    if (/international|symbol|award|misc|country/i.test(t)) return 'Other & Applied';
    return 'Foundations';
  }

  if (subject === 'Economy') {
    if (/bank|rbi|monetary|money|capital market|sebi|bond|share|nbfc|financial/i.test(t)) return 'Money & Finance';
    if (/fiscal|budget|tax|gst|bop|balance of payment|trade|export|import|fdi|forex|external|wto|imf/i.test(t)) {
      return 'Government & Trade';
    }
    if (/industry|infra|scheme|social|labour|msme|service/i.test(t)) return 'Sectors & Schemes';
    return 'Macro Foundations';
  }

  if (subject === 'Geography') {
    if (/world|place|region|country|strait|sea|border|global/i.test(t)) return 'World';
    if (/agri|crop|mineral|resource|industry|transport|trade|population|human|settlement/i.test(t)) {
      return 'Human & Economic';
    }
    return 'Physical';
  }

  if (subject === 'Environment') {
    if (/law|act|policy|institution|convention|treaty|protocol|unfccc|cbd|cites|ramsar|fund/i.test(t)) {
      return 'Laws & Institutions';
    }
    if (/pollut|climate|emission|waste|ozone|greenhouse|carbon|air|water/i.test(t)) {
      return 'Pollution & Climate Change';
    }
    return 'Ecology & Biodiversity';
  }

  if (subject === 'Science & Technology') {
    if (/space|nuclear|energy|defence|missile|it|comput|telecom|ai|quantum|robot|cyber|nano/i.test(t)) {
      return 'Tech & Energy';
    }
    if (/biotech|gene|dna|rna|health|disease|vaccine|medical|virus|bacteria/i.test(t)) {
      return 'Applied Science';
    }
    return 'Core Sciences';
  }

  if (subject === 'Modern History') {
    if (/act|constitutional|admin|governor|press|education|personality|committee|commission/i.test(t)) {
      return 'Governance & People';
    }
    if (/reform|national|congress|gandhi|swadeshi|quit india|non-cooperation|civil disobedience|revolutionary/i.test(t)) {
      return 'Reform & Nationalism';
    }
    return 'Foundations';
  }

  if (subject === 'Ancient History') {
    if (/indus|harappa|vedic|prehistor|chalcolithic/i.test(t)) return 'Prehistory & Early Civilisations';
    if (/maurya|gupta|buddh|jain|sangam|mahajanapada|post-maurya/i.test(t)) return 'Heterodox Sects & Empires';
    return 'General & Survey';
  }

  if (subject === 'Medieval History') {
    if (/mughal/i.test(t)) return 'The Mughal Era';
    if (/vijayanagara|bahmani|maratha|deccan|regional/i.test(t)) return 'Deccan & Regional States';
    if (/sultanate|chola|early medieval|rajput|tripartite/i.test(t)) return 'Early Medieval & Sultanate';
    return 'General & Survey';
  }

  if (subject === 'Art & Culture') {
    if (/architect|temple|cave|stupa|sculpt|paint|handicraft/i.test(t)) return 'Visual Arts';
    if (/philosoph|religio|buddh|jain|bhakti|sufi|literat|language|text/i.test(t)) return 'Philosophy & Literature';
    return 'Performing & Living Culture';
  }

  if (subject === 'Agriculture') {
    if (/msp|price|policy|econ|credit|scheme|market|trade|export|subsid/i.test(t)) {
      return 'Agricultural Economics & Policy';
    }
    return 'Agronomy & Practices';
  }

  return groups[0]?.[0] || 'General';
}

function isBoilerplateOptionPhrase(str) {
  const s = String(str || '').trim();
  if (s.length < 5 || s.length > 60) return true;
  if (/^(Only|Both|Neither|None|All|Statement|Pair|Option|Code)\b/i.test(s)) return true;
  if (/^([12345]|I|II|III|IV|V)(\s*(,|and|or|only)\s*([12345]|I|II|III|IV|V)*)+$/i.test(s)) return true;
  if (/\b(I|II|III|IV)\b.*\b(only|and)\b/i.test(s)) return true;
  if (/statement|correctly matched|above|following|not correct/i.test(s)) return true;
  return false;
}

function extractAnchorConceptsFromQuestions(questions, maxCount = 6) {
  const phraseCounts = new Map();
  for (const q of questions) {
    const stem = String(q.stem || '');
    const quoted = stem.match(/['“"]([^'”"]{4,48})['”"]/g) || [];
    for (const raw of quoted) {
      const clean = raw.replace(/^['“"]+|['”"]+$/g, '').trim();
      if (clean.split(/\s+/).length <= 6 && !isBoilerplateOptionPhrase(clean)) {
        phraseCounts.set(clean, (phraseCounts.get(clean) || 0) + 3);
      }
    }

    if (Array.isArray(q.options) && q.correctLabel) {
      const corr = q.options.find(
        (o) => (o.label || '').toLowerCase() === String(q.correctLabel).toLowerCase()
      );
      if (corr?.text) {
        const t = corr.text.trim().replace(/\.$/, '');
        if (!isBoilerplateOptionPhrase(t)) {
          phraseCounts.set(t, (phraseCounts.get(t) || 0) + 2);
        }
      }
    }
  }

  return [...phraseCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCount)
    .map(([phrase]) => phrase);
}

function loadAllCseQuestions() {
  const pyqDir = path.resolve(process.cwd(), 'pyq_data');
  const files = fs
    .readdirSync(pyqDir)
    .filter((f) => f.endsWith('.jsonl') && !f.includes('cds') && !f.includes('2026'));

  const byId = new Map();
  for (const file of files) {
    const content = fs.readFileSync(path.join(pyqDir, file), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const q = JSON.parse(trimmed);
        const exam = String(q.examName || q.exam || 'UPSC CSE Pre');
        if (exam.toUpperCase().includes('CDS')) continue;
        const year = Number(q.examYear || q.year);
        if (!Number.isInteger(year) || year < 2011 || year > 2025) continue;
        const subject = q.srcSubject || q.subject;
        if (!subject || !SUBJECT_ORDER.includes(subject)) continue;

        const key = q.id || `${subject}-${year}-${String(q.stem || '').slice(0, 50)}`;
        if (!byId.has(key) || (q.explanation && !byId.get(key).explanation)) {
          byId.set(key, {
            id: q.id || key,
            year,
            subject,
            topic: q.srcTopic || q.topic || 'Miscellaneous',
            stem: q.stem || '',
            options: Array.isArray(q.options) ? q.options : [],
            correctLabel: q.correctLabel || '',
          });
        }
      } catch {
        // ignore malformed line
      }
    }
  }
  return [...byId.values()];
}

function computePatternBreakdown(questions) {
  const counts = {
    singleMcq: 0,
    multiStatement: 0,
    howManyOnly: 0,
    statementI_II: 0,
    pairMatching: 0,
  };
  const recentCounts = {
    singleMcq: 0,
    multiStatement: 0,
    howManyOnly: 0,
    statementI_II: 0,
    pairMatching: 0,
  };
  let recentTotal = 0;

  for (const q of questions) {
    const p = classifyQuestionPattern(q.stem, q.options);
    counts[p] = (counts[p] || 0) + 1;
    if (q.year >= 2022) {
      recentCounts[p] = (recentCounts[p] || 0) + 1;
      recentTotal++;
    }
  }

  const total = Math.max(1, questions.length);
  const rTotal = Math.max(1, recentTotal);

  return {
    counts,
    percentages: {
      singleMcq: Math.round((counts.singleMcq / total) * 100),
      multiStatement: Math.round((counts.multiStatement / total) * 100),
      howManyOnly: Math.round((counts.howManyOnly / total) * 100),
      statementI_II: Math.round((counts.statementI_II / total) * 100),
      pairMatching: Math.round((counts.pairMatching / total) * 100),
    },
    recent2022_2025: {
      total: recentTotal,
      counts: recentCounts,
      newPatternSharePct: Math.round(
        (((recentCounts.howManyOnly || 0) +
          (recentCounts.statementI_II || 0) +
          (recentCounts.pairMatching || 0)) /
          rTotal) *
          100
      ),
    },
  };
}

function buildSubjectAnalysis(subject, subjectQuestions) {
  const totalQuestions = subjectQuestions.length;
  const yearCounts = {};
  for (const y of YEARS) yearCounts[y] = 0;
  for (const q of subjectQuestions) {
    yearCounts[q.year] = (yearCounts[q.year] || 0) + 1;
  }

  const avgPerYear = Number((totalQuestions / YEARS.length).toFixed(1));
  const early10Sum = YEARS.slice(0, 10).reduce((acc, y) => acc + (yearCounts[y] || 0), 0);
  const recent5Sum = YEARS.slice(10).reduce((acc, y) => acc + (yearCounts[y] || 0), 0);
  const early10Avg = Number((early10Sum / 10).toFixed(1));
  const recent5Avg = Number((recent5Sum / 5).toFixed(1));

  let trendDirection = 'Stable Core';
  if (recent5Avg >= early10Avg * 1.15) trendDirection = 'Rising Weightage';
  else if (recent5Avg <= early10Avg * 0.85) trendDirection = 'Consolidating / Selective';

  const peakYearEntry = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];
  const patternBreakdown = computePatternBreakdown(subjectQuestions);

  // Build Theme-level analyses using canonical TOPIC_GROUPS[subject]
  const definedGroups = TOPIC_GROUPS[subject] || [];
  const themeBuckets = new Map();
  for (const [themeName, topics] of definedGroups) {
    themeBuckets.set(themeName, {
      themeName,
      definedTopics: topics,
      questions: [],
    });
  }

  for (const q of subjectQuestions) {
    const tName = getThemeForTopic(subject, q.topic);
    if (!themeBuckets.has(tName)) {
      themeBuckets.set(tName, {
        themeName: tName,
        definedTopics: [q.topic],
        questions: [],
      });
    }
    themeBuckets.get(tName).questions.push(q);
  }

  // Sort themes by total weightage to assign ROI Tiers, then keep syllabus order
  const rawThemes = [...themeBuckets.values()].map((bucket) => {
    const qList = bucket.questions;
    const tTotal = qList.length;
    const sharePct = totalQuestions > 0 ? Number(((tTotal / totalQuestions) * 100).toFixed(1)) : 0;

    const tYearCounts = {};
    for (const y of YEARS) tYearCounts[y] = 0;
    for (const q of qList) tYearCounts[q.year] = (tYearCounts[q.year] || 0) + 1;

    const tRecent5 = YEARS.slice(10).reduce((acc, y) => acc + (tYearCounts[y] || 0), 0);
    const tRecentSharePct = recent5Sum > 0 ? Number(((tRecent5 / recent5Sum) * 100).toFixed(1)) : 0;
    const yearsActive = YEARS.filter((y) => tYearCounts[y] > 0).length;
    const lastAskedYear = [...YEARS].reverse().find((y) => tYearCounts[y] > 0) || null;

    // Sub-topic frequency matrix
    const allTopicsInTheme = Array.from(
      new Set([...bucket.definedTopics, ...qList.map((q) => q.topic)])
    );
    const subTopics = allTopicsInTheme
      .map((topicName) => {
        const tQs = qList.filter((q) => q.topic === topicName);
        const p1 = tQs.filter((q) => q.year >= 2011 && q.year <= 2015).length;
        const p2 = tQs.filter((q) => q.year >= 2016 && q.year <= 2020).length;
        const p3 = tQs.filter((q) => q.year >= 2021 && q.year <= 2025).length;
        const lastYr = tQs.length > 0 ? Math.max(...tQs.map((q) => q.year)) : null;

        let priority = 'Tier 3 · Selective';
        if (tQs.length >= Math.max(8, totalQuestions * 0.06) || p3 >= 4) {
          priority = 'Tier 1 · Must-Master';
        } else if (tQs.length >= 4 || p3 >= 2) {
          priority = 'Tier 2 · High-Yield';
        }

        const anchors = extractAnchorConceptsFromQuestions(tQs, 4);

        return {
          topic: topicName,
          total: tQs.length,
          shareOfSubjectPct:
            totalQuestions > 0 ? Number(((tQs.length / totalQuestions) * 100).toFixed(1)) : 0,
          split5Yr: {
            y2011_2015: p1,
            y2016_2020: p2,
            y2021_2025: p3,
          },
          lastAskedYear: lastYr,
          priority,
          testedAnchors: anchors,
        };
      })
      .filter((st) => st.total > 0)
      .sort((a, b) => b.total - a.total);

    const themePatterns = computePatternBreakdown(qList);
    const extractedAnchors = extractAnchorConceptsFromQuestions(qList, 6);

    // Due-cycle & high-momentum sub-topics for 2026 predictions
    const highMomentumTopics = subTopics.filter((st) => st.split5Yr.y2021_2025 >= 2).slice(0, 2);
    const dueCycleTopics = subTopics
      .filter((st) => st.total >= 3 && st.lastAskedYear && st.lastAskedYear <= 2023)
      .slice(0, 2);

    const focus2026 = [];
    if (highMomentumTopics.length > 0) {
      focus2026.push(
        `High-momentum anchor: ${highMomentumTopics.map((t) => `${t.topic} (${t.split5Yr.y2021_2025} Qs in 2021–25)`).join(' & ')} — expect Statement-I/II or 'How many' framing.`
      );
    }
    if (dueCycleTopics.length > 0) {
      focus2026.push(
        `Due-cycle watch: ${dueCycleTopics.map((t) => `${t.topic} (last tested ${t.lastAskedYear}, ${t.total} total Qs)`).join(' & ')} — high probability of return in 2026.`
      );
    }
    if (extractedAnchors.length > 0) {
      focus2026.push(
        `Core tested terms to revise: ${extractedAnchors.slice(0, 4).join(', ')}.`
      );
    }

    return {
      themeName: bucket.themeName,
      totalQuestions: tTotal,
      shareOfSubjectPct: sharePct,
      recent5YrQuestions: tRecent5,
      recent5YrSharePct: tRecentSharePct,
      yearsActiveOutOf15: yearsActive,
      lastAskedYear,
      yearCounts: tYearCounts,
      patternBreakdown: themePatterns,
      subTopics,
      testedAnchors: extractedAnchors,
      focus2026,
    };
  });

  // Assign ROI Tier across themes
  const sortedByCount = [...rawThemes].sort((a, b) => b.totalQuestions - a.totalQuestions);
  const tierMap = new Map();
  sortedByCount.forEach((t, idx) => {
    if (idx === 0 || t.shareOfSubjectPct >= 22) {
      tierMap.set(t.themeName, 'Tier 1 · Core Pillar');
    } else if (idx <= 2 || t.shareOfSubjectPct >= 12) {
      tierMap.set(t.themeName, 'Tier 2 · High-ROI');
    } else {
      tierMap.set(t.themeName, 'Tier 3 · Tactical');
    }
  });

  const themes = rawThemes.map((t) => ({
    ...t,
    roiTier: tierMap.get(t.themeName) || 'Tier 2 · High-ROI',
  }));

  const strategy = SUBJECT_STRATEGY[subject] || {
    overview: `${subject} UPSC CSE Prelims 15-year analysis (2011–2025).`,
    recurringConcepts: [],
    traps: [],
    predictions2026: [],
  };

  return {
    subject,
    yearSpan: '2011–2025',
    totalQuestions,
    avgPerYear,
    early10YrAvg: early10Avg,
    recent5YrAvg: recent5Avg,
    trendDirection,
    peakYear: peakYearEntry ? { year: Number(peakYearEntry[0]), count: peakYearEntry[1] } : null,
    yearCounts,
    patternBreakdown,
    overview: strategy.overview,
    recurringConcepts: strategy.recurringConcepts,
    traps: strategy.traps,
    predictions2026: strategy.predictions2026,
    themeRoiRanking: [...themes]
      .sort((a, b) => b.totalQuestions - a.totalQuestions)
      .map((t, rank) => ({
        rank: rank + 1,
        themeName: t.themeName,
        roiTier: t.roiTier,
        totalQuestions: t.totalQuestions,
        shareOfSubjectPct: t.shareOfSubjectPct,
        recent5YrQuestions: t.recent5YrQuestions,
        recent5YrSharePct: t.recent5YrSharePct,
        yearsActiveOutOf15: t.yearsActiveOutOf15,
        topSubTopic: t.subTopics[0]?.topic || null,
      })),
    themes,
  };
}

function renderSubjectMarkdown(data) {
  const lines = [];
  lines.push(`# ${data.subject} — 15-Year UPSC CSE Prelims PYQ Analysis (2011–2025)`);
  lines.push('');
  lines.push(`> **Overview:** ${data.overview}`);
  lines.push('');
  lines.push(`## Part 1: Whole-Subject Analysis (${data.subject})`);
  lines.push('');
  lines.push('### 1.1 Executive Weightage & Trajectory');
  lines.push(`- **Total Questions (2011–2025):** ${data.totalQuestions}`);
  lines.push(`- **15-Year Average:** ${data.avgPerYear} Qs / year`);
  lines.push(`- **2011–2020 Average vs 2021–2025 Average:** ${data.early10YrAvg} → **${data.recent5YrAvg} Qs / year** (${data.trendDirection})`);
  if (data.peakYear) {
    lines.push(`- **Peak Year:** ${data.peakYear.year} (${data.peakYear.count} Qs)`);
  }
  lines.push(`- **2022–2025 New-Pattern Share ('How many' / Statement I-II / Pairs):** ${data.patternBreakdown.recent2022_2025.newPatternSharePct}%`);
  lines.push('');

  lines.push('### 1.2 Year-Wise Question Distribution (2011–2025)');
  lines.push('');
  lines.push(`| ${YEARS.join(' | ')} | Total |`);
  lines.push(`| ${YEARS.map(() => ':---:').join(' | ')} | :---: |`);
  lines.push(`| ${YEARS.map((y) => data.yearCounts[y] || 0).join(' | ')} | **${data.totalQuestions}** |`);
  lines.push('');

  lines.push('### 1.3 Question Pattern Breakdown');
  lines.push('');
  lines.push('| Pattern Type | 2011–2025 Count | Share (%) | 2022–2025 Count |');
  lines.push('| :--- | :---: | :---: | :---: |');
  lines.push(`| Multi-Statement (1, 2, 3...) | ${data.patternBreakdown.counts.multiStatement} | ${data.patternBreakdown.percentages.multiStatement}% | ${data.patternBreakdown.recent2022_2025.counts.multiStatement} |`);
  lines.push(`| Direct Single-Choice MCQ | ${data.patternBreakdown.counts.singleMcq} | ${data.patternBreakdown.percentages.singleMcq}% | ${data.patternBreakdown.recent2022_2025.counts.singleMcq} |`);
  lines.push(`| "How many of the above" | ${data.patternBreakdown.counts.howManyOnly} | ${data.patternBreakdown.percentages.howManyOnly}% | ${data.patternBreakdown.recent2022_2025.counts.howManyOnly} |`);
  lines.push(`| Pair-Matching | ${data.patternBreakdown.counts.pairMatching} | ${data.patternBreakdown.percentages.pairMatching}% | ${data.patternBreakdown.recent2022_2025.counts.pairMatching} |`);
  lines.push(`| Statement-I & Statement-II | ${data.patternBreakdown.counts.statementI_II} | ${data.patternBreakdown.percentages.statementI_II}% | ${data.patternBreakdown.recent2022_2025.counts.statementI_II} |`);
  lines.push('');

  lines.push('### 1.4 Theme ROI Priority Ranking');
  lines.push('');
  lines.push('| Rank | Theme | ROI Tier | Total Qs (15Y) | Subject Share | Recent 5Y Qs (2021–25) | Active Years | Top Sub-Topic |');
  lines.push('| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |');
  for (const r of data.themeRoiRanking) {
    lines.push(
      `| ${r.rank} | **${r.themeName}** | ${r.roiTier} | ${r.totalQuestions} | ${r.shareOfSubjectPct}% | ${r.recent5YrQuestions} (${r.recent5YrSharePct}%) | ${r.yearsActiveOutOf15}/15 | ${r.topSubTopic || '—'} |`
    );
  }
  lines.push('');

  lines.push('### 1.5 High-Yield Recurring Concepts (Subject-Wide)');
  for (const c of data.recurringConcepts) {
    lines.push(`- ${c}`);
  }
  lines.push('');

  lines.push('### 1.6 Signature UPSC Traps & Elimination Pitfalls');
  for (const trap of data.traps) {
    lines.push(`- **Trap:** ${trap}`);
  }
  lines.push('');

  lines.push('### 1.7 2026 Prelims Focus Predictions');
  for (const pred of data.predictions2026) {
    lines.push(`- **2026 Watch:** ${pred}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`## Part 2: Theme-by-Theme Analysis (${data.themes.length} Themes)`);
  lines.push('');

  for (const theme of data.themes) {
    lines.push(`### Theme: ${theme.themeName} (${theme.roiTier})`);
    lines.push(
      `- **Weightage:** ${theme.totalQuestions} Qs (${theme.shareOfSubjectPct}% of ${data.subject}) · **2021–2025:** ${theme.recent5YrQuestions} Qs (${theme.recent5YrSharePct}%) · **Consistency:** ${theme.yearsActiveOutOf15}/15 years · **Last Asked:** ${theme.lastAskedYear || '—'}`
    );
    lines.push('');
    lines.push('#### Sub-Topic Frequency Matrix');
    lines.push('');
    lines.push('| Sub-Topic | 2011–15 | 2016–20 | 2021–25 | Total Qs | Share (%) | Last Asked | Priority |');
    lines.push('| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |');
    for (const st of theme.subTopics) {
      lines.push(
        `| **${st.topic}** | ${st.split5Yr.y2011_2015} | ${st.split5Yr.y2016_2020} | ${st.split5Yr.y2021_2025} | **${st.total}** | ${st.shareOfSubjectPct}% | ${st.lastAskedYear || '—'} | ${st.priority} |`
      );
    }
    lines.push('');

    if (theme.testedAnchors.length > 0) {
      lines.push(`- **Tested Concept Anchors:** ${theme.testedAnchors.join(' · ')}`);
    }
    for (const f of theme.focus2026) {
      lines.push(`- **2026 Theme Outlook:** ${f}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  const allQuestions = loadAllCseQuestions();
  const subjectsMap = {};
  const summaryRows = [];

  const outDocsDir = path.resolve(process.cwd(), 'docs/pyq-analysis');
  fs.mkdirSync(outDocsDir, { recursive: true });

  for (const subject of SUBJECT_ORDER) {
    const qs = allQuestions.filter((q) => q.subject === subject);
    const analysis = buildSubjectAnalysis(subject, qs);
    subjectsMap[subject] = analysis;

    const slug = subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const mdPath = path.join(outDocsDir, `${slug}.md`);
    fs.writeFileSync(mdPath, renderSubjectMarkdown(analysis), 'utf8');

    summaryRows.push({
      subject,
      slug,
      totalQuestions: analysis.totalQuestions,
      avgPerYear: analysis.avgPerYear,
      recent5YrAvg: analysis.recent5YrAvg,
      trendDirection: analysis.trendDirection,
      themeCount: analysis.themes.length,
      topTheme: analysis.themeRoiRanking[0]?.themeName || '—',
    });
  }

  // Write master README index in docs/pyq-analysis/README.md
  const indexLines = [
    '# UPSC CSE Prelims 15-Year PYQ Analysis (2011–2025)',
    '',
    `Total unique UPSC CSE Prelims questions analyzed: **${allQuestions.length}** across **${SUBJECT_ORDER.length} Subjects** and **${Object.values(subjectsMap).reduce((a, s) => a + s.themes.length, 0)} Themes**.`,
    '',
    '| Subject | 15Y Total Qs | 15Y Avg/Yr | 2021–25 Avg/Yr | Trajectory | Themes | #1 Core Theme | Report |',
    '| :--- | :---: | :---: | :---: | :--- | :---: | :--- | :--- |',
    ...summaryRows.map(
      (r) =>
        `| **${r.subject}** | ${r.totalQuestions} | ${r.avgPerYear} | **${r.recent5YrAvg}** | ${r.trendDirection} | ${r.themeCount} | ${r.topTheme} | [${r.slug}.md](./${r.slug}.md) |`
    ),
    '',
  ];
  fs.writeFileSync(path.join(outDocsDir, 'README.md'), indexLines.join('\n'), 'utf8');

  // Write structured JSON for UI consumption
  const jsonOutPath = path.resolve(process.cwd(), 'src/lib/pyq/prelims-pyq-analysis.json');
  fs.mkdirSync(path.dirname(jsonOutPath), { recursive: true });
  fs.writeFileSync(
    jsonOutPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        yearSpan: '2011–2025',
        totalQuestions: allQuestions.length,
        years: YEARS,
        subjects: subjectsMap,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(
    `Generated PYQ Analysis for ${SUBJECT_ORDER.length} subjects (${allQuestions.length} questions) -> src/lib/pyq/prelims-pyq-analysis.json & docs/pyq-analysis/*.md`
  );
}

main();
