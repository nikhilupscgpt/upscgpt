# PRD: upscgpt+ Analytics, Cost & Security Telemetry

| | |
|---|---|
| **Status** | Ready for build |
| **Owner** | Product (admin) |
| **Builder** | Antigravity agent, phase by phase |
| **Stack assumed** | Next.js (App Router) · TypeScript · Prisma · PostgreSQL · Razorpay |
| **Timezone for all reporting** | `Asia/Kolkata` (IST). Weeks start Monday. |
| **Money** | Always stored as integer **paise** (`Int` / `BigInt`). Never floats. |

---

## 1. Why we are building this

We need one trustworthy place to answer four kinds of questions:

1. **Business:** How many people visit, sign up, add to cart, abandon, subscribe, renew, churn, every day, week and month?
2. **Product / UX:** Which modules and features are used, where users drop off, what they search for and don't find?
3. **Learning:** How many questions are solved, how accurate users are, which questions are broken or too hard?
4. **Cost, marketing & security:** What each user costs to serve (AI, SMS, email, infra), which channels bring paying users, and whether anyone is abusing OTPs, quotas or content.

### Build vs. buy decision (final)

Third-party product analytics (PostHog, Mixpanel, Amplitude) bill per event once past their free tier. At our expected scale (~9M events/month at 5k DAU) that becomes a recurring monthly bill. **We will build analytics in our own Postgres** and use only tools that stay free at any scale:

| Need | Solution |
|---|---|
| Attempts, business events, payments, cost ledger, security, audit | **Own Postgres** (this PRD) |
| Campaign / referrer attribution | **Google Analytics 4** — page views only, after consent |
| Heatmaps, session recordings | **Microsoft Clarity** — after consent |
| Organic search data | **Google Search Console** — daily import |
| Web vitals | `web-vitals` npm package → own table, 10% sample |
| Rate limiting | Redis (e.g. Upstash) **or** Postgres `UNLOGGED` table with TTL cleanup. Not `ActionLog`. |

### Non-goals

- No session replay, heatmaps or mouse/scroll tracking built in-house.
- No real-time (sub-minute) dashboards. Daily rollups are enough; "today" tiles may query live with a short cache.
- No change to existing user-facing behaviour except: (a) answers are no longer sent to the browser before submission, (b) consent banner, (c) OTP rate limits.

### Codebase Reconciliation (Finalized Technical Decisions)

Based on direct audit of the `upsc_atlas_portal` codebase (`Next 16.2.1`, `Prisma 5.22.0`, `zod 4.3.6`, `node-cron 4.2.1`):

1. **Mixed JS/TS codebase:** Existing routes/components are mostly `.js` with both `jsconfig.json` and `tsconfig.json`. New analytics/cost modules (`lib/analytics/*`, `lib/cost/*`) will be authored in `.ts` and imported from `.js` routes via `@/lib/...`.
2. **`Attempt` / `AttemptAnswer` vs. stale `prisma.quizAttempt`:** `Attempt` and `AttemptAnswer` already exist in `prisma/schema.prisma` (with no writers yet) and will be **extended** per §3.1. `QuizAttempt` does not exist in `schema.prisma`, though `/api/quizzes/submit`, `/api/user/neural-analytics`, and `/api/user/intelligence/dashboard` still call `prisma.quizAttempt` (silently catching errors). Phase 1 will migrate those 3 callers to `Attempt` + `AttemptAnswer` as the single source of truth.
3. **`PaymentLog` vs. `Order` + `PaymentEvent`:** `prisma/schema.prisma` currently has `PaymentLog` (`razorpayId`, `amount`, `currency`, `status`). Phase 4 will introduce `Order` + `PaymentEvent` (integer paise), backfill/keep `PaymentLog` read-only for historical records, and update `/api/admin/monetisation` to read from `Order` + `PaymentEvent`.
4. **Server-side grading for `env_atlas` & `map_quiz`:** Environment Atlas quiz items currently live in client data (`EnvironmentAtlasClient.js`), and `/api/quiz` generates Map MCQs on the fly with `correctLabel` in the response. Phase 1 will move Environment Atlas quiz definitions to a server-readable source and persist generated `/api/quiz` questions server-side on the `Attempt` before stripping `correctLabel`/explanations from browser payloads.
5. **Existing unconditional GA4 (`G-XV8ZY1XKLC`):** `src/app/layout.js` currently loads `gtag` unconditionally. Phase 3 will gate that existing `<Script>` block (and any Clarity/Contentsquare tag) behind the consent banner.
6. **Capacitor WebViews (`@capacitor/android`, `@capacitor/ios`):** `lib/analytics/client.ts` will use `pagehide` + `visibilitychange` + `sendBeacon` (with `fetch(..., { keepalive: true })` fallback) and classify Capacitor WebViews accurately under `device`.

---

## 2. Architecture

```
Browser
  lib/analytics/client.ts  (tracker)
    queue → flush every 10s / 20 events / on pagehide via navigator.sendBeacon
        │
        ▼
POST /api/e   (batch ingest)
    zod-validate each event against EVENT_SCHEMAS (unknown names/props dropped)
    enrich: userId + tier (from session), deviceType, ip24, country
    single multi-row INSERT into event_raw
        │
        ▼
event_raw  (Postgres, RANGE-partitioned monthly on created_at, kept 90 days)
        │   nightly cron (IST)
        ▼
kpi_period / learning_daily / cost_daily / marketing_daily / question_stats
        │
        ▼
/admin/analytics  (reads rollups only; "today" tiles query live, cached 60s)

Server-side sources of truth (NOT browser events):
  User.createdAt → signups
  Order          → carts / abandoned
  PaymentEvent   → subscriptions / revenue / refunds
  Attempt(+Answer) → questions solved / accuracy
  UsageLedger    → all variable costs
  MessageLog     → emails, OTPs, WhatsApp, push
```

**Rule:** anything involving money, identity or grading is recorded on the **server**. Browser events are only for behaviour (views, clicks, searches, dwell).

---

## 3. Data model

> Agent: first read the existing `schema.prisma`. Reuse existing `User`, `Order`, `Attempt`, `AttemptAnswer`, `ActionLog` models where they exist; **extend** them instead of creating duplicates. Field names below are the target shape.

### 3.1 Learning (kept forever)

```prisma
model Attempt {
  id          String    @id @default(cuid())
  userId      String?
  anonId      String?
  module      String    // pyq_practice | daily_drill | mock | env_atlas | map_quiz
  filters     Json?     // year/subject/topic used to build the set
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  total       Int
  correct     Int       @default(0)   // server-computed
  answers     AttemptAnswer[]
  @@index([userId, startedAt])
  @@index([module, startedAt])
}

model AttemptAnswer {
  id           String   @id @default(cuid())
  attemptId    String
  attempt      Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId   String?  // FK to PYQ bank when applicable
  sourceType   String   // pyq | env_atlas | map_quiz | drill
  sourceId     String   // stable id, e.g. "snow-leopard:q1" or questionId
  subject      String?
  topic        String?
  examYear     Int?
  selected     String
  isCorrect    Boolean  // server-computed ONLY
  timeSpentSec Int      // clamp 0..600
  flagged      Boolean  @default(false)
  answeredAt   DateTime @default(now())
  @@unique([attemptId, sourceType, sourceId])
  @@index([sourceType, sourceId])
  @@index([answeredAt])
}

model QuestionReport {
  id         String   @id @default(cuid())
  sourceType String
  sourceId   String
  userId     String?
  reason     String   // wrong_key | typo | outdated | explanation_wrong | other
  note       String?  @db.VarChar(500)
  status     String   @default("open") // open | fixed | rejected
  createdAt  DateTime @default(now())
  @@index([status, createdAt])
}

model QuestionStats {          // rebuilt nightly
  sourceType     String
  sourceId       String
  attempts       Int
  pCorrect       Float        // difficulty
  discrimination Float?       // top27% correct − bottom27% correct; null if attempts < 30
  medianSec      Int
  updatedAt      DateTime @updatedAt
  @@id([sourceType, sourceId])
}
```

### 3.2 Behaviour events (raw, 90 days)

Created with **raw SQL migration** (Prisma cannot declare partitions). Prisma may read it via `$queryRaw`.

```sql
CREATE TABLE event_raw (
  event_id    uuid        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  client_ts   timestamptz,
  name        text        NOT NULL,
  user_id     text,
  anon_id     text        NOT NULL,
  session_id  text        NOT NULL,
  tier        text,                    -- anon | free | pro
  module      text,
  entity_type text,
  entity_id   text,
  props       jsonb       NOT NULL DEFAULT '{}',
  device      text,                    -- mobile | tablet | desktop
  ip24        text,                    -- e.g. 49.36.12.0/24
  PRIMARY KEY (created_at, event_id)
) PARTITION BY RANGE (created_at);

CREATE INDEX ON event_raw (name, created_at);
CREATE INDEX ON event_raw (user_id, created_at);
CREATE INDEX ON event_raw (anon_id, created_at);
-- create current + next month partitions in the migration;
-- a monthly cron creates the following month and drops partitions older than 90 days.
```

Also add (normal Prisma models):

```prisma
model AnonProfile {            // first-touch attribution
  anonId        String   @id
  firstSeenAt   DateTime @default(now())
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  utmContent    String?
  referrer      String?
  landingPath   String?
  partnerCode   String?
  userId        String?  // set at signup
}
// Add to User: firstTouch* fields copied from AnonProfile at signup, lastTouchSource before payment.
```

### 3.3 Money

```prisma
model Order {                  // extend existing if present
  id              String   @id @default(cuid())
  userId          String
  plan            String
  amountPaise     Int      // after coupon
  listPricePaise  Int
  couponCode      String?
  partnerCode     String?
  razorpayOrderId String   @unique
  status          String   // created | paid | failed | abandoned | refunded
  createdAt       DateTime @default(now())
  paidAt          DateTime?
  @@index([status, createdAt])
}

model PaymentEvent {
  id              String   @id @default(cuid())
  razorpayEventId String   @unique        // idempotency
  type            String   // payment.captured | payment.failed | refund.processed | ...
  orderId         String?
  userId          String?
  amountPaise     Int?
  feePaise        Int?
  taxOnFeePaise   Int?
  signatureValid  Boolean
  isRenewal       Boolean  @default(false)
  payload         Json
  receivedAt      DateTime @default(now())
  @@index([type, receivedAt])
}
```

### 3.4 Cost & messaging

```prisma
model UsageLedger {
  id        String   @id @default(cuid())
  at        DateTime @default(now())
  provider  String   // e.g. openai | gemini | anthropic | msg91 | resend | razorpay | maptiles
  category  String   // ai | sms | email | whatsapp | push | payment_fee | storage | maps | search_api
  feature   String   // mapbot | rag | deep_dive | otp_login | receipt | campaign | ingest
  unit      String   // tokens_in | tokens_out | sms | email | request | gb
  quantity  Float
  costPaise Int      // estimate from PRICE_TABLE
  userId    String?
  tier      String?
  meta      Json?    // model name, cacheHit, latencyMs
  @@index([at, category])
  @@index([userId, at])
}

model MessageLog {
  id            String   @id @default(cuid())
  channel       String   // email | sms | whatsapp | push
  purpose       String   // otp | transactional | marketing | alert
  template      String
  provider      String
  providerMsgId String?  @unique
  userId        String?
  toHash        String   // sha256 of phone/email — never the raw value
  campaignId    String?
  status        String   // queued | sent | delivered | opened | clicked | bounced | failed | complained | unsubscribed
  costPaise     Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([channel, purpose, createdAt])
}

model OtpRequest {
  id         String   @id @default(cuid())
  phoneHash  String
  deviceId   String?
  ip24       String?
  channel    String   // sms | whatsapp | email
  verified   Boolean  @default(false)
  createdAt  DateTime @default(now())
  verifiedAt DateTime?
  @@index([phoneHash, createdAt])
  @@index([deviceId, createdAt])
}

model FixedCost       { id String @id @default(cuid()) month DateTime item String amountPaise Int }
model MarketingSpend  { id String @id @default(cuid()) date DateTime channel String campaign String amountPaise Int }
model Campaign        { id String @id channel String name String sentAt DateTime? }
model BudgetLimit     { category String @id monthlyPaise Int alertAt Json /* [50,80,100] */ }
```

### 3.5 Security & audit

```prisma
model SecurityEvent {          // kept 30 days
  id       String   @id @default(cuid())
  type     String   // login_failed | otp_abuse | scrape_suspect | quota_tamper | bad_signature | device_evicted | forged_answer
  userId   String?
  anonId   String?
  deviceId String?
  ipFull   String?
  detail   Json
  at       DateTime @default(now())
  @@index([type, at])
}

model AuditLog {               // insert-only, forever
  id       String   @id @default(cuid())
  actorId  String
  action   String   // ADMIN_PASS_GRANTED | TIER_CHANGED | QUESTION_EDITED | PRICE_CHANGED ...
  entity   String
  entityId String
  before   Json?
  after    Json?
  ip       String?
  at       DateTime @default(now())
  @@index([entity, entityId])
}

model UserDevice {
  id        String   @id @default(cuid())
  userId    String
  deviceId  String
  uaFamily  String?
  firstSeen DateTime @default(now())
  lastSeen  DateTime @default(now())
  revokedAt DateTime?
  @@unique([userId, deviceId])
}
```

After migration, run: `REVOKE UPDATE, DELETE ON "AuditLog" FROM <app_role>;`

### 3.6 Rollups (kept forever)

```sql
CREATE TABLE kpi_period (
  period_type      text,   -- day | week | month
  period_start     date,   -- IST
  sessions         int,
  unique_visitors  int,
  new_visitors     int,
  active_users     int,    -- "meaningful activity" definition, §5
  signups          int,
  carts            int,
  carts_abandoned  int,
  payments_failed  int,
  subs_new         int,
  subs_renewal     int,
  revenue_paise    bigint,
  refunds_paise    bigint,
  fees_paise       bigint,
  active_pro_eod   int,
  pro_expired      int,
  PRIMARY KEY (period_type, period_start)
);

CREATE TABLE learning_daily  (date date, module text, subject text, answered int, correct int, median_sec int, users int, PRIMARY KEY (date, module, subject));
CREATE TABLE cost_daily      (date date, category text, feature text, provider text, quantity float, cost_paise bigint, PRIMARY KEY (date, category, feature, provider));
CREATE TABLE message_daily   (date date, channel text, purpose text, sent int, delivered int, bounced int, failed int, clicked int, complained int, unsubscribed int, cost_paise bigint, PRIMARY KEY (date, channel, purpose));
CREATE TABLE marketing_daily (date date, source text, campaign text, visitors int, signups int, carts int, subs int, revenue_paise bigint, spend_paise bigint, PRIMARY KEY (date, source, campaign));
CREATE TABLE feature_daily   (date date, module text, feature text, users int, events int, PRIMARY KEY (date, module, feature));
CREATE TABLE search_zero     (date date, scope text, query text, count int, PRIMARY KEY (date, scope, query));
```

---

## 4. Event dictionary (v1)

Defined once in `lib/analytics/events.ts` as zod schemas. **Only these names and props are accepted.** Props must never contain email, phone, names, tokens or free text (except `search.query` when `resultCount = 0`, trimmed to 60 chars and lower-cased).

| Event | Props | Fired from |
|---|---|---|
| `first_visit` | utm_source, utm_medium, utm_campaign, utm_content, referrer, landing, partner | client (once per anonId) |
| `page_view` | route | client, on route change |
| `module_open` | module | client |
| `entity_view_end` | entityType, entityId, activeSec | client, on leave (active time only) |
| `search` | scope, queryLength, resultCount, query? | client |
| `filter_change` | module, filter, value | client |
| `tab_switch` | module, tab | client |
| `shortcut_used` | module, key | client |
| `practice_start` | module, attemptId, total | server |
| `practice_complete` | module, attemptId, correct, total | server |
| `quiz_start` / `quiz_complete` | module, entityId, attemptId | server |
| `explanation_open` | sourceId, kind (elimination \| deep_dive) | client |
| `question_report` | sourceType, sourceId, reason | server |
| `mapbot_query` | queryLength, cacheHit | server |
| `paywall_hit` | feature, module | server (where limit is enforced) |
| `upgrade_cta_click` | placement | client |
| `pricing_view` | — | client |
| `plan_select` | plan | client |
| `coupon_apply` | code, valid | server |
| `checkout_start` | plan, amountPaise, orderId | server |
| `share_click` | entityType, entityId, target | client |
| `client_error` | route, message (≤200 chars), source | client (window.onerror, unhandledrejection, img onError) |
| `web_vital` | name (LCP\|INP\|CLS\|TTFB), value, route | client, 10% sample |

`signup`, `payment_success`, `payment_failed`, `refund` are **not** browser events; they are read from `User`, `PaymentEvent`.

---

## 5. Metric definitions (single source of truth)

All periods in IST. Day = 00:00–23:59 IST. Week = Monday–Sunday. Month = calendar month.

**Never sum unique counts across days.** Weekly/monthly uniques are computed with `COUNT(DISTINCT …)` over the whole period and stored when the period closes.

### 5.1 Core business

| Metric | Definition |
|---|---|
| Sessions | distinct `session_id` (session = 30 min inactivity, created in tracker) |
| Unique visitors | distinct `COALESCE(user_id, anon_id)` with any `page_view` |
| New visitors | anonIds whose `AnonProfile.firstSeenAt` falls in the period |
| **Active users** | distinct users/anons with a *meaningful* action: an `AttemptAnswer`, an `entity_view_end` with activeSec ≥ 10, or a `mapbot_query` |
| Signups | `User` rows with `createdAt` in period |
| Carts | `Order` rows created in period |
| Abandoned carts | Orders with no `paid` order by the same user within 24h of creation |
| Payments failed | `PaymentEvent.type = payment.failed` (distinct orders) |
| Subscriptions new / renewal | captured payments, split by `isRenewal` |
| Revenue | Σ captured amount − refunds (paise). Report fees separately. |
| Active PRO (EOD) | users with valid PRO entitlement at 23:59 IST |
| DAU/WAU/MAU, stickiness | active users per period; stickiness = DAU ÷ MAU |
| Conversion | visitors→signups, signups→carts, carts→paid, abandonment % |

### 5.2 Growth & retention

- **Activation:** within 7 days of signup, ≥ 5 answers **or** ≥ 2 modules used.
- **Retention D1/D7/D30:** by signup-week cohort, split activated vs not.
- **TTFV:** first meaningful action time − `firstSeenAt`.
- **Paywall conversion per feature:** users with `paywall_hit(feature)` who pay within 7 days ÷ users with that hit.
- **Churn risk:** PRO users whose weekly active days fell ≥ 50% vs their 4-week average, or expiring in ≤ 7 days with no visit in 5 days.
- **Season tag** on every cohort: `pre_prelims` (Jan–May), `post_prelims` (Jun–Aug), `mains` (Sep–Dec). Prelims date stored in config.

### 5.3 Learning

- Questions solved (count of `AttemptAnswer`), per user and platform.
- Accuracy by module, subject, topic, year, pattern.
- Speed bands: < 15s, 15–90s, > 90s, with accuracy per band.
- Flow completion: start → 50% → complete, and the question index where users quit.
- Reading depth per entity: skimmed (< 5s), studied (≥ 30s), quiz passed.
- **Question quality** (attempts ≥ 30): `pCorrect`, `discrimination`. **Negative discrimination → "check answer key" list.**

### 5.4 Cost

- Daily spend by category / feature / provider (from `UsageLedger`).
- OTPs sent by channel, **OTP verify rate**, resends per login, **OTP cost per successful login/signup**.
- Emails by purpose; delivered %, bounce %, complaint %.
- AI tokens & cost by feature, **cache hit rate**, latency, top 20 users by AI cost.
- **Cost per DAU**, **cost per signup**, **cost to serve per PRO user**, **free-tier burn**.
- **Gross margin** = (revenue − refunds − payment fees − variable cost) ÷ revenue.
- Monthly P&L = revenue − variable cost − `FixedCost` − `MarketingSpend`.

### 5.5 Marketing

- Visitors / signups / PRO / revenue by first-touch source & campaign; last-touch before payment.
- **CAC** = spend ÷ new PRO, per channel. **Cost per signup** per channel. **ROAS** = revenue ÷ spend.
- **LTV** = avg monthly revenue per PRO × avg months retained. **Payback** = CAC ÷ monthly revenue per PRO.
- Coupons: redemptions, revenue, discount given, renewal rate of coupon users.
- Partner codes: signups, PRO, revenue per partner (affiliate payout basis).
- Campaigns (email/WhatsApp/push): sent → delivered → clicked → signup/paid within 7d; unsubscribe & complaint rate; revenue per 1,000 sent. **Do not use email open rate** (inflated by Apple Mail).
- Lifecycle flows: welcome D0/D1/D3, abandoned cart 1h/24h, PRO expiry 7d/1d, win-back 14d, Prelims countdown −100/−60/−30.
- Organic: Search Console impressions/clicks/CTR by page & query (daily import).
- Content: top entry pages for new visitors; share clicks and visits from shared links.

---

## 6. Security requirements

1. **No answer leakage.** Question payloads sent to the browser must not include `correctLabel` or explanations. New endpoint `POST /api/attempts/:id/answer` grades, stores, then returns `{ isCorrect, correctLabel, explanation }`.
2. **Entitlements server-side.** PRO status, quotas, limits are read from DB on each gated request. Ignore client-sent `isPro`, `score`, `attemptedIds`.
3. **Input sanity.** Reject unknown `sourceId`, duplicate answers, `timeSpentSec` outside 0–600 → log `SecurityEvent(forged_answer)`.
4. **Rate limits** keyed by `userId` → `deviceId` → `ip24` (IP is a loose backstop only; Indian mobile networks share IPs).
5. **Scraping detection:** > 300 distinct questions/issues/atlas items fetched per hour per user/anon → `SecurityEvent(scrape_suspect)` + throttle. Cap list-API page size at 50.
6. **Canary content:** 3–5 plausible fake items, invisible in normal browsing, served only to bulk fetchers; used to prove copying.
7. **OTP abuse guards:** +91 only; ≤ 3 OTP/number/hour, ≤ 5/day; ≤ 5/device/day; CAPTCHA after 2 on one device; alert if hourly verify rate < 40%.
8. **Device limit:** PRO = max **2** active devices (configurable). 3rd login revokes the oldest and emails the user.
9. **Login protection:** count failures per account and per ip24; exponential backoff; log resets.
10. **Razorpay:** verify every webhook signature; idempotent on `razorpayEventId`; log invalid signatures as `SecurityEvent(bad_signature)`.
11. **Daily reconciliation cron:** paid-but-not-PRO, PRO-without-payment, refund-but-still-PRO → alert.
12. **Admin audit:** every admin mutation writes `AuditLog` with before/after. Table is insert-only.

---

## 7. Privacy (India DPDP Act 2023)

- **Consent banner** before loading GA4 and Clarity. Essential telemetry (attempts, payments, security, cost) runs without it.
- **No PII in events**: enforced by zod allow-list. Phone/email only as sha256 hashes in `MessageLog`/`OtpRequest`.
- **IP**: `ip24` in analytics; full IP only in `SecurityEvent`, 30 days.
- Clarity: keep input masking on (default).
- **Account deletion**: delete user, set `user_id = NULL` on `event_raw`, keep rollups.
- **Retention jobs**: event_raw 90d · SecurityEvent 30d · OtpRequest 30d · rate-limit rows minutes · Attempt/Payment/Audit for account lifetime (Audit forever).
- Marketing messages only to users with marketing consent; one-click unsubscribe; respect it in `MessageLog`.
- Publish a short "What we collect and why" page.

---

## 8. Cost controls

- `lib/cost/price-table.ts`: unit price per provider/unit (paise). Single place to update.
- `recordUsage()` helper wraps **every** AI, SMS, email, WhatsApp, maps and search call.
- `BudgetLimit` per category; alerts at 50/80/100%.
- Spike alert: category's daily cost > 3× its 7-day average.
- Alerts go to admin email **and** a Telegram bot (env: `ALERT_TELEGRAM_BOT_TOKEN`, `ALERT_TELEGRAM_CHAT_ID`).
- **Kill switches** (feature flags in DB/config):
  - `mapbot_free_cached_only` — free users get cached answers only.
  - `otp_channel_fallback` — switch SMS → WhatsApp/email.
  - `ai_free_tier_paused`.
- Monthly: compare ledger total vs provider invoice (manual entry); > 10% gap = untracked path.

---

## 9. Admin dashboard (`/admin/analytics`)

Admin-only route (existing admin role). Reads rollup tables. Period switch: **Day / Week / Month**. Compare to previous period and same period last week/month.

| Tab | Contents |
|---|---|
| **Overview** | Tiles: Visits · Unique visitors · Signups · Carts · Abandoned · Subscribed (new/renewal) · Revenue · Active PRO. Funnel Visitors→Signups→Cart→Paid. 90-day trend lines with Prelims date marker. |
| **Learning** | Questions solved, accuracy by subject, speed bands, flow drop-off, "check these keys" list, open question reports. |
| **Product** | Module & feature adoption, filter/tab/shortcut usage, zero-result searches, reading depth, client errors, web vitals by route. |
| **Costs** | Spend by category/feature/provider, budget meters, OTP verify rate, email health, AI cost per feature & cache hit, cost per DAU / signup / PRO, gross margin, P&L. |
| **Marketing** | Channels, CAC, ROAS, LTV, payback, coupons, partner codes, campaigns, lifecycle flows, Search Console. |
| **Security** | OTP abuse, scrape suspects, failed logins, device evictions, bad signatures, reconciliation mismatches, audit log viewer. |

Plain HTML tables + a lightweight chart lib already in the project (or Recharts). Dashboard must load in < 1s.

---

## 10. Cron jobs (all IST)

| Time | Job |
|---|---|
| every 15 min | mark orders `abandoned` after 24h; budget spike check; OTP verify-rate check |
| 00:30 daily | build `day` rows for yesterday in all rollup tables; **rebuild day-before-yesterday** (late webhooks) |
| 01:00 Monday | build `week` rows for last week |
| 01:30 on 1st | build `month` rows; create next month's `event_raw` partition |
| 02:00 daily | `question_stats` rebuild; retention cleanup; drop `event_raw` partitions > 90 days (optional export to object storage first) |
| 03:00 daily | payment reconciliation; Search Console import |

Use whatever scheduler the project already uses (Vercel Cron, GitHub Actions, or a protected `/api/cron/*` route with a secret header).

---

## 11. Phases & acceptance criteria

### Phase 0 — Audit & foundations (≈1 day)
- Map current code: question APIs, `PracticeClient`, Daily Drill, Mock, `/api/quiz`, Environment Atlas quiz, `ActionLog` usages, monetisation/usage limits, OTP/email/AI provider calls, Razorpay webhook, admin routes, existing cron.
- Fill **Appendix A** (providers & unit prices) and **Appendix B** (file map) in this doc.
- Create `lib/analytics/events.ts` (zod schemas from §4) and `lib/analytics/metrics.md` link to §5.
- **Done when:** Appendices filled, no code behaviour changed.

### Phase 1 — Grading & attempts (≈3–4 days)
- Remove answers/explanations from question payloads.
- `POST /api/attempts` (start) and `POST /api/attempts/:id/answer` (grade + store).
- Wire PYQ Practice, Daily Drill, Mock, Environment Atlas quiz, Map quiz.
- `QuestionReport` button + endpoint.
- **Done when:** Network tab shows no correct answers before submit; every answer creates an `AttemptAnswer`; existing UI still works.

### Phase 2 — Messaging, OTP guards, cost ledger (≈2–3 days)
- `MessageLog`, `OtpRequest`, provider webhooks for delivery status.
- OTP limits (§6.7).
- `recordUsage()` wrapped around every billable call; `price-table.ts`.
- **Done when:** every OTP/email/AI call produces a ledger row; OTP limits enforced and tested.

### Phase 3 — Event pipeline & consent (≈3 days)
- Tracker, `/api/e`, `event_raw` partitioned table, `AnonProfile` first-touch, session ids.
- Consent banner; load GA4 (page views only) and Clarity after consent.
- `entity_view_end` with active-time measurement; `client_error`; `web_vital` (10%).
- **Done when:** events arrive in batches (< 1 request / 10s / tab); unknown props are dropped; nothing loads before consent.

### Phase 4 — Money & security (≈3–4 days)
- `Order` statuses, `PaymentEvent` with idempotency and signature logging, renewal detection.
- Rate limits moved out of `ActionLog`; `UserDevice` + device limit; `SecurityEvent`; scraping detection; `AuditLog` on admin mutations; reconciliation cron.
- **Done when:** `ActionLog` has no `RL:*` rows; webhook replay doesn't double-count; reconciliation alert fires on a seeded mismatch.

### Phase 5 — Rollups & dashboard (≈3–4 days)
- All rollup tables + crons (§10). `/admin/analytics` with six tabs (§9).
- **Done when:** day/week/month numbers match hand-run SQL on a sample; weekly uniques ≠ sum of daily uniques; IST boundaries verified.

### Phase 6 — Marketing & optimisation (ongoing)
- `MarketingSpend` CSV import, partner codes, Search Console import, campaign + lifecycle tracking, budgets/kill switches UI, question-quality review workflow, partition archive.

---

## 12. Testing

- Unit tests: zod event validation, grading, metric SQL on fixtures (include IST midnight edge cases and a user active on 5 days of one week).
- Integration: Razorpay webhook replay (same `razorpayEventId` twice), OTP limit breach, device-limit eviction.
- Manual: consent off → no GA4/Clarity requests; Network tab shows no answers pre-submit.

---

## 13. When to revisit this design

Move **only** `event_raw` to a column store (ClickHouse, or DuckDB over archived files) when any of: raw events > ~50M rows, nightly rollup > 10 min, or ad-hoc analysis needed often. Everything else stays in Postgres.

---

## Appendix A — Providers & unit prices (filled in Phase 0)

| Category | Provider | Unit | Price (paise) | Free tier / plan limit |
|---|---|---|---|---|
| SMS OTP | MSG91 (`MSG91_AUTH_KEY`, `MSG91_OTP_TEMPLATE_ID` in `src/lib/comms.js`) — currently simulated when key missing | per SMS | *TBD — user to confirm* | — |
| WhatsApp | MSG91 (`MSG91_AUTH_KEY`, `WHATSAPP_NUMBER` in `src/lib/comms.js`) — currently simulated when key missing | per message (by category) | *TBD — user to confirm* | — |
| Email | Resend (`RESEND_API_KEY`) with Gmail SMTP (`GMAIL_USER`, `GMAIL_PASS`) fallback in `src/lib/comms.js` | per email | *TBD — user to confirm* | Resend free tier / Gmail limits |
| AI (Mapbot) | Google Gemini (`GEMINI_API_KEY` via `@google/genai` / `@google/generative-ai` in `src/app/api/mapbot/route.js`) | per 1M tokens in / out | *TBD — user to confirm model* | Gemini API tier |
| AI (explanations / RAG / CMS) | Google Gemini (`GEMINI_API_KEY`) + local/remote Ollama (`OLLAMA_HOST`) + OpenAI (`src/app/api/admin/node-content/route.js`) | per 1M tokens in / out | *TBD — user to confirm* | Ollama = 0 paise (self-hosted) |
| Embeddings | Google Gemini `embedContent` (`src/lib/gemini.js`, `src/lib/rag-utils.js`) | per 1M tokens | *TBD — user to confirm* | — |
| News APIs | GNews (`GNEWS_API_KEY`), NewsData (`NEWSDATA_API_KEY`) | per request | *TBD — user to confirm* | Free / paid plan |
| Hosting | Vercel (`vercel.json` present) | plan + overage | *TBD — user to confirm* | — |
| Database | PostgreSQL (`DATABASE_URL` / `DIRECT_URL`) | compute hr / GB | *TBD — user to confirm* | — |
| Object storage / CDN | *Not detected in env vars* | GB stored / served | *TBD* | — |
| Map tiles | Leaflet (`leaflet` / `react-leaflet`) | per 1k tiles | *TBD — tile provider* | — |
| Payments | Razorpay (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) | % fee + GST on fee | *TBD — ~2% + 18% GST* | — |

## Appendix B — File map (filled in Phase 0)

| Area | Current file(s) | Change needed |
|---|---|---|
| PYQ question API | `src/app/api/pyq/route.js`, `src/app/api/pyq/concepts/route.js` | Strip `correctLabel` / `explanation` from browser payloads (Phase 1); add server grading via `/api/attempts/:id/answer` |
| PracticeClient | `src/app/prelims/pyq/practice/page.js`, `src/app/prelims/pyq/practice/PracticeClient.js` | Start `Attempt` on load, grade each answer via `POST /api/attempts/:id/answer`, add `QuestionReport` button (Phase 1) |
| Daily Drill | `src/app/api/pyq/daily-drill/route.js`, `src/app/prelims/pyq/practice/page.js` | Persist `Attempt` (`mode = 'daily_drill'`) & `AttemptAnswer`s; ignore client-sent `attemptedIds` for gating (Phase 1) |
| Mock tests | `src/app/prelims/mocks/page.js`, `src/app/prelims/result/[id]/page.js`, `src/app/api/quizzes/submit/route.js` | Migrate stale `prisma.quizAttempt` callers to `Attempt` / `AttemptAnswer` (Phase 1) |
| Map quiz `/api/quiz` | `src/app/api/quiz/route.js` | Persist generated questions server-side on `Attempt` and strip `correctLabel` before returning to browser (Phase 1) |
| Environment Atlas quiz | `src/components/EnvironmentAtlasClient.js`, `src/app/api/environment/items/route.js` | Move quiz items/answers to server-readable store & grade via `Attempt` / `AttemptAnswer` (Phase 1) |
| Usage limits / paywall | `src/lib/tier-gate.js`, `src/lib/monetisation.js`, `src/app/api/monetisation/usage/route.js`, `src/app/api/user/usage/route.js` | Emit `paywall_hit` server events (Phase 3); move rate limits out of `ActionLog` (Phase 4) |
| OTP send/verify | `src/app/api/auth/otp/request/route.js` (and verify route under `src/app/api/auth/otp/`) | Add `OtpRequest` tracking, +91/device/hourly/daily guards, `MessageLog`, `recordUsage()` (Phase 2) |
| Email send | `src/lib/comms.js`, `src/app/api/admin/comms/send/route.js` | Wrap `sendEmail`/`sendSMS`/`sendWhatsApp` with `MessageLog` (`toHash`) & `recordUsage()` (Phase 2) |
| AI calls (Mapbot, RAG, deep dive) | `src/app/api/mapbot/route.js`, `src/app/api/rag/query/route.js`, `src/lib/ai.js`, `src/lib/gemini.js`, `src/lib/rag-utils.js`, `src/app/api/quiz/route.js`, `src/app/api/nano/route.js`, `src/app/api/news/route.js`, `src/app/api/user/notes/suggest/route.js`, `src/app/api/admin/node-content/route.js`, `src/app/api/admin/questions/generate/route.js`, `src/app/api/admin/ocr/route.js`, `src/app/api/admin/rapid-ingest/route.js`, `src/app/api/admin/optional-content/parse-doc/route.js`, `src/app/api/admin/news-engine/process/route.js`, `src/app/api/admin/forge/ai/route.js`, `src/app/api/admin/seo/generate/route.js`, `src/app/api/admin/studio/reels/ai-polish/route.js` | Wrap every AI & embedding call with `recordUsage()` (tokens, model, cacheHit, latencyMs) (Phase 2) |
| Razorpay order + webhook | `src/lib/razorpay.js`, `src/app/api/payment/order/route.js`, `src/app/api/payment/verify/route.js`, `src/app/api/payment/webhook/route.js` | Introduce `Order` & `PaymentEvent` (integer paise), idempotency on `razorpayEventId`, signature failure `SecurityEvent` (Phase 4) |
| Admin routes | `src/app/api/admin/**` (32 route dirs incl. `users`, `monetisation`, `pyq`, `issues`, `questions`, `ai-prompts`, `config`, `comms`, `env-atlas`, etc.) | Add `AuditLog` on all admin mutations (Phase 4); add `/admin/analytics` + rollup readers (Phase 5) |
| ActionLog writers | `src/lib/rateLimit.js` (`RL:*`), `src/app/actions/user-activity.js`, `src/app/api/mapbot/route.js`, `src/app/api/rag/query/route.js`, `src/app/api/monetisation/usage/route.js`, `src/app/prelims/pyq/practice/page.js`, `src/app/api/payment/*`, `src/app/api/admin/*`, `src/app/api/cron/expire-subscriptions/route.js` | Remove `RL:*` rate-limit writes from `ActionLog` into dedicated RL store (Phase 4); keep domain/audit separation |
| Cron | `vercel.json` (`/api/cron/expire-subscriptions` at `45 18 * * *` UTC = `00:15 IST`), `src/app/api/cron/scrape/route.js` (stub), `node-cron` in `package.json` | Add protected `/api/cron/analytics-*` routes or Vercel Cron entries per §10 IST schedule (Phase 5) |
