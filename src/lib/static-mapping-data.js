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
