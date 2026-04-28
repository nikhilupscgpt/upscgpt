import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function translateText(text, targetLang) {
  if (!text) return null;
  const prompt = `Translate the following educational content related to the UPSC (Indian Civil Services) exam into ${targetLang}. Preserve all Markdown formatting, technical terms, and HTML tags if present. Do not add any introductory or concluding text. Just return the translated text.\n\nOriginal Text:\n${text}`;
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error(`Translation failed for ${targetLang}:`, error.message);
    return null;
  }
}

async function translateIssues() {
  console.log("Starting Issue Translation...");
  const issues = await prisma.issue.findMany({
    where: {
      OR: [
        { title_hi: null },
        { title_mr: null },
        { topic_hi: null },
        { topic_mr: null },
      ]
    },
    take: 10 // Batch size for testing
  });

  for (const issue of issues) {
    console.log(`Translating Issue: ${issue.title}`);
    
    const updates = {};
    
    if (!issue.title_hi) {
      const res = await translateText(issue.title, "Hindi");
      if (res) updates.title_hi = res;
    }
    if (!issue.title_mr) {
      const res = await translateText(issue.title, "Marathi");
      if (res) updates.title_mr = res;
    }
    
    if (!issue.topic_hi) {
      const res = await translateText(issue.topic, "Hindi");
      if (res) updates.topic_hi = res;
    }
    if (!issue.topic_mr) {
      const res = await translateText(issue.topic, "Marathi");
      if (res) updates.topic_mr = res;
    }

    if (issue.backgroundNote) {
      if (!issue.backgroundNote_hi) {
        const res = await translateText(issue.backgroundNote, "Hindi");
        if (res) updates.backgroundNote_hi = res;
      }
      if (!issue.backgroundNote_mr) {
        const res = await translateText(issue.backgroundNote, "Marathi");
        if (res) updates.backgroundNote_mr = res;
      }
    }

    if (issue.cumulativeSummary) {
      if (!issue.cumulativeSummary_hi) {
        const res = await translateText(issue.cumulativeSummary, "Hindi");
        if (res) updates.cumulativeSummary_hi = res;
      }
      if (!issue.cumulativeSummary_mr) {
        const res = await translateText(issue.cumulativeSummary, "Marathi");
        if (res) updates.cumulativeSummary_mr = res;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: updates
      });
      console.log(`Updated Issue ${issue.id}`);
    }
  }
  console.log("Issue translation batch complete.");
}

async function translateMapEntries() {
  console.log("Starting MapEntry Translation...");
  const entries = await prisma.mapEntry.findMany({
    where: {
      OR: [
        { name_hi: null },
        { name_mr: null },
      ]
    },
    take: 50
  });

  for (const entry of entries) {
    console.log(`Translating MapEntry: ${entry.name}`);
    const updates = {};
    
    if (!entry.name_hi) {
      const res = await translateText(entry.name, "Hindi");
      if (res) updates.name_hi = res;
    }
    if (!entry.name_mr) {
      const res = await translateText(entry.name, "Marathi");
      if (res) updates.name_mr = res;
    }

    if (entry.prelims) {
      if (!entry.prelims_hi) {
        const res = await translateText(entry.prelims, "Hindi");
        if (res) updates.prelims_hi = res;
      }
      if (!entry.prelims_mr) {
        const res = await translateText(entry.prelims, "Marathi");
        if (res) updates.prelims_mr = res;
      }
    }
    if (entry.india) {
      if (!entry.india_hi) {
        const res = await translateText(entry.india, "Hindi");
        if (res) updates.india_hi = res;
      }
      if (!entry.india_mr) {
        const res = await translateText(entry.india, "Marathi");
        if (res) updates.india_mr = res;
      }
    }
    if (entry.mains) {
      if (!entry.mains_hi) {
        const res = await translateText(entry.mains, "Hindi");
        if (res) updates.mains_hi = res;
      }
      if (!entry.mains_mr) {
        const res = await translateText(entry.mains, "Marathi");
        if (res) updates.mains_mr = res;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.mapEntry.update({
        where: { id: entry.id },
        data: updates
      });
      console.log(`Updated MapEntry ${entry.id}`);
    }
  }
}

async function translateOrganizations() {
  console.log("Starting Organization Translation...");
  const orgs = await prisma.organization.findMany({
    where: {
      OR: [
        { name_hi: null },
        { name_mr: null },
      ]
    },
    take: 20
  });

  for (const org of orgs) {
    console.log(`Translating Organization: ${org.name}`);
    const updates = {};
    
    if (!org.name_hi) {
      const res = await translateText(org.name, "Hindi");
      if (res) updates.name_hi = res;
    }
    if (!org.name_mr) {
      const res = await translateText(org.name, "Marathi");
      if (res) updates.name_mr = res;
    }

    if (org.description) {
      if (!org.description_hi) {
        const res = await translateText(org.description, "Hindi");
        if (res) updates.description_hi = res;
      }
      if (!org.description_mr) {
        const res = await translateText(org.description, "Marathi");
        if (res) updates.description_mr = res;
      }
    }
    if (org.upscContext) {
      if (!org.upscContext_hi) {
        const res = await translateText(org.upscContext, "Hindi");
        if (res) updates.upscContext_hi = res;
      }
      if (!org.upscContext_mr) {
        const res = await translateText(org.upscContext, "Marathi");
        if (res) updates.upscContext_mr = res;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.organization.update({
        where: { id: org.id },
        data: updates
      });
      console.log(`Updated Organization ${org.id}`);
    }
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    process.exit(1);
  }
  await translateIssues();
  await translateMapEntries();
  await translateOrganizations();
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
