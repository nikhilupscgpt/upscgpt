import crypto from 'node:crypto';

export const KILL_SWITCH_DEFAULTS = [
  {
    key: 'mapbot_free_cached_only',
    description: 'Serve only cached MapBot responses for FREE users when AI costs spike',
  },
  {
    key: 'otp_channel_fallback',
    description: 'Enable fallback OTP channel (WhatsApp/Email) when primary SMS delivery drops',
  },
  {
    key: 'ai_free_tier_paused',
    description: 'Temporarily pause AI generation for FREE tier users during budget emergencies',
  },
] as const;

export type KillSwitchKey = (typeof KILL_SWITCH_DEFAULTS)[number]['key'];

export const LIFECYCLE_FLOWS = [
  'welcome',
  'abandoned_cart_1h',
  'abandoned_cart_24h',
  'pro_expiry_7d',
  'pro_expiry_1d',
  'win_back_14d',
  'prelims_countdown',
] as const;

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

export function parseCsvRows(csvText: string): Array<Record<string, string>> {
  const lines = String(csvText || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().trim());

  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cols[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function toPaise(row: Record<string, string>): number {
  if (row.amount_paise !== undefined && row.amount_paise !== '') {
    const p = Number(row.amount_paise);
    if (!Number.isFinite(p) || p < 0) throw new Error(`Invalid amount_paise: ${row.amount_paise}`);
    return Math.round(p);
  }
  const inrRaw = row.amount_inr ?? row.amount ?? '';
  const inr = Number(inrRaw);
  if (!Number.isFinite(inr) || inr < 0) throw new Error(`Invalid amount_inr: ${inrRaw}`);
  return Math.round(inr * 100);
}

export function parseMarketingSpendCsv(csvText: string) {
  const rows = parseCsvRows(csvText);
  return rows.map((row, idx) => {
    const dateStr = row.date;
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      throw new Error(`Row ${idx + 2}: invalid date "${dateStr}"`);
    }
    const channel = (row.channel || '').trim();
    const campaign = (row.campaign || '').trim();
    if (!channel || !campaign) {
      throw new Error(`Row ${idx + 2}: channel and campaign are required`);
    }
    return {
      date: new Date(`${dateStr.slice(0, 10)}T00:00:00+05:30`),
      channel,
      campaign,
      amountPaise: toPaise(row),
    };
  });
}

export function parseFixedCostCsv(csvText: string) {
  const rows = parseCsvRows(csvText);
  return rows.map((row, idx) => {
    const monthStr = (row.month || '').trim();
    if (!/^\d{4}-\d{2}/.test(monthStr)) {
      throw new Error(`Row ${idx + 2}: invalid month "${monthStr}" (expected YYYY-MM or YYYY-MM-DD)`);
    }
    const normalized = monthStr.length === 7 ? `${monthStr}-01` : monthStr.slice(0, 10);
    const item = (row.item || '').trim();
    if (!item) {
      throw new Error(`Row ${idx + 2}: item is required`);
    }
    return {
      month: new Date(`${normalized}T00:00:00+05:30`),
      item,
      amountPaise: toPaise(row),
    };
  });
}

function getUnsubSecret(): string {
  return process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || 'upsc-atlas-unsub-fallback';
}

export function signUnsubscribeToken(userId: string): string {
  const payload = Buffer.from(String(userId), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getUnsubSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto
    .createHmac('sha256', getUnsubSecret())
    .update(payload)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return Buffer.from(payload, 'base64url').toString('utf8');
}

export function canSendLifecycleMessage(user: {
  marketingOptOut?: boolean | null;
  email?: string | null;
}): boolean {
  if (!user) return false;
  if (user.marketingOptOut) return false;
  if (!user.email) return false;
  return true;
}

const FLAG_CACHE_TTL_MS = 30_000;

export async function isKillSwitchEnabled(db: any, key: KillSwitchKey): Promise<boolean> {
  if (!globalThis.__featureFlagCache) {
    (globalThis as any).__featureFlagCache = new Map<string, { enabled: boolean; ts: number }>();
  }
  const cache: Map<string, { enabled: boolean; ts: number }> = (globalThis as any).__featureFlagCache;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < FLAG_CACHE_TTL_MS) {
    return cached.enabled;
  }
  try {
    const flag = await db.featureFlag.findUnique({ where: { key }, select: { enabled: true } });
    const enabled = Boolean(flag?.enabled);
    cache.set(key, { enabled, ts: Date.now() });
    return enabled;
  } catch {
    return false;
  }
}

export function invalidateKillSwitchCache(key?: string) {
  const cache: Map<string, any> | undefined = (globalThis as any).__featureFlagCache;
  if (!cache) return;
  if (key) cache.delete(key);
  else cache.clear();
}
