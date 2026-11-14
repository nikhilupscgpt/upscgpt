export function dedupeQuestionIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const id = typeof raw === 'string' ? raw.trim() : '';
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export function moveArrayItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= list.length ||
    toIndex < 0 ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return list;
  }
  const next = list.slice();
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function sanitizeDeckInput(body: Record<string, unknown>) {
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const questionIds = dedupeQuestionIds(body?.questionIds);
  const isShared = Boolean(body?.isShared);
  const sectionPath = typeof body?.sectionPath === 'string' ? body.sectionPath.trim() || null : null;
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null;

  if (!title) {
    return { ok: false as const, error: 'Deck title is required' };
  }
  if (questionIds.length === 0) {
    return { ok: false as const, error: 'At least one question is required' };
  }
  return {
    ok: true as const,
    data: { title, questionIds, isShared, sectionPath, notes },
  };
}

export function computeSectionSummary(
  total: number,
  rows: Array<{ contentStatus?: string | null; hasExplanation?: boolean }>,
  secondsPerQuestion = 75,
) {
  let broken = 0;
  let needsExplanation = 0;
  for (const r of rows) {
    if (r.contentStatus === 'broken') broken++;
    else if (r.contentStatus === 'incomplete' || (r.contentStatus == null && !r.hasExplanation)) {
      needsExplanation++;
    }
  }
  const estMinutes = Math.max(1, Math.round((total * secondsPerQuestion) / 60));
  return { total, estMinutes, needsExplanation, broken };
}
