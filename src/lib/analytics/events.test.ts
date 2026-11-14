import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEvents, EVENT_SCHEMAS } from './events.ts';

const baseEnvelope = (name: string, props: Record<string, unknown> = {}) => ({
  eventId: '11111111-1111-4111-8111-111111111111',
  name,
  anonId: 'anon_123',
  sessionId: 'sess_456',
  props,
});

test('accepts valid events across PRD §4 dictionary', () => {
  const batch = [
    baseEnvelope('page_view', { route: '/environment/species' }),
    baseEnvelope('entity_view_end', { entityType: 'species', entityId: 'bengal-tiger', activeSec: 42 }),
    baseEnvelope('pricing_view', {}),
    baseEnvelope('web_vital', { name: 'LCP', value: 1420, route: '/prelims/pyq' }),
  ];

  const { accepted, dropped } = validateEvents(batch);
  assert.equal(accepted.length, 4);
  assert.equal(dropped.length, 0);
  assert.equal(Object.keys(EVENT_SCHEMAS).length, 24);
});

test('drops unknown event names and extra PII props', () => {
  const batch = [
    baseEnvelope('custom_hack_event', { foo: 'bar' }),
    baseEnvelope('page_view', { route: '/pricing', email: 'leak@example.com' }),
    baseEnvelope('client_error', { route: '/map', message: 'x'.repeat(201), source: 'window' }),
  ];

  const { accepted, dropped } = validateEvents(batch);
  assert.equal(accepted.length, 0);
  assert.equal(dropped.length, 3);
  assert.equal(dropped[0].reason, 'unknown_event_name');
  assert.equal(dropped[1].reason, 'invalid_props');
  assert.equal(dropped[2].reason, 'invalid_props');
});

test('search.query is stripped when resultCount > 0 and normalized to 60 lowercase chars when 0', () => {
  const longZeroQuery = '   ' + 'UPSC Environment Species '.repeat(4);
  const batch = [
    baseEnvelope('search', { scope: 'pyq', queryLength: 6, resultCount: 12, query: 'Polity' }),
    baseEnvelope('search', { scope: 'atlas', queryLength: 90, resultCount: 0, query: longZeroQuery }),
  ];

  const { accepted, dropped } = validateEvents(batch);
  assert.equal(accepted.length, 2);
  assert.equal(dropped.length, 0);
  assert.equal('query' in accepted[0].props, false);
  assert.equal(typeof accepted[1].props.query, 'string');
  assert.equal((accepted[1].props.query as string).length, 60);
  assert.equal(accepted[1].props.query, (accepted[1].props.query as string).toLowerCase());
});
