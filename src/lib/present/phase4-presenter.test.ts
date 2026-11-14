import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { matchShortcut } from './shortcuts.ts';

describe('Phase 4: Presenter ease, RemoteLink Presenter View, Branding & Prefs', () => {
  it('resolves Shift+P, /, and Cmd/Ctrl+Shift+R shortcuts', () => {
    assert.equal(matchShortcut({ key: 'P', shiftKey: true })?.id, 'view.presenterView');
    assert.equal(matchShortcut({ key: '/' })?.id, 'view.toolbarReveal');
    assert.equal(matchShortcut({ key: 'R', metaKey: true, shiftKey: true })?.id, 'rec.togglePause');
    assert.equal(matchShortcut({ key: 'r', ctrlKey: true, shiftKey: true })?.id, 'rec.togglePause');
  });

  it('PresenterViewClient uses RemoteLink instead of BroadcastChannel and does not render CornerLogo', () => {
    const pvSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/studio/present/presenter-view/PresenterViewClient.js'),
      'utf8'
    );
    assert.match(pvSrc, /@\/lib\/remote\/link/);
    assert.doesNotMatch(pvSrc, /BroadcastChannel/);
    assert.doesNotMatch(pvSrc, /CornerLogo/);
    assert.match(pvSrc, /presenter_meta/);
  });

  it('Branding API enforces ADMIN-only writes and PyqPresenterClient wires Prefs, Branding, and auto-hide', () => {
    const brandingApi = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/admin/studio/branding/route.js'),
      'utf8'
    );
    assert.match(brandingApi, /role !== 'ADMIN'/);
    assert.match(brandingApi, /status:\s*403/);

    const clientSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/pyq/present/PyqPresenterClient.js'),
      'utf8'
    );
    assert.match(clientSrc, /\/api\/admin\/studio\/prefs/);
    assert.match(clientSrc, /\/api\/admin\/studio\/branding/);
    assert.match(clientSrc, /<CornerLogo theme=\{theme\} branding=\{branding\} \/>/);
    assert.match(clientSrc, /isToolbarVisible/);
    assert.match(clientSrc, /isCursorHidden/);
    assert.doesNotMatch(clientSrc, /new\s+BroadcastChannel/);
  });
});
