-- Phase 1 · Knowledge Base Schema for Cloudflare D1 (upscgpt-pyq-kb)

CREATE TABLE IF NOT EXISTS kb_docs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL, -- 'pyq' | 'article' | 'schedule' | 'preamble'
  year INTEGER,
  subject TEXT,
  topic TEXT,
  title TEXT,
  stem TEXT,
  options_json TEXT,
  answer_key TEXT,
  answer_text TEXT,
  explanation TEXT,
  has_solution INTEGER NOT NULL DEFAULT 0,
  meta_json TEXT,
  content_hash TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kb_docs_kind_year ON kb_docs(kind, year DESC);
CREATE INDEX IF NOT EXISTS idx_kb_docs_subject ON kb_docs(subject);

CREATE TABLE IF NOT EXISTS kb_chunks (
  chunk_id TEXT PRIMARY KEY,
  doc_id TEXT NOT NULL,
  chunk_type TEXT NOT NULL, -- 'question' | 'statement' | 'solution' | 'keyword' | 'article'
  year INTEGER,
  subject TEXT,
  text TEXT NOT NULL,
  meta_json TEXT,
  FOREIGN KEY (doc_id) REFERENCES kb_docs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kb_chunks_doc_id ON kb_chunks(doc_id);

-- FTS5 full-text index for fast BM25 keyword search alongside Vectorize
CREATE VIRTUAL TABLE IF NOT EXISTS kb_chunks_fts USING fts5(
  chunk_id UNINDEXED,
  doc_id UNINDEXED,
  chunk_type UNINDEXED,
  subject UNINDEXED,
  text
);

CREATE TABLE IF NOT EXISTS kb_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
