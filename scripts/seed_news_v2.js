const API_URL = 'http://localhost:3000/api/news/sync';
const TOKEN = 'upscgpt_gemma_engine_2026_topsecret';

const dummyArticles = [
  {
    title: "India Challenges EU's Carbon Border Adjustment Mechanism (CBAM)",
    url: "https://thehindu.com/economy/cbam-india-challenge",
    source: "The Hindu",
    content: "India has labeled the EU's Carbon Border Adjustment Mechanism as discriminatory and a trade barrier during WTO meetings.",
    publishedAt: new Date().toISOString(),
    category: "Economy",
    relevance: 10,
    editorials: [
      {
        issue: "Green Protectionism vs. Climate Action",
        crux: "CBAM targets high-carbon imports like steel and cement. While EU claims it prevents 'carbon leakage', developing nations see it as a trade wall.",
        gsPaper: "GS3"
      }
    ],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "CBAM targets 6 sectors: Iron & Steel, Cement, Aluminium, Fertilizers, Electricity, and Hydrogen.",
        category: "Economy",
        mcq: {
          question: "Which of the following sectors is NOT currently covered under the EU’s Carbon Border Adjustment Mechanism (CBAM)?",
          options: ["A) Iron & Steel", "B) Fertilizers", "C) Textiles", "D) Aluminium"],
          answer: "C) Textiles",
          explanation: "CBAM currently covers energy-intensive sectors like steel, cement, aluminium, fertilizers, electricity, and hydrogen."
        }
      },
      {
        type: "MAINS_FACT",
        content: "Nearly 27% of India's exports of steel and aluminium go to the EU, making them vulnerable to CBAM taxes.",
        category: "Economy",
        mainsQuestion: "Discuss how the EU’s CBAM could potentially impact India’s manufacturing sector and suggest policy measures to mitigate these risks."
      }
    ]
  },
  {
    title: "Project Kusha: India's Indigenous Long-Range S-400 Equivalent",
    url: "https://indianexpress.com/defence/project-kusha-isro-drdo",
    source: "Indian Express",
    content: "DRDO is developing a long-range air defense system capable of intercepting stealth fighters and cruise missiles at 350km range.",
    publishedAt: new Date().toISOString(),
    category: "Defence",
    relevance: 9,
    editorials: [],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "Project Kusha aims to provide a three-layered long-range surface-to-air missile (LRSAM) system.",
        category: "S&T",
        mcq: {
          question: "Project Kusha, recently in the news, is related to:",
          options: ["A) Deep Ocean Mission", "B) Indigenous Air Defense System", "C) Solar Mission L1", "D) Cheetah Reintroduction"],
          answer: "B) Indigenous Air Defense System",
          explanation: "Project Kusha is DRDO's project to build a three-layered long-range surface-to-air missile system."
        }
      },
      {
        type: "MAINS_FACT",
        content: "Strategic autonomy in air defense reduces dependence on foreign systems like the Russian S-400 and Israeli Barak-8.",
        category: "Defence",
        mainsQuestion: "Examine the significance of indigenous defense projects in achieving 'Atmanirbhar Bharat' in the context of global supply chain disruptions."
      }
    ]
  },
  {
    title: "IMEC: The India-Middle East-Europe Economic Corridor",
    url: "https://pib.gov.in/imec-corridor-launch",
    source: "PIB",
    content: "A landmark corridor connecting India offshore to UAE, Saudi Arabia, Jordan, and Israel to Europe via ship and rail.",
    publishedAt: new Date().toISOString(),
    category: "IR",
    relevance: 10,
    editorials: [
      {
        issue: "Geopolitics of Connectivity",
        crux: "IMEC serves as a strategic counter to China’s BRI, emphasizing transparency and sustainable debt, while bypassing traditional choke points like the Suez Canal.",
        gsPaper: "GS2"
      }
    ],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "IMEC consists of two corridors: East Corridor (India to Gulf) and Northern Corridor (Gulf to Europe).",
        category: "Geography",
        mcq: {
          question: "The IMEC corridor aims to bypass which major global maritime choke point?",
          options: ["A) Strait of Malacca", "B) Suez Canal", "C) Strait of Hormuz", "D) Bab-el-Mandeb"],
          answer: "B) Suez Canal",
          explanation: "IMEC offers a sea-to-rail link that significantly reduces transit time compared to the Suez Canal route."
        }
      },
      {
        type: "MAINS_FACT",
        content: "IMEC integrates rail, electricity cables, and hydrogen pipelines alongside digital connectivity.",
        category: "IR",
        mainsQuestion: "Analyze the strategic and economic implications of the IMEC corridor for India's trade relations with the Middle East and Europe."
      }
    ]
  },
  {
    title: "16th Finance Commission Terms of Reference",
    url: "https://finmin.nic.in/16th-fc-tor",
    source: "Official",
    content: "The government has constituted the 16th Finance Commission to recommend the tax-sharing formula between Union and States for 2026-31.",
    publishedAt: new Date().toISOString(),
    category: "Polity",
    relevance: 10,
    editorials: [
      {
        issue: "Fiscal Federalism at a Crossroads",
        crux: "The 16th FC faces the challenge of balancing the needs of high-performing southern states with the development requirements of the populous northern states.",
        gsPaper: "GS2"
      }
    ],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "Article 280 of the Constitution mandates the President to constitute a Finance Commission every five years.",
        category: "Polity",
        mcq: {
          question: "Which Article of the Indian Constitution provides for the establishment of a Finance Commission?",
          options: ["A) Article 263", "B) Article 280", "C) Article 324", "D) Article 360"],
          answer: "B) Article 280",
          explanation: "Article 280 requires the President to constitute a Finance Commission to recommend horizontal and vertical tax devolution."
        }
      },
      {
        type: "MAINS_FACT",
        content: "Horizontal devolution criteria often include population, income distance, and forest cover.",
        category: "Economy",
        mainsQuestion: "Discuss the evolving challenges of fiscal federalism in India with special reference to the horizontal devolution of funds."
      }
    ]
  },
  {
    title: "National Quantum Mission: India Enters the Quantum Race",
    url: "https://dst.gov.in/national-quantum-mission",
    source: "PIB",
    content: "India has approved the National Quantum Mission to develop quantum computers, communications, and sensing technologies.",
    publishedAt: new Date().toISOString(),
    category: "S&T",
    relevance: 9,
    editorials: [],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "The mission aims to develop quantum computers with 50-1000 physical qubits in 8 years.",
        category: "S&T",
        mcq: {
          question: "The basic unit of information in quantum computing is called a:",
          options: ["A) Bit", "B) Qubit", "C) Byte", "D) Node"],
          answer: "B) Qubit",
          explanation: "Unlike classical bits (0 or 1), qubits can exist in a superposition of states."
        }
      },
      {
        type: "MAINS_FACT",
        content: "Quantum-secure communications are critical for national security as classical encryption could be broken by quantum computers.",
        category: "S&T",
        mainsQuestion: "Evaluate the potential applications of Quantum Technology in India’s healthcare and secure communication sectors."
      }
    ]
  },
  {
    title: "UNESCO Creative Cities: Gwalior (Music) & Kozhikode (Literature)",
    url: "https://unesco.org/creative-cities-india",
    source: "UNESCO",
    content: "Two Indian cities have joined the UNESCO Creative Cities Network (UCCN) for their cultural contributions.",
    publishedAt: new Date().toISOString(),
    category: "Culture",
    relevance: 8,
    editorials: [],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "Gwalior is known for its Gwalior Gharana, one of the oldest Khyal Gharanas in Hindustani classical music.",
        category: "Art & Culture",
        mcq: {
          question: "Which Indian city was recently designated as the 'City of Music' by UNESCO?",
          options: ["A) Varanasi", "B) Gwalior", "C) Jaipur", "D) Chennai"],
          answer: "B) Gwalior",
          explanation: "Gwalior was designated for its rich musical heritage, while Kozhikode was named the City of Literature."
        }
      },
      {
        type: "MAINS_FACT",
        content: "Cultural mapping of cities helps in urban regeneration and boosts local heritage-based tourism.",
        category: "Culture",
        mainsQuestion: "Discuss the role of cultural heritage in sustainable urban development with reference to the UNESCO Creative Cities Network."
      }
    ]
  },
  {
    title: "Project Samudrayaan: India's Deep Sea explorer 'Matsya 6000'",
    url: "https://moes.gov.in/deep-ocean-mission",
    source: "PIB",
    content: "India is preparing to send humans to a depth of 6000 meters in the Indian Ocean to study deep-sea resources.",
    publishedAt: new Date().toISOString(),
    category: "S&T",
    relevance: 9,
    editorials: [
      {
        issue: "Blue Economy & Security",
        crux: "Exploring the deep sea opens up access to Polymetallic Nodules containing rare earth elements, vital for the green energy transition.",
        gsPaper: "GS3"
      }
    ],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "The submersible used in the mission is named 'Matsya 6000'.",
        category: "Geography",
        mcq: {
          question: "What is the name of the indigenous manned submersible being developed for India’s Deep Ocean Mission?",
          options: ["A) Varuna 6000", "B) Matsya 6000", "C) Sagarika", "D) Samudra-1"],
          answer: "B) Matsya 6000",
          explanation: "Matsya 6000 is being developed by NIOT for the deep sea mission."
        }
      },
      {
        type: "MAINS_FACT",
        content: "India has been allocated a site in the Central Indian Ocean Basin by the International Seabed Authority (ISA).",
        category: "Geography",
        mainsQuestion: "Examine the economic and strategic potential of the 'Blue Economy' for India's future growth."
      }
    ]
  },
  {
    title: "One Nation, One Election: Kovind Panel Report",
    url: "https://lawmin.gov.in/simultaneous-elections-report",
    source: "Indian Express",
    content: "The high-level committee has recommended simultaneous elections for Lok Sabha and State Assemblies to reduce costs.",
    publishedAt: new Date().toISOString(),
    category: "Polity",
    relevance: 10,
    editorials: [
      {
        issue: "Simultaneous Elections: Efficiency vs. Federalism",
        crux: "While it saves money and prevents policy paralysis, critics argue it overshaows local issues and undermines the federal basic structure.",
        gsPaper: "GS2"
      }
    ],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "Simultaneous elections were the norm in India until 1967.",
        category: "History",
        mcq: {
          question: "Until which year were simultaneous elections generally held in India for both Lok Sabha and State Assemblies?",
          options: ["A) 1952", "B) 1962", "C) 1967", "D) 1977"],
          answer: "C) 1967",
          explanation: "Simultaneous elections were held in 1952, 1957, 1962, and 1967 before the cycle was broken."
        }
      },
      {
        type: "MAINS_FACT",
        content: "Frequent elections lead to the recurring imposition of the Model Code of Conduct, stalling developmental projects.",
        category: "Polity",
        mainsQuestion: "Analyze the constitutional and logistical challenges in implementing 'One Nation, One Election' in India."
      }
    ]
  },
  {
    title: "Digital Competition Bill: Targeting Big Tech Anti-Competitive Acts",
    url: "https://mca.gov.in/digital-competition-bill",
    source: "Economy Times",
    content: "The Ministry of Corporate Affairs is considering a bill to regulate Systemically Significant Digital Enterprises (SSDEs).",
    publishedAt: new Date().toISOString(),
    category: "Economy",
    relevance: 9,
    editorials: [
      {
        issue: "Ex-ante Regulation in Digital Markets",
        crux: "Unlike traditional competition law, ex-ante regulation sets rules before violations occur to prevent monopolies like Google or Amazon from stifling startups.",
        gsPaper: "GS3"
      }
    ],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "The Bill introduces 'Systemically Significant Digital Enterprises' (SSDEs) based on user base and revenue.",
        category: "Economy",
        mcq: {
          question: "The term 'Systemically Significant Digital Enterprises' (SSDEs) is associated with which proposed legislation?",
          options: ["A) Data Protection Act", "B) Digital Competition Bill", "C) IT Act Amendment", "D) E-commerce Policy"],
          answer: "B) Digital Competition Bill",
          explanation: "SSDEs are the targets of the proposed Digital Competition Bill to prevent gatekeeping."
        }
      },
      {
        type: "MAINS_FACT",
        content: "Self-preferencing and data bundling are common anti-competitive practices in digital markets.",
        category: "Economy",
        mainsQuestion: "Why is 'ex-ante' regulation necessary for the digital economy compared to traditional 'ex-post' enforcement?"
      }
    ]
  },
  {
    title: "Declining TFR and the Demographic 'Cross-over'",
    url: "https://health.gov.in/tfr-statistics-2024",
    source: "The Hindu",
    content: "India's Total Fertility Rate has dipped to 2.0, below the replacement level of 2.1, indicating a population peak sooner than expected.",
    publishedAt: new Date().toISOString(),
    category: "Society",
    relevance: 9,
    editorials: [
      {
        issue: "The Silvering of India",
        crux: "While the north still has a young population, southern states are rapidly aging, leading to a 'demographic divergence' within the federation.",
        gsPaper: "GS1"
      }
    ],
    facts: [
      {
        type: "PRELIMS_FACT",
        content: "Replacement level fertility is the level of fertility at which a population exactly replaces itself from one generation to the next.",
        category: "Society",
        mcq: {
          question: "As per NFHS-5, what is India’s current Total Fertility Rate (TFR)?",
          options: ["A) 2.4", "B) 2.2", "C) 2.0", "D) 1.8"],
          answer: "C) 2.0",
          explanation: "According to NFHS-5, India's TFR has declined to 2.0, which is below the replacement level of 2.1."
        }
      },
      {
        type: "MAINS_FACT",
        content: "A shrinking working-age population could lead to the 'middle-income trap' if productivity doesn't increase.",
        category: "Society",
        mainsQuestion: "Discuss the implications of a declining Total Fertility Rate on India’s future economic growth and social security systems."
      }
    ]
  }
];

// Helper to push data to API
async function seed() {
  console.log("Seeding 10 high-quality articles...");
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ articles: dummyArticles })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Seeding Response Summary:", {
        processed: data.results.processed,
        created: data.results.created,
        factsBuilt: data.results.factsBuilt,
        editorialsBuilt: data.results.editorialsBuilt
      });
      if (data.results.errors.length > 0) {
        console.log("Detailed Errors:", JSON.stringify(data.results.errors, null, 2));
      } else {
        console.log("No errors reported.");
      }
    } else {
      const error = await response.text();
      console.error("Seeding Failed:", error);
    }
  } catch (err) {
    console.error("Error during seeding:", err);
  }
}

seed();
