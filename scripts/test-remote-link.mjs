/**
 * Tests the real Link class (src/lib/remote/link.js) in two Chrome browser contexts.
 * The /api/remote endpoint is served by an in-memory mock via request interception,
 * so no dev server or database is needed.
 *
 * Checks: pairing, no "failed" status flicker, double startControl() is harmless,
 * messages both ways, reconnect after the iPad tab closes.
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ORIGIN = 'http://board.test';

const rawLink = fs.readFileSync('src/lib/remote/link.js', 'utf8');
const linkJs = `window.RL = {};\n` + rawLink.replace('export class Link', 'window.RL.Link = class Link');

// In-memory signalling store (same rules as src/app/api/remote/route.js)
const sessions = new Map();
function handleApi(method, url, body) {
  const u = new URL(url);
  if (method === 'GET') {
    const s = sessions.get(u.searchParams.get('id'));
    if (!s) return [404, { error: 'Session not found' }];
    return [200, { epoch: s.epoch, offer: s.offer, answer: s.answerEpoch === s.epoch ? s.answer : null, setId: s.setId, code: s.code }];
  }
  const b = JSON.parse(body || '{}');
  if (b.op === 'create') {
    const id = 's' + Math.random().toString(36).slice(2);
    const code = String(100000 + Math.floor(Math.random() * 900000));
    sessions.set(id, { id, code, epoch: 0, offer: null, answer: null, answerEpoch: null, setId: null });
    return [200, { id, code }];
  }
  if (b.op === 'offer') { const s = sessions.get(b.id); Object.assign(s, { epoch: b.epoch, offer: b.offer, answer: null, answerEpoch: null }); return [200, { ok: true }]; }
  if (b.op === 'join') { const s = [...sessions.values()].find((x) => x.code === b.code); if (!s) return [404, { error: 'not found' }]; s.setId = b.setId; return [200, { id: s.id, epoch: s.epoch, offer: s.offer }]; }
  if (b.op === 'answer') { const s = sessions.get(b.id); if (b.epoch !== s.epoch) return [409, { error: 'stale' }]; Object.assign(s, { answer: b.answer, answerEpoch: b.epoch }); return [200, { ok: true }]; }
  return [400, { error: 'bad op' }];
}

async function preparePage(ctx) {
  const page = await ctx.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (url.startsWith(ORIGIN + '/api/remote')) {
      const [status, data] = handleApi(req.method(), url, req.postData());
      return req.respond({ status, contentType: 'application/json', body: JSON.stringify(data) });
    }
    if (url.startsWith(ORIGIN)) {
      return req.respond({ status: 200, contentType: 'text/html', body: `<html><body><script>${linkJs}</script></body></html>` });
    }
    req.continue();
  });
  await page.goto(ORIGIN + '/');
  await page.evaluate(() => { window.statuses = []; window.msgs = []; });
  return page;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(page, fn, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await sleep(200); }
  throw new Error('Timed out waiting for: ' + fn.toString());
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
let ok = true;
try {
  const board = await preparePage(await browser.createBrowserContext());
  const code = await board.evaluate(async () => {
    window.link = new RL.Link('display');
    window.link.watch((s) => window.statuses.push(s));
    window.link.on((m) => window.msgs.push(m));
    const s = await window.link.startDisplay();
    return s.code;
  });
  console.log('Board code:', code);

  const openIpad = async () => {
    const ipad = await preparePage(await browser.createBrowserContext());
    await ipad.evaluate((c) => {
      window.link = new RL.Link('control');
      window.link.watch((s) => window.statuses.push(s));
      window.link.on((m) => window.msgs.push(m));
      // Call twice on purpose: this used to start two racing loops.
      window.link.startControl(c, 'deck1');
      window.link.startControl(c, 'deck1');
    }, code);
    return ipad;
  };

  let ipad = await openIpad();
  await waitFor(ipad, () => window.link.status === 'connected');
  await waitFor(board, () => window.link.status === 'connected');
  await sleep(4000); // stay connected a while: no flapping allowed
  const ipadStatuses = await ipad.evaluate(() => window.statuses);
  const boardStatuses = await board.evaluate(() => window.statuses);
  console.log('iPad statuses :', ipadStatuses.join(' → '));
  console.log('Board statuses:', boardStatuses.join(' → '));
  if (ipadStatuses.includes('failed') || boardStatuses.includes('failed')) { ok = false; console.log('✗ "failed" appeared during a good connection'); }
  else console.log('✓ No "failed" flicker; double startControl() harmless');
  if (await ipad.evaluate(() => window.link.status) !== 'connected') { ok = false; console.log('✗ iPad not stable'); }

  await ipad.evaluate(() => window.link.send({ t: 'state', qIndex: 4 }));
  await board.evaluate(() => window.link.send({ t: 'adds', k: 'q_x', ss: [{ id: 'a' }] }));
  await waitFor(board, () => window.msgs.some((m) => m.t === 'state' && m.qIndex === 4));
  await waitFor(ipad, () => window.msgs.some((m) => m.t === 'adds'));
  console.log('✓ Messages both ways');

  // Close the iPad tab and reopen: board must reconnect on a new epoch.
  await ipad.close();
  await waitFor(board, () => window.link.status !== 'connected', 15000);
  console.log('✓ Board noticed the iPad left (status:', await board.evaluate(() => window.link.status), ')');
  ipad = await openIpad();
  await waitFor(ipad, () => window.link.status === 'connected', 25000);
  await waitFor(board, () => window.link.status === 'connected', 25000);
  console.log('✓ Reconnected after closing the iPad tab');
} catch (e) {
  ok = false; console.error('✗', e.message);
} finally {
  await browser.close();
}
console.log(ok ? '\nALL LINK TESTS PASSED' : '\nLINK TESTS FAILED');
process.exit(ok ? 0 : 1);
