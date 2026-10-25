/**
 * Curated Comprehensive River Details Registry for UPSC Atlas & Studio Presentation
 * 
 * Rivers Covered (Standard 9-Point Schema):
 * - IND-RIV-01: Ganga River System
 * - IND-RIV-02: Indus River System (Sindhu & Panjnad)
 * - IND-RIV-03: Brahmaputra River System (Yarlung Tsangpo - Dihang - Jamuna)
 * - IND-RIV-04: Godavari River System (Dakshin Ganga)
 * - IND-RIV-05: Narmada River System (Rewa Rift Valley)
 * - IND-RIV-06: Kaveri (Cauvery) River System
 * - IND-RIV-07: Krishna River System
 * - IND-RIV-08: Mahanadi, Brahmani & Subarnarekha River Basins
 * - IND-RIV-09: Chambal River, Ken-Betwa Interlinking & Malwa Drainage
 * - IND-RIV-10: Tapi (Tapti) River System
 * - IND-RIV-11: Brahmani River System
 * - IND-RIV-12: Baitarani River System
 * - IND-RIV-13: Pennar (Pinakini) River System
 * - IND-RIV-14: Subarnarekha River System
 * - IND-RIV-15: Rushikulya, Vamsadhara & Nagavali River Systems
 * - IND-RIV-16: Vaigai & Tamirabarani (Porunai) River Systems
 */

export const ALL_RIVER_DETAILS = {
  "IND-RIV-01": {
    "length": "2,525 km",
    "origin": "Formed at Devprayag (Uttarakhand) by confluence of Bhagirathi (Gangotri Glacier) and Alaknanda (Satopanth Glacier)",
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
          "note": "Garhwal Himalayas → passes Jim Corbett NP → joins Ganga near Kannauj"
        },
        {
          "name": "Gomti",
          "note": "Only major tributary rising in the plains (Gomat Taal/Fulhar Jheel, Pilibhit) → Lucknow → Saidpur Sangam"
        },
        {
          "name": "Ghaghara (Karnali)",
          "note": "Rises near Gurla Mandhata (Tibet); largest tributary by water volume; joined by Sarda (Kali) → Revelganj (Chhapra)"
        },
        {
          "name": "Gandak",
          "note": "Nepal Himalayas (Dhaulagiri & Mt Everest) → passes Valmiki NP → Sonpur Sangam"
        },
        {
          "name": "Kosi",
          "note": "'Sorrow of Bihar'; 7 streams (Saptakoshi); extreme course shifts & heavy silt load → Kursela Sangam"
        },
        {
          "name": "Mahananda",
          "note": "Last major left-bank tributary; rises in Darjeeling hills → Godagari"
        }
      ],
      "rightBank": [
        {
          "name": "Yamuna",
          "note": "Longest and largest right-bank tributary (1,376 km); rises at Yamunotri Glacier → Triveni Sangam (Prayagraj)"
        },
        {
          "name": "Tamsa (Tons)",
          "note": "Rises in Kaimur Range (MP) → joins downstream of Prayagraj"
        },
        {
          "name": "Son",
          "note": "Rises in Amarkantak Plateau (MP); flows parallel to Kaimur → joins directly on right bank near Patna"
        },
        {
          "name": "Punpun",
          "note": "Rises in Palamu hills (Jharkhand) → joins near Fatuha"
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
        "significance": "Where Ganga leaves the Himalayas and enters the northern plains",
        "state": "Uttarakhand"
      },
      {
        "name": "Kanpur",
        "type": "Economic",
        "significance": "Major industrial metropolis and leather manufacturing hub",
        "state": "Uttar Pradesh"
      },
      {
        "name": "Prayagraj",
        "type": "Cultural",
        "significance": "Ancient Prayag, Triveni Sangam & Maha Kumbh Mela",
        "state": "Uttar Pradesh"
      },
      {
        "name": "Varanasi",
        "type": "Cultural / Historical",
        "significance": "Continuous ancient living city; Kashi Vishwanath Dham",
        "state": "Uttar Pradesh"
      },
      {
        "name": "Patna (Pataliputra)",
        "type": "Historical",
        "significance": "Ancient capital of Magadha, Mauryan and Gupta empires",
        "state": "Bihar"
      },
      {
        "name": "Kolkata",
        "type": "Economic",
        "significance": "Major port city situated on the Hooghly tidal distributary",
        "state": "West Bengal"
      }
    ],
    "dams": [
      {
        "name": "Tehri Dam",
        "state": "Uttarakhand",
        "type": "Highest dam in India (260.5 m, rock & earth-fill on Bhagirathi)"
      },
      {
        "name": "Bhimawala / Pashulok Barrage",
        "state": "Uttarakhand",
        "type": "Rishikesh hydro diversion barrage"
      },
      {
        "name": "Narora Atomic Power Station Barrage",
        "state": "Uttar Pradesh",
        "type": "Cooling water barrage for nuclear station"
      },
      {
        "name": "Kanpur Barrage (Luv Kush Barrage)",
        "state": "Uttar Pradesh",
        "type": "Drinking water barrage for Kanpur city"
      },
      {
        "name": "Farakka Barrage",
        "state": "West Bengal",
        "type": "Diverts Ganga water into Bhagirathi-Hooghly to flush silt from Kolkata Port (1996 Treaty)"
      }
    ],
    "protectedAreas": [
      {
        "name": "Gangotri National Park",
        "relation": "Contains the source glacier (Gaumukh) of the Bhagirathi river",
        "state": "Uttarakhand"
      },
      {
        "name": "Jim Corbett National Park",
        "relation": "Drained by the Ramganga river tributary",
        "state": "Uttarakhand"
      },
      {
        "name": "Dudhwa National Park",
        "relation": "Drained by Suheli and Mohana tributaries in the Ghaghara basin",
        "state": "Uttar Pradesh"
      },
      {
        "name": "Valmiki National Park & Tiger Reserve",
        "relation": "Situated right on the banks of River Gandak in West Champaran",
        "state": "Bihar"
      },
      {
        "name": "Vikramshila Gangetic Dolphin Sanctuary",
        "relation": "50 km designated river sanctuary for the endangered Gangetic Dolphin",
        "state": "Bihar"
      },
      {
        "name": "Sundarbans National Park & Biosphere Reserve",
        "relation": "World's largest mangrove delta formed at Ganga-Brahmaputra confluence",
        "state": "West Bengal"
      }
    ],
    "species": [
      {
        "name": "Gangetic River Dolphin (Susu)",
        "iucn": "Endangered",
        "role": "India's National Aquatic Animal; blind, uses echolocation; freshwater indicator"
      },
      {
        "name": "Gharial (Gavialis gangeticus)",
        "iucn": "Critically Endangered",
        "role": "Fish-eating crocodilian found in tributaries like Chambal and Son"
      },
      {
        "name": "Ganges River Shark (Glyphis gangeticus)",
        "iucn": "Critically Endangered",
        "role": "Extremely rare true freshwater shark endemic to Hooghly and Ganga"
      },
      {
        "name": "Hilsa Fish (Tenualosa ilisha)",
        "iucn": "Least Concern",
        "role": "Anadromous fish; migrates upstream from sea to breed; impacted by Farakka Barrage"
      }
    ],
    "commonMistake": "Remember the West-to-East sequence of left-bank tributaries downstream of Prayagraj: Gomti → Ghaghara → Gandak → Kosi. Also note that Chambal, Betwa, and Ken do NOT join Ganga directly; they join Yamuna!"
  },
  "IND-RIV-02": {
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
  "IND-RIV-03": {
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
  "IND-RIV-04": {
    "length": "1,465 km",
    "origin": "Trimbakeshwar in the Brahmagiri Hills (Nashik district, Maharashtra)",
    "mouth": "Bay of Bengal, forming a sprawling mangrove delta at Coringa (Andhra Pradesh)",
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
          "note": "Rises in Ajanta Hills; joins Godavari near Nanded"
        },
        {
          "name": "Pranhita",
          "note": "Wainganga + Wardha + Penganga combined; largest tributary accounting for 34% basin"
        },
        {
          "name": "Indravati",
          "note": "Rises in Dandakaranya (Odisha); famous for Chitrakote waterfall; joins near Somnoor"
        },
        {
          "name": "Sabari",
          "note": "Rises in Sinkaram Hills (Odisha); joined by Sileru; joins at Kunavaram"
        }
      ],
      "rightBank": [
        {
          "name": "Pravara",
          "note": "Rises in Kalsubai peak; joins Godavari at Nevasa Sangam"
        },
        {
          "name": "Sindphana",
          "note": "Flows from Chhatrapati Sambhajinagar/Beed plateau"
        },
        {
          "name": "Manjira",
          "note": "Only major right-bank tributary; rises in Balaghat range; hosts Nizam Sagar dam"
        },
        {
          "name": "Maner",
          "note": "Rises in Telangana; joins downstream of Sriram Sagar dam"
        }
      ]
    },
    "confluences": [
      {
        "tributary": "Pravara",
        "sangam": "Nevasa Sangam",
        "state": "Maharashtra",
        "note": "Meeting of Pravara and Godavari"
      },
      {
        "tributary": "Manjira",
        "sangam": "Kandakurthi Sangam",
        "state": "Telangana",
        "note": "Tri-confluence of Manjira, Haridra & Godavari"
      },
      {
        "tributary": "Pranhita",
        "sangam": "Kaleshwaram Sangam",
        "state": "Telangana",
        "note": "Pranhita + Godavari; site of Kaleshwaram Lift Project"
      },
      {
        "tributary": "Indravati",
        "sangam": "Somnoor / Bhadrakali",
        "state": "Telangana / Chhattisgarh border"
      },
      {
        "tributary": "Sabari",
        "sangam": "Kunavaram Sangam",
        "state": "Andhra Pradesh"
      }
    ],
    "towns": [
      {
        "name": "Nashik",
        "type": "Cultural",
        "significance": "Trimbakeshwar Jyotirlinga & Kumbh Mela",
        "state": "Maharashtra"
      },
      {
        "name": "Paithan",
        "type": "Historical",
        "significance": "Ancient Pratishthana, capital of the Satavahana dynasty",
        "state": "Maharashtra"
      },
      {
        "name": "Nanded",
        "type": "Cultural",
        "significance": "Sikh Takht Hazur Sahib on Godavari banks",
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
        "type": "Cultural / Economic",
        "significance": "Cultural capital of Andhra delta & Sir Arthur Cotton Barrage",
        "state": "Andhra Pradesh"
      }
    ],
    "dams": [
      {
        "name": "Jayakwadi Dam (Nath Sagar)",
        "state": "Maharashtra",
        "type": "Major irrigation reservoir & bird sanctuary at Paithan"
      },
      {
        "name": "Sriram Sagar Project (Pochampad)",
        "state": "Telangana",
        "type": "Lifeline multipurpose reservoir of northern Telangana"
      },
      {
        "name": "Kaleshwaram Lift Irrigation",
        "state": "Telangana",
        "type": "World's largest multi-stage lift irrigation engineering feat"
      },
      {
        "name": "Polavaram National Irrigation Project",
        "state": "Andhra Pradesh",
        "type": "Interstate multi-purpose terminal reservoir"
      },
      {
        "name": "Dowleswaram Barrage (Arthur Cotton)",
        "state": "Andhra Pradesh",
        "type": "Historic delta canal network headworks"
      }
    ],
    "protectedAreas": [
      {
        "name": "Papikonda National Park",
        "relation": "Godavari cuts a scenic deep gorge right through Papikonda hills in Eastern Ghats",
        "state": "Andhra Pradesh"
      },
      {
        "name": "Indravati National Park",
        "relation": "Indravati river flows along northern boundary (Bastar tiger habitat)",
        "state": "Chhattisgarh"
      },
      {
        "name": "Coringa Wildlife Sanctuary",
        "relation": "Second largest mangrove ecosystem on India's east coast at Godavari estuary",
        "state": "Andhra Pradesh"
      },
      {
        "name": "Tadoba-Andhari Tiger Reserve",
        "relation": "Falls within the wider Pranhita/Wardha basin in Maharashtra",
        "state": "Maharashtra"
      }
    ],
    "species": [
      {
        "name": "Indian Skimmer (Rynchops albicollis)",
        "iucn": "Endangered",
        "role": "Nests on sandbars of the Godavari river delta"
      },
      {
        "name": "Fishing Cat (Prionailurus viverrinus)",
        "iucn": "Vulnerable",
        "role": "Apex wetland predator in the Coringa mangrove delta"
      },
      {
        "name": "Mugger Crocodile",
        "iucn": "Vulnerable",
        "role": "Inhabits the main Godavari channels and Manjira sanctuary"
      }
    ],
    "commonMistake": "UPSC 2015 Question: Indravati and Pranhita are tributaries of Godavari. Pennar and Vamsadhara are independent east-flowing rivers, NOT Godavari tributaries! Also, Bhima is a tributary of Krishna, not Godavari."
  },
  "IND-RIV-05": {
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
  "IND-RIV-06": {
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
  "IND-RIV-07": {
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
  "IND-RIV-08": {
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
  "IND-RIV-09": {
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
  "IND-RIV-10": {
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
  "IND-RIV-11": {
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
  "IND-RIV-12": {
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
  "IND-RIV-13": {
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
  "IND-RIV-14": {
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
  "IND-RIV-15": {
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
  "IND-RIV-16": {
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
  }
};
