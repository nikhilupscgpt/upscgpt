"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Network, Database, Layers, ChevronRight, ChevronDown, 
  GripVertical, ArrowUp, ArrowDown, ExternalLink, Sparkles, 
  Search, Save, RefreshCw, AlertCircle, CheckCircle2,
  BookOpen, BrainCircuit, Zap, Filter, LayoutGrid, List,
  Newspaper, Plus, X, Settings2, Trash2, ListChecks, Link as LinkIcon, FileText, Download,
  AlertTriangle, Trash, FolderPlus, PlusCircle, ArrowDownToLine, Info, Terminal, ShieldAlert,
  HelpCircle, MessageSquareQuote, GraduationCap
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const GS_MAP = {
  GS1: ['GEOGRAPHY', 'INDIAN_CULTURE', 'MODERN_HISTORY', 'WORLD_HISTORY', 'INDIAN_SOCIETY', 'POST_INDEPENDENCE_CONSOLIDATION'],
  GS2: ['POLITY', 'GOVERNANCE', 'INTERNATIONAL_RELATIONS'],
  GS3: ['ECONOMY', 'AGRICULTURE', 'ENVIRONMENT', 'SCIENCE_TECHNOLOGY', 'INTERNAL_SECURITY', 'DISASTER_MANAGEMENT'],
  GS4: ['ETHICS'],
  GENERAL: ['CURRENT_AFFAIRS', 'CSAT']
};

export default function ArchitectClient({ session }) {
  const [tree, setTree] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGs, setSelectedGs] = useState('GS1');
  
  const [isCreating, setIsCreating] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [newNodeForm, setNewNodeForm] = useState({ 
    title: '', domain: '', topic: '', gsPaper: 'GS1', nodeType: 'CONCEPTUAL', parentIssueId: null, bulkTitles: '' 
  });
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [zenMode, setZenMode] = useState(false);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setSelectedNodes(new Set());
    try {
      const res = await fetch(`/api/admin/architect/tree?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) setTree(data.tree || {});
      else toast.error("Neural Sync Error: " + data.error);
    } catch (err) {
      toast.error("Network Partition: Architect offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  const normalize = (s) => s ? s.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '') : '';

  const getSidebarDomains = () => {
    const defaultForGs = (GS_MAP[selectedGs] || []).map(normalize);
    const existingInTree = tree[selectedGs] ? Object.keys(tree[selectedGs]).map(normalize) : [];
    return Array.from(new Set([...defaultForGs, ...existingInTree])).sort();
  };

  const launchForge = (nodeId) => {
    window.open(`/admin/architect/node/${nodeId}`, '_blank');
  };

  const handleCreateNode = async () => {
    if (isBulk ? !newNodeForm.bulkTitles : !newNodeForm.title) return;
    setSaving(true);
    const titles = isBulk ? newNodeForm.bulkTitles.split('\n').filter(t => t.trim()) : [newNodeForm.title];
    try {
      const res = await fetch('/api/admin/issues/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          titles, 
          domain: newNodeForm.domain, 
          topic: newNodeForm.topic, 
          gsPaper: newNodeForm.gsPaper,
          nodeType: newNodeForm.nodeType,
          parentIssueId: newNodeForm.parentIssueId
        })
      });
      if (res.ok) {
        setIsCreating(false);
        fetchTree();
        toast.success(`Forged ${titles.length} nodes`);
        setNewNodeForm({ ...newNodeForm, title: '', bulkTitles: '' });
      }
    } finally { setSaving(false); }
  };

  const handleDeleteNode = async (nodeId) => {
    try {
      const res = await fetch(`/api/admin/issues/${nodeId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Node De-linked and Removed");
        fetchTree();
      } else {
        toast.error("Operation Failed");
      }
    } catch (err) {
      toast.error("Network Error during deletion");
    }
  };

  const handlePurgeSubNodes = async (parentId) => {
    try {
      const res = await fetch(`/api/admin/architect/purge-children`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId })
      });
      if (res.ok) {
        toast.success("Branch Purged Successfully");
        fetchTree();
      } else {
        toast.error("Purge Failed");
      }
    } catch (err) {
      toast.error("Network Error during purge");
    }
  };

  const toggleNodeSelection = (nodeId) => {
    const next = new Set(selectedNodes);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);
    setSelectedNodes(next);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedNodes);
    if (ids.length === 0) return;
    if (!confirm(`Permanently delete ${ids.length} selected nodes?`)) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/admin/issues/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        toast.success(`Successfully purged ${ids.length} nodes`);
        fetchTree();
      } else {
        toast.error("Bulk purge failed");
      }
    } catch (err) {
      toast.error("Network error during bulk purge");
    } finally {
      setSaving(false);
    }
  };

  const GS_COLORS = { GS1: '#0ea5e9', GS2: '#10b981', GS3: '#f59e0b', GS4: '#8b5cf6', GENERAL: '#94a3b8' };

  return (
    <div className={`arc-root ${zenMode ? 'zen-active' : ''}`}>
      <Toaster position="top-right" />
      
      {!zenMode && (
        <header className="arc-header">
          <div className="arc-header-left">
            <BrainCircuit size={24} className="arc-glow" />
            <div className="arc-logo">
              <h1>Neural Architect</h1>
              <span>Command Control</span>
            </div>
            <nav className="arc-pills">
              {Object.keys(GS_COLORS).map(gs => (
                <button key={gs} onClick={() => setSelectedGs(gs)} className={selectedGs === gs ? 'active' : ''} style={{ '--c': GS_COLORS[gs] }}>{gs}</button>
              ))}
            </nav>
          </div>
          <div className="arc-header-right">
            <div className="arc-search"><Search size={14} /><input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <button className="arc-btn arc-btn-out" onClick={() => setZenMode(true)}><Zap size={14} /> Zen Mode</button>
            <button className="arc-btn arc-btn-pri" onClick={() => { setNewNodeForm({ ...newNodeForm, domain: '', topic: '', gsPaper: selectedGs, nodeType: 'CONCEPTUAL', parentIssueId: null }); setIsBulk(false); setIsCreating(true); }}>New Node</button>
            <button className="btn-icon" onClick={fetchTree}><RefreshCw size={14} className={loading ? 'spin' : ''} /></button>
            <a href="/admin" className="arc-exit">Exit</a>
          </div>
        </header>
      )}

      {zenMode && (
        <button className="arc-zen-exit" onClick={() => setZenMode(false)}>
          <Zap size={16} /> Exit Zen
        </button>
      )}

      <div className="arc-body">
        {!zenMode && (
          <aside className="arc-sidebar">
            <div className="arc-sidebar-label">Neural Taxonomy</div>
            {getSidebarDomains().map(domainKey => {
              const normalizedTreeKeys = tree[selectedGs] ? Object.keys(tree[selectedGs]) : [];
              const actualDomainKey = normalizedTreeKeys.find(tk => normalize(tk) === domainKey) || domainKey;
              const count = tree[selectedGs]?.[actualDomainKey] ? Object.values(tree[selectedGs][actualDomainKey]).reduce((a, l) => a + l.length, 0) : 0;
              return (
                <button key={domainKey} className={`arc-side-item ${count === 0 ? 'empty' : ''}`} onClick={() => { if (count > 0) document.getElementById(actualDomainKey)?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <span>{actualDomainKey.replace(/_/g, ' ')}</span>
                  <span className="arc-side-count">{count}</span>
                </button>
              );
            })}
          </aside>
        )}

        <main className="arc-canvas">
          {loading ? (
            <div className="arc-loading"><RefreshCw size={40} className="spin" /><p>Syncing Syllabus Graph...</p></div>
          ) : (tree[selectedGs] && Object.keys(tree[selectedGs]).length > 0) ? (
            Object.keys(tree[selectedGs]).sort().map(domain => {
              const topics = tree[selectedGs][domain];
              const sorted = Object.keys(topics).map(name => ({ name, nodes: topics[name], min: Math.min(...topics[name].map(n => n.orderIndex)) })).sort((a,b)=>a.min-b.min);
              return (
                <div key={domain} id={domain} className="arc-domain-box">
                  <div className="arc-domain-head">
                    <h2>{domain.replace(/_/g, ' ')}</h2>
                    <div className="arc-domain-btns">
                      <button className="arc-btn arc-btn-out" onClick={() => { setNewNodeForm({ ...newNodeForm, domain, topic: '', gsPaper: selectedGs, nodeType: 'CONCEPTUAL' }); setIsBulk(true); setIsCreating(true); }}>+ Section</button>
                    </div>
                  </div>
                  {sorted.map((topic, tIdx) => (
                    <div key={topic.name} className="arc-topic-card">
                      <div className="arc-topic-head">
                        <div className="arc-topic-title"><Layers size={14}/><h3>{topic.name}</h3></div>
                        <div className="arc-topic-btns">
                          <button className="arc-btn-mini" onClick={()=>{setNewNodeForm({...newNodeForm, domain, topic:topic.name, gsPaper:selectedGs, nodeType: 'CONCEPTUAL'}); setIsBulk(false); setIsCreating(true);}}>+ Node</button>
                          <button className="arc-btn-mini arc-btn-mini-purp" onClick={()=>{setNewNodeForm({...newNodeForm, domain, topic:topic.name, gsPaper:selectedGs, nodeType: 'MAINS_QUESTION'}); setIsBulk(false); setIsCreating(true);}}>+ Question</button>
                        </div>
                      </div>
                      <div className="arc-node-stack">
                        {topic.nodes.filter(n=>n.title.toLowerCase().includes(searchTerm.toLowerCase())).map((node) => {
                          const hasSubs = node.subNodes?.length > 0;
                          const isExpanded = expandedNodes[node.id];
                          
                          return (
                            <div key={node.id} className="arc-node-group">
                              <div className={`arc-node-item ${node.nodeType === 'MAINS_QUESTION' ? 'node-q' : ''} ${isExpanded ? 'parent-active' : ''} ${selectedNodes.has(node.id) ? 'selected' : ''}`}>
                                <div className="arc-check-wrap" onClick={(e) => { e.stopPropagation(); toggleNodeSelection(node.id); }}>
                                  <div className={`arc-checkbox ${selectedNodes.has(node.id) ? 'checked' : ''}`} />
                                </div>
                                <div className="arc-node-icon" onClick={() => hasSubs ? setExpandedNodes(p => ({ ...p, [node.id]: !p[node.id] })) : launchForge(node.id)}>
                                  {hasSubs ? (isExpanded ? <ChevronDown size={14} className="arc-glow" /> : <ChevronRight size={14} />) : (node.nodeType === 'MAINS_QUESTION' ? <HelpCircle size={14} /> : <FileText size={14} />)}
                                </div>
                                <div className="arc-node-body" onClick={()=>launchForge(node.id)}>
                                  <h4>{node.title}</h4>
                                  <div className="arc-node-meta">
                                    <span>{(node.nodeType || 'CONCEPTUAL').replace('_', ' ')}</span>
                                    {hasSubs && (
                                      <span className="arc-child-count"><Layers size={10} /> {node.subNodes.length} SUB-UNITS</span>
                                    )}
                                  </div>
                                </div>
                                <div className="arc-node-actions">
                                  <button className="btn-action-mini" title="Add Subnode" onClick={(e) => { e.stopPropagation(); setNewNodeForm({ ...newNodeForm, domain, topic: topic.name, gsPaper: selectedGs, nodeType: 'CONCEPTUAL', parentIssueId: node.id }); setIsBulk(true); setIsCreating(true); }}>
                                    <FolderPlus size={14} />
                                  </button>
                                  <button className="btn-action-mini btn-danger-mini" title="Purge All Subnodes" onClick={(e) => { e.stopPropagation(); if(confirm(`PURGE ALL SUBNODES for: ${node.title}? This cannot be undone.`)) handlePurgeSubNodes(node.id); }}>
                                    <ShieldAlert size={14} />
                                  </button>
                                  <button className="btn-action-mini" title="Open Forge" onClick={(e) => { e.stopPropagation(); launchForge(node.id); }}>
                                    <ExternalLink size={14} />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Indented Subnodes */}
                              {isExpanded && hasSubs && (
                                <div className="arc-subnode-stack">
                                  {node.subNodes.map(sub => (
                                    <div key={sub.id} className={`arc-node-item sub-item ${selectedNodes.has(sub.id) ? 'selected' : ''}`}>
                                      <div className="arc-check-wrap" onClick={(e) => { e.stopPropagation(); toggleNodeSelection(sub.id); }}>
                                        <div className={`arc-checkbox ${selectedNodes.has(sub.id) ? 'checked' : ''}`} />
                                      </div>
                                      <div className="arc-node-icon" onClick={() => launchForge(sub.id)}><Zap size={12} /></div>
                                      <div className="arc-node-body" onClick={() => launchForge(sub.id)}>
                                        <h4>{sub.title}</h4>
                                        <span>Micro-Topic Node</span>
                                      </div>
                                      <div className="arc-node-actions">
                                        <button className="btn-action-mini btn-danger-mini" onClick={(e) => { e.stopPropagation(); if(confirm(`Delete subnode: ${sub.title}?`)) handleDeleteNode(sub.id); }}>
                                          <Trash2 size={12} />
                                        </button>
                                        <button className="btn-action-mini" onClick={(e) => { e.stopPropagation(); launchForge(sub.id); }}>
                                          <ExternalLink size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="arc-empty-canvas">
               <Database size={60} opacity={0.1} />
               <h2>Strategic Sector Empty</h2>
               <p>No neural nodes detected in {selectedGs}. Begin the forge to populate this sector.</p>
               <button className="arc-btn arc-btn-pri" onClick={() => { setNewNodeForm({ ...newNodeForm, domain: '', topic: '', gsPaper: selectedGs, nodeType: 'CONCEPTUAL', parentIssueId: null }); setIsBulk(true); setIsCreating(true); }}>Bulk Forge Sector</button>
            </div>
          )}

          {selectedNodes.size > 0 && (
              <div className="arc-bulk-bar">
                <div className="arc-bulk-info">
                  <span className="arc-bulk-count">{selectedNodes.size}</span>
                  <span>Items Selected</span>
                </div>
                <div className="arc-bulk-actions">
                  <button className="arc-btn arc-btn-out" onClick={() => setSelectedNodes(new Set())}>Cancel</button>
                  <button className="arc-btn arc-btn-danger" onClick={handleBulkDelete}>
                    <Trash2 size={14} /> Purge Selection
                  </button>
                </div>
              </div>
            )}
          </main>
      </div>

      {isCreating && (
        <div className="arc-modal-wrap">
          <div className="arc-overlay" onClick={()=>setIsCreating(false)}/>
          <div className="arc-modal" style={{ borderTop: `4px solid ${newNodeForm.nodeType === 'MAINS_QUESTION' ? '#8b5cf6' : '#3b82f6'}` }}>
            <div className="arc-modal-head">
              <h2>{newNodeForm.nodeType === 'MAINS_QUESTION' ? 'Forge Question Node' : 'Forge Syllabus Node'}</h2>
              <p>{newNodeForm.domain || selectedGs} › {newNodeForm.topic || 'New Section'}</p>
            </div>
            <div className="arc-modal-body">
              <div className="arc-form-group">
                <label>Node Type</label>
                <div className="arc-type-toggle">
                  <button className={newNodeForm.nodeType !== 'MAINS_QUESTION' ? 'active' : ''} onClick={()=>setNewNodeForm({...newNodeForm, nodeType:'CONCEPTUAL'})}>CONCEPTUAL</button>
                  <button className={newNodeForm.nodeType === 'MAINS_QUESTION' ? 'active' : ''} style={{'--ac':'#8b5cf6'}} onClick={()=>setNewNodeForm({...newNodeForm, nodeType:'MAINS_QUESTION'})}>QUESTION</button>
                </div>
              </div>
              <div className="arc-form-group">
                <label>{newNodeForm.nodeType === 'MAINS_QUESTION' ? 'Question Text (Internal Title)' : 'Node Title(s)'}</label>
                <textarea rows={6} value={isBulk ? newNodeForm.bulkTitles : newNodeForm.title} onChange={e=>setNewNodeForm({...newNodeForm, [isBulk ? 'bulkTitles' : 'title']: e.target.value})} placeholder={newNodeForm.nodeType === 'MAINS_QUESTION' ? "e.g. Describe the role of plate tectonics in the formation of Himalayas..." : "One title per line for bulk..."}/>
              </div>
            </div>
            <div className="arc-modal-foot">
              <button className="arc-btn arc-btn-pri" style={{ background: newNodeForm.nodeType === 'MAINS_QUESTION' ? '#8b5cf6' : '#3b82f6' }} onClick={handleCreateNode}>Initiate Forge</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .arc-root { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--bg-primary); color: var(--text-primary); font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; z-index: 1000; overflow: hidden; }
        .arc-header { height: 70px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 30px; flex-shrink: 0; }
        .arc-header-left { display: flex; align-items: center; gap: 30px; }
        .arc-logo h1 { font-size: 1rem; margin: 0; font-weight: 900; color: var(--text-primary); }
        .arc-logo span { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; }
        .arc-glow { color: var(--neural-blue); filter: drop-shadow(0 0 5px var(--neural-blue)); }
        .arc-pills { display: flex; gap: 5px; background: var(--bg-primary); padding: 3px; border-radius: 10px; }
        .arc-pills button { background: transparent; border: none; color: var(--text-muted); padding: 6px 12px; border-radius: 7px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .arc-pills button.active { background: var(--c); color: white; box-shadow: 0 0 15px var(--c); }
        .arc-header-right { display: flex; align-items: center; gap: 12px; }
        .btn-icon { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 8px; }
        .btn-icon:hover { background: var(--bg-hover); color: var(--text-primary); }
        .arc-search { background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; padding: 0 12px; gap: 10px; }
        .arc-search input { background: transparent; border: none; color: var(--text-primary); padding: 8px 0; font-size: 0.85rem; outline: none; width: 180px; }
        .arc-btn { border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .arc-btn-pri { background: var(--neural-blue); color: white; }
        .arc-btn-pri:hover { transform: translateY(-1px); box-shadow: var(--neural-glow); }
        .arc-btn-out { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .arc-exit { color: var(--text-muted); font-size: 0.75rem; text-decoration: none; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .arc-body { display: flex; flex: 1; overflow: hidden; }
        .arc-sidebar { width: 260px; background: var(--bg-secondary); border-right: 1px solid var(--border-color); padding: 24px 12px; overflow-y: auto; }
        .arc-sidebar-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 24px; font-weight: 900; letter-spacing: 0.1em; }
        .arc-side-item { width: 100%; background: transparent; border: none; display: flex; justify-content: space-between; padding: 12px 15px; color: var(--text-secondary); border-radius: 12px; cursor: pointer; font-size: 0.8rem; font-weight: 600; text-align: left; transition: 0.2s; }
        .arc-side-item:hover { background: var(--bg-hover); color: var(--text-primary); }
        .arc-side-item.empty { opacity: 0.25; }
        .arc-side-count { font-size: 0.65rem; background: var(--border-color); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; }
        .arc-canvas { flex: 1; padding: 50px; overflow-y: auto; background: var(--bg-primary); scroll-behavior: smooth; }
        .arc-loading, .arc-empty-canvas { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--text-muted); }
        .arc-empty-canvas h2 { color: var(--text-primary); margin: 20px 0 10px; font-weight: 900; }
        .arc-empty-canvas p { max-width: 400px; line-height: 1.6; margin-bottom: 30px; color: var(--text-secondary); }
        .arc-domain-box { margin-bottom: 80px; }
        .arc-domain-head { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; margin-bottom: 40px; }
        .arc-domain-head h2 { font-size: 2.2rem; font-weight: 950; margin: 0; color: var(--text-primary); letter-spacing: -0.04em; }
        .arc-topic-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 20px; padding: 32px; margin-bottom: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .arc-topic-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .arc-topic-title { display: flex; align-items: center; gap: 14px; color: var(--neural-blue); }
        .arc-topic-title h3 { font-size: 0.85rem; margin: 0; text-transform: uppercase; font-weight: 900; letter-spacing: 0.1em; color: var(--text-primary); }
        .arc-btn-mini { border: none; background: var(--bg-primary); color: var(--text-muted); font-size: 0.65rem; font-weight: 900; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
        .arc-btn-mini:hover { background: var(--bg-hover); color: var(--text-primary); }
        .arc-btn-mini-purp { color: var(--color-purple); background: rgba(168,85,247,0.1); }
        .arc-node-stack { display: flex; flex-direction: column; gap: 8px; }
        .arc-node-item { background: var(--bg-primary); border: 1px solid var(--border-color); padding: 16px 20px; border-radius: 14px; display: flex; align-items: center; gap: 24px; cursor: pointer; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .arc-node-item:hover { border-color: var(--neural-blue); background: var(--bg-secondary); }
        .arc-node-actions { display: flex; gap: 8px; opacity: 0; transition: 0.2s; }
        .arc-node-item:hover .arc-node-actions { opacity: 1; }
        .btn-action-mini { background: var(--bg-hover); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .btn-action-mini:hover { background: var(--neural-blue); color: white; border-color: var(--neural-blue); }
        .btn-danger-mini:hover { background: var(--color-rose) !important; border-color: var(--color-rose) !important; box-shadow: 0 0 15px rgba(244, 63, 94, 0.4); }
        .arc-node-group { margin-bottom: 6px; position: relative; }
        .arc-node-item.parent-active { border-color: rgba(59, 130, 246, 0.3); background: var(--bg-card); }
        
        /* Neural Branching Logic */
        .arc-subnode-stack { margin-left: 56px; margin-top: 4px; display: flex; flex-direction: column; gap: 4px; position: relative; }
        .arc-node-item.sub-item { 
          padding: 10px 18px; 
          background: var(--bg-card); 
          border-color: var(--border-color); 
          font-size: 0.9rem;
          position: relative;
        }
        .arc-node-item.sub-item::before {
          content: '';
          position: absolute;
          left: -28px;
          top: -12px;
          width: 20px;
          height: 32px;
          border-left: 2px solid rgba(59, 130, 246, 0.2);
          border-bottom: 2px solid rgba(59, 130, 246, 0.2);
          border-bottom-left-radius: 8px;
        }
        .arc-node-item.sub-item:last-child::before {
          height: 32px;
        }

        .arc-node-item.sub-item .arc-checkbox { width: 14px; height: 14px; border-radius: 4px; }
        .arc-node-item.sub-item h4 { font-size: 0.85rem; color: var(--text-secondary); }
        .arc-node-item.sub-item:hover { transform: translateX(8px); border-color: rgba(59, 130, 246, 0.4); }
        
        .arc-launch-icon-sub { color: var(--text-muted); }
        .arc-node-item.node-q { border-left: 4px solid var(--color-purple); }
        .arc-node-item.selected { border-color: var(--neural-blue); background: var(--bg-hover); }
        .arc-check-wrap { padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .arc-checkbox { width: 18px; height: 18px; border: 2px solid var(--border-hover); border-radius: 6px; transition: 0.2s; position: relative; }
        .arc-checkbox:hover { border-color: var(--neural-blue); }
        .arc-checkbox.checked { background: var(--neural-blue); border-color: var(--neural-blue); }
        .arc-checkbox.checked::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 900; }

        .arc-bulk-bar { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: var(--bg-secondary); border: 1px solid var(--neural-blue); border-radius: 20px; padding: 15px 30px; display: flex; align-items: center; gap: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); z-index: 2000; animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .arc-bulk-info { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); }
        .arc-bulk-count { background: var(--neural-blue); color: white; padding: 4px 12px; border-radius: 8px; font-size: 0.8rem; }
        .arc-bulk-actions { display: flex; gap: 12px; }
        .arc-btn-danger { background: var(--color-rose); color: white; }
        .arc-btn-danger:hover { background: #e11d48; box-shadow: 0 5px 15px rgba(244, 63, 94, 0.3); }

        /* Zen Mode Enhancements */
        .zen-active .arc-canvas { padding: 80px 15%; }
        .arc-zen-exit { 
          position: fixed; 
          top: 30px; 
          right: 30px; 
          background: var(--bg-secondary); 
          border: 1px solid var(--neural-blue); 
          color: var(--neural-blue); 
          padding: 10px 20px; 
          border-radius: 12px; 
          cursor: pointer; 
          z-index: 4000; 
          font-weight: 800;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: 0.2s;
        }
        .arc-zen-exit:hover { background: var(--neural-blue); color: white; transform: translateY(-2px); }

        /* Modals and Overlays styling */
        .arc-modal-wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 5000; padding: 20px; }
        .arc-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); }
        .arc-modal { position: relative; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 20px; padding: 32px; width: 100%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); z-index: 5010; color: var(--text-primary); }
        .arc-modal-head h2 { font-size: 1.5rem; font-weight: 900; margin: 0 0 8px; color: var(--text-primary); }
        .arc-modal-head p { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 24px; text-transform: uppercase; letter-spacing: 0.05em; }
        .arc-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .arc-form-group label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; }
        .arc-type-toggle { display: flex; gap: 8px; }
        .arc-type-toggle button { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-secondary); font-size: 0.75rem; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .arc-type-toggle button.active { background: var(--ac, var(--neural-blue)); color: white; border-color: var(--ac, var(--neural-blue)); }
        .arc-form-group textarea { background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); padding: 12px; font-family: inherit; font-size: 0.9rem; outline: none; resize: none; transition: 0.2s; }
        .arc-form-group textarea:focus { border-color: var(--neural-blue); }
        .arc-modal-foot { display: flex; justify-content: flex-end; margin-top: 10px; }

        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
}
