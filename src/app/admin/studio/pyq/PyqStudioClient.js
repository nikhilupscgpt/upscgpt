'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Play,
  Image as ImageIcon,
  ExternalLink,
  X,
  Edit3,
  Video,
  ArrowUp,
  ArrowDown,
  Save,
  FolderOpen,
} from 'lucide-react';
import StemView from '@/app/prelims/pyq/StemView';
import {
  PageHeader,
  CollapsibleRail,
  FilterBar,
  MetaLine,
  StatusBadge,
  RowActions,
} from '@/components/pyq-studio';
import { moveArrayItem, computeSectionSummary } from '@/lib/pyq/deck-helpers';
import './pyq-studio.css';

const TRAY_STORAGE_KEY = 'pyq_studio_deck_tray_v1';

export default function PyqStudioClient({ initialFilterOptions, userRole = 'FACULTY' }) {
  const filterOptions = initialFilterOptions || {
    subjects: [],
    years: [],
    exams: [],
    topicGroups: {},
  };

  // ==========================================
  // Comprehensive Filters (Matching Admin & Frontend)
  // ==========================================
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('syllabus'); // 'syllabus' | 'exam'
  const [exam, setExam] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [pattern, setPattern] = useState('ALL'); // 'ALL' | 'NEW' | 'PAIR' | 'STATEMENT'
  const [answerStatus, setAnswerStatus] = useState('ALL'); // 'ALL' | 'HAS_ANSWER' | 'MISSING_ANSWER' | 'HAS_EXPL' | 'MISSING_EXPL'
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [railCollapsed, setRailCollapsed] = useState(true);
  const [urlHydrated, setUrlHydrated] = useState(false);

  // Hydrate filter state from URL query params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('search')) setSearch(sp.get('search'));
    if (sp.get('subject')) setSubject(sp.get('subject'));
    if (sp.get('topic')) setTopic(sp.get('topic'));
    if (sp.get('sort')) setSortOrder(sp.get('sort'));
    if (sp.get('exam')) setExam(sp.get('exam'));
    if (sp.get('year')) setYear(sp.get('year'));
    if (sp.get('pattern')) setPattern(sp.get('pattern'));
    if (sp.get('status')) setAnswerStatus(sp.get('status'));
    const lim = Number(sp.get('limit'));
    if ([25, 50, 100].includes(lim)) setLimit(lim);
    const pg = Number(sp.get('page'));
    if (pg >= 1) setPage(pg);
    setUrlHydrated(true);
  }, []);

  // Sync filter state to URL query params
  useEffect(() => {
    if (!urlHydrated || typeof window === 'undefined') return;
    const sp = new URLSearchParams();
    sp.set('view', 'list');
    if (search.trim()) sp.set('search', search.trim());
    if (subject !== 'ALL') sp.set('subject', subject);
    if (topic !== 'ALL') sp.set('topic', topic);
    if (sortOrder !== 'syllabus') sp.set('sort', sortOrder);
    if (exam !== 'ALL') sp.set('exam', exam);
    if (year !== 'ALL') sp.set('year', year);
    if (pattern !== 'ALL') sp.set('pattern', pattern);
    if (answerStatus !== 'ALL') sp.set('status', answerStatus);
    if (limit !== 25) sp.set('limit', String(limit));
    if (page > 1) sp.set('page', String(page));
    const qs = sp.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', nextUrl);
  }, [urlHydrated, search, subject, topic, sortOrder, exam, year, pattern, answerStatus, limit, page]);

  const resetAllFilters = useCallback(() => {
    setSearch('');
    setSubject('ALL');
    setTopic('ALL');
    setExam('ALL');
    setYear('ALL');
    setPattern('ALL');
    setAnswerStatus('ALL');
    setSortOrder('syllabus');
    setPage(1);
  }, []);

  // Data state
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [apiFilterOptions, setApiFilterOptions] = useState(null);
  const [cdsExtraCount, setCdsExtraCount] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Persistent Deck Tray state (survives pages, filters, reload)
  const [selectedIds, setSelectedIds] = useState([]);
  const [trayMeta, setTrayMeta] = useState({});
  const [trayHydrated, setTrayHydrated] = useState(false);

  // Deck Save & Browse Modal state
  const [saveDeckOpen, setSaveDeckOpen] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckShared, setDeckShared] = useState(false);
  const [deckSaving, setDeckSaving] = useState(false);
  const [decksModalScope, setDecksModalScope] = useState(null); // null | 'mine' | 'shared'
  const [savedDecks, setSavedDecks] = useState({ myDecks: [], sharedDecks: [] });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(TRAY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.ids)) setSelectedIds(parsed.ids);
        if (parsed.meta && typeof parsed.meta === 'object') setTrayMeta(parsed.meta);
        if (Array.isArray(parsed.ids) && parsed.ids.length > 0) {
          setRailCollapsed(false);
        }
      }
    } catch {
      // ignore
    }
    setTrayHydrated(true);
  }, []);

  useEffect(() => {
    if (!trayHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        TRAY_STORAGE_KEY,
        JSON.stringify({ ids: selectedIds, meta: trayMeta }),
      );
    } catch {
      // ignore
    }
  }, [trayHydrated, selectedIds, trayMeta]);

  // customAttachments: { [questionId]: { imageUrl: string, caption: string } }
  const [customAttachments, setCustomAttachments] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('pq_studio_attachments');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  // Modal for attaching map / diagram to a question
  const [activeAttachQ, setActiveAttachQ] = useState(null);
  const [attachUrl, setAttachUrl] = useState('');
  const [attachCaption, setAttachCaption] = useState('');

  // -------------------------------------------------------------
  // Dynamic Topic List based on Selected Subject (Defensive against arrays/objects)
  // -------------------------------------------------------------
  const currentTopicGroups = useMemo(() => {
    // 1. If API returned topicGroups for the active subject, use them
    if (apiFilterOptions?.topicGroups && Array.isArray(apiFilterOptions.topicGroups) && apiFilterOptions.topicGroups.length > 0) {
      return apiFilterOptions.topicGroups.map(g => ({
        label: g.label || 'Topics',
        topics: Array.isArray(g.topics) ? g.topics : [],
      }));
    }

    // 2. Otherwise derive from initialFilterOptions.topicGroups[subject]
    if (subject !== 'ALL' && filterOptions?.topicGroups) {
      const raw = filterOptions.topicGroups[subject];
      if (Array.isArray(raw)) {
        return raw.map(g => {
          if (Array.isArray(g)) {
            return {
              label: g[0] || 'Topics',
              topics: Array.isArray(g[1]) ? g[1] : [],
            };
          }
          return {
            label: g?.label || 'Topics',
            topics: Array.isArray(g?.topics) ? g.topics : [],
          };
        });
      }
    }

    return [];
  }, [apiFilterOptions, subject, filterOptions.topicGroups]);

  // -------------------------------------------------------------
  // Fetch Questions from backend API
  // -------------------------------------------------------------
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sort', sortOrder);

      if (search.trim()) params.set('q', search.trim());
      if (subject !== 'ALL') params.set('subject', subject);
      if (topic !== 'ALL') params.set('topic', topic);
      if (exam !== 'ALL') params.set('exam', exam);
      if (year !== 'ALL') params.set('year', year);
      if (pattern !== 'ALL') params.set('pattern', pattern);
      if (answerStatus !== 'ALL') params.set('answerStatus', answerStatus);

      const res = await fetch(`/api/admin/pyq?${params.toString()}`);
      const data = await res.json();

      if (data?.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setTotal(data.total || data.questions.length);
        setTotalPages(data.totalPages || 1);
      }
      if (data?.filterOptions) {
        setApiFilterOptions(data.filterOptions);
      }
    } catch (e) {
      console.error('[PYQ Studio] Failed to fetch questions:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortOrder, search, subject, topic, exam, year, pattern, answerStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  // Fetch live CDS extra count for current section
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/pyq/tree?exam=CDS');
        if (!res.ok || !active) return;
        const data = await res.json();
        if (!active) return;
        if (subject === 'ALL') {
          setCdsExtraCount(data?.totals?.total || 0);
        } else {
          const sNode = (data?.subjects || []).find((s) => s.name === subject);
          if (!sNode) {
            setCdsExtraCount(0);
          } else if (topic === 'ALL') {
            setCdsExtraCount(sNode.total || 0);
          } else {
            const tNode = (sNode.topics || []).find((t) => t.name === topic);
            setCdsExtraCount(tNode?.total || 0);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => { active = false; };
  }, [subject, topic]);

  const recordSectionHref = useMemo(() => {
    const sp = new URLSearchParams();
    if (subject !== 'ALL') sp.set('subject', subject);
    if (topic !== 'ALL') sp.set('topic', topic);
    if (exam === 'ALL' || exam === 'CDS') sp.set('includeCds', '1');
    const qs = sp.toString();
    return qs ? `/admin/studio/pyq/record?${qs}` : '/admin/studio/pyq/record';
  }, [subject, topic, exam]);

  // -------------------------------------------------------------
  // Selection & Deck Tray Handlers
  // -------------------------------------------------------------
  const captureTrayMeta = useCallback((qList) => {
    setTrayMeta((prev) => {
      const next = { ...prev };
      for (const q of qList) {
        if (!q?.id) continue;
        next[q.id] = {
          id: q.id,
          label: `${q.examName || 'UPSC CSE'} ${q.examYear || ''} ${q.questionNo ? `Q${q.questionNo}` : ''}`.trim(),
          topic: q.srcTopic || q.srcSubject || '',
          stemPreview: String(q.stem || '').replace(/\s+/g, ' ').slice(0, 72),
        };
      }
      return next;
    });
  }, []);

  const toggleSelect = useCallback((id) => {
    const found = questions.find((q) => q.id === id);
    if (found) captureTrayMeta([found]);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, [questions, captureTrayMeta]);

  const handleSelectAllOnPage = () => {
    captureTrayMeta(questions);
    const pageIds = questions.map((q) => q.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleMoveTrayItem = (idx, dir) => {
    setSelectedIds((prev) => moveArrayItem(prev, idx, idx + dir));
  };

  const handleSaveDeck = async (e) => {
    e.preventDefault();
    if (!deckTitle.trim() || selectedIds.length === 0) return;
    setDeckSaving(true);
    try {
      const sectionPath =
        subject !== 'ALL' && topic !== 'ALL'
          ? `${subject} › ${topic}`
          : subject !== 'ALL'
          ? subject
          : null;
      const res = await fetch('/api/admin/pyq/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: deckTitle.trim(),
          questionIds: selectedIds,
          isShared: deckShared,
          sectionPath,
        }),
      });
      if (res.ok) {
        setDeckTitle('');
        setDeckShared(false);
        setSaveDeckOpen(false);
      }
    } finally {
      setDeckSaving(false);
    }
  };

  const openDecksModal = async (scope) => {
    setDecksModalScope(scope);
    try {
      const res = await fetch('/api/admin/pyq/decks');
      if (res.ok) {
        const data = await res.json();
        setSavedDecks({
          myDecks: data.myDecks || [],
          sharedDecks: data.sharedDecks || [],
        });
      }
    } catch {
      // ignore
    }
  };

  const handleLoadDeck = (deck) => {
    const ids = (deck.items || []).map((it) => it.questionId);
    setSelectedIds(ids);
    setRailCollapsed(false);
    setDecksModalScope(null);
  };

  const handleDeleteDeck = async (deckId) => {
    const res = await fetch(`/api/admin/pyq/decks/${encodeURIComponent(deckId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setSavedDecks((prev) => ({
        myDecks: prev.myDecks.filter((d) => d.id !== deckId),
        sharedDecks: prev.sharedDecks.filter((d) => d.id !== deckId),
      }));
    }
  };

  // Keyboard shortcuts: j (next), k (prev), x (select), p (present), r (record section)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target?.matches?.('input, textarea, select')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'j') {
        if (questions.length === 0) return;
        e.preventDefault();
        setFocusedIndex((idx) => Math.min(questions.length - 1, idx + 1));
      } else if (key === 'k') {
        if (questions.length === 0) return;
        e.preventDefault();
        setFocusedIndex((idx) => Math.max(0, idx <= 0 ? 0 : idx - 1));
      } else if (key === 'x') {
        const q = questions[focusedIndex];
        if (q) {
          e.preventDefault();
          toggleSelect(q.id);
        }
      } else if (key === 'p') {
        e.preventDefault();
        if (selectedIds.length > 0) {
          window.open(`/admin/studio/present?mode=pyq&ids=${selectedIds.join(',')}`, '_blank');
        } else if (questions[focusedIndex]) {
          window.open(`/admin/studio/present?mode=pyq&ids=${questions[focusedIndex].id}`, '_blank');
        }
      } else if (key === 'r') {
        e.preventDefault();
        window.location.href = recordSectionHref;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [questions, focusedIndex, selectedIds, toggleSelect, recordSectionHref]);

  // -------------------------------------------------------------
  // Map / Diagram Attachment Handlers
  // -------------------------------------------------------------
  const openAttachModal = (q) => {
    setActiveAttachQ(q);
    const existing = customAttachments[q.id] || {};
    setAttachUrl(q.imageUrl || existing.imageUrl || '');
    setAttachCaption(existing.caption || q.imageCaption || `${q.srcTopic || q.srcSubject} Map / Diagram`);
  };

  const handleSaveAttachment = () => {
    if (!activeAttachQ) return;
    const next = {
      ...customAttachments,
      [activeAttachQ.id]: {
        imageUrl: attachUrl.trim(),
        caption: attachCaption.trim(),
      },
    };
    setCustomAttachments(next);
    try {
      sessionStorage.setItem('pq_studio_attachments', JSON.stringify(next));
    } catch {
      // ignore
    }
    setActiveAttachQ(null);
  };

  const handleRemoveAttachment = () => {
    if (!activeAttachQ) return;
    const next = { ...customAttachments };
    delete next[activeAttachQ.id];
    setCustomAttachments(next);
    try {
      sessionStorage.setItem('pq_studio_attachments', JSON.stringify(next));
    } catch {
      // ignore
    }
    setActiveAttachQ(null);
  };

  // -------------------------------------------------------------
  // Launch Broadcast Presenter URL Builder
  // -------------------------------------------------------------
  const getLaunchUrl = (ids = selectedIds) => {
    return `/admin/studio/present?mode=pyq&ids=${ids.join(',')}`;
  };

  const handleLaunchBroadcast = (ids = selectedIds) => {
    if (ids.length === 0) return;
    window.open(getLaunchUrl(ids), '_blank');
  };

  const estRecordingTime = Math.round(selectedIds.length * 3.5);

  const flatTopics = useMemo(() => {
    const out = [];
    for (const g of currentTopicGroups) {
      for (const t of g.topics || []) {
        if (!out.includes(t)) out.push(t);
      }
    }
    return out;
  }, [currentTopicGroups]);

  const primaryFilters = [
    {
      id: 'pyq-filter-year',
      label: 'Year',
      value: year,
      onChange: (val) => { setYear(val); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Years' },
        ...filterOptions.years.map((y) => ({ value: String(y), label: String(y) })),
      ],
    },
    {
      id: 'pyq-filter-pattern',
      label: 'Format',
      value: pattern,
      onChange: (val) => { setPattern(val); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Formats' },
        { value: 'NEW', label: 'New Pattern (Pairs & Statements)' },
        { value: 'PAIR', label: 'Pair-Based Only' },
        { value: 'STATEMENT', label: 'Statement I & II Only' },
      ],
    },
    {
      id: 'pyq-filter-status',
      label: 'Status',
      value: answerStatus,
      onChange: (val) => { setAnswerStatus(val); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Status' },
        { value: 'HAS_ANSWER', label: 'Has Correct Answer' },
        { value: 'MISSING_ANSWER', label: 'Missing Answer' },
        { value: 'HAS_EXPL', label: 'Has Explanation' },
        { value: 'MISSING_EXPL', label: 'Missing Explanation' },
      ],
    },
  ];

  const moreFilters = [
    {
      id: 'pyq-filter-subject',
      label: 'Subject',
      value: subject,
      onChange: (val) => { setSubject(val); setTopic('ALL'); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Subjects' },
        ...filterOptions.subjects.map((s) => ({ value: s, label: s })),
      ],
    },
    {
      id: 'pyq-filter-topic',
      label: 'Topic',
      value: topic,
      disabled: subject === 'ALL',
      onChange: (val) => { setTopic(val); setPage(1); },
      options: [
        { value: 'ALL', label: subject === 'ALL' ? 'Select subject first' : `All Topics in ${subject}` },
        ...flatTopics.map((t) => ({ value: t, label: t })),
      ],
    },
    {
      id: 'pyq-filter-search',
      type: 'search',
      label: 'Search',
      value: search,
      placeholder: 'Keywords, stem, Q no...',
      onChange: (val) => { setSearch(val); setPage(1); },
    },
    {
      id: 'pyq-filter-exam',
      label: 'Exam',
      value: exam,
      onChange: (val) => { setExam(val); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Exams' },
        { value: 'UPSC CSE', label: 'UPSC CSE' },
        { value: 'CDS', label: 'CDS' },
      ],
    },
    {
      id: 'pyq-filter-sort',
      label: 'Sequence',
      value: sortOrder,
      onChange: (val) => { setSortOrder(val); setPage(1); },
      options: [
        { value: 'syllabus', label: 'Syllabus Sequence' },
        { value: 'exam', label: 'Exam Year (Recent First)' },
      ],
    },
    {
      id: 'pyq-filter-limit',
      label: 'Per Page',
      value: String(limit),
      onChange: (val) => { setLimit(Number(val)); setPage(1); },
      options: [
        { value: '25', label: '25 per page' },
        { value: '50', label: '50 per page' },
        { value: '100', label: '100 per page' },
      ],
    },
  ];

  const activeChips = [];
  if (subject !== 'ALL') activeChips.push({ id: 'subject', label: `Subject: ${subject}`, onRemove: () => { setSubject('ALL'); setTopic('ALL'); setPage(1); } });
  if (topic !== 'ALL') activeChips.push({ id: 'topic', label: `Topic: ${topic}`, onRemove: () => { setTopic('ALL'); setPage(1); } });
  if (search.trim()) activeChips.push({ id: 'search', label: `Search: ${search.trim()}`, onRemove: () => { setSearch(''); setPage(1); } });
  if (exam !== 'ALL') activeChips.push({ id: 'exam', label: `Exam: ${exam}`, onRemove: () => { setExam('ALL'); setPage(1); } });
  if (year !== 'ALL') activeChips.push({ id: 'year', label: `Year: ${year}`, onRemove: () => { setYear('ALL'); setPage(1); } });
  if (pattern !== 'ALL') activeChips.push({ id: 'pattern', label: `Format: ${pattern}`, onRemove: () => { setPattern('ALL'); setPage(1); } });
  if (answerStatus !== 'ALL') activeChips.push({ id: 'status', label: `Status: ${answerStatus}`, onRemove: () => { setAnswerStatus('ALL'); setPage(1); } });
  if (sortOrder !== 'syllabus') activeChips.push({ id: 'sort', label: `Sort: ${sortOrder}`, onRemove: () => { setSortOrder('syllabus'); setPage(1); } });

  const sectionSummary = useMemo(
    () => computeSectionSummary(total, questions),
    [total, questions],
  );

  const sectionBreadcrumbs = [{ label: 'Studio', href: '/admin/studio' }, { label: 'PYQ Studio', href: '/admin/studio/pyq' }];
  if (subject !== 'ALL' && topic !== 'ALL') {
    sectionBreadcrumbs.push({ label: subject, href: `/admin/studio/pyq?subject=${encodeURIComponent(subject)}` });
    sectionBreadcrumbs.push({ label: topic });
  } else if (subject !== 'ALL') {
    sectionBreadcrumbs.push({ label: subject });
  } else {
    sectionBreadcrumbs.push({ label: 'All Questions' });
  }

  const cdsIncluded = exam === 'ALL' || exam === 'CDS';

  const headerMenu = [
    {
      id: 'toggle-sort',
      label: sortOrder === 'syllabus' ? 'Order by Exam Year' : 'Order by Syllabus',
      onClick: () => { setSortOrder((s) => (s === 'syllabus' ? 'exam' : 'syllabus')); setPage(1); },
    },
    { id: 'my-decks', label: 'My decks', onClick: () => openDecksModal('mine') },
    { id: 'shared-decks', label: 'Shared decks', onClick: () => openDecksModal('shared') },
  ];
  if (userRole === 'ADMIN') {
    headerMenu.push({ id: 'open-editor', label: 'Open PYQ Editor', href: '/admin/pyq' });
  }

  return (
    <div className="pq-pyq-studio-root">
      <PageHeader
        breadcrumbs={sectionBreadcrumbs}
        secondaryActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href={recordSectionHref} className="pyq-ui-secondary-btn">
              <Video size={14} />
              <span>Record section</span>
            </Link>
            <RowActions alwaysVisible label="Section options" menuItems={headerMenu} />
          </div>
        }
        primaryAction={
          selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={() => handleLaunchBroadcast()}
              className="pyq-ui-primary-btn"
            >
              <Play size={14} fill="currentColor" />
              <span>Present ({selectedIds.length})</span>
            </button>
          ) : questions.length > 0 ? (
            <button
              type="button"
              onClick={() => handleLaunchBroadcast(questions.map((q) => q.id))}
              className="pyq-ui-primary-btn"
            >
              <Play size={14} fill="currentColor" />
              <span>Present</span>
            </button>
          ) : null
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14, fontSize: 13, color: '#94a3b8' }}>
        <span>
          <strong style={{ color: '#e2e8f0' }}>{sectionSummary.total}</strong> questions · ~{sectionSummary.estMinutes} min · {sectionSummary.needsExplanation} need explanation · {sectionSummary.broken} broken
        </span>
        {cdsExtraCount > 0 && (
          <button
            type="button"
            className={`pyq-ui-secondary-btn ${cdsIncluded ? 'is-active' : ''}`}
            style={cdsIncluded ? { borderColor: '#0284c7', color: '#38bdf8' } : undefined}
            onClick={() => {
              setExam(cdsIncluded ? 'UPSC CSE' : 'ALL');
              setPage(1);
            }}
          >
            {cdsIncluded ? `CDS included (${cdsExtraCount})` : `+ Include CDS (${cdsExtraCount} more)`}
          </button>
        )}
      </div>

      <FilterBar
        primaryFilters={primaryFilters}
        moreFilters={moreFilters}
        activeChips={activeChips}
        onClearAll={resetAllFilters}
      />

      <CollapsibleRail
        title={`Deck Tray (${selectedIds.length})`}
        collapsed={railCollapsed}
        onToggle={() => setRailCollapsed((v) => !v)}
        main={
          <main className="pq-pyq-main">
            <section className="pq-pyq-action-bar" aria-label="Selection controls">
              <div className="pq-pyq-action-left">
                <button
                  type="button"
                  onClick={handleSelectAllOnPage}
                  className="pq-pyq-btn-outline"
                >
                  {questions.length > 0 && questions.every((q) => selectedIds.includes(q.id))
                    ? 'Deselect Page'
                    : `Select Page (${questions.length})`}
                </button>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="pq-pyq-btn-clear"
                  >
                    Clear ({selectedIds.length})
                  </button>
                )}

                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>
                  {questions.length > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} of {total} questions
                  {selectedIds.length > 0 && (
                    <strong style={{ color: '#38bdf8', marginLeft: 8 }}>
                      · {selectedIds.length} queued (~{estRecordingTime} min)
                    </strong>
                  )}
                </span>
              </div>
            </section>

      {/* ========================================================= */}
      {/* QUESTION CARDS LIST                                       */}
      {/* ========================================================= */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 16 }}>
          Loading questions from database...
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 16 }}>
          No questions match current filters. Try resetting or adjusting criteria.
        </div>
      ) : (
        <div className="pq-pyq-cards-list">
          {questions.map((q, qIdx) => {
            const isSelected = selectedIds.includes(q.id);
            const isFocused = focusedIndex === qIdx;
            const hasAttachment = Boolean(customAttachments[q.id]?.imageUrl || q.imageUrl);
            const options = Array.isArray(q.options) ? q.options : [];
            const correctLabel = q.correctLabel ? String(q.correctLabel).toUpperCase() : null;

            const cardStatus =
              q.contentStatus ||
              (!correctLabel ? 'broken' : q.hasExplanation ? 'ready' : 'incomplete');
            const topicMeta = [q.srcSubject, q.srcTopic].filter(Boolean).join(' › ');
            const rowMenuItems = [
              {
                id: 'present-solo',
                label: 'Present solo',
                onClick: () => handleLaunchBroadcast([q.id]),
              },
              {
                id: 'attach-map',
                label: hasAttachment ? 'Edit attached map' : 'Attach map / diagram',
                onClick: () => openAttachModal(q),
              },
            ];
            if (userRole === 'ADMIN') {
              rowMenuItems.push({
                id: 'edit-central',
                label: 'Edit in PYQ Editor',
                href: `/admin/pyq?search=${encodeURIComponent(q.id)}`,
              });
            }

            return (
              <div
                key={q.id}
                className={`pq-pyq-card pyq-ui-card ${isSelected ? 'is-selected' : ''} ${selectedIds.length > 0 ? 'has-selection' : ''}`}
                style={isFocused ? { outline: '2px solid #38bdf8', outlineOffset: 2 } : undefined}
                onClick={() => {
                  setFocusedIndex(qIdx);
                  toggleSelect(q.id);
                }}
              >
                <div className="pq-pyq-card-head">
                  <div className="pq-pyq-card-meta">
                    <input
                      type="checkbox"
                      className="pyq-select-checkbox"
                      checked={isSelected}
                      aria-label={`Select question ${q.questionNo || q.id}`}
                      onChange={() => {}}
                      style={{ width: 17, height: 17, accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    <MetaLine
                      parts={[
                        `${q.examName || 'UPSC CSE'} ${q.examYear || ''}`.trim(),
                        q.questionNo ? `Q${q.questionNo}` : null,
                        topicMeta || null,
                      ]}
                    />
                  </div>

                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusBadge status={cardStatus} />
                    <RowActions
                      label={`Actions for Q${q.questionNo || q.id}`}
                      inlineActions={[
                        {
                          id: 'inline-map',
                          label: hasAttachment ? 'Edit Map' : 'Map',
                          icon: <ImageIcon size={14} />,
                          active: hasAttachment,
                          onClick: () => openAttachModal(q),
                        },
                        {
                          id: 'inline-present',
                          label: 'Present',
                          icon: <Play size={13} fill="currentColor" />,
                          showLabel: true,
                          onClick: () => handleLaunchBroadcast([q.id]),
                        },
                      ]}
                      menuItems={rowMenuItems}
                    />
                  </div>
                </div>

                {/* Question Stem Text (regular weight, same formatter as present mode) */}
                <div className="pq-pyq-stem-text" style={{ fontWeight: 400 }}>
                  <StemView stem={q.stem} size="sm" interactiveElimination={false} />
                </div>

                {/* Options Preview */}
                {options.length > 0 && (
                  <div className="pq-pyq-opts-row">
                    {options.map((opt) => {
                      const optLabel = String(opt.label).toUpperCase();
                      const isCorrect = correctLabel === optLabel;
                      return (
                        <div
                          key={opt.label}
                          className={`pq-pyq-opt-pill ${isCorrect ? 'is-correct' : ''}`}
                        >
                          <strong>({optLabel})</strong>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGINATION CONTROLS                                       */}
      {/* ========================================================= */}
          {totalPages > 1 && (
            <footer className="pq-pyq-pagination">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="pq-pyq-page-btn"
              >
                Previous
              </button>

              <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 400 }}>
                Page <strong style={{ color: '#ffffff' }}>{page}</strong> of <strong>{totalPages}</strong> ({total} total)
              </span>

              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="pq-pyq-page-btn"
              >
                Next
              </button>
            </footer>
          )}
        </main>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              <strong>{selectedIds.length}</strong> selected (~{estRecordingTime} min)
            </span>
            <button
              type="button"
              onClick={() => openDecksModal('mine')}
              className="pyq-ui-icon-btn"
              title="Browse saved decks"
              aria-label="Browse saved decks"
            >
              <FolderOpen size={14} />
            </button>
          </div>

          {selectedIds.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {selectedIds.map((id, idx) => {
                  const meta = trayMeta[id];
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                        padding: '6px 8px',
                        borderRadius: 8,
                        border: '1px solid rgba(148,163,184,0.16)',
                        background: 'rgba(15,23,42,0.7)',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {idx + 1}. {meta?.label || id.slice(0, 10)}
                        </div>
                        {meta?.topic && (
                          <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {meta.topic}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <button
                          type="button"
                          onClick={() => handleMoveTrayItem(idx, -1)}
                          disabled={idx === 0}
                          className="pyq-ui-chip-remove"
                          aria-label={`Move item ${idx + 1} up`}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTrayItem(idx, 1)}
                          disabled={idx === selectedIds.length - 1}
                          className="pyq-ui-chip-remove"
                          aria-label={`Move item ${idx + 1} down`}
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSelect(id)}
                          className="pyq-ui-chip-remove"
                          aria-label={`Remove item ${idx + 1}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleLaunchBroadcast()}
                className="pyq-ui-primary-btn"
                style={{ justifyContent: 'center' }}
              >
                <Play size={14} fill="currentColor" />
                <span>Present ({selectedIds.length})</span>
              </button>

              {!saveDeckOpen ? (
                <button
                  type="button"
                  onClick={() => setSaveDeckOpen(true)}
                  className="pyq-ui-secondary-btn"
                  style={{ justifyContent: 'center' }}
                >
                  <Save size={13} />
                  <span>Save as deck</span>
                </button>
              ) : (
                <form onSubmit={handleSaveDeck} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)' }}>
                  <label htmlFor="save-deck-title" className="pyq-ui-filter-label">
                    Deck title
                  </label>
                  <input
                    id="save-deck-title"
                    type="text"
                    className="pyq-ui-filter-input"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    placeholder="e.g. Polity FR Revision"
                    required
                  />
                  <label htmlFor="save-deck-shared" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      id="save-deck-shared"
                      type="checkbox"
                      checked={deckShared}
                      onChange={(e) => setDeckShared(e.target.checked)}
                    />
                    <span>Share with faculty</span>
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="submit" disabled={deckSaving} className="pyq-ui-primary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                      {deckSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setSaveDeckOpen(false)} className="pyq-ui-secondary-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <button
                type="button"
                onClick={handleClearSelection}
                className="pyq-ui-secondary-btn"
                style={{ justifyContent: 'center' }}
              >
                Clear Queue
              </button>
            </>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: 12.5 }}>
              Select questions (or press x) to add to the deck tray.
            </span>
          )}
        </div>
      </CollapsibleRail>

      {decksModalScope !== null && (
        <div className="pq-modal-overlay" onClick={() => setDecksModalScope(null)}>
          <div className="pq-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="pyq-tree-tabs" role="tablist" aria-label="Deck scope">
                <button
                  type="button"
                  role="tab"
                  aria-selected={decksModalScope === 'mine'}
                  className={`pyq-tree-tab ${decksModalScope === 'mine' ? 'is-active' : ''}`}
                  onClick={() => setDecksModalScope('mine')}
                >
                  My decks ({savedDecks.myDecks.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={decksModalScope === 'shared'}
                  className={`pyq-tree-tab ${decksModalScope === 'shared' ? 'is-active' : ''}`}
                  onClick={() => setDecksModalScope('shared')}
                >
                  Shared decks ({savedDecks.sharedDecks.length})
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDecksModalScope(null)}
                aria-label="Close decks modal"
                className="pyq-ui-icon-btn"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
              {(decksModalScope === 'mine' ? savedDecks.myDecks : savedDecks.sharedDecks).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No decks saved here yet.</p>
              ) : (
                (decksModalScope === 'mine' ? savedDecks.myDecks : savedDecks.sharedDecks).map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: 10,
                      borderRadius: 10,
                      border: '1px solid rgba(148,163,184,0.18)',
                      background: 'rgba(15,23,42,0.75)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{d.title}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {(d.items || []).length} questions {d.sectionPath ? `· ${d.sectionPath}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleLoadDeck(d)}
                        className="pyq-ui-secondary-btn"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLaunchBroadcast((d.items || []).map((it) => it.questionId))}
                        className="pyq-ui-primary-btn"
                      >
                        Present
                      </button>
                      {decksModalScope === 'mine' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDeck(d.id)}
                          className="pyq-ui-icon-btn"
                          aria-label={`Delete ${d.title}`}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ATTACH MAP / DIAGRAM MODAL                                */}
      {/* ========================================================= */}
      {activeAttachQ && (
        <div className="pq-modal-overlay" onClick={() => setActiveAttachQ(null)}>
          <div className="pq-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="pq-modal-title">
                <ImageIcon size={20} color="#38bdf8" />
                <span>Attach Map / Diagram Slide</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveAttachQ(null)}
                aria-label="Close modal"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.5 }}>
              Attach a high-resolution map, architectural photo, or schematic diagram to <strong>Q{activeAttachQ.questionNo || ''} ({activeAttachQ.examYear || ''})</strong>. This will automatically insert a dedicated Visual Explainer slide in your recording deck with XP-Pen stylus annotations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="attach-url-input" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                Image / Diagram URL
              </label>
              <input
                id="attach-url-input"
                type="url"
                placeholder="https://... (e.g. Google Cloud Storage or public image URL)"
                value={attachUrl}
                onChange={e => setAttachUrl(e.target.value)}
                className="pq-modal-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="attach-caption-input" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                Slide Caption / Figure Note
              </label>
              <input
                id="attach-caption-input"
                type="text"
                placeholder="e.g. Figure 1: Major River Basins of Peninsular India"
                value={attachCaption}
                onChange={e => setAttachCaption(e.target.value)}
                className="pq-modal-input"
              />
            </div>

            {/* Preview image if valid URL */}
            {attachUrl.trim() && (
              <div style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachUrl}
                  alt="Attachment Preview"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              {customAttachments[activeAttachQ.id]?.imageUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Remove Attachment
                </button>
              ) : <div />}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveAttachQ(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#cbd5e1',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttachment}
                  disabled={!attachUrl.trim()}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    background: '#38bdf8',
                    border: 'none',
                    color: '#032b43',
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Save &amp; Attach to Deck
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STICKY FLOATING QUEUE BAR (Appears when >= 1 selected)   */}
      {/* ========================================================= */}
      {selectedIds.length > 0 && (
        <div className="pq-pyq-floating-queue-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff' }}>
              {selectedIds.length} Questions Queued
            </span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              (~{estRecordingTime} min lecture)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleClearSelection}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handleLaunchBroadcast()}
              className="pq-pyq-launch-btn"
              style={{ padding: '10px 20px', fontSize: 14 }}
            >
              <Play size={15} fill="currentColor" />
              <span>Launch PYQ Broadcast Studio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
