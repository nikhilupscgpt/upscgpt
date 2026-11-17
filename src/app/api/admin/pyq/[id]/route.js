import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { normalizeCanonicalSubject } from '@/lib/syllabusTaxonomy';
import { normalizeKeywordsList } from '@/lib/pyqKeywords';
import { requireApiRole } from '@/lib/security/requireRole';
import { enforcePyqScrapeLimits, normalizeOptions } from '@/lib/pyq/pyqAccess';
import { invalidatePyqTreeCache } from '@/lib/pyq/tree-service';
import { validatePyqSavePayload } from '@/lib/pyq/editor-validation';

export async function GET(req, { params }) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const rateCheck = await enforcePyqScrapeLimits({
      userId: session.user.id,
      isListRequest: false,
      questionIds: [id],
      ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || null,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    const question = await prisma.questionDraft.findUnique({
      where: { id }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      question: {
        ...question,
        options: normalizeOptions(question.options)
      }
    });
  } catch (error) {
    console.error('[API Admin PYQ ID] GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await requireApiRole(['ADMIN']);
    if (auth.response) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.questionDraft.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const updateData = {};

    if (body.stem !== undefined) {
      updateData.stem = body.stem.trim();
      updateData.rawText = body.stem.trim();
    }

    if (body.options !== undefined) {
      updateData.options = normalizeOptions(body.options);
    }

    if (body.correctLabel !== undefined) {
      updateData.correctLabel = body.correctLabel ? body.correctLabel.trim().toLowerCase() : null;
    }

    let normalizedKeywordsToSync = [];

    if (body.explanation !== undefined || body.analysis !== undefined) {
      if (body.analysis && typeof body.analysis === 'object') {
        const cleanedKws = Array.isArray(body.analysis.keywords)
          ? normalizeKeywordsList(body.analysis.keywords)
          : [];
        normalizedKeywordsToSync = cleanedKws;

        const cleanedAnalysis = {
          ...body.analysis,
          keywords: cleanedKws,
        };

        updateData.explanation = JSON.stringify({
          explanation: typeof body.explanation === 'string' ? body.explanation.trim() : '',
          analysis: cleanedAnalysis
        });
      } else if (body.explanation !== undefined) {
        updateData.explanation = body.explanation ? (typeof body.explanation === 'string' ? body.explanation.trim() : JSON.stringify(body.explanation)) : null;
      }
    }

    if (body.srcSubject !== undefined) {
      const rawSub = body.srcSubject ? body.srcSubject.trim() : null;
      updateData.srcSubject = normalizeCanonicalSubject(rawSub);
    }

    if (body.srcTopic !== undefined) {
      const rawTopic = body.srcTopic ? body.srcTopic.trim() : null;
      // Guardrail: if incoming topic is a long composite string (e.g. from an AI generation)
      // and the existing record already has a canonical topic, keep existing.srcTopic and save rawTopic into srcTheme.
      if (rawTopic && (rawTopic.includes('—') || rawTopic.includes('–') || rawTopic.length > 50)) {
        if (existing.srcTopic) {
          updateData.srcTopic = existing.srcTopic;
          if (!body.srcTheme) updateData.srcTheme = rawTopic;
        } else {
          updateData.srcTopic = rawTopic;
        }
      } else {
        updateData.srcTopic = rawTopic;
      }
    }

    if (body.srcTheme !== undefined) {
      updateData.srcTheme = body.srcTheme ? body.srcTheme.trim() : null;
    }

    if (body.examName !== undefined) {
      updateData.examName = body.examName ? body.examName.trim() : null;
    }

    if (body.examYear !== undefined) {
      updateData.examYear = parseInt(body.examYear, 10) || existing.examYear;
    }

    if (body.questionNo !== undefined) {
      updateData.questionNo = body.questionNo !== null && body.questionNo !== '' ? parseInt(body.questionNo, 10) : null;
    }

    if (body.difficulty !== undefined) {
      updateData.difficulty = body.difficulty;
    }

    // Recompute dedupHash if stem, year, or questionNo changed
    if (updateData.stem || updateData.examYear || updateData.questionNo !== undefined) {
      const yr = updateData.examYear || existing.examYear || 2025;
      const qNum = updateData.questionNo !== undefined ? updateData.questionNo : existing.questionNo;
      const stm = updateData.stem || existing.stem;
      updateData.dedupHash = crypto
        .createHash('md5')
        .update(`${yr}_${qNum || ''}_${stm}`.toLowerCase().replace(/\s+/g, ''))
        .digest('hex');
    }

    if (body.examCode !== undefined) {
      updateData.examCode = body.examCode || null;
    }

    const mergedForValidation = {
      stem: updateData.stem ?? existing.stem,
      options: updateData.options ?? existing.options,
      correctLabel: updateData.correctLabel ?? existing.correctLabel,
      explanation: updateData.explanation !== undefined ? updateData.explanation : existing.explanation,
      examCode: updateData.examCode !== undefined ? updateData.examCode : existing.examCode,
      examName: updateData.examName ?? existing.examName,
      srcTheme: updateData.srcTheme !== undefined ? updateData.srcTheme : existing.srcTheme,
      difficulty: updateData.difficulty !== undefined ? updateData.difficulty : existing.difficulty,
    };

    const validation = validatePyqSavePayload(mergedForValidation);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.errors.join(' '), errors: validation.errors },
        { status: 400 },
      );
    }

    updateData.examCode = validation.computed.examCode;
    updateData.explanationJson = validation.computed.explanationJson;
    updateData.contentStatus = validation.computed.contentStatus;
    updateData.missingFlags = validation.computed.missingFlags;
    updateData.stemFormat = validation.computed.stemFormat;
    updateData.updatedById = session.user?.id || null;

    updateData.reviewedBy = session.user?.name || 'admin';
    updateData.reviewedAt = new Date();

    const updated = await prisma.questionDraft.update({
      where: { id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user?.id || 'admin',
        action: 'QUESTION_EDITED',
        entity: 'QuestionDraft',
        entityId: id,
        before: {
          correctLabel: existing.correctLabel,
          srcTopic: existing.srcTopic,
          srcTheme: existing.srcTheme,
          difficulty: existing.difficulty,
          examCode: existing.examCode,
          contentStatus: existing.contentStatus,
        },
        after: {
          correctLabel: updated.correctLabel,
          srcTopic: updated.srcTopic,
          srcTheme: updated.srcTheme,
          difficulty: updated.difficulty,
          examCode: updated.examCode,
          contentStatus: updated.contentStatus,
        },
      },
    });
    invalidatePyqTreeCache();

    if (normalizedKeywordsToSync.length > 0) {
      try {
        for (const kw of normalizedKeywordsToSync) {
          if (!kw.slug) continue;
          const key = `pyq_concept:${kw.slug}`;
          const existingCfg = await prisma.platformConfig.findUnique({ where: { key } });
          let prev = {};
          if (existingCfg?.value) {
            try { prev = JSON.parse(existingCfg.value); } catch { prev = {}; }
          }
          const nextConcept = {
            ...prev,
            slug: kw.slug,
            term: kw.term || prev.term || kw.slug,
            shortNote: kw.shortNote || prev.shortNote || '',
            longContent: kw.longContent || prev.longContent || '',
            subject: updated.srcSubject || prev.subject || 'General Studies',
            topic: updated.srcTopic || prev.topic || 'General',
            updatedAt: new Date().toISOString()
          };
          await prisma.platformConfig.upsert({
            where: { key },
            update: { value: JSON.stringify(nextConcept) },
            create: { key, value: JSON.stringify(nextConcept) }
          });
        }
      } catch (cfgErr) {
        console.warn('[API Admin PYQ ID] Concept sync warning:', cfgErr);
      }
    }

    try {
      revalidateTag('pyq-data');
      revalidatePath('/prelims/pyq');
      revalidatePath('/api/pyq');
    } catch (e) {
      console.warn('Revalidation error:', e);
    }

    return NextResponse.json({
      success: true,
      question: {
        ...updated,
        options: normalizeOptions(updated.options)
      }
    });
  } catch (error) {
    console.error('[API Admin PYQ ID] PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireApiRole(['ADMIN']);
    if (auth.response) return auth.response;

    const { id } = await params;
    await prisma.questionDraft.delete({
      where: { id }
    });
    invalidatePyqTreeCache();

    try {
      revalidateTag('pyq-data');
      revalidatePath('/prelims/pyq');
      revalidatePath('/api/pyq');
    } catch (e) {
      console.warn('Revalidation error:', e);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[API Admin PYQ ID] DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
