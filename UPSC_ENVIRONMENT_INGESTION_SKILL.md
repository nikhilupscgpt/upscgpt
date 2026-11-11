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

## 2. MODULE 1: SPECIES ATLAS (Active Specification)

### Strict 4-Point Generation Rules for Species
Every `SPECIES` record MUST follow this structure:
1. **Clean Identity**: Common Name (`title`), Scientific Name (`subtitle`), Category (`Mammals`, `Birds`, `Reptiles`, `Aquatic`, `Flora`), and clean Wikipedia article title (`wikiTitle` for auto-fetching live Creative Commons photo).
2. **Legal & Threat Status**: Strict mapping in `statusBadges`:
   - `iucn`: Exactly one of `"CR"`, `"EN"`, `"VU"`, `"NT"`, `"LC"`.
   - `wpa`: Exactly `"Schedule I"` or `"Schedule II"` (per WPA 2022 Amendment rationalized schedules).
   - `cites`: Exactly `"Appendix I"`, `"Appendix II"`, or `"Appendix III"`.
   - `endemic`: `true` or `false`.
3. **High-Yield UPSC Pedagogy**:
   - `rememberBullets`: Exactly 3 crisp, exam-tested facts (bullet 1: distinctive identity/spot; bullets 2 & 3: core ecological/conservation facts).
   - `confusionTrap`: Exactly 1 yellow callout string highlighting standard UPSC distractors (e.g., confusing Great Indian Bustard with Lesser Florican, or Asiatic Lion with Bengal Tiger).
4. **Spatial Distribution & News**:
   - `places`: Array of key National Parks, Wildlife Sanctuaries, or geographic ranges with `{ n: "Name", st: "State", lat: number, lon: number, note: "..." }`.
   - `newsTriggers`: Array with `{ tag: "...", date: "YYYY", what: "...", whyItMatters: "..." }`.

### Gold-Standard Species JSONL Examples
```jsonl
{"slug":"great-indian-bustard","module":"SPECIES","category":"Birds","title":"Great Indian Bustard","subtitle":"Ardeotis nigriceps","wikiTitle":"Great_Indian_bustard","statusBadges":{"iucn":"CR","wpa":"Schedule I","cites":"Appendix I","endemic":true},"rememberBullets":["Flagship grassland bird of India and state bird of Rajasthan.","Heaviest flying bird in India (up to 15 kg); suffers high mortality from high-voltage power transmission lines.","Desert National Park (Rajasthan) is its last remaining viable breeding stronghold."],"confusionTrap":"Don't confuse: GIB is Critically Endangered (CR) and prefers arid grasslands; Lesser Florican is also Endangered/CR but prefers moist grasslands of western India.","places":[{"n":"Desert National Park","st":"Rajasthan","lat":26.9,"lon":70.9,"note":"Primary remaining breeding stronghold"},{"n":"Rollapadu Wildlife Sanctuary","st":"Andhra Pradesh","lat":15.7,"lon":78.3,"note":"Southern relict population"}],"newsTriggers":[{"tag":"Supreme Court","date":"2024","what":"Supreme Court established expert panel on undergrounding overhead powerlines in GIB priority habitats.","whyItMatters":"Striking a balance between green solar corridors and species extinction."}]}
{"slug":"dugong","module":"SPECIES","category":"Mammals","title":"Dugong (Sea Cow)","subtitle":"Dugong dugon","wikiTitle":"Dugong","statusBadges":{"iucn":"VU","wpa":"Schedule I","cites":"Appendix I","endemic":false},"rememberBullets":["Only strictly herbivorous marine mammal in the world, feeding exclusively on seagrass beds.","Cannot hold breath indefinitely; surfaces every few minutes to breathe.","Found in Gulf of Mannar, Palk Bay, Gulf of Kutch, and Andaman & Nicobar Islands."],"confusionTrap":"Don't confuse: Dugongs are strictly marine; Manatees inhabit freshwater rivers and coastal waters of Americas and Africa and do not occur naturally in India.","places":[{"n":"Palk Bay Dugong Reserve","st":"Tamil Nadu","lat":9.8,"lon":79.2,"note":"India's first designated Dugong Conservation Reserve"},{"n":"Gulf of Mannar Marine NP","st":"Tamil Nadu","lat":9.1,"lon":79.1,"note":"Prime seagrass habitat"}],"newsTriggers":[{"tag":"Conservation","date":"2023","what":"Tamil Nadu notified India's first Dugong Conservation Reserve in Palk Bay covering 448 sq km.","whyItMatters":"Community-based conservation with local coastal fisherfolk."}]}
{"slug":"lion-tailed-macaque","module":"SPECIES","category":"Mammals","title":"Lion-tailed Macaque","subtitle":"Macaca silenus","wikiTitle":"Lion-tailed_macaque","statusBadges":{"iucn":"EN","wpa":"Schedule I","cites":"Appendix I","endemic":true},"rememberBullets":["Endemic strictly to the evergreen tropical rainforests of the Western Ghats (Karnataka, Kerala, Tamil Nadu).","Arboreal species with silver-white mane; highly sensitive to canopy fragmentation from roads and tea plantations.","Silent Valley National Park (Kerala) harbors the largest contiguous wild population."],"confusionTrap":"Don't confuse: Lion-tailed Macaque is strictly diurnal and arboreal in Western Ghats; Bonnet Macaque is widespread across peninsular India.","places":[{"n":"Silent Valley National Park","st":"Kerala","lat":11.13,"lon":76.45,"note":"Largest contiguous population; threatened earlier by proposed hydel project"},{"n":"Kalakad Mundanthurai TR","st":"Tamil Nadu","lat":8.66,"lon":77.34,"note":"Southern Western Ghats evergreen canopy"}],"newsTriggers":[{"tag":"Canopy Bridges","date":"2024","what":"Installation of artificial canopy bridges in Anamalai to prevent roadkill of fragmented groups.","whyItMatters":"Mitigating linear infrastructure fragmentation in biodiversity hotspots."}]}
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
