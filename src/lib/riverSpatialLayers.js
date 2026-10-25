/**
 * River Spatial Layer Engine for UPSC Lecture Studio
 * Provides high-precision GIS polylines and markers for:
 * 1. Main River Spine (Origin, Mouth, Course)
 * 2. Left-Bank Tributaries (Cyan)
 * 3. Right-Bank Tributaries (Amber)
 * 4. Sangams (Confluences) & Major Dams
 * 5. Protected Areas (National Parks) & Historic Riverside Towns
 */

export const RIVER_GIS_REGISTRY = {
  // -------------------------------------------------------------
  // GANGA RIVER SYSTEM
  // -------------------------------------------------------------
  'IND-RIV-01': {
    origin: { place: 'Gangotri / Devprayag (Origin)', shortLabel: 'Origin (Gangotri)', labelDir: 'top-left', lat: 30.15, lng: 78.60, placeType: 'River Origin', customEmoji: '🟢', badgeColor: '#10b981' },
    mouth: { place: 'Sundarbans Delta (Mouth)', shortLabel: 'Mouth (Sundarbans)', labelDir: 'bottom-left', lat: 21.95, lng: 88.80, placeType: 'River Mouth', customEmoji: '🔴', badgeColor: '#ef4444' },
    leftBank: [
      {
        id: 'ganga_trib_ramganga',
        place: 'Ramganga River',
        shortLabel: 'Ramganga',
        labelDir: 'left',
        placeType: 'Left-Bank Tributary',
        lat: 27.20,
        lng: 79.90,
        shape: [[29.80, 79.20], [29.50, 78.80], [28.20, 79.40], [27.20, 79.90]],
        strokeColor: '#06b6d4',
        weight: 3.5,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Garhwal Himalayas → passes Jim Corbett NP → meets Ganga near Kannauj',
      },
      {
        id: 'ganga_trib_gomti',
        place: 'Gomti River',
        shortLabel: 'Gomti',
        labelDir: 'bottom-left',
        placeType: 'Left-Bank Tributary',
        lat: 25.50,
        lng: 83.10,
        shape: [[28.60, 80.10], [27.50, 80.50], [26.85, 81.00], [25.50, 83.10]],
        strokeColor: '#06b6d4',
        weight: 3.5,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Rises in plains (Fulhar Jheel, Pilibhit) → Lucknow → Saidpur Sangam',
      },
      {
        id: 'ganga_trib_ghaghara',
        place: 'Ghaghara (Karnali) River',
        shortLabel: 'Ghaghara',
        labelDir: 'top',
        placeType: 'Left-Bank Tributary',
        lat: 25.75,
        lng: 84.65,
        shape: [[30.00, 81.50], [28.20, 81.30], [26.80, 82.20], [25.75, 84.65]],
        strokeColor: '#06b6d4',
        weight: 4,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Rises near Gurla Mandhata (Tibet) → joined by Sarda → Revelganj Sangam (Chhapra)',
      },
      {
        id: 'ganga_trib_gandak',
        place: 'Gandak River',
        shortLabel: 'Gandak',
        labelDir: 'top-right',
        placeType: 'Left-Bank Tributary',
        lat: 25.65,
        lng: 85.18,
        shape: [[28.80, 83.80], [27.40, 84.00], [26.20, 84.80], [25.65, 85.18]],
        strokeColor: '#06b6d4',
        weight: 3.5,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Nepal Himalayas (Dhaulagiri & Everest) → Champaran / Valmiki NP → Sonpur Sangam',
      },
      {
        id: 'ganga_trib_kosi',
        place: 'Kosi River',
        shortLabel: 'Kosi',
        labelDir: 'top-left',
        placeType: 'Left-Bank Tributary',
        lat: 25.40,
        lng: 87.25,
        shape: [[28.00, 86.80], [26.80, 87.00], [25.90, 87.10], [25.40, 87.25]],
        strokeColor: '#06b6d4',
        weight: 3.5,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: "'Sorrow of Bihar' (Saptakoshi) → extreme course shifts → Kursela Sangam",
      },
      {
        id: 'ganga_trib_mahananda',
        place: 'Mahananda River',
        shortLabel: 'Mahananda',
        labelDir: 'right',
        placeType: 'Left-Bank Tributary',
        lat: 24.50,
        lng: 88.30,
        shape: [[27.00, 88.30], [25.80, 88.00], [24.50, 88.30]],
        strokeColor: '#06b6d4',
        weight: 3.5,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Last major left-bank tributary → Darjeeling hills → enters Ganga near Godagari',
      },
    ],
    rightBank: [
      {
        id: 'ganga_trib_yamuna',
        place: 'Yamuna River',
        shortLabel: 'Yamuna',
        labelDir: 'bottom-left',
        placeType: 'Right-Bank Tributary',
        lat: 25.43,
        lng: 81.88,
        shape: [[31.00, 78.40], [28.60, 77.20], [27.20, 78.00], [26.40, 80.00], [25.43, 81.88]],
        strokeColor: '#f59e0b',
        weight: 4.5,
        customEmoji: '➡️',
        badgeColor: '#f59e0b',
        note: 'Longest right-bank tributary (1,376 km) → Yamunotri → Triveni Sangam (Prayagraj)',
      },
      {
        id: 'ganga_trib_tamsa',
        place: 'Tamsa (Tons) River',
        shortLabel: 'Tamsa (Tons)',
        labelDir: 'bottom-left',
        placeType: 'Right-Bank Tributary',
        lat: 25.28,
        lng: 82.05,
        shape: [[24.20, 80.60], [24.90, 81.40], [25.28, 82.05]],
        strokeColor: '#f59e0b',
        weight: 3,
        customEmoji: '➡️',
        badgeColor: '#f59e0b',
        note: 'Rises in Kaimur Range → joins downstream of Prayagraj',
      },
      {
        id: 'ganga_trib_son',
        place: 'Son River',
        shortLabel: 'Son',
        labelDir: 'bottom',
        placeType: 'Right-Bank Tributary',
        lat: 25.60,
        lng: 84.85,
        shape: [[22.68, 81.75], [24.20, 81.50], [24.80, 83.20], [25.60, 84.85]],
        strokeColor: '#f59e0b',
        weight: 4,
        customEmoji: '➡️',
        badgeColor: '#f59e0b',
        note: 'Amarkantak Plateau (MP) → parallel to Kaimur → joins directly on right bank near Patna',
      },
      {
        id: 'ganga_trib_punpun',
        place: 'Punpun River',
        shortLabel: 'Punpun',
        labelDir: 'bottom-right',
        placeType: 'Right-Bank Tributary',
        lat: 25.50,
        lng: 85.30,
        shape: [[24.50, 84.20], [25.10, 84.80], [25.50, 85.30]],
        strokeColor: '#f59e0b',
        weight: 3,
        customEmoji: '➡️',
        badgeColor: '#f59e0b',
        note: 'Palamu hills (Jharkhand) → joins Ganga at Fatuha',
      },
    ],
    damsAndSangams: [
      { id: 'sangam_devprayag', place: 'Devprayag Sangam', shortLabel: 'Devprayag', labelDir: 'right', lat: 30.15, lng: 78.60, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Meeting of Bhagirathi and Alaknanda' },
      { id: 'sangam_triveni', place: 'Triveni Sangam (Prayagraj)', shortLabel: 'Prayagraj', labelDir: 'bottom', lat: 25.43, lng: 81.88, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Ganga + Yamuna + mythical Saraswati' },
      { id: 'sangam_saidpur', place: 'Saidpur Sangam (Ghazipur)', shortLabel: 'Ghazipur', labelDir: 'top-left', lat: 25.50, lng: 83.10, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Ganga + Gomti' },
      { id: 'sangam_revelganj', place: 'Revelganj Sangam (Chhapra)', shortLabel: 'Chhapra', labelDir: 'top', lat: 25.75, lng: 84.65, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Ganga + Ghaghara' },
      { id: 'sangam_sonpur', place: 'Sonpur / Danapur Sangam', shortLabel: 'Patna / Sonpur', labelDir: 'bottom', lat: 25.65, lng: 85.18, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Ganga + Gandak and Son (Patna)' },
      { id: 'sangam_kursela', place: 'Kursela Sangam (Katihar)', shortLabel: 'Kursela', labelDir: 'top-right', lat: 25.40, lng: 87.25, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Ganga + Kosi' },
      { id: 'dam_tehri', place: 'Tehri Dam (Bhagirathi)', shortLabel: 'Tehri Dam', labelDir: 'top-left', lat: 30.38, lng: 78.48, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: 'Highest dam in India (Uttarakhand)' },
      { id: 'dam_narora', place: 'Narora Barrage', shortLabel: 'Narora', labelDir: 'left', lat: 28.20, lng: 78.38, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: 'Atomic plant cooling barrage (UP)' },
      { id: 'dam_kanpur', place: 'Kanpur Barrage (Luv Kush)', shortLabel: 'Kanpur', labelDir: 'bottom-left', lat: 26.50, lng: 80.32, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: 'Drinking water barrage (UP)' },
      { id: 'dam_farakka', place: 'Farakka Barrage', shortLabel: 'Farakka', labelDir: 'bottom-right', lat: 24.80, lng: 87.92, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: 'Hooghly diversion for Kolkata port (WB / 1996 Treaty)' },
    ],
    protectedAreasAndTowns: [
      { id: 'pa_gangotri', place: 'Gangotri National Park', shortLabel: 'Gangotri NP', labelDir: 'top-right', lat: 30.98, lng: 78.93, placeType: 'Protected Area', customEmoji: '🌿', badgeColor: '#10b981', note: 'Contains Gaumukh source glacier' },
      { id: 'pa_corbett', place: 'Jim Corbett National Park', shortLabel: 'Corbett NP', labelDir: 'right', lat: 29.53, lng: 78.77, placeType: 'Protected Area', customEmoji: '🐅', badgeColor: '#10b981', note: 'Drained by Ramganga tributary' },
      { id: 'pa_dudhwa', place: 'Dudhwa National Park', shortLabel: 'Dudhwa NP', labelDir: 'top', lat: 28.51, lng: 80.65, placeType: 'Protected Area', customEmoji: '🌿', badgeColor: '#10b981', note: 'Ghaghara/Sharda basin marshland' },
      { id: 'pa_valmiki', place: 'Valmiki National Park & Tiger Reserve', shortLabel: 'Valmiki TR', labelDir: 'top', lat: 27.35, lng: 84.18, placeType: 'Protected Area', customEmoji: '🐅', badgeColor: '#10b981', note: 'Situated on the banks of Gandak river (Bihar)' },
      { id: 'pa_dolphin', place: 'Vikramshila Dolphin Sanctuary', shortLabel: 'Vikramshila', labelDir: 'top-right', lat: 25.32, lng: 87.25, placeType: 'Protected Area', customEmoji: '🐬', badgeColor: '#0284c7', note: '50 km stretch dedicated to Gangetic Dolphins' },
      { id: 'pa_sundarbans', place: 'Sundarbans National Park', shortLabel: 'Sundarbans NP', labelDir: 'bottom-right', lat: 21.94, lng: 88.85, placeType: 'Protected Area', customEmoji: '🐅', badgeColor: '#10b981', note: "World's largest mangrove delta at Ganga mouth" },
      { id: 'town_haridwar', place: 'Haridwar & Rishikesh', shortLabel: 'Haridwar', labelDir: 'left', lat: 29.95, lng: 78.16, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Where Ganga enters the northern plains' },
      { id: 'town_kanpur', place: 'Kanpur', shortLabel: 'Kanpur', labelDir: 'bottom-left', lat: 26.45, lng: 80.33, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Major industrial & leather hub' },
      { id: 'town_prayagraj', place: 'Prayagraj', shortLabel: 'Prayagraj', labelDir: 'bottom', lat: 25.43, lng: 81.88, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Ancient Prayag & Kumbh Mela' },
      { id: 'town_varanasi', place: 'Varanasi (Kashi)', shortLabel: 'Varanasi', labelDir: 'top-left', lat: 25.32, lng: 82.97, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Continuous ancient living city' },
      { id: 'town_patna', place: 'Patna (Pataliputra)', shortLabel: 'Patna', labelDir: 'bottom', lat: 25.60, lng: 85.14, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Ancient capital of Magadha & Mauryas' },
      { id: 'town_kolkata', place: 'Kolkata', shortLabel: 'Kolkata', labelDir: 'left', lat: 22.57, lng: 88.36, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Historic port on Hooghly distributary' },
    ],
  },

  // -------------------------------------------------------------
  // GODAVARI RIVER SYSTEM
  // -------------------------------------------------------------
  'IND-RIV-04': {
    origin: { place: 'Trimbakeshwar (Origin)', lat: 19.93, lng: 73.53, placeType: 'River Origin', customEmoji: '🟢', badgeColor: '#10b981' },
    mouth: { place: 'Coringa Delta (Mouth)', lat: 16.50, lng: 82.25, placeType: 'River Mouth', customEmoji: '🔴', badgeColor: '#ef4444' },
    leftBank: [
      {
        id: 'godavari_trib_purna',
        place: 'Purna River',
        placeType: 'Left-Bank Tributary',
        lat: 19.10,
        lng: 77.00,
        shape: [[20.60, 75.50], [19.80, 76.50], [19.10, 77.00]],
        strokeColor: '#06b6d4',
        weight: 3.5,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Rises in Ajanta Hills → joins Godavari near Nanded',
      },
      {
        id: 'godavari_trib_pranhita',
        place: 'Pranhita River (Wainganga+Wardha+Penganga)',
        placeType: 'Left-Bank Tributary',
        lat: 18.81,
        lng: 79.91,
        shape: [[21.80, 79.90], [20.50, 79.80], [19.60, 79.80], [18.81, 79.91]],
        strokeColor: '#06b6d4',
        weight: 4.5,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Largest tributary (34% basin) → meets Godavari at Kaleshwaram Sangam',
      },
      {
        id: 'godavari_trib_indravati',
        place: 'Indravati River',
        placeType: 'Left-Bank Tributary',
        lat: 18.70,
        lng: 80.35,
        shape: [[19.30, 83.10], [19.10, 82.00], [18.90, 81.00], [18.70, 80.35]],
        strokeColor: '#06b6d4',
        weight: 4,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Rises in Dandakaranya (Odisha) → Chitrakote falls → meets at Somnoor / Bhadrakali',
      },
      {
        id: 'godavari_trib_sabari',
        place: 'Sabari River',
        placeType: 'Left-Bank Tributary',
        lat: 17.58,
        lng: 81.25,
        shape: [[18.80, 82.80], [18.20, 81.60], [17.58, 81.25]],
        strokeColor: '#06b6d4',
        weight: 3.5,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Sinkaram hills (Odisha) → joined by Sileru → meets at Kunavaram Sangam (AP)',
      },
      {
        id: 'godavari_trib_sileru',
        place: 'Sileru River',
        placeType: 'Left-Bank Tributary',
        lat: 17.85,
        lng: 81.50,
        shape: [[18.30, 82.40], [17.85, 81.50]],
        strokeColor: '#06b6d4',
        weight: 3,
        customEmoji: '⬅️',
        badgeColor: '#06b6d4',
        note: 'Major tributary of Sabari with key hydro-electric projects',
      },
    ],
    rightBank: [
      {
        id: 'godavari_trib_pravara',
        place: 'Pravara River',
        placeType: 'Right-Bank Tributary',
        lat: 19.53,
        lng: 74.90,
        shape: [[19.54, 73.70], [19.53, 74.90]],
        strokeColor: '#f59e0b',
        weight: 3.5,
        customEmoji: '➡️',
        badgeColor: '#f59e0b',
        note: 'Rises in Kalsubai peak → joins Godavari at Nevasa Sangam',
      },
      {
        id: 'godavari_trib_sindphana',
        place: 'Sindphana River',
        placeType: 'Right-Bank Tributary',
        lat: 19.20,
        lng: 76.10,
        shape: [[19.00, 75.60], [19.20, 76.10]],
        strokeColor: '#f59e0b',
        weight: 3,
        customEmoji: '➡️',
        badgeColor: '#f59e0b',
        note: 'Flows from Chhatrapati Sambhajinagar/Beed → joins at Manjrath',
      },
      {
        id: 'godavari_trib_manjira',
        place: 'Manjira River',
        placeType: 'Right-Bank Tributary',
        lat: 18.90,
        lng: 77.85,
        shape: [[18.70, 75.50], [18.17, 78.00], [18.90, 77.85]],
        strokeColor: '#f59e0b',
        weight: 4,
        customEmoji: '➡️',
        badgeColor: '#f59e0b',
        note: 'Only major right-bank tributary → hosts Nizam Sagar dam → Kandakurthi Sangam',
      },
      {
        id: 'godavari_trib_maner',
        place: 'Maner River',
        placeType: 'Right-Bank Tributary',
        lat: 18.75,
        lng: 79.80,
        shape: [[18.20, 78.80], [18.75, 79.80]],
        strokeColor: '#f59e0b',
        weight: 3,
        customEmoji: '➡️',
        badgeColor: '#f59e0b',
        note: 'Rises in Telangana hills → joins downstream of Sriram Sagar dam',
      },
    ],
    damsAndSangams: [
      { id: 'sangam_nevasa', place: 'Nevasa Sangam', lat: 19.53, lng: 74.90, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Pravara + Godavari (Maharashtra)' },
      { id: 'sangam_kandakurthi', place: 'Kandakurthi Sangam', lat: 18.90, lng: 77.85, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Manjira + Haridra + Godavari' },
      { id: 'sangam_kaleshwaram', place: 'Kaleshwaram Sangam', lat: 18.81, lng: 79.91, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Pranhita + Saraswati + Godavari' },
      { id: 'sangam_somnoor', place: 'Somnoor / Bhadrakali Sangam', lat: 18.70, lng: 80.35, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Indravati + Godavari (Telangana/Chhattisgarh border)' },
      { id: 'sangam_kunavaram', place: 'Kunavaram Sangam', lat: 17.58, lng: 81.25, placeType: 'Confluence (Sangam)', customEmoji: '🤝', badgeColor: '#8b5cf6', note: 'Sabari + Godavari (Andhra Pradesh)' },
      { id: 'dam_jayakwadi', place: 'Jayakwadi Dam (Nath Sagar)', lat: 19.48, lng: 75.37, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: 'Major irrigation reservoir & bird sanctuary (Maharashtra)' },
      { id: 'dam_pochampad', place: 'Sriram Sagar Project (Pochampad)', lat: 18.97, lng: 78.34, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: 'Lifeline of northern Telangana' },
      { id: 'dam_kaleshwaram_lift', place: 'Kaleshwaram Lift Irrigation', lat: 18.78, lng: 80.00, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: "World's largest multi-stage lift project" },
      { id: 'dam_polavaram', place: 'Polavaram Dam (National Project)', lat: 17.25, lng: 81.65, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: 'Multi-purpose interstate project (Andhra Pradesh)' },
      { id: 'dam_dowleswaram', place: 'Dowleswaram Barrage (Sir Arthur Cotton)', lat: 16.94, lng: 81.77, placeType: 'Major Dam', customEmoji: '⚡', badgeColor: '#0284c7', note: 'Delta canal headworks (Andhra Pradesh)' },
    ],
    protectedAreasAndTowns: [
      { id: 'pa_papikonda', place: 'Papikonda National Park', lat: 17.45, lng: 81.40, placeType: 'Protected Area', customEmoji: '🌿', badgeColor: '#10b981', note: 'Godavari cuts right through the Eastern Ghats gorge' },
      { id: 'pa_coringa', place: 'Coringa Wildlife Sanctuary', lat: 16.85, lng: 82.25, placeType: 'Protected Area', customEmoji: '🌿', badgeColor: '#10b981', note: 'Mangrove estuary at Godavari mouth; Fishing Cat & Skimmer' },
      { id: 'pa_indravati_np', place: 'Indravati National Park', lat: 19.00, lng: 80.70, placeType: 'Protected Area', customEmoji: '🐅', badgeColor: '#10b981', note: 'Indravati river flows along northern boundary (Bastar)' },
      { id: 'pa_tadoba', place: 'Tadoba-Andhari Tiger Reserve', lat: 20.20, lng: 79.30, placeType: 'Protected Area', customEmoji: '🐅', badgeColor: '#10b981', note: 'Falls within the wider Pranhita basin' },
      { id: 'town_nashik', place: 'Nashik', lat: 19.99, lng: 73.78, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Trimbakeshwar Jyotirlinga & Kumbh Mela' },
      { id: 'town_paithan', place: 'Paithan (Pratishthana)', lat: 19.48, lng: 75.38, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Ancient capital of Satavahana dynasty' },
      { id: 'town_nanded', place: 'Nanded (Hazur Sahib)', lat: 19.15, lng: 77.31, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Sikh Takht Hazur Sahib on Godavari banks' },
      { id: 'town_bodhan', place: 'Bodhan (Asmaka Capital)', lat: 18.66, lng: 77.88, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Capital of ancient Asmaka Mahajanapada (UPSC 2025)' },
      { id: 'town_rajahmundry', place: 'Rajahmundry', lat: 17.00, lng: 81.80, placeType: 'Historic / Cultural Town', customEmoji: '🏛️', badgeColor: '#eab308', note: 'Cultural capital of Andhra delta & Arthur Cotton Barrage' },
    ],
  },
};

/**
 * Builds the dynamic node set for a river based on the active layers.
 * 
 * @param {object} riverNode The main river node from CURATED_MAPPING_NODES
 * @param {object} activeLayers { spine, leftBank, rightBank, dams, protectedAreas }
 * @returns {Array} Array of node objects ready for MappingCanvas
 */
export function getRiverSpatialNodes(riverNode, activeLayers = {}) {
  if (!riverNode) return [];

  const riverId = riverNode.id;
  const reg = RIVER_GIS_REGISTRY[riverId] || null;
  const hasSubLayer = Boolean(
    activeLayers.leftBank ||
    activeLayers.rightBank ||
    activeLayers.dams ||
    activeLayers.protectedAreas
  );
  const DEFAULT_DIRS = ['top', 'bottom', 'right', 'left', 'top-left', 'bottom-right'];

  const result = [];

  // 1. River Spine (Polyline always shown when spine=true; Origin/Mouth pins shown only on Stage 1 so they never collide with tributary/sangam pins)
  if (activeLayers.spine !== false) {
    result.push({
      id: riverNode.id || 'river_spine',
      place: riverNode.place || 'Main River',
      placeType: riverNode.placeType || 'River System',
      lat: riverNode.lat,
      lng: riverNode.lng,
      hideMarker: Boolean(reg),
      shape: Array.isArray(riverNode.shape) ? riverNode.shape : null,
      strokeColor: '#0284c7',
      glowColor: '#38bdf8',
      weight: 5,
      glow: true,
      glowWeight: 14,
      glowOpacity: 0.45,
      mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
      staticFacts: riverNode.staticFacts || [],
    });

    if (!hasSubLayer && reg?.origin) {
      result.push({
        id: `${riverId}_origin`,
        ...reg.origin,
        mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
      });
    }

    if (!hasSubLayer && reg?.mouth) {
      result.push({
        id: `${riverId}_mouth`,
        ...reg.mouth,
        mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
      });
    }
  }

  // 2. Left-Bank Tributaries (Numbered 1..N at mid-course so labels never pile up at confluence)
  if (activeLayers.leftBank && reg?.leftBank) {
    reg.leftBank.forEach((item, idx) => {
      const midPt =
        Array.isArray(item.shape) && item.shape.length >= 2
          ? item.shape[Math.floor((item.shape.length - 1) / 2)]
          : [item.lat, item.lng];
      result.push({
        ...item,
        lat: midPt[0],
        lng: midPt[1],
        displayIndex: idx + 1,
        labelDir: item.labelDir || DEFAULT_DIRS[idx % DEFAULT_DIRS.length],
        mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
      });
    });
  }

  // 3. Right-Bank Tributaries (Numbered 1..N at mid-course)
  if (activeLayers.rightBank && reg?.rightBank) {
    reg.rightBank.forEach((item, idx) => {
      const midPt =
        Array.isArray(item.shape) && item.shape.length >= 2
          ? item.shape[Math.floor((item.shape.length - 1) / 2)]
          : [item.lat, item.lng];
      result.push({
        ...item,
        lat: midPt[0],
        lng: midPt[1],
        displayIndex: idx + 1,
        labelDir: item.labelDir || DEFAULT_DIRS[idx % DEFAULT_DIRS.length],
        mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
      });
    });
  }

  // 4. Confluences (Sangams) & Major Dams
  if (activeLayers.dams && reg?.damsAndSangams) {
    reg.damsAndSangams.forEach((item, idx) => {
      result.push({
        ...item,
        displayIndex: idx + 1,
        labelDir: item.labelDir || DEFAULT_DIRS[idx % DEFAULT_DIRS.length],
        mapCategory: item.placeType.includes('Confluence')
          ? ['India – rivers, lakes, reservoirs & glaciers']
          : ['Infrastructure & Projects'],
      });
    });
  }

  // 5. Protected Areas & Historic Towns
  if (activeLayers.protectedAreas && reg?.protectedAreasAndTowns) {
    reg.protectedAreasAndTowns.forEach((item, idx) => {
      result.push({
        ...item,
        displayIndex: idx + 1,
        labelDir: item.labelDir || DEFAULT_DIRS[idx % DEFAULT_DIRS.length],
        mapCategory: item.placeType.includes('Protected Area')
          ? ['Protected areas & biodiversity']
          : ['Ancient & Medieval India'],
      });
    });
  }

  return result;
}
