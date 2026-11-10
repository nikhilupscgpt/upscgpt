// Verified point locations for river study layers (sources: OpenStreetMap Nominatim, cross-checked).
// RIVER_POINTS[riverNodeId][category][itemName] = [{ label, lat, lng }]  (one entry per named place)
// category: 'dams' | 'parks' | 'towns' | 'sangams'. itemName = the exact `name` string from riverDetails;
// for sangams itemName = `${c.tributary} @ ${c.sangam}` using the exact strings.
// Only points accepted by cross-verification are included; see docs/river-points-review.csv for flagged items.
export const RIVER_POINTS = {
  'IND-RIV-01': {
    dams: {
      'Tehri Dam': [{ label: 'Tehri Dam', lat: 30.3762, lng: 78.4803 }],
      'Koteshwar Dam': [{ label: 'Koteshwar Dam', lat: 30.2602, lng: 78.4979 }],
      'Bhimgoda Barrage': [{ label: 'Bhimgoda Barrage', lat: 29.9567, lng: 78.1802 }],
      'Narora Barrage': [{ label: 'Narora Barrage', lat: 28.196, lng: 78.386 }],
      'Farakka Barrage': [{ label: 'Farakka Barrage', lat: 24.8048, lng: 87.9336 }],
    },
    parks: {
      'Gangotri National Park': [{ label: 'Gangotri National Park', lat: 31.0899, lng: 79.1449 }],
      'Nanda Devi and Valley of Flowers National Parks': [{ label: 'Nanda Devi National Park', lat: 30.4085, lng: 79.8556 }, { label: 'Valley of Flowers National Park', lat: 30.7431, lng: 79.6177 }],
      'Rajaji Tiger Reserve': [{ label: 'Rajaji Tiger Reserve', lat: 30.1069, lng: 78.0215 }],
      'Vikramshila Gangetic Dolphin Sanctuary': [{ label: 'Vikramshila Gangetic Dolphin Sanctuary', lat: 25.2889, lng: 87.1507 }],
    },
    towns: {
      'Haridwar': [{ label: 'Haridwar', lat: 29.9384, lng: 78.1453 }],
      'Kanpur': [{ label: 'Kanpur', lat: 26.4609, lng: 80.3218 }],
      'Prayagraj': [{ label: 'Prayagraj', lat: 25.4381, lng: 81.8338 }],
      'Varanasi': [{ label: 'Varanasi', lat: 25.3356, lng: 83.0076 }],
      'Patna': [{ label: 'Patna', lat: 25.6093, lng: 85.1235 }],
      'Bhagalpur': [{ label: 'Bhagalpur', lat: 25.2495, lng: 86.9828 }],
      'Farakka': [{ label: 'Farakka', lat: 24.8167, lng: 87.9 }],
    },
    sangams: {
      'Alaknanda + Dhauliganga (Vishnuprayag) @ Near Joshimath, Chamoli': [{ label: 'Vishnuprayag', lat: 30.5626, lng: 79.5791 }],
      'Alaknanda + Nandakini (Nandprayag) @ Nandprayag, Chamoli': [{ label: 'Nandprayag', lat: 30.3317, lng: 79.321 }],
      'Alaknanda + Pindar (Karnaprayag) @ Karnaprayag, Chamoli': [{ label: 'Karnaprayag', lat: 30.2596, lng: 79.2171 }],
      'Alaknanda + Mandakini (Rudraprayag) @ Rudraprayag': [{ label: 'Rudraprayag', lat: 30.285, lng: 78.981 }],
      'Alaknanda + Bhagirathi (Devprayag) @ Devprayag, Tehri Garhwal; Ganga is formed here': [{ label: 'Devprayag', lat: 30.1461, lng: 78.5986 }],
      'Ramganga @ Near Kannauj': [{ label: 'Kannauj', lat: 27.055, lng: 79.918 }],
      'Yamuna @ Triveni Sangam, Prayagraj': [{ label: 'Triveni Sangam', lat: 25.4222, lng: 81.8923 }],
      'Gomti @ Near Kaithi (Varanasi-Ghazipur)': [{ label: 'Kaithi', lat: 25.4389, lng: 83.1931 }],
      'Son @ Near Maner, west of Patna': [{ label: 'Maner', lat: 25.6466, lng: 84.8763 }],
      'Gandak @ Sonpur-Hajipur, opposite Patna': [{ label: 'Sonpur', lat: 25.6931, lng: 85.1832 }],
      'Kosi @ Near Kursela, Katihar': [{ label: 'Kursela', lat: 25.4492, lng: 87.2559 }],
    },
  },
  'IND-RIV-01B': {
    dams: {
      'Ramganga Dam (Kalagarh Dam)': [{ label: 'Ramganga Dam (Kalagarh)', lat: 29.518, lng: 78.7582 }],
    },
    parks: {
      'Jim Corbett National Park': [{ label: 'Jim Corbett National Park', lat: 29.5575, lng: 78.8425 }],
      'Sonanadi Wildlife Sanctuary': [{ label: 'Sonanadi Wildlife Sanctuary', lat: 29.6404, lng: 78.6378 }],
    },
    towns: {
      'Gairsain': [{ label: 'Gairsain', lat: 30.0546, lng: 79.29 }],
      'Kalagarh': [{ label: 'Kalagarh', lat: 29.518, lng: 78.7582 }],
      'Moradabad': [{ label: 'Moradabad', lat: 28.8335, lng: 78.7733 }],
      'Kannauj': [{ label: 'Kannauj', lat: 27.055, lng: 79.918 }],
    },
    sangams: {
      'Ganga @ Near Kannauj': [{ label: 'Kannauj', lat: 27.055, lng: 79.918 }],
    },
  },
  'IND-RIV-01C': {
    dams: {
      'Gomti Barrage': [{ label: 'Gomti Barrage (Lucknow)', lat: 26.8555, lng: 80.9695 }],
    },
    parks: {
      'Pilibhit Tiger Reserve': [{ label: 'Pilibhit Tiger Reserve', lat: 28.7192, lng: 80.0764 }],
    },
    towns: {
      'Lucknow': [{ label: 'Lucknow', lat: 26.8381, lng: 80.9346 }],
      'Sultanpur': [{ label: 'Sultanpur', lat: 26.2589, lng: 82.0717 }],
      'Jaunpur': [{ label: 'Jaunpur', lat: 25.7472, lng: 82.689 }],
    },
    sangams: {
      'Sai @ Near Jaunpur': [{ label: 'Jaunpur', lat: 25.7472, lng: 82.689 }],
      'Ganga @ Kaithi (Varanasi-Ghazipur)': [{ label: 'Kaithi', lat: 25.4389, lng: 83.1931 }],
    },
  },
  'IND-RIV-01D': {
    parks: {
      'Katarniaghat Wildlife Sanctuary': [{ label: 'Katarniaghat Wildlife Sanctuary', lat: 28.3335, lng: 81.1281 }],
      'Dudhwa National Park': [{ label: 'Dudhwa National Park', lat: 28.5082, lng: 80.6624 }],
      'Bardiya National Park': [{ label: 'Bardiya National Park', lat: 28.4806, lng: 81.4566 }],
    },
    towns: {
      'Bahraich': [{ label: 'Bahraich', lat: 27.5752, lng: 81.5954 }],
      'Ayodhya': [{ label: 'Ayodhya', lat: 26.7991, lng: 82.2052 }],
      'Chhapra': [{ label: 'Chhapra', lat: 25.7784, lng: 84.7515 }],
    },
    sangams: {
      'Rapti @ Near Barhaj, Deoria': [{ label: 'Barhaj', lat: 26.2781, lng: 83.7212 }],
    },
  },
  'IND-RIV-01E': {
    dams: {
      'Gandak Barrage': [{ label: 'Gandak Barrage (Valmikinagar)', lat: 27.439, lng: 83.9071 }],
    },
    parks: {
      'Valmiki Tiger Reserve': [{ label: 'Valmiki Tiger Reserve', lat: 27.371, lng: 84.2936 }],
      'Chitwan National Park': [{ label: 'Chitwan National Park', lat: 27.5168, lng: 84.4383 }],
    },
    towns: {
      'Valmikinagar': [{ label: 'Valmikinagar', lat: 27.4301, lng: 83.9057 }],
      'Kushinagar': [{ label: 'Kushinagar', lat: 26.7438, lng: 83.9162 }],
      'Hajipur (Vaishali)': [{ label: 'Hajipur', lat: 25.6906, lng: 85.209 }],
      'Sonpur': [{ label: 'Sonpur', lat: 25.6931, lng: 85.1832 }],
    },
    sangams: {
      'Kali Gandaki + Trishuli @ Devghat (forms the Narayani)': [{ label: 'Devghat', lat: 27.7392, lng: 84.4254 }],
      'Ganga @ Sonpur-Hajipur, opposite Patna': [{ label: 'Sonpur', lat: 25.6931, lng: 85.1832 }],
    },
  },
  'IND-RIV-01F': {
    dams: {
      'Kosi Barrage': [{ label: 'Kosi Barrage', lat: 26.5262, lng: 86.9271 }],
      'Sapta Kosi High Dam': [{ label: 'Sapta Kosi High Dam (proposed, Barahakshetra)', lat: 26.7923, lng: 87.1566 }],
    },
    parks: {
      'Koshi Tappu Wildlife Reserve': [{ label: 'Koshi Tappu Wildlife Reserve', lat: 26.6477, lng: 86.9981 }],
    },
    towns: {
      'Barahakshetra': [{ label: 'Barahakshetra', lat: 26.8736, lng: 87.1644 }],
      'Birpur / Bhimnagar': [{ label: 'Birpur', lat: 26.5152, lng: 87.0085 }, { label: 'Bhimnagar', lat: 26.5129, lng: 86.9616 }],
      'Saharsa and Supaul': [{ label: 'Saharsa', lat: 25.8759, lng: 86.5927 }, { label: 'Supaul', lat: 26.12, lng: 86.6 }],
      'Purnia': [{ label: 'Purnia', lat: 25.7773, lng: 87.4731 }],
    },
    sangams: {
      'Ganga @ Near Kursela, Katihar': [{ label: 'Kursela', lat: 25.4492, lng: 87.2559 }],
    },
  },
  'IND-RIV-01G': {
    dams: {
      'Mahananda Barrage': [{ label: 'Mahananda Barrage (Fulbari)', lat: 26.6452, lng: 88.4021 }],
    },
    parks: {
      'Mahananda Wildlife Sanctuary': [{ label: 'Mahananda Wildlife Sanctuary', lat: 26.8541, lng: 88.4089 }],
    },
    towns: {
      'Siliguri': [{ label: 'Siliguri', lat: 26.7164, lng: 88.431 }],
      'Kishanganj': [{ label: 'Kishanganj', lat: 26.1014, lng: 87.9508 }],
      'Malda (English Bazar)': [{ label: 'English Bazar (Malda)', lat: 25.0057, lng: 88.1398 }],
    },
    sangams: {
      'Ganga (Padma) @ Near Godagari': [{ label: 'Godagari', lat: 24.4598, lng: 88.3331 }],
    },
  },
  'IND-RIV-01H': {
    dams: {
      'Dakpathar Barrage': [{ label: 'Dakpathar Barrage', lat: 30.5035, lng: 77.7952 }],
      'Hathnikund Barrage': [{ label: 'Hathnikund Barrage', lat: 30.3147, lng: 77.5831 }],
      'Wazirabad and Okhla Barrages': [{ label: 'Wazirabad Barrage', lat: 28.7298, lng: 77.2213 }, { label: 'Okhla Barrage', lat: 28.5457, lng: 77.311 }],
      'Lakhwar and Vyasi Projects': [{ label: 'Lakhwar Dam', lat: 30.5208, lng: 77.9152 }],
      'Renuka Dam': [{ label: 'Renuka Dam (Dadahu)', lat: 30.5871, lng: 77.4683 }],
    },
    parks: {
      'Govind Pashu Vihar National Park': [{ label: 'Govind Pashu Vihar National Park', lat: 31.1549, lng: 78.2512 }],
      'Asan Barrage Conservation Reserve': [{ label: 'Asan Conservation Reserve', lat: 30.4353, lng: 77.6655 }],
      'Okhla Bird Sanctuary': [{ label: 'Okhla Bird Sanctuary', lat: 28.557, lng: 77.309 }],
    },
    towns: {
      'Yamunotri': [{ label: 'Yamunotri', lat: 30.9992, lng: 78.4627 }],
      'Paonta Sahib': [{ label: 'Paonta Sahib', lat: 30.4384, lng: 77.6212 }],
      'Delhi': [{ label: 'Delhi', lat: 28.61, lng: 77.21 }],
      'Mathura & Vrindavan': [{ label: 'Mathura', lat: 27.4956, lng: 77.6856 }, { label: 'Vrindavan', lat: 27.5754, lng: 77.6938 }],
      'Agra': [{ label: 'Agra', lat: 27.1753, lng: 78.0098 }],
      'Prayagraj': [{ label: 'Prayagraj', lat: 25.4381, lng: 81.8338 }],
    },
    sangams: {
      'Tons @ Near Kalsi, Dehradun': [{ label: 'Kalsi', lat: 30.5182, lng: 77.8437 }],
      'Giri @ Near Paonta Sahib': [{ label: 'Paonta Sahib', lat: 30.4384, lng: 77.6212 }],
      'Hindon @ Near Greater Noida': [{ label: 'Greater Noida', lat: 28.4671, lng: 77.5138 }],
      'Sind @ Pachnada, Jalaun': [{ label: 'Pachnada', lat: 26.46, lng: 79.27 }],
      'Betwa @ Hamirpur': [{ label: 'Hamirpur', lat: 25.95, lng: 80.15 }],
      'Ken @ Chilla, Banda': [{ label: 'Chilla', lat: 25.7669, lng: 80.5309 }],
      'Ganga @ Triveni Sangam, Prayagraj': [{ label: 'Triveni Sangam', lat: 25.4222, lng: 81.8923 }],
    },
  },
  'IND-RIV-01I': {
    dams: {
      'Gandhi Sagar Dam': [{ label: 'Gandhi Sagar Dam', lat: 24.7014, lng: 75.5539 }],
      'Rana Pratap Sagar Dam': [{ label: 'Rana Pratap Sagar Dam', lat: 24.9177, lng: 75.5827 }],
      'Jawahar Sagar Dam': [{ label: 'Jawahar Sagar Dam', lat: 25.0372, lng: 75.6777 }],
      'Kota Barrage': [{ label: 'Kota Barrage', lat: 25.1768, lng: 75.8255 }],
    },
    parks: {
      'National Chambal Sanctuary': [{ label: 'National Chambal Sanctuary', lat: 26.6, lng: 77.9 }],
      'Kuno National Park': [{ label: 'Kuno National Park', lat: 25.7711, lng: 77.1908 }],
      'Ranthambhore Tiger Reserve': [{ label: 'Ranthambhore Tiger Reserve', lat: 26.0312, lng: 76.4907 }],
    },
    towns: {
      'Mhow (Dr. Ambedkar Nagar)': [{ label: 'Mhow', lat: 22.5587, lng: 75.7687 }],
      'Ujjain': [{ label: 'Ujjain', lat: 23.1885, lng: 75.7717 }],
      'Rawatbhata': [{ label: 'Rawatbhata', lat: 24.9346, lng: 75.5883 }],
      'Kota': [{ label: 'Kota', lat: 25.1737, lng: 75.8574 }],
      'Dholpur': [{ label: 'Dholpur', lat: 26.7011, lng: 77.8967 }],
      'Etawah': [{ label: 'Etawah', lat: 26.78, lng: 79.02 }],
    },
    sangams: {
      'Banas @ Rameshwar, Sawai Madhopur': [{ label: 'Rameshwar Ghat', lat: 25.9088, lng: 76.7232 }],
    },
  },
  'IND-RIV-01J': {
    dams: {
      'Rajghat Dam': [{ label: 'Rajghat Dam', lat: 24.7635, lng: 78.2307 }],
      'Matatila Dam': [{ label: 'Matatila Dam', lat: 25.1037, lng: 78.3683 }],
      'Parichha Dam': [{ label: 'Parichha Dam', lat: 25.5156, lng: 78.7593 }],
    },
    parks: {
      'Ratapani Tiger Reserve': [{ label: 'Ratapani Tiger Reserve', lat: 22.9153, lng: 77.7486 }],
    },
    towns: {
      'Vidisha': [{ label: 'Vidisha', lat: 23.5208, lng: 77.8063 }],
      'Orchha': [{ label: 'Orchha', lat: 25.3529, lng: 78.6402 }],
      'Jhansi': [{ label: 'Jhansi', lat: 25.4502, lng: 78.58 }],
      'Hamirpur': [{ label: 'Hamirpur', lat: 25.95, lng: 80.15 }],
    },
    sangams: {
      'Yamuna @ Hamirpur': [{ label: 'Hamirpur', lat: 25.95, lng: 80.15 }],
    },
  },
  'IND-RIV-01K': {
    parks: {
      'Panna Tiger Reserve': [{ label: 'Panna Tiger Reserve', lat: 24.6161, lng: 79.94 }],
      'Ken Gharial Sanctuary': [{ label: 'Ken Gharial Sanctuary', lat: 24.8892, lng: 80.0495 }],
    },
    towns: {
      'Khajuraho': [{ label: 'Khajuraho', lat: 24.8515, lng: 79.926 }],
      'Banda': [{ label: 'Banda', lat: 25.4738, lng: 80.3313 }],
    },
    sangams: {
      'Yamuna @ Chilla, Banda': [{ label: 'Chilla', lat: 25.7669, lng: 80.5309 }],
    },
  },
  'IND-RIV-01L': {
    dams: {
      'Bansagar Dam': [{ label: 'Bansagar Dam', lat: 24.1893, lng: 81.2872 }],
      'Rihand Dam': [{ label: 'Rihand Dam', lat: 24.2031, lng: 83.0062 }],
      'Indrapuri Barrage': [{ label: 'Indrapuri Barrage', lat: 24.8344, lng: 84.1371 }],
    },
    parks: {
      'Son Gharial Wildlife Sanctuary': [{ label: 'Son Gharial Wildlife Sanctuary', lat: 24.3979, lng: 81.662 }],
      'Sanjay-Dubri Tiger Reserve': [{ label: 'Sanjay-Dubri Tiger Reserve', lat: 23.9153, lng: 81.8393 }],
      'Palamau Tiger Reserve': [{ label: 'Palamau Tiger Reserve', lat: 23.6817, lng: 84.1392 }],
    },
    towns: {
      'Amarkantak': [{ label: 'Amarkantak', lat: 22.6705, lng: 81.7588 }],
      'Singrauli': [{ label: 'Singrauli (Waidhan)', lat: 24.1974, lng: 82.6661 }],
      'Sonbhadra': [{ label: 'Sonbhadra (Robertsganj)', lat: 24.6898, lng: 83.0653 }],
      'Dehri-on-Sone': [{ label: 'Dehri-on-Sone', lat: 24.9078, lng: 84.1901 }],
    },
    sangams: {
      'Ganga @ Near Arrah-Maner, west of Patna': [{ label: 'Maner', lat: 25.6466, lng: 84.8763 }],
    },
  },
  'IND-RIV-01M': {
    dams: {
      'Konar Dam': [{ label: 'Konar Dam', lat: 23.93, lng: 85.77 }],
      'Maithon Dam': [{ label: 'Maithon Dam', lat: 23.78, lng: 86.81 }],
      'Panchet Dam': [{ label: 'Panchet Dam', lat: 23.681, lng: 86.7473 }],
      'Tenughat Dam': [{ label: 'Tenughat Dam', lat: 23.7469, lng: 85.7543 }],
      'Durgapur Barrage': [{ label: 'Durgapur Barrage', lat: 23.4762, lng: 87.3029 }],
    },
    towns: {
      'Bokaro Steel City': [{ label: 'Bokaro Steel City', lat: 23.658, lng: 86.0839 }],
      'Dhanbad': [{ label: 'Dhanbad', lat: 23.7953, lng: 86.431 }],
      'Asansol': [{ label: 'Asansol', lat: 23.6869, lng: 86.9746 }],
      'Durgapur': [{ label: 'Durgapur', lat: 23.4949, lng: 87.3182 }],
    },
    sangams: {
      'Barakar @ Near Dishergarh, below Maithon and Panchet': [{ label: 'Dishergarh', lat: 23.6898, lng: 86.8537 }],
      'Hooghly @ Near Falta': [{ label: 'Falta', lat: 22.2933, lng: 88.1055 }],
    },
  },
  'IND-RIV-02': {
    dams: {
      'Nimoo Bazgo Hydroelectric Project': [{ label: 'Nimoo Bazgo Dam', lat: 34.2153, lng: 77.1848 }],
      'Chutak Hydroelectric Project': [{ label: 'Chutak Hydroelectric Project', lat: 34.4949, lng: 76.1198 }],
      'Tarbela Dam': [{ label: 'Tarbela Dam', lat: 34.0902, lng: 72.6958 }],
      'Diamer-Bhasha Dam': [{ label: 'Diamer-Bhasha Dam (site)', lat: 35.5223, lng: 73.7387 }],
      'Sukkur and Kotri Barrages': [{ label: 'Sukkur Barrage', lat: 27.6796, lng: 68.8457 }, { label: 'Kotri Barrage', lat: 25.4424, lng: 68.316 }],
    },
    parks: {
      'Hemis National Park': [{ label: 'Hemis National Park', lat: 33.6639, lng: 77.3504 }],
      'Changthang Cold Desert Wildlife Sanctuary': [{ label: 'Changthang Wildlife Sanctuary', lat: 33.4656, lng: 78.3778 }],
    },
    towns: {
      'Demchok': [{ label: 'Demchok', lat: 32.7041, lng: 79.4467 }],
      'Leh': [{ label: 'Leh', lat: 34.1642, lng: 77.5848 }],
      'Alchi': [{ label: 'Alchi', lat: 34.2236, lng: 77.1741 }],
      'Skardu': [{ label: 'Skardu', lat: 35.2871, lng: 75.6553 }],
      'Attock': [{ label: 'Attock', lat: 33.7695, lng: 72.3611 }],
      'Mohenjo-daro': [{ label: 'Mohenjo-daro', lat: 27.3253, lng: 68.1349 }],
    },
    sangams: {
      'Zanskar @ Nimmu, near Leh': [{ label: 'Nimmu', lat: 34.1963, lng: 77.3355 }],
      'Shyok @ Near Keris, east of Skardu': [{ label: 'Keris', lat: 35.2343, lng: 75.9421 }],
      'Gilgit @ Near Jaglot-Bunji': [{ label: 'Jaglot', lat: 35.6527, lng: 74.6287 }],
      'Kabul @ Attock': [{ label: 'Attock', lat: 33.7695, lng: 72.3611 }],
      'Panjnad @ Mithankot': [{ label: 'Mithankot', lat: 28.9609, lng: 70.3644 }],
    },
  },
  'IND-RIV-02B': {
    dams: {
      'Uri-I Hydroelectric Project': [{ label: 'Uri-I Hydroelectric Project', lat: 34.1445, lng: 74.1857 }],
      'Uri-II Hydroelectric Project': [{ label: 'Uri-II Hydroelectric Project', lat: 34.0918, lng: 74.0312 }],
      'Lower Jhelum Hydroelectric Project': [{ label: 'Lower Jhelum HEP (Gantamulla)', lat: 34.1512, lng: 74.1969 }],
      'Kishanganga Hydroelectric Project': [{ label: 'Kishanganga Dam (Gurez)', lat: 34.6501, lng: 74.7849 }],
      'Mangla Dam': [{ label: 'Mangla Dam', lat: 33.1414, lng: 73.6421 }],
    },
    parks: {
      'Wular Lake': [{ label: 'Wular Lake', lat: 34.3503, lng: 74.542 }],
      'Hokersar Wetland': [{ label: 'Hokersar Wetland', lat: 34.0911, lng: 74.712 }],
      'Dachigam National Park': [{ label: 'Dachigam National Park', lat: 34.1329, lng: 75.0224 }],
      'Overa-Aru Wildlife Sanctuary': [{ label: 'Overa-Aru Wildlife Sanctuary', lat: 34.0929, lng: 75.2504 }],
    },
    towns: {
      'Verinag': [{ label: 'Verinag', lat: 33.5393, lng: 75.2499 }],
      'Srinagar': [{ label: 'Srinagar', lat: 34.0747, lng: 74.8204 }],
      'Sopore': [{ label: 'Sopore', lat: 34.2929, lng: 74.455 }],
      'Baramulla': [{ label: 'Baramulla', lat: 34.2087, lng: 74.3435 }],
      'Uri': [{ label: 'Uri', lat: 34.0879, lng: 74.0306 }],
      'Jhelum (city)': [{ label: 'Jhelum', lat: 32.9292, lng: 73.7259 }],
    },
    sangams: {
      'Lidder @ Near Khanabal, Anantnag': [{ label: 'Khanabal', lat: 33.7382, lng: 75.1398 }],
      'Sind @ Shadipora, near Srinagar': [{ label: 'Shadipora', lat: 34.1885, lng: 74.6685 }],
      'Kishanganga (Neelum) @ Muzaffarabad': [{ label: 'Muzaffarabad (Domel)', lat: 34.3547, lng: 73.4766 }],
      'Poonch @ Mangla reservoir': [{ label: 'Mangla Reservoir', lat: 33.2527, lng: 73.6991 }],
      'Chenab @ Trimmu, near Jhang': [{ label: 'Trimmu', lat: 31.1451, lng: 72.1451 }],
    },
  },
  'IND-RIV-02C': {
    dams: {
      'Salal Dam': [{ label: 'Salal Dam', lat: 33.1423, lng: 74.81 }],
      'Baglihar Dam': [{ label: 'Baglihar Dam', lat: 33.162, lng: 75.3278 }],
      'Kiru and Kwar Hydroelectric Projects': [{ label: 'Kiru HEP', lat: 33.3361, lng: 75.9491 }, { label: 'Kwar HEP', lat: 33.3581, lng: 75.8326 }],
      'Marala, Khanki, Qadirabad and Trimmu Headworks': [{ label: 'Marala Headworks', lat: 32.6734, lng: 74.4639 }, { label: 'Khanki Headworks', lat: 32.4082, lng: 73.9666 }, { label: 'Qadirabad Headworks', lat: 32.3214, lng: 73.6855 }, { label: 'Trimmu Headworks', lat: 31.1451, lng: 72.1451 }],
    },
    parks: {
      'Kishtwar High Altitude National Park': [{ label: 'Kishtwar High Altitude National Park', lat: 33.5674, lng: 75.9802 }],
    },
    towns: {
      'Keylong': [{ label: 'Keylong', lat: 32.5718, lng: 77.0281 }],
      'Kishtwar': [{ label: 'Kishtwar', lat: 33.3108, lng: 75.7694 }],
      'Ramban': [{ label: 'Ramban', lat: 33.2387, lng: 75.2404 }],
      'Reasi': [{ label: 'Reasi', lat: 33.0792, lng: 74.8363 }],
      'Akhnoor': [{ label: 'Akhnoor', lat: 32.8978, lng: 74.7383 }],
      'Jhang': [{ label: 'Jhang', lat: 31.2729, lng: 72.3103 }],
    },
    sangams: {
      'Chandra + Bhaga @ Tandi, near Keylong': [{ label: 'Tandi', lat: 32.5561, lng: 76.9747 }],
      'Neeru @ Pul Doda': [{ label: 'Pul Doda', lat: 33.13, lng: 75.55 }],
      'Jhelum @ Trimmu, near Jhang': [{ label: 'Trimmu', lat: 31.1451, lng: 72.1451 }],
      'Ravi @ Near Ahmadpur Sial': [{ label: 'Ahmadpur Sial', lat: 30.6836, lng: 71.7612 }],
      'Sutlej @ Panjnad, near Uch': [{ label: 'Panjnad', lat: 29.3465, lng: 71.0201 }],
    },
  },
  'IND-RIV-02D': {
    dams: {
      'Chamera I, II and III': [{ label: 'Chamera-I Dam', lat: 32.5969, lng: 75.9855 }, { label: 'Chamera-II Dam', lat: 32.4728, lng: 76.2538 }],
      'Ranjit Sagar (Thein) Dam': [{ label: 'Ranjit Sagar Dam', lat: 32.4422, lng: 75.7286 }],
      'Shahpur Kandi Dam': [{ label: 'Shahpur Kandi Dam', lat: 32.3918, lng: 75.6784 }],
      'Madhopur Headworks': [{ label: 'Madhopur Headworks', lat: 32.3604, lng: 75.5935 }],
    },
    parks: {
      'Kalatop-Khajjiar Wildlife Sanctuary': [{ label: 'Kalatop-Khajjiar Wildlife Sanctuary', lat: 32.5518, lng: 76.0185 }],
      'Gamgul Siahbehi Wildlife Sanctuary': [{ label: 'Gamgul Siahbehi Wildlife Sanctuary', lat: 32.8635, lng: 75.9215 }],
    },
    towns: {
      'Bharmour': [{ label: 'Bharmour', lat: 32.4417, lng: 76.5365 }],
      'Chamba': [{ label: 'Chamba', lat: 32.5565, lng: 76.125 }],
      'Madhopur (Pathankot)': [{ label: 'Madhopur', lat: 32.3604, lng: 75.5935 }],
      'Dera Baba Nanak': [{ label: 'Dera Baba Nanak', lat: 32.0318, lng: 75.0285 }],
      'Lahore': [{ label: 'Lahore', lat: 31.5657, lng: 74.3142 }],
    },
    sangams: {
      'Chenab @ Near Ahmadpur Sial': [{ label: 'Ahmadpur Sial', lat: 30.6836, lng: 71.7612 }],
    },
  },
  'IND-RIV-02E': {
    dams: {
      'Pong Dam (Maharana Pratap Sagar)': [{ label: 'Pong Dam', lat: 31.9709, lng: 75.9459 }],
      'Pandoh Dam': [{ label: 'Pandoh Dam', lat: 31.6717, lng: 77.0662 }],
      'Larji Hydroelectric Project': [{ label: 'Larji Dam', lat: 31.7192, lng: 77.2113 }],
      'Shanan Power House': [{ label: 'Shanan Power House (Jogindernagar)', lat: 31.9924, lng: 76.8102 }],
    },
    parks: {
      'Great Himalayan National Park': [{ label: 'Great Himalayan National Park', lat: 31.7968, lng: 77.7239 }],
      'Pong Dam Lake Wildlife Sanctuary': [{ label: 'Pong Dam Lake Wildlife Sanctuary', lat: 32.0083, lng: 76.0378 }],
      'Harike Wetland': [{ label: 'Harike Wetland', lat: 31.1614, lng: 74.9959 }],
    },
    towns: {
      'Manali': [{ label: 'Manali', lat: 32.2455, lng: 77.1873 }],
      'Kullu': [{ label: 'Kullu', lat: 31.9579, lng: 77.1089 }],
      'Mandi': [{ label: 'Mandi', lat: 31.7084, lng: 76.9294 }],
      'Talwara': [{ label: 'Talwara', lat: 31.9433, lng: 75.8806 }],
      'Harike': [{ label: 'Harike', lat: 31.1675, lng: 74.9449 }],
    },
    sangams: {
      'Parbati @ Bhuntar': [{ label: 'Bhuntar', lat: 31.8875, lng: 77.1436 }],
      'Sainj and Tirthan @ Larji': [{ label: 'Larji', lat: 31.726, lng: 77.2232 }],
      'Sutlej @ Harike': [{ label: 'Harike', lat: 31.1675, lng: 74.9449 }],
    },
  },
  'IND-RIV-02F': {
    dams: {
      'Bhakra Dam': [{ label: 'Bhakra Dam', lat: 31.4116, lng: 76.4326 }],
      'Nangal Dam': [{ label: 'Nangal Dam', lat: 31.3804, lng: 76.3659 }],
      'Nathpa Jhakri Hydroelectric Project': [{ label: 'Nathpa Dam (Nathpa Jhakri HEP)', lat: 31.5641, lng: 77.98 }],
      'Karcham Wangtoo Hydroelectric Project': [{ label: 'Karcham Wangtoo HEP', lat: 31.5407, lng: 78.0153 }],
      'Rampur Hydroelectric Project': [{ label: 'Rampur HEP', lat: 31.4487, lng: 77.6302 }],
      'Kol Dam': [{ label: 'Kol Dam', lat: 31.3999, lng: 76.876 }],
      'Harike Barrage': [{ label: 'Harike Barrage', lat: 31.1455, lng: 74.9464 }],
      'Sulemanki and Islam Headworks': [{ label: 'Sulemanki Headworks', lat: 30.3778, lng: 73.8665 }, { label: 'Islam Headworks', lat: 29.8271, lng: 72.5491 }],
    },
    parks: {
      'Pin Valley National Park': [{ label: 'Pin Valley National Park', lat: 31.9712, lng: 77.8833 }],
      'Rakchham-Chitkul Wildlife Sanctuary': [{ label: 'Rakchham-Chitkul Wildlife Sanctuary', lat: 31.3533, lng: 78.354 }],
      'Ropar Wetland': [{ label: 'Ropar Wetland', lat: 30.9887, lng: 76.5174 }],
      'Harike Wetland': [{ label: 'Harike Wetland', lat: 31.1614, lng: 74.9959 }],
    },
    towns: {
      'Shipki La': [{ label: 'Shipki La', lat: 31.832, lng: 78.7339 }],
      'Rampur Bushahr': [{ label: 'Rampur Bushahr', lat: 31.4487, lng: 77.6302 }],
      'Bilaspur': [{ label: 'Bilaspur', lat: 31.34, lng: 76.76 }],
      'Rupnagar (Ropar)': [{ label: 'Rupnagar', lat: 30.9688, lng: 76.5261 }],
      'Hussainiwala (Ferozepur)': [{ label: 'Hussainiwala', lat: 30.9912, lng: 74.5518 }],
    },
    sangams: {
      'Spiti @ Khab, Kinnaur': [{ label: 'Khab', lat: 31.7998, lng: 78.6443 }],
      'Baspa @ Karcham, Kinnaur': [{ label: 'Karcham', lat: 31.4937, lng: 78.1822 }],
      'Beas @ Harike': [{ label: 'Harike', lat: 31.1675, lng: 74.9449 }],
      'Chenab @ Panjnad, near Uch': [{ label: 'Panjnad', lat: 29.3465, lng: 71.0201 }],
    },
  },
  'IND-RIV-03': {
    dams: {
      'Zangmu Dam': [{ label: 'Zangmu Dam', lat: 29.1845, lng: 92.5167 }],
      'Bogibeel Bridge': [{ label: 'Bogibeel Bridge', lat: 27.4082, lng: 94.7605 }],
    },
    parks: {
      'Kaziranga National Park': [{ label: 'Kaziranga National Park', lat: 26.6581, lng: 93.3927 }],
      'Orang National Park': [{ label: 'Orang National Park', lat: 26.5424, lng: 92.3121 }],
      'Pobitora Wildlife Sanctuary': [{ label: 'Pobitora Wildlife Sanctuary', lat: 26.2594, lng: 91.9848 }],
      'Dibru-Saikhowa National Park': [{ label: 'Dibru-Saikhowa National Park', lat: 27.6855, lng: 95.3948 }],
      'Deepor Beel': [{ label: 'Deepor Beel', lat: 26.1214, lng: 91.6488 }],
      'Mouling National Park': [{ label: 'Mouling National Park', lat: 28.5817, lng: 94.8508 }],
    },
    towns: {
      'Pasighat': [{ label: 'Pasighat', lat: 28.059, lng: 95.3325 }],
      'Dibrugarh': [{ label: 'Dibrugarh', lat: 27.4845, lng: 94.9019 }],
      'Majuli': [{ label: 'Majuli (Garamur)', lat: 26.95, lng: 94.17 }],
      'Tezpur': [{ label: 'Tezpur', lat: 26.623, lng: 92.7976 }],
      'Guwahati': [{ label: 'Guwahati', lat: 26.1806, lng: 91.7539 }],
      'Dhubri': [{ label: 'Dhubri', lat: 26.0196, lng: 89.9914 }],
    },
    sangams: {
      'Siang + Dibang + Lohit @ Near Sadiya; the river is called the Brahmaputra below this point': [{ label: 'Sadiya', lat: 27.8435, lng: 95.6732 }],
      'Subansiri @ Near Majuli, Lakhimpur district': [{ label: 'Majuli (north-east tip)', lat: 26.95, lng: 94.17 }],
      'Kameng (Jia Bharali) @ Near Tezpur': [{ label: 'Tezpur', lat: 26.623, lng: 92.7976 }],
      'Manas @ Near Jogighopa': [{ label: 'Jogighopa', lat: 26.2223, lng: 90.5731 }],
      'Teesta @ Near Chilmari, Kurigram': [{ label: 'Chilmari', lat: 25.583, lng: 89.6599 }],
      'Padma (Ganga) @ Goalundo': [{ label: 'Goalundo', lat: 23.7619, lng: 89.7805 }],
    },
  },
  'IND-RIV-03B': {
    towns: {
      'Anini': [{ label: 'Anini', lat: 28.7969, lng: 95.9045 }],
      'Roing': [{ label: 'Roing', lat: 28.1368, lng: 95.8431 }],
    },
    sangams: {
      'Brahmaputra (Siang) @ Near Sadiya': [{ label: 'Sadiya', lat: 27.8435, lng: 95.6732 }],
    },
  },
  'IND-RIV-03C': {
    dams: {
      'Dhola-Sadiya Bridge (Bhupen Hazarika Setu)': [{ label: 'Dhola-Sadiya Bridge', lat: 27.797, lng: 95.676 }],
    },
    parks: {
      'Kamlang Tiger Reserve': [{ label: 'Kamlang Tiger Reserve', lat: 27.7719, lng: 96.5909 }],
      'Namdapha National Park': [{ label: 'Namdapha National Park', lat: 27.4709, lng: 96.5552 }],
    },
    towns: {
      'Kibithu and Walong': [{ label: 'Kibithu', lat: 28.2826, lng: 97.0165 }, { label: 'Walong', lat: 28.1288, lng: 97.0166 }],
      'Dong': [{ label: 'Dong', lat: 28.1679, lng: 97.0389 }],
      'Parshuram Kund': [{ label: 'Parshuram Kund', lat: 27.8787, lng: 96.3578 }],
      'Tezu': [{ label: 'Tezu', lat: 27.9254, lng: 96.1647 }],
    },
    sangams: {
      'Brahmaputra (Siang) @ Near Sadiya': [{ label: 'Sadiya', lat: 27.8435, lng: 95.6732 }],
    },
  },
  'IND-RIV-03D': {
    dams: {
      'Subansiri Lower Hydroelectric Project': [{ label: 'Subansiri Lower HEP (Gerukamukh)', lat: 27.5512, lng: 94.26 }],
    },
    towns: {
      'Daporijo': [{ label: 'Daporijo', lat: 27.9843, lng: 94.2191 }],
      'North Lakhimpur': [{ label: 'North Lakhimpur', lat: 27.2362, lng: 94.1039 }],
    },
    sangams: {
      'Brahmaputra @ Near Majuli, Lakhimpur district': [{ label: 'Majuli (north-east tip)', lat: 26.95, lng: 94.17 }],
    },
  },
  'IND-RIV-03E': {
    dams: {
      'Kameng Hydroelectric Project': [{ label: 'Kameng Hydroelectric Project', lat: 27.1662, lng: 92.6751 }],
    },
    parks: {
      'Pakke Tiger Reserve': [{ label: 'Pakke Tiger Reserve', lat: 27.0822, lng: 92.765 }],
      'Nameri National Park': [{ label: 'Nameri National Park', lat: 26.9475, lng: 92.8919 }],
      'Eaglenest Wildlife Sanctuary': [{ label: 'Eaglenest Wildlife Sanctuary', lat: 27.1256, lng: 92.4557 }],
    },
    towns: {
      'Seppa': [{ label: 'Seppa', lat: 27.3594, lng: 93.0406 }],
      'Bhalukpong': [{ label: 'Bhalukpong', lat: 27.0137, lng: 92.6358 }],
      'Tezpur': [{ label: 'Tezpur', lat: 26.623, lng: 92.7976 }],
    },
    sangams: {
      'Brahmaputra @ Near Tezpur': [{ label: 'Tezpur', lat: 26.623, lng: 92.7976 }],
    },
  },
  'IND-RIV-03F': {
    dams: {
      'Kurichhu Hydroelectric Project': [{ label: 'Kurichhu Hydroelectric Project', lat: 27.216, lng: 91.2049 }],
    },
    parks: {
      'Manas National Park': [{ label: 'Manas National Park', lat: 26.7228, lng: 90.9779 }],
      'Royal Manas National Park': [{ label: 'Royal Manas National Park', lat: 26.85, lng: 90.85 }],
    },
    towns: {
      'Mathanguri': [{ label: 'Mathanguri', lat: 26.6349, lng: 90.8303 }],
      'Barpeta Road': [{ label: 'Barpeta Road', lat: 26.4971, lng: 90.968 }],
      'Jogighopa': [{ label: 'Jogighopa', lat: 26.2223, lng: 90.5731 }],
    },
    sangams: {
      'Brahmaputra @ Near Jogighopa': [{ label: 'Jogighopa', lat: 26.2223, lng: 90.5731 }],
    },
  },
  'IND-RIV-03G': {
    dams: {
      'Teesta-III Hydroelectric Project': [{ label: 'Teesta-III Dam (Chungthang)', lat: 27.5975, lng: 88.6508 }],
      'Teesta-V Hydroelectric Project': [{ label: 'Teesta-V Dam (Dikchu)', lat: 27.2421, lng: 88.4776 }],
      'Teesta Low Dam III and IV': [{ label: 'Teesta Low Dam III', lat: 27.0016, lng: 88.443 }, { label: 'Teesta Low Dam IV', lat: 26.9275, lng: 88.4572 }],
      'Teesta Barrage (Gajoldoba)': [{ label: 'Teesta Barrage (Gajoldoba)', lat: 26.7539, lng: 88.5898 }],
    },
    parks: {
      'Khangchendzonga National Park': [{ label: 'Khangchendzonga National Park', lat: 27.6558, lng: 88.2857 }],
      'Mahananda Wildlife Sanctuary': [{ label: 'Mahananda Wildlife Sanctuary', lat: 26.8541, lng: 88.4089 }],
    },
    towns: {
      'Chungthang': [{ label: 'Chungthang', lat: 27.6042, lng: 88.6465 }],
      'Singtam and Rangpo': [{ label: 'Singtam', lat: 27.232, lng: 88.4971 }, { label: 'Rangpo', lat: 27.1744, lng: 88.5303 }],
      'Sevoke': [{ label: 'Sevoke', lat: 26.8797, lng: 88.4708 }],
      'Jalpaiguri': [{ label: 'Jalpaiguri', lat: 26.5242, lng: 88.7198 }],
    },
    sangams: {
      'Lachen Chu + Lachung Chu @ Chungthang': [{ label: 'Chungthang', lat: 27.6042, lng: 88.6465 }],
      'Rangit @ Melli (Triveni)': [{ label: 'Melli', lat: 27.0901, lng: 88.4577 }],
      'Brahmaputra (Jamuna) @ Near Chilmari, Kurigram': [{ label: 'Chilmari', lat: 25.583, lng: 89.6599 }],
    },
  },
  'IND-RIV-03H': {
    parks: {
      'Doyang Reservoir (Pangti)': [{ label: 'Doyang Reservoir (Pangti)', lat: 26.2345, lng: 94.2729 }],
    },
    towns: {
      'Dimapur': [{ label: 'Dimapur', lat: 25.9117, lng: 93.7217 }],
      'Golaghat': [{ label: 'Golaghat', lat: 26.5108, lng: 93.9744 }],
    },
  },
  'IND-RIV-03I': {
    parks: {
      'Barail Wildlife Sanctuary': [{ label: 'Barail Wildlife Sanctuary', lat: 25.0728, lng: 92.636 }],
    },
    towns: {
      'Silchar': [{ label: 'Silchar', lat: 24.8303, lng: 92.7876 }],
      'Karimganj': [{ label: 'Karimganj', lat: 24.87, lng: 92.35 }],
      'Jatinga': [{ label: 'Jatinga', lat: 25.1315, lng: 93.0056 }],
    },
    sangams: {
      'Surma-Kushiyara bifurcation @ Near Amalshid at the Bangladesh border': [{ label: 'Amalshid', lat: 24.88, lng: 92.48 }],
    },
  },
  'IND-RIV-04': {
    dams: {
      'Bargi Dam (Rani Avanti Bai Sagar)': [{ label: 'Bargi Dam', lat: 22.939, lng: 79.9216 }],
      'Tawa Dam': [{ label: 'Tawa Dam', lat: 22.56, lng: 77.98 }],
      'Indira Sagar Dam': [{ label: 'Indira Sagar Dam', lat: 22.2845, lng: 76.4719 }],
      'Omkareshwar Dam': [{ label: 'Omkareshwar Dam', lat: 22.2421, lng: 76.1621 }],
      'Sardar Sarovar Dam': [{ label: 'Sardar Sarovar Dam', lat: 21.8298, lng: 73.7497 }],
    },
    parks: {
      'Kanha Tiger Reserve': [{ label: 'Kanha Tiger Reserve', lat: 22.2379, lng: 80.6333 }],
      'Satpura Tiger Reserve': [{ label: 'Satpura Tiger Reserve', lat: 22.4831, lng: 78.3217 }],
      'Shoolpaneshwar Wildlife Sanctuary': [{ label: 'Shoolpaneshwar Wildlife Sanctuary', lat: 21.7305, lng: 73.698 }],
    },
    towns: {
      'Amarkantak': [{ label: 'Amarkantak', lat: 22.6705, lng: 81.7588 }],
      'Jabalpur (Bhedaghat)': [{ label: 'Jabalpur (Bhedaghat)', lat: 23.1317, lng: 79.801 }],
      'Narmadapuram (Hoshangabad)': [{ label: 'Narmadapuram', lat: 22.7546, lng: 77.7198 }],
      'Omkareshwar': [{ label: 'Omkareshwar', lat: 22.243, lng: 76.1496 }],
      'Maheshwar': [{ label: 'Maheshwar', lat: 22.1774, lng: 75.5874 }],
      'Ekta Nagar (Kevadia)': [{ label: 'Ekta Nagar (Kevadia)', lat: 21.8831, lng: 73.6905 }],
      'Bharuch': [{ label: 'Bharuch', lat: 21.708, lng: 72.9957 }],
    },
    sangams: {
      'Banjar @ Mandla': [{ label: 'Mandla', lat: 22.5978, lng: 80.3721 }],
      'Tawa @ Bandrabhan, near Narmadapuram': [{ label: 'Bandrabhan', lat: 22.78, lng: 77.77 }],
      'Orsang @ Chandod (Karnali)': [{ label: 'Chandod', lat: 21.9867, lng: 73.4545 }],
    },
  },
  'IND-RIV-10': {
    dams: {
      'Ukai Dam (Vallabh Sagar)': [{ label: 'Ukai Dam', lat: 21.25, lng: 73.59 }],
      'Kakrapar Weir': [{ label: 'Kakrapar Weir', lat: 21.2689, lng: 73.3647 }],
      'Hatnur Dam': [{ label: 'Hatnur Dam', lat: 21.0644, lng: 75.9421 }],
      'Sarangkheda and Prakasha Barrages': [{ label: 'Sarangkheda Barrage', lat: 21.4337, lng: 74.5279 }, { label: 'Prakasha Barrage', lat: 21.5142, lng: 74.3557 }],
    },
    parks: {
      'Melghat Tiger Reserve': [{ label: 'Melghat Tiger Reserve', lat: 21.4374, lng: 77.1754 }],
    },
    towns: {
      'Multai': [{ label: 'Multai', lat: 21.7746, lng: 78.2635 }],
      'Burhanpur': [{ label: 'Burhanpur', lat: 21.3119, lng: 76.2292 }],
      'Bhusawal': [{ label: 'Bhusawal', lat: 21.04, lng: 75.79 }],
      'Prakasha': [{ label: 'Prakasha', lat: 21.5142, lng: 74.3557 }],
      'Surat': [{ label: 'Surat', lat: 21.2095, lng: 72.8317 }],
    },
    sangams: {
      'Purna @ Changdev, Muktainagar (Jalgaon)': [{ label: 'Changdev', lat: 21.0749, lng: 76.0016 }],
      'Panjhra @ Mudawad, Dhule': [{ label: 'Mudawad', lat: 21.2238, lng: 74.9381 }],
      'Gomai @ Prakasha, Nandurbar': [{ label: 'Prakasha', lat: 21.5142, lng: 74.3557 }],
    },
  },
  'IND-RIV-04B': {
    dams: {
      'Dharoi Dam': [{ label: 'Dharoi Dam', lat: 23.9904, lng: 72.8884 }],
    },
    towns: {
      'Gandhinagar': [{ label: 'Gandhinagar', lat: 23.2233, lng: 72.6492 }],
      'Ahmedabad': [{ label: 'Ahmedabad', lat: 23.0215, lng: 72.5801 }],
      'Vautha': [{ label: 'Vautha', lat: 22.6594, lng: 72.5367 }],
    },
    sangams: {
      'Watrak @ Near Vautha, Ahmedabad district': [{ label: 'Vautha', lat: 22.6594, lng: 72.5367 }],
    },
  },
  'IND-RIV-04C': {
    dams: {
      'Mahi Bajaj Sagar Dam': [{ label: 'Mahi Bajaj Sagar Dam', lat: 23.6285, lng: 74.5473 }],
      'Kadana Dam': [{ label: 'Kadana Dam', lat: 23.306, lng: 73.8259 }],
      'Wanakbori Weir': [{ label: 'Wanakbori Weir', lat: 22.8719, lng: 73.3594 }],
    },
    towns: {
      'Banswara': [{ label: 'Banswara', lat: 23.5501, lng: 74.4463 }],
      'Galteshwar': [{ label: 'Galteshwar', lat: 22.7849, lng: 73.2781 }],
    },
  },
  'IND-RIV-04D': {
    towns: {
      'Pushkar': [{ label: 'Pushkar', lat: 26.4876, lng: 74.5578 }],
      'Balotra': [{ label: 'Balotra', lat: 25.8348, lng: 72.2411 }],
    },
  },
  'IND-RIV-04E': {
    parks: {
      'Bhagwan Mahaveer Wildlife Sanctuary and Mollem National Park': [{ label: 'Bhagwan Mahaveer Wildlife Sanctuary', lat: 15.3401, lng: 74.2496 }, { label: 'Mollem National Park', lat: 15.339, lng: 74.2832 }],
      'Salim Ali Bird Sanctuary': [{ label: 'Salim Ali Bird Sanctuary (Chorao)', lat: 15.5132, lng: 73.8703 }],
    },
    towns: {
      'Panaji': [{ label: 'Panaji', lat: 15.49, lng: 73.83 }],
      'Old Goa': [{ label: 'Old Goa', lat: 15.5023, lng: 73.9117 }],
      'Divar and Chorao islands': [{ label: 'Divar Island', lat: 15.5251, lng: 73.9078 }, { label: 'Chorao Island', lat: 15.5394, lng: 73.8847 }],
    },
    sangams: {
      'Zuari (via Cumbarjua Canal) @ Cumbarjua canal links the Mandovi and Zuari estuaries': [{ label: 'Cumbarjua Canal', lat: 15.4656, lng: 73.9576 }],
    },
  },
  'IND-RIV-04F': {
    parks: {
      'Netravali Wildlife Sanctuary': [{ label: 'Netravali Wildlife Sanctuary', lat: 15.1337, lng: 74.2511 }],
    },
    towns: {
      'Mormugao (Vasco da Gama)': [{ label: 'Vasco da Gama (Mormugao)', lat: 15.3984, lng: 73.8129 }],
      'Agassaim-Cortalim': [{ label: 'Agassaim', lat: 15.4263, lng: 73.8986 }, { label: 'Cortalim', lat: 15.397, lng: 73.9168 }],
    },
    sangams: {
      'Mandovi (via Cumbarjua Canal) @ Cumbarjua canal': [{ label: 'Cumbarjua Canal', lat: 15.4656, lng: 73.9576 }],
    },
  },
  'IND-RIV-04G': {
    dams: {
      'Linganamakki Dam': [{ label: 'Linganamakki Dam', lat: 14.1759, lng: 74.8465 }],
    },
    towns: {
      'Jog Falls': [{ label: 'Jog Falls', lat: 14.2293, lng: 74.8123 }],
      'Honnavar': [{ label: 'Honnavar', lat: 14.2811, lng: 74.4447 }],
    },
  },
  'IND-RIV-04H': {
    dams: {
      'Mullaperiyar Dam': [{ label: 'Mullaperiyar Dam', lat: 9.5286, lng: 77.1441 }],
      'Idukki Dam': [{ label: 'Idukki Dam', lat: 9.8435, lng: 76.9762 }],
      'Idamalayar Dam': [{ label: 'Idamalayar Dam', lat: 10.2219, lng: 76.7067 }],
    },
    parks: {
      'Periyar Tiger Reserve': [{ label: 'Periyar Tiger Reserve', lat: 9.4365, lng: 77.3049 }],
      'Idukki Wildlife Sanctuary': [{ label: 'Idukki Wildlife Sanctuary', lat: 9.782, lng: 76.9851 }],
      'Thattekad Bird Sanctuary (Salim Ali)': [{ label: 'Thattekad Bird Sanctuary', lat: 10.1279, lng: 76.7194 }],
    },
    towns: {
      'Thekkady': [{ label: 'Thekkady', lat: 9.5805, lng: 77.1811 }],
      'Idukki': [{ label: 'Idukki (Painavu)', lat: 9.854, lng: 76.9446 }],
      'Aluva': [{ label: 'Aluva', lat: 10.1078, lng: 76.3569 }],
      'Kodungallur (Muziris)': [{ label: 'Kodungallur', lat: 10.2277, lng: 76.1972 }],
    },
  },
  'IND-RIV-04I': {
    dams: {
      'Malampuzha Dam': [{ label: 'Malampuzha Dam', lat: 10.8309, lng: 76.6836 }],
    },
    parks: {
      'Silent Valley National Park': [{ label: 'Silent Valley National Park', lat: 11.1389, lng: 76.4405 }],
    },
    towns: {
      'Palakkad': [{ label: 'Palakkad', lat: 10.7682, lng: 76.6521 }],
      'Cheruthuruthy': [{ label: 'Cheruthuruthy', lat: 10.747, lng: 76.2751 }],
      'Thirunavaya': [{ label: 'Thirunavaya', lat: 10.86, lng: 75.98 }],
      'Ponnani': [{ label: 'Ponnani', lat: 10.7801, lng: 75.9189 }],
    },
  },
  'IND-RIV-07': {
    dams: {
      'Hirakud Dam': [{ label: 'Hirakud Dam', lat: 21.5492, lng: 83.9011 }],
      'Chiplima Power House': [{ label: 'Chiplima Power House', lat: 21.3528, lng: 83.9168 }],
      'Mahanadi Barrage (Jobra)': [{ label: 'Mahanadi Barrage (Jobra)', lat: 20.4787, lng: 85.9012 }],
    },
    parks: {
      'Debrigarh Wildlife Sanctuary': [{ label: 'Debrigarh Wildlife Sanctuary', lat: 21.5873, lng: 83.6218 }],
      'Satkosia Tiger Reserve': [{ label: 'Satkosia Tiger Reserve', lat: 20.5872, lng: 84.8616 }],
      'Chilika Lake': [{ label: 'Chilika Lake', lat: 19.6853, lng: 85.2504 }],
    },
    towns: {
      'Sambalpur': [{ label: 'Sambalpur', lat: 21.4705, lng: 83.9762 }],
      'Sonepur': [{ label: 'Sonepur (Subarnapur)', lat: 20.8454, lng: 83.9091 }],
      'Cuttack': [{ label: 'Cuttack', lat: 20.4686, lng: 85.8792 }],
    },
    sangams: {
      'Seonath @ Near Shivrinarayan': [{ label: 'Shivrinarayan', lat: 21.7212, lng: 82.5947 }],
      'Tel @ Sonepur': [{ label: 'Sonepur', lat: 20.8454, lng: 83.9091 }],
    },
  },
  'IND-RIV-05': {
    dams: {
      'Jayakwadi Dam (Nath Sagar)': [{ label: 'Jayakwadi Dam', lat: 19.4725, lng: 75.3639 }],
      'Sriram Sagar Project (Pochampad)': [{ label: 'Sriram Sagar Dam (Pochampad)', lat: 18.97, lng: 78.34 }],
      'Kaleshwaram Lift Irrigation Project': [{ label: 'Medigadda Barrage (Kaleshwaram LIP)', lat: 18.7901, lng: 79.9267 }],
      'Polavaram Project': [{ label: 'Polavaram Dam', lat: 17.2573, lng: 81.6463 }],
      'Sir Arthur Cotton Barrage (Dowleswaram)': [{ label: 'Sir Arthur Cotton Barrage', lat: 16.9501, lng: 81.7855 }],
    },
    parks: {
      'Indravati Tiger Reserve': [{ label: 'Indravati Tiger Reserve', lat: 19.1311, lng: 80.5066 }],
      'Papikonda National Park': [{ label: 'Papikonda National Park', lat: 17.4823, lng: 81.4868 }],
      'Coringa Wildlife Sanctuary': [{ label: 'Coringa Wildlife Sanctuary', lat: 16.8107, lng: 82.3003 }],
    },
    towns: {
      'Trimbakeshwar': [{ label: 'Trimbakeshwar', lat: 19.9321, lng: 73.5308 }],
      'Nashik': [{ label: 'Nashik', lat: 20.0112, lng: 73.7902 }],
      'Paithan': [{ label: 'Paithan', lat: 19.4734, lng: 75.3868 }],
      'Nanded': [{ label: 'Nanded', lat: 19.15, lng: 77.31 }],
      'Basara': [{ label: 'Basara', lat: 18.8846, lng: 77.9526 }],
      'Bhadrachalam': [{ label: 'Bhadrachalam', lat: 17.6688, lng: 80.894 }],
      'Rajahmundry (Rajamahendravaram)': [{ label: 'Rajahmundry', lat: 17.005, lng: 81.7805 }],
    },
    sangams: {
      'Pravara @ Pravara Sangam (Toka), Ahmednagar': [{ label: 'Pravara Sangam (Toka)', lat: 19.6049, lng: 75.0125 }],
      'Manjira @ Near Kandakurthi, Nizamabad': [{ label: 'Kandakurthi', lat: 18.813, lng: 77.8885 }],
      'Pranhita @ Kaleshwaram': [{ label: 'Kaleshwaram', lat: 18.8118, lng: 79.9053 }],
      'Indravati @ Maharashtra-Telangana-Chhattisgarh tri-junction': [{ label: 'Indravati–Godavari confluence (near Somnoor)', lat: 18.7272, lng: 80.2617 }],
      'Sabari @ Kunavaram': [{ label: 'Kunavaram', lat: 17.5754, lng: 81.2534 }],
    },
  },
  'IND-RIV-08': {
    dams: {
      'Koyna Dam': [{ label: 'Koyna Dam', lat: 17.4023, lng: 73.751 }],
      'Almatti Dam (Lal Bahadur Shastri Sagar)': [{ label: 'Almatti Dam', lat: 16.3649, lng: 75.9524 }],
      'Jurala (Priyadarshini) Project': [{ label: 'Priyadarshini Jurala Dam', lat: 16.3389, lng: 77.7041 }],
      'Srisailam Dam': [{ label: 'Srisailam Dam', lat: 16.0868, lng: 78.897 }],
      'Nagarjuna Sagar Dam': [{ label: 'Nagarjuna Sagar Dam', lat: 16.57, lng: 79.31 }],
      'Prakasam Barrage': [{ label: 'Prakasam Barrage', lat: 16.5041, lng: 80.6046 }],
    },
    parks: {
      'Koyna Wildlife Sanctuary': [{ label: 'Koyna Wildlife Sanctuary', lat: 17.5759, lng: 73.7687 }],
      'Nagarjunsagar-Srisailam Tiger Reserve': [{ label: 'Nagarjunsagar-Srisailam Tiger Reserve', lat: 16, lng: 78.85 }],
    },
    towns: {
      'Mahabaleshwar': [{ label: 'Mahabaleshwar', lat: 17.9243, lng: 73.6576 }],
      'Sangli': [{ label: 'Sangli', lat: 16.8503, lng: 74.5949 }],
      'Kudalasangama': [{ label: 'Kudalasangama', lat: 16.2034, lng: 76.0604 }],
      'Srisailam': [{ label: 'Srisailam', lat: 16.075, lng: 78.8726 }],
      'Nagarjunakonda': [{ label: 'Nagarjunakonda', lat: 16.5224, lng: 79.2416 }],
      'Amaravati': [{ label: 'Amaravati', lat: 16.3798, lng: 80.432 }],
      'Vijayawada': [{ label: 'Vijayawada', lat: 16.5192, lng: 80.6238 }],
    },
    sangams: {
      'Venna @ Sangam Mahuli, Satara': [{ label: 'Sangam Mahuli', lat: 17.6903, lng: 74.0486 }],
      'Koyna @ Karad (Preeti Sangam)': [{ label: 'Karad (Preeti Sangam)', lat: 17.2852, lng: 74.1822 }],
      'Panchganga @ Narsobawadi, Kolhapur': [{ label: 'Narsobawadi', lat: 16.7655, lng: 74.5455 }],
      'Malaprabha @ Kudalasangama, Bagalkot': [{ label: 'Kudalasangama', lat: 16.2034, lng: 76.0604 }],
      'Tungabhadra @ Near Alampur-Sangameswaram': [{ label: 'Sangameswaram', lat: 16.0237, lng: 78.3307 }],
    },
  },
  'IND-RIV-08B': {
    dams: {
      'Ujani Dam': [{ label: 'Ujani Dam', lat: 18.07, lng: 75.12 }],
      'Chaskaman and Bhama Askhed Dams': [{ label: 'Chaskaman Dam', lat: 18.9594, lng: 73.7849 }, { label: 'Bhama Askhed Dam', lat: 18.8327, lng: 73.7244 }],
    },
    parks: {
      'Bhimashankar Wildlife Sanctuary': [{ label: 'Bhimashankar Wildlife Sanctuary', lat: 19.0618, lng: 73.5323 }],
    },
    towns: {
      'Bhimashankar': [{ label: 'Bhimashankar', lat: 19.072, lng: 73.5358 }],
      'Alandi and Dehu': [{ label: 'Alandi', lat: 18.6772, lng: 73.8981 }, { label: 'Dehu', lat: 18.7208, lng: 73.766 }],
      'Koregaon Bhima': [{ label: 'Koregaon Bhima', lat: 18.6453, lng: 74.0579 }],
      'Pandharpur': [{ label: 'Pandharpur', lat: 17.6769, lng: 75.3327 }],
      'Ganagapur': [{ label: 'Ganagapur', lat: 17.3414, lng: 76.594 }],
    },
    sangams: {
      'Indrayani + Bhama @ Tulapur, Pune': [{ label: 'Tulapur', lat: 18.6699, lng: 73.9954 }],
    },
  },
  'IND-RIV-08C': {
    dams: {
      'Bhadra Dam (Lakkavalli)': [{ label: 'Bhadra Dam (Lakkavalli)', lat: 13.7018, lng: 75.6361 }],
      'Tungabhadra Dam': [{ label: 'Tungabhadra Dam', lat: 15.2636, lng: 76.3337 }],
      'Sunkesula Barrage': [{ label: 'Sunkesula Barrage', lat: 15.8801, lng: 77.8306 }],
    },
    parks: {
      'Kudremukh National Park': [{ label: 'Kudremukh National Park', lat: 13.254, lng: 75.1831 }],
      'Bhadra Tiger Reserve': [{ label: 'Bhadra Tiger Reserve', lat: 13.5715, lng: 75.6205 }],
      'Daroji Sloth Bear Sanctuary': [{ label: 'Daroji Sloth Bear Sanctuary', lat: 15.2752, lng: 76.5636 }],
    },
    towns: {
      'Sringeri': [{ label: 'Sringeri', lat: 13.4262, lng: 75.2554 }],
      'Hampi': [{ label: 'Hampi', lat: 15.3358, lng: 76.461 }],
      'Hosapete': [{ label: 'Hosapete', lat: 15.2665, lng: 76.3872 }],
      'Mantralayam': [{ label: 'Mantralayam', lat: 15.9414, lng: 77.4237 }],
      'Kurnool': [{ label: 'Kurnool', lat: 15.8309, lng: 78.0425 }],
    },
    sangams: {
      'Tunga + Bhadra @ Koodli, Shivamogga': [{ label: 'Koodli', lat: 14.0037, lng: 75.6737 }],
      'Krishna @ Near Alampur-Sangameswaram': [{ label: 'Sangameswaram', lat: 16.0237, lng: 78.3307 }],
    },
  },
  'IND-RIV-06': {
    dams: {
      'Krishnaraja Sagar (KRS) Dam': [{ label: 'Krishnaraja Sagar Dam', lat: 12.4242, lng: 76.5721 }],
      'Mettur Dam (Stanley Reservoir)': [{ label: 'Mettur Dam', lat: 11.8035, lng: 77.8061 }],
      'Grand Anicut (Kallanai)': [{ label: 'Grand Anicut (Kallanai)', lat: 10.8308, lng: 78.8188 }],
      'Upper Anicut (Mukkombu)': [{ label: 'Upper Anicut (Mukkombu)', lat: 10.8852, lng: 78.5791 }],
      'Mekedatu Project': [{ label: 'Mekedatu (proposed dam site)', lat: 12.2585, lng: 77.4475 }],
    },
    parks: {
      'Nagarhole and Bandipur Tiger Reserves': [{ label: 'Nagarhole Tiger Reserve', lat: 12.0599, lng: 76.1541 }, { label: 'Bandipur Tiger Reserve', lat: 11.7867, lng: 76.4207 }],
      'Ranganathittu Bird Sanctuary': [{ label: 'Ranganathittu Bird Sanctuary', lat: 12.4281, lng: 76.6536 }],
      'Mudumalai and Sathyamangalam Tiger Reserves': [{ label: 'Mudumalai Tiger Reserve', lat: 11.6191, lng: 76.4746 }, { label: 'Sathyamangalam Tiger Reserve', lat: 11.5529, lng: 77.1394 }],
      'Point Calimere (Kodiakkarai)': [{ label: 'Point Calimere (Kodiakkarai)', lat: 10.3063, lng: 79.8515 }],
    },
    towns: {
      'Talakaveri and Bhagamandala': [{ label: 'Talakaveri', lat: 12.3852, lng: 75.4953 }, { label: 'Bhagamandala', lat: 12.3857, lng: 75.529 }],
      'Srirangapatna': [{ label: 'Srirangapatna', lat: 12.4226, lng: 76.6849 }],
      'Shivanasamudra': [{ label: 'Shivanasamudra', lat: 12.3015, lng: 77.1572 }],
      'Hogenakkal': [{ label: 'Hogenakkal', lat: 12.1214, lng: 77.7777 }],
      'Tiruchirappalli (Srirangam)': [{ label: 'Tiruchirappalli (Srirangam)', lat: 10.8573, lng: 78.6931 }],
      'Thanjavur and Kumbakonam': [{ label: 'Thanjavur', lat: 10.786, lng: 79.1381 }, { label: 'Kumbakonam', lat: 10.9604, lng: 79.3821 }],
    },
    sangams: {
      'Kannike + Sujyoti @ Bhagamandala (Triveni)': [{ label: 'Bhagamandala', lat: 12.3857, lng: 75.529 }],
      'Kabini @ Tirumakudalu Narasipura': [{ label: 'Tirumakudalu Narasipura', lat: 12.2135, lng: 76.9028 }],
      'Arkavathi @ Sangama, Kanakapura': [{ label: 'Sangama (Kanakapura)', lat: 12.288, lng: 77.432 }],
      'Bhavani @ Bhavani (Kooduthurai), Erode': [{ label: 'Bhavani (Kooduthurai)', lat: 11.4406, lng: 77.6824 }],
      'Amaravati @ Near Karur': [{ label: 'Karur', lat: 10.9596, lng: 78.0808 }],
    },
  },
  'IND-RIV-13': {
    dams: {
      'Mylavaram Dam': [{ label: 'Mylavaram Dam', lat: 14.8397, lng: 78.3384 }],
      'Somasila Dam': [{ label: 'Somasila Dam', lat: 14.4905, lng: 79.3042 }],
      'Nellore (Sangam) Barrages': [{ label: 'Nellore Barrage', lat: 14.45, lng: 79.98 }],
    },
    parks: {
      'Sri Lankamalleswara Wildlife Sanctuary': [{ label: 'Sri Lankamalleswara Wildlife Sanctuary', lat: 14.5845, lng: 78.9208 }],
      'Sri Penusila Narasimha Wildlife Sanctuary': [{ label: 'Sri Penusila Narasimha Wildlife Sanctuary', lat: 14.4283, lng: 79.2283 }],
    },
    towns: {
      'Gandikota': [{ label: 'Gandikota', lat: 14.815, lng: 78.287 }],
      'Nellore': [{ label: 'Nellore', lat: 14.4494, lng: 79.9874 }],
    },
    sangams: {
      'Kunderu @ Near Kamalapuram, Kadapa': [{ label: 'Kamalapuram', lat: 14.5963, lng: 78.6704 }],
    },
  },
  'IND-RIV-14': {
    dams: {
      'Getalsud and Chandil Dams': [{ label: 'Getalsud Dam', lat: 23.45, lng: 85.55 }, { label: 'Chandil Dam', lat: 22.9751, lng: 86.0234 }],
    },
    towns: {
      'Hundru Falls': [{ label: 'Hundru Falls', lat: 23.4506, lng: 85.6661 }],
      'Jamshedpur': [{ label: 'Jamshedpur', lat: 22.8015, lng: 86.203 }],
    },
  },
  'IND-RIV-11': {
    dams: {
      'Mandira Dam': [{ label: 'Mandira Dam', lat: 22.3, lng: 84.55 }],
      'Rengali Dam': [{ label: 'Rengali Dam', lat: 21.2768, lng: 85.0325 }],
    },
    parks: {
      'Bhitarkanika National Park': [{ label: 'Bhitarkanika National Park', lat: 20.7195, lng: 86.8619 }],
      'Gahirmatha Marine Sanctuary': [{ label: 'Gahirmatha Marine Sanctuary', lat: 20.6416, lng: 86.9402 }],
    },
    towns: {
      'Rourkela': [{ label: 'Rourkela', lat: 22.2309, lng: 84.8679 }],
      'Talcher-Angul': [{ label: 'Talcher', lat: 20.9458, lng: 85.2112 }],
      'Dhamra': [{ label: 'Dhamra', lat: 20.7956, lng: 86.901 }],
    },
    sangams: {
      'South Koel + Sankh @ Vedavyas, near Rourkela': [{ label: 'Vedavyas', lat: 22.2368, lng: 84.7971 }],
      'Baitarani @ Dhamra estuary': [{ label: 'Dhamra estuary', lat: 20.7956, lng: 86.901 }],
    },
  },
  'IND-RIV-12': {
    parks: {
      'Bhitarkanika National Park': [{ label: 'Bhitarkanika National Park', lat: 20.7195, lng: 86.8619 }],
    },
    towns: {
      'Gonasika': [{ label: 'Gonasika', lat: 21.5048, lng: 85.5518 }],
      'Jajpur': [{ label: 'Jajpur', lat: 20.85, lng: 86.33 }],
    },
    sangams: {
      'Brahmani @ Dhamra estuary': [{ label: 'Dhamra estuary', lat: 20.7956, lng: 86.901 }],
    },
  },
  'IND-RIV-15A': {
    dams: {
      'Neradi Barrage (proposed)': [{ label: 'Neradi Barrage (proposed)', lat: 18.7368, lng: 83.9209 }],
    },
    towns: {
      'Mukhalingam': [{ label: 'Mukhalingam', lat: 18.596, lng: 83.9639 }],
      'Kalingapatnam': [{ label: 'Kalingapatnam', lat: 18.3415, lng: 84.1211 }],
    },
  },
  'IND-RIV-15B': {
    dams: {
      'Thotapalli Barrage': [{ label: 'Thotapalli Barrage', lat: 18.78, lng: 83.47 }],
    },
    towns: {
      'Rayagada': [{ label: 'Rayagada', lat: 19.17, lng: 83.42 }],
      'Srikakulam': [{ label: 'Srikakulam', lat: 18.2949, lng: 83.8939 }],
    },
  },
  'IND-RIV-17A': {
    towns: {
      'Vaniyambadi-Ambur': [{ label: 'Vaniyambadi', lat: 12.6787, lng: 78.62 }, { label: 'Ambur', lat: 12.7874, lng: 78.7188 }],
      'Vellore': [{ label: 'Vellore', lat: 12.9072, lng: 79.131 }],
      'Kalpakkam': [{ label: 'Kalpakkam', lat: 12.5093, lng: 80.1572 }],
    },
  },
  'IND-RIV-17B': {
    dams: {
      'Krishnagiri (KRP) Dam': [{ label: 'Krishnagiri (KRP) Dam', lat: 12.48, lng: 78.18 }],
      'Sathanur Dam': [{ label: 'Sathanur Dam', lat: 12.1832, lng: 78.8503 }],
    },
    towns: {
      'Hosur': [{ label: 'Hosur', lat: 12.7329, lng: 77.8309 }],
      'Cuddalore': [{ label: 'Cuddalore', lat: 11.7427, lng: 79.7503 }],
    },
  },
  'IND-RIV-16': {
    dams: {
      'Vaigai Dam': [{ label: 'Vaigai Dam', lat: 10.0464, lng: 77.5821 }],
    },
    parks: {
      'Srivilliputhur-Megamalai Tiger Reserve': [{ label: 'Srivilliputhur-Megamalai Tiger Reserve', lat: 9.5932, lng: 77.5654 }],
    },
    towns: {
      'Madurai': [{ label: 'Madurai', lat: 9.93, lng: 78.12 }],
      'Keezhadi': [{ label: 'Keezhadi', lat: 9.8639, lng: 78.1883 }],
    },
  },
  'IND-RIV-17C': {
    parks: {
      'Pichavaram Mangroves': [{ label: 'Pichavaram Mangroves', lat: 11.4331, lng: 79.7807 }],
    },
    towns: {
      'Vriddhachalam': [{ label: 'Vriddhachalam', lat: 11.52, lng: 79.3116 }],
      'Parangipettai': [{ label: 'Parangipettai (Porto Novo)', lat: 11.4906, lng: 79.7569 }],
    },
  },
};
