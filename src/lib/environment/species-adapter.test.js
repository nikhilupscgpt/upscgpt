import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  adaptSpecies,
  IUCN_SCALE_ORDER,
  normalizeIucnCode,
  splitPoint,
  truncateDescription,
} from './species-adapter.js';

const curatedPath = resolve(process.cwd(), 'src/lib/curated-env-species.json');
const curatedData = JSON.parse(readFileSync(curatedPath, 'utf8'));

test('adaptSpecies handles all curated species cleanly without crashing', () => {
  assert.ok(Array.isArray(curatedData.items) && curatedData.items.length > 0);
  for (const raw of curatedData.items) {
    const adapted = adaptSpecies(raw);
    assert.ok(adapted.slug);
    assert.ok(adapted.title);
    assert.ok(IUCN_SCALE_ORDER.some((s) => s.code === adapted.protection.iucnCode));
    assert.equal(adapted.headlineStat, null);
  }
});

test('photo credit gate requires both author and licence', () => {
  const valid = adaptSpecies({
    slug: 'test-valid',
    title: 'Test Valid',
    credit: { artist: 'A. Photographer', lic: 'CC BY 4.0', page: 'https://example.com' },
  });
  assert.equal(valid.photo.hasValidCredit, true);

  const missingLicence = adaptSpecies({
    slug: 'test-no-lic',
    title: 'Test No Lic',
    credit: { artist: 'A. Photographer', lic: '' },
  });
  assert.equal(missingLicence.photo.hasValidCredit, false);

  const missingAuthor = adaptSpecies({
    slug: 'test-no-author',
    title: 'Test No Author',
    credit: { artist: '', lic: 'CC BY 4.0' },
  });
  assert.equal(missingAuthor.photo.hasValidCredit, false);
});

test('news filter strips sourceless items', () => {
  const adapted = adaptSpecies({
    slug: 'news-test',
    title: 'News Test',
    newsTriggers: [
      { tag: 'Policy', what: 'Has source', src: 'PIB', url: 'https://pib.gov.in' },
      { tag: 'Rumor', what: 'Missing source', src: '' },
      { tag: 'Rumor2', what: 'No source field' },
    ],
  });
  assert.equal(adapted.news.length, 1);
  assert.equal(adapted.news[0].what, 'Has source');
});

test('traps are ordered before facts in prelimsPoints', () => {
  const adapted = adaptSpecies({
    slug: 'order-test',
    title: 'Order Test',
    facts: ['Fact one: detail'],
    traps: ['Trap one: detail'],
  });
  assert.equal(adapted.prelimsPoints[0].kind, 'trap');
  assert.equal(adapted.prelimsPoints[1].kind, 'fact');
});

test('truncateDescription truncates cleanly at 240 chars', () => {
  const short = truncateDescription('Short sentence.', 240);
  assert.equal(short.isTruncated, false);
  assert.equal(short.text, 'Short sentence.');

  const longText = 'word '.repeat(70).trim();
  const res = truncateDescription(longText, 240);
  assert.equal(res.isTruncated, true);
  assert.ok(res.text.length <= 243);
  assert.ok(res.text.endsWith('...'));
});

test('normalizeIucnCode maps abbreviations and full names', () => {
  assert.equal(normalizeIucnCode('CR'), 'CR');
  assert.equal(normalizeIucnCode('Critically Endangered'), 'CR');
  assert.equal(normalizeIucnCode('vu'), 'VU');
  assert.equal(normalizeIucnCode('Least Concern'), 'LC');
});

test('splitPoint separates headline and explanation on colon or em-dash', () => {
  assert.deepEqual(splitPoint('Project Tiger (1973): Centrally Sponsored Scheme'), {
    headline: 'Project Tiger (1973)',
    explanation: 'Centrally Sponsored Scheme',
  });
  assert.deepEqual(splitPoint('IUCN Trap — Often confused with leopard'), {
    headline: 'IUCN Trap',
    explanation: 'Often confused with leopard',
  });
});
