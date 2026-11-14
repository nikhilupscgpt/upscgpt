'use client';

import React, { useState } from 'react';
import { Plus, Trash2, X, Save } from 'lucide-react';

const IUCN_OPTIONS = ['CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE', 'EW', 'EX'];
const WPA_OPTIONS = ['Schedule I', 'Schedule II', 'Schedule III', 'Schedule IV'];
const CITES_OPTIONS = ['Appendix I', 'Appendix II', 'Appendix III', 'Not listed'];
const GROUP_OPTIONS = ['Mammals', 'Birds', 'Reptiles', 'Amphibians', 'Fish', 'Plants', 'Invertebrates'];

function toLines(arr) {
  if (!Array.isArray(arr)) return '';
  return arr
    .map((x) => (typeof x === 'string' ? x : x?.headline || x?.text || JSON.stringify(x)))
    .filter(Boolean)
    .join('\n');
}

function fromLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function SpeciesEditorModal({ initialItem, onClose, onSaved }) {
  const isNew = !initialItem;
  const item = initialItem || {};

  const [title, setTitle] = useState(item.title || '');
  const [slug, setSlug] = useState(item.slug || '');
  const [subtitle, setSubtitle] = useState(item.subtitle || '');
  const [category, setCategory] = useState(item.category || 'Mammals');
  const [oneline, setOneline] = useState(item.oneline || '');
  const [headlineStat, setHeadlineStat] = useState(item.headlineStat || '');
  const [isStarter, setIsStarter] = useState(Boolean(item.isStarter || item.startWith));
  const [sortOrder, setSortOrder] = useState(item.sortOrder ?? 100);

  const [iucn, setIucn] = useState((item.statusBadges?.iucn || 'EN').toUpperCase());
  const [wpa, setWpa] = useState(item.statusBadges?.wpa || 'Schedule I');
  const [cites, setCites] = useState(item.statusBadges?.cites || 'Appendix I');

  const [imageUrl, setImageUrl] = useState(item.imageUrl || '');
  const [wikiTitle, setWikiTitle] = useState(item.wikiTitle || '');
  const [creditArtist, setCreditArtist] = useState(item.credit?.artist || item.imageCredit?.author || '');
  const [creditLic, setCreditLic] = useState(item.credit?.lic || item.imageCredit?.license || '');
  const [creditPage, setCreditPage] = useState(item.credit?.page || item.imageCredit?.url || '');

  const [trapsText, setTrapsText] = useState(
    toLines(item.traps?.length ? item.traps : item.confusionTrap ? [item.confusionTrap] : [])
  );
  const [factsText, setFactsText] = useState(
    toLines(item.facts?.length ? item.facts : item.rememberBullets || [])
  );
  const [idmarksText, setIdmarksText] = useState(toLines(item.idmarks || []));
  const [behaviour, setBehaviour] = useState(item.behaviour || '');
  const [pyqsText, setPyqsText] = useState(toLines(item.similarPYQ || []));

  const [statesText, setStatesText] = useState((item.states || []).join(', '));
  const [networkKey, setNetworkKey] = useState(item.networkKey || '');
  const [places, setPlaces] = useState(
    Array.isArray(item.places)
      ? item.places.map((p) => ({
          name: p.name || p.n || '',
          state: p.state || p.st || '',
          lat: p.lat ?? '',
          lon: p.lon ?? p.lng ?? '',
          note: p.note || '',
        }))
      : []
  );

  const [newsTriggers, setNewsTriggers] = useState(
    Array.isArray(item.newsTriggers)
      ? item.newsTriggers.map((n) => ({
          tag: n.tag || n.type || 'Policy update',
          date: n.date || n.d || '',
          what: n.what || '',
          why: n.why || n.whyItMatters || '',
          src: n.src || n.source || '',
          url: n.url || '',
        }))
      : []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addPlace = () =>
    setPlaces((prev) => [...prev, { name: '', state: '', lat: '', lon: '', note: '' }]);

  const updatePlace = (idx, field, value) =>
    setPlaces((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));

  const removePlace = (idx) =>
    setPlaces((prev) => prev.filter((_, i) => i !== idx));

  const addNews = () =>
    setNewsTriggers((prev) => [
      ...prev,
      { tag: 'Current Affairs', date: '2026', what: '', why: '', src: '', url: '' },
    ]);

  const updateNews = (idx, field, value) =>
    setNewsTriggers((prev) => prev.map((n, i) => (i === idx ? { ...n, [field]: value } : n)));

  const removeNews = (idx) =>
    setNewsTriggers((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Species title is required.');
      return;
    }

    setSaving(true);
    setError('');

    const finalSlug = (
      slug.trim() ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    ).trim();

    const cleanPlaces = places
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        state: p.state.trim(),
        ...(p.lat !== '' && Number.isFinite(Number(p.lat)) ? { lat: Number(p.lat) } : {}),
        ...(p.lon !== '' && Number.isFinite(Number(p.lon)) ? { lon: Number(p.lon) } : {}),
        ...(p.note.trim() ? { note: p.note.trim() } : {}),
      }));

    const cleanNews = newsTriggers
      .filter((n) => n.what.trim() && n.src.trim())
      .map((n) => ({
        tag: n.tag.trim() || 'Update',
        date: n.date.trim() || '2026',
        what: n.what.trim(),
        why: n.why.trim(),
        src: n.src.trim(),
        ...(n.url.trim() ? { url: n.url.trim() } : {}),
      }));

    const traps = fromLines(trapsText);
    const facts = fromLines(factsText);
    const idmarks = fromLines(idmarksText);
    const similarPYQ = fromLines(pyqsText);
    const states = statesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const credit =
      creditArtist.trim() || creditLic.trim() || creditPage.trim()
        ? {
            artist: creditArtist.trim(),
            lic: creditLic.trim(),
            page: creditPage.trim() || '#',
          }
        : null;

    const payload = {
      slug: finalSlug,
      module: item.module || 'SPECIES',
      category,
      title: title.trim(),
      subtitle: subtitle.trim(),
      oneline: oneline.trim(),
      headlineStat: headlineStat.trim() || null,
      isStarter,
      startWith: isStarter,
      sortOrder: Number(sortOrder) || 100,
      statusBadges: {
        ...(item.statusBadges || {}),
        iucn,
        wpa,
        cites,
      },
      imageUrl: imageUrl.trim() || null,
      wikiTitle: wikiTitle.trim() || title.trim().replace(/\s+/g, '_'),
      credit,
      imageCredit: credit,
      traps,
      confusionTrap: traps[0] || null,
      facts,
      rememberBullets: facts,
      idmarks,
      behaviour: behaviour.trim() || null,
      similarPYQ,
      states,
      networkKey: networkKey.trim() || null,
      places: cleanPlaces,
      newsTriggers: cleanNews,
    };

    try {
      const res = await fetch('/api/admin/env-atlas/item', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save species');
        setSaving(false);
        return;
      }
      onSaved(data.item, isNew);
    } catch (err) {
      setError(err.message || 'Network error while saving');
      setSaving(false);
    }
  };

  return (
    <div className="env-editor-backdrop" onClick={onClose}>
      <div
        className="env-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add New Species' : `Edit ${item.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="env-editor-header">
          <div>
            <h3>{isNew ? 'Add New Species' : `Edit: ${item.title}`}</h3>
            <p className="env-editor-sub">
              Changes save to PostgreSQL and appear live in Species Atlas.
            </p>
          </div>
          <button type="button" className="env-editor-close" onClick={onClose} aria-label="Close editor">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="env-editor-form">
          {error && <div className="env-editor-error">{error}</div>}

          <fieldset className="env-editor-section">
            <legend>Identity &amp; Ordering</legend>
            <div className="env-editor-grid-2">
              <label>
                <span>Common Name *</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label>
                <span>Slug {isNew ? '(auto if blank)' : '(locked)'}</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={!isNew}
                  placeholder="e.g. snow-leopard"
                />
              </label>
              <label>
                <span>Scientific Name</span>
                <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Panthera uncia" />
              </label>
              <label>
                <span>Group / Category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Headline Stat (optional)</span>
                <input
                  value={headlineStat}
                  onChange={(e) => setHeadlineStat(e.target.value)}
                  placeholder="e.g. ~3,682 in India (2022)"
                />
              </label>
              <div className="env-editor-inline-row">
                <label className="env-editor-check">
                  <input
                    type="checkbox"
                    checked={isStarter}
                    onChange={(e) => setIsStarter(e.target.checked)}
                  />
                  <span>Start with these (featured)</span>
                </label>
                <label style={{ flex: 1 }}>
                  <span>Sort Order</span>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                </label>
              </div>
            </div>
            <label>
              <span>One-line Summary</span>
              <textarea rows={2} value={oneline} onChange={(e) => setOneline(e.target.value)} />
            </label>
          </fieldset>

          <fieldset className="env-editor-section">
            <legend>Protection &amp; Legal Status</legend>
            <div className="env-editor-grid-3">
              <label>
                <span>IUCN Red List</span>
                <select value={iucn} onChange={(e) => setIucn(e.target.value)}>
                  {IUCN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>WPA 1972</span>
                <select value={wpa} onChange={(e) => setWpa(e.target.value)}>
                  {WPA_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>CITES</span>
                <select value={cites} onChange={(e) => setCites(e.target.value)}>
                  {CITES_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset className="env-editor-section">
            <legend>Photo &amp; Credit Gate (author + licence required to show photo)</legend>
            <div className="env-editor-grid-2">
              <label>
                <span>Image URL</span>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/species/snow-leopard.webp" />
              </label>
              <label>
                <span>Wikipedia Title</span>
                <input value={wikiTitle} onChange={(e) => setWikiTitle(e.target.value)} placeholder="Snow_leopard" />
              </label>
              <label>
                <span>Photo Author</span>
                <input value={creditArtist} onChange={(e) => setCreditArtist(e.target.value)} />
              </label>
              <label>
                <span>Licence</span>
                <input value={creditLic} onChange={(e) => setCreditLic(e.target.value)} placeholder="CC BY-SA 4.0" />
              </label>
            </div>
            <label>
              <span>Source Page URL</span>
              <input value={creditPage} onChange={(e) => setCreditPage(e.target.value)} placeholder="https://commons.wikimedia.org/..." />
            </label>
          </fieldset>

          <fieldset className="env-editor-section">
            <legend>What Prelims Asks (one item per line)</legend>
            <label>
              <span>Common Prelims Traps (shown first in amber)</span>
              <textarea rows={3} value={trapsText} onChange={(e) => setTrapsText(e.target.value)} />
            </label>
            <label>
              <span>Key Prelims Facts</span>
              <textarea rows={4} value={factsText} onChange={(e) => setFactsText(e.target.value)} />
            </label>
            <label>
              <span>Field ID Marks</span>
              <textarea rows={2} value={idmarksText} onChange={(e) => setIdmarksText(e.target.value)} />
            </label>
            <label>
              <span>Ecology &amp; Behaviour</span>
              <textarea rows={2} value={behaviour} onChange={(e) => setBehaviour(e.target.value)} />
            </label>
            <label>
              <span>Past UPSC Questions (one per line)</span>
              <textarea rows={3} value={pyqsText} onChange={(e) => setPyqsText(e.target.value)} />
            </label>
          </fieldset>

          <fieldset className="env-editor-section">
            <legend>Habitat, States &amp; Map Pins</legend>
            <div className="env-editor-grid-2">
              <label>
                <span>States (comma-separated)</span>
                <input value={statesText} onChange={(e) => setStatesText(e.target.value)} placeholder="Madhya Pradesh, Karnataka, Assam" />
              </label>
              <label>
                <span>Reserve Network Key (optional)</span>
                <input value={networkKey} onChange={(e) => setNetworkKey(e.target.value)} placeholder="tiger | elephant" />
              </label>
            </div>

            <div className="env-editor-subhead">
              <span>Protected Areas / Map Pins ({places.length})</span>
              <button type="button" className="env-editor-add-btn" onClick={addPlace}>
                <Plus size={14} /> Add place
              </button>
            </div>
            {places.map((p, idx) => (
              <div key={idx} className="env-editor-place-row">
                <input placeholder="Park / Reserve name" value={p.name} onChange={(e) => updatePlace(idx, 'name', e.target.value)} />
                <input placeholder="State" value={p.state} onChange={(e) => updatePlace(idx, 'state', e.target.value)} />
                <input placeholder="Lat" type="number" step="any" value={p.lat} onChange={(e) => updatePlace(idx, 'lat', e.target.value)} />
                <input placeholder="Lon" type="number" step="any" value={p.lon} onChange={(e) => updatePlace(idx, 'lon', e.target.value)} />
                <input placeholder="Note" value={p.note} onChange={(e) => updatePlace(idx, 'note', e.target.value)} />
                <button type="button" className="env-editor-del-btn" onClick={() => removePlace(idx)} aria-label="Remove place">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </fieldset>

          <fieldset className="env-editor-section">
            <legend>In News (requires Source to appear publicly)</legend>
            <div className="env-editor-subhead">
              <span>News Triggers ({newsTriggers.length})</span>
              <button type="button" className="env-editor-add-btn" onClick={addNews}>
                <Plus size={14} /> Add news item
              </button>
            </div>
            {newsTriggers.map((n, idx) => (
              <div key={idx} className="env-editor-news-card">
                <div className="env-editor-grid-3">
                  <input placeholder="Tag (e.g. Policy)" value={n.tag} onChange={(e) => updateNews(idx, 'tag', e.target.value)} />
                  <input placeholder="Date (YYYY-MM-DD)" value={n.date} onChange={(e) => updateNews(idx, 'date', e.target.value)} />
                  <input placeholder="Source * (e.g. PIB)" value={n.src} onChange={(e) => updateNews(idx, 'src', e.target.value)} />
                </div>
                <input placeholder="What happened *" value={n.what} onChange={(e) => updateNews(idx, 'what', e.target.value)} />
                <div className="env-editor-grid-2">
                  <input placeholder="Why it matters for Prelims" value={n.why} onChange={(e) => updateNews(idx, 'why', e.target.value)} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ flex: 1 }} placeholder="Source URL" value={n.url} onChange={(e) => updateNews(idx, 'url', e.target.value)} />
                    <button type="button" className="env-editor-del-btn" onClick={() => removeNews(idx)} aria-label="Remove news">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </fieldset>

          <div className="env-editor-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={15} />
              <span>{saving ? 'Saving...' : isNew ? 'Create Species' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
