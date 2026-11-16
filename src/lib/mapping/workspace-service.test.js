import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMappingWorkspace,
  classifyNodePillar,
  resolveMappingDeckItems,
} from './workspace-service.js';

const sampleCurated = [
  {
    id: 'curated-godavari',
    slug: 'godavari-river',
    place: 'Godavari River',
    pillar: 'STATIC',
    regionScope: 'India',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    lat: 19.9,
    lng: 73.5,
    shape: [[19.9, 73.5], [16.7, 82.2]],
    staticFacts: ['Dakshin Ganga'],
    similarPYQ: ['GEO-UPSC-2023-08'],
  },
  {
    id: 'curated-red-sea',
    slug: 'red-sea',
    place: 'Red Sea',
    pillar: 'STATIC',
    regionScope: 'World',
    mapCategory: ['World physical'],
    lat: 20.0,
    lng: 38.0,
    staticFacts: ['Connects to Mediterranean via Suez Canal'],
    similarPYQ: [],
  },
  {
    id: 'curated-unep',
    slug: 'unep-nairobi',
    place: 'UNEP',
    pillar: 'IR',
    regionScope: 'World',
    mapCategory: ['IR'],
    lat: -1.29,
    lng: 36.82,
    staticFacts: ['HQ in Nairobi, Kenya'],
    similarPYQ: [],
  },
];

const samplePins = [
  {
    id: 'pin-override',
    pinId: 'STATIC-GODAVARI',
    slug: 'godavari-river',
    place: 'Godavari River (DB Updated)',
    hookCategory: 'STATIC',
    regionScope: 'India',
    tier: 'master',
    parentId: null,
    lat: 19.9,
    lng: 73.5,
    staticFacts: ['Updated DB fact'],
    similarPYQ: ['GEO-UPSC-2023-08'],
  },
  {
    id: 'pin-daily',
    pinId: 'PIN-2026-01',
    slug: 'chagos-archipelago',
    place: 'Chagos Archipelago',
    regionScope: 'World',
    tier: 'daily',
    parentId: null,
    date: '2026-10-01',
    lat: -7.3,
    lng: 72.4,
    staticFacts: ['Indian Ocean'],
    newsTriggers: [{ what: 'UK-Mauritius treaty update' }],
    similarPYQ: ['q-cuid-99'],
  },
  {
    id: 'pin-archived',
    pinId: 'PIN-ARCHIVED',
    slug: 'old-archived-pin',
    place: 'Old Archived Pin',
    tier: 'archived',
    parentId: null,
  },
  {
    id: 'pin-child',
    pinId: 'PIN-CHILD',
    slug: 'child-pin',
    place: 'Child Pin',
    tier: 'daily',
    parentId: 'pin-daily',
  },
];

const sampleQuestions = [
  {
    id: 'q-cuid-1',
    dedupHash: 'GEO-UPSC-2023-08',
    examName: 'UPSC CSE Pre',
    examYear: 2023,
    stem: 'Consider the following rivers: Godavari...',
    options: [{ label: 'A', text: 'Only one' }],
    correctLabel: 'A',
    explanation: 'Detailed explanation for Godavari.',
    isMapping: true,
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    subject: { id: 's1', name: 'Geography' },
  },
  {
    id: 'q-cuid-99',
    dedupHash: null,
    examName: 'UPSC CSE Pre',
    examYear: 2022,
    stem: 'Which island group lies in the Indian Ocean?',
    options: [{ label: 'B', text: 'Chagos' }],
    correctLabel: 'B',
    explanation: 'Chagos explanation.',
    isMapping: true,
    mapCategory: ['World – places in news'],
    subject: { id: 's1', name: 'Geography' },
  },
];

const sampleOrgs = [
  {
    id: 'org-1',
    slug: 'brics',
    shortName: 'BRICS',
    name: 'BRICS Grouping',
    orgType: 'Multilateral',
    headquarters: 'Rotating',
    indiaMember: true,
  },
];

test('buildMappingWorkspace excludes archived and child PINs and merges STATIC-* overrides by slug', () => {
  const ws = buildMappingWorkspace({
    dbPins: samplePins,
    dbQuestions: sampleQuestions,
    dbOrgs: sampleOrgs,
    curatedNodes: sampleCurated,
  });

  const slugs = ws.nodes.map((n) => n.slug);
  assert.ok(!slugs.includes('old-archived-pin'));
  assert.ok(!slugs.includes('child-pin'));
  assert.equal(slugs.filter((s) => s === 'godavari-river').length, 1);

  const godavari = ws.nodes.find((n) => n.slug === 'godavari-river');
  assert.equal(godavari.place, 'Godavari River (DB Updated)');
  assert.equal(godavari.isPin, false);
  assert.ok(Array.isArray(godavari.shape));
});

test('resolves similarPYQ links by both dedupHash and DB id from Question', () => {
  const ws = buildMappingWorkspace({
    dbPins: samplePins,
    dbQuestions: sampleQuestions,
    dbOrgs: sampleOrgs,
    curatedNodes: sampleCurated,
  });

  const godavari = ws.nodes.find((n) => n.slug === 'godavari-river');
  assert.equal(godavari.resolvedSimilarPYQs.length, 1);
  assert.equal(godavari.resolvedSimilarPYQs[0].explanation, 'Detailed explanation for Godavari.');

  const chagos = ws.nodes.find((n) => n.slug === 'chagos-archipelago');
  assert.equal(chagos.resolvedSimilarPYQs.length, 1);
  assert.equal(chagos.resolvedSimilarPYQs[0].explanation, 'Chagos explanation.');
});

test('classifyNodePillar and resolveMappingDeckItems handle all 4 pillars + PYQs + Orgs', () => {
  const ws = buildMappingWorkspace({
    dbPins: samplePins,
    dbQuestions: sampleQuestions,
    dbOrgs: sampleOrgs,
    curatedNodes: sampleCurated,
  });

  assert.equal(classifyNodePillar(ws.nodes.find((n) => n.slug === 'godavari-river')), 'INDIA_STATIC');
  assert.equal(classifyNodePillar(ws.nodes.find((n) => n.slug === 'red-sea')), 'WORLD_STATIC');
  assert.equal(classifyNodePillar(ws.nodes.find((n) => n.slug === 'chagos-archipelago')), 'PIN');
  assert.equal(classifyNodePillar(ws.nodes.find((n) => n.slug === 'unep-nairobi')), 'IR');

  const deck = resolveMappingDeckItems(
    ['godavari-river', 'chagos-archipelago', 'org-1', 'GEO-UPSC-2023-08'],
    ws
  );
  assert.equal(deck.length, 4);
  assert.equal(deck[0].pillar, 'INDIA_STATIC');
  assert.equal(deck[1].pillar, 'PIN');
  assert.equal(deck[2].sourceType, 'ORG');
  assert.equal(deck[3].sourceType, 'PYQ');
  assert.equal(deck[3].explanation, 'Detailed explanation for Godavari.');
});
