import { z } from 'zod';

const shortStr = (max = 120) => z.string().trim().min(1).max(max);
const optShortStr = (max = 120) => z.string().trim().max(max).optional();

/**
 * Zod allow-list for every analytics event in PRD §4.
 * Every object schema is strict: unknown props are rejected.
 * Never allow email, phone, names, tokens, or arbitrary free text.
 */
export const EVENT_SCHEMAS = {
  first_visit: z
    .object({
      utm_source: optShortStr(100),
      utm_medium: optShortStr(100),
      utm_campaign: optShortStr(120),
      utm_content: optShortStr(120),
      referrer: optShortStr(256),
      landing: optShortStr(256),
      partner: optShortStr(64),
    })
    .strict(),

  page_view: z
    .object({
      route: shortStr(256),
    })
    .strict(),

  module_open: z
    .object({
      module: shortStr(64),
    })
    .strict(),

  entity_view_end: z
    .object({
      entityType: shortStr(64),
      entityId: shortStr(128),
      activeSec: z.number().int().min(0).max(86400),
    })
    .strict(),

  search: z
    .object({
      scope: shortStr(64),
      queryLength: z.number().int().min(0).max(500),
      resultCount: z.number().int().min(0).max(100000),
      query: z.string().trim().max(200).optional(),
    })
    .strict(),

  filter_change: z
    .object({
      module: shortStr(64),
      filter: shortStr(64),
      value: shortStr(128),
    })
    .strict(),

  tab_switch: z
    .object({
      module: shortStr(64),
      tab: shortStr(64),
    })
    .strict(),

  shortcut_used: z
    .object({
      module: shortStr(64),
      key: shortStr(32),
    })
    .strict(),

  practice_start: z
    .object({
      module: shortStr(64),
      attemptId: shortStr(64),
      total: z.number().int().min(1).max(500),
    })
    .strict(),

  practice_complete: z
    .object({
      module: shortStr(64),
      attemptId: shortStr(64),
      correct: z.number().int().min(0).max(500),
      total: z.number().int().min(1).max(500),
    })
    .strict(),

  quiz_start: z
    .object({
      module: shortStr(64),
      entityId: shortStr(128),
      attemptId: shortStr(64),
    })
    .strict(),

  quiz_complete: z
    .object({
      module: shortStr(64),
      entityId: shortStr(128),
      attemptId: shortStr(64),
    })
    .strict(),

  explanation_open: z
    .object({
      sourceId: shortStr(128),
      kind: z.enum(['elimination', 'deep_dive']),
    })
    .strict(),

  question_report: z
    .object({
      sourceType: shortStr(64),
      sourceId: shortStr(128),
      reason: shortStr(64),
    })
    .strict(),

  mapbot_query: z
    .object({
      queryLength: z.number().int().min(0).max(5000),
      cacheHit: z.boolean(),
    })
    .strict(),

  paywall_hit: z
    .object({
      feature: shortStr(64),
      module: shortStr(64),
    })
    .strict(),

  upgrade_cta_click: z
    .object({
      placement: shortStr(64),
    })
    .strict(),

  pricing_view: z.object({}).strict(),

  plan_select: z
    .object({
      plan: shortStr(64),
    })
    .strict(),

  coupon_apply: z
    .object({
      code: shortStr(64),
      valid: z.boolean(),
    })
    .strict(),

  checkout_start: z
    .object({
      plan: shortStr(64),
      amountPaise: z.number().int().min(0),
      orderId: shortStr(64),
    })
    .strict(),

  share_click: z
    .object({
      entityType: shortStr(64),
      entityId: shortStr(128),
      target: shortStr(64),
    })
    .strict(),

  client_error: z
    .object({
      route: shortStr(256),
      message: z.string().trim().min(1).max(200),
      source: shortStr(64),
    })
    .strict(),

  web_vital: z
    .object({
      name: z.enum(['LCP', 'INP', 'CLS', 'TTFB']),
      value: z.number().min(0).max(600000),
      route: shortStr(256),
    })
    .strict(),
} as const;

export type EventName = keyof typeof EVENT_SCHEMAS;

export const ENVELOPE_SCHEMA = z
  .object({
    eventId: z.string().uuid(),
    name: z.string().min(1).max(64),
    clientTs: z.string().datetime().optional(),
    anonId: shortStr(64),
    sessionId: shortStr(64),
    module: optShortStr(64),
    entityType: optShortStr(64),
    entityId: optShortStr(128),
    props: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export type RawIncomingEvent = z.input<typeof ENVELOPE_SCHEMA>;

export interface ValidatedEvent {
  eventId: string;
  name: EventName;
  clientTs?: string;
  anonId: string;
  sessionId: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  props: Record<string, unknown>;
}

export interface DroppedEvent {
  index: number;
  name?: string;
  reason: string;
}

export interface ValidationResult {
  accepted: ValidatedEvent[];
  dropped: DroppedEvent[];
}

function isKnownEventName(name: string): name is EventName {
  return Object.prototype.hasOwnProperty.call(EVENT_SCHEMAS, name);
}

/**
 * Validates a batch of incoming analytics events against PRD §4 allow-list.
 * Unknown event names and invalid/disallowed props are dropped.
 */
export function validateEvents(input: unknown): ValidationResult {
  if (!Array.isArray(input)) {
    return { accepted: [], dropped: [{ index: -1, reason: 'batch_not_array' }] };
  }

  const accepted: ValidatedEvent[] = [];
  const dropped: DroppedEvent[] = [];

  for (let i = 0; i < input.length; i++) {
    const envParsed = ENVELOPE_SCHEMA.safeParse(input[i]);
    if (!envParsed.success) {
      const maybeName =
        input[i] && typeof input[i] === 'object' && 'name' in input[i]
          ? String((input[i] as Record<string, unknown>).name)
          : undefined;
      dropped.push({ index: i, name: maybeName, reason: 'invalid_envelope' });
      continue;
    }

    const env = envParsed.data;
    if (!isKnownEventName(env.name)) {
      dropped.push({ index: i, name: env.name, reason: 'unknown_event_name' });
      continue;
    }

    const schema = EVENT_SCHEMAS[env.name];
    const propsParsed = schema.safeParse(env.props);
    if (!propsParsed.success) {
      dropped.push({ index: i, name: env.name, reason: 'invalid_props' });
      continue;
    }

    const cleanProps: Record<string, unknown> = { ...(propsParsed.data as Record<string, unknown>) };

    // PRD §4: search.query only kept when resultCount === 0, trimmed to 60 chars, lower-cased.
    if (env.name === 'search') {
      const resultCount = cleanProps.resultCount as number;
      if (resultCount > 0) {
        delete cleanProps.query;
      } else if (typeof cleanProps.query === 'string') {
        const normalized = cleanProps.query.trim().toLowerCase().slice(0, 60);
        if (normalized.length > 0) {
          cleanProps.query = normalized;
        } else {
          delete cleanProps.query;
        }
      }
    }

    accepted.push({
      eventId: env.eventId,
      name: env.name,
      ...(env.clientTs ? { clientTs: env.clientTs } : {}),
      anonId: env.anonId,
      sessionId: env.sessionId,
      ...(env.module ? { module: env.module } : {}),
      ...(env.entityType ? { entityType: env.entityType } : {}),
      ...(env.entityId ? { entityId: env.entityId } : {}),
      props: cleanProps,
    });
  }

  return { accepted, dropped };
}
