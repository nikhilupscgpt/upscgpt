'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  BookOpen, Plus, Save, Loader2, ArrowLeft, FileText, ExternalLink, Globe, Trash2, ChevronRight, ChevronDown, CheckSquare, FolderPlus
} from 'lucide-react';
import Link from 'next/link';
import './../content-ingestion/admin-rag.css';

export default function OptionalIngestionPage() {
  const [optionals, setOptionals] = useState([]);
  const [selectedOptionalId, setSelectedOptionalId] = useState('');
  
  // Form states
  const [language, setLanguage] = useState('en');
  const [exam, setExam] = useState('BOTH');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Tree states
  const [treeIssues, setTreeIssues] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [showAddSubnodeInput, setShowAddSubnodeInput] = useState(false);
  const [newSubnodeTitle, setNewSubnodeTitle] = useState('');
  const [subnodeLoading, setSubnodeLoading] = useState(false);
  const [addingUnderId, setAddingUnderId] = useState(null);
  
  // Ingestion history states
  const [recentContents, setRecentContents] = useState([]);

  // Load optionals on mount
  useEffect(() => {
    async function loadOptionals() {
      try {
        const res = await fetch('/api/optionals');
        if (!res.ok) throw new Error('Failed to load optional subjects');
        const data = await res.json();
        setOptionals(data);
        if (data.length > 0) {
          setSelectedOptionalId(data[0].id);
        }
      } catch (err) {
        toast.error(err.message);
      }
    }
    loadOptionals();
  }, []);

  // Fetch tree and recent contents when selected optional changes
  useEffect(() => {
    if (!selectedOptionalId) {
      setTreeIssues([]);
      setRecentContents([]);
      setSelectedNode(null);
      return;
    }

    async function loadTreeAndHistory() {
      try {
        // Fetch syllabus tree issues
        const treeRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}&tree=true`);
        if (treeRes.ok) {
          const treeData = await treeRes.json();
          setTreeIssues(treeData.tree || []);
        }

        // Fetch recent ingestion history
        const listRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          setRecentContents(listData.contents || []);
        }

        setSelectedNode(null);
        setShowAddSubnodeInput(false);
        setNewSubnodeTitle('');
      } catch (err) {
        console.error(err);
      }
    }

    loadTreeAndHistory();
  }, [selectedOptionalId]);

  const handleCreateSubnode = async (e) => {
    e.preventDefault();
    if (!newSubnodeTitle.trim()) {
      toast.error('Please enter a subnode title');
      return;
    }

    setSubnodeLoading(true);
    try {
      const res = await fetch('/api/admin/optional-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_node',
          title: newSubnodeTitle.trim(),
          parentIssueId: selectedNode ? selectedNode.id : null, // If no selected node, create root node (Paper)
          optionalId: selectedOptionalId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subnode');

      toast.success(`Node "${data.node.title}" created successfully!`);
      
      // Auto-expand the parent node so the user sees their new node
      if (selectedNode) {
        setExpandedNodes(prev => ({ ...prev, [selectedNode.id]: true }));
      }

      setNewSubnodeTitle('');
      setShowAddSubnodeInput(false);

      // Re-fetch tree
      const treeRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}&tree=true`);
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        setTreeIssues(treeData.tree || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubnodeLoading(false);
    }
  };
  
  const handleCreateSubnodeInline = async (e, parentId) => {
    e.preventDefault();
    if (!newSubnodeTitle.trim()) {
      toast.error('Please enter a subnode title');
      return;
    }

    setSubnodeLoading(true);
    try {
      const res = await fetch('/api/admin/optional-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_node',
          title: newSubnodeTitle.trim(),
          parentIssueId: parentId,
          optionalId: selectedOptionalId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subnode');

      toast.success(`Node "${data.node.title}" created successfully!`);
      
      // Auto-expand the parent node so the user sees their new node
      if (parentId) {
        setExpandedNodes(prev => ({ ...prev, [parentId]: true }));
      }

      setNewSubnodeTitle('');
      setAddingUnderId(null);

      // Re-fetch tree
      const treeRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}&tree=true`);
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        setTreeIssues(treeData.tree || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubnodeLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionalId) {
      toast.error('Please select an optional subject first');
      return;
    }
    if (!title.trim()) {
      toast.error('Please provide a title');
      return;
    }
    if (!contentMarkdown.trim()) {
      toast.error('Please provide markdown content notes');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Vectorizing content and saving to database...');

    try {
      const res = await fetch('/api/admin/optional-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionalId: selectedOptionalId,
          title: title.trim(),
          contentMarkdown: contentMarkdown.trim(),
          sourceUrl: sourceUrl.trim(),
          language,
          exam,
          issueId: selectedNode ? selectedNode.id : null // Link directly to chosen node ID
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ingestion failed');
      }

      toast.success(`Successfully ingested chunk: "${data.title}"`, { id: toastId });
      
      // Reset only variable fields
      setTitle('');
      setSourceUrl('');
      setContentMarkdown('');

      // Refresh recent list
      const listRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setRecentContents(listData.contents || []);
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Group tree issues
  const rootNodes = treeIssues.filter(n => !n.parentIssueId);

  const toggleExpand = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="cms-container" style={{ height: 'calc(100vh - 60px)', display: 'flex', overflow: 'hidden' }}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* 1. LEFT COLUMN: Syllabus Tree Manager */}
      <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}><BookOpen size={12} /> Select Optional Subject</label>
          <select 
            className="status-select" 
            style={{ width: '100%', padding: '10px', fontSize: '0.88rem', background: 'var(--bg-input)' }}
            value={selectedOptionalId} 
            onChange={(e) => setSelectedOptionalId(e.target.value)}
            disabled={loading}
          >
            {optionals.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Syllabus Hierarchy Node
            </span>
            <button 
              onClick={() => { setSelectedNode(null); setShowAddSubnodeInput(true); }}
              className="btn-ai"
              style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={10} /> Add Root
            </button>
          </div>
        </div>

        {/* Tree Display */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {rootNodes.length > 0 ? (
            rootNodes.map(paper => {
              const isPaperExpanded = !!expandedNodes[paper.id];
              const sections = treeIssues.filter(n => n.parentIssueId === paper.id);
              const isSelected = selectedNode?.id === paper.id;

              return (
                <div key={paper.id} style={{ marginBottom: '8px' }}>
                  {/* Paper level */}
                  <div 
                    onClick={() => setSelectedNode(paper)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '6px',
                      cursor: 'pointer', background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      border: isSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      fontWeight: 700, fontSize: '1rem'
                    }}
                  >
                    <span onClick={(e) => { e.stopPropagation(); toggleExpand(paper.id); }} style={{ cursor: 'pointer', padding: '2px' }}>
                      {sections.length > 0 ? (isPaperExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span style={{ width: 14 }}></span>}
                    </span>
                    <span style={{ flex: 1, color: isSelected ? 'var(--color-emerald)' : 'var(--text-primary)' }}>{paper.title}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingUnderId(addingUnderId === paper.id ? null : paper.id);
                        setNewSubnodeTitle('');
                        setSelectedNode(paper);
                      }}
                      style={{
                        background: addingUnderId === paper.id ? 'var(--color-emerald)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.72rem',
                        color: addingUnderId === paper.id ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={10} /> Sub
                    </button>
                  </div>

                  {/* Inline Add form under Paper */}
                  {addingUnderId === paper.id && (
                    <form 
                      onSubmit={(e) => handleCreateSubnodeInline(e, paper.id)}
                      style={{ display: 'flex', gap: '6px', padding: '6px 8px 6px 28px', borderLeft: '1px dashed rgba(255,255,255,0.06)' }}
                    >
                      <input 
                        type="text" 
                        className="search-input" 
                        style={{ padding: '4px 8px', fontSize: '0.85rem', flex: 1, height: '28px' }}
                        placeholder="New Section title..."
                        value={newSubnodeTitle}
                        onChange={(e) => setNewSubnodeTitle(e.target.value)}
                        disabled={subnodeLoading}
                        required
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        disabled={subnodeLoading} 
                        className="btn-save" 
                        style={{ padding: '0 8px', fontSize: '0.75rem', height: '28px', minWidth: '45px', justifyContent: 'center' }}
                      >
                        Add
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setAddingUnderId(null); setNewSubnodeTitle(''); }} 
                        className="btn-ai" 
                        style={{ padding: '0 6px', fontSize: '0.75rem', height: '28px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                      >
                        X
                      </button>
                    </form>
                  )}

                  {/* Sections list */}
                  {isPaperExpanded && sections.map(section => {
                    const isSectExpanded = !!expandedNodes[section.id];
                    const chapters = treeIssues.filter(n => n.parentIssueId === section.id);
                    const isSectSelected = selectedNode?.id === section.id;

                    return (
                      <div key={section.id} style={{ marginLeft: '16px', borderLeft: '1px dashed rgba(255,255,255,0.06)' }}>
                        <div 
                          onClick={() => setSelectedNode(section)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '6px',
                            cursor: 'pointer', background: isSectSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            border: isSectSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                            fontSize: '0.94rem', fontWeight: 600, color: isSectSelected ? 'var(--color-emerald)' : 'var(--text-secondary)'
                          }}
                        >
                          <span onClick={(e) => { e.stopPropagation(); toggleExpand(section.id); }} style={{ cursor: 'pointer', padding: '2px' }}>
                            {chapters.length > 0 ? (isSectExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <span style={{ width: 12 }}></span>}
                          </span>
                          <span style={{ flex: 1 }}>{section.title}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingUnderId(addingUnderId === section.id ? null : section.id);
                              setNewSubnodeTitle('');
                              setSelectedNode(section);
                            }}
                            style={{
                              background: addingUnderId === section.id ? 'var(--color-emerald)' : 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              fontSize: '0.7rem',
                              color: addingUnderId === section.id ? '#fff' : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              cursor: 'pointer'
                            }}
                          >
                            <Plus size={8} /> Sub
                          </button>
                        </div>

                        {/* Inline Add form under Section */}
                        {addingUnderId === section.id && (
                          <form 
                            onSubmit={(e) => handleCreateSubnodeInline(e, section.id)}
                            style={{ display: 'flex', gap: '6px', padding: '4px 8px 4px 20px', marginLeft: '16px', borderLeft: '1px dashed rgba(255,255,255,0.06)' }}
                          >
                            <input 
                              type="text" 
                              className="search-input" 
                              style={{ padding: '4px 8px', fontSize: '0.82rem', flex: 1, height: '26px' }}
                              placeholder="New Topic/Chapter title..."
                              value={newSubnodeTitle}
                              onChange={(e) => setNewSubnodeTitle(e.target.value)}
                              disabled={subnodeLoading}
                              required
                              autoFocus
                            />
                            <button 
                              type="submit" 
                              disabled={subnodeLoading} 
                              className="btn-save" 
                              style={{ padding: '0 6px', fontSize: '0.72rem', height: '26px', minWidth: '40px', justifyContent: 'center' }}
                            >
                              Add
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setAddingUnderId(null); setNewSubnodeTitle(''); }} 
                              className="btn-ai" 
                              style={{ padding: '0 5px', fontSize: '0.72rem', height: '26px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                            >
                              X
                            </button>
                          </form>
                        )}

                        {/* Chapters list */}
                        {isSectExpanded && chapters.map(chapter => {
                          const isChapExpanded = !!expandedNodes[chapter.id];
                          const subtopics = treeIssues.filter(n => n.parentIssueId === chapter.id);
                          const isChapSelected = selectedNode?.id === chapter.id;

                          return (
                            <div key={chapter.id} style={{ marginLeft: '16px', borderLeft: '1px dashed rgba(255,255,255,0.06)' }}>
                              <div 
                                onClick={() => setSelectedNode(chapter)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '6px',
                                  cursor: 'pointer', background: isChapSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                  border: isChapSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                                  fontSize: '0.88rem', color: isChapSelected ? 'var(--color-emerald)' : 'var(--text-secondary)'
                                }}
                              >
                                <span onClick={(e) => { e.stopPropagation(); toggleExpand(chapter.id); }} style={{ cursor: 'pointer', padding: '2px' }}>
                                  {subtopics.length > 0 ? (isChapExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />) : <span style={{ width: 10 }}></span>}
                                </span>
                                <span style={{ flex: 1 }}>{chapter.title}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAddingUnderId(addingUnderId === chapter.id ? null : chapter.id);
                                    setNewSubnodeTitle('');
                                    setSelectedNode(chapter);
                                  }}
                                  style={{
                                    background: addingUnderId === chapter.id ? 'var(--color-emerald)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    padding: '1px 4px',
                                    fontSize: '0.68rem',
                                    color: addingUnderId === chapter.id ? '#fff' : 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Plus size={8} /> Sub
                                </button>
                              </div>

                              {/* Inline Add form under Chapter */}
                              {addingUnderId === chapter.id && (
                                <form 
                                  onSubmit={(e) => handleCreateSubnodeInline(e, chapter.id)}
                                  style={{ display: 'flex', gap: '6px', padding: '4px 8px 4px 20px', marginLeft: '16px', borderLeft: '1px dashed rgba(255,255,255,0.06)' }}
                                >
                                  <input 
                                    type="text" 
                                    className="search-input" 
                                    style={{ padding: '3px 6px', fontSize: '0.8rem', flex: 1, height: '24px' }}
                                    placeholder="New Subtopic title..."
                                    value={newSubnodeTitle}
                                    onChange={(e) => setNewSubnodeTitle(e.target.value)}
                                    disabled={subnodeLoading}
                                    required
                                    autoFocus
                                  />
                                  <button 
                                    type="submit" 
                                    disabled={subnodeLoading} 
                                    className="btn-save" 
                                    style={{ padding: '0 6px', fontSize: '0.7rem', height: '24px', minWidth: '35px', justifyContent: 'center' }}
                                  >
                                    Add
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => { setAddingUnderId(null); setNewSubnodeTitle(''); }} 
                                    className="btn-ai" 
                                    style={{ padding: '0 4px', fontSize: '0.7rem', height: '24px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                                  >
                                    X
                                  </button>
                                </form>
                              )}

                              {/* Subtopics list */}
                              {isChapExpanded && subtopics.map(subtopic => {
                                const isSubSelected = selectedNode?.id === subtopic.id;
                                const childNodes = treeIssues.filter(n => n.parentIssueId === subtopic.id);
                                const isSubExpanded = !!expandedNodes[subtopic.id];

                                return (
                                  <div key={subtopic.id} style={{ marginLeft: '16px', borderLeft: '1px dashed rgba(255,255,255,0.06)' }}>
                                    <div 
                                      onClick={() => setSelectedNode(subtopic)}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '6px',
                                        cursor: 'pointer', background: isSubSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        border: isSubSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                                        fontSize: '0.82rem', color: isSubSelected ? 'var(--color-emerald)' : 'var(--text-muted)'
                                      }}
                                    >
                                      <span onClick={(e) => { e.stopPropagation(); toggleExpand(subtopic.id); }} style={{ cursor: 'pointer', padding: '2px' }}>
                                        {childNodes.length > 0 ? (isSubExpanded ? <ChevronDown size={8} /> : <ChevronRight size={8} />) : <span style={{ width: 8 }}></span>}
                                      </span>
                                      <span style={{ flex: 1 }}>• {subtopic.title}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAddingUnderId(addingUnderId === subtopic.id ? null : subtopic.id);
                                          setNewSubnodeTitle('');
                                          setSelectedNode(subtopic);
                                        }}
                                        style={{
                                          background: addingUnderId === subtopic.id ? 'var(--color-emerald)' : 'rgba(255,255,255,0.03)',
                                          border: '1px solid var(--border-color)',
                                          borderRadius: '4px',
                                          padding: '1px 3px',
                                          fontSize: '0.65rem',
                                          color: addingUnderId === subtopic.id ? '#fff' : 'var(--text-secondary)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '2px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <Plus size={6} /> Sub
                                      </button>
                                    </div>

                                    {/* Inline Add Node form under Subtopic */}
                                    {addingUnderId === subtopic.id && (
                                      <form 
                                        onSubmit={(e) => handleCreateSubnodeInline(e, subtopic.id)}
                                        style={{ display: 'flex', gap: '6px', padding: '4px 8px 4px 16px', marginLeft: '8px', borderLeft: '1px dashed rgba(255,255,255,0.06)' }}
                                      >
                                        <input 
                                          type="text" 
                                          className="search-input" 
                                          style={{ padding: '3px 6px', fontSize: '0.78rem', flex: 1, height: '22px' }}
                                          placeholder="New item..."
                                          value={newSubnodeTitle}
                                          onChange={(e) => setNewSubnodeTitle(e.target.value)}
                                          disabled={subnodeLoading}
                                          required
                                          autoFocus
                                        />
                                        <button 
                                          type="submit" 
                                          disabled={subnodeLoading} 
                                          className="btn-save" 
                                          style={{ padding: '0 6px', fontSize: '0.65rem', height: '22px', minWidth: '35px', justifyContent: 'center' }}
                                        >
                                          Add
                                        </button>
                                        <button 
                                          type="button" 
                                          onClick={() => { setAddingUnderId(null); setNewSubnodeTitle(''); }} 
                                          className="btn-ai" 
                                          style={{ padding: '0 4px', fontSize: '0.65rem', height: '22px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                                        >
                                          X
                                        </button>
                                      </form>
                                    )}

                                    {/* Sub-sub-topics */}
                                    {isSubExpanded && childNodes.map(child => {
                                      const isChildSelected = selectedNode?.id === child.id;
                                      return (
                                        <div 
                                          key={child.id}
                                          onClick={() => setSelectedNode(child)}
                                          style={{
                                            marginLeft: '20px', padding: '3px 6px', borderRadius: '4px',
                                            cursor: 'pointer', background: isChildSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                            border: isChildSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                                            fontSize: '0.76rem', color: isChildSelected ? 'var(--color-emerald)' : 'var(--text-muted)'
                                          }}
                                        >
                                          - {child.title}
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No syllabus tree loaded. Create a Root Paper Node above to start.
            </div>
          )}
        </div>

        {/* Tree Subnode Creation Panel */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          {showAddSubnodeInput ? (
            <form onSubmit={handleCreateSubnode} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {selectedNode ? (
                  <>Add subnode under: <strong style={{ color: 'var(--color-emerald)' }}>"{selectedNode.title}"</strong></>
                ) : (
                  <>Create new <strong style={{ color: 'var(--color-emerald)' }}>Root Node (Paper)</strong></>
                )}
              </div>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Enter node title..."
                value={newSubnodeTitle}
                onChange={(e) => setNewSubnodeTitle(e.target.value)}
                disabled={subnodeLoading}
                required
                autoFocus
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="submit" 
                  className="btn-save" 
                  style={{ flex: 1, padding: '8px', fontSize: '0.75rem', justifyContent: 'center' }}
                  disabled={subnodeLoading}
                >
                  {subnodeLoading ? 'Adding...' : 'Add Node'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowAddSubnodeInput(false); setNewSubnodeTitle(''); }}
                  className="btn-ai"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px', fontSize: '0.75rem' }}
                  disabled={subnodeLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setShowAddSubnodeInput(true)}
              className="btn-ai"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.8rem', background: selectedNode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)', color: selectedNode ? 'var(--color-emerald)' : 'var(--text-primary)', border: selectedNode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)' }}
            >
              {selectedNode ? (
                <><FolderPlus size={14} style={{ marginRight: '6px' }} /> Create Subnode under selected</>
              ) : (
                <><Plus size={14} style={{ marginRight: '6px' }} /> Create Root Node (Paper)</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. CENTER COLUMN: Ingestion Form */}
      <div style={{ flex: 2, padding: '32px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px 16px',
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <ArrowLeft size={16} /> Back
            </button>
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Optional Syllabus Ingestion Desk
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Vector chunking compiler & explicit node binder. Select a node from the left hierarchy tree.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          
          {/* Node Binder Box */}
          <div style={{
            padding: '16px', background: selectedNode ? 'rgba(16, 185, 129, 0.04)' : 'rgba(245, 158, 11, 0.04)',
            border: selectedNode ? '1px solid rgba(16, 185, 129, 0.2)' : '1px dashed rgba(245, 158, 11, 0.2)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: selectedNode ? 'var(--color-emerald)' : 'var(--color-yellow)', letterSpacing: '0.05em' }}>
                {selectedNode ? '🎯 Linked Syllabus Node' : '⚠️ No Node Linked'}
              </div>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
                {selectedNode ? selectedNode.title : 'Unmapped Chunk (Will rely on keyword matching fallback)'}
              </strong>
            </div>
            {selectedNode && (
              <button 
                type="button" 
                onClick={() => setSelectedNode(null)} 
                className="btn-ai"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '4px 8px', fontSize: '0.7rem' }}
              >
                Clear Link
              </button>
            )}
          </div>

          {/* Row 1: Language + Exam Scope */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label"><Globe size={12} /> Target Language</label>
              <select 
                className="status-select" 
                style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                disabled={loading}
              >
                <option value="en">English (default)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            <div>
              <label className="form-label"><FileText size={12} /> Exam Scope</label>
              <select 
                className="status-select" 
                style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                value={exam} 
                onChange={(e) => setExam(e.target.value)}
                disabled={loading}
              >
                <option value="BOTH">BOTH (Unified)</option>
                <option value="UPSC">UPSC Only</option>
                <option value="MPSC">MPSC Only</option>
              </select>
            </div>
          </div>

          {/* Row 2: Title + Reference Source */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Notes Chunk Title</label>
              <input 
                type="text" 
                className="search-input" 
                style={{ padding: '10px' }}
                placeholder="Enter a title for this study notes chunk..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="form-label">Reference / Source (e.g. Savindra Singh)</label>
              <input 
                type="text" 
                className="search-input" 
                style={{ padding: '10px' }}
                placeholder="Savindra Singh, Vision IAS..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Row 3: Markdown Editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Content Notes (Markdown formatted)</label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Markdown supported. Chunks will be embedded dynamically into pgvector storage.
              </span>
            </div>
            <textarea 
              className="markdown-textarea"
              style={{ height: '260px', fontFamily: 'monospace', fontSize: '0.82rem' }}
              placeholder="# Core Concepts...&#10;Paste details here..."
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            className="btn-save" 
            style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
                Vectorizing & Linking Content...
              </>
            ) : (
              <>
                <Save size={18} style={{ marginRight: '8px' }} /> Ingest & Index Optional Material
              </>
            )}
          </button>
        </form>
      </div>

      {/* 3. RIGHT COLUMN: Recent Ingestions */}
      <div style={{ flex: 1, borderLeft: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Recent Ingestions
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
          Study chunks already vector-indexed.
        </p>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentContents.length > 0 ? (
            recentContents.map(chunk => (
              <div key={chunk.id} style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{chunk.title}</strong>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                    background: chunk.language === 'mr' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: chunk.language === 'mr' ? '#34d399' : '#60a5fa'
                  }}>
                    {chunk.language === 'mr' ? 'मराठी' : 'EN'}
                  </span>
                </div>
                
                {chunk.issue && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-emerald)', fontWeight: 600 }}>
                    🎯 Link: {chunk.issue.title}
                  </div>
                )}
                
                {chunk.sourceUrl && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ExternalLink size={10} /> Source: <span>{chunk.sourceUrl}</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Exam: <strong style={{ color: 'var(--text-secondary)' }}>{chunk.exam}</strong>
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {new Date(chunk.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No optional notes chunks found. Start by ingesting one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
