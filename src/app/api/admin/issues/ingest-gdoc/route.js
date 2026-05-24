import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import fs from 'fs';
import path from 'path';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

// Extract Google Doc ID from link
function getGoogleDocId(url) {
  const regExp = /\/document\/d\/([a-zA-Z0-9-_]+)/;
  const matches = url.match(regExp);
  return matches ? matches[1] : null;
}

// Extract document title from markdown
function extractTitle(markdown) {
  const lines = markdown.split('\n');
  for (let line of lines) {
    const clean = line.trim();
    if (clean.startsWith('#')) {
      return clean.replace(/^#+\s+/, '');
    }
    if (clean.length > 0) {
      return clean.substring(0, 100);
    }
  }
  return 'Google Doc Ingestion';
}

export async function POST(req) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docUrl, issueId, mode, lang } = await req.json();

    if (!docUrl || !issueId || !mode) {
      return NextResponse.json({ error: 'Missing required parameters: docUrl, issueId, mode' }, { status: 400 });
    }

    const isHindi = lang?.toLowerCase() === 'hi';
    const isMarathi = lang?.toLowerCase() === 'mr';
    const suffix = isHindi ? '_hi' : (isMarathi ? '_mr' : '');

    if (mode !== 'PRELIMS' && mode !== 'MAINS' && mode !== 'ARTICLE' && mode !== 'EDITORIAL') {
      return NextResponse.json({ error: 'Invalid mode. Must be PRELIMS, MAINS, ARTICLE or EDITORIAL' }, { status: 400 });
    }

    const docId = getGoogleDocId(docUrl);
    if (!docId) {
      return NextResponse.json({ error: 'Invalid Google Doc URL structure' }, { status: 400 });
    }

    // 1. Fetch HTML export from Google Docs (expects shared as "Anyone with link can view")
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;
    const response = await fetch(exportUrl);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Could not access document. Verify it is shared as "Anyone with link can view". (HTTP ${response.status})` 
      }, { status: 400 });
    }

    const htmlContent = await response.text();

    // 2. Parse using JSDOM
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    // 3. Download & host images locally
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const images = doc.querySelectorAll('img');
    let imagesCount = 0;

    for (let img of images) {
      const src = img.getAttribute('src');
      if (!src) continue;

      try {
        let imgBuffer;
        let ext = 'png';

        if (src.startsWith('data:image/')) {
          const base64Matches = src.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
          if (base64Matches && base64Matches.length === 3) {
            ext = base64Matches[1];
            imgBuffer = Buffer.from(base64Matches[2], 'base64');
          }
        } else {
          const imgRes = await fetch(src);
          if (imgRes.ok) {
            const arrBuffer = await imgRes.arrayBuffer();
            imgBuffer = Buffer.from(arrBuffer);
            
            const contentType = imgRes.headers.get('content-type');
            if (contentType) {
              const mimeExt = contentType.split('/')[1];
              if (mimeExt && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg+xml'].includes(mimeExt)) {
                ext = mimeExt === 'svg+xml' ? 'svg' : mimeExt;
              }
            }
          }
        }

        if (imgBuffer) {
          imagesCount++;
          const filename = `gdoc_${docId}_${Date.now()}_${imagesCount}.${ext}`;
          const localPath = path.join(uploadDir, filename);
          
          fs.writeFileSync(localPath, imgBuffer);
          img.setAttribute('src', `/uploads/${filename}`);
        }
      } catch (err) {
        console.error('Failed to download embedded Google Doc image:', src, err);
      }
    }

    // Remove Google Doc style wrapper elements to clear visual noise
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach(el => el.remove());

    // 4. Convert HTML to GFM Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    });
    turndownService.use(gfm);

    const bodyHtml = doc.body.innerHTML;
    let markdown = turndownService.turndown(bodyHtml);

    // Clean multiple consecutive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // 5. Update Database Issue & NodeContent
    const issue = await prisma.issue.findUnique({
      where: { id: String(issueId) }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Syllabus node not found in database.' }, { status: 404 });
    }

    // ARTICLE / EDITORIAL direct ingestion logic
    if (mode === 'ARTICLE' || mode === 'EDITORIAL') {
      const title = extractTitle(markdown);
      const publishDate = new Date();
      let result;

      if (mode === 'EDITORIAL') {
        result = await prisma.editorial.create({
          data: {
            issueId: String(issueId),
            title,
            url: docUrl || null,
            author: 'Google Docs',
            source: 'Google Docs',
            rawContent: markdown,
            status: 'PENDING',
            publishedAt: publishDate,
          }
        });

        // Create timeline event
        await prisma.timelineEvent.create({
          data: {
            issueId: String(issueId),
            date: publishDate,
            eventText: `Editorial: "${title}" (Google Docs)`,
            sourceUrl: docUrl || null,
            itemType: 'EDITORIAL',
            refId: null
          }
        });
      } else {
        result = await prisma.article.create({
          data: {
            issueId: String(issueId),
            title,
            url: docUrl || null,
            source: 'Google Docs',
            contentType: 'NEWS',
            rawContent: markdown,
            status: 'PENDING',
            addedManually: true,
            publishedAt: publishDate,
          }
        });

        // Create timeline event
        await prisma.timelineEvent.create({
          data: {
            issueId: String(issueId),
            date: publishDate,
            eventText: `News: "${title}" (Google Docs)`,
            sourceUrl: docUrl || null,
            itemType: 'NEWS',
            refId: result.id
          }
        });
      }

      // Log action
      await prisma.actionLog.create({
        data: {
          action: 'MANUAL_INGEST',
          message: `${mode}: "${title}" (GDoc) → Issue: "${issue.title}" (${issue.slug})`,
          status: 'SUCCESS',
        },
      });

      // Update parent Issue lastUpdatedAt
      await prisma.issue.update({
        where: { id: String(issueId) },
        data: { lastUpdatedAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        type: mode,
        id: result.id,
        title,
        linkedTo: issue.title,
        imagesProcessed: imagesCount,
        message: `${mode === 'EDITORIAL' ? 'Editorial' : 'Article'} ingested successfully from Google Docs.`
      });
    }

    // PRELIMS / MAINS sync
    const issueData = {};
    if (mode === 'PRELIMS') {
      issueData[`prelimsNote${suffix}`] = markdown;
    } else {
      issueData[`mainsNote${suffix}`] = markdown;
    }

    await prisma.issue.update({
      where: { id: String(issueId) },
      data: issueData
    });

    // Sync NodeContent (only for English/default suffix since NodeContent doesn't have localized fields)
    if (!isHindi && !isMarathi) {
      const nodeContentData = {};
      if (mode === 'PRELIMS') {
        nodeContentData.prelimsNote = markdown;
      } else {
        nodeContentData.mainsNote = markdown;
      }

      await prisma.nodeContent.upsert({
        where: { issueId: String(issueId) },
        update: {
          ...nodeContentData,
          lastEditedBy: session.user.email || 'SYSTEM'
        },
        create: {
          issueId: String(issueId),
          ...nodeContentData,
          status: 'DRAFT',
          lastEditedBy: session.user.email || 'SYSTEM'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      markdown, 
      imagesProcessed: imagesCount 
    });

  } catch (error) {
    console.error('[GDOC INGEST FATAL ERROR]', error);
    return NextResponse.json({ 
      error: 'Ingestion server error', 
      msg: error.message 
    }, { status: 500 });
  }
}
