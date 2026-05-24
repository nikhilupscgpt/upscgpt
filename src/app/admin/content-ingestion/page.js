'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Globe, 
  Newspaper,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Zap,
  Folder,
  FolderOpen,
  ChevronDown,
  BookOpen,
  HelpCircle,
  Edit3,
  Plus,
  X,
  Save
} from 'lucide-react';
import './admin-rag.css';

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

export default function NewsIngestionHub() {
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Collapsible sidebar state
  const [expandedPapers, setExpandedPapers] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const [newsForm, setNewsForm] = useState({
    url: '',
    title: '',
    rawContent: '',
    source: '',
    author: '',
    publishedAt: new Date().toISOString().split('T')[0],
    contentType: 'NEWS'
  });
  const [ingestType, setIngestType] = useState('ARTICLE'); // ARTICLE | EDITORIAL
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [recentIngestions, setRecentIngestions] = useState([]);
  const [nodeArticles, setNodeArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Google Doc state
  const [gdocUrl, setGdocUrl] = useState('');
  const [gdocLoading, setGdocLoading] = useState(false);

  // Questions Manager state
  const [nodeQuestions, setNodeQuestions] = useState([]);
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [selectedItemForQuestions, setSelectedItemForQuestions] = useState(null); // article or editorial
  const [qLoading, setQLoading] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    type: 'PRELIMS',
    text: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctLabel: 'a',
    explanation: '',
    difficulty: 'MEDIUM'
  });

  // Fetch all nodes for sidebar
  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    setListLoading(true);
    try {
      const res = await fetch('/api/admin/node-content?list=true');
      const data = await res.json();
      if (data.issues) {
        setNodes(data.issues);
        setFilteredNodes(data.issues);
      }
    } catch (err) {
      toast.error('Failed to load nodes list');
    } finally {
      setListLoading(false);
    }
  };

  // Search logic & folder auto-expansion
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = nodes.filter(n => 
      n.title.toLowerCase().includes(term) ||
      n.domain.toLowerCase().includes(term)
    );
    setFilteredNodes(filtered);

    if (term) {
      // Auto expand all papers
      const autoExpandPapers = {};
      ["GS1", "GS2", "GS3", "GS4", "OPTIONAL", "OTHER"].forEach(p => {
        autoExpandPapers[p] = true;
      });
      setExpandedPapers(autoExpandPapers);

      // Auto expand all subjects
      const autoExpandSubs = {};
      Object.keys(SUBJECT_MAPPING).forEach(sub => {
        ["GS1", "GS2", "GS3", "GS4", "OPTIONAL", "OTHER"].forEach(p => {
          autoExpandSubs[`${p}_${sub}`] = true;
        });
      });
      setExpandedSubjects(autoExpandSubs);
    }
  }, [searchTerm, nodes]);

  // Collapsible Handlers
  const togglePaper = (paper) => {
    setExpandedPapers(prev => ({ ...prev, [paper]: !prev[paper] }));
  };

  const toggleSubject = (subjectKey) => {
    setExpandedSubjects(prev => ({ ...prev, [subjectKey]: !prev[subjectKey] }));
  };

  // Categorize nodes for sidebar list
  const getCategorizedNodes = () => {
    const papers = {
      "GS1": { title: "GS Paper 1", subjects: {}, unmapped: [] },
      "GS2": { title: "GS Paper 2", subjects: {}, unmapped: [] },
      "GS3": { title: "GS Paper 3", subjects: {}, unmapped: [] },
      "GS4": { title: "GS Paper 4", subjects: {}, unmapped: [] },
      "OPTIONAL": { title: "Optional Subjects", subjects: {}, unmapped: [] },
      "OTHER": { title: "Other / CSAT", subjects: {}, unmapped: [] }
    };

    filteredNodes.forEach(node => {
      // Find paper
      let paperKey = "OTHER";
      if (node.gsPapers && node.gsPapers.length > 0) {
        const primary = node.gsPapers[0].toUpperCase();
        if (papers[primary]) {
          paperKey = primary;
        }
      } else if (node.category === "OPTIONAL") {
        paperKey = "OPTIONAL";
      }

      // Find subject
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

    // Explicitly sort arrays by orderIndex to maintain chronological syllabus sequence
    Object.keys(papers).forEach(key => {
      papers[key].unmapped.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      Object.keys(papers[key].subjects).forEach(sub => {
        papers[key].subjects[sub].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      });
    });

    return papers;
  };

  // Fetch node details, linked articles, and questions
  const handleNodeSelect = async (node) => {
    setSelectedNode(node);
    setArticlesLoading(true);
    try {
      const res = await fetch(`/api/admin/issues/${node.id}`);
      const data = await res.json();
      if (data.success && data.issue) {
        const articles = (data.issue.articles || []).map(a => ({ ...a, type: 'ARTICLE' }));
        const editorials = (data.issue.editorials || []).map(e => ({ ...e, type: 'EDITORIAL' }));
        const allItems = [...articles, ...editorials].sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
        setNodeArticles(allItems);
        setNodeQuestions(data.issue.questions || []);
      } else {
        setNodeArticles([]);
        setNodeQuestions([]);
      }
    } catch (err) {
      setNodeArticles([]);
      setNodeQuestions([]);
    } finally {
      setArticlesLoading(false);
    }
  };

  // Extract content from URL
  const handleExtract = async () => {
    if (!newsForm.url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newsForm.url })
      });
      const result = await res.json();
      if (result.success) {
        setNewsForm(prev => ({
          ...prev,
          title: result.data.title || '',
          rawContent: result.data.content || '',
          source: result.data.source || ''
        }));
        toast.success('Content extracted successfully!');
      } else {
        toast.error(result.error || 'Extraction failed');
      }
    } catch (err) {
      toast.error('Error connecting to extractor');
    } finally {
      setLoading(false);
    }
  };

  // Google Doc Ingestion Handler
  const handleGdocIngest = async () => {
    if (!selectedNode || !gdocUrl) return;
    setGdocLoading(true);
    const toastId = toast.loading('Ingesting Google Doc & hosting illustrations...');
    try {
      const res = await fetch('/api/admin/issues/ingest-gdoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docUrl: gdocUrl,
          issueId: selectedNode.id,
          mode: ingestType, // ARTICLE or EDITORIAL
          lang: 'en'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Ingested! Title: "${data.title}"`, { id: toastId });
        
        // Add to recent feed
        setRecentIngestions(prev => [{
          id: data.id,
          type: ingestType,
          title: data.title,
          source: 'Google Docs',
          linkedTo: selectedNode.title,
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 9)]);

        setGdocUrl('');
        // Refresh articles list
        handleNodeSelect(selectedNode);
      } else {
        toast.error(`Ingestion failed: ${data.error}`, { id: toastId });
      }
    } catch (err) {
      toast.error('Network error during Google Doc Ingestion', { id: toastId });
    } finally {
      setGdocLoading(false);
    }
  };

  // Save news item (article or editorial)
  const handleSaveNews = async (triggerAI = false) => {
    if (!selectedNode || !newsForm.title) {
      toast.error('Select a node and provide a title');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/issues/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedNode.id,
          type: ingestType,
          title: newsForm.title,
          url: newsForm.url,
          source: newsForm.source,
          author: ingestType === 'EDITORIAL' ? newsForm.author : undefined,
          contentType: ingestType === 'ARTICLE' ? newsForm.contentType : undefined,
          rawContent: newsForm.rawContent,
          publishedAt: newsForm.publishedAt
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${ingestType === 'EDITORIAL' ? 'Editorial' : 'Article'} ingested!`);
        
        // Add to recent ingestions feed
        setRecentIngestions(prev => [{
          id: data.id,
          type: ingestType,
          title: newsForm.title,
          source: newsForm.source,
          linkedTo: selectedNode.title,
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 9)]);

        // Reset form
        setNewsForm({
          url: '',
          title: '',
          rawContent: '',
          source: '',
          author: '',
          publishedAt: new Date().toISOString().split('T')[0],
          contentType: 'NEWS'
        });
        
        // Refresh linked articles
        handleNodeSelect(selectedNode);

        if (triggerAI) {
          toast.loading('Triggering AI synthesis pipeline...', { duration: 3000 });
          await fetch('/api/admin/news-engine/process', { method: 'POST' });
          toast.success('AI Pipeline Triggered!');
        }
      } else {
        toast.error(data.error || 'Ingestion failed');
      }
    } catch (err) {
      toast.error('Network error during ingestion');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setNewsForm({
      url: '',
      title: '',
      rawContent: '',
      source: '',
      author: '',
      publishedAt: new Date().toISOString().split('T')[0],
      contentType: 'NEWS'
    });
    setIngestType('ARTICLE');
  };

  // Questions Manager helper functions
  const getArticleQuestionsCount = (item) => {
    const targetTag = `${item.type.toLowerCase()}:${item.id}`;
    return nodeQuestions.filter(q => q.tags?.includes(targetTag)).length;
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      type: 'PRELIMS',
      text: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctLabel: 'a',
      explanation: '',
      difficulty: 'MEDIUM'
    });
    setEditingQuestionId(null);
  };

  const loadQuestionIntoForm = (q) => {
    const isMains = q.tags?.includes('mains') || q.correctLabel === 'MAINS';
    
    let optA = '', optB = '', optC = '', optD = '';
    if (!isMains && q.options && Array.isArray(q.options)) {
      const a = q.options.find(o => o.label === 'a');
      const b = q.options.find(o => o.label === 'b');
      const c = q.options.find(o => o.label === 'c');
      const d = q.options.find(o => o.label === 'd');
      optA = a ? a.text : '';
      optB = b ? b.text : '';
      optC = c ? c.text : '';
      optD = d ? d.text : '';
    }

    setQuestionForm({
      type: isMains ? 'MAINS' : 'PRELIMS',
      text: q.text,
      optA,
      optB,
      optC,
      optD,
      correctLabel: isMains ? 'a' : q.correctLabel,
      explanation: q.explanation,
      difficulty: q.difficulty || 'MEDIUM'
    });
    setEditingQuestionId(q.id);
  };

  const openQuestionsManager = (item) => {
    setSelectedItemForQuestions(item);
    setQuestionsModalOpen(true);
    resetQuestionForm();
  };

  const handleSaveQuestion = async () => {
    if (!selectedNode || !selectedItemForQuestions) return;
    setQLoading(true);
    const toastId = toast.loading('Syncing question with bank...');
    
    try {
      const isMains = questionForm.type === 'MAINS';
      
      const optionsArray = isMains 
        ? [] 
        : [
            { label: 'a', text: questionForm.optA },
            { label: 'b', text: questionForm.optB },
            { label: 'c', text: questionForm.optC },
            { label: 'd', text: questionForm.optD }
          ];

      const itemTag = `${selectedItemForQuestions.type.toLowerCase()}:${selectedItemForQuestions.id}`;
      const defaultTags = ['current-affairs'];
      if (isMains) defaultTags.push('mains');
      else defaultTags.push('prelims');
      defaultTags.push(itemTag);

      const payload = {
        text: questionForm.text,
        options: optionsArray,
        correctLabel: isMains ? 'MAINS' : questionForm.correctLabel.toLowerCase(),
        explanation: questionForm.explanation,
        difficulty: questionForm.difficulty,
        gsPaper: selectedNode.gsPapers?.[0] || 'GS1',
        issueId: selectedNode.id,
        tags: defaultTags
      };

      let res;
      if (editingQuestionId) {
        res = await fetch('/api/admin/questions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingQuestionId })
        });
      } else {
        res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(editingQuestionId ? 'Question updated!' : 'Question added to bank!', { id: toastId });
        resetQuestionForm();
        await refreshQuestions();
      } else {
        toast.error(data.error || 'Failed to save question', { id: toastId });
      }
    } catch (err) {
      toast.error('Connection error saving question', { id: toastId });
    } finally {
      setQLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const toastId = toast.loading('Deleting question...');
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Question deleted from bank', { id: toastId });
        await refreshQuestions();
      } else {
        toast.error(data.error || 'Failed to delete question', { id: toastId });
      }
    } catch (err) {
      toast.error('Connection error deleting question', { id: toastId });
    }
  };

  const refreshQuestions = async () => {
    if (!selectedNode) return;
    try {
      const res = await fetch(`/api/admin/issues/${selectedNode.id}`);
      const data = await res.json();
      if (data.success && data.issue) {
        setNodeQuestions(data.issue.questions || []);
      }
    } catch (err) {
      console.error('Error refreshing questions:', err);
    }
  };

  return (
    <div className="cms-container">
      {/* SIDEBAR — Categorized Node Picker */}
      <div className="cms-sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)', 
              width: '32px', height: '32px', borderRadius: '10px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Newspaper size={18} color="white" />
            </div>
            <div>
              <h1 className="sidebar-title" style={{ fontSize: '1rem', margin: 0 }}>News Hub</h1>
              <p className="sidebar-subtitle" style={{ margin: 0 }}>Ingestion Engine</p>
            </div>
          </div>
        </div>
        <div className="sidebar-search">
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search syllabus nodes..." 
              style={{ paddingLeft: '32px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Collapsible tree node list */}
        <div className="node-list" style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
          {listLoading ? (
             <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>Loading...</div>
          ) : (
            Object.entries(getCategorizedNodes()).map(([paperKey, paperData]) => {
              const paperCount = Object.values(paperData.subjects).reduce((acc, curr) => acc + curr.length, 0) + paperData.unmapped.length;
              if (paperCount === 0 && searchTerm) return null;

              const isPaperExpanded = !!expandedPapers[paperKey];

              return (
                <div key={paperKey} className={`paper-folder ${isPaperExpanded ? 'expanded' : ''}`} style={{ marginBottom: '8px' }}>
                  <div 
                    onClick={() => togglePaper(paperKey)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', userSelect: 'none',
                      transition: 'all 0.2s', margin: '0 8px 4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isPaperExpanded ? <FolderOpen size={15} style={{ color: '#f59e0b' }} /> : <Folder size={15} style={{ color: '#64748b' }} />}
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isPaperExpanded ? '#f59e0b' : '#f8fafc' }}>
                        {paperData.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '6px', color: '#94a3b8' }}>
                        {paperCount}
                      </span>
                      {isPaperExpanded ? <ChevronDown size={12} style={{ opacity: 0.5 }} /> : <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                    </div>
                  </div>

                  {isPaperExpanded && (
                    <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.entries(paperData.subjects).map(([subjectName, subjectNodes]) => {
                        if (subjectNodes.length === 0) return null;
                        const subjectKey = `${paperKey}_${subjectName}`;
                        const isSubjectExpanded = !!expandedSubjects[subjectKey];

                        return (
                          <div key={subjectName} className={`subject-folder ${isSubjectExpanded ? 'expanded' : ''}`} style={{ margin: '2px 8px' }}>
                            <div 
                              onClick={() => toggleSubject(subjectKey)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)',
                                cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isSubjectExpanded ? <FolderOpen size={13} style={{ color: '#38bdf8' }} /> : <Folder size={13} style={{ color: '#64748b' }} />}
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isSubjectExpanded ? '#38bdf8' : '#cbd5e1' }}>
                                  {subjectName}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>{subjectNodes.length}</span>
                                {isSubjectExpanded ? <ChevronDown size={10} style={{ opacity: 0.5 }} /> : <ChevronRight size={10} style={{ opacity: 0.5 }} />}
                              </div>
                            </div>

                            {isSubjectExpanded && (
                              <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                                {subjectNodes.map(node => {
                                  const articleCount = node._count?.articles || 0;
                                  return (
                                    <div 
                                      key={node.id} 
                                      className={`node-item ${selectedNode?.id === node.id ? 'active' : ''}`}
                                      onClick={() => handleNodeSelect(node)}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                                        background: selectedNode?.id === node.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                                        border: selectedNode?.id === node.id ? '1px solid #f59e0b' : '1px solid transparent',
                                        transition: 'all 0.2s', margin: '1px 0'
                                      }}
                                    >
                                      <div className="node-status" style={{ 
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: articleCount > 0 ? '#10b981' : '#475569',
                                        boxShadow: articleCount > 0 ? '0 0 8px #10b981' : 'none'
                                      }}></div>
                                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                        <span className="node-name" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {node.title}
                                        </span>
                                        <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                          {node.domain} • {articleCount} articles
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {paperData.unmapped.map(node => {
                        const articleCount = node._count?.articles || 0;
                        return (
                          <div 
                            key={node.id} 
                            className={`node-item ${selectedNode?.id === node.id ? 'active' : ''}`}
                            onClick={() => handleNodeSelect(node)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                              background: selectedNode?.id === node.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                              border: selectedNode?.id === node.id ? '1px solid #f59e0b' : '1px solid transparent',
                              transition: 'all 0.2s', margin: '1px 8px'
                            }}
                          >
                            <div className="node-status" style={{ 
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: articleCount > 0 ? '#10b981' : '#475569',
                              boxShadow: articleCount > 0 ? '0 0 8px #10b981' : 'none'
                            }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                              <span className="node-name" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {node.title}
                              </span>
                              <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                {node.domain} • {articleCount} articles
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="cms-main">
        {selectedNode ? (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* LEFT: Ingestion Form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Toolbar */}
              <div className="cms-toolbar">
                <div className="toolbar-left">
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Newspaper size={18} style={{ color: '#f59e0b' }} />
                    {selectedNode.title}
                  </h2>
                  <span className="sidebar-subtitle">{selectedNode.domain}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn-save" 
                    style={{ background: '#475569', fontSize: '0.8rem', padding: '8px 16px' }}
                    onClick={() => handleSaveNews(false)}
                    disabled={loading || !newsForm.title}
                  >
                    Save Draft
                  </button>
                  <button 
                    className="btn-save" 
                    style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                    onClick={() => handleSaveNews(true)}
                    disabled={loading || !newsForm.title}
                  >
                    <Zap size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
                    Save & Process AI
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="editor-container">
                {/* Article/Editorial Type Toggle */}
                <div style={{ 
                  display: 'flex', gap: '0', marginBottom: '16px', 
                  background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '4px', 
                  border: '1px solid rgba(255,255,255,0.06)', maxWidth: '320px' 
                }}>
                  <button
                    onClick={() => setIngestType('ARTICLE')}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.3px', transition: 'all 0.2s',
                      background: ingestType === 'ARTICLE' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: ingestType === 'ARTICLE' ? '#93c5fd' : 'rgba(255,255,255,0.4)',
                      boxShadow: ingestType === 'ARTICLE' ? '0 0 12px rgba(59,130,246,0.15)' : 'none'
                    }}
                  >
                    <FileText size={13} style={{ marginRight: '5px', verticalAlign: '-2px' }} /> Article
                  </button>
                  <button
                    onClick={() => setIngestType('EDITORIAL')}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.3px', transition: 'all 0.2s',
                      background: ingestType === 'EDITORIAL' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                      color: ingestType === 'EDITORIAL' ? '#d8b4fe' : 'rgba(255,255,255,0.4)',
                      boxShadow: ingestType === 'EDITORIAL' ? '0 0 12px rgba(168,85,247,0.15)' : 'none'
                    }}
                  >
                    <Newspaper size={13} style={{ marginRight: '5px', verticalAlign: '-2px' }} /> Editorial
                  </button>
                </div>

                {/* Google Doc Ingestion Section */}
                <div style={{ 
                  display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-end', 
                  padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', 
                  border: '1px dashed rgba(255,255,255,0.08)' 
                }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7' }}>
                      <FileText size={12} /> Google Doc Ingest (Shared to view)
                    </label>
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="Paste document link to ingest directly..." 
                      value={gdocUrl}
                      onChange={e => setGdocUrl(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn-ai" 
                    style={{ height: '36px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', flexShrink: 0 }}
                    onClick={handleGdocIngest}
                    disabled={gdocLoading || !gdocUrl}
                  >
                    <Sparkles size={14} />
                    {gdocLoading ? 'Ingesting...' : 'Ingest GDoc'}
                  </button>
                </div>

                {/* URL Extraction Row */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">
                      <Globe size={12} /> Source URL
                    </label>
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="Paste article URL here..." 
                      value={newsForm.url}
                      onChange={e => setNewsForm({...newsForm, url: e.target.value})}
                    />
                  </div>
                  <button 
                    className="btn-ai" 
                    style={{ height: '36px', flexShrink: 0 }}
                    onClick={handleExtract}
                    disabled={loading || !newsForm.url}
                  >
                    <Sparkles size={14} />
                    Extract
                  </button>
                  <button 
                    onClick={clearForm}
                    style={{ 
                      height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0
                    }}
                    title="Clear Form"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Title & Source Row */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 2 }}>
                    <label className="form-label">Title *</label>
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="Article title..."
                      value={newsForm.title}
                      onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Source</label>
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="e.g. The Hindu"
                      value={newsForm.source}
                      onChange={e => setNewsForm({...newsForm, source: e.target.value})}
                    />
                  </div>
                </div>

                {/* Date, Content Type, Author Row */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Publish Date</label>
                    <input 
                      type="date" 
                      className="search-input" 
                      value={newsForm.publishedAt}
                      onChange={e => setNewsForm({...newsForm, publishedAt: e.target.value})}
                    />
                  </div>
                  
                  {ingestType === 'ARTICLE' ? (
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Content Type</label>
                      <select 
                        className="status-select" 
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px' }}
                        value={newsForm.contentType}
                        onChange={e => setNewsForm({...newsForm, contentType: e.target.value})}
                      >
                        <option value="NEWS">NEWS</option>
                        <option value="PIB">PIB</option>
                        <option value="REPORT">REPORT</option>
                        <option value="PRELIMS">PRELIMS (Prelims only)</option>
                        <option value="MAINS">MAINS (Mains only)</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Author</label>
                      <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Author name..."
                        value={newsForm.author}
                        onChange={e => setNewsForm({...newsForm, author: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                {/* Raw Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <label className="form-label">
                    Raw Content <span style={{ color: '#64748b', fontWeight: 400 }}>(for AI processing pipeline)</span>
                  </label>
                  <textarea 
                    className="markdown-textarea"
                    style={{ flex: 1, minHeight: '160px', fontFamily: '"Inter", sans-serif', fontSize: '0.85rem' }}
                    value={newsForm.rawContent}
                    onChange={e => setNewsForm({...newsForm, rawContent: e.target.value})}
                    placeholder="Article body content will appear here after extraction..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* RIGHT: Sidebar Panel — Recent Ingestions + Node Articles */}
            <div style={{ 
              width: '340px', 
              background: '#1e293b', 
              borderLeft: '1px solid rgba(255,255,255,0.08)', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden' 
            }}>
              {/* Recent Ingestions Feed */}
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ 
                  fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', 
                  letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Clock size={12} /> Session Feed
                </h3>
                {recentIngestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                    {recentIngestions.map((item, idx) => (
                      <div key={idx} style={{ 
                        padding: '8px 10px', borderRadius: '8px', 
                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)',
                        fontSize: '0.72rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ 
                            fontSize: '0.6rem', fontWeight: 700, 
                            color: item.type === 'EDITORIAL' ? '#d8b4fe' : '#93c5fd',
                            textTransform: 'uppercase'
                          }}>{item.type}</span>
                          <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{item.time}</span>
                        </div>
                        <div style={{ color: '#e2e8f0', fontWeight: 600, lineHeight: 1.3 }}>{item.title}</div>
                        <div style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '2px' }}>
                          → {item.linkedTo} {item.source && `• ${item.source}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#475569', textAlign: 'center', padding: '12px 0' }}>
                    Ingested items will appear here.
                  </div>
                )}
              </div>

              {/* Node's Existing Articles & Editorials */}
              <div style={{ flex: 1, padding: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ 
                  fontSize: '0.72rem', fontWeight: 800, color: '#10b981', 
                  letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <FileText size={12} /> Linked Items ({nodeArticles.length})
                </h3>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {articlesLoading ? (
                    <div style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center', padding: '20px 0' }}>Loading...</div>
                  ) : nodeArticles.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {nodeArticles.map(article => (
                        <div key={article.id} style={{ 
                          padding: '10px', borderRadius: '8px', 
                          background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)',
                          fontSize: '0.75rem'
                        }}>
                          <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px', lineHeight: 1.3 }}>
                            {article.title}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                              {article.source || 'Unknown'} • {article.type === 'EDITORIAL' ? 'EDITORIAL' : (article.contentType || 'NEWS')}
                            </span>
                            {article.url && (
                              <a href={article.url} target="_blank" rel="noopener noreferrer" 
                                style={{ color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                          
                          {/* Questions badge and management button */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}
                              {article.status && <span style={{ marginLeft: '8px', color: article.status === 'DONE' ? '#10b981' : '#f59e0b' }}>● {article.status}</span>}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openQuestionsManager(article);
                              }}
                              style={{
                                background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)',
                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              <HelpCircle size={10} /> Questions ({getArticleQuestionsCount(article)})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: '#475569', textAlign: 'center', padding: '30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={24} style={{ opacity: 0.3 }} />
                      No articles linked to this node yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Newspaper size={64} className="empty-icon" style={{ color: '#f59e0b', opacity: 0.2 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>News Ingestion Hub</h3>
            <p className="sidebar-subtitle" style={{ maxWidth: '360px', marginTop: '0', lineHeight: 1.5 }}>
              Select a syllabus node from the left, then paste a news article URL to extract, attach, and queue it for AI processing.
            </p>
          </div>
        )}
      </div>

      {/* QUESTIONS MANAGER MODAL */}
      {questionsModalOpen && selectedItemForQuestions && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Questions Manager — {selectedItemForQuestions.type}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedItemForQuestions.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setQuestionsModalOpen(false);
                  setSelectedItemForQuestions(null);
                  resetQuestionForm();
                }}
                style={{
                  background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left Column: Question List */}
              <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.08)', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} /> Linked Questions ({
                    nodeQuestions.filter(q => q.tags?.includes(`${selectedItemForQuestions.type.toLowerCase()}:${selectedItemForQuestions.id}`)).length
                  })
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {nodeQuestions.filter(q => q.tags?.includes(`${selectedItemForQuestions.type.toLowerCase()}:${selectedItemForQuestions.id}`)).length === 0 ? (
                    <div style={{ padding: '30px 20px', textAlign: 'center', color: '#475569', fontSize: '0.8rem' }}>
                      No questions linked to this article yet. Use the form on the right to add some.
                    </div>
                  ) : (
                    nodeQuestions.filter(q => q.tags?.includes(`${selectedItemForQuestions.type.toLowerCase()}:${selectedItemForQuestions.id}`)).map(q => {
                      const isMains = q.tags?.includes('mains') || q.correctLabel === 'MAINS';
                      return (
                        <div key={q.id} style={{
                          padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                              background: isMains ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: isMains ? '#d8b4fe' : '#93c5fd'
                            }}>
                              {isMains ? 'MAINS' : 'PRELIMS (MCQ)'}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => loadQuestionIntoForm(q)}
                                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
                                title="Edit Question"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                                title="Delete Question"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <div style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '6px' }}>{q.text}</div>
                          
                          {!isMains && q.options && Array.isArray(q.options) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px' }}>
                              {q.options.map(opt => (
                                <div key={opt.label} style={{
                                  padding: '4px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)',
                                  border: opt.label === q.correctLabel ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                                  color: opt.label === q.correctLabel ? '#10b981' : '#94a3b8'
                                }}>
                                  <strong>{opt.label.toUpperCase()}:</strong> {opt.text}
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ fontSize: '0.7rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', marginTop: '6px' }}>
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Form to Add/Edit */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 16px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> {editingQuestionId ? 'Edit Question' : 'Add Question'}
                </h4>

                {/* Form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div>
                    <label className="form-label">Question Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setQuestionForm(prev => ({ ...prev, type: 'PRELIMS' }));
                        }}
                        style={{
                          flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                          background: questionForm.type === 'PRELIMS' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.02)',
                          color: questionForm.type === 'PRELIMS' ? '#93c5fd' : '#64748b',
                          border: questionForm.type === 'PRELIMS' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.04)'
                        }}
                      >
                        Prelims MCQ
                      </button>
                      <button
                        onClick={() => {
                          setQuestionForm(prev => ({ ...prev, type: 'MAINS' }));
                        }}
                        style={{
                          flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                          background: questionForm.type === 'MAINS' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.02)',
                          color: questionForm.type === 'MAINS' ? '#d8b4fe' : '#64748b',
                          border: questionForm.type === 'MAINS' ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.04)'
                        }}
                      >
                        Mains Question
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Question Text *</label>
                    <textarea
                      className="markdown-textarea"
                      style={{ height: '80px', fontSize: '0.8rem' }}
                      placeholder="Enter the question text..."
                      value={questionForm.text}
                      onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })}
                    />
                  </div>

                  {questionForm.type === 'PRELIMS' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label className="form-label">Option A *</label>
                          <input
                            type="text"
                            className="search-input"
                            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                            placeholder="Option A"
                            value={questionForm.optA}
                            onChange={e => setQuestionForm({ ...questionForm, optA: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="form-label">Option B *</label>
                          <input
                            type="text"
                            className="search-input"
                            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                            placeholder="Option B"
                            value={questionForm.optB}
                            onChange={e => setQuestionForm({ ...questionForm, optB: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="form-label">Option C *</label>
                          <input
                            type="text"
                            className="search-input"
                            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                            placeholder="Option C"
                            value={questionForm.optC}
                            onChange={e => setQuestionForm({ ...questionForm, optC: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="form-label">Option D *</label>
                          <input
                            type="text"
                            className="search-input"
                            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                            placeholder="Option D"
                            value={questionForm.optD}
                            onChange={e => setQuestionForm({ ...questionForm, optD: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label className="form-label">Correct Option *</label>
                          <select
                            className="status-select"
                            style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem' }}
                            value={questionForm.correctLabel}
                            onChange={e => setQuestionForm({ ...questionForm, correctLabel: e.target.value })}
                          >
                            <option value="a">A</option>
                            <option value="b">B</option>
                            <option value="c">C</option>
                            <option value="d">D</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Difficulty</label>
                          <select
                            className="status-select"
                            style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem' }}
                            value={questionForm.difficulty}
                            onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                          >
                            <option value="EASY">EASY</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HARD">HARD</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {questionForm.type === 'MAINS' && (
                    <div>
                      <label className="form-label">Difficulty</label>
                      <select
                        className="status-select"
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem' }}
                        value={questionForm.difficulty}
                        onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="form-label">
                      {questionForm.type === 'MAINS' ? 'Model Answer / Key Points *' : 'Explanation *'}
                    </label>
                    <textarea
                      className="markdown-textarea"
                      style={{ height: '80px', fontSize: '0.8rem' }}
                      placeholder={questionForm.type === 'MAINS' ? 'Provide key value points or model answer structure...' : 'Explain why the correct option is right...'}
                      value={questionForm.explanation}
                      onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      className="btn-save"
                      style={{ flex: 1, padding: '8px 16px', fontSize: '0.78rem' }}
                      onClick={handleSaveQuestion}
                      disabled={qLoading || !questionForm.text || (questionForm.type === 'PRELIMS' && (!questionForm.optA || !questionForm.optB || !questionForm.optC || !questionForm.optD)) || !questionForm.explanation}
                    >
                      <Save size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                      {editingQuestionId ? 'Update' : 'Save Question'}
                    </button>
                    {editingQuestionId && (
                      <button
                        onClick={resetQuestionForm}
                        style={{
                          padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                          background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
