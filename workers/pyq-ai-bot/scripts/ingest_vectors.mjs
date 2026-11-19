import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chunksPath = path.resolve(__dirname, '../.kb_build/chunks_for_embed.json');
const workerUrl = process.env.WORKER_URL || 'https://upscgpt-pyq-ai-bot.upscgpt-ai.workers.dev';
const secret = process.env.INGEST_SECRET;

if (!secret) {
  console.error('Missing INGEST_SECRET env var');
  process.exit(1);
}

const chunks = JSON.parse(fs.readFileSync(chunksPath, 'utf8'));
const BATCH = 50;
let total = 0;

for (let i = 0; i < chunks.length; i += BATCH) {
  const slice = chunks.slice(i, i + BATCH);
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const res = await fetch(`${workerUrl}/admin/ingest-vectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ingest-secret': secret,
        },
        body: JSON.stringify({ chunks: slice }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const data = await res.json();
      total += data.upserted || slice.length;
      ok = true;
    } catch (err) {
      if (attempt === 3) {
        console.error(`Failed batch at ${i}:`, err.message);
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  if ((i / BATCH) % 10 === 0 || i + BATCH >= chunks.length) {
    console.log(`Upserted ${total}/${chunks.length} vectors...`);
  }
}

console.log(`Done! Total vectors upserted: ${total}`);
