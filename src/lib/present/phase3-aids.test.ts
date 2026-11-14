import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { stageToBlockPoint, blockToStagePoint } from './ink-coords.ts';
import { matchShortcut } from './shortcuts.ts';

describe('Phase 3: Teaching aids and ink', () => {
  it('scales question-block underline coordinates accurately across Step 1 -> Step 2 transition', () => {
    const step1Transform = { offsetX: 120, offsetY: 96, scale: 1 };
    const step2Transform = { offsetX: 44, offsetY: 88, scale: 0.56 };

    // Underline drawn on Step 1 at 300px right and 140px down inside the question block
    const stagePt1: [number, number] = [120 + 300, 96 + 140];
    const [bx, by] = stageToBlockPoint(stagePt1[0], stagePt1[1], step1Transform);
    assert.equal(bx, 300);
    assert.equal(by, 140);

    // At Step 2, the block scales to 0.56 and moves to (44, 88)
    const [sx2, sy2] = blockToStagePoint(bx, by, step2Transform);
    assert.ok(Math.abs(sx2 - (44 + 300 * 0.56)) < 1e-6);
    assert.ok(Math.abs(sy2 - (88 + 140 * 0.56)) < 1e-6);
  });

  it('resolves Cmd/Ctrl+S snapshot, W/K boards, and Q grid shortcuts', () => {
    assert.equal(matchShortcut({ key: 's', metaKey: true })?.id, 'edit.snapshot');
    assert.equal(matchShortcut({ key: 's', ctrlKey: true })?.id, 'edit.snapshot');
    assert.equal(matchShortcut({ key: 'w' })?.id, 'board.white');
    assert.equal(matchShortcut({ key: 'k' })?.id, 'board.black');
    assert.equal(matchShortcut({ key: 'q' })?.id, 'nav.grid');
  });

  it('wires InkLayer persistence, Snapshot persistence, Keep board, and has no click-to-mark widgets', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/pyq/present/PyqPresenterClient.js'),
      'utf8'
    );
    assert.match(src, /\/api\/admin\/studio\/ink/);
    assert.match(src, /\/api\/admin\/studio\/snapshots/);
    assert.match(src, /Keep board/);
    assert.match(src, /questionTransform/);
    assert.doesNotMatch(src, /text-decoration:\s*line-through/i);
  });
});
