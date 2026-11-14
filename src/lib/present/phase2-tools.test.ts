import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PRESENT_SHORTCUTS, shortcutSignature, matchShortcut } from './shortcuts.ts';

describe('Phase 2: Shortcuts & Presenter Tools', () => {
  it('has zero duplicate shortcut bindings in PRESENT_SHORTCUTS', () => {
    const seen = new Map<string, string>();
    for (const def of PRESENT_SHORTCUTS) {
      const sig = shortcutSignature(def);
      assert.ok(
        !seen.has(sig),
        `Duplicate shortcut signature "${sig}" for "${def.id}" and "${seen.get(sig)}"`
      );
      seen.set(sig, def.id);
    }
    assert.ok(PRESENT_SHORTCUTS.length >= 25);
  });

  it('resolves tool, color, edit, and navigation shortcuts via matchShortcut', () => {
    assert.equal(matchShortcut({ key: 'v' })?.id, 'tool.select');
    assert.equal(matchShortcut({ key: 'p' })?.id, 'tool.pen');
    assert.equal(matchShortcut({ key: 'b' })?.id, 'tool.brush');
    assert.equal(matchShortcut({ key: 'h' })?.id, 'tool.highlighter');
    assert.equal(matchShortcut({ key: 'l' })?.id, 'tool.laser');
    assert.equal(matchShortcut({ key: 'a' })?.id, 'tool.arrow');
    assert.equal(matchShortcut({ key: 'g' })?.id, 'tool.shape');
    assert.equal(matchShortcut({ key: 't' })?.id, 'tool.text');
    assert.equal(matchShortcut({ key: 'e' })?.id, 'tool.eraser');
    assert.equal(matchShortcut({ key: 's' })?.id, 'tool.spotlight');
    assert.equal(matchShortcut({ key: 'z' })?.id, 'tool.zoomHold');

    assert.equal(matchShortcut({ key: 'z', metaKey: true })?.id, 'edit.undo');
    assert.equal(matchShortcut({ key: 'z', ctrlKey: true, shiftKey: true })?.id, 'edit.redo');
    assert.equal(matchShortcut({ key: 'c' })?.id, 'edit.clearStep');
    assert.equal(matchShortcut({ key: 'C', shiftKey: true })?.id, 'edit.clearQuestion');

    assert.equal(matchShortcut({ key: '1' })?.id, 'color.1');
    assert.equal(matchShortcut({ key: '5' })?.id, 'color.5');
    assert.equal(matchShortcut({ key: '[' })?.id, 'size.down');
    assert.equal(matchShortcut({ key: ']' })?.id, 'size.up');

    assert.equal(matchShortcut({ key: 'ArrowRight', shiftKey: true })?.id, 'nav.nextQuestion');
    assert.equal(matchShortcut({ key: '?', shiftKey: true })?.id, 'view.help');
  });

  it('PyqPresenterClient defaults activeTool to none, resets on qIndex change, and uses on-stage clear confirm', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/pyq/present/PyqPresenterClient.js'),
      'utf8'
    );
    assert.match(src, /useState\(['"]none['"]\)/);
    assert.match(src, /setActiveToolState\(['"]none['"]\);[\s\S]{0,60}\}, \[qIndex\]\)/);
    assert.match(src, /role="alertdialog"/);
    assert.doesNotMatch(src, /window\.confirm\(/);
  });
});
