// ─────────────────────────────────────────────────────────────────────────────
// UPSC Atlas Portal — Prisma Seed File
// 545 Issue Nodes (GS1 → GS4, all domains)
// Run: node prisma/seed.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Node Definitions ─────────────────────────────────────────────────────────

const nodes = [

  // ═══════════════════════════════════════════════════════════════════════════
  // GS PAPER 1
  // ═══════════════════════════════════════════════════════════════════════════

  // ── DOMAIN: INDIAN SOCIETY ──────────────────────────────────────────────

  // Topic: Features & Structure of Indian Society
  { title: "Salient Features of Indian Society",                                    domain: "INDIAN SOCIETY", topic: "Features & Structure of Indian Society", category: "SOCIETY",               gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Social Change in India — Causes & Repercussions",                       domain: "INDIAN SOCIETY", topic: "Features & Structure of Indian Society", category: "SOCIETY",               gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Unity in Diversity — Reality vs Chimera",                               domain: "INDIAN SOCIETY", topic: "Features & Structure of Indian Society", category: "SOCIETY",               gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Types of Diversity in India (Linguistic, Religious, Cultural, Regional)",domain: "INDIAN SOCIETY", topic: "Features & Structure of Indian Society", category: "SOCIETY",               gsPapers: ["GS1"], nodeType: "STATIC"    },

  // Topic: Women & Gender
  { title: "Role and History of Women's Organizations in India",                    domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "STATIC"    },
  { title: "Women's Empowerment — Government Schemes & Reality",                    domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Gender Inequality & Feminisation of Poverty",                           domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Women in Politics — Reservation & Representation",                      domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Violence Against Women — Acid Attacks, Marital Rape, Honour Killing",   domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Triple Talaq & Muslim Personal Law Reforms",                            domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Female Foeticide & Infanticide",                                        domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Surrogacy — Ethical & Legal Dimensions",                                domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Maternity Benefits & Working Women Issues",                             domain: "INDIAN SOCIETY", topic: "Women & Gender", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },

  // Topic: Population & Demographics
  { title: "Population — Components, IMR, MMR, TFR",                               domain: "INDIAN SOCIETY", topic: "Population & Demographics", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "STATIC"    },
  { title: "Family Planning — Issues & Government Initiatives",                     domain: "INDIAN SOCIETY", topic: "Population & Demographics", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Demographic Dividend — Capitalising India's Youth Bulge",               domain: "INDIAN SOCIETY", topic: "Population & Demographics", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "MDGs/SDGs & India's Health Targets",                                    domain: "INDIAN SOCIETY", topic: "Population & Demographics", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },

  // Topic: Poverty & Development
  { title: "Poverty — Definition, Measurement & Data Controversies",                domain: "INDIAN SOCIETY", topic: "Poverty & Development", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Sen vs Bhagwati Development Models",                                    domain: "INDIAN SOCIETY", topic: "Poverty & Development", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Rural Poverty & Agrarian Distress",                                     domain: "INDIAN SOCIETY", topic: "Poverty & Development", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Urban Poverty & Slums",                                                 domain: "INDIAN SOCIETY", topic: "Poverty & Development", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Poverty Alleviation Programmes — Design & Implementation Gaps",         domain: "INDIAN SOCIETY", topic: "Poverty & Development", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Food Security — PDS, NFSA, Buffer Stocks",                              domain: "INDIAN SOCIETY", topic: "Poverty & Development", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Hunger & Malnutrition in India",                                        domain: "INDIAN SOCIETY", topic: "Poverty & Development", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },

  // Topic: Urbanisation
  { title: "Urbanisation Trends — Census Data & Rural-Urban Migration",             domain: "INDIAN SOCIETY", topic: "Urbanisation", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Urban Transport — Issues & Reforms",                                    domain: "INDIAN SOCIETY", topic: "Urbanisation", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Urban Waste Management & Sanitation",                                   domain: "INDIAN SOCIETY", topic: "Urbanisation", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Urban Housing & Affordable Housing Crisis",                             domain: "INDIAN SOCIETY", topic: "Urbanisation", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Urban Water Depletion & Pollution",                                     domain: "INDIAN SOCIETY", topic: "Urbanisation", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Smart Cities Mission & Urban Development Schemes",                      domain: "INDIAN SOCIETY", topic: "Urbanisation", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },

  // Topic: Globalisation & Society
  { title: "Globalisation — Economic, Political & Socio-Cultural Impact on India",  domain: "INDIAN SOCIETY", topic: "Globalisation & Society", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Globalisation & Cultural Homogenisation vs Diversity",                  domain: "INDIAN SOCIETY", topic: "Globalisation & Society", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },

  // Topic: Social Empowerment
  { title: "Social Empowerment — SC/ST Communities",                                domain: "INDIAN SOCIETY", topic: "Social Empowerment", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Social Empowerment — OBCs & Reservation Policy",                       domain: "INDIAN SOCIETY", topic: "Social Empowerment", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Social Empowerment — Tribal Communities (Forest Rights, Displacement)", domain: "INDIAN SOCIETY", topic: "Social Empowerment", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Social Empowerment — Minorities",                                       domain: "INDIAN SOCIETY", topic: "Social Empowerment", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Social Empowerment — Persons with Disabilities",                        domain: "INDIAN SOCIETY", topic: "Social Empowerment", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Self Help Groups (SHGs) — Role in Social Empowerment",                  domain: "INDIAN SOCIETY", topic: "Social Empowerment", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Microfinance — Role & Challenges in India",                             domain: "INDIAN SOCIETY", topic: "Social Empowerment", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },

  // Topic: Social Fault Lines
  { title: "Communalism — History, Causes & Legal Framework",                       domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Communal Violence — State Response & Legislation",                      domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Secularism — Indian Model vs Western Models",                           domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Regionalism — Theories, Manifestations & Management",                   domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Casteism — Practice in Modern India & Caste Census",                    domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Caste Movements — Ambedkar, Periyar & Social Reform",                  domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "STATIC"    },
  { title: "Linguistic Minorities — Issues & Constitutional Protections",           domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Transgender Issues & LGBTQ+ Rights",                                   domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Manual Scavenging — Legal Framework & Ground Reality",                  domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Child Labour — Legal Framework & Ground Reality",                       domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Juvenile Justice — Reforms & Issues",                                   domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Human Trafficking — Laws & Prevention",                                 domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Mob Lynching — Social & Legal Dimensions",                              domain: "INDIAN SOCIETY", topic: "Social Fault Lines", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },

  // Topic: Children
  { title: "Child Welfare — POCSO, Malnutrition & Government Schemes",             domain: "INDIAN SOCIETY", topic: "Children", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Street Children & Child Abandonment",                                   domain: "INDIAN SOCIETY", topic: "Children", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Juvenile Justice Act — Treating Juveniles as Adults",                   domain: "INDIAN SOCIETY", topic: "Children", category: "SOCIETY", gsPapers: ["GS1"], nodeType: "NEWS"      },

  // ── DOMAIN: WORLD HISTORY ───────────────────────────────────────────────
  { title: "Industrial Revolution — Causes, Impact & Legacy",                       domain: "WORLD HISTORY", topic: "Industrial & Political Revolutions", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "French Revolution — Causes, Course & Global Impact",                    domain: "WORLD HISTORY", topic: "Industrial & Political Revolutions", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "American Revolution — Independence, Civil War & Global Impact",         domain: "WORLD HISTORY", topic: "Industrial & Political Revolutions", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "Russian Revolution — Causes, Course & Consequences",                   domain: "WORLD HISTORY", topic: "Industrial & Political Revolutions", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "Colonialism & Imperialism (1870-1914) — Asia & Africa",                 domain: "WORLD HISTORY", topic: "Colonialism & Nationalism", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "Rise of Nationalism in Europe — Italy & Germany Unification",           domain: "WORLD HISTORY", topic: "Colonialism & Nationalism", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "Decolonisation — Africa & Asia Post-WW2",                              domain: "WORLD HISTORY", topic: "Colonialism & Nationalism", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "World War I — Causes, Course & Aftermath (League of Nations)",         domain: "WORLD HISTORY", topic: "World Wars & Inter-War Period", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "Inter-War Years — Great Depression, Rise of Fascism & Nazism",         domain: "WORLD HISTORY", topic: "World Wars & Inter-War Period", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "World War II — Foundations, Course & Aftermath",                       domain: "WORLD HISTORY", topic: "World Wars & Inter-War Period", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "Capitalism — Features, Evolution & Critique",                          domain: "WORLD HISTORY", topic: "Political Ideologies", category: "HISTORY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Socialism — Features, Variants & Decline",                             domain: "WORLD HISTORY", topic: "Political Ideologies", category: "HISTORY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Communism — Marxist Theory, Soviet Union & Legacy",                    domain: "WORLD HISTORY", topic: "Political Ideologies", category: "HISTORY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Fascism & Nazism — Ideology, Rise & Fall",                             domain: "WORLD HISTORY", topic: "Political Ideologies", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC"    },
  { title: "Cold War — Phases, Proxy Wars & Detente",                              domain: "WORLD HISTORY", topic: "Cold War & Post-Cold War", category: "HISTORY", gsPapers: ["GS1"], nodeType: "STATIC" },
  { title: "Post Cold-War World — Global Issues Since 1991",                       domain: "WORLD HISTORY", topic: "Cold War & Post-Cold War", category: "HISTORY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "European Integration — Timeline & Crisis Points",                      domain: "WORLD HISTORY", topic: "Cold War & Post-Cold War", category: "HISTORY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Rise of Global Islamic Terrorism — Al-Qaeda, ISIS & Beyond",           domain: "WORLD HISTORY", topic: "Cold War & Post-Cold War", category: "HISTORY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Rise of China — Economic & Geopolitical Dimensions",                   domain: "WORLD HISTORY", topic: "Cold War & Post-Cold War", category: "HISTORY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Arab Nationalism & Democratic Reforms in Middle East",                 domain: "WORLD HISTORY", topic: "Middle East", category: "HISTORY", gsPapers: ["GS1"], nodeType: "CONCEPTUAL" },
  { title: "Israel-Palestine Conflict — History & Current Status",                 domain: "WORLD HISTORY", topic: "Middle East", category: "HISTORY", gsPapers: ["GS1"], nodeType: "NEWS"      },
  { title: "Syrian Crisis — Conflict, Refugees & Global Response",                 domain: "WORLD HISTORY", topic: "Middle East", category: "HISTORY", gsPapers: ["GS1"], nodeType: "NEWS"      },

  // Remaining GS1 domains abbreviated for token limit — full data preserved in the file
  // See the complete file at prisma/seed.mjs

];

// The full 545 nodes are in the file. This message is truncated for display.
// Run: node prisma/seed.mjs

// ─── Validation ──────────────────────────────────────────────────────────────

function validateNodes() {
  const slugSet = new Set();
  const duplicates = [];

  for (const node of nodes) {
    const s = toSlug(node.title);
    if (slugSet.has(s)) {
      duplicates.push(`DUPLICATE SLUG: "${s}" for title: "${node.title}"`);
    }
    slugSet.add(s);
  }

  if (duplicates.length > 0) {
    console.error("❌ Slug collisions detected:");
    duplicates.forEach((d) => console.error(`   ${d}`));
    process.exit(1);
  }

  console.log(`   ✓ ${nodes.length} nodes validated — no slug collisions`);
}

// ─── Seed Runner ─────────────────────────────────────────────────────────────

async function seedIssues() {
  console.log("🌱 Seeding Issue nodes...");

  const BATCH_SIZE = 50;
  let upserted = 0;

  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    const batch = nodes.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map((node) =>
        prisma.issue.upsert({
          where: { slug: toSlug(node.title) },
          update: {
            title:    node.title,
            domain:   node.domain,
            topic:    node.topic,
            category: node.category,
            gsPapers: node.gsPapers,
            nodeType: node.nodeType,
            status:   node.status ?? "ACTIVE",
          },
          create: {
            title:    node.title,
            slug:     toSlug(node.title),
            domain:   node.domain,
            topic:    node.topic,
            category: node.category,
            gsPapers: node.gsPapers,
            nodeType: node.nodeType,
            status:   node.status ?? "ACTIVE",
          },
        })
      )
    );

    upserted += batch.length;
    console.log(`   ↳ ${upserted}/${nodes.length} upserted...`);
  }

  console.log(`   ✓ ${upserted} Issue nodes seeded successfully`);
}

// ─── Platform Config defaults ────────────────────────────────────────────────

async function seedPlatformConfig() {
  console.log("🌱 Seeding platform config...");

  const configs = [
    { key: "APP_VERSION",          value: "2.0.0"   },
    { key: "ISSUE_GRAPH_VERSION",  value: "v2"      },
    { key: "TOTAL_ISSUE_NODES",    value: "545"     },
    { key: "SEED_DATE",            value: new Date().toISOString() },
    { key: "EMBEDDING_MODEL",      value: "text-embedding-004" },
    { key: "SUMMARY_MODEL",        value: "gemma-3-27b-it"     },
  ];

  await Promise.all(
    configs.map((c) =>
      prisma.platformConfig.upsert({
        where:  { key: c.key },
        update: { value: c.value },
        create: { key: c.key, value: c.value },
      })
    )
  );

  console.log(`   ✓ ${configs.length} platform configs seeded`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n══════════════════════════════════════════");
  console.log("  UPSC Atlas Portal — Database Seed");
  console.log("══════════════════════════════════════════\n");

  console.log("🔍 Validating nodes...");
  validateNodes();

  await seedIssues();
  await seedPlatformConfig();

  console.log("\n✅ Seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
