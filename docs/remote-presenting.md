# Remote presenting — iPad controls a smart board

How DNY CMS lets a teacher present from an iPad while a classroom smart board shows the same slides, live and in both directions. This document covers what was built, how it works, the tech stack, and a step-by-step guide for adding the same feature to another project.

---

## 1. What it does (user view)

| | |
|---|---|
| **Board** (Senses / Maxhub PC with Chrome or Edge) | Opens `/remote/display`. Shows the academy logo, a large **6-digit code** and a **QR code**. Signs in once with a **Classroom display** account. |
| **iPad** (Safari) | Opens a lecture → **▶ Present with iPad + smart board**, or scans the QR, or taps the board button in the presenter toolbar → types the code. Connects on the 6th digit, in about 2 seconds. |
| **Kept in sync, both ways** | Slide and step (question → answer → explanation points), language (मराठी / English / both), presenter space (left / right / off), light/dark, blank board, 60-second timer, **pen and highlighter strokes as they are drawn**, eraser, undo/redo, clear page, laser pointer, **zoom and pan** (pinch). |
| **iPad only** | A private panel under the slide: what comes next, the answer, the teaching note, connection status. The board never shows it. |
| **Board only** | The clean slide, branding, and the toolbar, so the teacher can also draw on the board itself. |
| **When Wi-Fi drops** | Each side notices within about 6 seconds and reconnects by itself. The board then catches up to the iPad, and drawings from both sides are merged. |
| **Cost** | Nothing. The devices talk **directly** over the classroom Wi-Fi. The server only introduces them once. |

---

## 2. How it works (one picture)

```
           ① create code              ③ join with code (+ lecture id)
  BOARD  ───────────────►  SERVER  ◄───────────────  iPad
 (display)  ② post OFFER    (Vercel +    ④ read OFFER, post ANSWER
           ◄─ poll ANSWER   Neon table)
     │                                                   │
     └────────────── ⑤ WebRTC data channel ──────────────┘
          direct, over the classroom Wi-Fi: every slide change,
          stroke, zoom … as small JSON messages (no video)
```

- **Signalling** happens only at connect and reconnect. It's a few HTTP calls to our own API, stored in one database table. No WebSocket server, no extra paid service.
- **Transport** is a WebRTC `RTCDataChannel` (ordered, reliable). On the same Wi-Fi the browsers use their local addresses, so traffic stays inside the room. Latency is a few milliseconds.
- **Not a screen mirror.** Both devices run the same slide engine on the same 1600×900 coordinate stage and exchange *what happened* ("go to step 3", "add stroke …"). That's why ink stays sharp on the board and the iPad can show private notes.

---

## 3. Tech stack

### Used in DNY CMS

| Layer | Technology | Role in remote presenting |
|---|---|---|
| Framework | **Next.js 16** (App Router, React 19, TypeScript) | Pages (`/remote/display`, `/remote/join`, presenter), route handler `/remote/api` |
| Hosting | **Vercel** (Node.js functions, region `sin1`) | Runs the signalling API. It can't hold WebSockets, which is why signalling is plain HTTP polling. |
| Database | **Neon Postgres** + **Drizzle ORM** (`pg` driver) | Table `remote_sessions` stores code, offer, answer and epoch |
| Validation | **zod** | Checks API request bodies |
| Auth | Own session cookies (`dny_session`), roles incl. **display** | Only signed-in staff can pair; the board account is limited to board pages |
| Peer link | **Browser WebRTC** (`RTCPeerConnection`, `RTCDataChannel`) | Direct device-to-device link; no library needed |
| NAT helper | Google public **STUN** `stun:stun.l.google.com:19302` | Only needed if local addresses fail; free |
| QR code | **`qrcode`** (npm) | QR on the board that opens `/remote/join?code=…` on the iPad |
| Testing | **Puppeteer-core** with system Chrome, two browser contexts | Simulates board + iPad; CDP touch events for pinch |

**Extra cost for this feature: ₹0.** No new accounts.

### Minimum stack for another project

The design is **framework-agnostic**. You need:

1. **Any web app with HTTP endpoints** (Next.js, Remix, Express, FastAPI, Firebase Functions, Supabase Edge Functions…) to serve 6 small signalling calls.
2. **Any storage for one small record per pairing**: a Postgres/MySQL/SQLite table, Firestore document, Redis key or Supabase row. It holds about 2 KB of text per pairing.
3. **Browser WebRTC**: built into Chrome, Edge, Safari (iPad) and Firefox. No package.
4. **A slide or canvas view whose state can be described as data**: current page, zoom, list of strokes. See section 6.
5. *(Optional)* `qrcode` for the QR, and a **fallback relay** (Ably free plan, Pusher, Firebase Realtime DB / Firestore listeners, or Supabase Realtime) for networks that block device-to-device traffic.

> If the other project already uses **Firebase/Supabase realtime**, you could use it *instead of* polling for signalling, or even instead of WebRTC. But WebRTC on the local Wi-Fi is still the fastest and cheapest path for pen strokes.

---

## 4. Pairing (signalling) protocol

### Data (one row per board session)

```sql
create table remote_sessions (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null,           -- 6 digits shown on the board
  display_user_id    uuid not null,           -- the board's account
  controller_user_id uuid,                    -- the iPad's account (after join)
  set_id             integer,                 -- which lecture the iPad chose
  epoch              integer not null default 0,  -- +1 on every (re)connect attempt
  offer              text,                    -- board's WebRTC offer (JSON SDP) for this epoch
  answer             text,                    -- iPad's WebRTC answer
  answer_epoch       integer,                 -- the epoch the answer belongs to
  created_at         timestamptz not null default now(),
  expires_at         timestamptz not null     -- now() + 12 hours
);
create index on remote_sessions (code);
```

### API (single endpoint `/remote/api`, signed-in users only)

| Call | Who | Does |
|---|---|---|
| `POST {op:"create"}` | board | New random 6-digit code, unique among unexpired rows → `{id, code}` |
| `POST {op:"offer", id, epoch, offer}` | board (owner only) | Stores the offer for this epoch and clears any old answer |
| `GET ?op=poll&id=…` | board or iPad of this pairing | `{epoch, offer, answer (only if answer_epoch = epoch), setId}` |
| `POST {op:"join", code, setId}` | iPad (needs "present" permission and access to the lecture) | Attaches the iPad and lecture to the pairing → `{id, epoch, offer}` |
| `POST {op:"answer", id, epoch, answer}` | iPad (the joined one) | Stores the answer; rejects a stale epoch (409) |
| `GET ?op=deck&id=…` | board (owner only) | Returns the lecture content the iPad chose |

### Sequence

```
BOARD                                   SERVER                         iPad
create ─────────────────────────────►   row(code, epoch 0)
show code + QR
loop (epoch e):
  new RTCPeerConnection + data channel "lecture"
  createOffer → wait for ICE gathering (≤3 s, no trickle)
  offer(e) ─────────────────────────►   row.offer = …, answer = null
  poll every 0.9 s ──────────────────►                                ◄── join(code, setId)
                                                                       ◄── poll: offer for epoch e
                                                                           setRemote(offer) → createAnswer
                                                                           wait ICE (≤3 s)
                                        row.answer = …, answer_epoch=e ◄── answer(e)
  poll sees answer → setRemote(answer)
  ─────────── data channel opens (both sides "connected") ───────────
  while open: heartbeat; if it drops → epoch e+1, new offer   iPad keeps polling every 2.5 s
                                                              (0.9 s when not connected) and
                                                              answers any newer epoch
```

**Design choices worth keeping:**
- **Non-trickle ICE.** Wait until ICE gathering completes (or 3 s), then send one offer and one answer that already contain all candidates. One round trip; no candidate table.
- **Epochs.** Every reconnect is a fresh offer with `epoch+1`. The iPad answers only newer epochs, and the server rejects answers for old ones. This makes reconnect automatic and race-free.
- **The board always offers; the iPad always answers.** There's no negotiation over who starts.
- **Polling** is fine here: it runs only while connecting, every 0.9 s (2.5 s once connected).

---

## 5. The link (client)

The `Link` class (full source in Appendix A) wraps everything above:

```ts
const link = new Link("display");       // on the board
await link.startDisplay();              // → { id, code }; then offers and reconnects forever
// or
const link = new Link("control");       // on the iPad
await link.startControl(code, lectureId);

link.watch((status, info) => …)         // "waiting" | "connecting" | "connected" | "lost" | "failed"
link.on((msg) => …)                     // every message from the other device
link.send({ t: "state", … })            // returns false if not connected
link.stop()
```

What it handles for you:
- **Chunking.** Messages over 15 000 characters are split (`_part`) and reassembled. Safari's data channel has smaller message limits.
- **Heartbeat.** `_ping` every 2 s; 6 s of silence → closes and reports `lost` → reconnect.
- **Channel already open.** On the answering side the data channel can be open before handlers are attached. `wire()` checks `readyState` immediately. *(This was a real bug: the iPad never said "connected".)*
- **Failure message.** If the answer is exchanged but the channel doesn't open within 15 s, it reports `failed` with the "Wi-Fi client isolation" explanation and retries.

---

## 6. Sync protocol (what travels on the data channel)

All messages are JSON objects with a `t` (type) field.

| `t` | Payload | Sent when | Receiver does |
|---|---|---|---|
| `hello` | `{setId, presenter}` | iPad, right after connecting | Board loads that lecture (if it isn't already showing it), then replies `ready` |
| `ready` | – | Board, once its slides are mounted and attached | iPad runs **sync**: sends `state` + `pages` |
| `state` | `{slide, step, lang, side, board, theme, timerLeft, zoom:{z,x,y}}` | Any device, after any change (deduplicated) | Apply all fields, re-render; timer uses *time left*, not the clock |
| `adds` | `{k, ss:[stroke…]}` | Stroke finished, undo of erase/clear, redo of add | Add strokes whose `id` it doesn't have yet |
| `del` | `{k, ids:[…]}` | Eraser, undo of add, redo of erase | Remove those stroke ids |
| `clear` | `{k}` | Clear page, redo of clear | Empty that page |
| `live` | `{k, s:stroke}` | Every 40 ms while drawing | Draw the in-progress stroke on a separate "remote live" canvas |
| `laser` | `{p:[x,y]}` | Every 30 ms while the laser moves | Add the point to the fading laser trail |
| `pages` | `{pages:{k: strokes[]}}` | During sync (both sides) | Merge by stroke `id` (union) |
| `_ping`, `_part` | – | Link internals | Handled inside `Link` |

**Rules that make it work:**
1. **Same coordinate space on both screens.** The slide is a fixed **1600×900 stage**, scaled to fit any screen. Strokes, laser and zoom are stored in stage coordinates, so they line up on a 4:3 iPad and a 16:9 board.
2. **Every stroke has a random `id`.** That makes add, delete and merge idempotent, with no duplicates after reconnects.
3. **Ink is stored per page key** `"<questionId>:<scene>"` (question, explanation page 1, page 2, or blank board), not per screen. It's also saved in `localStorage`, so a refresh keeps it.
4. **No echo loops.** While applying a received message the engine sets `applying = true`, and `emit()` sends nothing during that time.
5. **The iPad's position wins on (re)connect; drawings are merged.** It's simple and predictable for teaching.
6. **Undo is local.** Each device keeps its own undo stack but sends the *result* (`adds` / `del` / `clear`).
7. **Zoom** is part of `state`. The slide content sits in a `#view` layer with `transform: scale(z) translate(-x,-y)`. Ink canvases stay outside it and get the same transform in `setTransform`, so lines stay crisp. Pointer positions are mapped back with `slide = screen/scale/z + pan`. Strokes drawn while zoomed store `zs` (the zoom at the time) and divide their width by it, so they keep a normal on-screen thickness. Zoom resets when moving to another question.
8. **Two-finger gestures** are caught in the capture phase on the stage. With two touches present, any finger stroke is cancelled and the gesture zooms or pans. The Apple Pencil keeps drawing. `touch-action: none` and `preventDefault` on Safari's `gesturestart` / `gesturechange` stop the *browser's* page zoom (the original bug: the browser zoom wasn't shared).

---

## 7. Screens and flows

| Route | Who | Content |
|---|---|---|
| `/remote/display` | board | Waiting screen (logo, code, QR, status, **Full screen** button) → becomes the lecture once an iPad says `hello` |
| `/remote/join?code=123456` | iPad (from QR) | List of lectures → opens `…/present?board=123456` |
| `/lectures/[id]/present?board=123456` | iPad | "Presented by" start screen → slides; connects automatically |
| `/lectures/[id]/present?connect=1` | iPad | Same, opens the **Connect to the board** dialog |
| Presenter toolbar → board button | any | Opens the dialog; a dot shows status (green / amber / red) |

**Connect dialog details:** it sits near the top of the screen so the iPad keyboard can't cover it. It uses a numeric keypad, connects automatically on the 6th digit, shows "N more digits", and has Disconnect and Close.

---

## 8. Security

- **Every API call needs a signed-in session.** The iPad needs "present" permission and access to the chosen lecture. Only the board that created a pairing can post offers or read the lecture; only the joined iPad can post answers.
- **Codes:** 6 digits, random, unique among live pairings, **expire after 12 hours**.
- **"Classroom display" role:** the proxy redirects that account to `/remote/display` for any other page and blocks non-GET requests elsewhere. A board left signed in can't browse or edit the question bank.
- **Slide traffic never touches the server.** WebRTC data channels are encrypted (DTLS) end to end.

---

## 9. Pitfalls we hit (and the fixes)

| Symptom | Cause | Fix |
|---|---|---|
| iPad stuck on "Connecting…" though the answer was saved | Receiving side's data channel was already `open` when handed over, so `onopen` never fired | Check `readyState === "open"` inside `wire()` |
| Board kept saying "connected" after the iPad left | Closing a tab doesn't always close the channel promptly | 2 s heartbeat, 6 s timeout |
| Sometimes the board showed a code nobody was listening on | React StrictMode / double mount started two pairings, and the old one's code arrived last | Ignore results from a stopped `Link`; show a code only from the current one |
| Typing the code did nothing: Enter and Backspace ignored | Presenter keyboard shortcuts (Enter = next, Backspace = previous) swallowed keys typed in the box | Shortcuts ignore events from `input`, `textarea`, `select` and dialogs |
| Connect button hidden | Dialog centred under the iPad keyboard | Dialog anchored near the top, plus auto-connect on the 6th digit |
| Pinch zoomed only the iPad | That was Safari's page zoom | Zoom built into the slide engine and synced (rule 7 above) |
| Lines drawn while zoomed were 3.5× thick | Width stored in slide units | Store `zs` and divide the width by it |
| In automated tests, devices with touch emulation never connected | Puppeteer `hasTouch` viewport emulation interfered with WebRTC in headless Chrome | Test without `hasTouch`; send touches through CDP `Input.dispatchTouchEvent` |

---

## 10. Limits and next steps

- **Wi-Fi that blocks device-to-device traffic** ("client isolation", "AP isolation", common on guest networks) stops the direct link. The UI says so. Options:
  1. Switch isolation off for the classroom network (best).
  2. Add a relay fallback: Ably free plan, about 100–200 lecture-hours a month free; or a TURN server; or the project's existing realtime service.
- **One iPad per board at a time.** A second iPad that joins takes over (the board reconnects to it).
- **Strokes deleted while the devices were disconnected** can reappear after reconnect, because sync merges as a union. That's rare in practice.
- **Possible additions:** recording the board output, a "follow me / free" toggle, more than one board per iPad (one data channel per board).

---

## 11. Porting checklist for another project

1. **Add storage**: the `remote_sessions` table, or an equivalent document/key with the same fields.
2. **Add the signalling endpoint** with the six operations in section 4. Enforce sign-in and ownership, use 6-digit codes, expire after 12 h, reject stale epochs.
3. **Copy `Link`** (Appendix A). Change the `API` constant to your endpoint and the `startControl` arguments to your content id.
4. **Make your view state serialisable**: one `snapshot()` object for position, mode, zoom and so on, plus strokes with ids per page key. Use one fixed logical stage size scaled to the screen.
5. **Wire the engine**:
   - `emit()` after every local change; `apply()` for incoming messages, guarded by an `applying` flag.
   - The `hello` → `ready` → `sync` handshake.
   - Live strokes on a separate canvas.
6. **Board page**: create a `Link("display")`; show the code and QR; on `hello` load the content and mount the view in display mode; attach the link.
7. **Controller UI**: a connect dialog (6 digits, auto-submit, near the top); `?board=` auto-connect; status dot; optional private presenter panel.
8. **Input hygiene**: keyboard shortcuts skip form fields; `touch-action: none` on the stage; block Safari page zoom on that page.
9. **Optional "display" role** that can only reach the board page.
10. **Test with two browser contexts** (section 9) and then on the real devices on the real Wi-Fi.

### Prompt you can give the Antigravity agent

> Implement "remote presenting" in this project, following `docs/remote-presenting.md` (copied from DNY CMS):
>
> - **Roles:** a large screen ("display") shows a 6-digit pairing code and a QR; an iPad ("control") enters the code and then controls the screen.
> - **Transport:** a direct WebRTC data channel. Signalling goes through our own HTTP endpoint and one database table (`remote_sessions`: code, offer, answer, epoch, expires_at), using non-trickle ICE, epoch-based reconnects, and polling every 0.9 s while connecting.
> - **Client:** use the `Link` class from Appendix A as-is, adapting only the API path and content id.
> - **Sync messages:** `hello`, `ready`, `state`, `adds`, `del`, `clear`, `live`, `laser`, `pages`, exactly as in section 6. Use a fixed logical stage size, stroke ids, per-page ink keys, an `applying` flag to avoid echo, and controller-wins on connect with merged drawings.
> - **Zoom:** include zoom in `state` (two-finger pinch on the stage, page zoom disabled).
> - **UX:** add a connect dialog with auto-connect on the 6th digit, positioned so the on-screen keyboard can't cover it, and make keyboard shortcuts ignore form fields.
> - **Security:** enforce sign-in, ownership checks, a 12-hour code expiry, and an optional display-only role.
> - **Tests:** write a two-browser-context test before trying the real devices.

---

## 12. Where the code lives in DNY CMS

| File | What |
|---|---|
| `src/lib/lecture/link.ts` | `Link` class: signalling, WebRTC, chunking, heartbeat, reconnect |
| `src/app/remote/api/route.ts` | Signalling endpoint (create / offer / poll / join / answer / deck) |
| `src/lib/remote.ts` | Code generation, session lookup, expiry |
| `src/db/schema.ts` (`remoteSessions`, role `display`) | Table and role |
| `drizzle/0011_remote.sql` | Migration |
| `src/proxy.ts` | Keeps "Classroom display" accounts on the board pages |
| `src/app/lectures/[id]/present/engine.ts` | Slide engine: `emit`, `apply`, `sync`, `attach`, zoom, presenter panel |
| `src/app/lectures/[id]/present/Presenter.tsx` | iPad side: start screen, connect dialog, `?board=` / `?connect=1` |
| `src/app/remote/display/BoardDisplay.tsx` | Board side: code, QR, waits for `hello`, mounts slides in display mode |
| `src/app/remote/join/page.tsx` | QR landing page on the iPad |
| `src/app/lectures/[id]/present/present.css` | Styles (board waiting screen, dialog, panel, status dot, zoom) |

---

## Appendix A — `Link` (copy as-is)

```ts
/**
 * Direct link between a smart board ("display") and an iPad ("control") over the classroom Wi-Fi.
 *
 * The two devices are introduced through /remote/api (the board posts a WebRTC offer, the iPad posts
 * an answer); after that every message goes straight between them on a data channel. If the link
 * drops, the board posts a fresh offer (a new "epoch") and the iPad answers it again, automatically.
 */
export type LinkStatus = "waiting" | "connecting" | "connected" | "lost" | "failed";
export type Msg = Record<string, unknown> & { t: string };

const ICE: RTCConfiguration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const API = "/remote/api";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function api<T>(init: { method: "GET"; query: string } | { method: "POST"; body: unknown }): Promise<T> {
  const res =
    init.method === "GET"
      ? await fetch(`${API}?${init.query}`, { cache: "no-store" })
      : await fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(init.body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? `Request failed (${res.status})`), { status: res.status });
  return data as T;
}

/** Offer/answer with every ICE candidate already inside (no trickle), so one round trip is enough. */
async function gathered(pc: RTCPeerConnection, timeoutMs = 3000) {
  if (pc.iceGatheringState === "complete") return;
  await Promise.race([
    new Promise<void>((resolve) => pc.addEventListener("icegatheringstatechange", () => pc.iceGatheringState === "complete" && resolve())),
    sleep(timeoutMs),
  ]);
}

export class Link {
  status: LinkStatus = "waiting";
  sessionId: string | null = null;
  code: string | null = null;
  setId: number | null = null;
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private epoch = -1;
  private stopped = false;
  private onMsg = new Set<(m: Msg) => void>();
  private onStatus = new Set<(s: LinkStatus, info?: string) => void>();
  private inbox = new Map<string, string[]>(); // reassembling chunked messages
  private lastSeen = 0;
  private beat: ReturnType<typeof setInterval> | null = null;

  constructor(readonly role: "display" | "control") {}

  on(fn: (m: Msg) => void) { this.onMsg.add(fn); return () => { this.onMsg.delete(fn); }; }
  watch(fn: (s: LinkStatus, info?: string) => void) { this.onStatus.add(fn); fn(this.status); return () => { this.onStatus.delete(fn); }; }
  private set(s: LinkStatus, info?: string) { this.status = s; this.onStatus.forEach((f) => f(s, info)); }

  /** Send a message; large ones are split so every browser's data channel accepts them. */
  send(m: Msg) {
    if (!this.dc || this.dc.readyState !== "open") return false;
    const text = JSON.stringify(m);
    const MAX = 15000;
    if (text.length <= MAX) this.dc.send(text);
    else {
      const id = Math.random().toString(36).slice(2);
      const n = Math.ceil(text.length / MAX);
      for (let i = 0; i < n; i++) this.dc.send(JSON.stringify({ t: "_part", id, i, n, d: text.slice(i * MAX, (i + 1) * MAX) }));
    }
    return true;
  }

  private receive(raw: string) {
    this.lastSeen = Date.now();
    let m: Msg;
    try { m = JSON.parse(raw); } catch { return; }
    if (m.t === "_ping") return;
    if (m.t === "_part") {
      const { id, i, n, d } = m as unknown as { id: string; i: number; n: number; d: string };
      const parts = this.inbox.get(id) ?? Array(n).fill(null);
      parts[i] = d;
      this.inbox.set(id, parts);
      if (parts.every((p) => p !== null)) { this.inbox.delete(id); this.receive(parts.join("")); }
      return;
    }
    this.onMsg.forEach((f) => f(m));
  }

  /** Heartbeat: both sides ping every 2 s; 6 s of silence means the other device has gone. */
  private heartbeat() {
    if (this.beat) clearInterval(this.beat);
    this.lastSeen = Date.now();
    this.beat = setInterval(() => {
      if (this.dc?.readyState !== "open") return;
      try { this.dc.send('{"t":"_ping"}'); } catch { /* channel closing */ }
      if (Date.now() - this.lastSeen > 6000) {
        this.dc.close();
        this.pc?.close();
        if (!this.stopped) this.set("lost");
      }
    }, 2000);
  }

  private wire(dc: RTCDataChannel) {
    this.dc = dc;
    dc.onopen = () => { this.heartbeat(); this.set("connected"); };
    dc.onmessage = (e) => this.receive(String(e.data));
    dc.onclose = () => { if (!this.stopped) this.set("lost"); };
    // On the receiving side the channel can already be open when it is handed over.
    if (dc.readyState === "open") { this.heartbeat(); this.set("connected"); }
  }

  private watchPc(pc: RTCPeerConnection, onDrop: () => void) {
    pc.onconnectionstatechange = () => {
      if (this.stopped || pc !== this.pc) return;
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected" || pc.connectionState === "closed") onDrop();
    };
  }

  // ---------------- Board ----------------
  /** Board: get a code and keep offering a connection until an iPad answers; repeat after any drop. */
  async startDisplay() {
    const s = await api<{ id: string; code: string }>({ method: "POST", body: { op: "create" } });
    this.sessionId = s.id; this.code = s.code;
    if (this.stopped) return s; // stopped while the code was being created
    this.set("waiting");
    void this.displayLoop();
    return s;
  }

  private async displayLoop() {
    while (!this.stopped) {
      this.epoch += 1;
      const epoch = this.epoch;
      this.pc?.close();
      const pc = new RTCPeerConnection(ICE);
      this.pc = pc;
      this.wire(pc.createDataChannel("lecture", { ordered: true }));
      await pc.setLocalDescription(await pc.createOffer());
      await gathered(pc);
      await api({ method: "POST", body: { op: "offer", id: this.sessionId, epoch, offer: JSON.stringify(pc.localDescription) } });
      // Wait for the iPad's answer to this offer.
      let answered = false;
      while (!this.stopped && !answered && this.epoch === epoch) {
        await sleep(900);
        const st = await api<{ answer: string | null; setId: number | null }>({ method: "GET", query: `op=poll&id=${this.sessionId}` }).catch(() => null);
        if (st?.setId) this.setId = st.setId;
        if (st?.answer) {
          this.set("connecting");
          await pc.setRemoteDescription(JSON.parse(st.answer));
          answered = true;
        }
      }
      if (this.stopped) return;
      // Connected (or trying): wait until this connection ends, then offer again.
      const ok = await this.until(pc, 15000);
      if (!ok) {
        this.set("failed", "The iPad answered but the two devices could not reach each other. The Wi-Fi may block devices from talking to each other (client isolation).");
        pc.close();
        await sleep(1500);
        continue; // offer again
      }
      while (!this.stopped && this.dc?.readyState === "open" && !["failed", "closed"].includes(pc.connectionState)) await sleep(500);
      if (!this.stopped) this.set("lost");
      await sleep(500);
    }
  }

  /** True once the data channel opens within the time limit. */
  private async until(pc: RTCPeerConnection, ms: number) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (this.dc?.readyState === "open" && pc === this.pc) return true;
      if (pc.connectionState === "failed") return false;
      await sleep(200);
    }
    return false;
  }

  // ---------------- iPad ----------------
  /** iPad: pair with the board showing `code`, then answer each offer it makes (first one and reconnects). */
  async startControl(code: string, setId: number) {
    const j = await api<{ id: string; epoch: number; offer: string | null }>({ method: "POST", body: { op: "join", code, setId } });
    this.sessionId = j.id; this.code = code; this.setId = setId;
    this.set("connecting");
    void this.controlLoop();
  }

  private async controlLoop() {
    let answered = -1;
    while (!this.stopped) {
      const st = await api<{ epoch: number; offer: string | null }>({ method: "GET", query: `op=poll&id=${this.sessionId}` }).catch((e) => {
        if ((e as { status?: number }).status === 404) { this.set("failed", (e as Error).message); this.stopped = true; }
        return null;
      });
      const open = this.dc?.readyState === "open";
      if (st?.offer && st.epoch > answered && !open) {
        answered = st.epoch;
        this.set("connecting");
        this.pc?.close();
        const pc = new RTCPeerConnection(ICE);
        this.pc = pc;
        pc.ondatachannel = (e) => this.wire(e.channel);
        await pc.setRemoteDescription(JSON.parse(st.offer));
        await pc.setLocalDescription(await pc.createAnswer());
        await gathered(pc);
        await api({ method: "POST", body: { op: "answer", id: this.sessionId, epoch: st.epoch, answer: JSON.stringify(pc.localDescription) } }).catch(() => (answered = -1));
        this.watchPc(pc, () => this.set("lost"));
        const ok = await this.until(pc, 15000);
        if (!ok && !this.stopped)
          this.set("failed", "Could not reach the board directly. The Wi-Fi may block devices from talking to each other (client isolation). Ask for it to be switched off for this network, or use a phone hotspot to test.");
      }
      await sleep(open ? 2500 : 900);
    }
  }

  stop() {
    this.stopped = true;
    if (this.beat) clearInterval(this.beat);
    this.dc?.close();
    this.pc?.close();
    this.set("waiting");
  }
}
```

## Appendix B — signalling endpoint (Next.js route handler, adapt to your framework)

See `src/app/remote/api/route.ts`. Its logic in brief:

```
GET  op=poll  → session must be live; caller must be its display or controller
              → { epoch, offer, answer: (answer_epoch == epoch ? answer : null), setId, code }
GET  op=deck  → caller must be the display; return the content for session.set_id
POST create   → insert { code: random 100000–999999 not used by a live session, display_user_id: me, expires_at: now+12h }
POST offer    → caller must be the display; set { epoch, offer, answer: null, answer_epoch: null }
POST join     → caller may present and may see content setId; find live session by code; set { controller_user_id: me, set_id }
              → { id, epoch, offer }
POST answer   → caller must be the controller; reject (409) if body.epoch != session.epoch; set { answer, answer_epoch: epoch }
```

Return `Cache-Control: private, no-store` on every response.
