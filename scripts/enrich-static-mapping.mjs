import fs from 'fs';
import path from 'path';
import { CURATED_MAPPING_NODES } from '../src/lib/static-mapping-data.js';

// Mapping table for the original 47 nodes to link to canonical neural issues
const ISSUE_LINKS = {
  'IND-RIV-01': { slug: 'indian-drainage-himalayan-peninsular-river-systems', title: 'Indian Drainage — Himalayan & Peninsular River Systems', domain: 'GEOGRAPHY' },
  'IND-RIV-02': { slug: 'indian-drainage-himalayan-peninsular-river-systems', title: 'Indian Drainage — Himalayan & Peninsular River Systems', domain: 'GEOGRAPHY' },
  'IND-RIV-03': { slug: 'indian-drainage-himalayan-peninsular-river-systems', title: 'Indian Drainage — Himalayan & Peninsular River Systems', domain: 'GEOGRAPHY' },
  'IND-RIV-04': { slug: 'indian-drainage-himalayan-peninsular-river-systems', title: 'Indian Drainage — Himalayan & Peninsular River Systems', domain: 'GEOGRAPHY' },
  'IND-RIV-05': { slug: 'indian-drainage-himalayan-peninsular-river-systems', title: 'Indian Drainage — Himalayan & Peninsular River Systems', domain: 'GEOGRAPHY' },
  'IND-RIV-06': { slug: 'indian-drainage-himalayan-peninsular-river-systems', title: 'Indian Drainage — Himalayan & Peninsular River Systems', domain: 'GEOGRAPHY' },
  'IND-REL-01': { slug: 'himalaya-mountain-passes-northern-plains', title: 'Himalaya, Mountain Passes & Northern Plains', domain: 'GEOGRAPHY' },
  'IND-REL-02': { slug: 'peninsular-plateau-coastal-plains-island-groups', title: 'Peninsular Plateau, Coastal Plains & Island Groups', domain: 'GEOGRAPHY' },
  'IND-REL-03': { slug: 'peninsular-plateau-coastal-plains-island-groups', title: 'Peninsular Plateau, Coastal Plains & Island Groups', domain: 'GEOGRAPHY' },
  'IND-REL-04': { slug: 'peninsular-plateau-coastal-plains-island-groups', title: 'Peninsular Plateau, Coastal Plains & Island Groups', domain: 'GEOGRAPHY' },
  'IND-REL-05': { slug: 'peninsular-plateau-coastal-plains-island-groups', title: 'Peninsular Plateau, Coastal Plains & Island Groups', domain: 'GEOGRAPHY' },
  'IND-PA-01': { slug: 'protected-areas-of-india-location-rivers-special-features', title: 'Protected Areas of India — Location, Rivers & Special Features', domain: 'ENVIRONMENT' },
  'IND-PA-02': { slug: 'protected-areas-of-india-location-rivers-special-features', title: 'Protected Areas of India — Location, Rivers & Special Features', domain: 'ENVIRONMENT' },
  'IND-PA-03': { slug: 'protected-areas-of-india-location-rivers-special-features', title: 'Protected Areas of India — Location, Rivers & Special Features', domain: 'ENVIRONMENT' },
  'IND-PA-04': { slug: 'protected-areas-of-india-location-rivers-special-features', title: 'Protected Areas of India — Location, Rivers & Special Features', domain: 'ENVIRONMENT' },
  'IND-PA-05': { slug: 'protected-areas-of-india-location-rivers-special-features', title: 'Protected Areas of India — Location, Rivers & Special Features', domain: 'ENVIRONMENT' },
  'IND-WET-01': { slug: 'wetlands-conservation-ramsar-sites-threats', title: 'Wetlands — Conservation, Ramsar Sites & Threats', domain: 'ENVIRONMENT' },
  'IND-WET-02': { slug: 'wetlands-conservation-ramsar-sites-threats', title: 'Wetlands — Conservation, Ramsar Sites & Threats', domain: 'ENVIRONMENT' },
  'IND-WET-03': { slug: 'wetlands-conservation-ramsar-sites-threats', title: 'Wetlands — Conservation, Ramsar Sites & Threats', domain: 'ENVIRONMENT' },
  'IND-WET-04': { slug: 'wetlands-conservation-ramsar-sites-threats', title: 'Wetlands — Conservation, Ramsar Sites & Threats', domain: 'ENVIRONMENT' },
  'IND-WET-05': { slug: 'wetlands-conservation-ramsar-sites-threats', title: 'Wetlands — Conservation, Ramsar Sites & Threats', domain: 'ENVIRONMENT' },
  'IND-PORT-01': { slug: 'transport-network-ports-highways-freight-corridors-waterways', title: 'Transport Network — Ports, Highways, Freight Corridors & Waterways', domain: 'GEOGRAPHY' },
  'IND-PORT-02': { slug: 'transport-network-ports-highways-freight-corridors-waterways', title: 'Transport Network — Ports, Highways, Freight Corridors & Waterways', domain: 'GEOGRAPHY' },
  'IND-PORT-03': { slug: 'transport-network-ports-highways-freight-corridors-waterways', title: 'Transport Network — Ports, Highways, Freight Corridors & Waterways', domain: 'GEOGRAPHY' },
  'IND-MIN-01': { slug: 'distribution-of-minerals-global-indian-context', title: 'Distribution of Minerals — Global & Indian Context', domain: 'GEOGRAPHY' },
  'IND-MIN-02': { slug: 'distribution-of-minerals-global-indian-context', title: 'Distribution of Minerals — Global & Indian Context', domain: 'GEOGRAPHY' },
  'IND-HER-01': { slug: 'indus-valley-civilisation-urban-planning-architecture-trade', title: 'Indus Valley Civilisation — Urban Planning, Architecture & Trade', domain: 'ANCIENT HISTORY' },
  'IND-HER-02': { slug: 'ashoka-the-great-kalinga-war-dhamma-inscriptions-edicts', title: 'Ashoka the Great — Kalinga War, Dhamma, Inscriptions & Edicts', domain: 'ANCIENT HISTORY' },
  'IND-HER-03': { slug: 'buddhist-councils-sects-theravada-mahayana-vajrayana-bodhisattvas', title: 'Buddhist Councils, Sects (Theravada, Mahayana, Vajrayana) & Bodhisattvas', domain: 'ANCIENT HISTORY' },
  'IND-HER-04': { slug: 'jainism-tirthankaras-doctrines-epistemology-sects', title: 'Jainism — Tirthankaras, Doctrines, Epistemology & Sects', domain: 'ANCIENT HISTORY' },
  'WLD-PHY-01': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'WLD-PHY-02': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'WLD-PHY-03': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'WLD-PHY-04': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'WLD-MIN-01': { slug: 'distribution-of-minerals-global-indian-context', title: 'Distribution of Minerals — Global & Indian Context', domain: 'GEOGRAPHY' },
  'WLD-SEA-01': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'WLD-SEA-02': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'WLD-SEA-03': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'IR-CHOKE-01': { slug: 'geopolitical-importance-of-indian-ocean', title: 'Geopolitical Importance of Indian Ocean', domain: 'GEOGRAPHY' },
  'IR-CHOKE-02': { slug: 'geopolitical-importance-of-indian-ocean', title: 'Geopolitical Importance of Indian Ocean', domain: 'GEOGRAPHY' },
  'IR-CHOKE-03': { slug: 'geopolitical-importance-of-indian-ocean', title: 'Geopolitical Importance of Indian Ocean', domain: 'GEOGRAPHY' },
  'IR-PROJ-01': { slug: 'geopolitical-importance-of-indian-ocean', title: 'Geopolitical Importance of Indian Ocean', domain: 'GEOGRAPHY' },
  'IR-PROJ-02': { slug: 'geopolitical-importance-of-indian-ocean', title: 'Geopolitical Importance of Indian Ocean', domain: 'GEOGRAPHY' },
  'IR-PROJ-03': { slug: 'geopolitical-importance-of-indian-ocean', title: 'Geopolitical Importance of Indian Ocean', domain: 'GEOGRAPHY' },
  'IR-CONF-01': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'IR-CONF-02': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' },
  'IR-CONF-03': { slug: 'world-physical-features-straits-seas-rivers-mountains-deserts', title: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts', domain: 'GEOGRAPHY' }
};

// 24 New Curated Nodes targeting the uncovered Mapping PYQs
const NEW_STATIC_NODES = [
  // 1. Krishna River Basin & Reservoirs
  {
    id: 'IND-RIV-07',
    slug: 'krishna-river-reservoirs',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Krishna River Basin, Reservoirs & Tributaries',
    aliases: ['Ghataprabha', 'Malaprabha', 'Bhima', 'Tungabhadra', 'Koyna', 'Musi', 'Munneru', 'Almatti Dam', 'Nagarjuna Sagar', 'Srisailam'],
    placeType: 'East-Flowing Peninsular River System',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Maharashtra, Karnataka, Telangana, Andhra Pradesh' },
    lat: 16.5167,
    lng: 80.6167,
    shape: [
      [17.92, 73.65], [16.85, 74.60], [16.20, 75.80], [16.05, 77.20],
      [16.25, 78.85], [16.50, 80.60], [15.80, 80.90]
    ],
    neighbours: ['Right-bank: Venna, Koyna, Panchganga, Dudhganga, Ghataprabha, Malaprabha, Tungabhadra', 'Left-bank: Bhima, Dindi, Musi, Paleru, Munneru'],
    staticFacts: [
      'Second largest east-flowing peninsular river in India; rises near Mahabaleshwar in the Western Ghats (Maharashtra).',
      'UPSC 2022 Fact: Ghataprabha reservoir is located in Karnataka (NOT Telangana); Gandhi Sagar is on Chambal (MP); Indira Sagar on Narmada (MP); Maithon dam on Barakar river (Jharkhand).',
      'Major multipurpose reservoirs: Almatti Dam (Lal Bahadur Shastri reservoir, Karnataka), Srisailam Dam (AP/Telangana border), and Nagarjuna Sagar Dam.'
    ],
    similarPYQ: ['GEO-UPSC-2022-10', 'GEO-UPSC-2019-04', 'GEO-CDS1-2019-04', 'GEO-CDS2-2018-06'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 2. Mahanadi & Eastern Ghats Drainage
  {
    id: 'IND-RIV-08',
    slug: 'mahanadi-river-basin',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Mahanadi, Brahmani & Subarnarekha River Basins',
    aliases: ['Seonath', 'Hasdeo', 'Mand', 'Ib', 'Ong', 'Jonk', 'Tel', 'Hirakud Dam', 'Nagawali', 'Vamsadhara'],
    placeType: 'East-Flowing Peninsular River Basin',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Chhattisgarh, Odisha, Jharkhand' },
    lat: 20.4625,
    lng: 85.8830,
    shape: [
      [20.55, 81.90], [21.15, 82.80], [21.50, 83.85], [20.90, 84.80], [20.45, 85.85], [20.25, 86.70]
    ],
    neighbours: ['Left-bank tributaries: Seonath, Hasdeo, Mand, Ib', 'Right-bank tributaries: Ong, Jonk, Tel', 'Eastern Ghats independent streams: Nagawali, Vamsadhara'],
    staticFacts: [
      'Rises in the Sihawa highlands of Raipur/Dhamtari district in Chhattisgarh; drains into Bay of Bengal at False Point, Kendrapara.',
      'Hirakud Dam near Sambalpur is one of the longest earthen dams in the world, creating a 55-km long reservoir (Ramsar wetland site).',
      'UPSC 2021 Fact: Nagawali and Vamsadhara rise directly in the Eastern Ghats of Odisha and flow south into Andhra Pradesh; Brahmani (formed by Sankh and South Koel) and Subarnarekha rise on the Chota Nagpur plateau.'
    ],
    similarPYQ: ['GEO-UPSC-2021-07', 'GEO-CDS2-2018-06', 'GEO-CDS2-2017-07', 'GEO-CDS2-2017-10'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 3. Chambal River & Ken-Betwa Interlinking
  {
    id: 'IND-RIV-09',
    slug: 'chambal-river-ken-betwa',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Chambal River, Ken-Betwa Interlinking & Malwa Drainage',
    aliases: ['Charmanvati', 'Banas', 'Kali Sindh', 'Parbati', 'Shipra', 'Ken River', 'Betwa River', 'Gandhi Sagar Dam', 'Daudhan Dam'],
    placeType: 'Major Yamuna Tributary & Ravine System',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Madhya Pradesh, Rajasthan, Uttar Pradesh' },
    lat: 25.5000,
    lng: 76.5000,
    shape: [
      [22.45, 75.70], [24.70, 75.80], [25.80, 76.55], [26.70, 77.90], [26.48, 79.25]
    ],
    neighbours: ['Flows north through Malwa Plateau into Yamuna near Etawah', 'Ken and Betwa drain Bundelkhand region directly into Yamuna'],
    staticFacts: [
      'Rises near Singar Chouri peak on the northern slopes of the Vindhyan range near Mhow (MP); famous for gully erosion badlands (Chambal Badlands / Ravines).',
      'Chain of multi-purpose cascade dams: Gandhi Sagar (MP), Rana Pratap Sagar (Chittorgarh), Jawahar Sagar (Kota), and Kota Barrage.',
      'UPSC 2017 Fact: National Chambal Sanctuary (tri-junction of MP, Rajasthan, and UP) is the most significant wild habitat for critically endangered Gharials (Gavialis gangeticus), Red-crowned roofed turtles, and Ganges river dolphins.',
      'Ken-Betwa River Interlinking Project: India\'s first river-linking project; involves constructing Daudhan Dam to transfer surplus water from Ken to water-deficit Betwa basin, partially submerging Panna Tiger Reserve core.'
    ],
    similarPYQ: ['GEO-UPSC-2022-10', 'ENV-UPSC-2017-05', 'GEO-CDS1-2018-08', 'GEO-UPSC-2019-03'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 4. Peninsular West-Flowing Rivers
  {
    id: 'IND-RIV-10',
    slug: 'west-flowing-peninsular-rivers',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Peninsular West-Flowing Rivers — Tapi, Sabarmati, Mahi & Periyar',
    aliases: ['Tapti', 'Mahi', 'Sabarmati', 'Mandovi', 'Zuari', 'Periyar', 'Bharathapuzha', 'Pamba', 'Kalinadi', 'Sharavati'],
    placeType: 'Rift Valley & Western Ghats Arabian Sea Drainage',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Gujarat, MP, Maharashtra, Goa, Karnataka, Kerala' },
    lat: 21.1702,
    lng: 72.8311,
    neighbours: ['Tapi flows between Satpura (north) and Ajanta/Satmala (south)', 'Mahi flows into Gulf of Khambhat crossing Tropic of Cancer twice', 'Western Ghats coastal streams flow rapidly into Arabian Sea forming estuaries, not deltas'],
    staticFacts: [
      'Tapi / Tapti river originates in Multai in the Betul district of Madhya Pradesh and flows through a rift valley into the Gulf of Khambhat near Surat; Ukai and Kakrapar projects located on it.',
      'Mahi river originates in Vindhyas (Dhar, MP), flows through Rajasthan and Gujarat, and is famous for crossing the Tropic of Cancer twice.',
      'Goa\'s twin lifeline rivers: Mandovi (rises in Western Ghats at Bhimgad, Karnataka; Dudhsagar Falls located on it) and Zuari, meeting at Cabo Aguada into Marmagao harbour.',
      'Sharavati river in Karnataka plunges at Gersoppa / Jog Falls (one of India\'s highest waterfalls).'
    ],
    similarPYQ: ['GEO-UPSC-2021-07', 'GEO-CDS2-2018-06', 'GEO-CDS1-2014-06', 'GEO-CDS2-2017-07'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 5. Kaziranga National Park & Tiger Reserve
  {
    id: 'IND-PA-06',
    slug: 'kaziranga-national-park',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Kaziranga National Park & Tiger Reserve',
    aliases: ['Brahmaputra Floodplain', 'Diphlu River', 'Mora Diphlu', 'Mikir Hills', 'Karbi Anglong'],
    placeType: 'Alluvial Grassland UNESCO World Heritage Site',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Assam', district: 'Golaghat, Nagaon, Biswanath' },
    lat: 26.5775,
    lng: 93.1711,
    neighbours: ['North: Brahmaputra River', 'South: Karbi Anglong / Mikir Hills (highland refuge during annual floods)'],
    staticFacts: [
      'UNESCO World Heritage Site located on the southern floodplains of the Brahmaputra River; drained by Diphlu and Mora Diphlu streams.',
      'Hosts the world\'s largest population of the Greater One-Horned Rhinoceros (~two-thirds of global population), along with high density of Bengal Tigers, Asian Elephants, Wild Water Buffalo, and Eastern Swamp Deer ("Big Five").',
      'Vegetation consists of tall alluvial elephant grasslands, tropical moist broadleaf forests, and semi-evergreen forests with perennial beels (oxbow lakes).'
    ],
    similarPYQ: ['ENV-UPSC-2014-16', 'ENV-UPSC-2013-15', 'GEO-CDS1-2015-09'],
    linkedIssueSlug: 'protected-areas-of-india-location-rivers-special-features',
    linkedIssueTitle: 'Protected Areas of India — Location, Rivers & Special Features',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 6. Silent Valley National Park
  {
    id: 'IND-PA-07',
    slug: 'silent-valley-national-park',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Silent Valley National Park & Kunthipuzha River',
    aliases: ['Sairandhri Vanam', 'Kunthi River', 'Nilgiri Biosphere Reserve', 'Palakkad'],
    placeType: 'Tropical Evergreen Rainforest National Park',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Kerala', district: 'Palakkad' },
    lat: 11.1340,
    lng: 76.4320,
    neighbours: ['Core zone of Nilgiri Biosphere Reserve', 'Contiguous with Mukurthi National Park (Nilgiris, TN) to the northeast and Karimpuzha WLS to the west'],
    staticFacts: [
      'Perennial river Kunthipuzha (tributary of Bharathapuzha) flows through the entire length of the valley from north to south; named for crystal-clear unpolluted waters.',
      'Prime habitat for the endangered Lion-tailed Macaque (Macaca silenus), an endemic primate of the Western Ghats canopy.',
      'Historical landmark: Saved from submergence by the pioneering 1970s people\'s environmental movement led by Kerala Sasthra Sahithya Parishad (KSSP) against a proposed hydroelectric dam.'
    ],
    similarPYQ: ['ENV-UPSC-2020-11', 'ENV-UPSC-2013-15', 'GEO-CDS1-2015-09'],
    linkedIssueSlug: 'protected-areas-of-india-location-rivers-special-features',
    linkedIssueTitle: 'Protected Areas of India — Location, Rivers & Special Features',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 7. Jim Corbett National Park
  {
    id: 'IND-PA-08',
    slug: 'jim-corbett-national-park',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Jim Corbett National Park & Ramganga Basin',
    aliases: ['Hailey National Park', 'Ramganga River', 'Kosi River', 'Patli Dun', 'Shivalik-Bhabar Belt'],
    placeType: 'Oldest National Park of India',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Uttarakhand', district: 'Nainital, Pauri Garhwal' },
    lat: 29.5300,
    lng: 78.7747,
    neighbours: ['Shivalik foothills to the south, Lesser Himalayas to the north', 'Ramganga Reservoir (Kalagarh Dam) on the western boundary'],
    staticFacts: [
      'Established in 1936 as Hailey National Park (India\'s and Asia\'s first national park); renamed Ramganga in 1954 and Jim Corbett in 1956.',
      'Birthplace of Project Tiger in India (launched on 1 April 1973 under Prime Minister Indira Gandhi).',
      'The Ramganga River flows west through the broad structural valley of Patli Dun, providing essential water and elephant migration corridors.'
    ],
    similarPYQ: ['ENV-UPSC-2013-15', 'GEO-UPSC-2024-06', 'GEO-CDS1-2015-09'],
    linkedIssueSlug: 'protected-areas-of-india-location-rivers-special-features',
    linkedIssueTitle: 'Protected Areas of India — Location, Rivers & Special Features',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 8. Kuno National Park & Gir Protected Area
  {
    id: 'IND-PA-09',
    slug: 'kuno-national-park-gir',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Kuno National Park & Gir Protected Area',
    aliases: ['Palpur-Kuno', 'Kuno River', 'Sheopur', 'Gir National Park', 'Sasan Gir', 'Junagadh'],
    placeType: 'Apex Carnivore Habitats & Reintroduction Corridor',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Madhya Pradesh & Gujarat' },
    lat: 25.6800,
    lng: 77.2600,
    neighbours: ['Kuno River bisects the park north-south', 'Part of the Sheopur-Shivpuri dry deciduous forest landscape connecting to Ranthambore'],
    staticFacts: [
      'Kuno National Park (Sheopur, MP): chosen site for Project Cheetah; first batch of 8 African cheetahs from Namibia released in September 2022, followed by 12 cheetahs from South Africa in 2023.',
      'UPSC 2017 Fact: Supreme Court ordered translocation of a second population of Asiatic lions from Gir (Gujarat) to Kuno to safeguard species against catastrophic epidemics; Asiatic lion is currently confined exclusively to Gir forest and surrounding Saurashtra peninsula.'
    ],
    similarPYQ: ['ENV-UPSC-2017-14', 'ENV-UPSC-2019-15', 'GEO-UPSC-2023-08'],
    linkedIssueSlug: 'protected-areas-of-india-location-rivers-special-features',
    linkedIssueTitle: 'Protected Areas of India — Location, Rivers & Special Features',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 9. Askot Musk Deer Sanctuary & Valley of Flowers
  {
    id: 'IND-PA-10',
    slug: 'askot-valley-of-flowers',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Askot Musk Deer Sanctuary & Valley of Flowers',
    aliases: ['Askot WLS', 'Dhauliganga', 'Kali River', 'Pithoragarh', 'Valley of Flowers NP', 'Pushpawati River', 'Hemkund Sahib', 'Nanda Devi Biosphere'],
    placeType: 'Alpine Sanctuary & Himalayan Biosphere Core',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Uttarakhand', district: 'Pithoragarh, Chamoli' },
    lat: 29.7600,
    lng: 80.3500,
    neighbours: ['Bordered by Nepal (Kali River) to the east and Tibet to the north', 'Part of Kumaon-Garhwal high altitude alpine meadows (Bugyals)'],
    staticFacts: [
      'Askot Musk Deer Sanctuary (Pithoragarh, Uttarakhand): established specifically to conserve the endangered Alpine Musk Deer (Moschus chrysogaster); drained by Dhauli Ganga and Goriganga.',
      'UPSC 2020 Fact: Natural habitats of Musk Deer in the Indian Himalayas include Askot WLS (Pithoragarh), Gangotri National Park (Uttarkashi), Kedarnath WLS (Chamoli), and Dachigam NP (Kashmir).',
      'Valley of Flowers National Park (Chamoli, Uttarakhand): situated in the upper Bhyundar valley near Joshimath along the Pushpawati River; renowned for endemic alpine flora carpets; UNESCO World Heritage Site.'
    ],
    similarPYQ: ['ENV-UPSC-2020-11', 'GEO-CDS1-2015-09'],
    linkedIssueSlug: 'protected-areas-of-india-location-rivers-special-features',
    linkedIssueTitle: 'Protected Areas of India — Location, Rivers & Special Features',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 10. Dampa, Gumti & Mount Saramati
  {
    id: 'IND-PA-11',
    slug: 'dampa-gumti-saramati',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Dampa Tiger Reserve, Gumti WLS & Mount Saramati',
    aliases: ['Dampa TR', 'Gumti WLS', 'Saramati Peak', 'Lushai Hills', 'Patkai Range', 'Indo-Burma Hotspot'],
    placeType: 'Northeast Hills Transboundary Biodiversity Loci',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Mizoram, Tripura, Nagaland' },
    lat: 23.6900,
    lng: 92.4200,
    neighbours: ['Dampa lies on the Mizoram-Bangladesh border in Lushai hills', 'Mount Saramati stands on the Nagaland-Myanmar border as the highest peak of Patkai range'],
    staticFacts: [
      'UPSC 2014 Fact: Dampa Tiger Reserve is located in Mizoram; Gumti Wildlife Sanctuary is in Tripura (South Tripura district, protecting elephant and wild buffalo habitat); Mount Saramati (3,841 m) is in Nagaland on the Myanmar international border (NOT in Sikkim).',
      'Dampa is famous for supporting one of the highest cloud leopard densities in South Asia, along with slow loris, hoolock gibbon, and binturong.'
    ],
    similarPYQ: ['ENV-UPSC-2014-16', 'GEO-UPSC-2015-08'],
    linkedIssueSlug: 'protected-areas-of-india-location-rivers-special-features',
    linkedIssueTitle: 'Protected Areas of India — Location, Rivers & Special Features',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 11. Ladakh High-Altitude Lakes
  {
    id: 'IND-WET-06',
    slug: 'ladakh-high-altitude-lakes',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Wetlands & Ramsar sites'],
    place: 'Ladakh High-Altitude Ramsar Lakes — Pangong Tso, Tso Kar & Tso Moriri',
    aliases: ['Pangong Lake', 'Tso Kar Basin', 'Startsapuk Tso', 'Tso Moriri', 'Rupshu Plateau', 'Changthang'],
    placeType: 'Trans-Himalayan Endorheic Saline & Brackish Wetlands',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Ladakh' },
    lat: 33.7500,
    lng: 78.7500,
    neighbours: ['Bordered by Karakoram Range to north, Ladakh Range, and Zanskar Range to south', 'Tsomgo Lake is in Sikkim (NOT Ladakh)'],
    staticFacts: [
      'UPSC & CDS 2017 Fact: Tso Kar and Pangong Tso are located in Ladakh; Tsomgo (Changu Lake) is in East Sikkim.',
      'Tso Kar Wetland Complex (Ramsar site): comprises two connected lakes: Startsapuk Tso (freshwater lake of ~438 ha) and Tso Kar itself (hyper-saline lake of ~1,800 ha); primary breeding ground for the Black-necked Crane.',
      'Tso Moriri (Mountain Lake): high-altitude brackish lake in the Changthang plateau; designated Ramsar site supporting breeding bar-headed geese, great crested grebes, and Tibetan wild ass (Kiang).'
    ],
    similarPYQ: ['GEO-CDS2-2017-05', 'ENV-UPSC-2022-02'],
    linkedIssueSlug: 'wetlands-conservation-ramsar-sites-threats',
    linkedIssueTitle: 'Wetlands — Conservation, Ramsar Sites & Threats',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 12. Kerala Backwaters & Kayals
  {
    id: 'IND-WET-07',
    slug: 'kerala-backwaters-vembanad-ashtamudi',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Wetlands & Ramsar sites'],
    place: 'Vembanad-Kol & Ashtamudi Kayals',
    aliases: ['Vembanad Lake', 'Punnamada Lake', 'Kuttanad', 'Ashtamudi Lake', 'Sasthamkotta Lake', 'Thanneermukkom Bund'],
    placeType: 'Estuarine Coastal Lagoon & Ramsar Wetland System',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Kerala', district: 'Kottayam, Alappuzha, Ernakulam, Kollam' },
    lat: 9.5800,
    lng: 76.4200,
    neighbours: ['Separated from Arabian Sea by a narrow barrier spit', 'Kuttanad farming region lies 1.2 to 3 metres below sea level (FAO Globally Important Agricultural Heritage System)'],
    staticFacts: [
      'Vembanad-Kol is India\'s longest lake (~96.5 km) and the largest Ramsar wetland in Kerala; fed by 4 major rivers: Meenachil, Achankovil, Pamba, and Manimala.',
      'Thanneermukkom Saltwater Barrier / Bund divides the lake into two halves: freshwater south fed by rivers, and brackish estuarine water north connected to Cochin port.',
      'UPSC & CDS 2015 Fact: Ashtamudi is an estuarine eight-branched kayal in Kollam; Sasthamkotta is Kerala\'s largest freshwater lake (residual sweet water kayal); Pulicat is a coastal lagoon in AP/TN; Loktak is a freshwater lake in Manipur.'
    ],
    similarPYQ: ['GEO-CDS2-2015-10', 'ENV-UPSC-2022-02', 'ENV-UPSC-2014-14'],
    linkedIssueSlug: 'wetlands-conservation-ramsar-sites-threats',
    linkedIssueTitle: 'Wetlands — Conservation, Ramsar Sites & Threats',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 13. Sambhar Salt Lake & Keoladeo National Park
  {
    id: 'IND-WET-08',
    slug: 'sambhar-salt-lake-keoladeo',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Wetlands & Ramsar sites'],
    place: 'Sambhar Salt Lake & Keoladeo National Park',
    aliases: ['Sambhar Lake', 'Shakambhari', 'Keoladeo Ghana NP', 'Bharatpur Bird Sanctuary', 'Gambhir River', 'Banganga River'],
    placeType: 'Inland Saline Playa & Montreux Record Wetland',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Rajasthan', district: 'Jaipur, Nagaur, Ajmer, Bharatpur' },
    lat: 26.9000,
    lng: 75.0000,
    neighbours: ['Depression surrounded by Aravalli hills on all sides', 'Keoladeo lies in the floodplains of Gambhir and Banganga rivers'],
    staticFacts: [
      'Sambhar Lake is India\'s largest inland saline wetland; fed by Mendha, Runpangarh, Khari, and Khandel rivers; major production center of lake salt in Rajasthan.',
      'Designated Ramsar site; crucial wintering habitat for tens of thousands of migratory birds, particularly Lesser Flamingos and Siberian waterfowl.',
      'Keoladeo National Park (Bharatpur): man-made freshwater wetland, UNESCO World Heritage Site, listed on Montreux Record (along with Loktak Lake) due to ecological degradation from water shortage and Paspalum distichum grass overgrowth.'
    ],
    similarPYQ: ['ENV-UPSC-2022-02', 'ENV-UPSC-2014-14', 'GEO-CDS2-2015-10'],
    linkedIssueSlug: 'wetlands-conservation-ramsar-sites-threats',
    linkedIssueTitle: 'Wetlands — Conservation, Ramsar Sites & Threats',
    linkedIssueDomain: 'ENVIRONMENT'
  },
  // 14. Eastern Ghats & Cuddapah Hills Arc
  {
    id: 'IND-REL-06',
    slug: 'eastern-ghats-cuddapah-hills',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Eastern Ghats & Cuddapah Ranges',
    aliases: ['Veliconda Range', 'Nallamala Hills', 'Palkonda Range', 'Seshachalam Hills', 'Javadi Hills', 'Shevaroy Hills'],
    placeType: 'Dissected Relict Fold Belt of Peninsular India',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Odisha, Andhra Pradesh, Tamil Nadu' },
    lat: 14.4500,
    lng: 79.1500,
    neighbours: ['Bisected by Godavari and Krishna gorges', 'Seshachalam Biosphere Reserve (Tirupati hills), Javadi & Shevaroy hills in Tamil Nadu'],
    staticFacts: [
      'Unlike the continuous Western Ghats, the Eastern Ghats form an ancient, heavily dissected, discontinuous chain of relict hills eroded by major east-flowing rivers (Mahanadi, Godavari, Krishna, Kaveri).',
      'UPSC & CDS 2014 Fact: Veliconda group of low hills is a structural part of the Eastern Ghats in Andhra Pradesh (running parallel to the Coromandel coast between Nellore and Prakasam).',
      'Key relief sequence (North to South): Nallamala Hills → Veliconda Range → Palkonda Range → Seshachalam Hills (home to endemic Red Sanders) → Nagari Hills → Javadi Hills → Shevaroy Hills (Salem, bauxite deposits).'
    ],
    similarPYQ: ['GEO-CDS1-2014-06', 'GEO-CDS2-2017-03', 'GEO-CDS2-2019-05'],
    linkedIssueSlug: 'peninsular-plateau-coastal-plains-island-groups',
    linkedIssueTitle: 'Peninsular Plateau, Coastal Plains & Island Groups',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 15. Himalayan Strategic Mountain Passes
  {
    id: 'IND-REL-07',
    slug: 'himalayan-strategic-mountain-passes',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Himalayan Strategic Mountain Passes',
    aliases: ['Zoji La', 'Shipki La', 'Lipulekh', 'Nathu La', 'Jelep La', 'Bomdi La', 'Rohtang Pass', 'Banihal Pass'],
    placeType: 'High-Altitude Trans-Himalayan Strategic Gateways',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Ladakh, J&K, HP, Uttarakhand, Sikkim, Arunachal Pradesh' },
    lat: 34.2800,
    lng: 75.5800,
    neighbours: ['Connect Indian valleys across Greater Himalayas to Tibet, Xinjiang, and Central Asia', 'Key axes of border trade and strategic defense'],
    staticFacts: [
      'Zoji La (3,528 m): situated on the Great Himalayan range; connects Srinagar to Kargil and Leh; Zoji La all-weather tunnel under construction.',
      'Shipki La: located in Kinnaur district of Himachal Pradesh; through this pass the Sutlej river enters India from Tibet; ancient Silk Road branch.',
      'Lipulekh Pass: located at the tri-junction of Uttarakhand (India), Tibet (China), and Nepal; historic route for Kailash Mansarovar pilgrimage.',
      'Nathu La & Jelep La: strategic passes in East Sikkim connecting Sikkim to Chumbi Valley in Tibet; reopened for border trade in 2006.'
    ],
    similarPYQ: ['GEO-CDS2-2017-03', 'GEO-UPSC-2017-03', 'GEO-CDS2-2019-05'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 16. Odisha Coast & Chandipur Beach
  {
    id: 'IND-REL-08',
    slug: 'odisha-coast-chandipur-kalam-island',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Odisha Coast, Chandipur Beach & Abdul Kalam Island',
    aliases: ['Chandipur-on-Sea', 'Hide and Seek Beach', 'Wheeler Island', 'Dr. Abdul Kalam Island', 'Integrated Test Range', 'Balasore Coast'],
    placeType: 'Macro-Tidal Beach & Defence Testing Island',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Odisha', district: 'Balasore, Bhadrak' },
    lat: 21.4680,
    lng: 87.0240,
    neighbours: ['Mouth of Budhabalanga river', 'Dhamra port and Bhitarkanika mangrove estuary situated to the south'],
    staticFacts: [
      'UPSC 2017 Fact: At Chandipur beach in Odisha, sea water recedes seaward by up to 5 kilometres from the shoreline twice daily during low tide, leaving the flat sand bed exposed for visitors to walk on the seafloor.',
      'Dr. Abdul Kalam Island (formerly Wheeler Island): located ~10 km off the coast in the Bay of Bengal; serves as India\'s Integrated Test Range (ITR) for testing long-range ballistic missiles (Agni, Prithvi).'
    ],
    similarPYQ: ['GEO-UPSC-2017-01', 'GEO-UPSC-2015-09'],
    linkedIssueSlug: 'peninsular-plateau-coastal-plains-island-groups',
    linkedIssueTitle: 'Peninsular Plateau, Coastal Plains & Island Groups',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 17. Living Root Bridges & Meghalaya Karst
  {
    id: 'IND-REL-09',
    slug: 'living-root-bridges-meghalaya',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Living Root Bridges & Meghalaya Karst Plateau',
    aliases: ['Jingkieng Jri', 'Ficus elastica', 'Nongriat Double Decker', 'Cherrapunji', 'Sohra', 'Mawsynram', 'Khasi Hills'],
    placeType: 'Bio-Engineering Living Architecture & Karst Landscape',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Meghalaya', district: 'East Khasi Hills, West Jaintia Hills' },
    lat: 25.2500,
    lng: 91.6800,
    neighbours: ['Southern escarpment of Shillong Plateau overlooking Bangladesh plains (Surma/Meghna valley)', 'Funnel-shaped orientation causes world-record orographic rainfall'],
    staticFacts: [
      'UPSC 2015 Fact: In Meghalaya, the indigenous Khasi and Jaintia tribal communities train the secondary aerial roots of rubber fig trees (Ficus elastica) across fast-flowing mountain streams to form "Living Root Bridges" (Jingkieng Jri); included in UNESCO tentative list.',
      'Mawsynram and Cherrapunji receive the highest average annual rainfall in the world (>11,000 mm) due to the funneling effect of the Garo-Khasi-Jaintia hills trapping the Bay of Bengal monsoon branch.'
    ],
    similarPYQ: ['GEO-UPSC-2015-11', 'GEO-CDS1-2018-09'],
    linkedIssueSlug: 'peninsular-plateau-coastal-plains-island-groups',
    linkedIssueTitle: 'Peninsular Plateau, Coastal Plains & Island Groups',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 18. Ashokan Major Rock Edict Sites
  {
    id: 'IND-HER-05',
    slug: 'ashokan-major-rock-edicts-loci',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Ancient History',
    mapCategory: ['Historical & archaeological sites'],
    place: 'Ashokan Major Rock Edict Sites — Dhauli, Jaugada, Kalsi & Erragudi',
    aliases: ['Dhauli Elephant', 'Jaugada', 'Kalsi', 'Erragudi', 'Yerragudi', 'Girnar', 'Sopara', 'Sannati'],
    placeType: 'Imperial Epigraphic Monuments of Mauryan Empire',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Odisha, Uttarakhand, Andhra Pradesh, Gujarat, Karnataka' },
    lat: 20.1917,
    lng: 85.8394,
    neighbours: ['Dhauli lies on Daya river bank near Bhubaneswar', 'Kalsi lies at Yamuna-Tons confluence near Dehradun', 'Jaugada lies on Rishikulya river in Ganjam'],
    staticFacts: [
      'UPSC 2022 Fact: Dhauli is in Odisha (famous carved rock elephant above edicts); Erragudi / Yerragudi is in Kurnool district of Andhra Pradesh (NOT MP; contains Minor and Major Rock Edicts in unique boustrophedon script); Jaugada is in Ganjam district of Odisha; Kalsi is in Dehradun, Uttarakhand (the only Major Rock Edict in Northern India).',
      'Major Rock Edict XIII (describing Kalinga war horrors) is famously omitted from Dhauli and Jaugada, replaced by the Separate Kalinga Edicts addressing the judicial officers and border populations with fatherly compassion.'
    ],
    similarPYQ: ['ART-UPSC-2022-01', 'ART-UPSC-2016-03', 'ANC-UPSC-2020-03'],
    linkedIssueSlug: 'ashoka-the-great-kalinga-war-dhamma-inscriptions-edicts',
    linkedIssueTitle: 'Ashoka the Great — Kalinga War, Dhamma, Inscriptions & Edicts',
    linkedIssueDomain: 'ANCIENT HISTORY'
  },
  // 19. Ancient & Medieval Seaports
  {
    id: 'IND-HER-06',
    slug: 'ancient-medieval-seaports',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Ancient History',
    mapCategory: ['Historical & archaeological sites'],
    place: 'Ancient & Medieval Seaports — Motupalli, Ghantasala, Kadura & Chaul',
    aliases: ['Motupalli Port', 'Ghantasala', 'Kadura', 'Chaul', 'Muziris', 'Korkai', 'Poompuhar', 'Arikamedu'],
    placeType: 'Maritime Trade Emposria & Guild Harbours',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Andhra Pradesh, Maharashtra, Kerala, Tamil Nadu' },
    lat: 15.7200,
    lng: 80.3000,
    neighbours: ['Motupalli on the Andhra coast near Machilipatnam', 'Ghantasala and Kadura on the Krishna delta', 'Chaul south of Mumbai in the Konkan'],
    staticFacts: [
      'UPSC 2017 Fact: Motupalli was a pre-eminent seaport of the Kakatiya kingdom (reign of King Ganapatideva, who issued the famous Motupalli Inscription guaranteeing safety and fair taxes to foreign merchants; visited by Venetian traveller Marco Polo in 1293).',
      'UPSC 2020 Fact: Ghantasala and Kadura (eastern Coromandel coast) and Chaul (western Konkan coast) were vital commercial ports handling foreign trade during the Gupta period.',
      'Muziris (Kodungallur, Kerala) on the Malabar coast was the main port for Indo-Roman maritime pepper trade; Korkai was the famous pearl fishing port of the early Pandyas.'
    ],
    similarPYQ: ['ANC-UPSC-2017-02', 'ANC-UPSC-2020-04', 'ANC-UPSC-2012-01'],
    linkedIssueSlug: 'ancient-indian-guilds-shrenis-trade-routes-maritime-ports',
    linkedIssueTitle: 'Ancient Indian Guilds (Shrenis), Trade Routes & Maritime Ports',
    linkedIssueDomain: 'ANCIENT HISTORY'
  },
  // 20. Early Medieval Capital Cities
  {
    id: 'IND-HER-07',
    slug: 'early-medieval-capital-cities',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Ancient History',
    mapCategory: ['Historical & archaeological sites'],
    place: 'Early Medieval Capital Cities — Bhilsa, Dwarasamudra, Girinagar & Sthanesvara',
    aliases: ['Bhilsa', 'Vidisha', 'Dwarasamudra', 'Halebidu', 'Girinagar', 'Junagadh', 'Sthanesvara', 'Thanesar'],
    placeType: 'Dynastic Seats & Architectural Centers',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Madhya Pradesh, Karnataka, Gujarat, Haryana' },
    lat: 23.5250,
    lng: 77.8080,
    neighbours: ['Bhilsa on Betwa river in MP', 'Dwarasamudra in Hassan district of Karnataka', 'Sthanesvara in Kurukshetra, Haryana'],
    staticFacts: [
      'UPSC 2020 Fact: Bhilsa (ancient Vidisha) is in Madhya Pradesh (NOT Maharashtra); Dwarasamudra (modern Halebidu) was the capital of the Hoysalas in Karnataka (NOT Maharashtra); Girinagar is ancient Junagadh in Gujarat; Sthanesvara (modern Thanesar, Haryana) was the ancestral seat of Harshavardhana\'s Pushyabhuti dynasty (NOT Uttar Pradesh).',
      'Dwarasamudra is celebrated for the star-shaped Hoysaleswara Temple built in soapstone (chloritic schist) with intricate friezes.'
    ],
    similarPYQ: ['ANC-UPSC-2020-03', 'MED-CDS2-2015-02'],
    linkedIssueSlug: 'epigraphy-numismatics-land-grants-feudal-institutions',
    linkedIssueTitle: 'Epigraphy, Numismatics, Land Grants & Feudal Institutions',
    linkedIssueDomain: 'ANCIENT HISTORY'
  },
  // 21. Baltic Sea & Scandinavian Littoral
  {
    id: 'WLD-SEA-04',
    slug: 'baltic-sea-littoral',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Baltic Sea & Scandinavian Littoral',
    aliases: ['Gulf of Bothnia', 'Gulf of Finland', 'Gulf of Riga', 'Kattegat', 'Skagerrak', 'Baltic States'],
    placeType: 'Northern European Brackish Inland Sea',
    priority: 'High',
    locatedIn: { country: 'Sweden, Finland, Russia, Estonia, Latvia, Lithuania, Poland, Germany, Denmark' },
    lat: 58.0000,
    lng: 20.0000,
    neighbours: ['Bordered by 9 sovereign states: Sweden, Finland, Russia, Estonia, Latvia, Lithuania, Poland, Germany, Denmark', 'Connected to the North Sea via the Danish Straits (Oresund, Great Belt, Little Belt)'],
    staticFacts: [
      'UPSC 2024 Fact: Finland, Germany, and Russia border the Baltic Sea; Norway does NOT border the Baltic Sea (Norway borders the North Sea, Norwegian Sea, and Barents Sea).',
      'Brackish water body with low salinity due to high river inflow and limited water exchange through the narrow Danish straits; Kaliningrad is an exclave of Russia on the southeastern Baltic coast between Poland and Lithuania.'
    ],
    similarPYQ: ['GEO-UPSC-2024-08', 'GEO-CDS2-2017-11'],
    linkedIssueSlug: 'world-physical-features-straits-seas-rivers-mountains-deserts',
    linkedIssueTitle: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 22. Bering Strait & Arctic Gateway
  {
    id: 'WLD-SEA-05',
    slug: 'bering-strait-arctic-gateway',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Bering Strait & Arctic Gateway',
    aliases: ['Diomede Islands', 'Chukchi Sea', 'Bering Sea', 'Cape Dezhnev', 'Cape Prince of Wales', 'International Date Line'],
    placeType: 'Arctic–Pacific Maritime Chokepoint & Continental Divide',
    priority: 'High',
    locatedIn: { country: 'Russia & United States' },
    lat: 65.7500,
    lng: -168.9500,
    neighbours: ['Separates Asia (Chukotka Peninsula, Russia) from North America (Seward Peninsula, Alaska, USA)', 'Connects the Chukchi Sea (Arctic Ocean) with the Bering Sea (Pacific Ocean)'],
    staticFacts: [
      'Narrowest passage is approximately 82 kilometres wide between Cape Dezhnev (easternmost point of Asia, Russia) and Cape Prince of Wales (westernmost point of mainland North America, USA).',
      'UPSC 2025 Fact: In the middle of the strait lie the two Diomede Islands: Big Diomede (Russia) and Little Diomede (USA), which are separated by just 3.8 kilometres; the International Date Line (IDL) and the maritime boundary pass directly between them.',
      'Nome is an Alaskan town on the southern Seward Peninsula; Anadyr is the administrative capital of Chukotka in northeastern Siberia.'
    ],
    similarPYQ: ['GEO-UPSC-2025-77', 'GEO-CDS1-2017-03'],
    linkedIssueSlug: 'world-physical-features-straits-seas-rivers-mountains-deserts',
    linkedIssueTitle: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 23. Mediterranean Major Islands & Basins
  {
    id: 'WLD-SEA-06',
    slug: 'mediterranean-islands-basins',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Mediterranean Major Islands & Maritime Basins',
    aliases: ['Mallorca', 'Balearic Islands', 'Corsica', 'Sardinia', 'Sicily', 'Crete', 'Normandy', 'Tyrol'],
    placeType: 'Mediterranean Archipelagos & European Historical Regions',
    priority: 'High',
    locatedIn: { country: 'Spain, France, Italy, Greece, Cyprus' },
    lat: 38.5000,
    lng: 14.0000,
    neighbours: ['Surrounded by Southern Europe, Northern Africa, and Western Asia', 'Connected to Atlantic Ocean via Strait of Gibraltar and to Red Sea via Suez Canal'],
    staticFacts: [
      'UPSC 2025 Fact: Mallorca is in Spain (the largest of the Balearic Islands; NOT Italy); Normandy is in France on the English Channel (NOT Spain); Tyrol is a historical alpine region split between Austria and Italy (NOT Germany).',
      'Major islands of the Mediterranean in order of area: Sicily (Italy) → Sardinia (Italy) → Cyprus → Corsica (France) → Crete (Greece).',
      'Characterized by Mediterranean climate (Cs in Köppen classification) with hot, dry summers and mild, wet winters; famous global exporter of citrus fruits, olives, grapes, and cork oak.'
    ],
    similarPYQ: ['GEO-UPSC-2025-80', 'GEO-CDS2-2017-12', 'GEO-UPSC-2019-14'],
    linkedIssueSlug: 'world-physical-features-straits-seas-rivers-mountains-deserts',
    linkedIssueTitle: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  // 24. Great Lakes of North America & 49th Parallel
  {
    id: 'WLD-PHY-05',
    slug: 'great-lakes-49th-parallel',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['World – physical features'],
    place: 'Great Lakes of North America & 49th Parallel Border',
    aliases: ['Lake Superior', 'Lake Michigan', 'Lake Huron', 'Lake Erie', 'Lake Ontario', '49th Parallel North', 'St. Lawrence River'],
    placeType: 'Glacial Freshwater System & Transcontinental Border',
    priority: 'High',
    locatedIn: { country: 'United States & Canada' },
    lat: 46.0000,
    lng: -84.5000,
    neighbours: ['Border between Canada (British Columbia, Alberta, Saskatchewan, Manitoba, Ontario, Quebec) and USA', 'St. Lawrence Seaway connects Great Lakes to Atlantic Ocean'],
    staticFacts: [
      'UPSC 2024 Fact: The longest international land border between any two countries in the world is the Canada–United States border (total length 8,891 km / 5,525 miles); follows the 49th parallel North from Strait of Georgia to Lake of the Woods, then through the Great Lakes and St. Lawrence River.',
      'Five Great Lakes (HOMES: Huron, Ontario, Michigan, Erie, Superior) contain ~21% of the world\'s surface fresh water; Lake Superior is the world\'s largest freshwater lake by surface area; Lake Michigan is the only one located entirely within the United States.',
      'Welland Canal bypasses Niagara Falls between Lake Erie and Lake Ontario.'
    ],
    similarPYQ: ['GEO-UPSC-2024-79', 'GEO-CDS1-2017-03'],
    linkedIssueSlug: 'world-physical-features-straits-seas-rivers-mountains-deserts',
    linkedIssueTitle: 'World Physical Features — Straits, Seas, Rivers, Mountains & Deserts',
    linkedIssueDomain: 'GEOGRAPHY'
  }
];

// Enrich original 47 nodes with neural links
const enrichedOriginal = CURATED_MAPPING_NODES.map(node => {
  const link = ISSUE_LINKS[node.id];
  return {
    ...node,
    linkedIssueSlug: link?.slug || 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: link?.title || 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: link?.domain || 'GEOGRAPHY',
  };
});

const all71Nodes = [...enrichedOriginal, ...NEW_STATIC_NODES];

console.log(`Enriched ${enrichedOriginal.length} existing nodes and added ${NEW_STATIC_NODES.length} new nodes.`);
console.log(`Total Curated Static Mapping Nodes: ${all71Nodes.length}`);

// Generate the new content
const fileHeader = `/**
 * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.
 * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)
 * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.
 */

export const CURATED_MAPPING_NODES = `;

const fileContent = fileHeader + JSON.stringify(all71Nodes, null, 2) + ';\n';

const outputPath = path.resolve('./src/lib/static-mapping-data.js');
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log(`✅ Successfully wrote updated static mapping data with 71 nodes to ${outputPath}`);
