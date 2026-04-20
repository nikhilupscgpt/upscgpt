import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force hot-reload after Prisma schema update
/**
 * UPSCGPT News Engine Sync API
 * 
 * This endpoint allows the local "Content Factory" (Gemma 4) to push
 * structured UPSC news updates to the cloud portal.
 */
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = process.env.NEWS_ENGINE_TOKEN;

    if (!authHeader || authHeader !== `Bearer ${token}`) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid engine token.' }, { status: 401 });
    }

    const { articles } = await req.json();

    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json({ error: 'Payload must contain an "articles" array.' }, { status: 400 });
    }

    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      factsBuilt: 0,
      editorialsBuilt: 0,
      errors: []
    };

    for (const data of articles) {
      try {
        results.processed++;
        
        // 1. Create or Update the News Article
        const article = await prisma.newsArticle.upsert({
          where: { url: data.url },
          update: {
            title: data.title,
            content: data.content,
            summary: data.summary,
            publishedAt: new Date(data.publishedAt),
            category: data.category,
            relevance: data.relevance,
          },
          create: {
            title: data.title,
            url: data.url,
            source: data.source,
            content: data.content,
            summary: data.summary,
            publishedAt: new Date(data.publishedAt),
            category: data.category,
            relevance: data.relevance,
          }
        });

        if (article.createdAt.getTime() === article.updatedAt.getTime()) {
          results.created++;
        } else {
          results.updated++;
        }

        // 2. Build Editorials (Issues/Crux)
        if (data.editorials && Array.isArray(data.editorials)) {
          for (const ed of data.editorials) {
            await prisma.editorialAnalysis.create({
              data: {
                article: { connect: { id: article.id } },
                issue: ed.issue,
                crux: ed.crux,
                perspectives: ed.perspectives || {},
                keywords: ed.keywords,
                gsPaper: ed.gsPaper
              }
            });
            results.editorialsBuilt++;
          }
        }

        // 3. Build Facts (PF/MF) and Link to Map
        if (data.facts && Array.isArray(data.facts)) {
          for (const fact of data.facts) {
            // Optional: Match to MapEntry by name if provided
            let mapEntryId = null;
            if (fact.locationName) {
              const entry = await prisma.mapEntry.findFirst({
                where: { name: { equals: fact.locationName, mode: 'insensitive' } }
              });
              mapEntryId = entry?.id || null;
            }

            await prisma.newsFact.create({
              data: {
                article: { connect: { id: article.id } },
                type: fact.type, // PRELIMS_FACT or MAINS_FACT
                content: fact.content,
                category: fact.category,
                year: fact.year || new Date().getFullYear(),
                mapEntry: mapEntryId ? { connect: { id: mapEntryId } } : undefined,
                questionData: fact.mcq || null,
                mainsQuestion: fact.mainsQuestion || null
              }
            });
            results.factsBuilt++;
          }
        }

      } catch (err) {
        console.error(`[Sync API] Error processing article: ${data.url}`, err);
        results.errors.push({ url: data.url, error: err.message });
      }
    }

    await prisma.actionLog.create({
      data: {
        action: 'NEWS_ENGINE_SYNC',
        details: `Structured sync processed=${results.processed}, created=${results.created}, updated=${results.updated}, facts=${results.factsBuilt}, editorials=${results.editorialsBuilt}, errors=${results.errors.length}`,
      },
    })

    return NextResponse.json({
      message: 'Sync completed successfully.',
      results
    });

  } catch (error) {
    console.error('[News Sync API] Crash:', error);
    return NextResponse.json({ error: 'Internal server error during sync.' }, { status: 500 });
  }
}
