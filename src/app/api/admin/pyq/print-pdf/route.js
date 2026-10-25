import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getStructuredExplanation } from '@/lib/pyqExplanationHelper';
import { normalizeKeywordsList } from '@/lib/pyqKeywords';
import {
  getTopicModule,
  sortQuestionsBySyllabus,
  buildMicrothemeConditions
} from '@/lib/syllabusTaxonomy';

function normalizeOptions(opts) {
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'booklet'; // 'slide' | 'booklet'
    const ids = searchParams.get('ids');
    const exam = searchParams.get('exam') || 'ALL';       // 'UPSC CSE', 'CDS', or 'ALL'
    const stage = searchParams.get('stage') || 'PRELIMS'; // 'PRELIMS' | 'MAINS'
    const subject = searchParams.get('subject') || 'ALL';
    const topic = searchParams.get('topic') || 'ALL';
    const microtheme = searchParams.get('microtheme') || 'ALL';
    const year = searchParams.get('year') || 'ALL';
    const sort = searchParams.get('sort') || 'syllabus';  // 'syllabus' | 'exam'
    const search = (searchParams.get('q') || '').trim();
    const includeKey = searchParams.get('includeKey') !== 'false';
    const includeExpl = searchParams.get('includeExpl') !== 'false';
    const rawLimit = searchParams.get('limit');
    const parsedLimit = rawLimit && rawLimit !== 'ALL' ? parseInt(rawLimit, 10) : null;

    // Build query conditions
    const where = {};
    const andConditions = [];

    if (ids) {
      const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
      if (idList.length > 0) {
        where.id = { in: idList };
      }
    } else {
      if (exam !== 'ALL') {
        where.examName = { contains: exam === 'UPSC CSE' ? 'CSE' : exam, mode: 'insensitive' };
      }
      if (subject !== 'ALL') {
        where.srcSubject = subject;
      }
      if (topic !== 'ALL') {
        where.srcTopic = topic;
      }
      if (year !== 'ALL') {
        const parsedYear = parseInt(year, 10);
        if (!isNaN(parsedYear)) where.examYear = parsedYear;
      }

      if (search) {
        andConditions.push({
          OR: [
            { stem: { contains: search, mode: 'insensitive' } },
            { explanation: { contains: search, mode: 'insensitive' } }
          ]
        });
      }

      if (microtheme !== 'ALL') {
        const microCond = buildMicrothemeConditions(microtheme);
        if (microCond) {
          andConditions.push(microCond);
        }
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }
    }

    const findQuery = {
      where,
      orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
      select: {
        id: true,
        questionNo: true,
        examName: true,
        examYear: true,
        srcSubject: true,
        srcTopic: true,
        srcTheme: true,
        stem: true,
        options: true,
        correctLabel: true,
        explanation: true,
        difficulty: true
      }
    };

    // Only apply limit if explicitly provided as a positive number; otherwise print ALL matching questions
    if (!ids && parsedLimit && !isNaN(parsedLimit) && parsedLimit > 0) {
      findQuery.take = parsedLimit;
    }

    const questions = await prisma.questionDraft.findMany(findQuery);

    if (!questions || questions.length === 0) {
      return new NextResponse(
        `<!DOCTYPE html><html><head><title>No Questions Found</title>
        <style>body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style>
        </head><body><div style="text-align:center;padding:30px;background:#1e293b;border-radius:16px;max-width:500px;border:1px solid rgba(255,255,255,0.1);">
          <h2 style="color:#ef4444;margin-top:0;">No Matching Questions Found</h2>
          <p style="color:#94a3b8;font-size:14px;">Try loosening the filters or selecting questions using the checkbox in the Admin Panel.</p>
          <button onclick="window.close()" style="background:#3b82f6;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;margin-top:10px;">Close Window</button>
        </div></body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // Sort questions: canonical syllabus sequence (Foundations -> Executive -> Legislature...)
    // or chronological exam year based on the requested sort parameter
    const sortedQuestions = sort === 'syllabus'
      ? sortQuestionsBySyllabus(questions, subject !== 'ALL' ? subject : 'Indian Polity')
      : questions;

    if (mode === 'slide') {
      const html = buildSlideDocument({ questions: sortedQuestions });
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const html = buildExamDocument({
      exam,
      stage,
      subject,
      topic,
      microtheme,
      year,
      questions: sortedQuestions,
      includeKey,
      includeExpl
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('[Print PDF Error]:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function renderValueAdditionHtml(va, q) {
  if (!va) {
    return `
      <div class="va-twocol-grid">
        <div class="va-col">
          <div class="va-lead-bold">Topic Core: ${escapeHtml(q.srcTopic || q.srcSubject || 'General Studies')}</div>
          <p class="va-para">Systematic review of foundational NCERT frameworks, nodal ministries, and core conceptual distinctions required for high-order prelims elimination.</p>
        </div>
        <div class="va-col">
          <div class="va-lead-bold">Examiner Trend &amp; Linkages:</div>
          <p class="va-para">UPSC repeatedly tests adjacent operational guidelines, institutional governance, and statutory parameters from this syllabus branch in subsequent exam cycles.</p>
        </div>
      </div>
    `;
  }

  // Helper to parse unstructured text into structured columns with bold headers and bullets
  const parseBulletItems = (raw) => {
    const text = raw.trim();
    const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const items = [];
    for (const line of rawLines) {
      if (line.includes(' • ')) {
        const parts = line.split(/\s*•\s*/).filter(Boolean);
        for (const p of parts) {
          const cleaned = p.replace(/^[•*\-\s]+/, '').trim();
          if (cleaned) items.push(cleaned);
        }
      } else {
        const cleaned = line.replace(/^[•*\-\s]+/, '').trim();
        if (cleaned) items.push(cleaned);
      }
    }
    return items;
  };

  const formatTextIntoColumns = (raw) => {
    const text = raw.trim();

    // Check if the text contains multiple bullet points or distinct bulleted lines
    const bulletItems = parseBulletItems(text);
    if (bulletItems.length >= 2) {
      const half = Math.ceil(bulletItems.length / 2);
      const col1 = bulletItems.slice(0, half);
      const col2 = bulletItems.slice(half);
      return `
        <div class="va-twocol-grid">
          <div class="va-col">
            ${col1.map(item => `
              <div class="va-bullet-item">
                <span class="va-dot">•</span>
                <span>${formatBulletText(item)}</span>
              </div>
            `).join('')}
          </div>
          <div class="va-col">
            ${col2.map(item => `
              <div class="va-bullet-item">
                <span class="va-dot">•</span>
                <span>${formatBulletText(item)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Check if it has two logical paragraphs or double-newlines
    const parts = text.split(/\n\s*\n+/);
    if (parts.length >= 2) {
      return `
        <div class="va-twocol-grid">
          <div class="va-col">${formatVaBlock(parts[0])}</div>
          <div class="va-col">${formatVaBlock(parts.slice(1).join('\n\n'))}</div>
        </div>
      `;
    }

    // Check if the text describes a core framework with numbered points: (1)... (2)... (3)... (4)...
    const matchIntroAndPillars = text.match(/^(.*?)(?:\s*(?:\(1\)|1\.)\s*)(.*)$/s);
    if (matchIntroAndPillars && matchIntroAndPillars[2]) {
      const intro = matchIntroAndPillars[1].trim();
      const afterPillars = matchIntroAndPillars[2].trim();

      // Separate pillars from any trailing general factual context
      // e.g., "and (4) Climate Change... (CCSAMMN). Rainfed agriculture covers..."
      const splitByPoints = afterPillars.split(/\s*(?:\([2-9]\)|[2-9]\.)\s*/);
      const points = [splitByPoints[0]];
      let trailingContext = '';

      for (let i = 1; i < splitByPoints.length; i++) {
        const seg = splitByPoints[i];
        if (i === splitByPoints.length - 1) {
          // Check if there are trailing sentences after the last point
          // Usually ends with a period before a new sentence starts e.g., "(CCSAMMN). Rainfed agriculture..."
          const matchTrailing = seg.match(/^(.*?\))\.\s+([A-Z].*)$/s) || seg.match(/^(.*?\b[A-Za-z0-9_-]+)\.\s+([A-Z].*)$/s);
          if (matchTrailing) {
            points.push(matchTrailing[1].trim());
            trailingContext = matchTrailing[2].trim();
          } else {
            points.push(seg.trim());
          }
        } else {
          points.push(seg.trim());
        }
      }

      // Left Column: Intro + All functional pillars neatly bulleted
      // Right Column: Key Operational Parameters & Macro Statistics
      return `
        <div class="va-twocol-grid">
          <div class="va-col">
            ${intro ? `<div class="va-lead-bold">${escapeHtml(intro)}</div>` : ''}
            <ul class="va-bullet-list">
              ${points.map(pt => `<li>${formatBulletText(pt.replace(/,\s*and\s*$/, '').replace(/,\s*$/, ''))}</li>`).join('')}
            </ul>
          </div>
          <div class="va-col">
            ${trailingContext ? `
              <div class="va-lead-bold">Key Operational Dynamics &amp; Macro Coverage:</div>
              <p class="va-para">${formatBulletText(trailingContext)}</p>
            ` : `
              <div class="va-lead-bold">Implementation Framework:</div>
              <p class="va-para">Cluster-based convergence with micro-watershed development, financial risk insurance, and soil-health management protocols.</p>
            `}
          </div>
        </div>
      `;
    }

    // Split sentences into two columns
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    if (sentences.length >= 2) {
      const half = Math.ceil(sentences.length / 2);
      const col1 = sentences.slice(0, half).join(' ').trim();
      const col2 = sentences.slice(half).join(' ').trim();
      return `
        <div class="va-twocol-grid">
          <div class="va-col">${formatVaBlock(col1)}</div>
          <div class="va-col">${formatVaBlock(col2)}</div>
        </div>
      `;
    }

    return `<div class="va-col">${formatVaBlock(text)}</div>`;
  };

  const formatBulletText = (str) => {
    const escaped = escapeHtml(str);
    // Bold leading words before colon (up to 80 chars)
    const colonMatch = escaped.match(/^([^:]{3,80}:)(.*)$/s);
    if (colonMatch) {
      return `<strong>${colonMatch[1]}</strong>${colonMatch[2]}`;
    }
    // Or before an em-dash/en-dash
    const dashMatch = escaped.match(/^([^—–]{3,60}[—–])(.*)$/s);
    if (dashMatch) {
      return `<strong>${dashMatch[1]}</strong>${dashMatch[2]}`;
    }
    return escaped;
  };

  const formatVaBlock = (str) => {
    const lines = str.split(/\n+/).map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      if (/^[-•*]\s*/.test(line)) {
        return `<div class="va-bullet-item"><span class="va-dot">•</span> <span>${formatBulletText(line.replace(/^[-•*]\s*/, ''))}</span></div>`;
      }
      return `<p class="va-para">${formatBulletText(line)}</p>`;
    }).join('');
  };

  if (typeof va === 'string') {
    return formatTextIntoColumns(va);
  }

  if (Array.isArray(va)) {
    return `
      <div class="va-twocol-grid">
        ${va.map(item => {
          if (typeof item === 'string') {
            return `
              <div class="va-bullet-item">
                <span class="va-dot">•</span> <span>${formatBulletText(item)}</span>
              </div>
            `;
          }
          const bullets = item.bullets || item.points || item.items;
          return `
            <div class="va-col">
              ${item.title ? `<div class="va-lead-bold">${escapeHtml(item.title)} ${item.tag ? `<span class="va-tag">${escapeHtml(item.tag)}</span>` : ''}</div>` : ''}
              ${item.description ? `<p class="va-para">${escapeHtml(item.description)}</p>` : ''}
              ${Array.isArray(bullets) && bullets.length > 0 ? `
                <ul class="va-bullet-list">
                  ${bullets.map(pt => `<li>${formatBulletText(typeof pt === 'string' ? pt : JSON.stringify(pt))}</li>`).join('')}
                </ul>
              ` : ''}
              ${item.sections && Array.isArray(item.sections) ? item.sections.map(sec => `
                <div class="va-sec">
                  ${sec.heading ? `<div class="va-subhead">${escapeHtml(sec.heading)}</div>` : ''}
                  ${sec.points && Array.isArray(sec.points) ? `
                    <ul class="va-bullet-list">
                      ${sec.points.map(pt => `<li>${formatBulletText(pt)}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `).join('') : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Object with explicit left/right or columns or key-values
  if (typeof va === 'object' && va !== null) {
    if (va.columns && Array.isArray(va.columns)) {
      return `
        <div class="va-twocol-grid">
          ${va.columns.map(col => `
            <div class="va-col">
              ${col.heading ? `<div class="va-lead-bold">${escapeHtml(col.heading)}</div>` : ''}
              ${col.lead ? `<p class="va-para"><strong>${escapeHtml(col.lead)}</strong></p>` : ''}
              ${Array.isArray(col.points) ? `
                <ul class="va-bullet-list">
                  ${col.points.map(pt => `<li>${formatBulletText(pt)}</li>`).join('')}
                </ul>
              ` : col.text ? `<p class="va-para">${escapeHtml(col.text)}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  return `<div class="va-col"><p class="va-para">${escapeHtml(JSON.stringify(va))}</p></div>`;
}

function buildSlideDocument({ questions }) {
  const totalSlides = questions.length;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>UPSCGPT Prelims Slides (${totalSlides} Question${totalSlides > 1 ? 's' : ''})</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 4mm 6mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.35;
      background: #090d16;
    }

    /* Screen mode viewer canvas */
    @media screen {
      body {
        padding: 24px 16px 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
      }
      .slide-page {
        width: 297mm;
        height: 204mm;
        max-height: 204mm;
        background: #ffffff;
        border-radius: 8px;
        padding: 8mm 11mm;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
      }
      .no-print {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 297mm;
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        padding: 10px 20px;
        color: #ffffff;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
      }
    }

    /* Print mode: Exactly 1 sheet per question */
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .slide-page {
        width: 100% !important;
        height: 198mm !important;
        max-height: 198mm !important;
        page-break-after: always;
        break-after: page;
        overflow: hidden;
        margin: 0 !important;
        padding: 3mm 4mm !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
    }

    /* Header Bar */
    .slide-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding-bottom: 3px;
      border-bottom: 1.5px solid #e2e8f0;
    }
    .badge-exam-red {
      background: #dc2626;
      color: #ffffff;
      font-weight: 800;
      font-size: 9.5pt;
      padding: 3px 14px;
      border-radius: 9999px;
      letter-spacing: 0.3px;
      display: inline-block;
    }
    .slide-head-meta {
      font-size: 8pt;
      font-weight: 700;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Badges */
    .badge-pill {
      display: inline-block;
      font-size: 7.8pt;
      font-weight: 800;
      padding: 2px 9px;
      border-radius: 4px;
      letter-spacing: 0.2px;
      margin-bottom: 3px;
    }
    .badge-black { background: #0f172a; color: #ffffff; }
    .badge-teal { background: #0d9488; color: #ffffff; }
    .badge-slate { background: #334155; color: #ffffff; }
    .badge-cyan { background: #0284c7; color: #ffffff; }

    /* ========================================================================= */
    /* ASYMMETRIC 2-COLUMN SLIDE ARCHITECTURE (34% Left / 66% Right)             */
    /* ========================================================================= */
    .slide-body-split {
      display: grid;
      grid-template-columns: 34% 66%;
      gap: 16px;
      flex: 1;
      min-height: 0;
      align-items: stretch;
    }

    /* LEFT COLUMN (34%): Question -> Answer & Keywords -> In News */
    .slide-left-col {
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding-right: 8px;
      border-right: 1.5px solid #f1f5f9;
      min-height: 0;
      justify-content: flex-start;
    }
    .q-box-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .q-col-serif {
      font-family: "Times New Roman", Times, Georgia, "Liberation Serif", serif;
      color: #000000;
      line-height: 1.38;
    }
    .q-stem-serif {
      font-size: 9.4pt;
      font-weight: 600;
      white-space: pre-wrap;
      margin-bottom: 5px;
    }
    .q-opts-serif {
      font-size: 9pt;
      font-weight: 500;
      color: #111827;
      line-height: 1.32;
    }
    .q-opt-serif-line {
      margin-top: 2.5px;
    }

    /* Answer Badge (Right below Question Options) */
    .left-ans-box {
      margin-top: 2px;
    }
    .card-ans-green {
      background: #86efac;
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      color: #064e3b;
      font-size: 8.8pt;
      font-weight: 700;
      line-height: 1.28;
    }
    .ans-tag-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
      margin-bottom: 1px;
    }

    /* Keywords and Concepts Box (Right below Answer) */
    .left-kw-box {
      margin-top: 2px;
    }
    .card-kw-blue {
      background: #93c5fd;
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      color: #1e3a8a;
      font-size: 8.2pt;
      line-height: 1.28;
    }
    .kw-title {
      font-weight: 800;
      text-decoration: underline;
      margin-bottom: 3px;
      font-size: 8.4pt;
      color: #0f172a;
    }
    .kw-list {
      display: flex;
      flex-direction: column;
      gap: 1.5px;
    }
    .kw-row {
      line-height: 1.22;
    }
    .distractor-strike {
      text-decoration: line-through;
      color: #334155;
    }
    .distractor-tag {
      color: #dc2626;
      font-size: 7.2pt;
      font-weight: 800;
      margin-left: 3px;
    }

    /* In News Editorial Card (Bottom of Left Column) */
    .left-news-block {
      display: flex;
      flex-direction: column;
      margin-top: auto;
      padding-top: 4px;
    }
    .card-news-editorial {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 7px 10px;
      font-size: 8pt;
      color: #334155;
      line-height: 1.3;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .news-headline {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 9.4pt;
      font-weight: 800;
      color: #000000;
      line-height: 1.25;
      margin-bottom: 2px;
    }
    .news-dateline {
      font-size: 7.2pt;
      font-weight: 800;
      color: #0284c7;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .news-relevance {
      line-height: 1.28;
      color: #334155;
    }

    /* RIGHT COLUMN (66%): Dedicated High-Capacity Knowledge Hub */
    .slide-right-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: flex-start;
      min-height: 0;
    }

    /* Row 1: Option Breakdown (Pink Box) */
    .right-expl-block {
      display: flex;
      flex-direction: column;
    }
    .card-expl-pink {
      background: #fda4af;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      color: #881337;
      font-size: 8.3pt;
      line-height: 1.36;
    }
    .opt-row {
      margin-bottom: 4px;
    }
    .opt-row:last-child {
      margin-bottom: 0;
    }
    .verdict-correct {
      color: #065f46;
      font-weight: 800;
    }
    .verdict-incorrect {
      color: #991b1b;
      font-weight: 800;
    }

    /* Row 2: Value Addition (High Capacity Yellow Box across 66% width) */
    .right-va-block {
      display: flex;
      flex-direction: column;
    }
    .card-va-yellow {
      background: #fef08a;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      color: #451a03;
      font-size: 8.2pt;
      line-height: 1.36;
    }
    .va-twocol-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .va-col {
      display: flex;
      flex-direction: column;
      gap: 2.5px;
    }
    .va-lead-bold {
      font-weight: 800;
      color: #000000;
      font-size: 8.4pt;
      line-height: 1.28;
      margin-bottom: 2px;
    }
    .va-para {
      margin: 0 0 3px 0;
      line-height: 1.32;
      color: #292524;
    }
    .va-subhead {
      font-weight: 700;
      font-size: 8.2pt;
      color: #1c1917;
      margin-top: 2px;
      margin-bottom: 1px;
    }
    .va-bullet-list {
      margin: 1px 0 2px 0;
      padding-left: 14px;
      list-style-type: disc;
    }
    .va-bullet-list li {
      margin-bottom: 2px;
      line-height: 1.3;
      color: #1c1917;
    }
    .va-bullet-item {
      display: flex;
      align-items: baseline;
      gap: 5px;
      margin-bottom: 2px;
      line-height: 1.3;
      color: #1c1917;
    }
    .va-dot {
      color: #451a03;
      font-weight: 800;
      font-size: 9pt;
      line-height: 1;
    }
    .va-tag {
      background: rgba(0,0,0,0.08);
      font-size: 7.2pt;
      padding: 1px 5px;
      border-radius: 3px;
      margin-left: 4px;
      font-weight: 600;
    }

    /* Row 3: Similar PYQ (Sage Green Box) */
    .right-pyq-block {
      display: flex;
      flex-direction: column;
      margin-top: auto;
    }
    .card-pyq-green {
      background: #86efac;
      border: none;
      border-radius: 4px;
      padding: 7px 11px;
      color: #14532d;
      font-size: 8.1pt;
      line-height: 1.3;
    }
    .pyq-stem {
      margin-bottom: 2px;
    }
    .pyq-takeaway {
      background: rgba(255, 255, 255, 0.75);
      padding: 3px 7px;
      border-radius: 3px;
      font-size: 7.6pt;
      color: #065f46;
      font-weight: 700;
      margin-top: 3px;
    }

    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      padding-top: 4px;
      border-top: 1px solid #e2e8f0;
      font-size: 7.6pt;
      color: #64748b;
      font-weight: 700;
    }
    .footer-brand {
      color: #0f172a;
      font-weight: 800;
    }

    /* Screen Toolbar Buttons */
    .btn-print {
      background: #3b82f6;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 800;
      cursor: pointer;
    }
    .btn-print:hover { background: #2563eb; }
    .btn-close {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      margin-left: 8px;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong style="font-size: 1.1rem; color: #60a5fa;">UPSCGPT Lecture Slide Deck</strong>
      <span style="margin-left: 10px; color: #94a3b8; font-size: 0.85rem;">${totalSlides} Slide${totalSlides > 1 ? 's' : ''} • Landscape A4 Format</span>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">🖨️ Print Slides / Save PDF</button>
      <button class="btn-close" onclick="window.close()">✕ Close</button>
    </div>
  </div>

  ${questions.map((q, idx) => {
    const opts = normalizeOptions(q.options);
    const { explanationText, analysis } = getStructuredExplanation(q);

    const ansLabel = (q.correctLabel || '').toLowerCase().trim();
    const correctOpt = opts.find(o => (o.label || '').toLowerCase().trim() === ansLabel);
    const correctText = correctOpt ? correctOpt.text : (ansLabel ? `Option (${ansLabel})` : 'Verified Answer');

    const keywords = (analysis && Array.isArray(analysis.keywords) && analysis.keywords.length > 0)
      ? analysis.keywords
      : [q.srcSubject, q.srcTopic, q.srcTheme].filter(Boolean).map(c => ({ concept: c, isDistractor: false }));

    const optionBreakdown = (analysis && Array.isArray(analysis.optionBreakdown) && analysis.optionBreakdown.length > 0)
      ? analysis.optionBreakdown
      : null;

    const valueAddition = analysis ? analysis.valueAddition : null;
    const inNews = analysis ? analysis.inNews : null;
    const similarPyq = analysis ? analysis.similarPyq : null;
    const visualSuggestion = analysis ? analysis.visualSuggestion : null;

    const qSub = q.srcSubject || 'General Studies';
    const qModule = getTopicModule(qSub, q.srcTopic);

    return `
      <div class="slide-page">
        <!-- Slide Top Header -->
        <div class="slide-head">
          <span class="badge-exam-red">${escapeHtml(q.examName || 'UPSC Prelims')} ${q.examYear || ''}</span>
          <div class="slide-head-meta">
            <span>${escapeHtml(qSub)}</span>
            ${qModule && qModule !== 'General' ? `<span style="color:#f59e0b;font-weight:700;">› ${escapeHtml(qModule)}</span>` : ''}
            ${q.srcTopic ? `<span>›</span><span>${escapeHtml(q.srcTopic)}</span>` : ''}
            ${q.questionNo ? `<span>• Q#${q.questionNo}</span>` : ''}
          </div>
        </div>

        <!-- ASYMMETRIC 2-COLUMN SLIDE BODY (34% Left / 66% Right) -->
        <div class="slide-body-split">
          
          <!-- LEFT COLUMN (34%): Question -> Correct Answer -> Keywords -> In News -->
          <div class="slide-left-col">
            <div class="q-box-container">
              <div class="q-col-serif">
                <div class="q-stem-serif">${escapeHtml(q.stem || '')}</div>
                ${opts && opts.length > 0 ? `
                  <div class="q-opts-serif">
                    ${opts.map(o => `
                      <div class="q-opt-serif-line">
                        <strong>(${escapeHtml((o.label || '').toLowerCase())})</strong> ${escapeHtml(o.text || '')}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              <!-- Answer Badge (Right below Question Options) -->
              <div class="left-ans-box">
                <div class="card-ans-green">
                  <div class="ans-tag-label">Correct Answer</div>
                  <div><strong>(${escapeHtml(ansLabel || '–')})</strong> ${escapeHtml(correctText)}</div>
                </div>
              </div>

              <!-- Keywords and Concepts Box (Right below Answer) -->
              <div class="left-kw-box">
                <div class="card-kw-blue">
                  <div class="kw-title">Keywords and Concepts:</div>
                  <div class="kw-list">
                    ${normalizeKeywordsList(keywords)
                      .map(kw => `
                        <div class="kw-row">
                          - <strong>${escapeHtml(kw.term)}</strong>${kw.shortNote ? `: ${escapeHtml(kw.shortNote)}` : ''}
                        </div>
                      `)
                      .join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- In News Editorial Card (Strictly at bottom of Left Column) -->
            <div class="left-news-block">
              <div><span class="badge-pill badge-cyan">In News</span></div>
              <div class="card-news-editorial">
                ${inNews && typeof inNews === 'object' ? `
                  <div class="news-headline">${escapeHtml(inNews.headline || 'Current Affairs Development')}</div>
                  ${(inNews.source || inNews.date) ? `<div class="news-dateline">${escapeHtml(inNews.source || '')} ${inNews.date ? '• ' + escapeHtml(inNews.date) : ''}</div>` : ''}
                  ${inNews.relevance ? `<div class="news-relevance">${escapeHtml(inNews.relevance)}</div>` : ''}
                ` : `
                  <div class="news-headline">Current Affairs Linkage</div>
                  <div class="news-relevance">Regularly reported in The Hindu / Indian Express / DownToEarth under ${escapeHtml(q.srcTopic || q.srcSubject || 'General Studies')}.</div>
                `}
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (66%): High-Capacity Knowledge Hub (Explanation, Value Addition, Similar PYQ) -->
          <div class="slide-right-col">
            <!-- Row 1: Option Breakdown Box -->
            <div class="right-expl-block">
              <div><span class="badge-pill badge-black">Explanation</span></div>
              <div class="card-expl-pink">
                ${optionBreakdown ? optionBreakdown.map(opt => {
                  const isCorr = (opt.verdict || '').toLowerCase().includes('correct') && !(opt.verdict || '').toLowerCase().includes('incorrect');
                  return `
                    <div class="opt-row">
                      <strong>(${escapeHtml((opt.label || '').toLowerCase())}) ${opt.text ? escapeHtml(opt.text) + '. ' : ''}<span class="${isCorr ? 'verdict-correct' : 'verdict-incorrect'}">${escapeHtml(opt.verdict || (isCorr ? 'Correct' : 'Incorrect'))}.</span></strong>
                      <span>${escapeHtml(opt.explanation || '')}</span>
                    </div>
                  `;
                }).join('') : `
                  <div class="opt-row" style="white-space: pre-wrap;">${escapeHtml(explanationText || 'Detailed explanation provided in study module.')}</div>
                `}
              </div>
            </div>

            <!-- Row 2: Value Addition (Spanning full 66% width with internal 2-column grid) -->
            <div class="right-va-block">
              <div><span class="badge-pill badge-teal">Value Addition</span></div>
              <div class="card-va-yellow">
                ${renderValueAdditionHtml(valueAddition, q)}
              </div>
            </div>

            <!-- Row 3: Similar PYQ Sage Green Box -->
            <div class="right-pyq-block">
              <div><span class="badge-pill badge-slate">Similar PYQ</span></div>
              <div class="card-pyq-green">
                ${similarPyq && typeof similarPyq === 'object' ? `
                  <div class="pyq-stem">
                    <strong>${escapeHtml(similarPyq.examName || 'UPSC CSE')} ${escapeHtml(similarPyq.examYear ? String(similarPyq.examYear) : '')}:</strong>
                    ${escapeHtml(similarPyq.stem || '')}
                  </div>
                  ${similarPyq.keyTakeaway ? `
                    <div class="pyq-takeaway"><strong>Core Takeaway:</strong> ${escapeHtml(similarPyq.keyTakeaway)}</div>
                  ` : ''}
                ` : `
                  <div class="pyq-stem">
                    <strong>UPSC Question Family:</strong> Questions on ${escapeHtml(q.srcTopic || q.srcSubject || 'this theme')} frequently recur with modified distractors in subsequent exam cycles.
                  </div>
                `}
              </div>
            </div>

            <!-- Row 4: Comparison Matrix Table (if present) -->
            ${visualSuggestion && visualSuggestion.tableData && Array.isArray(visualSuggestion.tableData.headers) ? `
              <div class="right-table-block" style="margin-top: 8px;">
                <div><span class="badge-pill badge-blue">${escapeHtml(visualSuggestion.title || 'High-Yield Comparison Matrix')}</span></div>
                <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; margin-top: 4px; overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.68rem; text-align: left;">
                    <thead>
                      <tr style="background: #f1f5f9; border-bottom: 2px solid #3b82f6;">
                        ${visualSuggestion.tableData.headers.map(h => `<th style="padding: 5px 6px; font-weight: 800; color: #1e40af; text-transform: uppercase; font-size: 0.65rem;">${escapeHtml(h)}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${(visualSuggestion.tableData.rows || []).map((row, rIdx) => `
                        <tr style="border-bottom: 1px solid #e2e8f0; background: ${rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                          ${(Array.isArray(row) ? row : []).map(cell => `<td style="padding: 4px 6px; color: #334155; line-height: 1.35;">${escapeHtml(typeof cell === 'string' ? cell : JSON.stringify(cell))}</td>`).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  ${visualSuggestion.caption ? `<div style="font-size: 0.65rem; color: #64748b; font-style: italic; margin-top: 4px;">💡 ${escapeHtml(visualSuggestion.caption)}</div>` : ''}
                </div>
              </div>
            ` : ''}
          </div>

        </div>

        <!-- Slide Bottom Footer -->
        <div class="slide-footer">
          <div class="footer-brand">
            <span>UPSCGPT</span>
            <span style="font-weight: 500; color: #94a3b8; margin-left: 6px;">• High-Yield Preliminary Examination Architecture</span>
          </div>
          <div>Slide ${idx + 1} of ${totalSlides}</div>
        </div>
      </div>
    `;
  }).join('')}
</body>
</html>`;
}

function formatQuestionStem(stem) {
  if (!stem) return '';
  const lines = stem.split('\n');
  const result = [];
  let tableLines = [];

  function flushTable() {
    if (tableLines.length === 0) return;
    
    // Filter out markdown delimiter lines like |---|---|
    const validRows = tableLines
      .map(line => line.trim())
      .filter(line => !/^\|?[\s\-:]+(\|[\s\-:]+)+\|?$/.test(line))
      .map(line => {
        let clean = line.replace(/^\|/, '').replace(/\|$/, '');
        return clean.split('|').map(c => c.trim());
      });

    if (validRows.length > 0) {
      let tableHtml = '<table class="q-table">';
      // First row as header
      const header = validRows[0];
      tableHtml += '<thead><tr>' + header.map(h => '<th>' + h + '</th>').join('') + '</tr></thead>';
      
      // Subsequent rows as body
      if (validRows.length > 1) {
        tableHtml += '<tbody>';
        for (let i = 1; i < validRows.length; i++) {
          tableHtml += '<tr>' + validRows[i].map(c => '<td>' + c + '</td>').join('') + '</tr>';
        }
        tableHtml += '</tbody>';
      }
      tableHtml += '</table>';
      result.push(tableHtml);
    }
    tableLines = [];
  }

  for (let line of lines) {
    if (line.includes('|') && line.trim().length > 2) {
      tableLines.push(line);
    } else {
      flushTable();
      result.push(line);
    }
  }
  flushTable();

  return result.join('\n');
}

function getOptionBadgeClass(label) {
  const l = (label || '').toUpperCase().trim();
  if (l === 'A') return 'ans-badge-a';
  if (l === 'B') return 'ans-badge-b';
  if (l === 'C') return 'ans-badge-c';
  if (l === 'D') return 'ans-badge-d';
  return 'ans-badge-default';
}

function buildExamDocument({ exam, stage, subject, topic, microtheme, year, questions, includeKey, includeExpl }) {
  const isPrelims = stage === 'PRELIMS';
  const totalQuestions = questions.length;
  const marksPerQ = isPrelims ? (exam.includes('CDS') ? 0.83 : 2.0) : 10;
  const totalMarks = Math.round(totalQuestions * marksPerQ);
  const timeAllowed = isPrelims ? Math.max(15, Math.round(totalQuestions * 1.2)) : totalQuestions * 10;

  const headerTitle = exam === 'ALL' ? 'UPSC EXAMINATION' : (exam.toUpperCase().includes('CSE') ? 'UPSC CIVIL SERVICES (CSE)' : exam.toUpperCase());
  const examSubtitle = `${stage === 'PRELIMS' ? 'PRELIMS OBJECTIVE' : 'MAINS DESCRIPTIVE'} PYQ MASTER BOOKLET`;
  const themeDisplay = [
    subject !== 'ALL' ? subject : 'All Subjects',
    topic !== 'ALL' ? topic : null,
    microtheme !== 'ALL' ? microtheme : null,
    year !== 'ALL' ? `Year: ${year}` : null
  ].filter(Boolean).join('  •  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(exam)} - ${escapeHtml(subject)} [${escapeHtml(stage)}] Question Booklet (${totalQuestions} Qs)</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 11mm 14mm 11mm;
      @bottom-center {
        content: "Page " counter(page);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8.5pt;
        color: #1e3a8a;
        font-weight: 700;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      font-family: "Georgia", "Times New Roman", Times, serif;
      color: #0f172a;
      line-height: 1.38;
      font-size: 9.8pt;
      margin: 0;
      padding: 0 0 22px 0;
      background: #ffffff;
    }

    /* Floating Screen Action Bar (hidden in print) */
    .screen-actions {
      position: fixed;
      top: 14px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 10px 18px;
      border-radius: 14px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.45);
      display: flex;
      gap: 14px;
      align-items: center;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      border: 1.5px solid rgba(59, 130, 246, 0.4);
    }
    .screen-count-pill {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 12px;
    }
    .print-btn {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 9px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }
    .print-btn:hover { background: #1e40af; }

    /* Running Background Watermark (repeats on every page via position: fixed) */
    .watermark-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-32deg);
      z-index: -100;
      opacity: 0.045;
      text-align: center;
      pointer-events: none;
      user-select: none;
      width: 100%;
    }
    .watermark-main {
      font-size: 80pt;
      font-weight: 900;
      letter-spacing: 14px;
      color: #1e3a8a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    .watermark-sub {
      font-size: 14pt;
      font-weight: 800;
      letter-spacing: 3px;
      color: #1e3a8a;
      margin-top: -6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }

    /* Branded Top Header */
    .brand-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 10px;
      margin-bottom: 8px;
      background: linear-gradient(90deg, #eff6ff 0%, #f8fafc 50%, #fef3c7 100%);
      border: 1pt solid #bfdbfe;
      border-left: 4pt solid #2563eb;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8.2pt;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-badge {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: #ffffff;
      font-weight: 900;
      letter-spacing: 1.2px;
      padding: 2.5px 9px;
      border-radius: 4px;
      font-size: 8.5pt;
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
    }
    .brand-tagline {
      font-weight: 800;
      color: #1e40af;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-right {
      display: flex;
      gap: 10px;
      color: #334155;
      font-size: 7.8pt;
    }
    .brand-chip {
      background: #ffffff;
      border: 0.5pt solid #cbd5e1;
      padding: 1.5px 6px;
      border-radius: 4px;
    }
    .brand-chip strong {
      color: #0f172a;
    }

    /* Colourful Hero Examination Banner */
    .exam-header {
      text-align: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%);
      color: #ffffff;
      border-radius: 8px;
      padding: 10px 14px 9px 14px;
      margin-bottom: 9px;
      border-bottom: 3pt solid #f59e0b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .exam-title {
      font-size: 14pt;
      font-weight: 900;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #ffffff;
      margin: 0;
    }
    .exam-subtitle {
      display: inline-block;
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 1px;
      margin-top: 3px;
      padding: 1.5px 10px;
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.22);
      border: 0.8pt solid #fbbf24;
      color: #fde68a;
      text-transform: uppercase;
    }
    .theme-hierarchy {
      font-size: 9.8pt;
      font-weight: 800;
      color: #bae6fd;
      margin: 5px 0 7px 0;
      letter-spacing: 0.3px;
    }
    .meta-table {
      width: 100%;
      border-top: 0.8pt solid rgba(255, 255, 255, 0.22);
      padding-top: 6px;
      font-size: 8.5pt;
      font-weight: 800;
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .meta-pill {
      padding: 2.5px 10px;
      border-radius: 5px;
      letter-spacing: 0.4px;
    }
    .meta-pill-time {
      background: rgba(56, 189, 248, 0.2);
      border: 0.6pt solid rgba(125, 211, 252, 0.5);
      color: #e0f2fe;
    }
    .meta-pill-count {
      background: rgba(245, 158, 11, 0.25);
      border: 0.6pt solid rgba(251, 191, 36, 0.6);
      color: #fef3c7;
    }
    .meta-pill-marks {
      background: rgba(16, 185, 129, 0.22);
      border: 0.6pt solid rgba(110, 231, 183, 0.5);
      color: #d1fae5;
    }

    /* Colourful Candidate Instructions Callout */
    .instructions-strip {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8.2pt;
      background: linear-gradient(90deg, #fffbeb 0%, #fefce8 100%);
      border: 0.8pt solid #fcd34d;
      border-left: 4pt solid #f59e0b;
      padding: 6px 12px;
      margin-bottom: 11px;
      line-height: 1.35;
      color: #451a03;
      border-radius: 6px;
    }
    .instructions-title {
      font-weight: 900;
      margin-bottom: 2px;
      font-size: 8.2pt;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #b45309;
    }
    .instructions-list {
      margin: 0;
      padding-left: 16px;
    }
    .instructions-list li {
      margin-bottom: 1pt;
    }

    /* Layout Mode: 2-Column for Prelims MCQs */
    .paper-body.two-column {
      column-count: 2;
      column-gap: 13mm;
      column-rule: 1pt solid #cbd5e1;
      text-align: justify;
    }

    .paper-body.single-column {
      max-width: 100%;
    }

    /* Syllabus Module / Topic Section Divider */
    .syllabus-section-divider {
      break-inside: avoid;
      page-break-inside: avoid;
      margin: 11pt 0 7pt 0;
      padding: 5.5pt 9pt;
      background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
      border: 1pt solid #cbd5e1;
      border-left: 4.5pt solid #1e40af;
      border-radius: 5px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .ssd-module {
      font-size: 7.2pt;
      font-weight: 800;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 2pt;
    }
    .ssd-topic {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.2px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Question Item */
    .question-block {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 11pt;
      padding-bottom: 7pt;
      border-bottom: 0.6pt dashed #cbd5e1;
      position: relative;
    }
    .q-head {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin-bottom: 3.5pt;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }
    .q-num-badge {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 8.2pt;
      padding: 1pt 6pt;
      border-radius: 4px;
      letter-spacing: 0.3px;
    }
    .q-tags-right {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }
    .q-topic-tag {
      font-size: 7pt;
      background: #fdf4ff;
      color: #86198f;
      border: 0.5pt solid #f0abfc;
      padding: 0.8pt 5pt;
      border-radius: 3px;
      font-weight: 700;
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .q-source-tag {
      font-size: 7.4pt;
      background: #eef2ff;
      color: #3730a3;
      border: 0.6pt solid #c7d2fe;
      padding: 0.8pt 5.5pt;
      border-radius: 3px;
      font-weight: 800;
    }
    .q-source-tag.cds-tag {
      background: #ecfdf5;
      color: #065f46;
      border-color: #a7f3d0;
    }
    .q-stem {
      white-space: pre-line;
      margin-bottom: 4.5pt;
      color: #0f172a;
    }
    .q-stem table {
      white-space: normal;
    }
    .q-table {
      width: 100%;
      border-collapse: collapse;
      margin: 4pt 0 5pt 0;
      font-size: 8.4pt;
      line-height: 1.25;
      text-align: left;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .q-table th, .q-table td {
      border: 0.6pt solid #93c5fd;
      padding: 3pt 5pt;
      vertical-align: top;
    }
    .q-table th {
      background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%);
      font-weight: 700;
      color: #ffffff;
    }
    .q-table tbody tr:nth-child(even) td {
      background: #f0f7ff;
    }
    .q-table tbody tr:nth-child(odd) td {
      background: #ffffff;
    }

    /* MCQ Options Layout */
    .options-list {
      margin-top: 3pt;
      margin-left: 1pt;
    }
    .option-item {
      margin-bottom: 2.5pt;
      font-size: 9.2pt;
      line-height: 1.28;
      display: flex;
      align-items: baseline;
      gap: 5pt;
    }
    .opt-label {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 800;
      font-size: 7.8pt;
      background: #eff6ff;
      color: #1d4ed8;
      border: 0.6pt solid #bfdbfe;
      padding: 0.2pt 4pt;
      border-radius: 3px;
      flex-shrink: 0;
    }

    /* Mains Answer Writing Space */
    .mains-meta {
      font-size: 8.5pt;
      font-style: italic;
      color: #1e40af;
      font-weight: 700;
      margin-top: 2pt;
    }
    .mains-ruling {
      margin-top: 8pt;
      border-bottom: 0.6pt dotted #94a3b8;
      height: 24pt;
    }

    /* Separator / End of paper */
    .end-paper {
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 900;
      letter-spacing: 2px;
      margin: 16pt 0 10pt 0;
      font-size: 9pt;
      background: linear-gradient(90deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%);
      color: #1e3a8a;
      border-top: 1.5pt solid #3b82f6;
      border-bottom: 1.5pt solid #3b82f6;
      padding: 5pt 0;
      border-radius: 4px;
    }

    /* Running Footer on Every Printed Page */
    .running-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.4pt;
      color: #334155;
      border-top: 1.2pt solid #3b82f6;
      padding: 3px 6px 2px 6px;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 100;
    }
    .running-footer strong {
      color: #1e3a8a;
    }

    /* Key & Explanations: Starts on fresh page */
    .solution-booklet {
      break-before: page;
      page-break-before: always;
      padding-top: 6pt;
    }
    .solution-header {
      text-align: center;
      background: linear-gradient(135deg, #064e3b 0%, #047857 55%, #059669 100%);
      color: #ffffff;
      border-bottom: 3pt solid #f59e0b;
      padding: 8pt 12pt;
      margin-bottom: 10pt;
      font-size: 12pt;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-radius: 7px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .solution-sub {
      font-size: 8.2pt;
      font-weight: 700;
      color: #a7f3d0;
      margin-top: 2pt;
      letter-spacing: 0.4px;
    }

    .key-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4pt 6pt;
      background: #f8fafc;
      border: 1pt solid #cbd5e1;
      border-top: 2.5pt solid #059669;
      border-radius: 6px;
      padding: 7pt;
      margin-bottom: 14pt;
      font-size: 8.8pt;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .key-cell {
      background: #ffffff;
      border: 0.5pt solid #e2e8f0;
      border-radius: 4px;
      padding: 2.5pt 5pt;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .key-qnum {
      font-weight: 800;
      color: #334155;
    }
    .ans-badge {
      font-weight: 900;
      font-size: 8pt;
      padding: 0.5pt 5pt;
      border-radius: 3px;
    }
    .ans-badge-a { background: #dbeafe; color: #1e40af; border: 0.5pt solid #93c5fd; }
    .ans-badge-b { background: #d1fae5; color: #065f46; border: 0.5pt solid #6ee7b7; }
    .ans-badge-c { background: #ede9fe; color: #5b21b6; border: 0.5pt solid #c4b5fd; }
    .ans-badge-d { background: #fef3c7; color: #92400e; border: 0.5pt solid #fcd34d; }
    .ans-badge-default { background: #f1f5f9; color: #475569; border: 0.5pt solid #cbd5e1; }

    .expl-section-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 10.5pt;
      font-weight: 900;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin: 8pt 0 8pt 0;
      padding-bottom: 4pt;
      border-bottom: 1.5pt solid #3b82f6;
    }

    .expl-container.two-column-expl {
      column-count: 2;
      column-gap: 12mm;
      column-rule: 0.8pt solid #e2e8f0;
    }

    .expl-item {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 9pt;
      background: #f8fafc;
      border: 0.6pt solid #e2e8f0;
      border-left: 3pt solid #2563eb;
      border-radius: 5px;
      padding: 5pt 8pt;
      font-size: 8.8pt;
      line-height: 1.35;
    }
    .expl-item:nth-child(even) {
      border-left-color: #059669;
    }
    .expl-head {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3pt;
      padding-bottom: 2.5pt;
      border-bottom: 0.5pt solid #e2e8f0;
    }
    .expl-q-title {
      font-weight: 800;
      color: #0f172a;
      font-size: 8.5pt;
    }

    @media print {
      .screen-actions { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- Background Watermark (Repeats across all pages) -->
  <div class="watermark-container">
    <div class="watermark-main">UPSCGPT</div>
    <div class="watermark-sub">upscgpt.in • 7709495797 • nikhil@upscgpt.in</div>
  </div>

  <!-- Running Footer (Fixed at the bottom of every page) -->
  <div class="running-footer">
    <span>📞 Contact: <strong>+91 7709495797</strong></span>
    <span>🏛️ <strong>UPSCGPT.IN — PYQ Master Question Bank</strong></span>
    <span>✉️ Email: <strong>nikhil@upscgpt.in</strong></span>
  </div>

  <!-- Screen Top Bar (Hidden during printing) -->
  <div class="screen-actions">
    <span>Booklet Ready:</span>
    <span class="screen-count-pill">${totalQuestions} Questions Loaded</span>
    <button class="print-btn" onclick="window.print()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print / Save Colour PDF
    </button>
  </div>

  <!-- Branded Institution Header -->
  <div class="brand-top-bar">
    <div class="brand-left">
      <span class="brand-badge">UPSC GPT</span>
      <span class="brand-tagline">Complete Topic-Wise Archive</span>
    </div>
    <div class="brand-right">
      <span class="brand-chip">📞 <strong>+91 7709495797</strong></span>
      <span class="brand-chip">✉️ <strong>nikhil@upscgpt.in</strong></span>
      <span class="brand-chip">🌐 <strong>upscgpt.in</strong></span>
    </div>
  </div>

  <!-- Colourful Examination Header -->
  <div class="exam-header">
    <div class="exam-title">${escapeHtml(headerTitle)}</div>
    <div class="exam-subtitle">${escapeHtml(examSubtitle)}</div>
    <div class="theme-hierarchy">${escapeHtml(themeDisplay)}</div>
    <div class="meta-table">
      <span class="meta-pill meta-pill-time">⏱ TIME ALLOWED: ${timeAllowed} MINS</span>
      <span class="meta-pill meta-pill-count">📋 TOTAL QUESTIONS: ${totalQuestions}</span>
      <span class="meta-pill meta-pill-marks">🏆 MAXIMUM MARKS: ${totalMarks}</span>
    </div>
  </div>

  <div class="instructions-strip">
    <div class="instructions-title">⚡ Candidate Instructions:</div>
    <ol class="instructions-list">
      <li>This booklet contains <strong>all ${totalQuestions} archival questions</strong> matching the selected syllabus filter.</li>
      <li>For each wrong answer, <strong>one-third (0.33)</strong> of the marks assigned to that question will be deducted as penalty.</li>
      <li>Use a black ballpoint pen to darken the appropriate circle on your OMR response sheet.</li>
      <li>For mentorship, doubt resolution, or evaluation, contact <strong>nikhil@upscgpt.in</strong> or <strong>+91 7709495797</strong>.</li>
    </ol>
  </div>

  <!-- Questions Body -->
  <div class="paper-body ${isPrelims ? 'two-column' : 'single-column'}">
    ${(() => {
      let currentSectionKey = '';
      return questions.map((q, idx) => {
        const opts = normalizeOptions(q.options);
        const isCds = /cds/i.test(q.examName || exam);
        const qSub = q.srcSubject || subject || 'General Studies';
        const qTopic = q.srcTopic || 'General Topic';
        const qModule = getTopicModule(qSub, qTopic);
        const sectionKey = `${qSub}:::${qTopic}`;

        let sectionHeaderHtml = '';
        if (topic === 'ALL' && sectionKey !== currentSectionKey) {
          currentSectionKey = sectionKey;
          sectionHeaderHtml = `
            <div class="syllabus-section-divider">
              <div class="ssd-module">${escapeHtml(qSub)} • MODULE: ${escapeHtml(qModule)}</div>
              <div class="ssd-topic">
                <span>${escapeHtml(qTopic)}</span>
              </div>
            </div>
          `;
        }

        return `
          ${sectionHeaderHtml}
          <div class="question-block">
            <div class="q-head">
              <span class="q-num-badge">Q${idx + 1}</span>
              <div class="q-tags-right">
                ${q.srcTopic ? `<span class="q-topic-tag">${escapeHtml(q.srcTopic)}</span>` : ''}
                <span class="q-source-tag ${isCds ? 'cds-tag' : ''}">${escapeHtml(q.examName || exam)} ${q.examYear || ''}</span>
              </div>
            </div>
            <div class="q-stem">${formatQuestionStem(q.stem)}</div>

            ${isPrelims ? `
              <div class="options-list">
                ${opts.map(o => `
                  <div class="option-item">
                    <span class="opt-label">(${escapeHtml((o.label || '').toLowerCase())})</span>
                    <span>${escapeHtml(o.text)}</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="mains-meta">[Marks: 10 / 150 Words]</div>
              <div class="mains-ruling"></div>
              <div class="mains-ruling"></div>
            `}
          </div>
        `;
      }).join('');
    })()}
  </div>

  <div class="end-paper">★ ★ ★ END OF QUESTION PAPER (${totalQuestions} QUESTIONS) ★ ★ ★</div>

  <!-- Optional Detachable Solution Sheet -->
  ${includeKey ? `
    <div class="solution-booklet">
      <div class="solution-header">
        <div>OFFICIAL ANSWER KEY &amp; EXPLANATIONS</div>
        <div class="solution-sub">${escapeHtml(themeDisplay)} • Total Questions: ${totalQuestions}</div>
      </div>

      <!-- Quick Answer Matrix -->
      <div class="key-grid">
        ${questions.map((q, idx) => {
          const ans = (q.correctLabel || '-').toUpperCase().trim();
          const badgeClass = getOptionBadgeClass(ans);
          return `
            <div class="key-cell">
              <span class="key-qnum">Q${idx + 1}</span>
              <span class="ans-badge ${badgeClass}">(${escapeHtml(ans)})</span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Detailed Explanations -->
      ${includeExpl ? `
        <div class="expl-section-title">📘 Detailed Conceptual Explanations (Q1 – Q${totalQuestions})</div>
        <div class="expl-container two-column-expl">
          ${questions.map((q, idx) => {
            const ans = (q.correctLabel || '-').toUpperCase().trim();
            const badgeClass = getOptionBadgeClass(ans);
            return `
              <div class="expl-item">
                <div class="expl-head">
                  <span class="expl-q-title">Q${idx + 1} • ${escapeHtml(q.srcTopic || '')} • ${escapeHtml(q.examName || exam)} ${q.examYear || ''}</span>
                  <span class="ans-badge ${badgeClass}">Answer: (${escapeHtml(ans)})</span>
                </div>
                <div style="margin-top:2pt; color:#1e293b;">${formatQuestionStem(q.explanation || 'Detailed explanation not provided for this question.')}</div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  ` : ''}

  <script>
    window.addEventListener('load', () => {
      if (window.opener) {
        setTimeout(() => window.print(), 350);
      }
    });
  </script>
</body>
</html>`;
}
