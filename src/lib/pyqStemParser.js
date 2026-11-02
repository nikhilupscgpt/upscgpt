const STATEMENT_RE = /^(Statement[\s-]*(?:I{1,3}|IV|[1-4])|I{1,3}|IV|V|VI|[1-6]|[A-D])\s*[.:)]\s*(.*)$/i;
const PROMPT_RE = /\s+((?:Which\s+(?:one\s+of\s+the|of\s+the|pairs?|statements?|of\s+these)|How\s+many\s+of\s+the|Select\s+the\s+correct).*)$/i;
const PROMPT_START = /^(Which\s+(?:one\s+of\s+the|of\s+the|pairs?|statements?|of\s+these)|How\s+many\s+of\s+the|Select\s+the\s+correct|In\s+the\s+context\s+of\s+the\s+above)/i;
const PROMPT_END = /\b(is\/are\s+(?:correct|not\s+correct)|are\s+(?:correct|not\s+correct)|is\s+(?:correct|not\s+correct)|correctly\s+matched)\s*\??$/i;

export function isPromptText(text = '') {
  const t = String(text || '').trim();
  if (!t) return false;
  return PROMPT_START.test(t) || PROMPT_END.test(t);
}

export function parseStem(stem) {
  let raw = String(stem || '').trim();

  // Pre-normalization:
  // 1. Split inline Statement-I: / Statement-II:
  raw = raw.replace(/([.:])\s*(Statement[\s-]*(?:I{1,3}|IV|[1-4])\s*[.:])/gi, '$1\n$2');
  // 2. Detach closing question prompts if stuck on the same line
  raw = raw.replace(PROMPT_RE, '\n$1');

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Table: 2+ consecutive lines with " | " separators
    if (line.includes(' | ')) {
      const rows = [];
      while (i < lines.length && lines[i].includes(' | ')) {
        rows.push(lines[i].split(' | ').map(c => c.trim()));
        i++;
      }
      if (rows.length >= 2) {
        blocks.push({ type: 'table', head: rows[0], rows: rows.slice(1) });
        continue;
      }
      blocks.push({ type: 'p', text: rows[0].join(' | '), isPrompt: isPromptText(rows[0].join(' | ')) });
      continue;
    }

    const m = line.match(STATEMENT_RE);
    if (m && m[2]) {
      const items = [];
      while (i < lines.length) {
        const mm = lines[i].match(STATEMENT_RE);
        if (!mm || !mm[2] || lines[i].includes(' | ')) break;
        let key = mm[1].replace(/^Statement[\s-]*/i, '');
        items.push({ key: key.toUpperCase(), text: mm[2] });
        i++;
      }
      blocks.push({ type: 'stmts', items });
      continue;
    }

    const isPrompt = isPromptText(line);
    blocks.push({ type: 'p', text: line, isPrompt });
    i++;
  }
  return blocks;
}
