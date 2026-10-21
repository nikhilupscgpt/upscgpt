import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('--- Exporting Environment Architecture for Claude Bridging ---');

  // 1. Fetch all 43 existing nodes in ENVIRONMENT
  const existingNodes = await prisma.issue.findMany({
    where: { OR: [{ domain: 'ENVIRONMENT' }, { category: 'ENVIRONMENT' }] },
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
    where: { srcSubject: 'Environment' },
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

  // 3. Define the canonical Prelims syllabus sequence for Environment
  const syllabusFlow = [
    {
      syllabusOrder: 1,
      module: 'Ecology & Biodiversity',
      topic: 'Ecology & Ecosystems',
      questionCount: topicMap['Ecology & Ecosystems']?.count || 0,
      coreThemes: ['Ecosystem Structure & Functions (Productivity, Decomposition, Energy Flow - 10% Law, Nutrient Cycling)', 'Ecological Pyramids (Upright vs Inverted - Biomass in aquatic vs terrestrial, Number, Energy always upright)', 'Ecotone & Edge Effect', 'Ecological Niche vs Habitat', 'Biotic Interactions (Mutualism, Commensalism, Amensalism, Parasitism, Predation)', 'Ecological Succession (Primary vs Secondary, Pioneer community, Seral stages, Climax community)', 'Biogeochemical Cycles (Carbon, Nitrogen, Phosphorus, Sulphur, Water cycle)']
    },
    {
      syllabusOrder: 2,
      module: 'Ecology & Biodiversity',
      topic: 'Biodiversity & Conservation',
      questionCount: topicMap['Biodiversity & Conservation']?.count || 0,
      coreThemes: ['Levels of Biodiversity (Genetic, Species, Ecosystem diversity, Alpha, Beta, Gamma diversity)', 'Biodiversity Hotspots (Norman Myers criteria, 4 in India: Himalayas, Indo-Burma, Western Ghats-Sri Lanka, Sundaland)', 'In-situ Conservation (National Parks, Wildlife Sanctuaries, Community Reserves, Conservation Reserves, Biosphere Reserves - Core, Buffer, Transition)', 'Tiger Reserves, Elephant Reserves (Project Tiger 1973, Project Elephant 1992, MIKE sites)', 'Ex-situ Conservation (Botanical Gardens, Zoological Parks, Seed Banks, Cryopreservation)', 'IUCN Red List Categories & Critically Endangered Species of India (Gharial, Great Indian Bustard, Hangul, Bengal Florican, Pygmy Hog, Dugong, Nilgiri Tahr, Gangetic Dolphin)', 'Invasive Alien Species in India (Lantana camara, Prosopis juliflora, Water Hyacinth, Parthenium)', 'Ramsar Convention & Montreux Record (Keoladeo & Loktak in Montreux Record; Chilika removed)']
    },
    {
      syllabusOrder: 3,
      module: 'Pollution & Climate Change',
      topic: 'Environmental Pollution',
      questionCount: topicMap['Environmental Pollution']?.count || 0,
      coreThemes: ['Air Pollutants (PM2.5, PM10, SO2, NO2, CO, Ozone O3, Lead Pb, Ammonia NH3 - National Air Quality Index AQI 8 pollutants)', 'Photochemical Smog (Ozone, PAN, VOCs, NOx, Sunlight) vs Classical/London Smog (SO2, Smoke, Fog)', 'Acid Rain (Sulfuric acid & Nitric acid - pH < 5.6)', 'Fly Ash (Composition: silica, alumina, iron oxides; uses in cement, bricks, soil conditioner)', 'Water Pollution & Indicators (BOD Biochemical Oxygen Demand, COD, Eutrophication, Algal Bloom, Bioaccumulation & Biomagnification)', 'Solid Waste & E-Waste Management Rules (Extended Producer Responsibility EPR, Plastic Waste Management Rules, Single-Use Plastics ban)', 'Bioremediation & Phytoremediation techniques', 'Heavy Metal Poisoning (Minamata / Mercury, Itai-Itai / Cadmium, Arsenicosis / Arsenic, Fluorosis / Fluoride, Blue Baby Syndrome / Nitrates)']
    },
    {
      syllabusOrder: 4,
      module: 'Pollution & Climate Change',
      topic: 'Climate Change',
      questionCount: topicMap['Climate Change']?.count || 0,
      coreThemes: ['Greenhouse Effect & Major GHGs (Water vapor, CO2, Methane CH4, N2O, CFCs/HFCs, SF6 - Global Warming Potential GWP)', 'Ocean Acidification (Carbonic acid formation, impact on calcifying organisms like corals and molluscs)', 'UNFCCC Framework & COPs (Earth Summit 1992, Kyoto Protocol - Annex I/Non-Annex I, Clean Development Mechanism CDM, Paris Agreement 2015 - Article 6 carbon markets, Loss and Damage Fund at COP27/28)', 'India Nationally Determined Contributions (NDCs) & Panchamrit goals (500 GW non-fossil by 2030, Net Zero by 2070)', 'Montreal Protocol & Kigali Amendment (Ozone Depleting Substances ODS phase-out, HFC phase-down)', 'Other Environmental Conventions (Stockholm on POPs, Basel on Hazardous Wastes, Rotterdam on Prior Informed Consent, Minamata on Mercury, UNCCD on Desertification)']
    },
    {
      syllabusOrder: 5,
      module: 'Laws & Institutions',
      topic: 'Environmental Laws, Policies & Institutions',
      questionCount: topicMap['Environmental Laws, Policies & Institutions']?.count || 0,
      coreThemes: ['Wildlife Protection Act 1972 & 2022 Amendment (Reduction of schedules from VI to IV: Schedule I highest protection, Schedule II lesser, Schedule III CITES species, Schedule IV specimen plants; removal of vermin schedule)', 'Environment (Protection) Act 1986 (Enacted after Bhopal Gas Tragedy under Article 253; Central Pollution Control Board CPCB powers, Coastal Regulation Zone CRZ)', 'Biological Diversity Act 2002 (National Biodiversity Authority NBA in Chennai, State Biodiversity Boards SBBs, Biodiversity Management Committees BMCs, Access and Benefit Sharing ABS)', 'Forest (Conservation) Act 1980 & 2023 Amendment (Van Sanrakshan Evam Samvardhan Adhiniyam)', 'Compensatory Afforestation Fund Act (CAMPA) 2016 (90% State, 10% Centre)', 'National Green Tribunal (NGT) Act 2010 (Chairperson, judicial & expert members, 6-month disposal mandate, 7 environmental laws under jurisdiction; WPA and IFA excluded)', 'Statutory Bodies: Animal Welfare Board of India, National Tiger Conservation Authority NTCA, Central Zoo Authority CZA, Wildlife Crime Control Bureau WCCB']
    }
  ];

  const payload = {
    subject: 'Environment',
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

  const localPath = path.resolve('./data/environment_nodes_architecture.json');
  fs.writeFileSync(localPath, JSON.stringify(payload, null, 2));

  const downloadPath = '/Users/nikhilwandhe/Downloads/environment_nodes_architecture.json';
  fs.writeFileSync(downloadPath, JSON.stringify(payload, null, 2));

  console.log(`✅ Saved Environment architecture to:\n   - ${localPath}\n   - ${downloadPath}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
