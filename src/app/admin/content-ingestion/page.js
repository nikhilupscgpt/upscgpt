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
  const [mode, setMode] = useState('PRELIMS'); // PRELIMS or MAINS
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
                </div>
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
              </div>
              <button 
                className="btn-save" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Sync Node'}
              </button>
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
