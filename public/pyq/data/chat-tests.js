/* Generated from chat-tests.json — edit that file. */
window.PQ_TESTS = {
 "_about": "Test set for chat.js. Each test: q (the question), optional seq (questions asked before it), expect: subject / theme (key or list of acceptable keys, null = none) / sub (sub-topic name) / intent / kw (text the keyword must contain). Only the fields given are checked. group: core = worked before, paraphrase = wording not in the alias lists, typo, followup, negative. Keys remapped to the Neon subjects/topics (2011–2026). expect.engine: 'tutor' when the box should answer from the tutor (a bare term goes to its term page); default 'stats'.",
 "tests": [
  {
   "group": "core",
   "q": "Top 5 themes in Polity",
   "expect": {
    "subject": "indian_polity",
    "theme": null,
    "intent": "top"
   }
  },
  {
   "group": "core",
   "q": "Which themes are rising?",
   "expect": {
    "subject": null,
    "intent": "trend"
   }
  },
  {
   "group": "core",
   "q": "Which economy themes are falling?",
   "expect": {
    "subject": "economy",
    "intent": "trend"
   }
  },
  {
   "group": "core",
   "q": "How many Economy questions in 2023?",
   "expect": {
    "subject": "economy",
    "theme": null,
    "intent": "count"
   }
  },
  {
   "group": "core",
   "q": "how many polity questions",
   "expect": {
    "subject": "indian_polity",
    "intent": "count"
   }
  },
  {
   "group": "core",
   "q": "Show questions on Ramsar",
   "expect": {
    "theme": "environment--biodiversity_conservation",
    "intent": "questions",
    "kw": "ramsar"
   }
  },
  {
   "group": "core",
   "q": "how many ramsar questions",
   "expect": {
    "theme": "environment--biodiversity_conservation",
    "intent": "count",
    "kw": "ramsar"
   }
  },
  {
   "group": "core",
   "q": "Economy vs Environment",
   "expect": {
    "intent": "compare"
   }
  },
  {
   "group": "core",
   "q": "RBI vs inflation",
   "expect": {
    "intent": "compare"
   }
  },
  {
   "group": "core",
   "q": "When was Panchayati Raj asked?",
   "expect": {
    "theme": "indian_polity--panchayati_raj",
    "intent": "when"
   }
  },
  {
   "group": "core",
   "q": "Is climate change rising?",
   "expect": {
    "theme": "environment--climate_change",
    "intent": "trend"
   }
  },
  {
   "group": "core",
   "q": "Question formats in 2023",
   "expect": {
    "subject": null,
    "intent": "formats"
   }
  },
  {
   "group": "core",
   "q": "How to prepare Geography",
   "expect": {
    "subject": "geography",
    "intent": "strategy"
   }
  },
  {
   "group": "core",
   "q": "What to study for banking",
   "expect": {
    "theme": "economy--banking_rbi",
    "intent": "strategy"
   }
  },
  {
   "group": "core",
   "q": "Repeated concepts in polity",
   "expect": {
    "subject": "indian_polity",
    "intent": "repeated"
   }
  },
  {
   "group": "core",
   "q": "Themes asked every year",
   "expect": {
    "subject": null,
    "intent": "always"
   }
  },
  {
   "group": "core",
   "q": "current affairs share",
   "expect": {
    "subject": null,
    "intent": "ca"
   }
  },
  {
   "group": "core",
   "q": "Polity questions in 2021",
   "expect": {
    "subject": "indian_polity",
    "intent": "count"
   }
  },
  {
   "group": "core",
   "q": "tell me about fundamental rights",
   "expect": {
    "theme": "indian_polity--fundamental_rights",
    "intent": "overview"
   }
  },
  {
   "group": "core",
   "q": "GST",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "core",
   "q": "MSP",
   "expect": {
    "theme": "agriculture--agricultural_pricing_procurement_msp"
   }
  },
  {
   "group": "core",
   "q": "gandhi",
   "expect": {
    "theme": "modern_history--gandhian_era_mass_movements_1915_1947"
   }
  },
  {
   "group": "core",
   "q": "what topic should i prioritise for Polity?",
   "expect": {
    "subject": "indian_polity",
    "theme": null,
    "intent": "top"
   }
  },
  {
   "group": "core",
   "q": "polity budget",
   "expect": {
    "theme": "indian_polity--budget_financial_procedure"
   }
  },
  {
   "group": "core",
   "q": "when was presidential election asked",
   "expect": {
    "theme": "indian_polity--president",
    "sub": "Presidential Election",
    "intent": "when"
   }
  },
  {
   "group": "core",
   "q": "73rd amendment",
   "expect": {
    "theme": "indian_polity--panchayati_raj",
    "sub": "73rd Amendment Provisions"
   }
  },
  {
   "group": "core",
   "q": "show questions on isro",
   "expect": {
    "theme": "science_technology--space_technology",
    "intent": "questions"
   }
  },
  {
   "group": "core",
   "q": "tiger reserves",
   "expect": {
    "theme": "environment--biodiversity_conservation"
   }
  },
  {
   "group": "core",
   "q": "monsoon",
   "expect": {
    "theme": "geography--climatology"
   }
  },
  {
   "group": "core",
   "q": "kyoto protocol",
   "expect": {
    "theme": "environment--climate_change"
   }
  },
  {
   "group": "core",
   "q": "biosphere reserves",
   "expect": {
    "theme": "environment--biodiversity_conservation"
   }
  },
  {
   "group": "core",
   "q": "imf loans",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "core",
   "q": "g20 summit",
   "expect": {
    "theme": "indian_polity--international_organisations_relations"
   }
  },
  {
   "group": "core",
   "q": "blockchain technology",
   "expect": {
    "theme": "science_technology--it_communication_computing"
   }
  },
  {
   "group": "core",
   "q": "stem cell therapy",
   "expect": {
    "theme": "science_technology--biotechnology_genetics"
   }
  },
  {
   "group": "core",
   "q": "heavy metal pollution",
   "expect": {
    "theme": "environment--environmental_pollution"
   }
  },
  {
   "group": "core",
   "q": "how many questions on the preamble",
   "expect": {
    "theme": "indian_polity--preamble",
    "intent": "count"
   }
  },
  {
   "group": "core",
   "q": "is space technology important",
   "expect": {
    "theme": "science_technology--space_technology"
   }
  },
  {
   "group": "core",
   "q": "help",
   "expect": {
    "intent": "help"
   }
  },
  {
   "group": "paraphrase",
   "q": "questions on greenhouse gas emission treaties",
   "expect": {
    "theme": "environment--climate_change"
   }
  },
  {
   "group": "paraphrase",
   "q": "central bank interest rates",
   "expect": {
    "theme": [
     "economy--banking_rbi",
     "economy--monetary_policy",
     "economy--inflation"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "lending to priority sectors",
   "expect": {
    "theme": "economy--banking_rbi"
   }
  },
  {
   "group": "paraphrase",
   "q": "anti defection law",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "paraphrase",
   "q": "doctrine of basic structure",
   "expect": {
    "theme": "indian_polity--judicial_review_landmark_judgements"
   }
  },
  {
   "group": "paraphrase",
   "q": "writ jurisdiction of courts",
   "expect": {
    "theme": [
     "indian_polity--supreme_court",
     "indian_polity--high_courts",
     "indian_polity--fundamental_rights"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "el nino effect",
   "expect": {
    "theme": [
     "geography--oceanography",
     "geography--climatology"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "jet streams and western disturbances",
   "expect": {
    "theme": "geography--climatology"
   }
  },
  {
   "group": "paraphrase",
   "q": "coral bleaching",
   "expect": {
    "theme": [
     "environment--biodiversity_conservation",
     "geography--oceanography",
     "environment--ecology_ecosystems",
     "environment--climate_change"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "ozone layer depletion",
   "expect": {
    "theme": "environment--climate_change"
   }
  },
  {
   "group": "paraphrase",
   "q": "electronic waste disposal",
   "expect": {
    "theme": "environment--environmental_pollution"
   }
  },
  {
   "group": "paraphrase",
   "q": "drain of wealth theory",
   "expect": {
    "subject": "modern_history"
   }
  },
  {
   "group": "paraphrase",
   "q": "subsidiary alliance system",
   "expect": {
    "theme": "modern_history--advent_of_europeans_british_expansion"
   }
  },
  {
   "group": "paraphrase",
   "q": "simon commission boycott",
   "expect": {
    "theme": [
     "modern_history--constitutional_administrative_developments",
     "modern_history--gandhian_era_mass_movements_1915_1947"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "special drawing rights",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "paraphrase",
   "q": "kharif and rabi crops",
   "expect": {
    "theme": [
     "agriculture--cropping_patterns_systems",
     "agriculture--major_crops"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "vaccines",
   "expect": {
    "subject": "science_technology",
    "kw": "vaccines"
   },
   "note": "vaccine questions split evenly between Health and Biotech, so a subject-level answer with the split is correct"
  },
  {
   "group": "paraphrase",
   "q": "graphene uses",
   "expect": {
    "theme": "science_technology--nanotechnology_materials"
   }
  },
  {
   "group": "paraphrase",
   "q": "bluetooth and wifi",
   "expect": {
    "theme": "science_technology--it_communication_computing"
   }
  },
  {
   "group": "paraphrase",
   "q": "nagoya protocol",
   "expect": {
    "theme": [
     "environment--climate_change",
     "environment--environmental_laws_policies_institutions",
     "environment--biodiversity_conservation"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "cabinet mission plan",
   "expect": {
    "theme": "modern_history--gandhian_era_mass_movements_1915_1947"
   }
  },
  {
   "group": "paraphrase",
   "q": "swadeshi movement",
   "expect": {
    "theme": [
     "modern_history--early_nationalism_congress_1885_1919",
     "modern_history--constitutional_administrative_developments"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "mangrove forests",
   "expect": {
    "engine": "tutor"
   },
   "note": "a phrase UPSC used opens its term page"
  },
  {
   "group": "paraphrase",
   "q": "treasury bills",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "paraphrase",
   "q": "satellite launch vehicles",
   "expect": {
    "theme": "science_technology--space_technology"
   }
  },
  {
   "group": "paraphrase",
   "q": "champaran satyagraha",
   "expect": {
    "theme": "modern_history--gandhian_era_mass_movements_1915_1947"
   }
  },
  {
   "group": "paraphrase",
   "q": "wildlife protection act schedules",
   "expect": {
    "theme": "environment--biodiversity_conservation"
   }
  },
  {
   "group": "paraphrase",
   "q": "money bill and finance bill",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "paraphrase",
   "q": "neutrino observatory",
   "expect": {
    "theme": "science_technology--space_technology"
   }
  },
  {
   "group": "paraphrase",
   "q": "ilbert bill controversy",
   "expect": {
    "subject": "modern_history"
   }
  },
  {
   "group": "paraphrase",
   "q": "home rule league",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "paraphrase",
   "q": "acid rain causes",
   "expect": {
    "theme": [
     "environment--climate_change",
     "environment--environmental_pollution"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "how many questions on greenhouse gases",
   "expect": {
    "theme": "environment--climate_change",
    "intent": "count"
   }
  },
  {
   "group": "paraphrase",
   "q": "carbon credits trading",
   "expect": {
    "theme": "environment--climate_change"
   }
  },
  {
   "group": "paraphrase",
   "q": "missiles and defence systems",
   "expect": {
    "theme": [
     "science_technology--defence_technology",
     "science_technology--space_technology"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "governor general reforms",
   "expect": {
    "theme": "modern_history--constitutional_administrative_developments"
   }
  },
  {
   "group": "paraphrase",
   "q": "disinvestment of public sector",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "paraphrase",
   "q": "groundwater and aquifers",
   "expect": {
    "subject": [
     "geography",
     "environment"
    ]
   }
  },
  {
   "group": "paraphrase",
   "q": "speaker of lok sabha powers",
   "expect": {
    "subject": "indian_polity"
   }
  },
  {
   "group": "paraphrase",
   "q": "urea subsidy",
   "expect": {
    "subject": [
     "agriculture",
     "economy"
    ]
   }
  },
  {
   "group": "typo",
   "q": "top 5 themes in polty",
   "expect": {
    "subject": "indian_polity",
    "intent": "top"
   }
  },
  {
   "group": "typo",
   "q": "how many econmy questions in 2023",
   "expect": {
    "subject": "economy",
    "intent": "count"
   }
  },
  {
   "group": "typo",
   "q": "show questons on ramsr",
   "expect": {
    "theme": "environment--biodiversity_conservation",
    "intent": "questions",
    "kw": "ramsar"
   }
  },
  {
   "group": "typo",
   "q": "is climate chnage rising",
   "expect": {
    "theme": "environment--climate_change",
    "intent": "trend"
   }
  },
  {
   "group": "typo",
   "q": "when was panchyat raj asked",
   "expect": {
    "theme": "indian_polity--panchayati_raj",
    "intent": "when"
   }
  },
  {
   "group": "typo",
   "q": "fundamantal rights",
   "expect": {
    "theme": "indian_polity--fundamental_rights"
   }
  },
  {
   "group": "typo",
   "q": "what to studdy for bankng",
   "expect": {
    "theme": "economy--banking_rbi",
    "intent": "strategy"
   }
  },
  {
   "group": "typo",
   "q": "biodiversty conservation",
   "expect": {
    "theme": "environment--biodiversity_conservation"
   }
  },
  {
   "group": "followup",
   "seq": [
    "Polity in 2023"
   ],
   "q": "and in 2022?",
   "expect": {
    "subject": "indian_polity",
    "intent": "count"
   }
  },
  {
   "group": "followup",
   "seq": [
    "Polity in 2022"
   ],
   "q": "show them",
   "expect": {
    "subject": "indian_polity",
    "intent": "questions"
   }
  },
  {
   "group": "followup",
   "seq": [
    "Polity in 2022",
    "show them"
   ],
   "q": "what about economy?",
   "expect": {
    "subject": "economy",
    "intent": "questions"
   }
  },
  {
   "group": "followup",
   "seq": [
    "how many ramsar questions"
   ],
   "q": "is it rising?",
   "expect": {
    "theme": "environment--biodiversity_conservation",
    "intent": "trend",
    "kw": "ramsar"
   }
  },
  {
   "group": "followup",
   "seq": [
    "when was it asked?"
   ],
   "q": "Polity",
   "expect": {
    "subject": "indian_polity",
    "intent": "when"
   }
  },
  {
   "group": "followup",
   "seq": [
    "when was it asked?"
   ],
   "q": "what topic should i prioritise for Polity?",
   "expect": {
    "subject": "indian_polity",
    "intent": "top"
   }
  },
  {
   "group": "followup",
   "seq": [
    "Economy"
   ],
   "q": "compare with environment",
   "expect": {
    "intent": "compare"
   }
  },
  {
   "group": "followup",
   "seq": [
    "monsoon"
   ],
   "q": "Question formats in 2023",
   "expect": {
    "subject": null,
    "intent": "formats"
   }
  },
  {
   "group": "followup",
   "seq": [
    "Banking"
   ],
   "q": "which themes are rising?",
   "expect": {
    "subject": "economy",
    "intent": "trend"
   }
  },
  {
   "group": "negative",
   "q": "gibberish xyzq",
   "expect": {
    "subject": null,
    "theme": null
   }
  },
  {
   "group": "negative",
   "q": "what is the weather today",
   "expect": {
    "theme": null
   }
  },
  {
   "group": "negative",
   "q": "hello",
   "expect": {
    "intent": "help"
   }
  },
  {
   "group": "glossary",
   "q": "mulbhut adhikar",
   "expect": {
    "theme": "indian_polity--fundamental_rights"
   }
  },
  {
   "group": "glossary",
   "q": "maulik adhikar questions in 2023",
   "expect": {
    "theme": "indian_polity--fundamental_rights",
    "intent": "count"
   }
  },
  {
   "group": "glossary",
   "q": "sanvidhan",
   "expect": {
    "subject": "indian_polity"
   }
  },
  {
   "group": "glossary",
   "q": "arthvyavastha che top 5 themes",
   "expect": {
    "subject": "economy",
    "intent": "top"
   }
  },
  {
   "group": "glossary",
   "q": "mahagai",
   "expect": {
    "theme": "economy--inflation"
   }
  },
  {
   "group": "glossary",
   "q": "hamibhav",
   "expect": {
    "theme": "agriculture--agricultural_pricing_procurement_msp"
   }
  },
  {
   "group": "glossary",
   "q": "jalvayu parivartan rising aahe ka",
   "expect": {
    "theme": "environment--climate_change",
    "intent": "trend"
   }
  },
  {
   "group": "glossary",
   "q": "paryavaran how to prepare",
   "expect": {
    "subject": "environment",
    "intent": "strategy"
   }
  },
  {
   "group": "glossary",
   "q": "rashtrapati",
   "expect": {
    "theme": "indian_polity--president"
   }
  },
  {
   "group": "glossary",
   "q": "antariksh questions",
   "expect": {
    "theme": "science_technology--space_technology"
   }
  },
  {
   "group": "glossary",
   "q": "habeas corpus",
   "expect": {
    "theme": "indian_polity--fundamental_rights"
   }
  },
  {
   "group": "glossary",
   "q": "zero budget natural farming",
   "expect": {
    "theme": "agriculture--soil_fertilizers_farming_practices"
   }
  },
  {
   "group": "glossary",
   "q": "chandrayaan",
   "expect": {
    "theme": "science_technology--space_technology"
   }
  },
  {
   "group": "glossary",
   "q": "kesavananda bharati case",
   "expect": {
    "theme": "indian_polity--judicial_review_landmark_judgements"
   }
  },
  {
   "group": "glossary",
   "q": "doctrine of lapse",
   "expect": {
    "theme": "modern_history--advent_of_europeans_british_expansion"
   }
  },
  {
   "group": "glossary",
   "q": "ramsar convention",
   "expect": {
    "theme": "environment--biodiversity_conservation"
   }
  },
  {
   "group": "glossary",
   "q": "cabinet mission plan",
   "expect": {
    "theme": "modern_history--gandhian_era_mass_movements_1915_1947"
   }
  },
  {
   "group": "glossary",
   "q": "coral reefs",
   "expect": {
    "engine": "tutor"
   },
   "note": "a bare term opens the term page (meaning if stored + every PYQ)"
  },
  {
   "group": "glossary",
   "q": "question hour and zero hour",
   "expect": {
    "theme": "indian_polity--parliament"
   }
  },
  {
   "group": "glossary",
   "q": "kharif crops",
   "expect": {
    "theme": [
     "agriculture--cropping_patterns_systems",
     "agriculture--major_crops"
    ]
   }
  },
  {
   "group": "glossary",
   "q": "jalvayu parivartan vadhat aahe ka",
   "expect": {
    "theme": "environment--climate_change",
    "intent": "trend",
    "kw": null
   }
  },
  {
   "group": "glossary",
   "q": "polity che 2023 madhe kiti prashna",
   "expect": {
    "subject": "indian_polity",
    "intent": "count"
   }
  },
  {
   "group": "glossary",
   "q": "panchayati raj kevha vicharla",
   "expect": {
    "theme": "indian_polity--panchayati_raj",
    "intent": "when"
   }
  },
  {
   "group": "glossary",
   "q": "ramsar ke sawal dikhao",
   "expect": {
    "theme": "environment--biodiversity_conservation",
    "intent": "questions",
    "kw": "ramsar"
   }
  },
  {
   "group": "router",
   "q": "quiz me on polity",
   "expect": {
    "engine": "tutor",
    "intent": "quiz"
   }
  },
  {
   "group": "router",
   "q": "what is fiscal deficit",
   "expect": {
    "engine": "tutor",
    "intent": "define"
   }
  },
  {
   "group": "router",
   "q": "fiscal deficit meaning",
   "expect": {
    "engine": "tutor",
    "intent": "define"
   }
  },
  {
   "group": "router",
   "q": "random economy question",
   "expect": {
    "engine": "tutor",
    "intent": "open"
   }
  },
  {
   "group": "router",
   "q": "2019 q 14",
   "expect": {
    "engine": "tutor",
    "intent": "clarify"
   }
  },
  {
   "group": "router",
   "q": "explain",
   "expect": {
    "engine": "stats"
   }
  },
  {
   "group": "router",
   "q": "how many polity questions in 2025",
   "expect": {
    "engine": "stats"
   }
  },
  {
   "group": "router",
   "q": "show questions on ramsar",
   "expect": {
    "engine": "stats"
   }
  },
  {
   "group": "router",
   "q": "top 5 themes in polity",
   "expect": {
    "engine": "stats"
   }
  },
  {
   "group": "router",
   "q": "what is the trend of climate change",
   "expect": {
    "engine": "stats"
   }
  },
  {
   "group": "router",
   "q": "which themes are rising",
   "expect": {
    "engine": "stats"
   }
  },
  {
   "group": "router",
   "q": "judicial review mhanje kay",
   "expect": {
    "engine": "tutor",
    "intent": "define"
   }
  },
  {
   "group": "router",
   "seq": [
    "random polity question"
   ],
   "q": "explain",
   "expect": {
    "engine": "tutor",
    "intent": "followup"
   }
  },
  {
   "group": "router",
   "seq": [
    "random polity question"
   ],
   "q": "statement 1",
   "expect": {
    "engine": "tutor",
    "intent": [
     "followup"
    ]
   }
  },
  {
   "group": "router",
   "seq": [
    "quiz me on economy"
   ],
   "q": "b",
   "expect": {
    "engine": "tutor",
    "intent": "quiz-a"
   }
  },
  {
   "group": "router",
   "seq": [
    "quiz me on economy",
    "b"
   ],
   "q": "next",
   "expect": {
    "engine": "tutor",
    "intent": "quiz-q"
   }
  },
  {
   "group": "router",
   "seq": [
    "random polity question"
   ],
   "q": "top 5 themes in economy",
   "expect": {
    "engine": "stats"
   }
  },
  {
   "group": "repeat",
   "q": "what is the most repeated theme in Parliament?",
   "expect": {
    "theme": "indian_polity--parliament",
    "intent": "repeated"
   }
  },
  {
   "group": "repeat",
   "q": "most repeated topic in parliament",
   "expect": {
    "theme": "indian_polity--parliament",
    "intent": "repeated"
   }
  },
  {
   "group": "repeat",
   "q": "which areas of banking keep coming again and again",
   "expect": {
    "theme": "economy--banking_rbi",
    "intent": "repeated"
   }
  },
  {
   "group": "repeat",
   "q": "top sub-topics in parliament",
   "expect": {
    "theme": "indian_polity--parliament",
    "intent": "top"
   }
  },
  {
   "group": "repeat",
   "q": "most asked parts of banking",
   "expect": {
    "theme": "economy--banking_rbi",
    "intent": "top"
   }
  },
  {
   "group": "repeat",
   "seq": [
    "tell me about parliament"
   ],
   "q": "what repeats the most in it?",
   "expect": {
    "theme": "indian_polity--parliament",
    "intent": "repeated"
   }
  }
 ]
};
