import { prisma } from '../src/lib/prisma.js';

/**
 * Curated 4-point overrides for verbose Oct–Nov 2026 PIN records,
 * starting with the user's exact 3 benchmark entries.
 */
const CURATED_4POINT_BY_SLUG = {
  'sehore-bherunda-vindhyan-teak-forests-saru-maru-madhya-pradesh': {
    place: 'Sehore (Madhya Pradesh)',
    placeLine: 'Sehore District (Vindhyan Range / Narmada Basin, MP)',
    newsHook:
      'In focus for forest conservation along the Bherunda teak belt and protection of the ancient Saru Maru Buddhist heritage zone.',
    staticFacts: [
      'Ecology & Geography: Located between the Malwa Plateau and Narmada Valley; prime habitat for tropical deciduous teak (Tectona grandis); borders Ratapani Tiger Reserve and Kheoni Wildlife Sanctuary.',
      'History & Culture: Houses the Saru Maru rock-cut stupas and Ashokan Minor Rock Edict mentioning Ashoka as Piyadasi Kumara.',
    ],
    pyqBullets: [
      'UPSC 2015 & 2023: Tropical deciduous vegetation types and timber species (Teak vs. Mahua/Jackfruit).',
      'UPSC 2022: Major Ashokan Minor Rock Edicts and their geographic locations.',
    ],
  },
  'souda-bay-crete-island-aegean-mediterranean-greece': {
    place: 'Souda Bay (Crete, Greece)',
    placeLine: 'Souda Bay, Northwest Coast of Crete, Greece (Eastern Mediterranean)',
    newsHook:
      'Heightened strategic activity as a major deep-water naval base for NATO and commercial transit during Eastern Mediterranean and Red Sea maritime tensions.',
    staticFacts: [
      'Strategic Chokepoint: Deep natural harbor controlling access across the Aegean Sea, Libyan Sea, and eastern maritime trade corridors toward the Suez Canal.',
    ],
    pyqBullets: [
      'UPSC 2022 & 2023: Mediterranean littoral states and maritime conflict regions (e.g., Levant, Aegean Sea).',
    ],
  },
  'tengakhat-naharkatiya-duliajan-burhi-dihing-oil-belt-assam': {
    place: 'Tengakhat (Assam)',
    placeLine: 'Tengakhat, Dibrugarh District, Assam (Upper Brahmaputra Basin)',
    newsHook:
      'Hydrocarbon exploration and pipeline infrastructure expansion within the Naharkatiya–Duliajan oilfield corridor.',
    staticFacts: [
      'Resource & River: Historic petroleum belt situated along the Burhi Dihing River (a major south-bank tributary of the Brahmaputra).',
    ],
    pyqBullets: [
      'UPSC 2014 & 2019: Onshore oil reserves and south-bank/north-bank tributaries of the Brahmaputra (Burhi Dihing, Dhansiri, Subansiri).',
    ],
  },
  'amini-island-amindivi-subgroup-lakshadweep-asw-swc': {
    place: 'Amini Island (Lakshadweep)',
    placeLine: 'Amini Island, Amindivi Subgroup, Lakshadweep (Arabian Sea)',
    newsHook:
      'Indigenous Anti-Submarine Warfare Shallow Water Craft (ASW SWC) named "Amini" after Lakshadweep’s strategic Amini Island was delivered to the Indian Navy.',
    staticFacts: [
      'Island & Channel Geography: Coral atoll in the northern Amindivi subgroup (north of the 11°N parallel), resting atop the submarine Chagos–Laccadive volcanic ridge.',
      'Degree Channels: 11°N divides Amindivi from Cannanore subgroup; 9°N Channel separates main Lakshadweep from Minicoy; 8°N Channel separates Minicoy from Maldives.',
    ],
    pyqBullets: [
      'UPSC 2014 & 2018: Coral reef distribution in India (Lakshadweep atolls vs. fringing reefs) and degree channels (8°, 9°, 10°).',
    ],
  },
  'choshi-boso-peninsula-kanto-coast-kuroshio-oyashio-japan': {
    place: 'Choshi & Boso Peninsula (Japan)',
    placeLine: 'Choshi, Chiba Prefecture, Eastern Honshu, Japan (Northwestern Pacific)',
    newsHook:
      'Struck by a 6.1-magnitude offshore earthquake off Chiba Prefecture along Japan’s eastern Kanto coast.',
    staticFacts: [
      'Oceanography: Located where the warm northward-flowing Kuroshio Current collides with the cold southward-flowing Oyashio Current, creating one of the world’s richest fishing grounds.',
      'Tectonics: Lies adjacent to the Boso Triple Junction—the world’s only Trench–Trench–Trench junction (Pacific, Philippine Sea, and Okhotsk plates).',
    ],
    pyqBullets: [
      'UPSC 2013 & 2018: Mixing of warm and cold ocean currents (Kuroshio–Oyashio) and Pacific Ring of Fire subduction trenches.',
    ],
  },
  'equatorial-guinea-bioko-malabo-mali-niger-river-sahel-africa': {
    place: 'Equatorial Guinea & Mali (West-Central Africa)',
    placeLine: 'Bioko & Rio Muni (Gulf of Guinea) and Mali (Sahel Belt)',
    newsHook:
      'President of India accepted credentials from the new Ambassadors of Mali, Madagascar, and Equatorial Guinea in New Delhi.',
    staticFacts: [
      'Political Geography: Equatorial Guinea comprises mainland Rio Muni and volcanic Bioko Island (Gulf of Guinea); despite its name, the Equator (0°) does not cross its mainland.',
      'Sahel Geography: Mali is a landlocked Sahel state traversed by the great northern arc and inland delta of the Niger River.',
    ],
    pyqBullets: [
      'UPSC 2022 & 2023: Landlocked Sahel states (Mali), Niger River basin, and Equator-crossing African countries.',
    ],
  },
  'tonga-kermadec-trench-lau-basin-fiji-tonga-south-pacific': {
    place: 'Lau Basin & Tonga Trench (South Pacific)',
    placeLine: 'Lau Back-Arc Basin (Between Fiji and Tonga, Southwestern Pacific)',
    newsHook:
      'A deep-focus 6.1-magnitude earthquake struck at a mantle depth of 541 km between Fiji and Tonga.',
    staticFacts: [
      'Tectonics & Relief: Active back-arc basin bounded by the Tonga Trench (second-deepest oceanic trench on Earth at Horizon Deep), where rapid Pacific Plate subduction generates the world’s deepest earthquakes.',
    ],
    pyqBullets: [
      'UPSC 2018: Pacific Ring of Fire trenches, back-arc basins, and deep-focus Wadati-Benioff earthquakes.',
    ],
  },
  'khunti-ulihatu-dombari-buru-birsa-munda-jharkhand': {
    place: 'Khunti (Jharkhand)',
    placeLine: 'Khunti District (Chotanagpur Plateau / South Koel–Subarnarekha Basin, Jharkhand)',
    newsHook:
      'In focus following a public tragedy in Khunti and upcoming Janjatiya Gaurav Divas commemorations at Birsa Munda’s birthplace.',
    staticFacts: [
      'History & Tribes: Contains Ulihatu (birthplace of Bhagwan Birsa Munda) and Dombari Buru hill, epicentre of the 1899–1900 Ulgulan uprising that led to the Chotanagpur Tenancy (CNT) Act, 1908 protecting Khuntkatti land rights.',
      'Fluvial Geography: Drained by the Karo (South Koel–Brahmani basin) and Tajna–Kanchi (Subarnarekha basin) rivers.',
    ],
    pyqBullets: [
      'UPSC 2020: Birsa Munda, Khuntkatti tenure, and the Ulgulan (Great Tumult) rebellion.',
      'UPSC 2021: East-flowing rivers originating on the Chotanagpur Plateau (Subarnarekha and Brahmani).',
    ],
  },
  'strait-of-hormuz-musandam-peninsula-iran-oman': {
    place: 'Strait of Hormuz (Persian Gulf)',
    placeLine: 'Strait of Hormuz (Between Iran and Oman’s Musandam Exclave)',
    newsHook:
      'Oil tankers caught fire amid heightened naval tensions and sea-mine alerts along the Strait of Hormuz energy corridor.',
    staticFacts: [
      'Strategic Chokepoint: Connects the Persian Gulf with the Gulf of Oman and Arabian Sea; bounded by Iran (north) and Oman’s Musandam Peninsula exclave (south, separated from mainland Oman by the UAE).',
    ],
    pyqBullets: [
      'UPSC 2015 & 2019: Persian Gulf littoral states, Gulf of Oman, and West Asian maritime chokepoints.',
    ],
  },
  'indravati-tiger-reserve-bijapur-bhopalpatnam-chhattisgarh': {
    place: 'Indravati Tiger Reserve (Chhattisgarh)',
    placeLine: 'Bijapur District, Bastar Region, Chhattisgarh (Indravati–Godavari Basin)',
    newsHook:
      'Reopened for regulated wildlife safaris along the Bhopalpatnam–Mattimarika circuit after a four-decade hiatus.',
    staticFacts: [
      'Ecology & Fauna: Bordered by the west-flowing Indravati River (major left-bank tributary of the Godavari); stronghold of the Endangered Asiatic Wild Water Buffalo (Bubalus arnee, state animal of Chhattisgarh).',
    ],
    pyqBullets: [
      'UPSC 2015 & 2020: Left-bank tributaries of the Godavari (Indravati, Pranhita, Sabari) and central Indian Tiger Reserves.',
    ],
  },
  'bengaluru-kalaburagi-pune-mumbai-corridor-bhor-ghat-raichur-doab': {
    place: 'Bengaluru–Kalaburagi–Mumbai Corridor (Deccan & Bhor Ghat)',
    placeLine: 'Mysore Plateau–Raichur Doab–Deccan Trap–Bhor Ghat Spine',
    newsHook:
      'Inaugural run of the Bengaluru–Mumbai Vande Bharat Sleeper Express connecting Bengaluru, Raichur, Kalaburagi, Pune, and Mumbai.',
    staticFacts: [
      'Passes & Relief: Traverses the Raichur Doab (between the Tungabhadra and Krishna rivers) and descends the Western Ghats escarpment between Pune and Mumbai via the Bhor Ghat pass.',
      'Western Ghats Pass Sequence (N → S): Thal Ghat (Mumbai–Nashik) → Bhor Ghat (Mumbai–Pune) → Palghat Gap (Coimbatore–Palakkad) → Shencottah Gap.',
    ],
    pyqBullets: [
      'UPSC 2014 & 2023: Western Ghats mountain passes, Raichur Doab, and Peninsular river crossings.',
    ],
  },
  'kurukshetra-gurukul-swami-shraddhanand-thanesar-haryana': {
    place: 'Kurukshetra & Thanesar (Haryana)',
    placeLine: 'Kurukshetra District, Haryana (Saraswati–Ghaggar–Chautang Interfluve)',
    newsHook:
      'Martyrdom centenary commemoration of Arya Samaj reformer Swami Shraddhanand held at Gurukul Kurukshetra on Haryana’s 60th Foundation Day.',
    staticFacts: [
      'Modern History: Swami Shraddhanand (Munshi Ram) led the Gurukul faction of the Arya Samaj, founded Gurukul Kangri (1902), and preached Hindu-Muslim unity from Delhi’s Jama Masjid during the 1919 Rowlatt Satyagraha.',
      'Ancient & Medieval Anchor: Encompasses Bhagwanpura (showing Late Harappan–Painted Grey Ware overlap) and Thanesar (original capital of Harshavardhana’s Pushyabhuti dynasty).',
    ],
    pyqBullets: [
      'UPSC 2020 & 2021: Late Harappan sites in Haryana, Harshavardhana’s capital Thanesar, and socio-religious reform movements.',
    ],
  },
  'somali-basin-guardafui-channel-horn-of-africa-somalia': {
    place: 'Somali Basin & Guardafui Channel (Horn of Africa)',
    placeLine: 'Somali Coast & Guardafui Channel (Between Puntland, Somalia and Socotra)',
    newsHook:
      'Naval piracy alerts issued in the Somali Basin following the hijacking of a fishing vessel off Somalia’s eastern coast.',
    staticFacts: [
      'Chokepoint & Horn: Somalia forms the eastern tip of the Horn of Africa (Somalia, Ethiopia, Eritrea, Djibouti); the Guardafui Channel separates Cape Guardafui (Somalia) from Yemen’s Socotra Archipelago.',
      'Oceanography: The Somali Current is the only major western boundary current that completely reverses direction seasonally with the Indian Ocean Monsoons, driving summer coastal upwelling.',
    ],
    pyqBullets: [
      'UPSC 2013, 2022 & 2023: Horn of Africa countries, Socotra Island, and monsoon reversal of the Somali Current.',
    ],
  },
  'kuno-morena-cheetah-corridor-chambal-basin-madhya-pradesh': {
    place: 'Kuno–Morena Wildlife Corridor (Madhya Pradesh)',
    placeLine: 'Sheopur & Morena Districts, Northern MP (Kuno–Chambal Basin)',
    newsHook:
      'Forest protection tightened across the Kuno–Morena dispersal corridor after an Indian-born cheetah cub was killed in Morena district.',
    staticFacts: [
      'Ecology & River: Bisected by the north-flowing Kuno River (a tributary of the Chambal River); features Northern Tropical Dry Deciduous Kardhai (Anogeissus pendula) and Khair forests hosting Project Cheetah.',
    ],
    pyqBullets: [
      'UPSC 2017 & 2020: Kuno National Park wildlife translocation landscape and Chambal River basin protected areas.',
    ],
  },
  'kiratpur-sahib-sutlej-yamuna-link-hansi-butana-canal-punjab-haryana': {
    place: 'Kiratpur Sahib & SYL Canal (Punjab–Haryana)',
    placeLine: 'Rupnagar District, Punjab & Ambala–Karnal Plains, Haryana (Sutlej–Yamuna Divide)',
    newsHook:
      'In focus on the 60th anniversary of the 1966 Punjab-Haryana reorganisation over disputes surrounding the Sutlej–Yamuna Link (SYL) canal.',
    staticFacts: [
      'Fluvial Geography: Kiratpur Sahib sits where the antecedent Sutlej River exits the Naina Devi Shivalik gorge; the proposed 214-km SYL Canal links the Sutlej (Indus basin) across the Ambala water divide to the Western Yamuna Canal (Ganga basin).',
      'Indus Treaty Anchor: Under the 1960 Indus Waters Treaty, the three Eastern Rivers (Sutlej, Beas, Ravi) are allocated to India, with the Beas merging completely into the Sutlej at Harike Wetland inside Punjab.',
    ],
    pyqBullets: [
      'UPSC 2019 & 2021: Indus Waters Treaty rivers, Beas–Sutlej confluence at Harike, and trans-Himalayan course of the Sutlej.',
    ],
  },
  'delhi-siliguri-guwahati-northern-bullet-train-corridor-chickens-neck': {
    place: 'Siliguri Corridor (West Bengal)',
    placeLine: 'Darjeeling–Jalpaiguri–Uttar Dinajpur Bottleneck, North Bengal (Terai–Duars)',
    newsHook:
      'Approval announced to extend the Delhi–Varanasi–Patna High-Speed Rail corridor through the Siliguri Corridor to Guwahati.',
    staticFacts: [
      'Strategic Bottleneck: Narrow 20–22 km "Chicken’s Neck" land corridor connecting mainland India with the eight Northeastern states, sandwiched between Nepal (west across the Mechi River) and Bangladesh (south), with Bhutan and the Chumbi Valley to the north.',
      'River Sequence (W → E): Mahananda → Teesta → Jaldhaka → Torsa → Sankosh → Manas → Brahmaputra.',
    ],
    pyqBullets: [
      'UPSC 2016 & 2022: Teesta and Sankosh rivers (tributaries of the Brahmaputra) and North Bengal international borders.',
    ],
  },
  'cyclone-murasu-nellore-narsapur-coast-khammam-nalgonda-telangana': {
    place: 'Nellore–Narsapur Coast (Andhra Pradesh)',
    placeLine: 'Penna–Krishna–Godavari Deltaic Coast, Andhra Pradesh (Bay of Bengal)',
    newsHook:
      'Cyclonic Storm "Murasu" (named by India after the classical Tamil war drum) intensified over the Bay of Bengal toward the Nellore–Narsapur coast.',
    staticFacts: [
      'Deltaic Geography: Spans three major east-flowing Peninsular river deltas from South to North—Penna (flowing through Gandikota canyon and Somasila gorge to Nellore), Krishna (Diviseema), and Vasishta Godavari (Narsapur).',
    ],
    pyqBullets: [
      'UPSC 2021 & 2022: East-flowing Peninsular rivers, Gandikota Canyon on the Penna River, and Krishna–Godavari deltas.',
    ],
  },
  'shintaphu-glacial-lake-gasa-bhutan-sankosh-river-alipurduar-kokrajhar': {
    place: 'Shintaphu Lake & Sankosh River (Bhutan–Assam–Bengal)',
    placeLine: 'Gasa District (Bhutan) & Alipurduar–Kokrajhar Duars Border (India)',
    newsHook:
      'A Glacial Lake Outburst Flood (GLOF) at Bhutan’s Shintaphu Lake triggered flood evacuations along the downstream Sankosh River in West Bengal and Assam.',
    staticFacts: [
      'Transboundary River: Drains via the Pho Chhu–Mo Chhu into the Puna Tsang Chhu, entering India as the Sankosh River—which forms the natural interstate boundary between West Bengal (Buxa TR) and Assam (Raimona NP) before joining the Brahmaputra in Bangladesh.',
    ],
    pyqBullets: [
      'UPSC 2014 & 2016: Right-bank tributaries of the Brahmaputra (Sankosh, Manas, Subansiri) and Duars protected areas.',
    ],
  },
  'port-olry-espiritu-santo-sola-vanuatu-trench-melanesia': {
    place: 'Espiritu Santo & Vanuatu (South Pacific)',
    placeLine: 'Port-Olry, Espiritu Santo Island, Vanuatu (Melanesia / New Hebrides Trench)',
    newsHook:
      'Multi-day seismic swarm of M4.8 to M6.0 earthquakes struck off Port-Olry and Sola along the northern Vanuatu Trench.',
    staticFacts: [
      'Tectonics & Climate Diplomacy: Volcanic archipelago in Melanesia where the Indo-Australian Plate subducts eastward beneath the North Fiji Basin along the New Hebrides Trench; Vanuatu also spearheaded the UNGA resolution seeking an ICJ Advisory Opinion on state climate obligations.',
    ],
    pyqBullets: [
      'UPSC 2018 & 2022: Pacific Ring of Fire subduction zones and South Pacific island nations.',
    ],
  },
  'shima-peninsula-kii-peninsula-nankai-trough-honshu-japan': {
    place: 'Shima Peninsula (Honshu, Japan)',
    placeLine: 'Mie Prefecture, Kii Peninsula, Honshu, Japan (Nankai Trough Margin)',
    newsHook:
      'A deep-focus 6.0-magnitude earthquake struck 352 km beneath the Shima Peninsula inside the subducting Philippine Sea Plate slab.',
    staticFacts: [
      'Geomorphology & Tectonics: Classic indented "Ria coast" (drowned river valleys around Ago Bay, birthplace of cultured pearl farming) overlooking the Nankai Trough megathrust zone.',
    ],
    pyqBullets: [
      'UPSC 2018 & 2023: Coastal landforms (Ria vs. Fiord coasts) and Circum-Pacific subduction zones.',
    ],
  },
  'sri-vijaya-puram-inaugural-bimstec-maritime-security-exercise-bay-of-bengal': {
    place: 'Sri Vijaya Puram (Andaman & Nicobar Islands)',
    placeLine: 'South Andaman Island (Bay of Bengal – Andaman Sea Margin)',
    newsHook:
      'Hosted the inaugural BIMSTEC Maritime Security Exercise bringing together naval agencies from all seven BIMSTEC member nations.',
    staticFacts: [
      'Strategic & Regional Grouping: Headquarters of India’s tri-service Andaman & Nicobar Command (ANC); BIMSTEC comprises 7 members (Bangladesh, Bhutan, India, Nepal, Sri Lanka, Myanmar, Thailand—including two landlocked members, Nepal and Bhutan, but excluding Maldives and Indonesia).',
    ],
    pyqBullets: [
      'UPSC 2014 & 2023: Andaman & Nicobar island channels (10° Channel, Duncan Passage) and Bay of Bengal regional groupings.',
    ],
  },
  'noney-kekru-naga-irang-ijai-barak-basin-manipur': {
    place: 'Noney (Manipur)',
    placeLine: 'Noney District, Western Manipur Hills (Ijai–Irang–Barak River Basin)',
    newsHook:
      'In news following security operations at Kekru Naga hill village and railway safety works near the Noney Bridge.',
    staticFacts: [
      'Drainage & Engineering: Drained westward by the Ijai and Irang rivers into the Barak–Meghna river system (unlike the Imphal River which drains south into Myanmar’s Chindwin–Irrawaddy); hosts the 141-m Noney Bridge, the world’s tallest railway pier bridge.',
    ],
    pyqBullets: [
      'UPSC 2014 & 2023: Barak–Meghna vs. Manipur–Chindwin drainage divide and Purvanchal hill ranges.',
    ],
  },
  'trishuli-river-devighat-chilime-hydropower-gandak-basin-nepal': {
    place: 'Trishuli River (Nepal / Gandak Basin)',
    placeLine: 'Rasuwa & Nuwakot Districts, Nepal (Sapta Gandaki / Narayani Basin)',
    newsHook:
      'In focus as Nepal sustained cross-border hydroelectricity exports to India and Bangladesh via the Trishuli and Chilime power stations.',
    staticFacts: [
      'Transboundary River: Antecedent Himalayan river rising in Tibet (as Kyirong Tsangpo); merges with six other rivers at Devghat to form the Sapta Gandaki (Narayani), which enters India at Valmiki Nagar (Bihar) as the Gandak River.',
      'Energy Diplomacy: Generating hub for the landmark trilateral power-trade agreement exporting 40 MW of Nepali hydroelectricity to Bangladesh via the Indian grid.',
    ],
    pyqBullets: [
      'UPSC 2019 & 2022: Himalayan antecedent rivers, left-bank Ganga tributaries (Gandak), and Valmiki Tiger Reserve.',
    ],
  },
  'kolli-hills-kollimalai-namakkal-eastern-ghats-tamil-nadu': {
    place: 'Kolli Hills (Tamil Nadu)',
    placeLine: 'Namakkal District, Central Tamil Nadu (Southern Eastern Ghats)',
    newsHook:
      'CSIR science outreach and medicinal plant conservation programmes conducted for Malayali tribal schools across Kolli Hills.',
    staticFacts: [
      'Hill Sequence & Relief: Bauxite-capped charnockite massif in the discontinuous Eastern Ghats; North-to-South hill sequence in Tamil Nadu is Javadi → Shevaroy → Pachamalai → Kolli → Sirumalai.',
      'Drainage & Tribes: Drained by the Aiyaru River (forming Agaya Gangai waterfalls) into the Cauvery; inhabited by the Malayali (Malaiyali) Scheduled Tribe.',
    ],
    pyqBullets: [
      'UPSC 2014 & 2017: North-to-South sequence of Eastern and Western Ghats hill ranges (Javadi, Shevaroy, Cardamom, Anaimalai).',
    ],
  },
  'nashik-ramkund-trimbakeshwar-kushavarta-godavari-origin-maharashtra': {
    place: 'Nashik & Trimbakeshwar (Maharashtra)',
    placeLine: 'Nashik District, Maharashtra (Brahmagiri Hills / Upper Godavari Basin)',
    newsHook:
      'Ceremonial flag-hoisting at Ramkund (Nashik) and Kushavarta Tirtha (Trimbakeshwar) marked the commencement of the Simhastha Kumbh Mela cycle.',
    staticFacts: [
      'River Origin & Name Trap: Trimbakeshwar sits at the foot of Brahmagiri Hill in the Western Ghats—the origin of the Godavari River (distinct from Brahmagiri Hill in Kodagu, Karnataka, which is the source of the Cauvery).',
      'Culture & Architecture: Houses the 18th-century Peshwa-rebuilt black basalt Trimbakeshwar Jyotirlinga temple and hosts the 12-yearly Simhastha Kumbh Mela.',
    ],
    pyqBullets: [
      'UPSC 2015 & 2019: Origin and tributaries of the Godavari vs. Cauvery rivers and Kumbh Mela river-bank sites.',
    ],
  },
  'piprahwa-buddha-relics-tawang-bomdila-namsai-arunachal-pradesh': {
    place: 'Piprahwa (UP) & Tawang–Namsai (Arunachal Pradesh)',
    placeLine: 'Siddharthnagar District (UP Terai) & Tawang–Namsai (Arunachal Pradesh)',
    newsHook:
      'Sacred Piprahwa bone relics of Lord Buddha were taken for public exposition across Tawang, Bomdila, and Namsai in Arunachal Pradesh.',
    staticFacts: [
      'Ancient History: Piprahwa (Siddharthnagar, UP) is identified with ancient Kapilavastu (capital of the Shakya Republic), where an 1898 excavation yielded a Brahmi-inscribed reliquary casket holding Buddha’s bone relics.',
      'Buddhist Geography: Western Arunachal (Tawang and Bomdila, inhabited by the Monpa tribe) follows Mahayana–Vajrayana (Gelugpa) Buddhism, whereas Eastern Arunachal (Namsai Golden Pagoda, inhabited by Tai Khamti and Singpho tribes) follows Theravada Buddhism.',
    ],
    pyqBullets: [
      'UPSC 2016 & 2023: Buddhist stupa relic sites, Mahajanapada capitals, and sectarian traditions of Indian Buddhism.',
    ],
  },
  'delhi-ridge-aravalli-monsoon-deciduous-trees-saptaparni-amaltas-pilkhan-kaim': {
    place: 'Delhi Ridge (Northern Aravalli Terminus)',
    placeLine: 'NCT of Delhi (Northernmost Spur of the Precambrian Aravalli Range)',
    newsHook:
      'Ecological study highlighted the seasonal leaf-shedding and flowering phenology of native monsoon deciduous trees across the Delhi Ridge.',
    staticFacts: [
      'Physiography: Northernmost structural tail of the ancient Proterozoic Aravalli fold range (spanning Gujarat, Rajasthan, Haryana, and Delhi), terminating at Wazirabad on the Yamuna.',
      'Botany & Ecology: Supports Northern Tropical Dry Deciduous and Thorn forest flora (Semal, Amaltas, Dhok, Arjuna, and Ficus virens/Pilkhan with obligate fig-wasp mutualism) that shed leaves in spring to conserve moisture against dry heat.',
    ],
    pyqBullets: [
      'UPSC 2014, 2021 & 2023: Aravalli range extent, deciduous leaf-shedding phenology, and fig-wasp obligate mutualism.',
    ],
  },
  'balleny-islands-ross-sea-southern-ocean-antarctica': {
    place: 'Balleny Islands (Southern Ocean)',
    placeLine: 'Balleny Volcanic Chain, Ross Sea Margin, Antarctica (Southern Ocean)',
    newsHook:
      'A 5.1-magnitude earthquake struck the Balleny Islands fracture zone near the Macquarie Triple Junction in the Southern Ocean.',
    staticFacts: [
      'Tectonics & Relief: Glaciated volcanic island chain (Young, Buckle, and Sturge islands) straddling the Antarctic Circle near the junction of the Australian, Pacific, and Antarctic tectonic plates.',
      'Governance: Protected under the 1959 Antarctic Treaty System as an Antarctic Specially Protected Area (ASPA) for Adelie and Chinstrap penguin colonies.',
    ],
    pyqBullets: [
      'UPSC 2018: Volcanic island chains and triple-junction plate boundaries.',
    ],
  },
  'adoni-mantralayam-tungabhadra-river-kurnool-andhra-pradesh': {
    place: 'Mantralayam & Adoni (Andhra Pradesh)',
    placeLine: 'Kurnool District, Rayalaseema, Andhra Pradesh (Tungabhadra River Basin)',
    newsHook:
      'Infrastructure and telecom connectivity audit conducted across the historic pilgrimage and fort corridor of Mantralayam and Adoni.',
    staticFacts: [
      'River & Philosophy: Mantralayam sits on the right (southern) bank of the Tungabhadra River (tributary of the Krishna) and houses the Brindavana samadhi of 17th-century Dvaita Vedanta saint Sri Raghavendra Tirtha.',
      'Medieval History: Nearby Adoni features a seven-hill granite fort that served as a strategic bastion overlooking the Raichur Doab during Vijayanagara–Bahmani/Bijapur wars.',
    ],
    pyqBullets: [
      'UPSC 2015 & 2019: Tungabhadra–Krishna river basin, Raichur Doab, and Dvaita vs. Advaita Vedanta traditions.',
    ],
  },
  'sakleshpur-ghat-shravanabelagola-byndoor-karwar-western-ghats-corridor': {
    place: 'Shravanabelagola & Sakleshpur Ghat (Karnataka)',
    placeLine: 'Hassan & Coastal Karnataka (Central Western Ghats Corridor)',
    newsHook:
      'Approval of the Bengaluru–Madgaon Vande Bharat Express via the newly electrified Sakleshpur–Subrahmanya Western Ghats railway ghat section.',
    staticFacts: [
      'Jain Heritage: Shravanabelagola (Hassan district) lies between Chandragiri Hill (where Chandragupta Maurya and Jain acharya Bhadrabahu performed Sallekhana) and Vindhyagiri Hill (crowned by the 57-ft monolithic Gommateshwara/Bahubali statue commissioned by Western Ganga minister Chavundaraya in 981 CE).',
      'Western Ghats Geography: Sakleshpur Ghat descends from the Mysore Plateau into the Netravati–Kumaradhara gorge adjacent to Pushpagiri Wildlife Sanctuary and Tipu Sultan’s star-shaped Manjarabad Fort.',
    ],
    pyqBullets: [
      'UPSC 2020 & 2023: Shravanabelagola Jain heritage, Bhadrabahu–Chandragupta Maurya tradition, and Western Ghats passes.',
    ],
  },
  'chachro-barmer-rajasthan-chhachro-tharparkar-sindh-sodha-rajputs': {
    place: 'Chachro (Barmer, Rajasthan / Tharparkar, Sindh)',
    placeLine: 'Barmer District, Rajasthan & Tharparkar District, Sindh (Thar Desert Border)',
    newsHook:
      'Newly notified border revenue village of Chachro in Barmer elected a 1971 war migrant as its first Sarpanch.',
    staticFacts: [
      'Border & History: Named after Chhachro in Pakistan’s Tharparkar (Sindh)—famous for the Indian Army’s 10 Para Commando raid during the 1971 War before being returned under the 1972 Simla Agreement.',
      'Human Geography: Ancestral homeland of the Sodha Rajputs, whose clan-exogamy traditions sustain cross-border cultural links across the Thar Desert between Sindh and Rajasthan.',
    ],
    pyqBullets: [
      'UPSC 2018 & 2023: Thar Desert human-geography communities and western international border sectors.',
    ],
  },
  'joshimath-jyotirmath-badrinath-alaknanda-vishnuprayag-uttarakhand': {
    place: 'Joshimath (Jyotirmath) & Badrinath (Uttarakhand)',
    placeLine: 'Chamoli District, Garhwal Himalayas, Uttarakhand (Alaknanda Valley)',
    newsHook:
      'In focus for high-altitude valley meteorology and slope stability assessments along the Badrinath–Joshimath corridor.',
    staticFacts: [
      'Glacier & Prayag: Badrinath sits on the Alaknanda River (originating from the Satopanth and Bhagirath Kharak glaciers), while Joshimath overlooks Vishnuprayag—the northernmost of the Panch Prayags (confluence of Alaknanda and Dhauliganga).',
      'Geology & Culture: Perched on fragile unconsolidated landslide debris directly atop the seismically active Main Central Thrust (MCT); houses Adi Shankaracharya’s northern Advaita monastery (Jyotir Peeth).',
    ],
    pyqBullets: [
      'UPSC 2019 & 2020: Glacier–River pairs (Satopanth–Alaknanda, Milam–Goriganga) and Panch Prayag confluences.',
    ],
  },
  'mayon-volcano-albay-bicol-peninsula-luzon-philippines': {
    place: 'Mayon Volcano (Luzon, Philippines)',
    placeLine: 'Albay Province, Bicol Peninsula, Southeastern Luzon, Philippines',
    newsHook:
      'Erupted with a 3,000-metre ash plume, prompting magmatic eruption and volcanic mudflow (lahar) alerts.',
    staticFacts: [
      'Volcanology & Tectonics: Most active volcano in the Philippines, renowned for its symmetrical composite stratovolcano cone; formed by westward subduction of the Philippine Sea Plate along the Philippine Trench.',
    ],
    pyqBullets: [
      'UPSC 2018 & 2022: Active volcanoes of Southeast Asia and Pacific Ring of Fire subduction trenches.',
    ],
  },
};

function cleanShortTitle(rawPlace, locatedIn, regionScope) {
  const raw = (rawPlace || '').trim();
  const parenMatch = raw.match(/^([^(]+?)\s*\(([^)]+)\)$/);
  if (!parenMatch) return raw;
  const baseName = parenMatch[1].trim();
  const insideParen = parenMatch[2].trim();
  const isNoisy =
    insideParen.length > 26 ||
    /\b(belt|basin|corridor|project|site|zone|landfall|headwaters|confluence|monastery|sanctuary|subgroup|oilfield|island of)\b/i.test(
      insideParen
    );
  if (!isNoisy) return raw;

  const state = (locatedIn?.stateOrProvince || '').replace(/\s*\([^)]*\)/g, '').trim();
  const country = (locatedIn?.country || '').replace(/\s*\([^)]*\)/g, '').trim();
  const qual = regionScope === 'World' ? country || state : state || country;
  if (qual && !baseName.toLowerCase().includes(qual.toLowerCase()) && qual.length <= 28) {
    return `${baseName} (${qual})`;
  }
  return baseName;
}

function buildPlaceLine(place, locatedIn, regionScope) {
  if (locatedIn?.placeLine) return locatedIn.placeLine;
  const district = (locatedIn?.district || '').trim();
  const state = (locatedIn?.stateOrProvince || '').trim();
  const country = (locatedIn?.country || '').trim();
  const parts = [];
  if (district) {
    parts.push(
      /district|province|governorate|prefecture|county|atoll|island|and|,|\(/i.test(district)
        ? district
        : `${district} District`
    );
  }
  if (state && (!district || !district.toLowerCase().includes(state.toLowerCase()))) {
    parts.push(state);
  }
  if (
    country &&
    country !== 'India' &&
    !parts.some((p) => p.toLowerCase().includes(country.toLowerCase()))
  ) {
    parts.push(country);
  }
  return parts.join(', ') || place || regionScope || 'India';
}

function capTo30Words(rawHook) {
  if (!rawHook) return '';
  let text = rawHook
    .replace(/\(\s*(?:[A-Z]{2,5}-UPSC-\d{4}-\d{1,3}(?:\s*(?:,|and|&)\s*[A-Z]{2,5}-UPSC-\d{4}-\d{1,3})*)\s*\)/gi, '')
    .replace(/\b[A-Z]{2,5}-UPSC-\d{4}-\d{1,3}\b/g, '')
    .replace(
      /^The\s+Indian\s+Express\s+(?:Explained\s+(?:Climate\s+)?section\s+)?(?:published\s+an?\s+[^,]+?\s+on\s+[A-Za-z]+\s+\d+\s+(?:into|on)\s+how\s+|(?:on\s+[A-Za-z]+\s+\d+\s+)?(?:examined|analysed|featured)\s+(?:how\s+)?)/i,
      ''
    )
    .replace(
      /^(?:The\s+)?(?:Union\s+)?(?:Ministry\s+of\s+[A-Za-z\s,&]+|Prime\s+Minister's\s+Office|Vice-President's\s+Secretariat)\s+announced\s+(?:on\s+[A-Za-z]+\s+\d+\s+)?that\s+/i,
      ''
    )
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (text) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 30) {
    return /[.!?]$/.test(text) ? text : `${text}.`;
  }
  const sliced = words.slice(0, 30).join(' ').replace(/[,;:\-–—]+$/, '');
  return `${sliced}.`;
}

function distillStaticFact(fact) {
  if (!fact || typeof fact !== 'string') return '';
  let text = fact
    .replace(/\(\s*(?:[A-Z]{2,5}-UPSC-\d{4}-\d{1,3}(?:\s*(?:,|and|&)\s*[A-Z]{2,5}-UPSC-\d{4}-\d{1,3})*)\s*\)/gi, '')
    .replace(/\b[A-Z]{2,5}-UPSC-\d{4}-\d{1,3}\b/g, '')
    .replace(/^Directly?\s+(?:tested|reinforcement|aligned|relevant)\s+(?:in|of|with|to)\s+UPSC[^:—–-]*[:—–-]\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If a fact is an overly long essay (> 45 words), keep the high-yield first clause/sentence
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 48) {
    const semiParts = text.split(';');
    if (semiParts.length > 1 && semiParts[0].split(/\s+/).length >= 14) {
      text = semiParts.slice(0, 2).join(';').trim();
    }
    const postWords = text.split(/\s+/).filter(Boolean);
    if (postWords.length > 52) {
      text = postWords.slice(0, 48).join(' ').replace(/[,;:\-–—]+$/, '') + '.';
    }
  }
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

async function main() {
  const pins = await prisma.placeInNews.findMany({
    orderBy: { date: 'desc' },
  });
  console.log(`Loaded ${pins.length} PlaceInNews rows from DB...`);

  let updated = 0;
  for (const p of pins) {
    const curated = CURATED_4POINT_BY_SLUG[p.slug];
    const nextPlace = curated?.place || cleanShortTitle(p.place, p.locatedIn, p.regionScope);
    const nextPlaceLine =
      curated?.placeLine || buildPlaceLine(nextPlace, p.locatedIn, p.regionScope);

    const nextLocatedIn = {
      ...(typeof p.locatedIn === 'object' && p.locatedIn ? p.locatedIn : {}),
      placeLine: nextPlaceLine,
    };

    const existingTriggers = Array.isArray(p.newsTriggers) ? p.newsTriggers : [];
    const nextTriggers = existingTriggers.map((t, idx) => {
      if (idx === 0 && curated?.newsHook) {
        return { ...t, newsHook: curated.newsHook };
      }
      return {
        ...t,
        newsHook: capTo30Words(t?.newsHook || ''),
      };
    });

    const rawFacts = curated?.staticFacts
      ? curated.staticFacts
      : (Array.isArray(p.staticFacts) ? p.staticFacts : [])
          .map(distillStaticFact)
          .filter(Boolean);

    // Deduplicate facts
    const seenFactKeys = new Set();
    const nextFacts = [];
    for (const f of rawFacts) {
      const k = f.toLowerCase().slice(0, 55);
      if (!seenFactKeys.has(k)) {
        seenFactKeys.add(k);
        nextFacts.push(f);
      }
    }

    const nextUpscAngle = {
      ...(typeof p.upscAngle === 'object' && p.upscAngle ? p.upscAngle : {}),
      ...(curated?.pyqBullets ? { pyqBullets: curated.pyqBullets } : {}),
    };

    await prisma.placeInNews.update({
      where: { id: p.id },
      data: {
        place: nextPlace,
        locatedIn: nextLocatedIn,
        newsTriggers: nextTriggers,
        staticFacts: nextFacts.slice(0, 3),
        upscAngle: nextUpscAngle,
      },
    });
    updated++;
  }

  console.log(`Successfully distilled and updated ${updated} PlaceInNews records.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
