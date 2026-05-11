'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  FileText, 
  Sparkles, 
  Save, 
  ChevronRight, 
  Layers, 
  Globe, 
  AlertCircle 
} from 'lucide-react';
import './admin-rag.css';

export default function NodeCMSPage() {
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [content, setContent] = useState({
    prelimsNote: '',
    mainsNote: '',
    status: 'DRAFT',
    slug: ''
  });
  const [newsForm, setNewsForm] = useState({
    url: '',
    title: '',
    rawContent: '',
    source: '',
    publishedAt: new Date().toISOString().split('T')[0],
    contentType: 'NEWS'
  });
  const [mode, setMode] = useState('PRELIMS'); // PRELIMS, MAINS, or NEWS
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

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

  // Search logic
  useEffect(() => {
    const filtered = nodes.filter(n => 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNodes(filtered);
  }, [searchTerm, nodes]);

  // Fetch content when node selected
  const handleNodeSelect = async (node) => {
    setSelectedNode(node);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/node-content?issueId=${node.id}`);
      const data = await res.json();
      if (data.content) {
        setContent({
          prelimsNote: data.content.prelimsNote || '',
          mainsNote: data.content.mainsNote || '',
          status: data.content.status || 'DRAFT',
          slug: data.content.issue?.slug || ''
        });
      } else {
        setContent({
          prelimsNote: '',
          mainsNote: '',
          status: 'DRAFT',
          slug: node.slug || ''
        });
      }
    } catch (err) {
      toast.error('Error loading node content');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedNode) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/node-content', {
        method: 'POST',
        body: JSON.stringify({ 
          issueId: selectedNode.id, 
          generateType: mode 
        })
      });
      const data = await res.json();
      if (data.aiText) {
        if (mode === 'PRELIMS') {
          setContent(prev => ({ ...prev, prelimsNote: data.aiText }));
        } else {
          setContent(prev => ({ ...prev, mainsNote: data.aiText }));
        }
        toast.success('AI Draft Generated!');
      }
    } catch (err) {
      toast.error('AI Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedNode) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/node-content', {
        method: 'POST',
        body: JSON.stringify({
          issueId: selectedNode.id,
          prelimsNote: content.prelimsNote,
          mainsNote: content.mainsNote,
          status: content.status
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Node Intelligence Synced!');
        fetchNodes(); // Refresh sidebar status
      }
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!newsForm.url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/extract-url', {
        method: 'POST',
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
        toast.success('Content extracted!');
      } else {
        toast.error(result.error || 'Extraction failed');
      }
    } catch (err) {
      toast.error('Error connecting to extractor');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNews = async (triggerAI = false) => {
    if (!selectedNode || !newsForm.title) {
      toast.error('Missing required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/issues/ingest', {
        method: 'POST',
        body: JSON.stringify({
          issueId: selectedNode.id,
          type: newsForm.contentType === 'EDITORIAL' ? 'EDITORIAL' : 'ARTICLE',
          title: newsForm.title,
          url: newsForm.url,
          source: newsForm.source,
          contentType: newsForm.contentType,
          rawContent: newsForm.rawContent,
          publishedAt: newsForm.publishedAt
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('News Item Saved!');
        // Reset form
        setNewsForm({
          url: '',
          title: '',
          rawContent: '',
          source: '',
          publishedAt: new Date().toISOString().split('T')[0],
          contentType: 'NEWS'
        });
        
        if (triggerAI) {
           toast.loading('Triggering AI synthesis...', { duration: 3000 });
           await fetch('/api/admin/news-engine/process', { method: 'POST' });
           toast.success('AI Pipeline Triggered!');
        }
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch (err) {
      toast.error('Network error saving news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-container">
      {/* SIDEBAR */}
      <div className="cms-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Node CMS</h1>
          <p className="sidebar-subtitle">UPSC Intelligence Hub</p>
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
        <div className="node-list">
          {listLoading ? (
             <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>Loading...</div>
          ) : (
            filteredNodes.map(node => {
              const status = node.nodeContent?.status;
              const statusClass = !status ? 'status-empty' : status === 'PUBLISHED' ? 'status-published' : 'status-draft';
              
              return (
                <div 
                  key={node.id} 
                  className={`node-item ${selectedNode?.id === node.id ? 'active' : ''}`}
                  onClick={() => handleNodeSelect(node)}
                >
                  <div className={`node-status ${statusClass}`}></div>
                  <div className="node-info">
                    <span className="node-name">{node.title}</span>
                    <span className="node-meta">{node.domain} • {node.gsPapers?.[0] || 'GS'}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.3 }} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="cms-main">
        {selectedNode ? (
          <>
            <div className="cms-toolbar">
              <div className="toolbar-left">
                <div className="mode-tabs">
                  <div 
                    className={`mode-tab ${mode === 'PRELIMS' ? 'active' : ''}`}
                    onClick={() => setMode('PRELIMS')}
                  >
                    Prelims
                  </div>
                  <div 
                    className={`mode-tab ${mode === 'MAINS' ? 'active' : ''}`}
                    onClick={() => setMode('MAINS')}
                  >
                    Mains
                  </div>
                  <div 
                    className={`mode-tab ${mode === 'NEWS' ? 'active' : ''}`}
                    onClick={() => setMode('NEWS')}
                  >
                    Add News
                  </div>
                </div>
                {mode !== 'NEWS' && (
                  <div className="status-toggle">
                    <span className="sidebar-subtitle">Status:</span>
                    <select 
                      className="status-select"
                      value={content.status}
                      onChange={e => setContent({...content, status: e.target.value})}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                )}
              </div>
              {mode !== 'NEWS' ? (
                <button 
                  className="btn-save" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Sync Node'}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn-save" 
                    style={{ background: '#475569' }}
                    onClick={() => handleSaveNews(false)}
                    disabled={loading}
                  >
                    Save Draft
                  </button>
                  <button 
                    className="btn-save" 
                    onClick={() => handleSaveNews(true)}
                    disabled={loading}
                  >
                    Save & Process
                  </button>
                </div>
              )}
            </div>

            <div className="editor-container">
              <div className="editor-header">
                <h2 className="editor-title">{selectedNode.title}</h2>
                <div className="editor-slug-wrap">
                  <Globe size={14} />
                  <span>Slug:</span>
                  <input 
                    type="text" 
                    className="slug-input"
                    value={content.slug}
                    readOnly
                  />
                </div>
              </div>

              {mode === 'NEWS' ? (
                <div className="news-ingestion-form" style={{ marginTop: '20px' }}>
                  <div className="form-row" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="sidebar-subtitle">Article URL</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" 
                          className="search-input" 
                          placeholder="Paste URL here..." 
                          value={newsForm.url}
                          onChange={e => setNewsForm({...newsForm, url: e.target.value})}
                        />
                      </div>
                    </div>
                    <button 
                      className="btn-ai" 
                      style={{ marginTop: '20px', height: '36px' }}
                      onClick={handleExtract}
                      disabled={loading}
                    >
                      <Sparkles size={14} />
                      Extract
                    </button>
                  </div>

                  <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 2 }}>
                      <label className="sidebar-subtitle">Title</label>
                      <input 
                        type="text" 
                        className="search-input" 
                        value={newsForm.title}
                        onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="sidebar-subtitle">Source</label>
                      <input 
                        type="text" 
                        className="search-input" 
                        value={newsForm.source}
                        placeholder="e.g. The Hindu"
                        onChange={e => setNewsForm({...newsForm, source: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="sidebar-subtitle">Publish Date</label>
                      <input 
                        type="date" 
                        className="search-input" 
                        value={newsForm.publishedAt}
                        onChange={e => setNewsForm({...newsForm, publishedAt: e.target.value})}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="sidebar-subtitle">Content Type</label>
                      <select 
                        className="status-select" 
                        style={{ width: '100%', marginTop: '4px' }}
                        value={newsForm.contentType}
                        onChange={e => setNewsForm({...newsForm, contentType: e.target.value})}
                      >
                        <option value="NEWS">NEWS</option>
                        <option value="EDITORIAL">EDITORIAL</option>
                        <option value="PIB">PIB</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <label className="sidebar-subtitle">Raw Content (for AI Processing)</label>
                    <textarea 
                      className="markdown-textarea"
                      style={{ height: '250px', marginTop: '5px' }}
                      value={newsForm.rawContent}
                      onChange={e => setNewsForm({...newsForm, rawContent: e.target.value})}
                      placeholder="Article body content will appear here..."
                    ></textarea>
                  </div>
                </div>
              ) : (
                <>
                  <div className="ai-controls">
                    <button className="btn-ai" onClick={handleGenerate} disabled={loading}>
                      <Sparkles size={16} />
                      Generate {mode} Draft
                    </button>
                    <div style={{ flex: 1 }}></div>
                    <div className="sidebar-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={14} />
                      Markdown Editor
                    </div>
                  </div>

                  <textarea 
                    className="markdown-textarea"
                    placeholder={`Write ${mode.toLowerCase()} intelligence for this node...`}
                    value={mode === 'PRELIMS' ? content.prelimsNote : content.mainsNote}
                    onChange={e => {
                      if (mode === 'PRELIMS') setContent({...content, prelimsNote: e.target.value});
                      else setContent({...content, mainsNote: e.target.value});
                    }}
                  ></textarea>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Layers size={64} className="empty-icon" />
            <h3>Select a node to begin ingestion</h3>
            <p className="sidebar-subtitle" style={{ maxWidth: '300px', marginTop: '10px' }}>
              Choose a syllabus node from the left to populate its static intelligence base.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
