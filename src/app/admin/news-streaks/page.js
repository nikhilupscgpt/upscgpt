'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Search, 
  Layers, 
  Newspaper,
  FileText,
  Plus,
  X,
  Save,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  HelpCircle,
  Edit,
  Trash2,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

const SUBJECT_MAPPING = {
  "Polity & Governance": ["POLITY", "GOVERNANCE"],
  "History & Culture": ["ANCIENT_INDIA", "MEDIEVAL_INDIA", "MODERN_INDIA", "ART_CULTURE", "HISTORY", "CULTURE"],
  "Geography": ["GEOGRAPHY"],
  "Economy & Agriculture": ["ECONOMY", "AGRICULTURE"],
  "Environment & Ecology": ["ENVIRONMENT", "DISASTER_MANAGEMENT"],
  "Science & Technology": ["SCIENCE_TECHNOLOGY"],
  "Current Affairs & IR": ["CURRENT_AFFAIRS", "INTERNATIONAL_RELATIONS", "INTERNAL_SECURITY", "SOCIETY"],
  "Ethics": ["ETHICS"],
  "CSAT": ["CSAT"],
  "Optional": ["OPTIONAL"]
};

export default function NewsStreaksAdmin() {
  const [streaks, setStreaks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStreak, setSelectedStreak] = useState(null);
  const [synthesizing, setSynthesizing] = useState(false);

  // Syllabus expansion state
  const [expandedPapers, setExpandedPapers] = useState({ "GS3": true });
  const [expandedSubjects, setExpandedSubjects] = useState({});

  // Active articles/editorials fetched for the currently selected syllabus nodes
  const [availableArticles, setAvailableArticles] = useState([]);
  const [fetchingArticles, setFetchingArticles] = useState(false);

  // Edit / Create Form State
  const [form, setForm] = useState({
    title: '',
    title_hi: '',
    title_mr: '',
    status: 'ACTIVE',
    issueIds: [],
    articleIds: [],
    editorialIds: []
  });

  const [summaryForm, setSummaryForm] = useState({
    causes: '### Core Causes\n- Highlight core historical triggers here.',
    impact: '### Socio-Economic Impact\n- Highlight direct impacts here.',
    tracker: '### Data Tracker\n- Metric tracker: USD/INR live trend, CPI rate etc.'
  });

  // Fetch all news streaks and syllabus issues
  useEffect(() => {
    fetchStreaks();
    fetchIssues();
  }, []);

  const fetchStreaks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/news-streaks');
      const data = await res.json();
      if (data.success) {
        setStreaks(data.streaks || []);
      } else {
        toast.error(data.error || 'Failed to fetch streaks');
      }
    } catch (err) {
      toast.error('Error fetching news streaks');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/admin/issues');
      const data = await res.json();
      if (data.success) {
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  // Whenever selected issueIds change, fetch the articles/editorials belonging to them
  useEffect(() => {
    if (form.issueIds.length > 0) {
      fetchArticlesForLinkedIssues(form.issueIds);
    } else {
      setAvailableArticles([]);
    }
  }, [form.issueIds]);

  const fetchArticlesForLinkedIssues = async (ids) => {
    setFetchingArticles(true);
    try {
      let mergedItems = [];
      for (const issueId of ids) {
        const res = await fetch(`/api/admin/issues/${issueId}`);
        const data = await res.json();
        if (data.success && data.issue) {
          const articles = (data.issue.articles || []).map(a => ({ ...a, type: 'ARTICLE', issueTitle: data.issue.title }));
          const editorials = (data.issue.editorials || []).map(e => ({ ...e, type: 'EDITORIAL', issueTitle: data.issue.title }));
          mergedItems = [...mergedItems, ...articles, ...editorials];
        }
      }
      // Deduplicate items and sort by date
      const uniqueItems = Array.from(new Map(mergedItems.map(item => [item.id, item])).values())
        .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
      setAvailableArticles(uniqueItems);
    } catch (err) {
      console.error('Failed to fetch articles for issues:', err);
    } finally {
      setFetchingArticles(false);
    }
  };

  const handleEditClick = async (streak) => {
    setSelectedStreak(streak);
    try {
      const res = await fetch(`/api/admin/news-streaks/${streak.id}`);
      const data = await res.json();
      if (data.success && data.streak) {
        const fullStreak = data.streak;
        
        let causes = '### Core Causes\n- Highlight core historical triggers here.';
        let impact = '### Socio-Economic Impact\n- Highlight direct impacts here.';
        let tracker = '### Data Tracker\n- Metric tracker: USD/INR live trend, CPI rate etc.';

        if (fullStreak.livingSummary) {
          try {
            const parsed = JSON.parse(fullStreak.livingSummary);
            causes = parsed.causes || causes;
            impact = parsed.impact || impact;
            tracker = parsed.tracker || tracker;
          } catch (e) {
            causes = fullStreak.livingSummary;
          }
        }

        setForm({
          title: fullStreak.title || '',
          title_hi: fullStreak.title_hi || '',
          title_mr: fullStreak.title_mr || '',
          status: fullStreak.status || 'ACTIVE',
          issueIds: fullStreak.issues?.map(i => i.id) || [],
          articleIds: fullStreak.articles?.map(a => a.id) || [],
          editorialIds: fullStreak.editorials?.map(e => e.id) || []
        });

        setSummaryForm({ causes, impact, tracker });
      }
    } catch (err) {
      toast.error('Failed to load news streak details');
    }
  };

  const handleCreateClick = () => {
    setSelectedStreak(null);
    setForm({
      title: '',
      title_hi: '',
      title_mr: '',
      status: 'ACTIVE',
      issueIds: [],
      articleIds: [],
      editorialIds: []
    });
    setSummaryForm({
      causes: '### Core Causes\n- Highlight core historical triggers here.',
      impact: '### Socio-Economic Impact\n- Highlight direct impacts here.',
      tracker: '### Data Tracker\n- Metric tracker: USD/INR live trend, CPI rate etc.'
    });
    setAvailableArticles([]);
  };

  const handleAISynthesize = async () => {
    if (!selectedStreak) {
      toast.error('Please select an existing News Streak first to synthesize its summary.');
      return;
    }
    
    setSynthesizing(true);
    const toastId = toast.loading('Gemini is analyzing connected articles and synthesizing living summary...');
    try {
      const res = await fetch('/api/admin/news-engine/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'STREAK_REBUILD', streakId: selectedStreak.id })
      });
      const data = await res.json();
      if (data.success && data.livingSummary) {
        toast.success('Living summary synthesized successfully!', { id: toastId });
        try {
          const parsed = JSON.parse(data.livingSummary);
          setSummaryForm({
            causes: parsed.causes || '',
            impact: parsed.impact || '',
            tracker: parsed.tracker || ''
          });
        } catch (e) {
          setSummaryForm(prev => ({ ...prev, causes: data.livingSummary }));
        }
        fetchStreaks();
      } else {
        toast.error(data.error || 'Failed to synthesize summary', { id: toastId });
      }
    } catch (err) {
      toast.error('Error connecting to synthesis server', { id: toastId });
    } finally {
      setSynthesizing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Saving news streak...');

    // Format livingSummary back to JSON string
    const livingSummaryJson = JSON.stringify({
      causes: summaryForm.causes,
      impact: summaryForm.impact,
      tracker: summaryForm.tracker
    });

    const payload = {
      ...form,
      livingSummary: livingSummaryJson
    };

    try {
      const url = selectedStreak 
        ? `/api/admin/news-streaks/${selectedStreak.id}` 
        : '/api/admin/news-streaks';
      const method = selectedStreak ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(selectedStreak ? 'Streak updated!' : 'Streak created!', { id: toastId });
        handleCreateClick();
        fetchStreaks();
      } else {
        toast.error(data.error || 'Failed to save news streak', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error during save', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this News Streak? Articles/editorials linked to it will be unlinked.')) return;
    
    const toastId = toast.loading('Deleting news streak...');
    try {
      const res = await fetch(`/api/admin/news-streaks/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('News Streak deleted!', { id: toastId });
        fetchStreaks();
        handleCreateClick();
      } else {
        toast.error(data.error || 'Delete failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error during delete', { id: toastId });
    }
  };

  const toggleIssueLink = (issueId) => {
    setForm(prev => {
      const current = prev.issueIds;
      if (current.includes(issueId)) {
        return { 
          ...prev, 
          issueIds: current.filter(id => id !== issueId),
          // Clear articles/editorials belonging to unlinked issues
          articleIds: prev.articleIds.filter(artId => {
            const art = availableArticles.find(a => a.id === artId);
            return art && art.issueId !== issueId;
          }),
          editorialIds: prev.editorialIds.filter(edId => {
            const ed = availableArticles.find(e => e.id === edId);
            return ed && ed.issueId !== issueId;
          })
        };
      } else {
        return { ...prev, issueIds: [...current, issueId] };
      }
    });
  };

  const toggleArticleLink = (id, type) => {
    setForm(prev => {
      if (type === 'ARTICLE') {
        const current = prev.articleIds;
        const newIds = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        return { ...prev, articleIds: newIds };
      } else {
        const current = prev.editorialIds;
        const newIds = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        return { ...prev, editorialIds: newIds };
      }
    });
  };

  // Categorize nodes for collapsible tree
  const getCategorizedNodes = () => {
    const papers = {
      "GS1": { title: "GS Paper 1", subjects: {}, unmapped: [] },
      "GS2": { title: "GS Paper 2", subjects: {}, unmapped: [] },
      "GS3": { title: "GS Paper 3", subjects: {}, unmapped: [] },
      "GS4": { title: "GS Paper 4", subjects: {}, unmapped: [] },
      "OPTIONAL": { title: "Optional Subjects", subjects: {}, unmapped: [] },
      "OTHER": { title: "Other / CSAT", subjects: {}, unmapped: [] }
    };

    issues.forEach(node => {
      let paperKey = "OTHER";
      if (node.gsPapers && node.gsPapers.length > 0) {
        const primary = node.gsPapers[0].toUpperCase();
        if (papers[primary]) paperKey = primary;
      } else if (node.category === "OPTIONAL") {
        paperKey = "OPTIONAL";
      }

      let subjectName = null;
      for (const [sub, categories] of Object.entries(SUBJECT_MAPPING)) {
        if (categories.includes(node.category)) {
          subjectName = sub;
          break;
        }
      }

      if (subjectName) {
        if (!papers[paperKey].subjects[subjectName]) {
          papers[paperKey].subjects[subjectName] = [];
        }
        papers[paperKey].subjects[subjectName].push(node);
      } else {
        papers[paperKey].unmapped.push(node);
      }
    });

    return papers;
  };

  const togglePaperExpanded = (paper) => {
    setExpandedPapers(prev => ({ ...prev, [paper]: !prev[paper] }));
  };

  const toggleSubjectExpanded = (subKey) => {
    setExpandedSubjects(prev => ({ ...prev, [subKey]: !prev[subKey] }));
  };

  const filteredStreaks = streaks.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorized = getCategorizedNodes();

  return (
    <div className="admin-streaks-container">
      <Toaster position="top-right" />
      
      {/* Top Header */}
      <header className="admin-streaks-header">
        <div className="header-left">
          <Link href="/admin" className="back-link">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h2>News Streaks Control Board</h2>
        </div>
        <button className="create-btn" onClick={handleCreateClick}>
          <Plus size={16} /> New News Streak
        </button>
      </header>

      {/* Main Grid Workspace */}
      <div className="admin-streaks-workspace">
        
        {/* Left column: List of News Streaks */}
        <aside className="streaks-list-panel">
          <div className="search-box-row">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search news streaks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="streaks-list-scroll hide-scrollbar">
            {loading ? (
              <div className="status-placeholder">Loading streaks...</div>
            ) : filteredStreaks.length > 0 ? (
              filteredStreaks.map(streak => {
                const isSelected = selectedStreak?.id === streak.id;
                const articlesCount = streak._count?.articles || 0;
                const editorialsCount = streak._count?.editorials || 0;

                return (
                  <div 
                    key={streak.id} 
                    className={`streak-admin-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleEditClick(streak)}
                  >
                    <div className="card-top">
                      <span className="card-status">{streak.status}</span>
                      <span className="card-updates">{articlesCount + editorialsCount} updates</span>
                    </div>
                    <div className="card-title">{streak.title}</div>
                    <div className="card-actions">
                      <button className="card-action-btn edit">
                        <Edit size={12} /> Edit
                      </button>
                      <button 
                        className="card-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(streak.id);
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="status-placeholder">No news streaks found.</div>
            )}
          </div>
        </aside>

        {/* Right column: Form and Details */}
        <main className="streak-editor-panel">
          <div className="editor-card">
            <h3>{selectedStreak ? `Edit Streak: ${selectedStreak.title}` : 'Create New News Streak'}</h3>
            
            <form onSubmit={handleSave} className="streak-admin-form">
              
              {/* STREAK IDENTITY DETAILS */}
              <div className="form-group">
                <label>Streak Title (English) *</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Depreciation of the Indian Rupee"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Title (Hindi)</label>
                  <input 
                    type="text" 
                    value={form.title_hi || ''} 
                    onChange={e => setForm(prev => ({ ...prev, title_hi: e.target.value }))}
                    placeholder="e.g. भारतीय रुपये का अवमूल्यन"
                  />
                </div>
                <div className="form-group">
                  <label>Title (Marathi)</label>
                  <input 
                    type="text" 
                    value={form.title_mr || ''} 
                    onChange={e => setForm(prev => ({ ...prev, title_mr: e.target.value }))}
                    placeholder="e.g. भारतीय रुपयाचे अवमूल्यन"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="URGENT">URGENT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* 1. SYLLABUS NODE SECTION (SHIFTED UPWARDS & CLASSIFIED) */}
              <div className="form-group section-divider-box">
                <label className="section-label">Link Syllabus Core Nodes (Issues)</label>
                <span className="helper-text">Classify and select mapped GS paper issues below to connect them to this streak:</span>
                
                <div className="syllabus-classifier-tree hide-scrollbar">
                  {Object.entries(categorized).map(([paperKey, paperData]) => {
                    const isExpanded = !!expandedPapers[paperKey];
                    const paperCount = Object.values(paperData.subjects).reduce((acc, curr) => acc + curr.length, 0) + paperData.unmapped.length;
                    if (paperCount === 0) return null;

                    return (
                      <div key={paperKey} className="paper-node-block">
                        <div className="tree-header paper" onClick={() => togglePaperExpanded(paperKey)}>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <Folder size={14} className="node-folder-icon" />
                          <span>{paperData.title} ({paperCount})</span>
                        </div>

                        {isExpanded && (
                          <div className="tree-children-wrapper">
                            {/* Subjects */}
                            {Object.entries(paperData.subjects).map(([subjectName, subjectNodes]) => {
                              const subKey = `${paperKey}_${subjectName}`;
                              const isSubExpanded = !!expandedSubjects[subKey];

                              return (
                                <div key={subjectName} className="subject-node-block">
                                  <div className="tree-header subject" onClick={() => toggleSubjectExpanded(subKey)}>
                                    {isSubExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    <FolderOpen size={12} className="node-folder-icon sub" />
                                    <span>{subjectName} ({subjectNodes.length})</span>
                                  </div>

                                  {isSubExpanded && (
                                    <div className="tree-leafs-wrapper">
                                      {subjectNodes.map(node => {
                                        const isLinked = form.issueIds.includes(node.id);
                                        return (
                                          <div 
                                            key={node.id} 
                                            className={`leaf-node-pill ${isLinked ? 'active' : ''}`}
                                            onClick={() => toggleIssueLink(node.id)}
                                          >
                                            <span className="pill-dot"></span>
                                            <span>{node.title}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Unmapped paper nodes */}
                            {paperData.unmapped.map(node => {
                              const isLinked = form.issueIds.includes(node.id);
                              return (
                                <div 
                                  key={node.id} 
                                  className={`leaf-node-pill ${isLinked ? 'active' : ''}`}
                                  onClick={() => toggleIssueLink(node.id)}
                                  style={{ marginLeft: '24px' }}
                                >
                                  <span className="pill-dot"></span>
                                  <span>{node.title}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3 & 4. ARTICLES ATTACHMENT FROM LINKED CORE SYLLABUS NODES */}
              <div className="form-group section-divider-box">
                <label className="section-label">Select Articles/Editorials to Add to Streak</label>
                <span className="helper-text">Select updates linked to the above syllabus nodes to include in the timeline lineage:</span>
                
                <div className="articles-attachment-wrapper">
                  {fetchingArticles ? (
                    <div className="fetching-placeholder">Loading available updates from linked nodes...</div>
                  ) : availableArticles.length > 0 ? (
                    <div className="articles-checklist-scroll hide-scrollbar">
                      {availableArticles.map(item => {
                        const isChecked = item.type === 'ARTICLE' 
                          ? form.articleIds.includes(item.id)
                          : form.editorialIds.includes(item.id);

                        return (
                          <div 
                            key={item.id}
                            className={`article-checklist-row ${isChecked ? 'selected' : ''}`}
                            onClick={() => toggleArticleLink(item.id, item.type)}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              readOnly
                            />
                            <div className="row-details">
                              <div className="row-meta">
                                <span className={`type-badge ${item.type.toLowerCase()}`}>{item.type}</span>
                                <span className="source-meta">{item.source || 'PIB'} • {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span>
                                <span className="syllabus-node-tag">📍 {item.issueTitle}</span>
                              </div>
                              <div className="row-title">{item.title}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="fetching-placeholder text-muted">Select syllabus core nodes above to view and attach related briefings.</div>
                  )}
                </div>
              </div>

              {/* 5. SUMMARY SECTION DESIGN (causes, impact, tracker) */}
              <div className="form-group section-divider-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="section-label" style={{ margin: 0 }}>Evolving Synthesis Canvas (Living Summary)</label>
                  {selectedStreak && (
                    <button 
                      type="button" 
                      onClick={handleAISynthesize}
                      disabled={synthesizing}
                      className="ai-synthesize-btn"
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(6, 182, 212, 0.2)',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {synthesizing ? '✨ Synthesizing...' : '✨ Auto-Synthesize via Gemini AI'}
                    </button>
                  )}
                </div>
                <span className="helper-text">
                  The Living Summary represents the macro-level consolidated synthesis shown at the top of the frontend streaks view. It is structured into three contextual tabs: Core Causes, Impact Matrix, and Data Tracker.
                </span>

                <div className="summary-tab-editor-grid">
                  <div className="summary-editor-card causes">
                    <div className="editor-title causes">Core Causes (Markdown)</div>
                    <textarea 
                      rows={6}
                      value={summaryForm.causes}
                      onChange={e => setSummaryForm(prev => ({ ...prev, causes: e.target.value }))}
                      placeholder="Identify underlying structural triggers, background context..."
                    />
                  </div>

                  <div className="summary-editor-card impact">
                    <div className="editor-title impact">Impact Matrix (Markdown)</div>
                    <textarea 
                      rows={6}
                      value={summaryForm.impact}
                      onChange={e => setSummaryForm(prev => ({ ...prev, impact: e.target.value }))}
                      placeholder="Identify socio-economic consequences, implications..."
                    />
                  </div>

                  <div className="summary-editor-card tracker">
                    <div className="editor-title tracker">Data Tracker (Markdown)</div>
                    <textarea 
                      rows={6}
                      value={summaryForm.tracker}
                      onChange={e => setSummaryForm(prev => ({ ...prev, tracker: e.target.value }))}
                      placeholder="Insert tables, metrics, stats, historical exchange rate lists..."
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions-row">
                <button type="button" className="cancel-btn" onClick={handleCreateClick}>
                  Clear Form
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  <Save size={14} /> Save News Streak
                </button>
              </div>
            </form>
          </div>
        </main>

      </div>

      <style jsx>{`
        .admin-streaks-container {
          min-height: 100vh;
          background: #020617;
          color: white;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .admin-streaks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: #0b1129;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #64748b;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 700;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #3b82f6;
        }

        .admin-streaks-header h2 {
          font-size: 1.2rem;
          font-weight: 900;
          margin: 0;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #06b6d4;
          color: #0f172a;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1rem;
          font-family: inherit;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .create-btn:hover {
          background: #0891b2;
        }

        .admin-streaks-workspace {
          display: flex;
          flex: 1;
          height: calc(100vh - 80px);
          overflow: hidden;
        }

        .streaks-list-panel {
          width: 25%;
          min-width: 300px;
          max-width: 360px;
          background: #060913;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
        }

        .search-box-row {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 11px;
          color: #64748b;
        }

        .search-box-row input {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 0.55rem 0.75rem 0.55rem 2.25rem;
          color: white;
          font-family: inherit;
          font-size: 0.8rem;
        }

        .streaks-list-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .streak-admin-card {
          background: rgba(15,23,42,0.4);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 10px;
          padding: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .streak-admin-card:hover {
          background: rgba(15,23,42,0.7);
          border-color: rgba(6,182,212,0.2);
        }

        .streak-admin-card.active {
          background: rgba(6,182,212,0.05);
          border-color: rgba(6,182,212,0.25);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
        }

        .card-status {
          font-size: 0.55rem;
          font-weight: 900;
          color: #06b6d4;
          background: rgba(6,182,212,0.1);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .card-updates {
          font-size: 0.6rem;
          color: #64748b;
          font-weight: 700;
        }

        .card-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #e2e8f0;
          margin-bottom: 0.6rem;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .card-action-btn {
          font-size: 0.62rem;
          font-weight: 800;
          font-family: inherit;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          border: none;
        }

        .card-action-btn.edit {
          background: rgba(255,255,255,0.05);
          color: #cbd5e1;
        }

        .card-action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        .status-placeholder {
          text-align: center;
          padding: 2rem;
          color: #475569;
          font-style: italic;
          font-size: 0.8rem;
        }

        .streak-editor-panel {
          flex: 1;
          padding: 1.5rem 2rem;
          overflow-y: auto;
          background: #02050f;
        }

        .editor-card {
          background: #060913;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 1.5rem 2rem;
        }

        .editor-card h3 {
          font-size: 1rem;
          font-weight: 900;
          margin: 0 0 1.25rem 0;
          color: #06b6d4;
        }

        .streak-admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .section-divider-box {
          border-top: 1px solid rgba(255,255,255,0.04);
          padding-top: 1.25rem;
          margin-top: 0.5rem;
        }

        .section-label {
          font-size: 0.85rem !important;
          color: #06b6d4 !important;
          font-weight: 900 !important;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .helper-text {
          font-size: 0.65rem;
          color: #475569;
          margin-top: -2px;
          margin-bottom: 8px;
        }

        .form-group input, .form-group select {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          color: white;
          font-family: inherit;
          font-size: 0.8rem;
        }

        /* Classified Syllabus Classifier Tree styling */
        .syllabus-classifier-tree {
          max-height: 250px;
          overflow-y: auto;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px;
        }

        .tree-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 800;
          color: #cbd5e1;
          border-radius: 6px;
          user-select: none;
          transition: background 0.2s;
        }

        .tree-header:hover {
          background: rgba(255,255,255,0.02);
        }

        .tree-header.paper {
          font-size: 0.8rem;
          color: #f8fafc;
          font-weight: 900;
        }

        .node-folder-icon {
          color: #64748b;
        }

        .node-folder-icon.sub {
          color: #06b6d4;
        }

        .tree-children-wrapper {
          padding-left: 18px;
          margin-top: 2px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tree-leafs-wrapper {
          padding-left: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 4px 0 8px 0;
        }

        .leaf-node-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          color: #94a3b8;
        }

        .leaf-node-pill:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
          color: white;
        }

        .leaf-node-pill.active {
          background: rgba(6,182,212,0.1);
          border-color: rgba(6,182,212,0.35);
          color: #06b6d4;
        }

        .pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
        }

        .leaf-node-pill.active .pill-dot {
          background: #06b6d4;
          box-shadow: 0 0 6px #06b6d4;
        }

        /* Articles Checklist Grid */
        .articles-attachment-wrapper {
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px;
        }

        .fetching-placeholder {
          font-size: 0.72rem;
          color: #475569;
          font-style: italic;
          padding: 20px;
          text-align: center;
        }

        .articles-checklist-scroll {
          max-height: 250px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .article-checklist-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .article-checklist-row:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.05);
        }

        .article-checklist-row.selected {
          background: rgba(16, 185, 129, 0.03);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .article-checklist-row input[type="checkbox"] {
          margin-top: 4px;
          cursor: pointer;
        }

        .row-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .row-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .type-badge {
          font-size: 0.5rem;
          font-weight: 900;
          padding: 1px 4px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .type-badge.article {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .type-badge.editorial {
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        }

        .source-meta {
          font-size: 0.6rem;
          color: #64748b;
          font-weight: 700;
        }

        .syllabus-node-tag {
          font-size: 0.6rem;
          color: #f59e0b;
          font-weight: 800;
          background: rgba(245, 158, 11, 0.05);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .row-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #cbd5e1;
          line-height: 1.35;
        }

        .article-checklist-row.selected .row-title {
          color: white;
        }

        /* Living Summary Tab Editors */
        .summary-tab-editor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .summary-editor-card {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .editor-title {
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .editor-title.causes { color: #06b6d4; }
        .editor-title.impact { color: #10b981; }
        .editor-title.tracker { color: #f59e0b; }

        .summary-editor-card textarea {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 8px 12px;
          color: #cbd5e1;
          font-family: inherit;
          font-size: 0.78rem;
          line-height: 1.45;
          resize: vertical;
        }

        .form-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .cancel-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8;
          border-radius: 8px;
          padding: 0.6rem 1.25rem;
          font-family: inherit;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: rgba(255,255,255,0.02);
          color: white;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.25rem;
          font-family: inherit;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .save-btn:hover {
          background: #059669;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
