/**
 * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.
 * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)
 * and a single primary mapCategory so folders never cross-contaminate.
 */

export const CURATED_MAPPING_NODES = [
  // ===========================================================================
  // 1A. INDIA STATIC MAPPING — RIVERS & DRAINAGE SYSTEMS (Strictly Rivers)
  // ===========================================================================
  {
    id: 'IND-RIV-01',
    slug: 'ganga-river',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Ganga River',
    aliases: ['Bhagirathi', 'Alaknanda', 'Mandakini', 'Ramganga', 'Yamuna', 'Son', 'Gomti', 'Ghaghara', 'Gandak', 'Kosi', 'Hooghly', 'Padma'],
    placeType: 'Himalayan River System',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Uttarakhand, UP, Bihar, WB' },
    lat: 25.3176,
    lng: 82.9739,
    shape: [
      [30.92, 78.95], [30.14, 78.60], [29.95, 78.16], [27.90, 78.05],
      [26.45, 80.33], [25.43, 81.88], [25.32, 82.97], [25.60, 85.14],
      [25.25, 87.00], [24.80, 87.92], [23.90, 88.25], [21.95, 88.80]
    ],
    neighbours: ['Left-bank (W→E): Ramganga, Gomti, Ghaghara, Gandak, Kosi, Mahananda', 'Right-bank: Yamuna, Tamsa, Son, Punpun'],
    staticFacts: [
      'Formed at Devprayag by the confluence of Bhagirathi (Gangotri Glacier) and Alaknanda (Satopanth Glacier).',
      'UPSC 2024 Sequence downstream of Prayagraj (West to East): Gomti → Ghaghara → Gandak → Kosi.',
      'Son River rises near Amarkantak and joins the Ganga directly on its right bank near Patna (CDS 2020).'
    ],
    similarPYQ: [
      'GEO-UPSC-2026-11',
      'GEO-UPSC-2024-06',
      'GEO-UPSC-2023-07',
      'GEO-CDS1-2020-05',
      'GEO-UPSC-2019-04',
      'GEO-CDS1-2019-04',
      'GEO-CDS1-2018-08',
      'ENV-UPSC-2013-15'
    ]
  },
  {
    id: 'IND-RIV-02',
    slug: 'indus-river',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Indus River',
    aliases: ['Sindhu', 'Singi Khamban', 'Jhelum', 'Chenab', 'Ravi', 'Beas', 'Sutlej', 'Zaskar', 'Zanskar', 'Shyok', 'Gilgit'],
    placeType: 'Antecedent Himalayan River System',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Ladakh, J&K, HP, Punjab' },
    lat: 34.1526,
    lng: 77.5771,
    shape: [
      [31.25, 81.35], [32.70, 79.40], [34.15, 77.58], [34.60, 76.10],
      [35.75, 74.60], [34.00, 72.70], [31.50, 70.90], [28.40, 69.70], [24.10, 67.45]
    ],
    neighbours: ['Flows NW between Ladakh Range (North) and Zanskar Range (South)', 'Tributaries: Jhelum, Chenab, Ravi, Beas, Sutlej, Shyok, Nubra, Zanskar'],
    staticFacts: [
      'Originates near Bokhar Chu glacier (Kailash Range, Tibet) as Singi Khamban; enters India at Demchok (Ladakh).',
      'UPSC 2021 Exact Trap: Jhelum and Ravi join Chenab; Beas joins Sutlej at Harike; Chenab joins Sutlej (Panjnad) to pour into the Indus directly.',
      'UPSC 2026 Rigvedic Names: Vitasta (Jhelum), Asikni (Chenab), Parushni (Ravi), Vipasha (Beas), Shutudri (Sutlej).'
    ],
    similarPYQ: [
      'ANC-UPSC-2026-13',
      'GEO-UPSC-2026-25',
      'GEO-UPSC-2026-11',
      'GEO-CDS1-2023-10',
      'GEO-UPSC-2023-07',
      'GEO-UPSC-2021-05',
      'GEO-UPSC-2020-03',
      'GEO-UPSC-2019-04',
      'ENV-UPSC-2014-09'
    ]
  },
  {
    id: 'IND-RIV-03',
    slug: 'brahmaputra-river',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Brahmaputra River',
    aliases: ['Yarlung Tsangpo', 'Tsangpo', 'Siang', 'Dihang', 'Dibang', 'Kameng', 'Lohit', 'Subansiri', 'Teesta', 'Jamuna'],
    placeType: 'Trans-Himalayan Antecedent River',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Arunachal Pradesh, Assam' },
    lat: 26.5775,
    lng: 93.1711,
    shape: [
      [30.50, 82.20], [29.40, 87.50], [29.20, 92.00], [29.65, 95.30],
      [28.10, 95.33], [27.50, 94.80], [26.58, 93.17], [26.18, 91.75],
      [25.95, 89.95], [24.20, 89.75]
    ],
    neighbours: ['Right-bank (W→E): Teesta, Sankosh, Manas, Kameng, Subansiri', 'Left-bank: Dibang, Lohit, Burhi Dihing, Dhansiri, Kopili'],
    staticFacts: [
      'Originates in Chemayungdung/Angsi Glacier (Tibet) as Yarlung Tsangpo; makes a sharp syntaxial U-turn around Namcha Barwa (UPSC 2011 & 2022) to enter Arunachal Pradesh as Siang/Dihang.',
      'UPSC 2016 & 2014: Dibang, Kameng, Lohit, and Subansiri are major tributaries flowing through Arunachal Pradesh (Barak flows through Manipur/Mizoram/Assam, NOT Arunachal Pradesh).',
      'CDS 2016 West-to-East Tributary Order: Teesta (Tista) → Sankosh → Subansiri → Lohit.',
      'UPSC 2017: Teesta originates in Sikkim (Pahunri/Zemu glacier, NOT Tibet) and joins the Brahmaputra (Jamuna) directly in Bangladesh.'
    ],
    similarPYQ: [
      'GEO-UPSC-2026-25',
      'GEO-UPSC-2022-04',
      'GEO-CDS2-2022-07',
      'GEO-UPSC-2017-04',
      'GEO-UPSC-2016-04',
      'GEO-CDS1-2016-07',
      'GEO-UPSC-2014-06',
      'ENV-UPSC-2013-15',
      'GEO-UPSC-2011-09'
    ]
  },
  {
    id: 'IND-RIV-04',
    slug: 'godavari-river',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Godavari River',
    aliases: ['Dakshin Ganga', 'Vridha Ganga', 'Pranhita', 'Indravati', 'Manjira', 'Wainganga', 'Penganga', 'Wardha', 'Sabari', 'Pattiseema', 'Asmaka'],
    placeType: 'Peninsular River System',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Maharashtra, Telangana, Andhra Pradesh' },
    lat: 17.0005,
    lng: 81.8040,
    shape: [
      [19.93, 73.53], [19.15, 77.31], [18.80, 79.90], [17.70, 81.10], [16.98, 81.78], [16.50, 82.25]
    ],
    neighbours: ['Left-bank: Purna, Pranhita (Wainganga+Penganga+Wardha), Indravati, Sabari', 'Right-bank: Pravara, Manjira'],
    staticFacts: [
      'Largest Peninsular river system (1,465 km); rises at Trimbakeshwar (Nashik district, Western Ghats).',
      'UPSC 2015 Exact Question: Indravati and Pranahita are major left-bank tributaries of Godavari (Vamsadhara and Pennar are independent east-flowing rivers).',
      'UPSC 2016: Godavari and Krishna rivers were linked via the Pattiseema Lift Irrigation Project; Ancient Mahajanapada Asmaka was located on the banks of the Godavari (UPSC 2025).'
    ],
    similarPYQ: [
      'ANC-UPSC-2025-17',
      'GEO-CDS1-2017-08',
      'GEO-UPSC-2016-03',
      'GEO-UPSC-2016-01',
      'GEO-UPSC-2015-07'
    ]
  },
  {
    id: 'IND-RIV-05',
    slug: 'narmada-river',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Narmada River',
    aliases: ['Rewa', 'Nerbudda', 'Dhuandhar', 'Bhedaghat', 'Omkareshwar', 'Mandhata'],
    placeType: 'West-Flowing Rift Valley River',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Madhya Pradesh, Maharashtra, Gujarat' },
    lat: 22.6708,
    lng: 76.0000,
    shape: [
      [22.67, 81.75], [23.12, 79.93], [22.75, 77.72], [22.20, 75.50], [21.83, 73.72], [21.70, 72.98]
    ],
    neighbours: ['Vindhya Range (North)', 'Satpura Range (South)', 'Amarkantak Plateau (Origin)'],
    staticFacts: [
      'Originates at Amarkantak Plateau (Maikal Range, MP) and flows westward in a linear rift valley between the Vindhyas and Satpuras (UPSC 2013).',
      'Forms Dhuandhar Falls at Bhedaghat near Jabalpur (Mahakoshal region, NOT Malwa — UPSC 2024) and houses the Omkareshwar island shrine (Mandhata hills — UPSC 2015).'
    ],
    similarPYQ: [
      'GEO-UPSC-2024-09',
      'GEO-UPSC-2023-09',
      'GEO-UPSC-2016-03',
      'GEO-UPSC-2015-10',
      'GEO-UPSC-2013-11'
    ]
  },
  {
    id: 'IND-RIV-06',
    slug: 'kaveri-river',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Kaveri (Cauvery) River',
    aliases: ['Cauvery', 'Ponni', 'Hemavati', 'Kabini', 'Bhavani', 'Noyyal', 'Amaravati', 'Srirangam'],
    placeType: 'Peninsular River System',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Karnataka, Tamil Nadu' },
    lat: 10.8200,
    lng: 78.6900,
    shape: [[12.38, 75.49], [12.42, 76.57], [11.79, 77.80], [10.82, 78.69], [11.14, 79.85]],
    neighbours: ['Left-bank: Hemavati, Shimsha, Arkavathi', 'Right-bank: Kabini, Bhavani, Noyyal, Amaravati'],
    staticFacts: [
      'Rises at Talakaveri (Brahmagiri Hills, Kodagu, Karnataka), forms Sivasamudram and Hogenakkal falls, passes Tiruchirappalli (Srirangam Island — UPSC 2019), and empties into the Bay of Bengal at Poompuhar.',
      'Protected Areas in Cauvery Basin (UPSC 2020): Nagarhole NP, Bandipur TR, Sathyamangalam TR, and Wayanad WLS (Papikonda is on Godavari).'
    ],
    similarPYQ: [
      'GEO-UPSC-2022-03',
      'ENV-UPSC-2020-13',
      'ENV-UPSC-2019-09',
      'GEO-UPSC-2019-02',
      'ART-CDS2-2017-02',
      'GEO-UPSC-2016-01',
      'ENV-UPSC-2013-15'
    ]
  },

  // ===========================================================================
  // 1A. INDIA STATIC MAPPING — RELIEF, HILLS, COASTS & ISLANDS
  // ===========================================================================
  {
    id: 'IND-REL-01',
    slug: 'siachen-glacier-karakoram',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Siachen Glacier (Karakoram Range)',
    placeType: 'Karakoram Glacier',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Ladakh' },
    lat: 35.4213,
    lng: 77.1095,
    neighbours: ['North of Nubra Valley', 'East of Leh', 'West of Aksai Chin (Saltoro Ridge to West)'],
    staticFacts: [
      'UPSC 2020 Exact Question: Situated strictly to the NORTH of Nubra Valley (and East of Leh, West of Aksai Chin) in the eastern Karakoram range.',
      'Source of the Nubra River (UPSC 2019), which joins the Shyok River (tributary of Indus); accessed via Khardung La pass (CDS 2021).'
    ],
    similarPYQ: [
      'GEO-CDS2-2021-05',
      'GEO-UPSC-2020-03',
      'GEO-UPSC-2019-04',
      'GEO-CDS2-2018-03'
    ]
  },
  {
    id: 'IND-REL-02',
    slug: 'aravalli-range',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Aravalli Range',
    placeType: 'Relict Fold Mountain Range',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Gujarat, Rajasthan, Haryana, Delhi' },
    lat: 24.6500,
    lng: 73.0000,
    shape: [[23.90, 72.50], [24.65, 73.00], [26.45, 74.63], [27.90, 76.20], [28.55, 77.15]],
    neighbours: ['Thar Desert & Saline Playas (Didwana, Kuchaman, Sambhar)', 'Luni & Banas river basins'],
    staticFacts: [
      'One of the world\'s oldest fold mountains (Pre-Cambrian); highest peak is Guru Shikhar (1,722m) on Mount Abu.',
      'Luni originates in the Pushkar valley of the Aravallis and terminates in the Rann of Kutch; Banas is a tributary of Chambal (NOT Luni — CDS 2018).',
      'Playa lakes along the Aravalli fringe include Sambhar, Didwana, Kuchaman, Sargol, and Khatu (UPSC 2021).'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-09',
      'GEO-UPSC-2021-06',
      'GEO-CDS2-2018-02'
    ]
  },
  {
    id: 'IND-REL-03',
    slug: 'amarkantak-maikal-hills',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Amarkantak & Maikal Hills',
    placeType: 'Radial Drainage Plateau',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Madhya Pradesh & Chhattisgarh Border' },
    lat: 22.6700,
    lng: 81.7500,
    neighbours: ['Eastern fulcrum of Satpura Range', 'Source of Narmada (West) and Son (North-East)'],
    staticFacts: [
      'Forms the eastern link of the Satpura system (Rajpipla → Mahadeo → Maikal); NOT at the confluence of Vindhya and Sahyadri (UPSC 2023).',
      'Classic example of radial drainage in India: Narmada flows west, Son flows north-east directly into Ganga (CDS 2020), and Johilla flows north.'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-09',
      'GEO-CDS1-2020-05',
      'GEO-UPSC-2013-11'
    ]
  },
  {
    id: 'IND-REL-04',
    slug: 'nilgiri-annamalai-cardamom-hills',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Nilgiri, Annamalai & Cardamom Hills',
    placeType: 'Western–Eastern Ghats Tri-Junction',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Tamil Nadu, Kerala, Karnataka' },
    lat: 11.4102,
    lng: 76.6950,
    shape: [[15.30, 74.10], [13.20, 75.20], [11.41, 76.70], [10.15, 77.06], [8.50, 77.25]],
    neighbours: ['Palghat Gap (between Nilgiris & Annamalai)', 'Shencottah Gap (between Annamalai & Cardamom)'],
    staticFacts: [
      'Western Ghats are spread across 6 states (Gujarat, Maharashtra, Goa, Karnataka, Kerala, Tamil Nadu — NOT 5 states, UPSC 2017) and meet the Eastern Ghats at the Nilgiri Hills (Doddabetta, 2,637m).',
      'Anamudi (2,695m, in Annamalai/Eravikulam, Kerala) is the highest peak in Peninsular India.',
      'Cardamom Hills lie on the Kerala–Tamil Nadu border (NOT Coromandel Coast — UPSC 2014).'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-09',
      'ENV-UPSC-2019-16',
      'GEO-UPSC-2017-02',
      'ENV-UPSC-2017-11',
      'GEO-UPSC-2014-03'
    ]
  },
  {
    id: 'IND-REL-05',
    slug: 'barren-island-ten-degree-channel',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Barren Island & Ten Degree Channel',
    placeType: 'Active Volcano & Island Channel',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Andaman & Nicobar Islands' },
    lat: 12.2667,
    lng: 93.8500,
    neighbours: ['Narcondam Island (Dormant volcano to North)', 'Ten Degree Channel (10°N between Little Andaman & Car Nicobar)'],
    staticFacts: [
      'Barren Island (~140 km NE of Port Blair) is India\'s ONLY active volcano (UPSC 2018).',
      'Ten Degree Channel separates Little Andaman from Car Nicobar (UPSC 2014, CDS 2021, CDS 2022).',
      'Mount Thullier (642m) is the highest peak of the Nicobar Islands, located on Great Nicobar (CDS 2022); Saddle Peak is in North Andaman.'
    ],
    similarPYQ: [
      'GEO-CDS1-2022-11',
      'GEO-CDS1-2022-14',
      'GEO-CDS2-2022-12',
      'GEO-CDS1-2021-10',
      'GEO-UPSC-2018-04',
      'ENV-UPSC-2015-04',
      'GEO-UPSC-2014-02',
      'GEO-UPSC-2014-04'
    ]
  },

  // ===========================================================================
  // 1A. INDIA STATIC MAPPING — PROTECTED AREAS (NPs, WLS, TIGER RESERVES)
  // ===========================================================================
  {
    id: 'IND-PA-01',
    slug: 'keibul-lamjao-loktak-lake',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Keibul Lamjao National Park (Loktak Lake)',
    placeType: 'Floating National Park & Montreux Ramsar Site',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Manipur (Bishnupur)' },
    lat: 24.5000,
    lng: 93.7800,
    neighbours: ['Manipur River / Imphal Valley', 'Phumdis floating vegetation'],
    staticFacts: [
      'UPSC 2015 Exact Question: World\'s ONLY floating National Park, characterized by floating heterogeneous mass of vegetation/soil called Phumdis.',
      'Last natural refuge of the endangered Brow-antlered Deer (Sangai); Loktak Lake is on the Montreux Record alongside Keoladeo (UPSC 2014).'
    ],
    similarPYQ: [
      'GEO-CDS1-2023-06',
      'ENV-UPSC-2015-07',
      'ENV-UPSC-2014-07'
    ]
  },
  {
    id: 'IND-PA-02',
    slug: 'namdapha-national-park',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Namdapha National Park',
    placeType: 'Tiger Reserve & Biodiversity Hotspot',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Arunachal Pradesh (Changlang)' },
    lat: 27.4900,
    lng: 96.3900,
    neighbours: ['Noa-Dihing River', 'Between Dapha Bum (Mishmi Hills) and Patkai Range'],
    staticFacts: [
      'UPSC 2015 Exact Question: Altitudinal variation from 200m to >4,500m gives it a climate ranging from tropical and subtropical to temperate and arctic.',
      'Only park in the world to harbour all four major feline species: Tiger, Leopard, Snow Leopard, and Clouded Leopard.'
    ],
    similarPYQ: [
      'ENV-UPSC-2019-17',
      'ENV-UPSC-2018-09',
      'ENV-UPSC-2015-08'
    ]
  },
  {
    id: 'IND-PA-03',
    slug: 'sathyamangalam-tiger-reserve',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Sathyamangalam Tiger Reserve',
    placeType: 'Tiger Reserve (Western–Eastern Ghats Link)',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Tamil Nadu (Erode)' },
    lat: 11.5000,
    lng: 77.2400,
    neighbours: ['Moyar & Bhavani Rivers (Cauvery Basin)', 'Connects Mudumalai–Bandipur with Biligirirangan Hills'],
    staticFacts: [
      'UPSC 2017 Exact Question: Crucial ecological link between the Western Ghats and the Eastern Ghats.',
      'Lies inside the Cauvery River basin alongside Nagarhole, Bandipur, and Wayanad (UPSC 2020).'
    ],
    similarPYQ: [
      'ENV-UPSC-2020-13',
      'ENV-UPSC-2017-11',
      'ENV-UPSC-2012-11'
    ]
  },
  {
    id: 'IND-PA-04',
    slug: 'desert-national-park-jaisalmer',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Desert National Park',
    placeType: 'Arid Ecosystem National Park',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Rajasthan (Jaisalmer & Barmer)' },
    lat: 26.8167,
    lng: 70.5167,
    neighbours: ['Thar Desert', 'Sudasari Great Indian Bustard Breeding Centre'],
    staticFacts: [
      'UPSC 2020 Exact Fact: Spread over TWO districts (Jaisalmer and Barmer); contains human habitations/villages inside the park.',
      'One of the most important natural habitats of the Critically Endangered Great Indian Bustard.'
    ],
    similarPYQ: [
      'ENV-UPSC-2020-14'
    ]
  },
  {
    id: 'IND-PA-05',
    slug: 'kanha-national-park',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Protected areas (NPs, WLS, tiger reserves)'],
    place: 'Kanha National Park & Tiger Reserve',
    placeType: 'Maikal Hills Tiger Reserve',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Madhya Pradesh (Mandla & Balaghat)' },
    lat: 22.3345,
    lng: 80.6115,
    neighbours: ['Maikal Range (Satpuras)', 'Banjar and Halon river valleys'],
    staticFacts: [
      'UPSC 2020 Exact Question: Well-known for saving the Hard-ground Barasingha (sub-species of Indian swamp deer that thrives exclusively on hard ground) from extinction.'
    ],
    similarPYQ: [
      'ENV-UPSC-2026-32',
      'ENV-UPSC-2020-05',
      'GEO-CDS2-2017-01'
    ]
  },

  // ===========================================================================
  // 1A. INDIA STATIC MAPPING — WETLANDS, RAMSAR SITES & LAKES
  // ===========================================================================
  {
    id: 'IND-WET-01',
    slug: 'chilika-lake-ramsar',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Wetlands & Ramsar sites'],
    place: 'Chilika Lake & Bhitarkanika Mangroves',
    placeType: 'Brackish Lagoon & Mangrove Ramsar Complex',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Odisha' },
    lat: 19.7166,
    lng: 85.3166,
    neighbours: ['Daya River (Chilika)', 'Brahmani & Baitarani confluence (Bhitarkanika)'],
    staticFacts: [
      'Chilika Lake is Asia\'s largest brackish water lagoon and India\'s first Ramsar site (1981); removed from Montreux Record in 2002.',
      'Bhitarkanika (UPSC 2011, 2012, 2023) is formed at the confluence of the Brahmani (South Koel + Sankh in Jharkhand) and Baitarani rivers; famous for Saltwater Crocodiles.'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-08',
      'ENV-UPSC-2015-07',
      'ENV-UPSC-2014-07',
      'ENV-UPSC-2012-11',
      'GEO-UPSC-2011-11'
    ]
  },
  {
    id: 'IND-WET-02',
    slug: 'wular-lake-kashmir',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['Wetlands & Ramsar sites'],
    place: 'Wular Lake & Hokera Wetland',
    placeType: 'Tectonic Freshwater Lake & Ramsar Site',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Jammu & Kashmir' },
    lat: 34.3600,
    lng: 74.5600,
    neighbours: ['Fed directly by Jhelum River', 'Hokera Wetland near Srinagar'],
    staticFacts: [
      'UPSC 2023 Exact Fact: India\'s largest freshwater lake of tectonic origin; Jhelum River flows directly through Wular Lake.',
      'UPSC 2022 Exact Trap: Hokera Wetland is located in Jammu & Kashmir (NOT Punjab).'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-07',
      'ENV-UPSC-2022-01'
    ]
  },
  {
    id: 'IND-WET-03',
    slug: 'kolleru-pulicat-lakes',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['Wetlands & Ramsar sites'],
    place: 'Kolleru Lake & Pulicat Lagoon',
    placeType: 'East Coast Inter-Deltaic & Barrier Lakes',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Andhra Pradesh & Tamil Nadu Border' },
    lat: 16.6300,
    lng: 81.2100,
    neighbours: ['Kolleru: Between Godavari & Krishna deltas', 'Pulicat: Sriharikota Barrier Island'],
    staticFacts: [
      'UPSC 2023 Exact Trap: Kolleru is a natural freshwater lake (UPSC 2018) between the Godavari and Krishna deltas fed by Budameru and Tammileru streams (Krishna River does NOT directly feed Kolleru Lake).',
      'UPSC 2017 Fact: Pulicat Lagoon straddles two states (Andhra Pradesh & Tamil Nadu) and is separated from the Bay of Bengal by Sriharikota Island.'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-07',
      'GEO-CDS1-2023-06',
      'GEO-UPSC-2018-03',
      'GEO-UPSC-2017-02'
    ]
  },
  {
    id: 'IND-WET-04',
    slug: 'harike-wetland-punjab',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Wetlands & Ramsar sites'],
    place: 'Harike Wetland',
    placeType: 'River Confluence Ramsar Site',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Punjab (Tarn Taran / Ferozepur)' },
    lat: 31.1500,
    lng: 74.9667,
    neighbours: ['Exact confluence of Beas and Sutlej Rivers', 'Headworks of Indira Gandhi Canal'],
    staticFacts: [
      'UPSC 2014 Exact Match: Man-made riverine wetland located at the confluence of the Beas and Sutlej rivers (Keoladeo is at the confluence of Gambhir and Banganga, NOT Banas and Chambal).'
    ],
    similarPYQ: [
      'GEO-UPSC-2021-05',
      'ENV-UPSC-2014-09'
    ]
  },
  {
    id: 'IND-WET-05',
    slug: 'renuka-wetland-himachal',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Environment',
    mapCategory: ['Wetlands & Ramsar sites'],
    place: 'Renuka Wetland',
    placeType: 'Smallest Ramsar Site in India',
    priority: 'Medium',
    locatedIn: { country: 'India', stateOrProvince: 'Himachal Pradesh (Sirmaur)' },
    lat: 30.6086,
    lng: 77.4547,
    neighbours: ['Giri River (Yamuna basin)'],
    staticFacts: [
      'UPSC 2022 Exact Match: India\'s smallest Ramsar Wetland (20 hectares), located in Sirmaur district of Himachal Pradesh (Rudrasagar Lake is in Tripura; Bhoj Wetland is in MP).'
    ],
    similarPYQ: [
      'ENV-UPSC-2026-32',
      'ENV-UPSC-2022-01',
      'ENV-UPSC-2019-18'
    ]
  },

  // ===========================================================================
  // 1A. INDIA STATIC MAPPING — PORTS, MINERALS, ENERGY & HERITAGE SITES
  // ===========================================================================
  {
    id: 'IND-PORT-01',
    slug: 'kamarajar-ennore-port',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['Ports, highways & corridors'],
    place: 'Kamarajar (Ennore) Port',
    placeType: 'Corporate Major Port',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Tamil Nadu (Coromandel Coast)' },
    lat: 13.2625,
    lng: 80.3414,
    neighbours: ['24 km north of Chennai Port', 'Pulicat Lagoon to the north'],
    staticFacts: [
      'UPSC 2023 Exact Fact: First major port in India registered as a public company under the Companies Act.'
    ],
    similarPYQ: [
      'GEO-UPSC-2026-24',
      'GEO-UPSC-2023-11',
      'GEO-CDS2-2015-12'
    ]
  },
  {
    id: 'IND-PORT-02',
    slug: 'mundra-kandla-ports-kutch',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['Ports, highways & corridors'],
    place: 'Mundra & Deendayal (Kandla) Ports',
    placeType: 'Private Commercial & Tidal Major Ports',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Gujarat (Gulf of Kutch)' },
    lat: 22.8394,
    lng: 69.7219,
    neighbours: ['Gulf of Kutch', 'Kandla Free Trade Zone'],
    staticFacts: [
      'Mundra Port (UPSC 2023): India\'s largest privately owned port and largest container-handling port by volume.',
      'Deendayal Port (Kandla — CDS 2023): Major tidal port at the head of the Gulf of Kutch.'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-11',
      'GEO-CDS1-2023-14',
      'GEO-CDS1-2023-11'
    ]
  },
  {
    id: 'IND-PORT-03',
    slug: 'visakhapatnam-port',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['Ports, highways & corridors'],
    place: 'Visakhapatnam Port',
    placeType: 'Deepest Landlocked Natural Harbour',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Andhra Pradesh' },
    lat: 17.6868,
    lng: 83.2185,
    neighbours: ['Protected by Dolphin\'s Nose hill promontory'],
    staticFacts: [
      'CDS 2023 & UPSC 2023 Fact: Deepest landlocked and well-protected natural harbour on the East Coast (protected by Dolphin\'s Nose promontory; NOT the largest container port).'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-11',
      'GEO-CDS1-2023-14',
      'GEO-UPSC-2014-10'
    ]
  },
  {
    id: 'IND-MIN-01',
    slug: 'jaduguda-singhbhum-uranium-belt',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['Minerals & resources by place'],
    place: 'Jaduguda & Singhbhum Uranium–Copper Belt',
    placeType: 'Strategic Atomic Mineral Belt',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Jharkhand (East Singhbhum)' },
    lat: 22.6500,
    lng: 86.3500,
    neighbours: ['Subarnarekha River (Hundru Falls)', 'Narwapahar, Turamdih, Bagjata mines'],
    staticFacts: [
      'Jaduguda is India\'s first operational uranium mine (Singhbhum Thrust Belt, Jharkhand); Hundru Falls is on the Subarnarekha River in Chota Nagpur (UPSC 2024).',
      'Other major uranium sites: Tummalapalle (Kadapa, AP — stratified dolomite uranium reserve) and Domiasiat (Meghalaya).'
    ],
    similarPYQ: [
      'GEO-UPSC-2024-09',
      'GEO-UPSC-2023-10',
      'GEO-UPSC-2020-04',
      'GEO-CDS1-2016-08',
      'GEO-UPSC-2013-14',
      'GEO-UPSC-2013-15'
    ]
  },
  {
    id: 'IND-MIN-02',
    slug: 'chavara-kollam-monazite-ilmenite-coast',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['Minerals & resources by place'],
    place: 'Chavara–Manavalakurichi Coastal Placer Sands',
    placeType: 'Thorium (Monazite) & Titanium (Ilmenite/Rutile) Tract',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Kerala & Tamil Nadu Coast' },
    lat: 8.9940,
    lng: 76.5360,
    neighbours: ['Ashtamudi Lake (Kollam)', 'IREL Rare Earths Plant'],
    staticFacts: [
      'Ilmenite and Rutile in coastal beach sands are rich sources of Titanium (UPSC 2023).',
      'Monazite sands contain Thorium (~8–10% ThO2) and Rare Earth Elements; processing is restricted to government entities (IREL — UPSC 2022).'
    ],
    similarPYQ: [
      'GEO-UPSC-2025-06',
      'GEO-UPSC-2023-12',
      'GEO-UPSC-2022-05'
    ]
  },
  {
    id: 'IND-HER-01',
    slug: 'dholavira-kutch-harappan-site',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Ancient History',
    mapCategory: ['Historical & archaeological sites'],
    place: 'Dholavira (Khadir Bet)',
    placeType: 'Harappan UNESCO World Heritage Site',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Gujarat (Rann of Kutch)' },
    lat: 23.8866,
    lng: 70.2122,
    neighbours: ['Luni Basin', 'Lies directly on the Tropic of Cancer'],
    staticFacts: [
      'UPSC 2021 Exact Question: Renowned for its elaborate rock-cut water harvesting and reservoir management system (fed by Manhar and Mansar streams) and tripartite town layout.'
    ],
    similarPYQ: [
      'ART-UPSC-2024-65',
      'ART-UPSC-2021-05'
    ]
  },
  {
    id: 'IND-HER-02',
    slug: 'kanaganahalli-sannati-stupa',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Art & Culture',
    mapCategory: ['Historical & archaeological sites'],
    place: 'Kanaganahalli (Sannati Buddhist Site)',
    placeType: 'Mauryan–Satavahana Buddhist Stupa',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Karnataka (Kalaburagi)' },
    lat: 16.8200,
    lng: 76.9100,
    neighbours: ['Situated on the left bank of the Bhima River (Krishna tributary)'],
    staticFacts: [
      'UPSC 2019 & CDS 2023 Exact Question: Located on the bank of the Bhima River; yielded the famous sculpted portrait slab bearing the Brahmi inscription "Ranyo Ashoka" (King Ashoka).'
    ],
    similarPYQ: [
      'ART-CDS1-2023-01',
      'ART-UPSC-2019-02'
    ]
  },
  {
    id: 'IND-HER-03',
    slug: 'besnagar-sanchi-vidisha',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Art & Culture',
    mapCategory: ['Historical & archaeological sites'],
    place: 'Besnagar (Vidisha) & Sanchi',
    placeType: 'Mauryan–Shunga Archaeological Complex',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Madhya Pradesh' },
    lat: 23.5270,
    lng: 77.8080,
    neighbours: ['Confluence of Betwa and Bes rivers', 'Udayagiri Caves (Gupta period)'],
    staticFacts: [
      'UPSC 2023 Exact Fact: Besnagar (ancient Vidisha) is famous for the Vaishnavite Heliodorus Pillar (Garuda Dhwaja) erected by Greek ambassador Heliodorus — NOT a Shaivite cave shrine.',
      'Sanchi Stupa (UPSC 2013, 2019) is located 10 km from Vidisha.'
    ],
    similarPYQ: [
      'ART-UPSC-2023-01',
      'ART-UPSC-2016-02',
      'ART-UPSC-2013-03'
    ]
  },
  {
    id: 'IND-HER-04',
    slug: 'sittanavasal-cave-pudukkottai',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Art & Culture',
    mapCategory: ['Historical & archaeological sites'],
    place: 'Sittanavasal Cave (Arivar Koil)',
    placeType: 'Jain Rock-Cut Cave Shrine',
    priority: 'High',
    locatedIn: { country: 'India', stateOrProvince: 'Tamil Nadu (Pudukkottai)' },
    lat: 10.4560,
    lng: 78.7250,
    neighbours: ['Cauvery–Vaigai cultural belt'],
    staticFacts: [
      'UPSC 2023 Exact Fact: Famous 2nd-century BCE to 9th-century CE Jain rock-cut monastery and cave temple known for Pandyan fresco paintings (Samavasarana lotus pond).'
    ],
    similarPYQ: [
      'ART-UPSC-2026-37',
      'ART-UPSC-2023-01',
      'ART-UPSC-2016-01',
      'ART-UPSC-2013-02'
    ]
  },

  // ===========================================================================
  // 1B. WORLD STATIC MAPPING
  // ===========================================================================
  {
    id: 'WLD-PHY-01',
    slug: 'congo-river-basin',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['World – physical features'],
    place: 'Congo Basin & Katanga Cobalt Belt',
    placeType: 'Equatorial Basin & Tropical Peatland',
    priority: 'High',
    locatedIn: { country: 'DRC, Republic of Congo, Cameroon, CAR, Gabon, Eq. Guinea' },
    lat: -1.5000,
    lng: 18.5000,
    shape: [
      [-11.0, 29.5], [-8.0, 26.5], [-4.0, 24.5], [-1.0, 23.5],
      [0.5, 19.5], [-1.5, 16.5], [-4.3, 15.3], [-6.0, 12.4]
    ],
    neighbours: ['Lake Tanganyika (East)', 'Katanga Copper–Cobalt Plateau (South)'],
    staticFacts: [
      'UPSC 2024 Exact Question: Houses the Cuvette Centrale, the world\'s largest tropical peatland storing ~3 years of global fossil carbon.',
      'UPSC 2023 Exact Question: Congo Basin includes DRC, Republic of the Congo, Cameroon, Central African Republic, Gabon, and Equatorial Guinea (NOT Nigeria, Uganda, or South Sudan); DRC produces ~75% of global Cobalt.'
    ],
    similarPYQ: [
      'ENV-UPSC-2024-16',
      'GEO-UPSC-2023-01',
      'GEO-UPSC-2023-13'
    ]
  },
  {
    id: 'WLD-PHY-02',
    slug: 'nile-river-victoria-tana',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['World – physical features'],
    place: 'Nile River, Lake Victoria & Lake Turkana',
    placeType: 'East African Rift & Nile System',
    priority: 'High',
    locatedIn: { country: 'Uganda, Kenya, Ethiopia, South Sudan, Sudan, Egypt' },
    lat: 15.5881,
    lng: 32.5342,
    shape: [[0.3, 33.0], [4.9, 31.5], [9.5, 31.6], [15.6, 32.5], [18.0, 33.9], [24.0, 32.9], [30.0, 31.2], [31.5, 30.4]],
    neighbours: ['White Nile + Blue Nile meet at Khartoum', 'Lake Turkana (Jade Sea in Kenya) & Lake Tanganyika'],
    staticFacts: [
      'White Nile originates at Lake Victoria (crossed by the Equator; bordered by Kenya, Uganda, Tanzania — UPSC 2011 & 2025).',
      'UPSC 2026 Exact Question: Lake Turkana ("Jade Sea" in the Kenyan Rift Valley) is the world\'s largest permanent desert lake and a UNESCO World Heritage Site.'
    ],
    similarPYQ: [
      'GEO-UPSC-2026-39',
      'GEO-UPSC-2025-23',
      'GEO-UPSC-2011-02'
    ]
  },
  {
    id: 'WLD-PHY-03',
    slug: 'mekong-river',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['World – physical features'],
    place: 'Mekong River & Tonlé Sap Lake',
    placeType: 'Southeast Asian Transboundary River',
    priority: 'High',
    locatedIn: { country: 'China, Myanmar, Laos, Thailand, Cambodia, Vietnam' },
    lat: 15.1200,
    lng: 105.8000,
    shape: [
      [33.5, 94.5], [29.0, 98.6], [22.0, 100.8], [19.9, 102.1],
      [17.9, 102.6], [15.1, 105.8], [11.5, 104.9], [9.8, 106.5]
    ],
    neighbours: ['Tonle Sap Lake (Cambodia — UPSC 2025)', 'Drains into South China Sea'],
    staticFacts: [
      'UPSC 2020 Exact Question: Rises in Tibetan Plateau (alongside Brahmaputra and Irrawaddy — UPSC 2011), flows through 6 countries, and drains into the South China Sea (NOT Andaman Sea).'
    ],
    similarPYQ: [
      'GEO-UPSC-2025-23',
      'GEO-UPSC-2020-06',
      'GEO-UPSC-2014-14',
      'GEO-UPSC-2011-09'
    ]
  },
  {
    id: 'WLD-PHY-04',
    slug: 'andes-mountains-lithium-triangle',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['Landforms & volcanoes'],
    place: 'Andes Cordillera & Tungurahua Volcano',
    placeType: 'Continental Fold Cordillera & Volcanic Arc',
    priority: 'High',
    locatedIn: { country: 'Venezuela, Colombia, Ecuador, Peru, Bolivia, Chile, Argentina' },
    lat: -18.5000,
    lng: -68.5000,
    shape: [
      [10.5, -73.2], [4.6, -74.1], [-1.2, -78.5], [-9.5, -77.5],
      [-16.5, -68.1], [-23.5, -67.4], [-32.8, -70.0], [-41.5, -72.3]
    ],
    neighbours: ['Atacama Desert (West)', 'Tungurahua & Cotopaxi Volcanoes (Ecuador)'],
    staticFacts: [
      'UPSC 2024 & 2025 Exact Questions: Andes are young fold mountains passing through 7 South American countries: Venezuela, Colombia, Ecuador, Peru, Bolivia, Chile, and Argentina (do NOT pass through Brazil or Paraguay).',
      'UPSC 2026 Exact Question: Tungurahua Volcano (declared a UNESCO Global Geopark) is located in the Andes of Ecuador.'
    ],
    similarPYQ: [
      'GEO-UPSC-2026-31',
      'GEO-UPSC-2025-22',
      'GEO-UPSC-2024-10',
      'GEO-CDS2-2020-12',
      'GEO-UPSC-2013-01'
    ]
  },
  {
    id: 'WLD-MIN-01',
    slug: 'lithium-triangle-katanga-mineral-belts',
    pillar: 'STATIC',
    regionScope: 'World',
    subject: 'Geography',
    mapCategory: ['Minerals & resources by place'],
    place: 'Global Strategic Mineral Belts (Chile Lithium, DRC Cobalt, Orinoco)',
    placeType: 'Critical Mineral & Energy Reserves',
    priority: 'High',
    locatedIn: { country: 'Chile, Bolivia, Argentina, Botswana, Indonesia, Venezuela' },
    lat: -23.5000,
    lng: -68.2000,
    neighbours: ['Salar de Atacama (Chile)', 'Salar de Uyuni (Bolivia)', 'Orinoco Belt (Venezuela)'],
    staticFacts: [
      'UPSC 2025 Exact Match: Botswana is rich in Diamonds, Chile in Lithium (Salar de Atacama), and Indonesia in Nickel.',
      'UPSC 2024 Exact Fact: Venezuela holds the world\'s largest proven crude oil reserves (Orinoco Belt & Lake Maracaibo); DRC holds ~75% of global Cobalt (UPSC 2023).'
    ],
    similarPYQ: [
      'GEO-UPSC-2025-79',
      'GEO-UPSC-2025-06',
      'GEO-UPSC-2024-97',
      'GEO-UPSC-2023-13'
    ]
  },

  // ===========================================================================
  // 3. IR MAPPING — CHOKEPOINTS, SEAS, STRATEGIC PROJECTS & CONFLICT ZONES
  // ===========================================================================
  {
    id: 'WLD-SEA-01',
    slug: 'black-sea-littoral-states',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Black Sea & Kerch–Bosphorus Straits',
    placeType: 'Marginal Inland Sea & Chokepoints',
    priority: 'High',
    locatedIn: { country: 'Ukraine, Russia, Georgia, Turkey, Bulgaria, Romania' },
    lat: 43.3000,
    lng: 34.0000,
    neighbours: ['Sea of Azov (via Kerch Strait)', 'Caucasus Mountains (between Black & Caspian Seas — CDS 2019)'],
    staticFacts: [
      'UPSC 2019 Exact Question: Bordered by 6 countries — Turkey, Russia, Ukraine, Georgia, Bulgaria, and Romania (Croatia borders the Adriatic Sea, NOT Black Sea).',
      'CDS 2020 Fact: Danube, Dnieper, and Don drain into the Black/Azov Sea, whereas Volga drains into the Caspian Sea.'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-18',
      'GEO-CDS1-2020-06',
      'GEO-CDS2-2019-09',
      'GEO-UPSC-2019-06',
      'GEO-UPSC-2014-13'
    ]
  },
  {
    id: 'WLD-SEA-02',
    slug: 'caspian-sea-littoral-states',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Caspian Sea & Aral Sea Basin',
    placeType: 'Endorheic Inland Seas',
    priority: 'High',
    locatedIn: { country: 'Turkmenistan, Azerbaijan, Russia, Iran, Kazakhstan' },
    lat: 41.9000,
    lng: 50.6000,
    neighbours: ['Fed by Volga and Ural rivers from the North', 'Aral Sea (Kazakhstan–Uzbekistan)'],
    staticFacts: [
      'UPSC 2019 & 2020 Fact: Bordered by 5 countries (Mnemonic TARIK: Turkmenistan, Azerbaijan, Russia, Iran, Kazakhstan); Volga River drains into the Caspian Sea.',
      'UPSC 2018 Fact: Aral Sea (between Kazakhstan and Uzbekistan) has shrunk immensely due to diversion of Amu Darya and Syr Darya.'
    ],
    similarPYQ: [
      'IR-UPSC-2025-62',
      'GEO-UPSC-2020-06',
      'GEO-CDS2-2019-09',
      'GEO-UPSC-2019-06',
      'GEO-UPSC-2018-09'
    ]
  },
  {
    id: 'WLD-SEA-03',
    slug: 'red-sea-dead-sea-mediterranean',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Red Sea, Suez–Sumed & Mediterranean Littoral',
    placeType: 'Rift Sea & Strategic Corridor',
    priority: 'High',
    locatedIn: { country: 'Egypt, Sudan, Eritrea, Djibouti, Saudi Arabia, Yemen, Jordan, Israel' },
    lat: 22.0000,
    lng: 38.0000,
    neighbours: ['Suez Canal & Sumed Pipeline (North)', 'Bab-el-Mandeb & Gulf of Aden (South)'],
    staticFacts: [
      'UPSC 2024 Exact Questions: No permanent rivers enter the Red Sea and it receives very little precipitation; the Sumed Pipeline in Egypt connects the Red Sea (Ain Sokhna) with the Mediterranean Sea (Sidi Kerir).',
      'UPSC 2015 & 2017: Jordan does NOT open out to the Mediterranean Sea; Syria does NOT touch the Red Sea.'
    ],
    similarPYQ: [
      'GEO-UPSC-2024-88',
      'GEO-UPSC-2024-89',
      'GEO-UPSC-2022-09',
      'GEO-UPSC-2019-06',
      'GEO-UPSC-2017-07',
      'GEO-UPSC-2015-13'
    ]
  },
  {
    id: 'IR-CHOKE-01',
    slug: 'strait-of-hormuz',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Strait of Hormuz',
    placeType: 'Maritime Energy Chokepoint',
    priority: 'High',
    locatedIn: { country: 'Iran & Oman (Musandam Exclave)' },
    lat: 26.5667,
    lng: 56.2500,
    neighbours: ['Connects Persian Gulf with Gulf of Oman (Arabian Sea)', 'Bahrain, Qatar, Kuwait, UAE, Iraq, Iran inside Persian Gulf'],
    staticFacts: [
      'UPSC 2026 Exact Question: Ships from Persian Gulf states like Bahrain and Qatar must cross the Strait of Hormuz to reach the Indian Ocean.',
      'Separates Iran (North) from Oman\'s Musandam Peninsula exclave and the UAE (South).'
    ],
    similarPYQ: [
      'GEO-UPSC-2026-30',
      'GEO-UPSC-2024-88',
      'IR-UPSC-2017-06'
    ]
  },
  {
    id: 'IR-CHOKE-02',
    slug: 'bab-el-mandeb-strait',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Bab-el-Mandeb Strait & Horn of Africa',
    placeType: 'Red Sea–Aden Chokepoint',
    priority: 'High',
    locatedIn: { country: 'Yemen, Djibouti, Eritrea & Somalia' },
    lat: 12.5833,
    lng: 43.3333,
    neighbours: ['Connects Red Sea with Gulf of Aden', 'Socotra Island & Horn of Africa (SEED: Somalia, Ethiopia, Eritrea, Djibouti)'],
    staticFacts: [
      'Separates Yemen on the Arabian Peninsula from Djibouti and Eritrea on the Horn of Africa.',
      'UPSC 2023 & 2018: Bordered by Yemen and Somalia, both of which have faced prolonged civil strife and famine.'
    ],
    similarPYQ: [
      'GEO-UPSC-2024-88',
      'GEO-UPSC-2024-89',
      'GEO-UPSC-2023-20',
      'GEO-UPSC-2018-10'
    ]
  },
  {
    id: 'IR-CHOKE-03',
    slug: 'strait-of-malacca',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – countries, borders & seas'],
    place: 'Strait of Malacca, Kra Isthmus & South China Sea',
    placeType: 'Indo-Pacific Maritime Chokepoint',
    priority: 'High',
    locatedIn: { country: 'Malaysia, Indonesia (Sumatra) & Singapore' },
    lat: 2.5000,
    lng: 101.8000,
    neighbours: ['Indira Point (Great Nicobar) via Six Degree Channel', 'Scarborough Shoal, Spratly, Paracel & Senkaku Islands'],
    staticFacts: [
      'Connects the Andaman Sea (Indian Ocean) with the South China Sea (Pacific Ocean).',
      'UPSC 2011 Exact Question: Opening a canal across the Kra Isthmus (between Gulf of Siam and Andaman Sea) reduces navigation distance/time between India and East Asia.',
      'UPSC 2017 & 2022: Disputed islands in South/East China Sea include Paracel, Spratly, Scarborough Shoal, and Senkaku (Diaoyu).'
    ],
    similarPYQ: [
      'GEO-UPSC-2022-12',
      'GEO-UPSC-2020-06',
      'GEO-UPSC-2017-06',
      'GEO-UPSC-2014-14',
      'GEO-UPSC-2011-03'
    ]
  },
  {
    id: 'IR-PROJ-01',
    slug: 'chabahar-port-iran',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['Strategic projects abroad'],
    place: 'Chabahar Port & INSTC Corridor',
    placeType: 'Indian Overseas Strategic Port & Corridor',
    priority: 'High',
    locatedIn: { country: 'Iran (Sistan-Baluchestan, Gulf of Oman)' },
    lat: 25.2919,
    lng: 60.6430,
    neighbours: ['170 km west of Gwadar Port (Pakistan)', 'Outside Strait of Hormuz'],
    staticFacts: [
      'UPSC 2017 Exact Question: Iran\'s only oceanic port on the Gulf of Oman; enables India to bypass Pakistan to access Afghanistan and Central Asia.',
      'UPSC 2025 Exact Question: International North-South Transport Corridor (INSTC) connects India to Central Asia and Europe via Iran.'
    ],
    similarPYQ: [
      'IR-UPSC-2025-62',
      'GEO-UPSC-2023-14',
      'IR-UPSC-2017-06'
    ]
  },
  {
    id: 'IR-PROJ-02',
    slug: 'sittwe-port-kaladan-project',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['Strategic projects abroad'],
    place: 'Sittwe Port, Kaladan & Neighbourhood Bridges',
    placeType: 'Act East Connectivity Projects',
    priority: 'High',
    locatedIn: { country: 'Myanmar, Bangladesh & Nepal Border' },
    lat: 20.1500,
    lng: 92.8900,
    neighbours: ['Kaladan River (Myanmar)', 'Maitri Setu (Feni River, Bangladesh)', 'Mechi Bridge (India–Nepal)'],
    staticFacts: [
      'UPSC 2023 Exact Question: India–Myanmar–Thailand Trilateral Highway connects Moreh (Manipur) with Mae Sot (Thailand) via Myanmar.',
      'UPSC 2026 Exact Question: Maitri Setu is built over the Feni River connecting Sabroom (Tripura) with Ramgarh (Bangladesh); Mechi Bridge connects Panitanki (India) with Kakarvitta (Nepal).'
    ],
    similarPYQ: [
      'GEO-UPSC-2026-61',
      'GEO-UPSC-2023-14'
    ]
  },
  {
    id: 'IR-PROJ-03',
    slug: 'agalega-island-mauritius',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['Strategic projects abroad'],
    place: 'Agalega Island (Mauritius)',
    placeType: 'Indian Ocean Maritime Outpost',
    priority: 'High',
    locatedIn: { country: 'Mauritius (Western Indian Ocean)' },
    lat: -10.4000,
    lng: 56.6300,
    neighbours: ['1,100 km north of Mauritius main island', 'Mozambique Channel approach'],
    staticFacts: [
      'Jointly developed 3,000m airstrip and St. James Jetty by India and Mauritius under Vision SAGAR to monitor Western Indian Ocean SLOCs.'
    ],
    similarPYQ: [
      'IR-UPSC-2017-06',
      'IR-UPSC-2016-03'
    ]
  },
  {
    id: 'IR-CONF-01',
    slug: 'donbas-kherson-zaporizhzhia-ukraine',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – places in news'],
    place: 'Donbas, Zaporizhzhia & Kherson (Ukraine)',
    placeType: 'Eastern European Conflict Theatre',
    priority: 'High',
    locatedIn: { country: 'Ukraine' },
    lat: 48.0159,
    lng: 37.8028,
    neighbours: ['Ukraine shares land borders with 7 countries: Poland, Slovakia, Hungary, Romania, Moldova, Belarus, Russia'],
    staticFacts: [
      'UPSC 2023 Exact Questions: Donbas (Donetsk & Luhansk), Kherson, and Zaporizhzhia are located in Ukraine.',
      'Bulgaria and Czech Republic do NOT share a land border with Ukraine (UPSC 2023); Crimea was annexed in 2014 (UPSC 2018).'
    ],
    similarPYQ: [
      'IR-UPSC-2025-21',
      'GEO-UPSC-2023-17',
      'GEO-UPSC-2023-18',
      'GEO-UPSC-2023-21',
      'GEO-UPSC-2018-07'
    ]
  },
  {
    id: 'IR-CONF-02',
    slug: 'tigray-north-kivu-sahel',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – places in news'],
    place: 'Sahel Coup Belt, Tigray (Ethiopia) & North Kivu (DRC)',
    placeType: 'African Geopolitical Flashpoints',
    priority: 'High',
    locatedIn: { country: 'Mali, Burkina Faso, Niger, Chad, Sudan, Ethiopia, DRC' },
    lat: 13.4967,
    lng: 39.4753,
    neighbours: ['Sahel region (south of Sahara)', 'Lake Kivu & Bidibidi Refugee Settlement (Uganda)'],
    staticFacts: [
      'UPSC 2024 & 2023 Exact Questions: Sahel countries (Mali, Burkina Faso, Niger, Chad, Sudan, Guinea) experienced military coups; Tigray is in Ethiopia; North Kivu and Ituri are conflict provinces in Eastern DR Congo.',
      'UPSC 2022 Fact: Bidibidi is a major refugee settlement in north-western Uganda (receiving South Sudanese refugees).'
    ],
    similarPYQ: [
      'GEO-UPSC-2024-91',
      'GEO-UPSC-2023-17',
      'GEO-UPSC-2023-21',
      'GEO-UPSC-2023-22',
      'GEO-UPSC-2022-11',
      'GEO-UPSC-2022-13'
    ]
  },
  {
    id: 'IR-CONF-03',
    slug: 'nagorno-karabakh-south-caucasus',
    pillar: 'IR',
    regionScope: 'World',
    subject: 'International Relations',
    mapCategory: ['World – places in news'],
    place: 'Nagorno-Karabakh, Levant & West Asian Flashpoints',
    placeType: 'Caucasus & Levant Conflict Zones',
    priority: 'High',
    locatedIn: { country: 'Azerbaijan, Armenia, Syria, Iraq, Israel, Palestine' },
    lat: 39.8265,
    lng: 46.7656,
    neighbours: ['South Caucasus (Armenia–Azerbaijan)', 'Levant (Eastern Mediterranean shores)'],
    staticFacts: [
      'UPSC 2023 Fact: Nagorno-Karabakh is in the South Caucasus between Azerbaijan and Armenia (NOT in Mozambique).',
      'UPSC 2022 Fact: "Levant" corresponds to the region along the eastern Mediterranean shores (Syria, Lebanon, Israel, Palestine, Jordan); Anatolia is in Turkey.',
      'UPSC 2018 Fact: Aleppo is in Syria, Kirkuk and Mosul are in Iraq, and Mazar-i-Sharif is in Afghanistan.'
    ],
    similarPYQ: [
      'GEO-UPSC-2023-21',
      'GEO-UPSC-2022-07',
      'GEO-UPSC-2022-08',
      'GEO-UPSC-2022-09',
      'GEO-UPSC-2018-08',
      'GEO-UPSC-2016-05'
    ]
  }
];
