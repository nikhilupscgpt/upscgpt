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
      "Padma",
      "Hooghly",
      "Ganges",
      "Jahnavi"
    ],
    "placeType": "Main Stem of the Ganga System; Largest River Basin in India",
    "priority": "High",
    "locatedIn": {
      "country": "India, Bangladesh",
      "stateOrProvince": "Uttarakhand, Uttar Pradesh, Bihar, Jharkhand, West Bengal (India); Rajshahi, Dhaka divisions (Bangladesh)"
    },
    "lat": 25.32,
    "lng": 83.01,
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
        27.1,
        79.95
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
        25.73,
        84.83
      ],
      [
        25.68,
        85.18
      ],
      [
        25.45,
        87.25
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
        22.57,
        88.36
      ],
      [
        21.8,
        88.1
      ]
    ],
    "neighbours": [
      "Source: Gangotri Glacier at Gaumukh, Uttarkashi district (Uttarakhand), at ~3,900 m, as ",
      "Mouth: Bay of Bengal through the Ganga-Brahmaputra-Meghna delta; in Bangladesh the main"
    ],
    "riverDetails": {
      "length": "2,525 km (NCERT)",
      "origin": "Gangotri Glacier at Gaumukh, Uttarkashi district (Uttarakhand), at ~3,900 m, as the Bhagirathi; named Ganga after meeting the Alaknanda at Devprayag",
      "mouth": "Bay of Bengal through the Ganga-Brahmaputra-Meghna delta; in Bangladesh the main channel (Padma) joins the Jamuna (Brahmaputra) at Goalundo and then the Meghna",
      "sourceCoords": [
        30.92,
        79.08
      ],
      "mouthCoords": [
        22.5,
        90.75
      ],
      "states": {
        "flowsThrough": [
          "Uttarakhand",
          "Uttar Pradesh",
          "Bihar",
          "Jharkhand",
          "West Bengal"
        ],
        "basinStates": [
          "Uttarakhand",
          "Himachal Pradesh",
          "Haryana",
          "Delhi",
          "Uttar Pradesh",
          "Rajasthan",
          "Madhya Pradesh",
          "Chhattisgarh",
          "Bihar",
          "Jharkhand",
          "West Bengal"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Ramganga River",
            "note": "Rises near Gairsain (Garhwal); joins near Kannauj"
          },
          {
            "name": "Gomti River",
            "note": "Plains-fed river from Pilibhit; joins near Kaithi (Varanasi-Ghazipur)"
          },
          {
            "name": "Ghaghara River",
            "note": "Karnali in Nepal; largest Ganga tributary by discharge; joins near Chhapra"
          },
          {
            "name": "Gandak River",
            "note": "Narayani in Nepal; joins at Sonpur-Hajipur opposite Patna"
          },
          {
            "name": "Burhi Gandak River",
            "note": "Plains river of north Bihar; joins near Munger-Khagaria"
          },
          {
            "name": "Kosi River",
            "note": "'Sorrow of Bihar'; joins near Kursela (Katihar)"
          },
          {
            "name": "Mahananda River",
            "note": "From Darjeeling hills; last major left-bank tributary; joins in Bangladesh"
          }
        ],
        "rightBank": [
          {
            "name": "Yamuna River",
            "note": "Longest Ganga tributary and largest by basin; joins at Prayagraj"
          },
          {
            "name": "Tamsa (Tons) River",
            "note": "Rises in the Kaimur range; joins below Prayagraj"
          },
          {
            "name": "Son River",
            "note": "From the Amarkantak plateau; joins near Arrah-Maner, west of Patna"
          },
          {
            "name": "Punpun River",
            "note": "From the Chotanagpur plateau edge; joins near Fatuha (Patna)"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Alaknanda + Dhauliganga (Vishnuprayag)",
          "sangam": "Near Joshimath, Chamoli",
          "state": "Uttarakhand"
        },
        {
          "tributary": "Alaknanda + Nandakini (Nandprayag)",
          "sangam": "Nandprayag, Chamoli",
          "state": "Uttarakhand"
        },
        {
          "tributary": "Alaknanda + Pindar (Karnaprayag)",
          "sangam": "Karnaprayag, Chamoli",
          "state": "Uttarakhand"
        },
        {
          "tributary": "Alaknanda + Mandakini (Rudraprayag)",
          "sangam": "Rudraprayag",
          "state": "Uttarakhand"
        },
        {
          "tributary": "Alaknanda + Bhagirathi (Devprayag)",
          "sangam": "Devprayag, Tehri Garhwal; Ganga is formed here",
          "state": "Uttarakhand"
        },
        {
          "tributary": "Ramganga",
          "sangam": "Near Kannauj",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Yamuna",
          "sangam": "Triveni Sangam, Prayagraj",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Gomti",
          "sangam": "Near Kaithi (Varanasi-Ghazipur)",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Ghaghara",
          "sangam": "Near Chhapra (Doriganj)",
          "state": "Bihar"
        },
        {
          "tributary": "Son",
          "sangam": "Near Maner, west of Patna",
          "state": "Bihar"
        },
        {
          "tributary": "Gandak",
          "sangam": "Sonpur-Hajipur, opposite Patna",
          "state": "Bihar"
        },
        {
          "tributary": "Kosi",
          "sangam": "Near Kursela, Katihar",
          "state": "Bihar"
        },
        {
          "tributary": "Jamuna (Brahmaputra)",
          "sangam": "Goalundo",
          "state": "Bangladesh"
        }
      ],
      "towns": [
        {
          "name": "Gangotri",
          "type": "Cultural",
          "significance": "Char Dham shrine; Gaumukh snout about 18 km upstream",
          "state": "Uttarakhand"
        },
        {
          "name": "Haridwar",
          "type": "Cultural",
          "significance": "Point where the Ganga enters the plains (NCERT); Kumbh Mela; Bhimgoda barrage",
          "state": "Uttarakhand"
        },
        {
          "name": "Kanpur",
          "type": "Economic",
          "significance": "Leather and textile industrial city",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Prayagraj",
          "type": "Cultural",
          "significance": "Triveni Sangam; Kumbh and Maha Kumbh Mela; western end of National Waterway-1",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Varanasi",
          "type": "Cultural",
          "significance": "Ghats and Kashi Vishwanath; Ganga flows north here (Uttarvahini)",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Patna",
          "type": "Historical",
          "significance": "Ancient Pataliputra; capital of Bihar",
          "state": "Bihar"
        },
        {
          "name": "Bhagalpur",
          "type": "Ecological",
          "significance": "Vikramshila Gangetic Dolphin Sanctuary; Bhagalpur silk",
          "state": "Bihar"
        },
        {
          "name": "Farakka",
          "type": "Infrastructure",
          "significance": "Farakka Barrage; Ganga splits into the Bhagirathi-Hooghly and the Padma",
          "state": "West Bengal"
        },
        {
          "name": "Kolkata",
          "type": "Economic",
          "significance": "Major port city on the Hooghly distributary",
          "state": "West Bengal"
        }
      ],
      "dams": [
        {
          "name": "Tehri Dam",
          "state": "Uttarakhand",
          "type": "Rock-and-earth-fill dam on the Bhagirathi (~260.5 m), highest dam in India; 1,000 MW first stage"
        },
        {
          "name": "Koteshwar Dam",
          "state": "Uttarakhand",
          "type": "400 MW; downstream unit of the Tehri complex"
        },
        {
          "name": "Bhimgoda Barrage",
          "state": "Uttarakhand",
          "type": "At Haridwar; head of the Upper Ganga Canal"
        },
        {
          "name": "Narora Barrage",
          "state": "Uttar Pradesh",
          "type": "Head of the Lower Ganga Canal; Narora atomic power station nearby"
        },
        {
          "name": "Farakka Barrage",
          "state": "West Bengal",
          "type": "Commissioned 1975; diverts water into the Hooghly to keep Kolkata port navigable"
        }
      ],
      "protectedAreas": [
        {
          "name": "Gangotri National Park",
          "relation": "Glacial source region of the Bhagirathi",
          "state": "Uttarakhand"
        },
        {
          "name": "Nanda Devi and Valley of Flowers National Parks",
          "relation": "Alaknanda catchment; UNESCO World Heritage Site",
          "state": "Uttarakhand"
        },
        {
          "name": "Rajaji Tiger Reserve",
          "relation": "Shivalik stretch where the Ganga leaves the hills near Haridwar",
          "state": "Uttarakhand"
        },
        {
          "name": "Upper Ganga River (Brijghat to Narora)",
          "relation": "Ramsar site (2005); dolphin and gharial habitat",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Vikramshila Gangetic Dolphin Sanctuary",
          "relation": "Sultanganj-Kahalgaon stretch near Bhagalpur; India's only dolphin sanctuary",
          "state": "Bihar"
        },
        {
          "name": "Sundarbans National Park",
          "relation": "Delta mangroves; UNESCO World Heritage Site and Ramsar site",
          "state": "West Bengal"
        }
      ],
      "species": [
        {
          "name": "Ganges River Dolphin",
          "iucn": "Endangered",
          "role": "National Aquatic Animal of India (2009); indicator of river health"
        },
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Found in the upper Ganga and its tributaries"
        },
        {
          "name": "Bengal Tiger",
          "iucn": "Endangered",
          "role": "Mangrove-adapted population in the Sundarbans"
        },
        {
          "name": "Hilsa",
          "iucn": null,
          "role": "Migratory fish that swims upriver to breed; Farakka obstructs its migration"
        }
      ],
      "commonMistake": "The Ganga enters the plains at HARIDWAR, not Rishikesh. Yamuna and Son are RIGHT-bank tributaries; Ramganga, Gomti, Ghaghara, Gandak and Kosi are LEFT-bank. The Kosi joins at Kursela, not Bhagalpur. The Damodar joins the Hooghly, not the main Ganga."
    },
    "staticFacts": [
      "Its Indian basin covers about 8.6 lakh sq km, the largest river basin in India; the total basin including Nepal and Bangladesh is about 10.8 lakh sq km.",
      "The Alaknanda rises from the Satopanth glacier above Badrinath and collects the Dhauliganga, Nandakini, Pindar and Mandakini at the Panch Prayag before meeting the Bhagirathi at Devprayag.",
      "Its Himalayan tributaries are perennial (snow- and rain-fed); its peninsular tributaries (Yamuna's southern feeders, Son) are mainly monsoon-fed.",
      "The Haldia-Prayagraj stretch is National Waterway-1, India's longest national waterway (~1,620 km)."
    ],
    "similarPYQ": [
      "UPSC-2024-06",
      "GEO-CDS1-2020-05",
      "GEO-UPSC-2019-04",
      "GEO-CDS1-2018-08",
      "ENV-UPSC-2014-15"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PRY-01",
    "slug": "vishnuprayag-confluence",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Vishnuprayag (Alaknanda & Dhauliganga)",
    "aliases": [
      "First Prayag",
      "Alaknanda Dhauliganga Sangam",
      "Joshimath Prayag",
      "Vishnu Temple Confluence"
    ],
    "placeType": "Holy Himalayan River Confluence (Panch Prayag)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand (Chamoli District)"
    },
    "lat": 30.5631,
    "lng": 79.575,
    "elevation": "1,372 m",
    "neighbours": [
      "Downstream of Badrinath & Mana",
      "Upstream of Nandaprayag",
      "Near Joshimath Gateway & Valley of Flowers"
    ],
    "staticFacts": [
      "First of the Panch Prayag descending downstream on the Alaknanda River, situated near Joshimath at ~1,372 m.",
      "Formed by the confluence of the Alaknanda (originating from Satopanth & Bhagirath Kharak glaciers) and the Dhauliganga (originating from Niti Pass / Vasudhara Tal).",
      "Dhauliganga valley houses the Tapovan Vishnugad Hydel Project (impacted by the catastrophic 2021 Chamoli glacial burst).",
      "Kagbhusandi Lake and the road to Valley of Flowers & Hemkund Sahib diverge near this junction."
    ],
    "similarPYQ": [
      "GEO-UPSC-2019-04",
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PRY-02",
    "slug": "nandaprayag-confluence",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Nandaprayag (Alaknanda & Nandakini)",
    "aliases": [
      "Second Prayag",
      "Alaknanda Nandakini Sangam",
      "Nandraj Prayag",
      "Gopalji Temple Confluence"
    ],
    "placeType": "Holy Himalayan River Confluence (Panch Prayag)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand (Chamoli District)"
    },
    "lat": 30.3312,
    "lng": 79.3175,
    "elevation": "870 m",
    "neighbours": [
      "Downstream of Vishnuprayag",
      "Upstream of Karnaprayag",
      "Outer Garhwal Himalayas"
    ],
    "staticFacts": [
      "Second of the Panch Prayag descending downstream, situated in Chamoli district at ~870 m.",
      "Formed by the confluence of the Alaknanda and the Nandakini River (which originates from the glaciers of Nanda Ghunti peak on the outer rim of Nanda Devi Sanctuary).",
      "Historically served as the capital of the ancient Yadu kingdom; key junction on the Badrinath pilgrim highway.",
      "UPSC Trap: Aspirants often confuse Nandakini with Mandakini; Nandakini joins at Nandaprayag, whereas Mandakini joins at Rudraprayag."
    ],
    "similarPYQ": [
      "GEO-UPSC-2019-04",
      "ENV-UPSC-2019-14"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PRY-03",
    "slug": "karnaprayag-confluence",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Karnaprayag (Alaknanda & Pindar)",
    "aliases": [
      "Third Prayag",
      "Alaknanda Pindar Sangam",
      "Karna Tirtha",
      "Garhwal Kumaon Junction"
    ],
    "placeType": "Holy Himalayan River Confluence (Panch Prayag)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand (Chamoli District)"
    },
    "lat": 30.2583,
    "lng": 79.2167,
    "elevation": "788 m",
    "neighbours": [
      "Downstream of Nandaprayag",
      "Upstream of Rudraprayag",
      "Pindar Valley Gateway to Kumaon"
    ],
    "staticFacts": [
      "Third of the Panch Prayag, located at the confluence of the Alaknanda and the Pindar River at ~788 m.",
      "The Pindar River originates from the Pindari Glacier in Bageshwar district (Kumaon), making Karnaprayag the primary hydrological link between Garhwal and Kumaon.",
      "Named after Karna of the Mahabharata who performed austerities here to obtain the impregnable armor (Kavacha & Kundala) from Surya.",
      "Vital transport node linking Rishikesh-Badrinath NH-58 with the road to Almora, Ranikhet, and Kausani across the Pindar valley."
    ],
    "similarPYQ": [
      "GEO-UPSC-2019-04",
      "GEO-CDS1-2019-04"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PRY-04",
    "slug": "rudraprayag-confluence",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Rudraprayag (Alaknanda & Mandakini)",
    "aliases": [
      "Fourth Prayag",
      "Alaknanda Mandakini Sangam",
      "Gateway to Kedarnath",
      "Rudranath Temple Confluence"
    ],
    "placeType": "Holy Himalayan River Confluence (Panch Prayag)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand (Rudraprayag District)"
    },
    "lat": 30.285,
    "lng": 78.9814,
    "elevation": "610 m",
    "neighbours": [
      "Downstream of Karnaprayag",
      "Upstream of Devprayag",
      "Kedarnath Pilgrimage Highway"
    ],
    "staticFacts": [
      "Fourth of the Panch Prayag, situated at the confluence of the Alaknanda and the raging Mandakini River at ~610 m.",
      "The Mandakini originates from the Chorabari Glacier (near Kedarnath & Gandhi Sarovar), not the Milam glacier (UPSC 2019 prelims trap).",
      "Major pilgrimage bifurcation hub: road branches north along the Mandakini to Kedarnath, and northeast along the Alaknanda to Badrinath.",
      "Severe epicenter of the June 2013 cloudburst disaster; famous in wildlife literature for Jim Corbett's \"The Man-Eating Leopard of Rudraprayag\"."
    ],
    "similarPYQ": [
      "GEO-UPSC-2019-04",
      "GEO-CDS2-2021-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PRY-05",
    "slug": "devprayag-confluence",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Devprayag (Alaknanda & Bhagirathi — Ganga Origin)",
    "aliases": [
      "Fifth Prayag",
      "Birthplace of Ganga",
      "Alaknanda Bhagirathi Sangam",
      "Sudarshan Kshetra",
      "Raghunathji Temple Confluence"
    ],
    "placeType": "Holy Himalayan River Confluence (Panch Prayag)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand (Tehri Garhwal District)"
    },
    "lat": 30.1458,
    "lng": 78.5989,
    "elevation": "475 m",
    "neighbours": [
      "Downstream of Rudraprayag",
      "Upstream of Rishikesh",
      "Southern Garhwal Shivalik Transition"
    ],
    "staticFacts": [
      "Fifth, lowest, and most sacred of the Panch Prayag where the Alaknanda and Bhagirathi unite; downstream from this confluence, the river is officially titled GANGA.",
      "Hydrologically, the Alaknanda contributes greater water volume (~60%), but the Bhagirathi (originating at Gaumukh/Gangotri) is revered as the mythological and spiritual source.",
      "Perched on a narrow rocky spur; houses the ancient Raghunathji Temple (one of the 108 Divya Desams built in Nagara style with massive stone blocks).",
      "Below Devprayag, the Ganga cuts through the Outer Himalayas (Shivalik ranges) past Rishikesh before finally bursting onto the Northern Plains at Haridwar."
    ],
    "similarPYQ": [
      "GEO-UPSC-2019-04",
      "UPSC-2024-06",
      "GEO-CDS1-2018-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01B",
    "slug": "ramganga-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Ramganga River",
    "aliases": [
      "Ramganga",
      "Rathwahini",
      "Jim Corbett River"
    ],
    "placeType": "Himalayan Left-Bank Tributary of Ganga",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand, Uttar Pradesh"
    },
    "lat": 28.84,
    "lng": 78.78,
    "shape": [
      [
        30.07,
        79.27
      ],
      [
        30.05,
        79.28
      ],
      [
        29.53,
        78.75
      ],
      [
        28.84,
        78.78
      ],
      [
        28.37,
        79.43
      ],
      [
        27.1,
        79.95
      ]
    ],
    "neighbours": [
      "Source: Dudhatoli hills of the Garhwal Himalaya near Gairsain (Uttarakhand)",
      "Mouth: Joins the Ganga near Kannauj, Uttar Pradesh"
    ],
    "riverDetails": {
      "length": "~596 km",
      "origin": "Dudhatoli hills of the Garhwal Himalaya near Gairsain (Uttarakhand)",
      "mouth": "Joins the Ganga near Kannauj, Uttar Pradesh",
      "sourceCoords": [
        30.07,
        79.27
      ],
      "mouthCoords": [
        27.1,
        79.95
      ],
      "states": {
        "flowsThrough": [
          "Uttarakhand",
          "Uttar Pradesh"
        ],
        "basinStates": [
          "Uttarakhand",
          "Uttar Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Kosi River (Kumaon)",
            "note": "Rises near Kausani; flows past Ramnagar; a different river from the Bihar Kosi"
          }
        ],
        "rightBank": [
          {
            "name": "Mandal River",
            "note": "Joins inside Corbett National Park"
          },
          {
            "name": "Khoh River",
            "note": "Drains the Kotdwar area; joins in the plains"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Ganga",
          "sangam": "Near Kannauj",
          "state": "Uttar Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Gairsain",
          "type": "Administrative",
          "significance": "Summer capital of Uttarakhand, near the source",
          "state": "Uttarakhand"
        },
        {
          "name": "Kalagarh",
          "type": "Infrastructure",
          "significance": "Ramganga Dam where the river leaves the Shivaliks",
          "state": "Uttarakhand"
        },
        {
          "name": "Moradabad",
          "type": "Economic",
          "significance": "'Brass City'; major metal-handicraft export centre",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Kannauj",
          "type": "Economic / Historical",
          "significance": "Traditional attar (perfume) centre; ancient capital of Harsha",
          "state": "Uttar Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Ramganga Dam (Kalagarh Dam)",
          "state": "Uttarakhand",
          "type": "Earth-and-rock-fill dam; irrigation and ~198 MW hydropower"
        }
      ],
      "protectedAreas": [
        {
          "name": "Jim Corbett National Park",
          "relation": "The Ramganga flows through it; India's first national park (1936, as Hailey National Park)",
          "state": "Uttarakhand"
        },
        {
          "name": "Sonanadi Wildlife Sanctuary",
          "relation": "Adjoins Corbett around the Kalagarh reservoir",
          "state": "Uttarakhand"
        }
      ],
      "species": [
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Breeding population in the Ramganga within Corbett"
        },
        {
          "name": "Golden Mahseer",
          "iucn": "Endangered",
          "role": "Game fish of the Ramganga and Kumaon Kosi"
        }
      ],
      "commonMistake": "The Kumaon Kosi (a Ramganga tributary near Corbett) is NOT the Bihar Kosi ('Sorrow of Bihar'). The Ramganga is a LEFT-bank Ganga tributary that enters the plains near Najibabad-Kalagarh."
    },
    "staticFacts": [
      "NCERT describes it as a comparatively small river rising in the Garhwal hills near Gairsain; it turns south-west after crossing the Shivaliks and enters the plains of Uttar Pradesh near Najibabad.",
      "The Kalagarh reservoir inside Corbett is a key water source for wildlife in the dry season."
    ],
    "similarPYQ": [
      "GEO-CDS1-2018-08",
      "ENV-UPSC-2014-15"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01C",
    "slug": "gomti-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Gomti River",
    "aliases": [
      "Gomati",
      "Gomat River",
      "Fulhar Jheel River"
    ],
    "placeType": "Plains-Origin Left-Bank Tributary of Ganga",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttar Pradesh"
    },
    "lat": 26.26,
    "lng": 82.07,
    "shape": [
      [
        28.6,
        80.05
      ],
      [
        27.57,
        80.66
      ],
      [
        26.85,
        80.95
      ],
      [
        26.26,
        82.07
      ],
      [
        25.75,
        82.68
      ],
      [
        25.5,
        83.17
      ]
    ],
    "neighbours": [
      "Source: Gomat Taal (Fulhar Jheel) near Madho Tanda, Pilibhit district (Uttar Pradesh); f",
      "Mouth: Joins the Ganga near Kaithi (Markandey Mahadev), on the Varanasi-Ghazipur border"
    ],
    "riverDetails": {
      "length": "~900 km",
      "origin": "Gomat Taal (Fulhar Jheel) near Madho Tanda, Pilibhit district (Uttar Pradesh); fed by groundwater and monsoon rain, not glaciers",
      "mouth": "Joins the Ganga near Kaithi (Markandey Mahadev), on the Varanasi-Ghazipur border",
      "sourceCoords": [
        28.6,
        80.05
      ],
      "mouthCoords": [
        25.5,
        83.17
      ],
      "states": {
        "flowsThrough": [
          "Uttar Pradesh"
        ],
        "basinStates": [
          "Uttar Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Kathna River",
            "note": "Joins in the upper course in Kheri-Sitapur"
          },
          {
            "name": "Sarayan River",
            "note": "Drains Sitapur district"
          }
        ],
        "rightBank": [
          {
            "name": "Sai River",
            "note": "Largest tributary; flows past Rae Bareli; joins near Jaunpur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Sai",
          "sangam": "Near Jaunpur",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Ganga",
          "sangam": "Kaithi (Varanasi-Ghazipur)",
          "state": "Uttar Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Lucknow",
          "type": "Administrative",
          "significance": "State capital on the Gomti; Gomti Riverfront and barrage",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Sultanpur",
          "type": "Administrative",
          "significance": "District town on the middle course",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Jaunpur",
          "type": "Historical",
          "significance": "Sharqi-era city; Mughal-era Shahi Bridge over the Gomti",
          "state": "Uttar Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Gomti Barrage",
          "state": "Uttar Pradesh",
          "type": "Barrage at Lucknow for urban water supply"
        }
      ],
      "protectedAreas": [
        {
          "name": "Pilibhit Tiger Reserve",
          "relation": "Terai forests near the Gomti's source area",
          "state": "Uttar Pradesh"
        }
      ],
      "species": [
        {
          "name": "Indian Softshell Turtle",
          "iucn": "Endangered",
          "role": "Freshwater turtle of the Gomti and middle Ganga"
        }
      ],
      "commonMistake": "The Gomti is NOT a Himalayan glacier-fed river; it rises from a lake in the Terai plains of Pilibhit and is groundwater- and rain-fed. It joins the Ganga below Varanasi, not at Varanasi."
    },
    "staticFacts": [
      "Flows entirely within Uttar Pradesh.",
      "As a plains-fed river its flow drops sharply in the dry season, which makes urban pollution at Lucknow more concentrated."
    ],
    "similarPYQ": [
      "UPSC-2024-06",
      "GEO-CDS1-2018-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01D",
    "slug": "ghaghara-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Ghaghara River",
    "aliases": [
      "Karnali",
      "Sarda",
      "Sarju",
      "Sarayu",
      "Mapchachungo"
    ],
    "placeType": "Trans-Himalayan Left-Bank Tributary of Ganga (Largest by Discharge)",
    "priority": "High",
    "locatedIn": {
      "country": "China (Tibet), Nepal, India",
      "stateOrProvince": "Karnali region (Nepal), Uttar Pradesh, Bihar (India)"
    },
    "lat": 28.33,
    "lng": 81.13,
    "shape": [
      [
        30.45,
        81.35
      ],
      [
        28.64,
        81.28
      ],
      [
        28.33,
        81.13
      ],
      [
        27.58,
        81.6
      ],
      [
        26.8,
        82.2
      ],
      [
        26.27,
        83.75
      ],
      [
        25.73,
        84.83
      ]
    ],
    "neighbours": [
      "Source: Glaciers of Mapchachungo, Tibet, south of Lake Mansarovar; called the Karnali in",
      "Mouth: Joins the Ganga near Chhapra (Doriganj), Saran district, Bihar"
    ],
    "riverDetails": {
      "length": "~1,080 km",
      "origin": "Glaciers of Mapchachungo, Tibet, south of Lake Mansarovar; called the Karnali in Nepal",
      "mouth": "Joins the Ganga near Chhapra (Doriganj), Saran district, Bihar",
      "sourceCoords": [
        30.45,
        81.35
      ],
      "mouthCoords": [
        25.73,
        84.83
      ],
      "states": {
        "flowsThrough": [
          "Uttar Pradesh",
          "Bihar"
        ],
        "basinStates": [
          "Uttarakhand",
          "Uttar Pradesh",
          "Bihar"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Rapti River",
            "note": "From Nepal; flows past Gorakhpur; joins near Barhaj, Deoria"
          },
          {
            "name": "Chhoti Gandak River",
            "note": "Plains river joining in the lower course"
          }
        ],
        "rightBank": [
          {
            "name": "Sarda (Kali / Mahakali) River",
            "note": "Rises at Kalapani near Lipulekh; forms the India-Nepal border in Uttarakhand; joins near Bahramghat"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Sarda",
          "sangam": "Near Bahramghat (Barabanki-Bahraich)",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Rapti",
          "sangam": "Near Barhaj, Deoria",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Ganga",
          "sangam": "Near Chhapra (Doriganj)",
          "state": "Bihar"
        }
      ],
      "towns": [
        {
          "name": "Bahraich",
          "type": "Administrative",
          "significance": "Where the Ghaghara enters the Indian plains",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Ayodhya",
          "type": "Cultural",
          "significance": "On the Ghaghara, known here as the Saryu; birthplace of Lord Ram in tradition",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Gorakhpur",
          "type": "Cultural / Economic",
          "significance": "On the Rapti tributary; Gorakhnath temple",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Chhapra",
          "type": "Historical",
          "significance": "Near the Ganga-Ghaghara confluence",
          "state": "Bihar"
        }
      ],
      "dams": [
        {
          "name": "Girijapuri Barrage",
          "state": "Uttar Pradesh",
          "type": "On the Ghaghara near Katarniaghat; feeds the Saryu Nahar canal system"
        },
        {
          "name": "Banbasa and Tanakpur Barrages",
          "state": "Uttarakhand",
          "type": "On the Sarda at the India-Nepal border; Tanakpur covered by the Mahakali Treaty (1996)"
        },
        {
          "name": "Pancheshwar Multipurpose Project",
          "state": "Uttarakhand / Nepal border",
          "type": "Proposed India-Nepal dam on the Mahakali (Sarda)"
        }
      ],
      "protectedAreas": [
        {
          "name": "Katarniaghat Wildlife Sanctuary",
          "relation": "Girwa (Ghaghara) river stretch; gharial and dolphin habitat",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Dudhwa National Park",
          "relation": "Sarda-Ghaghara Terai; swamp deer and rhino reintroduction",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Bardiya National Park",
          "relation": "Karnali river stretch in Nepal",
          "state": "Nepal"
        }
      ],
      "species": [
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Breeds in the Girwa river at Katarniaghat"
        },
        {
          "name": "Ganges River Dolphin",
          "iucn": "Endangered",
          "role": "Present in the Girwa-Ghaghara stretch"
        },
        {
          "name": "Swamp Deer (Barasingha)",
          "iucn": "Vulnerable",
          "role": "Northern population in Dudhwa grasslands"
        }
      ],
      "commonMistake": "The Sarda is a RIGHT-bank tributary and the Rapti is a LEFT-bank tributary. The Ghaghara enters India in Uttar Pradesh directly from Nepal, not through Uttarakhand; it is the Sarda (Kali) that forms the Uttarakhand-Nepal border. 'Saryu' at Ayodhya is the Ghaghara itself."
    },
    "staticFacts": [
      "NCERT: after collecting the Tila, Seti and Beri in Nepal, it cuts a deep gorge at Shishapani before entering the plains.",
      "The largest tributary of the Ganga by discharge, while the Yamuna is the longest and largest by basin.",
      "The Kali (Sarda) boundary near Kalapani-Lipulekh is at the centre of the India-Nepal boundary dispute."
    ],
    "similarPYQ": [
      "UPSC-2024-06",
      "GEO-CDS1-2018-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01E",
    "slug": "gandak-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Gandak River",
    "aliases": [
      "Narayani",
      "Kali Gandak",
      "Gandaki",
      "Salagrami"
    ],
    "placeType": "Himalayan Left-Bank Tributary of Ganga",
    "priority": "High",
    "locatedIn": {
      "country": "China (Tibet border), Nepal, India",
      "stateOrProvince": "Gandaki region (Nepal), Bihar, Uttar Pradesh (India)"
    },
    "lat": 27.43,
    "lng": 84.13,
    "shape": [
      [
        29.25,
        83.95
      ],
      [
        28.5,
        83.65
      ],
      [
        27.43,
        83.92
      ],
      [
        27.1,
        84.09
      ],
      [
        25.68,
        85.2
      ],
      [
        25.68,
        85.18
      ]
    ],
    "neighbours": [
      "Source: Kali Gandaki rises near Nhubine Himal on the Nepal-Tibet border (Mustang); NCERT",
      "Mouth: Joins the Ganga at Sonpur, opposite Patna, Bihar"
    ],
    "riverDetails": {
      "length": "~630 km",
      "origin": "Kali Gandaki rises near Nhubine Himal on the Nepal-Tibet border (Mustang); NCERT says the river rises between Dhaulagiri and Mount Everest from two streams, the Kali Gandak and the Trishulganga",
      "mouth": "Joins the Ganga at Sonpur, opposite Patna, Bihar",
      "sourceCoords": [
        29.25,
        83.95
      ],
      "mouthCoords": [
        25.68,
        85.18
      ],
      "states": {
        "flowsThrough": [
          "Bihar",
          "Uttar Pradesh"
        ],
        "basinStates": [
          "Bihar",
          "Uttar Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Trishuli River",
            "note": "Headstream from the central Himalaya; meets the Kali Gandaki at Devghat"
          },
          {
            "name": "East Rapti River",
            "note": "Flows through Chitwan; joins the Narayani in Nepal"
          }
        ],
        "rightBank": [
          {
            "name": "Kali Gandaki River",
            "note": "Headstream; cuts the Kali Gandaki gorge between Dhaulagiri and Annapurna"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Kali Gandaki + Trishuli",
          "sangam": "Devghat (forms the Narayani)",
          "state": "Nepal"
        },
        {
          "tributary": "Ganga",
          "sangam": "Sonpur-Hajipur, opposite Patna",
          "state": "Bihar"
        }
      ],
      "towns": [
        {
          "name": "Valmikinagar",
          "type": "Infrastructure",
          "significance": "Point of entry into India; Gandak Barrage; Valmiki Tiger Reserve",
          "state": "Bihar"
        },
        {
          "name": "Kushinagar",
          "type": "Cultural",
          "significance": "Mahaparinirvana site of the Buddha, near the Gandak in east UP",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Hajipur (Vaishali)",
          "type": "Historical",
          "significance": "Near ancient Vaishali, birthplace of Mahavira",
          "state": "Bihar"
        },
        {
          "name": "Sonpur",
          "type": "Cultural",
          "significance": "Gandak-Ganga confluence; Harihar Kshetra / Sonepur cattle fair",
          "state": "Bihar"
        }
      ],
      "dams": [
        {
          "name": "Gandak Barrage",
          "state": "Bihar / Nepal border",
          "type": "At Valmikinagar under the India-Nepal Gandak Agreement (1959); irrigation canals for Bihar, UP and Nepal"
        }
      ],
      "protectedAreas": [
        {
          "name": "Valmiki Tiger Reserve",
          "relation": "Gandak floodplain and Shivalik forests at the entry point",
          "state": "Bihar"
        },
        {
          "name": "Chitwan National Park",
          "relation": "Narayani and Rapti valleys in Nepal; UNESCO World Heritage Site",
          "state": "Nepal"
        }
      ],
      "species": [
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Wild breeding population restored in the Gandak in Bihar"
        },
        {
          "name": "Greater One-horned Rhinoceros",
          "iucn": "Vulnerable",
          "role": "Flagship species of Chitwan"
        }
      ],
      "commonMistake": "The Gandak is called the NARAYANI in Nepal; the KARNALI is the Ghaghara. It joins the Ganga at Sonpur opposite Patna, not at Patna city itself. The Burhi Gandak is a separate plains river."
    },
    "staticFacts": [
      "The Kali Gandaki gorge between Dhaulagiri and Annapurna is among the deepest gorges in the world.",
      "The Kali Gandaki bed yields shaligram stones, which are fossil ammonites.",
      "For part of its course the Gandak forms the Bihar-Uttar Pradesh boundary."
    ],
    "similarPYQ": [
      "UPSC-2024-06",
      "GEO-UPSC-2023-07",
      "GEO-CDS1-2018-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01F",
    "slug": "kosi-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Kosi River",
    "aliases": [
      "Saptakoshi",
      "Sapta Kosi",
      "Arun",
      "Kausiki",
      "Sorrow of Bihar"
    ],
    "placeType": "Antecedent Himalayan Left-Bank Tributary of Ganga ('Sorrow of Bihar')",
    "priority": "High",
    "locatedIn": {
      "country": "China (Tibet), Nepal, India",
      "stateOrProvince": "Koshi province (Nepal), Bihar (India)"
    },
    "lat": 26.85,
    "lng": 87.15,
    "shape": [
      [
        28.45,
        86.55
      ],
      [
        26.85,
        87.15
      ],
      [
        26.52,
        86.93
      ],
      [
        26.12,
        86.6
      ],
      [
        25.88,
        86.6
      ],
      [
        25.45,
        87.25
      ]
    ],
    "neighbours": [
      "Source: Main stream Arun rises north of Mount Everest in Tibet (NCERT); the PDF's 'Matsa",
      "Mouth: Joins the Ganga near Kursela, Katihar district, Bihar"
    ],
    "riverDetails": {
      "length": "~720 km",
      "origin": "Main stream Arun rises north of Mount Everest in Tibet (NCERT); the PDF's 'Matsang glacier near Gosainthan' refers to the Sun Kosi headwaters",
      "mouth": "Joins the Ganga near Kursela, Katihar district, Bihar",
      "sourceCoords": [
        28.45,
        86.55
      ],
      "mouthCoords": [
        25.45,
        87.25
      ],
      "states": {
        "flowsThrough": [
          "Bihar"
        ],
        "basinStates": [
          "Bihar"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Arun River",
            "note": "Main stream, rising in Tibet north of Everest; cuts through the Himalaya"
          },
          {
            "name": "Tamur River",
            "note": "Drains the Kanchenjunga area of eastern Nepal"
          }
        ],
        "rightBank": [
          {
            "name": "Sun Kosi River",
            "note": "Collects the Indravati, Bhote Kosi, Tama Kosi, Likhu and Dudh Kosi"
          },
          {
            "name": "Bagmati River",
            "note": "From the Kathmandu valley; joins the Kosi in north Bihar"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Sun Kosi + Arun + Tamur",
          "sangam": "Tribeni (forms the Sapta Kosi)",
          "state": "Nepal"
        },
        {
          "tributary": "Ganga",
          "sangam": "Near Kursela, Katihar",
          "state": "Bihar"
        }
      ],
      "towns": [
        {
          "name": "Barahakshetra",
          "type": "Cultural",
          "significance": "Pilgrimage site at the Chatra gorge where the Kosi leaves the hills",
          "state": "Nepal"
        },
        {
          "name": "Birpur / Bhimnagar",
          "type": "Infrastructure",
          "significance": "Kosi Barrage on the India-Nepal border",
          "state": "Bihar"
        },
        {
          "name": "Saharsa and Supaul",
          "type": "Economic",
          "significance": "Flood-prone Kosi plains; Mithila makhana belt",
          "state": "Bihar"
        },
        {
          "name": "Purnia",
          "type": "Historical",
          "significance": "Lies along old courses of the westward-shifting Kosi",
          "state": "Bihar"
        }
      ],
      "dams": [
        {
          "name": "Kosi Barrage",
          "state": "Nepal / Bihar border",
          "type": "At Bhimnagar under the India-Nepal Kosi Agreement (1954); embankments and canals"
        },
        {
          "name": "Sapta Kosi High Dam",
          "state": "Nepal",
          "type": "Proposed India-Nepal multipurpose dam for flood control"
        },
        {
          "name": "Kosi-Mechi Link Project",
          "state": "Bihar",
          "type": "Intra-state link carrying surplus Kosi water to the Mahananda basin"
        }
      ],
      "protectedAreas": [
        {
          "name": "Koshi Tappu Wildlife Reserve",
          "relation": "Floodplain above the Kosi barrage; Ramsar site (1987)",
          "state": "Nepal"
        }
      ],
      "species": [
        {
          "name": "Wild Water Buffalo",
          "iucn": "Endangered",
          "role": "Last Nepalese population in Koshi Tappu"
        },
        {
          "name": "Ganges River Dolphin",
          "iucn": "Endangered",
          "role": "Present in the Kosi and its confluence stretch"
        }
      ],
      "commonMistake": "The Kosi joins the Ganga at KURSELA, not Bhagalpur. It is an ANTECEDENT river whose main stream is the ARUN. Valmiki Tiger Reserve belongs to the GANDAK, not the Kosi."
    },
    "staticFacts": [
      "Called the Sapta Kosi in Nepal after its seven headstreams: Indravati, Sun Kosi, Tama Kosi, Likhu, Dudh Kosi, Arun and Tamur.",
      "Its heavy silt load built the Kosi megafan, and the river has shifted westward by more than 100 km over about two centuries.",
      "The 2008 embankment breach at Kusaha (Nepal) diverted the river eastwards and caused catastrophic floods in Bihar."
    ],
    "similarPYQ": [
      "UPSC-2024-06",
      "GEO-CDS1-2019-04",
      "GEO-CDS1-2018-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01G",
    "slug": "mahananda-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Mahananda River",
    "aliases": [
      "Mahananda",
      "Mahaldiram River",
      "Siliguri Corridor River"
    ],
    "placeType": "Transboundary Left-Bank Tributary of Ganga",
    "priority": "Medium",
    "locatedIn": {
      "country": "India, Bangladesh",
      "stateOrProvince": "West Bengal, Bihar (India); Rajshahi division (Bangladesh)"
    },
    "lat": 26.1,
    "lng": 87.95,
    "shape": [
      [
        26.88,
        88.32
      ],
      [
        26.72,
        88.43
      ],
      [
        26.1,
        87.95
      ],
      [
        25,
        88.14
      ],
      [
        24.47,
        88.33
      ]
    ],
    "neighbours": [
      "Source: Mahaldiram hill near Kurseong, Darjeeling district (West Bengal), at ~2,100 m",
      "Mouth: Joins the Ganga (Padma) near Godagari, Rajshahi district, Bangladesh"
    ],
    "riverDetails": {
      "length": "~360 km",
      "origin": "Mahaldiram hill near Kurseong, Darjeeling district (West Bengal), at ~2,100 m",
      "mouth": "Joins the Ganga (Padma) near Godagari, Rajshahi district, Bangladesh",
      "sourceCoords": [
        26.88,
        88.32
      ],
      "mouthCoords": [
        24.47,
        88.33
      ],
      "states": {
        "flowsThrough": [
          "West Bengal",
          "Bihar"
        ],
        "basinStates": [
          "West Bengal",
          "Bihar"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Nagar River",
            "note": "Forms part of the Bihar-West Bengal boundary"
          },
          {
            "name": "Tangon and Punarbhaba Rivers",
            "note": "Join in the lower course near the Bangladesh border"
          }
        ],
        "rightBank": [
          {
            "name": "Balason River",
            "note": "Darjeeling hill stream joining near Siliguri"
          },
          {
            "name": "Mechi River",
            "note": "Forms part of the India-Nepal border; joins in Kishanganj district"
          },
          {
            "name": "Kankai River",
            "note": "From eastern Nepal; joins in Bihar"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Mechi",
          "sangam": "Kishanganj district",
          "state": "Bihar"
        },
        {
          "tributary": "Ganga (Padma)",
          "sangam": "Near Godagari",
          "state": "Bangladesh"
        }
      ],
      "towns": [
        {
          "name": "Siliguri",
          "type": "Strategic / Economic",
          "significance": "Hub of the Siliguri Corridor ('Chicken's Neck') linking the Northeast",
          "state": "West Bengal"
        },
        {
          "name": "Kishanganj",
          "type": "Economic",
          "significance": "Tea-growing district of Bihar",
          "state": "Bihar"
        },
        {
          "name": "Malda (English Bazar)",
          "type": "Historical / Economic",
          "significance": "Mango orchards; ruins of Gaur and Pandua nearby",
          "state": "West Bengal"
        }
      ],
      "dams": [
        {
          "name": "Mahananda Barrage",
          "state": "West Bengal",
          "type": "At Fulbari near Siliguri; part of the Teesta Barrage Project canal system"
        }
      ],
      "protectedAreas": [
        {
          "name": "Mahananda Wildlife Sanctuary",
          "relation": "Source area in the Darjeeling foothills",
          "state": "West Bengal"
        }
      ],
      "species": [
        {
          "name": "Asian Elephant",
          "iucn": "Endangered",
          "role": "Uses the Mahananda forests as a corridor between Nepal, Bengal and Assam"
        }
      ],
      "commonMistake": "The Mahananda joins the Ganga in BANGLADESH, not in India. It flows through West Bengal and Bihar (Bangladesh is a country, not an Indian state)."
    },
    "staticFacts": [
      "The last major left-bank tributary of the Ganga in its Indian course.",
      "Its upper course crosses the Siliguri Corridor, India's narrow land link to the Northeast."
    ],
    "similarPYQ": [
      "UPSC-2024-06",
      "UPSC-2026-61"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01H",
    "slug": "yamuna-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Yamuna River",
    "aliases": [
      "Kalindi",
      "Yamunotri",
      "Jamuna (India)",
      "Asita",
      "Yami"
    ],
    "placeType": "Longest Tributary of Ganga (Right Bank)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand, Himachal Pradesh, Haryana, Delhi, Uttar Pradesh"
    },
    "lat": 27.18,
    "lng": 78.02,
    "shape": [
      [
        31.02,
        78.45
      ],
      [
        30.5,
        77.85
      ],
      [
        30.43,
        77.62
      ],
      [
        30.22,
        77.35
      ],
      [
        28.61,
        77.21
      ],
      [
        28.53,
        77.39
      ],
      [
        27.5,
        77.68
      ],
      [
        27.18,
        78.02
      ],
      [
        26.48,
        79.18
      ],
      [
        25.95,
        80.17
      ],
      [
        25.78,
        80.53
      ],
      [
        25.42,
        81.88
      ]
    ],
    "neighbours": [
      "Source: Yamunotri Glacier on the western slopes of the Bandarpunch range (6,316 m), Garh",
      "Mouth: Joins the Ganga at the Triveni Sangam, Prayagraj (Uttar Pradesh)"
    ],
    "riverDetails": {
      "length": "1,376 km",
      "origin": "Yamunotri Glacier on the western slopes of the Bandarpunch range (6,316 m), Garhwal Himalaya, Uttarkashi district (Uttarakhand)",
      "mouth": "Joins the Ganga at the Triveni Sangam, Prayagraj (Uttar Pradesh)",
      "sourceCoords": [
        31.02,
        78.45
      ],
      "mouthCoords": [
        25.42,
        81.88
      ],
      "states": {
        "flowsThrough": [
          "Uttarakhand",
          "Himachal Pradesh",
          "Haryana",
          "Delhi",
          "Uttar Pradesh"
        ],
        "basinStates": [
          "Uttarakhand",
          "Himachal Pradesh",
          "Haryana",
          "Delhi",
          "Uttar Pradesh",
          "Rajasthan",
          "Madhya Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Hindon River",
            "note": "Rises in the Shivaliks (Saharanpur); flows past Ghaziabad; joins near Greater Noida"
          },
          {
            "name": "Rind River",
            "note": "Doab river joining in the lower course"
          },
          {
            "name": "Sengar River",
            "note": "Doab river joining in the lower course"
          }
        ],
        "rightBank": [
          {
            "name": "Tons River",
            "note": "Largest Himalayan tributary; carries more water than the Yamuna at their confluence near Kalsi"
          },
          {
            "name": "Giri River",
            "note": "Rises in Himachal Pradesh; divides Sirmaur into Cis-Giri and Trans-Giri; joins near Paonta Sahib"
          },
          {
            "name": "Chambal River",
            "note": "Largest tributary overall (length and basin); rises at Janapav, near Mhow (MP); joins near Etawah"
          },
          {
            "name": "Sind River",
            "note": "Rises in Vidisha district (MP); joins at Pachnada (Jalaun)"
          },
          {
            "name": "Betwa River",
            "note": "Rises in Raisen district (MP); passes Orchha; joins at Hamirpur"
          },
          {
            "name": "Ken River",
            "note": "Rises in Katni district (MP); flows through Panna; joins at Chilla (Banda)"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Tons",
          "sangam": "Near Kalsi, Dehradun",
          "state": "Uttarakhand"
        },
        {
          "tributary": "Giri",
          "sangam": "Near Paonta Sahib",
          "state": "Himachal Pradesh"
        },
        {
          "tributary": "Hindon",
          "sangam": "Near Greater Noida",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Chambal",
          "sangam": "Near Bhareh, Etawah",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Sind",
          "sangam": "Pachnada, Jalaun",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Betwa",
          "sangam": "Hamirpur",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Ken",
          "sangam": "Chilla, Banda",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "Ganga",
          "sangam": "Triveni Sangam, Prayagraj",
          "state": "Uttar Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Yamunotri",
          "type": "Cultural",
          "significance": "Char Dham shrine near the source",
          "state": "Uttarakhand"
        },
        {
          "name": "Paonta Sahib",
          "type": "Cultural",
          "significance": "Historic Sikh pilgrimage town associated with Guru Gobind Singh",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Delhi",
          "type": "Administrative / Economic",
          "significance": "National capital; major drinking-water source and most polluted stretch",
          "state": "Delhi"
        },
        {
          "name": "Mathura & Vrindavan",
          "type": "Cultural",
          "significance": "Associated with Lord Krishna",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Agra",
          "type": "Historical",
          "significance": "Taj Mahal on the right bank; UNESCO World Heritage Site",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Prayagraj",
          "type": "Cultural",
          "significance": "Triveni Sangam; host of the Kumbh Mela",
          "state": "Uttar Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Dakpathar Barrage",
          "state": "Uttarakhand",
          "type": "Hydro diversion barrage near Vikasnagar"
        },
        {
          "name": "Hathnikund Barrage",
          "state": "Haryana",
          "type": "Replaced the Tajewala headworks; feeds the Western and Eastern Yamuna Canals"
        },
        {
          "name": "Wazirabad and Okhla Barrages",
          "state": "Delhi / Uttar Pradesh",
          "type": "Urban water supply; Okhla heads the Agra Canal"
        },
        {
          "name": "Lakhwar and Vyasi Projects",
          "state": "Uttarakhand",
          "type": "Lakhwar (300 MW, storage dam, under construction) and Vyasi (120 MW, commissioned 2022) on the upper Yamuna"
        },
        {
          "name": "Renuka Dam",
          "state": "Himachal Pradesh",
          "type": "Storage dam on the Giri, mainly for Delhi's water supply; under construction"
        }
      ],
      "protectedAreas": [
        {
          "name": "Govind Pashu Vihar National Park",
          "relation": "Upper catchment of the Tons tributary",
          "state": "Uttarakhand"
        },
        {
          "name": "Asan Barrage Conservation Reserve",
          "relation": "Wetland at the Yamuna-Asan confluence; Ramsar site (2020), Uttarakhand's first",
          "state": "Uttarakhand"
        },
        {
          "name": "Okhla Bird Sanctuary",
          "relation": "At the Okhla Barrage on the Delhi-UP border",
          "state": "Uttar Pradesh"
        }
      ],
      "species": [
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Breeds in the Chambal and Ken tributaries"
        },
        {
          "name": "Indian Skimmer",
          "iucn": "Endangered",
          "role": "Nests on clean sandbanks of the Chambal and Yamuna"
        }
      ],
      "commonMistake": "Chambal, Betwa and Ken do NOT flow directly into the Ganga; they are RIGHT-bank tributaries of the Yamuna. The CHAMBAL is the Yamuna's largest tributary by length and basin; the TONS is its largest HIMALAYAN tributary and carries more water than the Yamuna at Kalsi. Tons and Giri are RIGHT-bank, Hindon is LEFT-bank."
    },
    "staticFacts": [
      "The longest tributary of the Ganga and the largest by basin; the Ghaghara is the largest by discharge.",
      "Right-bank: Tons, Giri (Himalayan) and Chambal, Sind, Betwa, Ken (peninsular feeders). Left-bank: Hindon, Rind, Sengar.",
      "The Ganga-Yamuna Doab between the two rivers is one of India's most fertile agricultural belts.",
      "The Ken-Betwa link connects two of its right-bank tributaries across Bundelkhand."
    ],
    "similarPYQ": [
      "GEO-UPSC-2019-04",
      "GEO-CDS1-2020-05",
      "ENV-UPSC-2017-05",
      "GEO-CDS2-2021-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01I",
    "slug": "chambal-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Chambal River",
    "aliases": [
      "Charmanvati",
      "Charmanyavati",
      "Chambal Badlands",
      "Kota River"
    ],
    "placeType": "Peninsular Right-Bank Tributary of Yamuna (Largest Yamuna Tributary)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Rajasthan, Uttar Pradesh"
    },
    "lat": 25.18,
    "lng": 75.83,
    "shape": [
      [
        22.45,
        75.75
      ],
      [
        24.53,
        75.58
      ],
      [
        24.93,
        75.58
      ],
      [
        25.05,
        75.68
      ],
      [
        25.18,
        75.83
      ],
      [
        26.02,
        76.6
      ],
      [
        26.7,
        77.9
      ],
      [
        26.48,
        79.18
      ]
    ],
    "neighbours": [
      "Source: Janapav hills of the Vindhya range near Mhow, Indore district (Madhya Pradesh), ",
      "Mouth: Joins the Yamuna near Bhareh, Etawah district (Uttar Pradesh)"
    ],
    "riverDetails": {
      "length": "~960 km",
      "origin": "Janapav hills of the Vindhya range near Mhow, Indore district (Madhya Pradesh), at ~850 m",
      "mouth": "Joins the Yamuna near Bhareh, Etawah district (Uttar Pradesh)",
      "sourceCoords": [
        22.45,
        75.75
      ],
      "mouthCoords": [
        26.48,
        79.18
      ],
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
            "name": "Banas River",
            "note": "Rises in the Aravallis (Rajsamand); flows entirely in Rajasthan; joins at Rameshwar, Sawai Madhopur"
          },
          {
            "name": "Mej River",
            "note": "Rajasthan tributary joining near Bundi-Kota"
          }
        ],
        "rightBank": [
          {
            "name": "Shipra River",
            "note": "Flows past Ujjain; joins in the upper course"
          },
          {
            "name": "Kali Sindh River",
            "note": "From the Malwa plateau; joins in Kota district"
          },
          {
            "name": "Parbati River",
            "note": "From the Malwa plateau; joins near the MP-Rajasthan border"
          },
          {
            "name": "Kuno River",
            "note": "Flows through Kuno National Park; joins in Morena-Sheopur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Banas",
          "sangam": "Rameshwar, Sawai Madhopur",
          "state": "Rajasthan"
        },
        {
          "tributary": "Yamuna",
          "sangam": "Near Bhareh, Etawah",
          "state": "Uttar Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Mhow (Dr. Ambedkar Nagar)",
          "type": "Historical",
          "significance": "Near the source at Janapav; birthplace of Dr. B.R. Ambedkar",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Ujjain",
          "type": "Cultural",
          "significance": "On the Shipra tributary; Mahakaleshwar Jyotirlinga; Simhastha Kumbh",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Rawatbhata",
          "type": "Infrastructure",
          "significance": "Rana Pratap Sagar dam and Rajasthan Atomic Power Station",
          "state": "Rajasthan"
        },
        {
          "name": "Kota",
          "type": "Economic",
          "significance": "Industrial and coaching hub; Kota Barrage",
          "state": "Rajasthan"
        },
        {
          "name": "Dholpur",
          "type": "Economic",
          "significance": "Chambal ravines; red sandstone quarries",
          "state": "Rajasthan"
        },
        {
          "name": "Etawah",
          "type": "Ecological",
          "significance": "Chambal-Yamuna confluence region",
          "state": "Uttar Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Gandhi Sagar Dam",
          "state": "Madhya Pradesh",
          "type": "Storage dam; ~115 MW; first tier of the Chambal Valley Project"
        },
        {
          "name": "Rana Pratap Sagar Dam",
          "state": "Rajasthan",
          "type": "~172 MW at Rawatbhata"
        },
        {
          "name": "Jawahar Sagar Dam",
          "state": "Rajasthan",
          "type": "~99 MW, between Rawatbhata and Kota"
        },
        {
          "name": "Kota Barrage",
          "state": "Rajasthan",
          "type": "Irrigation barrage feeding canals in Rajasthan and MP"
        }
      ],
      "protectedAreas": [
        {
          "name": "National Chambal Sanctuary",
          "relation": "Tri-state riverine sanctuary (1979) along the lower Chambal",
          "state": "Madhya Pradesh / Rajasthan / Uttar Pradesh"
        },
        {
          "name": "Mukundra Hills Tiger Reserve",
          "relation": "Gorge section of the Chambal near Kota",
          "state": "Rajasthan"
        },
        {
          "name": "Kuno National Park",
          "relation": "On the Kuno tributary; site of the cheetah reintroduction (2022)",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Ranthambhore Tiger Reserve",
          "relation": "Lies between the Chambal and the Banas",
          "state": "Rajasthan"
        }
      ],
      "species": [
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "The Chambal holds the largest wild population in the world"
        },
        {
          "name": "Red-crowned Roofed Turtle",
          "iucn": "Critically Endangered",
          "role": "Freshwater turtle found mainly in the National Chambal Sanctuary"
        },
        {
          "name": "Indian Skimmer",
          "iucn": "Endangered",
          "role": "Nests on Chambal sandbars"
        },
        {
          "name": "Ganges River Dolphin",
          "iucn": "Endangered",
          "role": "Present in the lower Chambal"
        }
      ],
      "commonMistake": "BANAS is a LEFT-bank tributary, while Kali Sindh, Parbati, Shipra and Kuno are RIGHT-bank. The SIND joins the Yamuna directly, not the Chambal. The Chambal flows NORTH and then north-east, against the general southward slope of peninsular rivers."
    },
    "staticFacts": [
      "A north-flowing river of the Malwa plateau that forms part of the Madhya Pradesh-Rajasthan boundary.",
      "Badland (ravine) topography along its lower course is a classic example of gully erosion.",
      "The four-tier Chambal Valley Project comprises Gandhi Sagar, Rana Pratap Sagar, Jawahar Sagar and the Kota Barrage."
    ],
    "similarPYQ": [
      "ENV-UPSC-2017-05",
      "ENV-UPSC-2017-14",
      "ENV-UPSC-2019-09",
      "GEO-CDS1-2020-05"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01J",
    "slug": "betwa-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Betwa River",
    "aliases": [
      "Vetravati",
      "Shuktimati",
      "Orchha River",
      "Bundelkhand River"
    ],
    "placeType": "Peninsular Right-Bank Tributary of Yamuna",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Uttar Pradesh"
    },
    "lat": 25.35,
    "lng": 78.64,
    "shape": [
      [
        23.05,
        77.35
      ],
      [
        23.53,
        77.82
      ],
      [
        24.18,
        78.23
      ],
      [
        24.63,
        78.27
      ],
      [
        25.18,
        78.5
      ],
      [
        25.35,
        78.64
      ],
      [
        25.45,
        78.58
      ],
      [
        25.95,
        80.17
      ]
    ],
    "neighbours": [
      "Source: Vindhya range near Jhiri village, Raisen district, south-west of Bhopal (Madhya ",
      "Mouth: Joins the Yamuna at Hamirpur (Uttar Pradesh)"
    ],
    "riverDetails": {
      "length": "~590 km",
      "origin": "Vindhya range near Jhiri village, Raisen district, south-west of Bhopal (Madhya Pradesh)",
      "mouth": "Joins the Yamuna at Hamirpur (Uttar Pradesh)",
      "sourceCoords": [
        23.05,
        77.35
      ],
      "mouthCoords": [
        25.95,
        80.17
      ],
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Uttar Pradesh"
        ],
        "basinStates": [
          "Madhya Pradesh",
          "Uttar Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Halali River",
            "note": "Joins in Raisen-Vidisha"
          },
          {
            "name": "Bina River",
            "note": "Joins in the upper Bundelkhand stretch"
          }
        ],
        "rightBank": [
          {
            "name": "Jamni River",
            "note": "Joins near Orchha"
          },
          {
            "name": "Dhasan River",
            "note": "Largest tributary; drains central Bundelkhand"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Yamuna",
          "sangam": "Hamirpur",
          "state": "Uttar Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Vidisha",
          "type": "Historical",
          "significance": "Ancient Besnagar (Heliodorus pillar); near Sanchi and the Udayagiri caves",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Orchha",
          "type": "Historical",
          "significance": "Bundela capital; Ram Raja temple and riverside chhatris",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Jhansi",
          "type": "Historical",
          "significance": "Near the river; Rani Lakshmibai and the 1857 revolt",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Hamirpur",
          "type": "Administrative",
          "significance": "Betwa-Yamuna confluence",
          "state": "Uttar Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Rajghat Dam",
          "state": "Madhya Pradesh / Uttar Pradesh border",
          "type": "Joint MP-UP irrigation and power project near Lalitpur"
        },
        {
          "name": "Matatila Dam",
          "state": "Uttar Pradesh / Madhya Pradesh border",
          "type": "Irrigation and hydropower near Lalitpur"
        },
        {
          "name": "Parichha Dam",
          "state": "Uttar Pradesh",
          "type": "Irrigation reservoir; Parichha thermal power station"
        }
      ],
      "protectedAreas": [
        {
          "name": "Ratapani Tiger Reserve",
          "relation": "Vindhyan forests near the Betwa's source; notified as a tiger reserve in December 2024",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Orchha Wildlife Sanctuary",
          "relation": "Riverine island sanctuary between the Betwa and Jamni",
          "state": "Madhya Pradesh"
        }
      ],
      "species": [
        {
          "name": "Indian Vulture",
          "iucn": "Critically Endangered",
          "role": "Nests on the old monuments and cliffs around Orchha"
        }
      ],
      "commonMistake": "The Betwa joins the YAMUNA at Hamirpur, not the Ganga. In the Ken-Betwa link, water flows FROM the Ken TO the Betwa."
    },
    "staticFacts": [
      "Known as the Vetravati in ancient texts.",
      "Flows north-east across the Bundelkhand upland of granite and gneiss."
    ],
    "similarPYQ": [
      "GEO-UPSC-2016-03",
      "GEO-CDS1-2020-05"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01K",
    "slug": "ken-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Ken River",
    "aliases": [
      "Karnavati",
      "Kayan",
      "Raneh Falls River",
      "Panna River"
    ],
    "placeType": "Peninsular Right-Bank Tributary of Yamuna",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Uttar Pradesh"
    },
    "lat": 24.62,
    "lng": 80,
    "shape": [
      [
        23.7,
        80.2
      ],
      [
        24.28,
        80.18
      ],
      [
        24.62,
        80
      ],
      [
        24.78,
        79.92
      ],
      [
        25.12,
        80.3
      ],
      [
        25.48,
        80.33
      ],
      [
        25.78,
        80.53
      ]
    ],
    "neighbours": [
      "Source: Kaimur hills near Ahirgawan village, Katni district (Madhya Pradesh)",
      "Mouth: Joins the Yamuna near Chilla village, Banda district (Uttar Pradesh)"
    ],
    "riverDetails": {
      "length": "~427 km",
      "origin": "Kaimur hills near Ahirgawan village, Katni district (Madhya Pradesh)",
      "mouth": "Joins the Yamuna near Chilla village, Banda district (Uttar Pradesh)",
      "sourceCoords": [
        23.7,
        80.2
      ],
      "mouthCoords": [
        25.78,
        80.53
      ],
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Uttar Pradesh"
        ],
        "basinStates": [
          "Madhya Pradesh",
          "Uttar Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Sonar River",
            "note": "Largest tributary (with the Bearma); drains Sagar-Damoh"
          },
          {
            "name": "Urmil River",
            "note": "Joins in the lower Bundelkhand stretch"
          }
        ],
        "rightBank": []
      },
      "confluences": [
        {
          "tributary": "Yamuna",
          "sangam": "Chilla, Banda",
          "state": "Uttar Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Panna",
          "type": "Economic",
          "significance": "Diamond mining (Majhgawan mine, NMDC) and Panna Tiger Reserve",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Khajuraho",
          "type": "Cultural",
          "significance": "Chandela temples near the Ken; UNESCO World Heritage Site",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Banda",
          "type": "Cultural",
          "significance": "Known for Shajar stones from the Ken bed (GI-tagged)",
          "state": "Uttar Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Daudhan Dam (Ken-Betwa Link)",
          "state": "Madhya Pradesh",
          "type": "Under construction in Panna; transfers Ken water to the Betwa basin"
        },
        {
          "name": "Bariyarpur Pickup Weir",
          "state": "Madhya Pradesh",
          "type": "Irrigation diversion weir downstream of Panna"
        }
      ],
      "protectedAreas": [
        {
          "name": "Panna Tiger Reserve",
          "relation": "The Ken flows through it; core of the Panna Biosphere Reserve (UNESCO MAB, 2020)",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Ken Gharial Sanctuary",
          "relation": "Gorge stretch near Raneh Falls",
          "state": "Madhya Pradesh"
        }
      ],
      "species": [
        {
          "name": "Bengal Tiger",
          "iucn": "Endangered",
          "role": "Panna's population was successfully re-established after local extinction around 2009"
        },
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Protected in the Ken Gharial Sanctuary"
        }
      ],
      "commonMistake": "The Ken-Betwa link transfers water FROM the Ken TO the Betwa. The project is no longer 'proposed': its foundation stone was laid in December 2024."
    },
    "staticFacts": [
      "The Raneh Falls canyon shows crystalline granite in shades of pink, red and grey.",
      "Its basin is part of Bundelkhand, built of granite, gneiss and Vindhyan sandstone.",
      "The Ken-Betwa project is India's first river-interlinking project under the National Perspective Plan."
    ],
    "similarPYQ": [
      "GEO-UPSC-2016-03",
      "GEO-CDS1-2020-05"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01L",
    "slug": "son-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Son River",
    "aliases": [
      "Sone",
      "Sonabhadra",
      "Suvarnarekha of MP",
      "Hiranyavaha"
    ],
    "placeType": "Peninsular Right-Bank Tributary of Ganga",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Uttar Pradesh, Bihar"
    },
    "lat": 24.52,
    "lng": 83.02,
    "shape": [
      [
        22.67,
        81.75
      ],
      [
        23.45,
        81.35
      ],
      [
        24.19,
        81.28
      ],
      [
        24.52,
        83.02
      ],
      [
        24.8,
        83.8
      ],
      [
        25.35,
        84.45
      ],
      [
        25.65,
        84.9
      ]
    ],
    "neighbours": [
      "Source: Amarkantak plateau (Sonmuda), Anuppur district (Madhya Pradesh); the Narmada and",
      "Mouth: Joins the Ganga near Arrah-Maner, west of Patna (Bihar)"
    ],
    "riverDetails": {
      "length": "~784 km",
      "origin": "Amarkantak plateau (Sonmuda), Anuppur district (Madhya Pradesh); the Narmada and Johilla also rise here",
      "mouth": "Joins the Ganga near Arrah-Maner, west of Patna (Bihar)",
      "sourceCoords": [
        22.67,
        81.75
      ],
      "mouthCoords": [
        25.65,
        84.9
      ],
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Uttar Pradesh",
          "Bihar"
        ],
        "basinStates": [
          "Madhya Pradesh",
          "Chhattisgarh",
          "Uttar Pradesh",
          "Jharkhand",
          "Bihar"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Johilla River",
            "note": "Also rises at Amarkantak; joins in the upper course"
          }
        ],
        "rightBank": [
          {
            "name": "Gopad River",
            "note": "Drains Sidhi district (MP)"
          },
          {
            "name": "Rihand River",
            "note": "From Chhattisgarh; dammed at Pipri (Rihand Dam / G.B. Pant Sagar)"
          },
          {
            "name": "Kanhar River",
            "note": "From Chhattisgarh-Jharkhand; joins in Sonbhadra"
          },
          {
            "name": "North Koel River",
            "note": "From the Ranchi plateau; flows through Palamau Tiger Reserve"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Rihand",
          "sangam": "Sonbhadra district",
          "state": "Uttar Pradesh"
        },
        {
          "tributary": "North Koel",
          "sangam": "Near the Jharkhand-Bihar border",
          "state": "Bihar / Jharkhand"
        },
        {
          "tributary": "Ganga",
          "sangam": "Near Arrah-Maner, west of Patna",
          "state": "Bihar"
        }
      ],
      "towns": [
        {
          "name": "Amarkantak",
          "type": "Cultural",
          "significance": "Source of the Son and Narmada; pilgrimage centre",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Singrauli",
          "type": "Economic",
          "significance": "'Energy capital of India'; coal mines and super thermal power stations",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Sonbhadra",
          "type": "Economic",
          "significance": "Rihand reservoir, cement and power plants",
          "state": "Uttar Pradesh"
        },
        {
          "name": "Dehri-on-Sone",
          "type": "Infrastructure",
          "significance": "Indrapuri Barrage and the historic Sone canal system",
          "state": "Bihar"
        }
      ],
      "dams": [
        {
          "name": "Bansagar Dam",
          "state": "Madhya Pradesh",
          "type": "Multipurpose MP-UP-Bihar project on the Son"
        },
        {
          "name": "Rihand Dam",
          "state": "Uttar Pradesh",
          "type": "On the Rihand tributary; G.B. Pant Sagar is among India's largest artificial lakes"
        },
        {
          "name": "Indrapuri Barrage",
          "state": "Bihar",
          "type": "Feeds the Sone canals at Dehri"
        },
        {
          "name": "North Koel (Mandal) Dam",
          "state": "Jharkhand",
          "type": "On the North Koel; long-stalled irrigation project"
        }
      ],
      "protectedAreas": [
        {
          "name": "Son Gharial Wildlife Sanctuary",
          "relation": "Son-Banas-Gopad stretch in Sidhi-Shahdol",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Sanjay-Dubri Tiger Reserve",
          "relation": "Upper Son catchment",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Palamau Tiger Reserve",
          "relation": "On the North Koel; among India's first nine tiger reserves (1973)",
          "state": "Jharkhand"
        },
        {
          "name": "Kaimur Wildlife Sanctuary",
          "relation": "Kaimur escarpment along the lower Son",
          "state": "Bihar"
        }
      ],
      "species": [
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Protected in the Son Gharial Sanctuary"
        },
        {
          "name": "Sloth Bear",
          "iucn": "Vulnerable",
          "role": "Common in the Kaimur and Sanjay-Dubri forests"
        }
      ],
      "commonMistake": "The Son flows NORTH from Amarkantak and then turns EAST-NORTH-EAST along the Kaimur escarpment, not north-west to south-east. It is a RIGHT-bank Ganga tributary that joins the Ganga directly, not the Yamuna."
    },
    "staticFacts": [
      "NCERT: it forms a series of waterfalls at the edge of the plateau before reaching Arrah, west of Patna, to join the Ganga.",
      "Its middle course follows the Son-Narmada lineament, a major structural line of peninsular India.",
      "Its basin holds the Singrauli coalfield and India's highest concentration of pithead thermal power."
    ],
    "similarPYQ": [
      "GEO-CDS1-2020-05",
      "GEO-UPSC-2016-03"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-01M",
    "slug": "damodar-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Damodar River",
    "aliases": [
      "Damuda",
      "Sorrow of Bengal",
      "Barakar River",
      "DVC River"
    ],
    "placeType": "Peninsular River in a Rift Valley; Tributary of the Hooghly ('Sorrow of Bengal')",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Jharkhand, West Bengal"
    },
    "lat": 23.65,
    "lng": 86.75,
    "shape": [
      [
        23.67,
        84.75
      ],
      [
        23.72,
        85.8
      ],
      [
        23.75,
        86.2
      ],
      [
        23.78,
        86.43
      ],
      [
        23.68,
        86.75
      ],
      [
        23.65,
        86.85
      ],
      [
        23.5,
        87.32
      ],
      [
        23.23,
        87.86
      ],
      [
        22.3,
        88.1
      ]
    ],
    "neighbours": [
      "Source: Khamarpat hill near Chandwa, Latehar district (formerly Palamu), Chotanagpur pla",
      "Mouth: Joins the Hooghly near Falta (West Bengal); a branch (Mundeswari) reaches the Ru"
    ],
    "riverDetails": {
      "length": "~592 km",
      "origin": "Khamarpat hill near Chandwa, Latehar district (formerly Palamu), Chotanagpur plateau (Jharkhand)",
      "mouth": "Joins the Hooghly near Falta (West Bengal); a branch (Mundeswari) reaches the Rupnarayan",
      "sourceCoords": [
        23.67,
        84.75
      ],
      "mouthCoords": [
        22.3,
        88.1
      ],
      "states": {
        "flowsThrough": [
          "Jharkhand",
          "West Bengal"
        ],
        "basinStates": [
          "Jharkhand",
          "West Bengal"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Barakar River",
            "note": "Main tributary (NCERT); dammed at Tilaiya and Maithon"
          },
          {
            "name": "Konar River",
            "note": "From the Hazaribagh plateau; Konar Dam"
          },
          {
            "name": "Bokaro River",
            "note": "From the Hazaribagh plateau; supplies Bokaro Steel City area"
          }
        ],
        "rightBank": [
          {
            "name": "Sali River",
            "note": "Joins in Bankura district"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Barakar",
          "sangam": "Near Dishergarh, below Maithon and Panchet",
          "state": "Jharkhand / West Bengal border"
        },
        {
          "tributary": "Hooghly",
          "sangam": "Near Falta",
          "state": "West Bengal"
        }
      ],
      "towns": [
        {
          "name": "Bokaro Steel City",
          "type": "Economic",
          "significance": "Integrated steel plant (SAIL)",
          "state": "Jharkhand"
        },
        {
          "name": "Dhanbad",
          "type": "Economic",
          "significance": "'Coal Capital of India'; Jharia coking-coal field",
          "state": "Jharkhand"
        },
        {
          "name": "Asansol",
          "type": "Economic",
          "significance": "Raniganj coalfield, where Indian coal mining began in 1774",
          "state": "West Bengal"
        },
        {
          "name": "Durgapur",
          "type": "Economic",
          "significance": "Steel plant; Durgapur Barrage",
          "state": "West Bengal"
        }
      ],
      "dams": [
        {
          "name": "Tilaiya Dam",
          "state": "Jharkhand",
          "type": "First DVC dam, on the Barakar"
        },
        {
          "name": "Konar Dam",
          "state": "Jharkhand",
          "type": "DVC dam on the Konar"
        },
        {
          "name": "Maithon Dam",
          "state": "Jharkhand / West Bengal border",
          "type": "DVC dam on the Barakar with an underground power station"
        },
        {
          "name": "Panchet Dam",
          "state": "Jharkhand / West Bengal border",
          "type": "DVC dam on the Damodar main stem"
        },
        {
          "name": "Tenughat Dam",
          "state": "Jharkhand",
          "type": "Damodar main stem; supplies Bokaro"
        },
        {
          "name": "Durgapur Barrage",
          "state": "West Bengal",
          "type": "Diverts water into the DVC irrigation canals"
        }
      ],
      "protectedAreas": [
        {
          "name": "Hazaribagh Wildlife Sanctuary",
          "relation": "Upper Konar-Barakar catchment",
          "state": "Jharkhand"
        }
      ],
      "species": [],
      "commonMistake": "The Damodar joins the HOOGHLY, not the main Ganga. The BARAKAR is its main tributary and joins from the LEFT (north). The Damodar is the 'Sorrow of BENGAL'; the Kosi is the 'Sorrow of BIHAR'."
    },
    "staticFacts": [
      "NCERT: it occupies the eastern margins of the Chotanagpur plateau, where it flows through a rift valley.",
      "Its Gondwana rift basin holds India's richest coal reserves: Jharia, Raniganj, Bokaro and Karanpura.",
      "The Damodar Valley Corporation (1948), modelled on the Tennessee Valley Authority of the USA, was independent India's first multipurpose river valley project."
    ],
    "similarPYQ": [
      "GEO-CDS1-2019-04",
      "GEO-CDS1-2020-05"
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
      "Lion's Mouth",
      "Indus"
    ],
    "placeType": "Trans-Himalayan Antecedent River (Main Stem of Indus System)",
    "priority": "High",
    "locatedIn": {
      "country": "China (Tibet), India, Pakistan",
      "stateOrProvince": "Tibet Autonomous Region, Ladakh (India), Gilgit-Baltistan, Khyber Pakhtunkhwa, Punjab, Sindh (Pakistan)"
    },
    "lat": 34.08,
    "lng": 72.7,
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
        34.08,
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
      "Source: Glacier near Bokhar Chu, north-west of Lake Mansarovar, Kailash Range, Tibet, at",
      "Mouth: Arabian Sea through a delta south-east of Karachi, Sindh (Pakistan)"
    ],
    "riverDetails": {
      "length": "2,880 km as per NCERT (some sources give ~3,180 km); 1,114 km within India's territorial claim",
      "origin": "Glacier near Bokhar Chu, north-west of Lake Mansarovar, Kailash Range, Tibet, at ~4,164 m; called Singi Khamban (Lion's Mouth) in Tibet",
      "mouth": "Arabian Sea through a delta south-east of Karachi, Sindh (Pakistan)",
      "sourceCoords": [
        31.25,
        81.67
      ],
      "mouthCoords": [
        24.1,
        67.45
      ],
      "states": {
        "flowsThrough": [
          "Ladakh (UT)"
        ],
        "basinStates": [
          "Ladakh",
          "Jammu & Kashmir",
          "Himachal Pradesh",
          "Punjab",
          "Haryana",
          "Rajasthan",
          "Chandigarh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Zanskar River",
            "note": "Drains the Zanskar Range; joins at Nimmu near Leh; frozen 'Chadar' trek route in winter"
          },
          {
            "name": "Suru River",
            "note": "Flows past Kargil (receives the Dras); joins the Indus downstream of Kargil near the LoC"
          },
          {
            "name": "Soan River",
            "note": "Drains the Potwar Plateau in Pakistan"
          },
          {
            "name": "Panjnad",
            "note": "Combined flow of the five Punjab rivers (Jhelum, Chenab, Ravi, Beas, Sutlej); joins the Indus at Mithankot"
          }
        ],
        "rightBank": [
          {
            "name": "Shyok River",
            "note": "Rises near the Rimo Glacier (Karakoram); receives the Nubra; joins near Keris, east of Skardu"
          },
          {
            "name": "Shigar River",
            "note": "Drains the Baltoro-Biafo glacier region; joins near Skardu"
          },
          {
            "name": "Gilgit River",
            "note": "Receives the Hunza; joins near Jaglot-Bunji, the meeting point of Himalaya, Karakoram and Hindu Kush"
          },
          {
            "name": "Kabul River",
            "note": "From Afghanistan; receives the Swat; joins at Attock"
          },
          {
            "name": "Kurram, Tochi and Gomal Rivers",
            "note": "Western tributaries draining the Sulaiman Range; Zhob joins the Gomal"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Zanskar",
          "sangam": "Nimmu, near Leh",
          "state": "Ladakh"
        },
        {
          "tributary": "Shyok",
          "sangam": "Near Keris, east of Skardu",
          "state": "Gilgit-Baltistan"
        },
        {
          "tributary": "Gilgit",
          "sangam": "Near Jaglot-Bunji",
          "state": "Gilgit-Baltistan"
        },
        {
          "tributary": "Kabul",
          "sangam": "Attock",
          "state": "Punjab (Pakistan)"
        },
        {
          "tributary": "Panjnad",
          "sangam": "Mithankot",
          "state": "Punjab (Pakistan)"
        }
      ],
      "towns": [
        {
          "name": "Demchok",
          "type": "Strategic",
          "significance": "Point where the Indus enters India from Tibet",
          "state": "Ladakh"
        },
        {
          "name": "Leh",
          "type": "Administrative / Cultural",
          "significance": "Largest town on the Indian Indus; Sindhu Darshan festival at Shey (Sindhu Ghat)",
          "state": "Ladakh"
        },
        {
          "name": "Alchi",
          "type": "Cultural",
          "significance": "Ancient Buddhist monastery complex on the Indus bank",
          "state": "Ladakh"
        },
        {
          "name": "Skardu",
          "type": "Strategic",
          "significance": "Main town of Baltistan near the Shyok and Shigar confluences",
          "state": "Gilgit-Baltistan"
        },
        {
          "name": "Attock",
          "type": "Historical",
          "significance": "Kabul-Indus confluence; historic river crossing on the Grand Trunk Road",
          "state": "Punjab (Pakistan)"
        },
        {
          "name": "Mohenjo-daro",
          "type": "Historical",
          "significance": "Harappan city on the right bank of the Indus; UNESCO World Heritage Site",
          "state": "Sindh (Pakistan)"
        }
      ],
      "dams": [
        {
          "name": "Nimoo Bazgo Hydroelectric Project",
          "state": "Ladakh",
          "type": "45 MW run-of-the-river project near Alchi"
        },
        {
          "name": "Chutak Hydroelectric Project",
          "state": "Ladakh",
          "type": "44 MW run-of-the-river project on the Suru (Indus tributary), Kargil"
        },
        {
          "name": "Tarbela Dam",
          "state": "Khyber Pakhtunkhwa (Pakistan)",
          "type": "Among the world's largest earth-filled dams"
        },
        {
          "name": "Diamer-Bhasha Dam",
          "state": "Gilgit-Baltistan (Pakistan)",
          "type": "Large storage dam under construction"
        },
        {
          "name": "Sukkur and Kotri Barrages",
          "state": "Sindh (Pakistan)",
          "type": "Irrigation barrages on the lower Indus"
        }
      ],
      "protectedAreas": [
        {
          "name": "Hemis National Park",
          "relation": "Borders the Indus near Leh; among India's largest national parks (~4,400 sq km)",
          "state": "Ladakh"
        },
        {
          "name": "Changthang Cold Desert Wildlife Sanctuary",
          "relation": "Upper Indus valley after entry into India",
          "state": "Ladakh"
        },
        {
          "name": "Indus River Dolphin Reserve",
          "relation": "Guddu-Sukkur stretch of the lower Indus",
          "state": "Sindh (Pakistan)"
        }
      ],
      "species": [
        {
          "name": "Snow Leopard",
          "iucn": "Vulnerable",
          "role": "Flagship species of Hemis National Park"
        },
        {
          "name": "Black-necked Crane",
          "iucn": "Near Threatened",
          "role": "Breeds in the high-altitude wetlands of Changthang; state bird of Ladakh"
        },
        {
          "name": "Indus River Dolphin",
          "iucn": "Endangered",
          "role": "Mainly in the lower Indus in Pakistan; a small population survives in the Beas in India"
        }
      ],
      "commonMistake": "The Indus does not rise in Lake Mansarovar itself; it rises near Bokhar Chu, north-west of the lake. Shyok, Gilgit and Kabul are RIGHT-bank tributaries; Zanskar, Suru and Panjnad are LEFT-bank. The five Punjab rivers join the Indus together as the Panjnad at Mithankot, not individually."
    },
    "staticFacts": [
      "An antecedent river: it is older than the Himalaya and kept its course by cutting deep gorges as the mountains rose, notably near Gilgit.",
      "In Ladakh it flows north-west along the Indus-Tsangpo Suture Zone, between the Ladakh and Zanskar ranges.",
      "Basin area is about 11,65,000 sq km, of which about 3,21,289 sq km lies in India.",
      "Under the Indus Waters Treaty (1960), the western rivers (Indus, Jhelum, Chenab) were allocated to Pakistan and the eastern rivers (Ravi, Beas, Sutlej) to India."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-05",
      "GEO-CDS1-2023-10",
      "GEO-UPSC-2020-03",
      "UPSC-2026-11"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-02B",
    "slug": "jhelum-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Jhelum River",
    "aliases": [
      "Vitasta",
      "Hydaspes",
      "Kashmiri: Vyeth",
      "Bihat"
    ],
    "placeType": "Himalayan Tributary of Indus (Western River under IWT)",
    "priority": "High",
    "locatedIn": {
      "country": "India, Pakistan",
      "stateOrProvince": "Jammu & Kashmir (India), Pakistan-occupied Kashmir, Punjab (Pakistan)"
    },
    "lat": 34.1,
    "lng": 73.5,
    "shape": [
      [
        33.53,
        75.25
      ],
      [
        33.73,
        75.15
      ],
      [
        34.08,
        74.8
      ],
      [
        34.35,
        74.58
      ],
      [
        34.2,
        74.35
      ],
      [
        34.09,
        74.04
      ],
      [
        34.37,
        73.47
      ],
      [
        33.14,
        73.64
      ],
      [
        31.15,
        72.15
      ]
    ],
    "neighbours": [
      "Source: Spring at Verinag, at the foot of the Pir Panjal, south-east Kashmir Valley (Ana",
      "Mouth: Joins the Chenab at Trimmu, near Jhang, Punjab (Pakistan)"
    ],
    "riverDetails": {
      "length": "~725 km (some sources ~813 km)",
      "origin": "Spring at Verinag, at the foot of the Pir Panjal, south-east Kashmir Valley (Anantnag district) at ~1,850 m",
      "mouth": "Joins the Chenab at Trimmu, near Jhang, Punjab (Pakistan)",
      "sourceCoords": [
        33.54,
        75.25
      ],
      "mouthCoords": [
        31.15,
        72.15
      ],
      "states": {
        "flowsThrough": [
          "Jammu & Kashmir"
        ],
        "basinStates": [
          "Jammu & Kashmir"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Vishav River",
            "note": "Drains the Pir Panjal slopes in south Kashmir"
          },
          {
            "name": "Rambiara River",
            "note": "Pir Panjal stream joining in the upper valley"
          },
          {
            "name": "Doodhganga River",
            "note": "Drains the Pir Panjal west of Srinagar"
          },
          {
            "name": "Poonch River",
            "note": "Joins in Pakistan at the Mangla reservoir"
          }
        ],
        "rightBank": [
          {
            "name": "Lidder River",
            "note": "Fed by the Kolahoi Glacier; flows past Pahalgam; joins near Khanabal (Anantnag)"
          },
          {
            "name": "Sind River",
            "note": "Rises near Sonamarg; joins at Shadipora near Srinagar"
          },
          {
            "name": "Pohru River",
            "note": "Drains north-west Kashmir; joins near Sopore"
          },
          {
            "name": "Kishanganga (Neelum) River",
            "note": "Flows through the Gurez Valley; joins at Muzaffarabad (PoK)"
          },
          {
            "name": "Kunhar River",
            "note": "Drains the Kaghan Valley; joins near Muzaffarabad"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Lidder",
          "sangam": "Near Khanabal, Anantnag",
          "state": "Jammu & Kashmir"
        },
        {
          "tributary": "Sind",
          "sangam": "Shadipora, near Srinagar",
          "state": "Jammu & Kashmir"
        },
        {
          "tributary": "Kishanganga (Neelum)",
          "sangam": "Muzaffarabad",
          "state": "Pakistan-occupied Kashmir"
        },
        {
          "tributary": "Poonch",
          "sangam": "Mangla reservoir",
          "state": "Pakistan-occupied Kashmir / Punjab (Pakistan)"
        },
        {
          "tributary": "Chenab",
          "sangam": "Trimmu, near Jhang",
          "state": "Punjab (Pakistan)"
        }
      ],
      "towns": [
        {
          "name": "Verinag",
          "type": "Cultural / Historical",
          "significance": "Source spring; octagonal Mughal tank built by Jahangir",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Srinagar",
          "type": "Administrative / Cultural",
          "significance": "Summer capital of J&K; river crossed by historic bridges such as Amira Kadal and Zero Bridge",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Sopore",
          "type": "Economic",
          "significance": "Major apple-trading town near the Wular outflow",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Baramulla",
          "type": "Strategic",
          "significance": "Western end of the Kashmir Valley before the Uri gorge",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Uri",
          "type": "Strategic",
          "significance": "Point where the river passes through a deep gorge towards the LoC",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Jhelum (city)",
          "type": "Historical",
          "significance": "Near the site of the Battle of the Hydaspes (326 BCE), Alexander vs Porus",
          "state": "Punjab (Pakistan)"
        }
      ],
      "dams": [
        {
          "name": "Uri-I Hydroelectric Project",
          "state": "Jammu & Kashmir",
          "type": "480 MW run-of-the-river project, Baramulla district"
        },
        {
          "name": "Uri-II Hydroelectric Project",
          "state": "Jammu & Kashmir",
          "type": "240 MW run-of-the-river project"
        },
        {
          "name": "Lower Jhelum Hydroelectric Project",
          "state": "Jammu & Kashmir",
          "type": "105 MW project near Baramulla"
        },
        {
          "name": "Kishanganga Hydroelectric Project",
          "state": "Jammu & Kashmir",
          "type": "330 MW; diverts Kishanganga water from Gurez to the Bonar Nallah, Bandipora"
        },
        {
          "name": "Tulbul Navigation Project (Wular Barrage)",
          "state": "Jammu & Kashmir",
          "type": "Navigation barrage at the Wular outflow; work suspended since 1987 over treaty objections"
        },
        {
          "name": "Mangla Dam",
          "state": "Pakistan-occupied Kashmir / Punjab (Pakistan)",
          "type": "Major storage dam on the Jhelum in Pakistan"
        }
      ],
      "protectedAreas": [
        {
          "name": "Wular Lake",
          "relation": "The Jhelum flows through it; India's largest freshwater lake; Ramsar site (1990)",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Hokersar Wetland",
          "relation": "Floodplain wetland near Srinagar; Ramsar site (2005)",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Dachigam National Park",
          "relation": "Catchment near Srinagar in the Jhelum basin; last stronghold of the Hangul",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Overa-Aru Wildlife Sanctuary",
          "relation": "Lidder valley, a right-bank tributary catchment",
          "state": "Jammu & Kashmir"
        }
      ],
      "species": [
        {
          "name": "Hangul (Kashmir Stag)",
          "iucn": null,
          "role": "Endemic Kashmir red deer of Dachigam; Schedule I species"
        },
        {
          "name": "Snow Trout (Schizothorax spp.)",
          "iucn": null,
          "role": "Dominant native cold-water fish of the Jhelum and its tributaries"
        }
      ],
      "commonMistake": "Wular Lake is TECTONIC in origin, not an oxbow lake. The Jhelum joins the Chenab at Trimmu, not the Indus directly. Lidder and Sind are RIGHT-bank tributaries."
    },
    "staticFacts": [
      "Known as the Vitasta in the Rigveda and the Hydaspes to the Greeks.",
      "It meanders across the flat floor of the Kashmir Valley, then leaves through a deep, narrow gorge below Baramulla.",
      "Navigable within the Kashmir Valley between roughly Khanabal and Baramulla.",
      "A 'western river' under the Indus Waters Treaty, where India's use was limited mainly to run-of-the-river hydropower."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-07",
      "GEO-UPSC-2021-05",
      "UPSC-2026-13"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-02C",
    "slug": "chenab-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Chenab River",
    "aliases": [
      "Asikni",
      "Chandrabhaga",
      "Acesines",
      "Chandra-Bhaga"
    ],
    "placeType": "Largest Tributary of Indus (Western River under IWT)",
    "priority": "High",
    "locatedIn": {
      "country": "India, Pakistan",
      "stateOrProvince": "Himachal Pradesh, Jammu & Kashmir (India), Punjab (Pakistan)"
    },
    "lat": 32.89,
    "lng": 74.73,
    "shape": [
      [
        32.75,
        77.4
      ],
      [
        32.55,
        76.97
      ],
      [
        33.08,
        76.43
      ],
      [
        33.31,
        75.76
      ],
      [
        33.17,
        75.19
      ],
      [
        33.15,
        74.88
      ],
      [
        32.9,
        74.74
      ],
      [
        31.15,
        72.15
      ],
      [
        29.35,
        71.03
      ]
    ],
    "neighbours": [
      "Source: Formed by the Chandra and Bhaga, which meet at Tandi near Keylong, Lahaul (HP); ",
      "Mouth: Joins the Sutlej at Panjnad near Uch, Bahawalpur, Punjab (Pakistan); the Panjnad"
    ],
    "riverDetails": {
      "length": "~960 km in common sources (NCERT states 1,180 km before entering Pakistan)",
      "origin": "Formed by the Chandra and Bhaga, which meet at Tandi near Keylong, Lahaul (HP); the Chandra rises near Baralacha La and the Bhaga from Suraj Tal",
      "mouth": "Joins the Sutlej at Panjnad near Uch, Bahawalpur, Punjab (Pakistan); the Panjnad then joins the Indus at Mithankot",
      "sourceCoords": [
        32.56,
        76.98
      ],
      "mouthCoords": [
        29.35,
        71.03
      ],
      "states": {
        "flowsThrough": [
          "Himachal Pradesh",
          "Jammu & Kashmir"
        ],
        "basinStates": [
          "Himachal Pradesh",
          "Jammu & Kashmir"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Neeru River",
            "note": "Drains the Bhaderwah valley; joins at Pul Doda"
          },
          {
            "name": "Tawi River",
            "note": "Flows through Jammu city; joins the Chenab across the border in Pakistan"
          },
          {
            "name": "Ravi River",
            "note": "Joins near Ahmadpur Sial, Punjab (Pakistan)"
          }
        ],
        "rightBank": [
          {
            "name": "Marusudar River",
            "note": "Largest Chenab tributary in J&K; drains the Warwan valley; joins at Bhandarkoot, Kishtwar"
          },
          {
            "name": "Jhelum River",
            "note": "Joins at Trimmu, near Jhang (Pakistan)"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Chandra + Bhaga",
          "sangam": "Tandi, near Keylong",
          "state": "Himachal Pradesh"
        },
        {
          "tributary": "Marusudar",
          "sangam": "Bhandarkoot, Kishtwar",
          "state": "Jammu & Kashmir"
        },
        {
          "tributary": "Neeru",
          "sangam": "Pul Doda",
          "state": "Jammu & Kashmir"
        },
        {
          "tributary": "Jhelum",
          "sangam": "Trimmu, near Jhang",
          "state": "Punjab (Pakistan)"
        },
        {
          "tributary": "Ravi",
          "sangam": "Near Ahmadpur Sial",
          "state": "Punjab (Pakistan)"
        },
        {
          "tributary": "Sutlej",
          "sangam": "Panjnad, near Uch",
          "state": "Punjab (Pakistan)"
        }
      ],
      "towns": [
        {
          "name": "Keylong",
          "type": "Administrative",
          "significance": "Headquarters of Lahaul-Spiti, on the Bhaga near the Tandi confluence",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Kishtwar",
          "type": "Economic",
          "significance": "Saffron-growing area and hydropower hub",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Ramban",
          "type": "Economic",
          "significance": "Site of Baglihar dam on the Jammu-Srinagar highway",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Reasi",
          "type": "Infrastructure",
          "significance": "Chenab Rail Bridge and Salal dam",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Akhnoor",
          "type": "Strategic",
          "significance": "Where the Chenab leaves the hills and heads for the international border",
          "state": "Jammu & Kashmir"
        },
        {
          "name": "Jhang",
          "type": "Cultural",
          "significance": "Near the Jhelum-Chenab confluence; setting of the Heer-Ranjha legend",
          "state": "Punjab (Pakistan)"
        }
      ],
      "dams": [
        {
          "name": "Salal Dam",
          "state": "Jammu & Kashmir",
          "type": "690 MW run-of-the-river project, Reasi district"
        },
        {
          "name": "Baglihar Dam",
          "state": "Jammu & Kashmir",
          "type": "900 MW run-of-the-river project, Ramban district"
        },
        {
          "name": "Dulhasti Hydroelectric Project",
          "state": "Jammu & Kashmir",
          "type": "390 MW, Kishtwar district"
        },
        {
          "name": "Ratle Hydroelectric Project",
          "state": "Jammu & Kashmir",
          "type": "850 MW, under construction, Kishtwar district"
        },
        {
          "name": "Pakal Dul Hydroelectric Project",
          "state": "Jammu & Kashmir",
          "type": "1,000 MW on the Marusudar; first storage project in J&K; under construction"
        },
        {
          "name": "Kiru and Kwar Hydroelectric Projects",
          "state": "Jammu & Kashmir",
          "type": "624 MW and 540 MW, under construction, Kishtwar district"
        },
        {
          "name": "Marala, Khanki, Qadirabad and Trimmu Headworks",
          "state": "Punjab (Pakistan)",
          "type": "Irrigation headworks on the Chenab in Pakistan"
        }
      ],
      "protectedAreas": [
        {
          "name": "Kishtwar High Altitude National Park",
          "relation": "Upper Marusudar and Chenab catchment",
          "state": "Jammu & Kashmir"
        }
      ],
      "species": [
        {
          "name": "Snow Leopard",
          "iucn": "Vulnerable",
          "role": "Found in the high-altitude catchment around Kishtwar"
        },
        {
          "name": "Himalayan Brown Bear",
          "iucn": null,
          "role": "Inhabits alpine meadows of Kishtwar High Altitude National Park"
        }
      ],
      "commonMistake": "The Chenab is the LARGEST tributary of the Indus by volume, but the Sutlej is the LONGEST of the five rivers. The Tawi joins the Chenab in Pakistan, not at Jammu. The Chenab meets the Sutlej at Panjnad; it does not meet the Indus directly."
    },
    "staticFacts": [
      "Also called the Chandrabhaga after its two headstreams; known as the Asikni in the Rigveda.",
      "Flows through the Pangi valley between the Pir Panjal and the Great Himalaya before entering Jammu & Kashmir.",
      "A 'western river' under the Indus Waters Treaty; Baglihar and Kishanganga were the projects taken to a Neutral Expert and arbitration in the past."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-05",
      "GEO-UPSC-2019-04",
      "UPSC-2026-13"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-02D",
    "slug": "ravi-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Ravi River",
    "aliases": [
      "Parushni",
      "Iravati",
      "Hydraotes",
      "Ravi"
    ],
    "placeType": "Himalayan Tributary of Indus (Eastern River under IWT)",
    "priority": "Medium",
    "locatedIn": {
      "country": "India, Pakistan",
      "stateOrProvince": "Himachal Pradesh, Jammu & Kashmir, Punjab (India), Punjab (Pakistan)"
    },
    "lat": 32.03,
    "lng": 75.03,
    "shape": [
      [
        32.32,
        76.85
      ],
      [
        32.55,
        76.12
      ],
      [
        32.58,
        75.92
      ],
      [
        32.44,
        75.73
      ],
      [
        32.28,
        75.65
      ],
      [
        32.04,
        75.03
      ],
      [
        31.62,
        74.28
      ],
      [
        30.62,
        71.8
      ]
    ],
    "neighbours": [
      "Source: Bara Bhangal area of the Dhauladhar, Kangra district (HP); NCERT describes it as",
      "Mouth: Joins the Chenab near Ahmadpur Sial (NCERT: near Sarai Sidhu), Punjab (Pakistan)"
    ],
    "riverDetails": {
      "length": "~720 km",
      "origin": "Bara Bhangal area of the Dhauladhar, Kangra district (HP); NCERT describes it as rising west of the Rohtang Pass in the Kullu hills",
      "mouth": "Joins the Chenab near Ahmadpur Sial (NCERT: near Sarai Sidhu), Punjab (Pakistan)",
      "sourceCoords": [
        32.4,
        76.7
      ],
      "mouthCoords": [
        30.62,
        71.8
      ],
      "states": {
        "flowsThrough": [
          "Himachal Pradesh",
          "Jammu & Kashmir",
          "Punjab"
        ],
        "basinStates": [
          "Himachal Pradesh",
          "Jammu & Kashmir",
          "Punjab"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Budhil River",
            "note": "Drains the Manimahesh-Bharmour area; joins in Chamba district"
          }
        ],
        "rightBank": [
          {
            "name": "Siul River",
            "note": "Drains the Pir Panjal side of Chamba district"
          },
          {
            "name": "Ujh River",
            "note": "Rises in Kathua district (J&K); joins the Ravi across the border in Pakistan"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Budhil",
          "sangam": "Near Kharamukh, Chamba",
          "state": "Himachal Pradesh"
        },
        {
          "tributary": "Chenab",
          "sangam": "Near Ahmadpur Sial",
          "state": "Punjab (Pakistan)"
        }
      ],
      "towns": [
        {
          "name": "Bharmour",
          "type": "Cultural",
          "significance": "Home of the Gaddi pastoralists; base for the Manimahesh Yatra",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Chamba",
          "type": "Historical",
          "significance": "Former princely capital on the Ravi; known for Chamba rumal and miniature painting",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Madhopur (Pathankot)",
          "type": "Economic",
          "significance": "Headworks of the Upper Bari Doab Canal",
          "state": "Punjab"
        },
        {
          "name": "Dera Baba Nanak",
          "type": "Cultural",
          "significance": "Start of the Kartarpur Corridor; Gurdwara Darbar Sahib Kartarpur stands across the Ravi in Pakistan",
          "state": "Punjab"
        },
        {
          "name": "Lahore",
          "type": "Historical",
          "significance": "Major city on the Ravi; Harappa lies near an old course of the river",
          "state": "Punjab (Pakistan)"
        }
      ],
      "dams": [
        {
          "name": "Chamera I, II and III",
          "state": "Himachal Pradesh",
          "type": "540 MW, 300 MW and 231 MW hydro projects, Chamba district"
        },
        {
          "name": "Ranjit Sagar (Thein) Dam",
          "state": "Punjab / Jammu & Kashmir border",
          "type": "600 MW multipurpose dam near Pathankot"
        },
        {
          "name": "Shahpur Kandi Dam",
          "state": "Punjab / Jammu & Kashmir border",
          "type": "Downstream of Ranjit Sagar; completed in 2024 to use Ravi water that earlier flowed to Pakistan"
        },
        {
          "name": "Madhopur Headworks",
          "state": "Punjab",
          "type": "Diverts water into the Upper Bari Doab Canal"
        }
      ],
      "protectedAreas": [
        {
          "name": "Kalatop-Khajjiar Wildlife Sanctuary",
          "relation": "Ravi catchment near Dalhousie, Chamba district",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Gamgul Siahbehi Wildlife Sanctuary",
          "relation": "Upper catchment in Chamba district",
          "state": "Himachal Pradesh"
        }
      ],
      "species": [
        {
          "name": "Golden Mahseer",
          "iucn": "Endangered",
          "role": "Large migratory game fish of the Himalayan stretch"
        }
      ],
      "commonMistake": "The Ravi joins the CHENAB, not the Sutlej or the Indus. It drains the area between the south-eastern Pir Panjal and the Dhauladhar."
    },
    "staticFacts": [
      "Known as the Parushni or Iravati in the Rigveda; the Battle of the Ten Kings is placed on its banks.",
      "For a stretch in Punjab, the Ravi forms part of the India-Pakistan border.",
      "An 'eastern river' allotted to India under the Indus Waters Treaty."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-05",
      "UPSC-2026-13"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-02E",
    "slug": "beas-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Beas River",
    "aliases": [
      "Vipasa",
      "Vipasha",
      "Hyphasis",
      "Arjikiya"
    ],
    "placeType": "Himalayan Tributary of Sutlej (Eastern River under IWT)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Himachal Pradesh, Punjab"
    },
    "lat": 31.97,
    "lng": 75.95,
    "shape": [
      [
        32.36,
        77.08
      ],
      [
        32.24,
        77.19
      ],
      [
        31.96,
        77.11
      ],
      [
        31.67,
        77.06
      ],
      [
        31.71,
        76.93
      ],
      [
        31.97,
        75.95
      ],
      [
        32,
        75.6
      ],
      [
        31.17,
        75
      ]
    ],
    "neighbours": [
      "Source: Beas Kund near the Rohtang Pass, Kullu district (HP), at ~4,000 m (NCERT)",
      "Mouth: Joins the Sutlej at Harike, Punjab"
    ],
    "riverDetails": {
      "length": "~470 km",
      "origin": "Beas Kund near the Rohtang Pass, Kullu district (HP), at ~4,000 m (NCERT)",
      "mouth": "Joins the Sutlej at Harike, Punjab",
      "sourceCoords": [
        32.36,
        77.08
      ],
      "mouthCoords": [
        31.17,
        75
      ],
      "states": {
        "flowsThrough": [
          "Himachal Pradesh",
          "Punjab"
        ],
        "basinStates": [
          "Himachal Pradesh",
          "Punjab"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Parbati River",
            "note": "Drains the Parvati valley (Manikaran); joins at Bhuntar"
          },
          {
            "name": "Sainj River",
            "note": "Drains part of the Great Himalayan National Park; joins near Larji"
          },
          {
            "name": "Tirthan River",
            "note": "Drains part of the Great Himalayan National Park; joins near Larji"
          }
        ],
        "rightBank": [
          {
            "name": "Uhl River",
            "note": "Drains the Dhauladhar; Shanan power house at Jogindernagar; joins near Mandi"
          },
          {
            "name": "Chakki River",
            "note": "Joins near Pathankot"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Parbati",
          "sangam": "Bhuntar",
          "state": "Himachal Pradesh"
        },
        {
          "tributary": "Sainj and Tirthan",
          "sangam": "Larji",
          "state": "Himachal Pradesh"
        },
        {
          "tributary": "Sutlej",
          "sangam": "Harike",
          "state": "Punjab"
        }
      ],
      "towns": [
        {
          "name": "Manali",
          "type": "Tourism",
          "significance": "Major hill resort near the source; gateway to the Rohtang and Atal Tunnel",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Kullu",
          "type": "Cultural",
          "significance": "Kullu valley; international Dussehra festival",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Mandi",
          "type": "Cultural",
          "significance": "Temple town called 'Chhoti Kashi'; Shivratri fair",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Talwara",
          "type": "Infrastructure",
          "significance": "Site of the Pong Dam",
          "state": "Punjab"
        },
        {
          "name": "Harike",
          "type": "Ecological",
          "significance": "Beas-Sutlej confluence; Harike Wetland and barrage",
          "state": "Punjab"
        }
      ],
      "dams": [
        {
          "name": "Pong Dam (Maharana Pratap Sagar)",
          "state": "Himachal Pradesh / Punjab",
          "type": "Earth-fill storage dam at Talwara; ~396 MW"
        },
        {
          "name": "Pandoh Dam",
          "state": "Himachal Pradesh",
          "type": "Diversion dam; sends Beas water via the Beas-Sutlej Link to the 990 MW Dehar power house"
        },
        {
          "name": "Larji Hydroelectric Project",
          "state": "Himachal Pradesh",
          "type": "126 MW, Kullu district"
        },
        {
          "name": "Shanan Power House",
          "state": "Himachal Pradesh",
          "type": "Historic 1930s project on the Uhl at Jogindernagar"
        }
      ],
      "protectedAreas": [
        {
          "name": "Great Himalayan National Park",
          "relation": "Drained by the Sainj, Tirthan and Jiwa Nal; UNESCO World Heritage Site (2014)",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Pong Dam Lake Wildlife Sanctuary",
          "relation": "Reservoir wetland; Ramsar site (2002)",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Beas Conservation Reserve",
          "relation": "Lower Beas in Punjab; Ramsar site (2019); habitat of the Indus River Dolphin",
          "state": "Punjab"
        },
        {
          "name": "Harike Wetland",
          "relation": "At the Beas-Sutlej confluence; Ramsar site (1990)",
          "state": "Punjab"
        }
      ],
      "species": [
        {
          "name": "Indus River Dolphin",
          "iucn": "Endangered",
          "role": "India's only population lives in the lower Beas; state aquatic animal of Punjab"
        },
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Reintroduced into the Beas Conservation Reserve"
        },
        {
          "name": "Western Tragopan",
          "iucn": "Vulnerable",
          "role": "Pheasant of the Great Himalayan National Park; state bird of Himachal Pradesh"
        }
      ],
      "commonMistake": "The Beas is the only one of the five rivers that flows ENTIRELY within India. It joins the SUTLEJ at Harike, not the Chenab. The Indus River Dolphin DOES occur in India, in the Beas."
    },
    "staticFacts": [
      "Known as the Vipasa in the Rigveda and the Hyphasis to the Greeks; Alexander's army refused to advance beyond it in 326 BCE.",
      "Flows through the Kullu valley and forms gorges at Kati and Largi in the Dhauladhar range (NCERT).",
      "The Beas-Sutlej Link transfers Beas water to the Sutlej through the Pandoh-Dehar system."
    ],
    "similarPYQ": [
      "ENV-UPSC-2014-09",
      "UPSC-2026-13"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-02F",
    "slug": "sutlej-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Sutlej River",
    "aliases": [
      "Shutudri",
      "Zadadros",
      "Langchen Khambab",
      "Elephant's Mouth",
      "Satluj"
    ],
    "placeType": "Trans-Himalayan Antecedent River; Longest of the Five Punjab Rivers",
    "priority": "High",
    "locatedIn": {
      "country": "China (Tibet), India, Pakistan",
      "stateOrProvince": "Tibet Autonomous Region, Himachal Pradesh, Punjab (India), Punjab (Pakistan)"
    },
    "lat": 31.41,
    "lng": 76.43,
    "shape": [
      [
        30.68,
        81.25
      ],
      [
        31.81,
        78.75
      ],
      [
        31.82,
        78.65
      ],
      [
        31.56,
        77.98
      ],
      [
        31.45,
        77.63
      ],
      [
        31.37,
        76.86
      ],
      [
        31.41,
        76.43
      ],
      [
        30.97,
        76.53
      ],
      [
        31.17,
        75
      ],
      [
        30.93,
        74.6
      ],
      [
        29.35,
        71.03
      ]
    ],
    "neighbours": [
      "Source: Rakshastal, near Lake Mansarovar, Tibet, at ~4,555 m (NCERT); called Langchen Kh",
      "Mouth: Joins the Chenab at Panjnad near Uch, Bahawalpur, Punjab (Pakistan); the Panjnad"
    ],
    "riverDetails": {
      "length": "~1,450 km",
      "origin": "Rakshastal, near Lake Mansarovar, Tibet, at ~4,555 m (NCERT); called Langchen Khambab (Elephant's Mouth) in Tibet",
      "mouth": "Joins the Chenab at Panjnad near Uch, Bahawalpur, Punjab (Pakistan); the Panjnad then joins the Indus at Mithankot",
      "sourceCoords": [
        30.68,
        81.25
      ],
      "mouthCoords": [
        29.35,
        71.03
      ],
      "states": {
        "flowsThrough": [
          "Himachal Pradesh",
          "Punjab"
        ],
        "basinStates": [
          "Himachal Pradesh",
          "Punjab"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Baspa River",
            "note": "Drains the Sangla valley; joins at Karcham, Kinnaur"
          }
        ],
        "rightBank": [
          {
            "name": "Spiti River",
            "note": "Drains the cold desert of Spiti; joins at Khab, Kinnaur"
          },
          {
            "name": "Beas River",
            "note": "Joins at Harike, Punjab"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Spiti",
          "sangam": "Khab, Kinnaur",
          "state": "Himachal Pradesh"
        },
        {
          "tributary": "Baspa",
          "sangam": "Karcham, Kinnaur",
          "state": "Himachal Pradesh"
        },
        {
          "tributary": "Beas",
          "sangam": "Harike",
          "state": "Punjab"
        },
        {
          "tributary": "Chenab",
          "sangam": "Panjnad, near Uch",
          "state": "Punjab (Pakistan)"
        }
      ],
      "towns": [
        {
          "name": "Shipki La",
          "type": "Strategic",
          "significance": "Pass where the Sutlej enters India from Tibet",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Rampur Bushahr",
          "type": "Historical",
          "significance": "Former capital of Bushahr state; Lavi trade fair",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Bilaspur",
          "type": "Infrastructure",
          "significance": "Bhakra Dam and Gobind Sagar reservoir; old town submerged and rebuilt",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Rupnagar (Ropar)",
          "type": "Historical",
          "significance": "River leaves the hills here; Harappan site; Ropar headworks",
          "state": "Punjab"
        },
        {
          "name": "Hussainiwala (Ferozepur)",
          "type": "Historical",
          "significance": "Memorial of Bhagat Singh, Rajguru and Sukhdev on the Sutlej; border post",
          "state": "Punjab"
        }
      ],
      "dams": [
        {
          "name": "Bhakra Dam",
          "state": "Himachal Pradesh",
          "type": "Concrete gravity dam (~226 m) forming Gobind Sagar; ~1,379 MW installed"
        },
        {
          "name": "Nangal Dam",
          "state": "Punjab",
          "type": "Regulates releases from Bhakra into the Bhakra Main Canal"
        },
        {
          "name": "Nathpa Jhakri Hydroelectric Project",
          "state": "Himachal Pradesh",
          "type": "1,500 MW underground run-of-the-river project"
        },
        {
          "name": "Karcham Wangtoo Hydroelectric Project",
          "state": "Himachal Pradesh",
          "type": "~1,000 MW run-of-the-river project, Kinnaur"
        },
        {
          "name": "Rampur Hydroelectric Project",
          "state": "Himachal Pradesh",
          "type": "412 MW, tail-race project of Nathpa Jhakri"
        },
        {
          "name": "Kol Dam",
          "state": "Himachal Pradesh",
          "type": "800 MW rock-fill dam, Bilaspur district"
        },
        {
          "name": "Harike Barrage",
          "state": "Punjab",
          "type": "Head of the Indira Gandhi Canal (Rajasthan) and Ferozepur feeder"
        },
        {
          "name": "Sulemanki and Islam Headworks",
          "state": "Punjab (Pakistan)",
          "type": "Irrigation headworks in Pakistan"
        }
      ],
      "protectedAreas": [
        {
          "name": "Pin Valley National Park",
          "relation": "Spiti catchment, a right-bank tributary",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Rakchham-Chitkul Wildlife Sanctuary",
          "relation": "Baspa catchment, a left-bank tributary",
          "state": "Himachal Pradesh"
        },
        {
          "name": "Ropar Wetland",
          "relation": "Reservoir wetland at the Ropar headworks; Ramsar site (2002)",
          "state": "Punjab"
        },
        {
          "name": "Nangal Wildlife Sanctuary",
          "relation": "Reservoir wetland below Bhakra; Ramsar site (2019)",
          "state": "Punjab"
        },
        {
          "name": "Harike Wetland",
          "relation": "At the Beas-Sutlej confluence; Ramsar site (1990)",
          "state": "Punjab"
        }
      ],
      "species": [
        {
          "name": "Snow Leopard",
          "iucn": "Vulnerable",
          "role": "Key predator of Pin Valley National Park"
        },
        {
          "name": "Smooth-coated Otter",
          "iucn": "Vulnerable",
          "role": "Found in the Harike and Ropar wetlands"
        }
      ],
      "commonMistake": "The Sutlej rises from RAKSHASTAL, not Mansarovar, and enters India through SHIPKI LA (the Indus enters at Demchok). It is the LONGEST of the five rivers, while the Chenab is the largest by volume."
    },
    "staticFacts": [
      "An antecedent river: it flows parallel to the Indus for about 400 km in Tibet, then cuts across the Himalaya through Shipki La and leaves the hills through a gorge at Rupnagar.",
      "Known as the Shutudri in the Rigveda.",
      "Feeds the Bhakra-Nangal canal system and, via Harike, the Indira Gandhi Canal in Rajasthan.",
      "An 'eastern river' allotted to India under the Indus Waters Treaty."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-05",
      "ENV-UPSC-2014-09",
      "UPSC-2026-13"
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
      "Siang",
      "Dihang",
      "Jamuna",
      "Luit",
      "Red River"
    ],
    "placeType": "Trans-Himalayan Antecedent River (Main Stem of Brahmaputra System)",
    "priority": "High",
    "locatedIn": {
      "country": "China (Tibet), India, Bangladesh",
      "stateOrProvince": "Tibet Autonomous Region, Arunachal Pradesh, Assam (India); Rangpur, Mymensingh, Dhaka divisions (Bangladesh)"
    },
    "lat": 29.45,
    "lng": 94.6,
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
      "Source: Chemayungdung Glacier of the Kailash range near Lake Mansarovar, Tibet (NCERT); ",
      "Mouth: Bay of Bengal: as the Jamuna in Bangladesh it merges with the Padma (Ganga) at G"
    ],
    "riverDetails": {
      "length": "~2,900 km; ~916 km in India",
      "origin": "Chemayungdung Glacier of the Kailash range near Lake Mansarovar, Tibet (NCERT); a 2011 Chinese survey placed the source at the Angsi Glacier nearby. Called the Yarlung Tsangpo in Tibet",
      "mouth": "Bay of Bengal: as the Jamuna in Bangladesh it merges with the Padma (Ganga) at Goalundo, and the combined flow reaches the sea through the Meghna",
      "sourceCoords": [
        30.35,
        82.1
      ],
      "mouthCoords": [
        22.5,
        90.75
      ],
      "states": {
        "flowsThrough": [
          "Arunachal Pradesh",
          "Assam"
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
            "name": "Dibang (Sikang) River",
            "note": "Main left-bank tributary (NCERT); joins near Sadiya"
          },
          {
            "name": "Lohit River",
            "note": "Main left-bank tributary (NCERT); joins near Sadiya; Dhola-Sadiya bridge"
          },
          {
            "name": "Burhi Dihing River",
            "note": "From the Patkai hills; flows past Digboi-Margherita oil and coal belt"
          },
          {
            "name": "Dikhow River",
            "note": "From Nagaland; flows past Sivasagar"
          },
          {
            "name": "Dhansiri (South) River",
            "note": "From Nagaland; flows past Dimapur and Golaghat"
          },
          {
            "name": "Kopili River",
            "note": "From the Meghalaya-Karbi plateau; largest south-bank tributary in Assam"
          }
        ],
        "rightBank": [
          {
            "name": "Subansiri River",
            "note": "Antecedent river from Tibet; largest tributary by discharge; Subansiri Lower project"
          },
          {
            "name": "Kameng (Jia Bharali) River",
            "note": "From Tawang; joins near Tezpur"
          },
          {
            "name": "Manas River",
            "note": "From Bhutan; joins near Jogighopa"
          },
          {
            "name": "Sankosh River",
            "note": "From Bhutan; forms part of the Assam-West Bengal boundary"
          },
          {
            "name": "Teesta River",
            "note": "From Sikkim; joins in Bangladesh, after which the river is called the Jamuna"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Siang + Dibang + Lohit",
          "sangam": "Near Sadiya; the river is called the Brahmaputra below this point",
          "state": "Assam / Arunachal Pradesh"
        },
        {
          "tributary": "Subansiri",
          "sangam": "Near Majuli, Lakhimpur district",
          "state": "Assam"
        },
        {
          "tributary": "Kameng (Jia Bharali)",
          "sangam": "Near Tezpur",
          "state": "Assam"
        },
        {
          "tributary": "Kopili",
          "sangam": "Near Kajalichowki, Morigaon",
          "state": "Assam"
        },
        {
          "tributary": "Manas",
          "sangam": "Near Jogighopa",
          "state": "Assam"
        },
        {
          "tributary": "Teesta",
          "sangam": "Near Chilmari, Kurigram",
          "state": "Bangladesh"
        },
        {
          "tributary": "Padma (Ganga)",
          "sangam": "Goalundo",
          "state": "Bangladesh"
        }
      ],
      "towns": [
        {
          "name": "Pasighat",
          "type": "Historical",
          "significance": "Oldest town of Arunachal (1911), where the Siang leaves the hills",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Dibrugarh",
          "type": "Economic",
          "significance": "'Tea City of India'; Bogibeel rail-road bridge nearby",
          "state": "Assam"
        },
        {
          "name": "Majuli",
          "type": "Cultural",
          "significance": "Largest river island in the world; seat of Neo-Vaishnavite satras; first island district of India (2016)",
          "state": "Assam"
        },
        {
          "name": "Tezpur",
          "type": "Historical",
          "significance": "Agnigarh legend; Kolia Bhomora Setu over the Brahmaputra",
          "state": "Assam"
        },
        {
          "name": "Guwahati",
          "type": "Cultural / Economic",
          "significance": "Kamakhya temple; Saraighat bridge (1962), first rail-road bridge over the river",
          "state": "Assam"
        },
        {
          "name": "Dhubri",
          "type": "Strategic",
          "significance": "Point where the Brahmaputra leaves India for Bangladesh",
          "state": "Assam"
        }
      ],
      "dams": [
        {
          "name": "Zangmu Dam",
          "state": "Tibet (China)",
          "type": "First operational Chinese hydro project on the Yarlung Tsangpo (2015)"
        },
        {
          "name": "Medog (Motuo) Hydropower Project",
          "state": "Tibet (China)",
          "type": "Planned ~60 GW cascade at the Great Bend; construction began 19 July 2025"
        },
        {
          "name": "Siang Upper Multipurpose Project",
          "state": "Arunachal Pradesh",
          "type": "Proposed large storage project on the Siang, partly as a buffer against upstream releases; locally contested"
        },
        {
          "name": "Bogibeel Bridge",
          "state": "Assam",
          "type": "India's longest rail-cum-road bridge (~4.9 km), near Dibrugarh (2018)"
        }
      ],
      "protectedAreas": [
        {
          "name": "Kaziranga National Park",
          "relation": "South-bank floodplain; UNESCO World Heritage Site (1985); largest population of the one-horned rhino",
          "state": "Assam"
        },
        {
          "name": "Orang National Park",
          "relation": "North-bank floodplain; called 'mini Kaziranga'",
          "state": "Assam"
        },
        {
          "name": "Pobitora Wildlife Sanctuary",
          "relation": "Floodplain near Guwahati; highest rhino density in the world",
          "state": "Assam"
        },
        {
          "name": "Dibru-Saikhowa National Park",
          "relation": "Floodplain island at the Lohit-Dibru-Brahmaputra junction; feral horses",
          "state": "Assam"
        },
        {
          "name": "Deepor Beel",
          "relation": "Former channel of the Brahmaputra at Guwahati; Ramsar site (2002)",
          "state": "Assam"
        },
        {
          "name": "Mouling National Park",
          "relation": "Siang catchment in the Abor hills",
          "state": "Arunachal Pradesh"
        }
      ],
      "species": [
        {
          "name": "Greater One-horned Rhinoceros",
          "iucn": "Vulnerable",
          "role": "Flagship of the Brahmaputra floodplain grasslands"
        },
        {
          "name": "Ganges River Dolphin",
          "iucn": "Endangered",
          "role": "State aquatic animal of Assam; found along the Brahmaputra and tributary mouths"
        },
        {
          "name": "Wild Water Buffalo",
          "iucn": "Endangered",
          "role": "Main stronghold in Kaziranga and Manas"
        }
      ],
      "commonMistake": "Dibang and Lohit are LEFT-bank tributaries; Subansiri, Kameng, Manas, Sankosh and Teesta are RIGHT-bank (north side). Burhi Dihing, Dhansiri and Kopili are LEFT-bank (south side). The Teesta joins in BANGLADESH, not India. In India the main stream flows only through Arunachal and Assam."
    },
    "staticFacts": [
      "An antecedent river: it flows about 1,200 km east through southern Tibet, then cuts a deep gorge around Namcha Barwa (7,755 m) at the Great Bend and enters India west of Sadiya as the Siang (Dihang).",
      "Known by four main names: Tsangpo (Tibet), Siang or Dihang (Arunachal), Brahmaputra (Assam) and Jamuna (Bangladesh).",
      "A heavily braided river with a very high silt load, prone to annual floods and bank erosion; Majuli has lost much of its area to erosion.",
      "The Sadiya-Dhubri stretch is National Waterway-2 (~891 km)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2016-04",
      "GEO-UPSC-2014-06",
      "GEO-CDS1-2016-07",
      "ENV-UPSC-2020-05",
      "ENV-UPSC-2012-11"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03B",
    "slug": "dibang-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Dibang River",
    "aliases": [
      "Sikang",
      "Talon",
      "Dibang Valley River",
      "Idu Mishmi River"
    ],
    "placeType": "Himalayan Left-Bank Tributary of Brahmaputra",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Arunachal Pradesh, Assam"
    },
    "lat": 28.3,
    "lng": 95.8,
    "shape": [
      [
        28.95,
        95.75
      ],
      [
        28.55,
        95.8
      ],
      [
        28.25,
        95.82
      ],
      [
        28,
        95.68
      ],
      [
        27.8,
        95.65
      ]
    ],
    "neighbours": [
      "Source: Mishmi Hills near the India-China border, Dibang Valley district (Arunachal Prad",
      "Mouth: Joins the Siang-Brahmaputra near Sadiya (Assam-Arunachal border)"
    ],
    "riverDetails": {
      "length": "~195 km",
      "origin": "Mishmi Hills near the India-China border, Dibang Valley district (Arunachal Pradesh); also called the Sikang (NCERT)",
      "mouth": "Joins the Siang-Brahmaputra near Sadiya (Assam-Arunachal border)",
      "sourceCoords": [
        28.95,
        95.75
      ],
      "mouthCoords": [
        27.8,
        95.65
      ],
      "states": {
        "flowsThrough": [
          "Arunachal Pradesh",
          "Assam"
        ],
        "basinStates": [
          "Arunachal Pradesh",
          "Assam"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": []
      },
      "confluences": [
        {
          "tributary": "Brahmaputra (Siang)",
          "sangam": "Near Sadiya",
          "state": "Assam / Arunachal Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Anini",
          "type": "Administrative",
          "significance": "Headquarters of Dibang Valley, one of India's least densely populated districts",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Roing",
          "type": "Administrative",
          "significance": "Where the Dibang leaves the hills; Idu Mishmi homeland",
          "state": "Arunachal Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Dibang Multipurpose Project",
          "state": "Arunachal Pradesh",
          "type": "2,880 MW storage project under construction; designed as India's tallest dam (~278 m, concrete gravity) for hydropower and flood control"
        }
      ],
      "protectedAreas": [
        {
          "name": "Dibang Wildlife Sanctuary",
          "relation": "Upper Dibang catchment",
          "state": "Arunachal Pradesh"
        }
      ],
      "species": [
        {
          "name": "Mishmi Takin",
          "iucn": "Vulnerable",
          "role": "Goat-antelope of the high Mishmi Hills"
        }
      ],
      "commonMistake": "The Dibang is a LEFT-bank tributary (NCERT), joining with the Lohit near Sadiya where the river becomes the Brahmaputra."
    },
    "staticFacts": [
      "Together with the Lohit and Siang, its confluence near Sadiya marks the start of the 'Brahmaputra' name.",
      "The Dibang Valley is home to the Idu Mishmi community, whose land and forests are central to the debate on the Dibang project."
    ],
    "similarPYQ": [
      "GEO-UPSC-2016-04",
      "GEO-CDS1-2016-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03C",
    "slug": "lohit-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Lohit River",
    "aliases": [
      "Zayu Chu",
      "River of Blood",
      "Parasuram Kund River",
      "Mishmi River"
    ],
    "placeType": "Trans-Himalayan Left-Bank Tributary of Brahmaputra",
    "priority": "Medium",
    "locatedIn": {
      "country": "China (Tibet), India",
      "stateOrProvince": "Tibet Autonomous Region, Arunachal Pradesh, Assam"
    },
    "lat": 28.08,
    "lng": 96.55,
    "shape": [
      [
        28.66,
        97.47
      ],
      [
        28.23,
        97.02
      ],
      [
        28.08,
        96.55
      ],
      [
        27.93,
        96.18
      ],
      [
        27.85,
        95.55
      ]
    ],
    "neighbours": [
      "Source: Rises in the Zayul (Zayu) region of south-east Tibet as the Zayu Chu; enters Ind",
      "Mouth: Joins the Siang-Brahmaputra near Sadiya"
    ],
    "riverDetails": {
      "length": "~200 km in India",
      "origin": "Rises in the Zayul (Zayu) region of south-east Tibet as the Zayu Chu; enters India at Kibithu, Anjaw district",
      "mouth": "Joins the Siang-Brahmaputra near Sadiya",
      "sourceCoords": [
        28.66,
        97.47
      ],
      "mouthCoords": [
        27.85,
        95.55
      ],
      "states": {
        "flowsThrough": [
          "Arunachal Pradesh",
          "Assam"
        ],
        "basinStates": [
          "Arunachal Pradesh",
          "Assam"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Noa Dihing River",
            "note": "Flows through Namdapha; meets the Lohit system in the plains"
          }
        ],
        "rightBank": [
          {
            "name": "Kamlang River",
            "note": "Flows through Kamlang Tiger Reserve"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Brahmaputra (Siang)",
          "sangam": "Near Sadiya",
          "state": "Assam / Arunachal Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Kibithu and Walong",
          "type": "Strategic",
          "significance": "Entry point from Tibet; site of the 1962 Battle of Walong",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Dong",
          "type": "Tourism",
          "significance": "Valley near the Lohit where India first sees sunrise",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Parshuram Kund",
          "type": "Cultural",
          "significance": "Pilgrimage pool on the Lohit; Makar Sankranti mela",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Tezu",
          "type": "Administrative",
          "significance": "Headquarters of Lohit district",
          "state": "Arunachal Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Dhola-Sadiya Bridge (Bhupen Hazarika Setu)",
          "state": "Assam / Arunachal Pradesh",
          "type": "~9.15 km road bridge over the Lohit (2017), among India's longest"
        }
      ],
      "protectedAreas": [
        {
          "name": "Kamlang Tiger Reserve",
          "relation": "Kamlang tributary catchment",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Namdapha National Park",
          "relation": "Noa Dihing catchment; only park with four big cats (tiger, leopard, clouded leopard, snow leopard)",
          "state": "Arunachal Pradesh"
        }
      ],
      "species": [
        {
          "name": "Hoolock Gibbon",
          "iucn": "Endangered",
          "role": "India's only ape; found in the Namdapha forests"
        }
      ],
      "commonMistake": "The Dhola-Sadiya (Bhupen Hazarika) bridge is over the LOHIT, while Bogibeel is over the Brahmaputra main stem. The Lohit is a LEFT-bank tributary."
    },
    "staticFacts": [
      "Its name means 'river of blood', from the reddish lateritic soil it carries.",
      "It flows through the Mishmi Hills, one of the easternmost parts of India."
    ],
    "similarPYQ": [
      "GEO-UPSC-2016-04",
      "GEO-UPSC-2014-06",
      "GEO-CDS1-2016-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03D",
    "slug": "subansiri-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Subansiri River",
    "aliases": [
      "Gold River",
      "Kamla River",
      "Lower Subansiri River",
      "Mirihills River"
    ],
    "placeType": "Antecedent Right-Bank Tributary of Brahmaputra (Largest by Discharge)",
    "priority": "High",
    "locatedIn": {
      "country": "China (Tibet), India",
      "stateOrProvince": "Tibet Autonomous Region, Arunachal Pradesh, Assam"
    },
    "lat": 27.98,
    "lng": 94.22,
    "shape": [
      [
        28.65,
        92.8
      ],
      [
        28.15,
        93.85
      ],
      [
        27.55,
        94.25
      ],
      [
        27.2,
        94.15
      ],
      [
        26.95,
        94.2
      ]
    ],
    "neighbours": [
      "Source: Rises in Tibet and cuts across the Himalaya through the Miri hills into Upper Su",
      "Mouth: Joins the Brahmaputra near Majuli, Lakhimpur district (Assam)"
    ],
    "riverDetails": {
      "length": "~442 km",
      "origin": "Rises in Tibet and cuts across the Himalaya through the Miri hills into Upper Subansiri district (Arunachal Pradesh)",
      "mouth": "Joins the Brahmaputra near Majuli, Lakhimpur district (Assam)",
      "sourceCoords": [
        28.65,
        92.8
      ],
      "mouthCoords": [
        26.95,
        94.2
      ],
      "states": {
        "flowsThrough": [
          "Arunachal Pradesh",
          "Assam"
        ],
        "basinStates": [
          "Arunachal Pradesh",
          "Assam"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": [
          {
            "name": "Kamla River",
            "note": "Major tributary in Lower Subansiri district"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Brahmaputra",
          "sangam": "Near Majuli, Lakhimpur district",
          "state": "Assam"
        }
      ],
      "towns": [
        {
          "name": "Daporijo",
          "type": "Administrative",
          "significance": "Headquarters of Upper Subansiri on the river",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Gerukamukh",
          "type": "Infrastructure",
          "significance": "Site of the Subansiri Lower dam on the Assam-Arunachal border",
          "state": "Assam / Arunachal Pradesh"
        },
        {
          "name": "North Lakhimpur",
          "type": "Administrative",
          "significance": "Main town of the lower Subansiri plains",
          "state": "Assam"
        }
      ],
      "dams": [
        {
          "name": "Subansiri Lower Hydroelectric Project",
          "state": "Assam / Arunachal Pradesh border",
          "type": "2,000 MW (8 × 250 MW) by NHPC; India's largest hydro project, being commissioned unit by unit"
        }
      ],
      "protectedAreas": [],
      "species": [
        {
          "name": "Ganges River Dolphin",
          "iucn": "Endangered",
          "role": "Found in the lower Subansiri; affected by changed flows below the dam"
        },
        {
          "name": "Golden Mahseer",
          "iucn": "Endangered",
          "role": "Migratory game fish of the Subansiri"
        }
      ],
      "commonMistake": "The Subansiri is a RIGHT-bank (north-bank) tributary and an ANTECEDENT river (NCERT). It is the largest Brahmaputra tributary by discharge."
    },
    "staticFacts": [
      "Its name means 'gold river': gold placers have been worked from its sands.",
      "Its Tibetan origin and gorge through the Himalaya make it an antecedent river, like the Brahmaputra itself."
    ],
    "similarPYQ": [
      "GEO-UPSC-2014-06",
      "GEO-CDS1-2016-07",
      "GEO-CDS2-2022-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03E",
    "slug": "kameng-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Kameng (Jia Bharali) River",
    "aliases": [
      "Jia Bharali",
      "Bhareli",
      "Kameng River",
      "Pakke River"
    ],
    "placeType": "Himalayan Right-Bank Tributary of Brahmaputra",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Arunachal Pradesh, Assam"
    },
    "lat": 27.33,
    "lng": 92.82,
    "shape": [
      [
        27.8,
        92.4
      ],
      [
        27.33,
        92.82
      ],
      [
        26.95,
        92.85
      ],
      [
        26.62,
        92.85
      ]
    ],
    "neighbours": [
      "Source: Below the Gori Chen glacier near the India-Tibet border, Tawang district (Arunac",
      "Mouth: Joins the Brahmaputra near Tezpur (Assam), where it is called the Jia Bharali"
    ],
    "riverDetails": {
      "length": "~264 km",
      "origin": "Below the Gori Chen glacier near the India-Tibet border, Tawang district (Arunachal Pradesh)",
      "mouth": "Joins the Brahmaputra near Tezpur (Assam), where it is called the Jia Bharali",
      "sourceCoords": [
        27.8,
        92.4
      ],
      "mouthCoords": [
        26.62,
        92.85
      ],
      "states": {
        "flowsThrough": [
          "Arunachal Pradesh",
          "Assam"
        ],
        "basinStates": [
          "Arunachal Pradesh",
          "Assam"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Pakke River",
            "note": "Forms the eastern boundary of Pakke Tiger Reserve"
          }
        ],
        "rightBank": [
          {
            "name": "Bichom River",
            "note": "Dammed for the Kameng Hydroelectric Project"
          },
          {
            "name": "Tenga River",
            "note": "Dammed for the Kameng Hydroelectric Project"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Brahmaputra",
          "sangam": "Near Tezpur",
          "state": "Assam"
        }
      ],
      "towns": [
        {
          "name": "Seppa",
          "type": "Administrative",
          "significance": "Headquarters of East Kameng on the river",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Bhalukpong",
          "type": "Tourism",
          "significance": "Where the river enters the Assam plains; river rafting",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Tezpur",
          "type": "Historical",
          "significance": "Near the Jia Bharali-Brahmaputra confluence",
          "state": "Assam"
        }
      ],
      "dams": [
        {
          "name": "Kameng Hydroelectric Project",
          "state": "Arunachal Pradesh",
          "type": "600 MW (NEEPCO), with dams on the Bichom and Tenga; commissioned 2020"
        }
      ],
      "protectedAreas": [
        {
          "name": "Pakke Tiger Reserve",
          "relation": "Lies between the Kameng and Pakke rivers; hornbill nest adoption programme",
          "state": "Arunachal Pradesh"
        },
        {
          "name": "Nameri National Park",
          "relation": "On the Jia Bharali in Assam; contiguous with Pakke",
          "state": "Assam"
        },
        {
          "name": "Eaglenest Wildlife Sanctuary",
          "relation": "West Kameng hills; where the Bugun liocichla was discovered (2006)",
          "state": "Arunachal Pradesh"
        }
      ],
      "species": [
        {
          "name": "Great Hornbill",
          "iucn": "Vulnerable",
          "role": "Flagship of Pakke; state bird of Arunachal Pradesh"
        },
        {
          "name": "White-winged Wood Duck",
          "iucn": "Endangered",
          "role": "Forest-pool duck of Nameri; state bird of Assam"
        }
      ],
      "commonMistake": "The Kameng and the Jia Bharali are the SAME river: Kameng in Arunachal, Jia Bharali in Assam. It is a RIGHT-bank tributary."
    },
    "staticFacts": [
      "It separates the Kameng region (Tawang, West and East Kameng) of Arunachal into its western and eastern parts.",
      "The Pakke-Nameri landscape along this river forms one contiguous tiger habitat across the Arunachal-Assam border."
    ],
    "similarPYQ": [
      "GEO-UPSC-2016-04",
      "GEO-CDS1-2016-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03F",
    "slug": "manas-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Manas River",
    "aliases": [
      "Drangme Chhu",
      "Dangme Chhu",
      "Manasa",
      "Manas National Park River"
    ],
    "placeType": "Transboundary Right-Bank Tributary of Brahmaputra (from Bhutan)",
    "priority": "High",
    "locatedIn": {
      "country": "China (Tibet), Bhutan, India",
      "stateOrProvince": "Bhutan, Assam"
    },
    "lat": 26.79,
    "lng": 90.97,
    "shape": [
      [
        28,
        91
      ],
      [
        26.79,
        90.97
      ],
      [
        26.5,
        90.8
      ],
      [
        26.23,
        90.57
      ]
    ],
    "neighbours": [
      "Source: Headwaters in southern Tibet and the Bhutan Himalaya; formed in Bhutan by the me",
      "Mouth: Joins the Brahmaputra near Jogighopa, Bongaigaon district (Assam)"
    ],
    "riverDetails": {
      "length": "~376 km",
      "origin": "Headwaters in southern Tibet and the Bhutan Himalaya; formed in Bhutan by the meeting of the Drangme Chhu and the Mangde Chhu",
      "mouth": "Joins the Brahmaputra near Jogighopa, Bongaigaon district (Assam)",
      "sourceCoords": [
        28,
        91
      ],
      "mouthCoords": [
        26.23,
        90.57
      ],
      "states": {
        "flowsThrough": [
          "Assam"
        ],
        "basinStates": [
          "Assam"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Drangme Chhu",
            "note": "Eastern headstream draining eastern Bhutan (with the Kuri Chhu from Tibet)"
          }
        ],
        "rightBank": [
          {
            "name": "Mangde Chhu",
            "note": "Western headstream draining central Bhutan"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Drangme Chhu + Mangde Chhu",
          "sangam": "Southern Bhutan (forms the Manas)",
          "state": "Bhutan"
        },
        {
          "tributary": "Brahmaputra",
          "sangam": "Near Jogighopa",
          "state": "Assam"
        }
      ],
      "towns": [
        {
          "name": "Mathanguri",
          "type": "Tourism",
          "significance": "Where the Manas enters India inside Manas National Park",
          "state": "Assam"
        },
        {
          "name": "Barpeta Road",
          "type": "Administrative",
          "significance": "Gateway town to Manas National Park",
          "state": "Assam"
        },
        {
          "name": "Jogighopa",
          "type": "Infrastructure",
          "significance": "Manas-Brahmaputra confluence; inland waterway terminal and multimodal logistics park",
          "state": "Assam"
        }
      ],
      "dams": [
        {
          "name": "Mangdechhu Hydroelectric Project",
          "state": "Bhutan",
          "type": "720 MW on the Mangde Chhu, built with Indian assistance (2019)"
        },
        {
          "name": "Kurichhu Hydroelectric Project",
          "state": "Bhutan",
          "type": "60 MW on the Kuri Chhu"
        }
      ],
      "protectedAreas": [
        {
          "name": "Manas National Park",
          "relation": "The river forms its core; UNESCO World Heritage Site (1985), tiger reserve, elephant reserve and biosphere reserve",
          "state": "Assam"
        },
        {
          "name": "Royal Manas National Park",
          "relation": "Contiguous transboundary park across the river in Bhutan",
          "state": "Bhutan"
        }
      ],
      "species": [
        {
          "name": "Pygmy Hog",
          "iucn": "Endangered",
          "role": "World's smallest wild pig; reintroduced into Manas"
        },
        {
          "name": "Golden Langur",
          "iucn": "Endangered",
          "role": "Primate confined to the Manas-Sankosh region of Assam and Bhutan"
        },
        {
          "name": "Bengal Florican",
          "iucn": "Critically Endangered",
          "role": "Grassland bustard of the Manas floodplain"
        }
      ],
      "commonMistake": "Manas National Park was on UNESCO's 'World Heritage in Danger' list from 1992 to 2011, but it has since been removed. The Manas is a RIGHT-bank tributary entering from BHUTAN, not Arunachal."
    },
    "staticFacts": [
      "Named after the serpent goddess Manasa.",
      "Its floodplain grasslands in the Bhutan foothills (Terai-Duar savanna) hold several of India's rarest grassland species."
    ],
    "similarPYQ": [
      "GEO-CDS1-2016-07",
      "ENV-UPSC-2020-05",
      "ENV-UPSC-2012-11",
      "GEO-UPSC-2019-04"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03G",
    "slug": "teesta-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Teesta River",
    "aliases": [
      "Tista",
      "Rangeet River",
      "Lifeline of Sikkim",
      "Tso Lhamo River"
    ],
    "placeType": "Himalayan Right-Bank Tributary of Brahmaputra (joins in Bangladesh)",
    "priority": "High",
    "locatedIn": {
      "country": "India, Bangladesh",
      "stateOrProvince": "Sikkim, West Bengal (India); Rangpur division (Bangladesh)"
    },
    "lat": 27.08,
    "lng": 88.45,
    "shape": [
      [
        27.98,
        88.8
      ],
      [
        27.6,
        88.55
      ],
      [
        27.33,
        88.5
      ],
      [
        27.08,
        88.45
      ],
      [
        26.88,
        88.58
      ],
      [
        26.55,
        88.75
      ],
      [
        25.55,
        89.65
      ]
    ],
    "neighbours": [
      "Source: Tso Lhamo (Cholamu) lake and the Teesta Khangse glacier, North Sikkim, at over 5",
      "Mouth: Joins the Brahmaputra (Jamuna) near Chilmari, Kurigram district (Bangladesh)"
    ],
    "riverDetails": {
      "length": "~414 km",
      "origin": "Tso Lhamo (Cholamu) lake and the Teesta Khangse glacier, North Sikkim, at over 5,000 m",
      "mouth": "Joins the Brahmaputra (Jamuna) near Chilmari, Kurigram district (Bangladesh)",
      "sourceCoords": [
        27.98,
        88.8
      ],
      "mouthCoords": [
        25.55,
        89.65
      ],
      "states": {
        "flowsThrough": [
          "Sikkim",
          "West Bengal"
        ],
        "basinStates": [
          "Sikkim",
          "West Bengal"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Lachung Chu",
            "note": "Headstream joining the Lachen Chu at Chungthang"
          },
          {
            "name": "Rangpo Chu",
            "note": "Joins at Rangpo on the Sikkim-West Bengal border"
          }
        ],
        "rightBank": [
          {
            "name": "Rangit River",
            "note": "Drains West Sikkim (Pelling-Jorethang); joins at Melli (Triveni)"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Lachen Chu + Lachung Chu",
          "sangam": "Chungthang",
          "state": "Sikkim"
        },
        {
          "tributary": "Rangit",
          "sangam": "Melli (Triveni)",
          "state": "Sikkim / West Bengal"
        },
        {
          "tributary": "Brahmaputra (Jamuna)",
          "sangam": "Near Chilmari, Kurigram",
          "state": "Bangladesh"
        }
      ],
      "towns": [
        {
          "name": "Chungthang",
          "type": "Infrastructure",
          "significance": "Site of the Teesta-III dam, damaged by the October 2023 GLOF",
          "state": "Sikkim"
        },
        {
          "name": "Singtam and Rangpo",
          "type": "Economic",
          "significance": "Main valley towns on the NH-10 corridor",
          "state": "Sikkim"
        },
        {
          "name": "Sevoke",
          "type": "Infrastructure",
          "significance": "Coronation Bridge where the Teesta leaves the hills",
          "state": "West Bengal"
        },
        {
          "name": "Jalpaiguri",
          "type": "Administrative",
          "significance": "Teesta plains; Gajoldoba barrage nearby",
          "state": "West Bengal"
        }
      ],
      "dams": [
        {
          "name": "Teesta-III Hydroelectric Project",
          "state": "Sikkim",
          "type": "1,200 MW at Chungthang; its dam was washed away by the October 2023 GLOF"
        },
        {
          "name": "Teesta-V Hydroelectric Project",
          "state": "Sikkim",
          "type": "510 MW at Dikchu (NHPC); damaged in the 2023 floods"
        },
        {
          "name": "Teesta Low Dam III and IV",
          "state": "West Bengal",
          "type": "Run-of-the-river projects in the Darjeeling-Kalimpong stretch"
        },
        {
          "name": "Teesta Barrage (Gajoldoba)",
          "state": "West Bengal",
          "type": "Irrigation diversion in North Bengal"
        },
        {
          "name": "Dalia (Teesta) Barrage",
          "state": "Bangladesh",
          "type": "Irrigation barrage at Lalmonirhat"
        }
      ],
      "protectedAreas": [
        {
          "name": "Khangchendzonga National Park",
          "relation": "Upper catchment in Sikkim; India's first 'mixed' UNESCO World Heritage Site (2016)",
          "state": "Sikkim"
        },
        {
          "name": "Mahananda Wildlife Sanctuary",
          "relation": "Borders the Teesta near Sevoke where it leaves the hills",
          "state": "West Bengal"
        }
      ],
      "species": [
        {
          "name": "Red Panda",
          "iucn": "Endangered",
          "role": "State animal of Sikkim; temperate forests of the Teesta catchment"
        },
        {
          "name": "Snow Leopard",
          "iucn": "Vulnerable",
          "role": "High-altitude catchment of North Sikkim"
        }
      ],
      "commonMistake": "The Teesta joins the BRAHMAPUTRA (Jamuna) in Bangladesh, not the Ganga. After the 1787 floods it shifted to its present course; earlier it drained towards the Ganga system."
    },
    "staticFacts": [
      "The lifeline of Sikkim; almost the whole state lies in its basin.",
      "India and Bangladesh have not signed a Teesta water-sharing agreement; the 2011 draft remains unsigned because of West Bengal's objections."
    ],
    "similarPYQ": [
      "GEO-UPSC-2017-04",
      "UPSC-2026-25",
      "GEO-CDS1-2016-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03H",
    "slug": "dhansiri-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Dhansiri (South) River",
    "aliases": [
      "Dhansiri South",
      "Doyang River",
      "Dimapur River",
      "Golaghat River"
    ],
    "placeType": "Left-Bank (South-Bank) Tributary of Brahmaputra",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Nagaland, Assam"
    },
    "lat": 25.9,
    "lng": 93.73,
    "shape": [
      [
        25.55,
        93.95
      ],
      [
        25.9,
        93.73
      ],
      [
        26.15,
        93.8
      ],
      [
        26.5,
        93.85
      ],
      [
        26.73,
        93.83
      ]
    ],
    "neighbours": [
      "Source: Laisang peak area, Nagaland",
      "Mouth: Joins the Brahmaputra at Dhansirimukh, Golaghat district (Assam)"
    ],
    "riverDetails": {
      "length": "~352 km",
      "origin": "Laisang peak area, Nagaland",
      "mouth": "Joins the Brahmaputra at Dhansirimukh, Golaghat district (Assam)",
      "sourceCoords": [
        25.55,
        93.95
      ],
      "mouthCoords": [
        26.73,
        93.83
      ],
      "states": {
        "flowsThrough": [
          "Nagaland",
          "Assam"
        ],
        "basinStates": [
          "Nagaland",
          "Assam"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": [
          {
            "name": "Doyang River",
            "note": "From central Nagaland; Doyang reservoir is the Amur falcon roost"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Brahmaputra",
          "sangam": "Dhansirimukh, Golaghat",
          "state": "Assam"
        }
      ],
      "towns": [
        {
          "name": "Dimapur",
          "type": "Economic",
          "significance": "Nagaland's commercial hub; Kachari ruins on the Dhansiri",
          "state": "Nagaland"
        },
        {
          "name": "Golaghat",
          "type": "Administrative",
          "significance": "Lower Dhansiri plains near Kaziranga",
          "state": "Assam"
        }
      ],
      "dams": [
        {
          "name": "Doyang Hydroelectric Project",
          "state": "Nagaland",
          "type": "75 MW on the Doyang (NEEPCO)"
        }
      ],
      "protectedAreas": [
        {
          "name": "Intanki National Park",
          "relation": "Foothill forests of the Dhansiri catchment",
          "state": "Nagaland"
        },
        {
          "name": "Doyang Reservoir (Pangti)",
          "relation": "World's largest known roost of migrating Amur falcons",
          "state": "Nagaland"
        }
      ],
      "species": [
        {
          "name": "Amur Falcon",
          "iucn": "Least Concern",
          "role": "Long-distance migrant (Siberia-China to southern Africa) that roosts at Doyang every autumn"
        }
      ],
      "commonMistake": "There are two Dhansiris: this SOUTH Dhansiri (Nagaland-Golaghat) is a LEFT-bank tributary, while the North Dhansiri joins from Bhutan on the right bank."
    },
    "staticFacts": [
      "NCERT names the Burhi Dihing and the Dhansiri (South) as major left-bank tributaries of the Brahmaputra.",
      "Pangti village turned from hunting Amur falcons to protecting them, a well-known community conservation example."
    ],
    "similarPYQ": [
      "UPSC-2026-27",
      "GEO-CDS2-2022-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-03I",
    "slug": "barak-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Barak River",
    "aliases": [
      "Surma",
      "Kushiyara",
      "Meghna headwaters",
      "Tuivai",
      "NW-16 River"
    ],
    "placeType": "Major North-East River of the Meghna System (often studied with the Brahmaputra)",
    "priority": "High",
    "locatedIn": {
      "country": "India, Bangladesh",
      "stateOrProvince": "Manipur, Mizoram, Assam (India); Sylhet division (Bangladesh)"
    },
    "lat": 24.24,
    "lng": 93.03,
    "shape": [
      [
        25.4,
        94.1
      ],
      [
        24.85,
        93.05
      ],
      [
        24.82,
        92.8
      ],
      [
        24.88,
        92.48
      ],
      [
        24.05,
        91
      ]
    ],
    "neighbours": [
      "Source: Liyai Kullen village, Senapati district, Manipur hills",
      "Mouth: At the Bangladesh border it splits into the Surma and the Kushiyara, which reuni"
    ],
    "riverDetails": {
      "length": "~900 km including its Bangladesh course (~560 km in India)",
      "origin": "Liyai Kullen village, Senapati district, Manipur hills",
      "mouth": "At the Bangladesh border it splits into the Surma and the Kushiyara, which reunite as the Meghna and reach the Bay of Bengal",
      "sourceCoords": [
        25.4,
        94.1
      ],
      "mouthCoords": [
        24.88,
        92.48
      ],
      "states": {
        "flowsThrough": [
          "Manipur",
          "Mizoram",
          "Assam"
        ],
        "basinStates": [
          "Manipur",
          "Mizoram",
          "Assam",
          "Meghalaya",
          "Nagaland",
          "Tripura"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Tuivai River",
            "note": "From Mizoram-Manipur; joins at Tipaimukh"
          },
          {
            "name": "Dhaleswari (Tlawng) River",
            "note": "Longest river of Mizoram; joins in Cachar"
          },
          {
            "name": "Sonai River",
            "note": "From Mizoram; joins in Cachar"
          }
        ],
        "rightBank": [
          {
            "name": "Jiri River",
            "note": "Forms part of the Manipur-Assam boundary"
          },
          {
            "name": "Jatinga River",
            "note": "Drains the Dima Hasao hills"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Tuivai",
          "sangam": "Tipaimukh (Manipur-Mizoram border)",
          "state": "Manipur / Mizoram"
        },
        {
          "tributary": "Surma-Kushiyara bifurcation",
          "sangam": "Near Amalshid at the Bangladesh border",
          "state": "Assam / Bangladesh"
        }
      ],
      "towns": [
        {
          "name": "Silchar",
          "type": "Economic",
          "significance": "Main city of the Barak Valley; western end of National Waterway-16",
          "state": "Assam"
        },
        {
          "name": "Karimganj",
          "type": "Strategic",
          "significance": "Border town near the Surma-Kushiyara bifurcation",
          "state": "Assam"
        },
        {
          "name": "Jatinga",
          "type": "Tourism",
          "significance": "Known for the 'mass bird suicide' phenomenon on monsoon nights",
          "state": "Assam"
        }
      ],
      "dams": [
        {
          "name": "Tipaimukh Dam",
          "state": "Manipur / Mizoram border",
          "type": "Proposed multipurpose dam at the Barak-Tuivai confluence; opposed in Manipur and Bangladesh"
        }
      ],
      "protectedAreas": [
        {
          "name": "Barail Wildlife Sanctuary",
          "relation": "Barail range forests above the Barak Valley",
          "state": "Assam"
        }
      ],
      "species": [
        {
          "name": "Ganges River Dolphin",
          "iucn": "Endangered",
          "role": "Present in the Barak and Kushiyara channels"
        }
      ],
      "commonMistake": "The Barak is NOT a Brahmaputra tributary; it belongs to the MEGHNA system. Manipur's Imphal (Manipur) river and Loktak lake drain to the CHINDWIN in Myanmar, not to the Barak."
    },
    "staticFacts": [
      "The second-largest river system of North-East India after the Brahmaputra.",
      "Its Lakhipur-Bhanga stretch is National Waterway-16, linked to Bangladesh under the Indo-Bangladesh Protocol route."
    ],
    "similarPYQ": [
      "GEO-UPSC-2014-06",
      "GEO-CDS2-2022-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04",
    "slug": "narmada-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Narmada River",
    "aliases": [
      "Reva",
      "Nerbudda",
      "Lifeline of MP and Gujarat",
      "Amarkantak River"
    ],
    "placeType": "Largest West-Flowing Peninsular River (Rift Valley River)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Maharashtra, Gujarat"
    },
    "lat": 22.28,
    "lng": 76.47,
    "shape": [
      [
        22.67,
        81.75
      ],
      [
        22.95,
        80.6
      ],
      [
        23.13,
        79.8
      ],
      [
        22.8,
        78.75
      ],
      [
        22.75,
        77.72
      ],
      [
        22.25,
        76.47
      ],
      [
        22.24,
        76.15
      ],
      [
        22.17,
        75.58
      ],
      [
        21.83,
        73.75
      ],
      [
        21.7,
        73
      ],
      [
        21.65,
        72.6
      ]
    ],
    "neighbours": [
      "Source: Narmada Kund on the western flank of the Amarkantak plateau, Anuppur district (M",
      "Mouth: Arabian Sea through a wide estuary near Bharuch, Gulf of Khambhat (Gujarat)"
    ],
    "riverDetails": {
      "length": "1,312 km",
      "origin": "Narmada Kund on the western flank of the Amarkantak plateau, Anuppur district (Madhya Pradesh), at ~1,057 m",
      "mouth": "Arabian Sea through a wide estuary near Bharuch, Gulf of Khambhat (Gujarat)",
      "sourceCoords": [
        22.67,
        81.75
      ],
      "mouthCoords": [
        21.65,
        72.6
      ],
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Maharashtra",
          "Gujarat"
        ],
        "basinStates": [
          "Madhya Pradesh",
          "Maharashtra",
          "Gujarat",
          "Chhattisgarh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Burhner River",
            "note": "Maikal hills; drains Kanha"
          },
          {
            "name": "Banjar River",
            "note": "Drains Kanha; joins at Mandla"
          },
          {
            "name": "Sher, Shakkar and Dudhi Rivers",
            "note": "Satpura streams joining in the middle course"
          },
          {
            "name": "Tawa River",
            "note": "Largest tributary; rises near Pachmarhi; joins at Bandrabhan near Narmadapuram"
          },
          {
            "name": "Ganjal, Kundi and Goi Rivers",
            "note": "Satpura streams joining in the lower course"
          }
        ],
        "rightBank": [
          {
            "name": "Hiran River",
            "note": "Vindhyan tributary joining near Jabalpur"
          },
          {
            "name": "Barna and Kolar Rivers",
            "note": "Drain the Vindhyan plateau near Bhopal-Raisen"
          },
          {
            "name": "Orsang River",
            "note": "Joins at Chandod (Karnali Triveni), Vadodara district"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Banjar",
          "sangam": "Mandla",
          "state": "Madhya Pradesh"
        },
        {
          "tributary": "Tawa",
          "sangam": "Bandrabhan, near Narmadapuram",
          "state": "Madhya Pradesh"
        },
        {
          "tributary": "Orsang",
          "sangam": "Chandod (Karnali)",
          "state": "Gujarat"
        }
      ],
      "towns": [
        {
          "name": "Amarkantak",
          "type": "Cultural",
          "significance": "Source (Narmada Kund); the Son and Johilla also rise here",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Jabalpur (Bhedaghat)",
          "type": "Geological / Tourism",
          "significance": "Marble Rocks gorge and Dhuandhar Falls",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Narmadapuram (Hoshangabad)",
          "type": "Historical",
          "significance": "Renamed in 2022; Hathnora nearby yielded the 'Narmada Man' hominin fossil",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Omkareshwar",
          "type": "Cultural",
          "significance": "Jyotirlinga on Mandhata island in the river",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Maheshwar",
          "type": "Historical",
          "significance": "Holkar capital of Rani Ahilyabai; Maheshwari handloom",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Ekta Nagar (Kevadia)",
          "type": "Tourism",
          "significance": "Sardar Sarovar Dam and the Statue of Unity",
          "state": "Gujarat"
        },
        {
          "name": "Bharuch",
          "type": "Historical",
          "significance": "Ancient port of Bharukachchha (Barygaza) at the estuary",
          "state": "Gujarat"
        }
      ],
      "dams": [
        {
          "name": "Bargi Dam (Rani Avanti Bai Sagar)",
          "state": "Madhya Pradesh",
          "type": "First major dam on the Narmada, near Jabalpur"
        },
        {
          "name": "Tawa Dam",
          "state": "Madhya Pradesh",
          "type": "On the Tawa tributary; irrigation for the Narmadapuram plains"
        },
        {
          "name": "Indira Sagar Dam",
          "state": "Madhya Pradesh",
          "type": "At Punasa (Khandwa); largest reservoir in India by storage; 1,000 MW"
        },
        {
          "name": "Omkareshwar Dam",
          "state": "Madhya Pradesh",
          "type": "520 MW; its reservoir hosts a large floating solar park"
        },
        {
          "name": "Sardar Sarovar Dam",
          "state": "Gujarat",
          "type": "Concrete gravity dam (~163 m) at Kevadia; 1,450 MW; Narmada canal to Gujarat and Rajasthan"
        }
      ],
      "protectedAreas": [
        {
          "name": "Kanha Tiger Reserve",
          "relation": "Banjar and Halon (Burhner) catchments",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Satpura Tiger Reserve",
          "relation": "Tawa and Denwa catchment around Pachmarhi",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Shoolpaneshwar Wildlife Sanctuary",
          "relation": "Lower Narmada near Sardar Sarovar",
          "state": "Gujarat"
        }
      ],
      "species": [
        {
          "name": "Barasingha (Hard-ground Swamp Deer)",
          "iucn": "Vulnerable",
          "role": "Saved from near-extinction in Kanha; state animal of MP"
        },
        {
          "name": "Indian Gaur",
          "iucn": "Vulnerable",
          "role": "Found in Satpura and Kanha"
        },
        {
          "name": "Golden Mahseer",
          "iucn": "Endangered",
          "role": "State fish of Madhya Pradesh"
        }
      ],
      "commonMistake": "TAWA is the largest tributary and joins from the LEFT bank (Satpura side); right-bank tributaries come from the VINDHYAS. The Narmada forms an ESTUARY, not a delta. It flows in a RIFT VALLEY between the Vindhya and Satpura ranges."
    },
    "staticFacts": [
      "Flows west through a rift valley between the Vindhya (north) and Satpura (south) ranges, which is why it has a straight course, few long tributaries and an estuary instead of a delta.",
      "Also called the Reva; it is the traditional boundary between North and South India.",
      "Its basin covers about 98,796 sq km; the Narmada Water Disputes Tribunal award (1979) allocates its water among MP, Gujarat, Maharashtra and Rajasthan.",
      "Sardar Sarovar was the focus of the Narmada Bachao Andolan over displacement."
    ],
    "similarPYQ": [
      "GEO-UPSC-2013-11",
      "GEO-CDS2-2017-04",
      "GEO-UPSC-2016-03",
      "GEO-CDS2-2021-08"
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
    "place": "Tapi (Tapti) River",
    "aliases": [
      "Tapti",
      "Suryaputri",
      "Tapi Kund River",
      "Surat River"
    ],
    "placeType": "Second-Largest West-Flowing Peninsular River (Rift Valley River)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Maharashtra, Gujarat"
    },
    "lat": 21.1,
    "lng": 75.4,
    "shape": [
      [
        21.77,
        78.25
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
        21.12,
        75.4
      ],
      [
        21.28,
        74.75
      ],
      [
        21.25,
        73.58
      ],
      [
        21.17,
        72.83
      ],
      [
        21.05,
        72.68
      ]
    ],
    "neighbours": [
      "Source: Multai (Tapi Kund), Satpura range, Betul district (Madhya Pradesh), at ~752 m",
      "Mouth: Arabian Sea through an estuary near Surat (Gujarat)"
    ],
    "riverDetails": {
      "length": "724 km",
      "origin": "Multai (Tapi Kund), Satpura range, Betul district (Madhya Pradesh), at ~752 m",
      "mouth": "Arabian Sea through an estuary near Surat (Gujarat)",
      "sourceCoords": [
        21.77,
        78.25
      ],
      "mouthCoords": [
        21.05,
        72.68
      ],
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Maharashtra",
          "Gujarat"
        ],
        "basinStates": [
          "Madhya Pradesh",
          "Maharashtra",
          "Gujarat"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Purna River",
            "note": "Largest tributary; drains Vidarbha (Amravati-Akola); joins at Changdev, Jalgaon"
          },
          {
            "name": "Waghur River",
            "note": "From the Ajanta hills; joins in Jalgaon district"
          },
          {
            "name": "Girna River",
            "note": "From the Western Ghats (Nashik); joins near Nandre, Jalgaon"
          },
          {
            "name": "Bori River",
            "note": "Joins in Jalgaon-Dhule"
          },
          {
            "name": "Panjhra River",
            "note": "Flows past Dhule; joins at Mudawad"
          }
        ],
        "rightBank": [
          {
            "name": "Suki River",
            "note": "Satpura stream in Jalgaon district"
          },
          {
            "name": "Aner River",
            "note": "Satpura stream along the MP-Maharashtra border"
          },
          {
            "name": "Arunavati River",
            "note": "Satpura stream joining in Dhule"
          },
          {
            "name": "Gomai River",
            "note": "Joins at Prakasha, Nandurbar"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Purna",
          "sangam": "Changdev, Muktainagar (Jalgaon)",
          "state": "Maharashtra"
        },
        {
          "tributary": "Girna",
          "sangam": "Near Nandre, Jalgaon",
          "state": "Maharashtra"
        },
        {
          "tributary": "Panjhra",
          "sangam": "Mudawad, Dhule",
          "state": "Maharashtra"
        },
        {
          "tributary": "Gomai",
          "sangam": "Prakasha, Nandurbar",
          "state": "Maharashtra"
        }
      ],
      "towns": [
        {
          "name": "Multai",
          "type": "Cultural",
          "significance": "Source of the Tapi (Mulatapi)",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Burhanpur",
          "type": "Historical",
          "significance": "Mughal 'Gateway to the Deccan'; Asirgarh fort nearby",
          "state": "Madhya Pradesh"
        },
        {
          "name": "Bhusawal",
          "type": "Economic",
          "significance": "Railway junction; thermal power station",
          "state": "Maharashtra"
        },
        {
          "name": "Prakasha",
          "type": "Cultural",
          "significance": "'Dakshin Kashi'; temples at the Tapi-Gomai confluence",
          "state": "Maharashtra"
        },
        {
          "name": "Surat",
          "type": "Economic",
          "significance": "Diamond-cutting and textile capital at the Tapi estuary",
          "state": "Gujarat"
        }
      ],
      "dams": [
        {
          "name": "Ukai Dam (Vallabh Sagar)",
          "state": "Gujarat",
          "type": "Largest reservoir on the Tapi; irrigation, hydropower, flood control"
        },
        {
          "name": "Kakrapar Weir",
          "state": "Gujarat",
          "type": "Irrigation weir; Kakrapar Atomic Power Station on its reservoir"
        },
        {
          "name": "Hatnur Dam",
          "state": "Maharashtra",
          "type": "Near Bhusawal (Jalgaon); irrigation"
        },
        {
          "name": "Sarangkheda and Prakasha Barrages",
          "state": "Maharashtra",
          "type": "Barrages in Nandurbar district"
        }
      ],
      "protectedAreas": [
        {
          "name": "Melghat Tiger Reserve",
          "relation": "Gawilgarh hills of the Satpura draining to the Tapi; one of the first nine tiger reserves (1973)",
          "state": "Maharashtra"
        },
        {
          "name": "Yawal Wildlife Sanctuary",
          "relation": "Satpura foothills north of the Tapi in Jalgaon",
          "state": "Maharashtra"
        }
      ],
      "species": [
        {
          "name": "Forest Owlet",
          "iucn": "Endangered",
          "role": "Rediscovered in 1997 near Shahada (Nandurbar); also in Melghat"
        },
        {
          "name": "Indian Gaur",
          "iucn": "Vulnerable",
          "role": "Found in Melghat"
        }
      ],
      "commonMistake": "The PURNA is the largest tributary and joins from the LEFT (south) bank. The Tapi flows through Jalgaon, Dhule and Nandurbar, not Nashik (only its tributary Girna rises there). It forms an ESTUARY, not a delta."
    },
    "staticFacts": [
      "Flows parallel to the Narmada in a rift valley south of the Satpura range.",
      "Its basin of about 65,145 sq km lies mostly in Maharashtra's Khandesh and Vidarbha regions.",
      "Jalgaon in the Tapi valley is India's leading banana district (Jalgaon banana has a GI tag)."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-04",
      "GEO-CDS2-2021-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04B",
    "slug": "sabarmati-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Sabarmati River",
    "aliases": [
      "Sabarmati",
      "Vakaland",
      "Harnav",
      "Ahmedabad River"
    ],
    "placeType": "West-Flowing River of Gujarat Plains",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Rajasthan, Gujarat"
    },
    "lat": 23.22,
    "lng": 72.65,
    "shape": [
      [
        24.4,
        73.4
      ],
      [
        23.95,
        72.9
      ],
      [
        23.22,
        72.65
      ],
      [
        23.03,
        72.58
      ],
      [
        22.65,
        72.5
      ],
      [
        22.25,
        72.45
      ]
    ],
    "neighbours": [
      "Source: Aravalli hills, Udaipur district (Rajasthan)",
      "Mouth: Gulf of Khambhat (Gujarat)"
    ],
    "riverDetails": {
      "length": "~371 km",
      "origin": "Aravalli hills, Udaipur district (Rajasthan)",
      "mouth": "Gulf of Khambhat (Gujarat)",
      "sourceCoords": [
        24.4,
        73.4
      ],
      "mouthCoords": [
        22.25,
        72.45
      ],
      "states": {
        "flowsThrough": [
          "Rajasthan",
          "Gujarat"
        ],
        "basinStates": [
          "Rajasthan",
          "Gujarat"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Wakal River",
            "note": "Aravalli stream joining in the upper course"
          },
          {
            "name": "Harnav River",
            "note": "Flows through the Polo forest (Vijaynagar)"
          },
          {
            "name": "Hathmati River",
            "note": "Flows past Himmatnagar"
          },
          {
            "name": "Watrak River",
            "note": "Largest tributary, with the Meshwo, Majum and Shedhi"
          }
        ],
        "rightBank": [
          {
            "name": "Sei River",
            "note": "Aravalli stream joining in the upper course"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Watrak",
          "sangam": "Near Vautha, Ahmedabad district",
          "state": "Gujarat"
        }
      ],
      "towns": [
        {
          "name": "Gandhinagar",
          "type": "Administrative",
          "significance": "Capital of Gujarat on the Sabarmati",
          "state": "Gujarat"
        },
        {
          "name": "Ahmedabad",
          "type": "Historical / Economic",
          "significance": "Sabarmati Ashram (1917) and the Sabarmati Riverfront",
          "state": "Gujarat"
        },
        {
          "name": "Vautha",
          "type": "Cultural",
          "significance": "Seven-river confluence; Vautha fair",
          "state": "Gujarat"
        }
      ],
      "dams": [
        {
          "name": "Dharoi Dam",
          "state": "Gujarat",
          "type": "Main storage dam on the Sabarmati (Mehsana district)"
        }
      ],
      "protectedAreas": [],
      "species": [],
      "commonMistake": "The Sabarmati drains into the Gulf of KHAMBHAT, not the Gulf of Kutch. Gandhi's Dandi March (1930) started from Sabarmati Ashram, but Dandi lies on the coast near Navsari, not on the Sabarmati."
    },
    "staticFacts": [
      "A rain-fed river whose dry-season flow at Ahmedabad is now largely supplied by Narmada canal water.",
      "Among the most polluted river stretches in India below Ahmedabad."
    ],
    "similarPYQ": [
      "GEO-CDS2-2021-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04C",
    "slug": "mahi-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Mahi River",
    "aliases": [
      "Mahisagar",
      "Tropic of Cancer River",
      "Vagad River",
      "Mahi Bajaj Sagar"
    ],
    "placeType": "West-Flowing River Crossing the Tropic of Cancer Twice",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Madhya Pradesh, Rajasthan, Gujarat"
    },
    "lat": 23.55,
    "lng": 74.45,
    "shape": [
      [
        22.62,
        75.15
      ],
      [
        23.35,
        75.05
      ],
      [
        23.63,
        74.55
      ],
      [
        23.55,
        74
      ],
      [
        23.1,
        73.45
      ],
      [
        22.75,
        73.2
      ],
      [
        22.25,
        72.6
      ]
    ],
    "neighbours": [
      "Source: Vindhya range near Minda village, Dhar district (Madhya Pradesh)",
      "Mouth: Gulf of Khambhat through a wide estuary (Gujarat)"
    ],
    "riverDetails": {
      "length": "~583 km",
      "origin": "Vindhya range near Minda village, Dhar district (Madhya Pradesh)",
      "mouth": "Gulf of Khambhat through a wide estuary (Gujarat)",
      "sourceCoords": [
        22.62,
        75.15
      ],
      "mouthCoords": [
        22.25,
        72.6
      ],
      "states": {
        "flowsThrough": [
          "Madhya Pradesh",
          "Rajasthan",
          "Gujarat"
        ],
        "basinStates": [
          "Madhya Pradesh",
          "Rajasthan",
          "Gujarat"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Anas River",
            "note": "From western MP; joins on the Rajasthan-Gujarat border"
          },
          {
            "name": "Panam River",
            "note": "Joins in the Panchmahal region of Gujarat"
          }
        ],
        "rightBank": [
          {
            "name": "Som River",
            "note": "Joins with the Jakham at Beneshwar, Dungarpur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Som + Jakham",
          "sangam": "Beneshwar (triveni), Dungarpur",
          "state": "Rajasthan"
        }
      ],
      "towns": [
        {
          "name": "Banswara",
          "type": "Cultural",
          "significance": "'City of a hundred islands' in the Mahi backwaters; Bhil heartland",
          "state": "Rajasthan"
        },
        {
          "name": "Beneshwar Dham",
          "type": "Cultural",
          "significance": "Som-Mahi-Jakham confluence; Beneshwar fair, called the 'Kumbh of the Bhils'",
          "state": "Rajasthan"
        },
        {
          "name": "Galteshwar",
          "type": "Cultural",
          "significance": "Solanki-era temple at the Mahi-Galti confluence",
          "state": "Gujarat"
        }
      ],
      "dams": [
        {
          "name": "Mahi Bajaj Sagar Dam",
          "state": "Rajasthan",
          "type": "Main dam in Banswara; irrigation and hydropower"
        },
        {
          "name": "Kadana Dam",
          "state": "Gujarat",
          "type": "Multipurpose dam in Mahisagar district"
        },
        {
          "name": "Wanakbori Weir",
          "state": "Gujarat",
          "type": "Diverts water to the Mahi Right Bank Canal; Wanakbori thermal station"
        }
      ],
      "protectedAreas": [],
      "species": [],
      "commonMistake": "The Mahi crosses the TROPIC OF CANCER TWICE because of its inverted-U course: north from MP into Rajasthan, then south-west into Gujarat. It is a west-flowing river, not a Yamuna tributary."
    },
    "staticFacts": [
      "Its inverted-U course through Vagad (Banswara-Dungarpur) makes it a favourite map-based question.",
      "Like the Narmada and Tapi, it ends in an estuary in the Gulf of Khambhat."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-04"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04D",
    "slug": "luni-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Luni River",
    "aliases": [
      "Lavanavari",
      "Salt River",
      "Sagarmati",
      "Thar Desert River"
    ],
    "placeType": "Inland-Ending Ephemeral River of the Thar (Ends in the Rann of Kutch)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Rajasthan, Gujarat"
    },
    "lat": 25.83,
    "lng": 72.24,
    "shape": [
      [
        26.48,
        74.55
      ],
      [
        26.35,
        74.3
      ],
      [
        25.83,
        72.85
      ],
      [
        25.65,
        72.24
      ],
      [
        25.05,
        71.7
      ],
      [
        24.5,
        71.2
      ]
    ],
    "neighbours": [
      "Source: Naga hills of the Aravallis near Pushkar, Ajmer district (Rajasthan), where it i",
      "Mouth: Ends in the marshes of the Rann of Kutch (Gujarat); it does not reach the sea"
    ],
    "riverDetails": {
      "length": "~495 km",
      "origin": "Naga hills of the Aravallis near Pushkar, Ajmer district (Rajasthan), where it is called the Sagarmati",
      "mouth": "Ends in the marshes of the Rann of Kutch (Gujarat); it does not reach the sea",
      "sourceCoords": [
        26.48,
        74.55
      ],
      "mouthCoords": [
        24.5,
        71.2
      ],
      "states": {
        "flowsThrough": [
          "Rajasthan",
          "Gujarat"
        ],
        "basinStates": [
          "Rajasthan",
          "Gujarat"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Sukri River",
            "note": "Aravalli tributary; joins near Samdari"
          },
          {
            "name": "Jawai River",
            "note": "Dammed at Jawai (Pali), the largest dam in western Rajasthan"
          },
          {
            "name": "Bandi, Guhiya and Khari Rivers",
            "note": "Aravalli tributaries from the Pali-Sirohi side"
          }
        ],
        "rightBank": [
          {
            "name": "Jojari River",
            "note": "The ONLY right-bank tributary; carries Jodhpur's effluents"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Sarsuti",
          "sangam": "Govindgarh (headstream joins the Sagarmati to form the Luni)",
          "state": "Rajasthan"
        }
      ],
      "towns": [
        {
          "name": "Pushkar",
          "type": "Cultural",
          "significance": "Brahma temple and lake near the source",
          "state": "Rajasthan"
        },
        {
          "name": "Balotra",
          "type": "Economic",
          "significance": "Textile dyeing hub; river turns saline below here; Pachpadra salt and refinery nearby",
          "state": "Rajasthan"
        },
        {
          "name": "Jalore",
          "type": "Historical",
          "significance": "Lower Luni basin; Jalore fort",
          "state": "Rajasthan"
        }
      ],
      "dams": [
        {
          "name": "Jawai Dam",
          "state": "Rajasthan",
          "type": "On the Jawai tributary (Pali); main water source for Jodhpur-Pali region"
        }
      ],
      "protectedAreas": [
        {
          "name": "Wild Ass Sanctuary (Little Rann of Kutch)",
          "relation": "Terminal marsh region of the Luni system",
          "state": "Gujarat"
        }
      ],
      "species": [
        {
          "name": "Indian Wild Ass (Khur)",
          "iucn": "Near Threatened",
          "role": "Endemic to the Rann of Kutch"
        }
      ],
      "commonMistake": "The Luni does NOT reach the Arabian Sea; it ends in the Rann of Kutch. It is fresh in its upper course but SALINE below Balotra. JOJARI is its only right-bank tributary; all others come from the Aravallis on the left."
    },
    "staticFacts": [
      "The only significant river of the Thar desert; ephemeral, flowing mainly in the monsoon.",
      "Called 'Lavanavari' (salt river) in Sanskrit because of its salinity in the lower course."
    ],
    "similarPYQ": [
      "GEO-CDS2-2018-02"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04E",
    "slug": "mandovi-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Mandovi (Mahadayi) River",
    "aliases": [
      "Mahadayi",
      "Mhadei",
      "Lifeline of Goa",
      "Dudhsagar River"
    ],
    "placeType": "Short West-Flowing Western Ghats River (Lifeline of Goa)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka, Goa, Maharashtra (small catchment)"
    },
    "lat": 15.48,
    "lng": 74.05,
    "shape": [
      [
        15.55,
        74.35
      ],
      [
        15.52,
        74.2
      ],
      [
        15.5,
        74.05
      ],
      [
        15.5,
        73.92
      ],
      [
        15.5,
        73.82
      ]
    ],
    "neighbours": [
      "Source: Bhimgad area of the Western Ghats, Belagavi district (Karnataka), where it is ca",
      "Mouth: Arabian Sea at Panaji through the Aguada Bay estuary (Goa)"
    ],
    "riverDetails": {
      "length": "~77 km",
      "origin": "Bhimgad area of the Western Ghats, Belagavi district (Karnataka), where it is called the Mahadayi (Mhadei)",
      "mouth": "Arabian Sea at Panaji through the Aguada Bay estuary (Goa)",
      "sourceCoords": [
        15.55,
        74.35
      ],
      "mouthCoords": [
        15.5,
        73.82
      ],
      "states": {
        "flowsThrough": [
          "Karnataka",
          "Goa"
        ],
        "basinStates": [
          "Karnataka",
          "Goa",
          "Maharashtra"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": []
      },
      "confluences": [
        {
          "tributary": "Zuari (via Cumbarjua Canal)",
          "sangam": "Cumbarjua canal links the Mandovi and Zuari estuaries",
          "state": "Goa"
        }
      ],
      "towns": [
        {
          "name": "Panaji",
          "type": "Administrative",
          "significance": "Capital of Goa on the Mandovi estuary",
          "state": "Goa"
        },
        {
          "name": "Old Goa",
          "type": "Historical",
          "significance": "Portuguese capital; Basilica of Bom Jesus (UNESCO World Heritage Site)",
          "state": "Goa"
        },
        {
          "name": "Divar and Chorao islands",
          "type": "Ecological",
          "significance": "Estuarine islands; Salim Ali Bird Sanctuary on Chorao",
          "state": "Goa"
        }
      ],
      "dams": [
        {
          "name": "Kalasa-Banduri Diversion Project",
          "state": "Karnataka",
          "type": "Proposed diversion of Mahadayi headwater streams to the Malaprabha (Krishna basin); disputed by Goa"
        }
      ],
      "protectedAreas": [
        {
          "name": "Bhagwan Mahaveer Wildlife Sanctuary and Mollem National Park",
          "relation": "Upper Mandovi catchment; Dudhsagar Falls",
          "state": "Goa"
        },
        {
          "name": "Mhadei Wildlife Sanctuary",
          "relation": "Mahadayi headwaters in Goa",
          "state": "Goa"
        },
        {
          "name": "Salim Ali Bird Sanctuary",
          "relation": "Mangroves on Chorao island in the estuary",
          "state": "Goa"
        }
      ],
      "species": [
        {
          "name": "Bengal Tiger",
          "iucn": "Endangered",
          "role": "Moves through the Mhadei-Mollem-Kali corridor"
        }
      ],
      "commonMistake": "Mandovi and Mahadayi (Mhadei) are the SAME river. Dudhsagar Falls is on the Mandovi, not the Zuari. The Mahadayi dispute is between GOA and KARNATAKA (with Maharashtra a minor party)."
    },
    "staticFacts": [
      "A short, fast Western Ghats river that forms an estuary, typical of west-flowing rivers.",
      "The Mahadayi Water Disputes Tribunal gave its award in 2018; Goa opposes Karnataka's Kalasa-Banduri diversion."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-04"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04F",
    "slug": "zuari-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Zuari River",
    "aliases": [
      "Aghanashini of Goa",
      "Cortalim River",
      "Mormugao River"
    ],
    "placeType": "Short West-Flowing Western Ghats River (Goa)",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Goa"
    },
    "lat": 15.3,
    "lng": 74.02,
    "shape": [
      [
        15.1,
        74.2
      ],
      [
        15.25,
        74.1
      ],
      [
        15.3,
        74.02
      ],
      [
        15.41,
        73.8
      ]
    ],
    "neighbours": [
      "Source: Western Ghats in Sanguem taluka (Goa)",
      "Mouth: Arabian Sea at Mormugao Bay (Goa)"
    ],
    "riverDetails": {
      "length": "~92 km",
      "origin": "Western Ghats in Sanguem taluka (Goa)",
      "mouth": "Arabian Sea at Mormugao Bay (Goa)",
      "sourceCoords": [
        15.1,
        74.2
      ],
      "mouthCoords": [
        15.41,
        73.8
      ],
      "states": {
        "flowsThrough": [
          "Goa"
        ],
        "basinStates": [
          "Goa"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": []
      },
      "confluences": [
        {
          "tributary": "Mandovi (via Cumbarjua Canal)",
          "sangam": "Cumbarjua canal",
          "state": "Goa"
        }
      ],
      "towns": [
        {
          "name": "Mormugao (Vasco da Gama)",
          "type": "Economic",
          "significance": "Major port at the Zuari mouth; iron-ore exports",
          "state": "Goa"
        },
        {
          "name": "Agassaim-Cortalim",
          "type": "Infrastructure",
          "significance": "New Zuari cable-stayed bridge on NH-66",
          "state": "Goa"
        }
      ],
      "dams": [],
      "protectedAreas": [
        {
          "name": "Netravali Wildlife Sanctuary",
          "relation": "Upper catchment in Sanguem",
          "state": "Goa"
        }
      ],
      "species": [],
      "commonMistake": "MORMUGAO port is at the Zuari mouth, while PANAJI is on the Mandovi. The Mandovi and Zuari are linked by the Cumbarjua canal, making Tiswadi (Ilhas) an island."
    },
    "staticFacts": [
      "Together with the Mandovi it forms Goa's main estuarine and inland-waterway system.",
      "Its estuary is lined with mangroves and khazan (reclaimed saline) farmlands."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-04"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04G",
    "slug": "sharavati-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Sharavati River",
    "aliases": [
      "Sharavathi",
      "Jog Falls River",
      "Gersoppa River",
      "Linganamakki River"
    ],
    "placeType": "Short West-Flowing Western Ghats River (Jog Falls)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka"
    },
    "lat": 14.23,
    "lng": 74.81,
    "shape": [
      [
        13.83,
        75.12
      ],
      [
        14.15,
        74.9
      ],
      [
        14.23,
        74.81
      ],
      [
        14.28,
        74.6
      ],
      [
        14.28,
        74.45
      ]
    ],
    "neighbours": [
      "Source: Ambutirtha, near Thirthahalli, Shivamogga district (Karnataka)",
      "Mouth: Arabian Sea at Honnavar, Uttara Kannada district (Karnataka)"
    ],
    "riverDetails": {
      "length": "~128 km",
      "origin": "Ambutirtha, near Thirthahalli, Shivamogga district (Karnataka)",
      "mouth": "Arabian Sea at Honnavar, Uttara Kannada district (Karnataka)",
      "sourceCoords": [
        13.83,
        75.12
      ],
      "mouthCoords": [
        14.28,
        74.45
      ],
      "states": {
        "flowsThrough": [
          "Karnataka"
        ],
        "basinStates": [
          "Karnataka"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": []
      },
      "confluences": [],
      "towns": [
        {
          "name": "Jog Falls",
          "type": "Tourism / Geological",
          "significance": "~253 m plunge in four streams (Raja, Rani, Roarer, Rocket); among India's highest waterfalls",
          "state": "Karnataka"
        },
        {
          "name": "Honnavar",
          "type": "Economic",
          "significance": "Estuary and fishing port at the mouth",
          "state": "Karnataka"
        }
      ],
      "dams": [
        {
          "name": "Linganamakki Dam",
          "state": "Karnataka",
          "type": "Main reservoir above Jog Falls; feeds the Sharavati hydro stations"
        },
        {
          "name": "Mahatma Gandhi Hydroelectric Station",
          "state": "Karnataka",
          "type": "Old power station at Jog"
        },
        {
          "name": "Sharavati Pumped Storage Project",
          "state": "Karnataka",
          "type": "Proposed large pumped-storage scheme between Talakalale and Gerusoppa reservoirs"
        }
      ],
      "protectedAreas": [
        {
          "name": "Sharavathi Valley Lion-tailed Macaque Sanctuary",
          "relation": "Evergreen forests of the Sharavati valley",
          "state": "Karnataka"
        }
      ],
      "species": [
        {
          "name": "Lion-tailed Macaque",
          "iucn": "Endangered",
          "role": "Endemic Western Ghats primate; flagship of the Sharavati valley"
        }
      ],
      "commonMistake": "Jog Falls is on the SHARAVATI, not the Kali or Netravati. The Sharavati flows WEST to the Arabian Sea and is not a tributary of the Krishna or Tungabhadra."
    },
    "staticFacts": [
      "A classic Western Ghats river: short, steep, monsoon-fed, with waterfalls where it drops off the Ghats.",
      "The Sharavati valley was one of Karnataka's earliest major hydropower developments."
    ],
    "similarPYQ": [
      "GEO-CDS1-2017-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04H",
    "slug": "periyar-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Periyar River",
    "aliases": [
      "Lifeline of Kerala",
      "Churni",
      "Idukki River",
      "Mullaperiyar River"
    ],
    "placeType": "Longest River of Kerala (West-Flowing)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Kerala, Tamil Nadu (headwaters)"
    },
    "lat": 9.84,
    "lng": 76.97,
    "shape": [
      [
        9.45,
        77.25
      ],
      [
        9.52,
        77.15
      ],
      [
        9.84,
        76.97
      ],
      [
        10.02,
        76.5
      ],
      [
        10.11,
        76.35
      ],
      [
        10.18,
        76.17
      ]
    ],
    "neighbours": [
      "Source: Sivagiri hills of the Western Ghats on the Kerala-Tamil Nadu border",
      "Mouth: Arabian Sea near Kochi: splits at Aluva into the Mangalapuzha (to the sea at Mun"
    ],
    "riverDetails": {
      "length": "~244 km",
      "origin": "Sivagiri hills of the Western Ghats on the Kerala-Tamil Nadu border",
      "mouth": "Arabian Sea near Kochi: splits at Aluva into the Mangalapuzha (to the sea at Munambam) and the Marthandan (to the Vembanad backwaters)",
      "sourceCoords": [
        9.45,
        77.25
      ],
      "mouthCoords": [
        10.18,
        76.17
      ],
      "states": {
        "flowsThrough": [
          "Kerala"
        ],
        "basinStates": [
          "Kerala",
          "Tamil Nadu"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": [
          {
            "name": "Muthirapuzha River",
            "note": "Drains Munnar"
          },
          {
            "name": "Edamalayar River",
            "note": "Dammed at Idamalayar"
          }
        ]
      },
      "confluences": [],
      "towns": [
        {
          "name": "Thekkady",
          "type": "Tourism",
          "significance": "Periyar Tiger Reserve on the Mullaperiyar reservoir",
          "state": "Kerala"
        },
        {
          "name": "Idukki",
          "type": "Infrastructure",
          "significance": "Idukki arch dam and Kerala's largest hydro scheme",
          "state": "Kerala"
        },
        {
          "name": "Aluva",
          "type": "Cultural",
          "significance": "Shivaratri festival on the Periyar sand banks",
          "state": "Kerala"
        },
        {
          "name": "Kodungallur (Muziris)",
          "type": "Historical",
          "significance": "Ancient Muziris port near the old Periyar mouth",
          "state": "Kerala"
        }
      ],
      "dams": [
        {
          "name": "Mullaperiyar Dam",
          "state": "Kerala (operated by Tamil Nadu)",
          "type": "1895 gravity dam; diverts water east to the Vaigai basin; long-running Kerala-TN dispute over safety and water level"
        },
        {
          "name": "Idukki Dam",
          "state": "Kerala",
          "type": "Arch dam (~169 m) between Kuravan and Kurathi hills, with Cheruthoni and Kulamavu dams"
        },
        {
          "name": "Idamalayar Dam",
          "state": "Kerala",
          "type": "On the Edamalayar tributary"
        }
      ],
      "protectedAreas": [
        {
          "name": "Periyar Tiger Reserve",
          "relation": "Around the Mullaperiyar reservoir at Thekkady",
          "state": "Kerala"
        },
        {
          "name": "Idukki Wildlife Sanctuary",
          "relation": "Around the Idukki reservoir",
          "state": "Kerala"
        },
        {
          "name": "Thattekad Bird Sanctuary (Salim Ali)",
          "relation": "On the Periyar near Kothamangalam",
          "state": "Kerala"
        }
      ],
      "species": [
        {
          "name": "Asian Elephant",
          "iucn": "Endangered",
          "role": "Large population in Periyar Tiger Reserve"
        }
      ],
      "commonMistake": "The MULLAPERIYAR dam is in Kerala but is OPERATED by Tamil Nadu, and its water flows EAST to the Vaigai basin. The Periyar is the LONGEST river of Kerala; the Bharathapuzha is second."
    },
    "staticFacts": [
      "Called the 'lifeline of Kerala' for its power, irrigation and drinking-water role.",
      "The 2018 Kerala floods saw Idukki's shutters opened after 26 years."
    ],
    "similarPYQ": [
      "GEO-CDS1-2017-08",
      "ENV-UPSC-2019-09"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-04I",
    "slug": "bharathapuzha-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Bharathapuzha (Nila) River",
    "aliases": [
      "Nila",
      "Ponnani River",
      "Palakkad Gap River",
      "Kalamandalam River"
    ],
    "placeType": "Second-Longest River of Kerala (Flows through the Palakkad Gap)",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Kerala, Tamil Nadu"
    },
    "lat": 10.77,
    "lng": 76.37,
    "shape": [
      [
        10.55,
        77
      ],
      [
        10.65,
        76.85
      ],
      [
        10.77,
        76.65
      ],
      [
        10.77,
        76.37
      ],
      [
        10.82,
        76.05
      ],
      [
        10.78,
        75.9
      ]
    ],
    "neighbours": [
      "Source: Anamalai hills of the Western Ghats (Tamil Nadu)",
      "Mouth: Arabian Sea at Ponnani, Malappuram district (Kerala)"
    ],
    "riverDetails": {
      "length": "~209 km",
      "origin": "Anamalai hills of the Western Ghats (Tamil Nadu)",
      "mouth": "Arabian Sea at Ponnani, Malappuram district (Kerala)",
      "sourceCoords": [
        10.55,
        77
      ],
      "mouthCoords": [
        10.78,
        75.9
      ],
      "states": {
        "flowsThrough": [
          "Tamil Nadu",
          "Kerala"
        ],
        "basinStates": [
          "Tamil Nadu",
          "Kerala"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Gayathripuzha River",
            "note": "From the Anamalai side; joins near Mayannur"
          },
          {
            "name": "Kannadipuzha River",
            "note": "From the Tamil Nadu side through Palakkad"
          }
        ],
        "rightBank": [
          {
            "name": "Kalpathipuzha River",
            "note": "Fed by Malampuzha dam; flows past Kalpathy (Palakkad)"
          },
          {
            "name": "Thuthapuzha River",
            "note": "Fed by the Kunthipuzha from Silent Valley"
          }
        ]
      },
      "confluences": [],
      "towns": [
        {
          "name": "Palakkad",
          "type": "Strategic / Cultural",
          "significance": "Palakkad Gap in the Western Ghats; Kalpathy chariot festival",
          "state": "Kerala"
        },
        {
          "name": "Cheruthuruthy",
          "type": "Cultural",
          "significance": "Kerala Kalamandalam (Kathakali centre) on its banks",
          "state": "Kerala"
        },
        {
          "name": "Thirunavaya",
          "type": "Historical",
          "significance": "Site of the medieval Mamankam festival",
          "state": "Kerala"
        },
        {
          "name": "Ponnani",
          "type": "Historical",
          "significance": "Ancient port at the river mouth",
          "state": "Kerala"
        }
      ],
      "dams": [
        {
          "name": "Malampuzha Dam",
          "state": "Kerala",
          "type": "Largest irrigation reservoir in Kerala, on a Bharathapuzha tributary"
        }
      ],
      "protectedAreas": [
        {
          "name": "Silent Valley National Park",
          "relation": "Drained by the Kunthipuzha into the Thuthapuzha-Bharathapuzha",
          "state": "Kerala"
        }
      ],
      "species": [
        {
          "name": "Lion-tailed Macaque",
          "iucn": "Endangered",
          "role": "Flagship species of Silent Valley"
        }
      ],
      "commonMistake": "Silent Valley's Kunthipuzha drains into the BHARATHAPUZHA system, not the Periyar. The Bharathapuzha flows WEST through the Palakkad Gap from Tamil Nadu into Kerala."
    },
    "staticFacts": [
      "Known as the Nila; central to Kerala's literature and performing arts.",
      "Heavily affected by sand mining, which has lowered the riverbed and reduced its flow."
    ],
    "similarPYQ": [
      "GEO-CDS1-2017-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-07",
    "slug": "mahanadi-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Mahanadi River",
    "aliases": [
      "Chitrotpala",
      "Mahananda of Odisha",
      "Hirakud River",
      "Sihawa River"
    ],
    "placeType": "Major East-Flowing Peninsular River (Delta-Forming)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Chhattisgarh, Odisha"
    },
    "lat": 21.52,
    "lng": 83.87,
    "shape": [
      [
        20.3,
        81.9
      ],
      [
        20.7,
        81.65
      ],
      [
        21.15,
        81.75
      ],
      [
        21.5,
        82.55
      ],
      [
        21.6,
        83.3
      ],
      [
        21.52,
        83.87
      ],
      [
        20.58,
        84.85
      ],
      [
        20.46,
        85.88
      ],
      [
        20.32,
        86.72
      ]
    ],
    "neighbours": [
      "Source: Near Sihawa, Dhamtari district (Chhattisgarh), at ~442 m",
      "Mouth: Bay of Bengal through a delta near False Point and Paradip (Odisha)"
    ],
    "riverDetails": {
      "length": "~851 km (NCERT)",
      "origin": "Near Sihawa, Dhamtari district (Chhattisgarh), at ~442 m",
      "mouth": "Bay of Bengal through a delta near False Point and Paradip (Odisha)",
      "sourceCoords": [
        20.3,
        81.9
      ],
      "mouthCoords": [
        20.32,
        86.72
      ],
      "states": {
        "flowsThrough": [
          "Chhattisgarh",
          "Odisha"
        ],
        "basinStates": [
          "Chhattisgarh",
          "Odisha",
          "Jharkhand",
          "Maharashtra",
          "Madhya Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Seonath River",
            "note": "Largest tributary; flows past Durg; joins near Shivrinarayan (Janjgir-Champa)"
          },
          {
            "name": "Hasdeo River",
            "note": "Drains the Korba coalfield and Hasdeo Arand forest; Minimata Bango dam"
          },
          {
            "name": "Mand River",
            "note": "Joins in Raigarh-Janjgir region"
          },
          {
            "name": "Ib River",
            "note": "Rises at Pandrapat, Jashpur (Chhattisgarh); joins the Hirakud reservoir"
          }
        ],
        "rightBank": [
          {
            "name": "Jonk River",
            "note": "Joins near Mahasamund-Shivrinarayan"
          },
          {
            "name": "Ong River",
            "note": "Joins near Sonepur (Odisha)"
          },
          {
            "name": "Tel River",
            "note": "Largest right-bank tributary; drains Kalahandi-Bolangir; joins at Sonepur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Pairi + Sondur",
          "sangam": "Rajim (Triveni)",
          "state": "Chhattisgarh"
        },
        {
          "tributary": "Seonath",
          "sangam": "Near Shivrinarayan",
          "state": "Chhattisgarh"
        },
        {
          "tributary": "Ib",
          "sangam": "Hirakud reservoir",
          "state": "Odisha"
        },
        {
          "tributary": "Tel",
          "sangam": "Sonepur",
          "state": "Odisha"
        }
      ],
      "towns": [
        {
          "name": "Rajim",
          "type": "Cultural",
          "significance": "'Prayag of Chhattisgarh' at the Mahanadi-Pairi-Sondur confluence",
          "state": "Chhattisgarh"
        },
        {
          "name": "Sambalpur",
          "type": "Economic / Cultural",
          "significance": "Hirakud dam; Samaleswari temple; Sambalpuri handloom",
          "state": "Odisha"
        },
        {
          "name": "Sonepur",
          "type": "Cultural",
          "significance": "Temple town at the Mahanadi-Tel confluence",
          "state": "Odisha"
        },
        {
          "name": "Cuttack",
          "type": "Historical",
          "significance": "Old capital at the head of the delta, between the Mahanadi and Kathajodi; silver filigree",
          "state": "Odisha"
        },
        {
          "name": "Paradip",
          "type": "Economic",
          "significance": "Major port near the river mouth",
          "state": "Odisha"
        }
      ],
      "dams": [
        {
          "name": "Ravishankar Sagar (Gangrel) Dam",
          "state": "Chhattisgarh",
          "type": "Main dam on the upper Mahanadi, Dhamtari"
        },
        {
          "name": "Minimata Bango Dam",
          "state": "Chhattisgarh",
          "type": "On the Hasdeo tributary; feeds the Korba power belt"
        },
        {
          "name": "Hirakud Dam",
          "state": "Odisha",
          "type": "Among the longest earthen dams in the world; irrigation, hydropower and delta flood control"
        },
        {
          "name": "Chiplima Power House",
          "state": "Odisha",
          "type": "Hydro station using Hirakud releases"
        },
        {
          "name": "Mahanadi Barrage (Jobra)",
          "state": "Odisha",
          "type": "Delta irrigation headworks at Cuttack"
        }
      ],
      "protectedAreas": [
        {
          "name": "Udanti-Sitanadi Tiger Reserve",
          "relation": "Sitanadi tributary catchment in the upper basin",
          "state": "Chhattisgarh"
        },
        {
          "name": "Debrigarh Wildlife Sanctuary",
          "relation": "On the Hirakud reservoir",
          "state": "Odisha"
        },
        {
          "name": "Satkosia Tiger Reserve",
          "relation": "Satkosia gorge of the Mahanadi; the only natural gharial habitat in Odisha",
          "state": "Odisha"
        },
        {
          "name": "Chilika Lake",
          "relation": "Fed by Mahanadi delta distributaries (Daya, Bhargavi); India's first Ramsar site (1981, with Keoladeo)",
          "state": "Odisha"
        }
      ],
      "species": [
        {
          "name": "Gharial",
          "iucn": "Critically Endangered",
          "role": "Small natural population in the Satkosia gorge"
        },
        {
          "name": "Irrawaddy Dolphin",
          "iucn": "Endangered",
          "role": "Lagoon population in Chilika"
        }
      ],
      "commonMistake": "SEONATH, Hasdeo, Mand and Ib are LEFT-bank tributaries; Tel, Ong and Jonk are RIGHT-bank. West Bengal is NOT in the Mahanadi basin. The Ib rises in CHHATTISGARH, not Jharkhand. Mandira Dam is on the Sankh (BRAHMANI basin), not the Mahanadi."
    },
    "staticFacts": [
      "NCERT: about 53% of its basin lies in Madhya Pradesh-Chhattisgarh and 47% in Odisha.",
      "Its delta merges with those of the Brahmani and Baitarani to form one composite delta on the Odisha coast.",
      "The Mahanadi Water Disputes Tribunal (2018) is hearing the Odisha-Chhattisgarh dispute over barrages in the upper basin."
    ],
    "similarPYQ": [
      "GEO-UPSC-2016-03",
      "UPSC-2025-17",
      "GEO-CDS1-2017-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-05",
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
      "Vriddha Ganga",
      "Gautami",
      "Godavari Delta River"
    ],
    "placeType": "Largest Peninsular River ('Dakshin Ganga')",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Maharashtra, Telangana, Andhra Pradesh"
    },
    "lat": 18.97,
    "lng": 78.33,
    "shape": [
      [
        19.93,
        73.53
      ],
      [
        19.98,
        73.8
      ],
      [
        19.85,
        74.48
      ],
      [
        19.48,
        75.38
      ],
      [
        19.15,
        77.32
      ],
      [
        18.97,
        78.33
      ],
      [
        18.88,
        79.92
      ],
      [
        17.55,
        81.28
      ],
      [
        17.4,
        81.5
      ],
      [
        17.25,
        81.65
      ],
      [
        17,
        81.78
      ],
      [
        16.33,
        81.73
      ]
    ],
    "neighbours": [
      "Source: Brahmagiri hills at Trimbakeshwar, Nashik district (Maharashtra), at ~1,067 m",
      "Mouth: Bay of Bengal through a large delta in the East and West Godavari districts (And"
    ],
    "riverDetails": {
      "length": "~1,465 km",
      "origin": "Brahmagiri hills at Trimbakeshwar, Nashik district (Maharashtra), at ~1,067 m",
      "mouth": "Bay of Bengal through a large delta in the East and West Godavari districts (Andhra Pradesh), near Antarvedi and Yanam",
      "sourceCoords": [
        19.93,
        73.53
      ],
      "mouthCoords": [
        16.33,
        81.73
      ],
      "states": {
        "flowsThrough": [
          "Maharashtra",
          "Telangana",
          "Andhra Pradesh"
        ],
        "basinStates": [
          "Maharashtra",
          "Telangana",
          "Andhra Pradesh",
          "Chhattisgarh",
          "Odisha",
          "Madhya Pradesh",
          "Karnataka",
          "Puducherry (Yanam)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Kadva River",
            "note": "Joins near Nandur Madhmeshwar, Nashik"
          },
          {
            "name": "Purna River",
            "note": "Drains Marathwada; joins near Jambulbet, Parbhani"
          },
          {
            "name": "Pranhita River",
            "note": "Formed by the Wardha (with Penganga) and Wainganga; largest tributary by basin; joins at Kaleshwaram"
          },
          {
            "name": "Indravati River",
            "note": "Rises in Kalahandi (Odisha); flows through Bastar; joins at the Maharashtra-Telangana-Chhattisgarh tri-junction"
          },
          {
            "name": "Sabari River",
            "note": "With the Sileru; forms part of the Odisha-Chhattisgarh boundary; joins at Kunavaram (AP)"
          }
        ],
        "rightBank": [
          {
            "name": "Darna River",
            "note": "From the Igatpuri ghats; joins near Nashik"
          },
          {
            "name": "Pravara River",
            "note": "From Bhandardara; joins at Pravara Sangam (Ahmednagar)"
          },
          {
            "name": "Manjira River",
            "note": "Longest right-bank tributary; Nizam Sagar dam; joins near Kandakurthi (Nizamabad)"
          },
          {
            "name": "Manair River",
            "note": "Drains Karimnagar; Lower Manair dam"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Kadva",
          "sangam": "Nandur Madhmeshwar, Nashik",
          "state": "Maharashtra"
        },
        {
          "tributary": "Pravara",
          "sangam": "Pravara Sangam (Toka), Ahmednagar",
          "state": "Maharashtra"
        },
        {
          "tributary": "Purna",
          "sangam": "Near Jambulbet, Parbhani",
          "state": "Maharashtra"
        },
        {
          "tributary": "Manjira",
          "sangam": "Near Kandakurthi, Nizamabad",
          "state": "Telangana"
        },
        {
          "tributary": "Pranhita",
          "sangam": "Kaleshwaram",
          "state": "Telangana"
        },
        {
          "tributary": "Indravati",
          "sangam": "Maharashtra-Telangana-Chhattisgarh tri-junction",
          "state": "Telangana / Chhattisgarh / Maharashtra"
        },
        {
          "tributary": "Sabari",
          "sangam": "Kunavaram",
          "state": "Andhra Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Trimbakeshwar",
          "type": "Cultural",
          "significance": "Source; Jyotirlinga; Simhastha Kumbh with Nashik",
          "state": "Maharashtra"
        },
        {
          "name": "Nashik",
          "type": "Cultural / Economic",
          "significance": "Kumbh Mela city; India's main wine-grape region",
          "state": "Maharashtra"
        },
        {
          "name": "Paithan",
          "type": "Historical",
          "significance": "Satavahana capital Pratishthana; Paithani silk; Jayakwadi dam",
          "state": "Maharashtra"
        },
        {
          "name": "Nanded",
          "type": "Cultural",
          "significance": "Takht Sachkhand Sri Hazur Sahib (Guru Gobind Singh)",
          "state": "Maharashtra"
        },
        {
          "name": "Basara",
          "type": "Cultural",
          "significance": "Gnana Saraswati temple",
          "state": "Telangana"
        },
        {
          "name": "Bhadrachalam",
          "type": "Cultural",
          "significance": "Sri Sita Ramachandra Swamy temple",
          "state": "Telangana"
        },
        {
          "name": "Rajahmundry (Rajamahendravaram)",
          "type": "Cultural",
          "significance": "Head of the delta; Godavari Pushkaram",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Jayakwadi Dam (Nath Sagar)",
          "state": "Maharashtra",
          "type": "Major irrigation dam at Paithan"
        },
        {
          "name": "Sriram Sagar Project (Pochampad)",
          "state": "Telangana",
          "type": "Major irrigation dam in Nizamabad"
        },
        {
          "name": "Kaleshwaram Lift Irrigation Project",
          "state": "Telangana",
          "type": "Multi-stage lift scheme from the Pranhita-Godavari; Medigadda (Laxmi) barrage piers sank in October 2023"
        },
        {
          "name": "Polavaram Project",
          "state": "Andhra Pradesh",
          "type": "National multipurpose project; submergence affects Odisha, Chhattisgarh and Telangana"
        },
        {
          "name": "Sir Arthur Cotton Barrage (Dowleswaram)",
          "state": "Andhra Pradesh",
          "type": "Delta irrigation headworks near Rajahmundry"
        }
      ],
      "protectedAreas": [
        {
          "name": "Nandur Madhmeshwar Bird Sanctuary",
          "relation": "At the Godavari-Kadva confluence; Maharashtra's first Ramsar site (2019)",
          "state": "Maharashtra"
        },
        {
          "name": "Tadoba-Andhari Tiger Reserve",
          "relation": "Wardha-Wainganga (Pranhita) catchment",
          "state": "Maharashtra"
        },
        {
          "name": "Indravati Tiger Reserve",
          "relation": "Indravati catchment in Bastar",
          "state": "Chhattisgarh"
        },
        {
          "name": "Papikonda National Park",
          "relation": "Papi Hills gorge where the Godavari cuts the Eastern Ghats",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Coringa Wildlife Sanctuary",
          "relation": "Godavari delta mangroves near Kakinada",
          "state": "Andhra Pradesh"
        }
      ],
      "species": [
        {
          "name": "Bengal Tiger",
          "iucn": "Endangered",
          "role": "Tadoba, Indravati and Kawal reserves in the basin"
        },
        {
          "name": "Fishing Cat",
          "iucn": "Vulnerable",
          "role": "Mangrove wetlands of Coringa"
        }
      ],
      "commonMistake": "PURNA, PRANHITA (Wardha + Wainganga), INDRAVATI and SABARI are LEFT-bank (north) tributaries; PRAVARA, MANJIRA and MANAIR are RIGHT-bank. The Indravati joins at the tri-junction, NOT at Bhadrachalam. The Godavari basin is the LARGEST among PENINSULAR rivers, not 'second-largest in India' (the Ganga and Indus basins are bigger)."
    },
    "staticFacts": [
      "The longest Peninsular river; called the 'Dakshin Ganga' or 'Vriddha Ganga'.",
      "Its basin (~3,12,812 sq km) lies about half in Maharashtra.",
      "It cuts a gorge through the Eastern Ghats at the Papi Hills before forming its delta.",
      "Kolleru Lake, a Ramsar site, lies between the Godavari and Krishna deltas."
    ],
    "similarPYQ": [
      "GEO-UPSC-2015-07",
      "GEO-UPSC-2016-03",
      "GEO-CDS2-2021-08",
      "GEO-CDS2-2019-06"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-08",
    "slug": "krishna-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Krishna River",
    "aliases": [
      "Krishnaveni",
      "Kanhar",
      "Mahabaleshwar River",
      "Prakasam River"
    ],
    "placeType": "Second-Largest East-Flowing Peninsular River",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Maharashtra, Karnataka, Telangana, Andhra Pradesh"
    },
    "lat": 16.33,
    "lng": 77.7,
    "shape": [
      [
        17.92,
        73.66
      ],
      [
        17.3,
        74.18
      ],
      [
        16.85,
        74.58
      ],
      [
        16.58,
        74.6
      ],
      [
        16.33,
        75.88
      ],
      [
        16.15,
        76.55
      ],
      [
        16.4,
        77.35
      ],
      [
        16.33,
        77.7
      ],
      [
        15.95,
        78.25
      ],
      [
        16.08,
        78.9
      ],
      [
        16.57,
        79.31
      ],
      [
        16.52,
        80.62
      ],
      [
        15.85,
        81.05
      ]
    ],
    "neighbours": [
      "Source: Spring near Mahabaleshwar (Jor village), Satara district (Maharashtra), at ~1,33",
      "Mouth: Bay of Bengal through a delta near Hamsaladeevi, Krishna district (Andhra Prades"
    ],
    "riverDetails": {
      "length": "~1,400 km",
      "origin": "Spring near Mahabaleshwar (Jor village), Satara district (Maharashtra), at ~1,337 m",
      "mouth": "Bay of Bengal through a delta near Hamsaladeevi, Krishna district (Andhra Pradesh)",
      "sourceCoords": [
        17.92,
        73.66
      ],
      "mouthCoords": [
        15.85,
        81.05
      ],
      "states": {
        "flowsThrough": [
          "Maharashtra",
          "Karnataka",
          "Telangana",
          "Andhra Pradesh"
        ],
        "basinStates": [
          "Maharashtra",
          "Karnataka",
          "Telangana",
          "Andhra Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Bhima River",
            "note": "Largest left-bank tributary; from Bhimashankar; joins near Raichur"
          },
          {
            "name": "Dindi River",
            "note": "Telangana tributary joining near Nagarjuna Sagar"
          },
          {
            "name": "Musi River",
            "note": "Flows through Hyderabad; joins near Wazirabad (Nalgonda)"
          },
          {
            "name": "Paleru and Munneru Rivers",
            "note": "Telangana-AP tributaries of the lower course"
          }
        ],
        "rightBank": [
          {
            "name": "Venna River",
            "note": "Joins at Sangam Mahuli, Satara"
          },
          {
            "name": "Koyna River",
            "note": "Koyna dam; joins at Karad (Preeti Sangam)"
          },
          {
            "name": "Warna and Panchganga Rivers",
            "note": "Join near Sangli-Kolhapur (Panchganga at Narsobawadi)"
          },
          {
            "name": "Dudhganga River",
            "note": "Drains southern Kolhapur"
          },
          {
            "name": "Ghataprabha River",
            "note": "Gokak Falls; joins in Bagalkot district"
          },
          {
            "name": "Malaprabha River",
            "note": "Joins at Kudalasangama, Bagalkot"
          },
          {
            "name": "Tungabhadra River",
            "note": "Largest right-bank tributary; joins near Alampur-Sangameswaram"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Venna",
          "sangam": "Sangam Mahuli, Satara",
          "state": "Maharashtra"
        },
        {
          "tributary": "Koyna",
          "sangam": "Karad (Preeti Sangam)",
          "state": "Maharashtra"
        },
        {
          "tributary": "Panchganga",
          "sangam": "Narsobawadi, Kolhapur",
          "state": "Maharashtra"
        },
        {
          "tributary": "Malaprabha",
          "sangam": "Kudalasangama, Bagalkot",
          "state": "Karnataka"
        },
        {
          "tributary": "Bhima",
          "sangam": "Near Raichur (Kadlur)",
          "state": "Karnataka / Telangana"
        },
        {
          "tributary": "Tungabhadra",
          "sangam": "Near Alampur-Sangameswaram",
          "state": "Telangana / Andhra Pradesh"
        },
        {
          "tributary": "Musi",
          "sangam": "Near Wazirabad, Nalgonda",
          "state": "Telangana"
        }
      ],
      "towns": [
        {
          "name": "Mahabaleshwar",
          "type": "Cultural",
          "significance": "Source; Panchganga temple (Krishna, Koyna, Venna, Savitri, Gayatri)",
          "state": "Maharashtra"
        },
        {
          "name": "Sangli",
          "type": "Economic",
          "significance": "Sugar and turmeric belt",
          "state": "Maharashtra"
        },
        {
          "name": "Kudalasangama",
          "type": "Cultural",
          "significance": "Aikya Mantapa of Basavanna",
          "state": "Karnataka"
        },
        {
          "name": "Srisailam",
          "type": "Cultural",
          "significance": "Mallikarjuna Jyotirlinga above the Srisailam dam",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Nagarjunakonda",
          "type": "Historical",
          "significance": "Ikshvaku-era Buddhist site, relocated to an island in the reservoir",
          "state": "Telangana / Andhra Pradesh"
        },
        {
          "name": "Amaravati",
          "type": "Historical / Administrative",
          "significance": "Satavahana-era Buddhist stupa; AP capital region",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Vijayawada",
          "type": "Economic",
          "significance": "Head of the delta; Prakasam barrage; Kanaka Durga temple",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Koyna Dam",
          "state": "Maharashtra",
          "type": "On the Koyna; Maharashtra's largest hydro scheme; Koynanagar earthquake (1967) linked to reservoir-induced seismicity"
        },
        {
          "name": "Almatti Dam (Lal Bahadur Shastri Sagar)",
          "state": "Karnataka",
          "type": "Upper Krishna Project, with Narayanpur downstream"
        },
        {
          "name": "Jurala (Priyadarshini) Project",
          "state": "Telangana",
          "type": "First major dam on entering Telangana"
        },
        {
          "name": "Srisailam Dam",
          "state": "Andhra Pradesh / Telangana border",
          "type": "Hydropower and storage in the Nallamala gorge"
        },
        {
          "name": "Nagarjuna Sagar Dam",
          "state": "Telangana / Andhra Pradesh border",
          "type": "Among the largest masonry dams in the world"
        },
        {
          "name": "Prakasam Barrage",
          "state": "Andhra Pradesh",
          "type": "Delta irrigation headworks at Vijayawada"
        }
      ],
      "protectedAreas": [
        {
          "name": "Koyna Wildlife Sanctuary",
          "relation": "Koyna catchment; part of the Sahyadri Tiger Reserve with Chandoli",
          "state": "Maharashtra"
        },
        {
          "name": "Nagarjunsagar-Srisailam Tiger Reserve",
          "relation": "Nallamala forests along the Krishna gorge; largest tiger reserve in India",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Krishna Wildlife Sanctuary",
          "relation": "Delta mangroves",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Kolleru Lake",
          "relation": "Freshwater lake between the Krishna and Godavari deltas; Ramsar site (2002)",
          "state": "Andhra Pradesh"
        }
      ],
      "species": [
        {
          "name": "Bengal Tiger",
          "iucn": "Endangered",
          "role": "Nagarjunsagar-Srisailam reserve"
        },
        {
          "name": "Fishing Cat",
          "iucn": "Vulnerable",
          "role": "Delta mangroves of the Krishna Wildlife Sanctuary"
        }
      ],
      "commonMistake": "BHIMA and MUSI are LEFT-bank tributaries; KOYNA, GHATAPRABHA, MALAPRABHA and TUNGABHADRA are RIGHT-bank. ALAMPUR is in TELANGANA, not AP. PULICAT lake is near Chennai on the AP-TN border, not near the Krishna delta. DANDELI is in the Kali basin (west-flowing), not the Krishna."
    },
    "staticFacts": [
      "Its basin (~2,58,948 sq km) is shared mainly by Karnataka, Maharashtra, Telangana and Andhra Pradesh.",
      "For a stretch through the Nallamala hills it forms the Telangana-Andhra Pradesh boundary.",
      "Water sharing is governed by the Krishna Water Disputes Tribunals (KWDT-I, Bachawat, 1976; KWDT-II, Brijesh Kumar)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2023-07",
      "GEO-UPSC-2016-03",
      "GEO-CDS2-2021-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-08B",
    "slug": "bhima-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Bhima River",
    "aliases": [
      "Chandrabhaga",
      "Bhimashankar River",
      "Pandharpur River",
      "Ujani River"
    ],
    "placeType": "Major Left-Bank Tributary of Krishna",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Maharashtra, Karnataka, Telangana (border)"
    },
    "lat": 17.68,
    "lng": 75.32,
    "shape": [
      [
        19.07,
        73.53
      ],
      [
        18.67,
        74.1
      ],
      [
        18.52,
        74.3
      ],
      [
        18.07,
        75.12
      ],
      [
        17.68,
        75.32
      ],
      [
        17.3,
        76
      ],
      [
        16.4,
        77.35
      ]
    ],
    "neighbours": [
      "Source: Bhimashankar hills of the Sahyadri, Pune district (Maharashtra)",
      "Mouth: Joins the Krishna near Raichur (Kadlur), on the Karnataka-Telangana border"
    ],
    "riverDetails": {
      "length": "~861 km",
      "origin": "Bhimashankar hills of the Sahyadri, Pune district (Maharashtra)",
      "mouth": "Joins the Krishna near Raichur (Kadlur), on the Karnataka-Telangana border",
      "sourceCoords": [
        19.07,
        73.53
      ],
      "mouthCoords": [
        16.4,
        77.35
      ],
      "states": {
        "flowsThrough": [
          "Maharashtra",
          "Karnataka"
        ],
        "basinStates": [
          "Maharashtra",
          "Karnataka",
          "Telangana"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Ghod River",
            "note": "From Ambegaon (Pune); Dimbhe dam"
          },
          {
            "name": "Indrayani River",
            "note": "Flows past Alandi and Dehu; joins at Tulapur"
          },
          {
            "name": "Sina River",
            "note": "Drains Ahmednagar-Solapur; joins in Solapur district"
          },
          {
            "name": "Kagina River",
            "note": "Joins in Kalaburagi district"
          }
        ],
        "rightBank": [
          {
            "name": "Mula-Mutha River",
            "note": "Flows through Pune; joins at Ranjangaon Sandas"
          },
          {
            "name": "Nira River",
            "note": "From Bhor; joins at Nira Narsingpur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Indrayani + Bhama",
          "sangam": "Tulapur, Pune",
          "state": "Maharashtra"
        },
        {
          "tributary": "Nira",
          "sangam": "Nira Narsingpur",
          "state": "Maharashtra"
        },
        {
          "tributary": "Krishna",
          "sangam": "Near Raichur (Kadlur)",
          "state": "Karnataka / Telangana"
        }
      ],
      "towns": [
        {
          "name": "Bhimashankar",
          "type": "Cultural",
          "significance": "Source; Jyotirlinga temple",
          "state": "Maharashtra"
        },
        {
          "name": "Alandi and Dehu",
          "type": "Cultural",
          "significance": "Sant Dnyaneshwar and Sant Tukaram, on the Indrayani",
          "state": "Maharashtra"
        },
        {
          "name": "Koregaon Bhima",
          "type": "Historical",
          "significance": "Battle of Koregaon (1818)",
          "state": "Maharashtra"
        },
        {
          "name": "Pandharpur",
          "type": "Cultural",
          "significance": "Vitthal-Rukmini temple; river called Chandrabhaga here; Ashadhi Wari",
          "state": "Maharashtra"
        },
        {
          "name": "Ganagapur",
          "type": "Cultural",
          "significance": "Dattatreya shrine",
          "state": "Karnataka"
        }
      ],
      "dams": [
        {
          "name": "Ujani Dam",
          "state": "Maharashtra",
          "type": "Largest reservoir in the Bhima basin (Solapur); irrigation for the drought-prone east"
        },
        {
          "name": "Chaskaman and Bhama Askhed Dams",
          "state": "Maharashtra",
          "type": "Upper basin dams in Pune district"
        }
      ],
      "protectedAreas": [
        {
          "name": "Bhimashankar Wildlife Sanctuary",
          "relation": "Source forests; habitat of the Indian giant squirrel (Shekru), Maharashtra's state animal",
          "state": "Maharashtra"
        },
        {
          "name": "Great Indian Bustard Sanctuary",
          "relation": "Grasslands around Nannaj, Solapur, in the Bhima-Sina interfluve",
          "state": "Maharashtra"
        }
      ],
      "species": [
        {
          "name": "Great Indian Bustard",
          "iucn": "Critically Endangered",
          "role": "Historic grassland habitat near Solapur"
        },
        {
          "name": "Indian Giant Squirrel",
          "iucn": "Least Concern",
          "role": "State animal of Maharashtra; Bhimashankar forests"
        }
      ],
      "commonMistake": "The Bhima is a LEFT-bank tributary of the Krishna. At Pandharpur it is called the CHANDRABHAGA (not to be confused with the Chenab's old name). Kalaburagi and Gulbarga are the SAME district."
    },
    "staticFacts": [
      "Flows across the drought-prone black-soil Deccan; Ujani is its key storage.",
      "The Pune metropolitan region lies in its upper basin through the Mula-Mutha and Indrayani."
    ],
    "similarPYQ": [
      "ART-CDS1-2023-01"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-08C",
    "slug": "tungabhadra-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Tungabhadra River",
    "aliases": [
      "Pampa",
      "Tunga-Bhadra",
      "Hampi River",
      "Vijayanagara River"
    ],
    "placeType": "Largest Right-Bank Tributary of Krishna",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka, Andhra Pradesh, Telangana (border)"
    },
    "lat": 15.33,
    "lng": 76.46,
    "shape": [
      [
        13.2,
        75.2
      ],
      [
        14,
        75.67
      ],
      [
        14.8,
        75.85
      ],
      [
        15.28,
        76.35
      ],
      [
        15.33,
        76.46
      ],
      [
        15.88,
        77.05
      ],
      [
        15.95,
        78.25
      ]
    ],
    "neighbours": [
      "Source: Formed at Koodli near Shivamogga by the Tunga and the Bhadra, both rising at Gan",
      "Mouth: Joins the Krishna near Alampur-Sangameswaram (Telangana-AP border)"
    ],
    "riverDetails": {
      "length": "~531 km",
      "origin": "Formed at Koodli near Shivamogga by the Tunga and the Bhadra, both rising at Gangamoola, Varaha Parvatha (Kudremukh), Chikkamagaluru district (Karnataka)",
      "mouth": "Joins the Krishna near Alampur-Sangameswaram (Telangana-AP border)",
      "sourceCoords": [
        13.2,
        75.2
      ],
      "mouthCoords": [
        15.95,
        78.25
      ],
      "states": {
        "flowsThrough": [
          "Karnataka",
          "Andhra Pradesh"
        ],
        "basinStates": [
          "Karnataka",
          "Andhra Pradesh",
          "Telangana"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Varada River",
            "note": "Rises near Sagar; joins in Haveri district"
          }
        ],
        "rightBank": [
          {
            "name": "Vedavathi (Hagari) River",
            "note": "Drains the dry Chitradurga-Ballari plateau; joins near Siruguppa"
          },
          {
            "name": "Handri River",
            "note": "Joins at Kurnool"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Tunga + Bhadra",
          "sangam": "Koodli, Shivamogga",
          "state": "Karnataka"
        },
        {
          "tributary": "Krishna",
          "sangam": "Near Alampur-Sangameswaram",
          "state": "Telangana / Andhra Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Sringeri",
          "type": "Cultural",
          "significance": "Sharada Peetham of Adi Shankaracharya, on the Tunga",
          "state": "Karnataka"
        },
        {
          "name": "Hampi",
          "type": "Historical",
          "significance": "Vijayanagara capital; UNESCO World Heritage Site",
          "state": "Karnataka"
        },
        {
          "name": "Hosapete",
          "type": "Infrastructure",
          "significance": "Tungabhadra Dam (Pampa Sagar)",
          "state": "Karnataka"
        },
        {
          "name": "Mantralayam",
          "type": "Cultural",
          "significance": "Sri Raghavendra Swamy Math",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Kurnool",
          "type": "Administrative",
          "significance": "At the Tungabhadra-Handri confluence",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Bhadra Dam (Lakkavalli)",
          "state": "Karnataka",
          "type": "On the Bhadra headstream"
        },
        {
          "name": "Tungabhadra Dam",
          "state": "Karnataka",
          "type": "Inter-state dam at Hosapete serving Karnataka, AP and Telangana; a crest gate was washed away in August 2024"
        },
        {
          "name": "Sunkesula Barrage",
          "state": "Andhra Pradesh",
          "type": "Feeds the Kurnool-Cuddapah canal"
        }
      ],
      "protectedAreas": [
        {
          "name": "Kudremukh National Park",
          "relation": "Source of the Tunga and Bhadra",
          "state": "Karnataka"
        },
        {
          "name": "Bhadra Tiger Reserve",
          "relation": "Bhadra catchment",
          "state": "Karnataka"
        },
        {
          "name": "Daroji Sloth Bear Sanctuary",
          "relation": "Rocky hills near Hampi",
          "state": "Karnataka"
        },
        {
          "name": "Tungabhadra Otter Conservation Reserve",
          "relation": "Hampi stretch; India's first otter conservation reserve (2015)",
          "state": "Karnataka"
        }
      ],
      "species": [
        {
          "name": "Smooth-coated Otter",
          "iucn": "Vulnerable",
          "role": "Flagship of the Tungabhadra Otter Reserve"
        },
        {
          "name": "Sloth Bear",
          "iucn": "Vulnerable",
          "role": "Daroji sanctuary near Hampi"
        }
      ],
      "commonMistake": "The Tungabhadra is the LARGEST RIGHT-bank tributary of the Krishna (the PDF had it as left-bank). It is formed at KOODLI; Gangamoola is the source of its two headstreams."
    },
    "staticFacts": [
      "The saying 'Tunga pana, Ganga snana' praises the sweetness of Tunga water.",
      "Its middle course through the Hampi boulder landscape is a classic granite-tor terrain."
    ],
    "similarPYQ": [
      "GEO-UPSC-2022-03",
      "GEO-UPSC-2016-03"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-06",
    "slug": "cauvery-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Cauvery (Kaveri) River",
    "aliases": [
      "Kaveri",
      "Dakshina Ganga of Deep South",
      "Ponni",
      "Thanjavur River"
    ],
    "placeType": "East-Flowing Peninsular River Fed by Both Monsoons",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka, Tamil Nadu"
    },
    "lat": 11.8,
    "lng": 77.8,
    "shape": [
      [
        12.39,
        75.49
      ],
      [
        12.42,
        75.95
      ],
      [
        12.43,
        76.57
      ],
      [
        12.42,
        76.68
      ],
      [
        12.28,
        76.9
      ],
      [
        12.28,
        77.17
      ],
      [
        12.12,
        77.78
      ],
      [
        11.8,
        77.8
      ],
      [
        11.35,
        77.72
      ],
      [
        11.08,
        78.15
      ],
      [
        10.86,
        78.69
      ],
      [
        10.78,
        79.13
      ],
      [
        11.14,
        79.86
      ]
    ],
    "neighbours": [
      "Source: Talakaveri, Brahmagiri hills, Kodagu district (Karnataka), at ~1,341 m",
      "Mouth: Bay of Bengal near Poompuhar (Kaveripoompattinam), Mayiladuthurai district (Tami"
    ],
    "riverDetails": {
      "length": "~805 km",
      "origin": "Talakaveri, Brahmagiri hills, Kodagu district (Karnataka), at ~1,341 m",
      "mouth": "Bay of Bengal near Poompuhar (Kaveripoompattinam), Mayiladuthurai district (Tamil Nadu), through the Thanjavur delta",
      "sourceCoords": [
        12.39,
        75.49
      ],
      "mouthCoords": [
        11.14,
        79.86
      ],
      "states": {
        "flowsThrough": [
          "Karnataka",
          "Tamil Nadu"
        ],
        "basinStates": [
          "Karnataka",
          "Tamil Nadu",
          "Kerala",
          "Puducherry (Karaikal)"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Harangi River",
            "note": "Harangi dam, Kodagu"
          },
          {
            "name": "Hemavati River",
            "note": "Largest left-bank tributary; Gorur dam; joins at the KRS reservoir"
          },
          {
            "name": "Shimsha River",
            "note": "Drains Tumakuru-Mandya"
          },
          {
            "name": "Arkavathi River",
            "note": "Drains the Bengaluru region; joins at Sangama, Kanakapura"
          }
        ],
        "rightBank": [
          {
            "name": "Lakshmana Tirtha River",
            "note": "From Kodagu; joins at the KRS reservoir"
          },
          {
            "name": "Kabini River",
            "note": "Rises in Wayanad (Kerala); joins at T. Narasipura"
          },
          {
            "name": "Suvarnavati River",
            "note": "Drains Chamarajanagar"
          },
          {
            "name": "Bhavani River",
            "note": "From the Nilgiris (with the Moyar); joins at Bhavani, Erode"
          },
          {
            "name": "Noyyal River",
            "note": "Flows past Coimbatore and Tiruppur; joins near Karur"
          },
          {
            "name": "Amaravati River",
            "note": "From the Anamalai hills; joins near Karur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Kannike + Sujyoti",
          "sangam": "Bhagamandala (Triveni)",
          "state": "Karnataka"
        },
        {
          "tributary": "Kabini",
          "sangam": "Tirumakudalu Narasipura",
          "state": "Karnataka"
        },
        {
          "tributary": "Arkavathi",
          "sangam": "Sangama, Kanakapura",
          "state": "Karnataka"
        },
        {
          "tributary": "Bhavani",
          "sangam": "Bhavani (Kooduthurai), Erode",
          "state": "Tamil Nadu"
        },
        {
          "tributary": "Amaravati",
          "sangam": "Near Karur",
          "state": "Tamil Nadu"
        }
      ],
      "towns": [
        {
          "name": "Talakaveri and Bhagamandala",
          "type": "Cultural",
          "significance": "Source shrine and triveni confluence",
          "state": "Karnataka"
        },
        {
          "name": "Srirangapatna",
          "type": "Historical",
          "significance": "River island; Tipu Sultan's capital; Ranganathaswamy temple",
          "state": "Karnataka"
        },
        {
          "name": "Shivanasamudra",
          "type": "Geological / Infrastructure",
          "significance": "Gaganachukki and Bharachukki falls; Asia's first hydroelectric station (1902)",
          "state": "Karnataka"
        },
        {
          "name": "Hogenakkal",
          "type": "Tourism",
          "significance": "Falls on the Karnataka-Tamil Nadu border",
          "state": "Tamil Nadu"
        },
        {
          "name": "Tiruchirappalli (Srirangam)",
          "type": "Cultural",
          "significance": "Srirangam island between the Cauvery and Kollidam",
          "state": "Tamil Nadu"
        },
        {
          "name": "Thanjavur and Kumbakonam",
          "type": "Cultural",
          "significance": "Delta temple towns; Brihadeeswara (UNESCO); 'Rice bowl of Tamil Nadu'",
          "state": "Tamil Nadu"
        }
      ],
      "dams": [
        {
          "name": "Krishnaraja Sagar (KRS) Dam",
          "state": "Karnataka",
          "type": "Main Karnataka reservoir near Mysuru; Brindavan Gardens"
        },
        {
          "name": "Kabini Dam",
          "state": "Karnataka",
          "type": "On the Kabini near the Nagarhole-Bandipur boundary"
        },
        {
          "name": "Mettur Dam (Stanley Reservoir)",
          "state": "Tamil Nadu",
          "type": "Main Tamil Nadu reservoir (1934)"
        },
        {
          "name": "Grand Anicut (Kallanai)",
          "state": "Tamil Nadu",
          "type": "Built by Karikala Chola (c. 2nd century CE); among the oldest water-regulation structures still in use"
        },
        {
          "name": "Upper Anicut (Mukkombu)",
          "state": "Tamil Nadu",
          "type": "Where the Cauvery splits into the Cauvery and the Kollidam (Coleroon)"
        },
        {
          "name": "Mekedatu Project",
          "state": "Karnataka",
          "type": "Proposed balancing reservoir near the TN border; opposed by Tamil Nadu"
        }
      ],
      "protectedAreas": [
        {
          "name": "Nagarhole and Bandipur Tiger Reserves",
          "relation": "Kabini catchment",
          "state": "Karnataka"
        },
        {
          "name": "Ranganathittu Bird Sanctuary",
          "relation": "River islets near Srirangapatna; Ramsar site (2022)",
          "state": "Karnataka"
        },
        {
          "name": "Cauvery Wildlife Sanctuary",
          "relation": "Gorge stretch along the Karnataka-TN border",
          "state": "Karnataka"
        },
        {
          "name": "Mudumalai and Sathyamangalam Tiger Reserves",
          "relation": "Moyar-Bhavani catchment",
          "state": "Tamil Nadu"
        },
        {
          "name": "Point Calimere (Kodiakkarai)",
          "relation": "Southern edge of the delta; Ramsar site (2002)",
          "state": "Tamil Nadu"
        }
      ],
      "species": [
        {
          "name": "Hump-backed Mahseer",
          "iucn": "Critically Endangered",
          "role": "Giant fish endemic to the Cauvery basin"
        },
        {
          "name": "Asian Elephant",
          "iucn": "Endangered",
          "role": "Nilgiri landscape around Nagarhole-Bandipur-Mudumalai"
        }
      ],
      "commonMistake": "HARANGI, HEMAVATI, SHIMSHA and ARKAVATHI are LEFT-bank; KABINI, BHAVANI, NOYYAL and AMARAVATI are RIGHT-bank. The Cauvery is nearly perennial because its upper catchment gets the SOUTH-WEST monsoon and its lower catchment the NORTH-EAST monsoon."
    },
    "staticFacts": [
      "NCERT: it is almost a perennial river with comparatively little fluctuation in flow, because of rain from both monsoons.",
      "It forms three famous river islands: Srirangapatna, Shivanasamudra and Srirangam.",
      "After the 2018 Supreme Court verdict on the Cauvery Water Disputes Tribunal award, the Cauvery Water Management Authority (CWMA) and Regulation Committee (CWRC) oversee water releases."
    ],
    "similarPYQ": [
      "ENV-UPSC-2020-13",
      "ENV-UPSC-2019-09",
      "GEO-UPSC-2016-03"
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
    "place": "Pennar (Penna) River",
    "aliases": [
      "Penna",
      "Pinakini",
      "Gandikota River",
      "Nandi Hills River"
    ],
    "placeType": "East-Flowing Rain-Shadow River (Gandikota Canyon)",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka, Andhra Pradesh"
    },
    "lat": 14.82,
    "lng": 78.28,
    "shape": [
      [
        13.37,
        77.68
      ],
      [
        13.8,
        77.5
      ],
      [
        14.68,
        77.6
      ],
      [
        14.82,
        78.28
      ],
      [
        14.75,
        78.48
      ],
      [
        14.47,
        78.82
      ],
      [
        14.6,
        80.18
      ]
    ],
    "neighbours": [
      "Source: Nandi hills, Chikkaballapur district (Karnataka)",
      "Mouth: Bay of Bengal near Nellore (Andhra Pradesh)"
    ],
    "riverDetails": {
      "length": "~597 km",
      "origin": "Nandi hills, Chikkaballapur district (Karnataka)",
      "mouth": "Bay of Bengal near Nellore (Andhra Pradesh)",
      "sourceCoords": [
        13.37,
        77.68
      ],
      "mouthCoords": [
        14.6,
        80.18
      ],
      "states": {
        "flowsThrough": [
          "Karnataka",
          "Andhra Pradesh"
        ],
        "basinStates": [
          "Karnataka",
          "Andhra Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Kunderu River",
            "note": "Largest tributary; drains Kurnool-Nandyal; joins near Kamalapuram"
          },
          {
            "name": "Sagileru River",
            "note": "Joins in the Kadapa region"
          }
        ],
        "rightBank": [
          {
            "name": "Chitravathi River",
            "note": "Drains Anantapur; joins near Gandikota"
          },
          {
            "name": "Papagni River",
            "note": "Drains Kadapa district"
          },
          {
            "name": "Cheyyeru River",
            "note": "Joins near Sidhavatam"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Kunderu",
          "sangam": "Near Kamalapuram, Kadapa",
          "state": "Andhra Pradesh"
        }
      ],
      "towns": [
        {
          "name": "Gandikota",
          "type": "Geological / Historical",
          "significance": "Gorge called the 'Grand Canyon of India'; medieval hill fort",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Nellore",
          "type": "Economic",
          "significance": "Delta town; rice and aquaculture",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Mylavaram Dam",
          "state": "Andhra Pradesh",
          "type": "Near Gandikota (Kadapa)"
        },
        {
          "name": "Somasila Dam",
          "state": "Andhra Pradesh",
          "type": "Largest reservoir on the Pennar (Nellore district)"
        },
        {
          "name": "Nellore (Sangam) Barrages",
          "state": "Andhra Pradesh",
          "type": "Delta irrigation headworks"
        }
      ],
      "protectedAreas": [
        {
          "name": "Sri Lankamalleswara Wildlife Sanctuary",
          "relation": "Kadapa hills of the Pennar basin; habitat of Jerdon's courser",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Sri Penusila Narasimha Wildlife Sanctuary",
          "relation": "Nellore hills of the lower basin",
          "state": "Andhra Pradesh"
        }
      ],
      "species": [
        {
          "name": "Jerdon's Courser",
          "iucn": "Critically Endangered",
          "role": "Nocturnal bird rediscovered in 1986 near Kadapa; endemic to this region"
        }
      ],
      "commonMistake": "Do not confuse the PENNAR (North Pennar, to Nellore) with the PENNAIYAR (South Pennar, to Cuddalore in Tamil Nadu); both rise in the Nandi hills. The Gandikota canyon is on the Pennar."
    },
    "staticFacts": [
      "Flows through the rain-shadow Rayalaseema plateau, so it is seasonal and carries little water for most of the year.",
      "The Nandi hills are a radial drainage centre from which the Pennar, South Pennar, Palar and Arkavathi flow out."
    ],
    "similarPYQ": [
      "GEO-UPSC-2022-03",
      "GEO-UPSC-2015-07"
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
    "place": "Subarnarekha River",
    "aliases": [
      "Golden Line River",
      "Subarnarekha",
      "Singhbhum River",
      "Hundru River"
    ],
    "placeType": "Minor East-Flowing River of the Chotanagpur Plateau",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Jharkhand, West Bengal, Odisha"
    },
    "lat": 22.8,
    "lng": 86.2,
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
        22.35,
        86.75
      ],
      [
        21.9,
        87.1
      ],
      [
        21.6,
        87.45
      ]
    ],
    "neighbours": [
      "Source: Near Nagri village, Ranchi district (Jharkhand)",
      "Mouth: Bay of Bengal through an estuary near Talsari, Balasore district (Odisha)"
    ],
    "riverDetails": {
      "length": "~395 km",
      "origin": "Near Nagri village, Ranchi district (Jharkhand)",
      "mouth": "Bay of Bengal through an estuary near Talsari, Balasore district (Odisha)",
      "sourceCoords": [
        23.35,
        85.2
      ],
      "mouthCoords": [
        21.6,
        87.45
      ],
      "states": {
        "flowsThrough": [
          "Jharkhand",
          "West Bengal",
          "Odisha"
        ],
        "basinStates": [
          "Jharkhand",
          "West Bengal",
          "Odisha"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": [
          {
            "name": "Kharkai River",
            "note": "Joins at Domuhani, Jamshedpur"
          }
        ]
      },
      "confluences": [
        {
          "tributary": "Kharkai",
          "sangam": "Domuhani, Jamshedpur",
          "state": "Jharkhand"
        }
      ],
      "towns": [
        {
          "name": "Hundru Falls",
          "type": "Tourism",
          "significance": "Plunge where the river drops off the Ranchi plateau",
          "state": "Jharkhand"
        },
        {
          "name": "Jamshedpur",
          "type": "Economic",
          "significance": "Tata Steel city at the Subarnarekha-Kharkai confluence",
          "state": "Jharkhand"
        }
      ],
      "dams": [
        {
          "name": "Getalsud and Chandil Dams",
          "state": "Jharkhand",
          "type": "Water supply for Ranchi and the Subarnarekha Multipurpose Project"
        }
      ],
      "protectedAreas": [],
      "species": [],
      "commonMistake": "The name means 'streak of gold' from gold traces in its sands. It forms an ESTUARY, not a significant delta."
    },
    "staticFacts": [
      "Flows through the mineral-rich Chotanagpur plateau and the Singhbhum copper-iron belt."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07",
      "UPSC-2024-09",
      "GEO-CDS1-2017-08"
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
    "place": "Brahmani River",
    "aliases": [
      "Vedavyas River",
      "South Koel Sankh",
      "Rengali River",
      "Talcher River"
    ],
    "placeType": "East-Flowing River of Odisha (Shares Delta with Baitarani)",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Jharkhand, Chhattisgarh, Odisha"
    },
    "lat": 21.1,
    "lng": 85.2,
    "shape": [
      [
        22.22,
        84.85
      ],
      [
        21.5,
        85
      ],
      [
        21.1,
        85.2
      ],
      [
        20.85,
        85.85
      ],
      [
        20.8,
        86.95
      ]
    ],
    "neighbours": [
      "Source: Formed by the South Koel and the Sankh at Vedavyas, near Rourkela (Odisha)",
      "Mouth: Bay of Bengal near Dhamra, after joining the Baitarani in a common delta (Odisha"
    ],
    "riverDetails": {
      "length": "~799 km including the South Koel headstream",
      "origin": "Formed by the South Koel and the Sankh at Vedavyas, near Rourkela (Odisha)",
      "mouth": "Bay of Bengal near Dhamra, after joining the Baitarani in a common delta (Odisha)",
      "sourceCoords": [
        22.22,
        84.85
      ],
      "mouthCoords": [
        20.8,
        86.95
      ],
      "states": {
        "flowsThrough": [
          "Odisha"
        ],
        "basinStates": [
          "Jharkhand",
          "Chhattisgarh",
          "Odisha"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": []
      },
      "confluences": [
        {
          "tributary": "South Koel + Sankh",
          "sangam": "Vedavyas, near Rourkela",
          "state": "Odisha"
        },
        {
          "tributary": "Baitarani",
          "sangam": "Dhamra estuary",
          "state": "Odisha"
        }
      ],
      "towns": [
        {
          "name": "Rourkela",
          "type": "Economic",
          "significance": "SAIL steel plant at the head of the river",
          "state": "Odisha"
        },
        {
          "name": "Talcher-Angul",
          "type": "Economic",
          "significance": "Coalfield and NALCO aluminium smelter",
          "state": "Odisha"
        },
        {
          "name": "Dhamra",
          "type": "Economic",
          "significance": "Deep-water port at the mouth",
          "state": "Odisha"
        }
      ],
      "dams": [
        {
          "name": "Mandira Dam",
          "state": "Odisha",
          "type": "On the Sankh headstream; supplies Rourkela Steel Plant"
        },
        {
          "name": "Rengali Dam",
          "state": "Odisha",
          "type": "Main multipurpose dam on the Brahmani (Angul)"
        }
      ],
      "protectedAreas": [
        {
          "name": "Bhitarkanika National Park",
          "relation": "Brahmani-Baitarani delta mangroves; Ramsar site (2002)",
          "state": "Odisha"
        },
        {
          "name": "Gahirmatha Marine Sanctuary",
          "relation": "Coast off the delta; major olive ridley mass-nesting beach",
          "state": "Odisha"
        }
      ],
      "species": [
        {
          "name": "Saltwater Crocodile",
          "iucn": "Least Concern",
          "role": "India's largest population in Bhitarkanika"
        },
        {
          "name": "Olive Ridley Turtle",
          "iucn": "Vulnerable",
          "role": "Arribada (mass nesting) at Gahirmatha"
        }
      ],
      "commonMistake": "The BAITARANI is NOT a tributary of the Brahmani; the two are separate rivers sharing one delta. MANDIRA dam belongs here, not to the Mahanadi."
    },
    "staticFacts": [
      "Its delta merges with the Mahanadi and Baitarani deltas on the Odisha coast."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07"
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
    "place": "Baitarani River",
    "aliases": [
      "Vaitarani",
      "Gonasika River",
      "Guptaganga River",
      "Jajpur River"
    ],
    "placeType": "East-Flowing River of Odisha",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha, Jharkhand"
    },
    "lat": 21.2,
    "lng": 86.1,
    "shape": [
      [
        21.75,
        85.6
      ],
      [
        21.5,
        85.9
      ],
      [
        21.2,
        86.1
      ],
      [
        20.95,
        86.55
      ],
      [
        20.8,
        86.95
      ]
    ],
    "neighbours": [
      "Source: Guptaganga hills near Gonasika, Keonjhar district (Odisha)",
      "Mouth: Bay of Bengal at the Dhamra estuary, after joining the Brahmani (Odisha)"
    ],
    "riverDetails": {
      "length": "~360 km",
      "origin": "Guptaganga hills near Gonasika, Keonjhar district (Odisha)",
      "mouth": "Bay of Bengal at the Dhamra estuary, after joining the Brahmani (Odisha)",
      "sourceCoords": [
        21.75,
        85.6
      ],
      "mouthCoords": [
        20.8,
        86.95
      ],
      "states": {
        "flowsThrough": [
          "Odisha",
          "Jharkhand"
        ],
        "basinStates": [
          "Odisha",
          "Jharkhand"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": []
      },
      "confluences": [
        {
          "tributary": "Brahmani",
          "sangam": "Dhamra estuary",
          "state": "Odisha"
        }
      ],
      "towns": [
        {
          "name": "Gonasika",
          "type": "Cultural",
          "significance": "Source; the stream emerges from a rock shaped like a cow's nostril",
          "state": "Odisha"
        },
        {
          "name": "Jajpur",
          "type": "Cultural",
          "significance": "Biraja temple; one of Odisha's holiest river towns",
          "state": "Odisha"
        }
      ],
      "dams": [],
      "protectedAreas": [
        {
          "name": "Bhitarkanika National Park",
          "relation": "Shared Brahmani-Baitarani delta",
          "state": "Odisha"
        }
      ],
      "species": [],
      "commonMistake": "Its sacred status comes from the mythological VAITARANI (the river of the underworld), not from Jagannath rituals."
    },
    "staticFacts": [
      "For a stretch it forms the Odisha-Jharkhand boundary."
    ],
    "similarPYQ": [
      "GEO-UPSC-2021-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-15A",
    "slug": "vamsadhara-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Vamsadhara River",
    "aliases": [
      "Bansadhara",
      "Kalingapatnam River",
      "Gotta Barrage River"
    ],
    "placeType": "Minor East-Flowing Inter-State River (Odisha-AP)",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha, Andhra Pradesh"
    },
    "lat": 18.85,
    "lng": 83.9,
    "shape": [
      [
        19.45,
        83.3
      ],
      [
        19.05,
        83.82
      ],
      [
        18.85,
        83.9
      ],
      [
        18.33,
        84.12
      ]
    ],
    "neighbours": [
      "Source: Eastern Ghats near Thuamul Rampur, Kalahandi district (Odisha)",
      "Mouth: Bay of Bengal at Kalingapatnam, Srikakulam district (Andhra Pradesh)"
    ],
    "riverDetails": {
      "length": "~254 km",
      "origin": "Eastern Ghats near Thuamul Rampur, Kalahandi district (Odisha)",
      "mouth": "Bay of Bengal at Kalingapatnam, Srikakulam district (Andhra Pradesh)",
      "sourceCoords": [
        19.45,
        83.3
      ],
      "mouthCoords": [
        18.33,
        84.12
      ],
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
        "leftBank": [],
        "rightBank": [
          {
            "name": "Mahendratanaya River",
            "note": "From the Mahendragiri hills"
          }
        ]
      },
      "confluences": [],
      "towns": [
        {
          "name": "Mukhalingam",
          "type": "Historical",
          "significance": "Eastern Ganga dynasty temples near the river",
          "state": "Andhra Pradesh"
        },
        {
          "name": "Kalingapatnam",
          "type": "Historical",
          "significance": "Ancient port at the mouth",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Neradi Barrage (proposed)",
          "state": "Odisha / Andhra Pradesh border",
          "type": "Subject of the Vamsadhara Water Disputes Tribunal"
        }
      ],
      "protectedAreas": [],
      "species": [],
      "commonMistake": "The Vamsadhara dispute is between ODISHA and ANDHRA PRADESH; the Vamsadhara Water Disputes Tribunal gave its award in 2017."
    },
    "staticFacts": [],
    "similarPYQ": [
      "GEO-UPSC-2021-07",
      "GEO-UPSC-2015-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-15B",
    "slug": "nagavali-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Nagavali (Langulya) River",
    "aliases": [
      "Langulya",
      "Thotapalli River",
      "Srikakulam River"
    ],
    "placeType": "Minor East-Flowing Inter-State River (Odisha-AP)",
    "priority": "Low",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Odisha, Andhra Pradesh"
    },
    "lat": 19.17,
    "lng": 83.42,
    "shape": [
      [
        19.55,
        83.15
      ],
      [
        19.17,
        83.42
      ],
      [
        18.78,
        83.6
      ],
      [
        18.3,
        83.9
      ],
      [
        18.25,
        84.05
      ]
    ],
    "neighbours": [
      "Source: Eastern Ghats near Lakhbahal, Kalahandi district (Odisha)",
      "Mouth: Bay of Bengal near Srikakulam (Andhra Pradesh)"
    ],
    "riverDetails": {
      "length": "~256 km",
      "origin": "Eastern Ghats near Lakhbahal, Kalahandi district (Odisha)",
      "mouth": "Bay of Bengal near Srikakulam (Andhra Pradesh)",
      "sourceCoords": [
        19.55,
        83.15
      ],
      "mouthCoords": [
        18.25,
        84.05
      ],
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
            "name": "Jhanjavati River",
            "note": "Joins in Andhra Pradesh"
          }
        ],
        "rightBank": []
      },
      "confluences": [],
      "towns": [
        {
          "name": "Rayagada",
          "type": "Economic",
          "significance": "Main Odisha town on the river",
          "state": "Odisha"
        },
        {
          "name": "Srikakulam",
          "type": "Administrative",
          "significance": "District town near the mouth",
          "state": "Andhra Pradesh"
        }
      ],
      "dams": [
        {
          "name": "Thotapalli Barrage",
          "state": "Andhra Pradesh",
          "type": "Irrigation in Vizianagaram-Srikakulam"
        }
      ],
      "protectedAreas": [],
      "species": [],
      "commonMistake": "Called the LANGULYA in Odisha. It and the Vamsadhara both reach the sea in Srikakulam district."
    },
    "staticFacts": [],
    "similarPYQ": [
      "GEO-UPSC-2021-07"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-17A",
    "slug": "palar-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Palar River",
    "aliases": [
      "Kshira Nadi",
      "Palar Anicut River",
      "Vellore River",
      "Kanchipuram River"
    ],
    "placeType": "Seasonal East-Flowing River (Nandi Hills to Tamil Nadu)",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka, Andhra Pradesh, Tamil Nadu"
    },
    "lat": 12.92,
    "lng": 79.13,
    "shape": [
      [
        13.3,
        77.95
      ],
      [
        12.95,
        78.6
      ],
      [
        12.92,
        79.13
      ],
      [
        12.83,
        79.7
      ],
      [
        12.52,
        80.17
      ]
    ],
    "neighbours": [
      "Source: Nandi hills region, Chikkaballapur-Kolar (Karnataka)",
      "Mouth: Bay of Bengal near Vayalur, south of Kalpakkam (Tamil Nadu)"
    ],
    "riverDetails": {
      "length": "~348 km",
      "origin": "Nandi hills region, Chikkaballapur-Kolar (Karnataka)",
      "mouth": "Bay of Bengal near Vayalur, south of Kalpakkam (Tamil Nadu)",
      "sourceCoords": [
        13.3,
        77.95
      ],
      "mouthCoords": [
        12.52,
        80.17
      ],
      "states": {
        "flowsThrough": [
          "Karnataka",
          "Andhra Pradesh",
          "Tamil Nadu"
        ],
        "basinStates": [
          "Karnataka",
          "Andhra Pradesh",
          "Tamil Nadu"
        ]
      },
      "tributaries": {
        "leftBank": [
          {
            "name": "Ponnai (Poini) River",
            "note": "From the Chittoor side"
          }
        ],
        "rightBank": [
          {
            "name": "Cheyyar River",
            "note": "From the Javadi hills"
          }
        ]
      },
      "confluences": [],
      "towns": [
        {
          "name": "Vaniyambadi-Ambur",
          "type": "Economic",
          "significance": "Leather tannery belt; major source of Palar pollution",
          "state": "Tamil Nadu"
        },
        {
          "name": "Vellore",
          "type": "Historical",
          "significance": "Vellore fort; CMC hospital",
          "state": "Tamil Nadu"
        },
        {
          "name": "Kalpakkam",
          "type": "Infrastructure",
          "significance": "Nuclear power station near the mouth",
          "state": "Tamil Nadu"
        }
      ],
      "dams": [],
      "protectedAreas": [],
      "species": [],
      "commonMistake": "The Palar is dry for most of the year; its value is GROUNDWATER in its sandy bed, an important source for Chennai and Kanchipuram."
    },
    "staticFacts": [
      "Andhra Pradesh's check dams in its upper course have led to an AP-Tamil Nadu dispute."
    ],
    "similarPYQ": [
      "GEO-UPSC-2022-03"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-17B",
    "slug": "south-pennar-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "South Pennar (Pennaiyar / Thenpennai) River",
    "aliases": [
      "Pennaiyar",
      "Thenpennai",
      "Dakshina Pinakini",
      "Sathanur River"
    ],
    "placeType": "East-Flowing River (Nandi Hills to Cuddalore)",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Karnataka, Tamil Nadu"
    },
    "lat": 12.18,
    "lng": 78.85,
    "shape": [
      [
        13.37,
        77.7
      ],
      [
        12.85,
        78
      ],
      [
        12.3,
        78.45
      ],
      [
        12.18,
        78.85
      ],
      [
        11.9,
        79.5
      ],
      [
        11.75,
        79.78
      ]
    ],
    "neighbours": [
      "Source: Nandi hills, Chikkaballapur district (Karnataka); also called the Dakshina Pinak",
      "Mouth: Bay of Bengal near Cuddalore (Tamil Nadu)"
    ],
    "riverDetails": {
      "length": "~430–497 km (sources vary)",
      "origin": "Nandi hills, Chikkaballapur district (Karnataka); also called the Dakshina Pinakini",
      "mouth": "Bay of Bengal near Cuddalore (Tamil Nadu)",
      "sourceCoords": [
        13.37,
        77.7
      ],
      "mouthCoords": [
        11.75,
        79.78
      ],
      "states": {
        "flowsThrough": [
          "Karnataka",
          "Tamil Nadu"
        ],
        "basinStates": [
          "Karnataka",
          "Tamil Nadu",
          "Andhra Pradesh"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": []
      },
      "confluences": [],
      "towns": [
        {
          "name": "Hosur",
          "type": "Economic",
          "significance": "Industrial town near the Karnataka-TN border",
          "state": "Tamil Nadu"
        },
        {
          "name": "Cuddalore",
          "type": "Economic",
          "significance": "Port town at the mouth",
          "state": "Tamil Nadu"
        }
      ],
      "dams": [
        {
          "name": "Krishnagiri (KRP) Dam",
          "state": "Tamil Nadu",
          "type": "Irrigation reservoir"
        },
        {
          "name": "Sathanur Dam",
          "state": "Tamil Nadu",
          "type": "Main reservoir, Tiruvannamalai district"
        }
      ],
      "protectedAreas": [],
      "species": [],
      "commonMistake": "Do not confuse it with the PENNAR (North Pennar), which flows to Nellore in AP. Bengaluru's Bellandur and Varthur lakes (known for toxic foam) drain into the South Pennar."
    },
    "staticFacts": [],
    "similarPYQ": [
      "GEO-UPSC-2022-03"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-16",
    "slug": "vaigai-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Vaigai River",
    "aliases": [
      "Kritamala",
      "Madurai River",
      "Chithirai Festival River",
      "Megamalai River"
    ],
    "placeType": "East-Flowing River of South Tamil Nadu",
    "priority": "Medium",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Tamil Nadu"
    },
    "lat": 9.93,
    "lng": 78.12,
    "shape": [
      [
        9.65,
        77.35
      ],
      [
        10.05,
        77.58
      ],
      [
        9.93,
        78.12
      ],
      [
        9.7,
        78.5
      ],
      [
        9.4,
        79
      ]
    ],
    "neighbours": [
      "Source: Varusanadu hills (Megamalai), Western Ghats, Theni district (Tamil Nadu)",
      "Mouth: Ends in the Ramanathapuram big tank; surplus reaches Palk Bay near Athangarai (n"
    ],
    "riverDetails": {
      "length": "~258 km",
      "origin": "Varusanadu hills (Megamalai), Western Ghats, Theni district (Tamil Nadu)",
      "mouth": "Ends in the Ramanathapuram big tank; surplus reaches Palk Bay near Athangarai (no delta)",
      "sourceCoords": [
        9.65,
        77.35
      ],
      "mouthCoords": [
        9.4,
        79
      ],
      "states": {
        "flowsThrough": [
          "Tamil Nadu"
        ],
        "basinStates": [
          "Tamil Nadu"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": [
          {
            "name": "Suruliyar River",
            "note": "Suruli falls; brings Periyar water diverted through Mullaperiyar"
          }
        ]
      },
      "confluences": [],
      "towns": [
        {
          "name": "Madurai",
          "type": "Cultural / Historical",
          "significance": "Pandya capital; Meenakshi temple; Chithirai festival on the Vaigai",
          "state": "Tamil Nadu"
        },
        {
          "name": "Keezhadi",
          "type": "Historical",
          "significance": "Sangam-era urban settlement excavated on the Vaigai bank",
          "state": "Tamil Nadu"
        }
      ],
      "dams": [
        {
          "name": "Vaigai Dam",
          "state": "Tamil Nadu",
          "type": "Near Andipatti (Theni); stores Periyar water diverted east"
        }
      ],
      "protectedAreas": [
        {
          "name": "Srivilliputhur-Megamalai Tiger Reserve",
          "relation": "Source hills of the Vaigai",
          "state": "Tamil Nadu"
        }
      ],
      "species": [],
      "commonMistake": "Much of the Vaigai's water comes from the PERIYAR (Kerala) via the Mullaperiyar diversion. It usually does not reach the sea as a flowing river."
    },
    "staticFacts": [],
    "similarPYQ": [
      "GEO-CDS1-2017-08"
    ],
    "linkedIssueSlug": "indian-drainage-himalayan-peninsular-river-systems",
    "linkedIssueTitle": "Indian Drainage — Himalayan & Peninsular River Systems",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-RIV-17C",
    "slug": "vellar-river",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – rivers, lakes, reservoirs & glaciers"
    ],
    "place": "Vellar River",
    "aliases": [
      "South Vellar",
      "Kalrayan River",
      "Porto Novo River",
      "Parangipettai River"
    ],
    "placeType": "Minor East-Flowing River of Tamil Nadu",
    "priority": "Low",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Tamil Nadu"
    },
    "lat": 11.52,
    "lng": 79.32,
    "shape": [
      [
        11.8,
        78.55
      ],
      [
        11.55,
        78.9
      ],
      [
        11.52,
        79.32
      ],
      [
        11.5,
        79.77
      ]
    ],
    "neighbours": [
      "Source: Chitteri-Kalrayan hills of the Eastern Ghats, Salem-Kallakurichi region (Tamil N",
      "Mouth: Bay of Bengal at Parangipettai (Porto Novo), Cuddalore district (Tamil Nadu)"
    ],
    "riverDetails": {
      "length": "~200 km",
      "origin": "Chitteri-Kalrayan hills of the Eastern Ghats, Salem-Kallakurichi region (Tamil Nadu)",
      "mouth": "Bay of Bengal at Parangipettai (Porto Novo), Cuddalore district (Tamil Nadu)",
      "sourceCoords": [
        11.8,
        78.55
      ],
      "mouthCoords": [
        11.5,
        79.77
      ],
      "states": {
        "flowsThrough": [
          "Tamil Nadu"
        ],
        "basinStates": [
          "Tamil Nadu"
        ]
      },
      "tributaries": {
        "leftBank": [],
        "rightBank": [
          {
            "name": "Swetha Nadi",
            "note": "Joins in the middle course"
          }
        ]
      },
      "confluences": [],
      "towns": [
        {
          "name": "Vriddhachalam",
          "type": "Cultural",
          "significance": "Temple town in the Vellar basin",
          "state": "Tamil Nadu"
        },
        {
          "name": "Parangipettai",
          "type": "Historical",
          "significance": "Old Porto Novo port at the mouth",
          "state": "Tamil Nadu"
        }
      ],
      "dams": [],
      "protectedAreas": [
        {
          "name": "Pichavaram Mangroves",
          "relation": "Between the Vellar and Kollidam (Coleroon) estuaries",
          "state": "Tamil Nadu"
        }
      ],
      "species": [],
      "commonMistake": "Pichavaram mangroves lie between the VELLAR and the COLEROON (Kollidam) estuaries, not on the main Cauvery."
    },
    "staticFacts": [],
    "similarPYQ": [
      "GEO-CDS1-2017-08"
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
    "id": "IND-PASS-01",
    "slug": "zoji-la-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Zoji La Pass",
    "aliases": [
      "Zojila",
      "Zoji La",
      "Gateway to Ladakh",
      "Srinagar-Leh Pass"
    ],
    "placeType": "Great Himalayan Strategic Mountain Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Ladakh / Jammu & Kashmir"
    },
    "lat": 34.28,
    "lng": 75.58,
    "elevation": "3,528 m",
    "neighbours": [
      "Connects Kashmir Valley (Srinagar/Sonamarg) with Dras and Kargil",
      "Situated on the Great Himalayan Range",
      "Traversed by National Highway 1 (NH-1)"
    ],
    "staticFacts": [
      "Situated on the Great Himalayan range at ~3,528 m; vital strategic artery connecting Srinagar via Sonamarg to Dras, Kargil, and Leh.",
      "Subject to heavy snowfall and closed during deep winter; the 14.15 km Zoji La bi-directional all-weather tunnel is under construction to ensure year-round military and civilian movement.",
      "Crucial battlefield of the 1947–48 Indo-Pak War where Indian Army tanks (Stuart light tanks of 7th Cavalry) were deployed at unprecedented high altitude (Operation Bison).",
      "Directly tested in UPSC CDS (2017) matching passes to states/regions."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03",
      "GEO-CDS2-2021-05"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-02",
    "slug": "khardung-la-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Khardung La Pass",
    "aliases": [
      "Khardungla",
      "Pass of Lower Castle",
      "Leh-Nubra Pass"
    ],
    "placeType": "Ladakh Range High-Altitude Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Ladakh (Leh District)"
    },
    "lat": 34.2789,
    "lng": 77.6047,
    "elevation": "5,359 m",
    "neighbours": [
      "North of Leh town",
      "South of Nubra and Shyok Valleys",
      "Gateway to Siachen Base Camp"
    ],
    "staticFacts": [
      "Perched on the Ladakh Range north of Leh at ~5,359 m (17,582 ft); historically among the world's highest motorable roads.",
      "Acts as the indispensable military supply line to the Nubra Valley, Shyok Valley, and the Siachen Glacier (which lies strictly North of Nubra Valley, UPSC 2020).",
      "Tested directly in CDS 2021 (\"D visited Khardung La, Nubra Valley... which State/UT?\").",
      "Maintained year-round by Project HIMANK of the Border Roads Organisation (BRO)."
    ],
    "similarPYQ": [
      "GEO-CDS2-2021-05",
      "GEO-UPSC-2020-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-03",
    "slug": "banihal-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Banihal Pass & Jawahar Tunnel",
    "aliases": [
      "Banihal Qazigund Pass",
      "Pir Panjal Gateway",
      "Jawahar Tunnel"
    ],
    "placeType": "Pir Panjal Range Mountain Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Jammu & Kashmir"
    },
    "lat": 33.5167,
    "lng": 75.195,
    "elevation": "2,832 m",
    "neighbours": [
      "Connects Jammu plains with Kashmir Valley (Qazigund)",
      "Crosses Pir Panjal Range",
      "Traversed by NH-44 and USBRL Railway"
    ],
    "staticFacts": [
      "Cuts across the Pir Panjal Range at ~2,832 m, linking the Jammu division (Ramban) with the Kashmir Valley (Qazigund/Anantnag).",
      "Pierced by the historic 2.85 km Jawahar Tunnel (operational since 1956) and the modern 8.45 km twin-tube Banihal-Qazigund Road Tunnel (Navayuga Tunnel).",
      "Also traversed beneath by India's longest operational transportation railway tunnel: the 11.215 km Pir Panjal Railway Tunnel (T-80) on the Udhampur-Srinagar-Baramulla Rail Link (USBRL).",
      "Serves as the sole arterial all-weather ground link connecting the Kashmir Valley to the rest of India along NH-44."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-04",
    "slug": "chang-la-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Chang La Pass",
    "aliases": [
      "Changla",
      "Pass towards the South",
      "Pangong Tso Pass"
    ],
    "placeType": "Ladakh Range Strategic High Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Ladakh (Leh District)"
    },
    "lat": 34.0489,
    "lng": 77.9306,
    "elevation": "5,360 m",
    "neighbours": [
      "Connects Indus Valley (Karu) with Tangtse and Pangong Tso Lake",
      "Crosses Ladakh Range to Changthang Plateau",
      "Near Spanggur Gap & Line of Actual Control"
    ],
    "staticFacts": [
      "Crosses the Ladakh Range at ~5,360 m (17,590 ft), serving as the primary strategic vehicular gateway between Leh and Pangong Tso Lake.",
      "Main entry point to the high-altitude Changthang Plateau, home of the semi-nomadic Changpa pastoralists and Pashmina (Cashmere) goats.",
      "Hosts the world's highest terrestrial research station established by the Defence Institute of High Altitude Research (DIHAR, DRDO).",
      "Tested in UPSC CDS (2018) concerning passes linking Ladakh with Changthang and trans-Himalayan Tibetan plateau routes."
    ],
    "similarPYQ": [
      "GEO-CDS2-2018-03",
      "GEO-CDS2-2021-05"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-05",
    "slug": "rohtang-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Rohtang Pass & Atal Tunnel",
    "aliases": [
      "Rohtang La",
      "Pile of Corpses Pass",
      "Kullu Lahaul Pass"
    ],
    "placeType": "Pir Panjal Watershed Mountain Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Himachal Pradesh (Kullu / Lahaul-Spiti)"
    },
    "lat": 32.3716,
    "lng": 77.2466,
    "elevation": "3,978 m",
    "neighbours": [
      "Connects Kullu Valley (Manali) with Lahaul and Spiti Valleys",
      "Divides Beas River basin from Chandra (Chenab) basin",
      "Pir Panjal Range"
    ],
    "staticFacts": [
      "Located on the Pir Panjal Range at ~3,978 m, forming the vital hydrological and climatic divide between the lush Kullu Valley (Beas basin) and the arid, rain-shadow Lahaul-Spiti Valley (Chenab basin).",
      "Historically notorious for sudden blizzards and landslides, closing traffic for 5–6 months annually.",
      "Bypassed at ~3,000 m by the 9.02 km horseshoe-shaped Atal Tunnel (under the Rohtang ridge), the world's longest single-tube highway tunnel above 10,000 feet, providing all-weather access to Lahaul.",
      "Directly linked to the origin of the Beas River (Beas Kund is situated near the crest of Rohtang Pass)."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03",
      "ENV-UPSC-2014-09"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-06",
    "slug": "bara-lacha-la-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Bara-lacha La Pass",
    "aliases": [
      "Baralacha La",
      "Pass with Crossroads on Summit",
      "Lahaul-Ladakh Pass"
    ],
    "placeType": "Zanskar Range High-Altitude Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Himachal Pradesh / Ladakh Border"
    },
    "lat": 32.74,
    "lng": 77.42,
    "elevation": "4,890 m",
    "neighbours": [
      "Connects Lahaul (HP) with Leh (Ladakh) on Manali-Leh Highway",
      "Situated on the Zanskar Range",
      "Source divide of Chandra, Bhaga, and Yunam rivers"
    ],
    "staticFacts": [
      "Situated on the Zanskar Range at ~4,890 m on the Manali–Leh Highway, serving as the high mountain threshold between Himachal Pradesh and Ladakh.",
      "Functions as a spectacular radial hydrological divide: the Chandra river flows southeast from Chandratal, the Bhaga river flows southwest from Suraj Tal near the pass, and the Yunam river flows north into Zanskar.",
      "Chandra and Bhaga meet downstream at Tandi in Lahaul to form the Chandrabhaga / Chenab River (UPSC 2021).",
      "Suraj Tal (Sun Lake), India's third highest lake, sits just below the summit of Bara-lacha La."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03",
      "GEO-UPSC-2021-05"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-07",
    "slug": "shipki-la-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Shipki La Pass",
    "aliases": [
      "Shipkila",
      "Sutlej Gorge Pass",
      "Kinnaur-Tibet Border Pass"
    ],
    "placeType": "Zanskar Range International Border Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Himachal Pradesh (Kinnaur District)"
    },
    "lat": 31.8125,
    "lng": 78.7428,
    "elevation": "3,930 m",
    "neighbours": [
      "Connects Kinnaur (HP) with Ngari Prefecture (Tibet, China)",
      "Traversed by Sutlej River gorge",
      "Zanskar / Greater Himalayas"
    ],
    "staticFacts": [
      "Located in Kinnaur district of Himachal Pradesh at ~3,930 m, forming an international border post between India and Tibet (China).",
      "Hydrological significance: It is precisely through this deep antecedent gorge at Shipki La that the trans-Himalayan Sutlej River cuts through the Himalayan crest line to enter India from Rakshastal / Mansarovar.",
      "Ancient branch of the Silk Road used for centuries for Indo-Tibetan trade; designated as an official border trade post alongside Lipulekh and Nathu La.",
      "Tested directly in CDS 2017 (\"Match Shipki La with Himachal Pradesh\")."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03",
      "GEO-UPSC-2021-05"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-08",
    "slug": "lipulekh-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Lipulekh Pass",
    "aliases": [
      "Lipu Lekh",
      "Kailash Mansarovar Gateway",
      "Tri-Junction Pass"
    ],
    "placeType": "Greater Himalayan Strategic Tri-Junction Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand (Pithoragarh District)"
    },
    "lat": 30.24,
    "lng": 81.04,
    "elevation": "5,200 m",
    "neighbours": [
      "Tri-junction of India (Uttarakhand), Tibet (China), and Nepal",
      "Overlooks Kalapani and source of Mahakali (Sharda) river",
      "Byas Valley / Dharchula"
    ],
    "staticFacts": [
      "Perched on the Greater Himalayas at ~5,200 m in Pithoragarh district, Uttarakhand, near the geopolitical tri-junction of India, China (Tibet), and Nepal.",
      "Traditional high-altitude route for the Ministry of External Affairs-conducted Kailash Mansarovar Yatra pilgrimage into Western Tibet.",
      "First border trade post opened between India and China post-1962 (opened in 1992 for local border trade).",
      "Center of geopolitical focus due to Nepal's territorial claims over the Kalapani-Limpiyadhura-Lipulekh tract following India's opening of the 80 km Dharchula-Lipulekh road."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-09",
    "slug": "mana-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Mana Pass (Dungri La)",
    "aliases": [
      "Mana La",
      "Dungri La",
      "Chirbitya",
      "Badrinath Border Pass"
    ],
    "placeType": "Greater Himalayan High Border Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand (Chamoli District)"
    },
    "lat": 31.0667,
    "lng": 79.4167,
    "elevation": "5,608 m",
    "neighbours": [
      "Connects Uttarakhand (Chamoli) with Guge Kingdom / Tibet",
      "North of Mana village (\"First Indian Village\") and Badrinath",
      "Greater Himalayan Crest"
    ],
    "staticFacts": [
      "Situated on the border between Uttarakhand and Tibet at an elevation of ~5,608 m (18,400 ft) inside Nanda Devi Biosphere Reserve.",
      "Lies just 24 km north of the sacred shrine of Badrinath and the border village of Mana (designated as India's \"First Village\").",
      "Deotal Lake (at 5,471 m near the pass) is the mythological and hydrological source of the Saraswati River, which rushes past Bhim Pul in Mana before joining the Alaknanda at Keshav Prayag.",
      "Traversed by one of the world's highest military motorable roads constructed by the Border Roads Organisation (Project SHIVALIK)."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03",
      "GEO-UPSC-2019-04"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-10",
    "slug": "niti-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Niti Pass",
    "aliases": [
      "Niti La",
      "Dhauliganga Head Pass",
      "Chamoli-Tibet Pass"
    ],
    "placeType": "Greater Himalayan Border Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Uttarakhand (Chamoli District)"
    },
    "lat": 30.9667,
    "lng": 79.8667,
    "elevation": "5,070 m",
    "neighbours": [
      "Connects Garhwal (Niti Valley) with Tibet",
      "Headwaters of Dhauliganga River",
      "Nanda Devi Biosphere Northern Rim"
    ],
    "staticFacts": [
      "Located at ~5,070 m at the northern extremity of Chamoli district, Uttarakhand, linking the Niti valley of Garhwal with the Tibetan plateau.",
      "Source catchment of the Dhauliganga River, which flows south through Malari and Tapovan to join the Alaknanda at Vishnuprayag.",
      "Historically traversed by the trans-humant Bhotia traders carrying salt, borax, and wool between India and Tibet before the 1962 conflict.",
      "Forms the northern boundary of the Nanda Devi National Park buffer zone."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-11",
    "slug": "nathu-la-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Nathu La Pass",
    "aliases": [
      "Nathula",
      "Listening Ears Pass",
      "Old Silk Route Pass",
      "Sikkim-Tibet Pass"
    ],
    "placeType": "Dongkya Range Strategic Trade Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Sikkim (East Sikkim District)"
    },
    "lat": 27.3864,
    "lng": 88.8311,
    "elevation": "4,310 m",
    "neighbours": [
      "Connects Gangtok (Sikkim) with Yadong in Chumbi Valley (Tibet)",
      "Dongkya Range of Greater Himalayas",
      "Near Tsomgo (Changu) Lake and Baba Mandir"
    ],
    "staticFacts": [
      "Located on the Indo-China border in East Sikkim at ~4,310 m, connecting Sikkim with Tibet's Chumbi Valley.",
      "Key branch of the historic Old Silk Route; accounted for the bulk of bilateral trade until sealed during the 1962 war; famously reopened in 2006 for border trade.",
      "Strategic importance: Overlooks the vulnerable Siliguri Corridor (\"Chicken's Neck\"); lies in close operational proximity to the Doklam plateau tri-junction.",
      "Repeatedly tested in UPSC CSE & CDS (CDS 2017: Match Nathu La with Sikkim; UPSC 2017: Doklam and Chumbi valley context)."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03",
      "GEO-UPSC-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-12",
    "slug": "jelep-la-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Jelep La Pass",
    "aliases": [
      "Jelepla",
      "The Lovely Level Pass",
      "Kalimpong-Lhasa Pass"
    ],
    "placeType": "Eastern Himalayan Mountain Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Sikkim / West Bengal Border"
    },
    "lat": 27.36,
    "lng": 88.88,
    "elevation": "4,267 m",
    "neighbours": [
      "Connects Sikkim / Kalimpong with Chumbi Valley (Tibet)",
      "South of Nathu La",
      "Catchment of Menmecho Lake and Rangpo Chu"
    ],
    "staticFacts": [
      "Situated at ~4,267 m on the ridge between East Sikkim and Kalimpong, providing direct access into the Chumbi Valley of Tibet.",
      "Unlike rugged Nathu La, Jelep La has a gentler gradient and was historically the preferred caravan route connecting Kalimpong (Bengal) to Lhasa.",
      "Route used by Colonel Francis Younghusband's British military expedition to Lhasa in 1904.",
      "Fed by Menmecho Lake; the headwaters of the Rangpo Chu (tributary of Teesta) drain from the slopes below Jelep La."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-13",
    "slug": "bomdi-la-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Bomdi La Pass",
    "aliases": [
      "Bomdila",
      "Gateway to Tawang",
      "Kameng Pass"
    ],
    "placeType": "Lesser Himalayan Strategic Gateway Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Arunachal Pradesh (West Kameng District)"
    },
    "lat": 27.27,
    "lng": 92.42,
    "elevation": "2,530 m",
    "neighbours": [
      "Connects Tezpur / Brahmaputra Valley (Assam) with Tawang and Tibet border",
      "Overlooks Kameng River basin",
      "Lesser Himalayas"
    ],
    "staticFacts": [
      "Situated at ~2,530 m in West Kameng district of Arunachal Pradesh, serving as the strategic gateway connecting the Assam plains with Tawang on the Tibetan border.",
      "Controls the main military axis leading north through Sela Pass (~4,170 m, site of the modern Sela Tunnel) to the historic Tawang Monastery.",
      "Crucial strategic sector that witnessed fierce battles during the 1962 Sino-Indian War when Chinese troops advanced up to the Bomdila ridge.",
      "Divides the drainage of tributaries feeding the Kameng (Jia Bhareli) River in the Brahmaputra system."
    ],
    "similarPYQ": [
      "GEO-CDS2-2017-03",
      "GEO-UPSC-2016-04"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-14",
    "slug": "diphu-pass",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Diphu Pass",
    "aliases": [
      "Diphupass",
      "India-China-Myanmar Tri-Junction Pass"
    ],
    "placeType": "Mishmi Hills Strategic Tri-Junction Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Arunachal Pradesh (Anjaw District)"
    },
    "lat": 28.1644,
    "lng": 97.4128,
    "elevation": "4,587 m",
    "neighbours": [
      "Tri-junction of India (Arunachal Pradesh), China (Tibet), and Myanmar (Kachin State)",
      "Mishmi Hills / Patkai transition",
      "Headwaters of Lohit River basin"
    ],
    "staticFacts": [
      "Located on the MacMahon Line in the Mishmi Hills at ~4,587 m, precisely at the strategic tri-junction border of India (Arunachal Pradesh), China (Tibet), and Myanmar.",
      "Provides a strategic high-altitude mountain gateway between eastern Arunachal Pradesh and northern Myanmar (Kachin State).",
      "Critical defense monitoring node for the Lohit River valley approach (where the Lohit flows into Assam past Kibithu and Walong).",
      "Tested in UPSC geography mapping concerning international boundaries and strategic tri-junction points of Northeast India."
    ],
    "similarPYQ": [
      "GEO-UPSC-2014-06",
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-15",
    "slug": "thal-ghat-kasara",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Thal Ghat (Kasara Ghat)",
    "aliases": [
      "Thalgat",
      "Kasara Ghat",
      "Mumbai-Nashik Pass",
      "Igatpuri Pass"
    ],
    "placeType": "Northern Western Ghats Mountain Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Maharashtra (Thane / Nashik Districts)"
    },
    "lat": 19.6975,
    "lng": 73.4917,
    "elevation": "585 m",
    "neighbours": [
      "Connects Mumbai (Konkan coastal lowland) with Nashik and Deccan Plateau",
      "Crosses Sahyadri / Western Ghats escarpment",
      "Traversed by NH-3 (Mumbai-Agra) and Central Railway"
    ],
    "staticFacts": [
      "Located on the Sahyadri range (Western Ghats) at ~585 m, serving as the prime mountain pass connecting Mumbai and the Konkan coast to the Deccan Plateau and northern India (Nashik, Dhule, Indore, Agra).",
      "Traversed by National Highway 3 (Mumbai-Agra Highway) and the steep Kasara-Igatpuri railway section of Central Railway.",
      "The railway incline is one of the steepest in India (1 in 37 gradient), requiring special banker locomotives to push trains up the ghat from Kasara to Igatpuri.",
      "Directly tested in CDS (2019) regarding mountain passes of the Western Ghats and transport corridors of Peninsular India."
    ],
    "similarPYQ": [
      "GEO-CDS1-2019-05",
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-16",
    "slug": "bhor-ghat-khandala",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Bhor Ghat (Khandala Ghat)",
    "aliases": [
      "Bhorghat",
      "Khandala Ghat",
      "Mumbai-Pune Pass",
      "Palasdari Incline"
    ],
    "placeType": "Northern Western Ghats Mountain Pass",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Maharashtra (Raigad / Pune Districts)"
    },
    "lat": 18.7833,
    "lng": 73.3417,
    "elevation": "610 m",
    "neighbours": [
      "Connects Mumbai (Palasdari / Khopoli) with Pune (Khandala / Lonavala)",
      "Crosses Sahyadri / Western Ghats",
      "Traversed by Mumbai-Pune Expressway and NH-48"
    ],
    "staticFacts": [
      "Situated on the Sahyadri range at ~610 m, connecting the Konkan coastal ports (Mumbai) with the Deccan Plateau heartland (Pune, Bengaluru, Chennai).",
      "Traversed by the 6-lane Mumbai-Pune Expressway, National Highway 48, and the historic Great Indian Peninsula Railway (GIPR) incline constructed in 1863.",
      "Historically strategic gateway guarded by ancient forts like Rajmachi and Lohagad; site of the 1781 Battle of Bhor Ghat during the First Anglo-Maratha War.",
      "Receives heavy orographic rainfall exceeding 4,000 mm during the Southwest Monsoon, giving rise to torrential waterfalls feeding the Ulhas and Amba rivers."
    ],
    "similarPYQ": [
      "GEO-CDS1-2019-05",
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-17",
    "slug": "palghat-gap-palakkad",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Palghat Gap (Palakkad Gap)",
    "aliases": [
      "Palakkad Gap",
      "Nilgiri-Annamalai Discontinuity",
      "Coimbatore-Kerala Gap"
    ],
    "placeType": "Major Western Ghats Structural Discontinuity & Corridor",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Kerala (Palakkad) / Tamil Nadu (Coimbatore)"
    },
    "lat": 10.7867,
    "lng": 76.6547,
    "elevation": "140 m",
    "neighbours": [
      "Lies between Nilgiri Hills to the North and Annamalai Hills to the South",
      "Connects Coimbatore (Tamil Nadu) with Palakkad and Kochi (Kerala)",
      "Traversed by NH-544 and Southern Railway corridor"
    ],
    "staticFacts": [
      "A prominent ~30 km wide structural geological shear zone (discontinuity) interrupting the otherwise continuous Western Ghats at a low elevation of only ~140 m.",
      "Geographic position: Situated strictly between the Nilgiri Hills to the north and the Annamalai Hills to the south (UPSC recurring trap).",
      "Climatic significance: Acts as a gigantic funnel allowing the moisture-laden Southwest Monsoon winds to penetrate into the interior rain-shadow plains of western Tamil Nadu (Coimbatore/Tiruppur).",
      "Major historic trade and military corridor linking the Malabar coast with the Coromandel plains, traversed by National Highway 544 and the main Southern Railway trunk line."
    ],
    "similarPYQ": [
      "GEO-UPSC-2017-02",
      "GEO-CDS1-2019-05",
      "GEO-CDS2-2017-03"
    ],
    "linkedIssueSlug": "himalaya-mountain-passes-northern-plains",
    "linkedIssueTitle": "Himalaya, Mountain Passes & Northern Plains",
    "linkedIssueDomain": "GEOGRAPHY"
  },
  {
    "id": "IND-PASS-18",
    "slug": "shencottah-gap-aryankavu",
    "pillar": "STATIC",
    "regionScope": "India",
    "subject": "Geography",
    "mapCategory": [
      "India – relief, hills, coasts & islands"
    ],
    "place": "Shencottah Gap (Aryankavu Pass)",
    "aliases": [
      "Sengottai Gap",
      "Aryankavu Pass",
      "Cardamom-Agasthyamalai Gap",
      "Kollam-Madurai Gap"
    ],
    "placeType": "Southern Western Ghats Mountain Gap",
    "priority": "High",
    "locatedIn": {
      "country": "India",
      "stateOrProvince": "Kerala (Kollam) / Tamil Nadu (Tenkasi)"
    },
    "lat": 8.9833,
    "lng": 77.25,
    "elevation": "160 m",
    "neighbours": [
      "Lies between Cardamom Hills to the North and Agasthyamalai Hills to the South",
      "Connects Tenkasi, Tirunelveli, and Madurai (TN) with Kollam and Thiruvananthapuram (Kerala)",
      "Traversed by NH-744 and historic metre-to-broad gauge railway"
    ],
    "staticFacts": [
      "A natural structural gap across the southern crest of the Western Ghats at ~160 m elevation.",
      "Geographic position: Separates the Cardamom Hills to the north from the Agasthyamalai Hills to the south.",
      "Vital transport lifeline connecting southern Tamil Nadu (Madurai, Tirunelveli, Tenkasi) with south Kerala (Punalur, Kollam, Thiruvananthapuram) via NH-744.",
      "Traversed by the historic Kollam-Sengottai railway line (commissioned in 1904 by the Travancore state and British South Indian Railway, famous for the 13-arch 100-year-old masonry viaduct at Kazhuthurutti)."
    ],
    "similarPYQ": [
      "GEO-UPSC-2017-02",
      "GEO-CDS1-2019-05"
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
