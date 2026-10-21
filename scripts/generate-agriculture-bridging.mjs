import fs from 'fs';
import path from 'path';

const bridgingData = {
  subject: 'Agriculture',
  nodes: [
    // -------------------------------------------------------------------------
    // TOPIC 1: Soil, Fertilizers & Farming Practices (Syllabus Order: 1)
    // -------------------------------------------------------------------------
    {
      nodeId: 'cmopjvieu008vz3r0u34jgafo',
      title: 'Land Use Classification & Land Degradation in India',
      syllabusOrder: 1,
      topic: 'Soil, Fertilizers & Farming Practices',
      prelimsNote: [
        'Nine-fold land use classification in India: Forests, Land put to non-agricultural uses, Barren and unculturable waste, Permanent pastures and grazing lands, Miscellaneous tree crops and groves, Culturable wasteland, Current fallows (<1 year), Fallows other than current fallows (1-5 years), and Net Sown Area (~140 million hectares / ~43% of total geographical area).',
        'Desertification and Land Degradation Atlas of India (published by SAC/ISRO, Ahmedabad) reports ~29.7% of India\'s Total Geographical Area (TGA) underwent land degradation in 2018-19; water erosion is the largest contributor (~11%), followed by vegetation degradation and wind erosion (arid/Rajasthan).',
        'UNCCD (United Nations Convention to Combat Desertification) COP14 held in New Delhi (2019) adopted the "Delhi Declaration"; India committed to restoring 26 million hectares of degraded land by 2030 to achieve Land Degradation Neutrality (LDN target SDG 15.3).',
        'Soil salinity & waterlogging: predominant in canal-irrigated command areas of Punjab, Haryana, and Western UP due to excessive flood irrigation and poor drainage, capillary rise deposits sodium/calcium salts at root zone.'
      ]
    },
    {
      nodeId: 'cmopjvhej008rz3r0d97p3nbz',
      title: 'Sustainable Land Management & Soil Health',
      syllabusOrder: 1,
      topic: 'Soil, Fertilizers & Farming Practices',
      prelimsNote: [
        'Soil Health Card (SHC) scheme launched in 2015 (Suratgarh, Rajasthan; motto: "Swasth Dhara, Khet Hara"); assesses 12 soil health parameters: 3 Macro-nutrients (N, P, K), 3 Secondary nutrients (S, Ca, Mg - evaluated via S and soil reaction), 5 Micronutrients (Zn, Fe, Cu, Mn, B), and Physical parameters (pH, EC, Organic Carbon). Issued cyclically every 2 years.',
        'Soil Organic Carbon (SOC) in Indian agricultural soils is critically low (<0.5% against ideal >1-1.5%); intensive tillage, crop residue burning, and lack of organic manure deplete SOC rapidly, impairing microbial activity and water holding capacity.',
        'Conservation Agriculture (CA) rests on 3 core principles: 1) Minimum mechanical soil disturbance (zero-tillage / direct drilling), 2) Permanent soil organic cover (>30% residue retention on surface using Happy Seeder/Super Seeder), 3) Diversified crop species rotations.',
        'Biochar application: created by biomass pyrolysis under oxygen-limited conditions; enhances soil cation exchange capacity (CEC), retains soil moisture, serves as stable carbon sink for hundreds of years (carbon sequestration).'
      ]
    },
    {
      nodeId: 'cmopjvjn7009hz3r0x2doregr',
      title: 'Agricultural Subsidies — Fertiliser, Power, Irrigation & WTO Implications',
      syllabusOrder: 1,
      topic: 'Soil, Fertilizers & Farming Practices',
      prelimsNote: [
        'Fertiliser Subsidy in India: Urea is the only fertilizer under statutory price control (Maximum Retail Price set by Government; difference between cost of production and MRP paid to manufacturers as subsidy under New Urea Policy). Non-urea fertilizers (DAP, MOP, Complex) covered under Nutrient Based Subsidy (NBS) regime since 2010 (fixed subsidy per kg of N, P, K, S).',
        'Distorted NPK consumption ratio: Ideal consumption ratio is 4:2:1 (N:P:K); highly subsidised urea resulted in severe national distortion (as high as 8:3:1 in Punjab/Haryana), causing soil acidification, zinc deficiency, and groundwater nitrate pollution.',
        'Neem-Coated Urea (100% mandated since 2015): slow-release nitrification inhibitor that checks diversion to non-agricultural industries (chemical/resin), reduces leaching losses, and increases nitrogen use efficiency (NUE).',
        'Nano Urea (Liquid) and Nano DAP: developed indigenously by IFFCO; ultra-small particle size (20-50 nm) allows foliar spray uptake through stomata with >80% nutrient efficiency vs 30-40% for conventional granular urea; PM-PRANAM scheme launched to incentivise States promoting alternative non-chemical fertilizers.',
        'WTO Agreement on Agriculture (AoA) Boxes: Green Box (non-distorting support like R&D, extension, disaster relief - no limits); Blue Box (production-limiting direct subsidies); Amber Box (trade-distorting market price support/MSP + input subsidies - capped at 10% de minimis for developing nations); Bali Peace Clause (2013) grants temporary legal immunity against challenge if public stockholding food procurement exceeds de minimis.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 2: Major Crops (Syllabus Order: 2)
    // -------------------------------------------------------------------------
    {
      nodeId: 'cmopjvieu008xz3r0lbqu5x5x',
      title: 'GM Crops — Bt Cotton, Bt Brinjal Controversy & Regulatory Framework',
      syllabusOrder: 2,
      topic: 'Major Crops',
      prelimsNote: [
        'Genetic Engineering Appraisal Committee (GEAC): apex statutory body under the Ministry of Environment, Forest and Climate Change (MoEFCC) under the Environment (Protection) Act, 1986; approves proposals regarding field trials and commercial release of Genetically Modified (GM) crops.',
        'Bt Cotton: only GM crop legally approved for commercial cultivation in India (approved in 2002); incorporates Cry1Ac and Cry2Ab endotoxin genes from soil bacterium Bacillus thuringiensis to resist bollworm pest (Helicoverpa armigera); currently accounts for >90% of India\'s cotton area.',
        'Herbicide Tolerant Bt Cotton (Ht-Bt Cotton): incorporates CP4-EPSPS gene allowing tolerance against glyphosate; NOT officially approved in India, illegal cultivation attracts penal provisions under EPA 1986.',
        'DMH-11 (Dhara Mustard Hybrid-11): transgenic mustard developed by Centre for Genetic Manipulation of Crop Plants (CGMCP, Delhi University) using "barnase-barstar-bar" system from Bacillus amyloliquefaciens for male sterility and fertility restoration to produce high-yielding hybrids; recommended by GEAC in 2022.',
        'Bt Brinjal: approved by GEAC in 2009 for commercial release but put on indefinite moratorium in 2010 by the Ministry of Environment; commercialised in Bangladesh since 2013.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 3: Cropping Patterns & Systems (Syllabus Order: 3)
    // -------------------------------------------------------------------------
    {
      nodeId: 'cmopjvjh2009dz3r0z8eju6cr',
      title: 'Green Revolution — Impact, Second Green Revolution & Sustainability',
      syllabusOrder: 3,
      topic: 'Cropping Patterns & Systems',
      prelimsNote: [
        'Genesis of Green Revolution (mid-1960s): spearheaded by Dr. M.S. Swaminathan in India using semi-dwarf wheat varieties developed by Norman Borlaug at CIMMYT (Mexico) containing Norin-10 gene, and miracle rice IR-8 from IRRI (Philippines); transformed India from "ship-to-mouth" PL-480 food-aid dependency to national food self-sufficiency.',
        'Technological package: high-yielding varieties (HYV), assured canal/tubewell irrigation, synthetic chemical fertilizers (N-P-K), chemical pesticides, and agricultural credit/MSP safety nets.',
        'Ecological & Agronomic fallout: mono-cropping (Rice-Wheat cropping system in Indo-Gangetic Plains), depletion of deep aquifers, soil salinisation, loss of indigenous agro-biodiversity, and stubble burning air pollution in northern plains.',
        'Second Green Revolution / Evergreen Revolution: proposed by Swaminathan to achieve agricultural productivity gains in perpetuity without ecological harm; emphasis on Eastern India (BGREI - Bringing Green Revolution to Eastern India), rainfed/dryland farming, pulse and oilseed self-sufficiency, and climate-resilient agriculture (NICRA project by ICAR).'
      ]
    },
    {
      nodeId: 'cmopjvjgu009az3r091s8cfug',
      title: 'Animal Husbandry & Economics of Animal Rearing',
      syllabusOrder: 3,
      topic: 'Cropping Patterns & Systems',
      prelimsNote: [
        'Socio-economic footprint: Livestock sector contributes ~30% of Agricultural GVA and ~5% of national GDP; provides year-round counter-cyclical livelihood safety net to landless, small, and marginal agricultural households (who own >80% of national livestock).',
        '20th Livestock Census (2019): total livestock population is 535.78 million (4.6% increase over 2012); Uttar Pradesh has highest livestock population, followed by Rajasthan and MP; West Bengal has highest cattle population; total bovine population is ~302 million.',
        'Global rankings: India ranks 1st globally in milk production (~24% of global output; per capita milk availability >450 g/day), 1st in buffalo population, 2nd in goat population, 3rd in egg production, and 8th in meat production.',
        'Rashtriya Gokul Mission (RGM): launched for development and conservation of indigenous bovine breeds (Gir, Sahiwal, Red Sindhi, Tharparkar, Ongole), establishing Gokul Grams, and promotion of sex-sorted semen technology to produce >90% female calves.',
        'National Livestock Mission (NLM) & AHIDF (Animal Husbandry Infrastructure Development Fund): Rs 15,000 crore fund under Atmanirbhar Bharat package providing 3% interest subvention for establishing dairy/meat processing and animal feed plants.'
      ]
    },
    {
      nodeId: 'cmopjvjh2009cz3r0i0cwdjmp',
      title: 'White Revolution (Operation Flood) — Dairy Development',
      syllabusOrder: 3,
      topic: 'Cropping Patterns & Systems',
      prelimsNote: [
        'Operation Flood (launched in 1970 by National Dairy Development Board - NDDB led by Dr. Verghese Kurien): world\'s largest agricultural development program; replicated the "Anand Model" (AMUL) three-tier cooperative structure nationwide.',
        'Three-tier Dairy Cooperative structure: 1) Primary Village Dairy Cooperative Society (VDCS) at village level (milk collection and fat testing), 2) District Cooperative Milk Producers\' Union at district level (processing and transport), 3) State Cooperative Milk Marketing Federation at state level (marketing and branding).',
        'Indigenous buffalo milk breakthrough: Dr. H.M. Dalaya pioneered making skim milk powder and condensed milk from buffalo milk (which has high fat/protein content), previously deemed impossible by Western scientists who believed only cow milk could be dried.',
        'Dairy sector dynamics: cooperative societies handle ~10% of total milk produced, private dairies handle ~10%, and unorganized sector (local dudhiyas, direct consumption) handles ~80%; National Milk Day celebrated on November 26 (birth anniversary of Dr. Kurien).'
      ]
    },
    {
      nodeId: 'cmopjvjh4009ez3r042114hci',
      title: 'Blue Revolution — Fisheries Development & PMMSY',
      syllabusOrder: 3,
      topic: 'Cropping Patterns & Systems',
      prelimsNote: [
        'Status of Fisheries in India: India is the 3rd largest fish-producing nation and 2nd largest aquaculture producer globally; contributes ~1.1% of national GVA and >7% of agricultural GVA; marine fish production accounts for ~25% while inland/aquaculture accounts for ~75% of total production.',
        'Andhra Pradesh is the undisputed leader in total fish and inland fish production; Gujarat leads in marine fish production (longest coastline); India is among top seafood exporters (frozen shrimp is the largest export item, major destinations: USA, China, EU).',
        'Pradhan Mantri Matsya Sampada Yojana (PMMSY): umbrella flagship scheme (2020-21 to 2024-25, outlay ₹20,050 crore) under Department of Fisheries; targets fish production of 22 million metric tonnes by 2024-25 and doubling fisheries export earnings to ₹1,00,000 crore.',
        'Aquaculture techniques & sustainable technologies: Recirculating Aquaculture Systems (RAS - bio-filters clean and reuse 90%+ water), Biofloc technology (converts toxic ammonia/nitrogenous waste into microbial protein feed for fish), and Seaweed cultivation (promoted in coastal regions / Tamil Nadu SEZ for agar/alginate).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 4: Irrigation & Water Management (Syllabus Order: 4)
    // -------------------------------------------------------------------------
    {
      nodeId: 'cmopjviev008zz3r0r7e2w5zr',
      title: 'Irrigation Systems — Types, Efficiency & Pradhan Mantri Krishi Sinchayee Yojana',
      syllabusOrder: 4,
      topic: 'Irrigation & Water Management',
      prelimsNote: [
        'India\'s irrigation profile: Tubewells & Wells account for ~62-65% of net irrigated area; Canals account for ~24%; Tanks account for ~3-4% (concentrated in Peninsular/Deccan states like TN and AP); Net irrigated area is ~73 million hectares (~52% of net sown area).',
        'Groundwater crisis in Indian agriculture: India is the largest extractor of groundwater in the world (extracts ~25% of global groundwater, more than China and USA combined); >85% of extracted groundwater is used for irrigation; over-exploitation acute in Punjab, Haryana, Rajasthan, and Tamil Nadu.',
        'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY launched 2015): amalgamated 4 legacy schemes under 3 ministries: 1) Accelerated Irrigation Benefit Programme (AIBP - MoJS, focuses on major/medium dams and incomplete canals), 2) Har Khet Ko Pani (HKKP - MoJS, command area development, minor irrigation, water body rejuvenation), 3) Per Drop More Crop (PDMC - MoA&FW, micro-irrigation like drip and sprinkler), 4) Watershed Development (DoLR, rain-water harvesting, bunding).',
        'Water Use Efficiency (WUE): Surface canal irrigation WUE is abysmal (~30-35%); Drip irrigation achieves 85-90% WUE and sprinkler achieves 70-80% WUE; Fertigation (applying water-soluble fertilizers through drip lines) reduces nutrient leaching and saves 25-40% fertilizer.'
      ]
    },
    {
      nodeId: 'cmopjvieu008wz3r0x90yj3zi',
      title: 'E-Technology in Agriculture — Precision Farming, Drones & Agri-Tech',
      syllabusOrder: 4,
      topic: 'Irrigation & Water Management',
      prelimsNote: [
        'Sub-Mission on Agricultural Mechanization (SMAM): provides up to 100% financial assistance (or max ₹10 lakh) to ICAR institutions, KVKs, and SAUs for purchasing "Kisan Drones"; Farmer Producer Organizations (FPOs) receive 75% subsidy for drone demonstration on farmers\' fields.',
        'SOP for Drone Application in Agriculture (issued by Ministry of Agriculture): allows drone-based pesticide spraying, liquid fertilizer application (Nano Urea), and crop health remote-sensing using multispectral cameras; restricts spraying over water bodies, public roads, and residential areas.',
        'Agristack / India Digital Ecosystem of Agriculture (IDEA): building farmer-centric digital public infrastructure comprising 1) Farmer Registry (unique farmer ID linked to land records/Aadhaar), 2) Geo-referenced Village Maps, 3) Crop Sown Registry (real-time satellite/ground truthed data).',
        'Precision farming technologies: Variable Rate Technology (VRT), GPS-guided laser land leveling (saves 20-25% irrigation water and improves crop establishment), IoT soil moisture sensors, and Satellite Remote Sensing (RISAT/Sentinel radar for flood/drought damage assessment under PMFBY).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 5: Agriculture & Economy (Syllabus Order: 5)
    // -------------------------------------------------------------------------
    {
      nodeId: 'cmopjvieu008yz3r0ehdh0lfl',
      title: 'Land Reforms — Zamindari Abolition, Ceiling Laws & Tenancy Progress',
      syllabusOrder: 5,
      topic: 'Agriculture & Economy',
      prelimsNote: [
        'Phases of Land Reforms in Post-Independence India: 1) Abolition of Intermediaries (Zamindars, Jagirdars, Inamdars - highly successful, brought ~20 million cultivators into direct contact with State), 2) Tenancy Reforms (Regulation of rent, security of tenure, conferring ownership rights to tenants - mixed success), 3) Land Ceiling Acts (Fixing maximum landholding per family and redistributing surplus - largely evaded through benami transfers and judicial delays), 4) Consolidation of Landholdings (Chakbandi - successful in Punjab, Haryana, Western UP; failed elsewhere).',
        'Constitutional backing: 1st Constitutional Amendment Act, 1951 introduced Article 31B and Ninth Schedule to shield state land reform legislation from judicial review on grounds of fundamental rights violation (Article 14, 19, 31).',
        'Agricultural Census in India (conducted every 5 years by Ministry of Agriculture): 86.2% of total operational holdings are Small (<2 ha) and Marginal (<1 ha); average operational landholding size declined from 2.28 ha in 1970-71 to 1.08 ha in 2015-16; women operational landholders account for only ~14%.',
        'Bhoodan and Gramdan Movements (started 1951 at Pochampally, Telangana by Acharya Vinoba Bhave): voluntary land donation movement grounded in Sarvodaya; first land donation made by Vedre Ramachandra Reddy.'
      ]
    },
    {
      nodeId: 'cmopjvjnb009mz3r0caqtbqgv',
      title: 'Land Leasing — Model Land Leasing Law & Digital Land Records',
      syllabusOrder: 5,
      topic: 'Agriculture & Economy',
      prelimsNote: [
        'Informal & Concealed Tenancy: restrictive state tenancy laws made land leasing illegal or conferred adverse possession rights to tenants; caused landowners to leave land fallow or enter informal oral lease arrangements where tenant farmers cannot access institutional credit, crop insurance (PMFBY), or disaster relief.',
        'NITI Aayog Model Land Leasing Act, 2016 (drafted by T. Haque Committee): legalises land leasing without tenancy ownership rights transfer; guarantees automatic reversion of land to owner upon lease expiry; enables tenant farmers to access crop loans and compensation; removes ceiling limits on leased land.',
        'Digital India Land Records Modernization Programme (DILRMP, formerly NLRMP): centrally sponsored scheme under Department of Land Resources (Ministry of Rural Development); 3 pillars: 1) Computerization of land records (RoR - Record of Rights), 2) Survey/re-survey and digitisation of cadastral maps (BhuNaksha), 3) Integration of property registration offices with revenue records.',
        'ULPIN (Unique Land Parcel Identification Number - "Bhu-Aadhaar"): 14-digit alphanumeric identification code based on geo-coordinates of vertices of land parcel complying with ISO standards.',
        'SVAMITVA Scheme (Survey of Villages and Mapping with Improvised Technology in Village Areas): uses drones to map inhabited (Abadi) rural land parcels to issue formal Property Cards / "Gharauni" under Ministry of Panchayati Raj.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 6: Agricultural Pricing & Procurement (MSP) (Syllabus Order: 6)
    // -------------------------------------------------------------------------
    {
      nodeId: 'cmopjviev0091z3r05fo9l02n',
      title: 'Minimum Support Price (MSP) — Determination, CACP & Pricing Reforms',
      syllabusOrder: 6,
      topic: 'Agricultural Pricing & Procurement (MSP)',
      prelimsNote: [
        'CACP (Commission for Agricultural Costs and Prices): statutory advisory body under Ministry of Agriculture (origin: 1965 as Agricultural Prices Commission); recommends MSPs based on cost of production, demand-supply balance, domestic/international price trends, inter-crop price parity, and terms of trade between agricultural and non-agricultural sectors.',
        'Cabinet Committee on Economic Affairs (CCEA), chaired by Prime Minister, takes the final executive decision on MSP levels.',
        'Crops covered under MSP: 22 mandated crops (14 Kharif: Paddy, Jowar, Bajra, Maize, Ragi, Arhar/Tur, Moong, Urad, Groundnut, Soybean, Sunflower seed, Sesamum, Nigerseed, Cotton; 6 Rabi: Wheat, Barley, Gram, Masur/Lentil, Rapeseed & Mustard, Safflower; 2 Commercial crops: Jute, Copra) + Fair and Remunerative Price (FRP) for Sugarcane.',
        'CACP Cost Concepts: 1) A2: out-of-pocket paid-out expenses on seeds, fertilizers, pesticides, hired labor, fuel, irrigation; 2) A2+FL: A2 plus imputed value of unpaid Family Labor; 3) C2: comprehensive cost (A2+FL plus rental value of owned land and interest on owned fixed capital assets). Union Budget 2018-19 mandated fixing MSP at a minimum of 1.5 times the A2+FL cost of production.',
        'Sugarcane FRP: governed statutorily under Sugarcane (Control) Order, 1966 issued under Essential Commodities Act, 1955; mill owners legally bound to pay FRP directly to cane growers; states may declare higher State Advised Prices (SAP).'
      ]
    },
    {
      nodeId: 'cmopjvjh4009fz3r0x10iib5x',
      title: 'Buffer Stocks, Food Corporation of India & Open Market Sale Scheme',
      syllabusOrder: 6,
      topic: 'Agricultural Pricing & Procurement (MSP)',
      prelimsNote: [
        'Food Corporation of India (FCI): statutory body set up under Food Corporations Act, 1964; mandated to carry out 1) Price support operations for safeguarding farmer interests, 2) Public distribution of foodgrains through NFSA/TPDS, 3) Maintenance of operational and buffer stocks of foodgrains.',
        'Buffer Stocking Norms: Central government quarterly fixes buffer norms (Quarterly starting 1st April, 1st July, 1st October, 1st January) comprising "Operational Stocks" (for monthly PDS requirements) and "Strategic Reserves" (for emergencies/crop failure); highest buffer stock requirement is on 1st July (peak wheat procurement) at ~41 million metric tonnes.',
        'Economic Cost of Foodgrains: consists of 3 components: 1) Pooled cost of grain (MSP paid to farmers), 2) Procurement incidentals (mandi taxes, labor, gunny bags, arhatiya commission, handling), 3) Distribution cost (freight, storage losses, administrative overheads). Consumer Subsidy = Economic Cost minus Central Issue Price (CIP).',
        'Open Market Sale Scheme (OMSS): FCI offloads surplus wheat and rice from central pool into open domestic market via periodic e-auctions to bulk buyers (flour millers, traders) to cool down retail inflation during lean seasons.',
        'Shanta Kumar High-Level Committee on FCI Restructuring (2015): noted only ~6% of agricultural households sell to FCI (largely concentrated in Punjab, Haryana, AP, Chhattisgarh); recommended outsourcing procurement to decentralized states, reducing NFSA population coverage from 67% to 40%, and direct cash transfer of food subsidy.'
      ]
    },
    {
      nodeId: 'cmopjvifu0095z3r0lixts1tm',
      title: 'Public Distribution System — Targeted PDS, End-to-End Computerisation & Reforms',
      syllabusOrder: 6,
      topic: 'Agricultural Pricing & Procurement (MSP)',
      prelimsNote: [
        'Evolution of PDS: Universal PDS (until 1992) -> Revamped PDS (RPDS, 1992, in 1775 backward/tribal blocks) -> Targeted PDS (TPDS, 1997, divided beneficiaries into Below Poverty Line - BPL and Above Poverty Line - APL with dual pricing) -> National Food Security Act (NFSA, 2013, rights-based approach).',
        'End-to-End Computerization of TPDS Operations: 1) Digitization of ration card/beneficiary database, 2) Online allocation of foodgrains down to Fair Price Shops (FPS), 3) Supply Chain Management automation with GPS-tracking of food delivery trucks, 4) Installation of electronic Point of Sale (ePoS) devices with biometric Aadhaar authentication at Fair Price Shops (>99% FPS enabled).',
        'One Nation One Ration Card (ONORC): technology-driven national portability enabled by Integrated Management of Public Distribution System (IM-PDS) portal and Annavitran portal; allows migrant workers to collect entitled subsidized grains from ANY fair price shop across the country using existing ration card and biometric ePoS verification.',
        'PM Garib Kalyan Anna Yojana (PMGKAY): initially introduced as COVID-19 relief package; integrated with NFSA from January 2023 to provide free foodgrains (5 kg per person for Priority Households and 35 kg per family for Antyodaya households) with 100% central funding, waiving earlier CIP (₹3 rice, ₹2 wheat, ₹1 coarse grains).'
      ]
    },
    {
      nodeId: 'cmopjvjna009kz3r0uoklncxm',
      title: 'National Food Security Act (NFSA 2013) & Nutritional Security Framework',
      syllabusOrder: 6,
      topic: 'Agricultural Pricing & Procurement (MSP)',
      prelimsNote: [
        'Statutory Coverage: NFSA legally covers up to 75% of rural population and up to 50% of urban population (~67% of total national population based on 2011 Census, ~81.35 crore people).',
        'Two Beneficiary Categories: 1) Priority Households (PHH) entitled to 5 kg foodgrains per person per month, 2) Antyodaya Anna Yojana (AAY - poorest of the poor households identified by states) entitled to 35 kg foodgrains per household per month.',
        'Women Empowerment Provisions: Section 13 mandates that the eldest woman member of household aged 18 years or above shall be designated as the "Head of the Household" for issuing ration cards.',
        'Maternity Benefits & Nutritional Support: Section 4 entitles pregnant women and lactating mothers to free meals during pregnancy and 6 months after childbirth through Anganwadi centres, plus statutory maternity benefit of not less than ₹6,000 (operationalised via PM Matru Vandana Yojana). Children aged 6 months to 14 years entitled to age-appropriate meals under PM-POSHAN (Mid-Day Meal scheme).',
        'Food Security Allowance: if entitled foodgrains are not supplied due to non-availability, beneficiaries are legally entitled to receive cash Food Security Allowance from the State Government.'
      ]
    },
    {
      nodeId: 'cmopjvil60098z3r0itqoybnb',
      title: 'Zero Hunger — SDG-2, Biofortification & India\'s Nutrition Challenge',
      syllabusOrder: 6,
      topic: 'Agricultural Pricing & Procurement (MSP)',
      prelimsNote: [
        'Sustainable Development Goal 2 (SDG-2): "End hunger, achieve food security and improved nutrition and promote sustainable agriculture" by 2030.',
        'National Family Health Survey-5 (NFHS-5, 2019-21) data for children under 5: 35.5% Stunted (low height-for-age, indicator of chronic undernutrition), 19.3% Wasted (low weight-for-height, acute malnutrition), 32.1% Underweight; Anaemia prevalence alarmingly high: 67.1% among children (6-59 months) and 57.0% among women (15-49 years).',
        'Hidden Hunger (Micronutrient Malnutrition): deficiency of essential vitamins and minerals (iron, vitamin A, zinc, iodine) despite adequate caloric intake; addressed via Rice Fortification (blending Fortified Rice Kernels - FRK containing iron, folic acid, and vitamin B12 in 1:100 ratio into PDS and PM-POSHAN meals).',
        'Biofortification of crops: breeding crops with higher nutritional value through conventional breeding or agronomic practices (e.g., Madhuban Gajar - biofortified carrot rich in β-carotene/iron; CR Dhan 315 - zinc-rich rice; Pusa Mustard 30 - low erucic acid; Dhanashakti - high-iron pearl millet developed by ICRISAT).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 7: Agricultural Credit & Schemes (Syllabus Order: 7)
    // -------------------------------------------------------------------------
    {
      nodeId: 'cmopjvheh008qz3r0zfwziefc',
      title: 'Agricultural Finance — Institutional Sources, Priority Sector Lending & KCC',
      syllabusOrder: 7,
      topic: 'Agricultural Credit & Schemes',
      prelimsNote: [
        'Priority Sector Lending (PSL) norms for Agriculture: RBI mandates domestic Scheduled Commercial Banks to allocate 18% of Adjusted Net Bank Credit (ANBC) or Credit Equivalent of Off-Balance Sheet Exposure (CEOBE) to Agriculture; within agriculture, 10% sub-target is mandated for Small and Marginal Farmers (SMFs).',
        'Modified Interest Subvention Scheme (MISS): provides short-term crop loans up to ₹3 lakh at a subvention rate of 1.5% to lending institutions; base lending rate is 9%, subvented to 7%; additional 3% Prompt Repayment Incentive (PRI) reduces effective interest rate to just 4% per annum for farmers who repay on time.',
        'Kisan Credit Card (KCC) scheme (introduced in 1998 based on R.V. Gupta Committee recommendations): single-window credit facility covering short-term crop loans, post-harvest expenses, produce marketing loans, maintenance of farm assets, and consumption requirements; extended in 2019 to Animal Husbandry, Dairy, and Fisheries farmers (credit limit up to ₹2 lakh without land mortgaging).',
        'Collateral-free agricultural loans: RBI raised the ceiling for collateral-free agricultural loans from ₹1 lakh to ₹1.6 lakh to facilitate easy access for tenant and marginal farmers.'
      ]
    },
    {
      nodeId: 'cmopjviev0090z3r0v28qj0at',
      title: 'NABARD — Role, Functions & Rural Financial Architecture',
      syllabusOrder: 7,
      topic: 'Agricultural Credit & Schemes',
      prelimsNote: [
        'Establishment & Mandate: National Bank for Agriculture and Rural Development (NABARD) established on 12 July 1982 under the NABARD Act 1981, based on the recommendations of the B. Sivaraman Committee; 100% owned by the Government of India (RBI transferred its entire shareholding to GoI).',
        'Apex refinancing institution: does not provide retail credit directly to individual farmers; provides refinance to State Cooperative Banks, District Central Cooperative Banks (DCCBs), Regional Rural Banks (RRBs), and Scheduled Commercial Banks for rural credit disbursement.',
        'Rural Infrastructure Development Fund (RIDF): instituted in NABARD in 1995-96; financed out of the shortfall in Priority Sector Lending by domestic commercial banks; funds state governments to build rural roads, minor irrigation, soil conservation, and public health centres.',
        'SHG-Bank Linkage Project (launched by NABARD in 1992): world\'s largest microfinance initiative; enables informal Self-Help Groups (primarily rural women) to access collateral-free bank loans based on mutual peer guarantees and group savings.'
      ]
    },
    {
      nodeId: 'cmopjvjn9009iz3r02bzig4pt',
      title: 'Regional Rural Banks & Cooperative Credit Societies (PACS)',
      syllabusOrder: 7,
      topic: 'Agricultural Credit & Schemes',
      prelimsNote: [
        'Regional Rural Banks (RRBs): established under RRB Act, 1976 (first RRB was Prathama Bank, Moradabad, UP, sponsored by Syndicate Bank); equity shareholding pattern: Government of India (50%), Sponsor Bank (35%), and State Government (15%); mandated to allocate 75% of total outstanding advances to Priority Sector.',
        'Short-Term Cooperative Credit Structure (STCCS): 3-tier federal pyramid: 1) Primary Agricultural Credit Societies (PACS) at grassroot village level, 2) District Central Cooperative Banks (DCCBs) at intermediary district level, 3) State Cooperative Banks (StCBs) at apex state level.',
        'Centrally Sponsored Project for PACS Computerization: ₹2,516 crore project under Ministry of Cooperation to bring all functional PACS (~63,000) onto an ERP-based common national software integrated with NABARD and DCCBs.',
        'Model By-laws for PACS: enables PACS to diversify beyond credit into multi-purpose activities: running Fair Price Shops, setting up custom hiring centres, operating fertilizer/seed retail outlets, and functioning as Common Service Centres (CSCs).'
      ]
    },
    {
      nodeId: 'cmopjvheh008mz3r0y6ydnqx6',
      title: 'Crop Insurance — PMFBY, Weather-Based Insurance & Scheme Reforms',
      syllabusOrder: 7,
      topic: 'Agricultural Credit & Schemes',
      prelimsNote: [
        'Pradhan Mantri Fasal Bima Yojana (PMFBY, launched Kharif 2016): replaced National Agricultural Insurance Scheme (NAIS) and Modified NAIS; provides comprehensive yield and crop loss coverage against non-preventable natural risks (drought, flood, unseasonal rainfall, pests, landslides, post-harvest cyclonic damage).',
        'Uniform subsidized premium rates paid by farmers: 1) Kharif crops: 2.0% of sum insured, 2) Rabi food and oilseed crops: 1.5% of sum insured, 3) Annual commercial and horticultural crops: 5.0% of sum insured; balance actuarial premium subsidized 50:50 between Centre and States (90:10 for North Eastern states).',
        'Coverage scope: Covers Prevented Sowing / Planting risk, Mid-season adversity, Post-Harvest losses (up to 14 days after harvesting for crops kept in "cut and spread" condition in the field for drying against cyclonic and unseasonal rains), and localized calamities (hailstorm, landslide, inundation).',
        '2020 Reforms & Tech integration: Made completely voluntary for all farmers (earlier mandatory for loanee farmers); Weather Based Crop Insurance Scheme (WBCIS) operates alongside using rainfall/temperature triggers; YES-TECH (yield estimation through satellite and remote sensing) and CROPIC (collection of real-time crop photos via app) reduce human errors in Crop Cutting Experiments (CCEs).'
      ]
    },
    {
      nodeId: 'cmopjvheh008pz3r03wsd9t9v',
      title: 'Agricultural Debt, Indebtedness & Agrarian Distress',
      syllabusOrder: 7,
      topic: 'Agricultural Credit & Schemes',
      prelimsNote: [
        'NSSO 77th Round Situation Assessment of Agricultural Households (2018-19): ~50.2% of agricultural households in India are in debt; average outstanding loan amount per indebted household is ~₹74,121; Andhra Pradesh, Telangana, and Kerala have highest proportion of indebted farm households (>60%).',
        'Source of Credit: ~69.6% of credit borrowed from institutional sources (Banks, Cooperatives, Microfinance), but non-institutional informal moneylenders still account for ~30.4% (charging usurious interest rates between 24-60% per annum).',
        'Structural drivers of distress: fragmented unviable landholdings (average size 1.08 ha), escalating input costs (fertilizer, diesel, seeds) without matching remunerative prices, climate volatility (unseasonal hail/drought), and health/social expenditure shocks.',
        'Farm Loan Waivers: periodic populist loan write-offs create moral hazard, destroy rural credit culture, discourage honest borrowers, impair commercial banks\' balance sheets, and exclude tenant/marginal farmers who rely on informal moneylenders.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 8: Agricultural Marketing & Trade (Syllabus Order: 8)
    // -------------------------------------------------------------------------
    {
      nodeId: 'cmopjvi9w008tz3r0dd8fhwdp',
      title: 'Agricultural Marketing — APMC, e-NAM & Mandi Reforms',
      syllabusOrder: 8,
      topic: 'Agricultural Marketing & Trade',
      prelimsNote: [
        'APMC (Agricultural Produce Market Committee) Acts: state enactments establishing regulated wholesale markets (mandis); intent was to protect farmers from exploitation by unscrupulous traders; became monopolistic cartels charging high mandi cess, entry taxes, weighing charges, and mandatory commissions to commission agents (arhatiyas).',
        'Model APLM Act, 2017 (Agricultural Produce and Livestock Marketing Act): drafted by Centre to replace APMCs with a single unified market; proposes geographic delimitation of market areas, private wholesale markets, direct purchase from farmers, and rationalisation of market fees.',
        'e-NAM (National Agriculture Market, launched April 2016): pan-India electronic trading portal networking existing physical APMC mandis to create a unified national market for agricultural commodities; Small Farmers\' Agribusiness Consortium (SFAC) is the lead agency implementing e-NAM.',
        'e-NAM features: single trading license valid across the entire state, single point levy of market fee, electronic auctioning with assaying (quality testing) laboratories, integrated online payments directly into farmers\' bank accounts, and warehouse-based trading through electronic Negotiable Warehouse Receipts (e-NWRs).'
      ]
    },
    {
      nodeId: 'cmopjvia5008uz3r0liq9j1if',
      title: 'Post-Harvest Infrastructure, Cold Chain & Logistics',
      syllabusOrder: 8,
      topic: 'Agricultural Marketing & Trade',
      prelimsNote: [
        'Post-harvest losses in India: Estimated at ₹90,000+ crore annually; horticulture (fruits and vegetables) suffers 6-15% post-harvest losses, pulses and cereals 4-6% losses due to lack of primary processing, pack-houses, cold stores, and refrigerated transport.',
        'Agriculture Infrastructure Fund (AIF, launched 2020): ₹1 lakh crore financing facility under Atmanirbhar Bharat; provides medium-to-long term debt financing for post-harvest management infrastructure and community farming assets; offers 3% per annum interest subvention up to a loan limit of ₹2 crore for a maximum tenure of 7 years, along with CGTMSE credit guarantee coverage.',
        'Warehousing Development and Regulatory Authority (WDRA): statutory authority set up under Warehousing (Development and Regulation) Act, 2007; regulates and registers warehouses issuing Negotiable Warehouse Receipts (NWRs / e-NWRs); enables farmers to deposit produce, avoid distress sales during harvest glut, and obtain bank pledge finance.',
        'Kisan Rail: multi-commodity trains operated by Indian Railways with refrigerated/ventilated rakes to transport perishable agricultural commodities (fruits, vegetables, milk, meat) from surplus production hubs to distant consumption markets; Ministry of Food Processing Industries provides 50% subsidy on freight charges under Operation Greens.'
      ]
    },
    {
      nodeId: 'cmopjviev0093z3r0mtq7x55a',
      title: 'Food Processing Industry — Mega Food Parks, PMKSY & PM-FME',
      syllabusOrder: 8,
      topic: 'Agricultural Marketing & Trade',
      prelimsNote: [
        'Economic importance: Food Processing Industry (FPI) acts as a bridge between agriculture and manufacturing; accounts for ~8.8% of manufacturing GVA and ~12.2% of registered employment; current processing level of perishables in India is low (~10% compared to >60-70% in developed countries like USA, Brazil, China).',
        'Pradhan Mantri Kisan SAMPADA Yojana (PMKSY, Ministry of Food Processing Industries): umbrella scheme incorporating 1) Mega Food Parks, 2) Integrated Cold Chain and Value Addition Infrastructure, 3) Creation/Expansion of Food Processing & Preservation Capacities (CEFPPC), 4) Agro Processing Clusters, 5) Operation Greens.',
        'Mega Food Park Scheme: "hub and spoke" cluster model linking agricultural production to markets; comprises Central Processing Centre (CPC, providing common testing, cold storage, packaging), Primary Processing Centres (PPCs), and Collection Centres (CCs) at farm-gate.',
        'PM Formalisation of Micro food processing Enterprises (PM-FME): centrally sponsored scheme under Atmanirbhar Bharat (outlay ₹10,000 crore) adopting the "One District One Product" (ODOP) approach to provide financial, technical, and business support for upgrading 2 lakh micro-food enterprises.',
        'Operation Greens (extended from TOP - Tomato, Onion, Potato to TOTAL - 22 perishable crops): price stabilization scheme for perishable crops mitigating seasonal price crashes and building value chains.'
      ]
    }
  ],
  newNodesToCreate: [
    // -------------------------------------------------------------------------
    // TOPIC 1: Soil, Fertilizers & Farming Practices (Syllabus Order: 1)
    // -------------------------------------------------------------------------
    {
      title: 'Natural Farming, Zero Budget Natural Farming & Agroecology',
      module: 'Agronomy & Practices',
      topic: 'Soil, Fertilizers & Farming Practices',
      syllabusOrder: 1,
      nodeType: 'CONCEPTUAL',
      prelimsNote: [
        'Zero Budget Natural Farming (ZBNF): agroecological farming approach developed by Subhash Palekar; rejects commercial synthetic chemical fertilizers, pesticides, and expensive market inputs to eliminate debt dependency.',
        'Four core pillars of ZBNF: 1) Bijamrita (seed treatment using indigenous cow dung, urine, lime, and native soil to protect against seed-borne pathogens), 2) Jiwamrita (fermented microbial culture of cow dung, urine, jaggery, pulse flour, and virgin soil applied as soil inoculant), 3) Mulching / Achhadana (covering topsoil with crop residues or live multi-species cover crops to conserve soil moisture and suppress weeds), 4) Waaphasa (soil aeration and microclimate moisture condition where air and water molecules coexist in 50:50 ratio; opposes continuous flood irrigation).',
        'Bhartiya Prakritik Krishi Paddhati (BPKP) & National Mission on Natural Farming (NMNF): sub-scheme of Paramparagat Krishi Vikas Yojana (PKVY) to promote indigenous cow-based natural farming across river Ganga basin corridor (5 km belt on either side) and tribal belts.',
        'Organic Farming vs Natural Farming: Organic farming still uses off-farm organic inputs (vermicompost, bio-fertilizers, neem cake requiring purchase/preparation), while Natural Farming relies strictly on on-farm indigenous livestock resources and natural ecological processes with zero off-farm inputs.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 2: Major Crops (Syllabus Order: 2)
    // -------------------------------------------------------------------------
    {
      title: 'Major Food Crops of India — Rice, Wheat, Millets & Pulses',
      module: 'Agronomy & Practices',
      topic: 'Major Crops',
      syllabusOrder: 2,
      nodeType: 'STATIC',
      prelimsNote: [
        'Rice (Oryza sativa): Kharif crop requiring high temperature (>25°C), high humidity, and annual rainfall >100 cm (deep clayey/loamy alluvium); West Bengal is top producer, followed by UP and Punjab; India is world\'s largest exporter of rice (accounting for ~40% of global trade; non-basmati and basmati). System of Rice Intensification (SRI) and Direct Seeded Rice (DSR) significantly reduce water usage, seed rate (by 80%), and methane emissions.',
        'Wheat (Triticum aestivum): Rabi crop requiring cool growing season (10-15°C) and bright sunshine during ripening (21-26°C), annual rainfall 50-75 cm; well-drained fertile loamy/clayey soil; Uttar Pradesh is top producer, followed by MP and Punjab; vulnerable to terminal heat stress during grain-filling stage (March/April).',
        'Millets ("Shree Anna"): highly nutritious, climate-resilient, C4 photosynthetic pathway crops requiring low rainfall (30-50 cm) and marginal soils; 1) Jowar (Sorghum - rainfed, Maharashtra is top producer), 2) Bajra (Pearl Millet - sandy soils, Rajasthan is top producer), 3) Ragi (Finger Millet - red/black soils, Karnataka is top producer). 2023 celebrated as UN International Year of Millets (IYM 2023) following India\'s proposal.',
        'Pulses (Legumes): rich source of protein; predominantly grown in dry, rainfed conditions as rotation/catch crops; fix atmospheric nitrogen into soil via Rhizobium symbiosis in root nodules (except Arhar/Tur which has weaker fixation); India is world\'s largest producer, consumer, and importer of pulses; Gram/Chickpea accounts for ~50% of total pulse production; MP and Rajasthan are top producing states.'
      ]
    },
    {
      title: 'Commercial & Cash Crops — Cotton, Sugarcane, Oilseeds, Tea & Coffee',
      module: 'Agronomy & Practices',
      topic: 'Major Crops',
      syllabusOrder: 2,
      nodeType: 'STATIC',
      prelimsNote: [
        'Cotton (Gossypium): Kharif crop requiring high temperature, light rainfall/irrigation, 210 frost-free days, and bright sunshine during picking; grows best on black cotton soil (Regur) of Deccan plateau; Gujarat and Maharashtra are top producers; India has largest cotton cultivation area globally.',
        'Sugarcane (Saccharum officinarum): tropical and sub-tropical crop requiring hot and humid climate (21-27°C) and annual rainfall 75-100 cm; Uttar Pradesh is top producer in terms of area and output; Peninsular/Maharashtra sugarcane has higher sucrose content and longer crushing season due to maritime tropical climate. Ratoon cropping saves seed and preparatory tillage costs.',
        'Oilseeds & Edible Oils: India imports ~55-60% of domestic edible oil requirements (palm oil from Indonesia/Malaysia, soybean oil from Argentina/Brazil, sunflower oil from Ukraine/Russia). National Mission on Edible Oils - Oil Palm (NMEO-OP) promotes palm oil cultivation in North-East and Andaman & Nicobar; Rajasthan and Gujarat lead in Mustard and Groundnut; MP leads in Soybean.',
        'Tea & Coffee: Tea requires warm and humid climate (20-30°C), well-distributed rainfall 150-300 cm, deep, friable, acidic well-drained soil rich in organic matter on hill slopes (Assam, West Bengal/Darjeeling - 1st Indian GI tag, Nilgiris); Coffee requires 15-28°C and 150-250 cm rainfall; Karnataka accounts for >70% of Indian coffee (Arabica - high quality, mild aroma; Robusta - disease resistant, strong flavor).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 3: Cropping Patterns & Systems (Syllabus Order: 3)
    // -------------------------------------------------------------------------
    {
      title: 'Cropping Systems, Diversification & Agroforestry',
      module: 'Agronomy & Practices',
      topic: 'Cropping Patterns & Systems',
      prelimsNote: [
        'Cropping Patterns in India: governed by agro-climatic zones (Planning Commission demarcated 15 Agro-Climatic Zones based on physiography, climate, soil, and water availability). Kharif (June-October: Rice, Cotton, Bajra, Maize), Rabi (October-April: Wheat, Gram, Mustard, Barley), Zaid (March-June: Watermelon, Cucumber, Fodder crops).',
        'Multi-cropping systems: 1) Mixed Cropping (growing two or more crops simultaneously on the same field without distinct row arrangement to insure against total crop failure), 2) Intercropping (growing two or more crops simultaneously in definite row ratio, e.g., 1 row Maize : 2 rows Soybean, optimizing solar radiation and nutrient absorption), 3) Crop Rotation (sequential cultivation of different crops on the same piece of land across seasons to prevent pest buildup and nutrient exhaustion).',
        'Direct Seeded Rice (DSR) & System of Rice Intensification (SRI): SRI uses younger single seedlings (8-12 days old) transplanted at wide spacing (25x25 cm) with organic manure and alternate wetting and drying (AWD), saving 30-40% water; DSR bypasses nursery raising and puddling entirely by drilling seeds directly into moist soil with herbicide application.',
        'Agroforestry: deliberate integration of woody perennials (trees, shrubs, bamboo) on the same land-management unit with agricultural crops and/or livestock; India was the first country in the world to adopt a National Agroforestry Policy (2014) to enhance carbon sequestration, soil organic matter, and farmer incomes.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 4: Irrigation & Water Management (Syllabus Order: 4)
    // -------------------------------------------------------------------------
    {
      title: 'Micro-Irrigation, Solar Energy & PM-KUSUM Scheme',
      module: 'Agronomy & Practices',
      topic: 'Irrigation & Water Management',
      syllabusOrder: 4,
      nodeType: 'CONCEPTUAL',
      prelimsNote: [
        'Micro-Irrigation: includes Drip irrigation (water applied directly to root zone via emitters at low discharge rates) and Sprinkler irrigation (spray overhead replicating rain); saves 40-60% irrigation water, increases crop yields by 20-30%, and reduces electricity/weed control expenditure.',
        'Micro-Irrigation Fund (MIF): ₹5,000 crore dedicated fund created with NABARD under PMKSY (Per Drop More Crop) to help states mobilize financial resources for expanding micro-irrigation coverage.',
        'PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan, launched 2019 by Ministry of New and Renewable Energy - MNRE): aims to de-dieselize agricultural pump sector and provide energy security to farmers.',
        'Three components of PM-KUSUM: 1) Component A: setting up 10,000 MW of small solar power plants on barren/fallow land by farmers/cooperatives (grid-connected), 2) Component B: installation of 20 lakh standalone solar-powered agricultural pumps (off-grid), 3) Component C: solarisation of 15 lakh grid-connected agricultural pumps (allowing farmers to sell surplus solar power back to DISCOMs, earning additional income - "Urjadatta").',
        'Water-Energy Nexus in Agriculture: highly subsidized or free electricity for farm tubewells leads to unrestricted groundwater pumping, causing rapid water table depletion in alluvial and hard-rock aquifer zones.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 5: Agriculture & Economy (Syllabus Order: 5)
    // -------------------------------------------------------------------------
    {
      title: 'Structural Transformation & Agrarian Employment Dynamics',
      module: 'Agricultural Economics & Policy',
      topic: 'Agriculture & Economy',
      prelimsNote: [
        'Structural Divergence in Indian Economy: Agriculture contributes ~16-18% of Gross Value Added (GVA) but still employs ~45.8% of the total national workforce (Periodic Labour Force Survey - PLFS 2022-23); demonstrates incomplete structural transformation where workforce failed to migrate proportionately to manufacturing or high-productivity services.',
        'Feminization of Agriculture: increasing proportion of women in agricultural workforce (PLFS indicates >60% of rural female workers are in agriculture) driven by male out-migration to urban informal sectors; however, women face deep credit, mechanization, and land title exclusion.',
        'Capital Formation in Agriculture: Gross Capital Formation (GCF) in agriculture as a percentage of agricultural GVA has hovered around 14-16% (with private sector contributing ~80% and public sector ~20%); public investment in irrigation, rural roads, cold storage, and research is critical for crowding in private investment.',
        'Total Arable Land comparison: India possesses ~156 million hectares of arable land (2nd largest in the world after the USA; larger than China\'s ~119 million hectares); however, India\'s agricultural productivity per hectare across rice, wheat, and pulses is substantially lower than global averages.'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 7: Agricultural Credit & Schemes (Syllabus Order: 7)
    // -------------------------------------------------------------------------
    {
      title: 'Direct Income Support Schemes — PM-KISAN & State Farm Support',
      module: 'Agricultural Economics & Policy',
      topic: 'Agricultural Credit & Schemes',
      syllabusOrder: 7,
      nodeType: 'CONCEPTUAL',
      prelimsNote: [
        'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi, launched February 2019, operational retrospectively from 1 Dec 2018): Central Sector Scheme with 100% funding from Government of India under Ministry of Agriculture and Farmers Welfare.',
        'Entitlement details: financial benefit of ₹6,000 per year per family is transferred directly into the Aadhaar-seeded bank accounts of beneficiary farmer families in three equal four-monthly installments of ₹2,000 each via Direct Benefit Transfer (DBT).',
        'Coverage & Exclusions: Initially applicable only to Small and Marginal Farmer families (<2 ha land), revised in June 2019 to cover ALL landholding farmer families subject to certain exclusion criteria (institutional landholders, former/present ministers, MPs/MLAs, serving/retired government employees, income-tax payers, professionals like doctors/engineers).',
        'State-level Direct Income Support models: Rythu Bandhu (Telangana: per-acre input assistance per season without tenant coverage), KALIA (Odisha: Krushak Assistance for Livelihood and Income Augmentation, includes landless agricultural laborers and vulnerable households).'
      ]
    },
    // -------------------------------------------------------------------------
    // TOPIC 8: Agricultural Marketing & Trade (Syllabus Order: 8)
    // -------------------------------------------------------------------------
    {
      title: 'Agricultural Trade & Export Policy — APEDA, MPEDA & Global Rules',
      module: 'Agricultural Economics & Policy',
      topic: 'Agricultural Marketing & Trade',
      syllabusOrder: 8,
      nodeType: 'STATIC',
      prelimsNote: [
        'Agricultural Export Policy (AEP 2018): aimed at doubling agricultural exports to $60+ billion; focuses on agricultural export clusters, promoting organic/ethnic products, institutional mechanism for market access, and minimizing arbitrary ad-hoc export bans/tariffs.',
        'APEDA (Agricultural and Processed Food Products Export Development Authority): statutory authority established under APEDA Act, 1985 (under Ministry of Commerce and Industry); promotes export of scheduled products (fresh fruits, vegetables, basmati rice, floriculture, processed meat, dairy, honey); administers National Programme for Organic Production (NPOP) certification.',
        'MPEDA (Marine Products Export Development Authority): statutory body established in 1972 under Ministry of Commerce and Industry; dedicated to development and export promotion of marine and seafood industry.',
        'Sanitary and Phytosanitary (SPS) and Technical Barriers to Trade (TBT) agreements under WTO: Non-tariff barriers frequently faced by Indian agricultural exports in developed markets (e.g., maximum residue limits - MRL for pesticides in basmati rice in EU, aflatoxin limits in groundnuts, fruit fly quarantine in mangoes).',
        'Export-Import policy volatility: frequent use of minimum export prices (MEP), export duties, or outright export prohibitions on essential food commodities (non-basmati white rice, wheat, onion, sugar) to safeguard domestic consumer price stability.'
      ]
    }
  ]
};

const outputDir = path.resolve('./data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'agriculture_node_bridging.json');
fs.writeFileSync(outputPath, JSON.stringify(bridgingData, null, 2), 'utf8');
console.log(`✅ Saved Agriculture bridging data to ${outputPath} (${bridgingData.nodes.length} existing nodes + ${bridgingData.newNodesToCreate.length} new nodes)`);

// Also save to /Users/nikhilwandhe/Downloads/agriculture_node_bridging.json
const downloadsPath = '/Users/nikhilwandhe/Downloads/agriculture_node_bridging.json';
try {
  fs.writeFileSync(downloadsPath, JSON.stringify(bridgingData, null, 2), 'utf8');
  console.log(`✅ Copied Agriculture bridging data to ${downloadsPath}`);
} catch (e) {
  console.warn(`Could not write to downloads: ${e.message}`);
}
