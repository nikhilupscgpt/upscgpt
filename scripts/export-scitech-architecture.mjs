import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('--- Exporting Science & Technology Architecture for Claude Bridging ---');

  // 1. Fetch all 45 existing nodes in SCIENCE & TECHNOLOGY
  const existingNodes = await prisma.issue.findMany({
    where: { domain: 'SCIENCE & TECHNOLOGY' },
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
    where: { srcSubject: 'Science & Technology' },
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

  // 3. Define the canonical Prelims syllabus sequence for Science & Technology
  const syllabusFlow = [
    {
      syllabusOrder: 1,
      module: 'Core Sciences',
      topic: 'General Science',
      questionCount: topicMap['General Science']?.count || 0,
      coreThemes: ['Everyday Scientific Phenomena', 'SI Units & Physical Quantities', 'Scientific Instruments (Radar, Sonar, Seismograph, Barometer)', 'States of Matter & Phase Transitions', 'Heat Transfer (Conduction, Convection, Radiation)']
    },
    {
      syllabusOrder: 2,
      module: 'Core Sciences',
      topic: 'Physics',
      questionCount: topicMap['Physics']?.count || 0,
      coreThemes: ['Optics & Light (Reflection, Refraction, Total Internal Reflection, Dispersion, Scattering, Rainbow formation)', 'Electromagnetic Spectrum (Gamma > X-ray > UV > Visible > Infrared > Microwave > Radio)', 'Gravitation & Satellite Orbits (Escape velocity, Geostationary vs Polar orbits, Kepler laws)', 'Mechanics & Newton Laws of Motion', 'Sound Waves & Doppler Effect', 'Electricity & Magnetism (Transformers, Superconductivity, LED vs OLED vs CFL, Semiconductors)']
    },
    {
      syllabusOrder: 3,
      module: 'Core Sciences',
      topic: 'Chemistry',
      questionCount: topicMap['Chemistry']?.count || 0,
      coreThemes: ['Acids, Bases & Salts (pH scale, Buffer solutions)', 'Polymers & Plastics (Thermoplastics vs Thermosetting, Biodegradable plastics, Microplastics)', 'Chemical Elements & Periodic Table (Rare Earth Elements, Heavy metals, Lithium, Cobalt)', 'Everyday Chemicals (Soaps & Detergents, Artificial sweeteners, Preservatives, Baking soda, Bleaching powder)', 'Green Chemistry & Catalysts', 'Radioactivity & Nuclear Isotopes (Carbon dating, Iodine-131, Cobalt-60)']
    },
    {
      syllabusOrder: 4,
      module: 'Core Sciences',
      topic: 'Biology',
      questionCount: topicMap['Biology']?.count || 0,
      coreThemes: ['Cell Biology (Plant cell vs Animal cell, Cell organelles - Mitochondria, Chloroplasts, Ribosomes)', 'Genetics & Nucleic Acids (DNA vs RNA, Nitrogenous bases, Chromosomes)', 'Plant Physiology (Photosynthesis, Transpiration, Plant hormones - Auxins, Gibberellins, Ethylene)', 'Human Physiology (Circulatory system, Endocrine glands & hormones, Digestive enzymes, Vitamins & deficiency diseases)', 'Taxonomy & Microorganisms (Bacteria, Viruses, Fungi, Algae, Protozoa)']
    },
    {
      syllabusOrder: 5,
      module: 'Applied Science & Health',
      topic: 'Biotechnology & Genetics',
      questionCount: topicMap['Biotechnology & Genetics']?.count || 0,
      coreThemes: ['Recombinant DNA Technology', 'CRISPR-Cas9 & Gene Editing', 'Genetically Modified Organisms (Bt Cotton, Bt Brinjal, GM Mustard / DMH-11, GEAC role)', 'Stem Cells (Totipotent, Pluripotent, Induced Pluripotent Stem Cells iPSCs)', 'Mitochondrial Replacement Therapy (Three-Parent Babies)', 'DNA Profiling & Gene Sequencing', 'Human Genome Project & Genome India Project']
    },
    {
      syllabusOrder: 6,
      module: 'Applied Science & Health',
      topic: 'Health, Diseases & Medicine',
      questionCount: topicMap['Health, Diseases & Medicine']?.count || 0,
      coreThemes: ['Viral Diseases (COVID-19, Dengue, Chikungunya, Zika, Ebola, Nipah, Rabies, Polio, Hepatitis A-E)', 'Bacterial Diseases (Tuberculosis, Cholera, Typhoid, Leprosy)', 'Protozoan & Fungal Diseases (Malaria, Kala-azar, Mucormycosis)', 'Antimicrobial Resistance (AMR, Superbugs, WHO priority pathogens)', 'Vaccine Technologies (mRNA, Viral vector, Inactivated, Protein subunit, DNA vaccines)', 'Monoclonal Antibodies & CAR-T Cell Therapy', 'Neglected Tropical Diseases (NTDs) & Eradicated Diseases (Smallpox, Guinea worm)']
    },
    {
      syllabusOrder: 7,
      module: 'Applied Science & Health',
      topic: 'Nanotechnology & Materials',
      questionCount: topicMap['Nanotechnology & Materials']?.count || 0,
      coreThemes: ['Nanomaterials (Carbon Nanotubes, Graphene, Fullerenes, Quantum Dots)', 'Properties of Nanoparticles (High surface area to volume ratio, Quantum confinement)', 'Applications in Drug Delivery, Water Purification, Agriculture & Solar Cells', 'Toxicity & Environmental Concerns of Nanoparticles', 'India Nano Mission']
    },
    {
      syllabusOrder: 8,
      module: 'Frontier Tech, Space & Energy',
      topic: 'IT, Communication & Computing',
      questionCount: topicMap['IT, Communication & Computing']?.count || 0,
      coreThemes: ['Artificial Intelligence, Machine Learning & Generative AI (LLMs, Deepfakes)', 'Blockchain Technology, Cryptocurrencies & Central Bank Digital Currency (CBDC / e-Rupee)', 'Quantum Computing (Qubits, Superposition, Quantum Entanglement, National Quantum Mission)', '5G, 6G & Optical Fibre Technology (Wi-Fi 6, Li-Fi, eSIM, BharatNet)', 'Internet of Things (IoT), Edge Computing, Web 3.0 & Metaverse', 'Cybersecurity (Ransomware, Pegasus/Spyware, Zero-day vulnerability, CERT-In)']
    },
    {
      syllabusOrder: 9,
      module: 'Frontier Tech, Space & Energy',
      topic: 'Space Technology',
      questionCount: topicMap['Space Technology']?.count || 0,
      coreThemes: ['ISRO Launch Vehicles (PSLV, GSLV Mk II, LVM3, SSLV - stages, solid vs liquid vs cryogenic fuels)', 'Orbits (LEO, MEO, GEO, Sun-Synchronous Polar Orbit SSO, Lagrange Points L1 to L5)', 'Major Missions (Chandrayaan-1/2/3, Mangalyaan/MOM, Aditya-L1, Gaganyaan, Shukrayaan, NISAR)', 'Satellite Navigation (NavIC / IRNSS, GAGAN, GPS, Galileo, GLONASS, BeiDou)', 'Space Telescopes & Observatories (James Webb, Hubble, Astrosat)', 'Space Debris, Kessler Syndrome & Project NETRA']
    },
    {
      syllabusOrder: 10,
      module: 'Frontier Tech, Space & Energy',
      topic: 'Nuclear & Energy Technology',
      questionCount: topicMap['Nuclear & Energy Technology']?.count || 0,
      coreThemes: ['Nuclear Fission vs Nuclear Fusion (ITER Project)', 'India Three-Stage Nuclear Power Programme (Stage 1: PHWR/Natural Uranium, Stage 2: FBR/Plutonium, Stage 3: AHWR/Thorium)', 'Types of Reactors (Pressurized Heavy Water Reactor, Light Water Reactor, Small Modular Reactors SMRs)', 'Nuclear Agreements & Bodies (IAEA Safeguards, NSG, MTCR, Wassenaar, Australia Group)', 'Renewable Energy Technologies (Solar PV cell materials, Perovskite, Green Hydrogen electrolysis types, Biofuels 1G to 4G, Battery chemistry - Lithium-ion, Solid-state, Sodium-ion)']
    },
    {
      syllabusOrder: 11,
      module: 'Frontier Tech, Space & Energy',
      topic: 'Defence Technology',
      questionCount: topicMap['Defence Technology']?.count || 0,
      coreThemes: ['Integrated Guided Missile Development Programme (IGMDP - Prithvi, Agni, Trishul, Nag, Akash)', 'Ballistic vs Cruise Missiles (BrahMos, Nirbhay)', 'Hypersonic Weapons (Hypersonic Glide Vehicles & Cruise Missiles)', 'Air Defence Systems (S-400 Triumf, Iron Dome, BMD Programme - Prithvi Air Defence & Advanced Air Defence)', 'Submarines (Project 75 / Kalvari class, Scorpene, Arihant class SSBN, AIP Air Independent Propulsion)', 'Fighter Aircraft & UAVs (Tejas LCA, Rafale, Drones / Swarm drones, Anti-drone systems)']
    }
  ];

  const payload = {
    subject: 'Science & Technology',
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

  const localPath = path.resolve('./data/scitech_nodes_architecture.json');
  fs.writeFileSync(localPath, JSON.stringify(payload, null, 2));

  const downloadPath = '/Users/nikhilwandhe/Downloads/scitech_nodes_architecture.json';
  fs.writeFileSync(downloadPath, JSON.stringify(payload, null, 2));

  console.log(`✅ Saved Science & Technology architecture to:\n   - ${localPath}\n   - ${downloadPath}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
