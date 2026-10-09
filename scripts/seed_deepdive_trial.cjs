const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const analysisData = {
  keywords: ["Wetland", "Montreux Record", "Ramsar Convention / Sites", "Ecological Character"],
  optionBreakdown: [
    {
      label: "a",
      verdict: "Correct",
      text: "Changes in ecological character have occurred, are occurring or are likely to occur in the wetland as a result of human interference.",
      explanation: "Montreux Record is a register of wetland sites on the Ramsar List of Wetlands of International Importance where changes in ecological character have occurred, are occurring, or are likely to occur as a result of technological developments, pollution or other human interference."
    },
    {
      label: "b",
      verdict: "Incorrect",
      text: "The country in which the wetland is located should enact a law to prohibit any human activity within five kilometres from the edge of the wetland.",
      explanation: "The Ramsar Convention and Montreux Record do not mandate any statutory five-kilometer buffer zone prohibiting human activities. Ramsar promotes the principle of 'wise use' rather than blanket spatial prohibitions."
    },
    {
      label: "c",
      verdict: "Incorrect",
      text: "The survival of the wetland depends on the cultural practices and traditions of certain communities living in its vicinity and therefore the cultural diversity therein should not be destroyed.",
      explanation: "The Montreux Record specifically addresses ecological degradation and anthropogenic threats, not the preservation of localized cultural or community traditions."
    },
    {
      label: "d",
      verdict: "Incorrect",
      text: "It is given the status of 'World Heritage Site'?",
      explanation: "World Heritage Sites are designated under the 1972 UNESCO World Heritage Convention, which is an independent international treaty distinct from the Ramsar Convention."
    }
  ],
  valueAddition: [
    {
      title: "The Ramsar Convention (1971)",
      tag: "Treaty 1971",
      description: "An intergovernmental treaty established in 1971 in Ramsar, Iran, providing the framework for national action and international cooperation for wetland conservation.",
      sections: [
        {
          heading: "Key Objectives & Principles",
          points: [
            "<b>Conservation and Wise Use</b>: Encourages sustainable utilization of all wetlands through local, regional, and national actions.",
            "<b>Designation of Ramsar Sites</b>: Identifies suitable wetlands of international importance for global recognition.",
            "<b>International Cooperation</b>: Facilitates joint management of transboundary wetlands and shared wetland species."
          ]
        },
        {
          heading: "India & Global Footprint",
          points: [
            "<b>Global Reach</b>: 172+ Contracting Parties and over 2,500 Ramsar Sites worldwide.",
            "<b>India's Commitment</b>: Contracting party since <b>1982</b>; currently home to <b>85 Ramsar Sites</b> covering over 1.35 million hectares."
          ]
        }
      ]
    },
    {
      title: "Montreux Record (1990)",
      tag: "COP4 1990",
      description: "Established in 1990 during Ramsar COP4 in Montreux, Switzerland, as an essential mechanism under the Ramsar Convention.",
      sections: [
        {
          heading: "Key Criteria & Listing",
          points: [
            "<b>Purpose</b>: Priority register identifying Ramsar wetlands facing severe ecological threat.",
            "<b>Criteria</b>: Triggers when ecological character changes have occurred, are occurring, or are likely to occur due to human activity, pollution, or technological development.",
            "<b>Ramsar Advisory Missions (RAM)</b>: Technical support provided upon request to help contracting parties restore listed sites."
          ]
        },
        {
          heading: "Indian Wetlands in Montreux Record",
          points: [
            "<b>Keoladeo National Park (Rajasthan)</b>: Listed in 1990 due to water scarcity and unregulated grazing issues.",
            "<b>Loktak Lake (Manipur)</b>: Listed in 1993 due to deforestation in the catchment, infilling, and proliferation of phumdis.",
            "<b>Chilika Lake (Odisha)</b>: Placed in 1993 due to siltation; successfully delisted in 2002 after rehabilitation (first site in Asia to be delisted)."
          ]
        }
      ]
    }
  ],
  inNews: {
    headline: "Fires ravage Brazil wetlands, incinerating wildlife in world's largest tropical wetland",
    subheadline: "Pantanal Wetland Biome • Global Ramsar Hotspot",
    context: "Severe drought driven by El Niño and climate anomalies triggered unprecedented wildfires across the Pantanal wetlands, stressing the urgent need for international ecological safeguards.",
    relatedArticles: [
      "Why proposal to notify Dhanauri wetland as Ramsar site not sent to Centre: NGT asks UP govt",
      "India adds new Ramsar sites ahead of World Wetlands Day: Total tally touches 85 sites",
      "Supreme Court directs states to demarcate and protect all 2.31 lakh un-notified wetlands"
    ]
  },
  similarPyq: {
    targetId: "ENV-UPSC-2019-18",
    examYear: 2019,
    examName: "UPSC CSE Pre",
    srcTopic: "Wetlands & Conservation",
    stem: "Consider the following statements:\n1. Under Ramsar Convention, it is mandatory on the part of the Government of India to protect and conserve all the wetlands in the territory of India.\n2. The Wetlands (Conservation and Management) Rules, 2010 were framed by the Government of India based on the recommendation of Ramsar Convention.\n3. The Wetlands (Conservation and Management) Rules, 2010 also encompass the drainage area or catchment regions of the wetlands as determined by the authority.\nWhich of the statements given above is/are correct?"
  }
};

async function main() {
  const updated = await prisma.question.update({
    where: { dedupHash: "ENV-UPSC-2014-07" },
    data: { analysis: analysisData }
  });
  console.log("Successfully updated question analysis! ID:", updated.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
