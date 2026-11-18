// POST /api/pyq-log  — one row from public/pyq/pq-log.js (sent with navigator.sendBeacon).
// GET  /api/pyq-log?token=…  — the log as CSV, only if PYQ_LOG_TOKEN is set and matches.
// Needs DATABASE_URL (Neon) and the table from sql/001_pyq_chat_log.sql.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getNeonDatabaseUrl(): string {
  const envUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
  if (envUrl.includes(".neon.tech")) return envUrl;
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    const m = raw.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
    if (m && m[1].includes(".neon.tech")) return m[1];
  } catch {
    // ignore
  }
  return envUrl;
}

const REASONS = new Set(["no-match", "no-results", "keyword-not-found", "asked-back", "flagged"]);
const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);

export async function POST(req: Request) {
  let row: Record<string, unknown>;
  try {
    row = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }
  const question = clip(row.q, 300).trim();
  const reason = clip(row.reason, 40);
  if (!question || !REASONS.has(reason)) return new Response("ignored", { status: 400 });
  const engine = clip(row.engine, 20);
  const intent = clip(row.intent, 40);

  const sql = neon(getNeonDatabaseUrl());
  await sql`INSERT INTO pyq_chat_log (question, engine, intent, reason) VALUES (${question}, ${engine}, ${intent}, ${reason})`;
  return new Response(null, { status: 204 });
}

export async function GET(req: Request) {
  const token = process.env.PYQ_LOG_TOKEN;
  if (!token || new URL(req.url).searchParams.get("token") !== token) return new Response("not found", { status: 404 });
  const sql = neon(getNeonDatabaseUrl());
  const rows = (await sql`SELECT asked_at, question, engine, intent, reason FROM pyq_chat_log ORDER BY asked_at DESC LIMIT 5000`) as Record<string, unknown>[];
  const esc = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  const csv = ["time,question,engine,intent,reason"]
    .concat(rows.map((r) => [r.asked_at instanceof Date ? r.asked_at.toISOString() : r.asked_at, r.question, r.engine, r.intent, r.reason].map(esc).join(",")))
    .join("\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="pyq-chat-log.csv"' } });
}
