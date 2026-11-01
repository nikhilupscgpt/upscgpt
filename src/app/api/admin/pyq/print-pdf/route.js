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
    const mode = searchParams.get('mode') || 'booklet'; // 'slide' | 'portrait' | 'booklet'
    const rawOrient = (searchParams.get('orientation') || '').toLowerCase();
    const orientation = (mode === 'portrait' || rawOrient === 'portrait') ? 'portrait' : 'landscape';
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

    if (mode === 'slide' || mode === 'portrait') {
      const html = buildSlideDocument({ questions: sortedQuestions, orientation });
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

function humaniseText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\bEconomic Concept Matrix\b/gi, 'Economic concept')
    .replace(/\bPolicy & Regulatory Architecture\b/gi, 'Policy')
    .replace(/\bRegulatory Framework for\b/gi, 'Regulation of')
    .replace(/\bHigh-order prelims elimination\b/gi, 'quick elimination')
    .replace(/\bsubsequent exam cycles\b/gi, 'future papers')
    .replace(/\bMinistry of Commerce and Industry\b/gi, 'MoCI')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatBulletText(str) {
  const cleaned = humaniseText(str);
  const escaped = escapeHtml(cleaned);
  const colonMatch = escaped.match(/^([^:]{2,75}:)(.*)$/s);
  if (colonMatch) {
    return `<strong>${colonMatch[1]}</strong>${colonMatch[2]}`;
  }
  const dashMatch = escaped.match(/^([^—–]{2,60}[—–])(.*)$/s);
  if (dashMatch) {
    return `<strong>${dashMatch[1]}</strong>${dashMatch[2]}`;
  }
  return escaped;
}

function renderValueAdditionHtml(va, q, existingKeywords = []) {
  const kwTerms = new Set(
    existingKeywords
      .map(k => (k.term || '').toLowerCase().replace(/\s*model\b/gi, '').trim())
      .filter(Boolean)
  );

  const isRedundantWithKeywords = (bulletStr, totalBulletsInGroup) => {
    if (totalBulletsInGroup <= 2 || kwTerms.size === 0) return false;
    const colonHead = (bulletStr.split(':')[0] || '').toLowerCase().replace(/\s*(?:model|marketing)\b/gi, '').trim();
    if (!colonHead || colonHead.length > 35) return false;
    for (const kt of kwTerms) {
      if (kt && (colonHead === kt || colonHead.includes(kt) || kt.includes(colonHead))) {
        return true;
      }
    }
    return false;
  };

  if (!va) {
    const topicLabel = escapeHtml(q.srcTopic || q.srcSubject || 'General Studies');
    return `
      <div class="va-stack">
        <div class="va-group">
          <div class="va-group-head">
            <span class="va-group-title">${topicLabel}</span>
            <span class="va-group-tag">· Core concept</span>
          </div>
          <ul class="va-list">
            <li><strong>What to remember:</strong> Focus on who holds decision-making power, how the mechanism works on the ground, and the exact NCERT or statutory definition.</li>
            <li><strong>How UPSC tests it:</strong> Questions often swap the nodal ministry, reverse a key condition, or mix up two closely related terms from this chapter.</li>
          </ul>
        </div>
      </div>
    `;
  }

  const parseBulletItems = (raw) => {
    const text = String(raw || '').trim();
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

  if (typeof va === 'string') {
    const items = parseBulletItems(va);
    return `
      <div class="va-stack">
        <div class="va-group">
          <div class="va-group-head">
            <span class="va-group-title">${escapeHtml(q.srcTopic || q.srcSubject || 'Key Concepts')}</span>
            <span class="va-group-tag">· Value addition</span>
          </div>
          <ul class="va-list">
            ${items.map(item => `<li>${formatBulletText(item)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  if (Array.isArray(va)) {
    return `
      <div class="va-stack">
        ${va.map(item => {
          if (typeof item === 'string') {
            return `<ul class="va-list"><li>${formatBulletText(item)}</li></ul>`;
          }
          const rawBullets = item.bullets || item.points || item.items || [];
          const filteredBullets = Array.isArray(rawBullets)
            ? rawBullets.filter(b => typeof b === 'string' && !isRedundantWithKeywords(b, rawBullets.length))
            : [];
          const finalBullets = filteredBullets.length > 0 ? filteredBullets : rawBullets;
          const cleanTitle = humaniseText(item.title || '');
          const cleanTag = humaniseText(item.tag || '');

          return `
            <div class="va-group">
              ${cleanTitle ? `
                <div class="va-group-head">
                  <span class="va-group-title">${escapeHtml(cleanTitle)}</span>
                  ${cleanTag ? `<span class="va-group-tag">· ${escapeHtml(cleanTag)}</span>` : ''}
                </div>
              ` : ''}
              ${item.description ? `<p class="va-para">${formatBulletText(item.description)}</p>` : ''}
              ${Array.isArray(finalBullets) && finalBullets.length > 0 ? `
                <ul class="va-list">
                  ${finalBullets.map(pt => `<li>${formatBulletText(typeof pt === 'string' ? pt : JSON.stringify(pt))}</li>`).join('')}
                </ul>
              ` : ''}
              ${item.sections && Array.isArray(item.sections) ? item.sections.map(sec => `
                <div class="va-subgroup">
                  ${sec.heading ? `<div class="va-group-head"><span class="va-group-title">${escapeHtml(humaniseText(sec.heading))}</span></div>` : ''}
                  ${sec.points && Array.isArray(sec.points) ? `
                    <ul class="va-list">
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

  if (typeof va === 'object' && va !== null && Array.isArray(va.columns)) {
    return `
      <div class="va-stack">
        ${va.columns.map(col => {
          const rawPts = Array.isArray(col.points) ? col.points : [];
          const filteredPts = rawPts.filter(b => typeof b === 'string' && !isRedundantWithKeywords(b, rawPts.length));
          const pts = filteredPts.length > 0 ? filteredPts : rawPts;
          return `
            <div class="va-group">
              ${col.heading ? `
                <div class="va-group-head">
                  <span class="va-group-title">${escapeHtml(humaniseText(col.heading))}</span>
                  ${col.tag ? `<span class="va-group-tag">· ${escapeHtml(humaniseText(col.tag))}</span>` : ''}
                </div>
              ` : ''}
              ${col.lead ? `<p class="va-para">${formatBulletText(col.lead)}</p>` : ''}
              ${pts.length > 0 ? `
                <ul class="va-list">
                  ${pts.map(pt => `<li>${formatBulletText(pt)}</li>`).join('')}
                </ul>
              ` : col.text ? `<p class="va-para">${formatBulletText(col.text)}</p>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return `<div class="va-stack"><p class="va-para">${escapeHtml(JSON.stringify(va))}</p></div>`;
}

function highlightKeyPhrasesInAnswer(text) {
  let html = escapeHtml(humaniseText(text));
  const highlightTargets = [
    'zero physical inventory',
    'fixes final retail prices',
    'fixes the retail price',
    'sets retail prices',
    'without stocking inventory',
    'wholly owned',
    'constitutional body',
    'statutory body'
  ];

  for (const phrase of highlightTargets) {
    const escapedPhrase = escapeHtml(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedPhrase})`, 'i');
    if (regex.test(html)) {
      html = html.replace(regex, '<strong>$1</strong>');
    }
  }
  return html;
}

function buildAnswerExplanationText(q, ansLabel, correctText, optionBreakdown, statementBreakdown, explanationText, analysis) {
  // 1. Check optionBreakdown for the correct option
  if (Array.isArray(optionBreakdown) && optionBreakdown.length > 0) {
    const corrOpt = optionBreakdown.find(o => (o.label || '').toLowerCase().trim() === ansLabel);
    if (corrOpt && corrOpt.explanation) {
      const cleaned = corrOpt.explanation.replace(/^(?:correct|true|right)[\s.:—–-]*/i, '').trim();
      if (cleaned) return highlightKeyPhrasesInAnswer(cleaned);
    }
  }

  // 2. If statementBreakdown has 1 item (single-choice question stored in statementBreakdown[0])
  if (Array.isArray(statementBreakdown) && statementBreakdown.length === 1 && statementBreakdown[0]?.explanation) {
    const cleaned = statementBreakdown[0].explanation.replace(/^(?:correct|true|right)[\s.:—–-]*/i, '').trim();
    if (cleaned) return highlightKeyPhrasesInAnswer(cleaned);
  }

  // 3. Check coreTakeaway
  if (analysis?.coreTakeaway && typeof analysis.coreTakeaway === 'string') {
    return highlightKeyPhrasesInAnswer(analysis.coreTakeaway.trim());
  }

  // 4. If multi-statement breakdown, summarize which statements are right
  if (Array.isArray(statementBreakdown) && statementBreakdown.length > 1) {
    const rightNums = statementBreakdown
      .filter(s => {
        const v = (s.verdict || '').toLowerCase();
        return v.includes('correct') && !v.includes('incorrect') && !v.includes('false');
      })
      .map(s => `Statement ${s.statementNo}`);
    const firstExpl = statementBreakdown[0]?.explanation || '';
    const shortFirst = firstExpl.split(/(?<=[.!?])\s+/)[0] || '';
    const prefix = rightNums.length > 0 ? `${rightNums.join(' and ')} ${rightNums.length === 1 ? 'is' : 'are'} correct. ` : '';
    return highlightKeyPhrasesInAnswer(`${prefix}${shortFirst}`.trim());
  }

  // 5. Fallback to first 2 sentences of explanationText
  if (explanationText) {
    const sentences = String(explanationText).trim().split(/(?<=[.!?])\s+/);
    return highlightKeyPhrasesInAnswer(sentences.slice(0, 2).join(' '));
  }

  return `<strong>${escapeHtml(correctText)}</strong> directly matches all conditions given in the question stem.`;
}

function buildSection4Html({ q, opts, ansLabel, optionBreakdown, statementBreakdown, keywords, valueAddition, visualSuggestion }) {
  // Determine if this is genuinely a multi-statement question
  const hasMultipleStatements = Array.isArray(statementBreakdown) && statementBreakdown.length > 1;

  if (hasMultipleStatements) {
    return {
      title: 'STATEMENT BREAKDOWN',
      html: `
        <div class="why-list">
          ${statementBreakdown.map(stmt => {
            const v = (stmt.verdict || '').toLowerCase();
            const isCorr = v.includes('correct') && !v.includes('incorrect') && !v.includes('false');
            const num = stmt.statementNo != null ? stmt.statementNo : '';
            const cleanExpl = humaniseText(stmt.explanation || '').replace(/^(?:correct|incorrect|true|false)[\s.:—–-]*/i, '');
            return `
              <div class="why-row">
                <strong class="${isCorr ? 'why-stmt-right' : 'why-stmt-wrong'}">Statement ${escapeHtml(String(num))} (${isCorr ? 'Correct' : 'Incorrect'})</strong> — ${escapeHtml(cleanExpl)}
              </div>
            `;
          }).join('')}
        </div>
      `
    };
  }

  // Direct MCQ: Build "WHY NOT OTHER OPTIONS" for each wrong option
  const wrongOpts = (opts || []).filter(o => (o.label || '').toLowerCase().trim() !== ansLabel);
  const kwList = normalizeKeywordsList(keywords || []);
  const tableRows = visualSuggestion?.tableData?.rows || [];

  const shortenOptName = (text) => {
    return String(text || '')
      .replace(/\s+Revenue\s+Model$/i, '')
      .replace(/\s+Business\s+Model$/i, '')
      .replace(/\s+Model$/i, '')
      .trim() || text;
  };

  const findReasonForWrongOpt = (opt) => {
    const lbl = (opt.label || '').toLowerCase().trim();
    const rawName = (opt.text || '').trim();
    const shortName = shortenOptName(rawName).toLowerCase();

    // 1. Check optionBreakdown
    if (Array.isArray(optionBreakdown)) {
      const found = optionBreakdown.find(ob => (ob.label || '').toLowerCase().trim() === lbl);
      if (found && found.explanation) {
        const cl = found.explanation
          .replace(/^(?:incorrect|false|wrong|eliminated)[\s.:—–-]*/i, '')
          .trim();
        if (cl && cl !== 'Contradicts statutory or institutional guidelines.' && cl !== 'Does not fit the specific rule or condition asked in the question.') {
          return humaniseText(cl);
        }
      }
    }

    // 2. Check comparison table rows
    if (Array.isArray(tableRows) && tableRows.length > 0) {
      const matchingRow = tableRows.find(r => Array.isArray(r) && r[0] && String(r[0]).toLowerCase().includes(shortName));
      if (matchingRow && matchingRow.length >= 2) {
        const details = matchingRow.slice(1).map(c => String(c || '').trim()).filter(Boolean);
        if (details.length >= 3) {
          return `price set by ${details[0].toLowerCase().replace(/^set by\s+/i, '')}; inventory held by ${details[1].toLowerCase()}; earns via ${details[2].toLowerCase()}.`;
        }
        if (details.length > 0) {
          return details.join('; ') + '.';
        }
      }
    }

    // 3. Check keywords list
    const matchingKw = kwList.find(k => (k.term || '').toLowerCase().includes(shortName));
    if (matchingKw && matchingKw.shortNote) {
      const firstSentence = matchingKw.shortNote.split(/(?<=[.!?])\s+/)[0];
      return humaniseText(firstSentence);
    }

    // 4. Fallback natural mentor line
    return `does not match the specific conditions described in the question stem.`;
  };

  if (wrongOpts.length === 0) {
    return {
      title: 'WHY NOT OTHER OPTIONS',
      html: `<div class="why-list"><div class="why-row">Check how the remaining options differ in who holds control, funding, or jurisdiction.</div></div>`
    };
  }

  return {
    title: 'WHY NOT OTHER OPTIONS',
    html: `
      <div class="why-list">
        ${wrongOpts.map(opt => {
          const lbl = escapeHtml((opt.label || '').toLowerCase().trim());
          const shortTitle = escapeHtml(shortenOptName(opt.text || ''));
          const reason = escapeHtml(findReasonForWrongOpt(opt));
          return `
            <div class="why-row">
              <strong class="why-opt-label">(${lbl}) ${shortTitle}</strong> — ${reason}
            </div>
          `;
        }).join('')}
      </div>
    `
  };
}

function buildSlideDocument({ questions, orientation = 'landscape' }) {
  const totalSlides = questions.length;
  const initOrient = orientation === 'portrait' ? 'portrait' : 'landscape';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>UPSCGPT Prelims Sheets (${totalSlides} Question${totalSlides > 1 ? 's' : ''})</title>
  <style id="page-orientation-style">
    @page {
      size: A4 ${initOrient};
      margin: 0;
    }
  </style>
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      line-height: 1.35;
      background: #0f172a;
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
        height: 210mm;
        max-height: 210mm;
        background: #ffffff;
        border-radius: 8px;
        padding: 7.5mm 10mm 6.5mm;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        position: relative;
        transition: width 0.2s ease, height 0.2s ease;
      }
      body[data-orientation="portrait"] .slide-page {
        width: 210mm;
        height: 297mm;
        max-height: 297mm;
        padding: 8mm 9.5mm 7mm;
      }
      .no-print {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 297mm;
        max-width: 96vw;
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        padding: 10px 20px;
        color: #ffffff;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
      }
      body[data-orientation="portrait"] .no-print {
        width: 210mm;
      }
    }

    /* Print mode: Exact A4 Landscape (297x210) or Portrait (210x297) */
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
        width: 297mm !important;
        height: 210mm !important;
        max-height: 210mm !important;
        page-break-after: always;
        break-after: page;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 7.5mm 10mm 6.5mm !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
      }
      body[data-orientation="portrait"] .slide-page {
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        padding: 8mm 9.5mm 7mm !important;
      }
    }

    /* ========================================================================= */
    /* TOP HEADER BAR                                                            */
    /* ========================================================================= */
    .slide-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 6px;
      margin-bottom: 8px;
      border-bottom: 2px solid #0f172a;
      flex-shrink: 0;
    }
    .slide-head-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .badge-exam-red {
      background: #dc2626;
      color: #ffffff;
      font-weight: 800;
      font-size: 8.8pt;
      padding: 2.5px 12px;
      border-radius: 999px;
      letter-spacing: 0.2px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .slide-breadcrumb {
      font-size: 8.6pt;
      color: #64748b;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .slide-breadcrumb strong {
      color: #0f172a;
      font-weight: 800;
    }
    .badge-qnum-dark {
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      font-size: 8.6pt;
      padding: 2.5px 12px;
      border-radius: 999px;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    /* ========================================================================= */
    /* LANDSCAPE (2-COLUMN) & PORTRAIT (UNIFIED EDITORIAL GRID) ARCHITECTURE     */
    /* ========================================================================= */
    .slide-body-split {
      --font-scale: 1;
      --col-gap: 7.5px;
      --card-pad-v: 7.5px;
      --card-pad-h: 11px;
      display: grid;
      grid-template-columns: 47.5% 1fr;
      gap: 18px;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      align-items: stretch;
    }

    .slide-col {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--col-gap);
      min-height: 0;
      overflow: hidden;
      transform-origin: top left;
    }

    /* PORTRAIT ORIENTATION OVERRIDES:
       Unifies the 8 sections into a clean A4 Portrait flow:
       - 1 Question (Full Width)
       - 2 Answer (Full Width)
       - 3 Keywords (Left 50%) | 4 Why Not Other Options (Right 50%)
       - 5 Value Addition (Full Width)
       - 6 In News (Full Width)
       - 7 Comparison Table (Full Width)
       - 8 Similar PYQ (Full Width)
    */
    body[data-orientation="portrait"] .slide-body-split {
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: max-content;
      gap: var(--col-gap) 12px;
      align-content: space-between;
    }
    body[data-orientation="portrait"] .slide-col {
      display: contents;
    }
    body[data-orientation="portrait"] .sec-1,
    body[data-orientation="portrait"] .sec-2,
    body[data-orientation="portrait"] .sec-5,
    body[data-orientation="portrait"] .sec-6,
    body[data-orientation="portrait"] .sec-7,
    body[data-orientation="portrait"] .sec-8 {
      grid-column: 1 / -1;
    }
    body[data-orientation="portrait"] .sec-3 {
      grid-column: 1 / 2;
    }
    body[data-orientation="portrait"] .sec-4 {
      grid-column: 2 / 3;
    }

    /* In Portrait mode, Section 1 spans the full 191mm page width, so 2x2 options fit comfortably unless an option is >105 chars */
    body[data-orientation="portrait"] .q-opts-grid.single-col:not(.single-col-portrait) {
      grid-template-columns: 1fr 1fr;
      gap: calc(4.5px * var(--font-scale));
    }

    .sec-block {
      display: flex;
      flex-direction: column;
      gap: calc(3.5px * var(--font-scale));
      flex-shrink: 0;
    }

    /* Numbered Section Header (1..8) */
    .sec-head {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .sec-num {
      width: calc(15.5px * var(--font-scale));
      height: calc(15.5px * var(--font-scale));
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: calc(7pt * var(--font-scale));
      font-weight: 800;
      color: #ffffff;
      flex-shrink: 0;
    }
    .sec-title {
      font-size: calc(7.3pt * var(--font-scale));
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .sec-line {
      flex: 1;
      height: 1px;
      background: #e2e8f0;
      margin-left: 4px;
    }

    /* Section Color Themes */
    .sec-1 .sec-num { background: #2563eb; }
    .sec-1 .sec-title { color: #1d4ed8; }
    .sec-1 .sec-line { background: #dbeafe; }

    .sec-2 .sec-num { background: #16a34a; }
    .sec-2 .sec-title { color: #15803d; }
    .sec-2 .sec-line { background: #bbf7d0; }

    .sec-3 .sec-num { background: #0284c7; }
    .sec-3 .sec-title { color: #0369a1; }
    .sec-3 .sec-line { background: #bae6fd; }

    .sec-4 .sec-num { background: #ea580c; }
    .sec-4 .sec-title { color: #c2410c; }
    .sec-4 .sec-line { background: #fed7aa; }

    .sec-5 .sec-num { background: #b45309; }
    .sec-5 .sec-title { color: #92400e; }
    .sec-5 .sec-line { background: #fde68a; }

    .sec-6 .sec-num { background: #7c3aed; }
    .sec-6 .sec-title { color: #6d28d9; }
    .sec-6 .sec-line { background: #e9d5ff; }

    .sec-7 .sec-num { background: #0f766e; }
    .sec-7 .sec-title { color: #0f766e; }
    .sec-7 .sec-line { background: #99f6e4; }

    .sec-8 .sec-num { background: #be123c; }
    .sec-8 .sec-title { color: #be123c; }
    .sec-8 .sec-line { background: #fecdd3; }

    /* ========================================================================= */
    /* SECTION 1: QUESTION CARD                                                  */
    /* ========================================================================= */
    .card-question {
      background: #f8fafc;
      border: 1px solid #dbeafe;
      border-radius: 9px;
      padding: var(--card-pad-v) var(--card-pad-h);
      display: flex;
      flex-direction: column;
      gap: calc(5.5px * var(--font-scale));
    }
    .q-stem-serif {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: calc(9.4pt * var(--font-scale));
      line-height: 1.36;
      color: #0f172a;
      font-weight: 500;
      white-space: pre-line;
    }
    .q-opts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: calc(4.5px * var(--font-scale));
    }
    .q-opts-grid.single-col {
      grid-template-columns: 1fr;
      gap: calc(3.8px * var(--font-scale));
    }
    .q-opt-pill {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: calc(4px * var(--font-scale)) calc(7.5px * var(--font-scale));
      display: flex;
      align-items: center;
      gap: calc(6.5px * var(--font-scale));
    }
    .q-opt-badge {
      width: calc(16.5px * var(--font-scale));
      height: calc(16.5px * var(--font-scale));
      border-radius: 4px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-weight: 800;
      font-size: calc(7.3pt * var(--font-scale));
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .q-opt-text {
      font-size: calc(8.2pt * var(--font-scale));
      color: #0f172a;
      font-weight: 500;
      line-height: 1.22;
    }
    .your-ans-row {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-left: 6px;
      flex-shrink: 0;
    }
    .your-ans-label {
      font-size: calc(7pt * var(--font-scale));
      font-weight: 700;
      color: #2563eb;
    }
    .your-ans-box {
      width: calc(24px * var(--font-scale));
      height: calc(14.5px * var(--font-scale));
      border: 1.2px solid #60a5fa;
      border-radius: 4px;
      background: #ffffff;
    }

    /* ========================================================================= */
    /* SECTION 2: ANSWER CARD                                                    */
    /* ========================================================================= */
    .card-answer {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 9px;
      padding: var(--card-pad-v) var(--card-pad-h);
      display: flex;
      flex-direction: column;
      gap: calc(3.5px * var(--font-scale));
    }
    .ans-header-line {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .ans-pill-green {
      background: #15803d;
      color: #ffffff;
      font-weight: 800;
      font-size: calc(8.1pt * var(--font-scale));
      padding: 1px 6px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .ans-opt-title {
      font-size: calc(9pt * var(--font-scale));
      font-weight: 800;
      color: #14532d;
    }
    .ans-expl-body {
      font-size: calc(8.1pt * var(--font-scale));
      line-height: 1.34;
      color: #1e293b;
    }
    .ans-expl-body strong {
      color: #0f172a;
      font-weight: 700;
    }

    /* ========================================================================= */
    /* SECTION 3: KEYWORDS CARD (Full Width)                                     */
    /* ========================================================================= */
    .card-kw-defs {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 9px;
      padding: var(--card-pad-v) var(--card-pad-h);
      display: flex;
      flex-direction: column;
      gap: calc(4px * var(--font-scale));
      font-size: calc(7.9pt * var(--font-scale));
      line-height: 1.32;
      color: #1e293b;
      flex: 1;
    }
    .kw-def-item strong {
      color: #0369a1;
      font-weight: 800;
    }

    /* ========================================================================= */
    /* SECTION 4: WHY NOT OTHER OPTIONS                                          */
    /* ========================================================================= */
    .card-why {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 9px;
      padding: var(--card-pad-v) var(--card-pad-h);
      flex: 1;
    }
    .why-list {
      display: flex;
      flex-direction: column;
      gap: calc(3.2px * var(--font-scale));
      font-size: calc(7.9pt * var(--font-scale));
      line-height: 1.32;
      color: #1e293b;
    }
    .why-opt-label {
      color: #9a3412;
      font-weight: 800;
    }
    .why-stmt-right {
      color: #15803d;
      font-weight: 800;
    }
    .why-stmt-wrong {
      color: #b91c1c;
      font-weight: 800;
    }

    /* ========================================================================= */
    /* SECTION 5: VALUE ADDITION                                                 */
    /* ========================================================================= */
    .card-va {
      background: #fefce8;
      border: 1px solid #fde68a;
      border-radius: 9px;
      padding: var(--card-pad-v) var(--card-pad-h);
      font-size: calc(8pt * var(--font-scale));
      line-height: 1.33;
      color: #1c1917;
    }
    .va-stack {
      display: flex;
      flex-direction: column;
      gap: calc(5px * var(--font-scale));
    }
    .va-group {
      display: flex;
      flex-direction: column;
      gap: calc(2px * var(--font-scale));
    }
    .va-group-head {
      display: flex;
      align-items: baseline;
      gap: 5px;
      flex-wrap: wrap;
    }
    .va-group-title {
      font-weight: 800;
      color: #92400e;
      font-size: calc(8.2pt * var(--font-scale));
    }
    .va-group-tag {
      font-size: calc(7.2pt * var(--font-scale));
      color: #b45309;
      font-weight: 600;
    }
    .va-list {
      margin: 0;
      padding-left: 14px;
      display: flex;
      flex-direction: column;
      gap: calc(2px * var(--font-scale));
    }
    .va-list li {
      line-height: 1.32;
      color: #1e293b;
    }
    .va-list li strong {
      color: #0f172a;
    }
    .va-para {
      margin: 0;
      line-height: 1.32;
      color: #1e293b;
    }

    /* ========================================================================= */
    /* SECTION 6: IN NEWS                                                        */
    /* ========================================================================= */
    .card-news {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 9px;
      padding: var(--card-pad-v) var(--card-pad-h);
      display: flex;
      flex-direction: column;
      gap: calc(2px * var(--font-scale));
    }
    .news-dateline {
      font-size: calc(6.9pt * var(--font-scale));
      font-weight: 800;
      color: #7c3aed;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .news-headline {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: calc(9pt * var(--font-scale));
      font-weight: 700;
      color: #0f172a;
      line-height: 1.24;
    }
    .news-relevance {
      font-size: calc(7.9pt * var(--font-scale));
      line-height: 1.3;
      color: #334155;
    }

    /* ========================================================================= */
    /* SECTION 7: COMPARISON TABLE                                               */
    /* ========================================================================= */
    .comp-table-wrap {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
    }
    .comp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: calc(7.7pt * var(--font-scale));
      text-align: left;
    }
    .comp-table thead tr {
      background: #065f46;
      color: #ffffff;
    }
    .comp-table th {
      padding: calc(4px * var(--font-scale)) calc(7.5px * var(--font-scale));
      font-size: calc(6.8pt * var(--font-scale));
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-right: 1px solid rgba(255, 255, 255, 0.15);
    }
    .comp-table th:last-child {
      border-right: none;
    }
    .comp-table td {
      padding: calc(3.5px * var(--font-scale)) calc(7.5px * var(--font-scale));
      border-top: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      color: #1e293b;
      line-height: 1.24;
    }
    .comp-table td:first-child {
      font-weight: 700;
      color: #0f172a;
    }
    .comp-table td:last-child {
      border-right: none;
    }
    .comp-table tr.is-correct-row td {
      background: #d1fae5;
      color: #064e3b;
      font-weight: 700;
    }

    /* ========================================================================= */
    /* SECTION 8: SIMILAR PYQ                                                    */
    /* ========================================================================= */
    .card-similar {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 9px;
      padding: var(--card-pad-v) var(--card-pad-h);
      font-size: calc(8pt * var(--font-scale));
      line-height: 1.33;
      color: #1e293b;
    }
    .card-similar strong {
      color: #881337;
    }

    /* ========================================================================= */
    /* FOOTER                                                                    */
    /* ========================================================================= */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      padding-top: 4px;
      border-top: 1px solid #cbd5e1;
      font-size: 7.5pt;
      color: #64748b;
      font-weight: 600;
      flex-shrink: 0;
    }
    .footer-brand strong {
      color: #1d4ed8;
      font-weight: 800;
    }

    /* Screen Toolbar Buttons */
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .orient-toggle-group {
      display: inline-flex;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 3px;
      gap: 4px;
    }
    .btn-orient {
      background: transparent;
      color: #94a3b8;
      border: none;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-orient.active {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-print {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 800;
      cursor: pointer;
    }
    .btn-print:hover { background: #059669; }
    .btn-close {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body data-orientation="${initOrient}">
  <div class="no-print">
    <div>
      <strong style="font-size: 1.05rem; color: #60a5fa;">UPSCGPT 8-Block Deep-Dive Sheets</strong>
      <span id="orient-status-label" style="margin-left: 10px; color: #94a3b8; font-size: 0.85rem;">${totalSlides} Sheet${totalSlides > 1 ? 's' : ''} • Auto-Fitted ${initOrient === 'portrait' ? 'Portrait A4' : 'Landscape A4'}</span>
    </div>
    <div class="toolbar-right">
      <div class="orient-toggle-group">
        <button id="btn-orient-landscape" class="btn-orient ${initOrient === 'landscape' ? 'active' : ''}" onclick="setPageOrientation('landscape')">📐 Landscape A4</button>
        <button id="btn-orient-portrait" class="btn-orient ${initOrient === 'portrait' ? 'active' : ''}" onclick="setPageOrientation('portrait')">📄 Portrait A4</button>
      </div>
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
      <button class="btn-close" onclick="window.close()">✕ Close</button>
    </div>
  </div>

  ${questions.map((q, idx) => {
    const opts = normalizeOptions(q.options);
    const { explanationText, analysis } = getStructuredExplanation(q);

    const ansLabel = (q.correctLabel || 'a').toLowerCase().trim();
    const correctOpt = opts.find(o => (o.label || '').toLowerCase().trim() === ansLabel);
    const correctText = correctOpt ? correctOpt.text : (ansLabel ? `Option (${ansLabel})` : 'Verified Answer');

    const rawKeywords = (analysis && Array.isArray(analysis.keywords) && analysis.keywords.length > 0)
      ? analysis.keywords
      : [q.srcSubject, q.srcTopic, q.srcTheme].filter(Boolean).map(c => ({ concept: c, isDistractor: false }));
    const normalizedKeywords = normalizeKeywordsList(rawKeywords);

    const optionBreakdown = (analysis && Array.isArray(analysis.optionBreakdown) && analysis.optionBreakdown.length > 0)
      ? analysis.optionBreakdown
      : null;

    const statementBreakdown = (analysis && Array.isArray(analysis.statementBreakdown) && analysis.statementBreakdown.length > 0)
      ? analysis.statementBreakdown
      : null;

    const valueAddition = analysis ? analysis.valueAddition : null;
    const inNews = analysis ? analysis.inNews : null;
    const similarPyq = analysis ? analysis.similarPyq : null;
    const visualSuggestion = analysis ? analysis.visualSuggestion : null;

    const qSub = q.srcSubject || 'General Studies';
    const qModule = getTopicModule(qSub, q.srcTopic);

    // Smart option grid layout: 2x2 if options are concise, 1-col if any option is long
    const maxOptLen = opts.reduce((max, o) => Math.max(max, String(o.text || '').length), 0);
    const useSingleColOpts = maxOptLen > 52 || opts.length !== 4;
    const useSingleColPortrait = maxOptLen > 105 || opts.length !== 4;

    // Build concise Answer explanation
    const answerExplanationHtml = buildAnswerExplanationText(
      q, ansLabel, correctText, optionBreakdown, statementBreakdown, explanationText, analysis
    );

    // Build Section 4 ("WHY NOT OTHER OPTIONS" or "STATEMENT BREAKDOWN")
    const section4 = buildSection4Html({
      q, opts, ansLabel, optionBreakdown, statementBreakdown,
      keywords: rawKeywords, valueAddition, visualSuggestion
    });

    // Check if Comparison Table exists
    const hasTable = Boolean(
      visualSuggestion &&
      visualSuggestion.tableData &&
      Array.isArray(visualSuggestion.tableData.headers) &&
      visualSuggestion.tableData.headers.length > 0 &&
      Array.isArray(visualSuggestion.tableData.rows) &&
      visualSuggestion.tableData.rows.length > 0
    );

    const similarSecNum = hasTable ? 8 : 7;

    // Clean exam badge text
    const examBadgeText = `${(q.examName || 'UPSC CSE Prelims').replace(/\bPre\b/i, 'Prelims')} ${q.examYear || ''}`.trim();
    const qNumBadgeText = `Q #${q.questionNo || (idx + 1)}`;

    // Short keyword for matching the correct row in the comparison table
    const correctShortKey = String(correctText || '')
      .replace(/\s+(?:Revenue|Business)?\s*Model$/i, '')
      .trim()
      .toLowerCase();

    return `
      <div class="slide-page">
        <!-- TOP HEADER BAR -->
        <div class="slide-head">
          <div class="slide-head-left">
            <span class="badge-exam-red">${escapeHtml(examBadgeText)}</span>
            <div class="slide-breadcrumb">
              <span>${escapeHtml(qSub)}</span>
              ${qModule && qModule !== 'General' ? `<span>›</span><span>${escapeHtml(qModule)}</span>` : ''}
              ${q.srcTopic ? `<span>›</span><strong>${escapeHtml(q.srcTopic)}</strong>` : ''}
            </div>
          </div>
          <span class="badge-qnum-dark">${escapeHtml(qNumBadgeText)}</span>
        </div>

        <!-- 8-BLOCK BODY -->
        <div class="slide-body-split">

          <!-- LEFT GROUP: 1 QUESTION, 2 ANSWER, 3 KEYWORDS, 4 WHY NOT OTHER OPTIONS -->
          <div class="slide-col slide-left-col">

            <!-- 1. QUESTION -->
            <div class="sec-block sec-1">
              <div class="sec-head">
                <span class="sec-num">1</span>
                <span class="sec-title">QUESTION</span>
                <span class="sec-line"></span>
                <div class="your-ans-row">
                  <span class="your-ans-label">Your answer</span>
                  <span class="your-ans-box"></span>
                </div>
              </div>
              <div class="card-question">
                <div class="q-stem-serif">${escapeHtml((q.stem || '').trim())}</div>
                ${opts.length > 0 ? `
                  <div class="q-opts-grid ${useSingleColOpts ? 'single-col' : ''} ${useSingleColPortrait ? 'single-col-portrait' : ''}">
                    ${opts.map(o => `
                      <div class="q-opt-pill">
                        <span class="q-opt-badge">${escapeHtml((o.label || '').toLowerCase())}</span>
                        <span class="q-opt-text">${escapeHtml(o.text || '')}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- 2. ANSWER -->
            <div class="sec-block sec-2">
              <div class="sec-head">
                <span class="sec-num">2</span>
                <span class="sec-title">ANSWER</span>
                <span class="sec-line"></span>
              </div>
              <div class="card-answer">
                <div class="ans-header-line">
                  <span class="ans-pill-green">(${escapeHtml(ansLabel)})</span>
                  <span class="ans-opt-title">${escapeHtml(correctText)}</span>
                </div>
                <div class="ans-expl-body">${answerExplanationHtml}</div>
              </div>
            </div>

            <!-- 3. KEYWORDS -->
            <div class="sec-block sec-3">
              <div class="sec-head">
                <span class="sec-num">3</span>
                <span class="sec-title">KEYWORDS</span>
                <span class="sec-line"></span>
              </div>
              <div class="card-kw-defs">
                ${normalizedKeywords.slice(0, 4).map(kw => {
                  const cleanTerm = escapeHtml(humaniseText(kw.term).replace(/\s+Revenue\s+Model$/i, ' model'));
                  const cleanNote = escapeHtml(humaniseText(kw.shortNote || 'Key concept tested in this question.'));
                  return `
                    <div class="kw-def-item">
                      <strong>${cleanTerm}:</strong> ${cleanNote}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 4. WHY NOT OTHER OPTIONS / STATEMENT BREAKDOWN -->
            <div class="sec-block sec-4">
              <div class="sec-head">
                <span class="sec-num">4</span>
                <span class="sec-title">${escapeHtml(section4.title)}</span>
                <span class="sec-line"></span>
              </div>
              <div class="card-why">
                ${section4.html}
              </div>
            </div>

          </div>

          <!-- RIGHT GROUP: 5 VALUE ADDITION, 6 IN NEWS, 7 COMPARISON, 8 SIMILAR PYQ -->
          <div class="slide-col slide-right-col">

            <!-- 5. VALUE ADDITION -->
            <div class="sec-block sec-5">
              <div class="sec-head">
                <span class="sec-num">5</span>
                <span class="sec-title">VALUE ADDITION</span>
                <span class="sec-line"></span>
              </div>
              <div class="card-va">
                ${renderValueAdditionHtml(valueAddition, q, normalizedKeywords)}
              </div>
            </div>

            <!-- 6. IN NEWS -->
            <div class="sec-block sec-6">
              <div class="sec-head">
                <span class="sec-num">6</span>
                <span class="sec-title">IN NEWS</span>
                <span class="sec-line"></span>
              </div>
              <div class="card-news">
                ${inNews && typeof inNews === 'object' ? `
                  ${(inNews.source || inNews.date) ? `
                    <div class="news-dateline">
                      ${escapeHtml(humaniseText(inNews.source || ''))}${inNews.date ? ' · ' + escapeHtml(inNews.date) : ''}
                    </div>
                  ` : ''}
                  <div class="news-headline">${escapeHtml(humaniseText(inNews.headline || 'Recent Policy & Current Affairs Context'))}</div>
                  ${inNews.relevance ? `<div class="news-relevance">${escapeHtml(humaniseText(inNews.relevance))}</div>` : ''}
                ` : `
                  <div class="news-dateline">CURRENT AFFAIRS LINKAGE</div>
                  <div class="news-headline">Why ${escapeHtml(q.srcTopic || q.srcSubject || 'this topic')} stays in the news</div>
                  <div class="news-relevance">Frequently tracked in PIB, The Hindu, and official ministry updates whenever rules or institutional mandates are revised.</div>
                `}
              </div>
            </div>

            <!-- 7. COMPARISON (Rendered when tableData exists) -->
            ${hasTable ? `
              <div class="sec-block sec-7">
                <div class="sec-head">
                  <span class="sec-num">7</span>
                  <span class="sec-title">COMPARISON</span>
                  <span class="sec-line"></span>
                </div>
                <div class="comp-table-wrap">
                  <table class="comp-table">
                    <thead>
                      <tr>
                        ${visualSuggestion.tableData.headers.map(h => {
                          const shortHeader = humaniseText(h)
                            .replace(/^BUSINESS MODEL$/i, 'MODEL')
                            .replace(/^PRICING CONTROL$/i, 'SETS PRICE')
                            .replace(/^INVENTORY OWNERSHIP$/i, 'HOLDS STOCK')
                            .replace(/^PRIMARY REVENUE STREAM$/i, 'EARNS FROM');
                          return `<th>${escapeHtml(shortHeader)}</th>`;
                        }).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${visualSuggestion.tableData.rows.map((row) => {
                        const cells = Array.isArray(row) ? row : [];
                        const firstCell = String(cells[0] || '').toLowerCase();
                        const isCorrectRow = correctShortKey.length >= 3 && firstCell.includes(correctShortKey);
                        return `
                          <tr class="${isCorrectRow ? 'is-correct-row' : ''}">
                            ${cells.map((cell, cIdx) => {
                              let cellStr = typeof cell === 'string' ? cell : JSON.stringify(cell);
                              if (cIdx === 0) {
                                cellStr = cellStr.replace(/\s+(?:Revenue|Business)?\s*Model$/i, '');
                              }
                              return `<td>${escapeHtml(humaniseText(cellStr))}</td>`;
                            }).join('')}
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            <!-- 8. SIMILAR PYQ -->
            <div class="sec-block sec-8">
              <div class="sec-head">
                <span class="sec-num">${similarSecNum}</span>
                <span class="sec-title">SIMILAR PYQ</span>
                <span class="sec-line"></span>
              </div>
              <div class="card-similar">
                ${similarPyq && typeof similarPyq === 'object' && (similarPyq.stem || similarPyq.keyTakeaway) ? `
                  <div>
                    ${similarPyq.examYear ? `<strong>${escapeHtml(similarPyq.examName || 'UPSC CSE')} ${escapeHtml(String(similarPyq.examYear))}:</strong> ` : ''}
                    ${escapeHtml(humaniseText(similarPyq.stem || ''))}
                    ${similarPyq.keyTakeaway ? `<div style="margin-top:2px;"><strong>What to watch for:</strong> ${escapeHtml(humaniseText(similarPyq.keyTakeaway))}</div>` : ''}
                  </div>
                ` : `
                  <div>
                    Questions on <strong>${escapeHtml(q.srcTopic || q.srcSubject || 'basic concepts')}</strong> often come back with modified distractors. Expect the same core options with one changed condition in the question stem.
                  </div>
                `}
              </div>
            </div>

          </div>

        </div>

        <!-- BOTTOM FOOTER -->
        <div class="slide-footer">
          <div class="footer-brand">
            <strong>UPSCGPT</strong> · High-Yield Prelims Architecture
          </div>
          <div>Page ${idx + 1} of ${totalSlides}</div>
        </div>
      </div>
    `;
  }).join('')}

  <!-- 3-LAYER SELF-ADJUSTING AUTO-FIT ENGINE (Supports Both Landscape & Portrait A4) -->
  <script>
    function fitAllSlides() {
      const isPortrait = document.body.getAttribute('data-orientation') === 'portrait';
      const pages = document.querySelectorAll('.slide-page');

      pages.forEach((page) => {
        const bodySplit = page.querySelector('.slide-body-split');
        if (!bodySplit) return;

        // Clear all previous inline overrides on bodySplit and cols so CSS cascade works cleanly
        bodySplit.style.zoom = '';
        bodySplit.style.transform = '';
        bodySplit.style.width = '';
        bodySplit.style.alignContent = '';
        bodySplit.style.setProperty('--font-scale', '1');
        bodySplit.style.setProperty('--col-gap', '7.5px');
        bodySplit.style.setProperty('--card-pad-v', '7.5px');
        bodySplit.style.setProperty('--card-pad-h', '11px');

        const cols = bodySplit.querySelectorAll('.slide-col');
        cols.forEach((col) => {
          col.style.zoom = '';
          col.style.transform = '';
          col.style.width = '';
          col.style.removeProperty('--font-scale');
          col.style.removeProperty('--col-gap');
          col.style.removeProperty('--card-pad-v');
          col.style.removeProperty('--card-pad-h');
        });

        const availH = bodySplit.clientHeight;
        if (availH <= 0) return;

        if (isPortrait) {
          // Temporarily align-content: start so scrollHeight measures exact packed height of the 7 grid rows
          bodySplit.style.alignContent = 'start';

          if (bodySplit.scrollHeight < availH * 0.82) {
            bodySplit.style.setProperty('--col-gap', '10.5px');
            bodySplit.style.setProperty('--card-pad-v', '9.5px');
            if (bodySplit.scrollHeight < availH * 0.74) {
              bodySplit.style.setProperty('--font-scale', '1.04');
            }
            bodySplit.style.alignContent = 'space-between';
            return;
          }

          let scale = 1.0;
          let guard = 0;
          while (bodySplit.scrollHeight > availH && scale > 0.45 && guard++ < 60) {
            scale -= 0.015;
            const gapPx = Math.max(2.5, 7.5 * scale).toFixed(2) + 'px';
            const padVPx = Math.max(2.8, 7.5 * scale).toFixed(2) + 'px';
            const padHPx = Math.max(6.5, 11.0 * scale).toFixed(2) + 'px';
            bodySplit.style.setProperty('--font-scale', scale.toFixed(3));
            bodySplit.style.setProperty('--col-gap', gapPx);
            bodySplit.style.setProperty('--card-pad-v', padVPx);
            bodySplit.style.setProperty('--card-pad-h', padHPx);
          }

          bodySplit.style.alignContent = 'space-between';
        } else {
          // In Landscape mode, fit left and right columns independently
          cols.forEach((col) => {
            col.style.setProperty('--font-scale', '1');
            col.style.setProperty('--col-gap', '7.5px');
            col.style.setProperty('--card-pad-v', '7.5px');
            col.style.setProperty('--card-pad-h', '11px');

            if (col.scrollHeight < availH * 0.80) {
              col.style.setProperty('--col-gap', '10.5px');
              col.style.setProperty('--card-pad-v', '10px');
              if (col.scrollHeight < availH * 0.72) {
                col.style.setProperty('--font-scale', '1.04');
              }
              return;
            }

            let scale = 1.0;
            let guard = 0;
            while (col.scrollHeight > availH && scale > 0.45 && guard++ < 60) {
              scale -= 0.015;
              const gapPx = Math.max(2.5, 7.5 * scale).toFixed(2) + 'px';
              const padVPx = Math.max(2.8, 7.5 * scale).toFixed(2) + 'px';
              const padHPx = Math.max(6.5, 11.0 * scale).toFixed(2) + 'px';
              col.style.setProperty('--font-scale', scale.toFixed(3));
              col.style.setProperty('--col-gap', gapPx);
              col.style.setProperty('--card-pad-v', padVPx);
              col.style.setProperty('--card-pad-h', padHPx);
            }
          });
        }
      });
    }

    function setPageOrientation(orient) {
      document.body.setAttribute('data-orientation', orient);
      const styleEl = document.getElementById('page-orientation-style');
      if (styleEl) {
        styleEl.textContent = '@page { size: A4 ' + orient + '; margin: 0; }';
      }
      const btnLand = document.getElementById('btn-orient-landscape');
      const btnPort = document.getElementById('btn-orient-portrait');
      if (btnLand) btnLand.classList.toggle('active', orient === 'landscape');
      if (btnPort) btnPort.classList.toggle('active', orient === 'portrait');
      const statusLabel = document.getElementById('orient-status-label');
      if (statusLabel) {
        statusLabel.textContent = '${totalSlides} Sheet${totalSlides > 1 ? 's' : ''} • Auto-Fitted ' + (orient === 'portrait' ? 'Portrait A4' : 'Landscape A4');
      }
      setTimeout(fitAllSlides, 30);
    }

    window.addEventListener('load', () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          fitAllSlides();
          if (window.opener) {
            setTimeout(() => window.print(), 350);
          }
        });
      } else {
        fitAllSlides();
        if (window.opener) {
          setTimeout(() => window.print(), 350);
        }
      }
    });
    window.addEventListener('resize', fitAllSlides);
    window.addEventListener('beforeprint', fitAllSlides);
  </script>
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
