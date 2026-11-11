# UPSC Environment & Ecology Atlas — Unified Ingestion Specification (Gemini Skill / Gem)

Use this comprehensive specification in your **Gemini Skill / Gem** to generate validated, idempotent `.jsonl` entries for the Environment Atlas (`/admin/environment` and `/api/admin/env-atlas/ingest`).

---

## 1. Architectural Philosophy: The Unified Environment Engine
UPSC Environment questions in Prelims & Mains are divided into distinct thematic pillars. While each pillar requires specialized cognitive framing, all items share a single polymorphic backend model (`EnvAtlasItem`) identified by the `module` discriminator:

| Module Identifier | Domain Covered | Status | Primary Spatial / Visual Hook |
|---|---|---|---|
| `SPECIES` | High-yield Fauna, Flora, Endemics | **ACTIVE NOW** | 5-Box IUCN Status Meter, WPA Schedule, Live Wiki Photo, Habitat Dots |
| `PROTECTED_AREA` | National Parks, Tiger Reserves, Ramsar Sites | *Design Blueprint* | Core-Buffer boundary, Rivers passing through, Biome |
| `CONVENTION` | Global Treaties, Protocols & COP outcomes | *Design Blueprint* | Legally binding flag, Adoption timeline, India status |
| `ACT_ORG` | Environmental Acts, Statutory Bodies & Powers | *Design Blueprint* | Parent Act, Penalties, Composition, Statutory mandate |
| `SCHEME` | Conservation Projects, Funds & Missions | *Design Blueprint* | Central Sector vs Centrally Sponsored, Budget, Targets |
| `HOTSPOT` | Biodiversity Hotspots & Fragile Ecosystems | *Design Blueprint* | Endemism rate, Criteria, Major threats, Inter-state belt |

---

## 2. MODULE 1: SPECIES ATLAS (Active 11-Point Specification)

### Strict 11-Point Ingestion Schema for Species
Every `SPECIES` record MUST follow this exact 11-point structure:

1. **Specie** (`species` / `title`): Common name in English (e.g., "Bengal Tiger", "Great Indian Bustard").
2. **Scientific name** (`scientificName` / `subtitle`): Binomial Latin nomenclature (e.g., "Panthera tigris tigris").
3. **Habitat TYpe** (`habitatType`): Forest type / biome (e.g., "Tropical moist deciduous, alluvial grasslands, and mangrove swamps").
4. **Found in** (`foundIn` / `places`): Key Protected Areas, National Parks, Sanctuaries, and States where viable wild populations occur (with lat/lon coordinates for interactive vector map plotting).
5. **IUCN** (`iucn`): Threat status on Red List — strictly one of `"CR"`, `"EN"`, `"VU"`, `"NT"`, `"LC"`.
6. **WPA, 1972** (`wpa1972` / `wpa`): Legal protection tier under Wildlife (Protection) Act, 1972 — `"Schedule I"` or `"Schedule II"`.
7. **CITES** (`cites`): Convention on International Trade in Endangered Species listing — `"Appendix I"`, `"Appendix II"`, or `"Appendix III"`.
8. **Unique Features** (`uniqueFeatures` / `rememberBullets`): Distinctive morphological, physiological, or indicator traits that UPSC Prelims tests.
9. **Behaviour** (`behaviour`): Activity cycle (diurnal / nocturnal / crepuscular), locomotion (arboreal / fossorial), social dynamics, and breeding/ecological habits.
10. **In News** (`inNews` / `newsTriggers`): Recent legal orders, translocations, censuses, conservation declarations, or Supreme Court judgments.
11. **PYQ** (`pyq` / `similarPYQ`): Relevant UPSC Prelims previous years question mentions and exam themes.

### Gold-Standard 11-Point Species JSON Example
```json
{
  "species": "Great Indian Bustard",
  "scientificName": "Ardeotis nigriceps",
  "habitatType": "Arid and Semi-Arid Grasslands",
  "foundIn": [
    { "name": "Desert National Park", "state": "Rajasthan", "lat": 26.9, "lon": 70.9, "note": "Primary remaining breeding stronghold" },
    { "name": "Rollapadu Wildlife Sanctuary", "state": "Andhra Pradesh", "lat": 15.7, "lon": 78.3, "note": "Southern relict population" }
  ],
  "iucn": "CR",
  "wpa1972": "Schedule I",
  "cites": "Appendix I",
  "uniqueFeatures": [
    "Heaviest flying bird native to India (up to 15 kg).",
    "Flagship grassland indicator species and the State Bird of Rajasthan.",
    "Black crown on forehead contrasting with pale neck."
  ],
  "behaviour": "Diurnal and terrestrial feeder; omnivorous diet of seeds, insects, and small reptiles. Ground-nester laying only a single egg without an elaborate nest, making eggs exceptionally vulnerable to feral predators.",
  "inNews": "Supreme Court appointed an expert committee in 2024 to evaluate undergrounding overhead powerlines in priority GIB corridors in Rajasthan and Gujarat to prevent fatal collisions.",
  "pyq": "UPSC Prelims 2012: In which one of the following places can Great Indian Bustard be found in its natural habitat? (Answer: Desert National Park) / Prelims 2020: Priority species conservation under CAMPA."
}
```

### Gold-Standard 11-Point JSONL Batch Examples
```jsonl
{"species":"Bengal Tiger","scientificName":"Panthera tigris tigris","habitatType":"Tropical moist deciduous, alluvial grasslands, and mangrove swamps","foundIn":[{"name":"Sundarbans National Park","state":"West Bengal","lat":21.94,"lon":88.89},{"name":"Corbett National Park","state":"Uttarakhand","lat":29.53,"lon":78.77},{"name":"Bandhavgarh National Park","state":"Madhya Pradesh","lat":23.7,"lon":81.02}],"iucn":"EN","wpa1972":"Schedule I","cites":"Appendix I","uniqueFeatures":["Apex predator and flagship keystone species for forest ecosystem integrity.","Only tiger population inhabiting mangrove forests (Sundarbans).","Stripes are unique like human fingerprints; counted using camera-trap stripe pattern matching (M-STrIPES)."],"behaviour":"Solitary, territorial, and predominantly nocturnal or crepuscular hunter. Exceptional swimmer and adept at crossing tidal rivers.","inNews":"50 Years of Project Tiger (1973–2023) celebrated; International Big Cat Alliance (IBCA) launched by India.","pyq":"UPSC Prelims 2020: Which of the following protected areas are situated in the Cauvery basin? / UPSC Prelims 2012: The term 'M-STrIPES' is sometimes seen in the news in the context of..."}
{"species":"Dugong (Sea Cow)","scientificName":"Dugong dugon","habitatType":"Shallow tropical marine coastal waters and seagrass meadows","foundIn":[{"name":"Palk Bay Dugong Reserve","state":"Tamil Nadu","lat":9.8,"lon":79.2},{"name":"Gulf of Mannar Marine NP","state":"Tamil Nadu","lat":9.1,"lon":79.1},{"name":"Gulf of Kutch Marine NP","state":"Gujarat","lat":22.46,"lon":69.57}],"iucn":"VU","wpa1972":"Schedule I","cites":"Appendix I","uniqueFeatures":["Only strictly herbivorous marine mammal in the world, feeding exclusively on seagrass.","Cannot hold breath indefinitely; surfaces every 2-3 minutes to breathe.","Does not inhabit freshwater rivers (unlike Amazonian/African manatees)."],"behaviour":"Slow-moving grazer; highly sensitive to bottom-trawling and propeller strikes. Produces only one calf after a prolonged gestation of 13-15 months.","inNews":"Tamil Nadu notified India's first Dugong Conservation Reserve in Palk Bay spanning 448 sq km.","pyq":"UPSC Prelims 2015: With reference to 'Dugong', a mammal found in India, which statements are correct? (1. Herbivorous marine mammal, 2. Found along entire coast of India [Incorrect], 3. Given legal protection under Schedule I of WPA 1972)."}
{"species":"Lion-tailed Macaque","scientificName":"Macaca silenus","habitatType":"Tropical evergreen rainforest canopy of the Western Ghats","foundIn":[{"name":"Silent Valley National Park","state":"Kerala","lat":11.13,"lon":76.45},{"name":"Kalakad Mundanthurai TR","state":"Tamil Nadu","lat":8.66,"lon":77.34},{"name":"Sharavathi Valley WLS","state":"Karnataka","lat":14.15,"lon":74.83}],"iucn":"EN","wpa1972":"Schedule I","cites":"Appendix I","uniqueFeatures":["Strictly endemic to the rainforest canopy of the Western Ghats (Karnataka, Kerala, Tamil Nadu).","Distinctive silver-white mane surrounding black face; lion-like tufted tail tip.","Selective frugivore that avoids monoculture plantations (tea, coffee, teak)."],"behaviour":"Strictly diurnal and arboreal; rarely descends to the forest floor, making it extremely vulnerable to canopy fragmentation from roads and electric power lines.","inNews":"Canopy rope bridges installed in Anamalai to prevent roadkill of fragmented lion-tailed macaque troops.","pyq":"UPSC Prelims 2013: In which of the following states is the lion-tailed macaque found in its natural habitat? (Tamil Nadu, Kerala, Karnataka)."}
```

---

## 3. MODULE 2: PROTECTED AREAS & BIOSPHERE RESERVES (Blueprint)
*Target Schema Preview for later implementation:*
```jsonl
{"slug":"jim-corbett-national-park","module":"PROTECTED_AREA","category":"National Park","title":"Jim Corbett National Park","subtitle":"Est. 1936 · Ramganga Basin","wikiTitle":"Jim_Corbett_National_Park","statusBadges":{"designations":["National Park","Tiger Reserve"],"establishedYear":1936,"biome":"Sub-Himalayan Sal Forest"},"rivers":["Ramganga","Kosi"],"rememberBullets":["India's oldest National Park (originally Hailey NP); Project Tiger launched here in 1973.","Ramganga River flows west through the park before joining the Ganga on its left bank.","Located in the Shivalik foothills and Patli Dun valley in Nainital/Pauri Garhwal."],"places":[{"n":"Jim Corbett NP","st":"Uttarakhand","lat":29.53,"lon":78.77}]}
```

---

## 4. MODULE 3: INTERNATIONAL CONVENTIONS & TREATIES (Blueprint)
*Target Schema Preview for later implementation:*
```jsonl
{"slug":"cites","module":"CONVENTION","category":"Wildlife Trade","title":"CITES (Washington Convention)","subtitle":"Adopted 1973 · Entered into Force 1975","wikiTitle":"CITES","statusBadges":{"binding":true,"indiaParty":true,"secretariat":"Geneva, Switzerland","parties":184},"rememberBullets":["Legally binding on Parties; does not take the place of national laws but provides an international framework.","Three Appendices: Appendix I (Commercial trade prohibited), Appendix II (Regulated via permits), Appendix III (Unilateral request).","Administered through UNEP; COP held every 2-3 years."],"confusionTrap":"Don't confuse: CITES regulates international wildlife trade; CMS (Bonn Convention) focuses on the conservation of terrestrial, marine, and avian migratory species across ranges."}
```

---

## 5. MODULE 4: ACTS, POLICIES & STATUTORY BODIES (Blueprint)
*Target Schema Preview for later implementation:*
```jsonl
{"slug":"wpa-1972","module":"ACT_ORG","category":"Parent Legislation","title":"Wildlife (Protection) Act, 1972","subtitle":"Enacted 1972 · Amended 2022","wikiTitle":"Wildlife_Protection_Act,_1972","statusBadges":{"type":"Central Act","ministry":"MoEFCC","rationalizedSchedules":4},"rememberBullets":["2022 Amendment rationalised schedules from 6 down to 4: Schedule I (highest protection), Schedule II (lesser protection), Schedule III (CITES specimens), Schedule IV (protected plants).","Empowers Central Govt to declare Protected Areas and establishes NTCA, Wildlife Crime Control Bureau (WCCB), and Central Zoo Authority.","Vermin classification power rests exclusively with the Central Government via notification."],"confusionTrap":"Don't confuse: Under 2022 Amendment, Vermin schedule (formerly Schedule V) has been abolished; Central Govt can notify animals under Schedule II as vermin for specified periods."}
```

---

## 6. MODULE 5: SCHEMES & CONSERVATION MISSIONS (Blueprint)
*Target Schema Preview for later implementation:*
```jsonl
{"slug":"project-tiger","module":"SCHEME","category":"Centrally Sponsored Scheme","title":"Project Tiger","subtitle":"Launched 1973 · 50 Years Milestone","wikiTitle":"Project_Tiger","statusBadges":{"schemeType":"Centrally Sponsored","adminBody":"NTCA","fundingRatio":"60:40 (General States) / 90:10 (NE & Himalayan)"},"rememberBullets":["Launched on 1 April 1973 from Corbett National Park with 9 initial Tiger Reserves.","Statutory status accorded via 2006 Amendment to WPA 1972 by creating National Tiger Conservation Authority (NTCA).","54+ Tiger Reserves currently notified, covering over 2.3% of India's total geographical area."],"confusionTrap":"Don't confuse: NTCA is a statutory body chaired by the Union Minister of Environment; the National Board for Wildlife (NBWL) is chaired by the Prime Minister."}
```
