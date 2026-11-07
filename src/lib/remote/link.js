/**
 * Direct link between a smart board ("display") and an iPad ("control") over the classroom Wi-Fi.
 * Copied directly from docs/remote-presenting.md Appendix A.
 */

const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const API = '/api/remote';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(init) {
  const res =
    init.method === 'GET'
      ? await fetch(`${API}?${init.query}`, { cache: 'no-store' })
      : await fetch(API, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(init.body),
        });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error ?? `Request failed (${res.status})`), {
      status: res.status,
    });
  }
  return data;
}

/** Offer/answer with every ICE candidate already inside (no trickle), so one round trip is enough. */
async function gathered(pc, timeoutMs = 3000) {
  if (pc.iceGatheringState === 'complete') return;
  await Promise.race([
    new Promise((resolve) =>
      pc.addEventListener(
        'icegatheringstatechange',
        () => pc.iceGatheringState === 'complete' && resolve()
      )
    ),
    sleep(timeoutMs),
  ]);
}

export class Link {
  constructor(role) {
    this.role = role; // "display" | "control"
    this.status = 'waiting'; // "waiting" | "connecting" | "connected" | "lost" | "failed"
    this.sessionId = null;
    this.code = null;
    this.setId = null;
    this.pc = null;
    this.dc = null;
    this.epoch = -1;
    this.stopped = false;
    this.onMsg = new Set();
    this.onStatus = new Set();
    this.inbox = new Map(); // reassembling chunked messages
    this.lastSeen = 0;
    this.beat = null;
  }

  on(fn) {
    this.onMsg.add(fn);
    return () => {
      this.onMsg.delete(fn);
    };
  }

  watch(fn) {
    this.onStatus.add(fn);
    fn(this.status);
    return () => {
      this.onStatus.delete(fn);
    };
  }

  set(s, info) {
    this.status = s;
    this.onStatus.forEach((f) => f(s, info));
  }

  /** Send a message; large ones are split so every browser's data channel accepts them. */
  send(m) {
    if (!this.dc || this.dc.readyState !== 'open') return false;
    const text = JSON.stringify(m);
    const MAX = 15000;
    if (text.length <= MAX) {
      this.dc.send(text);
    } else {
      const id = Math.random().toString(36).slice(2);
      const n = Math.ceil(text.length / MAX);
      for (let i = 0; i < n; i++) {
        this.dc.send(
          JSON.stringify({
            t: '_part',
            id,
            i,
            n,
            d: text.slice(i * MAX, (i + 1) * MAX),
          })
        );
      }
    }
    return true;
  }

  receive(raw) {
    this.lastSeen = Date.now();
    let m;
    try {
      m = JSON.parse(raw);
    } catch {
      return;
    }
    if (m.t === '_ping') return;
    if (m.t === '_part') {
      const { id, i, n, d } = m;
      const parts = this.inbox.get(id) ?? Array(n).fill(null);
      parts[i] = d;
      this.inbox.set(id, parts);
      if (parts.every((p) => p !== null)) {
        this.inbox.delete(id);
        this.receive(parts.join(''));
      }
      return;
    }
    this.onMsg.forEach((f) => f(m));
  }

  /** Heartbeat: both sides ping every 2 s; 6 s of silence means the other device has gone. */
  heartbeat() {
    if (this.beat) clearInterval(this.beat);
    this.lastSeen = Date.now();
    this.beat = setInterval(() => {
      if (this.dc?.readyState !== 'open') return;
      try {
        this.dc.send('{"t":"_ping"}');
      } catch {
        /* channel closing */
      }
      if (Date.now() - this.lastSeen > 6000) {
        this.dc?.close();
        this.pc?.close();
        if (!this.stopped) this.set('lost');
      }
    }, 2000);
  }

  wire(dc) {
    this.dc = dc;
    // Ignore events from channels that have already been replaced by a newer epoch,
    // otherwise closing an old channel reports "lost" while the new one is opening.
    dc.onopen = () => {
      if (dc !== this.dc) return;
      this.heartbeat();
      this.set('connected');
    };
    dc.onmessage = (e) => {
      if (dc !== this.dc) return;
      this.receive(String(e.data));
    };
    dc.onclose = () => {
      if (dc !== this.dc) return;
      if (!this.stopped) this.set('lost');
    };
    // On the receiving side the channel can already be open when it is handed over.
    if (dc.readyState === 'open') {
      this.heartbeat();
      this.set('connected');
    }
  }

  watchPc(pc, onDrop) {
    pc.onconnectionstatechange = () => {
      if (this.stopped || pc !== this.pc) return;
      // 'disconnected' is often a brief Wi-Fi hiccup that recovers on its own;
      // the 6 s heartbeat catches real drops, so only react to hard failures here.
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        onDrop();
      }
    };
  }

  // ---------------- Board ----------------
  /** Board: get a code and keep offering a connection until an iPad answers; repeat after any drop. */
  async startDisplay() {
    const s = await api({ method: 'POST', body: { op: 'create' } });
    this.sessionId = s.id;
    this.code = s.code;
    if (this.stopped) return s; // stopped while code was being created
    this.set('waiting');
    void this.displayLoop();
    return s;
  }

  async displayLoop() {
    while (!this.stopped) {
      this.epoch += 1;
      const epoch = this.epoch;
      this.pc?.close();
      const pc = new RTCPeerConnection(ICE);
      this.pc = pc;
      this.wire(pc.createDataChannel('lecture', { ordered: true }));
      await pc.setLocalDescription(await pc.createOffer());
      await gathered(pc);
      await api({
        method: 'POST',
        body: {
          op: 'offer',
          id: this.sessionId,
          epoch,
          offer: JSON.stringify(pc.localDescription),
        },
      });

      // Wait for iPad's answer to this offer
      let answered = false;
      while (!this.stopped && !answered && this.epoch === epoch) {
        await sleep(900);
        const st = await api({
          method: 'GET',
          query: `op=poll&id=${this.sessionId}`,
        }).catch(() => null);

        if (st?.setId) this.setId = st.setId;
        if (st?.answer) {
          this.set('connecting');
          await pc.setRemoteDescription(JSON.parse(st.answer));
          answered = true;
        }
      }

      if (this.stopped) return;

      // Connected (or trying): wait until this connection ends, then offer again
      const ok = await this.until(pc, 15000);
      if (!ok) {
        this.set(
          'failed',
          'The iPad answered but the two devices could not reach each other. The Wi-Fi may block devices from talking to each other (client isolation).'
        );
        pc.close();
        await sleep(1500);
        continue;
      }

      while (
        !this.stopped &&
        this.dc?.readyState === 'open' &&
        !['failed', 'closed'].includes(pc.connectionState)
      ) {
        await sleep(500);
      }

      if (!this.stopped) this.set('lost');
      await sleep(500);
    }
  }

  /** True once the data channel opens within the time limit. */
  async until(pc, ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (this.dc?.readyState === 'open' && pc === this.pc) return true;
      if (pc.connectionState === 'failed') return false;
      await sleep(200);
    }
    return false;
  }

  // ---------------- iPad ----------------
  /** iPad: pair with board showing `code`, then answer each offer it makes (first one and reconnects). */
  async startControl(code, setId) {
    // Guard: only one control loop per Link. Calling this twice used to start two
    // loops that closed each other's peer connections ("could not reach the board").
    if (this.controlStarted) return { id: this.sessionId };
    this.controlStarted = true;
    let j;
    try {
      j = await api({
        method: 'POST',
        body: { op: 'join', code, setId: setId != null ? String(setId) : '' },
      });
    } catch (e) {
      this.controlStarted = false;
      this.set('failed', e.message || 'Could not join the board');
      throw e;
    }
    this.sessionId = j.id;
    this.code = code;
    this.setId = setId != null ? String(setId) : '';
    this.set('connecting');
    void this.controlLoop();
    return j;
  }

  async controlLoop() {
    let answered = -1;
    while (!this.stopped) {
      const st = await api({
        method: 'GET',
        query: `op=poll&id=${this.sessionId}`,
      }).catch((e) => {
        if (e.status === 404) {
          this.set('failed', e.message);
          this.stopped = true;
        }
        return null;
      });

      const open = this.dc?.readyState === 'open';
      if (st?.offer && st.epoch > answered && !open) {
        answered = st.epoch;
        this.set('connecting');
        this.pc?.close();
        const pc = new RTCPeerConnection(ICE);
        this.pc = pc;
        pc.ondatachannel = (e) => this.wire(e.channel);
        await pc.setRemoteDescription(JSON.parse(st.offer));
        await pc.setLocalDescription(await pc.createAnswer());
        await gathered(pc);
        await api({
          method: 'POST',
          body: {
            op: 'answer',
            id: this.sessionId,
            epoch: st.epoch,
            answer: JSON.stringify(pc.localDescription),
          },
        }).catch(() => {
          answered = -1;
        });

        this.watchPc(pc, () => this.set('lost'));
        const ok = await this.until(pc, 15000);
        // Only report failure if this attempt is still the current one and nothing opened.
        if (!ok && !this.stopped && pc === this.pc && this.dc?.readyState !== 'open') {
          this.set(
            'failed',
            'Could not reach the board directly. The Wi-Fi may block devices from talking to each other (client isolation). Ask for it to be switched off for this network, or use a phone hotspot to test.'
          );
        }
      }
      await sleep(open ? 2500 : 900);
    }
  }

  stop() {
    this.stopped = true;
    if (this.beat) clearInterval(this.beat);
    this.dc?.close();
    this.pc?.close();
    this.set('waiting');
  }
}
