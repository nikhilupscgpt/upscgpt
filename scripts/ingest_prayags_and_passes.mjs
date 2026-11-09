import fs from 'fs';
import { CURATED_MAPPING_NODES } from '../src/lib/static-mapping-data.js';

const panchPrayagNodes = [
  {
    id: 'IND-PRY-01',
    slug: 'vishnuprayag-confluence',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Vishnuprayag (Alaknanda & Dhauliganga)',
    aliases: [
      'First Prayag',
      'Alaknanda Dhauliganga Sangam',
      'Joshimath Prayag',
      'Vishnu Temple Confluence'
    ],
    placeType: 'Holy Himalayan River Confluence (Panch Prayag)',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Uttarakhand (Chamoli District)'
    },
    lat: 30.5631,
    lng: 79.575,
    elevation: '1,372 m',
    neighbours: [
      'Downstream of Badrinath & Mana',
      'Upstream of Nandaprayag',
      'Near Joshimath Gateway & Valley of Flowers'
    ],
    staticFacts: [
      'First of the Panch Prayag descending downstream on the Alaknanda River, situated near Joshimath at ~1,372 m.',
      'Formed by the confluence of the Alaknanda (originating from Satopanth & Bhagirath Kharak glaciers) and the Dhauliganga (originating from Niti Pass / Vasudhara Tal).',
      'Dhauliganga valley houses the Tapovan Vishnugad Hydel Project (impacted by the catastrophic 2021 Chamoli glacial burst).',
      'Kagbhusandi Lake and the road to Valley of Flowers & Hemkund Sahib diverge near this junction.'
    ],
    similarPYQ: ['GEO-UPSC-2019-04', 'GEO-CDS2-2017-03'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PRY-02',
    slug: 'nandaprayag-confluence',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Nandaprayag (Alaknanda & Nandakini)',
    aliases: [
      'Second Prayag',
      'Alaknanda Nandakini Sangam',
      'Nandraj Prayag',
      'Gopalji Temple Confluence'
    ],
    placeType: 'Holy Himalayan River Confluence (Panch Prayag)',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Uttarakhand (Chamoli District)'
    },
    lat: 30.3312,
    lng: 79.3175,
    elevation: '870 m',
    neighbours: [
      'Downstream of Vishnuprayag',
      'Upstream of Karnaprayag',
      'Outer Garhwal Himalayas'
    ],
    staticFacts: [
      'Second of the Panch Prayag descending downstream, situated in Chamoli district at ~870 m.',
      'Formed by the confluence of the Alaknanda and the Nandakini River (which originates from the glaciers of Nanda Ghunti peak on the outer rim of Nanda Devi Sanctuary).',
      'Historically served as the capital of the ancient Yadu kingdom; key junction on the Badrinath pilgrim highway.',
      'UPSC Trap: Aspirants often confuse Nandakini with Mandakini; Nandakini joins at Nandaprayag, whereas Mandakini joins at Rudraprayag.'
    ],
    similarPYQ: ['GEO-UPSC-2019-04', 'ENV-UPSC-2019-14'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PRY-03',
    slug: 'karnaprayag-confluence',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Karnaprayag (Alaknanda & Pindar)',
    aliases: [
      'Third Prayag',
      'Alaknanda Pindar Sangam',
      'Karna Tirtha',
      'Garhwal Kumaon Junction'
    ],
    placeType: 'Holy Himalayan River Confluence (Panch Prayag)',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Uttarakhand (Chamoli District)'
    },
    lat: 30.2583,
    lng: 79.2167,
    elevation: '788 m',
    neighbours: [
      'Downstream of Nandaprayag',
      'Upstream of Rudraprayag',
      'Pindar Valley Gateway to Kumaon'
    ],
    staticFacts: [
      'Third of the Panch Prayag, located at the confluence of the Alaknanda and the Pindar River at ~788 m.',
      'The Pindar River originates from the Pindari Glacier in Bageshwar district (Kumaon), making Karnaprayag the primary hydrological link between Garhwal and Kumaon.',
      'Named after Karna of the Mahabharata who performed austerities here to obtain the impregnable armor (Kavacha & Kundala) from Surya.',
      'Vital transport node linking Rishikesh-Badrinath NH-58 with the road to Almora, Ranikhet, and Kausani across the Pindar valley.'
    ],
    similarPYQ: ['GEO-UPSC-2019-04', 'GEO-CDS1-2019-04'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PRY-04',
    slug: 'rudraprayag-confluence',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Rudraprayag (Alaknanda & Mandakini)',
    aliases: [
      'Fourth Prayag',
      'Alaknanda Mandakini Sangam',
      'Gateway to Kedarnath',
      'Rudranath Temple Confluence'
    ],
    placeType: 'Holy Himalayan River Confluence (Panch Prayag)',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Uttarakhand (Rudraprayag District)'
    },
    lat: 30.285,
    lng: 78.9814,
    elevation: '610 m',
    neighbours: [
      'Downstream of Karnaprayag',
      'Upstream of Devprayag',
      'Kedarnath Pilgrimage Highway'
    ],
    staticFacts: [
      'Fourth of the Panch Prayag, situated at the confluence of the Alaknanda and the raging Mandakini River at ~610 m.',
      'The Mandakini originates from the Chorabari Glacier (near Kedarnath & Gandhi Sarovar), not the Milam glacier (UPSC 2019 prelims trap).',
      'Major pilgrimage bifurcation hub: road branches north along the Mandakini to Kedarnath, and northeast along the Alaknanda to Badrinath.',
      'Severe epicenter of the June 2013 cloudburst disaster; famous in wildlife literature for Jim Corbett\'s "The Man-Eating Leopard of Rudraprayag".'
    ],
    similarPYQ: ['GEO-UPSC-2019-04', 'GEO-CDS2-2021-08'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PRY-05',
    slug: 'devprayag-confluence',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: 'Devprayag (Alaknanda & Bhagirathi — Ganga Origin)',
    aliases: [
      'Fifth Prayag',
      'Birthplace of Ganga',
      'Alaknanda Bhagirathi Sangam',
      'Sudarshan Kshetra',
      'Raghunathji Temple Confluence'
    ],
    placeType: 'Holy Himalayan River Confluence (Panch Prayag)',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Uttarakhand (Tehri Garhwal District)'
    },
    lat: 30.1458,
    lng: 78.5989,
    elevation: '475 m',
    neighbours: [
      'Downstream of Rudraprayag',
      'Upstream of Rishikesh',
      'Southern Garhwal Shivalik Transition'
    ],
    staticFacts: [
      'Fifth, lowest, and most sacred of the Panch Prayag where the Alaknanda and Bhagirathi unite; downstream from this confluence, the river is officially titled GANGA.',
      'Hydrologically, the Alaknanda contributes greater water volume (~60%), but the Bhagirathi (originating at Gaumukh/Gangotri) is revered as the mythological and spiritual source.',
      'Perched on a narrow rocky spur; houses the ancient Raghunathji Temple (one of the 108 Divya Desams built in Nagara style with massive stone blocks).',
      'Below Devprayag, the Ganga cuts through the Outer Himalayas (Shivalik ranges) past Rishikesh before finally bursting onto the Northern Plains at Haridwar.'
    ],
    similarPYQ: ['GEO-UPSC-2019-04', 'UPSC-2024-06', 'GEO-CDS1-2018-08'],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  }
];

const mountainPassNodes = [
  // --- A. Ladakh & Jammu & Kashmir ---
  {
    id: 'IND-PASS-01',
    slug: 'zoji-la-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Zoji La Pass',
    aliases: ['Zojila', 'Zoji La', 'Gateway to Ladakh', 'Srinagar-Leh Pass'],
    placeType: 'Great Himalayan Strategic Mountain Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Ladakh / Jammu & Kashmir'
    },
    lat: 34.28,
    lng: 75.58,
    elevation: '3,528 m',
    neighbours: [
      'Connects Kashmir Valley (Srinagar/Sonamarg) with Dras and Kargil',
      'Situated on the Great Himalayan Range',
      'Traversed by National Highway 1 (NH-1)'
    ],
    staticFacts: [
      'Situated on the Great Himalayan range at ~3,528 m; vital strategic artery connecting Srinagar via Sonamarg to Dras, Kargil, and Leh.',
      'Subject to heavy snowfall and closed during deep winter; the 14.15 km Zoji La bi-directional all-weather tunnel is under construction to ensure year-round military and civilian movement.',
      'Crucial battlefield of the 1947–48 Indo-Pak War where Indian Army tanks (Stuart light tanks of 7th Cavalry) were deployed at unprecedented high altitude (Operation Bison).',
      'Directly tested in UPSC CDS (2017) matching passes to states/regions.'
    ],
    similarPYQ: ['GEO-CDS2-2017-03', 'GEO-CDS2-2021-05'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-02',
    slug: 'khardung-la-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Khardung La Pass',
    aliases: ['Khardungla', 'Pass of Lower Castle', 'Leh-Nubra Pass'],
    placeType: 'Ladakh Range High-Altitude Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Ladakh (Leh District)'
    },
    lat: 34.2789,
    lng: 77.6047,
    elevation: '5,359 m',
    neighbours: [
      'North of Leh town',
      'South of Nubra and Shyok Valleys',
      'Gateway to Siachen Base Camp'
    ],
    staticFacts: [
      'Perched on the Ladakh Range north of Leh at ~5,359 m (17,582 ft); historically among the world\'s highest motorable roads.',
      'Acts as the indispensable military supply line to the Nubra Valley, Shyok Valley, and the Siachen Glacier (which lies strictly North of Nubra Valley, UPSC 2020).',
      'Tested directly in CDS 2021 ("D visited Khardung La, Nubra Valley... which State/UT?").',
      'Maintained year-round by Project HIMANK of the Border Roads Organisation (BRO).'
    ],
    similarPYQ: ['GEO-CDS2-2021-05', 'GEO-UPSC-2020-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-03',
    slug: 'banihal-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Banihal Pass & Jawahar Tunnel',
    aliases: ['Banihal Qazigund Pass', 'Pir Panjal Gateway', 'Jawahar Tunnel'],
    placeType: 'Pir Panjal Range Mountain Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Jammu & Kashmir'
    },
    lat: 33.5167,
    lng: 75.195,
    elevation: '2,832 m',
    neighbours: [
      'Connects Jammu plains with Kashmir Valley (Qazigund)',
      'Crosses Pir Panjal Range',
      'Traversed by NH-44 and USBRL Railway'
    ],
    staticFacts: [
      'Cuts across the Pir Panjal Range at ~2,832 m, linking the Jammu division (Ramban) with the Kashmir Valley (Qazigund/Anantnag).',
      'Pierced by the historic 2.85 km Jawahar Tunnel (operational since 1956) and the modern 8.45 km twin-tube Banihal-Qazigund Road Tunnel (Navayuga Tunnel).',
      'Also traversed beneath by India\'s longest operational transportation railway tunnel: the 11.215 km Pir Panjal Railway Tunnel (T-80) on the Udhampur-Srinagar-Baramulla Rail Link (USBRL).',
      'Serves as the sole arterial all-weather ground link connecting the Kashmir Valley to the rest of India along NH-44.'
    ],
    similarPYQ: ['GEO-CDS2-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-04',
    slug: 'chang-la-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Chang La Pass',
    aliases: ['Changla', 'Pass towards the South', 'Pangong Tso Pass'],
    placeType: 'Ladakh Range Strategic High Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Ladakh (Leh District)'
    },
    lat: 34.0489,
    lng: 77.9306,
    elevation: '5,360 m',
    neighbours: [
      'Connects Indus Valley (Karu) with Tangtse and Pangong Tso Lake',
      'Crosses Ladakh Range to Changthang Plateau',
      'Near Spanggur Gap & Line of Actual Control'
    ],
    staticFacts: [
      'Crosses the Ladakh Range at ~5,360 m (17,590 ft), serving as the primary strategic vehicular gateway between Leh and Pangong Tso Lake.',
      'Main entry point to the high-altitude Changthang Plateau, home of the semi-nomadic Changpa pastoralists and Pashmina (Cashmere) goats.',
      'Hosts the world\'s highest terrestrial research station established by the Defence Institute of High Altitude Research (DIHAR, DRDO).',
      'Tested in UPSC CDS (2018) concerning passes linking Ladakh with Changthang and trans-Himalayan Tibetan plateau routes.'
    ],
    similarPYQ: ['GEO-CDS2-2018-03', 'GEO-CDS2-2021-05'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },

  // --- B. Himachal Pradesh ---
  {
    id: 'IND-PASS-05',
    slug: 'rohtang-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Rohtang Pass & Atal Tunnel',
    aliases: ['Rohtang La', 'Pile of Corpses Pass', 'Kullu Lahaul Pass'],
    placeType: 'Pir Panjal Watershed Mountain Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Himachal Pradesh (Kullu / Lahaul-Spiti)'
    },
    lat: 32.3716,
    lng: 77.2466,
    elevation: '3,978 m',
    neighbours: [
      'Connects Kullu Valley (Manali) with Lahaul and Spiti Valleys',
      'Divides Beas River basin from Chandra (Chenab) basin',
      'Pir Panjal Range'
    ],
    staticFacts: [
      'Located on the Pir Panjal Range at ~3,978 m, forming the vital hydrological and climatic divide between the lush Kullu Valley (Beas basin) and the arid, rain-shadow Lahaul-Spiti Valley (Chenab basin).',
      'Historically notorious for sudden blizzards and landslides, closing traffic for 5–6 months annually.',
      'Bypassed at ~3,000 m by the 9.02 km horseshoe-shaped Atal Tunnel (under the Rohtang ridge), the world\'s longest single-tube highway tunnel above 10,000 feet, providing all-weather access to Lahaul.',
      'Directly linked to the origin of the Beas River (Beas Kund is situated near the crest of Rohtang Pass).'
    ],
    similarPYQ: ['GEO-CDS2-2017-03', 'ENV-UPSC-2014-09'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-06',
    slug: 'bara-lacha-la-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Bara-lacha La Pass',
    aliases: ['Baralacha La', 'Pass with Crossroads on Summit', 'Lahaul-Ladakh Pass'],
    placeType: 'Zanskar Range High-Altitude Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Himachal Pradesh / Ladakh Border'
    },
    lat: 32.74,
    lng: 77.42,
    elevation: '4,890 m',
    neighbours: [
      'Connects Lahaul (HP) with Leh (Ladakh) on Manali-Leh Highway',
      'Situated on the Zanskar Range',
      'Source divide of Chandra, Bhaga, and Yunam rivers'
    ],
    staticFacts: [
      'Situated on the Zanskar Range at ~4,890 m on the Manali–Leh Highway, serving as the high mountain threshold between Himachal Pradesh and Ladakh.',
      'Functions as a spectacular radial hydrological divide: the Chandra river flows southeast from Chandratal, the Bhaga river flows southwest from Suraj Tal near the pass, and the Yunam river flows north into Zanskar.',
      'Chandra and Bhaga meet downstream at Tandi in Lahaul to form the Chandrabhaga / Chenab River (UPSC 2021).',
      'Suraj Tal (Sun Lake), India\'s third highest lake, sits just below the summit of Bara-lacha La.'
    ],
    similarPYQ: ['GEO-CDS2-2017-03', 'GEO-UPSC-2021-05'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-07',
    slug: 'shipki-la-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Shipki La Pass',
    aliases: ['Shipkila', 'Sutlej Gorge Pass', 'Kinnaur-Tibet Border Pass'],
    placeType: 'Zanskar Range International Border Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Himachal Pradesh (Kinnaur District)'
    },
    lat: 31.8125,
    lng: 78.7428,
    elevation: '3,930 m',
    neighbours: [
      'Connects Kinnaur (HP) with Ngari Prefecture (Tibet, China)',
      'Traversed by Sutlej River gorge',
      'Zanskar / Greater Himalayas'
    ],
    staticFacts: [
      'Located in Kinnaur district of Himachal Pradesh at ~3,930 m, forming an international border post between India and Tibet (China).',
      'Hydrological significance: It is precisely through this deep antecedent gorge at Shipki La that the trans-Himalayan Sutlej River cuts through the Himalayan crest line to enter India from Rakshastal / Mansarovar.',
      'Ancient branch of the Silk Road used for centuries for Indo-Tibetan trade; designated as an official border trade post alongside Lipulekh and Nathu La.',
      'Tested directly in CDS 2017 ("Match Shipki La with Himachal Pradesh").'
    ],
    similarPYQ: ['GEO-CDS2-2017-03', 'GEO-UPSC-2021-05'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },

  // --- C. Uttarakhand ---
  {
    id: 'IND-PASS-08',
    slug: 'lipulekh-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Lipulekh Pass',
    aliases: ['Lipu Lekh', 'Kailash Mansarovar Gateway', 'Tri-Junction Pass'],
    placeType: 'Greater Himalayan Strategic Tri-Junction Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Uttarakhand (Pithoragarh District)'
    },
    lat: 30.24,
    lng: 81.04,
    elevation: '5,200 m',
    neighbours: [
      'Tri-junction of India (Uttarakhand), Tibet (China), and Nepal',
      'Overlooks Kalapani and source of Mahakali (Sharda) river',
      'Byas Valley / Dharchula'
    ],
    staticFacts: [
      'Perched on the Greater Himalayas at ~5,200 m in Pithoragarh district, Uttarakhand, near the geopolitical tri-junction of India, China (Tibet), and Nepal.',
      'Traditional high-altitude route for the Ministry of External Affairs-conducted Kailash Mansarovar Yatra pilgrimage into Western Tibet.',
      'First border trade post opened between India and China post-1962 (opened in 1992 for local border trade).',
      'Center of geopolitical focus due to Nepal\'s territorial claims over the Kalapani-Limpiyadhura-Lipulekh tract following India\'s opening of the 80 km Dharchula-Lipulekh road.'
    ],
    similarPYQ: ['GEO-CDS2-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-09',
    slug: 'mana-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Mana Pass (Dungri La)',
    aliases: ['Mana La', 'Dungri La', 'Chirbitya', 'Badrinath Border Pass'],
    placeType: 'Greater Himalayan High Border Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Uttarakhand (Chamoli District)'
    },
    lat: 31.0667,
    lng: 79.4167,
    elevation: '5,608 m',
    neighbours: [
      'Connects Uttarakhand (Chamoli) with Guge Kingdom / Tibet',
      'North of Mana village ("First Indian Village") and Badrinath',
      'Greater Himalayan Crest'
    ],
    staticFacts: [
      'Situated on the border between Uttarakhand and Tibet at an elevation of ~5,608 m (18,400 ft) inside Nanda Devi Biosphere Reserve.',
      'Lies just 24 km north of the sacred shrine of Badrinath and the border village of Mana (designated as India\'s "First Village").',
      'Deotal Lake (at 5,471 m near the pass) is the mythological and hydrological source of the Saraswati River, which rushes past Bhim Pul in Mana before joining the Alaknanda at Keshav Prayag.',
      'Traversed by one of the world\'s highest military motorable roads constructed by the Border Roads Organisation (Project SHIVALIK).'
    ],
    similarPYQ: ['GEO-CDS2-2017-03', 'GEO-UPSC-2019-04'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-10',
    slug: 'niti-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Niti Pass',
    aliases: ['Niti La', 'Dhauliganga Head Pass', 'Chamoli-Tibet Pass'],
    placeType: 'Greater Himalayan Border Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Uttarakhand (Chamoli District)'
    },
    lat: 30.9667,
    lng: 79.8667,
    elevation: '5,070 m',
    neighbours: [
      'Connects Garhwal (Niti Valley) with Tibet',
      'Headwaters of Dhauliganga River',
      'Nanda Devi Biosphere Northern Rim'
    ],
    staticFacts: [
      'Located at ~5,070 m at the northern extremity of Chamoli district, Uttarakhand, linking the Niti valley of Garhwal with the Tibetan plateau.',
      'Source catchment of the Dhauliganga River, which flows south through Malari and Tapovan to join the Alaknanda at Vishnuprayag.',
      'Historically traversed by the trans-humant Bhotia traders carrying salt, borax, and wool between India and Tibet before the 1962 conflict.',
      'Forms the northern boundary of the Nanda Devi National Park buffer zone.'
    ],
    similarPYQ: ['GEO-CDS2-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },

  // --- D. Sikkim & Arunachal Pradesh ---
  {
    id: 'IND-PASS-11',
    slug: 'nathu-la-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Nathu La Pass',
    aliases: ['Nathula', 'Listening Ears Pass', 'Old Silk Route Pass', 'Sikkim-Tibet Pass'],
    placeType: 'Dongkya Range Strategic Trade Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Sikkim (East Sikkim District)'
    },
    lat: 27.3864,
    lng: 88.8311,
    elevation: '4,310 m',
    neighbours: [
      'Connects Gangtok (Sikkim) with Yadong in Chumbi Valley (Tibet)',
      'Dongkya Range of Greater Himalayas',
      'Near Tsomgo (Changu) Lake and Baba Mandir'
    ],
    staticFacts: [
      'Located on the Indo-China border in East Sikkim at ~4,310 m, connecting Sikkim with Tibet\'s Chumbi Valley.',
      'Key branch of the historic Old Silk Route; accounted for the bulk of bilateral trade until sealed during the 1962 war; famously reopened in 2006 for border trade.',
      'Strategic importance: Overlooks the vulnerable Siliguri Corridor ("Chicken\'s Neck"); lies in close operational proximity to the Doklam plateau tri-junction.',
      'Repeatedly tested in UPSC CSE & CDS (CDS 2017: Match Nathu La with Sikkim; UPSC 2017: Doklam and Chumbi valley context).'
    ],
    similarPYQ: ['GEO-CDS2-2017-03', 'GEO-UPSC-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-12',
    slug: 'jelep-la-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Jelep La Pass',
    aliases: ['Jelepla', 'The Lovely Level Pass', 'Kalimpong-Lhasa Pass'],
    placeType: 'Eastern Himalayan Mountain Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Sikkim / West Bengal Border'
    },
    lat: 27.36,
    lng: 88.88,
    elevation: '4,267 m',
    neighbours: [
      'Connects Sikkim / Kalimpong with Chumbi Valley (Tibet)',
      'South of Nathu La',
      'Catchment of Menmecho Lake and Rangpo Chu'
    ],
    staticFacts: [
      'Situated at ~4,267 m on the ridge between East Sikkim and Kalimpong, providing direct access into the Chumbi Valley of Tibet.',
      'Unlike rugged Nathu La, Jelep La has a gentler gradient and was historically the preferred caravan route connecting Kalimpong (Bengal) to Lhasa.',
      'Route used by Colonel Francis Younghusband\'s British military expedition to Lhasa in 1904.',
      'Fed by Menmecho Lake; the headwaters of the Rangpo Chu (tributary of Teesta) drain from the slopes below Jelep La.'
    ],
    similarPYQ: ['GEO-CDS2-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-13',
    slug: 'bomdi-la-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Bomdi La Pass',
    aliases: ['Bomdila', 'Gateway to Tawang', 'Kameng Pass'],
    placeType: 'Lesser Himalayan Strategic Gateway Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Arunachal Pradesh (West Kameng District)'
    },
    lat: 27.27,
    lng: 92.42,
    elevation: '2,530 m',
    neighbours: [
      'Connects Tezpur / Brahmaputra Valley (Assam) with Tawang and Tibet border',
      'Overlooks Kameng River basin',
      'Lesser Himalayas'
    ],
    staticFacts: [
      'Situated at ~2,530 m in West Kameng district of Arunachal Pradesh, serving as the strategic gateway connecting the Assam plains with Tawang on the Tibetan border.',
      'Controls the main military axis leading north through Sela Pass (~4,170 m, site of the modern Sela Tunnel) to the historic Tawang Monastery.',
      'Crucial strategic sector that witnessed fierce battles during the 1962 Sino-Indian War when Chinese troops advanced up to the Bomdila ridge.',
      'Divides the drainage of tributaries feeding the Kameng (Jia Bhareli) River in the Brahmaputra system.'
    ],
    similarPYQ: ['GEO-CDS2-2017-03', 'GEO-UPSC-2016-04'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-14',
    slug: 'diphu-pass',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Diphu Pass',
    aliases: ['Diphupass', 'India-China-Myanmar Tri-Junction Pass'],
    placeType: 'Mishmi Hills Strategic Tri-Junction Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Arunachal Pradesh (Anjaw District)'
    },
    lat: 28.1644,
    lng: 97.4128,
    elevation: '4,587 m',
    neighbours: [
      'Tri-junction of India (Arunachal Pradesh), China (Tibet), and Myanmar (Kachin State)',
      'Mishmi Hills / Patkai transition',
      'Headwaters of Lohit River basin'
    ],
    staticFacts: [
      'Located on the MacMahon Line in the Mishmi Hills at ~4,587 m, precisely at the strategic tri-junction border of India (Arunachal Pradesh), China (Tibet), and Myanmar.',
      'Provides a strategic high-altitude mountain gateway between eastern Arunachal Pradesh and northern Myanmar (Kachin State).',
      'Critical defense monitoring node for the Lohit River valley approach (where the Lohit flows into Assam past Kibithu and Walong).',
      'Tested in UPSC geography mapping concerning international boundaries and strategic tri-junction points of Northeast India.'
    ],
    similarPYQ: ['GEO-UPSC-2014-06', 'GEO-CDS2-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },

  // --- E. Western Ghats Gaps (Peninsular India) ---
  {
    id: 'IND-PASS-15',
    slug: 'thal-ghat-kasara',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Thal Ghat (Kasara Ghat)',
    aliases: ['Thalgat', 'Kasara Ghat', 'Mumbai-Nashik Pass', 'Igatpuri Pass'],
    placeType: 'Northern Western Ghats Mountain Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Maharashtra (Thane / Nashik Districts)'
    },
    lat: 19.6975,
    lng: 73.4917,
    elevation: '585 m',
    neighbours: [
      'Connects Mumbai (Konkan coastal lowland) with Nashik and Deccan Plateau',
      'Crosses Sahyadri / Western Ghats escarpment',
      'Traversed by NH-3 (Mumbai-Agra) and Central Railway'
    ],
    staticFacts: [
      'Located on the Sahyadri range (Western Ghats) at ~585 m, serving as the prime mountain pass connecting Mumbai and the Konkan coast to the Deccan Plateau and northern India (Nashik, Dhule, Indore, Agra).',
      'Traversed by National Highway 3 (Mumbai-Agra Highway) and the steep Kasara-Igatpuri railway section of Central Railway.',
      'The railway incline is one of the steepest in India (1 in 37 gradient), requiring special banker locomotives to push trains up the ghat from Kasara to Igatpuri.',
      'Directly tested in CDS (2019) regarding mountain passes of the Western Ghats and transport corridors of Peninsular India.'
    ],
    similarPYQ: ['GEO-CDS1-2019-05', 'GEO-CDS2-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-16',
    slug: 'bhor-ghat-khandala',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Bhor Ghat (Khandala Ghat)',
    aliases: ['Bhorghat', 'Khandala Ghat', 'Mumbai-Pune Pass', 'Palasdari Incline'],
    placeType: 'Northern Western Ghats Mountain Pass',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Maharashtra (Raigad / Pune Districts)'
    },
    lat: 18.7833,
    lng: 73.3417,
    elevation: '610 m',
    neighbours: [
      'Connects Mumbai (Palasdari / Khopoli) with Pune (Khandala / Lonavala)',
      'Crosses Sahyadri / Western Ghats',
      'Traversed by Mumbai-Pune Expressway and NH-48'
    ],
    staticFacts: [
      'Situated on the Sahyadri range at ~610 m, connecting the Konkan coastal ports (Mumbai) with the Deccan Plateau heartland (Pune, Bengaluru, Chennai).',
      'Traversed by the 6-lane Mumbai-Pune Expressway, National Highway 48, and the historic Great Indian Peninsula Railway (GIPR) incline constructed in 1863.',
      'Historically strategic gateway guarded by ancient forts like Rajmachi and Lohagad; site of the 1781 Battle of Bhor Ghat during the First Anglo-Maratha War.',
      'Receives heavy orographic rainfall exceeding 4,000 mm during the Southwest Monsoon, giving rise to torrential waterfalls feeding the Ulhas and Amba rivers.'
    ],
    similarPYQ: ['GEO-CDS1-2019-05', 'GEO-CDS2-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-17',
    slug: 'palghat-gap-palakkad',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Palghat Gap (Palakkad Gap)',
    aliases: ['Palakkad Gap', 'Nilgiri-Annamalai Discontinuity', 'Coimbatore-Kerala Gap'],
    placeType: 'Major Western Ghats Structural Discontinuity & Corridor',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Kerala (Palakkad) / Tamil Nadu (Coimbatore)'
    },
    lat: 10.7867,
    lng: 76.6547,
    elevation: '140 m',
    neighbours: [
      'Lies between Nilgiri Hills to the North and Annamalai Hills to the South',
      'Connects Coimbatore (Tamil Nadu) with Palakkad and Kochi (Kerala)',
      'Traversed by NH-544 and Southern Railway corridor'
    ],
    staticFacts: [
      'A prominent ~30 km wide structural geological shear zone (discontinuity) interrupting the otherwise continuous Western Ghats at a low elevation of only ~140 m.',
      'Geographic position: Situated strictly between the Nilgiri Hills to the north and the Annamalai Hills to the south (UPSC recurring trap).',
      'Climatic significance: Acts as a gigantic funnel allowing the moisture-laden Southwest Monsoon winds to penetrate into the interior rain-shadow plains of western Tamil Nadu (Coimbatore/Tiruppur).',
      'Major historic trade and military corridor linking the Malabar coast with the Coromandel plains, traversed by National Highway 544 and the main Southern Railway trunk line.'
    ],
    similarPYQ: ['GEO-UPSC-2017-02', 'GEO-CDS1-2019-05', 'GEO-CDS2-2017-03'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  },
  {
    id: 'IND-PASS-18',
    slug: 'shencottah-gap-aryankavu',
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – relief, hills, coasts & islands'],
    place: 'Shencottah Gap (Aryankavu Pass)',
    aliases: ['Sengottai Gap', 'Aryankavu Pass', 'Cardamom-Agasthyamalai Gap', 'Kollam-Madurai Gap'],
    placeType: 'Southern Western Ghats Mountain Gap',
    priority: 'High',
    locatedIn: {
      country: 'India',
      stateOrProvince: 'Kerala (Kollam) / Tamil Nadu (Tenkasi)'
    },
    lat: 8.9833,
    lng: 77.25,
    elevation: '160 m',
    neighbours: [
      'Lies between Cardamom Hills to the North and Agasthyamalai Hills to the South',
      'Connects Tenkasi, Tirunelveli, and Madurai (TN) with Kollam and Thiruvananthapuram (Kerala)',
      'Traversed by NH-744 and historic metre-to-broad gauge railway'
    ],
    staticFacts: [
      'A natural structural gap across the southern crest of the Western Ghats at ~160 m elevation.',
      'Geographic position: Separates the Cardamom Hills to the north from the Agasthyamalai Hills to the south.',
      'Vital transport lifeline connecting southern Tamil Nadu (Madurai, Tirunelveli, Tenkasi) with south Kerala (Punalur, Kollam, Thiruvananthapuram) via NH-744.',
      'Traversed by the historic Kollam-Sengottai railway line (commissioned in 1904 by the Travancore state and British South Indian Railway, famous for the 13-arch 100-year-old masonry viaduct at Kazhuthurutti).'
    ],
    similarPYQ: ['GEO-UPSC-2017-02', 'GEO-CDS1-2019-05'],
    linkedIssueSlug: 'himalaya-mountain-passes-northern-plains',
    linkedIssueTitle: 'Himalaya, Mountain Passes & Northern Plains',
    linkedIssueDomain: 'GEOGRAPHY'
  }
];

// Ingest Panch Prayag: insert right after ganga-river (IND-RIV-01)
const gangaIdx = CURATED_MAPPING_NODES.findIndex(n => n.id === 'IND-RIV-01');

let stage1Nodes;
if (gangaIdx !== -1) {
  stage1Nodes = [
    ...CURATED_MAPPING_NODES.slice(0, gangaIdx + 1),
    ...panchPrayagNodes,
    ...CURATED_MAPPING_NODES.slice(gangaIdx + 1)
  ];
} else {
  stage1Nodes = [...CURATED_MAPPING_NODES, ...panchPrayagNodes];
}

// Remove old bundled pass node IND-REL-07 ('himalayan-strategic-mountain-passes')
const finalNodes = [];
for (const node of stage1Nodes) {
  if (node.id === 'IND-REL-07' || node.slug === 'himalayan-strategic-mountain-passes') {
    // Replace with 18 discrete mountain pass and gap nodes
    finalNodes.push(...mountainPassNodes);
  } else {
    finalNodes.push(node);
  }
}

const fileHeader = `/**\n * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.\n * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)\n * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.\n */\n\nexport const CURATED_MAPPING_NODES = `;

fs.writeFileSync(
  'src/lib/static-mapping-data.js',
  fileHeader + JSON.stringify(finalNodes, null, 2) + ';\n'
);

console.log('Successfully ingested 5 Panch Prayag nodes and 18 Discrete Mountain Pass / Gap nodes!');
console.log('Replaced legacy bundled IND-REL-07.');
console.log('Total nodes now in static-mapping-data.js:', finalNodes.length);
