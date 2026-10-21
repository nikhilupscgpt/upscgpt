import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('--- Exporting Art & Culture Architecture for Claude Bridging ---');

  // 1. Fetch all 19 existing nodes in INDIAN CULTURE
  const existingNodes = await prisma.issue.findMany({
    where: { OR: [{ domain: 'INDIAN CULTURE' }, { category: 'CULTURE' }] },
    select: {
      id: true,
      title: true,
      slug: true,
      topic: true,
      category: true,
      nodeType: true,
      orderIndex: true,
      prelimsNote: true,
    },
    orderBy: { orderIndex: 'asc' }
  });

  // 2. Fetch all Prelims PYQ topics and question counts
  const drafts = await prisma.questionDraft.findMany({
    where: { srcSubject: 'Art & Culture' },
    select: {
      id: true,
      questionNo: true,
      examName: true,
      examYear: true,
      srcTopic: true,
      stem: true,
    }
  });

  const topicMap = {};
  drafts.forEach(d => {
    if (!topicMap[d.srcTopic]) {
      topicMap[d.srcTopic] = { count: 0, sampleStems: [] };
    }
    topicMap[d.srcTopic].count++;
    if (topicMap[d.srcTopic].sampleStems.length < 3) {
      topicMap[d.srcTopic].sampleStems.push(`[${d.examName} ${d.examYear}] ${d.stem.slice(0, 100)}...`);
    }
  });

  // 3. Define the canonical Prelims syllabus sequence for Art & Culture
  const syllabusFlow = [
    {
      syllabusOrder: 1,
      module: 'Visual Arts',
      topic: 'Architecture & Sculpture',
      questionCount: topicMap['Architecture & Sculpture']?.count || 0,
      coreThemes: [
        'Prehistoric Rock Art (Bhimbetka, Lakhudiyar, Edakkal caves - themes, pigments, natural colours)',
        'Harappan Architecture & Sculptures (Citadel, Great Bath, Granary, Drainage system, Dancing Girl in bronze/lost-wax, Priest King in steatite, Pashupati seal)',
        'Mauryan Architecture (Ashokan Pillars / capitals - Lion Capital of Sarnath, Barabar Caves - Sudama & Lomas Rishi caves for Ajivikas, Sanchi Stupa structure - Anda, Harmika, Chhatra, Toranas)',
        'Post-Mauryan Sculpture Schools (Gandhara / Greco-Roman, grey schist vs Mathura / indigenous, spotted red sandstone vs Amaravati / white marble, narrative art)',
        'Cave Architecture (Chaityas vs Viharas, Ajanta 29 caves - Buddhist only, mural frescoes; Ellora 34 caves - Buddhist, Hindu, Jain, Kailasanatha monolith Cave 16; Elephanta, Badami, Udayagiri & Khandagiri)',
        'Temple Architecture Styles (Nagara / Rekha-deula, Pidha-deula, Khajuraho erotic sculptures & Panchayatana style, Sun Temple Modhera/Konark; Dravida / Vimana, Gopuram, Mandap, Water tank, Brihadeshwara Temple Thanjavur; Vesara / Hoysala star-shaped temples at Belur, Halebidu, Somnathapura, Chalukyan temples at Aihole/Pattadakal)',
        'Indo-Islamic Architecture (Arch, Dome, Minaret, Jali work, Arabesque, Pietra dura, Qutb Minar, Alai Darwaza, Tomb of Humayun, Fatehpur Sikri, Taj Mahal)'
      ]
    },
    {
      syllabusOrder: 2,
      module: 'Visual Arts',
      topic: 'Painting & Handicrafts',
      questionCount: topicMap['Painting & Handicrafts']?.count || 0,
      coreThemes: [
        'Mural Paintings of India (Ajanta, Ellora, Bagh, Sittanavasal, Lepakshi, Mattancherry palace)',
        'Miniature Painting Traditions (Pala & Jain / Western Indian school on palm leaf/paper; Mughal Miniatures / Persian influence, portraiture, naturalism - Mir Sayyid Ali, Abdus Samad, Mansur, Bishandas)',
        'Rajasthani Schools (Mewar, Kishangarh / Bani Thani by Nihal Chand, Bundi / Chitrashala, Kota hunting scenes)',
        'Pahari Schools (Basohli / bold colours, Kangra / lyrical, Radha-Krishna theme, Guler)',
        'Folk Paintings (Madhubani / Mithila in Bihar, Pattachitra in Odisha/Bengal, Warli in Maharashtra, Pithora in Gujarat/MP, Kalamkari in Andhra Pradesh, Phad in Rajasthan, Thangka in Ladakh/Sikkim)',
        'Handicrafts & GI Tagged Textiles (Pashmina, Chanderi, Maheshwari, Pochampally Ikat, Patola, Jamdani, Kanchipuram, Kasavu, Bidriware, Dhokra lost-wax bronze casting, Terracotta of Bankura/Gorakhpur)'
      ]
    },
    {
      syllabusOrder: 3,
      module: 'Thought & Literature',
      topic: 'Philosophy & Religion',
      questionCount: topicMap['Philosophy & Religion']?.count || 0,
      coreThemes: [
        'Six Orthodox Schools of Hindu Philosophy (Shad-Darshana: Samkhya / Kapila, Yoga / Patanjali, Nyaya / Gautama, Vaisheshika / Kanada, Purva Mimamsa / Jaimini, Uttara Mimamsa or Vedanta / Badarayana)',
        'Vedanta Sub-schools (Advaita / Adi Shankaracharya, Vishishtadvaita / Ramanujacharya, Dvaita / Madhvacharya, Shuddhadvaita / Vallabhacharya)',
        'Heterodox Schools (Charvaka or Lokayata / Materialism, Ajivika / Determinism or Niyati / Makkhali Gosala)',
        'Jainism (24 Tirthankaras - Rishabhanatha to Mahavira, Triratna, Five Vows - Ahimsa, Satya, Asteya, Brahmacharya, Aparigraha, Anekantavada & Syadvada, Digambara vs Svetambara, Jain Councils at Pataliputra and Vallabhi)',
        'Buddhism (Gautama Buddha life events & symbols, Four Noble Truths, Eightfold Path, Pratityasamutpada, Nirvana, Hinayana/Theravada vs Mahayana vs Vajrayana, Bodhisattvas - Avalokiteshvara/Padmapani, Maitreya/Future Buddha, Manjushri, Vajrapani, Buddhist Councils 1st to 4th)',
        'Bhakti Movement (Alvars / Vaishnava & Nayanars / Shaiva in Tamil Nadu; Saguna vs Nirguna Bhakti; Saints: Ramananda, Kabir, Guru Nanak, Mirabai, Chaitanya Mahaprabhu, Tulsidas, Surdas, Shankaradeva in Assam, Tukaram, Namdev, Eknath in Maharashtra)',
        'Sufism (Silsilas: Chisti / Khwaja Moinuddin Chisti, Nizamuddin Auliya, Suhrawardi, Qadiri, Naqshbandi; Concepts: Khanqah, Sama, Dargah, Wahdat-al-Wujud)'
      ]
    },
    {
      syllabusOrder: 4,
      module: 'Thought & Literature',
      topic: 'Literature & Languages',
      questionCount: topicMap['Literature & Languages']?.count || 0,
      coreThemes: [
        'Vedic Literature (4 Vedas - Rig, Sama, Yajur, Atharva; Brahmanas, Aranyakas, Upanishads / Vedanta; Vedangas - 6 limbs; Upavedas; Epics - Mahabharata & Ramayana; Puranas)',
        'Classical Sanskrit Literature (Kalidasa / Abhijnanasakuntalam, Meghaduta, Raghuvamsa; Bhasa / Svapnavasavadatta; Sudraka / Mrichhakatika; Visakhadatta / Mudrarakshasa, Devichandraguptam; Bhavabhuti / Uttararamacharita; Banabhatta / Harshacharita, Kadambari; Dandin / Dasakumaracharita; Bharavi / Kiratarjuniya; Harsha / Ratnavali, Priyadarsika, Nagananda)',
        'Scientific Treatises (Aryabhata / Aryabhatiya, Surya Siddhanta; Varahamihira / Brihat Samhita, Panchasiddhantika; Brahmagupta / Brahmasphutasiddhanta; Charaka / Charaka Samhita; Sushruta / Sushruta Samhita)',
        'Sangam Literature (3 Sangams in Madurai; Corpus: Tolkappiyam / grammar, Ettuthogai / 8 anthologies, Pattupattu / 10 idylls, Pathinenkilkanakku / Tirukkural by Tiruvalluvar; Tamil Epics: Silappadikaram by Ilango Adigal, Manimekalai by Sattanar)',
        'Classical Languages of India (Criteria: antiquity > 1500-2000 yrs, original literary tradition, distinct from modern; List: Tamil 2004, Sanskrit 2005, Telugu 2008, Kannada 2008, Malayalam 2013, Odia 2014, Marathi 2024, Pali 2024, Prakrit 2024, Assamese 2024, Bengali 2024)'
      ]
    },
    {
      syllabusOrder: 5,
      module: 'Performing & Living Culture',
      topic: 'Dance, Music, Theatre & Puppetry',
      questionCount: topicMap['Dance, Music, Theatre & Puppetry']?.count || 0,
      coreThemes: [
        'Classical Dances of India (8 recognized by Sangeet Natak Akademi: Bharatanatyam / Tamil Nadu, Kathak / UP, Kathakali / Kerala, Mohiniyattam / Kerala, Odissi / Odisha, Kuchipudi / Andhra Pradesh, Manipuri / Manipur, Sattriya / Assam by Shankaradeva; Natya Shastra by Bharata Muni, Abhinaya Darpana)',
        'Indian Classical Music (Hindustani: Dhrupad, Khayal, Tarana, Thumri, Ghazal; Gharanas - Gwalior, Agra, Kirana; Carnatic: Purandara Dasa father, Trinity of Carnatic Music - Tyagaraja, Muthuswami Dikshitar, Syama Sastri; Raga & Tala, Swaras)',
        'Musical Instruments Classification (Tata Vadya / Chordophones, Sushira Vadya / Aerophones, Avanaddha Vadya / Membranophones, Ghana Vadya / Idiophones)',
        'Traditional Folk Theatre (Bhavai / Gujarat, Nautanki / UP, Tamasha / Maharashtra, Yakshagana / Karnataka, Therukoothu / Tamil Nadu, Koodiyattam / Kerala, Bhand Pather / Kashmir, Swang / Haryana, Jatra / Bengal)',
        'Puppetry Forms (String: Kathputli / Rajasthan, Kundhei / Odisha, Gombeyatta / Karnataka, Bommalattam / Tamil Nadu; Shadow: Togalu Gombeyatta / Karnataka, Tholu Bommalata / AP, Ravanachhaya / Odisha; Rod: Putul Nach / Bengal, Yampuri / Bihar; Glove: Pavakoothu / Kerala)'
      ]
    },
    {
      syllabusOrder: 6,
      module: 'Performing & Living Culture',
      topic: 'Festivals, Martial Arts & Miscellaneous Culture',
      questionCount: topicMap['Festivals, Martial Arts & Miscellaneous Culture']?.count || 0,
      coreThemes: [
        'Traditional Festivals of India (Hornbill / Nagaland, Chapchar Kut / Mizoram, Bihu / Assam, Losar / Ladakh & Arunachal, Saga Dawa / Sikkim, Wangala / Meghalaya, Thrissur Pooram / Kerala, Onam / Kerala, Pongal / Tamil Nadu, Nuakhai / Odisha, Gangaur / Rajasthan, Khajuraho Dance Festival / MP)',
        'Traditional Martial Arts (Kalaripayattu / Kerala, Thang-Ta & Sarit Sarak / Manipur, Gatka / Punjab, Silambam / Tamil Nadu, Pari-Khanda / Bihar, Mardani Khel / Maharashtra, Musti Yuddha / Varanasi, Sqay / Kashmir)',
        'UNESCO Intangible Cultural Heritage from India (Ramlila, Vedic Chanting, Koodiyattam, Ramman / Uttarakhand, Mudiyettu / Kerala, Kalbelia dance / Rajasthan, Chhau dance / Bengal-Jharkhand-Odisha, Buddhist Chanting of Ladakh, Sankirtana of Manipur, Brass and Copper utensil making of Jandiala Guru / Punjab, Yoga, Nowruz, Kumbh Mela, Durga Puja of Kolkata, Garba of Gujarat)',
        'Indian Calendars (Saka Calendar / National Calendar adopted 1957, Chaitra 1 = March 22; Vikram Samvat 57 BCE; Hijri Calendar, Gregorian Calendar)',
        'UNESCO World Heritage Sites in India (Cultural, Natural & Mixed / Khangchendzonga, latest additions: Hoysala Temples 2023, Santiniketan 2023, Moidams of Ahom Dynasty 2024)'
      ]
    }
  ];

  const payload = {
    subject: 'Art & Culture',
    totalPrelimsQuestions: drafts.length,
    totalExistingNodesInDB: existingNodes.length,
    syllabusFlow,
    existingNodes: existingNodes.map(n => ({
      nodeId: n.id,
      title: n.title,
      slug: n.slug,
      topic: n.topic,
      nodeType: n.nodeType,
      orderIndex: n.orderIndex,
      hasPrelimsNote: Boolean(n.prelimsNote)
    }))
  };

  const localPath = path.resolve('./data/art_culture_nodes_architecture.json');
  fs.writeFileSync(localPath, JSON.stringify(payload, null, 2));

  const downloadPath = '/Users/nikhilwandhe/Downloads/art_culture_nodes_architecture.json';
  fs.writeFileSync(downloadPath, JSON.stringify(payload, null, 2));

  console.log(`✅ Saved Art & Culture architecture to:\n   - ${localPath}\n   - ${downloadPath}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
