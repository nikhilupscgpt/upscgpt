'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  BookOpen, Plus, Save, Loader2, ArrowLeft, FileText, ExternalLink, Globe, Trash2, 
  ChevronRight, ChevronDown, FolderPlus, UploadCloud, Sparkles, 
  Code, Eye, RefreshCw, X, FileCheck, ArrowUp, ArrowDown, GripVertical
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./../content-ingestion/admin-rag.css";

// ════════════════════════════════════════════════════════════════════════
// RECURSIVE TREE NODE COMPONENT
// ════════════════════════════════════════════════════════════════════════
function TreeNode({ 
  node, level, childrenMap, expandedNodes, toggleExpand, 
  selectedNode, setSelectedNode, addingUnderId, setAddingUnderId,
  newSubnodeTitle, setNewSubnodeTitle, handleCreateSubnodeInline,
  subnodeLoading, handleDeleteNode, handleMoveNode, siblings
}) {
  const children = childrenMap[node.id] || [];
  const isExpanded = !!expandedNodes[node.id];
  const isSelected = selectedNode?.id === node.id;
  const hasChildren = children.length > 0;

  // Find position in siblings for move up/down
  const siblingIndex = siblings ? siblings.findIndex(s => s.id === node.id) : -1;
  const canMoveUp = siblingIndex > 0;
  const canMoveDown = siblings && siblingIndex < siblings.length - 1;

  const indent = Math.min(level * 16, 64);
  const fontSize = level === 0 ? '0.92rem' : level === 1 ? '0.85rem' : '0.8rem';
  const fontWeight = level === 0 ? 700 : level === 1 ? 600 : 400;

  return (
    <div style={{ marginLeft: `${indent}px` }}>
      {/* Node Row */}
      <div
        onClick={() => setSelectedNode(node)}
        style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px", borderRadius: "6px",
          cursor: "pointer", marginBottom: "2px",
          background: isSelected ? "rgba(16, 185, 129, 0.1)" : "transparent",
          border: isSelected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
          fontSize, fontWeight, transition: "all 0.15s ease"
        }}
        className="tree-node-row"
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <span
            onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
            style={{ display: "inline-flex", cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0 }}
          >
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        ) : (
          <span style={{ width: "13px", flexShrink: 0 }} />
        )}

        {/* Title */}
        <span style={{
          flex: 1, color: isSelected ? "var(--color-emerald)" : "var(--text-primary)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>
          {node.title}
        </span>

        {/* Action Buttons (visible on hover via CSS, always visible when selected) */}
        <div
          className="tree-node-actions"
          style={{
            display: "flex", alignItems: "center", gap: "2px", flexShrink: 0,
            opacity: isSelected ? 1 : 0, transition: "opacity 0.15s"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Move Up */}
          {canMoveUp && (
            <button
              onClick={() => handleMoveNode(node.id, 'up', siblings)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px", display: "flex" }}
              title="Move Up"
            >
              <ArrowUp size={12} />
            </button>
          )}
          {/* Move Down */}
          {canMoveDown && (
            <button
              onClick={() => handleMoveNode(node.id, 'down', siblings)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px", display: "flex" }}
              title="Move Down"
            >
              <ArrowDown size={12} />
            </button>
          )}
          {/* Add Sub */}
          <button
            onClick={() => setAddingUnderId(node.id)}
            className="btn-ai"
            style={{ padding: "2px 6px", fontSize: "0.62rem" }}
          >
            + Sub
          </button>
          {/* Delete */}
          <button
            onClick={() => handleDeleteNode(node.id, node.title, children.length)}
            style={{
              background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171", borderRadius: "4px", padding: "2px 5px", cursor: "pointer",
              display: "flex", alignItems: "center", fontSize: "0.6rem"
            }}
            title="Delete node and all children"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* Inline Add Subnode Form */}
      {addingUnderId === node.id && (
        <form
          onSubmit={(e) => handleCreateSubnodeInline(e, node.id)}
          style={{ padding: "6px 0 6px 16px", display: "flex", gap: "6px", alignItems: "center" }}
        >
          <input
            type="text"
            className="search-input"
            placeholder={`Add subnode under "${node.title.substring(0, 20)}..."`}
            value={newSubnodeTitle}
            onChange={(e) => setNewSubnodeTitle(e.target.value)}
            autoFocus
            style={{ flex: 1, padding: "5px 8px", fontSize: "0.78rem" }}
          />
          <button type="submit" className="btn-save" style={{ padding: "4px 8px" }} disabled={subnodeLoading}>
            {subnodeLoading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
          </button>
          <button type="button" className="btn-ai" style={{ padding: "4px 8px" }} onClick={() => setAddingUnderId(null)}>
            ✕
          </button>
        </form>
      )}

      {/* Recursive Children */}
      {isExpanded && children
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(child => (
          <TreeNode
            key={child.id}
            node={child}
            level={level + 1}
            childrenMap={childrenMap}
            expandedNodes={expandedNodes}
            toggleExpand={toggleExpand}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            addingUnderId={addingUnderId}
            setAddingUnderId={setAddingUnderId}
            newSubnodeTitle={newSubnodeTitle}
            setNewSubnodeTitle={setNewSubnodeTitle}
            handleCreateSubnodeInline={handleCreateSubnodeInline}
            subnodeLoading={subnodeLoading}
            handleDeleteNode={handleDeleteNode}
            handleMoveNode={handleMoveNode}
            siblings={children.sort((a, b) => a.orderIndex - b.orderIndex)}
          />
        ))}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════
// MAIN CLIENT COMPONENT
// ════════════════════════════════════════════════════════════════════════
export default function OptionalIngestionClient({ session }) {
  const [optionals, setOptionals] = useState([]);
  const [selectedOptionalId, setSelectedOptionalId] = useState("");
  
  // Ingestion Mode: 'manual' | 'doc' | 'html'
  const [activeTab, setActiveTab] = useState("manual");

  // Form states (Manual Entry)
  const [language, setLanguage] = useState("en");
  const [exam, setExam] = useState("BOTH");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [loading, setLoading] = useState(false);

  // HTML Paste states
  const [htmlTitle, setHtmlTitle] = useState("");
  const [htmlSource, setHtmlSource] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [htmlLanguage, setHtmlLanguage] = useState("en");
  const [htmlExam, setHtmlExam] = useState("BOTH");
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState(false);
  
  // Direct PDF / Doc Ingestion states
  const [docFile, setDocFile] = useState(null);
  const [docLanguage, setDocLanguage] = useState("en");
  const [docExam, setDocExam] = useState("BOTH");
  const [parsingDoc, setParsingDoc] = useState(false);
  const [parseProgressText, setParseProgressText] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [batchIngesting, setBatchIngesting] = useState(false);
  const [previewModes, setPreviewModes] = useState({});
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Tree states
  const [treeIssues, setTreeIssues] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [showAddSubnodeInput, setShowAddSubnodeInput] = useState(false);
  const [newSubnodeTitle, setNewSubnodeTitle] = useState("");
  const [subnodeLoading, setSubnodeLoading] = useState(false);
  const [addingUnderId, setAddingUnderId] = useState(null);
  
  // Ingestion history states
  const [recentContents, setRecentContents] = useState([]);

  // ── Build children map from flat tree ──
  const childrenMap = {};
  treeIssues.forEach(n => {
    const key = n.parentIssueId || '__root__';
    if (!childrenMap[key]) childrenMap[key] = [];
    childrenMap[key].push(n);
  });
  // Sort each group by orderIndex
  Object.keys(childrenMap).forEach(key => {
    childrenMap[key].sort((a, b) => a.orderIndex - b.orderIndex);
  });
  const rootNodes = childrenMap['__root__'] || [];

  // ── Refresh tree helper ──
  const refreshTree = useCallback(async () => {
    if (!selectedOptionalId) return;
    try {
      const treeRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}&tree=true`);
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        setTreeIssues(treeData.tree || []);
      }
    } catch (err) {
      console.error("Failed to refresh tree:", err);
    }
  }, [selectedOptionalId]);

  const refreshContents = useCallback(async () => {
    if (!selectedOptionalId) return;
    try {
      const listRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setRecentContents(listData.contents || []);
      }
    } catch (err) {
      console.error("Failed to refresh contents:", err);
    }
  }, [selectedOptionalId]);

  // Load optionals on mount
  useEffect(() => {
    async function loadOptionals() {
      try {
        const res = await fetch("/api/optionals");
        if (!res.ok) throw new Error("Failed to load optional subjects");
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
    refreshTree();
    refreshContents();
    setSelectedNode(null);
    setShowAddSubnodeInput(false);
    setNewSubnodeTitle("");
  }, [selectedOptionalId, refreshTree, refreshContents]);

  // ── Tree Operations ──
  const toggleExpand = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSubnodeInline = async (e, parentId) => {
    e.preventDefault();
    if (!newSubnodeTitle.trim()) {
      toast.error("Please enter a subnode title");
      return;
    }

    setSubnodeLoading(true);
    try {
      const res = await fetch("/api/admin/optional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_node",
          title: newSubnodeTitle.trim(),
          parentIssueId: parentId || null,
          optionalId: selectedOptionalId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subnode");

      toast.success(`Node "${data.node.title}" created!`);
      if (parentId) setExpandedNodes(prev => ({ ...prev, [parentId]: true }));
      setNewSubnodeTitle("");
      setAddingUnderId(null);
      setShowAddSubnodeInput(false);
      await refreshTree();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubnodeLoading(false);
    }
  };

  const handleDeleteNode = async (nodeId, nodeTitle, childCount) => {
    const msg = childCount > 0
      ? `Delete "${nodeTitle}" and all ${childCount} child node(s)? This cannot be undone.`
      : `Delete "${nodeTitle}"? This cannot be undone.`;
    
    if (!confirm(msg)) return;

    const toastId = toast.loading(`Deleting "${nodeTitle}"...`);
    try {
      const res = await fetch("/api/admin/optional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_node",
          nodeId,
          optionalId: selectedOptionalId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete node");

      toast.success(`Deleted ${data.deletedCount} node(s)`, { id: toastId });
      if (selectedNode?.id === nodeId) setSelectedNode(null);
      await refreshTree();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleMoveNode = async (nodeId, direction, siblings) => {
    const idx = siblings.findIndex(s => s.id === nodeId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const updates = [
      { id: siblings[idx].id, orderIndex: siblings[swapIdx].orderIndex },
      { id: siblings[swapIdx].id, orderIndex: siblings[idx].orderIndex }
    ];

    try {
      const res = await fetch("/api/admin/optional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder_nodes", updates })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reorder");
      await refreshTree();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Manual Chunk Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionalId) { toast.error("Select an optional subject first"); return; }
    if (!title.trim()) { toast.error("Please provide a title"); return; }
    if (!contentMarkdown.trim()) { toast.error("Please provide markdown content"); return; }

    setLoading(true);
    const toastId = toast.loading("Vectorizing content and saving...");
    try {
      const res = await fetch("/api/admin/optional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionalId: selectedOptionalId,
          title: title.trim(),
          contentMarkdown: contentMarkdown.trim(),
          sourceUrl: sourceUrl.trim(),
          language, exam,
          issueId: selectedNode ? selectedNode.id : null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ingestion failed");
      toast.success(`Ingested: "${data.title}"`, { id: toastId });
      setTitle(""); setSourceUrl(""); setContentMarkdown("");
      await refreshContents();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── HTML Paste Submit ──
  const handleHtmlSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionalId) { toast.error("Select an optional subject first"); return; }
    if (!htmlTitle.trim()) { toast.error("Please provide a title"); return; }
    if (!htmlContent.trim()) { toast.error("Please paste HTML content"); return; }

    setHtmlLoading(true);
    const toastId = toast.loading("Saving HTML content...");
    try {
      const markedContent = `<!-- HTML_CONTENT -->\n${htmlContent.trim()}`;
      const res = await fetch("/api/admin/optional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionalId: selectedOptionalId,
          title: htmlTitle.trim(),
          contentMarkdown: markedContent,
          sourceUrl: htmlSource.trim(),
          language: htmlLanguage,
          exam: htmlExam,
          issueId: selectedNode ? selectedNode.id : null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "HTML ingestion failed");
      toast.success(`HTML page saved: "${data.title}"`, { id: toastId });
      setHtmlTitle(""); setHtmlSource(""); setHtmlContent(""); setHtmlPreview(false);
      await refreshContents();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setHtmlLoading(false);
    }
  };

  // ── Document Parse Handlers ──
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setDocFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) setDocFile(e.target.files[0]);
  };

  const handleParseDocument = async () => {
    if (!docFile) { toast.error("Select or drop a document first"); return; }
    if (!selectedOptionalId) { toast.error("Select an optional subject first"); return; }

    setParsingDoc(true);
    setParseProgressText("Uploading document & analyzing layout...");
    const toastId = toast.loading("Extracting layout, tables, and headings...");
    try {
      const formData = new FormData();
      formData.append("file", docFile);
      formData.append("optionalId", selectedOptionalId);
      formData.append("language", docLanguage);
      formData.append("exam", docExam);
      setParseProgressText("Reconstructing layout & matching syllabus nodes...");
      
      const res = await fetch("/api/admin/optional-content/parse-doc", { method: "POST", body: formData });
      const rawText = await res.text();
      let data;
      try { data = JSON.parse(rawText); }
      catch {
        if (res.status === 413 || rawText.includes("Request Entity Too Large"))
          throw new Error("File too large. Upload a smaller section or compress the PDF.");
        throw new Error(rawText || `Server error (${res.status})`);
      }
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
      setParsedData(data);
      toast.success(`Extracted ${data.chunks.length} chunks!`, { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setParsingDoc(false);
      setParseProgressText("");
    }
  };

  const handleChunkChange = (chunkId, field, value) => {
    if (!parsedData) return;
    setParsedData(prev => ({
      ...prev,
      chunks: prev.chunks.map(c => c.id === chunkId ? { ...c, [field]: value } : c)
    }));
  };

  const handleDeleteChunk = (chunkId) => {
    if (!parsedData) return;
    setParsedData(prev => ({
      ...prev,
      chunks: prev.chunks.filter(c => c.id !== chunkId)
    }));
    toast.success("Chunk removed from batch");
  };

  const toggleChunkPreview = (chunkId) => {
    setPreviewModes(prev => ({ ...prev, [chunkId]: prev[chunkId] === "raw" ? "preview" : "raw" }));
  };

  const handleBatchIngest = async () => {
    if (!parsedData?.chunks?.length) { toast.error("No chunks to ingest"); return; }
    setBatchIngesting(true);
    const toastId = toast.loading(`Vectorizing ${parsedData.chunks.length} chunks...`);
    try {
      const res = await fetch("/api/admin/optional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_ingest",
          optionalId: selectedOptionalId,
          chunks: parsedData.chunks.map(c => ({
            title: c.title, contentMarkdown: c.contentMarkdown,
            source: c.source || parsedData.source || "",
            language: docLanguage, exam: docExam,
            issueId: c.suggestedNodeId || null
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch ingestion failed");
      toast.success(`🎉 Indexed ${data.count} chunks!`, { id: toastId });
      setDocFile(null); setParsedData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refreshContents();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setBatchIngesting(false);
    }
  };

  // ── View content in new window ──
  const handleViewContent = (contentId) => {
    window.open(`/admin/optional-content/viewer/${contentId}`, '_blank');
  };

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="cms-container" style={{ height: "calc(100vh - 60px)", display: "flex", overflow: "hidden" }}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* ═══ COLUMN 1: SYLLABUS TREE ═══ */}
      <div style={{ flex: 1, borderRight: "1px solid var(--border-color)", display: "flex", flexDirection: "column", background: "var(--bg-secondary)", overflow: "hidden" }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border-color)" }}>
          <label className="form-label" style={{ marginBottom: "8px" }}><BookOpen size={12} /> Select Optional Subject</label>
          <select 
            className="status-select" 
            style={{ width: "100%", padding: "10px", fontSize: "0.88rem", background: "var(--bg-input)" }}
            value={selectedOptionalId} 
            onChange={(e) => setSelectedOptionalId(e.target.value)}
            disabled={loading || parsingDoc || batchIngesting}
          >
            {optionals.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Syllabus Tree ({treeIssues.length} nodes)
            </span>
            <button 
              onClick={() => { setSelectedNode(null); setShowAddSubnodeInput(true); }}
              className="btn-ai"
              style={{ padding: "4px 10px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Plus size={10} /> Add Root
            </button>
          </div>
        </div>

        {/* Recursive Tree Display */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
          <style>{`
            .tree-node-row:hover .tree-node-actions { opacity: 1 !important; }
          `}</style>
          {rootNodes.length > 0 ? (
            rootNodes.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                childrenMap={childrenMap}
                expandedNodes={expandedNodes}
                toggleExpand={toggleExpand}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                addingUnderId={addingUnderId}
                setAddingUnderId={setAddingUnderId}
                newSubnodeTitle={newSubnodeTitle}
                setNewSubnodeTitle={setNewSubnodeTitle}
                handleCreateSubnodeInline={handleCreateSubnodeInline}
                subnodeLoading={subnodeLoading}
                handleDeleteNode={handleDeleteNode}
                handleMoveNode={handleMoveNode}
                siblings={rootNodes}
              />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              No syllabus tree nodes found. Click "Add Root" to create Paper I or Paper II.
            </div>
          )}
        </div>

        {/* Global Add Node Input */}
        {showAddSubnodeInput && (
          <form onSubmit={(e) => handleCreateSubnodeInline(e, selectedNode?.id || null)} style={{ padding: "16px", borderTop: "1px solid var(--border-color)", background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {selectedNode ? `Add Subnode under "${selectedNode.title}"` : "Add Root Node (e.g. Paper I)"}
            </div>
            <input type="text" className="search-input" placeholder="Node title..." value={newSubnodeTitle} onChange={(e) => setNewSubnodeTitle(e.target.value)} autoFocus />
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-save" style={{ flex: 1, justifyContent: "center" }} disabled={subnodeLoading}>
                {subnodeLoading ? <Loader2 className="animate-spin" size={14} /> : "Save Node"}
              </button>
              <button type="button" className="btn-ai" onClick={() => setShowAddSubnodeInput(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ padding: "12px", borderTop: "1px solid var(--border-color)" }}>
          <button 
            onClick={() => setShowAddSubnodeInput(true)} 
            className="btn-ai"
            style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "0.82rem" }}
          >
            <FolderPlus size={14} style={{ marginRight: "6px" }} />
            {selectedNode ? "Create Subnode under selected" : "Create Root Paper Node"}
          </button>
        </div>
      </div>

      {/* ═══ COLUMN 2: INGESTION DESK ═══ */}
      <div style={{ flex: 2, padding: "28px 32px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/admin" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                <ArrowLeft size={16} /> Back
              </button>
            </Link>
            <div>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
                Optional Syllabus Ingestion Desk
              </h1>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                Vector chunking, node binding & layout preservation.
              </p>
            </div>
          </div>

          {/* 3-Tab Mode Switcher */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "3px" }}>
            {[
              { key: "manual", label: "Manual Form", icon: <FileText size={13} />, color: null },
              { key: "doc", label: "PDF / Doc", icon: <Sparkles size={13} color="#10b981" />, activeGrad: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))" },
              { key: "html", label: "Paste HTML", icon: <Code size={13} color="#f59e0b" />, activeGrad: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))" }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: activeTab === tab.key ? (tab.activeGrad || "rgba(255,255,255,0.12)") : "transparent",
                  color: activeTab === tab.key ? (tab.key === "doc" ? "var(--color-emerald)" : tab.key === "html" ? "#f59e0b" : "#fff") : "var(--text-secondary)",
                  fontWeight: activeTab === tab.key ? 700 : 600, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px"
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB 1: MANUAL CHUNK ENTRY ── */}
        {activeTab === "manual" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", background: "var(--bg-card)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
            {/* Node Binder */}
            <div style={{ padding: "16px", background: selectedNode ? "rgba(16,185,129,0.04)" : "rgba(245,158,11,0.04)", border: selectedNode ? "1px solid rgba(16,185,129,0.2)" : "1px dashed rgba(245,158,11,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: selectedNode ? "var(--color-emerald)" : "var(--color-yellow)", letterSpacing: "0.05em" }}>
                  {selectedNode ? "🎯 Linked Syllabus Node" : "⚠️ No Node Linked"}
                </div>
                <strong style={{ fontSize: "0.92rem", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                  {selectedNode ? selectedNode.title : "Unmapped Chunk (keyword matching fallback)"}
                </strong>
              </div>
              {selectedNode && (
                <button type="button" onClick={() => setSelectedNode(null)} className="btn-ai" style={{ padding: "4px 8px", fontSize: "0.7rem" }}>Clear Link</button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label"><Globe size={12} /> Target Language</label>
                <select className="status-select" style={{ width: "100%", padding: "10px" }} value={language} onChange={(e) => setLanguage(e.target.value)} disabled={loading}>
                  <option value="en">English</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
              <div>
                <label className="form-label"><FileText size={12} /> Exam Scope</label>
                <select className="status-select" style={{ width: "100%", padding: "10px" }} value={exam} onChange={(e) => setExam(e.target.value)} disabled={loading}>
                  <option value="BOTH">BOTH</option><option value="UPSC">UPSC</option><option value="MPSC">MPSC</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label">Notes Chunk Title</label>
                <input type="text" className="search-input" style={{ padding: "10px" }} placeholder="Enter chunk title..." value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} required />
              </div>
              <div>
                <label className="form-label">Reference / Source</label>
                <input type="text" className="search-input" style={{ padding: "10px" }} placeholder="Savindra Singh..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} disabled={loading} />
              </div>
            </div>

            <div>
              <label className="form-label">Content Notes (Markdown)</label>
              <textarea className="markdown-textarea" style={{ height: "260px", fontFamily: "monospace", fontSize: "0.82rem" }} placeholder="# Core Concepts..." value={contentMarkdown} onChange={(e) => setContentMarkdown(e.target.value)} disabled={loading} required />
            </div>

            <button type="submit" className="btn-save" style={{ width: "100%", justifyContent: "center", padding: "14px", borderRadius: "12px" }} disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" size={18} style={{ marginRight: "8px" }} />Vectorizing...</> : <><Save size={18} style={{ marginRight: "8px" }} /> Ingest & Index</>}
            </button>
          </form>
        )}

        {/* ── TAB 2: DIRECT PDF / DOC INGESTION ── */}
        {activeTab === "doc" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {!parsedData && (
              <div style={{ background: "var(--bg-card)", padding: "28px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label className="form-label"><Globe size={12} /> Language</label>
                    <select className="status-select" style={{ width: "100%", padding: "10px" }} value={docLanguage} onChange={(e) => setDocLanguage(e.target.value)} disabled={parsingDoc}>
                      <option value="en">English</option><option value="mr">मराठी</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label"><FileText size={12} /> Exam Scope</label>
                    <select className="status-select" style={{ width: "100%", padding: "10px" }} value={docExam} onChange={(e) => setDocExam(e.target.value)} disabled={parsingDoc}>
                      <option value="BOTH">BOTH</option><option value="UPSC">UPSC</option><option value="MPSC">MPSC</option>
                    </select>
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: isDragging ? "2px dashed var(--color-emerald)" : "2px dashed var(--border-color)",
                    borderRadius: "16px", padding: "48px 24px", textAlign: "center", cursor: "pointer",
                    background: isDragging ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.01)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} accept=".pdf,.docx,.doc,.txt,.md" />
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--color-emerald)" }}>
                    <UploadCloud size={28} />
                  </div>
                  <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    {docFile ? docFile.name : "Drag and drop your PDF or Document here"}
                  </strong>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                    Supports PDF, DOCX, Markdown, TXT. Preserves tables, headings & outlines.
                  </p>
                  {docFile && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "16px", padding: "8px 16px", background: "rgba(255,255,255,0.06)", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.82rem", color: "var(--text-primary)" }}>
                      <FileCheck size={16} color="#10b981" />
                      <span>{docFile.name} ({(docFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setDocFile(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "24px" }}>
                  <button onClick={handleParseDocument} disabled={!docFile || parsingDoc} className="btn-save" style={{ width: "100%", justifyContent: "center", padding: "14px", borderRadius: "12px", background: docFile && !parsingDoc ? "linear-gradient(135deg, #10b981, #059669)" : undefined, opacity: !docFile || parsingDoc ? 0.6 : 1 }}>
                    {parsingDoc ? <><Loader2 className="animate-spin" size={18} style={{ marginRight: "10px" }} /><span>{parseProgressText || "Extracting..."}</span></> : <><Sparkles size={18} style={{ marginRight: "8px" }} />Analyze & Extract Chunks</>}
                  </button>
                </div>
              </div>
            )}

            {/* Parsed Chunks Review */}
            {parsedData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ background: "var(--bg-card)", padding: "20px 24px", borderRadius: "16px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                      {parsedData.documentTitle}
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "12px", background: "rgba(16,185,129,0.15)", color: "var(--color-emerald)", marginLeft: "10px" }}>
                        {parsedData.chunks.length} Chunks
                      </span>
                    </h2>
                  </div>
                  <button onClick={() => { setParsedData(null); setDocFile(null); }} className="btn-ai" style={{ padding: "8px 14px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <RefreshCw size={14} /> Upload Another
                  </button>
                </div>

                {parsedData.chunks.map((chunk, idx) => {
                  const isPreview = previewModes[chunk.id] !== "raw";
                  return (
                    <div key={chunk.id} style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border-color)", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                          <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(59,130,246,0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800 }}>{idx + 1}</span>
                          <input type="text" className="search-input" style={{ fontWeight: 700, fontSize: "0.95rem", padding: "8px 12px" }} value={chunk.title} onChange={(e) => handleChunkChange(chunk.id, "title", e.target.value)} />
                        </div>
                        <button onClick={() => handleDeleteChunk(chunk.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px" }}>
                        <div>
                          <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>🎯 Linked Node</label>
                          <select className="status-select" style={{ width: "100%", padding: "8px", fontSize: "0.82rem" }} value={chunk.suggestedNodeId || ""} onChange={(e) => { handleChunkChange(chunk.id, "suggestedNodeId", e.target.value); }}>
                            <option value="">-- Unlinked --</option>
                            {treeIssues.map(node => <option key={node.id} value={node.id}>{node.title}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Source</label>
                          <input type="text" className="search-input" style={{ padding: "8px" }} value={chunk.source || ""} onChange={(e) => handleChunkChange(chunk.id, "source", e.target.value)} placeholder="Savindra Singh..." />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Content</span>
                          <button type="button" onClick={() => toggleChunkPreview(chunk.id)} className="btn-ai" style={{ padding: "3px 8px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}>
                            {isPreview ? <Code size={12} /> : <Eye size={12} />} {isPreview ? "Edit" : "Preview"}
                          </button>
                        </div>
                        {isPreview ? (
                          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid var(--border-color)", padding: "16px", maxHeight: "320px", overflowY: "auto", fontSize: "0.85rem", lineHeight: 1.6 }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                              table: ({node, ...props}) => <table style={{ borderCollapse: "collapse", width: "100%", margin: "12px 0", border: "1px solid var(--border-color)" }} {...props} />,
                              th: ({node, ...props}) => <th style={{ background: "rgba(255,255,255,0.08)", padding: "6px 10px", border: "1px solid var(--border-color)", textAlign: "left", fontSize: "0.8rem", fontWeight: 700 }} {...props} />,
                              td: ({node, ...props}) => <td style={{ padding: "6px 10px", border: "1px solid var(--border-color)", fontSize: "0.8rem" }} {...props} />,
                              h1: ({node, ...props}) => <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "12px 0 6px", color: "#fff" }} {...props} />,
                              h2: ({node, ...props}) => <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "10px 0 4px", color: "var(--color-emerald)" }} {...props} />,
                              h3: ({node, ...props}) => <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "8px 0 4px", color: "#93c5fd" }} {...props} />,
                            }}>{chunk.contentMarkdown}</ReactMarkdown>
                          </div>
                        ) : (
                          <textarea className="markdown-textarea" style={{ height: "240px", fontFamily: "monospace", fontSize: "0.82rem" }} value={chunk.contentMarkdown} onChange={(e) => handleChunkChange(chunk.id, "contentMarkdown", e.target.value)} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Batch Ingest Footer */}
                <div style={{ position: "sticky", bottom: "0", background: "var(--bg-secondary)", padding: "16px 20px", borderRadius: "14px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 -4px 20px rgba(0,0,0,0.5)", zIndex: 10 }}>
                  <div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Ready to Index</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-emerald)", display: "block" }}>{parsedData.chunks.length} chunks → pgvector</span>
                  </div>
                  <button onClick={handleBatchIngest} disabled={batchIngesting || !parsedData.chunks.length} className="btn-save" style={{ padding: "12px 24px", borderRadius: "10px", fontSize: "0.9rem", fontWeight: 700 }}>
                    {batchIngesting ? <><Loader2 className="animate-spin" size={18} style={{ marginRight: "8px" }} />Indexing...</> : <><Save size={18} style={{ marginRight: "8px" }} />Approve & Ingest ({parsedData.chunks.length})</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: PASTE HTML ── */}
        {activeTab === "html" && (
          <form onSubmit={handleHtmlSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", background: "var(--bg-card)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
            {/* Node Binder */}
            <div style={{ padding: "16px", background: selectedNode ? "rgba(16,185,129,0.04)" : "rgba(245,158,11,0.04)", border: selectedNode ? "1px solid rgba(16,185,129,0.2)" : "1px dashed rgba(245,158,11,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: selectedNode ? "var(--color-emerald)" : "var(--color-yellow)" }}>
                  {selectedNode ? "🎯 Linked Node" : "⚠️ No Node Linked"}
                </div>
                <strong style={{ fontSize: "0.92rem", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                  {selectedNode ? selectedNode.title : "Unmapped HTML page"}
                </strong>
              </div>
              {selectedNode && <button type="button" onClick={() => setSelectedNode(null)} className="btn-ai" style={{ padding: "4px 8px", fontSize: "0.7rem" }}>Clear</button>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label"><Globe size={12} /> Language</label>
                <select className="status-select" style={{ width: "100%", padding: "10px" }} value={htmlLanguage} onChange={(e) => setHtmlLanguage(e.target.value)} disabled={htmlLoading}>
                  <option value="en">English</option><option value="mr">मराठी</option>
                </select>
              </div>
              <div>
                <label className="form-label"><FileText size={12} /> Exam Scope</label>
                <select className="status-select" style={{ width: "100%", padding: "10px" }} value={htmlExam} onChange={(e) => setHtmlExam(e.target.value)} disabled={htmlLoading}>
                  <option value="BOTH">BOTH</option><option value="UPSC">UPSC</option><option value="MPSC">MPSC</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label">HTML Page Title</label>
                <input type="text" className="search-input" style={{ padding: "10px" }} placeholder="e.g. Geomorphology Complete Notes" value={htmlTitle} onChange={(e) => setHtmlTitle(e.target.value)} disabled={htmlLoading} required />
              </div>
              <div>
                <label className="form-label">Source / Reference</label>
                <input type="text" className="search-input" style={{ padding: "10px" }} placeholder="Vision IAS, Drishti..." value={htmlSource} onChange={(e) => setHtmlSource(e.target.value)} disabled={htmlLoading} />
              </div>
            </div>

            {/* HTML Editor / Preview */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="form-label" style={{ margin: 0 }}>
                  <Code size={12} style={{ marginRight: "6px" }} />
                  Paste HTML Code
                </label>
                <button type="button" onClick={() => setHtmlPreview(!htmlPreview)} className="btn-ai" style={{ padding: "4px 10px", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  {htmlPreview ? <><Code size={12} /> Edit HTML</> : <><Eye size={12} /> Live Preview</>}
                </button>
              </div>

              {htmlPreview ? (
                <div style={{ borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden", height: "400px" }}>
                  <iframe
                    srcDoc={htmlContent}
                    style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
                    title="HTML Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              ) : (
                <textarea
                  className="markdown-textarea"
                  style={{ height: "400px", fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: "0.8rem", lineHeight: 1.5, color: "#e2e8f0", background: "rgba(0,0,0,0.4)" }}
                  placeholder='<!DOCTYPE html>\n<html>\n<head>\n  <title>My Notes</title>\n  <style>body { font-family: sans-serif; padding: 24px; }</style>\n</head>\n<body>\n  <h1>Geomorphology Notes</h1>\n  <p>Content here...</p>\n</body>\n</html>'
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  disabled={htmlLoading}
                  required
                />
              )}
            </div>

            <div style={{ padding: "12px 16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "10px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              💡 <strong>How it works:</strong> The HTML will be stored as-is. When you click "View" on any HTML content in the right panel, it opens as a full standalone webpage in a new browser tab — exactly as you pasted it.
            </div>

            <button type="submit" className="btn-save" style={{ width: "100%", justifyContent: "center", padding: "14px", borderRadius: "12px", background: htmlContent.trim() && !htmlLoading ? "linear-gradient(135deg, #f59e0b, #d97706)" : undefined }} disabled={htmlLoading}>
              {htmlLoading ? <><Loader2 className="animate-spin" size={18} style={{ marginRight: "8px" }} />Saving HTML Page...</> : <><Save size={18} style={{ marginRight: "8px" }} /> Save HTML Page</>}
            </button>
          </form>
        )}
      </div>

      {/* ═══ COLUMN 3: RECENT INGESTIONS ═══ */}
      <div style={{ flex: 1, borderLeft: "1px solid var(--border-color)", background: "var(--bg-secondary)", padding: "32px 20px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>Recent Ingestions</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 20px" }}>Study chunks & HTML pages indexed.</p>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {recentContents.length > 0 ? (
            recentContents.map(chunk => {
              const isHtml = chunk.title && recentContents.find(c => c.id === chunk.id);
              return (
                <div key={chunk.id} style={{ padding: "14px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <strong style={{ fontSize: "0.83rem", color: "var(--text-primary)", lineHeight: 1.3, flex: 1 }}>{chunk.title}</strong>
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: chunk.language === "mr" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)", color: chunk.language === "mr" ? "#34d399" : "#60a5fa" }}>
                        {chunk.language === "mr" ? "मरा" : "EN"}
                      </span>
                    </div>
                  </div>
                  
                  {chunk.issue && (
                    <div style={{ fontSize: "0.72rem", color: "var(--color-emerald)", fontWeight: 600 }}>🎯 {chunk.issue.title}</div>
                  )}
                  {chunk.sourceUrl && (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <ExternalLink size={10} /> {chunk.sourceUrl}
                    </div>
                  )}
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "6px" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                      {chunk.exam} • {new Date(chunk.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleViewContent(chunk.id)}
                      style={{
                        background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                        color: "#60a5fa", borderRadius: "6px", padding: "3px 8px", cursor: "pointer",
                        fontSize: "0.68rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px"
                      }}
                    >
                      <ExternalLink size={10} /> View
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No content found. Start by ingesting one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
