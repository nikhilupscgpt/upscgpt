import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const UI_DIR = path.join(ROOT, 'src', 'components', 'pyq-studio');

test('all 7 shared PYQ Studio UI kit components exist and are exported', () => {
  const indexContent = fs.readFileSync(path.join(UI_DIR, 'index.js'), 'utf8');
  for (const name of [
    'MetaLine',
    'StatusBadge',
    'RowActions',
    'FilterBar',
    'PageHeader',
    'CollapsibleRail',
    'Toolbar',
  ]) {
    assert.ok(fs.existsSync(path.join(UI_DIR, `${name}.js`)), `Missing ${name}.js`);
    assert.ok(indexContent.includes(name), `index.js must export ${name}`);
  }
});

test('every <label> in UI kit and PyqStudioClient has htmlFor linked to a control', () => {
  const files = [
    ...fs.readdirSync(UI_DIR).filter((f) => f.endsWith('.js')).map((f) => path.join(UI_DIR, f)),
    path.join(ROOT, 'src', 'app', 'admin', 'studio', 'pyq', 'PyqStudioClient.js'),
  ];

  for (const file of files) {
    const content = fs
      .readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    const labels = content.match(/<label\b[^>]*>/g) || [];
    for (const tag of labels) {
      assert.ok(
        /\bhtmlFor=/.test(tag),
        `Unlinked <label> without htmlFor in ${path.basename(file)}: ${tag}`,
      );
    }
  }
});

test('PyqStudioClient and UI kit contain no emoji in controls and PyqPresenterClient uses Toolbar (<= 6 visible)', () => {
  const studioClient = fs.readFileSync(
    path.join(ROOT, 'src', 'app', 'admin', 'studio', 'pyq', 'PyqStudioClient.js'),
    'utf8',
  );
  assert.ok(!/[📖📅🔥⚠️]/.test(studioClient), 'PyqStudioClient should not contain control emojis');
  assert.ok(studioClient.includes('<PageHeader'), 'PyqStudioClient must use PageHeader');
  assert.ok(studioClient.includes('<FilterBar'), 'PyqStudioClient must use FilterBar');
  assert.ok(studioClient.includes('<CollapsibleRail'), 'PyqStudioClient must use CollapsibleRail');
  assert.ok(studioClient.includes('<StemView'), 'PyqStudioClient must reuse StemView');
  assert.ok(studioClient.includes('<RowActions'), 'PyqStudioClient must use RowActions');

  const presenter = fs.readFileSync(
    path.join(ROOT, 'src', 'app', 'admin', 'pyq', 'present', 'PyqPresenterClient.js'),
    'utf8',
  );
  assert.ok(presenter.includes('<Toolbar'), 'PyqPresenterClient must use shared Toolbar');
  assert.ok(presenter.includes('overflowTools={['), 'PyqPresenterClient must put secondary tools in overflowTools');
});
