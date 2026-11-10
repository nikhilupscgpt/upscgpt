// Server-only SSRF-hardened fetch.
// - Only http/https
// - Resolves the hostname and rejects private/loopback/link-local/CGNAT/
//   multicast/reserved IPv4 + IPv6 targets (incl. IPv4-mapped IPv6)
// - Follows redirects manually (max 5), re-validating each hop
// - Enforces a timeout and a maximum response size
//
// Note: there is a small TOCTOU window between our DNS lookup and the one
// performed by fetch (DNS rebinding). Combined with the checks above this
// still blocks the common SSRF vectors; for stronger guarantees route
// outbound requests through an egress proxy.
import dns from 'dns';
import net from 'net';

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_REDIRECTS = 5;

export class SafeFetchError extends Error {
  constructor(message, code = 'SAFE_FETCH_BLOCKED') {
    super(message);
    this.name = 'SafeFetchError';
    this.code = code;
  }
}

function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

const BLOCKED_V4 = [
  ['0.0.0.0', 8],        // "this" network / unspecified
  ['10.0.0.0', 8],       // private
  ['100.64.0.0', 10],    // CGNAT
  ['127.0.0.0', 8],      // loopback
  ['169.254.0.0', 16],   // link-local (cloud metadata)
  ['172.16.0.0', 12],    // private
  ['192.0.0.0', 24],     // IETF protocol assignments
  ['192.0.2.0', 24],     // TEST-NET-1
  ['192.88.99.0', 24],   // 6to4 relay anycast
  ['192.168.0.0', 16],   // private
  ['198.18.0.0', 15],    // benchmarking
  ['198.51.100.0', 24],  // TEST-NET-2
  ['203.0.113.0', 24],   // TEST-NET-3
  ['224.0.0.0', 4],      // multicast
  ['240.0.0.0', 4],      // reserved + broadcast
].map(([base, bits]) => ({
  base: ipv4ToInt(base),
  mask: bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0,
}));

function isBlockedIPv4(ip) {
  const n = ipv4ToInt(ip);
  return BLOCKED_V4.some(({ base, mask }) => ((n & mask) >>> 0) === ((base & mask) >>> 0));
}

// Expand an IPv6 address into 8 16-bit groups (handles "::" and embedded IPv4).
function expandIPv6(ip) {
  let addr = ip.toLowerCase();
  const zone = addr.indexOf('%');
  if (zone !== -1) addr = addr.slice(0, zone);

  // Embedded dotted IPv4 tail (e.g. ::ffff:127.0.0.1)
  const lastColon = addr.lastIndexOf(':');
  const tail = addr.slice(lastColon + 1);
  if (tail.includes('.')) {
    if (!net.isIPv4(tail)) return null;
    const n = ipv4ToInt(tail);
    addr = `${addr.slice(0, lastColon + 1)}${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }

  const parts = addr.split('::');
  if (parts.length > 2) return null;
  const head = parts[0] ? parts[0].split(':') : [];
  const rest = parts.length === 2 && parts[1] ? parts[1].split(':') : [];
  const missing = 8 - head.length - rest.length;
  if (parts.length === 1 && head.length !== 8) return null;
  if (missing < 0) return null;
  const groups = [...head, ...Array(parts.length === 2 ? missing : 0).fill('0'), ...rest];
  return groups.map((g) => parseInt(g || '0', 16));
}

function isBlockedIPv6(ip) {
  const g = expandIPv6(ip);
  if (!g || g.length !== 8 || g.some((x) => Number.isNaN(x))) return true; // unparseable → block

  const allZeroPrefix = (count) => g.slice(0, count).every((x) => x === 0);

  // :: (unspecified) and ::1 (loopback)
  if (allZeroPrefix(7) && (g[7] === 0 || g[7] === 1)) return true;

  // IPv4-mapped ::ffff:a.b.c.d  and IPv4-compatible ::a.b.c.d (deprecated)
  if (allZeroPrefix(5) && (g[5] === 0xffff || g[5] === 0)) {
    const v4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
    return isBlockedIPv4(v4);
  }
  // IPv4-translated ::ffff:0:a.b.c.d
  if (allZeroPrefix(4) && g[4] === 0xffff && g[5] === 0) {
    const v4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
    return isBlockedIPv4(v4);
  }
  // NAT64 64:ff9b::/96 → check embedded IPv4
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) {
    const v4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
    return isBlockedIPv4(v4);
  }
  // 6to4 2002::/16 → embedded IPv4 in groups 1-2
  if (g[0] === 0x2002) {
    const v4 = `${g[1] >> 8}.${g[1] & 0xff}.${g[2] >> 8}.${g[2] & 0xff}`;
    if (isBlockedIPv4(v4)) return true;
  }

  if ((g[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((g[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((g[0] & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local (deprecated)
  if ((g[0] & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // 2001:db8::/32 documentation
  if (g[0] === 0x0100 && g.slice(1, 4).every((x) => x === 0)) return true; // 100::/64 discard
  return false;
}

export function isBlockedIp(ip) {
  if (net.isIPv4(ip)) return isBlockedIPv4(ip);
  if (net.isIPv6(ip)) return isBlockedIPv6(ip);
  return true;
}

async function assertSafeUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SafeFetchError('Invalid URL', 'INVALID_URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SafeFetchError('Only http and https URLs are allowed', 'BAD_PROTOCOL');
  }
  if (url.username || url.password) {
    throw new SafeFetchError('Credentials in URL are not allowed', 'BAD_URL');
  }

  let host = url.hostname.toLowerCase();
  if (host.startsWith('[') && host.endsWith(']')) host = host.slice(1, -1);
  if (!host) throw new SafeFetchError('Missing hostname', 'BAD_URL');

  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw new SafeFetchError('Destination host is not allowed', 'BLOCKED_HOST');
  }

  let addresses;
  if (net.isIP(host)) {
    addresses = [{ address: host }];
  } else {
    try {
      addresses = await dns.promises.lookup(host, { all: true, verbatim: true });
    } catch {
      throw new SafeFetchError('Could not resolve hostname', 'DNS_FAILED');
    }
  }
  if (!addresses || addresses.length === 0) {
    throw new SafeFetchError('Could not resolve hostname', 'DNS_FAILED');
  }
  for (const { address } of addresses) {
    if (isBlockedIp(address)) {
      throw new SafeFetchError('Destination address is not allowed', 'BLOCKED_IP');
    }
  }
  return url;
}

async function readLimited(res, maxBytes, controller) {
  const declared = Number(res.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) {
    controller.abort();
    throw new SafeFetchError('Response too large', 'TOO_LARGE');
  }
  if (!res.body) return Buffer.alloc(0);

  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      try { await reader.cancel(); } catch {}
      controller.abort();
      throw new SafeFetchError('Response too large', 'TOO_LARGE');
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks, total);
}

/**
 * SSRF-safe fetch. Resolves with a fully buffered response-like object:
 *   { ok, status, statusText, url, headers, buffer, text(), arrayBuffer(), json() }
 *
 * opts: standard fetch options plus
 *   - timeoutMs (default 15000)
 *   - maxBytes  (default 10 MB)
 *   - maxRedirects (default 5)
 * Throws SafeFetchError for blocked destinations / limits.
 */
export async function safeFetch(rawUrl, opts = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxBytes = DEFAULT_MAX_BYTES,
    maxRedirects = MAX_REDIRECTS,
    ...fetchOpts
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let current = String(rawUrl);
    let method = (fetchOpts.method || 'GET').toUpperCase();
    let body = fetchOpts.body;

    for (let hop = 0; hop <= maxRedirects; hop++) {
      const url = await assertSafeUrl(current);

      let res;
      try {
        res = await fetch(url.toString(), {
          ...fetchOpts,
          method,
          body,
          redirect: 'manual',
          signal: controller.signal,
        });
      } catch (err) {
        if (controller.signal.aborted) throw new SafeFetchError('Request timed out', 'TIMEOUT');
        throw err;
      }

      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        try { await res.body?.cancel(); } catch {}
        if (hop === maxRedirects) throw new SafeFetchError('Too many redirects', 'TOO_MANY_REDIRECTS');
        current = new URL(res.headers.get('location'), url).toString();
        if (res.status === 303 || ((res.status === 301 || res.status === 302) && method === 'POST')) {
          method = 'GET';
          body = undefined;
        }
        continue;
      }

      let buffer;
      try {
        buffer = await readLimited(res, maxBytes, controller);
      } catch (err) {
        if (err instanceof SafeFetchError) throw err;
        if (controller.signal.aborted) throw new SafeFetchError('Request timed out', 'TIMEOUT');
        throw err;
      }

      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        url: url.toString(),
        headers: res.headers,
        buffer,
        text: async () => buffer.toString('utf-8'),
        arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        json: async () => JSON.parse(buffer.toString('utf-8')),
      };
    }
    throw new SafeFetchError('Too many redirects', 'TOO_MANY_REDIRECTS');
  } finally {
    clearTimeout(timer);
  }
}

export default safeFetch;
