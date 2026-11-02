import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';
import { extractQuestionIdFromSlug } from '@/lib/pyqSlug';
import { extractCoreSubjectEntity } from '@/lib/seo';
import { resolveSyllabusNodesForQuestion } from '@/lib/nodeBridge';

export const runtime = 'nodejs';

async function findQuestionForOg(decodedId) {
  const targetId = extractQuestionIdFromSlug(decodedId);

  const draft = await prisma.questionDraft.findFirst({
    where: {
      OR: [
        { dedupHash: targetId },
        { id: targetId },
        { dedupHash: decodedId },
        { id: decodedId },
      ],
    },
  });

  if (draft) return draft;

  const published = await prisma.question.findFirst({
    where: {
      OR: [
        { dedupHash: targetId },
        { id: targetId },
        { dedupHash: decodedId },
        { id: decodedId },
      ],
    },
    include: { subject: true, topic: true },
  });

  if (published) {
    return {
      ...published,
      srcSubject: published.subject?.name,
      srcTopic: published.topic?.name,
    };
  }

  return null;
}

function formatStemLines(rawStem = '') {
  const normalized = String(rawStem || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!normalized) return { lines: ['UPSC Prelims Previous Year Question'], truncated: false };

  // Split into readable lines around numbered statements or sentences
  const rawParts = normalized
    .split(/\n+|(?=\b(?:1|2|3|4)\.\s+)/g)
    .map(s => s.trim())
    .filter(Boolean);

  const lines = [];
  let totalChars = 0;
  let truncated = false;

  for (const part of rawParts) {
    if (lines.length >= 3 || totalChars >= 260) {
      truncated = true;
      break;
    }
    const maxLineLen = lines.length === 0 ? 120 : 95;
    if (part.length > maxLineLen) {
      lines.push(`${part.slice(0, maxLineLen - 1).trim()}…`);
      totalChars += maxLineLen;
      if (rawParts.length > lines.length) truncated = true;
    } else {
      lines.push(part);
      totalChars += part.length;
    }
  }

  return { lines, truncated };
}

function parseOptions(rawOptions) {
  let opts = [];
  if (typeof rawOptions === 'string') {
    try {
      opts = JSON.parse(rawOptions);
    } catch {
      opts = [];
    }
  } else if (Array.isArray(rawOptions)) {
    opts = rawOptions;
  }

  const defaultLabels = ['A', 'B', 'C', 'D'];
  return defaultLabels.map((fallbackLabel, idx) => {
    const item = opts[idx] || {};
    const label = String(item.label || fallbackLabel).toUpperCase();
    const rawText = String(item.text || '').replace(/\s+/g, ' ').trim();
    const text = rawText.length > 58 ? `${rawText.slice(0, 56).trim()}…` : rawText || 'Option details on page';
    return { label, text };
  });
}

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const decodedId = decodeURIComponent(resolvedParams?.id || '');
    const q = await findQuestionForOg(decodedId);

    const examName = q?.examName || 'UPSC CSE Prelims';
    const examYear = q?.examYear || 'PYQ';
    const questionNo = q?.questionNo ? `Q#${q.questionNo}` : 'Official PYQ';
    const subject = q?.srcSubject || 'General Studies';
    const coreEntity = q ? extractCoreSubjectEntity(q) : 'UPSC Prelims';
    const syllabusNodes = q ? resolveSyllabusNodesForQuestion(q, 1) : [];
    const primaryNode = syllabusNodes[0] || null;

    const { lines: stemLines, truncated: stemTruncated } = formatStemLines(
      q?.stem || 'Practice authentic UPSC Civil Services Prelims Previous Year Questions with official answer keys and option elimination logic.'
    );
    const options = parseOptions(q?.options);

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#090d16',
            backgroundImage:
              'radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.16), transparent 45%), radial-gradient(circle at 15% 85%, rgba(245, 158, 11, 0.12), transparent 45%)',
            color: '#f8fafc',
            padding: '42px 52px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            border: '2px solid rgba(56, 189, 248, 0.22)',
          }}
        >
          {/* Top Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#38bdf8',
                  color: '#090d16',
                  fontWeight: 900,
                  fontSize: '20px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  letterSpacing: '0.5px',
                }}
              >
                UPSCGPT.IN
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(245, 158, 11, 0.16)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  color: '#fbbf24',
                  fontWeight: 800,
                  fontSize: '18px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                }}
              >
                {`${examName} ${examYear} • ${questionNo}`}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#7dd3fc',
                  fontWeight: 700,
                  fontSize: '17px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                }}
              >
                {subject}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#94a3b8',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              {coreEntity.length > 34 ? `${coreEntity.slice(0, 32)}…` : coreEntity}
            </div>
          </div>

          {/* Question Stem Box */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '20px',
              padding: '24px 30px',
              marginTop: '16px',
              marginBottom: '16px',
              flexGrow: 1,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {stemLines.map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: idx === 0 ? '25px' : '22px',
                    fontWeight: idx === 0 ? 700 : 500,
                    color: idx === 0 ? '#f8fafc' : '#cbd5e1',
                    lineHeight: 1.38,
                  }}
                >
                  {line}
                </div>
              ))}
              {stemTruncated && (
                <div
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#38bdf8',
                    marginTop: '4px',
                  }}
                >
                  + Read complete statements & question prompt on upscgpt.in →
                </div>
              )}
            </div>
          </div>

          {/* 2x2 Options Grid (Neutral State — Never leaks answer key on thumbnail) */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              width: '100%',
              marginBottom: '18px',
            }}
          >
            {options.map(opt => (
              <div
                key={opt.label}
                style={{
                  width: '540px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  backgroundColor: 'rgba(30, 41, 59, 0.78)',
                  border: '1px solid rgba(148, 163, 184, 0.22)',
                  borderRadius: '14px',
                  padding: '12px 18px',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    lineHeight: 1.25,
                  }}
                >
                  {opt.text}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA & Syllabus Node Bridge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '12px',
              borderTop: '1px solid rgba(148, 163, 184, 0.16)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fbbf24',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              <span>🎯 Tap to Attempt Live MCQ & View Official UPSC Key + Elimination Logic</span>
            </div>

            {primaryNode ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(16, 185, 129, 0.14)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontSize: '15px',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '999px',
                }}
              >
                {`📚 Syllabus Node: ${primaryNode.title.length > 28 ? `${primaryNode.title.slice(0, 26)}…` : primaryNode.title}`}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748b',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                upscgpt.in/prelims/pyq
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    // Set immutable 1-year CDN/browser cache so crawlers never trigger repeat CPU rendering
    imageResponse.headers.set(
      'Cache-Control',
      'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable'
    );

    return imageResponse;
  } catch (error) {
    console.error('[OG PYQ Image Error]:', error);
    return new Response('Failed to generate question card', { status: 500 });
  }
}
