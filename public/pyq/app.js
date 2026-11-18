/* Page logic: calculations (dash.calc), helpers (window.PQ), page flow and drawings (dash.draw).
   Each block runs in its own scope, as it did in the dashboard. */

// ===== block 1 =====
(function () {
  // ---------- calculations: every number on the page comes from the questions file ----------
  dash.calc('year_totals', {
    inputs: ['questions'],
    title: 'Questions per paper in the dataset',
    description: 'How many of each year’s 100 questions the dataset holds.',
    fn: (questions) => {
      const c = {};
      for (const q of questions) c[q.year] = (c[q.year] || 0) + 1;
      return Object.keys(c).sort().map((y) => ({year: Number(y), available: c[y]}));
    }
  });

  dash.calc('subject_summary', {
    inputs: ['questions'],
    title: 'Subject summary',
    description: 'Questions per subject, share of all questions, average per year in three periods, and the trend from 2011–15 to 2020–23.',
    fn: (questions) => {
      const r1 = (v) => Math.round(v * 10) / 10;
      const periods = [[2011, 2015, 'avgEarly'], [2016, 2020, 'avgMid'], [2021, 2026, 'avgRecent']];
      const trendOf = (n, a, b) => n < 4 ? 'Too few' : (b >= a * 1.5 && b - a >= 0.5) ? 'Rising' : (a >= b * 1.5 && a - b >= 0.5) ? 'Falling' : 'Steady';
      const by = {};
      for (const q of questions) (by[q.subjectKey] = by[q.subjectKey] || []).push(q);
      const rows = Object.values(by).map((list) => {
        const row = {key: list[0].subjectKey, subject: list[0].subject, count: list.length,
          sharePaper: r1(100 * list.length / questions.length)};
        for (const [a, b, name] of periods) row[name] = r1(list.filter((q) => q.year >= a && q.year <= b).length / (b - a + 1));
        row.trend = trendOf(list.length, row.avgEarly, row.avgRecent);
        row.themes = new Set(list.map((q) => q.theme)).size;
        row.caShare = Math.round(100 * list.filter((q) => q.ca).length / list.length);
        return row;
      });
      rows.sort((x, y) => (x.key === 'other_thin_data') - (y.key === 'other_thin_data') || y.count - x.count);
      rows.forEach((r, i) => { r.rank = i + 1; });
      return rows;
    }
  });

  dash.calc('subject_year', {
    inputs: ['questions'],
    title: 'Subject by year',
    description: 'Questions per subject in each paper, and that as a share of the paper’s questions in the dataset.',
    fn: (questions) => {
      const avail = {}, subj = {}, c = {};
      for (const q of questions) {
        avail[q.year] = (avail[q.year] || 0) + 1;
        subj[q.subjectKey] = q.subject;
        const k = q.subjectKey + '|' + q.year;
        c[k] = (c[k] || 0) + 1;
      }
      const rows = [];
      for (const s of Object.keys(subj)) for (let y = 2011; y <= 2026; y++) {
        const n = c[s + '|' + y] || 0;
        rows.push({key: s + '|' + y, subjectKey: s, subject: subj[s], year: y, count: n,
          share: avail[y] ? Math.round(1000 * n / avail[y]) / 10 : 0});
      }
      return rows;
    }
  });

  dash.calc('theme_summary', {
    inputs: ['questions'],
    title: 'Theme summary',
    description: 'Questions per theme, share of its subject, papers it appeared in, first and last year, longest run of consecutive papers, period averages and trend.',
    fn: (questions) => {
      const r1 = (v) => Math.round(v * 10) / 10;
      const periods = [[2011, 2015, 'avgEarly'], [2016, 2020, 'avgMid'], [2021, 2026, 'avgRecent']];
      const trendOf = (n, a, b) => n < 4 ? 'Too few' : (b >= a * 1.5 && b - a >= 0.5) ? 'Rising' : (a >= b * 1.5 && a - b >= 0.5) ? 'Falling' : 'Steady';
      const subjN = {}, by = {};
      for (const q of questions) {
        subjN[q.subjectKey] = (subjN[q.subjectKey] || 0) + 1;
        (by[q.themeKey] = by[q.themeKey] || []).push(q);
      }
      const rows = Object.values(by).map((list) => {
        const yrs = new Set(list.map((q) => q.year));
        let run = 0, best = 0;
        for (let y = 2011; y <= 2026; y++) { run = yrs.has(y) ? run + 1 : 0; best = Math.max(best, run); }
        const sorted = [...yrs].sort();
        const row = {key: list[0].themeKey, subjectKey: list[0].subjectKey, subject: list[0].subject, theme: list[0].theme,
          count: list.length, shareSubject: r1(100 * list.length / subjN[list[0].subjectKey]),
          yearsAsked: yrs.size, firstYear: sorted[0], lastYear: sorted[sorted.length - 1], streak: best};
        for (const [a, b, name] of periods) row[name] = r1(list.filter((q) => q.year >= a && q.year <= b).length / (b - a + 1));
        row.trend = trendOf(list.length, row.avgEarly, row.avgRecent);
        row.caShare = Math.round(100 * list.filter((q) => q.ca).length / list.length);
        return row;
      });
      rows.sort((x, y) => x.subjectKey.localeCompare(y.subjectKey) || y.count - x.count || x.theme.localeCompare(y.theme));
      const rank = {};
      for (const r of rows) { rank[r.subjectKey] = (rank[r.subjectKey] || 0) + 1; r.rank = rank[r.subjectKey]; }
      return rows;
    }
  });

  dash.calc('theme_year', {
    inputs: ['questions'],
    title: 'Theme by year',
    description: 'Questions per theme in each paper, zero where none.',
    fn: (questions) => {
      const meta = {}, c = {};
      for (const q of questions) {
        meta[q.themeKey] = {subjectKey: q.subjectKey, theme: q.theme};
        const k = q.themeKey + '|' + q.year;
        c[k] = (c[k] || 0) + 1;
      }
      const rows = [];
      for (const t of Object.keys(meta)) for (let y = 2011; y <= 2026; y++) {
        rows.push({key: t + '|' + y, themeKey: t, subjectKey: meta[t].subjectKey, theme: meta[t].theme, year: y, count: c[t + '|' + y] || 0});
      }
      return rows;
    }
  });

  dash.calc('format_mix', {
    inputs: ['questions'],
    title: 'Question formats by subject',
    description: 'How each subject’s questions are framed: direct, multi-statement, pairs, “how many correct”, Statement I–II.',
    fn: (questions) => {
      const n = {}, c = {};
      for (const q of questions) {
        n[q.subjectKey] = (n[q.subjectKey] || 0) + 1;
        const k = q.subjectKey + '|' + q.format;
        c[k] = c[k] || {key: k, subjectKey: q.subjectKey, format: q.format, count: 0};
        c[k].count++;
      }
      return Object.values(c).map((r) => ({...r, share: Math.round(1000 * r.count / n[r.subjectKey]) / 10}))
        .sort((a, b) => a.subjectKey.localeCompare(b.subjectKey) || b.count - a.count);
    }
  });

  dash.calc('sub_summary', {
    inputs: ['questions'],
    title: 'Sub-topic summary',
    description: 'Questions per sub-topic within each theme, with first and last year asked.',
    fn: (questions) => {
      const c = {};
      for (const q of questions) {
        const k = q.themeKey + '|' + q.sub;
        const r = c[k] = c[k] || {key: k, themeKey: q.themeKey, sub: q.sub, count: 0, firstYear: q.year, lastYear: q.year, caCount: 0};
        r.count++;
        r.firstYear = Math.min(r.firstYear, q.year);
        r.lastYear = Math.max(r.lastYear, q.year);
        if (q.ca) r.caCount++;
      }
      return Object.values(c).sort((a, b) => a.themeKey.localeCompare(b.themeKey) || b.count - a.count);
    }
  });
})();

// ===== block 2 =====
(function () {
  // ---------- shared helpers ----------
  window.PQ = window.PQ || {};
  (function (P) {
    P.rows = (id) => { const d = dash.data(id); return d.status === 'ok' ? d.data : null; };
    P.status = (...ids) => { for (const id of ids) { const s = dash.data(id).status; if (s !== 'ok') return s; } return 'ok'; };
    P.insights = () => { const d = dash.data('insights'); return d.status === 'ok' && d.data ? d.data : null; };
    P.state = () => {
      const subs = P.rows('subject_summary'), themes = P.rows('theme_summary');
      if (!subs || !themes || !subs.length) return null;
      const p = dash.params();
      const subj = subs.find((s) => s.key === p.subject) || subs[0];
      const tlist = themes.filter((t) => t.subjectKey === subj.key).sort((a, b) => a.rank - b.rank);
      const theme = tlist.find((t) => t.key === p.theme) || tlist[0];
      return {subs, subj, tlist, theme};
    };
    P.el = (tag, attrs, text) => {
      const e = document.createElement(tag);
      if (attrs) for (const k in attrs) if (attrs[k] != null && attrs[k] !== false) e.setAttribute(k, attrs[k]);
      if (text != null) e.textContent = text;
      return e;
    };
    P.where = (key) => 'key=' + encodeURIComponent(key);
    P.mark = (src, field, key, text, tag) => P.el(tag || 'span', {'data-source': src, 'data-field': field, 'data-where': P.where(key)}, String(text));
    P.blank = (el, status) => {
      el.replaceChildren(document.createTextNode(status === 'error' ? 'Failed to load' : '—'));
    };
    P.trendCls = (t) => ({Rising: 'up', Falling: 'down'}[t] || '');
    P.pill = (text, cls) => P.el('span', {class: 'pq-pill ' + (cls || '')}, text);
    P.go = (id) => {
      const t = document.getElementById(id);
      if (!t) return;
      const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      requestAnimationFrame(() => t.scrollIntoView({behavior: still ? 'auto' : 'smooth', block: 'start'}));
    };
    P.pickSubject = (key) => { P.subFilter = null; dash.setParams({subject: key, theme: null}); P.go('subject'); };
    P.pickTheme = (key) => { P.subFilter = null; dash.setParams({theme: key}); P.go('theme'); };
    P.accent = () => dash.colors[0];
    P.tint = (frac) => `color-mix(in srgb, ${dash.colors[0]} ${Math.round(8 + 72 * frac)}%, transparent)`;

    // tooltip kept inside a relative box
    P.tip = (box) => {
      const t = P.el('div', {class: 'pq-tip', role: 'tooltip'});
      t.hidden = true;
      box.appendChild(t);
      return {
        show(lines, evt) {
          t.replaceChildren(...lines.map((l, i) => i === 0 ? P.el('b', null, l) : P.el('div', null, l)));
          t.hidden = false;
          const r = box.getBoundingClientRect();
          let x = evt.clientX - r.left + 12, y = evt.clientY - r.top - 10;
          const w = t.offsetWidth, h = t.offsetHeight;
          if (x + w > r.width) x = Math.max(0, evt.clientX - r.left - w - 12);
          if (y + h > r.height) y = Math.max(0, r.height - h);
          t.style.left = x + 'px';
          t.style.top = y + 'px';
        },
        hide() { t.hidden = true; }
      };
    };

    // horizontal bars as HTML rows
    P.bars = (el, items, max) => {
      el.replaceChildren(...items.map((it) => {
        const row = P.el(it.onClick ? 'button' : 'div', {class: 'pq-bar' + (it.on ? ' is-on' : ''), type: it.onClick ? 'button' : null, 'aria-pressed': it.onClick ? String(!!it.on) : null});
        const label = P.el('span', {class: 'pq-bar-label'});
        label.append(P.el('span', null, it.label));
        if (it.pill) label.append(P.pill(it.pill, it.pillCls));
        const track = P.el('span', {class: 'pq-bar-track', 'aria-hidden': 'true'});
        const fill = P.el('span', {class: 'pq-bar-fill'});
        fill.style.width = (max ? 100 * it.value / max : 0) + '%';
        fill.style.background = it.on ? 'var(--color-fg)' : P.accent();
        track.append(fill);
        const val = P.el('span', {class: 'pq-bar-val'});
        val.append(it.mark);
        if (it.extra) val.append(P.el('small', null, it.extra));
        row.append(label, track, val);
        if (it.onClick) row.addEventListener('click', it.onClick);
        if (it.title) row.setAttribute('aria-label', it.title);
        return row;
      }));
    };

    // year columns (SVG)
    P.columns = (el, rows, opt) => {
      el.replaceChildren();
      const W = Math.max(280, el.clientWidth || 560), H = 210, m = {t: 22, r: 4, b: 24, l: 4};
      const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%')
        .attr('role', 'img').attr('aria-label', opt.label);
      const x = d3.scaleBand().domain(rows.map((r) => r.year)).range([m.l, W - m.r]).padding(0.2);
      const y = d3.scaleLinear().domain([0, Math.max(1, d3.max(rows, (r) => r.count))]).range([H - m.b, m.t]);
      svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(0)).attr('y2', y(0)).style('stroke', 'var(--cds-chart-axis)');
      const tip = P.tip(el);
      const g = svg.selectAll('g.col').data(rows).join('g').attr('class', 'col');
      g.append('rect').attr('x', (d) => x(d.year)).attr('width', x.bandwidth())
        .attr('y', (d) => y(d.count)).attr('height', (d) => y(0) - y(d.count)).attr('rx', 2)
        .style('fill', P.accent());
      g.append('rect').attr('x', (d) => x(d.year) - x.step() * x.padding() / 2).attr('width', x.step())
        .attr('y', m.t - 10).attr('height', H - m.b - m.t + 10).style('fill', 'transparent')
        .on('pointermove', (e, d) => tip.show(opt.tip(d), e)).on('pointerleave', () => tip.hide());
      g.append('text').attr('class', 'pq-val').attr('text-anchor', 'middle')
        .attr('x', (d) => x(d.year) + x.bandwidth() / 2).attr('y', (d) => y(d.count) - 5)
        .attr('data-source', opt.source).attr('data-field', 'count').attr('data-where', (d) => P.where(d.key))
        .style('pointer-events', 'none').text((d) => d.count);
      const every = x.bandwidth() < 22 ? 2 : 1;
      g.append('text').attr('text-anchor', 'middle').attr('x', (d) => x(d.year) + x.bandwidth() / 2).attr('y', H - 7)
        .style('pointer-events', 'none')
        .text((d, i) => i % every === 0 ? (x.bandwidth() < 34 ? '’' + String(d.year).slice(2) : d.year) : '');
    };

    P.formatOrder = ['Multi-statement', 'Direct', 'How many correct', 'Pairs / match', 'Statement I–II'];
  })(window.PQ);
})();

// ===== block 3 =====
(function () {
  dash.calc('format_year', {
    inputs: ['questions'],
    title: 'Question formats by year',
    description: 'How many questions of each format appeared in each paper, all subjects together.',
    fn: (questions) => {
      const c = {};
      for (const q of questions) {
        const k = q.year + '|' + q.format;
        c[k] = c[k] || {key: k, year: q.year, format: q.format, count: 0};
        c[k].count++;
      }
      return Object.values(c).sort((a, b) => a.year - b.year || a.format.localeCompare(b.format));
    }
  });
})();

// ===== block 4 =====
(function () {
  // ---------- page flow: Overview → Subject → Theme ----------
  (function (P) {
    const PAGES = ['home', 'subject', 'theme'];
    P.show = (view, scroll) => {
      if (!PAGES.includes(view)) view = 'home';
      for (const id of PAGES) { const s = document.getElementById(id); if (s) s.hidden = id !== view; }
      document.querySelectorAll('.pq-step[data-nav]').forEach((b) => {
        const on = b.getAttribute('data-nav') === view;
        b.classList.toggle('is-on', on);
        if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      });
      try { dash.setLink(view); } catch (e) { /* links are optional */ }
      if (scroll !== false) {
        const top = document.getElementById('pq-top');
        if (top) requestAnimationFrame(() => top.scrollIntoView({block: 'start'}));
      }
    };
    P.pickSubject = (key) => { P.subFilter = null; P.qLimit = 5; dash.setParams({subject: key, theme: null}); P.show('subject'); };
    P.pickTheme = (key, subjectKey) => {
      P.subFilter = null; P.qLimit = 5;
      dash.setParams(subjectKey ? {subject: subjectKey, theme: key} : {theme: key});
      P.show('theme');
    };
    document.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => P.show(b.getAttribute('data-nav'))));
    P.show((location.hash || '').slice(1), false);
  })(window.PQ);
})();

// ===== block 5 =====
(function () {
  // ---------- step bar labels ----------
  dash.draw('step-subj', (el) => {
    const st = PQ.state();
    el.textContent = st ? st.subj.subject : '—';
  });
  dash.draw('step-theme', (el) => {
    const st = PQ.state();
    el.textContent = st && st.theme ? st.theme.theme : '—';
  });

  // ---------- overview: subject share heat map ----------
  dash.draw('ov-heat', (el) => {
    const s = PQ.rows('subject_summary'), sy = PQ.rows('subject_year');
    if (!s || !sy) return PQ.blank(el, PQ.status('subject_summary', 'subject_year'));
    const idx = new Map(sy.map((r) => [r.key, r]));
    const max = d3.max(sy, (r) => r.share) || 1;
    const t = PQ.el('table', {class: 'pq-heat'});
    const hr = PQ.el('tr');
    hr.append(PQ.el('th', {scope: 'col'}, ''), ...d3.range(2011, 2027).map((y) => PQ.el('th', {scope: 'col'}, "’" + String(y).slice(2))));
    const th = PQ.el('thead'); th.append(hr); t.append(th);
    const tb = PQ.el('tbody');
    for (const r of s) {
      const c = PQ.subjColor(r.key);
      const tr = PQ.el('tr');
      const rh = PQ.el('th', {scope: 'row', class: 'pq-rowh'});
      const sw = PQ.el('span', {class: 'pq-swatch', 'aria-hidden': 'true'}); sw.style.background = c;
      rh.append(sw, document.createTextNode(r.subject));
      tr.append(rh);
      for (let y = 2011; y <= 2026; y++) {
        const cell = idx.get(r.key + '|' + y);
        const td = PQ.el('td', {class: cell.count ? null : 'zero', 'data-source': 'subject_year', 'data-field': 'share', 'data-where': PQ.where(cell.key),
          title: `${r.subject}, ${y}: ${cell.count} questions (${cell.share}%)`}, cell.count ? String(Math.round(cell.share)) : '·');
        if (cell.count) td.style.background = `color-mix(in srgb, ${c} ${Math.round(10 + 70 * cell.share / max)}%, transparent)`;
        tr.append(td);
      }
      tb.append(tr);
    }
    t.append(tb);
    el.replaceChildren(t);
  });

  // ---------- overview: biggest movers ----------
  dash.draw('ov-movers', (el) => {
    const t = PQ.rows('theme_summary'), s = PQ.rows('subject_summary');
    if (!t || !s) return PQ.blank(el, PQ.status('theme_summary'));
    const name = new Map(s.map((r) => [r.key, r.subject]));
    const ok = t.filter((r) => r.trend !== 'Too few' && r.subjectKey !== 'other_thin_data')
      .map((r) => ({...r, d: Math.round((r.avgRecent - r.avgEarly) * 10) / 10}));
    const up = [...ok].sort((a, b) => b.d - a.d).filter((r) => r.d > 0).slice(0, 5);
    const down = [...ok].sort((a, b) => a.d - b.d).filter((r) => r.d < 0).slice(0, 5);
    const row = (r, dir) => {
      const b = PQ.el('button', {type: 'button', class: 'pq-mover', 'aria-label': `${r.theme}, ${name.get(r.subjectKey)}: ${r.avgEarly} to ${r.avgRecent} questions per paper. Open theme.`});
      const subj = PQ.el('span', {class: 'pq-mover-subj'});
      const sw = PQ.el('i'); sw.style.background = PQ.subjColor(r.subjectKey);
      subj.append(sw, document.createTextNode(name.get(r.subjectKey)));
      const v = PQ.el('span', {class: 'pq-mover-v ' + dir});
      v.append(PQ.mark('theme_summary', 'avgEarly', r.key, r.avgEarly), document.createTextNode(' → '), PQ.mark('theme_summary', 'avgRecent', r.key, r.avgRecent));
      b.append(PQ.el('span', {class: 'pq-mover-name'}, r.theme), v, subj);
      b.addEventListener('click', () => PQ.pickTheme(r.key, r.subjectKey));
      return b;
    };
    el.replaceChildren(PQ.el('h3', null, '↑ Gaining weight'), ...up.map((r) => row(r, 'up')),
      PQ.el('h3', null, '↓ Losing weight'), ...down.map((r) => row(r, 'down')));
  });

  // ---------- overview: formats by year ----------
  dash.draw('ov-formats', (el) => {
    const fy = PQ.rows('format_year');
    if (!fy) return PQ.blank(el, PQ.status('format_year'));
    el.replaceChildren();
    const years = d3.range(2011, 2027);
    const fmts = PQ.formatOrder;
    const col = (f) => dash.colors[fmts.indexOf(f) % dash.colors.length];
    const byYear = years.map((y) => {
      const o = {year: y};
      for (const f of fmts) o[f] = 0;
      for (const r of fy) if (r.year === y) o[r.format] = r.count;
      return o;
    });
    const series = d3.stack().keys(fmts)(byYear);
    const W = Math.max(280, el.clientWidth || 520), H = 220, m = {t: 8, r: 4, b: 24, l: 4};
    const x = d3.scaleBand().domain(years).range([m.l, W - m.r]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(byYear, (d) => d3.sum(fmts, (f) => d[f])) || 1]).range([H - m.b, m.t]);
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img')
      .attr('aria-label', 'Question formats per paper, 2011 to 2026, all subjects');
    svg.append('g').selectAll('g').data(series).join('g').style('fill', (s) => col(s.key))
      .selectAll('rect').data((s) => s).join('rect')
      .attr('x', (d) => x(d.data.year)).attr('width', x.bandwidth())
      .attr('y', (d) => y(d[1])).attr('height', (d) => Math.max(0, y(d[0]) - y(d[1])));
    const tip = PQ.tip(el);
    svg.append('g').selectAll('rect').data(byYear).join('rect')
      .attr('x', (d) => x(d.year) - x.step() * x.padding() / 2).attr('width', x.step()).attr('y', m.t).attr('height', H - m.b - m.t)
      .style('fill', 'transparent')
      .on('pointermove', (e, d) => tip.show([String(d.year), ...fmts.filter((f) => d[f]).map((f) => `${f}: ${d[f]}`)], e))
      .on('pointerleave', () => tip.hide());
    const every = x.bandwidth() < 22 ? 2 : 1;
    svg.append('g').selectAll('text').data(years).join('text').attr('text-anchor', 'middle')
      .attr('x', (d) => x(d) + x.bandwidth() / 2).attr('y', H - 7)
      .text((d, i) => i % every === 0 ? (x.bandwidth() < 34 ? '’' + String(d).slice(2) : d) : '');
    const lg = PQ.el('ul', {class: 'pq-legend'});
    for (const f of fmts) {
      const li = PQ.el('li');
      const sw = PQ.el('i'); sw.style.background = col(f);
      li.append(sw, document.createTextNode(f));
      lg.append(li);
    }
    el.append(lg);
  });

  // ---------- overview: always asked ----------
  dash.draw('ov-always', (el) => {
    const t = PQ.rows('theme_summary'), s = PQ.rows('subject_summary');
    if (!t || !s) { el.replaceChildren(); return; }
    const name = new Map(s.map((r) => [r.key, r.subject]));
    const list = t.filter((r) => r.yearsAsked >= 14).sort((a, b) => b.count - a.count);
    el.replaceChildren(...list.map((r) => {
      const b = PQ.el('button', {type: 'button', class: 'pq-chip', 'aria-label': `${r.theme}, ${name.get(r.subjectKey)}: asked in ${r.yearsAsked} of 16 papers. Open theme.`});
      const sw = PQ.el('span', {class: 'pq-swatch', 'aria-hidden': 'true'}); sw.style.background = PQ.subjColor(r.subjectKey);
      b.append(sw, document.createTextNode(r.theme + ' · '), PQ.mark('theme_summary', 'yearsAsked', r.key, r.yearsAsked), document.createTextNode('/16'));
      b.addEventListener('click', () => PQ.pickTheme(r.key, r.subjectKey));
      return b;
    }));
  });

  // ---------- theme page: previous / next ----------
  dash.draw('t-pager', (el) => {
    const st = PQ.state();
    if (!st) { el.replaceChildren(); return; }
    const i = st.tlist.findIndex((r) => r.key === st.theme.key);
    const out = [];
    const back = PQ.el('button', {type: 'button'});
    back.append(PQ.el('small', null, '← Back to subject'), PQ.el('span', null, st.subj.subject));
    back.addEventListener('click', () => PQ.show('subject'));
    out.push(back);
    const nx = st.tlist[i + 1];
    if (nx) {
      const b = PQ.el('button', {type: 'button', class: 'next'});
      b.append(PQ.el('small', null, 'Next theme →'), PQ.el('span', null, nx.theme));
      b.addEventListener('click', () => PQ.pickTheme(nx.key));
      out.push(b);
    }
    el.replaceChildren(...out);
  });
})();

// ===== block 6 =====
(function () {
  // ---------- helpers for this layout ----------
  (function (P) {
    P.subjColor = (key) => {
      const s = P.rows('subject_summary') || [];
      const i = Math.max(0, s.findIndex((r) => r.key === key));
      return dash.colors[i % dash.colors.length];
    };
    P.spark = (counts, label, color) => {
      const ns = 'http://www.w3.org/2000/svg';
      const n = counts.length, W = n * 8, H = 24;
      const max = Math.max(1, ...counts);
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', label);
      counts.forEach((c, i) => {
        const h = c ? Math.max(2, (H - 1) * c / max) : 1;
        const r = document.createElementNS(ns, 'rect');
        r.setAttribute('x', i * 8 + 1);
        r.setAttribute('y', H - h);
        r.setAttribute('width', 6);
        r.setAttribute('height', h);
        r.setAttribute('rx', 1);
        r.style.fill = c ? color : 'var(--cds-chart-grid)';
        svg.appendChild(r);
      });
      return svg;
    };
    P.trendPill = (t) => t === 'Too few' ? null : P.pill((t === 'Rising' ? '↑ ' : t === 'Falling' ? '↓ ' : '→ ') + t, P.trendCls(t));
    P.qLimit = 5;
  })(window.PQ);

  // tabs: listen and toggle hidden / aria only
  document.querySelectorAll('.pq-tabs').forEach((list) => {
    const tabs = () => [...list.querySelectorAll('[role="tab"]')];
    const pick = (b) => {
      for (const t of tabs()) {
        const on = t === b;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      }
    };
    list.addEventListener('click', (e) => { const b = e.target.closest('[role="tab"]'); if (b) pick(b); });
    list.addEventListener('keydown', (e) => {
      const all = tabs(), i = all.indexOf(document.activeElement);
      if (i < 0 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      const n = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
      n.focus(); pick(n); e.preventDefault();
    });
  });
})();

// ===== block 7 =====
(function () {
  // ---------- header ----------
  dash.draw('takeaway', (el) => {
    const s = PQ.rows('subject_summary');
    if (!s) return PQ.blank(el, PQ.status('subject_summary'));
    const main = s.filter((r) => r.key !== 'other_thin_data');
    const [a, b] = main;
    const r = main.filter((x) => x.trend === 'Rising')[0];
    const p = [document.createTextNode(`${a.subject} and ${b.subject} make up `),
      PQ.mark('subject_summary', 'sharePaper', a.key, a.sharePaper), document.createTextNode('% and '),
      PQ.mark('subject_summary', 'sharePaper', b.key, b.sharePaper), document.createTextNode('% of the paper.')];
    if (r) p.push(document.createTextNode(` ${r.subject} ${r.avgRecent >= 1.8 * r.avgEarly ? 'roughly doubled' : 'grew'}, from `), PQ.mark('subject_summary', 'avgEarly', r.key, r.avgEarly),
      document.createTextNode(' to '), PQ.mark('subject_summary', 'avgRecent', r.key, r.avgRecent), document.createTextNode(' questions a paper.'));
    el.replaceChildren(...p);
  });

  dash.draw('coverage', (el) => {
    const y = PQ.rows('year_totals');
    if (!y) return PQ.blank(el, PQ.status('year_totals'));
    const lo = y.reduce((m, r) => r.available < m.available ? r : m), hi = y.reduce((m, r) => r.available > m.available ? r : m);
    el.replaceChildren(
      document.createTextNode('Each paper in the dataset has between '),
      PQ.el('span', {'data-source': 'year_totals', 'data-field': 'available', 'data-where': 'year=' + lo.year}, String(lo.available)),
      document.createTextNode(` (${lo.year}) and `),
      PQ.el('span', {'data-source': 'year_totals', 'data-field': 'available', 'data-where': 'year=' + hi.year}, String(hi.available)),
      document.createTextNode(` (${hi.year}) of its 100 questions.`)
    );
  });

  const kpi = (name, src, fn) => dash.draw(name, (el) => {
    const r = PQ.rows(src);
    if (!r) return PQ.blank(el, PQ.status(src));
    el.replaceChildren(PQ.el('span', {'data-source': src}, fn(r)));
  });
  kpi('k-total', 'year_totals', (y) => y.reduce((n, r) => n + r.available, 0).toLocaleString('en-IN'));
  kpi('k-papers', 'year_totals', (y) => String(y.length));
  kpi('k-subjects', 'subject_summary', (s) => String(s.length));
  kpi('k-themes', 'theme_summary', (t) => String(t.length));

  // ---------- subject cards ----------
  dash.draw('subj-cards', (el) => {
    const st = PQ.state(), sy = PQ.rows('subject_year');
    if (!st || !sy) return PQ.blank(el, PQ.status('subject_summary', 'subject_year'));
    const per = d3.group(sy, (r) => r.subjectKey);
    el.replaceChildren(...st.subs.map((r) => {
      const c = PQ.subjColor(r.key);
      const card = PQ.el('button', {type: 'button', class: 'pq-card' + (r.key === st.subj.key ? ' is-on' : ''), 'aria-pressed': String(r.key === st.subj.key)});
      card.style.setProperty('--c', c);
      const top = PQ.el('div', {class: 'pq-card-row'});
      top.append(PQ.el('span', {class: 'pq-card-name'}, r.subject));
      const tp = PQ.trendPill(r.trend);
      if (tp) top.append(tp);
      const mid = PQ.el('div', {class: 'pq-card-row'});
      const share = PQ.el('span', {class: 'pq-card-share'});
      share.append(PQ.mark('subject_summary', 'sharePaper', r.key, r.sharePaper), document.createTextNode('% of paper'));
      mid.append(PQ.mark('subject_summary', 'count', r.key, r.count, 'span'), share);
      mid.firstChild.className = 'pq-card-n';
      const counts = (per.get(r.key) || []).sort((a, b) => a.year - b.year).map((x) => x.count);
      card.append(top, mid, PQ.spark(counts, `Questions per year 2011 to 2026: ${counts.join(', ')}`, c));
      card.addEventListener('click', () => PQ.pickSubject(r.key));
      return card;
    }));
  });

  // ---------- subject analysis ----------
  dash.draw('subj-select', (sel) => {
    const st = PQ.state();
    if (!st) { sel.replaceChildren(); return; }
    sel.replaceChildren(...st.subs.map((r) => new Option(r.subject, r.key)));
    sel.value = st.subj.key;
    sel.onchange = () => PQ.pickSubject(sel.value);
  });

  dash.draw('s-name', (el) => {
    const st = PQ.state();
    if (!st) return PQ.blank(el, PQ.status('subject_summary'));
    const sw = PQ.el('span', {class: 'pq-swatch', 'aria-hidden': 'true'});
    sw.style.background = PQ.subjColor(st.subj.key);
    el.replaceChildren(sw, document.createTextNode(st.subj.subject));
  });

  const tile = (name, fn) => dash.draw(name, (el) => {
    const st = PQ.state();
    if (!st) return PQ.blank(el, PQ.status('subject_summary', 'theme_summary'));
    el.replaceChildren(...[].concat(fn(st)).filter(Boolean));
  });
  const small = (t) => PQ.el('small', null, t);
  tile('s-count', (st) => PQ.mark('subject_summary', 'count', st.subj.key, st.subj.count));
  tile('s-share', (st) => [PQ.mark('subject_summary', 'sharePaper', st.subj.key, st.subj.sharePaper), small('%')]);
  tile('s-trend', (st) => [PQ.mark('subject_summary', 'avgEarly', st.subj.key, st.subj.avgEarly), small(' → '), PQ.mark('subject_summary', 'avgRecent', st.subj.key, st.subj.avgRecent)]);
  tile('s-ca', (st) => [PQ.mark('subject_summary', 'caShare', st.subj.key, st.subj.caShare), small('%')]);

  dash.draw('s-overview', (el) => {
    const st = PQ.state(), ins = PQ.insights();
    if (!st || !ins) return PQ.blank(el, PQ.status('insights', 'subject_summary'));
    const s = (ins.subjects || {})[st.subj.key];
    el.textContent = s && s.overview ? s.overview : 'No written analysis for this subject yet.';
  });

  dash.draw('s-years', (el) => {
    const st = PQ.state(), sy = PQ.rows('subject_year');
    if (!st || !sy) return PQ.blank(el, PQ.status('subject_year'));
    const rows = sy.filter((r) => r.subjectKey === st.subj.key);
    PQ.columns(el, rows, {source: 'subject_year', label: `${st.subj.subject} questions per year, 2011 to 2026`,
      tip: (d) => [String(d.year), `${d.count} questions`, `${d.share}% of that paper`]});
    d3.select(el).selectAll('g.col rect:first-child').style('fill', PQ.subjColor(st.subj.key));
  });

  dash.draw('s-formats', (el) => {
    const st = PQ.state(), fm = PQ.rows('format_mix');
    if (!st || !fm) return PQ.blank(el, PQ.status('format_mix'));
    const rows = fm.filter((r) => r.subjectKey === st.subj.key)
      .sort((a, b) => PQ.formatOrder.indexOf(a.format) - PQ.formatOrder.indexOf(b.format));
    const col = (f) => dash.colors[PQ.formatOrder.indexOf(f) % dash.colors.length];
    const bar = PQ.el('div', {class: 'pq-stack', role: 'img', 'aria-label': rows.map((r) => `${r.format} ${r.share}%`).join(', ')});
    for (const r of rows) { const s = PQ.el('span', {title: `${r.format}: ${r.count} (${r.share}%)`}); s.style.width = r.share + '%'; s.style.background = col(r.format); bar.append(s); }
    const lg = PQ.el('ul', {class: 'pq-legend'});
    for (const r of rows) {
      const li = PQ.el('li');
      const sw = PQ.el('i'); sw.style.background = col(r.format);
      li.append(sw, document.createTextNode(r.format), PQ.el('b', {'data-source': 'format_mix', 'data-field': 'count', 'data-where': PQ.where(r.key)}, String(r.count)));
      lg.append(li);
    }
    const wrap = PQ.el('div', {class: 'pq-panel'});
    wrap.append(bar, lg);
    el.replaceChildren(wrap);
  });

  dash.draw('s-themes', (el) => {
    const st = PQ.state(), ty = PQ.rows('theme_year');
    if (!st || !ty) return PQ.blank(el, PQ.status('theme_summary', 'theme_year'));
    const per = d3.group(ty, (r) => r.themeKey);
    const c = PQ.subjColor(st.subj.key);
    const max = d3.max(st.tlist, (r) => r.count) || 1;
    el.style.setProperty('--c', c);
    el.replaceChildren(...st.tlist.map((r) => {
      const b = PQ.el('button', {type: 'button', class: 'pq-row' + (r.key === st.theme.key ? ' is-on' : ''), 'aria-pressed': String(r.key === st.theme.key),
        'aria-label': `${r.theme}: ${r.count} questions, ${r.trend}. Open theme.`});
      const name = PQ.el('span', {class: 'pq-row-name'});
      name.append(PQ.el('span', null, r.theme));
      const tp = PQ.trendPill(r.trend);
      if (tp) name.append(tp);
      const track = PQ.el('span', {class: 'pq-track', 'aria-hidden': 'true'});
      const fill = PQ.el('span', {class: 'pq-fill'});
      fill.style.width = (100 * r.count / max) + '%';
      fill.style.background = c;
      track.append(fill);
      const n = PQ.mark('theme_summary', 'count', r.key, r.count);
      n.className = 'pq-row-n';
      const counts = (per.get(r.key) || []).sort((a, x) => a.year - x.year).map((x) => x.count);
      b.append(name, track, n, PQ.spark(counts, `Per year: ${counts.join(', ')}`, c));
      b.addEventListener('click', () => PQ.pickTheme(r.key));
      return b;
    }));
  });

  const insightList = (name, pick) => dash.draw(name, (el) => {
    const st = PQ.state(), ins = PQ.insights();
    if (!st || !ins) { el.replaceChildren(); return; }
    const items = pick(ins, st) || [];
    el.style.setProperty('--c', PQ.subjColor(st.subj.key));
    el.replaceChildren(...(items.length ? items : ['No notes for this yet.']).map((t) => PQ.el('li', null, t)));
  });
  insightList('s-findings', (ins, st) => (ins.subjects[st.subj.key] || {}).keyFindings);
  insightList('s-strategy', (ins, st) => (ins.subjects[st.subj.key] || {}).studyStrategy);

  dash.draw('s-concepts', (el) => {
    const st = PQ.state(), ins = PQ.insights(), qs = PQ.rows('questions');
    if (!st || !ins || !qs) { el.replaceChildren(); return; }
    const yearOf = new Map(qs.map((q) => [q.id, q.year]));
    const list = ((ins.subjects[st.subj.key] || {}).recurringConcepts || []).map((c) => {
      const years = [...new Set((c.ids || []).map((i) => yearOf.get(i)).filter(Boolean))].sort();
      return {...c, years};
    }).sort((a, b) => b.years.length - a.years.length || (b.ids || []).length - (a.ids || []).length);
    el.replaceChildren(...list.map((c) => {
      const card = PQ.el('div', {class: 'pq-concept'});
      const yrs = PQ.el('div', {class: 'pq-years', 'aria-label': 'Years asked'});
      yrs.append(...c.years.map((y) => PQ.el('span', {class: 'pq-year'}, String(y))));
      card.append(PQ.el('strong', null, c.concept), yrs, PQ.el('p', null, c.note || ''));
      return card;
    }));
  });

  // ---------- theme analysis ----------
  dash.draw('theme-select', (sel) => {
    const st = PQ.state();
    if (!st) { sel.replaceChildren(); return; }
    sel.replaceChildren(...st.tlist.map((r) => new Option(r.theme, r.key)));
    sel.value = st.theme.key;
    sel.onchange = () => { PQ.subFilter = null; dash.setParams({theme: sel.value}); };
  });

  dash.draw('t-kicker', (el) => {
    const st = PQ.state();
    if (!st) return PQ.blank(el, PQ.status('subject_summary'));
    el.textContent = st.subj.subject;
  });
  dash.draw('t-name', (el) => {
    const st = PQ.state();
    if (!st) return PQ.blank(el, PQ.status('theme_summary'));
    el.textContent = st.theme.theme;
  });

  tile('t-count', (st) => PQ.mark('theme_summary', 'count', st.theme.key, st.theme.count));
  tile('t-share', (st) => [document.createTextNode('questions · '), PQ.mark('theme_summary', 'shareSubject', st.theme.key, st.theme.shareSubject), document.createTextNode('% of subject')]);
  tile('t-years', (st) => [PQ.mark('theme_summary', 'yearsAsked', st.theme.key, st.theme.yearsAsked), small('/16')]);
  tile('t-last', (st) => PQ.mark('theme_summary', 'lastYear', st.theme.key, st.theme.lastYear));
  tile('t-trend', (st) => [PQ.mark('theme_summary', 'avgEarly', st.theme.key, st.theme.avgEarly), small(' → '), PQ.mark('theme_summary', 'avgRecent', st.theme.key, st.theme.avgRecent)]);
  tile('t-ca', (st) => [PQ.mark('theme_summary', 'caShare', st.theme.key, st.theme.caShare), small('%')]);

  const themeIns = () => {
    const st = PQ.state(), ins = PQ.insights();
    if (!st || !ins) return null;
    return {st, t: (ins.themes || {})[st.theme.key] || {}};
  };
  dash.draw('t-badges', (el) => {
    const x = themeIns();
    if (!x) { el.replaceChildren(); return; }
    const out = [];
    if (x.t.priority) out.push(PQ.pill(`${x.t.priority} priority`, x.t.priority === 'High' ? 'high' : ''));
    const tp = PQ.trendPill(x.st.theme.trend);
    if (tp) out.push(tp);
    if (x.t.nature) out.push(PQ.pill(String(x.t.nature).split(/\s*[—–-]\s*|\.\s/)[0].trim()));
    if (x.t.priorityReason) out.push(PQ.el('p', {class: 'pq-reason'}, x.t.priorityReason));
    el.replaceChildren(...out);
  });
  dash.draw('t-summary', (el) => {
    const x = themeIns();
    if (!x) return PQ.blank(el, PQ.status('insights'));
    el.textContent = x.t.summary || 'No written analysis for this theme yet.';
  });
  insightList('t-repeated', (ins, st) => (ins.themes[st.theme.key] || {}).repeatedConcepts);
  insightList('t-study', (ins, st) => (ins.themes[st.theme.key] || {}).whatToStudy);

  dash.draw('t-yearbars', (el) => {
    const st = PQ.state(), ty = PQ.rows('theme_year');
    if (!st || !ty) return PQ.blank(el, PQ.status('theme_year'));
    const rows = ty.filter((r) => r.themeKey === st.theme.key);
    PQ.columns(el, rows, {source: 'theme_year', label: `${st.theme.theme} questions per year, 2011 to 2026`,
      tip: (d) => [String(d.year), `${d.count} question${d.count === 1 ? '' : 's'}`]});
    d3.select(el).selectAll('g.col rect:first-child').style('fill', PQ.subjColor(st.subj.key));
  });

  dash.draw('t-subs', (el) => {
    const st = PQ.state(), ss = PQ.rows('sub_summary');
    if (!st || !ss) return PQ.blank(el, PQ.status('sub_summary'));
    const rows = ss.filter((r) => r.themeKey === st.theme.key);
    const max = d3.max(rows, (r) => r.count) || 1;
    const c = PQ.subjColor(st.subj.key);
    el.replaceChildren(...rows.map((r) => {
      const on = PQ.subFilter === r.sub;
      const b = PQ.el('button', {type: 'button', class: 'pq-sub-b' + (on ? ' is-on' : ''), 'aria-pressed': String(on),
        'aria-label': `${r.sub}: ${r.count} questions, ${r.firstYear} to ${r.lastYear}. Filter the questions.`});
      const track = PQ.el('span', {class: 'pq-track', 'aria-hidden': 'true'});
      const fill = PQ.el('span', {class: 'pq-fill'});
      fill.style.width = (100 * r.count / max) + '%';
      fill.style.background = on ? 'var(--color-fg)' : c;
      track.append(fill);
      const n = PQ.mark('sub_summary', 'count', r.key, r.count);
      n.className = 'pq-row-n';
      b.append(PQ.el('span', null, r.sub), n, track);
      b.addEventListener('click', () => { PQ.subFilter = on ? null : r.sub; PQ.qLimit = 5; dash.draw('t-subs'); dash.draw('t-questions'); PQ.go('t-questions-block'); });
      return b;
    }));
  });

  dash.draw('t-questions', (el) => {
    const st = PQ.state(), qs = PQ.rows('questions'), ins = PQ.insights();
    if (!st || !qs) return PQ.blank(el, PQ.status('questions'));
    if (PQ._qTheme !== st.theme.key) { PQ._qTheme = st.theme.key; PQ.subFilter = null; PQ.qLimit = 5; }
    const all = qs.filter((q) => q.themeKey === st.theme.key).sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
    const subs = d3.rollups(all, (v) => v.length, (q) => q.sub).sort((a, b) => b[1] - a[1]);
    if (PQ.subFilter && !subs.some(([s]) => s === PQ.subFilter)) PQ.subFilter = null;
    const ex = new Set(((ins && ins.themes[st.theme.key]) || {}).exampleIds || []);
    const shown = (PQ.subFilter ? all.filter((q) => q.sub === PQ.subFilter) : all)
      .sort((a, b) => ex.has(b.id) - ex.has(a.id) || b.year - a.year || a.id.localeCompare(b.id));
    const chips = PQ.el('div', {class: 'pq-chips', role: 'group', 'aria-label': 'Filter by sub-topic'});
    const chip = (label, val, n) => {
      const b = PQ.el('button', {type: 'button', class: 'pq-chip' + (PQ.subFilter === val ? ' is-on' : ''), 'aria-pressed': String(PQ.subFilter === val)}, `${label} · ${n}`);
      b.addEventListener('click', () => { PQ.subFilter = val; PQ.qLimit = 5; dash.draw('t-questions'); dash.draw('t-subs'); });
      return b;
    };
    if (subs.length > 1) chips.append(chip('All', null, all.length), ...subs.map(([s, n]) => chip(s, s, n)));
    const cards = shown.slice(0, PQ.qLimit).map((q) => {
      const a = PQ.el('article', {class: 'pq-q' + (ex.has(q.id) ? ' is-ex' : ''), id: 'q-' + q.id});
      const meta = PQ.el('div', {class: 'pq-meta'});
      meta.append(PQ.pill(String(q.year)), PQ.el('span', {class: 'pq-count'}, q.sub));
      if (q.ca) meta.append(PQ.pill('Current affairs', 'ca'));
      if (q.tentative) meta.append(PQ.pill('Answer tentative'));
      const opts = PQ.el('ol', {class: 'pq-q-opts'});
      for (const o of String(q.options || '').split('\n').filter(Boolean)) opts.append(PQ.el('li', null, o));
      const det = PQ.el('details');
      det.append(PQ.el('summary', null, 'Show answer'), PQ.el('p', null, `(${q.answer}) ${q.answerText}`));
      a.append(meta, PQ.el('p', {class: 'pq-q-stem'}, q.stem), opts, det);
      return a;
    });
    const out = [];
    if (subs.length > 1) out.push(chips);
    out.push(...cards);
    if (shown.length > PQ.qLimit) {
      const more = PQ.el('button', {type: 'button', class: 'pq-more'}, `Show all ${shown.length} questions`);
      more.addEventListener('click', () => { PQ.qLimit = Infinity; dash.draw('t-questions'); });
      out.push(more);
    } else if (shown.length > 5) {
      out.push(PQ.el('p', {class: 'pq-count'}, `All ${shown.length} questions shown`));
    }
    el.replaceChildren(...out);
  });
})();
