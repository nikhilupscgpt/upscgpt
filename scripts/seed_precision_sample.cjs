const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleAnalysis = {
  themeInfo: {
    subject: "Environment",
    topic: "Wetlands",
    theme: "Ramsar mechanisms",
    currentIndex: 2,
    totalInTheme: 9,
    prevId: "ENV-UPSC-2014-06",
    nextId: "ENV-UPSC-2014-08"
  },
  questionMeta: {
    examBadge: "UPSC Prelims 2014",
    qNo: "Q 50",
    qType: "Single correct",
    code: "ENV-2014-07"
  },
  whyCorrect: {
    label: "a",
    summary: "The Montreux Record lists Ramsar sites where ecological character **has changed, is changing or is likely to change** through technological developments, pollution or other human interference. It was created by Recommendation 4.8 at COP4, Montreux (1990). Option (a) is the Record's own definition.",
    worthANote: [
      "<b>(b)</b> Ramsar mandates no legal buffer. Fixed-distance limits belong to India's Eco-Sensitive Zone rules around protected areas.",
      "<b>(d)</b> World Heritage status comes from a separate treaty (UNESCO, 1972). Keoladeo holds both statuses independently."
    ]
  },
  conceptCore: {
    title: "Concept core: Ramsar List vs Montreux Record",
    headers: ["Parameter", "Ramsar List", "Montreux Record"],
    rows: [
      {
        param: "Purpose",
        ramsar: "Recognises wetlands of International Importance",
        montreux: "Flags listed sites facing adverse ecological change"
      },
      {
        param: "Legal basis",
        ramsar: "Art. 2 — designation by the Party",
        montreux: "Rec. 4.8 (1990); guidance Res. 5.4 (1993)"
      },
      {
        param: "Entry",
        ramsar: "Party designates the site",
        montreux: "Only with the Party's consent"
      },
      {
        param: "Effect",
        ramsar: "Wise use and reporting obligations",
        montreux: "Priority attention; Party may seek a Ramsar Advisory Mission"
      },
      {
        param: "Exit",
        ramsar: "Deletion only for urgent national interest (Art. 2.5)",
        montreux: "Removed once threats are addressed"
      }
    ],
    indiaOnRecord: [
      {
        status: "LISTED",
        site: "Keoladeo NP, Rajasthan",
        detail: "since 1990"
      },
      {
        status: "LISTED",
        site: "Loktak Lake, Manipur",
        detail: "since 1993"
      },
      {
        status: "REMOVED",
        site: "Chilika Lake, Odisha",
        detail: "listed 1993, removed 2002 after hydrological restoration"
      }
    ]
  },
  currentDimension: {
    asOf: "as of Oct 2024",
    bullets: [
      "<b>Ramsar COP15</b>, Victoria Falls, Zimbabwe (July 2025): Strategic Plan 2025–2034 adopted; India's resolution on sustainable lifestyles for wise use of wetlands.",
      "<b>The Record globally</b>: 46 sites as of March 2025; none removed since COP14.",
      "<b>India</b>: 100 Ramsar sites (June 2026); Record entries unchanged — Keoladeo and Loktak."
    ]
  },
  notYetAsked: {
    countLabel: "5 dimensions",
    items: [
      "<b>Ramsar Advisory Missions (RAM)</b>: When and how an independent expert mission is triggered under Montreux Record.",
      "<b>Article 2.5 of Ramsar Convention</b>: The stringent 'urgent national interest' compensation requirement when delisting or deleting boundaries.",
      "<b>Distinction with UNESCO List of World Heritage in Danger</b>: Comparison of administrative, operational, and de-listing differences.",
      "<b>Kushiro Resolution 5.4 (1993)</b>: The official technical guidelines outlining procedure for inclusion and removal.",
      "<b>Interface with India's Wetlands (C&M) Rules 2017</b>: How domestic enforcement operates without a blanket 5-km buffer."
    ]
  },
  relatedQuestions: [
    {
      year: 2014,
      title: "Wetlands International — nature and role",
      targetId: "ENV-UPSC-2014-08"
    },
    {
      year: 2019,
      title: "Ramsar obligations; Wetland Rules 2010",
      targetId: "ENV-UPSC-2019-18"
    },
    {
      year: 2022,
      title: "Wetland / lake — state pairs",
      targetId: "ENV-UPSC-2022-12"
    }
  ],
  practiceQuestion: {
    stem: "Consider the following statements about the Montreux Record:\n1. A site can be placed on it only with the consent of the Contracting Party concerned.\n2. A site placed on it is removed from the List of Wetlands of International Importance.\n3. India currently has two sites on it.\n\nHow many of the above are correct?",
    options: [
      { label: "a", text: "Only one" },
      { label: "b", text: "Only two" },
      { label: "c", text: "All three" },
      { label: "d", text: "None" }
    ],
    correctLabel: "b",
    explanation: "Statements 1 and 3 are correct. Statement 2 is incorrect because placing a site on Montreux Record does NOT remove it from the Ramsar List; it remains a Ramsar site while receiving priority conservation attention."
  },
  references: "Ramsar Convention, Arts. 2 and 3.2 · Rec. 4.8 (1990), Res. 5.4 (1993) · COP15 documents — ramsar.org · MoEFCC, Wetlands (C&M) Rules 2017"
};

async function main() {
  const updated = await prisma.question.update({
    where: { dedupHash: "ENV-UPSC-2014-07" },
    data: { analysis: sampleAnalysis }
  });
  console.log("Successfully seeded precision sample analysis for ENV-UPSC-2014-07! ID:", updated.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
