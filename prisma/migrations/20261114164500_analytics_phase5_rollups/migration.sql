-- Phase 5: Nightly & periodic rollup tables (kept forever)

CREATE TABLE IF NOT EXISTS kpi_period (
  period_type      TEXT NOT NULL, -- day | week | month
  period_start     DATE NOT NULL, -- IST date
  sessions         INTEGER NOT NULL DEFAULT 0,
  unique_visitors  INTEGER NOT NULL DEFAULT 0,
  new_visitors     INTEGER NOT NULL DEFAULT 0,
  active_users     INTEGER NOT NULL DEFAULT 0,
  signups          INTEGER NOT NULL DEFAULT 0,
  carts            INTEGER NOT NULL DEFAULT 0,
  carts_abandoned  INTEGER NOT NULL DEFAULT 0,
  payments_failed  INTEGER NOT NULL DEFAULT 0,
  subs_new         INTEGER NOT NULL DEFAULT 0,
  subs_renewal     INTEGER NOT NULL DEFAULT 0,
  revenue_paise    BIGINT NOT NULL DEFAULT 0,
  refunds_paise    BIGINT NOT NULL DEFAULT 0,
  fees_paise       BIGINT NOT NULL DEFAULT 0,
  active_pro_eod   INTEGER NOT NULL DEFAULT 0,
  pro_expired      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (period_type, period_start)
);

CREATE TABLE IF NOT EXISTS learning_daily (
  date        DATE NOT NULL,
  module      TEXT NOT NULL,
  subject     TEXT NOT NULL,
  answered    INTEGER NOT NULL DEFAULT 0,
  correct     INTEGER NOT NULL DEFAULT 0,
  median_sec  INTEGER NOT NULL DEFAULT 0,
  users       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, module, subject)
);

CREATE TABLE IF NOT EXISTS cost_daily (
  date        DATE NOT NULL,
  category    TEXT NOT NULL,
  feature     TEXT NOT NULL,
  provider    TEXT NOT NULL,
  quantity    DOUBLE PRECISION NOT NULL DEFAULT 0,
  cost_paise  BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (date, category, feature, provider)
);

CREATE TABLE IF NOT EXISTS message_daily (
  date          DATE NOT NULL,
  channel       TEXT NOT NULL,
  purpose       TEXT NOT NULL,
  sent          INTEGER NOT NULL DEFAULT 0,
  delivered     INTEGER NOT NULL DEFAULT 0,
  bounced       INTEGER NOT NULL DEFAULT 0,
  failed        INTEGER NOT NULL DEFAULT 0,
  clicked       INTEGER NOT NULL DEFAULT 0,
  complained    INTEGER NOT NULL DEFAULT 0,
  unsubscribed  INTEGER NOT NULL DEFAULT 0,
  cost_paise    BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (date, channel, purpose)
);

CREATE TABLE IF NOT EXISTS marketing_daily (
  date           DATE NOT NULL,
  source         TEXT NOT NULL,
  campaign       TEXT NOT NULL,
  visitors       INTEGER NOT NULL DEFAULT 0,
  signups        INTEGER NOT NULL DEFAULT 0,
  carts          INTEGER NOT NULL DEFAULT 0,
  subs           INTEGER NOT NULL DEFAULT 0,
  revenue_paise  BIGINT NOT NULL DEFAULT 0,
  spend_paise    BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (date, source, campaign)
);

CREATE TABLE IF NOT EXISTS feature_daily (
  date     DATE NOT NULL,
  module   TEXT NOT NULL,
  feature  TEXT NOT NULL,
  users    INTEGER NOT NULL DEFAULT 0,
  events   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, module, feature)
);

CREATE TABLE IF NOT EXISTS search_zero (
  date   DATE NOT NULL,
  scope  TEXT NOT NULL,
  query  TEXT NOT NULL,
  count  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, scope, query)
);
