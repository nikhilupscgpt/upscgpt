import fs from 'fs';

const questions = [
  {
    "questionNo": 1,
    "srcSubject": "Art & Culture",
    "srcTopic": "Dance, Music, Theatre & Puppetry",
    "stem": "Which one of the following Carnatic music ragas is similar to Raga Bilawal in Hindustani music ?",
    "options": [
      {
        "label": "a",
        "text": "Nat Bhairavi"
      },
      {
        "label": "b",
        "text": "Kamavardhini"
      },
      {
        "label": "c",
        "text": "Hanumatodi"
      },
      {
        "label": "d",
        "text": "Dheera Shankarabharanam"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 2,
    "srcSubject": "Economy",
    "srcTopic": "Balance of Payments & Exchange Rate",
    "stem": "The artificially fixed rupee-sterling exchange rate prescribed by the Hilton-Young Commission (1926) was adopted by the British Government for which one of the following reasons ?",
    "options": [
      {
        "label": "a",
        "text": "Aiding the flow of remittances from India and maintaining India's creditworthiness"
      },
      {
        "label": "b",
        "text": "Providing support to Indian importers"
      },
      {
        "label": "c",
        "text": "Encouraging export of cotton produce from India"
      },
      {
        "label": "d",
        "text": "Preventing depreciation of the Rupee in terms of gold"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 3,
    "srcSubject": "Ancient History",
    "srcTopic": "Ancient History – General",
    "stem": "Consider the following statements :\nI. Pali texts contain the first definite references to coins, e.g., kahapana, nikkha, kamsa, and kakanika.\nII. The literary evidence from Pali texts is corroborated by archaeological evidence of punch-marked coins from many sites, most of them made of silver.\n\nThe above statements have been associated with which of the following ?\n1. Emergence of urban life\n2. Transition to money economy\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "Both 1 and 2"
      },
      {
        "label": "d",
        "text": "Neither 1 nor 2"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 4,
    "srcSubject": "Art & Culture",
    "srcTopic": "Architecture & Sculpture",
    "stem": "Which of the following temples has/have a Nagara-style shikhara ?\n1. Malegitti Shivalaya, Badami\n2. Huchimalligudi Temple, Aihole\n3. Dashavatara Temple, Deogarh\n4. Virupaksha Temple, Pattadakal\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "2 and 3"
      },
      {
        "label": "c",
        "text": "3 only"
      },
      {
        "label": "d",
        "text": "3 and 4"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 5,
    "srcSubject": "Ancient History",
    "srcTopic": "Buddhism & Jainism",
    "stem": "Among the four main forms of existence of life recognized in Jainism, which one of the following is not included ?",
    "options": [
      {
        "label": "a",
        "text": "Deva (gods)"
      },
      {
        "label": "b",
        "text": "Yaksha (demi-gods)"
      },
      {
        "label": "c",
        "text": "Manushya (humans)"
      },
      {
        "label": "d",
        "text": "Tiryancha (animals and plants)"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 6,
    "srcSubject": "Art & Culture",
    "srcTopic": "Painting & Handicrafts",
    "stem": "The Hallisalasya painting in the Bagh Caves represents :",
    "options": [
      {
        "label": "a",
        "text": "A joyous folk dance"
      },
      {
        "label": "b",
        "text": "Buddha in a meditative pose"
      },
      {
        "label": "c",
        "text": "The depiction of Shiva and Parvati on Kailasha"
      },
      {
        "label": "d",
        "text": "Samudramanthan (Churning of the Ocean)"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 7,
    "srcSubject": "Ancient History",
    "srcTopic": "Ancient History – General",
    "stem": "Consider the following statements relating to the use of the place-value system in India :\n1. The earliest epigraphic use of the place-value system in India is found in the Mankani plates from Gujarat (AD 595 - 596).\n2. In the ninth century, place-values become general in inscriptions all over India.\n3. The place-values have been found in Sanskrit inscriptions in South-east Asia as early as the seventh century.\n\nWhich of the statements given above are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1 and 2 only"
      },
      {
        "label": "b",
        "text": "1 and 3 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 8,
    "srcSubject": "Ancient History",
    "srcTopic": "Prehistory & Indus Valley Civilisation",
    "stem": "Consider the following statements about the archaeological findings in Harappan towns :\nI. There is wide occurrence of spindle-whorls in the houses but absence of spinning wheels.\nII. Weights and measurement scales, complete with graduations have been discovered.\nIII. There are houses built in large part with baked bricks, around relatively spacious courtyards, with their own wells, bathing platforms, and large rooms.\n\nWhich of the following inferences can be drawn from the above statements ?\n1. Statement I suggests that spinning was a laborious activity done at home.\n2. Statement II suggests the extent of the scientific knowledge that the Harappans possessed.\n3. Statement III suggests the emergence of a common property system.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 3 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 9,
    "srcSubject": "Modern History",
    "srcTopic": "Revolt of 1857, Tribal & Peasant Movements",
    "stem": "Which one of the following statements about the Eka Movement and Bardoli Satyagraha is correct ?",
    "options": [
      {
        "label": "a",
        "text": "The Eka Movement was throughout supported and organized by the Congress while Bardoli Satyagraha was initially independent of Congress influence and was only in the last stages supported by the Congress."
      },
      {
        "label": "b",
        "text": "The Eka Movement was provided leadership by the taluqdars of Awadh, whereas the Bardoli Satyagraha was a movement of the landless labourers."
      },
      {
        "label": "c",
        "text": "Bardoli Satyagraha was a campaign against the enhancement of land revenue, while the Eka Movement was a protest against excessive extraction of rents."
      },
      {
        "label": "d",
        "text": "The Eka Movement was located in the Varanasi and Mirzapur districts of the present-day U.P., while the Bardoli Satyagraha took place in Saurashtra."
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 10,
    "srcSubject": "Ancient History",
    "srcTopic": "Vedic Age",
    "stem": "Consider the following statements about the Rigvedic period :\nI. Irrigation from wells allowed agriculture to expand away from flood plains and strips on river margins into the present Punjab and Haryana plains having underground water levels reasonably close to the surface.\nII. Draught-animal power was employed to draw up water out of the wells.\n\nWhich of the following information support/supports the above statements ?\n1. There is evidence in the Rigveda of the use of ashma chakra (stone pulley wheel) and ahava (strapped wooden pails) to draw up water.\n2. Mention has been made in the Rigveda of the use of implements like parashu / kulisha (axe) and datra / sreni (sickle).\n3. There is a history of the use of ox, even before the Rigveda, for ploughing the land and pulling the carts.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2 only"
      },
      {
        "label": "b",
        "text": "1, 2 and 3"
      },
      {
        "label": "c",
        "text": "1 and 3 only"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 11,
    "srcSubject": "Geography",
    "srcTopic": "Indian Physiography & Drainage",
    "stem": "Consider the following assertion :\nIn the Pleistocene period either the Yamuna once flowed into the Indus, or the Sutlej flowed into the Yamuna and one major tributary of either had shifted from the Ganga to the Indus or vice versa.\n\nWhich of the following is/are the basis of the above assertion ?\n1. The Nadi-Sukta of the Rigveda\n2. The explorations of the Sutlej and the Yamuna by Robert Bruce Foote\n3. The presence of the same species of dolphins in both the Indus and the Ganga river systems\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "1 and 2"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 12,
    "srcSubject": "Art & Culture",
    "srcTopic": "Architecture & Sculpture",
    "stem": "What does an empty seat represent in early Buddhist iconography ?",
    "options": [
      {
        "label": "a",
        "text": "The meditation of the Buddha"
      },
      {
        "label": "b",
        "text": "The Buddha's First Sermon"
      },
      {
        "label": "c",
        "text": "The Buddha's Mahaparinibbana"
      },
      {
        "label": "d",
        "text": "The Buddha's Mahabhinishkramana"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 13,
    "srcSubject": "Ancient History",
    "srcTopic": "Vedic Age",
    "stem": "Which of the following pairs of ancient and modern names of rivers is/are correctly matched ?\n1. Vitasta : Chenab\n2. Asikni : Jhelum\n3. Parushni : Ravi\n4. Yavyavati : Beas\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "3 and 4"
      },
      {
        "label": "c",
        "text": "3 only"
      },
      {
        "label": "d",
        "text": "4 only"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 14,
    "srcSubject": "Art & Culture",
    "srcTopic": "Architecture & Sculpture",
    "stem": "Which of the following statements on the Amaravati Stupa and its relief sculpture is/are correct ?\n1. It was located in the lower Krishna valley.\n2. In India, it was next only to the Sanchi Stupa in size.\n3. The Amaravati school of sculpture made a lasting impact on the later South Indian sculpture, and its products were carried to Sri Lanka and South-east Asia.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 3 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 15,
    "srcSubject": "Ancient History",
    "srcTopic": "Post-Mauryan & Sangam Age",
    "stem": "Which of the following pairs of the king and his dynasty in early historical Tamilakam is/are not correctly matched ?\n1. Senguttuvan : Chera\n2. Udiyanjeral : Chola\n3. Nedunjeliyan : Pandya\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "1 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 16,
    "srcSubject": "Modern History",
    "srcTopic": "Gandhian Era & Mass Movements (1915-1947)",
    "stem": "Which of the following factors contributed to the formation of the Forward Bloc by Subhas Chandra Bose in 1939 ?\n1. Bose failed to win the confidence of Mahatma Gandhi.\n2. The Congress Left was disunited and failed to support Bose.\n3. The Communists did not support Bose in his endeavours.\n4. The supporters of M.N. Roy and socialist leaders like Jayaprakash Narayan preferred Congress unity to supporting Bose.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "1, 2 and 4"
      },
      {
        "label": "c",
        "text": "1, 3 and 4"
      },
      {
        "label": "d",
        "text": "2 and 4 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 17,
    "srcSubject": "Modern History",
    "srcTopic": "Advent of Europeans & British Expansion",
    "stem": "Consider the following statements regarding the British policy in Awadh immediately after its annexation in 1856 :\n1. The taluqdars were dispossessed of their estates but allowed to retain their arms and forts.\n2. A Summary Revenue Settlement was made in 1856 assuming that the taluqdars were outsiders.\n3. The British believed in taking revenue directly from the peasants by removing the taluqdars.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "2 and 3 only"
      },
      {
        "label": "b",
        "text": "1 and 3 only"
      },
      {
        "label": "c",
        "text": "1, 2 and 3"
      },
      {
        "label": "d",
        "text": "2 only"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 18,
    "srcSubject": "Modern History",
    "srcTopic": "Constitutional & Administrative Developments",
    "stem": "Consider the following assertion :\nThe genesis of political alliances based on community lay in the very nature of the Montagu-Chelmsford Reforms, 1919.\n\nWhich of the following statements support/supports the above assertion ?\n1. Reforms retained and extended the principle of separate electorates.\n2. Separate electorates were supposed to counter Indian nationalism, which was growing stronger.\n3. Deprived classes rallied around the favours inherent in separate electorates.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 19,
    "srcSubject": "Art & Culture",
    "srcTopic": "Dance, Music, Theatre & Puppetry",
    "stem": "Pandit Mallikarjun Mansur, the famous classical singer from Karnataka, represented the :",
    "options": [
      {
        "label": "a",
        "text": "Agra Gharana"
      },
      {
        "label": "b",
        "text": "Gwalior Gharana"
      },
      {
        "label": "c",
        "text": "Patiala Gharana"
      },
      {
        "label": "d",
        "text": "Jaipur-Atrauli Gharana"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 20,
    "srcSubject": "Ancient History",
    "srcTopic": "Vedic Age",
    "stem": "In which one among the following texts does the term kshetra-patni ('mistress of the field') originate ?",
    "options": [
      {
        "label": "a",
        "text": "Rigveda"
      },
      {
        "label": "b",
        "text": "Atharvaveda"
      },
      {
        "label": "c",
        "text": "Ashtadhyayi"
      },
      {
        "label": "d",
        "text": "Arthashastra"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 21,
    "srcSubject": "Environment",
    "srcTopic": "Climate Change",
    "stem": "Consider the following statements with reference to India's response to climate change :\nI. India's Long-Term Low Emission Development Strategy (LT-LEDS) is a crucial tool for achieving net-zero emissions by 2070.\nII. India's 4th Biennial Update Report (BUR-4) submitted in December, 2024 recorded around 8% decrease in Greenhouse gas emissions in 2020 over 2019.\nIII. Climate-resilient development necessarily depends on quick and short-term achievement of emission reduction targets.\n\nWhich of the following relationships among the above statements is/are correct ?\n1. Statement I is empirically supported by statement II.\n2. Statement III contradicts the approach implicit in statement I.\n3. Statement I and statement III together establish the premise of long-term sustainability.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 22,
    "srcSubject": "Environment",
    "srcTopic": "Biodiversity & Conservation",
    "stem": "With respect to the Western Hoolock Gibbons, which of the following statements is/are correct ?\n1. A Sanctuary in North-east India is home to this ape species listed as Endangered in the International Union for Conservation of Nature (IUCN) Red List.\n2. They have specialized brachiation and can easily swing between trees.\n3. They possess a strong and heavy build like gorillas, yet are remarkably agile tree climbers.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 23,
    "srcSubject": "Environment",
    "srcTopic": "Ecology & Ecosystems",
    "stem": "Which of the following best explain(s) the rationale for protecting mangrove ecosystems in the context of climate resilience ?\n1. Mangroves reduce tidal energy and store freshwater, making them ideal sites for paddy cultivation in saline estuarine belts.\n2. Their salt-sensitive roots filter seawater, making mangroves key to converting coastal land into freshwater aquaculture zones.\n3. By withstanding tidal surges and offering biomass resources, mangroves function both as natural bio-shields and livelihood bases for rural communities.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 24,
    "srcSubject": "Economy",
    "srcTopic": "Industry & Infrastructure",
    "stem": "In what way(s) does the Vizhinjam International Seaport represent a structural shift in India's maritime trade and logistics policy ?\n1. By functioning exclusively as a domestic cargo hub to reduce reliance on coastal shipping and eliminate the need for foreign collaborations.\n2. By focusing primarily on passenger cruise tourism and heritage shipping to increase Kerala's profile as a maritime heritage destination.\n3. By leveraging its natural deep draft and strategic location to reduce dependence on foreign trans-shipment ports, enhance revenue retention, and reposition India in regional maritime trade.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 25,
    "srcSubject": "Geography",
    "srcTopic": "Indian Physiography & Drainage",
    "stem": "Identify the river of the Indian sub-continent on the basis of the following information :\n1. It has an antecedent drainage system.\n2. It flows through three countries.\n3. It originates in the Tibetan Plateau and is an important river for irrigation.\n4. It does not form distributaries.\n\nSelect the answer from the following :",
    "options": [
      {
        "label": "a",
        "text": "Brahmaputra"
      },
      {
        "label": "b",
        "text": "Indus"
      },
      {
        "label": "c",
        "text": "Sutlej"
      },
      {
        "label": "d",
        "text": "Teesta"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 26,
    "srcSubject": "Geography",
    "srcTopic": "Indian Physiography & Drainage",
    "stem": "Which of the following with reference to Indian States is/are not correct ?\n1. Uttar Pradesh shares its boundary with the highest number of other Indian States.\n2. Rajasthan shares the longest international border among all Indian States.\n3. Sikkim is the only State that shares its boundary with just one other Indian State.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 27,
    "srcSubject": "Environment",
    "srcTopic": "Biodiversity & Conservation",
    "stem": "Which of the following statements with regard to the arrival of Amur Falcons at Doyang Lake in Nagaland each year from Mongolia is/are correct ?\n1. It showcases how sustained local conservation efforts can contribute to the arrival and protection of international migratory birds.\n2. It reflects the global success of advanced tracking technologies that guide migratory birds back to their stopover sites.\n3. It confirms that Amur Falcons have adapted to permanent residency in India due to favourable habitat changes.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 28,
    "srcSubject": "Agriculture",
    "srcTopic": "Agricultural Credit & Schemes",
    "stem": "Which among the following is/are the objective(s) of the Rainfed Area Development (RAD) initiative under the National Mission for Sustainable Agriculture (NMSA) ?\n1. Encouraging monoculture in rainfed areas\n2. Increasing rice cultivation in irrigated regions\n3. Enhancing productivity and minimising climatic risks through Integrated Farming Systems (IFS)\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 29,
    "srcSubject": "Economy",
    "srcTopic": "Industry & Infrastructure",
    "stem": "Which of the following is/are the most significant implication(s) of obtaining Oeko-Tex certification for Eri Silk in the global textile industry ?\n1. It allows Indian exporters to compete in high-end markets that prioritise chemical-free products.\n2. It confirms that Eri Silk meets international safety, environmental, and quality standards, enabling its entry into premium eco-conscious markets.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "Both 1 and 2"
      },
      {
        "label": "d",
        "text": "Neither 1 nor 2"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 30,
    "srcSubject": "Geography",
    "srcTopic": "World Geography & Places",
    "stem": "Ships from which of the following countries have to cross the Strait of Hormuz to reach out to the Indian Ocean ?\n1. Bahrain\n2. Syria\n3. Qatar\n4. Egypt\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "1 and 3"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 and 4"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 31,
    "srcSubject": "Geography",
    "srcTopic": "Geomorphology",
    "stem": "Tungurahua Volcano, which was declared a Global Geopark by UNESCO in 2025, is situated in which one among the following countries ?",
    "options": [
      {
        "label": "a",
        "text": "Ecuador"
      },
      {
        "label": "b",
        "text": "Peru"
      },
      {
        "label": "c",
        "text": "Bolivia"
      },
      {
        "label": "d",
        "text": "Colombia"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 32,
    "srcSubject": "Environment",
    "srcTopic": "Biodiversity & Conservation",
    "stem": "With reference to Madhav National Park, which of the following statements is/are correct ?\n1. It was declared a Tiger Reserve in India in 2025.\n2. Sakhya Sagar, which is designated as a Ramsar Site, is situated within this National Park.\n3. Its area is shared between Madhya Pradesh and Rajasthan.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 33,
    "srcSubject": "Geography",
    "srcTopic": "Climatology",
    "stem": "With reference to the climate of Andaman and Nicobar Islands, which of the following statements is/are correct ?\n1. The climate can be defined as a humid, tropical coastal climate.\n2. It receives rainfall from both South-west monsoon and North-east monsoon.\n3. Maximum precipitation is between December and May.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 34,
    "srcSubject": "Geography",
    "srcTopic": "Indian Physiography & Drainage",
    "stem": "Which of the following geographical features or phenomena is/are associated with the Peninsular Block of India ?\n1. Submergence of parts of the western coast due to tectonic activity\n2. Presence of residual mountain ranges such as the Veliconda hills and Mahendragiri hills\n3. Deep, V-shaped river valleys formed by fast-flowing rivers\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 35,
    "srcSubject": "Economy",
    "srcTopic": "Industry & Infrastructure",
    "stem": "Consider the following statements with reference to the Sagarmala Programme of the Government of India :\nI. The Sagarmala Programme seeks to achieve port-led economic growth through cost-effective and sustainable coastal infrastructure.\nII. The success of the Sagarmala Programme is reflected in significant growth in coastal and inland waterway shipping, along with improved global port rankings.\nIII. Sagarmala 2.0 aims to position India as a global maritime innovation hub aligned with Atmanirbhar Bharat and Viksit Bharat 2047 visions.\n\nWhich of the following relationships among the above statements is/are correct ?\n1. Statement II validates the effectiveness of the strategies envisioned in statement I.\n2. Statement III extends the objectives of statement I by embedding them into a future-oriented innovation framework.\n3. Statement I contradicts statement III by focusing only on traditional infrastructure instead of modern innovation.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 36,
    "srcSubject": "Environment",
    "srcTopic": "Biodiversity & Conservation",
    "stem": "Consider the following statements about Rhynchostylis retusa (Foxtail orchid) :\n1. It is an epiphytic orchid.\n2. The species is endemic to North-east India.\n3. It is the State flower of Arunachal Pradesh and Assam.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 3"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 37,
    "srcSubject": "Art & Culture",
    "srcTopic": "Architecture & Sculpture",
    "stem": "Which one of the following statements with regard to the Moidams, built by the Tai-Ahom kingdom and inscribed as a World Heritage Site by UNESCO, is/are correct ?\n1. They acted as army fortresses.\n2. They were recreation centres of the Royals and Nobles.\n3. They were burial grounds of the Royals and Nobles.\n4. They were battle drill centres of the Royals and Nobles.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 3"
      },
      {
        "label": "c",
        "text": "3 only"
      },
      {
        "label": "d",
        "text": "2 and 4"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 38,
    "srcSubject": "Environment",
    "srcTopic": "Ecology & Ecosystems",
    "stem": "At the United Nations Ocean Conference (UNOC) held in June, 2025 in France, the Food and Agricultural Organization (FAO) of the United Nations demonstrated its leading voice on marine and ocean issues, especially on sustainable fisheries and aquaculture for livelihood resilient \"Blue Transformation\".\n\nWhich of the following combinations about the \"Four Betters\" proposed by FAO for \"Blue Transformation\" is correct ?",
    "options": [
      {
        "label": "a",
        "text": "Better production, better nutrition, better environment and better ocean"
      },
      {
        "label": "b",
        "text": "Better production, better nutrition, better environment and better life"
      },
      {
        "label": "c",
        "text": "Better coral reefs, better nutrition, better environment and better life"
      },
      {
        "label": "d",
        "text": "Better estuaries, better nutrition, better environment and better mangrove vegetation"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 39,
    "srcSubject": "Geography",
    "srcTopic": "World Geography & Places",
    "stem": "Which of the following statements with reference to Lake Turkana is/are correct ?\n1. It is the largest desert lake in the world.\n2. The lake is situated in South Sudan along the eastern fringe of the Sahara desert.\n3. The lake is listed as a UNESCO World Heritage Site and is also referred to as the 'Jade Sea'.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 3 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 40,
    "srcSubject": "Environment",
    "srcTopic": "Climate Change",
    "stem": "Which one of the following is the first Plan Vivo certified Reducing Emissions from Deforestation and Forest Degradation (REDD+) project in India ?",
    "options": [
      {
        "label": "a",
        "text": "Uttarakhand REDD+ project"
      },
      {
        "label": "b",
        "text": "ICFRE-ICIMOD Transboundary REDD+ project in North-Eastern Himalayas"
      },
      {
        "label": "c",
        "text": "Khasi Hills Community REDD+ project"
      },
      {
        "label": "d",
        "text": "Sikkim Mamley Kamrang Community REDD+ project"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 41,
    "srcSubject": "Science & Technology",
    "srcTopic": "Biotechnology & Genetics",
    "stem": "Which of the following statements with regard to genetic medicine is/are correct ?\n1. Genetic medicines correct/compensate for the faulty genes responsible for disease.\n2. Engineered viruses and lipid nanoparticles are used as carriers of the genetic medicine.\n3. Genetic medicines alter the entire DNA sequence.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 42,
    "srcSubject": "Science & Technology",
    "srcTopic": "IT, Communication & Computing",
    "stem": "Which of the following statements with regard to Large Language Models (LLMs) used in machine learning is/are correct ?\n1. LLMs assign probabilities to the next possible words and then pick the one with the highest probability.\n2. LLMs process data through mathematical optimization to minimise prediction errors.\n3. LLMs produce unbiased outputs.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "1 and 2 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 43,
    "srcSubject": "Science & Technology",
    "srcTopic": "Defence Technology",
    "stem": "Which of the following statements with regard to stealth technology is/are correct ?\n1. Stealth objects have a very small radar cross-section and are coated with Radar Absorbing Material.\n2. Stealth objects can be detected using specific frequencies.\n3. Stealth objects are coated with metamaterials to increase the scattering of electromagnetic radiation.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 44,
    "srcSubject": "Science & Technology",
    "srcTopic": "Defence Technology",
    "stem": "Which of the following statements with regard to Black Boxes used in modern aircrafts is/are correct ?\n1. They carry a beacon emitting red light pulses to facilitate underwater detection.\n2. They record both the cockpit voice and flight data.\n3. Their memory units are made using either stainless steel or titanium.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 45,
    "srcSubject": "Science & Technology",
    "srcTopic": "Nuclear & Energy Technology",
    "stem": "Which of the following statements with regard to Green Hydrogen is/are correct ?\n1. It is decarbonized hydrogen obtained from natural gas reforming combined with carbon capture and storage (CCS).\n2. It is produced using electrolysis of water with electricity generated by renewable energy.\n3. National Green Hydrogen Mission of India aims for abatement of nearly 50 MMT of annual greenhouse gas emissions by 2030.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 46,
    "srcSubject": "Science & Technology",
    "srcTopic": "Space Technology",
    "stem": "Consider the following statements with regard to involvement of private entities in India's space programme :\n1. The Indian National Space Promotion and Authorisation Centre (IN-SPACe) is an autonomous agency formed to facilitate participation of private entities.\n2. Agnikul Cosmos launched the world's first flight using 3D-printed rocket engine.\n3. Skyroot Aerospace has developed liquid fuel for GSLV.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 47,
    "srcSubject": "Science & Technology",
    "srcTopic": "Defence Technology",
    "stem": "Which of the following statements with regard to drone swarms is/are correct ?\n1. They use Terahertz band of frequency to communicate with the command centre.\n2. Individual drones in the swarm can communicate with other drones in the swarm.\n3. GPS Spoofing is a commonly used technique to counter drone swarm attack.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 48,
    "srcSubject": "Science & Technology",
    "srcTopic": "Biotechnology & Genetics",
    "stem": "Which of the following statements with regard to GenomeIndia Project is/are correct ?\n1. It is a part of the Human Genome Project.\n2. The project is funded by the Department of Biotechnology (DBT), Government of India.\n3. Its primary aim is to build a catalogue of genetic diversity of the Indian population.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 49,
    "srcSubject": "Science & Technology",
    "srcTopic": "IT, Communication & Computing",
    "stem": "Which of the following statements with regard to the National Quantum Mission (NQM) is/are correct ?\n1. It aims at developing intermediate-scale quantum computers with 50 - 1000 physical qubits.\n2. Its implementation includes setting up of four Thematic Hubs (T-Hubs) in academic and national R&D institutes across India.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "Both 1 and 2"
      },
      {
        "label": "d",
        "text": "Neither 1 nor 2"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 50,
    "srcSubject": "Science & Technology",
    "srcTopic": "General Science",
    "stem": "Which of the following statements with regard to India's Deep Ocean Mission is/are correct ?\n1. It was launched by the Ministry of Ports, Shipping and Waterways, Government of India.\n2. Matsya-6000 has been designed to carry 3 people for deep sea exploration.\n3. Samudrayaan is a project under this mission.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 51,
    "srcSubject": "Indian Polity",
    "srcTopic": "Miscellaneous",
    "stem": "Mr. X, a senior officer, was overseeing a critical vaccination programme during a pandemic. He found that a private service provider responsible for vaccine distribution was compromising on quality to make profits. Despite immense pressure to manage the issue due to vested interests, he raised his voice based on the principles of public administration which he learnt during various training programmes attended across his career. He reported the issue to the appropriate vigilance authority and halted the contract to ensure citizen welfare.\n\nWhich one among the following principles of public administration was most strongly demonstrated by Mr. X's actions ?",
    "options": [
      {
        "label": "a",
        "text": "Esprit de corps"
      },
      {
        "label": "b",
        "text": "Equity"
      },
      {
        "label": "c",
        "text": "Accountability"
      },
      {
        "label": "d",
        "text": "Delegation"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 52,
    "srcSubject": "Indian Polity",
    "srcTopic": "Miscellaneous",
    "stem": "As a responsible Government official, you are tasked with resolving the situation through mediation, ensuring a sustainable outcome that balances environmental needs, tribal rights, and urban public health.\n\nConsider the following statements with reference to the above :\n1. A successful conflict resolution process must begin with acknowledging the cultural concerns of the protesting tribal community before discussing technical alternatives.\n2. The Government should move ahead with the project without delay to address urban health concerns, which outweigh the sentiments of a small group.\n3. Creating a multi-stakeholder dialogue platform - including tribal leaders, environmental experts, and municipal representatives - to build mutual understanding and help de-escalate tensions.\n4. Conducting an independent Environmental and Social Impact Assessment (ESIA) and sharing findings transparently with both sides to facilitate evidence-based decision-making.\n\nWhich of the statements given above would contribute to the resolution process ?",
    "options": [
      {
        "label": "a",
        "text": "1, 3 and 4 only"
      },
      {
        "label": "b",
        "text": "2, 3 and 4 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1, 2, 3 and 4"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 53,
    "srcSubject": "Indian Polity",
    "srcTopic": "Miscellaneous",
    "stem": "Ms. X is a mid-level civil service official working in the urban development department of a major city. Recently, she was involved in approving a contract for a public infrastructure project - a new community park. During the approval process, she received a piece of confidential information indicating that one of the shortlisted contractors had a history of poor workmanship and allegations of corruption in other cities, though nothing had been legally proven. The Head of the Department, Mr. Y, advised her not to disclose this information to the project committee or the public because it could delay the project and damage the city's reputation. However, Ms. X believed that withholding such information compromised transparency and public trust.\n\nWhat amongst the following should Ms. X do now ?\n1. Immediately disclose the information to the project committee and the public\n2. Recommend removing the contractor from the shortlist to protect the project's integrity\n3. Propose a 'limited disclosure' to an oversight committee, while keeping the information confidential from the public for the time being\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2 only"
      },
      {
        "label": "b",
        "text": "3 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 54,
    "srcSubject": "Indian Polity",
    "srcTopic": "Fundamental Rights",
    "stem": "'X' was addressing a seminar on the meaning of the term 'law' as provided under Article 13, Part III of the Constitution of India. 'X' explained that the meaning of the term 'law' in the Constitution of India was very comprehensive. It included ordinances, orders and even rules and regulations. 'Y' pointed out that the term 'law' in Article 13 also included custom or usage having in the territory of India the force of law, to which 'X' was not convinced.\n\nBased on the above, select the correct conclusion from the options given below :",
    "options": [
      {
        "label": "a",
        "text": "'X' is correct in the interpretation of law, including the view on non-inclusion of custom."
      },
      {
        "label": "b",
        "text": "The view of 'Y' that 'law' included custom is not correct."
      },
      {
        "label": "c",
        "text": "The views of both 'X' and 'Y' are correct."
      },
      {
        "label": "d",
        "text": "The view of only 'Y' is correct."
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 55,
    "srcSubject": "Indian Polity",
    "srcTopic": "Salient Features of the Constitution",
    "stem": "Consider the following statements with reference to the Constitution of India :\n1. There is no Article in the Constitution of India that specifies that the Constitution of India will be officially called the 'Constitution of India'.\n2. There is no Article in the Constitution of India that specifies that the Indian Independence Act, 1947 and the Government of India Act, 1935 stand repealed.\n3. There is no Article in the Constitution of India that mentions 26th January, 1950 as the date of the commencement of the Constitution of India.\n\nWhich one of the following conclusions based on the above statements is correct ?",
    "options": [
      {
        "label": "a",
        "text": "All three statements are correct."
      },
      {
        "label": "b",
        "text": "There is no correct statement."
      },
      {
        "label": "c",
        "text": "There are two correct statements that include statement 3."
      },
      {
        "label": "d",
        "text": "There is only one correct statement."
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 56,
    "srcSubject": "Indian Polity",
    "srcTopic": "Salient Features of the Constitution",
    "stem": "Which of the following statements with regard to the persons with disabilities in India is/are correct ?\n1. The Rights of Persons with Disabilities Act, an Act passed by the Parliament of India in 2018, mandates reservation in education and employment, places a legal duty on Governments to ensure accessibility and non-discrimination.\n2. The Sugamya Bharat Abhiyan focuses on achieving universal accessibility for Persons with Disabilities across three key domains - built infrastructure, transport systems and information and communication technology.\n3. The National Divyangjan Finance and Development Corporation (NDFDC) is a public sector organisation set up by the Ministry of Corporate Affairs as a not-for-profit company to promote entrepreneurship among Persons with Disabilities (PwDs).\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "1 and 3"
      },
      {
        "label": "d",
        "text": "1 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 57,
    "srcSubject": "Indian Polity",
    "srcTopic": "Scheduled & Tribal Areas",
    "stem": "Consider the following statements about the provisions pertaining to the Scheduled Castes and the Scheduled Tribes in India :\n1. Provisions regarding the administration of the Tribal Areas in the States of Assam, Meghalaya, Tripura and Mizoram are given in the Fifth Schedule of the Constitution of India.\n2. Some tribes of India are entitled to exemption from paying Income Tax on certain incomes.\n3. The Constitution of India provides for reservation of seats in Panchayats for women belonging to the Scheduled Castes and the Scheduled Tribes.\n\nWhich one of the following conclusions based on the above statements is correct ?",
    "options": [
      {
        "label": "a",
        "text": "There are two correct statements, that include statement 2."
      },
      {
        "label": "b",
        "text": "There are two correct statements, that are statements 1 and 3."
      },
      {
        "label": "c",
        "text": "There is only one correct statement."
      },
      {
        "label": "d",
        "text": "All three statements are correct."
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 58,
    "srcSubject": "Indian Polity",
    "srcTopic": "Parliament",
    "stem": "Consider the following statements in respect of questions asked by the Members in the Parliament of India :\n1. Unstarred questions are those to which a Member desires an oral answer in the House.\n2. Starred questions are those to which a Member desires a written answer.\n3. No supplementary question can be asked on an unstarred question.\n\nWhich one of the following conclusions based on the above statements is correct ?",
    "options": [
      {
        "label": "a",
        "text": "All the three statements are correct."
      },
      {
        "label": "b",
        "text": "There are two correct statements, that include statement 2."
      },
      {
        "label": "c",
        "text": "There is only one correct statement."
      },
      {
        "label": "d",
        "text": "There is no correct statement."
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 59,
    "srcSubject": "Indian Polity",
    "srcTopic": "Parliamentary Committees",
    "stem": "Consider the following statements about the Committee on the Welfare of Scheduled Castes and Scheduled Tribes of the Parliament of India :\n1. Although members of this Committee are elected from both Houses of Parliament, the Chairperson of this Committee is appointed by the Chairman of the Rajya Sabha.\n2. Twenty members are elected by the Rajya Sabha and ten members by the Lok Sabha.\n3. No Minister, except for the Union Minister of Social Justice and Empowerment, is eligible to be a member of this Committee.\n4. Members are elected for a fixed term of two years from the date they enter their office.\n\nWhich one of the following conclusions based on the above statements is correct ?",
    "options": [
      {
        "label": "a",
        "text": "There are four correct statements."
      },
      {
        "label": "b",
        "text": "There is only one correct statement, that is statement 2."
      },
      {
        "label": "c",
        "text": "There are two correct statements, that include statement 1."
      },
      {
        "label": "d",
        "text": "There is no correct statement."
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 60,
    "srcSubject": "Science & Technology",
    "srcTopic": "Defence Technology",
    "stem": "Consider the following statements about Mission Sudarshan Chakra of India :\n1. It aims to enhance India's air defence, ballistic missile defence and aerial offensive capabilities.\n2. This Mission is being designed to enhance rapid defence response and strategic autonomy.\n3. One of the aims of this Mission is to cover all public places of India by an expanded nationwide security shield by 2035.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "1 and 2 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "1 only"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 61,
    "srcSubject": "Geography",
    "srcTopic": "Industry, Transport & Trade",
    "stem": "Consider the following statements about river bridges connecting India with neighbouring countries :\n1. 'Maitri Setu', built over Feni river, connects Ramgarh in India with Sabroom in Bangladesh.\n2. Jhulaghat suspension bridge connects India with Myanmar.\n3. Mechi bridge and its approaches connect Panitanki Bypass in India with Kakarvitta in Nepal.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "2 and 3"
      },
      {
        "label": "c",
        "text": "1 only"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 62,
    "srcSubject": "Indian Polity",
    "srcTopic": "Salient Features of the Constitution",
    "stem": "Which of the following statements about a Zero First Information Report (Zero FIR) under the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 is/are correct ?\n1. A Zero FIR can be lodged at a police station, even though the place of commission of a cognizable/non-cognizable offence is outside the territorial jurisdiction of that police station.\n2. The Officer-in-Charge of the police station where a Zero FIR has been lodged may, with the permission of the competent authority, initiate preliminary enquiry.\n3. Under Zero FIR, it is obligatory for the informant to furnish information electronically.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 only"
      },
      {
        "label": "d",
        "text": "2 only"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 63,
    "srcSubject": "Indian Polity",
    "srcTopic": "Union Executive & Ministries",
    "stem": "With reference to the organisations under the Government of India, consider the following details :\n\nSl. No. | Organisation | Function | Controlling Union Ministry\n1. | Central Economic Intelligence Bureau (CEIB) | To coordinate between various law enforcement agencies | Ministry of Home Affairs\n2. | Serious Fraud Investigation Office (SFIO) | To investigate complex corporate frauds | Ministry of Finance\n3. | Central Bureau of Investigation (CBI) | To preserve values in public life and ensure the health of the national economy | Ministry of Personnel, Public Grievances and Pensions\n\nIn how many of the above rows are the given details correctly matched ?",
    "options": [
      {
        "label": "a",
        "text": "1"
      },
      {
        "label": "b",
        "text": "2"
      },
      {
        "label": "c",
        "text": "3"
      },
      {
        "label": "d",
        "text": "None"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 64,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Which of the following international conventions have not been ratified by India ?\n1. Employment Policy Convention\n2. Abolition of Forced Labour Convention\n3. International Convention on the Protection of the Rights of All Migrant Workers and Members of Their Families\n4. Geneva Convention Relative to the Protection of Civilian Persons in Time of War\n5. Convention on Reduction of Statelessness\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "2 and 4"
      },
      {
        "label": "b",
        "text": "1 and 2"
      },
      {
        "label": "c",
        "text": "3 and 4 only"
      },
      {
        "label": "d",
        "text": "3, 4 and 5"
      }
    ],
    "correctLabel": null
  },
  {
    "questionNo": 65,
    "srcSubject": "Science & Technology",
    "srcTopic": "IT, Communication & Computing",
    "stem": "Consider the following statements with respect to the AI Impact Summit, 2026 held in New Delhi :\n1. The Summit's intellectual framework was based on three foundational Sutras : People, Planning, and Progress.\n2. The Preamble of the Summit stresses Democratising AI Resources, which acknowledges the Charter for Democratic Diffusion of AI as a binding framework to support locally relevant innovation and strengthen resilient AI ecosystems while respecting national laws.\n3. The New Delhi Declaration on AI Impact was structured around seven Chakras (Pillars), which included Access for Social Empowerment, AI for Science, and Secure and Trusted AI.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "1 and 2 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 66,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Which of the following connectivity projects is/are a part of cooperation between India and the ASEAN member countries ?\n1. Kaladan Multi-Modal Transit Transport Project\n2. IMT Trilateral Highway\n3. Agartala-Akhaura Rail Line\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "2 and 3"
      },
      {
        "label": "c",
        "text": "1 and 3"
      },
      {
        "label": "d",
        "text": "2 only"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 67,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Match List I with List II and select the answer using the code given below the Lists :\n\nList I (Project Supported by India) | List II (Country)\nA. Mangdechhu Hydroelectric Project | 1. Maldives\nB. Restoration of Stor Palace | 2. Afghanistan\nC. District Hospital at Dickoya | 3. Bhutan\nD. Institute of Security and Law Enforcement Studies | 4. Sri Lanka\n\nCode :\n     A  B  C  D",
    "options": [
      {
        "label": "a",
        "text": "1  4  2  3"
      },
      {
        "label": "b",
        "text": "3  2  4  1"
      },
      {
        "label": "c",
        "text": "3  4  2  1"
      },
      {
        "label": "d",
        "text": "1  2  4  3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 68,
    "srcSubject": "Science & Technology",
    "srcTopic": "Defence Technology",
    "stem": "Which of the following items of defence hardware is/are manufactured in India ?\n1. Su-30 MKI Fighter Jets\n2. T-90 MK-III Tanks\n3. Akula Class Submarine\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "1 and 3"
      },
      {
        "label": "c",
        "text": "1 only"
      },
      {
        "label": "d",
        "text": "2 only"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 69,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Consider the following statements about platforms for multilateral co-operation :\n1. The 'Colombo Process' is a regional consultative process in which member states take binding decisions by consensus.\n2. The 'Abu Dhabi Dialogue' is a voluntary non-binding consultative process among Asian countries of labour origin and destination to facilitate regional cooperation on contractual labour mobility.\n3. The 'Global Forum for Migration and Development', created upon the proposal of a former UN Secretary General, is a voluntary forum whose decisions are non-binding in nature.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "1 and 3 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "2 only"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 70,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Consider the following UN organisations / agencies :\n1. World Food Programme\n2. United Nations Children's Fund\n3. United Nations High Commissioner for Refugees\n4. International Labour Organisation\n\nHow many of the above has/have been awarded the Nobel Prize twice ?",
    "options": [
      {
        "label": "a",
        "text": "1"
      },
      {
        "label": "b",
        "text": "2"
      },
      {
        "label": "c",
        "text": "3"
      },
      {
        "label": "d",
        "text": "4"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 71,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Match List I with List II and select the answer using the code given below the Lists :\n\nList I (UN Peacekeeping Operation) | List II (Period of Operation)\nA. UNMIL | 1. 2007 - 2010\nB. MINURCAT | 2. 2002 - 2005\nC. MINUSTAH | 3. 2003 - 2018\nD. UNMISET | 4. 2004 - 2017\n\nCode :\n     A  B  C  D",
    "options": [
      {
        "label": "a",
        "text": "3  4  1  2"
      },
      {
        "label": "b",
        "text": "3  1  4  2"
      },
      {
        "label": "c",
        "text": "2  1  4  3"
      },
      {
        "label": "d",
        "text": "2  4  1  3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 72,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Match List I with List II and select the answer using the code given below the Lists :\n\nList I (BIMSTEC Centre / Establishment) | List II (Location)\nA. BIMSTEC Cultural Industries Observatory | 1. NOIDA\nB. BIMSTEC Energy Centre | 2. Bengaluru\nC. BIMSTEC Centre for Weather and Climate | 3. Colombo\nD. BIMSTEC Technology Transfer Facility | 4. Thimphu\n\nCode :\n     A  B  C  D",
    "options": [
      {
        "label": "a",
        "text": "3  2  1  4"
      },
      {
        "label": "b",
        "text": "3  1  2  4"
      },
      {
        "label": "c",
        "text": "4  2  1  3"
      },
      {
        "label": "d",
        "text": "4  1  2  3"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 73,
    "srcSubject": "Indian Polity",
    "srcTopic": "Miscellaneous",
    "stem": "Which one of the following pairs is not correctly matched ?\n(Indian Army Corps) : (Headquarters)",
    "options": [
      {
        "label": "a",
        "text": "3 Corps : Dimapur"
      },
      {
        "label": "b",
        "text": "4 Corps : Tezpur"
      },
      {
        "label": "c",
        "text": "14 Corps : Leh"
      },
      {
        "label": "d",
        "text": "33 Corps : Srinagar"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 74,
    "srcSubject": "Indian Polity",
    "srcTopic": "Panchayati Raj",
    "stem": "Which of the following statements with respect to the Revamped Rashtriya Gram Swaraj Abhiyan (RGSA) is/are correct ?\n1. The period of its implementation is 1st April, 2021 to 31st March, 2026.\n2. The key objective of the Revamped RGSA is to develop the governance capabilities of the Panchayati Raj Institutions to deliver on the Sustainable Development Goals.\n3. The share of the Central funding for the Revamped RGSA is 100% for all States and Union Territories.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "1 and 3"
      },
      {
        "label": "d",
        "text": "2 and 3"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 75,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Which of the following countries are members of the European Union ?\n1. Belarus\n2. Poland\n3. Germany\n4. Switzerland\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 4"
      },
      {
        "label": "b",
        "text": "1 and 4 only"
      },
      {
        "label": "c",
        "text": "2 and 3"
      },
      {
        "label": "d",
        "text": "2 and 4 only"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 76,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "Match List I with List II and select the answer using the code given below the Lists :\n\nList I (INTERPOL Notice) | List II (Description)\nA. Silver Notice | 1. To seek information on unidentified bodies\nB. Blue Notice | 2. To collect additional information about a person's identity, location, or activities in relation to a criminal investigation\nC. Black Notice | 3. To provide warning about a person's criminal activities, where the person is considered to be a possible threat to public safety\nD. Green Notice | 4. To identify and trace criminal assets\n\nCode :\n     A  B  C  D",
    "options": [
      {
        "label": "a",
        "text": "3  1  2  4"
      },
      {
        "label": "b",
        "text": "3  2  1  4"
      },
      {
        "label": "c",
        "text": "4  2  1  3"
      },
      {
        "label": "d",
        "text": "4  1  2  3"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 77,
    "srcSubject": "Environment",
    "srcTopic": "Environmental Laws, Policies & Institutions",
    "stem": "Which of the following statements in relation to NIRANTAR (National Institute for Research and Application of Natural Resources to Transform, Adapt and Build Resilience), a platform of institutions under the Ministry of Environment, Forest and Climate Change, is/are correct ?\n1. Ecosystem Survey and Analysis is a vertical under this platform, the lead institute of which is Botanical Survey of India, Kolkata.\n2. Research and Management of Ecosystem Service is a vertical under this platform, the lead institute of which is Central Zoo Authority, New Delhi.\n3. Capacity Development Support is a vertical under this platform, the lead institute of which is Indian Institute of Forest Management, Bhopal.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "1 and 3 only"
      },
      {
        "label": "c",
        "text": "2 only"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 78,
    "srcSubject": "Indian Polity",
    "srcTopic": "International Organisations & Relations",
    "stem": "The Chancellor of the Federal Republic of Germany visited India in January, 2026. Which of the following is/are not correct in terms of outcomes of this visit ?\n1. Signing of a Memorandum of Understanding between the All India Institute of Ayurveda and the University of Hamburg\n2. Signing of a Memorandum of Understanding on Youth Hockey Development between Hockey India and the German Hockey Federation\n3. Establishment of a bilateral dialogue mechanism on the Indo-Pacific\n4. Opening of an Honorary Consul of Germany in Lucknow\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "2 and 3"
      },
      {
        "label": "b",
        "text": "1 and 4"
      },
      {
        "label": "c",
        "text": "3 and 4"
      },
      {
        "label": "d",
        "text": "1 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 79,
    "srcSubject": "Science & Technology",
    "srcTopic": "IT, Communication & Computing",
    "stem": "Which of the following statements about DHRUV64 is/are correct ?\n1. It is the third chip fabricated under the DIR-V Programme with an overall aim to enable the creation of microprocessors for India.\n2. It is India's first homegrown 1.0 GHz, 64-bit dual-core microprocessor.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "Both 1 and 2"
      },
      {
        "label": "d",
        "text": "Neither 1 nor 2"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 80,
    "srcSubject": "Science & Technology",
    "srcTopic": "Defence Technology",
    "stem": "The Bureau of Indian Standard (BIS) recently introduced a national standard to test and assess bomb disposal system. Which of the following statements with regard to this system is/are correct ?\n1. The new standard is known as IS 19445 : 2025.\n2. It will improve interoperability of equipment across agencies.\n3. It was developed by TBRL, DRDO in collaboration with the 30th Central Scientific Research Institute, Russia.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1 only"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 81,
    "srcSubject": "Science & Technology",
    "srcTopic": "Physics",
    "stem": "'X', born in the UK, was conferred the Nobel Prize in 2025. He was a professor in an American university when this prize was announced. Identify 'X' :",
    "options": [
      {
        "label": "a",
        "text": "Michel H. Devoret"
      },
      {
        "label": "b",
        "text": "Richard Robson"
      },
      {
        "label": "c",
        "text": "John Clarke"
      },
      {
        "label": "d",
        "text": "Joel Mokyr"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 82,
    "srcSubject": "Modern History",
    "srcTopic": "Personalities, Press & Culture",
    "stem": "Which of the following statements with regard to the Grand Slam Tennis Tournaments is/are correct ?\n1. The tournaments have a shared governance structure establishing the partnership among the four Grand Slam tournaments.\n2. They are open for entry to all internationally ranked tennis players above the age of 14.\n3. There is a limitation on the number of 'Wild Cards' a player may receive to compete in a Grand Slam Tournament.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 2 only"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 only"
      },
      {
        "label": "d",
        "text": "1, 2 and 3"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 83,
    "srcSubject": "Economy",
    "srcTopic": "Industry & Infrastructure",
    "stem": "Which one of the following pairs of semiconductor plants in India and their locations is not correctly matched ?\n\n(Semiconductor Plant) : (Location)",
    "options": [
      {
        "label": "a",
        "text": "CG Power and Industrial Solutions Pvt. Ltd. in partnership with Renesas Electronics and STARS Microelectronics : Gujarat"
      },
      {
        "label": "b",
        "text": "Tata Semiconductor Assembly and Test Pvt. Ltd. : Assam"
      },
      {
        "label": "c",
        "text": "HCL-Foxconn Joint Venture India Chip Ltd. : Madhya Pradesh"
      },
      {
        "label": "d",
        "text": "SicSem Pvt. Ltd. : Odisha"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 84,
    "srcSubject": "Science & Technology",
    "srcTopic": "General Science",
    "stem": "Which of the following statements with regard to India's indigenous new high resolution weather model, the 'Bharat Forecast System,' is/are correct ?\n1. Its objective is to generate forecasts at the Panchayats cluster level.\n2. It was developed by IIT Delhi.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "Both 1 and 2"
      },
      {
        "label": "d",
        "text": "Neither 1 nor 2"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 85,
    "srcSubject": "Art & Culture",
    "srcTopic": "Festivals, Martial Arts & Miscellaneous Culture",
    "stem": "Consider the following statements with regard to the film 'Boong' :\n1. The film has recently won the British Academy of Film and Television Arts (BAFTA) Award in the Children's and Family Film category.\n2. The film is directed by Lakshmipriya Devi.\n3. This is the first Indian film to win a BAFTA award in the Children's and Family Film category.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "3 only"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 86,
    "srcSubject": "Science & Technology",
    "srcTopic": "IT, Communication & Computing",
    "stem": "Which of the following statements regarding the features of blockchain technology are correct ?\n1. Records stored in the database may be made visible to relevant stakeholders without risk of alteration.\n2. Copies of the entire database are stored on multiple computers on a network, syncing within seconds.\n3. Consortium blockchain is a blend of public and private blockchains allowing selective data access.\n4. Mathematical algorithms make it impossible to change or delete any data once recorded and accepted.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 3"
      },
      {
        "label": "b",
        "text": "2 and 4 only"
      },
      {
        "label": "c",
        "text": "1, 2 and 4"
      },
      {
        "label": "d",
        "text": "1 and 4 only"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 87,
    "srcSubject": "Economy",
    "srcTopic": "Basic Economic Concepts",
    "stem": "An e-commerce revenue model where the seller has control over pricing but doesn't keep products in stock and instead transfers customer orders and shipment details to a third-party supplier, who then ships the goods directly to the customer, is called :",
    "options": [
      {
        "label": "a",
        "text": "Dropshipping Model"
      },
      {
        "label": "b",
        "text": "Affiliate Revenue Model"
      },
      {
        "label": "c",
        "text": "Transaction Fee Revenue Model"
      },
      {
        "label": "d",
        "text": "Agency Revenue Model"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 88,
    "srcSubject": "Economy",
    "srcTopic": "Banking & RBI",
    "stem": "Which one of the following correctly represents the three key sub-indices of the Financial Inclusion Index (FI-Index) of the Reserve Bank of India (RBI) ?",
    "options": [
      {
        "label": "a",
        "text": "Credit access, Insurance depth, and Pension coverage"
      },
      {
        "label": "b",
        "text": "Banking access, GDP contribution, and Financial literacy"
      },
      {
        "label": "c",
        "text": "Access, Usage, and Quality"
      },
      {
        "label": "d",
        "text": "Access, Affordability, and Transparency"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 89,
    "srcSubject": "Economy",
    "srcTopic": "Industry & Infrastructure",
    "stem": "Which one of the following best describes the key objective of India's 'Open Network for Digital Commerce' (ONDC) initiative ?",
    "options": [
      {
        "label": "a",
        "text": "To allow government control over all digital commerce transactions"
      },
      {
        "label": "b",
        "text": "To replace private e-commerce players"
      },
      {
        "label": "c",
        "text": "To break the dominance of large e-commerce platforms by enabling interoperability across networks"
      },
      {
        "label": "d",
        "text": "To mandate UPI-based payments for all online transactions"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 90,
    "srcSubject": "Economy",
    "srcTopic": "Banking & RBI",
    "stem": "Which one of the following statements about Unified Payments Interface (UPI) and Central Bank Digital Currency (Digital Rupee) is not correct ?",
    "options": [
      {
        "label": "a",
        "text": "UPI is a real-time payment system but Digital Rupee is akin to sovereign paper currency."
      },
      {
        "label": "b",
        "text": "In case of UPI, settlement for end users happens instantly as the money gets immediately debited or credited but in case of Digital Rupee, there is no settlement as the wallet balance gets transferred to another wallet."
      },
      {
        "label": "c",
        "text": "UPI transactions are recorded by banks and reflected in bank statements but in case of Digital Rupee, no data is captured in bank statements as transactions are from one wallet to another."
      },
      {
        "label": "d",
        "text": "In both the cases (UPI and Digital Rupee), the liability lies with the users and their respective banks."
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 91,
    "srcSubject": "Economy",
    "srcTopic": "Capital Markets & Financial Instruments",
    "stem": "Which of the following statements about Real-World Assets (RWA) Tokenization are correct ?\n1. Tokenization is the process of turning real world assets into digital tokens using blockchain technology.\n2. Tokenization of real world assets offers 24 x 7 access, promoting financial inclusion.\n3. Tokenization of real world assets will allow the access to high growth investment opportunities for individuals in India.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "2 and 3 only"
      },
      {
        "label": "c",
        "text": "1 and 2 only"
      },
      {
        "label": "d",
        "text": "1 and 3 only"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 92,
    "srcSubject": "Economy",
    "srcTopic": "Capital Markets & Financial Instruments",
    "stem": "A bond whose proceeds are used only to finance or refinance a combination of both environmental and social projects is called :",
    "options": [
      {
        "label": "a",
        "text": "Green Bond"
      },
      {
        "label": "b",
        "text": "Social Bond"
      },
      {
        "label": "c",
        "text": "Sustainability Bond"
      },
      {
        "label": "d",
        "text": "Sovereign Bond"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 93,
    "srcSubject": "Economy",
    "srcTopic": "Capital Markets & Financial Instruments",
    "stem": "Which of the following statements about M1xchange's role in Micro, Small & Medium Enterprises (MSMEs) financing is/are correct ?\n1. M1xchange provides collateral based loans to MSMEs.\n2. M1xchange facilitates discounting of invoices and Bills of Exchange for MSMEs.\n3. M1xchange functions as a credit rating agency for MSMEs.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1, 2 and 3"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "2 and 3 only"
      },
      {
        "label": "d",
        "text": "1 only"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 94,
    "srcSubject": "Economy",
    "srcTopic": "Fiscal Policy & Budget",
    "stem": "Which one of the following best describes the 'Crowding Out Effect' in the context of fiscal policy ?",
    "options": [
      {
        "label": "a",
        "text": "A situation where private investment increases due to increased Government spending"
      },
      {
        "label": "b",
        "text": "A situation where Government borrowing leads to higher interest rates, which reduces private investment"
      },
      {
        "label": "c",
        "text": "A situation where an increase in taxes leads to increased private sector investment"
      },
      {
        "label": "d",
        "text": "A situation where Government spending has no impact on aggregate demand"
      }
    ],
    "correctLabel": "b"
  },
  {
    "questionNo": 95,
    "srcSubject": "Science & Technology",
    "srcTopic": "Nanotechnology & Materials",
    "stem": "Which of the following statements about Rare Earth Elements (REEs) and Critical Minerals is/are correct ?\n1. Modern technological innovations including Artificial Intelligence, robotics and space exploration extensively utilise Rare Earth Elements (REEs).\n2. China has the highest share in mining of REEs followed by India.\n3. The Government of India launched the National Critical Mineral Mission (NCMM) in 2025 to establish a robust framework for self-reliance in the critical mineral sector.\n4. Rare Earth Elements are a set of 13 metallic elements.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 and 3 only"
      },
      {
        "label": "b",
        "text": "3 only"
      },
      {
        "label": "c",
        "text": "1, 3 and 4"
      },
      {
        "label": "d",
        "text": "1, 2 and 4"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 96,
    "srcSubject": "Economy",
    "srcTopic": "Basic Economic Concepts",
    "stem": "Which of the following statements about insurance in aviation sector is/are correct ?\n1. 'Aviation Hull Insurance' covers the physical aircraft, including the body, engine, and on-board equipment.\n2. Under the Montreal Convention, adopted in 1999 by over 130 countries, including India, airlines are strictly liable to pay compensation to the family/nominee of every deceased passenger without requiring the family to prove fault.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "Both 1 and 2"
      },
      {
        "label": "d",
        "text": "Neither 1 nor 2"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 97,
    "srcSubject": "Economy",
    "srcTopic": "Capital Markets & Financial Instruments",
    "stem": "Which of the following statements about Crowdfunding is/are correct ?\n1. Crowdfunding is solicitation of funds (small amount) from multiple investors through a web-based platform or social networking site for a specific project.\n2. Small and Medium Enterprises (SMEs) are able to raise funds at lower cost of capital without undergoing rigorous procedures.\n\nSelect the answer using the code given below :",
    "options": [
      {
        "label": "a",
        "text": "1 only"
      },
      {
        "label": "b",
        "text": "2 only"
      },
      {
        "label": "c",
        "text": "Both 1 and 2"
      },
      {
        "label": "d",
        "text": "Neither 1 nor 2"
      }
    ],
    "correctLabel": "c"
  },
  {
    "questionNo": 98,
    "srcSubject": "Economy",
    "srcTopic": "Banking & RBI",
    "stem": "With reference to different Committees in India, consider the following details :\n\nSl. No. | Committee | Objective | Organization under which it was formed\n1. | R.N. Malhotra Committee | Comprehensive reforms of Insurance sector in India | Insurance Regulatory and Development Authority of India\n2. | L.C. Gupta Committee | Preparing a roadmap for the introduction of derivatives trading in India | Securities and Exchange Board of India\n3. | Urjit R. Patel Committee | Preparing a roadmap for reforming bank lending to the Housing sector | Reserve Bank of India\n4. | Y.H. Malegam Committee | Preparing a roadmap for reforms in Microfinance sector in India | Reserve Bank of India\n\nIn which of the above rows are all the details correctly matched ?",
    "options": [
      {
        "label": "a",
        "text": "2 only"
      },
      {
        "label": "b",
        "text": "2 and 3"
      },
      {
        "label": "c",
        "text": "1, 3 and 4"
      },
      {
        "label": "d",
        "text": "2 and 4"
      }
    ],
    "correctLabel": "d"
  },
  {
    "questionNo": 99,
    "srcSubject": "Economy",
    "srcTopic": "Banking & RBI",
    "stem": "Consider the following statements about the Non-Banking Financial Companies (NBFCs) in India :\n1. NBFCs cannot accept demand deposits.\n2. All the NBFCs operating in India have to be registered with the RBI.\n3. NBFCs form part of the payment and settlement system and can issue cheque drawn on itself.\n4. Deposit insurance facility of Deposit Insurance and Credit Guarantee Corporation (DICGC) is not available to the depositors of deposit taking NBFCs.\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1 and 4"
      },
      {
        "label": "b",
        "text": "1, 2 and 3"
      },
      {
        "label": "c",
        "text": "4 only"
      },
      {
        "label": "d",
        "text": "2, 3 and 4"
      }
    ],
    "correctLabel": "a"
  },
  {
    "questionNo": 100,
    "srcSubject": "Economy",
    "srcTopic": "Poverty, Unemployment & Human Development",
    "stem": "Consider the following statements about Multidimensional Poverty Index (MPI) :\n1. MPI is calculated using Alkire-Foster methodology.\n2. MPI calculated by NITI Aayog has a total of twelve indicators.\n3. Maternal Health and Bank Account are common indicators in the MPI of NITI Aayog and MPI of United Nations Development Programme (UNDP).\n\nWhich of the statements given above is/are correct ?",
    "options": [
      {
        "label": "a",
        "text": "1 and 2 only"
      },
      {
        "label": "b",
        "text": "1, 2 and 3"
      },
      {
        "label": "c",
        "text": "1 and 3 only"
      },
      {
        "label": "d",
        "text": "2 only"
      }
    ],
    "correctLabel": "a"
  }
];

const outputFile = 'pyq_data/upsc_cse_prelims_2026.jsonl';
const stream = fs.createWriteStream(outputFile, { flags: 'w' });

for (const q of questions) {
  const padNo = String(q.questionNo).padStart(2, '0');
  const id = `UPSC-2026-${padNo}`;
  const embedText = `${q.srcSubject} | ${q.srcTopic} | UPSC CSE Pre 2026\nQuestion: ${q.stem}\n${q.options.map(o => `(${o.label}) ${o.text}`).join('\n')}\nAnswer: (${q.correctLabel || 'Dropped'})`;

  const jsonlRow = {
    id,
    questionNo: q.questionNo,
    examName: "UPSC CSE Pre",
    examYear: 2026,
    srcSubject: q.srcSubject,
    srcTopic: q.srcTopic,
    stem: q.stem,
    options: q.options,
    correctLabel: q.correctLabel,
    embedText
  };

  stream.write(JSON.stringify(jsonlRow) + '\n');
}

stream.end();
console.log(`Successfully generated ${questions.length} questions in ${outputFile}`);
