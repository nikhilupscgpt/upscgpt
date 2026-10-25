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
    "riverDetails": {
      "length": "2,525 km",
      "origin": "Formed at Devprayag (Uttarakhand) by the meeting of Bhagirathi (Gangotri Glacier) and Alaknanda (Satopanth Glacier)",
      "mouth": "Bay of Bengal (splits into Padma in Bangladesh and Hooghly in West Bengal; forms Sundarbans delta)",
      "states": {
        "flowsThrough": [
          "Uttarakhand",
          "Uttar Pradesh",
          "Bihar",
          "West Bengal"
        ],
        "basinStates": [
          "Uttarakhand",
          "Uttar Pradesh",
          "Bihar",
          "West Bengal",
          "Delhi",
          "Haryana",
          "Rajasthan",
          "Madhya Pradesh",
          "Himachal Pradesh",
          "Chhattisgarh",
          "Jharkhand"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Ramganga",
            "note": "Rises in Garhwal; passes through Jim Corbett National Park"
          },
          {
            "name": "Gomti",
            "note": "Only major tributary rising in the plains (Gomat Taal/Fulhar Jheel, Pilibhit)"
          },
          {
            "name": "Ghaghara (Karnali)",
            "note": "Rises near Gurla Mandhata (Tibet); largest tributary by water volume; joined by Sarda (Kali)"
          },
          {
            "name": "Gandak",
            "note": "Rises in Nepal Himalayas (Dhaulagiri & Mt Everest); enters near Champaran"
          },
          {
            "name": "Kosi",
            "note": "'Sorrow of Bihar'; 7 streams (Saptakoshi); famous for severe course shifts and silt"
          },
          {
            "name": "Mahananda",
            "note": "Last major left-bank tributary; rises in Darjeeling hills"
          }
        ],
        "rightBank": [
          {
            "name": "Yamuna",
            "note": "Largest and longest right-bank tributary (1,376 km); rises at Yamunotri"
          },
          {
            "name": "Tamsa (Tons)",
            "note": "Rises in Kaimur Range; joins downstream of Prayagraj"
          },
          {
            "name": "Son",
            "note": "Rises in Amarkantak Plateau (MP); joins directly on right bank near Patna"
          },
          {
            "name": "Punpun",
            "note": "Rises in Palamu hills (Jharkhand); joins near Fatuha"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Panch Prayag",
          "sangam": "Vishnuprayag (Alaknanda+Dhauliganga), Nandaprayag (+Nandakini), Karnaprayag (+Pindar), Rudraprayag (+Mandakini), Devprayag (+Bhagirathi)",
          "state": "Uttarakhand"
        },
        {
          "tributary": "Yamuna",
          "sangam": "Triveni Sangam (Prayagraj)",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Gomti",
          "sangam": "Saidpur (Ghazipur)",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Ghaghara",
          "sangam": "Revelganj (Chhapra)",
          "state": "Bihar"
        },
        {
          "tributary": "Son",
          "sangam": "Danapur / Patna",
          "state": "Bihar"
        },
        {
          "tributary": "Gandak",
          "sangam": "Sonpur (near Patna)",
          "state": "Bihar"
        },
        {
          "tributary": "Kosi",
          "sangam": "Kursela (Katihar)",
          "state": "Bihar"
        }
      ],
      "towns": [
        {
          "name": "Haridwar & Rishikesh",
          "type": "Cultural",
          "significance": "Where Ganga leaves the Himalayas and enters the plains",
          "state": "Uttarakhand"
        },
        {
          "name": "Kanpur",
          "type": "Economic",
          "significance": "Major industrial city and leather hub",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Prayagraj",
          "type": "Cultural",
          "significance": "Triveni Sangam (Kumbh Mela)",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Varanasi",
          "type": "Cultural / Historical",
          "significance": "Continuous ancient living city; Kashi Vishwanath",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Patna (Pataliputra)",
          "type": "Historical / Economic",
          "significance": "Ancient capital of Magadha & Mauryan Empire",
          "state": "Bihar"
        },
        {
          "name": "Kolkata",
          "type": "Economic",
          "significance": "Major port city situated on the Hooghly distributary",
          "state": "West Bengal"
        }
      ],
      "dams": [
        {
          "name": "Tehri Dam",
          "state": "Uttarakhand",
          "type": "Highest dam in India (on Bhagirathi river)"
        },
        {
          "name": "Bhimawala / Pashulok Barrage",
          "state": "Uttarakhand",
          "type": "Rishikesh hydro diversion"
        },
        {
          "name": "Narora Atomic Power Station Barrage",
          "state": "Uttar Pradesh",
          "type": "Cooling water barrage"
        },
        {
          "name": "Kanpur Barrage (Luv Kush Barrage)",
          "state": "Uttar Pradesh",
          "type": "Drinking water supply"
        },
        {
          "name": "Farakka Barrage",
          "state": "West Bengal",
          "type": "Diverts water into Hooghly to flush silt from Kolkata Port; major Indo-Bangladesh treaty (1996)"
        }
      ],
      "protectedAreas": [
        {
          "name": "Gangotri National Park",
          "relation": "Contains the origin glacier (Gaumukh)",
          "state": "Uttarakhand"
        },
        {
          "name": "Jim Corbett National Park",
          "relation": "Drained by Ramganga tributary",
          "state": "Uttarakhand"
        },
        {
          "name": "Dudhwa National Park",
          "relation": "Drained by Suheli and Mohana (Ghaghara/Sharda basin)",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Valmiki National Park & Tiger Reserve",
          "relation": "Situated on the banks of River Gandak",
          "state": "Bihar"
        },
        {
          "name": "Vikramshila Gangetic Dolphin Sanctuary",
          "relation": "50 km stretch of the Ganga in Bhagalpur district dedicated to dolphins",
          "state": "Bihar"
        },
        {
          "name": "Sundarbans National Park & Biosphere Reserve",
          "relation": "World's largest mangrove delta formed at Ganga-Brahmaputra mouth",
          "state": "West Bengal"
        }
      ],
      "species": [
        {
          "name": "Gangetic River Dolphin (Susu)",
          "iucn": "Endangered",
          "role": "India's National Aquatic Animal; blind, uses echolocation; lives only in freshwater"
        },
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Found in tributaries like Chambal and Son"
        },
        {
          "name": "Ganges River Shark",
          "iucn": "Critically Endangered",
          "role": "Rare true freshwater shark found in Hooghly/Ganga waters"
        },
        {
          "name": "Hilsa Fish (Tenualosa ilisha)",
          "iucn": "Least Concern",
          "role": "Anadromous fish; migrates from sea to Ganga to spawn (impacted by Farakka barrage)"
        }
      ],
      "commonMistake": "Remember the West-to-East sequence of left-bank tributaries downstream of Prayagraj: Gomti → Ghaghara → Gandak → Kosi. Also note that Chambal, Betwa, and Ken do NOT join Ganga directly; they join Yamuna!"
    },
    "staticFacts": [
      "Formed at Devprayag by the confluence of Bhagirathi (Gangotri Glacier) and Alaknanda (Satopanth Glacier).",
      "UPSC 2024 Sequence downstream of Prayagraj (West to East): Gomti → Ghaghara → Gandak → Kosi.",
      "Son River rises near Amarkantak and joins the Ganga directly on its right bank near Patna (CDS 2020)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2024-06",
      "GEO-UPSC-2026-11",
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
    "riverDetails": {
      "length": "3,180 km (approx. 1,114 km within India)",
      "origin": "Bokhar Chu glacier near Lake Manasarovar (Kailash Range, Tibet; known as Singi Khamban / Lion's Mouth)",
      "mouth": "Arabian Sea (south of Karachi, Pakistan)",
      "states": {
        "flowsThrough": [
          "Ladakh (India)",
          "Gilgit-Baltistan",
          "Pakistan"
        ],
        "basinStates": [
          "Ladakh",
          "Jammu & Kashmir",
          "Himachal Pradesh",
          "Punjab",
          "Rajasthan",
          "Haryana"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Zanskar",
            "note": "Carves Zanskar gorge in Ladakh; joins Indus at Nimmu"
          },
          {
            "name": "Suru",
            "note": "Originates from Penzella glacier; flows past Kargil"
          },
          {
            "name": "Panjnad (Chenab+Jhelum+Ravi+Sutlej+Beas)",
            "note": "Combined flow of the five Punjab rivers joining Indus at Mithankot (Pakistan)"
          }
        ],
        "rightBank": [
          {
            "name": "Shyok (River of Death)",
            "note": "Rises from Rimo Glacier (Karakoram); joined by Nubra; joins Indus near Skardu"
          },
          {
            "name": "Shigar",
            "note": "Drains Baltoro and K2 glaciers; joins Indus at Skardu"
          },
          {
            "name": "Gilgit",
            "note": "Drains NW Karakoram/Hindukush; joins Indus near Bunji"
          },
          {
            "name": "Kabul",
            "note": "Rises in Hindukush (Afghanistan); joins Indus at Attock"
          },
          {
            "name": "Kurram & Gomal",
            "note": "Right-bank tributaries draining Sulaiman Range"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Zanskar",
          "sangam": "Nimmu Sangam",
          "state": "Ladakh",
          "note": "Famous picturesque confluence near Leh"
        },
        {
          "tributary": "Shyok",
          "sangam": "Keris (near Skardu)",
          "state": "Ladakh / Baltistan"
        },
        {
          "tributary": "Gilgit",
          "sangam": "Bunji / Partab Bridge",
          "state": "Gilgit-Baltistan",
          "note": "Tri-junction of Himalayas, Karakoram & Hindukush"
        },
        {
          "tributary": "Kabul",
          "sangam": "Attock Sangam",
          "state": "Punjab (Pakistan)",
          "note": "Where Indus emerges from the mountains into Punjab plains"
        },
        {
          "tributary": "Panjnad",
          "sangam": "Mithankot Sangam",
          "state": "Punjab / Sindh (Pakistan)",
          "note": "Where the combined Punjab 5 rivers join Indus"
        }
      ],
      "towns": [
        {
          "name": "Leh",
          "type": "Cultural / Historical",
          "significance": "Historic capital of Ladakh Kingdom on the Indus banks",
          "state": "Ladakh"
        },
        {
          "name": "Skardu",
          "type": "Strategic / Tourism",
          "significance": "Gateway to Karakoram 8000ers (K2, Broad Peak)",
          "state": "Gilgit-Baltistan"
        },
        {
          "name": "Attock",
          "type": "Historical / Strategic",
          "significance": "Historic fortress town guarding the Indus river crossing",
          "state": "Pakistan"
        },
        {
          "name": "Hyderabad (Sindh)",
          "type": "Historical",
          "significance": "Major historic cultural capital of lower Indus plain",
          "state": "Pakistan"
        }
      ],
      "dams": [
        {
          "name": "Nimoo Bazgo Hydro Project",
          "state": "Ladakh",
          "type": "Run-of-the-river hydroelectric plant on Indus (45 MW)"
        },
        {
          "name": "Chutak Hydroelectric Project",
          "state": "Ladakh",
          "type": "Run-of-the-river project on Suru tributary near Kargil"
        },
        {
          "name": "Tarbela Dam",
          "state": "Pakistan",
          "type": "Massive earth-filled reservoir dam on Indus main stem"
        },
        {
          "name": "Diamer-Bhasha Dam",
          "state": "Gilgit-Baltistan",
          "type": "Under-construction gravity dam on Indus"
        }
      ],
      "protectedAreas": [
        {
          "name": "Hemis National Park",
          "relation": "India's largest national park; bounded by the Indus river on the north (Snow Leopard habitat)",
          "state": "Ladakh"
        },
        {
          "name": "Karakoram Wildlife Sanctuary",
          "relation": "Drained by the Shyok river tributary (Tibetan Antelope / Chiru)",
          "state": "Ladakh"
        },
        {
          "name": "Changthang Cold Desert Sanctuary",
          "relation": "Surrounds high-altitude Indus headwaters and Tso Moriri lake",
          "state": "Ladakh"
        }
      ],
      "species": [
        {
          "name": "Indus River Dolphin (Platanista minor)",
          "iucn": "Endangered",
          "role": "State aquatic animal of Punjab; survives in Beas river in India and Indus main stem in Pakistan"
        },
        {
          "name": "Snow Leopard (Panthera uncia)",
          "iucn": "Vulnerable",
          "role": "Apex predator of the Indus gorges in Hemis and Ladakh"
        },
        {
          "name": "Tibetan Antelope (Chiru)",
          "iucn": "Near Threatened",
          "role": "Inhabits high altitude valleys of Shyok and Chang Chenmo"
        }
      ],
      "commonMistake": "UPSC 2021 Trap: Jhelum and Ravi join Chenab; Beas joins Sutlej; Chenab then joins Sutlej to form Panjnad, which then pours directly into the Indus. Chenab is the largest tributary by volume!"
    },
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
        30.4115,
        82.4005
      ],
      [
        30.365,
        82.7227
      ],
      [
        30.371,
        82.8252
      ],
      [
        30.3357,
        82.8858
      ],
      [
        30.261,
        82.9388
      ],
      [
        30.1261,
        83.1643
      ],
      [
        29.8333,
        83.761
      ],
      [
        29.7607,
        83.9253
      ],
      [
        29.7106,
        83.9825
      ],
      [
        29.659,
        83.9872
      ],
      [
        29.6174,
        84.0139
      ],
      [
        29.5859,
        84.0627
      ],
      [
        29.5553,
        84.1887
      ],
      [
        29.5255,
        84.3918
      ],
      [
        29.4519,
        84.5011
      ],
      [
        29.3347,
        84.5166
      ],
      [
        29.2537,
        84.6342
      ],
      [
        29.2086,
        84.8539
      ],
      [
        29.221,
        85.0141
      ],
      [
        29.2907,
        85.1146
      ],
      [
        29.3128,
        85.2258
      ],
      [
        29.2744,
        85.4087
      ],
      [
        29.2041,
        85.5919
      ],
      [
        29.1952,
        85.8671
      ],
      [
        29.2245,
        86.2953
      ],
      [
        29.2089,
        86.7345
      ],
      [
        29.1482,
        87.1844
      ],
      [
        29.1263,
        87.4721
      ],
      [
        29.1515,
        87.6602
      ],
      [
        29.2882,
        87.7472
      ],
      [
        29.3491,
        87.8233
      ],
      [
        29.3797,
        87.9172
      ],
      [
        29.3805,
        88.0154
      ],
      [
        29.3516,
        88.1176
      ],
      [
        29.3473,
        88.1819
      ],
      [
        29.3677,
        88.2082
      ],
      [
        29.3663,
        88.2567
      ],
      [
        29.343,
        88.3273
      ],
      [
        29.3361,
        88.4297
      ],
      [
        29.3507,
        88.6308
      ],
      [
        29.366,
        89.4036
      ],
      [
        29.359,
        89.6988
      ],
      [
        29.3349,
        89.7739
      ],
      [
        29.3339,
        89.8621
      ],
      [
        29.3563,
        89.9633
      ],
      [
        29.3597,
        90.082
      ],
      [
        29.3441,
        90.218
      ],
      [
        29.3155,
        90.3213
      ],
      [
        29.2739,
        90.392
      ],
      [
        29.2785,
        90.5056
      ],
      [
        29.3292,
        90.6621
      ],
      [
        29.3399,
        90.7464
      ],
      [
        29.3104,
        90.7586
      ],
      [
        29.3079,
        90.7859
      ],
      [
        29.3323,
        90.8284
      ],
      [
        29.3374,
        90.8967
      ],
      [
        29.3165,
        91.038
      ],
      [
        29.2812,
        92.0762
      ],
      [
        29.2313,
        92.4652
      ],
      [
        29.1553,
        92.5513
      ],
      [
        29.1013,
        92.6945
      ],
      [
        29.0695,
        92.8949
      ],
      [
        29.0725,
        93.0229
      ],
      [
        29.1105,
        93.0784
      ],
      [
        29.1065,
        93.1169
      ],
      [
        29.0606,
        93.1383
      ],
      [
        29.0293,
        93.1827
      ],
      [
        29.0125,
        93.2497
      ],
      [
        29.0496,
        93.3311
      ],
      [
        29.1404,
        93.4267
      ],
      [
        29.1783,
        93.5681
      ],
      [
        29.1632,
        93.7553
      ],
      [
        29.1711,
        93.9316
      ],
      [
        29.2018,
        94.0969
      ],
      [
        29.2402,
        94.2237
      ],
      [
        29.3095,
        94.356
      ],
      [
        29.4387,
        94.5257
      ],
      [
        29.4843,
        94.641
      ],
      [
        29.4893,
        94.7585
      ],
      [
        29.5212,
        94.844
      ],
      [
        29.5801,
        94.8974
      ],
      [
        29.6362,
        94.9189
      ],
      [
        29.6894,
        94.9087
      ],
      [
        29.7281,
        94.9588
      ],
      [
        29.7522,
        95.0693
      ],
      [
        29.7932,
        95.1255
      ],
      [
        29.8512,
        95.1277
      ],
      [
        29.876,
        95.1708
      ],
      [
        29.8674,
        95.2546
      ],
      [
        29.8502,
        95.2945
      ],
      [
        29.8242,
        95.2903
      ],
      [
        29.8012,
        95.3122
      ],
      [
        29.7811,
        95.3601
      ],
      [
        29.6911,
        95.3951
      ],
      [
        29.531,
        95.4176
      ],
      [
        29.4104,
        95.3852
      ],
      [
        29.3291,
        95.2981
      ],
      [
        29.2584,
        95.1911
      ],
      [
        29.1983,
        95.0643
      ],
      [
        29.0898,
        94.944
      ],
      [
        28.9329,
        94.8303
      ],
      [
        28.8461,
        94.8089
      ],
      [
        28.8294,
        94.8799
      ],
      [
        28.7506,
        94.961
      ],
      [
        28.6098,
        95.0523
      ],
      [
        28.506,
        95.0966
      ],
      [
        28.4391,
        95.0939
      ],
      [
        28.3759,
        95.0676
      ],
      [
        28.3163,
        95.0179
      ],
      [
        28.2582,
        95.0027
      ],
      [
        28.2018,
        95.0222
      ],
      [
        28.1722,
        95.0878
      ],
      [
        28.1694,
        95.1994
      ],
      [
        28.1268,
        95.2905
      ],
      [
        28.0029,
        95.3965
      ],
      [
        27.8836,
        95.4438
      ],
      [
        27.8057,
        95.3692
      ],
      [
        27.7295,
        95.1885
      ],
      [
        27.6983,
        95.1165
      ],
      [
        27.6834,
        95.1036
      ],
      [
        27.6785,
        95.1085
      ],
      [
        27.6758,
        95.1221
      ],
      [
        27.6656,
        95.1373
      ],
      [
        27.644,
        95.1385
      ],
      [
        27.6151,
        95.0837
      ],
      [
        27.586,
        94.9723
      ],
      [
        27.5432,
        94.878
      ],
      [
        27.4866,
        94.8006
      ],
      [
        27.4129,
        94.7252
      ],
      [
        27.3221,
        94.6517
      ],
      [
        27.278,
        94.6304
      ],
      [
        27.234,
        94.5975
      ],
      [
        27.1889,
        94.567
      ],
      [
        27.1305,
        94.5589
      ],
      [
        27.0723,
        94.5177
      ],
      [
        27.0142,
        94.4434
      ],
      [
        26.9519,
        94.335
      ],
      [
        26.8854,
        94.1927
      ],
      [
        26.8672,
        94.1195
      ],
      [
        26.8674,
        94.023
      ],
      [
        26.732,
        93.7516
      ],
      [
        26.7387,
        93.4033
      ],
      [
        26.7175,
        93.2452
      ],
      [
        26.6708,
        93.1612
      ],
      [
        26.6356,
        93.0085
      ],
      [
        26.612,
        92.787
      ],
      [
        26.5796,
        92.6559
      ],
      [
        26.5382,
        92.6151
      ],
      [
        26.5214,
        92.5438
      ],
      [
        26.5293,
        92.4421
      ],
      [
        26.4949,
        92.3124
      ],
      [
        26.4184,
        92.1547
      ],
      [
        26.3609,
        92.0711
      ],
      [
        26.3225,
        92.0617
      ],
      [
        26.2705,
        91.9658
      ],
      [
        26.1639,
        91.6438
      ],
      [
        26.1478,
        91.5468
      ],
      [
        26.1507,
        91.4363
      ],
      [
        26.1832,
        91.2504
      ],
      [
        26.2047,
        91.1524
      ],
      [
        26.1915,
        91.0523
      ],
      [
        26.1508,
        90.9172
      ],
      [
        26.155,
        90.7598
      ],
      [
        26.2043,
        90.5799
      ],
      [
        26.1743,
        90.3561
      ],
      [
        26.0652,
        90.0882
      ],
      [
        25.9013,
        89.8901
      ],
      [
        25.6824,
        89.7618
      ],
      [
        25.4901,
        89.6989
      ],
      [
        25.3246,
        89.7014
      ],
      [
        25.1684,
        89.6801
      ],
      [
        25.0263,
        89.6212
      ],
      [
        24.9484,
        89.6126
      ],
      [
        24.8949,
        89.6196
      ],
      [
        24.6493,
        89.7291
      ],
      [
        24.4114,
        89.7499
      ],
      [
        24.3302,
        89.7393
      ],
      [
        24.1718,
        89.8087
      ],
      [
        24.0821,
        89.9229
      ],
      [
        23.9711,
        90.1157
      ],
      [
        23.8691,
        90.2141
      ],
      [
        23.7759,
        90.2181
      ],
      [
        23.7346,
        90.2439
      ],
      [
        23.7453,
        90.2914
      ],
      [
        23.7087,
        90.3554
      ],
      [
        23.583,
        90.4763
      ],
      [
        23.5371,
        90.5616
      ]
    ],
    "neighbours": [
      "Right-bank (W→E): Teesta, Sankosh, Manas, Kameng, Subansiri",
      "Left-bank: Dibang, Lohit, Burhi Dihing, Dhansiri, Kopili"
    ],
    "riverDetails": {
      "length": "2,900 km (approx. 916 km in India)",
      "origin": "Chemayungdung Glacier near Mount Kailash & Lake Manasarovar (Tibet; flows east as Yarlung Tsangpo)",
      "mouth": "Bay of Bengal (merges with Padma in Bangladesh to form Meghna; world's largest delta)",
      "states": {
        "flowsThrough": [
          "Arunachal Pradesh",
          "Assam",
          "Bangladesh"
        ],
        "basinStates": [
          "Arunachal Pradesh",
          "Assam",
          "Meghalaya",
          "Nagaland",
          "Sikkim",
          "West Bengal"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Dibang (Sikang)",
            "note": "Flows through Mishmi Hills; joins Siang near Sadiya"
          },
          {
            "name": "Lohit",
            "note": "Rises in eastern Tibet; flows through Brahmakund; joins Siang at Sadiya"
          },
          {
            "name": "Dhansiri (South)",
            "note": "Rises in Laisang peak (Nagaland); flows past Intanki NP into Brahmaputra"
          },
          {
            "name": "Kopili",
            "note": "Rises in Meghalaya plateau; major hydroelectric river of Assam"
          }
        ],
        "rightBank": [
          {
            "name": "Subansiri (Gold River)",
            "note": "Antecedent trans-Himalayan tributary; largest right-bank feeder"
          },
          {
            "name": "Kameng (Jia Bhoreli)",
            "note": "Rises in Tawang/Tibet border; passes Pakke TR and Nameri NP"
          },
          {
            "name": "Manas",
            "note": "Transboundary river from Bhutan; cuts through Manas National Park"
          },
          {
            "name": "Sankosh",
            "note": "Originates in Bhutan; forms border between Assam and West Bengal"
          },
          {
            "name": "Teesta",
            "note": "Rises in Tso Lhamo lake (Sikkim); lifeline of Sikkim; joins Jamuna in Bangladesh"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Siang + Dibang + Lohit",
          "sangam": "Kobo Chapori (near Sadiya)",
          "state": "Assam / Arunachal border",
          "note": "Where the river officially takes the name Brahmaputra"
        },
        {
          "tributary": "Subansiri",
          "sangam": "Lakhimpur / Majuli Confluence",
          "state": "Assam"
        },
        {
          "tributary": "Kameng",
          "sangam": "Tezpur Sangam",
          "state": "Assam"
        },
        {
          "tributary": "Manas",
          "sangam": "Jogighopa Sangam",
          "state": "Assam"
        },
        {
          "tributary": "Teesta",
          "sangam": "Chilmari / Teesta-mukh",
          "state": "Bangladesh",
          "note": "Joins Jamuna in Rangpur division"
        }
      ],
      "towns": [
        {
          "name": "Sadiya & Pasighat",
          "type": "Gateway",
          "significance": "Where Siang emerges from the Great Bend into Assam Valley",
          "state": "Arunachal Pradesh / Assam"
        },
        {
          "name": "Dibrugarh",
          "type": "Economic",
          "significance": "Tea city of India on the south bank; site of Bogibeel Bridge",
          "state": "Assam"
        },
        {
          "name": "Tezpur",
          "type": "Cultural",
          "significance": "Historic Sonitpur on the north bank; Kolia Bhomora Setu",
          "state": "Assam"
        },
        {
          "name": "Guwahati",
          "type": "Administrative",
          "significance": "Gateway to Northeast; Kamakhya Temple; Umananda river island",
          "state": "Assam"
        },
        {
          "name": "Majuli Island",
          "type": "Cultural / Geographical",
          "significance": "World's largest river island; Vaishnavite Satras",
          "state": "Assam"
        }
      ],
      "dams": [
        {
          "name": "Subansiri Lower Hydroelectric Project",
          "state": "Arunachal Pradesh / Assam border",
          "type": "Run-of-the-river project (2,000 MW, India's largest ongoing hydro project)"
        },
        {
          "name": "Ranganadi Hydroelectric Project",
          "state": "Arunachal Pradesh",
          "type": "Run-of-the-river scheme in Lower Subansiri basin"
        },
        {
          "name": "Kameng Hydroelectric Project",
          "state": "Arunachal Pradesh",
          "type": "Major 600 MW hydro project on Bichom and Tenga tributaries"
        },
        {
          "name": "Kurichhu Hydro Project",
          "state": "Bhutan (Manas basin)",
          "type": "Supplies power to NE India under bilateral partnership"
        }
      ],
      "protectedAreas": [
        {
          "name": "Kaziranga National Park",
          "relation": "Bounded by Brahmaputra on north; home to 70% of world's One-horned Rhinos",
          "state": "Assam"
        },
        {
          "name": "Manas National Park & Biosphere Reserve",
          "relation": "Contiguous with Royal Manas NP Bhutan; drained by River Manas",
          "state": "Assam"
        },
        {
          "name": "Nameri National Park & Pakke TR",
          "relation": "Divided and drained by the Kameng (Jia Bhoreli) river",
          "state": "Assam / Arunachal"
        },
        {
          "name": "Dibru-Saikhowa National Park",
          "relation": "Bounded by Brahmaputra and Lohit rivers; famous for Feral Horses",
          "state": "Assam"
        },
        {
          "name": "Orang National Park (Mini Kaziranga)",
          "relation": "Located on the north bank of Brahmaputra; rhino habitat",
          "state": "Assam"
        }
      ],
      "species": [
        {
          "name": "Greater One-horned Rhinoceros",
          "iucn": "Vulnerable",
          "role": "Flagship herbivore of Brahmaputra floodplain grasslands"
        },
        {
          "name": "Pygmy Hog (Porcula salvania)",
          "iucn": "Endangered",
          "role": "World's smallest wild pig; endemic to Manas river grasslands"
        },
        {
          "name": "Gangetic River Dolphin",
          "iucn": "Endangered",
          "role": "Resides throughout the Brahmaputra deep river channels"
        },
        {
          "name": "White-winged Duck (Asarcornis scutulata)",
          "iucn": "Endangered",
          "role": "State bird of Assam; inhabits swampy forest pools in Dibru-Saikhowa"
        }
      ],
      "commonMistake": "Great Bend (Namcha Barwa): River Tsangpo takes a sharp U-turn (syntaxial bend) around Namcha Barwa (7,782 m) to enter India as Siang/Dihang. UPSC 2016 question: Teesta joins Brahmaputra (Jamuna) in Bangladesh, NOT Ganga directly!"
    },
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
    "riverDetails": {
      "length": "1,465 km",
      "origin": "Trimbakeshwar in the Brahmagiri hills (Nashik, Maharashtra)",
      "mouth": "Bay of Bengal, forming a large mangrove delta at Coringa (Andhra Pradesh)",
      "states": {
        "flowsThrough": [
          "Maharashtra",
          "Telangana",
          "Andhra Pradesh",
          "Puducherry (Yanam)"
        ],
        "basinStates": [
          "Maharashtra",
          "Telangana",
          "Andhra Pradesh",
          "Madhya Pradesh",
          "Chhattisgarh",
          "Odisha",
          "Karnataka"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Purna",
            "note": "Rises in Ajanta Hills"
          },
          {
            "name": "Pranhita",
            "note": "Wainganga + Wardha + Penganga combined; largest tributary"
          },
          {
            "name": "Indravati",
            "note": "Rises in Dandakaranya; famous for Chitrakote waterfall"
          },
          {
            "name": "Sabari",
            "note": "Sinkaram Hill; Kolab is its upper course"
          },
          {
            "name": "Sileru",
            "note": "Tributary of Sabari; hydro projects"
          }
        ],
        "rightBank": [
          {
            "name": "Pravara",
            "note": "Rises in Kalsubai; joins at Nevasa Sangam"
          },
          {
            "name": "Sindphana",
            "note": "Flows from Chhatrapati Sambhajinagar"
          },
          {
            "name": "Manjira",
            "note": "Only major right-bank tributary; hosts Nizam Sagar dam"
          },
          {
            "name": "Maner",
            "note": "Rises in Telangana; joins downstream of Pochampad"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Pravara",
          "sangam": "Pravara Sangam (Nevasa)",
          "state": "Maharashtra"
        },
        {
          "tributary": "Pranhita",
          "sangam": "Kaleshwaram",
          "state": "Telangana",
          "note": "Site of Kaleshwaram Lift Irrigation"
        },
        {
          "tributary": "Indravati",
          "sangam": "Somnoor / Bhadrakali",
          "state": "Telangana/Chhattisgarh border"
        },
        {
          "tributary": "Sabari",
          "sangam": "Kunavaram",
          "state": "Andhra Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Nashik",
          "type": "Cultural",
          "significance": "Kumbh Mela & Trimbakeshwar Jyotirlinga",
          "state": "Maharashtra"
        },
        {
          "name": "Paithan",
          "type": "Historical",
          "significance": "Ancient capital of Satavahanas (Pratishthana)",
          "state": "Maharashtra"
        },
        {
          "name": "Nanded",
          "type": "Cultural",
          "significance": "Hazur Sahib Gurudwara",
          "state": "Maharashtra"
        },
        {
          "name": "Bodhan",
          "type": "Historical",
          "significance": "Ancient capital of Asmaka Mahajanapada (UPSC 2025)",
          "state": "Telangana"
        },
        {
          "name": "Rajahmundry",
          "type": "Economic",
          "significance": "Delta cultural capital, Arthur Cotton Barrage",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Jayakwadi Dam (Nath Sagar)",
          "state": "Maharashtra",
          "type": "Major irrigation & bird sanctuary"
        },
        {
          "name": "Sriram Sagar Project (Pochampad)",
          "state": "Telangana",
          "type": "Key Telangana reservoir"
        },
        {
          "name": "Kaleshwaram Lift Irrigation",
          "state": "Telangana",
          "type": "World's largest multi-stage lift project"
        },
        {
          "name": "Polavaram National Project",
          "state": "Andhra Pradesh",
          "type": "Interstate multi-purpose project"
        },
        {
          "name": "Dowleswaram (Sir Arthur Cotton) Barrage",
          "state": "Andhra Pradesh",
          "type": "Delta canal headworks"
        }
      ],
      "protectedAreas": [
        {
          "name": "Papikonda National Park",
          "relation": "River cuts right through the middle through Papikonda hills gorge",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Indravati National Park",
          "relation": "Indravati river flows along its northern boundary",
          "state": "Chhattisgarh"
        },
        {
          "name": "Coringa Wildlife Sanctuary",
          "relation": "Located in the mangrove estuary of Godavari delta",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Kawal & Tadoba-Andhari Tiger Reserves",
          "relation": "Fall within the wider Godavari/Pranhita basin",
          "state": "Telangana / Maharashtra"
        }
      ],
      "species": [
        {
          "name": "Indian Skimmer",
          "iucn": "Endangered",
          "role": "Nests on river sandbars and delta"
        },
        {
          "name": "Mugger Crocodile",
          "iucn": "Vulnerable",
          "role": "Found in main river & Manjira sanctuary"
        },
        {
          "name": "Smooth-coated Otter",
          "iucn": "Vulnerable",
          "role": "Estuary and mangrove creeks"
        },
        {
          "name": "Fishing Cat",
          "iucn": "Vulnerable",
          "role": "Coringa mangrove delta"
        }
      ],
      "commonMistake": "Don't confuse Pennar or Vamsadhara as Godavari tributaries—they are completely independent east-flowing rivers. Also remember Bhima is a tributary of Krishna, not Godavari."
    },
    "staticFacts": [
      "Largest Peninsular river system (1,465 km); rises at Trimbakeshwar (Nashik district, Western Ghats).",
      "UPSC 2015 Exact Question: Indravati and Pranahita are major left-bank tributaries of Godavari (Vamsadhara and Pennar are independent east-flowing rivers).",
      "UPSC 2016: Godavari and Krishna rivers were linked via the Pattiseema Lift Irrigation Project; Ancient Mahajanapada Asmaka was located on the banks of the Godavari (UPSC 2025)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2015-07",
      "ANC-UPSC-2025-17",
      "GEO-CDS1-2017-08",
      "GEO-UPSC-2016-03",
      "GEO-UPSC-2016-01"
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
    "riverDetails": {
      "length": "1,312 km",
      "origin": "Amarkantak Plateau in Maikal Range (Anuppur district, Madhya Pradesh)",
      "mouth": "Gulf of Khambhat / Arabian Sea (near Bharuch, Gujarat; forms an estuary without delta)",
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Maharashtra",
          "Gujarat"
        ],
        "basinStates": [
          "Madhya Pradesh (86%)",
          "Gujarat (12%)",
          "Maharashtra (2%)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Sher",
            "note": "Rises in Seoni district; joins Narmada in Narsinghpur"
          },
          {
            "name": "Shakkar",
            "note": "Rises in Chhindwara hills; joins Narmada in Narsinghpur"
          },
          {
            "name": "Dudhi",
            "note": "Rises in Mahadeo hills (Satpura range)"
          },
          {
            "name": "Tawa",
            "note": "Longest tributary of Narmada; rises in Satpura Range (Pachmarhi); major Tawa Reservoir"
          },
          {
            "name": "Ganjal",
            "note": "Rises in Betul plateau; joins near Hoshangabad"
          }
        ],
        "rightBank": [
          {
            "name": "Hiran",
            "note": "Rises in Jabalpur hills; largest right-bank tributary"
          },
          {
            "name": "Barna",
            "note": "Rises in Raisen district (Vindhyan range); Barna Dam"
          },
          {
            "name": "Choral",
            "note": "Rises in Vindhyan hills near Mhow"
          },
          {
            "name": "Orsang",
            "note": "Rises in Chhota Udepur (Gujarat); joins near Chandod"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Tawa River",
          "sangam": "Bandrabhan Sangam (Hoshangabad)",
          "state": "Madhya Pradesh",
          "note": "Meeting of Tawa and Narmada; venue of annual Narmada mela"
        },
        {
          "tributary": "Hiran River",
          "sangam": "Sankal Ghat",
          "state": "Madhya Pradesh"
        },
        {
          "tributary": "Orsang River",
          "sangam": "Chandod (Triveni of Orsang, Hiran, Narmada)",
          "state": "Gujarat",
          "note": "Important pilgrimage center"
        }
      ],
      "towns": [
        {
          "name": "Amarkantak",
          "type": "Origin / Cultural",
          "significance": "Sacred source plateau; Narmada Udgam temple & Kapildhara falls",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Jabalpur / Bhedaghat",
          "type": "Scenic / Cultural",
          "significance": "Dhuandhar Falls & Marble Rocks gorge in Mahakoshal region",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Omkareshwar",
          "type": "Pilgrimage",
          "significance": "One of the 12 Jyotirlingas situated on the Om-shaped Mandhata island",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Maheshwar",
          "type": "Historical",
          "significance": "Ancient Mahishmati, capital of Queen Ahilyabai Holkar",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Bharuch",
          "type": "Port / Economic",
          "significance": "Ancient Barygaza port at the mouth on Gulf of Khambhat",
          "state": "Gujarat"
        },
        {
          "name": "Kevadia (Ekta Nagar)",
          "type": "National Symbol",
          "significance": "Site of the 182m Statue of Unity & Sardar Sarovar Dam",
          "state": "Gujarat"
        }
      ],
      "dams": [
        {
          "name": "Sardar Sarovar Dam",
          "state": "Gujarat",
          "type": "Terminal gravity dam on Narmada (1,450 MW); supplies Narmada Canal to Saurashtra/Kutch"
        },
        {
          "name": "Indira Sagar Dam (Punasa)",
          "state": "Madhya Pradesh",
          "type": "India's largest reservoir by water storage capacity (12.22 billion m³)"
        },
        {
          "name": "Omkareshwar Dam",
          "state": "Madhya Pradesh",
          "type": "Major run-of-the-river dam; hosts floating solar farm"
        },
        {
          "name": "Maheshwar Dam",
          "state": "Madhya Pradesh",
          "type": "Hydroelectric power station on lower Narmada"
        },
        {
          "name": "Bargi Dam",
          "state": "Madhya Pradesh",
          "type": "First major completed dam on Narmada near Jabalpur"
        },
        {
          "name": "Tawa Dam",
          "state": "Madhya Pradesh",
          "type": "Large irrigation reservoir on the Tawa tributary inside Hoshangabad"
        }
      ],
      "protectedAreas": [
        {
          "name": "Kanha Tiger Reserve",
          "relation": "Falls in the upper catchment of the Narmada basin in Maikal range",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Satpura National Park & Pachmarhi BR",
          "relation": "Catchment of Tawa and Denwa tributaries of Narmada",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Shoolpaneshwar Wildlife Sanctuary",
          "relation": "Dense teak forest sanctuary surrounding Sardar Sarovar reservoir",
          "state": "Gujarat"
        }
      ],
      "species": [
        {
          "name": "Mahseer (Tor tor)",
          "iucn": "Endangered",
          "role": "State fish of Madhya Pradesh; sacred sport and indicator fish of clear Narmada rapids"
        },
        {
          "name": "Mugger Crocodile",
          "iucn": "Vulnerable",
          "role": "Inhabits the Sardar Sarovar and Narmada canals"
        },
        {
          "name": "Otter (Lutrogale perspicillata)",
          "iucn": "Vulnerable",
          "role": "Inhabits the rocky stretches near Bhedaghat"
        }
      ],
      "commonMistake": "UPSC 2013 Trap: Narmada flows west because it flows through a fault / linear rift valley created by tectonic subsidence, NOT because of any regional slope! It flows between the Vindhyas on the north and Satpuras on the south. Forms estuary, NO delta."
    },
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
    "riverDetails": {
      "length": "805 km",
      "origin": "Talakaveri in Brahmagiri range (Kodagu/Coorg district, Western Ghats, Karnataka)",
      "mouth": "Bay of Bengal at Poompuhar (Kaveripoompattinam, Tamil Nadu; forms a rich agricultural delta)",
      "states": {
        "flowsThrough": [
          "Karnataka",
          "Tamil Nadu"
        ],
        "basinStates": [
          "Tamil Nadu (56%)",
          "Karnataka (41%)",
          "Kerala (3%)",
          "Puducherry (Karaikal)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Harangi",
            "note": "Rises in Pushpagiri Hills; joins Kaveri in Kodagu"
          },
          {
            "name": "Hemavati",
            "note": "Rises in Western Ghats (Mudigere); major Gorur Dam; joins near KRS"
          },
          {
            "name": "Shimsha",
            "note": "Rises in Tumakuru; joins Kaveri near Shivanasamudra Falls"
          },
          {
            "name": "Arkavathi",
            "note": "Rises in Nandi Hills; flows through Bengaluru outskirts; joins at Mekedatu"
          }
        ],
        "rightBank": [
          {
            "name": "Lakshmantirtha",
            "note": "Rises in Brahmagiri hills; passes through Nagarhole NP"
          },
          {
            "name": "Kabini (Kapila)",
            "note": "Rises in Wayanad (Kerala); passes Bandipur-Nagarhole; joins at Tirumakudal Narsipur"
          },
          {
            "name": "Suvarnavathi",
            "note": "Rises in Chamarajanagar; joins near T. Narsipur"
          },
          {
            "name": "Bhavani",
            "note": "Rises in Silent Valley (Kerala); joined by Moyar; meets at Bhavani Sangameshwarar"
          },
          {
            "name": "Noyyal",
            "note": "Rises in Velliangiri hills (Coimbatore); ancient river of Kongu Nadu; joins at Kodumudi"
          },
          {
            "name": "Amaravati",
            "note": "Rises in Anaimalai hills; flows through Karur into Kaveri"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Kabini + Lakshmantirtha",
          "sangam": "Tirumakudal Narsipur (T. Narsipur)",
          "state": "Karnataka",
          "note": "Sacred Triveni Sangam of Karnataka"
        },
        {
          "tributary": "Arkavathi",
          "sangam": "Mekedatu (Goat's Leap)",
          "state": "Karnataka",
          "note": "Deep gorge confluence; proposed balancing reservoir site"
        },
        {
          "tributary": "Bhavani",
          "sangam": "Bhavani Kooduthurai",
          "state": "Tamil Nadu",
          "note": "Dakshina Triveni Sangam with Sangameshwarar temple"
        },
        {
          "tributary": "Amaravati",
          "sangam": "Karur Sangam",
          "state": "Tamil Nadu"
        }
      ],
      "towns": [
        {
          "name": "Srirangapatna",
          "type": "Historical",
          "significance": "River island fortress; capital of Tipu Sultan and Hyder Ali",
          "state": "Karnataka"
        },
        {
          "name": "Mysuru (Mysore)",
          "type": "Cultural",
          "significance": "Historic heritage capital near the Krishnarajasagara dam",
          "state": "Karnataka"
        },
        {
          "name": "Tiruchirappalli (Trichy)",
          "type": "Cultural / Religious",
          "significance": "Famous Srirangam river island temple & Rockfort",
          "state": "Tamil Nadu"
        },
        {
          "name": "Thanjavur (Tanjore)",
          "type": "Historical / Architectural",
          "significance": "Rice bowl of Tamil Nadu; Brihadisvara Chola Temple",
          "state": "Tamil Nadu"
        },
        {
          "name": "Kumbakonam",
          "type": "Cultural",
          "significance": "Temple town situated between Kaveri and Arasalar distributaries",
          "state": "Tamil Nadu"
        },
        {
          "name": "Poompuhar",
          "type": "Ancient Port",
          "significance": "Ancient Chola port city celebrated in Silappadikaram",
          "state": "Tamil Nadu"
        }
      ],
      "dams": [
        {
          "name": "Krishnarajasagara (KRS) Dam",
          "state": "Karnataka",
          "type": "Historic dam built by Sir M. Visvesvaraya; Brindavan Gardens"
        },
        {
          "name": "Kabini Dam",
          "state": "Karnataka",
          "type": "Crucial reservoir on the Kabini tributary"
        },
        {
          "name": "Mettur Dam (Stanley Reservoir)",
          "state": "Tamil Nadu",
          "type": "Main storage reservoir of Tamil Nadu on the Kaveri main stem"
        },
        {
          "name": "Grand Anicut (Kallanai)",
          "state": "Tamil Nadu",
          "type": "Built by Chola King Karikalan in 2nd century CE; one of world's oldest functional water diversion structures"
        },
        {
          "name": "Lower Anicut (Anaikarai)",
          "state": "Tamil Nadu",
          "type": "Distributary canal barrage controlling Kollidam (Coleroon)"
        }
      ],
      "protectedAreas": [
        {
          "name": "Nagarhole National Park & Tiger Reserve",
          "relation": "Kaveri basin; Lakshmantirtha and Kabini form vital lifelines",
          "state": "Karnataka"
        },
        {
          "name": "Bandipur National Park",
          "relation": "Separated from Wayanad by the Moyar and Kabini tributaries",
          "state": "Karnataka"
        },
        {
          "name": "Sathyamangalam Tiger Reserve",
          "relation": "Drained by the Moyar River flowing into Bhavani tributary",
          "state": "Tamil Nadu"
        },
        {
          "name": "Cauvery Wildlife Sanctuary",
          "relation": "Stretches along the Kaveri river in Chamarajanagar/Ramanagara",
          "state": "Karnataka"
        },
        {
          "name": "Wayanad Wildlife Sanctuary",
          "relation": "Catchment of Kabini tributary in Kerala Western Ghats",
          "state": "Kerala"
        }
      ],
      "species": [
        {
          "name": "Humpback Mahseer (Tor remadevii)",
          "iucn": "Critically Endangered",
          "role": "Endemic giant freshwater sport fish exclusively found in Cauvery basin"
        },
        {
          "name": "Grizzled Giant Squirrel",
          "iucn": "Near Threatened",
          "role": "Found in riverine forests of Cauvery Wildlife Sanctuary"
        },
        {
          "name": "Mugger Crocodile",
          "iucn": "Vulnerable",
          "role": "Thrives around Srirangapatna and Ranganathittu Bird Sanctuary"
        }
      ],
      "commonMistake": "UPSC 2020 Question: Nagarhole NP, Bandipur TR, Sathyamangalam TR, and Wayanad WLS all lie in the Cauvery basin (Papikonda NP is on Godavari!). Also note: Kaveri receives water in both summer (SW Monsoon in Western Ghats) and winter (NE Monsoon in Tamil Nadu), making it less seasonal than other peninsular rivers."
    },
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
    "riverDetails": {
      "length": "1,400 km",
      "origin": "Mahabaleshwar in the Western Ghats (Satara district, Maharashtra)",
      "mouth": "Bay of Bengal at Hamsaladeevi (near Machilipatnam, Andhra Pradesh)",
      "states": {
        "flowsThrough": [
          "Maharashtra",
          "Karnataka",
          "Telangana",
          "Andhra Pradesh"
        ],
        "basinStates": [
          "Maharashtra (27%)",
          "Karnataka (44%)",
          "Telangana & Andhra Pradesh (29%)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Bhima",
            "note": "Longest tributary of Krishna (861 km); rises at Bhimashankar; joined by Sina and Mula-Mutha"
          },
          {
            "name": "Dindi",
            "note": "Rises in Mahbubnagar hills; flows through Telangana"
          },
          {
            "name": "Musi",
            "note": "Rises in Ananthagiri hills (Vikarabad); flows through Hyderabad city; joins near Wadapally"
          },
          {
            "name": "Paleru & Munneru",
            "note": "Drain Khammam and Warangal districts in Telangana"
          }
        ],
        "rightBank": [
          {
            "name": "Koyna",
            "note": "Rises near Mahabaleshwar; joins at Karad (Preeti Sangam); Koyna Hydroelectric Project"
          },
          {
            "name": "Panchganga",
            "note": "Flows past Kolhapur; joins Krishna at Narsobawadi"
          },
          {
            "name": "Dudhganga",
            "note": "Flows from Maharashtra/Karnataka border"
          },
          {
            "name": "Ghataprabha",
            "note": "Rises in Western Ghats (Sindhudurg); Gokak Falls; joins near Almatti"
          },
          {
            "name": "Malaprabha",
            "note": "Rises near Kanakumbi; passes historic Aihole/Pattadakal; joins at Kudalasangama"
          },
          {
            "name": "Tungabhadra",
            "note": "Formed by Tunga + Bhadra at Kudli; largest tributary by water discharge; flows past Hampi"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Koyna",
          "sangam": "Karad (Preeti Sangam)",
          "state": "Maharashtra",
          "note": "Memorial site of Yashwantrao Chavan"
        },
        {
          "tributary": "Panchganga",
          "sangam": "Narsobawadi",
          "state": "Maharashtra",
          "note": "Major pilgrimage confluence"
        },
        {
          "tributary": "Malaprabha",
          "sangam": "Kudalasangama",
          "state": "Karnataka",
          "note": "Aikya Mantapa of 12th century social reformer Basavanna"
        },
        {
          "tributary": "Bhima",
          "sangam": "Kurgunti / Kadlur Sangam",
          "state": "Karnataka / Telangana border"
        },
        {
          "tributary": "Tungabhadra",
          "sangam": "Sangameswaram (Kurnool)",
          "state": "Andhra Pradesh",
          "note": "Meeting of Krishna and Tungabhadra upstream of Srisailam"
        },
        {
          "tributary": "Musi",
          "sangam": "Wadapally Sangam",
          "state": "Telangana",
          "note": "Confluence with ancient Shiva temple"
        }
      ],
      "towns": [
        {
          "name": "Satara & Karad",
          "type": "Historical",
          "significance": "Historic Maratha power center on Krishna-Koyna confluence",
          "state": "Maharashtra"
        },
        {
          "name": "Sangli",
          "type": "Economic",
          "significance": "Major turmeric trading hub on the Krishna banks",
          "state": "Maharashtra"
        },
        {
          "name": "Bagalkot",
          "type": "Historical",
          "significance": "Historic chalukyan cultural landscape near Almatti Dam",
          "state": "Karnataka"
        },
        {
          "name": "Hampi (Vijayanagara)",
          "type": "UNESCO World Heritage",
          "significance": "Capital of Vijayanagara Empire on the Tungabhadra tributary",
          "state": "Karnataka"
        },
        {
          "name": "Kurnool",
          "type": "Historical",
          "significance": "Gateway to Rayalaseema on Tungabhadra near Krishna confluence",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Amaravati & Vijayawada",
          "type": "Capital / Economic",
          "significance": "Prakasam Barrage and ancient Buddhist stupa on Krishna banks",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Almatti Dam (Lal Bahadur Shastri Reservoir)",
          "state": "Karnataka",
          "type": "Main upper Krishna multipurpose reservoir (Upper Krishna Project)"
        },
        {
          "name": "Basava Sagar (Narayanpur Dam)",
          "state": "Karnataka",
          "type": "Key downstream reservoir for irrigation in Raichur/Yadgir"
        },
        {
          "name": "Tungabhadra Dam (Pampa Sagar)",
          "state": "Karnataka",
          "type": "Major reservoir on Tungabhadra near Hosapete"
        },
        {
          "name": "Jurala Project (Priyadarshini)",
          "state": "Telangana",
          "type": "First reservoir on Krishna entering Telangana"
        },
        {
          "name": "Srisailam Dam",
          "state": "AP / Telangana border",
          "type": "Major hydroelectric power station and deep canyon gorge reservoir"
        },
        {
          "name": "Nagarjuna Sagar Dam",
          "state": "AP / Telangana border",
          "type": "One of the world's largest masonry dams; creates massive reservoir around Nagarjunakonda"
        },
        {
          "name": "Prakasam Barrage",
          "state": "Andhra Pradesh",
          "type": "Terminal barrage at Vijayawada regulating Krishna delta irrigation"
        }
      ],
      "protectedAreas": [
        {
          "name": "Koyna Wildlife Sanctuary",
          "relation": "Surrounds the Shivsagar lake / Koyna reservoir in Western Ghats",
          "state": "Maharashtra"
        },
        {
          "name": "Amrabad Tiger Reserve",
          "relation": "Extensive dry deciduous forest overlooking the Krishna river gorge",
          "state": "Telangana"
        },
        {
          "name": "Nagarjunsagar-Srisailam Tiger Reserve",
          "relation": "India's largest tiger reserve by core area; surrounds the Krishna river gorge",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Daroji Sloth Bear Sanctuary",
          "relation": "Situated near Hampi in the Tungabhadra basin",
          "state": "Karnataka"
        }
      ],
      "species": [
        {
          "name": "Krishna River Mahseer",
          "iucn": "Endangered",
          "role": "Indigenous river sport fish of upper rapids"
        },
        {
          "name": "Indian Pangolin (Manis crassicaudata)",
          "iucn": "Endangered",
          "role": "Inhabits the dry scrub of Srisailam-Amrabad forest tract"
        },
        {
          "name": "Smooth-coated Otter",
          "iucn": "Vulnerable",
          "role": "Thrives in the Tungabhadra Otter Reserve near Hampi"
        }
      ],
      "commonMistake": "UPSC 2022 Question: Ghataprabha reservoir is in Karnataka (NOT Telangana). Tungabhadra is formed by Tunga + Bhadra rivers uniting at Kudli near Shimoga. Also, remember Musi river (Hyderabad) joins Krishna on its left bank."
    },
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
    "riverDetails": {
      "length": "851 km (Mahanadi)",
      "origin": "Sihawa highlands in Dhamtari/Raipur district (Chhattisgarh)",
      "mouth": "Bay of Bengal at False Point (Kendrapara district, Odisha; forms extensive delta)",
      "states": {
        "flowsThrough": [
          "Chhattisgarh",
          "Odisha"
        ],
        "basinStates": [
          "Chhattisgarh (53%)",
          "Odisha (46%)",
          "Jharkhand & Maharashtra (1%)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Seonath",
            "note": "Longest tributary of Mahanadi; rises in Rajnandgaon; joins near Shivrinarayan"
          },
          {
            "name": "Hasdeo",
            "note": "Rises in Koriya hills; passes Hasdeo Arand forests; Hasdeo Bango Dam"
          },
          {
            "name": "Mand",
            "note": "Drains Raigarh plateau coalfields"
          },
          {
            "name": "Ib",
            "note": "Rises in Raigarh/Jashpur hills; joins directly into Hirakud Reservoir"
          }
        ],
        "rightBank": [
          {
            "name": "Jonk",
            "note": "Rises in Nuapada hills; joins at Shivrinarayan Sangam"
          },
          {
            "name": "Ong",
            "note": "Rises in Gandhamardan hills; joins near Binka"
          },
          {
            "name": "Tel",
            "note": "Second largest tributary of Mahanadi; rises in Nabarangpur; joins near Subarnapur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Seonath + Jonk",
          "sangam": "Shivrinarayan Sangam",
          "state": "Chhattisgarh",
          "note": "Sacred Triveni Sangam of Chhattisgarh"
        },
        {
          "tributary": "Tel River",
          "sangam": "Manamunda / Subarnapur (Sonepur)",
          "state": "Odisha",
          "note": "Confluence with famous Kosaleshwara temple"
        },
        {
          "tributary": "Brahmani River Formation",
          "sangam": "Vedvyas (Rourkela)",
          "state": "Odisha",
          "note": "Sankh + South Koel confluence forming the Brahmani river"
        }
      ],
      "towns": [
        {
          "name": "Raipur & Bilaspur",
          "type": "Industrial / Administrative",
          "significance": "Major urban hubs in the upper Mahanadi/Seonath basin",
          "state": "Chhattisgarh"
        },
        {
          "name": "Sambalpur",
          "type": "Cultural / Economic",
          "significance": "Historic handloom hub situated at the foot of Hirakud Dam",
          "state": "Odisha"
        },
        {
          "name": "Cuttack",
          "type": "Historical",
          "significance": "Millennium city at the apex of the Mahanadi delta (Barabati Fort)",
          "state": "Odisha"
        },
        {
          "name": "Bhubaneswar",
          "type": "Capital",
          "significance": "Temple city of Odisha situated on the Daya/Kuakhai deltaic branches",
          "state": "Odisha"
        },
        {
          "name": "Paradeep",
          "type": "Deepwater Port",
          "significance": "Major artificial deepwater port on the Mahanadi delta mouth",
          "state": "Odisha"
        }
      ],
      "dams": [
        {
          "name": "Hirakud Dam",
          "state": "Odisha",
          "type": "One of the longest earthen dams in the world (25.8 km total); creates 55-km long Hirakud Ramsar Wetland"
        },
        {
          "name": "Hasdeo Bango (Minimata) Dam",
          "state": "Chhattisgarh",
          "type": "Major multi-purpose reservoir in Korba district"
        },
        {
          "name": "Gangrel (Pt. Ravishankar Shukla) Dam",
          "state": "Chhattisgarh",
          "type": "Key reservoir on upper Mahanadi near Dhamtari"
        },
        {
          "name": "Rengali Dam",
          "state": "Odisha",
          "type": "Major dam on the Brahmani River"
        }
      ],
      "protectedAreas": [
        {
          "name": "Satkosia Tiger Reserve & Gorge Sanctuary",
          "relation": "Mahanadi carves a magnificent 22-km deep gorge through the Eastern Ghats",
          "state": "Odisha"
        },
        {
          "name": "Debrigarh Wildlife Sanctuary",
          "relation": "Flanks the right bank of the Hirakud reservoir",
          "state": "Odisha"
        },
        {
          "name": "Bhitarkanika National Park & Ramsar Site",
          "relation": "Delta of Brahmani, Baitarani and Dhamra rivers (Saltwater crocodile haven)",
          "state": "Odisha"
        },
        {
          "name": "Achanakmar Tiger Reserve",
          "relation": "Located in the upper catchment of the Hasdeo/Mahanadi basin",
          "state": "Chhattisgarh"
        }
      ],
      "species": [
        {
          "name": "Gharial & Mugger Crocodile",
          "iucn": "Critically Endangered / Vulnerable",
          "role": "Satkosia Gorge is one of the few sites where both crocodilians coexist"
        },
        {
          "name": "Saltwater Crocodile (Crocodylus porosus)",
          "iucn": "Least Concern",
          "role": "Largest population in India residing in Bhitarkanika delta"
        },
        {
          "name": "Olive Ridley Sea Turtle",
          "iucn": "Vulnerable",
          "role": "World's largest mass nesting rookery at Gahirmatha near the delta mouth"
        }
      ],
      "commonMistake": "UPSC 2021 Question: Nagawali and Vamsadhara rise in the Eastern Ghats of Odisha (NOT Chota Nagpur). Brahmani (formed by Sankh & South Koel) and Subarnarekha rise on the Chota Nagpur plateau! Baitarani rises in Keonjhar hills."
    },
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
    "riverDetails": {
      "length": "960 km (Chambal); 427 km (Ken); 590 km (Betwa)",
      "origin": "Chambal rises at Janapao hills near Mhow in Vindhyas (MP); Betwa rises in Raisen (MP); Ken rises in Barner range (Katni, MP)",
      "mouth": "Yamuna River: Chambal joins Yamuna at Pachnada (Etawah, UP); Betwa joins near Hamirpur; Ken joins near Chilla (Banda)",
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Rajasthan",
          "Uttar Pradesh"
        ],
        "basinStates": [
          "Madhya Pradesh",
          "Rajasthan",
          "Uttar Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Banas",
            "note": "Largest tributary of Chambal; rises in Aravallis near Kumbhalgarh; drains Mewar; joins near Rameshwar"
          },
          {
            "name": "Mej",
            "note": "Rises in Bhilwara; joins Chambal in Kota district"
          }
        ],
        "rightBank": [
          {
            "name": "Shipra (Kshipra)",
            "note": "Rises in Kakri Bardi hills; sacred river of Ujjain (Simhastha Kumbh Mela); joins Chambal"
          },
          {
            "name": "Kali Sindh",
            "note": "Rises in Dewas district; joins Chambal near Gagron Fort"
          },
          {
            "name": "Parbati",
            "note": "Rises in Sehore (Vindhyas); joins Chambal at Pali Sangam"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Banas + Seep",
          "sangam": "Rameshwaram Sangam",
          "state": "Rajasthan / MP border (Sawai Madhopur)",
          "note": "Holy Triveni Sangam of Chambal, Banas and Seep"
        },
        {
          "tributary": "Kali Sindh",
          "sangam": "Gagron Sangam",
          "state": "Rajasthan (Jhalawar)",
          "note": "Surrounds the famous Gagron UNESCO Water Fort"
        },
        {
          "tributary": "Chambal into Yamuna",
          "sangam": "Pachnada (Etawah)",
          "state": "Uttar Pradesh",
          "note": "Confluence of five streams: Chambal, Yamuna, Kwari, Sindh, Pahuj"
        },
        {
          "tributary": "Ken into Yamuna",
          "sangam": "Chilla Sangam (Banda)",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Betwa into Yamuna",
          "sangam": "Hamirpur Sangam",
          "state": "Uttar Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Ujjain",
          "type": "Pilgrimage",
          "significance": "Mahakaleshwar Jyotirlinga and Kumbh Mela on the Shipra tributary",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Kota",
          "type": "Educational / Industrial",
          "significance": "Industrial and coaching hub located on the deep gorge of Chambal",
          "state": "Rajasthan"
        },
        {
          "name": "Gwalior & Morena",
          "type": "Historical",
          "significance": "Heartland of the rugged Chambal ravines and badlands",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Orchha",
          "type": "Historical / Architectural",
          "significance": "Ancient Bundela capital on the banks of Betwa River (Chaturbhuj Temple)",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Vidisha & Sanchi",
          "type": "Historical / Buddhist",
          "significance": "Ancient Heliodorus pillar and UNESCO Sanchi Stupa near Betwa river",
          "state": "Madhya Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Gandhi Sagar Dam",
          "state": "Madhya Pradesh",
          "type": "First of the 4 cascade dams on Chambal; massive reservoir in Mandsaur"
        },
        {
          "name": "Rana Pratap Sagar Dam",
          "state": "Rajasthan (Rawatbhata)",
          "type": "Second cascade dam on Chambal; powers Rajasthan Atomic Power Station"
        },
        {
          "name": "Jawahar Sagar Dam",
          "state": "Rajasthan (Kota)",
          "type": "Third cascade dam; peak-load hydroelectric station"
        },
        {
          "name": "Kota Barrage",
          "state": "Rajasthan (Kota)",
          "type": "Terminal barrage on Chambal feeding canals to Rajasthan and MP"
        },
        {
          "name": "Matatila & Rajghat Dams",
          "state": "UP / MP border",
          "type": "Interstate multipurpose storage dams on the Betwa River"
        },
        {
          "name": "Daudhan Dam (Ken-Betwa Link)",
          "state": "Madhya Pradesh (Panna)",
          "type": "Key component of India's first national river-interlinking project"
        }
      ],
      "protectedAreas": [
        {
          "name": "National Chambal Sanctuary",
          "relation": "Tri-state sanctuary (MP, Rajasthan, UP) protecting 425 km of Chambal river for Gharials",
          "state": "MP / Rajasthan / UP"
        },
        {
          "name": "Panna National Park & Tiger Reserve",
          "relation": "Ken river flows through its heart; core tiger habitat impacted by Ken-Betwa link",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Mukundra Hills Tiger Reserve",
          "relation": "Located in the river valley between Chambal and Kali Sindh",
          "state": "Rajasthan"
        },
        {
          "name": "Ranthambore National Park",
          "relation": "Bounded by the Chambal River on the south and Banas on the north",
          "state": "Rajasthan"
        }
      ],
      "species": [
        {
          "name": "Gharial (Gavialis gangeticus)",
          "iucn": "Critically Endangered",
          "role": "Chambal holds the largest viable breeding wild population on Earth"
        },
        {
          "name": "Red-crowned Roofed Turtle (Batagur kachuga)",
          "iucn": "Critically Endangered",
          "role": "Endemic freshwater turtle surviving mainly in the Chambal"
        },
        {
          "name": "Gangetic River Dolphin",
          "iucn": "Endangered",
          "role": "Resident population in deep pools of the Chambal river"
        }
      ],
      "commonMistake": "Ken-Betwa Project transfers surplus water from Ken basin (MP) to deficit Betwa basin (Bundelkhand), involving the construction of Daudhan Dam which will submerge a significant portion of Panna Tiger Reserve core. Remember Chambal badlands are formed by severe gully erosion in semi-arid alluvium."
    },
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
    "slug": "tapi-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Tapi (Tapti) River System",
    "aliases": [
      "Tapti",
      "Surya Putri",
      "Ukai Dam",
      "Kakrapar",
      "Purna",
      "Girna",
      "Multai"
    ],
    "placeType": "West-Flowing Rift Valley River",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Maharashtra, Gujarat"
    },
    "lat": 21.17,
    "lng": 72.83,
    "shape": [
      [
        21.77,
        78.25
      ],
      [
        21.5,
        77
      ],
      [
        21.3,
        76.22
      ],
      [
        21.05,
        75.8
      ],
      [
        21.35,
        74.45
      ],
      [
        21.25,
        73.58
      ],
      [
        21.1,
        72.7
      ]
    ],
    "neighbours": [
      "Satpura Range (North)",
      "Ajanta & Satmala Hills (South)",
      "Narmada River (Flows parallel to the North)"
    ],
    "riverDetails": {
      "length": "724 km",
      "origin": "Multai in the Betul district (Satpura Range, Madhya Pradesh)",
      "mouth": "Gulf of Khambhat / Arabian Sea near Dumas/Surat (forms an estuary, no delta)",
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Maharashtra",
          "Gujarat"
        ],
        "basinStates": [
          "Maharashtra (79%)",
          "Madhya Pradesh (15%)",
          "Gujarat (6%)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Purna (Tapi)",
            "note": "Chief tributary (334 km); rises in Gawilgarh hills (Melghat); drains Vidarbha and Khandesh; joins at Changdeo"
          },
          {
            "name": "Vaghur",
            "note": "Rises in Ajanta hills; carves the semicircular horseshoe canyon holding UNESCO Ajanta Caves; joins near Jalgaon"
          },
          {
            "name": "Bori",
            "note": "Rises in northern slopes of Satmala hills; joins Tapi in Jalgaon district"
          },
          {
            "name": "Panjhra",
            "note": "Rises in Western Ghats near Dhule; joins Tapi near Sindkheda"
          }
        ],
        "rightBank": [
          {
            "name": "Girna",
            "note": "Major tributary (260 km); rises in Western Ghats (Nashik); passes Malegaon and Chalisgaon; joins at Nanded village"
          },
          {
            "name": "Aner",
            "note": "Rises in Satpura range; forms interstate border between MP and Maharashtra"
          },
          {
            "name": "Arunavati",
            "note": "Rises in Satpura hills; joins Tapi in Shirpur taluka"
          },
          {
            "name": "Gomai",
            "note": "Rises in Satpura range; joins Tapi near Prakasha (Dakshin Kashi)"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Purna River",
          "sangam": "Changdeo Sangam (Jalgaon)",
          "state": "Maharashtra",
          "note": "Holy meeting of Tapi and Purna near 11th century Changdeo Maharaj temple"
        },
        {
          "tributary": "Girna River",
          "sangam": "Nanded Sangam (Jalgaon)",
          "state": "Maharashtra",
          "note": "Major right-bank confluence in Khandesh plain"
        },
        {
          "tributary": "Gomai River",
          "sangam": "Prakasha (Dakshin Kashi)",
          "state": "Maharashtra",
          "note": "Sacred temple town on the Tapi banks in Nandurbar"
        }
      ],
      "towns": [
        {
          "name": "Multai",
          "type": "Origin",
          "significance": "Sacred spring pool 'Tapi Kund' in Betul district",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Burhanpur",
          "type": "Historical / Strategic",
          "significance": "Historic 'Gateway to Deccan' on Tapi banks; Shahi Qila and Asirgarh Fort",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Bhusawal & Jalgaon",
          "type": "Economic",
          "significance": "Major railway junction and banana capital of India in Khandesh",
          "state": "Maharashtra"
        },
        {
          "name": "Surat",
          "type": "Port / Economic",
          "significance": "Diamond cutting, textile capital & historic Mughal maritime trading port",
          "state": "Gujarat"
        }
      ],
      "dams": [
        {
          "name": "Ukai Dam (Vallabh Sagar)",
          "state": "Gujarat",
          "type": "Second largest reservoir in Gujarat (300 MW hydro + massive irrigation canal network)"
        },
        {
          "name": "Kakrapar Weir",
          "state": "Gujarat",
          "type": "Diversion weir feeding Kakrapar Atomic Power Station cooling water"
        },
        {
          "name": "Hathnur Dam (Upper Tapi)",
          "state": "Maharashtra",
          "type": "Major irrigation reservoir located in Jalgaon district"
        },
        {
          "name": "Prakasha Barrage",
          "state": "Maharashtra",
          "type": "Lower Tapi irrigation barrage in Nandurbar"
        }
      ],
      "protectedAreas": [
        {
          "name": "Melghat Tiger Reserve",
          "relation": "Falls in the upper catchment of Tapi and Purna rivers in Satpura/Gawilgarh hills",
          "state": "Maharashtra"
        },
        {
          "name": "Yawal Wildlife Sanctuary",
          "relation": "Located on the southern slopes of the Satpura range facing the Tapi valley",
          "state": "Maharashtra"
        },
        {
          "name": "Gugamal National Park",
          "relation": "Core tiger and leopard habitat in the Tapi-Purna basin",
          "state": "Maharashtra"
        }
      ],
      "species": [
        {
          "name": "Forest Owlet (Athene blewitti)",
          "iucn": "Endangered",
          "role": "Rediscovered endemic raptor found in the Satpura-Tapi dry deciduous forests"
        },
        {
          "name": "Bengal Tiger & Sloth Bear",
          "iucn": "Endangered / Vulnerable",
          "role": "Prime population residing in Melghat along the Purna headwaters"
        },
        {
          "name": "Mugger Crocodile",
          "iucn": "Vulnerable",
          "role": "Found in Ukai and Hathnur reservoirs"
        }
      ],
      "commonMistake": "Remember: Tapi flows in a linear rift valley parallel to Narmada, situated south of the Satpura range and north of Ajanta/Satmala hills. Don't confuse Purna of Tapi (flows west through Vidarbha/Khandesh) with Purna of Godavari (flows south into Godavari near Nanded)!"
    },
    "staticFacts": [
      "Second largest west-flowing river of Peninsular India (724 km); rises at Multai in Betul district (MP) and flows through a rift valley into the Gulf of Khambhat near Surat.",
      "Chief left-bank tributary is Purna; chief right-bank tributary is Girna (rising in Western Ghats, Nashik).",
      "Major multi-purpose projects: Ukai Dam (Vallabh Sagar) and Kakrapar Nuclear Power Station weir in Gujarat; Hathnur Dam in Maharashtra."
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
    "id": "IND-RIV-11",
    "slug": "brahmani-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Brahmani River System",
    "aliases": [
      "Sankh",
      "South Koel",
      "Rengali Dam",
      "Vedvyas",
      "Bhitarkanika"
    ],
    "placeType": "East-Flowing Peninsular River",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha, Jharkhand"
    },
    "lat": 20.8,
    "lng": 86.85,
    "shape": [
      [
        22.25,
        84.85
      ],
      [
        21.8,
        85
      ],
      [
        21.28,
        85.18
      ],
      [
        20.95,
        85.9
      ],
      [
        20.75,
        86.85
      ]
    ],
    "neighbours": [
      "Formed at Vedvyas (Rourkela) by Sankh and South Koel",
      "Baitarani River (North)",
      "Mahanadi Basin (South)"
    ],
    "riverDetails": {
      "length": "799 km (480 km from Vedvyas confluence)",
      "origin": "Formed at Vedvyas near Rourkela (Odisha) by confluence of Sankh (Jharkhand) and South Koel (Chota Nagpur Plateau, Jharkhand)",
      "mouth": "Bay of Bengal at Dhamra (merges with Baitarani to form the delta containing Bhitarkanika Mangroves)",
      "states": {
        "flowsThrough": [
          "Jharkhand (headwaters)",
          "Odisha"
        ],
        "basinStates": [
          "Odisha (57%)",
          "Jharkhand (40%)",
          "Chhattisgarh (3%)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Sankh River",
            "note": "Rises near Netarhat plateau (Jharkhand); tumbles down Sadni Falls (60 m); forms Brahmani at Vedvyas"
          },
          {
            "name": "Kharasrota",
            "note": "Important deltaic distributary and branch river flowing past Jajpur"
          }
        ],
        "rightBank": [
          {
            "name": "South Koel",
            "note": "Rises near Nagri in Ranchi district; flows south through Singhbhum to join Sankh at Vedvyas"
          },
          {
            "name": "Tikra",
            "note": "Drains the forested valleys of Angul and Deogarh into Brahmani"
          },
          {
            "name": "Singhadajhor",
            "note": "Right-bank stream draining Dhenkanal into the lower basin"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Sankh + South Koel",
          "sangam": "Vedvyas (Rourkela)",
          "state": "Odisha",
          "note": "Holy confluence named after Sage Vyasa who composed Mahabharata here"
        },
        {
          "tributary": "Brahmani + Baitarani",
          "sangam": "Dhamra Estuary",
          "state": "Odisha",
          "note": "Combined mouth entering the Bay of Bengal into Bhitarkanika delta"
        }
      ],
      "towns": [
        {
          "name": "Rourkela",
          "type": "Industrial",
          "significance": "Steel City of India situated at the Vedvyas confluence",
          "state": "Odisha"
        },
        {
          "name": "Talcher",
          "type": "Mining / Energy",
          "significance": "One of India's largest coalfields and thermal power complexes on Brahmani banks",
          "state": "Odisha"
        },
        {
          "name": "Dhenkanal",
          "type": "Historical",
          "significance": "Heritage princely capital in the middle Brahmani valley",
          "state": "Odisha"
        },
        {
          "name": "Dhamra",
          "type": "Port",
          "significance": "Deepwater commercial port on the joint Brahmani-Baitarani estuary",
          "state": "Odisha"
        }
      ],
      "dams": [
        {
          "name": "Rengali Dam",
          "state": "Odisha",
          "type": "Major multi-purpose reservoir in Angul district (250 MW hydro + massive flood moderation)"
        },
        {
          "name": "Samal Barrage",
          "state": "Odisha",
          "type": "Irrigation diversion barrage located downstream of Rengali"
        }
      ],
      "protectedAreas": [
        {
          "name": "Bhitarkanika National Park & Ramsar Site",
          "relation": "World-renowned mangrove wetland formed by the delta of Brahmani, Baitarani and Dhamra",
          "state": "Odisha"
        },
        {
          "name": "Gahirmatha Marine Sanctuary",
          "relation": "Adjacent to Brahmani-Baitarani estuary; world's largest Olive Ridley turtle nesting beach",
          "state": "Odisha"
        }
      ],
      "species": [
        {
          "name": "Saltwater Crocodile (Crocodylus porosus)",
          "iucn": "Least Concern",
          "role": "Bhitarkanika holds over 1,700 estuarine crocodiles including giant specimens over 20 feet"
        },
        {
          "name": "King Cobra (Ophiophagus hannah)",
          "iucn": "Vulnerable",
          "role": "High density in the Brahmani mangrove forests"
        },
        {
          "name": "Mangrove Horseshoe Crab",
          "iucn": "Data Deficient",
          "role": "Living fossil residing in mudflats of the Dhamra estuary"
        }
      ],
      "commonMistake": "UPSC 2021 Question: Brahmani is formed by Sankh and South Koel rising on the Chota Nagpur plateau (Jharkhand). It is NOT formed in Keonjhar (that is Baitarani). Also note that Brahmani and Baitarani share a common delta at Dhamra."
    },
    "staticFacts": [
      "Second largest river in Odisha (799 km total); formed at Vedvyas (Rourkela) by the meeting of Sankh and South Koel rivers from Chota Nagpur.",
      "UPSC 2021: Brahmani (rises on Chota Nagpur) joins Baitarani near Dhamra to form the mangrove delta of Bhitarkanika National Park.",
      "Rengali Dam in Angul district is the primary multipurpose reservoir on the Brahmani River."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07",
      "GEO-CDS2-2018-06",
      "ENV-UPSC-2013-15"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-12",
    "slug": "baitarani-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Baitarani River System",
    "aliases": [
      "Gonasika",
      "Guptaganga",
      "Anandapur",
      "Dhamra",
      "Bhitarkanika"
    ],
    "placeType": "East-Flowing Peninsular Coastal River",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha"
    },
    "lat": 20.85,
    "lng": 86.6,
    "shape": [
      [
        21.5,
        85.5
      ],
      [
        21.2,
        85.9
      ],
      [
        20.95,
        86.2
      ],
      [
        20.82,
        86.85
      ]
    ],
    "neighbours": [
      "Subarnarekha & Budhabalanga (North)",
      "Brahmani River (South)",
      "Originates in Gonasika Hills (Keonjhar)"
    ],
    "riverDetails": {
      "length": "360 km",
      "origin": "Gonasika / Guptaganga in the Gonasika hills near Keonjhar (Odisha, elevation 900 m)",
      "mouth": "Bay of Bengal at Dhamra (unites with Brahmani in the estuarine mangrove delta)",
      "states": {
        "flowsThrough": [
          "Odisha"
        ],
        "basinStates": [
          "Odisha (96%)",
          "Jharkhand (4% in border stream headwaters)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Salandi",
            "note": "Major tributary; rises in Similipal Biosphere Reserve; Hadgarh Dam located on it; joins near Bhadrak"
          },
          {
            "name": "Kanjhari",
            "note": "Rises in mineral-rich plateau of Keonjhar"
          }
        ],
        "rightBank": [
          {
            "name": "Musala",
            "note": "Rises in Gonasika hills; drains iron-ore belt"
          },
          {
            "name": "Ardei",
            "note": "Rises in Keonjhar highlands; joins near Anandapur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Salandi River",
          "sangam": "Tihidi Sangam (Bhadrak)",
          "state": "Odisha",
          "note": "Meeting of Salandi with the main Baitarani channel"
        },
        {
          "tributary": "Baitarani + Brahmani",
          "sangam": "Dhamra Estuary",
          "state": "Odisha",
          "note": "Enters Bay of Bengal adjacent to Kanika island and Bhitarkanika"
        }
      ],
      "towns": [
        {
          "name": "Keonjhar",
          "type": "Mining / Regional",
          "significance": "Iron ore and manganese mining capital near the source hills",
          "state": "Odisha"
        },
        {
          "name": "Anandapur",
          "type": "Irrigation",
          "significance": "Site of major Baitarani Anandapur Barrage project",
          "state": "Odisha"
        },
        {
          "name": "Jajpur (Biraja Kshetra)",
          "type": "Pilgrimage / Historical",
          "significance": "Ancient capital of Somavamshi dynasty on sacred Baitarani banks",
          "state": "Odisha"
        },
        {
          "name": "Bhadrak",
          "type": "Commercial",
          "significance": "Major agrarian trade center in the lower coastal alluvium",
          "state": "Odisha"
        }
      ],
      "dams": [
        {
          "name": "Anandapur Barrage",
          "state": "Odisha",
          "type": "Major irrigation barrage across the Baitarani River in Keonjhar"
        },
        {
          "name": "Hadgarh Dam",
          "state": "Odisha",
          "type": "Storage dam on Salandi tributary inside Hadgarh Wildlife Sanctuary"
        },
        {
          "name": "Kanupur Irrigation Project",
          "state": "Odisha",
          "type": "Dam project on upper Baitarani to irrigate Keonjhar plateaus"
        }
      ],
      "protectedAreas": [
        {
          "name": "Similipal National Park & Biosphere Reserve",
          "relation": "Catchment of the chief tributary Salandi rises inside Similipal",
          "state": "Odisha"
        },
        {
          "name": "Hadgarh Wildlife Sanctuary",
          "relation": "Surrounds the Hadgarh reservoir on Salandi river",
          "state": "Odisha"
        },
        {
          "name": "Bhitarkanika Mangroves",
          "relation": "Delta mouth formed jointly with Brahmani at Dhamra",
          "state": "Odisha"
        }
      ],
      "species": [
        {
          "name": "Saltwater Crocodile",
          "iucn": "Least Concern",
          "role": "Inhabits the tidal mangrove creeks of the lower Baitarani-Dhamra estuary"
        },
        {
          "name": "White-bellied Sea Eagle",
          "iucn": "Least Concern",
          "role": "Resident raptor nesting along the coastal delta canopy"
        },
        {
          "name": "Indian Python (Python molurus)",
          "iucn": "Near Threatened",
          "role": "Abundant in the delta swamp forests"
        }
      ],
      "commonMistake": "UPSC 2021 Trap: Baitarani originates in the Gonasika hills of Keonjhar (Odisha), NOT the Chota Nagpur plateau! Only Subarnarekha and Brahmani (Sankh+South Koel) originate on the Chota Nagpur plateau."
    },
    "staticFacts": [
      "Originates at Gonasika / Guptaganga in Keonjhar hills (Odisha); flows 360 km entirely through Odisha before joining Brahmani at Dhamra.",
      "Chief tributary is Salandi, which rises in Similipal Biosphere Reserve and feeds the Hadgarh reservoir.",
      "Ancient Biraja Kshetra (Jajpur) is situated on its banks; revered as the sacred river of Odisha."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07",
      "GEO-CDS2-2018-06"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-13",
    "slug": "pennar-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Pennar (Pinakini) River System",
    "aliases": [
      "Pinakini",
      "Uttara Pinakini",
      "Gandikota",
      "Somasila",
      "Chitravathi",
      "Papagni"
    ],
    "placeType": "East-Flowing Peninsular River",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka, Andhra Pradesh"
    },
    "lat": 14.5,
    "lng": 78.5,
    "shape": [
      [
        13.38,
        77.7
      ],
      [
        13.8,
        77.5
      ],
      [
        14.65,
        77.6
      ],
      [
        14.8,
        78.28
      ],
      [
        14.5,
        78.8
      ],
      [
        14.55,
        80.15
      ]
    ],
    "neighbours": [
      "Krishna Basin (North)",
      "Palar and Kaveri Basins (South)",
      "Eragonda & Nallamala Hills (Flanks)"
    ],
    "riverDetails": {
      "length": "597 km",
      "origin": "Nandi Hills (Chennakesava hill, Chikkaballapura district, Karnataka)",
      "mouth": "Bay of Bengal at Utukuru near Nellore (Andhra Pradesh)",
      "states": {
        "flowsThrough": [
          "Karnataka",
          "Andhra Pradesh"
        ],
        "basinStates": [
          "Andhra Pradesh (88%)",
          "Karnataka (12%)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Jayamangali",
            "note": "Rises in Tumakuru district (Karnataka); joins Pennar in Anantapur"
          },
          {
            "name": "Kunderu (Kumudvathi)",
            "note": "Drains the limestone Nandyal valley in Kurnool/Kadapa; joins near Kamalapuram"
          },
          {
            "name": "Sagileru",
            "note": "Rises in Velikonda range; joins Pennar in Kadapa district"
          }
        ],
        "rightBank": [
          {
            "name": "Chitravathi",
            "note": "Rises in Chikkaballapura; flows past Puttaparthi; joins Pennar near Gandikota"
          },
          {
            "name": "Papagni",
            "note": "Rises in Chikkaballapura; carves picturesque gorge; joins near Kamalapuram"
          },
          {
            "name": "Cheyyeru (Bahuda)",
            "note": "Formed by Bahuda and Punchu; famous for Attirala Parasurama temple; joins near Nandalur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Chitravathi River",
          "sangam": "Gandikota Confluence",
          "state": "Andhra Pradesh",
          "note": "Where Chitravathi joins Pennar just upstream of the dramatic canyon"
        },
        {
          "tributary": "Papagni + Kunderu",
          "sangam": "Kamalapuram Sangam",
          "state": "Andhra Pradesh",
          "note": "Major confluence in central YSR Kadapa district"
        }
      ],
      "towns": [
        {
          "name": "Gauribidanur",
          "type": "Regional",
          "significance": "First major town on Pennar in Karnataka before entering AP",
          "state": "Karnataka"
        },
        {
          "name": "Anantapur",
          "type": "Agrarian",
          "significance": "Major rain-shadow district center in Rayalaseema",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Gandikota",
          "type": "Geological / Historical",
          "significance": "'Grand Canyon of India'; 300-ft red sandstone canyon gorge & historic fort",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Kadapa (Cuddapah)",
          "type": "Historical",
          "significance": "Historic gateway to Tirumala hills on Pennar tributary plains",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Nellore",
          "type": "Coastal Economic",
          "significance": "Major rice and aquaculture port city at Pennar delta mouth",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Somasila Dam",
          "state": "Andhra Pradesh",
          "type": "Largest reservoir in the Pennar basin; feeds Telugu Ganga canal to Chennai"
        },
        {
          "name": "Mylavaram Dam",
          "state": "Andhra Pradesh",
          "type": "Medium irrigation reservoir located near Jammalamadugu"
        },
        {
          "name": "Mid Pennar Dam",
          "state": "Andhra Pradesh",
          "type": "Crucial storage reservoir in Anantapur district"
        }
      ],
      "protectedAreas": [
        {
          "name": "Sri Lankamalleswara Wildlife Sanctuary",
          "relation": "Surrounds the Velikonda and Lankamalla hills in Pennar basin; home of Jerdon's Courser",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Sri Penusila Narasimha Wildlife Sanctuary",
          "relation": "Eastern Ghats dry evergreen forest belt in Kadapa/Nellore border",
          "state": "Andhra Pradesh"
        }
      ],
      "species": [
        {
          "name": "Jerdon's Courser (Rhinoptilus bitorquatus)",
          "iucn": "Critically Endangered",
          "role": "Extremely rare nocturnal courser bird endemic exclusively to scrub forests of Pennar basin"
        },
        {
          "name": "Golden Gecko (Calodactylodes aureus)",
          "iucn": "Least Concern",
          "role": "Rock-dwelling endemic lizard of Gandikota canyon and Tirumala hills"
        },
        {
          "name": "Slender Loris (Loris lydekkerianus)",
          "iucn": "Near Threatened",
          "role": "Nocturnal primate residing in thorn scrub forests"
        }
      ],
      "commonMistake": "UPSC 2015 Trap: Pennar is an independent east-flowing river, NOT a tributary of Godavari or Krishna! It rises at Nandi Hills (Karnataka) and flows between Krishna and Kaveri basins. Don't confuse Gandikota gorge (on Pennar) with Chambal ravines."
    },
    "staticFacts": [
      "Originates in Nandi Hills (Chikkaballapura, Karnataka) and flows 597 km through Rayalaseema into the Bay of Bengal near Nellore.",
      "Carves the spectacular 300-ft Gandikota canyon gorge in Erramala hills ('Grand Canyon of India').",
      "Somasila Dam is the largest reservoir on the river; supplies drinking water to Chennai via Telugu Ganga canal."
    ],
    "similarPYQ": [
      "GEO-UPSC-2015-07",
      "GEO-CDS1-2017-08",
      "GEO-UPSC-2019-04"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-14",
    "slug": "subarnarekha-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Subarnarekha River System",
    "aliases": [
      "Streak of Gold",
      "Hundru Falls",
      "Jamshedpur",
      "Karkari",
      "Kharkai",
      "Getalsud Dam"
    ],
    "placeType": "East-Flowing Chota Nagpur River",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Jharkhand, West Bengal, Odisha"
    },
    "lat": 21.6,
    "lng": 87.35,
    "shape": [
      [
        23.35,
        85.2
      ],
      [
        23.45,
        85.65
      ],
      [
        22.8,
        86.2
      ],
      [
        22.4,
        86.8
      ],
      [
        21.6,
        87.35
      ]
    ],
    "neighbours": [
      "Damodar Basin (North)",
      "Brahmani & Baitarani Basins (South)",
      "Chota Nagpur Plateau (Origin)"
    ],
    "riverDetails": {
      "length": "395 km",
      "origin": "Nagri village near Ranchi (Chota Nagpur Plateau, Jharkhand, elevation 610 m)",
      "mouth": "Bay of Bengal at Kirtania near Talsari beach (Balasore district, Odisha)",
      "states": {
        "flowsThrough": [
          "Jharkhand",
          "West Bengal",
          "Odisha"
        ],
        "basinStates": [
          "Jharkhand (71%)",
          "Odisha (19%)",
          "West Bengal (10%)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Dulung",
            "note": "Rises in West Midnapore (WB); joins Subarnarekha in Odisha border"
          },
          {
            "name": "Raru",
            "note": "Famous for Jonha / Gautamdhara Falls near Ranchi"
          }
        ],
        "rightBank": [
          {
            "name": "Kanchi",
            "note": "Tumbles over picturesque Dassam Falls (44 m); joins near Tamar"
          },
          {
            "name": "Karkari",
            "note": "Major tributary in Khunti district"
          },
          {
            "name": "Kharkai",
            "note": "Chief tributary; flows past Chaibasa; meets Subarnarekha at Jamshedpur (Tatanagar)"
          },
          {
            "name": "Garra",
            "note": "Drains the Jaduguda uranium mining belt"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Kharkai River",
          "sangam": "Sonari Sangam (Jamshedpur)",
          "state": "Jharkhand",
          "note": "Meeting of Subarnarekha and Kharkai; chosen by J.N. Tata for Tata Steel plant in 1907"
        }
      ],
      "towns": [
        {
          "name": "Ranchi",
          "type": "Capital",
          "significance": "City of Waterfalls on the Chota Nagpur plateau source",
          "state": "Jharkhand"
        },
        {
          "name": "Jamshedpur (Tatanagar)",
          "type": "Industrial",
          "significance": "India's first planned industrial steel city at Subarnarekha-Kharkai confluence",
          "state": "Jharkhand"
        },
        {
          "name": "Ghatshila",
          "type": "Mining / Tourism",
          "significance": "Copper smelting and mining hub along the scenic river gorge",
          "state": "Jharkhand"
        },
        {
          "name": "Balasore (Kirtania)",
          "type": "Coastal",
          "significance": "Maritime mouth and aquaculture port in northern Odisha",
          "state": "Odisha"
        }
      ],
      "dams": [
        {
          "name": "Getalsud Dam (Rukku)",
          "state": "Jharkhand",
          "type": "Major reservoir supplying drinking water to Ranchi city"
        },
        {
          "name": "Chandil Dam",
          "state": "Jharkhand",
          "type": "Large multipurpose dam on Subarnarekha (Subarnarekha Multipurpose Project)"
        },
        {
          "name": "Icha Dam",
          "state": "Jharkhand",
          "type": "Dam on the Kharkai tributary in West Singhbhum"
        }
      ],
      "protectedAreas": [
        {
          "name": "Dalma Wildlife Sanctuary",
          "relation": "Dalma hills flank the Subarnarekha river at Jamshedpur; famous for Asian Elephants",
          "state": "Jharkhand"
        }
      ],
      "species": [
        {
          "name": "Asian Elephant (Elephas maximus)",
          "iucn": "Endangered",
          "role": "Key migratory corridor crossing the river at Dalma-Jamshedpur"
        },
        {
          "name": "Mahseer",
          "iucn": "Endangered",
          "role": "Inhabits the clear rocky pools below Hundru Falls"
        }
      ],
      "commonMistake": "UPSC 2021 Fact: Subarnarekha rises directly on the Chota Nagpur plateau near Ranchi, flowing independently into the Bay of Bengal. It does NOT join the Hooghly or Mahanadi. Name means 'Streak of Gold' due to gold panning in river sands."
    },
    "staticFacts": [
      "Originates near Ranchi on Chota Nagpur Plateau (395 km); flows through Jharkhand, West Bengal, and Odisha into Bay of Bengal.",
      "Forms Hundru Falls (98 m) near Ranchi; chosen by J.N. Tata for India's first steel city (Jamshedpur) at its confluence with Kharkai.",
      "UPSC 2021: Subarnarekha and Brahmani rise on Chota Nagpur (Nagawali & Vamsadhara rise in Eastern Ghats)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07",
      "GEO-CDS2-2018-06"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-15",
    "slug": "rushikulya-vamsadhara-nagavali",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Rushikulya, Vamsadhara & Nagavali River Systems",
    "aliases": [
      "Bansadhara",
      "Langulya",
      "Olive Ridley Rookery",
      "Ganjam Coast",
      "Kalingapatnam",
      "Srikakulam"
    ],
    "placeType": "Eastern Ghats Independent Coastal Drainage",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha, Andhra Pradesh"
    },
    "lat": 18.3,
    "lng": 84.15,
    "shape": [
      [
        19.8,
        83.7
      ],
      [
        19,
        83.85
      ],
      [
        18.55,
        84
      ],
      [
        18.3,
        84.15
      ]
    ],
    "neighbours": [
      "Mahanadi Basin (North)",
      "Godavari Basin (South)",
      "Eastern Ghats Escarpment (West)"
    ],
    "riverDetails": {
      "length": "Rushikulya: 165 km | Vamsadhara: 254 km | Nagavali: 256 km",
      "origin": "All three rise directly in the Eastern Ghats: Rushikulya in Daringbadi (Kandhamal); Vamsadhara in Thuamul Rampur (Kalahandi); Nagavali near Lakhbahal (Kalahandi, Odisha)",
      "mouth": "Bay of Bengal (Rushikulya at Ganjam; Vamsadhara at Kalingapatnam, AP; Nagavali at Kallepalli near Srikakulam)",
      "states": {
        "flowsThrough": [
          "Odisha",
          "Andhra Pradesh"
        ],
        "basinStates": [
          "Odisha",
          "Andhra Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Mahendratanaya (Vamsadhara)",
            "note": "Rises near Mahendragiri peak (Gajapati); subject of interstate dispute"
          },
          {
            "name": "Jhanjavati (Nagavali)",
            "note": "Rises in Eastern Ghats; site of rubber dam project"
          },
          {
            "name": "Baghua (Rushikulya)",
            "note": "Rises in Sanakhemundi hills"
          }
        ],
        "rightBank": [
          {
            "name": "Peddagedda (Vamsadhara)",
            "note": "Feeds Gotta Barrage in Srikakulam"
          },
          {
            "name": "Vegavathi (Nagavali)",
            "note": "Passes through Bobbili historical region in AP"
          },
          {
            "name": "Dhanei (Rushikulya)",
            "note": "Feeds Dhanei reservoir project"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Vamsadhara into Bay of Bengal",
          "sangam": "Kalingapatnam Port",
          "state": "Andhra Pradesh",
          "note": "Ancient Kalinga maritime port at the river mouth"
        },
        {
          "tributary": "Rushikulya into Bay of Bengal",
          "sangam": "Purunabandha (Ganjam)",
          "state": "Odisha",
          "note": "Site of global mass nesting Arribada of Olive Ridley turtles"
        }
      ],
      "towns": [
        {
          "name": "Ganjam & Chhatrapur",
          "type": "Coastal",
          "significance": "Historic salt manufacturing center at Rushikulya mouth near Chilika Lake",
          "state": "Odisha"
        },
        {
          "name": "Rayagada",
          "type": "Industrial / Tribal",
          "significance": "Paper and aluminium city located in the upper Nagavali valley",
          "state": "Odisha"
        },
        {
          "name": "Srikakulam",
          "type": "Historical / Cultural",
          "significance": "Arasavalli Sun Temple situated on the banks of Nagavali River",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Kalingapatnam",
          "type": "Ancient Port",
          "significance": "Historic lighthouse and maritime port on Vamsadhara mouth",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Gotta Barrage (Vamsadhara Project)",
          "state": "Andhra Pradesh",
          "type": "Major diversion barrage irrigating Srikakulam district"
        },
        {
          "name": "Thotapalli Barrage (Nagavali)",
          "state": "Andhra Pradesh",
          "type": "Major irrigation regulator on River Nagavali"
        },
        {
          "name": "Jhanjavati Rubber Dam",
          "state": "Andhra Pradesh",
          "type": "India's first rubber dam on the Jhanjavati tributary of Nagavali"
        }
      ],
      "protectedAreas": [
        {
          "name": "Rushikulya Rookery",
          "relation": "World-renowned mass nesting beach for Olive Ridley turtles at river mouth",
          "state": "Odisha"
        },
        {
          "name": "Chilika Lake Ramsar Site",
          "relation": "Located immediately north of the Rushikulya estuary",
          "state": "Odisha"
        }
      ],
      "species": [
        {
          "name": "Olive Ridley Sea Turtle (Lepidochelys olivacea)",
          "iucn": "Vulnerable",
          "role": "Over 300,000 turtles nest simultaneously in mass Arribadas at Rushikulya mouth"
        },
        {
          "name": "Irrawaddy Dolphin",
          "iucn": "Endangered",
          "role": "Resides in adjacent waters of Chilika lagoon"
        }
      ],
      "commonMistake": "UPSC 2021 Question: Nagawali and Vamsadhara originate in the Eastern Ghats of Kalahandi/Rayagada in Odisha (NOT Chota Nagpur). Brahmani and Subarnarekha rise on Chota Nagpur. Vamsadhara Water Dispute Tribunal addresses sharing between Odisha and AP."
    },
    "staticFacts": [
      "UPSC 2021 Exact Question: Nagawali and Vamsadhara rise in the Eastern Ghats of Odisha and flow south into Andhra Pradesh (Srikakulam).",
      "Rushikulya river mouth on Ganjam coast is India's second-largest mass nesting site (Arribada) for Olive Ridley sea turtles after Gahirmatha.",
      "Vamsadhara Water Dispute is an active interstate water dispute between Odisha and Andhra Pradesh."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07",
      "GEO-CDS2-2017-07",
      "ENV-UPSC-2014-09"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-16",
    "slug": "vaigai-tamirabarani-rivers",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Vaigai & Tamirabarani (Porunai) River Systems",
    "aliases": [
      "Porunai",
      "Madurai",
      "Palk Strait",
      "Agasthyamalai",
      "Adichanallur",
      "Korkai",
      "Gulf of Mannar"
    ],
    "placeType": "Deep South Peninsular River Systems",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Tamil Nadu, Kerala (headwaters)"
    },
    "lat": 9.92,
    "lng": 78.12,
    "shape": [
      [
        9.6,
        77.3
      ],
      [
        10,
        77.6
      ],
      [
        9.92,
        78.12
      ],
      [
        9.5,
        78.6
      ],
      [
        9.3,
        79
      ]
    ],
    "neighbours": [
      "Kaveri Basin (North)",
      "Agasthyamalai & Cardamom Hills (West)",
      "Palk Strait & Gulf of Mannar (East)"
    ],
    "riverDetails": {
      "length": "Vaigai: 258 km | Tamirabarani: 128 km",
      "origin": "Vaigai rises in Varusanadu Hills (Periyar plateau, Western Ghats); Tamirabarani rises on Agasthyamalai peak (Pothigai Hills, Tirunelveli)",
      "mouth": "Vaigai empties into Palk Strait near Uchipuli (Ramanathapuram); Tamirabarani empties into Gulf of Mannar at Punnaikayal near Tiruchendur",
      "states": {
        "flowsThrough": [
          "Tamil Nadu"
        ],
        "basinStates": [
          "Tamil Nadu"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Suruliyar (Vaigai)",
            "note": "Famous for Suruli Falls; receives diverted Mullaperiyar water via tunnel"
          },
          {
            "name": "Manjalar (Vaigai)",
            "note": "Rises in Palani Hills; passes Kodaikanal foothills; Manjalar Dam"
          },
          {
            "name": "Servalar (Tamirabarani)",
            "note": "Rises in Western Ghats; joins near Papanasam Dam"
          }
        ],
        "rightBank": [
          {
            "name": "Varahanadhi (Vaigai)",
            "note": "Drains Theni valley into Vaigai"
          },
          {
            "name": "Karuppanadhi (Tamirabarani)",
            "note": "Rises in Kalakkad hills"
          },
          {
            "name": "Chittar (Tamirabarani)",
            "note": "Famous for Courtallam (Kutralam) Falls; joins Tamirabarani near Sivalaperi"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Chittar River",
          "sangam": "Sivalaperi Sangam",
          "state": "Tamil Nadu",
          "note": "Sacred confluence known as Dakshina Kashi near Tirunelveli"
        },
        {
          "tributary": "Vaigai into Palk Strait",
          "sangam": "Attankarai (Ramanathapuram)",
          "state": "Tamil Nadu",
          "note": "Empties into the shallow Palk Strait opposite Sri Lanka"
        }
      ],
      "towns": [
        {
          "name": "Madurai",
          "type": "Cultural / Historical",
          "significance": "Ancient Sangam capital of the Pandyas; Meenakshi Amman Temple on Vaigai banks",
          "state": "Tamil Nadu"
        },
        {
          "name": "Keezhadi",
          "type": "Archaeological",
          "significance": "Major Sangam-era urban civilization excavation site (6th century BCE) on Vaigai banks",
          "state": "Tamil Nadu"
        },
        {
          "name": "Tirunelveli",
          "type": "Cultural",
          "significance": "Historic Nellaiappar temple town situated on Tamirabarani river banks",
          "state": "Tamil Nadu"
        },
        {
          "name": "Adichanallur & Korkai",
          "type": "Ancient Port / Metallurgy",
          "significance": "Ancient 3,200-year-old iron-age burial urn site and historic Pandyan pearl port",
          "state": "Tamil Nadu"
        }
      ],
      "dams": [
        {
          "name": "Vaigai Dam",
          "state": "Tamil Nadu",
          "type": "Major storage dam near Andipatti (Theni) regulating irrigation for Madurai and Dindigul"
        },
        {
          "name": "Papanasam Dam (Karaiyar Dam)",
          "state": "Tamil Nadu",
          "type": "Historic hydroelectric dam on Tamirabarani; Agasthiyar Falls"
        },
        {
          "name": "Manimuthar Dam",
          "state": "Tamil Nadu",
          "type": "Largest reservoir in Tirunelveli district on Manimuthar tributary"
        }
      ],
      "protectedAreas": [
        {
          "name": "Megamalai Wildlife Sanctuary (Srivilliputhur-Megamalai TR)",
          "relation": "Catchment of Suruli and upper Vaigai river headwaters",
          "state": "Tamil Nadu"
        },
        {
          "name": "Kalakkad Mundanthurai Tiger Reserve (KMTR)",
          "relation": "Origin sanctuary of Tamirabarani ('River of Life'); pristine wet evergreen forest",
          "state": "Tamil Nadu"
        },
        {
          "name": "Gulf of Mannar Marine National Park",
          "relation": "Marine biosphere reserve adjacent to the Tamirabarani delta mouth",
          "state": "Tamil Nadu"
        }
      ],
      "species": [
        {
          "name": "Nilgiri Tahr & Lion-tailed Macaque",
          "iucn": "Endangered",
          "role": "Key endemic primates and ungulates in the Agasthyamalai-KMTR catchment"
        },
        {
          "name": "Dugong (Sea Cow)",
          "iucn": "Vulnerable",
          "role": "Grazes on seagrass meadows in Gulf of Mannar near river mouths"
        }
      ],
      "commonMistake": "Tamirabarani is the ONLY perennial river in Tamil Nadu because it receives copious rainfall during both South-West Monsoon (Western Ghats crest) and North-East Monsoon. Keezhadi (on Vaigai) and Adichanallur/Porunai (on Tamirabarani) are landmark archaeological discoveries proving ancient urban Sangam civilization."
    },
    "staticFacts": [
      "Tamirabarani (Porunai) is the only perennial river in Tamil Nadu; rises on Agasthyamalai peak and empties into Gulf of Mannar.",
      "Archaeological carbon-dating at Adichanallur and Sivagalai on Tamirabarani established an advanced iron-age Porunai river civilization dating back to 1155 BCE (3,200 years ago).",
      "Vaigai river rises in Varusanadu hills and flows past Madurai and the ancient Keezhadi excavation site into Palk Strait."
    ],
    "similarPYQ": [
      "ANC-UPSC-2023-04",
      "GEO-CDS1-2019-04",
      "GEO-UPSC-2016-03"
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
