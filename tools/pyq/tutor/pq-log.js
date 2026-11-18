/* pq-log.js — log of questions the chat or tutor could not answer well (no LLM, no third party).
   Each row: {t, q, engine, intent, reason}. reason: no-match | no-results | keyword-not-found | asked-back | flagged
   - Always kept in this browser (localStorage, last 500) — open misses.html to read or download them.
   - If window.PQ_LOG_ENDPOINT is set (e.g. "/api/pyq-log" on the Next.js site), each row is also POSTed there.
   Use the rows as the real test set: add the question to chat-tests.json / tutor-tests.json with the answer it should give. */
(function () {
  'use strict';
  const KEY = 'pq-miss-log', MAX = 500;
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(-MAX))); } catch (e) { /* private mode: keep going */ } }
  function record(e) {
    const row = {t: new Date().toISOString(), q: String(e.q || '').slice(0, 300), engine: e.engine || '', intent: e.intent || '', reason: e.reason || ''};
    const a = read(); a.push(row); write(a);
    const url = window.PQ_LOG_ENDPOINT;
    if (url) {
      try {
        const body = JSON.stringify(row);
        const sent = navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], {type: 'application/json'}));
        if (!sent) fetch(url, {method: 'POST', headers: {'content-type': 'application/json'}, body, keepalive: true}).catch(() => {});
      } catch (err) { /* logging must never break the chat */ }
    }
    return row;
  }
  function csv(rows) {
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    return ['time,question,engine,intent,reason'].concat((rows || read()).map((r) => [r.t, r.q, r.engine, r.intent, r.reason].map(esc).join(','))).join('\n');
  }
  window.PQLog = {record, read, csv, clear: () => write([])};
})();
