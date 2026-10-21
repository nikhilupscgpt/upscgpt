/**
 * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.
 * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)
 * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.
 */

export const CURATED_MAPPING_NODES = [
  {
    "id": "IND-RIV-01",
    "slug": "ganga-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Ganga River",
    "aliases": [
      "Bhagirathi",
      "Alaknanda",
      "Mandakini",
      "Ramganga",
      "Yamuna",
      "Son",
      "Gomti",
      "Ghaghara",
      "Gandak",
      "Kosi",
      "Hooghly",
      "Padma"
    ],
    "placeType": "Himalayan River System",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand, UP, Bihar, WB"
    },
    "lat": 25.3176,
    "lng": 82.9739,
    "shape": [
      [
        30.92,
        78.95
      ],
      [
        30.14,
        78.6
      ],
      [
        29.95,
        78.16
      ],
      [
        27.9,
        78.05
      ],
      [
        26.45,
        80.33
      ],
      [
        25.43,
        81.88
      ],
      [
        25.32,
        82.97
      ],
      [
        25.6,
        85.14
      ],
      [
        25.25,
        87
      ],
      [
        24.8,
        87.92
      ],
      [
        23.9,
        88.25
      ],
      [
        21.95,
        88.8
      ]
    ],
    "neighbours": [
      "Left-bank (W→E): Ramganga, Gomti, Ghaghara, Gandak, Kosi, Mahananda",
      "Right-bank: Yamuna, Tamsa, Son, Punpun"
    ],
    "staticFacts": [
      "Formed at Devprayag by the confluence of Bhagirathi (Gangotri Glacier) and Alaknanda (Satopanth Glacier).",
      "UPSC 2024 Sequence downstream of Prayagraj (West to East): Gomti → Ghaghara → Gandak → Kosi.",
      "Son River rises near Amarkantak and joins the Ganga directly on its right bank near Patna (CDS 2020)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2026-11",
      "GEO-UPSC-2024-06",
      "GEO-UPSC-2023-07",
      "GEO-CDS1-2020-05",
      "GEO-UPSC-2019-04",
      "GEO-CDS1-2019-04",
      "GEO-CDS1-2018-08",
      "ENV-UPSC-2013-15"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-02",
    "slug": "indus-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Indus River",
    "aliases": [
      "Sindhu",
      "Singi Khamban",
      "Jhelum",
      "Chenab",
      "Ravi",
      "Beas",
      "Sutlej",
      "Zaskar",
      "Zanskar",
      "Shyok",
      "Gilgit"
    ],
    "placeType": "Antecedent Himalayan River System",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Ladakh, J&K, HP, Punjab"
    },
    "lat": 34.1526,
    "lng": 77.5771,
    "shape": [
      [
        31.25,
        81.35
      ],
      [
        32.7,
        79.4
      ],
      [
        34.15,
        77.58
      ],
      [
        34.6,
        76.1
      ],
      [
        35.75,
        74.6
      ],
      [
        34,
        72.7
      ],
      [
        31.5,
        70.9
      ],
      [
        28.4,
        69.7
      ],
      [
        24.1,
        67.45
      ]
    ],
    "neighbours": [
      "Flows NW between Ladakh Range (North) and Zanskar Range (South)",
      "Tributaries: Jhelum, Chenab, Ravi, Beas, Sutlej, Shyok, Nubra, Zanskar"
    ],
    "staticFacts": [
      "Originates near Bokhar Chu glacier (Kailash Range, Tibet) as Singi Khamban; enters India at Demchok (Ladakh).",
      "UPSC 2021 Exact Trap: Jhelum and Ravi join Chenab; Beas joins Sutlej at Harike; Chenab joins Sutlej (Panjnad) to pour into the Indus directly.",
      "UPSC 2026 Rigvedic Names: Vitasta (Jhelum), Asikni (Chenab), Parushni (Ravi), Vipasha (Beas), Shutudri (Sutlej)."
    ],
    "similarPYQ": [
      "ANC-UPSC-2026-13",
      "GEO-UPSC-2026-25",
      "GEO-UPSC-2026-11",
      "GEO-CDS1-2023-10",
      "GEO-UPSC-2023-07",
      "GEO-UPSC-2021-05",
      "GEO-UPSC-2020-03",
      "GEO-UPSC-2019-04",
      "ENV-UPSC-2014-09"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03",
    "slug": "brahmaputra-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Brahmaputra River",
    "aliases": [
      "Yarlung Tsangpo",
      "Tsangpo",
      "Siang",
      "Dihang",
      "Dibang",
      "Kameng",
      "Lohit",
      "Subansiri",
      "Teesta",
      "Jamuna"
    ],
    "placeType": "Trans-Himalayan Antecedent River",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Arunachal Pradesh, Assam"
    },
    "lat": 26.5775,
    "lng": 93.1711,
    "shape": [
      [
        30.5,
        82.2
      ],
      [
        29.4,
        87.5
      ],
      [
        29.2,
        92
      ],
      [
        29.65,
        95.3
      ],
      [
        28.1,
        95.33
      ],
      [
        27.5,
        94.8
      ],
      [
        26.58,
        93.17
      ],
      [
        26.18,
        91.75
      ],
      [
        25.95,
        89.95
      ],
      [
        24.2,
        89.75
      ]
    ],
    "neighbours": [
      "Right-bank (W→E): Teesta, Sankosh, Manas, Kameng, Subansiri",
      "Left-bank: Dibang, Lohit, Burhi Dihing, Dhansiri, Kopili"
    ],
    "staticFacts": [
      "Originates in Chemayungdung/Angsi Glacier (Tibet) as Yarlung Tsangpo; makes a sharp syntaxial U-turn around Namcha Barwa (UPSC 2011 & 2022) to enter Arunachal Pradesh as Siang/Dihang.",
      "UPSC 2016 & 2014: Dibang, Kameng, Lohit, and Subansiri are major tributaries flowing through Arunachal Pradesh (Barak flows through Manipur/Mizoram/Assam, NOT Arunachal Pradesh).",
      "CDS 2016 West-to-East Tributary Order: Teesta (Tista) → Sankosh → Subansiri → Lohit.",
      "UPSC 2017: Teesta originates in Sikkim (Pahunri/Zemu glacier, NOT Tibet) and joins the Brahmaputra (Jamuna) directly in Bangladesh."
    ],
    "similarPYQ": [
      "GEO-UPSC-2026-25",
      "GEO-UPSC-2022-04",
      "GEO-CDS2-2022-07",
      "GEO-UPSC-2017-04",
      "GEO-UPSC-2016-04",
      "GEO-CDS1-2016-07",
      "GEO-UPSC-2014-06",
      "ENV-UPSC-2013-15",
      "GEO-UPSC-2011-09"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04",
    "slug": "godavari-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Godavari River",
    "aliases": [
      "Dakshin Ganga",
      "Vridha Ganga",
      "Pranhita",
      "Indravati",
      "Manjira",
      "Wainganga",
      "Penganga",
      "Wardha",
      "Sabari",
      "Pattiseema",
      "Asmaka"
    ],
    "placeType": "Peninsular River System",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Maharashtra, Telangana, Andhra Pradesh"
    },
    "lat": 17.0005,
    "lng": 81.804,
    "shape": [
      [
        19.93,
        73.53
      ],
      [
        19.15,
        77.31
      ],
      [
        18.8,
        79.9
      ],
      [
        17.7,
        81.1
      ],
      [
        16.98,
        81.78
      ],
      [
        16.5,
        82.25
      ]
    ],
    "neighbours": [
      "Left-bank: Purna, Pranhita (Wainganga+Penganga+Wardha), Indravati, Sabari",
      "Right-bank: Pravara, Manjira"
    ],
    "staticFacts": [
      "Largest Peninsular river system (1,465 km); rises at Trimbakeshwar (Nashik district, Western Ghats).",
      "UPSC 2015 Exact Question: Indravati and Pranahita are major left-bank tributaries of Godavari (Vamsadhara and Pennar are independent east-flowing rivers).",
      "UPSC 2016: Godavari and Krishna rivers were linked via the Pattiseema Lift Irrigation Project; Ancient Mahajanapada Asmaka was located on the banks of the Godavari (UPSC 2025)."
    ],
    "similarPYQ": [
      "ANC-UPSC-2025-17",
      "GEO-CDS1-2017-08",
      "GEO-UPSC-2016-03",
      "GEO-UPSC-2016-01",
      "GEO-UPSC-2015-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-05",
    "slug": "narmada-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Narmada River",
    "aliases": [
      "Rewa",
      "Nerbudda",
      "Dhuandhar",
      "Bhedaghat",
      "Omkareshwar",
      "Mandhata"
    ],
    "placeType": "West-Flowing Rift Valley River",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Maharashtra, Gujarat"
    },
    "lat": 22.6708,
    "lng": 76,
    "shape": [
      [
        22.67,
        81.75
      ],
      [
        23.12,
        79.93
      ],
      [
        22.75,
        77.72
      ],
      [
        22.2,
        75.5
      ],
      [
        21.83,
        73.72
      ],
      [
        21.7,
        72.98
      ]
    ],
    "neighbours": [
      "Vindhya Range (North)",
      "Satpura Range (South)",
      "Amarkantak Plateau (Origin)"
    ],
    "staticFacts": [
      "Originates at Amarkantak Plateau (Maikal Range, MP) and flows westward in a linear rift valley between the Vindhyas and Satpuras (UPSC 2013).",
      "Forms Dhuandhar Falls at Bhedaghat near Jabalpur (Mahakoshal region, NOT Malwa — UPSC 2024) and houses the Omkareshwar island shrine (Mandhata hills — UPSC 2015)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2024-09",
      "GEO-UPSC-2023-09",
      "GEO-UPSC-2016-03",
      "GEO-UPSC-2015-10",
      "GEO-UPSC-2013-11"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-06",
    "slug": "kaveri-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Kaveri (Cauvery) River",
    "aliases": [
      "Cauvery",
      "Ponni",
      "Hemavati",
      "Kabini",
      "Bhavani",
      "Noyyal",
      "Amaravati",
      "Srirangam"
    ],
    "placeType": "Peninsular River System",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka, Tamil Nadu"
    },
    "lat": 10.82,
    "lng": 78.69,
    "shape": [
      [
        12.38,
        75.49
      ],
      [
        12.42,
        76.57
      ],
      [
        11.79,
        77.8
      ],
      [
        10.82,
        78.69
      ],
      [
        11.14,
        79.85
      ]
    ],
    "neighbours": [
      "Left-bank: Hemavati, Shimsha, Arkavathi",
      "Right-bank: Kabini, Bhavani, Noyyal, Amaravati"
    ],
    "staticFacts": [
      "Rises at Talakaveri (Brahmagiri Hills, Kodagu, Karnataka), forms Sivasamudram and Hogenakkal falls, passes Tiruchirappalli (Srirangam Island — UPSC 2019), and empties into the Bay of Bengal at Poompuhar.",
      "Protected Areas in Cauvery Basin (UPSC 2020): Nagarhole NP, Bandipur TR, Sathyamangalam TR, and Wayanad WLS (Papikonda is on Godavari)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2022-03",
      "ENV-UPSC-2020-13",
      "ENV-UPSC-2019-09",
      "GEO-UPSC-2019-02",
      "ART-CDS2-2017-02",
      "GEO-UPSC-2016-01",
      "ENV-UPSC-2013-15"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-REL-01",
    "slug": "siachen-glacier-karakoram",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Siachen Glacier (Karakoram Range)",
    "placeType": "Karakoram Glacier",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Ladakh"
    },
    "lat": 35.4213,
    "lng": 77.1095,
    "neighbours": [
      "North of Nubra Valley",
      "East of Leh",
      "West of Aksai Chin (Saltoro Ridge to West)"
    ],
    "staticFacts": [
      "UPSC 2020 Exact Question: Situated strictly to the NORTH of Nubra Valley (and East of Leh, West of Aksai Chin) in the eastern Karakoram range.",
      "Source of the Nubra River (UPSC 2019), which joins the Shyok River (tributary of Indus); accessed via Khardung La pass (CDS 2021)."
    ],
    "similarPYQ": [
      "GEO-CDS2-2021-05",
      "GEO-UPSC-2020-03",
      "GEO-UPSC-2019-04",
      "GEO-CDS2-2018-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-REL-02",
    "slug": "aravalli-range",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Aravalli Range",
    "placeType": "Relict Fold Mountain Range",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Gujarat, Rajasthan, Haryana, Delhi"
    },
    "lat": 24.65,
    "lng": 73,
    "shape": [
      [
        23.9,
        72.5
      ],
      [
        24.65,
        73
      ],
      [
        26.45,
        74.63
      ],
      [
        27.9,
        76.2
      ],
      [
        28.55,
        77.15
      ]
    ],
    "neighbours": [
      "Thar Desert & Saline Playas (Didwana, Kuchaman, Sambhar)",
      "Luni & Banas river basins"
    ],
    "staticFacts": [
      "One of the world's oldest fold mountains (Pre-Cambrian); highest peak is Guru Shikhar (1,722m) on Mount Abu.",
      "Luni originates in the Pushkar valley of the Aravallis and terminates in the Rann of Kutch; Banas is a tributary of Chambal (NOT Luni — CDS 2018).",
      "Playa lakes along the Aravalli fringe include Sambhar, Didwana, Kuchaman, Sargol, and Khatu (UPSC 2021)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-09",
      "GEO-UPSC-2021-06",
      "GEO-CDS2-2018-02"
    ],
    "linkedIssueSlug": "peninsular-plateau-coastal-plains-island-groups",
    "linkedIssueTitle": "Peninsular Plateau, Coastal Plains & Island Groups",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-REL-03",
    "slug": "amarkantak-maikal-hills",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Amarkantak & Maikal Hills",
    "placeType": "Radial Drainage Plateau",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh & Chhattisgarh Border"
    },
    "lat": 22.67,
    "lng": 81.75,
    "neighbours": [
      "Eastern fulcrum of Satpura Range",
      "Source of Narmada (West) and Son (North-East)"
    ],
    "staticFacts": [
      "Forms the eastern link of the Satpura system (Rajpipla → Mahadeo → Maikal); NOT at the confluence of Vindhya and Sahyadri (UPSC 2023).",
      "Classic example of radial drainage in India: Narmada flows west, Son flows north-east directly into Ganga (CDS 2020), and Johilla flows north."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-09",
      "GEO-CDS1-2020-05",
      "GEO-UPSC-2013-11"
    ],
    "linkedIssueSlug": "peninsular-plateau-coastal-plains-island-groups",
    "linkedIssueTitle": "Peninsular Plateau, Coastal Plains & Island Groups",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-REL-04",
    "slug": "nilgiri-annamalai-cardamom-hills",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Nilgiri, Annamalai & Cardamom Hills",
    "placeType": "Western–Eastern Ghats Tri-Junction",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Tamil Nadu, Kerala, Karnataka"
    },
    "lat": 11.4102,
    "lng": 76.695,
    "shape": [
      [
        15.3,
        74.1
      ],
      [
        13.2,
        75.2
      ],
      [
        11.41,
        76.7
      ],
      [
        10.15,
        77.06
      ],
      [
        8.5,
        77.25
      ]
    ],
    "neighbours": [
      "Palghat Gap (between Nilgiris & Annamalai)",
      "Shencottah Gap (between Annamalai & Cardamom)"
    ],
    "staticFacts": [
      "Western Ghats are spread across 6 states (Gujarat, Maharashtra, Goa, Karnataka, Kerala, Tamil Nadu — NOT 5 states, UPSC 2017) and meet the Eastern Ghats at the Nilgiri Hills (Doddabetta, 2,637m).",
      "Anamudi (2,695m, in Annamalai/Eravikulam, Kerala) is the highest peak in Peninsular India.",
      "Cardamom Hills lie on the Kerala–Tamil Nadu border (NOT Coromandel Coast — UPSC 2014)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-09",
      "ENV-UPSC-2019-16",
      "GEO-UPSC-2017-02",
      "ENV-UPSC-2017-11",
      "GEO-UPSC-2014-03"
    ],
    "linkedIssueSlug": "peninsular-plateau-coastal-plains-island-groups",
    "linkedIssueTitle": "Peninsular Plateau, Coastal Plains & Island Groups",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-REL-05",
    "slug": "barren-island-ten-degree-channel",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Barren Island & Ten Degree Channel",
    "placeType": "Active Volcano & Island Channel",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Andaman & Nicobar Islands"
    },
    "lat": 12.2667,
    "lng": 93.85,
    "neighbours": [
      "Narcondam Island (Dormant volcano to North)",
      "Ten Degree Channel (10°N between Little Andaman & Car Nicobar)"
    ],
    "staticFacts": [
      "Barren Island (~140 km NE of Port Blair) is India's ONLY active volcano (UPSC 2018).",
      "Ten Degree Channel separates Little Andaman from Car Nicobar (UPSC 2014, CDS 2021, CDS 2022).",
      "Mount Thullier (642m) is the highest peak of the Nicobar Islands, located on Great Nicobar (CDS 2022); Saddle Peak is in North Andaman."
    ],
    "similarPYQ": [
      "GEO-CDS1-2022-11",
      "GEO-CDS1-2022-14",
      "GEO-CDS2-2022-12",
      "GEO-CDS1-2021-10",
      "GEO-UPSC-2018-04",
      "ENV-UPSC-2015-04",
      "GEO-UPSC-2014-02",
      "GEO-UPSC-2014-04"
    ],
    "linkedIssueSlug": "peninsular-plateau-coastal-plains-island-groups",
    "linkedIssueTitle": "Peninsular Plateau, Coastal Plains & Island Groups",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PA-01",
    "slug": "keibul-lamjao-loktak-lake",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Keibul Lamjao National Park (Loktak Lake)",
    "placeType": "Floating National Park & Montreux Ramsar Site",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Manipur (Bishnupur)"
    },
    "lat": 24.5,
    "lng": 93.78,
    "neighbours": [
      "Manipur River / Imphal Valley",
      "Phumdis floating vegetation"
    ],
    "staticFacts": [
      "UPSC 2015 Exact Question: World's ONLY floating National Park, characterized by floating heterogeneous mass of vegetation/soil called Phumdis.",
      "Last natural refuge of the endangered Brow-antlered Deer (Sangai); Loktak Lake is on the Montreux Record alongside Keoladeo (UPSC 2014)."
    ],
    "similarPYQ": [
      "GEO-CDS1-2023-06",
      "ENV-UPSC-2015-07",
      "ENV-UPSC-2014-07"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-02",
    "slug": "namdapha-national-park",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Namdapha National Park",
    "placeType": "Tiger Reserve & Biodiversity Hotspot",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Arunachal Pradesh (Changlang)"
    },
    "lat": 27.49,
    "lng": 96.39,
    "neighbours": [
      "Noa-Dihing River",
      "Between Dapha Bum (Mishmi Hills) and Patkai Range"
    ],
    "staticFacts": [
      "UPSC 2015 Exact Question: Altitudinal variation from 200m to >4,500m gives it a climate ranging from tropical and subtropical to temperate and arctic.",
      "Only park in the world to harbour all four major feline species: Tiger, Leopard, Snow Leopard, and Clouded Leopard."
    ],
    "similarPYQ": [
      "ENV-UPSC-2019-17",
      "ENV-UPSC-2018-09",
      "ENV-UPSC-2015-08"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-03",
    "slug": "sathyamangalam-tiger-reserve",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Sathyamangalam Tiger Reserve",
    "placeType": "Tiger Reserve (Western–Eastern Ghats Link)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Tamil Nadu (Erode)"
    },
    "lat": 11.5,
    "lng": 77.24,
    "neighbours": [
      "Moyar & Bhavani Rivers (Cauvery Basin)",
      "Connects Mudumalai–Bandipur with Biligirirangan Hills"
    ],
    "staticFacts": [
      "UPSC 2017 Exact Question: Crucial ecological link between the Western Ghats and the Eastern Ghats.",
      "Lies inside the Cauvery River basin alongside Nagarhole, Bandipur, and Wayanad (UPSC 2020)."
    ],
    "similarPYQ": [
      "ENV-UPSC-2020-13",
      "ENV-UPSC-2017-11",
      "ENV-UPSC-2012-11"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-04",
    "slug": "desert-national-park-jaisalmer",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Desert National Park",
    "placeType": "Arid Ecosystem National Park",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Rajasthan (Jaisalmer & Barmer)"
    },
    "lat": 26.8167,
    "lng": 70.5167,
    "neighbours": [
      "Thar Desert",
      "Sudasari Great Indian Bustard Breeding Centre"
    ],
    "staticFacts": [
      "UPSC 2020 Exact Fact: Spread over TWO districts (Jaisalmer and Barmer); contains human habitations/villages inside the park.",
      "One of the most important natural habitats of the Critically Endangered Great Indian Bustard."
    ],
    "similarPYQ": [
      "ENV-UPSC-2020-14"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-05",
    "slug": "kanha-national-park",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Kanha National Park & Tiger Reserve",
    "placeType": "Maikal Hills Tiger Reserve",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh (Mandla & Balaghat)"
    },
    "lat": 22.3345,
    "lng": 80.6115,
    "neighbours": [
      "Maikal Range (Satpuras)",
      "Banjar and Halon river valleys"
    ],
    "staticFacts": [
      "UPSC 2020 Exact Question: Well-known for saving the Hard-ground Barasingha (sub-species of Indian swamp deer that thrives exclusively on hard ground) from extinction."
    ],
    "similarPYQ": [
      "ENV-UPSC-2026-32",
      "ENV-UPSC-2020-05",
      "GEO-CDS2-2017-01"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-WET-01",
    "slug": "chilika-lake-ramsar",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Wetlands & Ramsar sites"
    ],
    "place": "Chilika Lake & Bhitarkanika Mangroves",
    "placeType": "Brackish Lagoon & Mangrove Ramsar Complex",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha"
    },
    "lat": 19.7166,
    "lng": 85.3166,
    "neighbours": [
      "Daya River (Chilika)",
      "Brahmani & Baitarani confluence (Bhitarkanika)"
    ],
    "staticFacts": [
      "Chilika Lake is Asia's largest brackish water lagoon and India's first Ramsar site (1981); removed from Montreux Record in 2002.",
      "Bhitarkanika (UPSC 2011, 2012, 2023) is formed at the confluence of the Brahmani (South Koel + Sankh in Jharkhand) and Baitarani rivers; famous for Saltwater Crocodiles."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-08",
      "ENV-UPSC-2015-07",
      "ENV-UPSC-2014-07",
      "ENV-UPSC-2012-11",
      "GEO-UPSC-2011-11"
    ],
    "linkedIssueSlug": "wetlands-conservation-ramsar-sites-threats",
    "linkedIssueTitle": "Wetlands — Conservation, Ramsar Sites & Threats",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-WET-02",
    "slug": "wular-lake-kashmir",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "Wetlands & Ramsar sites"
    ],
    "place": "Wular Lake & Hokera Wetland",
    "placeType": "Tectonic Freshwater Lake & Ramsar Site",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Jammu & Kashmir"
    },
    "lat": 34.36,
    "lng": 74.56,
    "neighbours": [
      "Fed directly by Jhelum River",
      "Hokera Wetland near Srinagar"
    ],
    "staticFacts": [
      "UPSC 2023 Exact Fact: India's largest freshwater lake of tectonic origin; Jhelum River flows directly through Wular Lake.",
      "UPSC 2022 Exact Trap: Hokera Wetland is located in Jammu & Kashmir (NOT Punjab)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-07",
      "ENV-UPSC-2022-01"
    ],
    "linkedIssueSlug": "wetlands-conservation-ramsar-sites-threats",
    "linkedIssueTitle": "Wetlands — Conservation, Ramsar Sites & Threats",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-WET-03",
    "slug": "kolleru-pulicat-lakes",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "Wetlands & Ramsar sites"
    ],
    "place": "Kolleru Lake & Pulicat Lagoon",
    "placeType": "East Coast Inter-Deltaic & Barrier Lakes",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Andhra Pradesh & Tamil Nadu Border"
    },
    "lat": 16.63,
    "lng": 81.21,
    "neighbours": [
      "Kolleru: Between Godavari & Krishna deltas",
      "Pulicat: Sriharikota Barrier Island"
    ],
    "staticFacts": [
      "UPSC 2023 Exact Trap: Kolleru is a natural freshwater lake (UPSC 2018) between the Godavari and Krishna deltas fed by Budameru and Tammileru streams (Krishna River does NOT directly feed Kolleru Lake).",
      "UPSC 2017 Fact: Pulicat Lagoon straddles two states (Andhra Pradesh & Tamil Nadu) and is separated from the Bay of Bengal by Sriharikota Island."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-07",
      "GEO-CDS1-2023-06",
      "GEO-UPSC-2018-03",
      "GEO-UPSC-2017-02"
    ],
    "linkedIssueSlug": "wetlands-conservation-ramsar-sites-threats",
    "linkedIssueTitle": "Wetlands — Conservation, Ramsar Sites & Threats",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-WET-04",
    "slug": "harike-wetland-punjab",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Wetlands & Ramsar sites"
    ],
    "place": "Harike Wetland",
    "placeType": "River Confluence Ramsar Site",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Punjab (Tarn Taran / Ferozepur)"
    },
    "lat": 31.15,
    "lng": 74.9667,
    "neighbours": [
      "Exact confluence of Beas and Sutlej Rivers",
      "Headworks of Indira Gandhi Canal"
    ],
    "staticFacts": [
      "UPSC 2014 Exact Match: Man-made riverine wetland located at the confluence of the Beas and Sutlej rivers (Keoladeo is at the confluence of Gambhir and Banganga, NOT Banas and Chambal)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-05",
      "ENV-UPSC-2014-09"
    ],
    "linkedIssueSlug": "wetlands-conservation-ramsar-sites-threats",
    "linkedIssueTitle": "Wetlands — Conservation, Ramsar Sites & Threats",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-WET-05",
    "slug": "renuka-wetland-himachal",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Wetlands & Ramsar sites"
    ],
    "place": "Renuka Wetland",
    "placeType": "Smallest Ramsar Site in India",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Himachal Pradesh (Sirmaur)"
    },
    "lat": 30.6086,
    "lng": 77.4547,
    "neighbours": [
      "Giri River (Yamuna basin)"
    ],
    "staticFacts": [
      "UPSC 2022 Exact Match: India's smallest Ramsar Wetland (20 hectares), located in Sirmaur district of Himachal Pradesh (Rudrasagar Lake is in Tripura; Bhoj Wetland is in MP)."
    ],
    "similarPYQ": [
      "ENV-UPSC-2026-32",
      "ENV-UPSC-2022-01",
      "ENV-UPSC-2019-18"
    ],
    "linkedIssueSlug": "wetlands-conservation-ramsar-sites-threats",
    "linkedIssueTitle": "Wetlands — Conservation, Ramsar Sites & Threats",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PORT-01",
    "slug": "kamarajar-ennore-port",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "Ports, highways & corridors"
    ],
    "place": "Kamarajar (Ennore) Port",
    "placeType": "Corporate Major Port",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Tamil Nadu (Coromandel Coast)"
    },
    "lat": 13.2625,
    "lng": 80.3414,
    "neighbours": [
      "24 km north of Chennai Port",
      "Pulicat Lagoon to the north"
    ],
    "staticFacts": [
      "UPSC 2023 Exact Fact: First major port in India registered as a public company under the Companies Act."
    ],
    "similarPYQ": [
      "GEO-UPSC-2026-24",
      "GEO-UPSC-2023-11",
      "GEO-CDS2-2015-12"
    ],
    "linkedIssueSlug": "transport-network-ports-highways-freight-corridors-waterways",
    "linkedIssueTitle": "Transport Network — Ports, Highways, Freight Corridors & Waterways",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PORT-02",
    "slug": "mundra-kandla-ports-kutch",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "Ports, highways & corridors"
    ],
    "place": "Mundra & Deendayal (Kandla) Ports",
    "placeType": "Private Commercial & Tidal Major Ports",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Gujarat (Gulf of Kutch)"
    },
    "lat": 22.8394,
    "lng": 69.7219,
    "neighbours": [
      "Gulf of Kutch",
      "Kandla Free Trade Zone"
    ],
    "staticFacts": [
      "Mundra Port (UPSC 2023): India's largest privately owned port and largest container-handling port by volume.",
      "Deendayal Port (Kandla — CDS 2023): Major tidal port at the head of the Gulf of Kutch."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-11",
      "GEO-CDS1-2023-14",
      "GEO-CDS1-2023-11"
    ],
    "linkedIssueSlug": "transport-network-ports-highways-freight-corridors-waterways",
    "linkedIssueTitle": "Transport Network — Ports, Highways, Freight Corridors & Waterways",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PORT-03",
    "slug": "visakhapatnam-port",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "Ports, highways & corridors"
    ],
    "place": "Visakhapatnam Port",
    "placeType": "Deepest Landlocked Natural Harbour",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Andhra Pradesh"
    },
    "lat": 17.6868,
    "lng": 83.2185,
    "neighbours": [
      "Protected by Dolphin's Nose hill promontory"
    ],
    "staticFacts": [
      "CDS 2023 & UPSC 2023 Fact: Deepest landlocked and well-protected natural harbour on the East Coast (protected by Dolphin's Nose promontory; NOT the largest container port)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-11",
      "GEO-CDS1-2023-14",
      "GEO-UPSC-2014-10"
    ],
    "linkedIssueSlug": "transport-network-ports-highways-freight-corridors-waterways",
    "linkedIssueTitle": "Transport Network — Ports, Highways, Freight Corridors & Waterways",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-MIN-01",
    "slug": "jaduguda-singhbhum-uranium-belt",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "Minerals & resources by place"
    ],
    "place": "Jaduguda & Singhbhum Uranium–Copper Belt",
    "placeType": "Strategic Atomic Mineral Belt",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Jharkhand (East Singhbhum)"
    },
    "lat": 22.65,
    "lng": 86.35,
    "neighbours": [
      "Subarnarekha River (Hundru Falls)",
      "Narwapahar, Turamdih, Bagjata mines"
    ],
    "staticFacts": [
      "Jaduguda is India's first operational uranium mine (Singhbhum Thrust Belt, Jharkhand); Hundru Falls is on the Subarnarekha River in Chota Nagpur (UPSC 2024).",
      "Other major uranium sites: Tummalapalle (Kadapa, AP — stratified dolomite uranium reserve) and Domiasiat (Meghalaya)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2024-09",
      "GEO-UPSC-2023-10",
      "GEO-UPSC-2020-04",
      "GEO-CDS1-2016-08",
      "GEO-UPSC-2013-14",
      "GEO-UPSC-2013-15"
    ],
    "linkedIssueSlug": "distribution-of-minerals-global-indian-context",
    "linkedIssueTitle": "Distribution of Minerals — Global & Indian Context",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-MIN-02",
    "slug": "chavara-kollam-monazite-ilmenite-coast",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "Minerals & resources by place"
    ],
    "place": "Chavara–Manavalakurichi Coastal Placer Sands",
    "placeType": "Thorium (Monazite) & Titanium (Ilmenite/Rutile) Tract",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Kerala & Tamil Nadu Coast"
    },
    "lat": 8.994,
    "lng": 76.536,
    "neighbours": [
      "Ashtamudi Lake (Kollam)",
      "IREL Rare Earths Plant"
    ],
    "staticFacts": [
      "Ilmenite and Rutile in coastal beach sands are rich sources of Titanium (UPSC 2023).",
      "Monazite sands contain Thorium (~8–10% ThO2) and Rare Earth Elements; processing is restricted to government entities (IREL — UPSC 2022)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2025-06",
      "GEO-UPSC-2023-12",
      "GEO-UPSC-2022-05"
    ],
    "linkedIssueSlug": "distribution-of-minerals-global-indian-context",
    "linkedIssueTitle": "Distribution of Minerals — Global & Indian Context",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-HER-01",
    "slug": "dholavira-kutch-harappan-site",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Ancient History",
    "mapCategory": [
      "Historical & archaeological sites"
    ],
    "place": "Dholavira (Khadir Bet)",
    "placeType": "Harappan UNESCO World Heritage Site",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Gujarat (Rann of Kutch)"
    },
    "lat": 23.8866,
    "lng": 70.2122,
    "neighbours": [
      "Luni Basin",
      "Lies directly on the Tropic of Cancer"
    ],
    "staticFacts": [
      "UPSC 2021 Exact Question: Renowned for its elaborate rock-cut water harvesting and reservoir management system (fed by Manhar and Mansar streams) and tripartite town layout."
    ],
    "similarPYQ": [
      "ART-UPSC-2024-65",
      "ART-UPSC-2021-05"
    ],
    "linkedIssueSlug": "indus-valley-civilisation-urban-planning-architecture-trade",
    "linkedIssueTitle": "Indus Valley Civilisation — Urban Planning, Architecture & Trade",
    "linkedIssueDomain": "ANCIENT HISTORY"
  },
  {
    "id": "IND-HER-02",
    "slug": "kanaganahalli-sannati-stupa",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Art & Culture",
    "mapCategory": [
      "Historical & archaeological sites"
    ],
    "place": "Kanaganahalli (Sannati Buddhist Site)",
    "placeType": "Mauryan–Satavahana Buddhist Stupa",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka (Kalaburagi)"
    },
    "lat": 16.82,
    "lng": 76.91,
    "neighbours": [
      "Situated on the left bank of the Bhima River (Krishna tributary)"
    ],
    "staticFacts": [
      "UPSC 2019 & CDS 2023 Exact Question: Located on the bank of the Bhima River; yielded the famous sculpted portrait slab bearing the Brahmi inscription \"Ranyo Ashoka\" (King Ashoka)."
    ],
    "similarPYQ": [
      "ART-CDS1-2023-01",
      "ART-UPSC-2019-02"
    ],
    "linkedIssueSlug": "ashoka-the-great-kalinga-war-dhamma-inscriptions-edicts",
    "linkedIssueTitle": "Ashoka the Great — Kalinga War, Dhamma, Inscriptions & Edicts",
    "linkedIssueDomain": "ANCIENT HISTORY"
  },
  {
    "id": "IND-HER-03",
    "slug": "besnagar-sanchi-vidisha",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Art & Culture",
    "mapCategory": [
      "Historical & archaeological sites"
    ],
    "place": "Besnagar (Vidisha) & Sanchi",
    "placeType": "Mauryan–Shunga Archaeological Complex",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh"
    },
    "lat": 23.527,
    "lng": 77.808,
    "neighbours": [
      "Confluence of Betwa and Bes rivers",
      "Udayagiri Caves (Gupta period)"
    ],
    "staticFacts": [
      "UPSC 2023 Exact Fact: Besnagar (ancient Vidisha) is famous for the Vaishnavite Heliodorus Pillar (Garuda Dhwaja) erected by Greek ambassador Heliodorus — NOT a Shaivite cave shrine.",
      "Sanchi Stupa (UPSC 2013, 2019) is located 10 km from Vidisha."
    ],
    "similarPYQ": [
      "ART-UPSC-2023-01",
      "ART-UPSC-2016-02",
      "ART-UPSC-2013-03"
    ],
    "linkedIssueSlug": "buddhist-councils-sects-theravada-mahayana-vajrayana-bodhisattvas",
    "linkedIssueTitle": "Buddhist Councils, Sects (Theravada, Mahayana, Vajrayana) & Bodhisattvas",
    "linkedIssueDomain": "ANCIENT HISTORY"
  },
  {
    "id": "IND-HER-04",
    "slug": "sittanavasal-cave-pudukkottai",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Art & Culture",
    "mapCategory": [
      "Historical & archaeological sites"
    ],
    "place": "Sittanavasal Cave (Arivar Koil)",
    "placeType": "Jain Rock-Cut Cave Shrine",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Tamil Nadu (Pudukkottai)"
    },
    "lat": 10.456,
    "lng": 78.725,
    "neighbours": [
      "Cauvery–Vaigai cultural belt"
    ],
    "staticFacts": [
      "UPSC 2023 Exact Fact: Famous 2nd-century BCE to 9th-century CE Jain rock-cut monastery and cave temple known for Pandyan fresco paintings (Samavasarana lotus pond)."
    ],
    "similarPYQ": [
      "ART-UPSC-2026-37",
      "ART-UPSC-2023-01",
      "ART-UPSC-2016-01",
      "ART-UPSC-2013-02"
    ],
    "linkedIssueSlug": "jainism-tirthankaras-doctrines-epistemology-sects",
    "linkedIssueTitle": "Jainism — Tirthankaras, Doctrines, Epistemology & Sects",
    "linkedIssueDomain": "ANCIENT HISTORY"
  },
  {
    "id": "WLD-PHY-01",
    "slug": "congo-river-basin",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "World – physical features"
    ],
    "place": "Congo Basin & Katanga Cobalt Belt",
    "placeType": "Equatorial Basin & Tropical Peatland",
    "priority": "High",
    "locatedIn": {
      "country": "DRC, Republic of Congo, Cameroon, CAR, Gabon, Eq. Guinea"
    },
    "lat": -1.5,
    "lng": 18.5,
    "shape": [
      [
        -11,
        29.5
      ],
      [
        -8,
        26.5
      ],
      [
        -4,
        24.5
      ],
      [
        -1,
        23.5
      ],
      [
        0.5,
        19.5
      ],
      [
        -1.5,
        16.5
      ],
      [
        -4.3,
        15.3
      ],
      [
        -6,
        12.4
      ]
    ],
    "neighbours": [
      "Lake Tanganyika (East)",
      "Katanga Copper–Cobalt Plateau (South)"
    ],
    "staticFacts": [
      "UPSC 2024 Exact Question: Houses the Cuvette Centrale, the world's largest tropical peatland storing ~3 years of global fossil carbon.",
      "UPSC 2023 Exact Question: Congo Basin includes DRC, Republic of the Congo, Cameroon, Central African Republic, Gabon, and Equatorial Guinea (NOT Nigeria, Uganda, or South Sudan); DRC produces ~75% of global Cobalt."
    ],
    "similarPYQ": [
      "ENV-UPSC-2024-16",
      "GEO-UPSC-2023-01",
      "GEO-UPSC-2023-13"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-PHY-02",
    "slug": "nile-river-victoria-tana",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "World – physical features"
    ],
    "place": "Nile River, Lake Victoria & Lake Turkana",
    "placeType": "East African Rift & Nile System",
    "priority": "High",
    "locatedIn": {
      "country": "Uganda, Kenya, Ethiopia, South Sudan, Sudan, Egypt"
    },
    "lat": 15.5881,
    "lng": 32.5342,
    "shape": [
      [
        0.3,
        33
      ],
      [
        4.9,
        31.5
      ],
      [
        9.5,
        31.6
      ],
      [
        15.6,
        32.5
      ],
      [
        18,
        33.9
      ],
      [
        24,
        32.9
      ],
      [
        30,
        31.2
      ],
      [
        31.5,
        30.4
      ]
    ],
    "neighbours": [
      "White Nile + Blue Nile meet at Khartoum",
      "Lake Turkana (Jade Sea in Kenya) & Lake Tanganyika"
    ],
    "staticFacts": [
      "White Nile originates at Lake Victoria (crossed by the Equator; bordered by Kenya, Uganda, Tanzania — UPSC 2011 & 2025).",
      "UPSC 2026 Exact Question: Lake Turkana (\"Jade Sea\" in the Kenyan Rift Valley) is the world's largest permanent desert lake and a UNESCO World Heritage Site."
    ],
    "similarPYQ": [
      "GEO-UPSC-2026-39",
      "GEO-UPSC-2025-23",
      "GEO-UPSC-2011-02"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-PHY-03",
    "slug": "mekong-river",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "World – physical features"
    ],
    "place": "Mekong River & Tonlé Sap Lake",
    "placeType": "Southeast Asian Transboundary River",
    "priority": "High",
    "locatedIn": {
      "country": "China, Myanmar, Laos, Thailand, Cambodia, Vietnam"
    },
    "lat": 15.12,
    "lng": 105.8,
    "shape": [
      [
        33.5,
        94.5
      ],
      [
        29,
        98.6
      ],
      [
        22,
        100.8
      ],
      [
        19.9,
        102.1
      ],
      [
        17.9,
        102.6
      ],
      [
        15.1,
        105.8
      ],
      [
        11.5,
        104.9
      ],
      [
        9.8,
        106.5
      ]
    ],
    "neighbours": [
      "Tonle Sap Lake (Cambodia — UPSC 2025)",
      "Drains into South China Sea"
    ],
    "staticFacts": [
      "UPSC 2020 Exact Question: Rises in Tibetan Plateau (alongside Brahmaputra and Irrawaddy — UPSC 2011), flows through 6 countries, and drains into the South China Sea (NOT Andaman Sea)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2025-23",
      "GEO-UPSC-2020-06",
      "GEO-UPSC-2014-14",
      "GEO-UPSC-2011-09"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-PHY-04",
    "slug": "andes-mountains-lithium-triangle",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "Landforms & volcanoes"
    ],
    "place": "Andes Cordillera & Tungurahua Volcano",
    "placeType": "Continental Fold Cordillera & Volcanic Arc",
    "priority": "High",
    "locatedIn": {
      "country": "Venezuela, Colombia, Ecuador, Peru, Bolivia, Chile, Argentina"
    },
    "lat": -18.5,
    "lng": -68.5,
    "shape": [
      [
        10.5,
        -73.2
      ],
      [
        4.6,
        -74.1
      ],
      [
        -1.2,
        -78.5
      ],
      [
        -9.5,
        -77.5
      ],
      [
        -16.5,
        -68.1
      ],
      [
        -23.5,
        -67.4
      ],
      [
        -32.8,
        -70
      ],
      [
        -41.5,
        -72.3
      ]
    ],
    "neighbours": [
      "Atacama Desert (West)",
      "Tungurahua & Cotopaxi Volcanoes (Ecuador)"
    ],
    "staticFacts": [
      "UPSC 2024 & 2025 Exact Questions: Andes are young fold mountains passing through 7 South American countries: Venezuela, Colombia, Ecuador, Peru, Bolivia, Chile, and Argentina (do NOT pass through Brazil or Paraguay).",
      "UPSC 2026 Exact Question: Tungurahua Volcano (declared a UNESCO Global Geopark) is located in the Andes of Ecuador."
    ],
    "similarPYQ": [
      "GEO-UPSC-2026-31",
      "GEO-UPSC-2025-22",
      "GEO-UPSC-2024-10",
      "GEO-CDS2-2020-12",
      "GEO-UPSC-2013-01"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-MIN-01",
    "slug": "lithium-triangle-katanga-mineral-belts",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "Minerals & resources by place"
    ],
    "place": "Global Strategic Mineral Belts (Chile Lithium, DRC Cobalt, Orinoco)",
    "placeType": "Critical Mineral & Energy Reserves",
    "priority": "High",
    "locatedIn": {
      "country": "Chile, Bolivia, Argentina, Botswana, Indonesia, Venezuela"
    },
    "lat": -23.5,
    "lng": -68.2,
    "neighbours": [
      "Salar de Atacama (Chile)",
      "Salar de Uyuni (Bolivia)",
      "Orinoco Belt (Venezuela)"
    ],
    "staticFacts": [
      "UPSC 2025 Exact Match: Botswana is rich in Diamonds, Chile in Lithium (Salar de Atacama), and Indonesia in Nickel.",
      "UPSC 2024 Exact Fact: Venezuela holds the world's largest proven crude oil reserves (Orinoco Belt & Lake Maracaibo); DRC holds ~75% of global Cobalt (UPSC 2023)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2025-79",
      "GEO-UPSC-2025-06",
      "GEO-UPSC-2024-97",
      "GEO-UPSC-2023-13"
    ],
    "linkedIssueSlug": "distribution-of-minerals-global-indian-context",
    "linkedIssueTitle": "Distribution of Minerals — Global & Indian Context",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-SEA-01",
    "slug": "black-sea-littoral-states",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Black Sea & Kerch–Bosphorus Straits",
    "placeType": "Marginal Inland Sea & Chokepoints",
    "priority": "High",
    "locatedIn": {
      "country": "Ukraine, Russia, Georgia, Turkey, Bulgaria, Romania"
    },
    "lat": 43.3,
    "lng": 34,
    "neighbours": [
      "Sea of Azov (via Kerch Strait)",
      "Caucasus Mountains (between Black & Caspian Seas — CDS 2019)"
    ],
    "staticFacts": [
      "UPSC 2019 Exact Question: Bordered by 6 countries — Turkey, Russia, Ukraine, Georgia, Bulgaria, and Romania (Croatia borders the Adriatic Sea, NOT Black Sea).",
      "CDS 2020 Fact: Danube, Dnieper, and Don drain into the Black/Azov Sea, whereas Volga drains into the Caspian Sea."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-18",
      "GEO-CDS1-2020-06",
      "GEO-CDS2-2019-09",
      "GEO-UPSC-2019-06",
      "GEO-UPSC-2014-13"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-SEA-02",
    "slug": "caspian-sea-littoral-states",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Caspian Sea & Aral Sea Basin",
    "placeType": "Endorheic Inland Seas",
    "priority": "High",
    "locatedIn": {
      "country": "Turkmenistan, Azerbaijan, Russia, Iran, Kazakhstan"
    },
    "lat": 41.9,
    "lng": 50.6,
    "neighbours": [
      "Fed by Volga and Ural rivers from the North",
      "Aral Sea (Kazakhstan–Uzbekistan)"
    ],
    "staticFacts": [
      "UPSC 2019 & 2020 Fact: Bordered by 5 countries (Mnemonic TARIK: Turkmenistan, Azerbaijan, Russia, Iran, Kazakhstan); Volga River drains into the Caspian Sea.",
      "UPSC 2018 Fact: Aral Sea (between Kazakhstan and Uzbekistan) has shrunk immensely due to diversion of Amu Darya and Syr Darya."
    ],
    "similarPYQ": [
      "IR-UPSC-2025-62",
      "GEO-UPSC-2020-06",
      "GEO-CDS2-2019-09",
      "GEO-UPSC-2019-06",
      "GEO-UPSC-2018-09"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-SEA-03",
    "slug": "red-sea-dead-sea-mediterranean",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Red Sea, Suez–Sumed & Mediterranean Littoral",
    "placeType": "Rift Sea & Strategic Corridor",
    "priority": "High",
    "locatedIn": {
      "country": "Egypt, Sudan, Eritrea, Djibouti, Saudi Arabia, Yemen, Jordan, Israel"
    },
    "lat": 22,
    "lng": 38,
    "neighbours": [
      "Suez Canal & Sumed Pipeline (North)",
      "Bab-el-Mandeb & Gulf of Aden (South)"
    ],
    "staticFacts": [
      "UPSC 2024 Exact Questions: No permanent rivers enter the Red Sea and it receives very little precipitation; the Sumed Pipeline in Egypt connects the Red Sea (Ain Sokhna) with the Mediterranean Sea (Sidi Kerir).",
      "UPSC 2015 & 2017: Jordan does NOT open out to the Mediterranean Sea; Syria does NOT touch the Red Sea."
    ],
    "similarPYQ": [
      "GEO-UPSC-2024-88",
      "GEO-UPSC-2024-89",
      "GEO-UPSC-2022-09",
      "GEO-UPSC-2019-06",
      "GEO-UPSC-2017-07",
      "GEO-UPSC-2015-13"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-CHOKE-01",
    "slug": "strait-of-hormuz",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Strait of Hormuz",
    "placeType": "Maritime Energy Chokepoint",
    "priority": "High",
    "locatedIn": {
      "country": "Iran & Oman (Musandam Exclave)"
    },
    "lat": 26.5667,
    "lng": 56.25,
    "neighbours": [
      "Connects Persian Gulf with Gulf of Oman (Arabian Sea)",
      "Bahrain, Qatar, Kuwait, UAE, Iraq, Iran inside Persian Gulf"
    ],
    "staticFacts": [
      "UPSC 2026 Exact Question: Ships from Persian Gulf states like Bahrain and Qatar must cross the Strait of Hormuz to reach the Indian Ocean.",
      "Separates Iran (North) from Oman's Musandam Peninsula exclave and the UAE (South)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2026-30",
      "GEO-UPSC-2024-88",
      "IR-UPSC-2017-06"
    ],
    "linkedIssueSlug": "geopolitical-importance-of-indian-ocean",
    "linkedIssueTitle": "Geopolitical Importance of Indian Ocean",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-CHOKE-02",
    "slug": "bab-el-mandeb-strait",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Bab-el-Mandeb Strait & Horn of Africa",
    "placeType": "Red Sea–Aden Chokepoint",
    "priority": "High",
    "locatedIn": {
      "country": "Yemen, Djibouti, Eritrea & Somalia"
    },
    "lat": 12.5833,
    "lng": 43.3333,
    "neighbours": [
      "Connects Red Sea with Gulf of Aden",
      "Socotra Island & Horn of Africa (SEED: Somalia, Ethiopia, Eritrea, Djibouti)"
    ],
    "staticFacts": [
      "Separates Yemen on the Arabian Peninsula from Djibouti and Eritrea on the Horn of Africa.",
      "UPSC 2023 & 2018: Bordered by Yemen and Somalia, both of which have faced prolonged civil strife and famine."
    ],
    "similarPYQ": [
      "GEO-UPSC-2024-88",
      "GEO-UPSC-2024-89",
      "GEO-UPSC-2023-20",
      "GEO-UPSC-2018-10"
    ],
    "linkedIssueSlug": "geopolitical-importance-of-indian-ocean",
    "linkedIssueTitle": "Geopolitical Importance of Indian Ocean",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-CHOKE-03",
    "slug": "strait-of-malacca",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Strait of Malacca, Kra Isthmus & South China Sea",
    "placeType": "Indo-Pacific Maritime Chokepoint",
    "priority": "High",
    "locatedIn": {
      "country": "Malaysia, Indonesia (Sumatra) & Singapore"
    },
    "lat": 2.5,
    "lng": 101.8,
    "neighbours": [
      "Indira Point (Great Nicobar) via Six Degree Channel",
      "Scarborough Shoal, Spratly, Paracel & Senkaku Islands"
    ],
    "staticFacts": [
      "Connects the Andaman Sea (Indian Ocean) with the South China Sea (Pacific Ocean).",
      "UPSC 2011 Exact Question: Opening a canal across the Kra Isthmus (between Gulf of Siam and Andaman Sea) reduces navigation distance/time between India and East Asia.",
      "UPSC 2017 & 2022: Disputed islands in South/East China Sea include Paracel, Spratly, Scarborough Shoal, and Senkaku (Diaoyu)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2022-12",
      "GEO-UPSC-2020-06",
      "GEO-UPSC-2017-06",
      "GEO-UPSC-2014-14",
      "GEO-UPSC-2011-03"
    ],
    "linkedIssueSlug": "geopolitical-importance-of-indian-ocean",
    "linkedIssueTitle": "Geopolitical Importance of Indian Ocean",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-PROJ-01",
    "slug": "chabahar-port-iran",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "Strategic projects abroad"
    ],
    "place": "Chabahar Port & INSTC Corridor",
    "placeType": "Indian Overseas Strategic Port & Corridor",
    "priority": "High",
    "locatedIn": {
      "country": "Iran (Sistan-Baluchestan, Gulf of Oman)"
    },
    "lat": 25.2919,
    "lng": 60.643,
    "neighbours": [
      "170 km west of Gwadar Port (Pakistan)",
      "Outside Strait of Hormuz"
    ],
    "staticFacts": [
      "UPSC 2017 Exact Question: Iran's only oceanic port on the Gulf of Oman; enables India to bypass Pakistan to access Afghanistan and Central Asia.",
      "UPSC 2025 Exact Question: International North-South Transport Corridor (INSTC) connects India to Central Asia and Europe via Iran."
    ],
    "similarPYQ": [
      "IR-UPSC-2025-62",
      "GEO-UPSC-2023-14",
      "IR-UPSC-2017-06"
    ],
    "linkedIssueSlug": "geopolitical-importance-of-indian-ocean",
    "linkedIssueTitle": "Geopolitical Importance of Indian Ocean",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-PROJ-02",
    "slug": "sittwe-port-kaladan-project",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "Strategic projects abroad"
    ],
    "place": "Sittwe Port, Kaladan & Neighbourhood Bridges",
    "placeType": "Act East Connectivity Projects",
    "priority": "High",
    "locatedIn": {
      "country": "Myanmar, Bangladesh & Nepal Border"
    },
    "lat": 20.15,
    "lng": 92.89,
    "neighbours": [
      "Kaladan River (Myanmar)",
      "Maitri Setu (Feni River, Bangladesh)",
      "Mechi Bridge (India–Nepal)"
    ],
    "staticFacts": [
      "UPSC 2023 Exact Question: India–Myanmar–Thailand Trilateral Highway connects Moreh (Manipur) with Mae Sot (Thailand) via Myanmar.",
      "UPSC 2026 Exact Question: Maitri Setu is built over the Feni River connecting Sabroom (Tripura) with Ramgarh (Bangladesh); Mechi Bridge connects Panitanki (India) with Kakarvitta (Nepal)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2026-61",
      "GEO-UPSC-2023-14"
    ],
    "linkedIssueSlug": "geopolitical-importance-of-indian-ocean",
    "linkedIssueTitle": "Geopolitical Importance of Indian Ocean",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-PROJ-03",
    "slug": "agalega-island-mauritius",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "Strategic projects abroad"
    ],
    "place": "Agalega Island (Mauritius)",
    "placeType": "Indian Ocean Maritime Outpost",
    "priority": "High",
    "locatedIn": {
      "country": "Mauritius (Western Indian Ocean)"
    },
    "lat": -10.4,
    "lng": 56.63,
    "neighbours": [
      "1,100 km north of Mauritius main island",
      "Mozambique Channel approach"
    ],
    "staticFacts": [
      "Jointly developed 3,000m airstrip and St. James Jetty by India and Mauritius under Vision SAGAR to monitor Western Indian Ocean SLOCs."
    ],
    "similarPYQ": [
      "IR-UPSC-2017-06",
      "IR-UPSC-2016-03"
    ],
    "linkedIssueSlug": "geopolitical-importance-of-indian-ocean",
    "linkedIssueTitle": "Geopolitical Importance of Indian Ocean",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-CONF-01",
    "slug": "donbas-kherson-zaporizhzhia-ukraine",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – places in news"
    ],
    "place": "Donbas, Zaporizhzhia & Kherson (Ukraine)",
    "placeType": "Eastern European Conflict Theatre",
    "priority": "High",
    "locatedIn": {
      "country": "Ukraine"
    },
    "lat": 48.0159,
    "lng": 37.8028,
    "neighbours": [
      "Ukraine shares land borders with 7 countries: Poland, Slovakia, Hungary, Romania, Moldova, Belarus, Russia"
    ],
    "staticFacts": [
      "UPSC 2023 Exact Questions: Donbas (Donetsk & Luhansk), Kherson, and Zaporizhzhia are located in Ukraine.",
      "Bulgaria and Czech Republic do NOT share a land border with Ukraine (UPSC 2023); Crimea was annexed in 2014 (UPSC 2018)."
    ],
    "similarPYQ": [
      "IR-UPSC-2025-21",
      "GEO-UPSC-2023-17",
      "GEO-UPSC-2023-18",
      "GEO-UPSC-2023-21",
      "GEO-UPSC-2018-07"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-CONF-02",
    "slug": "tigray-north-kivu-sahel",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – places in news"
    ],
    "place": "Sahel Coup Belt, Tigray (Ethiopia) & North Kivu (DRC)",
    "placeType": "African Geopolitical Flashpoints",
    "priority": "High",
    "locatedIn": {
      "country": "Mali, Burkina Faso, Niger, Chad, Sudan, Ethiopia, DRC"
    },
    "lat": 13.4967,
    "lng": 39.4753,
    "neighbours": [
      "Sahel region (south of Sahara)",
      "Lake Kivu & Bidibidi Refugee Settlement (Uganda)"
    ],
    "staticFacts": [
      "UPSC 2024 & 2023 Exact Questions: Sahel countries (Mali, Burkina Faso, Niger, Chad, Sudan, Guinea) experienced military coups; Tigray is in Ethiopia; North Kivu and Ituri are conflict provinces in Eastern DR Congo.",
      "UPSC 2022 Fact: Bidibidi is a major refugee settlement in north-western Uganda (receiving South Sudanese refugees)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2024-91",
      "GEO-UPSC-2023-17",
      "GEO-UPSC-2023-21",
      "GEO-UPSC-2023-22",
      "GEO-UPSC-2022-11",
      "GEO-UPSC-2022-13"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IR-CONF-03",
    "slug": "nagorno-karabakh-south-caucasus",
    "pillar": "IR",
    "regionScope": "World",
    "subject": "International Relations",
    "mapCategory": [
      "World – places in news"
    ],
    "place": "Nagorno-Karabakh, Levant & West Asian Flashpoints",
    "placeType": "Caucasus & Levant Conflict Zones",
    "priority": "High",
    "locatedIn": {
      "country": "Azerbaijan, Armenia, Syria, Iraq, Israel, Palestine"
    },
    "lat": 39.8265,
    "lng": 46.7656,
    "neighbours": [
      "South Caucasus (Armenia–Azerbaijan)",
      "Levant (Eastern Mediterranean shores)"
    ],
    "staticFacts": [
      "UPSC 2023 Fact: Nagorno-Karabakh is in the South Caucasus between Azerbaijan and Armenia (NOT in Mozambique).",
      "UPSC 2022 Fact: \"Levant\" corresponds to the region along the eastern Mediterranean shores (Syria, Lebanon, Israel, Palestine, Jordan); Anatolia is in Turkey.",
      "UPSC 2018 Fact: Aleppo is in Syria, Kirkuk and Mosul are in Iraq, and Mazar-i-Sharif is in Afghanistan."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-21",
      "GEO-UPSC-2022-07",
      "GEO-UPSC-2022-08",
      "GEO-UPSC-2022-09",
      "GEO-UPSC-2018-08",
      "GEO-UPSC-2016-05"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-07",
    "slug": "krishna-river-reservoirs",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Krishna River Basin, Reservoirs & Tributaries",
    "aliases": [
      "Ghataprabha",
      "Malaprabha",
      "Bhima",
      "Tungabhadra",
      "Koyna",
      "Musi",
      "Munneru",
      "Almatti Dam",
      "Nagarjuna Sagar",
      "Srisailam"
    ],
    "placeType": "East-Flowing Peninsular River System",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Maharashtra, Karnataka, Telangana, Andhra Pradesh"
    },
    "lat": 16.5167,
    "lng": 80.6167,
    "shape": [
      [
        17.92,
        73.65
      ],
      [
        16.85,
        74.6
      ],
      [
        16.2,
        75.8
      ],
      [
        16.05,
        77.2
      ],
      [
        16.25,
        78.85
      ],
      [
        16.5,
        80.6
      ],
      [
        15.8,
        80.9
      ]
    ],
    "neighbours": [
      "Right-bank: Venna, Koyna, Panchganga, Dudhganga, Ghataprabha, Malaprabha, Tungabhadra",
      "Left-bank: Bhima, Dindi, Musi, Paleru, Munneru"
    ],
    "staticFacts": [
      "Second largest east-flowing peninsular river in India; rises near Mahabaleshwar in the Western Ghats (Maharashtra).",
      "UPSC 2022 Fact: Ghataprabha reservoir is located in Karnataka (NOT Telangana); Gandhi Sagar is on Chambal (MP); Indira Sagar on Narmada (MP); Maithon dam on Barakar river (Jharkhand).",
      "Major multipurpose reservoirs: Almatti Dam (Lal Bahadur Shastri reservoir, Karnataka), Srisailam Dam (AP/Telangana border), and Nagarjuna Sagar Dam."
    ],
    "similarPYQ": [
      "GEO-UPSC-2022-10",
      "GEO-UPSC-2019-04",
      "GEO-CDS1-2019-04",
      "GEO-CDS2-2018-06"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-08",
    "slug": "mahanadi-river-basin",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Mahanadi, Brahmani & Subarnarekha River Basins",
    "aliases": [
      "Seonath",
      "Hasdeo",
      "Mand",
      "Ib",
      "Ong",
      "Jonk",
      "Tel",
      "Hirakud Dam",
      "Nagawali",
      "Vamsadhara"
    ],
    "placeType": "East-Flowing Peninsular River Basin",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Chhattisgarh, Odisha, Jharkhand"
    },
    "lat": 20.4625,
    "lng": 85.883,
    "shape": [
      [
        20.55,
        81.9
      ],
      [
        21.15,
        82.8
      ],
      [
        21.5,
        83.85
      ],
      [
        20.9,
        84.8
      ],
      [
        20.45,
        85.85
      ],
      [
        20.25,
        86.7
      ]
    ],
    "neighbours": [
      "Left-bank tributaries: Seonath, Hasdeo, Mand, Ib",
      "Right-bank tributaries: Ong, Jonk, Tel",
      "Eastern Ghats independent streams: Nagawali, Vamsadhara"
    ],
    "staticFacts": [
      "Rises in the Sihawa highlands of Raipur/Dhamtari district in Chhattisgarh; drains into Bay of Bengal at False Point, Kendrapara.",
      "Hirakud Dam near Sambalpur is one of the longest earthen dams in the world, creating a 55-km long reservoir (Ramsar wetland site).",
      "UPSC 2021 Fact: Nagawali and Vamsadhara rise directly in the Eastern Ghats of Odisha and flow south into Andhra Pradesh; Brahmani (formed by Sankh and South Koel) and Subarnarekha rise on the Chota Nagpur plateau."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07",
      "GEO-CDS2-2018-06",
      "GEO-CDS2-2017-07",
      "GEO-CDS2-2017-10"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-09",
    "slug": "chambal-river-ken-betwa",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Chambal River, Ken-Betwa Interlinking & Malwa Drainage",
    "aliases": [
      "Charmanvati",
      "Banas",
      "Kali Sindh",
      "Parbati",
      "Shipra",
      "Ken River",
      "Betwa River",
      "Gandhi Sagar Dam",
      "Daudhan Dam"
    ],
    "placeType": "Major Yamuna Tributary & Ravine System",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Rajasthan, Uttar Pradesh"
    },
    "lat": 25.5,
    "lng": 76.5,
    "shape": [
      [
        22.45,
        75.7
      ],
      [
        24.7,
        75.8
      ],
      [
        25.8,
        76.55
      ],
      [
        26.7,
        77.9
      ],
      [
        26.48,
        79.25
      ]
    ],
    "neighbours": [
      "Flows north through Malwa Plateau into Yamuna near Etawah",
      "Ken and Betwa drain Bundelkhand region directly into Yamuna"
    ],
    "staticFacts": [
      "Rises near Singar Chouri peak on the northern slopes of the Vindhyan range near Mhow (MP); famous for gully erosion badlands (Chambal Badlands / Ravines).",
      "Chain of multi-purpose cascade dams: Gandhi Sagar (MP), Rana Pratap Sagar (Chittorgarh), Jawahar Sagar (Kota), and Kota Barrage.",
      "UPSC 2017 Fact: National Chambal Sanctuary (tri-junction of MP, Rajasthan, and UP) is the most significant wild habitat for critically endangered Gharials (Gavialis gangeticus), Red-crowned roofed turtles, and Ganges river dolphins.",
      "Ken-Betwa River Interlinking Project: India's first river-linking project; involves constructing Daudhan Dam to transfer surplus water from Ken to water-deficit Betwa basin, partially submerging Panna Tiger Reserve core."
    ],
    "similarPYQ": [
      "GEO-UPSC-2022-10",
      "ENV-UPSC-2017-05",
      "GEO-CDS1-2018-08",
      "GEO-UPSC-2019-03"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-10",
    "slug": "west-flowing-peninsular-rivers",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Peninsular West-Flowing Rivers — Tapi, Sabarmati, Mahi & Periyar",
    "aliases": [
      "Tapti",
      "Mahi",
      "Sabarmati",
      "Mandovi",
      "Zuari",
      "Periyar",
      "Bharathapuzha",
      "Pamba",
      "Kalinadi",
      "Sharavati"
    ],
    "placeType": "Rift Valley & Western Ghats Arabian Sea Drainage",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Gujarat, MP, Maharashtra, Goa, Karnataka, Kerala"
    },
    "lat": 21.1702,
    "lng": 72.8311,
    "neighbours": [
      "Tapi flows between Satpura (north) and Ajanta/Satmala (south)",
      "Mahi flows into Gulf of Khambhat crossing Tropic of Cancer twice",
      "Western Ghats coastal streams flow rapidly into Arabian Sea forming estuaries, not deltas"
    ],
    "staticFacts": [
      "Tapi / Tapti river originates in Multai in the Betul district of Madhya Pradesh and flows through a rift valley into the Gulf of Khambhat near Surat; Ukai and Kakrapar projects located on it.",
      "Mahi river originates in Vindhyas (Dhar, MP), flows through Rajasthan and Gujarat, and is famous for crossing the Tropic of Cancer twice.",
      "Goa's twin lifeline rivers: Mandovi (rises in Western Ghats at Bhimgad, Karnataka; Dudhsagar Falls located on it) and Zuari, meeting at Cabo Aguada into Marmagao harbour.",
      "Sharavati river in Karnataka plunges at Gersoppa / Jog Falls (one of India's highest waterfalls)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07",
      "GEO-CDS2-2018-06",
      "GEO-CDS1-2014-06",
      "GEO-CDS2-2017-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PA-06",
    "slug": "kaziranga-national-park",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Kaziranga National Park & Tiger Reserve",
    "aliases": [
      "Brahmaputra Floodplain",
      "Diphlu River",
      "Mora Diphlu",
      "Mikir Hills",
      "Karbi Anglong"
    ],
    "placeType": "Alluvial Grassland UNESCO World Heritage Site",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Assam",
      "district": "Golaghat, Nagaon, Biswanath"
    },
    "lat": 26.5775,
    "lng": 93.1711,
    "neighbours": [
      "North: Brahmaputra River",
      "South: Karbi Anglong / Mikir Hills (highland refuge during annual floods)"
    ],
    "staticFacts": [
      "UNESCO World Heritage Site located on the southern floodplains of the Brahmaputra River; drained by Diphlu and Mora Diphlu streams.",
      "Hosts the world's largest population of the Greater One-Horned Rhinoceros (~two-thirds of global population), along with high density of Bengal Tigers, Asian Elephants, Wild Water Buffalo, and Eastern Swamp Deer (\"Big Five\").",
      "Vegetation consists of tall alluvial elephant grasslands, tropical moist broadleaf forests, and semi-evergreen forests with perennial beels (oxbow lakes)."
    ],
    "similarPYQ": [
      "ENV-UPSC-2014-16",
      "ENV-UPSC-2013-15",
      "GEO-CDS1-2015-09"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-07",
    "slug": "silent-valley-national-park",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Silent Valley National Park & Kunthipuzha River",
    "aliases": [
      "Sairandhri Vanam",
      "Kunthi River",
      "Nilgiri Biosphere Reserve",
      "Palakkad"
    ],
    "placeType": "Tropical Evergreen Rainforest National Park",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Kerala",
      "district": "Palakkad"
    },
    "lat": 11.134,
    "lng": 76.432,
    "neighbours": [
      "Core zone of Nilgiri Biosphere Reserve",
      "Contiguous with Mukurthi National Park (Nilgiris, TN) to the northeast and Karimpuzha WLS to the west"
    ],
    "staticFacts": [
      "Perennial river Kunthipuzha (tributary of Bharathapuzha) flows through the entire length of the valley from north to south; named for crystal-clear unpolluted waters.",
      "Prime habitat for the endangered Lion-tailed Macaque (Macaca silenus), an endemic primate of the Western Ghats canopy.",
      "Historical landmark: Saved from submergence by the pioneering 1970s people's environmental movement led by Kerala Sasthra Sahithya Parishad (KSSP) against a proposed hydroelectric dam."
    ],
    "similarPYQ": [
      "ENV-UPSC-2020-11",
      "ENV-UPSC-2013-15",
      "GEO-CDS1-2015-09"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-08",
    "slug": "jim-corbett-national-park",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Jim Corbett National Park & Ramganga Basin",
    "aliases": [
      "Hailey National Park",
      "Ramganga River",
      "Kosi River",
      "Patli Dun",
      "Shivalik-Bhabar Belt"
    ],
    "placeType": "Oldest National Park of India",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand",
      "district": "Nainital, Pauri Garhwal"
    },
    "lat": 29.53,
    "lng": 78.7747,
    "neighbours": [
      "Shivalik foothills to the south, Lesser Himalayas to the north",
      "Ramganga Reservoir (Kalagarh Dam) on the western boundary"
    ],
    "staticFacts": [
      "Established in 1936 as Hailey National Park (India's and Asia's first national park); renamed Ramganga in 1954 and Jim Corbett in 1956.",
      "Birthplace of Project Tiger in India (launched on 1 April 1973 under Prime Minister Indira Gandhi).",
      "The Ramganga River flows west through the broad structural valley of Patli Dun, providing essential water and elephant migration corridors."
    ],
    "similarPYQ": [
      "ENV-UPSC-2013-15",
      "GEO-UPSC-2024-06",
      "GEO-CDS1-2015-09"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-09",
    "slug": "kuno-national-park-gir",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Kuno National Park & Gir Protected Area",
    "aliases": [
      "Palpur-Kuno",
      "Kuno River",
      "Sheopur",
      "Gir National Park",
      "Sasan Gir",
      "Junagadh"
    ],
    "placeType": "Apex Carnivore Habitats & Reintroduction Corridor",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh & Gujarat"
    },
    "lat": 25.68,
    "lng": 77.26,
    "neighbours": [
      "Kuno River bisects the park north-south",
      "Part of the Sheopur-Shivpuri dry deciduous forest landscape connecting to Ranthambore"
    ],
    "staticFacts": [
      "Kuno National Park (Sheopur, MP): chosen site for Project Cheetah; first batch of 8 African cheetahs from Namibia released in September 2022, followed by 12 cheetahs from South Africa in 2023.",
      "UPSC 2017 Fact: Supreme Court ordered translocation of a second population of Asiatic lions from Gir (Gujarat) to Kuno to safeguard species against catastrophic epidemics; Asiatic lion is currently confined exclusively to Gir forest and surrounding Saurashtra peninsula."
    ],
    "similarPYQ": [
      "ENV-UPSC-2017-14",
      "ENV-UPSC-2019-15",
      "GEO-UPSC-2023-08"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-10",
    "slug": "askot-valley-of-flowers",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Askot Musk Deer Sanctuary & Valley of Flowers",
    "aliases": [
      "Askot WLS",
      "Dhauliganga",
      "Kali River",
      "Pithoragarh",
      "Valley of Flowers NP",
      "Pushpawati River",
      "Hemkund Sahib",
      "Nanda Devi Biosphere"
    ],
    "placeType": "Alpine Sanctuary & Himalayan Biosphere Core",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand",
      "district": "Pithoragarh, Chamoli"
    },
    "lat": 29.76,
    "lng": 80.35,
    "neighbours": [
      "Bordered by Nepal (Kali River) to the east and Tibet to the north",
      "Part of Kumaon-Garhwal high altitude alpine meadows (Bugyals)"
    ],
    "staticFacts": [
      "Askot Musk Deer Sanctuary (Pithoragarh, Uttarakhand): established specifically to conserve the endangered Alpine Musk Deer (Moschus chrysogaster); drained by Dhauli Ganga and Goriganga.",
      "UPSC 2020 Fact: Natural habitats of Musk Deer in the Indian Himalayas include Askot WLS (Pithoragarh), Gangotri National Park (Uttarkashi), Kedarnath WLS (Chamoli), and Dachigam NP (Kashmir).",
      "Valley of Flowers National Park (Chamoli, Uttarakhand): situated in the upper Bhyundar valley near Joshimath along the Pushpawati River; renowned for endemic alpine flora carpets; UNESCO World Heritage Site."
    ],
    "similarPYQ": [
      "ENV-UPSC-2020-11",
      "GEO-CDS1-2015-09"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-PA-11",
    "slug": "dampa-gumti-saramati",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Protected areas (NPs, WLS, tiger reserves)"
    ],
    "place": "Dampa Tiger Reserve, Gumti WLS & Mount Saramati",
    "aliases": [
      "Dampa TR",
      "Gumti WLS",
      "Saramati Peak",
      "Lushai Hills",
      "Patkai Range",
      "Indo-Burma Hotspot"
    ],
    "placeType": "Northeast Hills Transboundary Biodiversity Loci",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Mizoram, Tripura, Nagaland"
    },
    "lat": 23.69,
    "lng": 92.42,
    "neighbours": [
      "Dampa lies on the Mizoram-Bangladesh border in Lushai hills",
      "Mount Saramati stands on the Nagaland-Myanmar border as the highest peak of Patkai range"
    ],
    "staticFacts": [
      "UPSC 2014 Fact: Dampa Tiger Reserve is located in Mizoram; Gumti Wildlife Sanctuary is in Tripura (South Tripura district, protecting elephant and wild buffalo habitat); Mount Saramati (3,841 m) is in Nagaland on the Myanmar international border (NOT in Sikkim).",
      "Dampa is famous for supporting one of the highest cloud leopard densities in South Asia, along with slow loris, hoolock gibbon, and binturong."
    ],
    "similarPYQ": [
      "ENV-UPSC-2014-16",
      "GEO-UPSC-2015-08"
    ],
    "linkedIssueSlug": "protected-areas-of-india-location-rivers-special-features",
    "linkedIssueTitle": "Protected Areas of India — Location, Rivers & Special Features",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-WET-06",
    "slug": "ladakh-high-altitude-lakes",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Wetlands & Ramsar sites"
    ],
    "place": "Ladakh High-Altitude Ramsar Lakes — Pangong Tso, Tso Kar & Tso Moriri",
    "aliases": [
      "Pangong Lake",
      "Tso Kar Basin",
      "Startsapuk Tso",
      "Tso Moriri",
      "Rupshu Plateau",
      "Changthang"
    ],
    "placeType": "Trans-Himalayan Endorheic Saline & Brackish Wetlands",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Ladakh"
    },
    "lat": 33.75,
    "lng": 78.75,
    "neighbours": [
      "Bordered by Karakoram Range to north, Ladakh Range, and Zanskar Range to south",
      "Tsomgo Lake is in Sikkim (NOT Ladakh)"
    ],
    "staticFacts": [
      "UPSC & CDS 2017 Fact: Tso Kar and Pangong Tso are located in Ladakh; Tsomgo (Changu Lake) is in East Sikkim.",
      "Tso Kar Wetland Complex (Ramsar site): comprises two connected lakes: Startsapuk Tso (freshwater lake of ~438 ha) and Tso Kar itself (hyper-saline lake of ~1,800 ha); primary breeding ground for the Black-necked Crane.",
      "Tso Moriri (Mountain Lake): high-altitude brackish lake in the Changthang plateau; designated Ramsar site supporting breeding bar-headed geese, great crested grebes, and Tibetan wild ass (Kiang)."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-05",
      "ENV-UPSC-2022-02"
    ],
    "linkedIssueSlug": "wetlands-conservation-ramsar-sites-threats",
    "linkedIssueTitle": "Wetlands — Conservation, Ramsar Sites & Threats",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-WET-07",
    "slug": "kerala-backwaters-vembanad-ashtamudi",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Wetlands & Ramsar sites"
    ],
    "place": "Vembanad-Kol & Ashtamudi Kayals",
    "aliases": [
      "Vembanad Lake",
      "Punnamada Lake",
      "Kuttanad",
      "Ashtamudi Lake",
      "Sasthamkotta Lake",
      "Thanneermukkom Bund"
    ],
    "placeType": "Estuarine Coastal Lagoon & Ramsar Wetland System",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Kerala",
      "district": "Kottayam, Alappuzha, Ernakulam, Kollam"
    },
    "lat": 9.58,
    "lng": 76.42,
    "neighbours": [
      "Separated from Arabian Sea by a narrow barrier spit",
      "Kuttanad farming region lies 1.2 to 3 metres below sea level (FAO Globally Important Agricultural Heritage System)"
    ],
    "staticFacts": [
      "Vembanad-Kol is India's longest lake (~96.5 km) and the largest Ramsar wetland in Kerala; fed by 4 major rivers: Meenachil, Achankovil, Pamba, and Manimala.",
      "Thanneermukkom Saltwater Barrier / Bund divides the lake into two halves: freshwater south fed by rivers, and brackish estuarine water north connected to Cochin port.",
      "UPSC & CDS 2015 Fact: Ashtamudi is an estuarine eight-branched kayal in Kollam; Sasthamkotta is Kerala's largest freshwater lake (residual sweet water kayal); Pulicat is a coastal lagoon in AP/TN; Loktak is a freshwater lake in Manipur."
    ],
    "similarPYQ": [
      "GEO-CDS2-2015-10",
      "ENV-UPSC-2022-02",
      "ENV-UPSC-2014-14"
    ],
    "linkedIssueSlug": "wetlands-conservation-ramsar-sites-threats",
    "linkedIssueTitle": "Wetlands — Conservation, Ramsar Sites & Threats",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-WET-08",
    "slug": "sambhar-salt-lake-keoladeo",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Environment",
    "mapCategory": [
      "Wetlands & Ramsar sites"
    ],
    "place": "Sambhar Salt Lake & Keoladeo National Park",
    "aliases": [
      "Sambhar Lake",
      "Shakambhari",
      "Keoladeo Ghana NP",
      "Bharatpur Bird Sanctuary",
      "Gambhir River",
      "Banganga River"
    ],
    "placeType": "Inland Saline Playa & Montreux Record Wetland",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Rajasthan",
      "district": "Jaipur, Nagaur, Ajmer, Bharatpur"
    },
    "lat": 26.9,
    "lng": 75,
    "neighbours": [
      "Depression surrounded by Aravalli hills on all sides",
      "Keoladeo lies in the floodplains of Gambhir and Banganga rivers"
    ],
    "staticFacts": [
      "Sambhar Lake is India's largest inland saline wetland; fed by Mendha, Runpangarh, Khari, and Khandel rivers; major production center of lake salt in Rajasthan.",
      "Designated Ramsar site; crucial wintering habitat for tens of thousands of migratory birds, particularly Lesser Flamingos and Siberian waterfowl.",
      "Keoladeo National Park (Bharatpur): man-made freshwater wetland, UNESCO World Heritage Site, listed on Montreux Record (along with Loktak Lake) due to ecological degradation from water shortage and Paspalum distichum grass overgrowth."
    ],
    "similarPYQ": [
      "ENV-UPSC-2022-02",
      "ENV-UPSC-2014-14",
      "GEO-CDS2-2015-10"
    ],
    "linkedIssueSlug": "wetlands-conservation-ramsar-sites-threats",
    "linkedIssueTitle": "Wetlands — Conservation, Ramsar Sites & Threats",
    "linkedIssueDomain": "ENVIRONMENT"
  },
  {
    "id": "IND-REL-06",
    "slug": "eastern-ghats-cuddapah-hills",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Eastern Ghats & Cuddapah Ranges",
    "aliases": [
      "Veliconda Range",
      "Nallamala Hills",
      "Palkonda Range",
      "Seshachalam Hills",
      "Javadi Hills",
      "Shevaroy Hills"
    ],
    "placeType": "Dissected Relict Fold Belt of Peninsular India",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha, Andhra Pradesh, Tamil Nadu"
    },
    "lat": 14.45,
    "lng": 79.15,
    "neighbours": [
      "Bisected by Godavari and Krishna gorges",
      "Seshachalam Biosphere Reserve (Tirupati hills), Javadi & Shevaroy hills in Tamil Nadu"
    ],
    "staticFacts": [
      "Unlike the continuous Western Ghats, the Eastern Ghats form an ancient, heavily dissected, discontinuous chain of relict hills eroded by major east-flowing rivers (Mahanadi, Godavari, Krishna, Kaveri).",
      "UPSC & CDS 2014 Fact: Veliconda group of low hills is a structural part of the Eastern Ghats in Andhra Pradesh (running parallel to the Coromandel coast between Nellore and Prakasam).",
      "Key relief sequence (North to South): Nallamala Hills → Veliconda Range → Palkonda Range → Seshachalam Hills (home to endemic Red Sanders) → Nagari Hills → Javadi Hills → Shevaroy Hills (Salem, bauxite deposits)."
    ],
    "similarPYQ": [
      "GEO-CDS1-2014-06",
      "GEO-CDS2-2017-03",
      "GEO-CDS2-2019-05"
    ],
    "linkedIssueSlug": "peninsular-plateau-coastal-plains-island-groups",
    "linkedIssueTitle": "Peninsular Plateau, Coastal Plains & Island Groups",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-REL-07",
    "slug": "himalayan-strategic-mountain-passes",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Himalayan Strategic Mountain Passes",
    "aliases": [
      "Zoji La",
      "Shipki La",
      "Lipulekh",
      "Nathu La",
      "Jelep La",
      "Bomdi La",
      "Rohtang Pass",
      "Banihal Pass"
    ],
    "placeType": "High-Altitude Trans-Himalayan Strategic Gateways",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Ladakh, J&K, HP, Uttarakhand, Sikkim, Arunachal Pradesh"
    },
    "lat": 34.28,
    "lng": 75.58,
    "neighbours": [
      "Connect Indian valleys across Greater Himalayas to Tibet, Xinjiang, and Central Asia",
      "Key axes of border trade and strategic defense"
    ],
    "staticFacts": [
      "Zoji La (3,528 m): situated on the Great Himalayan range; connects Srinagar to Kargil and Leh; Zoji La all-weather tunnel under construction.",
      "Shipki La: located in Kinnaur district of Himachal Pradesh; through this pass the Sutlej river enters India from Tibet; ancient Silk Road branch.",
      "Lipulekh Pass: located at the tri-junction of Uttarakhand (India), Tibet (China), and Nepal; historic route for Kailash Mansarovar pilgrimage.",
      "Nathu La & Jelep La: strategic passes in East Sikkim connecting Sikkim to Chumbi Valley in Tibet; reopened for border trade in 2006."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03",
      "GEO-UPSC-2017-03",
      "GEO-CDS2-2019-05"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-REL-08",
    "slug": "odisha-coast-chandipur-kalam-island",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Odisha Coast, Chandipur Beach & Abdul Kalam Island",
    "aliases": [
      "Chandipur-on-Sea",
      "Hide and Seek Beach",
      "Wheeler Island",
      "Dr. Abdul Kalam Island",
      "Integrated Test Range",
      "Balasore Coast"
    ],
    "placeType": "Macro-Tidal Beach & Defence Testing Island",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha",
      "district": "Balasore, Bhadrak"
    },
    "lat": 21.468,
    "lng": 87.024,
    "neighbours": [
      "Mouth of Budhabalanga river",
      "Dhamra port and Bhitarkanika mangrove estuary situated to the south"
    ],
    "staticFacts": [
      "UPSC 2017 Fact: At Chandipur beach in Odisha, sea water recedes seaward by up to 5 kilometres from the shoreline twice daily during low tide, leaving the flat sand bed exposed for visitors to walk on the seafloor.",
      "Dr. Abdul Kalam Island (formerly Wheeler Island): located ~10 km off the coast in the Bay of Bengal; serves as India's Integrated Test Range (ITR) for testing long-range ballistic missiles (Agni, Prithvi)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2017-01",
      "GEO-UPSC-2015-09"
    ],
    "linkedIssueSlug": "peninsular-plateau-coastal-plains-island-groups",
    "linkedIssueTitle": "Peninsular Plateau, Coastal Plains & Island Groups",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-REL-09",
    "slug": "living-root-bridges-meghalaya",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Living Root Bridges & Meghalaya Karst Plateau",
    "aliases": [
      "Jingkieng Jri",
      "Ficus elastica",
      "Nongriat Double Decker",
      "Cherrapunji",
      "Sohra",
      "Mawsynram",
      "Khasi Hills"
    ],
    "placeType": "Bio-Engineering Living Architecture & Karst Landscape",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Meghalaya",
      "district": "East Khasi Hills, West Jaintia Hills"
    },
    "lat": 25.25,
    "lng": 91.68,
    "neighbours": [
      "Southern escarpment of Shillong Plateau overlooking Bangladesh plains (Surma/Meghna valley)",
      "Funnel-shaped orientation causes world-record orographic rainfall"
    ],
    "staticFacts": [
      "UPSC 2015 Fact: In Meghalaya, the indigenous Khasi and Jaintia tribal communities train the secondary aerial roots of rubber fig trees (Ficus elastica) across fast-flowing mountain streams to form \"Living Root Bridges\" (Jingkieng Jri); included in UNESCO tentative list.",
      "Mawsynram and Cherrapunji receive the highest average annual rainfall in the world (>11,000 mm) due to the funneling effect of the Garo-Khasi-Jaintia hills trapping the Bay of Bengal monsoon branch."
    ],
    "similarPYQ": [
      "GEO-UPSC-2015-11",
      "GEO-CDS1-2018-09"
    ],
    "linkedIssueSlug": "peninsular-plateau-coastal-plains-island-groups",
    "linkedIssueTitle": "Peninsular Plateau, Coastal Plains & Island Groups",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-HER-05",
    "slug": "ashokan-major-rock-edicts-loci",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Ancient History",
    "mapCategory": [
      "Historical & archaeological sites"
    ],
    "place": "Ashokan Major Rock Edict Sites — Dhauli, Jaugada, Kalsi & Erragudi",
    "aliases": [
      "Dhauli Elephant",
      "Jaugada",
      "Kalsi",
      "Erragudi",
      "Yerragudi",
      "Girnar",
      "Sopara",
      "Sannati"
    ],
    "placeType": "Imperial Epigraphic Monuments of Mauryan Empire",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha, Uttarakhand, Andhra Pradesh, Gujarat, Karnataka"
    },
    "lat": 20.1917,
    "lng": 85.8394,
    "neighbours": [
      "Dhauli lies on Daya river bank near Bhubaneswar",
      "Kalsi lies at Yamuna-Tons confluence near Dehradun",
      "Jaugada lies on Rishikulya river in Ganjam"
    ],
    "staticFacts": [
      "UPSC 2022 Fact: Dhauli is in Odisha (famous carved rock elephant above edicts); Erragudi / Yerragudi is in Kurnool district of Andhra Pradesh (NOT MP; contains Minor and Major Rock Edicts in unique boustrophedon script); Jaugada is in Ganjam district of Odisha; Kalsi is in Dehradun, Uttarakhand (the only Major Rock Edict in Northern India).",
      "Major Rock Edict XIII (describing Kalinga war horrors) is famously omitted from Dhauli and Jaugada, replaced by the Separate Kalinga Edicts addressing the judicial officers and border populations with fatherly compassion."
    ],
    "similarPYQ": [
      "ART-UPSC-2022-01",
      "ART-UPSC-2016-03",
      "ANC-UPSC-2020-03"
    ],
    "linkedIssueSlug": "ashoka-the-great-kalinga-war-dhamma-inscriptions-edicts",
    "linkedIssueTitle": "Ashoka the Great — Kalinga War, Dhamma, Inscriptions & Edicts",
    "linkedIssueDomain": "ANCIENT HISTORY"
  },
  {
    "id": "IND-HER-06",
    "slug": "ancient-medieval-seaports",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Ancient History",
    "mapCategory": [
      "Historical & archaeological sites"
    ],
    "place": "Ancient & Medieval Seaports — Motupalli, Ghantasala, Kadura & Chaul",
    "aliases": [
      "Motupalli Port",
      "Ghantasala",
      "Kadura",
      "Chaul",
      "Muziris",
      "Korkai",
      "Poompuhar",
      "Arikamedu"
    ],
    "placeType": "Maritime Trade Emposria & Guild Harbours",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Andhra Pradesh, Maharashtra, Kerala, Tamil Nadu"
    },
    "lat": 15.72,
    "lng": 80.3,
    "neighbours": [
      "Motupalli on the Andhra coast near Machilipatnam",
      "Ghantasala and Kadura on the Krishna delta",
      "Chaul south of Mumbai in the Konkan"
    ],
    "staticFacts": [
      "UPSC 2017 Fact: Motupalli was a pre-eminent seaport of the Kakatiya kingdom (reign of King Ganapatideva, who issued the famous Motupalli Inscription guaranteeing safety and fair taxes to foreign merchants; visited by Venetian traveller Marco Polo in 1293).",
      "UPSC 2020 Fact: Ghantasala and Kadura (eastern Coromandel coast) and Chaul (western Konkan coast) were vital commercial ports handling foreign trade during the Gupta period.",
      "Muziris (Kodungallur, Kerala) on the Malabar coast was the main port for Indo-Roman maritime pepper trade; Korkai was the famous pearl fishing port of the early Pandyas."
    ],
    "similarPYQ": [
      "ANC-UPSC-2017-02",
      "ANC-UPSC-2020-04",
      "ANC-UPSC-2012-01"
    ],
    "linkedIssueSlug": "ancient-indian-guilds-shrenis-trade-routes-maritime-ports",
    "linkedIssueTitle": "Ancient Indian Guilds (Shrenis), Trade Routes & Maritime Ports",
    "linkedIssueDomain": "ANCIENT HISTORY"
  },
  {
    "id": "IND-HER-07",
    "slug": "early-medieval-capital-cities",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Ancient History",
    "mapCategory": [
      "Historical & archaeological sites"
    ],
    "place": "Early Medieval Capital Cities — Bhilsa, Dwarasamudra, Girinagar & Sthanesvara",
    "aliases": [
      "Bhilsa",
      "Vidisha",
      "Dwarasamudra",
      "Halebidu",
      "Girinagar",
      "Junagadh",
      "Sthanesvara",
      "Thanesar"
    ],
    "placeType": "Dynastic Seats & Architectural Centers",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Karnataka, Gujarat, Haryana"
    },
    "lat": 23.525,
    "lng": 77.808,
    "neighbours": [
      "Bhilsa on Betwa river in MP",
      "Dwarasamudra in Hassan district of Karnataka",
      "Sthanesvara in Kurukshetra, Haryana"
    ],
    "staticFacts": [
      "UPSC 2020 Fact: Bhilsa (ancient Vidisha) is in Madhya Pradesh (NOT Maharashtra); Dwarasamudra (modern Halebidu) was the capital of the Hoysalas in Karnataka (NOT Maharashtra); Girinagar is ancient Junagadh in Gujarat; Sthanesvara (modern Thanesar, Haryana) was the ancestral seat of Harshavardhana's Pushyabhuti dynasty (NOT Uttar Pradesh).",
      "Dwarasamudra is celebrated for the star-shaped Hoysaleswara Temple built in soapstone (chloritic schist) with intricate friezes."
    ],
    "similarPYQ": [
      "ANC-UPSC-2020-03",
      "MED-CDS2-2015-02"
    ],
    "linkedIssueSlug": "epigraphy-numismatics-land-grants-feudal-institutions",
    "linkedIssueTitle": "Epigraphy, Numismatics, Land Grants & Feudal Institutions",
    "linkedIssueDomain": "ANCIENT HISTORY"
  },
  {
    "id": "WLD-SEA-04",
    "slug": "baltic-sea-littoral",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Baltic Sea & Scandinavian Littoral",
    "aliases": [
      "Gulf of Bothnia",
      "Gulf of Finland",
      "Gulf of Riga",
      "Kattegat",
      "Skagerrak",
      "Baltic States"
    ],
    "placeType": "Northern European Brackish Inland Sea",
    "priority": "High",
    "locatedIn": {
      "country": "Sweden, Finland, Russia, Estonia, Latvia, Lithuania, Poland, Germany, Denmark"
    },
    "lat": 58,
    "lng": 20,
    "neighbours": [
      "Bordered by 9 sovereign states: Sweden, Finland, Russia, Estonia, Latvia, Lithuania, Poland, Germany, Denmark",
      "Connected to the North Sea via the Danish Straits (Oresund, Great Belt, Little Belt)"
    ],
    "staticFacts": [
      "UPSC 2024 Fact: Finland, Germany, and Russia border the Baltic Sea; Norway does NOT border the Baltic Sea (Norway borders the North Sea, Norwegian Sea, and Barents Sea).",
      "Brackish water body with low salinity due to high river inflow and limited water exchange through the narrow Danish straits; Kaliningrad is an exclave of Russia on the southeastern Baltic coast between Poland and Lithuania."
    ],
    "similarPYQ": [
      "GEO-UPSC-2024-08",
      "GEO-CDS2-2017-11"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-SEA-05",
    "slug": "bering-strait-arctic-gateway",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Bering Strait & Arctic Gateway",
    "aliases": [
      "Diomede Islands",
      "Chukchi Sea",
      "Bering Sea",
      "Cape Dezhnev",
      "Cape Prince of Wales",
      "International Date Line"
    ],
    "placeType": "Arctic–Pacific Maritime Chokepoint & Continental Divide",
    "priority": "High",
    "locatedIn": {
      "country": "Russia & United States"
    },
    "lat": 65.75,
    "lng": -168.95,
    "neighbours": [
      "Separates Asia (Chukotka Peninsula, Russia) from North America (Seward Peninsula, Alaska, USA)",
      "Connects the Chukchi Sea (Arctic Ocean) with the Bering Sea (Pacific Ocean)"
    ],
    "staticFacts": [
      "Narrowest passage is approximately 82 kilometres wide between Cape Dezhnev (easternmost point of Asia, Russia) and Cape Prince of Wales (westernmost point of mainland North America, USA).",
      "UPSC 2025 Fact: In the middle of the strait lie the two Diomede Islands: Big Diomede (Russia) and Little Diomede (USA), which are separated by just 3.8 kilometres; the International Date Line (IDL) and the maritime boundary pass directly between them.",
      "Nome is an Alaskan town on the southern Seward Peninsula; Anadyr is the administrative capital of Chukotka in northeastern Siberia."
    ],
    "similarPYQ": [
      "GEO-UPSC-2025-77",
      "GEO-CDS1-2017-03"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-SEA-06",
    "slug": "mediterranean-islands-basins",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "World – countries, borders & seas"
    ],
    "place": "Mediterranean Major Islands & Maritime Basins",
    "aliases": [
      "Mallorca",
      "Balearic Islands",
      "Corsica",
      "Sardinia",
      "Sicily",
      "Crete",
      "Normandy",
      "Tyrol"
    ],
    "placeType": "Mediterranean Archipelagos & European Historical Regions",
    "priority": "High",
    "locatedIn": {
      "country": "Spain, France, Italy, Greece, Cyprus"
    },
    "lat": 38.5,
    "lng": 14,
    "neighbours": [
      "Surrounded by Southern Europe, Northern Africa, and Western Asia",
      "Connected to Atlantic Ocean via Strait of Gibraltar and to Red Sea via Suez Canal"
    ],
    "staticFacts": [
      "UPSC 2025 Fact: Mallorca is in Spain (the largest of the Balearic Islands; NOT Italy); Normandy is in France on the English Channel (NOT Spain); Tyrol is a historical alpine region split between Austria and Italy (NOT Germany).",
      "Major islands of the Mediterranean in order of area: Sicily (Italy) → Sardinia (Italy) → Cyprus → Corsica (France) → Crete (Greece).",
      "Characterized by Mediterranean climate (Cs in Köppen classification) with hot, dry summers and mild, wet winters; famous global exporter of citrus fruits, olives, grapes, and cork oak."
    ],
    "similarPYQ": [
      "GEO-UPSC-2025-80",
      "GEO-CDS2-2017-12",
      "GEO-UPSC-2019-14"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "WLD-PHY-05",
    "slug": "great-lakes-49th-parallel",
    "pillar": "STATIC",
    "regionScope": "World",
    "subject": "Geography",
    "mapCategory": [
      "World – physical features"
    ],
    "place": "Great Lakes of North America & 49th Parallel Border",
    "aliases": [
      "Lake Superior",
      "Lake Michigan",
      "Lake Huron",
      "Lake Erie",
      "Lake Ontario",
      "49th Parallel North",
      "St. Lawrence River"
    ],
    "placeType": "Glacial Freshwater System & Transcontinental Border",
    "priority": "High",
    "locatedIn": {
      "country": "United States & Canada"
    },
    "lat": 46,
    "lng": -84.5,
    "neighbours": [
      "Border between Canada (British Columbia, Alberta, Saskatchewan, Manitoba, Ontario, Quebec) and USA",
      "St. Lawrence Seaway connects Great Lakes to Atlantic Ocean"
    ],
    "staticFacts": [
      "UPSC 2024 Fact: The longest international land border between any two countries in the world is the Canada–United States border (total length 8,891 km / 5,525 miles); follows the 49th parallel North from Strait of Georgia to Lake of the Woods, then through the Great Lakes and St. Lawrence River.",
      "Five Great Lakes (HOMES: Huron, Ontario, Michigan, Erie, Superior) contain ~21% of the world's surface fresh water; Lake Superior is the world's largest freshwater lake by surface area; Lake Michigan is the only one located entirely within the United States.",
      "Welland Canal bypasses Niagara Falls between Lake Erie and Lake Ontario."
    ],
    "similarPYQ": [
      "GEO-UPSC-2024-79",
      "GEO-CDS1-2017-03"
    ],
    "linkedIssueSlug": "world-physical-features-straits-seas-rivers-mountains-deserts",
    "linkedIssueTitle": "World Physical Features — Straits, Seas, Rivers, Mountains & Deserts",
    "linkedIssueDomain": "GEOGRAPHY"
  }
];
