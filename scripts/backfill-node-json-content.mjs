import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GEO_MODULE_FRAMEWORKS = {
  '1. Geomorphology': {
    paper: 'Geography Optional Paper I (Section A) & GS1',
    scholars: ['W.M. Davis (Geomorphic Cycle)', 'Walther Penck (Morphological System)', 'L.C. King (Pediplanation)', 'J.T. Hack (Dynamic Equilibrium)', 'Alfred Wegener & Harry Hess (Plate Tectonics)', 'Pratt & Airy (Isostasy)', 'G.K. Gilbert & Schumm (Channel Morphology)'],
    models: ['Cycle of Erosion & Peneplanation', 'Plate Tectonics & Sea-Floor Spreading', 'Isostatic Equilibrium & Gravity Anomalies', 'Slope Evolution (Decline, Replacement, Parallel Retreat)', 'Denudation Chronology & Erosion Surfaces'],
    caseStudies: ['Himalayan Orogeny & Syntaxial Bends', 'Deccan Trap Volcanism & Shield Stability', 'Chotanagpur Polycyclic Relief & Patlands', 'Kosi & Brahmaputra Braided Channel Dynamics', 'Indian Ocean Tsunami & Subduction Megathrusts']
  },
  '2. Climatology': {
    paper: 'Geography Optional Paper I (Section A) & GS1',
    scholars: ['Wladimir Köppen (Empirical Classification)', 'C.W. Thornthwaite (Moisture Index & PET)', 'G.T. Trewartha (Modified Genetic-Empirical Scheme)', 'V. Bjerknes (Polar Front Theory)', 'H. Flöhn & P. Koteswaram (Tropical Easterly Jet & Monsoon)', 'G. Hadley, Ferrel & Rossby (Tricellular Circulation)'],
    models: ['Planetary Heat Budget & Radiative Forcing', 'Tricellular Meridional Circulation & Rossby Waves', 'Adiabatic Lapse Rates & Atmospheric Stability', 'Frontogenesis & Extra-Tropical Cyclogenesis', 'Urban Heat Island (UHI) & Microclimatic Modification'],
    caseStudies: ['Indian Summer Monsoon Onset, Mascarene High & IOD', 'Western Disturbances & Rabi Crop Hidrology in NW India', 'Bay of Bengal vs Arabian Sea Tropical Cyclone Asymmetry', 'Urban Heat Plumes in Delhi-NCR, Mumbai & Bengaluru', 'IPCC AR6 Cryospheric Retreat in the Hindu Kush Himalaya']
  },
  '3. Oceanography': {
    paper: 'Geography Optional Paper I (Section A) & GS1',
    scholars: ['Charles Darwin (Subsidence Theory of Coral Reefs)', 'R.A. Daly (Glacial Control Theory)', 'John Murray (Standstill Theory)', 'V.W. Ekman & H.U. Sverdrup (Ekman Spiral & Gyre Transport)', 'W.W.illiw & Stommel (Thermohaline Conveyor Belt)'],
    models: ['Hypsometric Curve & Mid-Oceanic Ridge Bathymetry', 'Thermohaline Circulation (AMOC) & Halocline Dynamics', 'Pelagic vs Terrigenous Marine Sedimentation', 'Amphidromic Points & Progressive/Stationary Tide Theory', 'UNCLOS Maritime Zones (EEZ, Continental Shelf, High Seas)'],
    caseStudies: ['Carlsberg Ridge & Ninety East Ridge in the Indian Ocean', 'Lakshadweep, Andaman & Gulf of Mannar Coral Bleaching', 'Polymetallic Nodules in the Central Indian Ocean Basin (CIOB)', 'Bay of Bengal Freshman Stratification vs Arabian Sea Upwelling', 'Blue Economy 2.0 & Deep Ocean Mission (Samudrayaan)']
  },
  '4. Biogeography': {
    paper: 'Geography Optional Paper I (Section A) & GS1/GS3',
    scholars: ['V.V. Dokuchaev (Zonal Pedogenesis)', 'C.F. Marbut & USDA (Soil Taxonomy – 12 Orders)', 'N.I. Vavilov (Centers of Origin of Cultivated Plants)', 'A.R. Wallace & P.L. Sclater (Zoogeographical Realms)', 'F.E. Clements (Climatic Climax Succession)'],
    models: ['Pedogenic Regimes (Podzolization, Laterization, Calcification, Salinization)', 'Soil Horizon Differentiation (O-A-E-B-C-R Profile)', 'Universal Soil Loss Equation (USLE) & Watershed Conservation', 'Island Biogeography & Dispersal Corridors', 'Agro-Forestry & Joint Forest Management Paradigms'],
    caseStudies: ['Lateritic & Regur (Vertisol) Soil Profiles of Peninsular India', 'Indo-Burma, Western Ghats, Himalaya & Sundaland Hotspots', 'Ravine Reclamation in Chambal & Shelterbelts in Thar', 'Vavilovian Hindustani Gene Pool Center & Millets Diversity', 'CAMPA, Green India Mission & Agroforestry Policy in India']
  },
  '5. Environmental Geography': {
    paper: 'Geography Optional Paper I (Section A) & GS3',
    scholars: ['A.G. Tansley (Ecosystem Concept)', 'Eugene Odum (Energy Flow & Ecological Energetics)', 'Raymond Lindeman (Trophic Ten-Percent Law)', 'Garrett Hardin (Commons Governance) & Elinor Ostrom', 'Brundtland Commission (Sustainable Development Framework)'],
    models: ['Trophic Pyramids & Biogeochemical Nutrient Cycling', 'Homeostasis, Ecological Succession & Carrying Capacity', 'Human-Environment Adaptation across Biomes', 'Environmental Impact Assessment (EIA) & Strategic Mitigation', 'Sendai Framework & Multi-Hazard Vulnerability Zoning'],
    caseStudies: ['Western Ghats (Gadgil & Kasturirangan Reports) Ecological Sensitivity', 'Joshimath Subsidence & Teesta/Chamoli Glacial Lake Outbursts (GLOF)', 'National Action Plan on Climate Change (NAPCC) & LiFE Mission', 'Wetland Restoration in Chilika, Loktak & Keoladeo', 'Environmental Protection Act (1986) & Biodiversity Act Frameworks']
  },
  '1. Perspectives in Human Geography': {
    paper: 'Geography Optional Paper I (Section B)',
    scholars: ['Richard Hartshorne (Areal Differentiation)', 'Fred K. Schaefer (Exceptionalism Critique & Spatial Laws)', 'Vidal de la Blache (Possibilism & Genre de Vie)', 'Ellen Churchill Semple & Griffith Taylor (Determinism & Stop-and-Go)', 'David Harvey (Radical Geography) & Yi-Fu Tuan (Humanistic Topophilia)', 'David M. Smith (Welfare Geography: Who Gets What, Where, and How)'],
    models: ['Nomothetic vs Idiographic Methodological Dualism', 'Positivist Quantitative Revolution & Locational Analysis', 'Behavioural Cognitive Matrix (Julian Wolpert & Pred)', 'Humanistic Sense of Place & Lifeworld Phenomenology', 'UNDP Multidimensional Poverty & Human Development Index (HDI)'],
    caseStudies: ['Regional Synthesis in Indian Agro-Climatic & Cultural Regions', 'Welfare Geography Applied to Aspirational Districts in India', 'Spatial Diffusion of Linguistic & Secularization Patterns', 'Critique of Isotropic Plain Assumptions in Indian Rural Space', 'Sub-National HDI Disparities (Kerala vs Bihar/UP Trajectory)']
  },
  '2. Economic Geography': {
    paper: 'Geography Optional Paper I (Section B) & GS1/GS3',
    scholars: ['Derwent Whittlesey (13 World Agricultural Systems)', 'Donella Meadows & Club of Rome (Limits to Growth)', 'Erich Zimmermann (Functional Theory of Resources)', 'J.C. Weaver (Crop Combination Analysis)', 'Gunnar Myrdal (Cumulative Causation)'],
    models: ['Whittlesey Agricultural Typology (Intensity, Commercialization, Mechanization)', 'Limits to Growth Systems Feedback (Population, Resource Depletion, Pollution)', 'Resource Triangle & Critical Energy Transition', 'Global Value Chains, Footloose Industries & Agglomeration Economies', 'Multi-Polar Trade Blocs & Terms-of-Trade Asymmetry'],
    caseStudies: ['Shifting Comparative Advantage in Indo-Pacific Semiconductor & EV Supply Chains', 'India National Green Hydrogen Mission & Renewable Energy Corridors', 'Food Security Architecture (NFSA, Buffer Norms & Climate-Resilient Millets)', 'De-industrialization to Smart Manufacturing Hubs (PLI & Industrial Corridors)', 'WTO Agricultural Subsidies, Peace Clause & Global South Trade Equity']
  },
  '3. Population and Settlement Geography': {
    paper: 'Geography Optional Paper I (Section B) & GS1',
    scholars: ['F.W. Notestein & Warren Thompson (Demographic Transition)', 'E.G. Ravenstein & Everett Lee (Push-Pull Migration Laws)', 'G.K. Zipf (Rank-Size Rule) & Mark Jefferson (Law of the Primate City)', 'E.W. Burgess (Concentric Zone), Homer Hoyt (Sector), Harris & Ullman (Multiple Nuclei)', 'C.A. Doxiadis (Ekistics) & Patrick Geddes (Conurbation)'],
    models: ['Demographic Dividend & Ageing Dependency Trajectory', 'Ackerman & Zelinsky Mobility Transition Models', 'Rural Settlement Morphology (Nucleated, Linear, Dispersed, K-Value)', 'Urban Internal Structure & CBD-Periphery Land Value Gradient', 'Rural-Urban Fringe Transformation & Counter-Urbanization'],
    caseStudies: ['India TFR Replacement Milestone (NFHS-5) & Southern vs Northern Demographic Divergence', 'Primate City Dominance in State Capitals (Kolkata, Mumbai, Chennai, Bengaluru)', 'Peri-Urban Fringe Sprawl along Golden Quadrilateral & Expressways', 'Smart Cities Mission, AMRUT 2.0 & Transit-Oriented Urban Sustainability', 'Internal Circular Migration Corridors & Remittance Geographies in India']
  },
  '4. Regional Planning': {
    paper: 'Geography Optional Paper I (Section B) & GS3',
    scholars: ['François Perroux (Growth Pole Theory)', 'J.R. Boudeville (Geographical Growth Centres)', 'R.P. Misra (Five-Tier Growth Foci System for India)', 'Albert Hirschman (Trickle-Down vs Polarization Effects)', 'Gunnar Myrdal (Spread vs Backwash Effects)'],
    models: ['Formal (Homogeneous), Functional (Nodal) & Planning Regions', 'Principal Component & Gravity-Potential Regionalisation Methods', 'Multi-Level Decentralized Planning & Growth Foci Hierarchy', 'Cumulative Causation & Core-Periphery Divergence', 'Eco-Regional & Bioregional Sustainable Planning'],
    caseStudies: ['Damodar Valley Corporation (DVC) & NCR Regional Planning Experience', 'NITI Aayog Aspirational Districts & Aspirational Blocks Programme', '73rd/74th Constitutional Amendments & District Planning Committees (DPCs)', 'Western Ghats, North-East Region (DoNER) & Bundelkhand Packages', 'Island Development Agency (Andaman-Nicobar & Lakshadweep Holistic Plan)']
  },
  '5. Models, Theories and Laws in Human Geography': {
    paper: 'Geography Optional Paper I (Section B)',
    scholars: ['Walter Christaller (K=3, K=4, K=7 Central Place Theory) & August Lösch', 'Johann Heinrich von Thünen (Agricultural Location & Economic Rent)', 'Alfred Weber (Least-Cost Industrial Triangle & Isodapanes)', 'W.W. Rostow (Five Stages of Economic Growth)', 'Halford Mackinder (Heartland) & Nicholas Spykman (Rimland)'],
    models: ['Systems Analysis (Morphological, Cascading, Process-Response Systems)', 'Malthusian Preventive/Positive Checks vs Marxian Surplus Population', 'Von Thünen Locational Rent Gradient: R = Y(p - c) - Y·F·m', 'Weber Material Index (MI), Agglomeration & Labour Deviation', 'Geopolitical Heartland-Rimland Contest in Indo-Pacific & Eurasia'],
    caseStudies: ['Application of Von Thünen Rings around Indian Metropolitan Mandi Belts', 'Christaller Settlement Hierarchy in the Indo-Gangetic Alluvial Plains', 'Weberian Shift of Iron & Steel from Coal-Pitheads (Jamshedpur) to Coastal Ports (Vizag)', 'Indo-Pacific Rimland Maritime Architecture vs Eurasian Continental Corridors', 'Radcliffe Line, McMahon Line & Sir Creek Boundary Evolution Stages (Jones Model)']
  },
  '1. Physical Setting': {
    paper: 'Geography Optional Paper II (Geography of India) & GS1',
    scholars: ['D.N. Wadia & M.S. Krishnan (Stratigraphy of India)', 'R.L. Singh (Regional Physiographic Division of India)', 'P. Koteswaram, Yin & Flöhn (Monsoon Jet Stream Dynamics)', 'H.G. Champion & S.K. Seth (Forest Types of India)', 'L.D. Stamp, Spate & Subbarao (Climatic & Physical Regionalisation)'],
    models: ['Archean-Dharwar-Cuddapah-Vindhyan-Gondwana-Tertiary Stratigraphic Column', 'Himalayan Nappe Tectonics vs Peninsular Horsts, Grabens & Peneplains', 'Antecedent Himalayan Drainage vs Superimposed/Consequent Peninsular Rivers', 'ITCZ Shift, Somali Jet, Mascarene High, ENSO & IOD Monsoon Teleconnections', 'ICAR 8-Fold Indian Soil Classification & Watershed Delineation'],
    caseStudies: ['Indus-Ganga-Brahmaputra Alluvial Foredeep & Karewas of Kashmir', 'Narmada-Son-Damodar Rift Tectonics & Western Ghats Escarpment', 'El Niño vs Positive Indian Ocean Dipole Impact on Kharif Rainfall Variability', 'Urban & Riverine Floods in Assam, Bihar & Chennai vs Marathwada Droughts', 'Shola-Grassland Mosaic, Sundarbans Mangroves & Tropical Deciduous Belts']
  },
  '2. Resources': {
    paper: 'Geography Optional Paper II (Geography of India) & GS1/GS3',
    scholars: ['GSI & IBM Mineral Belt Delineations', 'Central Ground Water Board (CGWB) Aquifer Mapping', 'Forest Survey of India (ISFR Biennial Assessment)'],
    models: ['Five Major Mineral Belts of India (Chotanagpur, Central, Southern, SW, NW)', 'Conjunctive Surface-Groundwater Management & Aquifer Recharge', 'Critical & Strategic Minerals Supply-Chain Resilience', 'Non-Conventional Renewable Grid Integration & Energy Trilemma'],
    caseStudies: ['Chotanagpur Gondwana Coal & Singhbhum-Odisha Iron-Manganese Core', 'Lithium & Critical Mineral Discoveries in Reasi (J&K), Karnataka & Rajasthan', 'Atal Bhujal Yojana & Over-Exploited Aquifers in NW India', 'Bhadla, Khavda & Offshore Wind-Solar Hybrid Parks', 'Project Tiger, Project Dolphin & Biosphere Reserve Network']
  },
  '3. Agriculture': {
    paper: 'Geography Optional Paper II (Geography of India) & GS3',
    scholars: ['Planning Commission (15 Agro-Climatic Zones)', 'NBSS&LUP / ICAR (20 Agro-Ecological Regions)', 'M.S. Swaminathan (Evergreen Revolution)', 'Verghese Kurien (Operation Flood & Co-operative Dairy)', 'Jasbir Singh & Weaver (Crop Combination & Intensity Index)'],
    models: ['Cropping Intensity, Agricultural Productivity & Land Capability Classification', 'Agro-Climatic vs Agro-Ecological Regionalisation Matrix', 'Dryland Farming (CRIDA) & Micro-Irrigation Water-Use Efficiency', 'Integrated Farming Systems: White, Blue (Neeli Kranti) & Sericulture Value Chains'],
    caseStudies: ['Green Revolution Ecological Externalities in Punjab-Haryana vs Second Green Revolution in Eastern India', 'Dryland Millets (Shree Anna) & Pulses Diversification in Deccan Plateau', 'PM-KUSUM, Per Drop More Crop & Digital Public Infrastructure (AgriStack)', 'Operation Flood Co-operative Model in Gujarat & Brackish-Water Aquaculture in Andhra Pradesh', 'Agro-Climatic Zone Specific Crop Planning across the 15 Planning Commission Regions']
  },
  '4. Industry': {
    paper: 'Geography Optional Paper II (Geography of India) & GS1/GS3',
    scholars: ['B.N. Sinha, P.P. Karan & M.R. Chaudhuri (Industrial Regions of India)', 'Alfred Weber & Loschian Market-Orientation in Indian Manufacturing'],
    models: ['8 Major & 13 Minor Industrial Regions of India', 'Weight-Losing Raw Material Orientation (Steel, Sugar, Cement, Aluminum) vs Footloose/Market Orientation', 'Industrial Corridors (DMIC, CBIC, AKIC) & SEZ Agglomeration Clusters', 'Production-Linked Incentive (PLI) & Make-in-India Spatial Rebalancing'],
    caseStudies: ['Shift of Cotton Textile from Mumbai-Ahmedabad to Coimbatore-Tiruppur Decentralised Clusters', 'Chotanagpur-Damodar Steel-Coal Complex vs Coastal Port-Based Steel (Visakhapatnam, Paradip)', 'Pharmaceutical & Bulk Drug Parks in Hyderabad, Gujarat & Himachal Pradesh', 'Eco-Tourism Carrying Capacity in Himalayan States, Northeast & Coastal CRZ Zones']
  },
  '5. Transport, Communication and Trade': {
    paper: 'Geography Optional Paper II (Geography of India) & GS3',
    scholars: ['PM Gati Shakti National Master Plan Multimodal Framework', 'Sagarmala & Bharatmala Spatial Connectivity Models'],
    models: ['Multimodal Logistics Integration (Rail, Road, Inland Waterways, Pipelines, Air)', 'Port-Led Industrialization & Hinterland-Foreland Dynamics', 'Dedicated Freight Corridors (EDFC & WDFC) & National Waterways (NW-1 to NW-5)', 'Geospatial & Space Technology (ISRO NavIC, Bhuvan, EOS) in Governance'],
    caseStudies: ['WDFC & EDFC Decongestion of Golden Quadrilateral Freight Traffic', 'Sagarmala Transshipment Hubs (Vizhinjam, Vadhavan & Galathea Bay)', 'HVJ & Urja Ganga Gas Pipeline Grid and Regional Industrial Catalyst Role', 'ISRO Earth Observation Satellites (Resourcesat, Cartosat, RISAT) in Disaster & Crop Monitoring']
  },
  '6. Cultural Setting': {
    paper: 'Geography Optional Paper II (Geography of India) & GS1',
    scholars: ['B.S. Guha & H.H. Risley (Anthropological Classification)', 'G.A. Grierson (Linguistic Survey of India)', 'F.J. Richards, Subbarao & Spate (Perennial Nuclear, Cul-de-Sac & Route Regions)', 'Ashish Bose (BIMARU & Demographic Transition Stages in India)'],
    models: ['Core Cultural Hearths (Perennial Nuclear Regions vs Areas of Relative Isolation)', 'Four Major Linguistic Families (Indo-Aryan, Dravidian, Austro-Asiatic, Sino-Tibetan)', 'Tribal Belt Spatial Clustering (Central Indian Heart, North-East Frontier, Island/Southern Pockets)', 'Inter-State Demographic Divergence: Sex Ratio, Dependency Ratio, Longevity & Migration Corridors'],
    caseStudies: ['PVTGs & PM-JANMAN Mission across Schedule V and Schedule VI Tribal Regions', 'Rural-to-Urban & Inter-State Migration Corridors (Bihar/UP/Odisha to Maharashtra/Gujarat/NCR/Kerala)', 'Epidemiological Transition, NFHS-5 Health Indicators & Ageing States in Southern India', 'Cultural Regionalisation of India across River Basins and Linguistic Frontiers']
  },
  '7. Settlements': {
    paper: 'Geography Optional Paper II (Geography of India) & GS1',
    scholars: ['R.L. Singh (Rural Settlement Types & Morphology in Ganga Valley)', 'Asok Mitra (Functional Classification of Indian Towns)', 'C.D. Deshpande & K.V. Sundaram (Indian Metropolitan Regions & Conurbations)'],
    models: ['Compact, Semi-Compact, Hamleted & Dispersed Rural Settlement Controls', 'Caste-Segregated & Jajmani Morphologies in Traditional Indian Villages', 'Colonial Cantonment/Civil Lines vs Indigenous Walled-City Dual Urban Morphology', 'Mega-Urban Conurbations, Ribbon Sprawl & Slum In-Situ Rehabilitation'],
    caseStudies: ['Compact Nucleated Settlements of Upper Ganga Plain vs Dispersed Homesteads of Kerala & Himachal', 'Mumbai-Pune-Nashik, NCR & Bengaluru-Chennai Metropolitan Corridors', 'Dharavi & Urban Slum Redevelopment under PMAY-Urban & Smart Cities Mission', 'Master Plan Reform, Sponge Cities & Transit-Oriented Development (TOD) in Tier-1/Tier-2 Indian Cities']
  },
  '8. Regional Development and Planning': {
    paper: 'Geography Optional Paper II (Geography of India) & GS3',
    scholars: ['D.R. Gadgil, Sukhamoy Chakravarty & Hanumantha Rao (Decentralized & Multi-Level Planning)', 'M.L. Dantwala (Block-Level Planning) & Balwant Rai Mehta (Panchayati Raj)'],
    models: ['Multi-Level Planning Hierarchy (National → State → District → Block → Gram Panchayat)', 'Target-Area Approach (DPAP, DDP, HADP, CADP) vs Target-Group Approach', 'Ridge-to-Valley Integrated Watershed Management (Neeranchal / PMKSY)', 'Tribal Sub-Plan (TSP) & Island Holistic Sustainable Development'],
    caseStudies: ['Command Area Development (CAD) in Indira Gandhi Nahar Pariyojana (IGNP) & Waterlogging Remediation', 'Hill Area Development Programme (HADP) in Western Ghats & Nilgiris vs Himalayan States', '73rd Amendment Gram Sabha Micro-Planning & Fifth/Sixth Schedule Decentralization', 'NITI Aayog Aspirational Districts Data-Driven Convergence Model']
  },
  '9. Political Aspects': {
    paper: 'Geography Optional Paper II (Geography of India) & GS2',
    scholars: ['K.M. Panikkar (Indian Ocean Geopolitics)', 'Fazl Ali Commission (States Reorganisation 1956)', 'R.D. Dikshit (Federalism & Political Geography of India)'],
    models: ['Physiographic, Linguistic & Ethno-Economic Bases of Indian Asymmetric Federalism', 'Evolution of State Reorganisation: Linguistic Phase to Administrative/Developmental Viability', 'Inter-State River Water Tribunals (Article 262) & Territorial Disputes', 'Indian Ocean Rim Geopolitics, SAGAR Doctrine & Frontier Buffer Dynamics'],
    caseStudies: ['Creation of Uttarakhand, Jharkhand, Chhattisgarh & Telangana on Developmental/Ecological Grounds', 'Cauvery, Krishna-Godavari, Mahadayi & Sutlej-Yamuna Link (SYL) Inter-State River Disputes', 'LAC (Western, Middle, Eastern Sectors), LoC, Indo-Myanmar FMR & Kalapani-Susta Border Geographies', 'India Necklace of Diamonds, Quad Maritime Security & IMEC Corridor in the Indian Ocean Realm']
  },
  '10. Contemporary Issues': {
    paper: 'Geography Optional Paper II (Geography of India) & GS1/GS3',
    scholars: ['NDMA Hazard Zoning Atlas', 'National Water Development Agency (NWDA Inter-Basin River Linking)', 'Central Pollution Control Board (CPCB) & MoEFCC EIA Frameworks'],
    models: ['Multi-Hazard Vulnerability & Seismic Zone (II–V) Risk Mitigation', 'Environmental Impact Assessment (EIA) Lifecycle: Screening, Scoping, Public Hearing,EMP', 'Inter-Basin Water Transfer (Himalayan & Peninsular Components) Ecological Cost-Benefit', 'Post-1991 LPG Reforms & Core-Periphery Regional Disparity Dynamics'],
    caseStudies: ['Ken-Betwa River Linking Project & Panna Tiger Reserve Hydrological Impact', 'Western Ghats & Himalayan Landslide Susceptibility Mapping (Wayand & Joshimath Lessons)', 'Indo-Gangetic Airshed Winter Smog & National Clean Air Programme (NCAP)', 'UNCCD Desertification Atlas (ISRO SAC) & India 26 Million Hectare Land Degradation Neutrality Target']
  }
};

function isJsonEmpty(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') {
    const t = val.trim();
    return t === '' || t === 'null' || t === '{}' || t === '[]';
  }
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
}

function extractBulletsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/\r?\n/)
    .map(l => l.replace(/^[•*\-\d.)\s]+/, '').trim())
    .filter(l => l.length > 8);
}

function buildPrelimsFromMetadata(node, meta) {
  const themes = Array.isArray(meta?.keyThemes) && meta.keyThemes.length > 0
    ? meta.keyThemes
    : [`${node.title} — Core Conceptual Framework`, `Constitutional & Statutory Context of ${node.topic}`, `Contemporary Policy & Institutional Mechanisms`];
  const subtopics = Array.isArray(meta?.subtopics) && meta.subtopics.length > 0
    ? meta.subtopics
    : [`Evolution and foundational principles of ${node.title}`, `Key institutional mechanisms and implementation challenges`, `Comparative and empirical indicators for UPSC Prelims`];

  const conceptsMap = {};
  themes.slice(0, 4).forEach((t, idx) => {
    const cleanKey = t.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).slice(0, 4).join('_') || `Dimension_${idx + 1}`;
    const matchedSub = subtopics[idx] || `Core operational and conceptual facet of ${node.title} within ${node.topic}.`;
    conceptsMap[cleanKey] = `${t}: ${matchedSub}.`;
  });

  return {
    core_focus: meta?.importanceNote || `${node.title} is a high-yield syllabus node under ${node.domain} (${node.topic}), frequently tested for conceptual clarity, institutional mandates, and applied governance linkages.`,
    syllabus_anchor: `${node.domain} • ${node.topic} (${(node.gsPapers || meta?.gsPaper || ['General Studies']).join(', ')})`,
    high_yield_themes: themes.slice(0, 8),
    key_dimensions_and_facts: subtopics.slice(0, 8),
    concepts_to_remember: conceptsMap
  };
}

function buildMainsFromMetadata(node, meta, summary) {
  const themes = Array.isArray(meta?.keyThemes) ? meta.keyThemes : [];
  const subtopics = Array.isArray(meta?.subtopics) ? meta.subtopics : [];
  const angles = Array.isArray(meta?.examAngles) && meta.examAngles.length > 0
    ? meta.examAngles
    : (Array.isArray(meta?.pyqAngles) && meta.pyqAngles.length > 0
        ? meta.pyqAngles
        : [
            `Critically examine the structural dimensions and contemporary relevance of ${node.title} in the context of ${node.topic}.`,
            `Discuss the institutional, policy, and grass-roots challenges associated with ${node.title} and suggest a sustainable way forward.`,
            `Analyze the linkage between ${node.title} and inclusive constitutional governance in India.`
          ]);

  const coreDimensions = {};
  subtopics.slice(0, 5).forEach((sub, idx) => {
    const label = themes[idx]
      ? themes[idx].replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).slice(0, 4).join('_').toLowerCase()
      : `dimension_${idx + 1}`;
    coreDimensions[label || `dimension_${idx + 1}`] = `${sub}. Candidates should substantiate this dimension with constitutional/statutory provisions, committee recommendations, and empirical trends.`;
  });

  return {
    introduction: summary || `${node.title} occupies a pivotal position in ${node.domain} (${node.topic}), shaping policy discourse, institutional accountability, and socio-economic outcomes in India.`,
    core_structural_dimensions: coreDimensions,
    critical_analysis_and_exam_angles: {
      primary_Analytical_Framing: angles[0] || `Evaluate the structural evolution and implementation gaps in ${node.title}.`,
      contemporary_Policy_Linkage: angles[1] || `Assess the interplay between state capacity, civil society, and technological reforms in addressing ${node.title}.`,
      comparative_and_Ethical_Horizon: angles[2] || `Integrate constitutional morality, SDG targets, and administrative reforms while formulating Mains arguments on ${node.title}.`
    },
    way_forward_and_conclusion: meta?.importanceNote || `A balanced UPSC Mains conclusion on ${node.title} should synthesize institutional reform, evidence-based policymaking, and inclusive stakeholder participation under the broader ${node.topic} framework.`
  };
}

function buildOptionalGeoPayload(node, siblingTitles) {
  const fw = GEO_MODULE_FRAMEWORKS[node.topic] || {
    paper: 'Geography Optional (Paper I & Paper II) & GS1',
    scholars: ['Richard Hartshorne', 'Vidal de la Blache', 'W.M. Davis', 'R.L. Singh', 'D.N. Wadia'],
    models: ['Spatial Systems Analysis', 'Regional Synthesis & Areal Differentiation', 'Process-Response Geomorphic & Ecological Modelling', 'Sustainable Regional Planning Framework'],
    caseStudies: ['Himalayan & Peninsular Physiographic Contrasts', 'Indo-Gangetic Plains & Coastal Agro-Ecological Zones', 'NITI Aayog Regional Development & Resource Conservation in India']
  };

  const relatedSiblings = siblingTitles.filter(t => t !== node.title && t !== node.topic).slice(0, 6);
  const keyThemes = [
    `${node.title} — Conceptual & Theoretical Foundations`,
    ...fw.models.slice(0, 3),
    ...fw.scholars.slice(0, 3),
    ...relatedSiblings.slice(0, 3)
  ];

  const subtopics = [
    `Fundamental definition, spatial parameters, and systemic controls of ${node.title} under ${node.topic}`,
    `Classical vs contemporary theoretical paradigms (${fw.scholars.slice(0, 3).join('; ')}) applied to ${node.title}`,
    `Process-response mechanisms, spatial distribution patterns, and scale linkages (${fw.models.slice(0, 2).join('; ')})`,
    `Empirical case studies and Indian regional illustrations: ${fw.caseStudies.slice(0, 3).join('; ')}`,
    `Applied geography relevance, environmental-economic sustainability, and contemporary research critiques on ${node.title}`,
    ...(relatedSiblings.length > 0 ? [`Inter-linkages within ${node.topic}: ${relatedSiblings.join(', ')}`] : [])
  ];

  const examAngles = [
    `"${node.title} reflects the dynamic interplay between spatial processes, theoretical models, and regional realities." Examine with suitable diagrams and Indian examples.`,
    `Critically evaluate the classical and modern paradigms of ${node.title} within ${node.topic}, highlighting their applicability to contemporary environmental and regional planning.`,
    `Write a short geographical note on ${node.title} with special reference to spatial differentiation and applied significance in India.`
  ];

  const summary = `${node.title} is a core syllabus component of ${node.topic} in ${fw.paper}. Mastering this node requires integrating theoretical models (${fw.scholars.slice(0, 2).join(', ')}) with spatial diagrams, process-response mechanisms, and applied regional case studies from India (${fw.caseStudies.slice(0, 2).join('; ')}).`;

  const metadata = {
    nodeId: node.slug || node.id,
    title: node.title,
    domain: node.domain,
    gsPaper: node.gsPapers && node.gsPapers.length > 0 ? node.gsPapers : ['Optional Geography', 'GS1'],
    keyThemes,
    subtopics,
    examAngles,
    pyqAngles: examAngles,
    linkedConcepts: relatedSiblings.slice(0, 4),
    examRelevance: 'High',
    importanceNote: `High-scoring Geography Optional responses on ${node.title} must combine scholar citations (${fw.scholars.slice(0, 2).join(', ')}), annotated schematic maps/diagrams, and concrete Indian regional examples.`,
    contentStatus: 'BASELINE_SYNTHESIZED'
  };

  const prelimsNote = {
    core_focus: `${node.title} (${node.topic}) — ${fw.paper}. Examines spatial patterns, process controls, and regional applications.`,
    theoretical_anchors_and_scholars: fw.scholars.slice(0, 5),
    models_and_analytical_frameworks: fw.models,
    indian_and_global_case_studies: fw.caseStudies,
    concepts_to_remember: {
      Spatial_Process_Mechanism: `Core factors and feedback loops governing ${node.title} across micro, meso, and macro scales.`,
      Theoretical_Evolution: `Transition from descriptive regional accounts to quantitative, systems-based, and applied perspectives in ${node.topic}.`,
      Indian_Regional_Application: `Direct application of ${node.title} to Indian physiographic, agro-climatic, and regional planning contexts (${fw.caseStudies[0]}).`
    }
  };

  const mainsNote = {
    introduction: summary,
    theoretical_and_conceptual_framework: {
      foundational_Postulates: `Defines the spatial boundary conditions, genetic processes, and structural components of ${node.title} within ${node.topic}.`,
      scholarly_Lineage_and_Models: `Integrates perspectives from ${fw.scholars.slice(0, 3).join(', ')} alongside ${fw.models.slice(0, 2).join(' and ')}.`,
      systems_and_Temporal_Dynamics: `Examines equilibrium thresholds, feedback mechanisms, and anthropogenic modifications affecting ${node.title}.`
    },
    indian_and_applied_spatial_perspective: {
      regional_Case_Studies: fw.caseStudies.join(' • '),
      inter_Topic_Linkages: relatedSiblings.length > 0
        ? `Directly interfaces with ${relatedSiblings.slice(0, 4).join(', ')} across Paper I and Paper II.`
        : `Bridges Paper I theoretical principles with Paper II Indian regional geography.`
    },
    answer_writing_and_diagrammatic_enrichment: {
      recommended_Visuals: `Include a labeled process-flow schematic, spatial world/India distribution map, and model comparison matrix for ${node.title}.`,
      critical_Evaluation: examAngles[0]
    },
    conclusion: `A holistic appraisal of ${node.title} bridges classical geographical theory with contemporary sustainability, hazard resilience, and balanced regional development.`
  };

  return { metadata, prelimsNote, mainsNote, cumulativeSummary: summary };
}

async function main() {
  console.log('🚀 Starting Backfill of Missing Issue JSON Content...');

  const allIssues = await prisma.issue.findMany({
    orderBy: { orderIndex: 'asc' }
  });

  // Group titles by topic for OPTIONAL_GEOGRAPHY sibling context
  const geoSiblingsByTopic = {};
  for (const issue of allIssues) {
    if (issue.domain === 'OPTIONAL_GEOGRAPHY') {
      if (!geoSiblingsByTopic[issue.topic]) geoSiblingsByTopic[issue.topic] = [];
      geoSiblingsByTopic[issue.topic].push(issue.title);
    }
  }

  let updatedGeo = 0;
  let updatedGsNotes = 0;
  let updatedBridgingMeta = 0;

  for (const node of allIssues) {
    const hasMeta = !isJsonEmpty(node.metadata);
    const hasPrelims = !isJsonEmpty(node.prelimsNote);
    const hasMains = !isJsonEmpty(node.mainsNote);
    const hasSummary = Boolean(node.cumulativeSummary && node.cumulativeSummary.trim());

    if (hasMeta && hasPrelims && hasMains && hasSummary) {
      continue;
    }

    const updateData = {
      lastUpdatedAt: new Date()
    };

    if (node.domain === 'OPTIONAL_GEOGRAPHY') {
      const siblings = geoSiblingsByTopic[node.topic] || [];
      const payload = buildOptionalGeoPayload(node, siblings);
      if (!hasMeta) updateData.metadata = payload.metadata;
      if (!hasPrelims) updateData.prelimsNote = payload.prelimsNote;
      if (!hasMains) updateData.mainsNote = payload.mainsNote;
      if (!hasSummary) updateData.cumulativeSummary = payload.cumulativeSummary;
      if (!node.gsPapers || node.gsPapers.length === 0) {
        updateData.gsPapers = ['GS1'];
      }

      await prisma.issue.update({
        where: { id: node.id },
        data: updateData
      });
      updatedGeo++;
      continue;
    }

    // Case 2: GS node that already has prelimsNote (e.g. from bridging JSON) but is missing metadata and/or mainsNote
    if (hasPrelims && !hasMeta) {
      const bullets = typeof node.prelimsNote === 'string'
        ? extractBulletsFromText(node.prelimsNote)
        : Object.values(node.prelimsNote).flat().map(v => typeof v === 'string' ? v : JSON.stringify(v));

      const keyThemes = bullets
        .map(b => {
          const colonIdx = b.indexOf(':');
          if (colonIdx > 2 && colonIdx < 65) return b.slice(0, colonIdx).trim();
          return b.split(/[.;—–-]/)[0].trim().slice(0, 75);
        })
        .filter(Boolean)
        .slice(0, 8);

      const synthesizedMeta = {
        nodeId: node.slug || node.id,
        title: node.title,
        domain: node.domain,
        gsPaper: node.gsPapers && node.gsPapers.length > 0 ? node.gsPapers : ['GS1'],
        keyThemes: keyThemes.length >= 2 ? keyThemes : [`${node.title} — Core Provisions`, `${node.topic} Framework`, `UPSC Prelims & Mains High-Yield Concepts`],
        subtopics: bullets.length > 0 ? bullets.slice(0, 10) : [`Core dimensions of ${node.title} under ${node.topic}`],
        examAngles: [
          `Examine the significance and core dimensions of ${node.title} under ${node.domain} (${node.topic}).`,
          `Discuss the key constitutional, historical, or policy milestones associated with ${node.title}.`
        ],
        pyqAngles: [
          `Analytical and factual dimensions of ${node.title} tested in UPSC CSE Prelims and Mains.`
        ],
        linkedConcepts: [node.topic, node.domain],
        examRelevance: 'High',
        importanceNote: `Core syllabus anchor under ${node.domain} (${node.topic}) bridging Prelims factual precision with Mains analytical depth.`,
        contentStatus: 'BASELINE_SYNTHESIZED'
      };

      updateData.metadata = synthesizedMeta;
      if (!hasSummary) {
        updateData.cumulativeSummary = bullets.slice(0, 3).join(' ') || `${node.title} is a high-yield UPSC syllabus node under ${node.domain} (${node.topic}).`;
      }
      if (!hasMains) {
        updateData.mainsNote = buildMainsFromMetadata(node, synthesizedMeta, updateData.cumulativeSummary || node.cumulativeSummary);
      }

      await prisma.issue.update({
        where: { id: node.id },
        data: updateData
      });
      updatedBridgingMeta++;
      continue;
    }

    // Case 3: GS node that has metadata (and possibly prelimsNote), fill any missing prelimsNote / mainsNote / summary
    const effectiveMeta = hasMeta ? { ...node.metadata } : {
      nodeId: node.slug || node.id,
      title: node.title,
      domain: node.domain,
      gsPaper: node.gsPapers || ['GS'],
      keyThemes: [`${node.title} — Core Framework`, node.topic],
      subtopics: [`Structural analysis of ${node.title} in ${node.domain}`],
      examRelevance: 'High',
      contentStatus: 'BASELINE_SYNTHESIZED'
    };

    if (!hasPrelims) {
      updateData.prelimsNote = buildPrelimsFromMetadata(node, effectiveMeta);
      effectiveMeta.contentStatus = effectiveMeta.contentStatus === 'PARTIAL' ? 'BASELINE_SYNTHESIZED' : (effectiveMeta.contentStatus || 'BASELINE_SYNTHESIZED');
      updateData.metadata = effectiveMeta;
    }
    if (!hasSummary) {
      const themesStr = (effectiveMeta.keyThemes || []).slice(0, 4).join(', ');
      updateData.cumulativeSummary = effectiveMeta.importanceNote
        ? `${node.title} (${node.domain} — ${node.topic}) encompasses ${themesStr}. ${effectiveMeta.importanceNote}`
        : `${node.title} is a core UPSC syllabus node under ${node.domain} (${node.topic}), covering ${themesStr || 'key institutional and policy dimensions'}.`;
    }
    if (!hasMains) {
      updateData.mainsNote = buildMainsFromMetadata(node, effectiveMeta, updateData.cumulativeSummary || node.cumulativeSummary);
    }

    await prisma.issue.update({
      where: { id: node.id },
      data: updateData
    });
    updatedGsNotes++;
  }

  console.log(`✅ Backfill Complete! Updated:
  - OPTIONAL_GEOGRAPHY nodes: ${updatedGeo}
  - GS nodes (from existing metadata/prelimsNote): ${updatedGsNotes}
  - Bridging GS nodes (metadata + mainsNote synthesized from prelimsNote): ${updatedBridgingMeta}`);
}

main()
  .catch((e) => {
    console.error('❌ Backfill failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
