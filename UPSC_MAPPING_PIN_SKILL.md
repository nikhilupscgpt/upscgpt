# UPSC Mapping — 4-Point Places in News (PIN) Gemini Skill Specification

Use this specification in your **Gemini Skill / Gem** that generates daily `.jsonl` entries for `/admin/pin` (`/api/admin/pin/ingest`).

---

## Core Philosophy: Why the 4-Point Template?
Dense, paragraph-length regional geology and botanical essays create cognitive fatigue and destroy map-based spatial recall. UPSC Prelims mapping questions test **precise, high-yield spatial associations**: which river basin, which protected area, which resource/chokepoint, or which historical anchor.

Every Place in News (PIN) entry **MUST** strictly follow this **4-Point Structure**:
1. **Place:** Clean title + 1-line geographic anchor (`locatedIn.placeLine`).
2. **Why in News:** Direct, human-written sentence **strictly $\le 30$ words** (`newsTriggers[0].newsHook`).
3. **Other Importance:** 1–2 concise, non-redundant bullets prefixed with a category label (`staticFacts`), with **zero** internal database codes.
4. **Related PYQ (if any):** 1–2 concise one-line bullets naming the UPSC year(s) and tested concept (`upscAngle.pyqBullets`), plus the database question IDs in `similarPYQ`.

---

## Strict Generation Rules for the Gemini Skill

### Rule 1: Clean `place` Title & `locatedIn.placeLine`
- **`place`**: Keep it short and human: `<Place Name> (<State or Country>)`.
  - GOOD: `"Sehore (Madhya Pradesh)"`, `"Souda Bay (Crete, Greece)"`, `"Tengakhat (Assam)"`
  - BAD: `"Sehore (Bherunda Teak Belt and Saru Maru Buddhist Site)"`
- **`locatedIn.placeLine`**: One crisp geographic line combining administrative location + physiographic/river-basin anchor.
  - GOOD: `"Sehore District (Vindhyan Range / Narmada Basin, MP)"`
  - GOOD: `"Souda Bay, Northwest Coast of Crete, Greece (Eastern Mediterranean)"`
  - GOOD: `"Tengakhat, Dibrugarh District, Assam (Upper Brahmaputra Basin)"`

### Rule 2: `newsHook` Must Not Exceed 30 Words
- Write a single, direct sentence (**maximum 25–30 words**) stating *why* the place is in news.
- **FORBIDDEN:** Do NOT start with newspaper mastheads or date preambles like *"The Indian Express Explained section on October 31 examined how..."* or *"The Ministry of Culture announced on October 30 that..."*. Start directly with the core event or focus.
  - GOOD (21 words): `"In focus for forest conservation along the Bherunda teak belt and protection of the ancient Saru Maru Buddhist heritage zone."`
  - GOOD (22 words): `"Heightened strategic activity as a major deep-water naval base for NATO and commercial transit during Eastern Mediterranean and Red Sea maritime tensions."`
  - GOOD (13 words): `"Hydrocarbon exploration and pipeline infrastructure expansion within the Naharkatiya–Duliajan oilfield corridor."`

### Rule 3: `staticFacts` = "Other Importance" (1–2 Concise Bullets, Zero Redundancy)
- Provide **1 or 2 bullets** (maximum 35 words per bullet).
- Prefix each bullet with a short category label followed by a colon, such as:
  - `"Ecology & Geography: ..."`
  - `"History & Culture: ..."`
  - `"Strategic Chokepoint: ..."`
  - `"Resource & River: ..."`
  - `"Tectonics & Relief: ..."`
- **FORBIDDEN in `staticFacts`:**
  - Never include raw database PYQ codes like `(ENV-UPSC-2023-03)` or `GEO-UPSC-2015-08` inside `staticFacts`.
  - Never write meta-phrases like *"Directly tested in UPSC 2023:"* or *"Direct Reinforcement of UPSC 2015:"* inside `staticFacts`—save all PYQ references for Point 4 (`upscAngle.pyqBullets`).
  - Do not repeat what was already said in `newsHook`.

### Rule 4: `upscAngle.pyqBullets` & `similarPYQ` = "Related PYQ"
- In `upscAngle.pyqBullets`, provide 1–2 concise one-line strings formatted as `"UPSC <Year(s)>: <1-line theme tested>"`:
  - `"UPSC 2015 & 2023: Tropical deciduous vegetation types and timber species (Teak vs. Mahua/Jackfruit)."`
  - `"UPSC 2022: Major Ashokan Minor Rock Edicts and their geographic locations."`
- In `similarPYQ`, keep the array of database PYQ IDs (e.g. `["ENV-UPSC-2023-03", "GEO-UPSC-2015-08"]`) so the interactive "Practice related PYQs" button automatically links the actual questions.

---

## Gold-Standard JSONL Examples

```jsonl
{"id":"PIN-2026-11-001","slug":"sehore-bherunda-teak-saru-maru-madhya-pradesh","date":"2026-11-06","targetExamYear":2027,"subject":"Environment","mapCategory":["Protected areas (NPs, WLS, tiger reserves)","Historical & archaeological sites"],"priority":"High","place":"Sehore (Madhya Pradesh)","aliases":["Bherunda","Saru Maru"],"placeType":"District & Heritage Zone","regionScope":"India","locatedIn":{"country":"India","stateOrProvince":"Madhya Pradesh","district":"Sehore","placeLine":"Sehore District (Vindhyan Range / Narmada Basin, MP)"},"coordinates":{"lat":23.2,"lng":77.08},"neighbours":["Ratapani Tiger Reserve","Kheoni Wildlife Sanctuary"],"newsTriggers":[{"date":"2026-11-06","source":"The Hindu","url":"https://www.thehindu.com/","newsHook":"In focus for forest conservation along the Bherunda teak belt and protection of the ancient Saru Maru Buddhist heritage zone."}],"staticFacts":["Ecology & Geography: Located between the Malwa Plateau and Narmada Valley; prime habitat for tropical deciduous teak (Tectona grandis); borders Ratapani Tiger Reserve and Kheoni Wildlife Sanctuary.","History & Culture: Houses the Saru Maru rock-cut stupas and Ashokan Minor Rock Edict mentioning Ashoka as Piyadasi Kumara."],"upscAngle":{"pyqBullets":["UPSC 2015 & 2023: Tropical deciduous vegetation types and timber species (Teak vs. Mahua/Jackfruit).","UPSC 2022: Major Ashokan Minor Rock Edicts and their geographic locations."]},"similarPYQ":["ENV-UPSC-2023-03","GEO-UPSC-2015-08","ANC-UPSC-2022-04"]}
{"id":"PIN-2026-11-002","slug":"souda-bay-crete-greece-eastern-mediterranean","date":"2026-11-06","targetExamYear":2027,"subject":"International Relations","mapCategory":["World – countries, borders & seas","World – places in news"],"priority":"High","place":"Souda Bay (Crete, Greece)","aliases":["Crete","Chania"],"placeType":"Naval Base & Bay","regionScope":"World","locatedIn":{"country":"Greece","stateOrProvince":"Crete","district":"Chania","placeLine":"Souda Bay, Northwest Coast of Crete, Greece (Eastern Mediterranean)"},"coordinates":{"lat":35.48,"lng":24.15},"neighbours":["Aegean Sea","Libyan Sea"],"newsTriggers":[{"date":"2026-11-06","source":"Indian Express","url":"https://indianexpress.com/","newsHook":"Heightened strategic activity as a major deep-water naval base for NATO and commercial transit during Eastern Mediterranean and Red Sea maritime tensions."}],"staticFacts":["Strategic Chokepoint: Deep natural harbor controlling access across the Aegean Sea, Libyan Sea, and eastern maritime trade corridors toward the Suez Canal."],"upscAngle":{"pyqBullets":["UPSC 2022 & 2023: Mediterranean littoral states and maritime conflict regions (e.g., Levant, Aegean Sea)."]},"similarPYQ":["GEO-UPSC-2023-18","GEO-UPSC-2022-09","GEO-UPSC-2017-07"]}
{"id":"PIN-2026-11-003","slug":"tengakhat-naharkatiya-duliajan-oilfield-assam","date":"2026-11-06","targetExamYear":2027,"subject":"Geography","mapCategory":["Minerals & resources by place","India – rivers, lakes, reservoirs & glaciers"],"priority":"High","place":"Tengakhat (Assam)","aliases":["Naharkatiya","Duliajan","Burhi Dihing"],"placeType":"Hydrocarbon Belt","regionScope":"India","locatedIn":{"country":"India","stateOrProvince":"Assam","district":"Dibrugarh","placeLine":"Tengakhat, Dibrugarh District, Assam (Upper Brahmaputra Basin)"},"coordinates":{"lat":27.38,"lng":95.16},"neighbours":["Burhi Dihing River","Dibru-Saikhowa National Park"],"newsTriggers":[{"date":"2026-11-06","source":"PIB","url":"https://pib.gov.in/","newsHook":"Hydrocarbon exploration and pipeline infrastructure expansion within the Naharkatiya–Duliajan oilfield corridor."}],"staticFacts":["Resource & River: Historic petroleum belt situated along the Burhi Dihing River (a major south-bank tributary of the Brahmaputra)."],"upscAngle":{"pyqBullets":["UPSC 2014 & 2019: Onshore oil reserves and south-bank/north-bank tributaries of the Brahmaputra (Burhi Dihing, Dhansiri, Subansiri)."]},"similarPYQ":["GEO-UPSC-2016-04","GEO-UPSC-2014-06","GEO-UPSC-2013-15"]}
```
