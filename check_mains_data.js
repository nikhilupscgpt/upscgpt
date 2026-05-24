import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const issues = await prisma.issue.findMany({
      include: {
        nodeContent: true,
        pyqLinks: true
      }
    });

    console.log("Total Issues:", issues.length);

    let hasMainsNote = 0;
    let hasMainsFacts = 0;
    let hasValueAddition = 0;
    let hasPossibleQuestions = 0;
    let hasNodeContentMainsNote = 0;
    let hasNodeContentFacts = 0;
    let hasNodeContentCaseStudies = 0;
    let hasPYQs = 0;

    issues.forEach(i => {
      if (i.mainsNote) hasMainsNote++;
      if (i.mainsFacts) hasMainsFacts++;
      if (i.valueAddition) hasValueAddition++;
      if (i.possibleQuestions) hasPossibleQuestions++;
      if (i.nodeContent) {
        if (i.nodeContent.mainsNote) hasNodeContentMainsNote++;
        if (i.nodeContent.facts && JSON.stringify(i.nodeContent.facts) !== '[]') hasNodeContentFacts++;
        if (i.nodeContent.caseStudies && JSON.stringify(i.nodeContent.caseStudies) !== '[]') hasNodeContentCaseStudies++;
      }
      if (i.pyqLinks && i.pyqLinks.length > 0) hasPYQs++;
    });

    console.log("Issues with mainsNote:", hasMainsNote);
    console.log("Issues with mainsFacts:", hasMainsFacts);
    console.log("Issues with valueAddition:", hasValueAddition);
    console.log("Issues with possibleQuestions:", hasPossibleQuestions);
    console.log("Issues with nodeContent.mainsNote:", hasNodeContentMainsNote);
    console.log("Issues with nodeContent.facts:", hasNodeContentFacts);
    console.log("Issues with nodeContent.caseStudies:", hasNodeContentCaseStudies);
    console.log("Issues with pyqLinks:", hasPYQs);

    // Let's print one sample that has most fields populated
    const populatedIssue = issues.find(i => i.nodeContent?.mainsNote || i.cumulativeSummary);
    if (populatedIssue) {
      console.log("\nSample Populated Issue:");
      console.log("- ID:", populatedIssue.id);
      console.log("- Title:", populatedIssue.title);
      console.log("- gsPapers:", populatedIssue.gsPapers);
      console.log("- domain:", populatedIssue.domain);
      console.log("- hasNodeContent:", !!populatedIssue.nodeContent);
      if (populatedIssue.nodeContent) {
        console.log("- NodeContent MainsNote Length:", populatedIssue.nodeContent.mainsNote?.length || 0);
        console.log("- NodeContent Facts:", populatedIssue.nodeContent.facts);
        console.log("- NodeContent Case Studies:", populatedIssue.nodeContent.caseStudies);
      }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
