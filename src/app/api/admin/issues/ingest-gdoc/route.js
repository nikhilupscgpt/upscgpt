import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import fs from 'fs';
import path from 'path';
import { safeFetch, SafeFetchError } from '@/lib/safeFetch';

// Only raster formats are stored (SVG can carry script → stored XSS from /uploads).
const IMAGE_EXT_BY_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB per image
const MAX_IMAGES = 50;                   // per document
const MAX_DOC_BYTES = 20 * 1024 * 1024;  // 20 MB HTML export

// Verify magic bytes so a mislabelled payload can't be stored under an image extension.
function sniffImageExt(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.slice(0, 6).toString('ascii') === 'GIF87a' || buf.slice(0, 6).toString('ascii') === 'GIF89a') return 'gif';
  if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'webp';
  return null;
}

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
    let response;
    try {
      response = await safeFetch(exportUrl, { maxBytes: MAX_DOC_BYTES });
    } catch (err) {
      console.error('[GDOC INGEST] Doc fetch failed:', err);
      return NextResponse.json({
        error: err instanceof SafeFetchError && err.code === 'TOO_LARGE'
          ? 'Document export is too large.'
          : 'Could not access document.'
      }, { status: 400 });
    }

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

      if (imagesCount >= MAX_IMAGES) {
        console.warn(`[GDOC INGEST] Image limit (${MAX_IMAGES}) reached; dropping remaining images.`);
        img.remove();
        continue;
      }

      try {
        let imgBuffer = null;
        let declaredExt = null;

        if (src.startsWith('data:')) {
          const base64Matches = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
          if (base64Matches) {
            declaredExt = IMAGE_EXT_BY_MIME[base64Matches[1].toLowerCase()] || null;
            // base64 expands 4/3; reject before decoding if clearly too big
            if (declaredExt && base64Matches[2].length <= Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 4) {
              imgBuffer = Buffer.from(base64Matches[2], 'base64');
            }
          }
        } else {
          const imgRes = await safeFetch(src, { maxBytes: MAX_IMAGE_BYTES });
          if (imgRes.ok) {
            const contentType = (imgRes.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
            declaredExt = IMAGE_EXT_BY_MIME[contentType] || null;
            if (declaredExt) imgBuffer = imgRes.buffer;
          }
        }

        const sniffedExt = imgBuffer ? sniffImageExt(imgBuffer) : null;
        if (!imgBuffer || imgBuffer.length > MAX_IMAGE_BYTES || !declaredExt || !sniffedExt) {
          console.warn('[GDOC INGEST] Skipping disallowed/oversized image');
          img.remove();
          continue;
        }

        imagesCount++;
        const filename = `gdoc_${docId}_${Date.now()}_${imagesCount}.${sniffedExt}`;
        const localPath = path.join(uploadDir, filename);

        fs.writeFileSync(localPath, imgBuffer);
        img.setAttribute('src', `/uploads/${filename}`);
      } catch (err) {
        console.error('Failed to download embedded Google Doc image:', err instanceof SafeFetchError ? err.code : err);
        // Leave the original src in place (same as previous behaviour) on network failure.
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
      error: 'Ingestion server error'
    }, { status: 500 });
  }
}
