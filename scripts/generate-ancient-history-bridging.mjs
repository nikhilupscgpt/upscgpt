import fs from 'fs';
import path from 'path';

const bridgingData = {
  subject: 'Ancient History',
  nodes: [],
  newNodesToCreate: [
    // -------------------------------------------------------------------------
    // TOPIC 1: Prehistory & Indus Valley Civilisation (Syllabus Order: 1)
    // -------------------------------------------------------------------------
    {
      title: 'Paleolithic, Mesolithic & Neolithic Ages in India',
      module: 'Prehistory & Early Civilisations',
      topic: 'Prehistory & Indus Valley Civilisation',
      syllabusOrder: 1,
      nodeType: 'STATIC',
      prelimsNote: [
        'Paleolithic Age (Old Stone Age, 2 mya - 10,000 BCE): Pleistocene ice age; hunter-gatherer economy; tools made of quartzite ("Quartzite Men"); Lower Paleolithic (handaxes, cleavers; Sohan valley, Attirampakkam near Chennai), Middle Paleolithic (flake tools; Nevasa, Belan valley), Upper Paleolithic (blade and burin tools; Kurnool caves with bone tools, Renigunta).',
        'Mesolithic Age (Late Stone Age, 10,000 - 6,000 BCE): Holocene post-glacial warming; introduction of Microliths (tiny geometric flint/chert stone tools 1-5 cm fitted into wood/bone handles); earliest animal domestication evidenced at Adamgarh (MP) and Bagor (Rajasthan); human burials with burial goods at Sarai Nahar Rai and Mahadaha (UP); rock paintings at Bhimbetka (Vindhyas, MP).',
        'Neolithic Age (New Stone Age, 6,000 - 1,000 BCE): Neolithic Revolution characterized by polished/ground celts, settled village farming, pottery (cord-impressed ware), and domestication of plants/animals; Mehrgarh (Baluchistan, earliest evidence of wheat/barley cultivation ~7000 BCE), Burzahom and Gufkral (Kashmir: pit dwellings, dog burials with master, bone tools), Koldihwa (Belan valley, earliest evidence of rice ~6000 BCE), Chirand (Bihar: antler/bone tools), Daojali Hading (Assam: jadeite stone tools).',
        'Chalcolithic Cultures (Copper-Stone Age): Ahar-Banas (Rajasthan: copper smelting), Malwa culture (Kayatha, Navdatoli: richest Chalcolithic painted pottery), Jorwe culture (Inamgaon, Daimabad in Maharashtra: bronze rhinoceros/chariot, large mud houses).'
      ]
    },
    {
      title: 'Indus Valley Civilisation — Urban Planning, Architecture & Trade',
      module: 'Prehistory & Early Civilisations',
      topic: 'Prehistory & Indus Valley Civilisation',
      syllabusOrder: 1,
      nodeType: 'STATIC',
      prelimsNote: [
        'Urban Planning & Grid Pattern: Harappan cities laid out on rectangular grid (streets intersecting at right angles); standardized burnt bricks in ratio 1:2:4; two-tier city division: Citadel / Acropolis on higher raised mud-brick platform (west) for public buildings and Lower Town (east) for residential quarters.',
        'Sanitation & Drainage System: world\'s first advanced underground drainage; household wastewater flowed through private chutes into covered street drains made of baked bricks with inspection traps and soak pits for desilting.',
        'Major Urban Structures: Great Bath at Mohenjo-daro (lined with gypsum mortar and bitumen waterproofing, flanked by verandas and changing rooms, used for ritual bathing), Great Granary at Mohenjo-daro and 6 granaries in citadel at Harappa (circular brick threshing floors), Dockyard at Lothal (tidal brick dock connected to Sabarmati/Bhogavo river with sluice gates).',
        'Craft Specialization & Factory Sites: Chanhudaro (bead-making factory without citadel, seal-carving, shell-working), Sukkur and Rohri hills (Sindh: vast stone quarries and factory sites for mass manufacturing flint/chert blades exported to Harappan cities), Balakot and Lothal (shell bangles and ivory objects).',
        'External Trade: maritime and overland trade with Mesopotamia (Akkadian records refer to Indus region as "Meluhha", Dilmun/Bahrain, and Makan/Oman); exports included carnelian beads, lapis lazuli, ivory, timber, cotton (called "Sindon" by Greeks); standard cubic chert weights based on binary (1, 2, 4, 8, 16, 32...) and decimal systems.'
      ]
    },
    {
      title: 'Harappan Society, Religion, Art, Inscriptions & Decline',
      module: 'Prehistory & Early Civilisations',
      topic: 'Prehistory & Indus Valley Civilisation',
      syllabusOrder: 1,
      nodeType: 'STATIC',
      prelimsNote: [
        'Social Structure & Agriculture: egalitarian urban society without evidence of standing army, monarchy, or palaces; first bronze-age civilisation in South Asia; grew wheat, barley, sesamum, mustard, cotton; Kalibangan (Rajasthan: ploughed field surface with furrow marks), Banawali (Haryana: terracotta plough model).',
        'Religious Practices: no temples or monumental shrines; veneration of mother goddess terracotta figurines, Pashupati seal (proto-Shiva in yogic posture with horned headgear surrounded by elephant, tiger, rhino, buffalo, and two antelopes/deer at feet), phallic worship (linga and yoni stones), tree worship (pipal), and mythical unicorn bull; fire altars found at Kalibangan and Lothal.',
        'Burials & Mortuary Customs: extended inhumation (head to north), fractional burial, and post-cremation urn burials; Lothal had double burials (male and female in single grave); Harappa Cemetery R-37 and Cemetery H; coffin burial found at Harappa.',
        'Key Discoveries at Major Sites: Dholavira (Rann of Kutch, Gujarat: unique three-tier division - Citadel, Middle Town, Lower Town; giant stone water reservoirs; 10-character large signboard inscription), Rakhigarhi (Haryana: largest Harappan site in Indian territory, DNA study confirms indigenous continuity), Kot Diji (Sindh: pre-Harappan and mature Harappan levels, destroyed by fire).',
        'Decline theories: Mortuary/Aryan invasion theory (Wheeler) largely discredited; ecological degradation, shifting courses of rivers (Ghaggar-Hakra drying up), tectonic upheavals, and drying monsoons around 1900 BCE led to de-urbanization into Late Harappan rural phase.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 2: Vedic Age (Syllabus Order: 2)
    // -------------------------------------------------------------------------
    {
      title: 'Early Vedic (Rigvedic) Period — Society, Economy & Polity',
      module: 'Prehistory & Early Civilisations',
      topic: 'Vedic Age',
      syllabusOrder: 2,
      nodeType: 'STATIC',
      prelimsNote: [
        'Rigvedic Geography (Sapta Sindhu - Land of Seven Rivers): Sindhu (Indus), Vitasta (Jhelum), Asikni (Chenab), Parushni (Ravi - site of Dasharajna / Battle of Ten Kings where King Sudas defeated confederacy of 10 tribes), Vipas (Beas), Sutudri (Sutlej), and sacred river Saraswati (Naditama / best of rivers). Ganga mentioned only once, Yamuna thrice.',
        'Pastoral Economy & Wealth: predominantly pastoral semi-nomadic economy; cattle (Gau) was chief form of wealth; terms: Gavishti (search for cows / battle for cattle), Gopati (lord of cattle / tribal chief), Godhuma (wheat), Yava (barley), Duhitri (daughter / milker of cows), Aghanya (not to be killed / cow). Land was not private property.',
        'Tribal Polity & Popular Assemblies: Rajan was tribal chieftain (Gopa), not an absolute monarch; king guided and checked by tribal assemblies: 1) Sabha (council of elder tribal elites/nobles; women attended as Sabhavati), 2) Samiti (general folk assembly of the entire tribe), 3) Vidatha (earliest tribal assembly for religious and military distribution functions). Purohita, Senani, and Vrajapati were key officials.',
        'Social Structure & Women: patriarchal family (Kula) headed by Kulapa; egalitarian tribal society without rigid caste hierarchy; Varna originally referred to color/complexion; women enjoyed high status, underwent Upanayana (sacred thread ceremony), composed Vedic hymns (Gargi, Maitreyi, Apala, Lopamudra, Ghosha), and chose partners via Swayamvara; no child marriage or Sati; Niyoga (levirate) permitted.',
        'Rigvedic Religion: naturalistic polytheism and henotheism (worship of one god at a time); personification of nature: Indra (Purandara - breaker of forts, war god, 250 hymns), Agni (fire god, intermediary between man and gods, 200 hymns), Varuna (guardian of Rita - cosmic moral and physical order), Soma (god of plants/intoxicating beverage), Usha (goddess of dawn), Aditi (mother of gods); Rita and Dharma: Rita signifies cosmic and moral order sustaining the universe.'
      ]
    },
    {
      title: 'Later Vedic Period — State Formation, Varna Hierarchy & Upanishadic Philosophy',
      module: 'Prehistory & Early Civilisations',
      topic: 'Vedic Age',
      syllabusOrder: 2,
      nodeType: 'STATIC',
      prelimsNote: [
        'Geographical Shift & Material Culture: shift from Sapta Sindhu to Gangetic Doab (Aryavarta / Kuru-Panchala realm); Iron technology (Shyama Ayas / Krishna Ayas) introduced around 1000 BCE at Atranjikhera (UP); cleared dense monsoon forests, enabling settled agriculture; associated with Painted Grey Ware (PGW) pottery.',
        'Territorial State Formation & Kingship: tribal identity gave way to territorial Janapadas; Rajan evolved into hereditary monarch (Samrat, Virat, Bhoja); elaborate royal legitimization sacrifices: 1) Ashvamedha (horse sacrifice for imperial sovereignty), 2) Rajasuya (consecration ceremony conferring supreme power), 3) Vajapeya (chariot race where royal chariot won to re-establish king\'s vitality). Sabha and Samiti lost power, Vidatha disappeared.',
        'Institutionalization of Varna & Ashramas: 4-tier Varna system solidified based on birth (Purusha Sukta in 10th Mandala of Rigveda: Brahmins from mouth, Kshatriyas from arms, Vaishyas from thighs, Shudras from feet); Dvija (twice-born: first 3 varnas entitled to Upanayana); untouchability emerged; 4 Ashramas codified in Jabala Upanishad: Brahmacharya, Grihastha, Vanaprastha, Sannyasa; decline in women\'s status (excluded from assemblies and education).',
        'Vedic Literature Corpus: 1) 4 Vedas (Rigveda, Samaveda - music/chants, Yajurveda - sacrificial rituals, Atharvaveda - charms and magical spells), 2) Brahmanas (prose commentaries on rituals), 3) Aranyakas (forest books / philosophical meditations), 4) Upanishads (Vedanta - end of Vedas, 108 texts; enquiry into Brahman / ultimate reality and Atman / individual soul; Mundaka Upanishad gives national motto "Satyameva Jayate"; Chandogya Upanishad gives "Tat Tvam Asi").',
        'Six Orthodox Philosophical Schools (Shad Darshanas): 1) Samkhya (Kapila - dualism of Purusha and Prakriti), 2) Yoga (Patanjali - eightfold yogic path), 3) Nyaya (Gautama - logic and epistemology), 4) Vaisheshika (Kanada - atomism and physical science), 5) Mimamsa / Purva Mimamsa (Jaimini - Vedic ritual justification), 6) Vedanta / Uttara Mimamsa (Badarayana - Advaita / Upanishadic philosophy).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 3: Mahajanapadas & Mauryas (Syllabus Order: 3)
    // -------------------------------------------------------------------------
    {
      title: 'Second Urbanisation, 16 Mahajanapadas & Rise of Magadha',
      module: 'Heterodox Sects & Empires',
      topic: 'Mahajanapadas & Mauryas',
      syllabusOrder: 3,
      nodeType: 'STATIC',
      prelimsNote: [
        'Second Urbanisation (6th century BCE): emergence of iron ploughshare, Northern Black Polished Ware (NBPW) pottery, punch-marked silver coins (Puranas / Karshapanas), and walled cities in the middle Gangetic plains.',
        '16 Mahajanapadas (listed in Buddhist Anguttara Nikaya and Jaina Bhagavati Sutra): Kashi, Kosala, Anga, Magadha, Vajji, Malla, Chedi, Vatsa, Kuru, Panchala, Matsya, Surasena, Assaka (only Mahajanapada in South India / Godavari basin), Avanti, Gandhara, Kamboja.',
        'Monarchies vs Gana-Sanghas (Oligarchic Republics): Monarchies (hereditary king, standing army, centralized taxes: Magadha, Kosala, Vatsa, Avanti); Gana-Sanghas (rule by assembly of clan oligarchs, absence of standing army, collective decision-making in Santhagara: Vajji confederacy of Lichchhavis with capital at Vaishali, Mallas of Kusinara/Pava, Shakya of Kapilavastu).',
        'Factors behind Magadha\'s Imperial Hegemony: rich iron ore deposits in Chota Nagpur / Rajgir for weapons, fertile alluvial Gangetic soil yielding surplus land revenue (Bhaga / 1/6th), natural riverine highway network (Ganga, Son, Gandak) for military and commercial transport, use of war elephants in warfare for the first time, strategic capitals (Girivraja/Rajgir protected by five hills; Pataliputra as a river fortress / Jaladurga).',
        'Magadhan Dynasties: 1) Haryanka Dynasty (Bimbisara founded policy of dynastic marriages; Ajatashatru built Pataliputra fort and used Mahashilakantaka catapult and Rathamusala scythed chariot; Udayin shifted capital to Pataliputra), 2) Shishunaga Dynasty (annexed Avanti; Kalashoka hosted 2nd Buddhist Council), 3) Nanda Dynasty (Mahapadma Nanda - "Ekrat" and "Sarvakshatrantaka" exterminator of all Kshatriyas; Dhana Nanda possessed formidable army that deterred Alexander\'s soldiers from crossing the Beas in 326 BCE).'
      ]
    },
    {
      title: 'Mauryan Empire — Administration, Economy & Kautilyan Statecraft',
      module: 'Heterodox Sects & Empires',
      topic: 'Mahajanapadas & Mauryas',
      syllabusOrder: 3,
      nodeType: 'STATIC',
      prelimsNote: [
        'Establishment of Empire (322 BCE): Chandragupta Maurya with guidance of Chanakya (Kautilya / Vishnugupta) overthrew Nandas; defeated Seleucus I Nicator (305 BCE), gaining Arachosia (Kandahar), Gedrosia (Baluchistan), Paropamisadae (Kabul); Seleucus sent Greek ambassador Megasthenes to Pataliputra.',
        'Sources: Kautilya\'s Arthashastra (treatise on statecraft, Saptanga theory of state: Swami/king, Amatya/ministers, Janapada/territory & people, Durga/fort, Kosha/treasury, Danda/army, Mitra/ally), Megasthenes\' Indica (describes 7 castes in Indian society, municipality of Pataliputra administered by 6 committees of 5 members each, absence of slavery in India - misunderstanding Greek chattel slavery), and Ashoka\'s Edicts.',
        'Central Administration: King assisted by Mantriparishad; key dignitaries: Samaharta (chief collector of revenue), Sannidhata (chief custodian of treasury and storehouses), Senapati (commander-in-chief), Purohita (chief priest); network of spies (Gudhapurushas - Sanstha stationary spies, Sanchara wandering spies).',
        'Provincial & Local Administration: Empire divided into provinces ruled by Kumara / Aryaputra (royal princes): Uttarapatha (Taxila), Avantiratha (Ujjain), Dakshinapatha (Suvarnagiri), Prachya (Pataliputra), Kalinga (Tosali); local hierarchy: Janapada divided into Aharas / Vishayas headed by Pradeshika, assisted by Rajuka (surveying, judicial, and revenue powers) and Yukta (secretarial/accounting duties); Gopa and Sthanika managed rural units.',
        'Agrarian Economy & State Monopolies: Sitadhyaksha (superintendent of crown agricultural lands - Sita lands worked by slaves and prisoners); Pautavadhyaksha (weights and measures); Panyadhyaksha (trade); Navadhyaksha (ships/ports); Akaradhyaksha (mines); state owned all mines, forests, and liquor trade.'
      ]
    },
    {
      title: 'Ashoka the Great — Kalinga War, Dhamma, Inscriptions & Edicts',
      module: 'Heterodox Sects & Empires',
      topic: 'Mahajanapadas & Mauryas',
      syllabusOrder: 3,
      nodeType: 'STATIC',
      prelimsNote: [
        'Accession & Kalinga War: Ashoka ascended throne c. 268 BCE after 4-year succession struggle; fought Kalinga War in 8th regnal year (c. 261 BCE); 100,000 killed, 150,000 captured; remorse led to abandoning Bherighosha (war conquest) in favor of Dhammaghosha (conquest by righteousness); converted to Buddhism under guidance of monk Upagupta.',
        'Ashoka\'s Dhamma: not a religious dogma or sectarian cult, but an ethical code of moral conduct: Ahimsa (non-violence to all living beings), filial piety (respect to parents and teachers), tolerance towards all sects (Brahmins, Shramanas, Ajivikas), humane treatment of slaves and servants, charity, and public welfare (planting banyan trees, digging wells, building rest houses and veterinary hospitals). Created new cadre of officers: Dhamma Mahamattas in 14th regnal year.',
        'Ashokan Epigraphy & Scripts: first deciphered in 1837 by James Prinsep (founding father of Indian epigraphy); written in 4 scripts: Brahmi (pan-Indian, written left to right), Kharosthi (northwest / Shahbazgarhi and Mansehra, written right to left), Aramaic and Greek (Afghanistan / Kandahar bilingual inscription). Language was Prakrit (and Greek/Aramaic in west).',
        'Major Rock Edicts (MRE 1-14): MRE I (prohibition of animal sacrifice), MRE II (medical facilities for men and animals in Cholas, Pandyas, Satyaputra, Keralaputra, and Greek king Antiochus II), MRE XIII (describes horrors of Kalinga war and conquest of Dhamma over Greek kings: Antiochus, Ptolemy, Antigonus, Magas, Alexander), MRE XII (religious tolerance and mutual respect among sects: "whosoever praises his own sect or blames other sects hurts his own sect most").',
        'Pillar Edicts & Minor Inscriptions: Rummindei Pillar Inscription (Lumbini, Nepal: records reduction of land revenue - Bhaga from 1/6th to 1/8th and waiver of Bali because Buddha was born here), Bhabru Edict (Ashoka explicitly proclaims faith in Buddha, Dhamma, and Sangha), Schism Edict (Sarnath, Kausambi, Sanchi: warns monks against creating divisions in Sangha).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 4: Buddhism & Jainism (Syllabus Order: 4)
    // -------------------------------------------------------------------------
    {
      title: 'Buddhism — Philosophy, Four Noble Truths, Eightfold Path & Canonical Literature',
      module: 'Heterodox Sects & Empires',
      topic: 'Buddhism & Jainism',
      syllabusOrder: 4,
      nodeType: 'STATIC',
      prelimsNote: [
        'Life of Gautama Buddha: born as Siddhartha in Shakya clan at Lumbini (Kapilavastu, Nepal) c. 563 BCE; Four Great Sights: old man, sick man, dead body, ascetic; Mahabhinishkramana (Great Renunciation at age 29); attained Enlightenment (Bodhi) under Pipal tree at Bodh Gaya (Bihar); delivered first sermon (Dharmachakra Pravartana) at Deer Park in Sarnath; Mahaparinirvana at age 80 at Kusinara (UP).',
        'Core Philosophical Doctrines: 1) Four Noble Truths (Chatvari Arya Satyani): Dukkha (world is full of suffering), Dukkha Samudaya (craving/Tanha is cause of suffering), Dukkha Nirodha (suffering can be ceased), Dukkha Nirodha Gamini Pratipada (path leading to cessation of suffering); 2) Noble Eightfold Path (Ashtangika Marga: Right View, Resolve, Speech, Action, Livelihood, Effort, Mindfulness, Samadhi / Concentration); 3) Pratityasamutpada (Dependent Origination - Twelve Nidanas: nothing exists independently, all phenomena arise depending on causes).',
        'Key Concepts: Anatta / Anatman (doctrine of non-self / no permanent immortal soul), Anicca / Anitya (impermanence of all conditioned things), Nirvana (extinction of flames of greed, hatred, and delusion; liberation from cycle of rebirths), Madhyama Marga (Middle Path between extreme asceticism and sensual indulgence). Rejects infallibility of Vedas and ritual animal sacrifices.',
        'Buddhist Canonical Literature (Tripitaka in Pali): 1) Vinaya Pitaka (monastic discipline and rules for Bhikkhus and Bhikkhunis, composed by Upali), 2) Sutta Pitaka (discourses and teachings of Buddha, composed by Ananda; includes Digha Nikaya, Majjhima Nikaya, Samyutta Nikaya, Anguttara Nikaya, Khuddaka Nikaya containing Dhammapada and Jataka tales), 3) Abhidhamma Pitaka (philosophical and psychological analysis, codified at 3rd Council, includes Kathavatthu).',
        'Non-canonical texts: Milinda-panha (dialogues between Indo-Greek King Menander and Buddhist sage Nagasena), Visuddhimagga (by Buddhaghosa, Theravada encyclopedia), Divyavadana and Mahavastu (Sanskrit texts).'
      ]
    },
    {
      title: 'Buddhist Councils, Sects (Theravada, Mahayana, Vajrayana) & Bodhisattvas',
      module: 'Heterodox Sects & Empires',
      topic: 'Buddhism & Jainism',
      syllabusOrder: 4,
      nodeType: 'STATIC',
      prelimsNote: [
        'Four Buddhist Councils: 1st Council (483 BCE, Saptaparni cave, Rajgriha, under king Ajatashatru, chaired by Mahakassapa; compiled Vinaya and Sutta Pitakas); 2nd Council (383 BCE, Vaishali, under Kalashoka, chaired by Sabakami; first schism into Sthaviravadins and Mahasanghikas); 3rd Council (250 BCE, Pataliputra, under Ashoka, chaired by Moggaliputta Tissa; established Theravada orthodoxy, compiled Abhidhamma Pitaka, sent missionaries abroad); 4th Council (72 CE, Kundalvana, Kashmir, under Kushana king Kanishka, chaired by Vasumitra and Ashvaghosha; definitive schism into Hinayana and Mahayana; compiled Mahavibhasha commentaries).',
        'Hinayana / Theravada vs Mahayana: Hinayana (Doctrine of Elders; uses Pali; Buddha as human teacher who attained Nirvana; individual salvation through monastic discipline; Arhat ideal; no idol worship; practiced in Sri Lanka, Myanmar, Thailand); Mahayana (Great Vehicle; uses Sanskrit; Buddha deified as transcendent saviour god; idol worship, stupas, mantras; Bodhisattva ideal - vows to delay own Nirvana to liberate all sentient beings; practiced in China, Japan, Tibet, Korea).',
        'Key Bodhisattvas: Avalokiteshvara (Padmapani - embodiment of compassion; lotus in hand), Manjushri (embodiment of transcendent wisdom; sword of wisdom and Prajnaparamita manuscript), Maitreya (future Buddha currently waiting in Tushita heaven), Vajrapani (holds thunderbolt / protector against ignorance), Kshitigarbha (guardian of purgatories/hells), Tara (female saviour).',
        'Vajrayana / Tantric Buddhism (emerged 7th-8th century CE in Bengal/Bihar under Palas): esoteric Buddhism emphasizing Dharanis, Mantras, Mandalas, Mudras, and dynamic female consorts (Dakinis); central deities: Dhyani Buddhas (Vairochana, Akshobhya, Amitabha); Vikramashila and Nalanda universities were major Tantric learning centers.',
        'Sub-sects: Lokottaravada and Sarvastivada (all things exist in past, present, and future); Dhanyakataka (modern Dharanikota / Amaravati on Krishna river in AP) was a prominent centre of Mahasanghikas and birthplace of early Mahayana/Kalachakra teachings.'
      ]
    },
    {
      title: 'Jainism — Tirthankaras, Doctrines, Epistemology & Sects',
      module: 'Heterodox Sects & Empires',
      topic: 'Buddhism & Jainism',
      syllabusOrder: 4,
      nodeType: 'STATIC',
      prelimsNote: [
        'Tirthankaras: 24 Ford-makers / spiritual conquerors; 1st: Rishabhanatha (Adinatha, bull emblem, mentioned in Rigveda along with 22nd Arishtanemi); 23rd: Parshvanatha (snake emblem, prince of Varanasi; introduced 4 vows: Ahimsa, Satya, Asteya, Aparigraha); 24th: Vardhamana Mahavira (lion emblem, born at Kundagrama near Vaishali to Jnatrika clan king Siddhartha and Lichchhavi princess Trishala; attained Kaivalya / supreme knowledge at age 42 under Sal tree on bank of Rijupalika river; died / attained Nirvana at Pavapuri at age 72). Added 5th vow: Brahmacharya.',
        'Core Metaphysics & Ethics: Universe is uncreated and eternal (no creator god); matter divided into Jiva (living soul possessing consciousness) and Ajiva (non-living matter, space, time, motion); Karma is subtle physical matter (pudgala) that flows into soul (Asrava), binds it (Bandha), stopped through penance (Samvara), and purged completely (Nirjara) to achieve Kaivalya / Moksha.',
        'Three Jewels of Jainism (Triratna): 1) Samyak Darshana (Right Faith), 2) Samyak Jnana (Right Knowledge), 3) Samyak Charitra (Right Conduct). Conduct governed by 5 Mahavratas (for monks) and Anuvratas (for laypersons: Ahimsa / non-violence pushed to extreme, including covering mouth with Muhpatti, filtering water, avoiding root vegetables/night eating). Sallekhana / Santhara: voluntary holy fast unto death.',
        'Epistemology: Anekantavada (doctrine of metaphysical manifoldness / multi-sidedness of reality: truth has infinite aspects) and Syadvada (doctrine of conditional / relativistic predication: all judgments are relative, qualified by "Syat" / in some ways; seven-fold predication - Saptabhangi Naya). Four Gatis (realms of rebirth): Deva (celestial), Manushya (human), Tiryancha (animal/plant), Naraki (hellish beings).',
        'Schism & Councils: Great famine in Magadha (c. 300 BCE) led Bhadrabahu and Chandragupta Maurya to migrate to Shravanabelagola (Karnataka); Sthalabahu stayed in Magadha. Schism resulted in: 1) Digambaras (Sky-clad / naked monks; reject women\'s salvation in current birth; reject 12 Angas canon; say Mahavira never married), 2) Svetambaras (White-clad monks; accept women\'s liberation - consider 19th Tirthankara Mallinatha as female; accept canon). 1st Jaina Council held at Pataliputra (c. 300 BCE under Sthalabahu); 2nd Council held at Vallabhi (512 CE, Gujarat, under Devardhi Kshamasramana; codified Jaina canonical texts in Ardhamagadhi Prakrit: 12 Angas, 12 Upangas, Chedasutras).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 5: Post-Mauryan & Sangam Age (Syllabus Order: 5)
    // -------------------------------------------------------------------------
    {
      title: 'Post-Mauryan Dynasties — Shungas, Indo-Greeks, Sakas & Kushanas',
      module: 'Heterodox Sects & Empires',
      topic: 'Post-Mauryan & Sangam Age',
      syllabusOrder: 5,
      nodeType: 'STATIC',
      prelimsNote: [
        'Political Fragmentation & Foreign Incursions: Mauryan collapse led to regional indigenous powers (Shungas, Kanvas, Satavahanas) and Central Asian invaders through northwestern passes (Indo-Greeks, Sakas/Scythians, Parthians/Pahlavas, Kushanas).',
        'Shunga & Kanva Dynasties: Pushyamitra Shunga (Mauryan commander-in-chief) assassinated last Mauryan ruler Brihadratha in 185 BCE; revived Vedic sacrifices (performed two Ashvamedhas commemorated in Ayodhya inscription of Dhanadeva); patronized Patanjali (grammarian who wrote Mahabhashya); rebuilt Bharhut stupa railing and gateway; succeeded by Kanva dynasty founded by Vasudeva.',
        'Indo-Greeks (Bactrian Greeks): first to issue gold coins in India with bilingual legends and portraits of rulers; first to attribute coins to individual kings; introduced Hellenistic art (Gandhara school); most celebrated king was Menander (Milinda, ruled from Sakala/Sialkot; converted to Buddhism by Nagasena, recorded in Milinda-panha).',
        'Sakas (Western Kshatrapas): ruled Gujarat, Malwa, and northern Maharashtra; famous king Rudradaman I (c. 130-150 CE) issued first long, chaste Sanskrit inscription on Junagarh rock (records repairing of Sudarshana lake built originally by Chandragupta Maurya\'s governor Pushyagupta and Ashoka\'s governor Tushaspha without levying taxes).',
        'Kushana Empire: branch of Yuezhi nomadic tribe from Central Asia; founded by Kujula Kadphises; Wima Kadphises issued first large-scale Kushan gold coins with Shiva and Nandi motifs; pinnacle under Kanishka I (accession 78 CE marked start of Saka Era used by Govt of India; capital at Purushapura/Peshawar and Mathura; built giant stupa at Shah-ji-ki-Dheri; Rabatak inscription confirms genealogy; patronized Ashvaghosha, Vasumitra, Charaka, Nagarjuna; controlled Silk Route connecting China, Rome, and India).'
      ]
    },
    {
      title: 'The Satavahana Dynasty & Western Deccan Polities',
      module: 'Heterodox Sects & Empires',
      topic: 'Post-Mauryan & Sangam Age',
      syllabusOrder: 5,
      nodeType: 'STATIC',
      prelimsNote: [
        'Satavahanas (Andhras of Puranas): established by Simuka (1st century BCE) in Deccan / Godavari basin with capital at Pratishthana (modern Paithan, Maharashtra) and later Amaravati / Dharanikota (AP).',
        'Gautamiputra Satakarni (c. 106-130 CE): greatest Satavahana monarch; titled "Ekabrahmana" (peerless Brahmin) and "Trisamudra-toya-pita-vahana" (whose horses drank water of three oceans); defeated Western Kshatrapa ruler Nahapana and overstruck his silver coins (Jogalthambi hoard); restored Varna order; his mother Gautami Balashri issued famous Nasik Cave Prasasti.',
        'Distinctive Administrative & Social Features: 1) Matronymics: kings prefixed mother\'s names (Gautamiputra, Vashishtiputra, Yajna Sri) though succession was strictly patrilineal; 2) First royal land grants (Brahmadeya and Agrahara) to Buddhist monks and Brahmins with fiscal and administrative exemptions (Pariharas), initiating Indian feudalism; 3) Issued lead, potin, copper, and bronze coins; ship-motif coins of Yajna Sri Satakarni demonstrate naval trade across Bay of Bengal.',
        'Cultural & Literary Achievements: Hala (17th Satavahana king) composed Gathasaptashati (romantic lyrical anthology of 700 verses in Maharashtri Prakrit); excavated rock-cut Chaityas and Viharas at Karle (largest rock-cut Chaitya hall), Bhaja, Bedsa, Nasik, and Kanheri; patronized Amaravati stupa (marble narrative reliefs).'
      ]
    },
    {
      title: 'Sangam Age — Literature, Society, Economy & Polity in Early Tamilakam',
      module: 'Heterodox Sects & Empires',
      topic: 'Post-Mauryan & Sangam Age',
      syllabusOrder: 5,
      nodeType: 'STATIC',
      prelimsNote: [
        'The Three Sangams (Academies of Tamil poets patronized by Pandya kings at Madurai): 1st Sangam (Old Madurai - attended by gods, no texts survived), 2nd Sangam (Kapatapuram - only Tolkappiyam survived), 3rd Sangam (Modern Madurai - all extant Sangam literature compiled here under Nakkeerar).',
        'Sangam Literary Corpus: 1) Tolkappiyam (by Tolkappiyar: earliest Tamil grammar, poetics, and social norms; classifies poetry into Akam / interior-love and Puram / exterior-war/ethics), 2) Ettuthogai (Eight Anthologies: Aingurunuru, Akananuru, Purananuru, Narrinai, Kurunthogai, Kalithogai, Paripadal, Patirruppattu), 3) Pattupattu (Ten Idylls: includes Tirumurugarruppadai, Porunararruppadai, Maduraikkanji), 4) Post-Sangam Epics: Silappadikaram (by Ilango Adigal: story of Kovalan, Kannagi and Madhavi; establishes Pattini cult / chaste wife worship), Manimekalai (by Shattanar: Buddhist philosophical sequel).',
        'Three Crowned Kings (Muventar) & Chieftains: Cheras (emblem: Bow; Vanji/Karur; ports: Muziris and Tondi; famous king Senguttuvan / Red Chera introduced Kannagi worship); Cholas (emblem: Tiger; Uraiyur/Poompuhar; famous king Karikala built Kallanai dam / Grand Anicut on river Kaveri); Pandyas (emblem: Carp/Fish; Madurai; Korkai pearl fishery; famous king Nedunjeliyan). Seven minor philanthropic chieftains (Velir / Kadai Ezhu Vallalgal: Pari, Ori, Kari, Began, Ay, Adiyaman, Nalli).',
        'Tinai Landscape Concept: Five ecological zones based on landscape and psychological moods: 1) Kurinji (hills/forests - hunting/honey collection - Murugan), 2) Mullai (pastoral scrubland - cattle rearing - Mayon/Vishnu), 3) Marudam (fertile agricultural river valleys - paddy farming - Vendan/Indra), 4) Neithal (coastal tract - fishing/salt manufacturing - Varunan), 5) Palai (arid/desert wasteland - raiding/waylaying - Kotravai/Kali).',
        'Social customs & Overseas Commerce: Vattakirutal (practice of defeated king committing ritual suicide by fasting facing north, joined by companions); active trade with Roman Empire (evidenced by Sangam texts and Periplus of the Erythraean Sea; Roman gold/silver coins hoards at Arikamedu and Coimbatore; exports: black pepper - called "Yavanapriya", pearls, beryl, tortoiseshell, fine muslin; Araghatta / Persian wheel used for irrigation).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 6: Guptas & Post-Guptas (Syllabus Order: 6)
    // -------------------------------------------------------------------------
    {
      title: 'Gupta Empire — Political Expansion, Administration & Agrarian Economy',
      module: 'Heterodox Sects & Empires',
      topic: 'Guptas & Post-Guptas',
      syllabusOrder: 6,
      nodeType: 'STATIC',
      prelimsNote: [
        'Dynastic Origin & Imperial Rulers: founded by Sri Gupta; Chandragupta I (c. 319-320 CE: assumed title Maharajadhiraja, started Gupta Era, married Lichchhavi princess Kumaradevi; issued Chandragupta-Kumaradevi gold coins).',
        'Samudragupta (c. 335-375 CE, "Indian Napoleon" - V.A. Smith): Prayag Prashasti (Allahabad Pillar Inscription composed in refined classical Sanskrit Champu style by court poet Harishena); details 4-stage conquest policy: 1) Aryavarta (northern kings violently uprooted - Prasabhoddharana), 2) Dakshinapatha (12 southern kings captured and released after submission - Grahan-Moksh-Anugraha), 3) Atavika states (forest kingdoms made vassals - Paricharikrita), 4) Pratyanta & foreign rulers (frontier kingdoms like Samatata, Davaka, Kamarupa, Nepal, Daivaputra-Shahi-Shahanushahi paid tribute - Sarvakaradana-Agyakarana). Performed Ashvamedha; issued Lyrist-type gold coins.',
        'Chandragupta II Vikramaditya (c. 375-415 CE): conquered Western Kshatrapas of Malwa/Gujarat, securing western seaports (Barygaza/Bharuch, Cambay); established secondary capital at Ujjain; matrimonial alliance with Vakatakas (married daughter Prabhavatigupta to Rudrasena II); Chinese Buddhist monk Fa-Hien (Faxian) visited during his reign (noted peace, mild punishments, vegetarianism, absence of death penalty, but presence of untouchables / Chandalas living outside towns and striking wooden clappers).',
        'Gupta Administration & Decentralization: Empire divided into Bhuktis (provinces) governed by Uparikas; Bhuktis divided into Vishayas (districts) governed by Vishayapatis, assisted by District Advisory Council (Adhisthana) comprising Nagarasreshthi (chief merchant), Sarthavaha (chief caravan trader), Prathamakulika (chief artisan), and Prathamakayastha (chief scribe); emergence of Kayastha caste (record-keepers).',
        'Agrarian Terminology & Exploitation: Kulyavapa, Dronavapa, Nivartana, and Pataka were units of land measurement; Vishti was forced, unpaid labor demanded by state from peasants (viewed as a regular source of state revenue / tax); proliferation of land grants (Brahmadeya) created landed intermediaries; ports of Ghantasala, Kadura, and Chaul handled eastern and western maritime trade.'
      ]
    },
    {
      title: 'Gupta Classical Golden Age — Art, Literature, Sciences & Epigraphy',
      module: 'Heterodox Sects & Empires',
      topic: 'Guptas & Post-Guptas',
      syllabusOrder: 6,
      nodeType: 'STATIC',
      prelimsNote: [
        'Scientific Breakthroughs: 1) Aryabhata (wrote Aryabhatiya and Surya Siddhanta in 499 CE: formulated place-value decimal system and zero; accurately calculated value of Pi to 3.1416; explained solar/lunar eclipses by shadows; stated Earth is spherical and rotates on its axis), 2) Varahamihira (wrote Brihat Samhita - encyclopedia of astronomy/meteorology, Panchasiddhantika, and Brihat Jataka), 3) Brahmagupta (Brahmasphutasiddhanta: treated zero as a number with arithmetic rules; anticipated gravity - "all things fall to earth by law of nature"), 4) Medicine: Vagbhata composed Ashtangahridaya and Ashtangasangraha; Navanitakam was famous medical handbook.',
        'Literature & Drama: Kalidasa (Kavya: Raghuvamsha, Kumarasambhava, Meghaduta, Ritusamhara; Nataka: Abhijnanashakuntalam, Malavikagnimitram, Vikramorvashiyam), Vishakhadatta (Mudrarakshasa - story of Chanakya\'s diplomacy against Nandas; Devichandraguptam), Shudraka (Mrichchhakatika / Little Clay Cart - realistic urban drama of Charudatta and courtesan Vasantasena), Bhasa (Svapnavasavadatta), Harishena (Prayag Prashasti), Amarasimha (Amarakosha - Sanskrit thesaurus).',
        'Visual & Temple Arts: Sarnath School of sculpture produced iconic seated Dharmachakra Pravartana Buddha in Chunar sandstone; Sultanganj Bronze Buddha (7.5 feet high, lost-wax casting, now in Birmingham Museum); structural stone temples: Dashavatara Temple at Deogarh (Jhansi, earliest Panchayatana layout with Shikhara), Bhitargaon brick temple (Kanpur); iron pillar at Mehrauli (Delhi: rust-resistant metallurgy dedicated to King Chandra / Chandragupta II).',
        'Decline of Guptas: White Huna invasions (Toramana and Mihirakula) weakened imperial treasury; rise of feudatories (Maukharis of Kannauj, Maitrakas of Vallabhi, Pushyabhutis of Thanesar, Yashodharman of Malwa); internal succession disputes.'
      ]
    },
    {
      title: 'Harshavardhana, Hiuen Tsang & Regional Powers (Chalukyas, Pallavas)',
      module: 'Heterodox Sects & Empires',
      topic: 'Guptas & Post-Guptas',
      syllabusOrder: 6,
      nodeType: 'STATIC',
      prelimsNote: [
        'Harshavardhana (reigned 606-647 CE): Pushyabhuti / Vardhana dynasty of Thanesar; united kingdoms of Thanesar and Kannauj after Maukhari king Grahavarman (brother-in-law) was killed by Shashanka of Gauda and Devagupta of Malwa; made Kannauj (Kanyakubja) his capital; authored 3 Sanskrit plays: Ratnavali, Priyadarsika, Nagananda; court poet Banabhatta wrote Harsha-Charita and Kadambari.',
        'Hiuen Tsang (Xuanzang / "Prince of Pilgrims"): visited India (629-645 CE) during Harsha\'s reign; studied at Nalanda Mahavihara under Abbot Shilabhadra; recorded observations in "Si-Yu-Ki" (Records of Western World); noted decline of Buddhism in core areas, rise of Prayag and Varanasi, presence of dacoits (robbed twice), Harsha\'s state assemblies, and caste subdivisions; Harsha convened Kannauj Religious Assembly (to honor Xuanzang and Mahayana doctrines) and quinquennial Prayag Mahamoksha Parishad (distributed imperial wealth to all religious orders).',
        'Battle of Narmada (c. 618-619 CE): Harsha attempted to expand into Deccan but was decisively defeated on banks of river Narmada by Chalukyan monarch Pulakeshin II; recorded in celebrated Aihole Inscription (Karnataka, composed in Sanskrit by court poet Ravikirti).',
        'Chalukyas of Badami (Vatapi): founded by Pulakeshin I; reached zenith under Pulakeshin II (assumed title "Parameshvara"; received Persian embassy from Khusrau II; defeated Harsha and Pallava king Mahendravarman I, but later killed by Pallava Narasimhavarman I "Vatapikonda" in 642 CE); rock-cut cave temples at Badami and structural temples at Aihole ("cradle of Indian temple architecture") and Pattadakal (UNESCO World Heritage: Virupaksha temple built by queen Lokamahadevi).',
        'Pallavas of Kanchi: established by Simhavishnu; Mahendravarman I (patron of rock-cut caves; wrote satirical farce Mattavilasa Prahasana; assumed titles Mattavilasa, Vichitrachitta, Gunabhara); Narasimhavarman I Mamalla (built monolithic Pancha Rathas and rock reliefs at Mamallapuram / Mahabalipuram; defeated Chalukyas); Shore Temple at Mamallapuram and Kailasanatha temple at Kanchipuram built by Rajasimha (Narasimhavarman II).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 7: Ancient History – General (Syllabus Order: 7)
    // -------------------------------------------------------------------------
    {
      title: 'Ancient Indian Guilds (Shrenis), Trade Routes & Maritime Ports',
      module: 'General & Survey',
      topic: 'Ancient History – General',
      syllabusOrder: 7,
      nodeType: 'STATIC',
      prelimsNote: [
        'Guild System (Shrenis / Pugas / Nigamas): autonomous corporations of artisans, merchants, and craftsmen; played pivotal economic and judicial roles; formulated internal customary laws (Shrenidharma) recognized by king and civil law; headed by Jetthaka / Pramukha; maintained private armed militias (Shrenibala) for cargo protection; functioned as commercial banks (accepted deposits, paid regular interest, invested endowment funds for religious charities). Mandasor Inscription records silk weavers\' guild migrating from Lata (Gujarat) to Malwa and building sun temple.',
        'Major Ancient Trade Routes: 1) Uttarapatha (Northern Highway: linked Taxila in northwest across Punjab, Mathura, Kanyakubja, Prayag, Varanasi, Pataliputra to Tamralipti in Bengal; continued to Central Asia through Silk Road), 2) Dakshinapatha (Southern Highway: ran south from Varanasi and Ujjain across Narmada to Pratishthana, Amaravati, and southern ports).',
        'Prominent Seaports of Ancient India: Western Coast: Barygaza (Bharuch/Broach, Gujarat - principal export hub to Roman Empire), Barbaricum (Indus delta), Suppara (Sopara near Mumbai), Calliena (Kalyan), Muziris (Cranganore/Kodungallur, Kerala - pepper trade center where Roman temple to Augustus stood), Naura (Cannanore); Eastern Coast: Tamralipti (Tamluk, West Bengal - gateway to Southeast Asia, Sri Lanka, China), Ghantasala and Kadura (Andhra coast), Korkai (Pandya pearl fishery), Poompuhar (Kaveripattinam, Chola port), Motupalli (flourished as major port under Kakatiyas, visited by Marco Polo).',
        'Indo-Roman Maritime Commerce: detailed in Greek logbook "Periplus of the Erythraean Sea" (written c. 1st century CE by anonymous Alexandrian Greek navigator); Roman naturalist Pliny the Elder in "Naturalis Historia" mourned that Rome was drained of 100 million sesterces annually to purchase Indian luxury goods (spices, silk, gems, peacocks).'
      ]
    },
    {
      title: 'Epigraphy, Numismatics, Land Grants & Feudal Institutions',
      module: 'General & Survey',
      topic: 'Ancient History – General',
      syllabusOrder: 7,
      nodeType: 'STATIC',
      prelimsNote: [
        'Evolution of Coinage (Numismatics): 1) Punch-Marked Coins (Puranas, Karshapanas, Dharanas: earliest metallic coinage c. 6th century BCE, made of silver/copper with irregular shapes, punched with 1-5 symbols like sun, hill, tree, peacock, elephant; un-inscribed; mentioned in Panini\'s Ashtadhyayi and Pali texts), 2) Cast Copper Coins, 3) Indo-Greek Coins (first to carry ruler portraits, names, bilingual inscriptions, and regular gold coins), 4) Kushana Coins (highest gold purity, influenced by Roman denarius, bearing Iranian, Greek, and Hindu deities), 5) Gupta Coins (superb artistic execution, Dinaras in gold, Rupaka in silver; Archer, Tiger-slayer, Lion-slayer, Lyrist types; debased purity under later Guptas).',
        'Epigraphic Landmarks: Harappan pictographic script (un-deciphered); Brahmi script (deciphered by James Prinsep in 1837); Sohgaura copper plate (Gorakhpur, UP) and Mahasthangarh inscription (Bogra, Bangladesh): earliest Mauryan inscriptions mentioning famine relief and state grain reserve storehouses; Hathigumpha Inscription (Udayagiri, Odisha: Prakrit inscription in Brahmi script recording 13 years of achievements of Chedi King Kharavela of Kalinga).',
        'Feudalization & Land Grants: emergence of Indian Feudalism (R.S. Sharma paradigm); transfer of fiscal rights (Udranga / water tax, Uparikara / incidental levies) and administrative rights (freedom from royal officials\' entry - Apravesha); conversion of communal village lands into private landed estates; subjection of peasants (Vishti / forced labor and tied serfdom); emergence of terms: Samanta (feudatory lord), Mahasamanta, Ranaka, Bhogi.',
        'Scientific Treatises: Sushruta Samhita (foundational surgery treatise: rhinoplasty, cataract surgery, 121 surgical instruments), Charaka Samhita (foundational internal medicine / Ayurveda: Tridosha theory - Vata, Pitta, Kapha), Kashyapa Samhita (pediatrics and gynecology).'
      ]
    }
  ]
};

const outputDir = path.resolve('./data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'ancient_history_node_bridging.json');
fs.writeFileSync(outputPath, JSON.stringify(bridgingData, null, 2), 'utf8');
console.log(`✅ Saved Ancient History bridging data to ${outputPath} (${bridgingData.newNodesToCreate.length} nodes)`);

// Also save to /Users/nikhilwandhe/Downloads/ancient_history_node_bridging.json
const downloadsPath = '/Users/nikhilwandhe/Downloads/ancient_history_node_bridging.json';
try {
  fs.writeFileSync(downloadsPath, JSON.stringify(bridgingData, null, 2), 'utf8');
  console.log(`✅ Copied Ancient History bridging data to ${downloadsPath}`);
} catch (e) {
  console.warn(`Could not write to downloads: ${e.message}`);
}
