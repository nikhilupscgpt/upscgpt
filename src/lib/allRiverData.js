/**
 * Master River Intelligence Registry for UPSC Atlas & Mapping Lecture Studio
 * Exhaustive data covering:
 * - IND-RIV-01: Ganga River System
 * - IND-RIV-02: Indus River System (Sindhu & Panjnad)
 * - IND-RIV-03: Brahmaputra River System (Yarlung Tsangpo - Dihang - Jamuna)
 * - IND-RIV-04: Godavari River System (Dakshin Ganga)
 * - IND-RIV-05: Narmada River System (Rewa Rift Valley)
 * - IND-RIV-06: Kaveri (Cauvery) River System
 * - IND-RIV-07: Krishna River System
 * - IND-RIV-08: Mahanadi, Brahmani & Subarnarekha River Basins
 * - IND-RIV-09: Chambal River, Ken-Betwa Interlinking & Malwa Drainage
 * - IND-RIV-10: Peninsular West-Flowing Rivers (Tapi, Sabarmati, Mahi, Periyar, Mandovi/Zuari)
 */

export const ALL_RIVER_DETAILS = {
  // -------------------------------------------------------------------------
  // IND-RIV-01: GANGA RIVER SYSTEM
  // -------------------------------------------------------------------------
  'IND-RIV-01': {
    length: '2,525 km',
    origin: 'Formed at Devprayag (Uttarakhand) by confluence of Bhagirathi (Gangotri Glacier) and Alaknanda (Satopanth Glacier)',
    mouth: 'Bay of Bengal (splits into Padma in Bangladesh and Hooghly in West Bengal; forms Sundarbans delta)',
    states: {
      flowsThrough: ['Uttarakhand', 'Uttar Pradesh', 'Bihar', 'West Bengal'],
      basinStates: ['Uttarakhand', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Delhi', 'Haryana', 'Rajasthan', 'Madhya Pradesh', 'Himachal Pradesh', 'Chhattisgarh', 'Jharkhand']
    },
    tributaries: {
      leftBank: [
        { name: 'Ramganga', note: 'Garhwal Himalayas → passes Jim Corbett NP → joins Ganga near Kannauj' },
        { name: 'Gomti', note: 'Only major tributary rising in the plains (Gomat Taal/Fulhar Jheel, Pilibhit) → Lucknow → Saidpur Sangam' },
        { name: 'Ghaghara (Karnali)', note: 'Rises near Gurla Mandhata (Tibet); largest tributary by water volume; joined by Sarda (Kali) → Revelganj (Chhapra)' },
        { name: 'Gandak', note: 'Nepal Himalayas (Dhaulagiri & Mt Everest) → passes Valmiki NP → Sonpur Sangam' },
        { name: 'Kosi', note: "'Sorrow of Bihar'; 7 streams (Saptakoshi); extreme course shifts & heavy silt load → Kursela Sangam" },
        { name: 'Mahananda', note: 'Last major left-bank tributary; rises in Darjeeling hills → Godagari' }
      ],
      rightBank: [
        { name: 'Yamuna', note: 'Longest and largest right-bank tributary (1,376 km); rises at Yamunotri Glacier → Triveni Sangam (Prayagraj)' },
        { name: 'Tamsa (Tons)', note: 'Rises in Kaimur Range (MP) → joins downstream of Prayagraj' },
        { name: 'Son', note: 'Rises in Amarkantak Plateau (MP); flows parallel to Kaimur → joins directly on right bank near Patna' },
        { name: 'Punpun', note: 'Rises in Palamu hills (Jharkhand) → joins near Fatuha' }
      ]
    },
    confluences: [
      { tributary: 'Panch Prayag', sangam: 'Vishnuprayag (Alaknanda+Dhauliganga), Nandaprayag (+Nandakini), Karnaprayag (+Pindar), Rudraprayag (+Mandakini), Devprayag (+Bhagirathi)', state: 'Uttarakhand' },
      { tributary: 'Yamuna', sangam: 'Triveni Sangam (Prayagraj)', state: 'Uttar Pradesh' },
      { tributary: 'Gomti', sangam: 'Saidpur (Ghazipur)', state: 'Uttar Pradesh' },
      { tributary: 'Ghaghara', sangam: 'Revelganj (Chhapra)', state: 'Bihar' },
      { tributary: 'Son', sangam: 'Danapur / Patna', state: 'Bihar' },
      { tributary: 'Gandak', sangam: 'Sonpur (near Patna)', state: 'Bihar' },
      { tributary: 'Kosi', sangam: 'Kursela (Katihar)', state: 'Bihar' }
    ],
    towns: [
      { name: 'Haridwar & Rishikesh', type: 'Cultural', significance: 'Where Ganga leaves the Himalayas and enters the northern plains', state: 'Uttarakhand' },
      { name: 'Kanpur', type: 'Economic', significance: 'Major industrial metropolis and leather manufacturing hub', state: 'Uttar Pradesh' },
      { name: 'Prayagraj', type: 'Cultural', significance: 'Ancient Prayag, Triveni Sangam & Maha Kumbh Mela', state: 'Uttar Pradesh' },
      { name: 'Varanasi', type: 'Cultural / Historical', significance: 'Continuous ancient living city; Kashi Vishwanath Dham', state: 'Uttar Pradesh' },
      { name: 'Patna (Pataliputra)', type: 'Historical', significance: 'Ancient capital of Magadha, Mauryan and Gupta empires', state: 'Bihar' },
      { name: 'Kolkata', type: 'Economic', significance: 'Major port city situated on the Hooghly tidal distributary', state: 'West Bengal' }
    ],
    dams: [
      { name: 'Tehri Dam', state: 'Uttarakhand', type: 'Highest dam in India (260.5 m, rock & earth-fill on Bhagirathi)' },
      { name: 'Bhimawala / Pashulok Barrage', state: 'Uttarakhand', type: 'Rishikesh hydro diversion barrage' },
      { name: 'Narora Atomic Power Station Barrage', state: 'Uttar Pradesh', type: 'Cooling water barrage for nuclear station' },
      { name: 'Kanpur Barrage (Luv Kush Barrage)', state: 'Uttar Pradesh', type: 'Drinking water barrage for Kanpur city' },
      { name: 'Farakka Barrage', state: 'West Bengal', type: 'Diverts Ganga water into Bhagirathi-Hooghly to flush silt from Kolkata Port (1996 Treaty)' }
    ],
    protectedAreas: [
      { name: 'Gangotri National Park', relation: 'Contains the source glacier (Gaumukh) of the Bhagirathi river', state: 'Uttarakhand' },
      { name: 'Jim Corbett National Park', relation: 'Drained by the Ramganga river tributary', state: 'Uttarakhand' },
      { name: 'Dudhwa National Park', relation: 'Drained by Suheli and Mohana tributaries in the Ghaghara basin', state: 'Uttar Pradesh' },
      { name: 'Valmiki National Park & Tiger Reserve', relation: 'Situated right on the banks of River Gandak in West Champaran', state: 'Bihar' },
      { name: 'Vikramshila Gangetic Dolphin Sanctuary', relation: '50 km designated river sanctuary for the endangered Gangetic Dolphin', state: 'Bihar' },
      { name: 'Sundarbans National Park & Biosphere Reserve', relation: "World's largest mangrove delta formed at Ganga-Brahmaputra confluence", state: 'West Bengal' }
    ],
    species: [
      { name: 'Gangetic River Dolphin (Susu)', iucn: 'Endangered', role: "India's National Aquatic Animal; blind, uses echolocation; freshwater indicator" },
      { name: 'Gharial (Gavialis gangeticus)', iucn: 'Critically Endangered', role: 'Fish-eating crocodilian found in tributaries like Chambal and Son' },
      { name: 'Ganges River Shark (Glyphis gangeticus)', iucn: 'Critically Endangered', role: 'Extremely rare true freshwater shark endemic to Hooghly and Ganga' },
      { name: 'Hilsa Fish (Tenualosa ilisha)', iucn: 'Least Concern', role: 'Anadromous fish; migrates upstream from sea to breed; impacted by Farakka Barrage' }
    ],
    commonMistake: 'Remember the West-to-East sequence of left-bank tributaries downstream of Prayagraj: Gomti → Ghaghara → Gandak → Kosi. Also note that Chambal, Betwa, and Ken do NOT join Ganga directly; they join Yamuna!'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-02: INDUS RIVER SYSTEM (Sindhu & Panjnad)
  // -------------------------------------------------------------------------
  'IND-RIV-02': {
    length: '3,180 km (approx. 1,114 km within India)',
    origin: 'Bokhar Chu glacier near Lake Manasarovar (Kailash Range, Tibet; known as Singi Khamban / Lion\'s Mouth)',
    mouth: 'Arabian Sea (south of Karachi, Pakistan)',
    states: {
      flowsThrough: ['Ladakh (India)', 'Gilgit-Baltistan', 'Pakistan'],
      basinStates: ['Ladakh', 'Jammu & Kashmir', 'Himachal Pradesh', 'Punjab', 'Rajasthan', 'Haryana']
    },
    tributaries: {
      leftBank: [
        { name: 'Zanskar', note: 'Carves Zanskar gorge in Ladakh; joins Indus at Nimmu' },
        { name: 'Suru', note: 'Originates from Penzella glacier; flows past Kargil' },
        { name: 'Panjnad (Chenab+Jhelum+Ravi+Sutlej+Beas)', note: 'Combined flow of the five Punjab rivers joining Indus at Mithankot (Pakistan)' }
      ],
      rightBank: [
        { name: 'Shyok (River of Death)', note: 'Rises from Rimo Glacier (Karakoram); joined by Nubra; joins Indus near Skardu' },
        { name: 'Shigar', note: 'Drains Baltoro and K2 glaciers; joins Indus at Skardu' },
        { name: 'Gilgit', note: 'Drains NW Karakoram/Hindukush; joins Indus near Bunji' },
        { name: 'Kabul', note: 'Rises in Hindukush (Afghanistan); joins Indus at Attock' },
        { name: 'Kurram & Gomal', note: 'Right-bank tributaries draining Sulaiman Range' }
      ]
    },
    confluences: [
      { tributary: 'Zanskar', sangam: 'Nimmu Sangam', state: 'Ladakh', note: 'Famous picturesque confluence near Leh' },
      { tributary: 'Shyok', sangam: 'Keris (near Skardu)', state: 'Ladakh / Baltistan' },
      { tributary: 'Gilgit', sangam: 'Bunji / Partab Bridge', state: 'Gilgit-Baltistan', note: 'Tri-junction of Himalayas, Karakoram & Hindukush' },
      { tributary: 'Kabul', sangam: 'Attock Sangam', state: 'Punjab (Pakistan)', note: 'Where Indus emerges from the mountains into Punjab plains' },
      { tributary: 'Panjnad', sangam: 'Mithankot Sangam', state: 'Punjab / Sindh (Pakistan)', note: 'Where the combined Punjab 5 rivers join Indus' }
    ],
    towns: [
      { name: 'Leh', type: 'Cultural / Historical', significance: 'Historic capital of Ladakh Kingdom on the Indus banks', state: 'Ladakh' },
      { name: 'Skardu', type: 'Strategic / Tourism', significance: 'Gateway to Karakoram 8000ers (K2, Broad Peak)', state: 'Gilgit-Baltistan' },
      { name: 'Attock', type: 'Historical / Strategic', significance: 'Historic fortress town guarding the Indus river crossing', state: 'Pakistan' },
      { name: 'Hyderabad (Sindh)', type: 'Historical', significance: 'Major historic cultural capital of lower Indus plain', state: 'Pakistan' }
    ],
    dams: [
      { name: 'Nimoo Bazgo Hydro Project', state: 'Ladakh', type: 'Run-of-the-river hydroelectric plant on Indus (45 MW)' },
      { name: 'Chutak Hydroelectric Project', state: 'Ladakh', type: 'Run-of-the-river project on Suru tributary near Kargil' },
      { name: 'Tarbela Dam', state: 'Pakistan', type: 'Massive earth-filled reservoir dam on Indus main stem' },
      { name: 'Diamer-Bhasha Dam', state: 'Gilgit-Baltistan', type: 'Under-construction gravity dam on Indus' }
    ],
    protectedAreas: [
      { name: 'Hemis National Park', relation: 'India\'s largest national park; bounded by the Indus river on the north (Snow Leopard habitat)', state: 'Ladakh' },
      { name: 'Karakoram Wildlife Sanctuary', relation: 'Drained by the Shyok river tributary (Tibetan Antelope / Chiru)', state: 'Ladakh' },
      { name: 'Changthang Cold Desert Sanctuary', relation: 'Surrounds high-altitude Indus headwaters and Tso Moriri lake', state: 'Ladakh' }
    ],
    species: [
      { name: 'Indus River Dolphin (Platanista minor)', iucn: 'Endangered', role: 'State aquatic animal of Punjab; survives in Beas river in India and Indus main stem in Pakistan' },
      { name: 'Snow Leopard (Panthera uncia)', iucn: 'Vulnerable', role: 'Apex predator of the Indus gorges in Hemis and Ladakh' },
      { name: 'Tibetan Antelope (Chiru)', iucn: 'Near Threatened', role: 'Inhabits high altitude valleys of Shyok and Chang Chenmo' }
    ],
    commonMistake: 'UPSC 2021 Trap: Jhelum and Ravi join Chenab; Beas joins Sutlej; Chenab then joins Sutlej to form Panjnad, which then pours directly into the Indus. Chenab is the largest tributary by volume!'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-03: BRAHMAPUTRA RIVER SYSTEM
  // -------------------------------------------------------------------------
  'IND-RIV-03': {
    length: '2,900 km (approx. 916 km in India)',
    origin: 'Chemayungdung Glacier near Mount Kailash & Lake Manasarovar (Tibet; flows east as Yarlung Tsangpo)',
    mouth: 'Bay of Bengal (merges with Padma in Bangladesh to form Meghna; world\'s largest delta)',
    states: {
      flowsThrough: ['Arunachal Pradesh', 'Assam', 'Bangladesh'],
      basinStates: ['Arunachal Pradesh', 'Assam', 'Meghalaya', 'Nagaland', 'Sikkim', 'West Bengal']
    },
    tributaries: {
      leftBank: [
        { name: 'Dibang (Sikang)', note: 'Flows through Mishmi Hills; joins Siang near Sadiya' },
        { name: 'Lohit', note: 'Rises in eastern Tibet; flows through Brahmakund; joins Siang at Sadiya' },
        { name: 'Dhansiri (South)', note: 'Rises in Laisang peak (Nagaland); flows past Intanki NP into Brahmaputra' },
        { name: 'Kopili', note: 'Rises in Meghalaya plateau; major hydroelectric river of Assam' }
      ],
      rightBank: [
        { name: 'Subansiri (Gold River)', note: 'Antecedent trans-Himalayan tributary; largest right-bank feeder' },
        { name: 'Kameng (Jia Bhoreli)', note: 'Rises in Tawang/Tibet border; passes Pakke TR and Nameri NP' },
        { name: 'Manas', note: 'Transboundary river from Bhutan; cuts through Manas National Park' },
        { name: 'Sankosh', note: 'Originates in Bhutan; forms border between Assam and West Bengal' },
        { name: 'Teesta', note: 'Rises in Tso Lhamo lake (Sikkim); lifeline of Sikkim; joins Jamuna in Bangladesh' }
      ]
    },
    confluences: [
      { tributary: 'Siang + Dibang + Lohit', sangam: 'Kobo Chapori (near Sadiya)', state: 'Assam / Arunachal border', note: 'Where the river officially takes the name Brahmaputra' },
      { tributary: 'Subansiri', sangam: 'Lakhimpur / Majuli Confluence', state: 'Assam' },
      { tributary: 'Kameng', sangam: 'Tezpur Sangam', state: 'Assam' },
      { tributary: 'Manas', sangam: 'Jogighopa Sangam', state: 'Assam' },
      { tributary: 'Teesta', sangam: 'Chilmari / Teesta-mukh', state: 'Bangladesh', note: 'Joins Jamuna in Rangpur division' }
    ],
    towns: [
      { name: 'Sadiya & Pasighat', type: 'Gateway', significance: 'Where Siang emerges from the Great Bend into Assam Valley', state: 'Arunachal Pradesh / Assam' },
      { name: 'Dibrugarh', type: 'Economic', significance: 'Tea city of India on the south bank; site of Bogibeel Bridge', state: 'Assam' },
      { name: 'Tezpur', type: 'Cultural', significance: 'Historic Sonitpur on the north bank; Kolia Bhomora Setu', state: 'Assam' },
      { name: 'Guwahati', type: 'Administrative', significance: 'Gateway to Northeast; Kamakhya Temple; Umananda river island', state: 'Assam' },
      { name: 'Majuli Island', type: 'Cultural / Geographical', significance: "World's largest river island; Vaishnavite Satras", state: 'Assam' }
    ],
    dams: [
      { name: 'Subansiri Lower Hydroelectric Project', state: 'Arunachal Pradesh / Assam border', type: 'Run-of-the-river project (2,000 MW, India\'s largest ongoing hydro project)' },
      { name: 'Ranganadi Hydroelectric Project', state: 'Arunachal Pradesh', type: 'Run-of-the-river scheme in Lower Subansiri basin' },
      { name: 'Kameng Hydroelectric Project', state: 'Arunachal Pradesh', type: 'Major 600 MW hydro project on Bichom and Tenga tributaries' },
      { name: 'Kurichhu Hydro Project', state: 'Bhutan (Manas basin)', type: 'Supplies power to NE India under bilateral partnership' }
    ],
    protectedAreas: [
      { name: 'Kaziranga National Park', relation: 'Bounded by Brahmaputra on north; home to 70% of world\'s One-horned Rhinos', state: 'Assam' },
      { name: 'Manas National Park & Biosphere Reserve', relation: 'Contiguous with Royal Manas NP Bhutan; drained by River Manas', state: 'Assam' },
      { name: 'Nameri National Park & Pakke TR', relation: 'Divided and drained by the Kameng (Jia Bhoreli) river', state: 'Assam / Arunachal' },
      { name: 'Dibru-Saikhowa National Park', relation: 'Bounded by Brahmaputra and Lohit rivers; famous for Feral Horses', state: 'Assam' },
      { name: 'Orang National Park (Mini Kaziranga)', relation: 'Located on the north bank of Brahmaputra; rhino habitat', state: 'Assam' }
    ],
    species: [
      { name: 'Greater One-horned Rhinoceros', iucn: 'Vulnerable', role: 'Flagship herbivore of Brahmaputra floodplain grasslands' },
      { name: 'Pygmy Hog (Porcula salvania)', iucn: 'Endangered', role: 'World\'s smallest wild pig; endemic to Manas river grasslands' },
      { name: 'Gangetic River Dolphin', iucn: 'Endangered', role: 'Resides throughout the Brahmaputra deep river channels' },
      { name: 'White-winged Duck (Asarcornis scutulata)', iucn: 'Endangered', role: 'State bird of Assam; inhabits swampy forest pools in Dibru-Saikhowa' }
    ],
    commonMistake: 'Great Bend (Namcha Barwa): River Tsangpo takes a sharp U-turn (syntaxial bend) around Namcha Barwa (7,782 m) to enter India as Siang/Dihang. UPSC 2016 question: Teesta joins Brahmaputra (Jamuna) in Bangladesh, NOT Ganga directly!'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-04: GODAVARI RIVER SYSTEM (Dakshin Ganga)
  // -------------------------------------------------------------------------
  'IND-RIV-04': {
    length: '1,465 km',
    origin: 'Trimbakeshwar in the Brahmagiri Hills (Nashik district, Maharashtra)',
    mouth: 'Bay of Bengal, forming a sprawling mangrove delta at Coringa (Andhra Pradesh)',
    states: {
      flowsThrough: ['Maharashtra', 'Telangana', 'Andhra Pradesh', 'Puducherry (Yanam)'],
      basinStates: ['Maharashtra', 'Telangana', 'Andhra Pradesh', 'Madhya Pradesh', 'Chhattisgarh', 'Odisha', 'Karnataka']
    },
    tributaries: {
      leftBank: [
        { name: 'Purna', note: 'Rises in Ajanta Hills; joins Godavari near Nanded' },
        { name: 'Pranhita', note: 'Wainganga + Wardha + Penganga combined; largest tributary accounting for 34% basin' },
        { name: 'Indravati', note: 'Rises in Dandakaranya (Odisha); famous for Chitrakote waterfall; joins near Somnoor' },
        { name: 'Sabari', note: 'Rises in Sinkaram Hills (Odisha); joined by Sileru; joins at Kunavaram' }
      ],
      rightBank: [
        { name: 'Pravara', note: 'Rises in Kalsubai peak; joins Godavari at Nevasa Sangam' },
        { name: 'Sindphana', note: 'Flows from Chhatrapati Sambhajinagar/Beed plateau' },
        { name: 'Manjira', note: 'Only major right-bank tributary; rises in Balaghat range; hosts Nizam Sagar dam' },
        { name: 'Maner', note: 'Rises in Telangana; joins downstream of Sriram Sagar dam' }
      ]
    },
    confluences: [
      { tributary: 'Pravara', sangam: 'Nevasa Sangam', state: 'Maharashtra', note: 'Meeting of Pravara and Godavari' },
      { tributary: 'Manjira', sangam: 'Kandakurthi Sangam', state: 'Telangana', note: 'Tri-confluence of Manjira, Haridra & Godavari' },
      { tributary: 'Pranhita', sangam: 'Kaleshwaram Sangam', state: 'Telangana', note: 'Pranhita + Godavari; site of Kaleshwaram Lift Project' },
      { tributary: 'Indravati', sangam: 'Somnoor / Bhadrakali', state: 'Telangana / Chhattisgarh border' },
      { tributary: 'Sabari', sangam: 'Kunavaram Sangam', state: 'Andhra Pradesh' }
    ],
    towns: [
      { name: 'Nashik', type: 'Cultural', significance: 'Trimbakeshwar Jyotirlinga & Kumbh Mela', state: 'Maharashtra' },
      { name: 'Paithan', type: 'Historical', significance: 'Ancient Pratishthana, capital of the Satavahana dynasty', state: 'Maharashtra' },
      { name: 'Nanded', type: 'Cultural', significance: 'Sikh Takht Hazur Sahib on Godavari banks', state: 'Maharashtra' },
      { name: 'Bodhan', type: 'Historical', significance: 'Ancient capital of Asmaka Mahajanapada (UPSC 2025)', state: 'Telangana' },
      { name: 'Rajahmundry', type: 'Cultural / Economic', significance: 'Cultural capital of Andhra delta & Sir Arthur Cotton Barrage', state: 'Andhra Pradesh' }
    ],
    dams: [
      { name: 'Jayakwadi Dam (Nath Sagar)', state: 'Maharashtra', type: 'Major irrigation reservoir & bird sanctuary at Paithan' },
      { name: 'Sriram Sagar Project (Pochampad)', state: 'Telangana', type: 'Lifeline multipurpose reservoir of northern Telangana' },
      { name: 'Kaleshwaram Lift Irrigation', state: 'Telangana', type: "World's largest multi-stage lift irrigation engineering feat" },
      { name: 'Polavaram National Irrigation Project', state: 'Andhra Pradesh', type: 'Interstate multi-purpose terminal reservoir' },
      { name: 'Dowleswaram Barrage (Arthur Cotton)', state: 'Andhra Pradesh', type: 'Historic delta canal network headworks' }
    ],
    protectedAreas: [
      { name: 'Papikonda National Park', relation: 'Godavari cuts a scenic deep gorge right through Papikonda hills in Eastern Ghats', state: 'Andhra Pradesh' },
      { name: 'Indravati National Park', relation: 'Indravati river flows along northern boundary (Bastar tiger habitat)', state: 'Chhattisgarh' },
      { name: 'Coringa Wildlife Sanctuary', relation: 'Second largest mangrove ecosystem on India\'s east coast at Godavari estuary', state: 'Andhra Pradesh' },
      { name: 'Tadoba-Andhari Tiger Reserve', relation: 'Falls within the wider Pranhita/Wardha basin in Maharashtra', state: 'Maharashtra' }
    ],
    species: [
      { name: 'Indian Skimmer (Rynchops albicollis)', iucn: 'Endangered', role: 'Nests on sandbars of the Godavari river delta' },
      { name: 'Fishing Cat (Prionailurus viverrinus)', iucn: 'Vulnerable', role: 'Apex wetland predator in the Coringa mangrove delta' },
      { name: 'Mugger Crocodile', iucn: 'Vulnerable', role: 'Inhabits the main Godavari channels and Manjira sanctuary' }
    ],
    commonMistake: 'UPSC 2015 Question: Indravati and Pranhita are tributaries of Godavari. Pennar and Vamsadhara are independent east-flowing rivers, NOT Godavari tributaries! Also, Bhima is a tributary of Krishna, not Godavari.'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-05: NARMADA RIVER SYSTEM (Rewa Rift Valley)
  // -------------------------------------------------------------------------
  'IND-RIV-05': {
    length: '1,312 km',
    origin: 'Amarkantak Plateau in Maikal Range (Anuppur district, Madhya Pradesh)',
    mouth: 'Gulf of Khambhat / Arabian Sea (near Bharuch, Gujarat; forms an estuary without delta)',
    states: {
      flowsThrough: ['Madhya Pradesh', 'Maharashtra', 'Gujarat'],
      basinStates: ['Madhya Pradesh (86%)', 'Gujarat (12%)', 'Maharashtra (2%)']
    },
    tributaries: {
      leftBank: [
        { name: 'Sher', note: 'Rises in Seoni district; joins Narmada in Narsinghpur' },
        { name: 'Shakkar', note: 'Rises in Chhindwara hills; joins Narmada in Narsinghpur' },
        { name: 'Dudhi', note: 'Rises in Mahadeo hills (Satpura range)' },
        { name: 'Tawa', note: 'Longest tributary of Narmada; rises in Satpura Range (Pachmarhi); major Tawa Reservoir' },
        { name: 'Ganjal', note: 'Rises in Betul plateau; joins near Hoshangabad' }
      ],
      rightBank: [
        { name: 'Hiran', note: 'Rises in Jabalpur hills; largest right-bank tributary' },
        { name: 'Barna', note: 'Rises in Raisen district (Vindhyan range); Barna Dam' },
        { name: 'Choral', note: 'Rises in Vindhyan hills near Mhow' },
        { name: 'Orsang', note: 'Rises in Chhota Udepur (Gujarat); joins near Chandod' }
      ]
    },
    confluences: [
      { tributary: 'Tawa River', sangam: 'Bandrabhan Sangam (Hoshangabad)', state: 'Madhya Pradesh', note: 'Meeting of Tawa and Narmada; venue of annual Narmada mela' },
      { tributary: 'Hiran River', sangam: 'Sankal Ghat', state: 'Madhya Pradesh' },
      { tributary: 'Orsang River', sangam: 'Chandod (Triveni of Orsang, Hiran, Narmada)', state: 'Gujarat', note: 'Important pilgrimage center' }
    ],
    towns: [
      { name: 'Amarkantak', type: 'Origin / Cultural', significance: 'Sacred source plateau; Narmada Udgam temple & Kapildhara falls', state: 'Madhya Pradesh' },
      { name: 'Jabalpur / Bhedaghat', type: 'Scenic / Cultural', significance: 'Dhuandhar Falls & Marble Rocks gorge in Mahakoshal region', state: 'Madhya Pradesh' },
      { name: 'Omkareshwar', type: 'Pilgrimage', significance: 'One of the 12 Jyotirlingas situated on the Om-shaped Mandhata island', state: 'Madhya Pradesh' },
      { name: 'Maheshwar', type: 'Historical', significance: 'Ancient Mahishmati, capital of Queen Ahilyabai Holkar', state: 'Madhya Pradesh' },
      { name: 'Bharuch', type: 'Port / Economic', significance: 'Ancient Barygaza port at the mouth on Gulf of Khambhat', state: 'Gujarat' },
      { name: 'Kevadia (Ekta Nagar)', type: 'National Symbol', significance: 'Site of the 182m Statue of Unity & Sardar Sarovar Dam', state: 'Gujarat' }
    ],
    dams: [
      { name: 'Sardar Sarovar Dam', state: 'Gujarat', type: 'Terminal gravity dam on Narmada (1,450 MW); supplies Narmada Canal to Saurashtra/Kutch' },
      { name: 'Indira Sagar Dam (Punasa)', state: 'Madhya Pradesh', type: "India's largest reservoir by water storage capacity (12.22 billion m³)" },
      { name: 'Omkareshwar Dam', state: 'Madhya Pradesh', type: 'Major run-of-the-river dam; hosts floating solar farm' },
      { name: 'Maheshwar Dam', state: 'Madhya Pradesh', type: 'Hydroelectric power station on lower Narmada' },
      { name: 'Bargi Dam', state: 'Madhya Pradesh', type: 'First major completed dam on Narmada near Jabalpur' },
      { name: 'Tawa Dam', state: 'Madhya Pradesh', type: 'Large irrigation reservoir on the Tawa tributary inside Hoshangabad' }
    ],
    protectedAreas: [
      { name: 'Kanha Tiger Reserve', relation: 'Falls in the upper catchment of the Narmada basin in Maikal range', state: 'Madhya Pradesh' },
      { name: 'Satpura National Park & Pachmarhi BR', relation: 'Catchment of Tawa and Denwa tributaries of Narmada', state: 'Madhya Pradesh' },
      { name: 'Shoolpaneshwar Wildlife Sanctuary', relation: 'Dense teak forest sanctuary surrounding Sardar Sarovar reservoir', state: 'Gujarat' }
    ],
    species: [
      { name: 'Mahseer (Tor tor)', iucn: 'Endangered', role: 'State fish of Madhya Pradesh; sacred sport and indicator fish of clear Narmada rapids' },
      { name: 'Mugger Crocodile', iucn: 'Vulnerable', role: 'Inhabits the Sardar Sarovar and Narmada canals' },
      { name: 'Otter (Lutrogale perspicillata)', iucn: 'Vulnerable', role: 'Inhabits the rocky stretches near Bhedaghat' }
    ],
    commonMistake: 'UPSC 2013 Trap: Narmada flows west because it flows through a fault / linear rift valley created by tectonic subsidence, NOT because of any regional slope! It flows between the Vindhyas on the north and Satpuras on the south. Forms estuary, NO delta.'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-06: KAVERI (CAUVERY) RIVER SYSTEM
  // -------------------------------------------------------------------------
  'IND-RIV-06': {
    length: '805 km',
    origin: 'Talakaveri in Brahmagiri range (Kodagu/Coorg district, Western Ghats, Karnataka)',
    mouth: 'Bay of Bengal at Poompuhar (Kaveripoompattinam, Tamil Nadu; forms a rich agricultural delta)',
    states: {
      flowsThrough: ['Karnataka', 'Tamil Nadu'],
      basinStates: ['Tamil Nadu (56%)', 'Karnataka (41%)', 'Kerala (3%)', 'Puducherry (Karaikal)']
    },
    tributaries: {
      leftBank: [
        { name: 'Harangi', note: 'Rises in Pushpagiri Hills; joins Kaveri in Kodagu' },
        { name: 'Hemavati', note: 'Rises in Western Ghats (Mudigere); major Gorur Dam; joins near KRS' },
        { name: 'Shimsha', note: 'Rises in Tumakuru; joins Kaveri near Shivanasamudra Falls' },
        { name: 'Arkavathi', note: 'Rises in Nandi Hills; flows through Bengaluru outskirts; joins at Mekedatu' }
      ],
      rightBank: [
        { name: 'Lakshmantirtha', note: 'Rises in Brahmagiri hills; passes through Nagarhole NP' },
        { name: 'Kabini (Kapila)', note: 'Rises in Wayanad (Kerala); passes Bandipur-Nagarhole; joins at Tirumakudal Narsipur' },
        { name: 'Suvarnavathi', note: 'Rises in Chamarajanagar; joins near T. Narsipur' },
        { name: 'Bhavani', note: 'Rises in Silent Valley (Kerala); joined by Moyar; meets at Bhavani Sangameshwarar' },
        { name: 'Noyyal', note: 'Rises in Velliangiri hills (Coimbatore); ancient river of Kongu Nadu; joins at Kodumudi' },
        { name: 'Amaravati', note: 'Rises in Anaimalai hills; flows through Karur into Kaveri' }
      ]
    },
    confluences: [
      { tributary: 'Kabini + Lakshmantirtha', sangam: 'Tirumakudal Narsipur (T. Narsipur)', state: 'Karnataka', note: 'Sacred Triveni Sangam of Karnataka' },
      { tributary: 'Arkavathi', sangam: 'Mekedatu (Goat\'s Leap)', state: 'Karnataka', note: 'Deep gorge confluence; proposed balancing reservoir site' },
      { tributary: 'Bhavani', sangam: 'Bhavani Kooduthurai', state: 'Tamil Nadu', note: 'Dakshina Triveni Sangam with Sangameshwarar temple' },
      { tributary: 'Amaravati', sangam: 'Karur Sangam', state: 'Tamil Nadu' }
    ],
    towns: [
      { name: 'Srirangapatna', type: 'Historical', significance: 'River island fortress; capital of Tipu Sultan and Hyder Ali', state: 'Karnataka' },
      { name: 'Mysuru (Mysore)', type: 'Cultural', significance: 'Historic heritage capital near the Krishnarajasagara dam', state: 'Karnataka' },
      { name: 'Tiruchirappalli (Trichy)', type: 'Cultural / Religious', significance: 'Famous Srirangam river island temple & Rockfort', state: 'Tamil Nadu' },
      { name: 'Thanjavur (Tanjore)', type: 'Historical / Architectural', significance: 'Rice bowl of Tamil Nadu; Brihadisvara Chola Temple', state: 'Tamil Nadu' },
      { name: 'Kumbakonam', type: 'Cultural', significance: 'Temple town situated between Kaveri and Arasalar distributaries', state: 'Tamil Nadu' },
      { name: 'Poompuhar', type: 'Ancient Port', significance: 'Ancient Chola port city celebrated in Silappadikaram', state: 'Tamil Nadu' }
    ],
    dams: [
      { name: 'Krishnarajasagara (KRS) Dam', state: 'Karnataka', type: 'Historic dam built by Sir M. Visvesvaraya; Brindavan Gardens' },
      { name: 'Kabini Dam', state: 'Karnataka', type: 'Crucial reservoir on the Kabini tributary' },
      { name: 'Mettur Dam (Stanley Reservoir)', state: 'Tamil Nadu', type: 'Main storage reservoir of Tamil Nadu on the Kaveri main stem' },
      { name: 'Grand Anicut (Kallanai)', state: 'Tamil Nadu', type: "Built by Chola King Karikalan in 2nd century CE; one of world's oldest functional water diversion structures" },
      { name: 'Lower Anicut (Anaikarai)', state: 'Tamil Nadu', type: 'Distributary canal barrage controlling Kollidam (Coleroon)' }
    ],
    protectedAreas: [
      { name: 'Nagarhole National Park & Tiger Reserve', relation: 'Kaveri basin; Lakshmantirtha and Kabini form vital lifelines', state: 'Karnataka' },
      { name: 'Bandipur National Park', relation: 'Separated from Wayanad by the Moyar and Kabini tributaries', state: 'Karnataka' },
      { name: 'Sathyamangalam Tiger Reserve', relation: 'Drained by the Moyar River flowing into Bhavani tributary', state: 'Tamil Nadu' },
      { name: 'Cauvery Wildlife Sanctuary', relation: 'Stretches along the Kaveri river in Chamarajanagar/Ramanagara', state: 'Karnataka' },
      { name: 'Wayanad Wildlife Sanctuary', relation: 'Catchment of Kabini tributary in Kerala Western Ghats', state: 'Kerala' }
    ],
    species: [
      { name: 'Humpback Mahseer (Tor remadevii)', iucn: 'Critically Endangered', role: 'Endemic giant freshwater sport fish exclusively found in Cauvery basin' },
      { name: 'Grizzled Giant Squirrel', iucn: 'Near Threatened', role: 'Found in riverine forests of Cauvery Wildlife Sanctuary' },
      { name: 'Mugger Crocodile', iucn: 'Vulnerable', role: 'Thrives around Srirangapatna and Ranganathittu Bird Sanctuary' }
    ],
    commonMistake: 'UPSC 2020 Question: Nagarhole NP, Bandipur TR, Sathyamangalam TR, and Wayanad WLS all lie in the Cauvery basin (Papikonda NP is on Godavari!). Also note: Kaveri receives water in both summer (SW Monsoon in Western Ghats) and winter (NE Monsoon in Tamil Nadu), making it less seasonal than other peninsular rivers.'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-07: KRISHNA RIVER SYSTEM
  // -------------------------------------------------------------------------
  'IND-RIV-07': {
    length: '1,400 km',
    origin: 'Mahabaleshwar in the Western Ghats (Satara district, Maharashtra)',
    mouth: 'Bay of Bengal at Hamsaladeevi (near Machilipatnam, Andhra Pradesh)',
    states: {
      flowsThrough: ['Maharashtra', 'Karnataka', 'Telangana', 'Andhra Pradesh'],
      basinStates: ['Maharashtra (27%)', 'Karnataka (44%)', 'Telangana & Andhra Pradesh (29%)']
    },
    tributaries: {
      leftBank: [
        { name: 'Bhima', note: 'Longest tributary of Krishna (861 km); rises at Bhimashankar; joined by Sina and Mula-Mutha' },
        { name: 'Dindi', note: 'Rises in Mahbubnagar hills; flows through Telangana' },
        { name: 'Musi', note: 'Rises in Ananthagiri hills (Vikarabad); flows through Hyderabad city; joins near Wadapally' },
        { name: 'Paleru & Munneru', note: 'Drain Khammam and Warangal districts in Telangana' }
      ],
      rightBank: [
        { name: 'Koyna', note: 'Rises near Mahabaleshwar; joins at Karad (Preeti Sangam); Koyna Hydroelectric Project' },
        { name: 'Panchganga', note: 'Flows past Kolhapur; joins Krishna at Narsobawadi' },
        { name: 'Dudhganga', note: 'Flows from Maharashtra/Karnataka border' },
        { name: 'Ghataprabha', note: 'Rises in Western Ghats (Sindhudurg); Gokak Falls; joins near Almatti' },
        { name: 'Malaprabha', note: 'Rises near Kanakumbi; passes historic Aihole/Pattadakal; joins at Kudalasangama' },
        { name: 'Tungabhadra', note: 'Formed by Tunga + Bhadra at Kudli; largest tributary by water discharge; flows past Hampi' }
      ]
    },
    confluences: [
      { tributary: 'Koyna', sangam: 'Karad (Preeti Sangam)', state: 'Maharashtra', note: 'Memorial site of Yashwantrao Chavan' },
      { tributary: 'Panchganga', sangam: 'Narsobawadi', state: 'Maharashtra', note: 'Major pilgrimage confluence' },
      { tributary: 'Malaprabha', sangam: 'Kudalasangama', state: 'Karnataka', note: 'Aikya Mantapa of 12th century social reformer Basavanna' },
      { tributary: 'Bhima', sangam: 'Kurgunti / Kadlur Sangam', state: 'Karnataka / Telangana border' },
      { tributary: 'Tungabhadra', sangam: 'Sangameswaram (Kurnool)', state: 'Andhra Pradesh', note: 'Meeting of Krishna and Tungabhadra upstream of Srisailam' },
      { tributary: 'Musi', sangam: 'Wadapally Sangam', state: 'Telangana', note: 'Confluence with ancient Shiva temple' }
    ],
    towns: [
      { name: 'Satara & Karad', type: 'Historical', significance: 'Historic Maratha power center on Krishna-Koyna confluence', state: 'Maharashtra' },
      { name: 'Sangli', type: 'Economic', significance: 'Major turmeric trading hub on the Krishna banks', state: 'Maharashtra' },
      { name: 'Bagalkot', type: 'Historical', significance: 'Historic chalukyan cultural landscape near Almatti Dam', state: 'Karnataka' },
      { name: 'Hampi (Vijayanagara)', type: 'UNESCO World Heritage', significance: 'Capital of Vijayanagara Empire on the Tungabhadra tributary', state: 'Karnataka' },
      { name: 'Kurnool', type: 'Historical', significance: 'Gateway to Rayalaseema on Tungabhadra near Krishna confluence', state: 'Andhra Pradesh' },
      { name: 'Amaravati & Vijayawada', type: 'Capital / Economic', significance: 'Prakasam Barrage and ancient Buddhist stupa on Krishna banks', state: 'Andhra Pradesh' }
    ],
    dams: [
      { name: 'Almatti Dam (Lal Bahadur Shastri Reservoir)', state: 'Karnataka', type: 'Main upper Krishna multipurpose reservoir (Upper Krishna Project)' },
      { name: 'Basava Sagar (Narayanpur Dam)', state: 'Karnataka', type: 'Key downstream reservoir for irrigation in Raichur/Yadgir' },
      { name: 'Tungabhadra Dam (Pampa Sagar)', state: 'Karnataka', type: 'Major reservoir on Tungabhadra near Hosapete' },
      { name: 'Jurala Project (Priyadarshini)', state: 'Telangana', type: 'First reservoir on Krishna entering Telangana' },
      { name: 'Srisailam Dam', state: 'AP / Telangana border', type: 'Major hydroelectric power station and deep canyon gorge reservoir' },
      { name: 'Nagarjuna Sagar Dam', state: 'AP / Telangana border', type: 'One of the world\'s largest masonry dams; creates massive reservoir around Nagarjunakonda' },
      { name: 'Prakasam Barrage', state: 'Andhra Pradesh', type: 'Terminal barrage at Vijayawada regulating Krishna delta irrigation' }
    ],
    protectedAreas: [
      { name: 'Koyna Wildlife Sanctuary', relation: 'Surrounds the Shivsagar lake / Koyna reservoir in Western Ghats', state: 'Maharashtra' },
      { name: 'Amrabad Tiger Reserve', relation: 'Extensive dry deciduous forest overlooking the Krishna river gorge', state: 'Telangana' },
      { name: 'Nagarjunsagar-Srisailam Tiger Reserve', relation: 'India\'s largest tiger reserve by core area; surrounds the Krishna river gorge', state: 'Andhra Pradesh' },
      { name: 'Daroji Sloth Bear Sanctuary', relation: 'Situated near Hampi in the Tungabhadra basin', state: 'Karnataka' }
    ],
    species: [
      { name: 'Krishna River Mahseer', iucn: 'Endangered', role: 'Indigenous river sport fish of upper rapids' },
      { name: 'Indian Pangolin (Manis crassicaudata)', iucn: 'Endangered', role: 'Inhabits the dry scrub of Srisailam-Amrabad forest tract' },
      { name: 'Smooth-coated Otter', iucn: 'Vulnerable', role: 'Thrives in the Tungabhadra Otter Reserve near Hampi' }
    ],
    commonMistake: 'UPSC 2022 Question: Ghataprabha reservoir is in Karnataka (NOT Telangana). Tungabhadra is formed by Tunga + Bhadra rivers uniting at Kudli near Shimoga. Also, remember Musi river (Hyderabad) joins Krishna on its left bank.'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-08: MAHANADI, BRAHMANI & SUBARNAREKHA BASINS
  // -------------------------------------------------------------------------
  'IND-RIV-08': {
    length: '851 km (Mahanadi)',
    origin: 'Sihawa highlands in Dhamtari/Raipur district (Chhattisgarh)',
    mouth: 'Bay of Bengal at False Point (Kendrapara district, Odisha; forms extensive delta)',
    states: {
      flowsThrough: ['Chhattisgarh', 'Odisha'],
      basinStates: ['Chhattisgarh (53%)', 'Odisha (46%)', 'Jharkhand & Maharashtra (1%)']
    },
    tributaries: {
      leftBank: [
        { name: 'Seonath', note: 'Longest tributary of Mahanadi; rises in Rajnandgaon; joins near Shivrinarayan' },
        { name: 'Hasdeo', note: 'Rises in Koriya hills; passes Hasdeo Arand forests; Hasdeo Bango Dam' },
        { name: 'Mand', note: 'Drains Raigarh plateau coalfields' },
        { name: 'Ib', note: 'Rises in Raigarh/Jashpur hills; joins directly into Hirakud Reservoir' }
      ],
      rightBank: [
        { name: 'Jonk', note: 'Rises in Nuapada hills; joins at Shivrinarayan Sangam' },
        { name: 'Ong', note: 'Rises in Gandhamardan hills; joins near Binka' },
        { name: 'Tel', note: 'Second largest tributary of Mahanadi; rises in Nabarangpur; joins near Subarnapur' }
      ]
    },
    confluences: [
      { tributary: 'Seonath + Jonk', sangam: 'Shivrinarayan Sangam', state: 'Chhattisgarh', note: 'Sacred Triveni Sangam of Chhattisgarh' },
      { tributary: 'Tel River', sangam: 'Manamunda / Subarnapur (Sonepur)', state: 'Odisha', note: 'Confluence with famous Kosaleshwara temple' },
      { tributary: 'Brahmani River Formation', sangam: 'Vedvyas (Rourkela)', state: 'Odisha', note: 'Sankh + South Koel confluence forming the Brahmani river' }
    ],
    towns: [
      { name: 'Raipur & Bilaspur', type: 'Industrial / Administrative', significance: 'Major urban hubs in the upper Mahanadi/Seonath basin', state: 'Chhattisgarh' },
      { name: 'Sambalpur', type: 'Cultural / Economic', significance: 'Historic handloom hub situated at the foot of Hirakud Dam', state: 'Odisha' },
      { name: 'Cuttack', type: 'Historical', significance: 'Millennium city at the apex of the Mahanadi delta (Barabati Fort)', state: 'Odisha' },
      { name: 'Bhubaneswar', type: 'Capital', significance: 'Temple city of Odisha situated on the Daya/Kuakhai deltaic branches', state: 'Odisha' },
      { name: 'Paradeep', type: 'Deepwater Port', significance: 'Major artificial deepwater port on the Mahanadi delta mouth', state: 'Odisha' }
    ],
    dams: [
      { name: 'Hirakud Dam', state: 'Odisha', type: "One of the longest earthen dams in the world (25.8 km total); creates 55-km long Hirakud Ramsar Wetland" },
      { name: 'Hasdeo Bango (Minimata) Dam', state: 'Chhattisgarh', type: 'Major multi-purpose reservoir in Korba district' },
      { name: 'Gangrel (Pt. Ravishankar Shukla) Dam', state: 'Chhattisgarh', type: 'Key reservoir on upper Mahanadi near Dhamtari' },
      { name: 'Rengali Dam', state: 'Odisha', type: 'Major dam on the Brahmani River' }
    ],
    protectedAreas: [
      { name: 'Satkosia Tiger Reserve & Gorge Sanctuary', relation: 'Mahanadi carves a magnificent 22-km deep gorge through the Eastern Ghats', state: 'Odisha' },
      { name: 'Debrigarh Wildlife Sanctuary', relation: 'Flanks the right bank of the Hirakud reservoir', state: 'Odisha' },
      { name: 'Bhitarkanika National Park & Ramsar Site', relation: 'Delta of Brahmani, Baitarani and Dhamra rivers (Saltwater crocodile haven)', state: 'Odisha' },
      { name: 'Achanakmar Tiger Reserve', relation: 'Located in the upper catchment of the Hasdeo/Mahanadi basin', state: 'Chhattisgarh' }
    ],
    species: [
      { name: 'Gharial & Mugger Crocodile', iucn: 'Critically Endangered / Vulnerable', role: 'Satkosia Gorge is one of the few sites where both crocodilians coexist' },
      { name: 'Saltwater Crocodile (Crocodylus porosus)', iucn: 'Least Concern', role: 'Largest population in India residing in Bhitarkanika delta' },
      { name: 'Olive Ridley Sea Turtle', iucn: 'Vulnerable', role: 'World\'s largest mass nesting rookery at Gahirmatha near the delta mouth' }
    ],
    commonMistake: 'UPSC 2021 Question: Nagawali and Vamsadhara rise in the Eastern Ghats of Odisha (NOT Chota Nagpur). Brahmani (formed by Sankh & South Koel) and Subarnarekha rise on the Chota Nagpur plateau! Baitarani rises in Keonjhar hills.'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-09: CHAMBAL RIVER, KEN-BETWA INTERLINKING & MALWA DRAINAGE
  // -------------------------------------------------------------------------
  'IND-RIV-09': {
    length: '960 km (Chambal); 427 km (Ken); 590 km (Betwa)',
    origin: 'Chambal rises at Janapao hills near Mhow in Vindhyas (MP); Betwa rises in Raisen (MP); Ken rises in Barner range (Katni, MP)',
    mouth: 'Yamuna River: Chambal joins Yamuna at Pachnada (Etawah, UP); Betwa joins near Hamirpur; Ken joins near Chilla (Banda)',
    states: {
      flowsThrough: ['Madhya Pradesh', 'Rajasthan', 'Uttar Pradesh'],
      basinStates: ['Madhya Pradesh', 'Rajasthan', 'Uttar Pradesh']
    },
    tributaries: {
      leftBank: [
        { name: 'Banas', note: 'Largest tributary of Chambal; rises in Aravallis near Kumbhalgarh; drains Mewar; joins near Rameshwar' },
        { name: 'Mej', note: 'Rises in Bhilwara; joins Chambal in Kota district' }
      ],
      rightBank: [
        { name: 'Shipra (Kshipra)', note: 'Rises in Kakri Bardi hills; sacred river of Ujjain (Simhastha Kumbh Mela); joins Chambal' },
        { name: 'Kali Sindh', note: 'Rises in Dewas district; joins Chambal near Gagron Fort' },
        { name: 'Parbati', note: 'Rises in Sehore (Vindhyas); joins Chambal at Pali Sangam' }
      ]
    },
    confluences: [
      { tributary: 'Banas + Seep', sangam: 'Rameshwaram Sangam', state: 'Rajasthan / MP border (Sawai Madhopur)', note: 'Holy Triveni Sangam of Chambal, Banas and Seep' },
      { tributary: 'Kali Sindh', sangam: 'Gagron Sangam', state: 'Rajasthan (Jhalawar)', note: 'Surrounds the famous Gagron UNESCO Water Fort' },
      { tributary: 'Chambal into Yamuna', sangam: 'Pachnada (Etawah)', state: 'Uttar Pradesh', note: 'Confluence of five streams: Chambal, Yamuna, Kwari, Sindh, Pahuj' },
      { tributary: 'Ken into Yamuna', sangam: 'Chilla Sangam (Banda)', state: 'Uttar Pradesh' },
      { tributary: 'Betwa into Yamuna', sangam: 'Hamirpur Sangam', state: 'Uttar Pradesh' }
    ],
    towns: [
      { name: 'Ujjain', type: 'Pilgrimage', significance: 'Mahakaleshwar Jyotirlinga and Kumbh Mela on the Shipra tributary', state: 'Madhya Pradesh' },
      { name: 'Kota', type: 'Educational / Industrial', significance: 'Industrial and coaching hub located on the deep gorge of Chambal', state: 'Rajasthan' },
      { name: 'Gwalior & Morena', type: 'Historical', significance: 'Heartland of the rugged Chambal ravines and badlands', state: 'Madhya Pradesh' },
      { name: 'Orchha', type: 'Historical / Architectural', significance: 'Ancient Bundela capital on the banks of Betwa River (Chaturbhuj Temple)', state: 'Madhya Pradesh' },
      { name: 'Vidisha & Sanchi', type: 'Historical / Buddhist', significance: 'Ancient Heliodorus pillar and UNESCO Sanchi Stupa near Betwa river', state: 'Madhya Pradesh' }
    ],
    dams: [
      { name: 'Gandhi Sagar Dam', state: 'Madhya Pradesh', type: 'First of the 4 cascade dams on Chambal; massive reservoir in Mandsaur' },
      { name: 'Rana Pratap Sagar Dam', state: 'Rajasthan (Rawatbhata)', type: 'Second cascade dam on Chambal; powers Rajasthan Atomic Power Station' },
      { name: 'Jawahar Sagar Dam', state: 'Rajasthan (Kota)', type: 'Third cascade dam; peak-load hydroelectric station' },
      { name: 'Kota Barrage', state: 'Rajasthan (Kota)', type: 'Terminal barrage on Chambal feeding canals to Rajasthan and MP' },
      { name: 'Matatila & Rajghat Dams', state: 'UP / MP border', type: 'Interstate multipurpose storage dams on the Betwa River' },
      { name: 'Daudhan Dam (Ken-Betwa Link)', state: 'Madhya Pradesh (Panna)', type: 'Key component of India\'s first national river-interlinking project' }
    ],
    protectedAreas: [
      { name: 'National Chambal Sanctuary', relation: 'Tri-state sanctuary (MP, Rajasthan, UP) protecting 425 km of Chambal river for Gharials', state: 'MP / Rajasthan / UP' },
      { name: 'Panna National Park & Tiger Reserve', relation: 'Ken river flows through its heart; core tiger habitat impacted by Ken-Betwa link', state: 'Madhya Pradesh' },
      { name: 'Mukundra Hills Tiger Reserve', relation: 'Located in the river valley between Chambal and Kali Sindh', state: 'Rajasthan' },
      { name: 'Ranthambore National Park', relation: 'Bounded by the Chambal River on the south and Banas on the north', state: 'Rajasthan' }
    ],
    species: [
      { name: 'Gharial (Gavialis gangeticus)', iucn: 'Critically Endangered', role: 'Chambal holds the largest viable breeding wild population on Earth' },
      { name: 'Red-crowned Roofed Turtle (Batagur kachuga)', iucn: 'Critically Endangered', role: 'Endemic freshwater turtle surviving mainly in the Chambal' },
      { name: 'Gangetic River Dolphin', iucn: 'Endangered', role: 'Resident population in deep pools of the Chambal river' }
    ],
    commonMistake: 'Ken-Betwa Project transfers surplus water from Ken basin (MP) to deficit Betwa basin (Bundelkhand), involving the construction of Daudhan Dam which will submerge a significant portion of Panna Tiger Reserve core. Remember Chambal badlands are formed by severe gully erosion in semi-arid alluvium.'
  },

  // -------------------------------------------------------------------------
  // IND-RIV-10: PENINSULAR WEST-FLOWING RIVERS (Tapi, Sabarmati, Mahi, Periyar, Goa)
  // -------------------------------------------------------------------------
  'IND-RIV-10': {
    length: 'Tapi: 724 km | Sabarmati: 371 km | Mahi: 583 km | Periyar: 244 km | Bharathapuzha: 209 km',
    origin: 'Tapi rises in Multai (Betul, MP); Mahi rises in Vindhyas (Dhar, MP); Sabarmati rises in Aravallis (Udaipur); Periyar rises in Sivagiri hills (Western Ghats)',
    mouth: 'Arabian Sea (Gulf of Khambhat for Tapi, Mahi, Sabarmati; Vembanad/Arabian Sea for Periyar and Pamba)',
    states: {
      flowsThrough: ['Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Goa', 'Karnataka', 'Kerala'],
      basinStates: ['Gujarat', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Goa', 'Karnataka', 'Kerala', 'Tamil Nadu']
    },
    tributaries: {
      leftBank: [
        { name: 'Purna (Tapi)', note: 'Largest tributary of Tapi; drains Vidarbha and Khandesh; joins near Changdeo' },
        { name: 'Vaghur & Bori', note: 'Left bank tributaries of Tapi in Jalgaon district' },
        { name: 'Wakal & Harnav (Sabarmati)', note: 'Left bank feeders rising in Rajasthan/Gujarat border' },
        { name: 'Muthirapuzha & Perinjankutti (Periyar)', note: 'High altitude mountain torrents feeding Idukki Dam' }
      ],
      rightBank: [
        { name: 'Girna (Tapi)', note: 'Rises in Western Ghats (Nashik); joins Tapi near Nanded village' },
        { name: 'Som & Anas (Mahi)', note: 'Som rises in Udaipur; meets Mahi at sacred Baneshwar Dham' },
        { name: 'Sei (Sabarmati)', note: 'Rises in Aravallis; diverted via Sei tunnel to Jawai dam' },
        { name: 'Chalakudy River', note: 'Originates in Anaimalai hills; joins lower Periyar near Kodungallur' }
      ]
    },
    confluences: [
      { tributary: 'Purna into Tapi', sangam: 'Changdeo Sangam (Jalgaon)', state: 'Maharashtra', note: 'Meeting of Tapi and Purna near ancient Changdeo temple' },
      { tributary: 'Som into Mahi', sangam: 'Baneshwar Dham (Dungarpur)', state: 'Rajasthan', note: "Triveni Sangam of Mahi, Som and Jakham; 'Kumbh of Tribals'" },
      { tributary: 'Mandovi & Zuari', sangam: 'Cabo Aguada / Marmagao Bay', state: 'Goa', note: 'Twin lifelines of Goa meeting at the Arabian Sea estuary' }
    ],
    towns: [
      { name: 'Surat', type: 'Industrial / Commercial', significance: 'Diamond and textile hub on the estuary of River Tapi', state: 'Gujarat' },
      { name: 'Ahmedabad & Gandhinagar', type: 'Administrative / Cultural', significance: 'Sabarmati Riverfront, Sabarmati Ashram, Gujarat capital', state: 'Gujarat' },
      { name: 'Panaji (Panjim)', type: 'Capital', significance: 'Capital of Goa located on the banks of Mandovi River', state: 'Goa' },
      { name: 'Kochi (Cochin)', type: 'Port', significance: 'Major natural harbour and Queen of the Arabian Sea at Periyar mouth', state: 'Kerala' },
      { name: 'Vadodara', type: 'Cultural / Educational', significance: 'Situated on the Vishwamitri river in the Mahi basin', state: 'Gujarat' }
    ],
    dams: [
      { name: 'Ukai Dam (Vallabh Sagar)', state: 'Gujarat', type: 'Second largest reservoir in Gujarat on River Tapi; irrigation & hydro' },
      { name: 'Kakrapar Weir', state: 'Gujarat', type: 'Diversion weir feeding Kakrapar Atomic Power Station' },
      { name: 'Kadana & Mahi Bajaj Sagar Dams', state: 'Gujarat / Rajasthan', type: 'Major multi-purpose dams on the Mahi River' },
      { name: 'Dharoi Dam', state: 'Gujarat', type: 'Main storage reservoir on the Sabarmati River' },
      { name: 'Idukki Arch Dam', state: 'Kerala', type: "One of Asia's highest double-curvature arch dams (168.9 m) on Periyar river" },
      { name: 'Mullaperiyar Dam', state: 'Kerala (Operated by TN)', type: 'Historic masonry gravity dam (1895) diverting water to Tamil Nadu' },
      { name: 'Jog / Gersoppa Hydro Scheme', state: 'Karnataka', type: 'Famous Mahatma Gandhi Hydroelectric Station on Sharavati River' }
    ],
    protectedAreas: [
      { name: 'Periyar National Park & Tiger Reserve', relation: 'Surrounds the Periyar Lake formed by Mullaperiyar Dam (Elephant haven)', state: 'Kerala' },
      { name: 'Silent Valley National Park', relation: 'Drained by the Kunthipuzha river, a tributary of Bharathapuzha', state: 'Kerala' },
      { name: 'Melghat Tiger Reserve', relation: 'Falls in the upper catchment of Tapi/Purna basin in Satpura hills', state: 'Maharashtra' },
      { name: 'Bhagwan Mahavir Sanctuary & Mollem NP', relation: 'Drained by Mandovi river headwaters; hosts Dudhsagar Falls', state: 'Goa' },
      { name: 'Sharavati Valley Wildlife Sanctuary', relation: 'Catchment of Sharavati river and Linganamakki reservoir', state: 'Karnataka' }
    ],
    species: [
      { name: 'Asian Elephant & Bengal Tiger', iucn: 'Endangered', role: 'Thriving population centered around Periyar Lake' },
      { name: 'Lion-tailed Macaque (Macaca silenus)', iucn: 'Endangered', role: 'Endemic rainforest primate of Silent Valley (Kunthipuzha basin)' },
      { name: 'Mugger Crocodile', iucn: 'Vulnerable', role: 'Inhabits the brackish waters of Cumbarjua canal between Mandovi and Zuari' }
    ],
    commonMistake: 'Mahi River is unique for crossing the Tropic of Cancer twice (first moving north through MP into Rajasthan, then turning southwest into Gujarat). Tapi flows in a rift valley parallel to Narmada, south of the Satpura range. West-flowing coastal rivers of Western Ghats (Sharavati, Mandovi, Periyar, Bharathapuzha) are short and swift, forming estuaries rather than deltas.'
  }
};
