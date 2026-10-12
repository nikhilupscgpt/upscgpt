import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

const prisma = new PrismaClient();

function normalizeOptions(opts) {
  if (Array.isArray(opts)) {
    return opts.map((o, idx) => {
      if (typeof o === 'string') {
        const labels = ['A', 'B', 'C', 'D', 'E'];
        return { label: labels[idx] || String(idx + 1), text: o.trim() };
      }
      return {
        label: String(o.label || String.fromCharCode(65 + idx)).toUpperCase(),
        text: String(o.text || '').trim()
      };
    });
  }
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      if (Array.isArray(parsed)) return normalizeOptions(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    let questionsInput = body.questions;
    const mode = body.mode || 'upsert'; // 'upsert' | 'update_only' | 'insert_only'

    // If rawText string is passed instead of parsed array, parse JSON or JSONL
    if (!questionsInput && typeof body.rawText === 'string') {
      const trimmed = body.rawText.trim();
      if (trimmed.startsWith('[')) {
        try {
          questionsInput = JSON.parse(trimmed);
        } catch (e) {
          return NextResponse.json({ error: 'Invalid JSON array syntax: ' + e.message }, { status: 400 });
        }
      } else {
        // Parse JSONL
        const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
        questionsInput = [];
        for (let i = 0; i < lines.length; i++) {
          try {
            questionsInput.push(JSON.parse(lines[i]));
          } catch (e) {
            return NextResponse.json({ error: `JSONL parse error on line ${i + 1}: ` + e.message }, { status: 400 });
          }
        }
      }
    }

    if (!Array.isArray(questionsInput) || questionsInput.length === 0) {
      return NextResponse.json({ error: 'No valid questions provided.' }, { status: 400 });
    }

    let updatedCount = 0;
    let createdCount = 0;
    const errors = [];

    // Process in batches
    for (let i = 0; i < questionsInput.length; i++) {
      const item = questionsInput[i];
      const indexStr = `Item #${i + 1}`;

      try {
        const stem = (item.stem || item.question || '').trim();
        if (!stem && !item.id && !item.dedupHash) {
          errors.push(`${indexStr}: Missing stem or identifier`);
          continue;
        }

        const opts = normalizeOptions(item.options);
        const correctLabel = (item.correctLabel || item.answer || '').toString().trim().toLowerCase();
        const explanation = item.explanation ? item.explanation.toString().trim() : null;
        const examName = (item.examName || item.exam || 'UPSC CSE Pre').toString().trim();
        const examYear = parseInt(item.examYear || item.year, 10) || 2024;
        const questionNo = item.questionNo !== undefined && item.questionNo !== null ? parseInt(item.questionNo, 10) : null;
        const srcSubject = (item.srcSubject || item.subject || 'Indian Polity').toString().trim();
        const srcTopic = (item.srcTopic || item.topic || 'General').toString().trim();
        const difficulty = item.difficulty || 'MEDIUM';

        // Check if question exists by ID, dedupHash, or (examName, examYear, questionNo)
        let existing = null;
        if (item.id) {
          existing = await prisma.questionDraft.findUnique({ where: { id: String(item.id) } });
        }
        if (!existing && item.dedupHash) {
          existing = await prisma.questionDraft.findFirst({ where: { dedupHash: String(item.dedupHash) } });
        }
        if (!existing && questionNo !== null && examYear) {
          existing = await prisma.questionDraft.findFirst({
            where: {
              examYear,
              questionNo,
              examName: { contains: examName.includes('CSE') ? 'CSE' : examName, mode: 'insensitive' }
            }
          });
        }

        if (existing) {
          if (mode === 'insert_only') {
            continue; // Skip update
          }

          const updateData = {};
          if (stem) updateData.stem = stem;
          if (opts.length >= 2) updateData.options = opts;
          if (correctLabel) updateData.correctLabel = correctLabel;
          if (explanation !== null) updateData.explanation = explanation;
          if (item.srcSubject) updateData.srcSubject = srcSubject;
          if (item.srcTopic) updateData.srcTopic = srcTopic;
          if (item.examName) updateData.examName = examName;
          if (item.examYear) updateData.examYear = examYear;
          if (item.questionNo !== undefined) updateData.questionNo = questionNo;
          if (item.difficulty) updateData.difficulty = difficulty;
          updateData.reviewedBy = session.user?.name || 'admin';
          updateData.reviewedAt = new Date();

          await prisma.questionDraft.update({
            where: { id: existing.id },
            data: updateData
          });
          updatedCount++;
        } else {
          if (mode === 'update_only') {
            continue; // Skip insert
          }

          if (!stem || opts.length < 2) {
            errors.push(`${indexStr}: New question requires at least stem and 2 options`);
            continue;
          }

          const dedupHash = item.dedupHash || crypto
            .createHash('md5')
            .update(`${examYear}_${questionNo || ''}_${stem}`.toLowerCase().replace(/\s+/g, ''))
            .digest('hex');

          await prisma.questionDraft.create({
            data: {
              runId: 'admin_bulk_upload',
              documentId: 'bulk_upload',
              rawText: stem,
              stem,
              options: opts,
              correctLabel: correctLabel || null,
              explanation,
              srcSubject,
              srcTopic,
              examName,
              examYear,
              questionNo,
              difficulty,
              status: 'APPROVED',
              dedupHash,
              reviewedBy: session.user?.name || 'admin',
              reviewedAt: new Date(),
            }
          });
          createdCount++;
        }
      } catch (err) {
        errors.push(`${indexStr}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalReceived: questionsInput.length,
      updatedCount,
      createdCount,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    console.error('[API Admin PYQ Bulk] POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
