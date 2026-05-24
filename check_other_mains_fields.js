import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const issues = await prisma.issue.findMany({
      select: {
        title: true,
        mainsFacts: true,
        valueAddition: true,
        possibleQuestions: true
      }
    });

    console.log("Total Issues:", issues.length);
    const withFacts = issues.filter(i => i.mainsFacts);
    const withVal = issues.filter(i => i.valueAddition);
    const withQ = issues.filter(i => i.possibleQuestions);

    console.log("With mainsFacts:", withFacts.length);
    console.log("With valueAddition:", withVal.length);
    console.log("With possibleQuestions:", withQ.length);

    if (withFacts.length > 0) {
      console.log("\nSample mainsFacts:", withFacts[0].title, "->", withFacts[0].mainsFacts.slice(0, 500));
    }
    if (withVal.length > 0) {
      console.log("\nSample valueAddition:", withVal[0].title, "->", withVal[0].valueAddition.slice(0, 500));
    }
    if (withQ.length > 0) {
      console.log("\nSample possibleQuestions:", withQ[0].title, "->", withQ[0].possibleQuestions.slice(0, 500));
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
