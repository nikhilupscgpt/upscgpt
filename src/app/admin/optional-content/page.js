'use client';

import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  BookOpen, Plus, Save, Loader2, ArrowLeft, FileText, ExternalLink, Globe, Trash2, 
  ChevronRight, ChevronDown, FolderPlus, UploadCloud, Sparkles, 
  Code, Eye, RefreshCw, X, FileCheck
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import remarkGfm from "remark-gfm";
import "./../content-ingestion/admin-rag.css";

export default function OptionalIngestionPage() {
  const [optionals, setOptionals] = useState([]);
  const [selectedOptionalId, setSelectedOptionalId] = useState("");
  
  // Ingestion Mode: 'manual' | 'doc'
  const [activeTab, setActiveTab] = useState("manual");

  // Form states (Manual Entry)
  const [language, setLanguage] = useState("en");
  const [exam, setExam] = useState("BOTH");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  
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

    async function loadTreeAndHistory() {
      try {
        const treeRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}&tree=true`);
        if (treeRes.ok) {
          const treeData = await treeRes.json();
          setTreeIssues(treeData.tree || []);
        }

        const listRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          setRecentContents(listData.contents || []);
        }

        setSelectedNode(null);
        setShowAddSubnodeInput(false);
        setNewSubnodeTitle("");
      } catch (err) {
        console.error(err);
      }
    }

    loadTreeAndHistory();
  }, [selectedOptionalId]);

  const handleCreateSubnode = async (e) => {
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
          parentIssueId: selectedNode ? selectedNode.id : null,
          optionalId: selectedOptionalId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subnode");

      toast.success(`Node "${data.node.title}" created successfully!`);
      
      if (selectedNode) {
        setExpandedNodes(prev => ({ ...prev, [selectedNode.id]: true }));
      }

      setNewSubnodeTitle("");
      setShowAddSubnodeInput(false);

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
          parentIssueId: parentId,
          optionalId: selectedOptionalId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subnode");

      toast.success(`Node "${data.node.title}" created successfully!`);
      
      if (parentId) {
        setExpandedNodes(prev => ({ ...prev, [parentId]: true }));
      }

      setNewSubnodeTitle("");
      setAddingUnderId(null);

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
      toast.error("Please select an optional subject first");
      return;
    }
    if (!title.trim()) {
      toast.error("Please provide a title");
      return;
    }
    if (!contentMarkdown.trim()) {
      toast.error("Please provide markdown content notes");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Vectorizing content and saving to database...");

    try {
      const res = await fetch("/api/admin/optional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionalId: selectedOptionalId,
          title: title.trim(),
          contentMarkdown: contentMarkdown.trim(),
          sourceUrl: sourceUrl.trim(),
          language,
          exam,
          issueId: selectedNode ? selectedNode.id : null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ingestion failed");
      }

      toast.success(`Successfully ingested chunk: "${data.title}"`, { id: toastId });
      
      setTitle("");
      setSourceUrl("");
      setContentMarkdown("");

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

  // Direct Document / PDF Ingestion Handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDocFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocFile(e.target.files[0]);
    }
  };

  const handleParseDocument = async () => {
    if (!docFile) {
      toast.error("Please select or drop a document first");
      return;
    }
    if (!selectedOptionalId) {
      toast.error("Please select an optional subject first");
      return;
    }

    setParsingDoc(true);
    setParseProgressText("Uploading document & analyzing layout with Gemini Vision...");
    const toastId = toast.loading("Extracting layout, tables, and headings...");

    try {
      const formData = new FormData();
      formData.append("file", docFile);
      formData.append("optionalId", selectedOptionalId);
      formData.append("language", docLanguage);
      formData.append("exam", docExam);

      setParseProgressText("Reconstructing layout, tables & matching syllabus nodes...");
      
      const res = await fetch("/api/admin/optional-content/parse-doc", {
        method: "POST",
        body: formData
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonErr) {
        if (res.status === 413 || rawText.includes("Request Entity Too Large")) {
          throw new Error("File is too large. Please upload a smaller section or compress the PDF.");
        }
        throw new Error(rawText || `Server error (${res.status} ${res.statusText})`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Failed to extract document layout (Status ${res.status})`);
      }

      setParsedData(data);
      toast.success(`Successfully extracted ${data.chunks.length} structured chunks!`, { id: toastId });
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
    setPreviewModes(prev => ({
      ...prev,
      [chunkId]: prev[chunkId] === "raw" ? "preview" : "raw"
    }));
  };

  const handleBatchIngest = async () => {
    if (!parsedData || !parsedData.chunks || parsedData.chunks.length === 0) {
      toast.error("No chunks available to ingest");
      return;
    }

    setBatchIngesting(true);
    const toastId = toast.loading(`Vectorizing and indexing ${parsedData.chunks.length} chunks into pgvector...`);

    try {
      const res = await fetch("/api/admin/optional-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_ingest",
          optionalId: selectedOptionalId,
          chunks: parsedData.chunks.map(c => ({
            title: c.title,
            contentMarkdown: c.contentMarkdown,
            source: c.source || parsedData.source || "",
            language: docLanguage,
            exam: docExam,
            issueId: c.suggestedNodeId || null
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch ingestion failed");

      toast.success(`🎉 Successfully indexed ${data.count} chunks into pgvector!`, { id: toastId });

      // Reset doc parser
      setDocFile(null);
      setParsedData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh recent list
      const listRes = await fetch(`/api/admin/optional-content?optionalId=${selectedOptionalId}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setRecentContents(listData.contents || []);
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setBatchIngesting(false);
    }
  };

  // Group tree issues
  const rootNodes = treeIssues.filter(n => !n.parentIssueId);

  const toggleExpand = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="cms-container" style={{ height: "calc(100vh - 60px)", display: "flex", overflow: "hidden" }}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* 1. LEFT COLUMN: Syllabus Tree Manager */}
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
              Syllabus Hierarchy Node
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

        {/* Tree Display */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          {rootNodes.length > 0 ? (
            rootNodes.map(paper => {
              const isPaperExpanded = !!expandedNodes[paper.id];
              const sections = treeIssues.filter(n => n.parentIssueId === paper.id);
              const isSelected = selectedNode?.id === paper.id;

              return (
                <div key={paper.id} style={{ marginBottom: "8px" }}>
                  {/* Paper level */}
                  <div 
                    onClick={() => setSelectedNode(paper)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "6px",
                      cursor: "pointer", background: isSelected ? "rgba(16, 185, 129, 0.1)" : "transparent",
                      border: isSelected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
                      fontWeight: 700, fontSize: "0.95rem"
                    }}
                  >
                    <span 
                      onClick={(e) => { e.stopPropagation(); toggleExpand(paper.id); }}
                      style={{ display: "inline-flex", cursor: "pointer", color: "var(--text-secondary)" }}
                    >
                      {isPaperExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <span style={{ flex: 1, color: isSelected ? "var(--color-emerald)" : "var(--text-primary)" }}>
                      {paper.title}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAddingUnderId(paper.id); }}
                      className="btn-ai"
                      style={{ padding: "2px 6px", fontSize: "0.65rem" }}
                    >
                      + Sub
                    </button>
                  </div>

                  {/* Adding inline under Paper */}
                  {addingUnderId === paper.id && (
                    <form onSubmit={(e) => handleCreateSubnodeInline(e, paper.id)} style={{ padding: "8px 0 8px 24px", display: "flex", gap: "6px" }}>
                      <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Subnode title (e.g. Section A)..." 
                        value={newSubnodeTitle}
                        onChange={(e) => setNewSubnodeTitle(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="btn-save" style={{ padding: "4px 8px" }} disabled={subnodeLoading}>
                        {subnodeLoading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                      </button>
                      <button type="button" className="btn-ai" style={{ padding: "4px 8px" }} onClick={() => setAddingUnderId(null)}>
                        ✕
                      </button>
                    </form>
                  )}

                  {/* Section level */}
                  {isPaperExpanded && sections.map(sec => {
                    const isSecExpanded = !!expandedNodes[sec.id];
                    const topics = treeIssues.filter(n => n.parentIssueId === sec.id);
                    const isSecSelected = selectedNode?.id === sec.id;

                    return (
                      <div key={sec.id} style={{ marginLeft: "16px", marginTop: "4px" }}>
                        <div 
                          onClick={() => setSelectedNode(sec)}
                          style={{
                            display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px", borderRadius: "6px",
                            cursor: "pointer", background: isSecSelected ? "rgba(16, 185, 129, 0.1)" : "transparent",
                            border: isSecSelected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
                            fontWeight: 600, fontSize: "0.85rem"
                          }}
                        >
                          <span 
                            onClick={(e) => { e.stopPropagation(); toggleExpand(sec.id); }}
                            style={{ display: "inline-flex", cursor: "pointer", color: "var(--text-secondary)" }}
                          >
                            {isSecExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </span>
                          <span style={{ flex: 1, color: isSecSelected ? "var(--color-emerald)" : "var(--text-primary)" }}>
                            {sec.title}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setAddingUnderId(sec.id); }}
                            className="btn-ai"
                            style={{ padding: "2px 6px", fontSize: "0.62rem" }}
                          >
                            + Sub
                          </button>
                        </div>

                        {/* Inline subnode under section */}
                        {addingUnderId === sec.id && (
                          <form onSubmit={(e) => handleCreateSubnodeInline(e, sec.id)} style={{ padding: "6px 0 6px 24px", display: "flex", gap: "6px" }}>
                            <input 
                              type="text" 
                              className="search-input" 
                              placeholder="Topic title (e.g. 1. Geomorphology)..." 
                              value={newSubnodeTitle}
                              onChange={(e) => setNewSubnodeTitle(e.target.value)}
                              autoFocus
                            />
                            <button type="submit" className="btn-save" style={{ padding: "4px 8px" }} disabled={subnodeLoading}>
                              {subnodeLoading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                            </button>
                            <button type="button" className="btn-ai" style={{ padding: "4px 8px" }} onClick={() => setAddingUnderId(null)}>
                              ✕
                            </button>
                          </form>
                        )}

                        {/* Topics level */}
                        {isSecExpanded && topics.map(top => {
                          const isTopSelected = selectedNode?.id === top.id;
                          return (
                            <div 
                              key={top.id}
                              onClick={() => setSelectedNode(top)}
                              style={{
                                marginLeft: "20px", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px",
                                padding: "4px 8px", borderRadius: "6px", cursor: "pointer",
                                background: isTopSelected ? "rgba(16, 185, 129, 0.1)" : "transparent",
                                border: isTopSelected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
                                fontSize: "0.8rem", color: isTopSelected ? "var(--color-emerald)" : "var(--text-secondary)"
                              }}
                            >
                              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {top.title}
                              </span>
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
            <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              No syllabus tree nodes found. Click "Add Root" to create Paper I or Paper II.
            </div>
          )}
        </div>

        {/* Global Add Node input */}
        {showAddSubnodeInput && (
          <form onSubmit={handleCreateSubnode} style={{ padding: "16px", borderTop: "1px solid var(--border-color)", background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {selectedNode ? `Add Subnode under "${selectedNode.title}"` : "Add Root Node (e.g. Paper I)"}
            </div>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Node title..." 
              value={newSubnodeTitle}
              onChange={(e) => setNewSubnodeTitle(e.target.value)}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-save" style={{ flex: 1, justifyContent: "center" }} disabled={subnodeLoading}>
                {subnodeLoading ? <Loader2 className="animate-spin" size={14} /> : "Save Node"}
              </button>
              <button type="button" className="btn-ai" onClick={() => setShowAddSubnodeInput(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)" }}>
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

      {/* 2. CENTER COLUMN: Ingestion Desk (Manual / Direct Doc) */}
      <div style={{ flex: 2, padding: "28px 32px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/admin" style={{ textDecoration: "none" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-color)", color: "var(--text-secondary)", padding: "8px 16px",
                borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s"
              }}>
                <ArrowLeft size={16} /> Back
              </button>
            </Link>
            <div>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
                Optional Syllabus Ingestion Desk
              </h1>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                Vector chunking compiler & explicit node binder with layout preservation.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "3px" }}>
            <button
              onClick={() => setActiveTab("manual")}
              style={{
                padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: activeTab === "manual" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                color: activeTab === "manual" ? "#fff" : "var(--text-secondary)",
                fontWeight: 600, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <FileText size={14} /> Manual Form
            </button>
            <button
              onClick={() => setActiveTab("doc")}
              style={{
                padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: activeTab === "doc" ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))" : "transparent",
                color: activeTab === "doc" ? "var(--color-emerald)" : "var(--text-secondary)",
                fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <Sparkles size={14} color="#10b981" /> Direct PDF / Doc Ingestion
            </button>
          </div>
        </div>

        {/* --- TAB 1: MANUAL CHUNK ENTRY --- */}
        {activeTab === "manual" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", background: "var(--bg-card)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
            
            {/* Node Binder Box */}
            <div style={{
              padding: "16px", background: selectedNode ? "rgba(16, 185, 129, 0.04)" : "rgba(245, 158, 11, 0.04)",
              border: selectedNode ? "1px solid rgba(16, 185, 129, 0.2)" : "1px dashed rgba(245, 158, 11, 0.2)",
              borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px"
            }}>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: selectedNode ? "var(--color-emerald)" : "var(--color-yellow)", letterSpacing: "0.05em" }}>
                  {selectedNode ? "🎯 Linked Syllabus Node" : "⚠️ No Node Linked"}
                </div>
                <strong style={{ fontSize: "0.92rem", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                  {selectedNode ? selectedNode.title : "Unmapped Chunk (Will rely on keyword matching fallback)"}
                </strong>
              </div>
              {selectedNode && (
                <button 
                  type="button" 
                  onClick={() => setSelectedNode(null)} 
                  className="btn-ai"
                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "4px 8px", fontSize: "0.7rem" }}
                >
                  Clear Link
                </button>
              )}
            </div>

            {/* Row 1: Language + Exam Scope */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label"><Globe size={12} /> Target Language</label>
                <select 
                  className="status-select" 
                  style={{ width: "100%", padding: "10px", fontSize: "0.88rem" }}
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
                  style={{ width: "100%", padding: "10px", fontSize: "0.88rem" }}
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
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label">Notes Chunk Title</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ padding: "10px" }}
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
                  style={{ padding: "10px" }}
                  placeholder="Savindra Singh, Vision IAS..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 3: Markdown Editor */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="form-label" style={{ margin: 0 }}>Content Notes (Markdown formatted)</label>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  Markdown supported. Chunks will be embedded dynamically into pgvector storage.
                </span>
              </div>
              <textarea 
                className="markdown-textarea"
                style={{ height: "260px", fontFamily: "monospace", fontSize: "0.82rem" }}
                placeholder="# Core Concepts...
Paste details here..."
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
              style={{ width: "100%", justifyContent: "center", padding: "14px", borderRadius: "12px" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} style={{ marginRight: "8px" }} />
                  Vectorizing & Linking Content...
                </>
              ) : (
                <>
                  <Save size={18} style={{ marginRight: "8px" }} /> Ingest & Index Optional Material
                </>
              )}
            </button>
          </form>
        )}

        {/* --- TAB 2: DIRECT PDF & DOC INGESTION (GEMINI MULTIMODAL VISION) --- */}
        {activeTab === "doc" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Upload Box Stage (if no parsed chunks yet) */}
            {!parsedData && (
              <div style={{ background: "var(--bg-card)", padding: "28px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                
                {/* Configuration Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label className="form-label"><Globe size={12} /> Target Document Language</label>
                    <select 
                      className="status-select" 
                      style={{ width: "100%", padding: "10px", fontSize: "0.88rem" }}
                      value={docLanguage} 
                      onChange={(e) => setDocLanguage(e.target.value)}
                      disabled={parsingDoc}
                    >
                      <option value="en">English (default)</option>
                      <option value="mr">मराठी (Marathi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label"><FileText size={12} /> Exam Scope</label>
                    <select 
                      className="status-select" 
                      style={{ width: "100%", padding: "10px", fontSize: "0.88rem" }}
                      value={docExam} 
                      onChange={(e) => setDocExam(e.target.value)}
                      disabled={parsingDoc}
                    >
                      <option value="BOTH">BOTH (Unified)</option>
                      <option value="UPSC">UPSC Only</option>
                      <option value="MPSC">MPSC Only</option>
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
                    borderRadius: "16px",
                    padding: "48px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: isDragging ? "rgba(16, 185, 129, 0.05)" : "rgba(255, 255, 255, 0.01)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    style={{ display: "none" }}
                    accept=".pdf,.docx,.doc,.txt,.md"
                  />
                  
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                    color: "var(--color-emerald)"
                  }}>
                    <UploadCloud size={28} />
                  </div>

                  <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    {docFile ? docFile.name : "Drag and drop your Syllabus PDF or Notes Document here"}
                  </strong>
                  
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                    Supports PDF, DOCX, Markdown, and TXT files. Preserves tables, hierarchy, headings, and outlines.
                  </p>

                  {docFile && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "16px",
                      padding: "8px 16px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "8px",
                      border: "1px solid var(--border-color)", fontSize: "0.82rem", color: "var(--text-primary)"
                    }}>
                      <FileCheck size={16} color="#10b981" />
                      <span>{docFile.name} ({(docFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setDocFile(null); }}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Action CTA */}
                <div style={{ marginTop: "24px" }}>
                  <button 
                    onClick={handleParseDocument}
                    disabled={!docFile || parsingDoc}
                    className="btn-save"
                    style={{
                      width: "100%", justifyContent: "center", padding: "14px", borderRadius: "12px",
                      background: docFile && !parsingDoc ? "linear-gradient(135deg, #10b981, #059669)" : undefined,
                      opacity: !docFile || parsingDoc ? 0.6 : 1
                    }}
                  >
                    {parsingDoc ? (
                      <>
                        <Loader2 className="animate-spin" size={18} style={{ marginRight: "10px" }} />
                        <span>{parseProgressText || "Extracting layout & matching syllabus with Gemini Vision..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} style={{ marginRight: "8px" }} />
                        Analyze & Extract Structured Syllabus Chunks
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Review & Verification Stage (when chunks are extracted) */}
            {parsedData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Extracted Header Summary */}
                <div style={{
                  background: "var(--bg-card)", padding: "20px 24px", borderRadius: "16px", border: "1px solid var(--border-color)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                        {parsedData.documentTitle}
                      </h2>
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "12px",
                        background: "rgba(16, 185, 129, 0.15)", color: "var(--color-emerald)"
                      }}>
                        {parsedData.chunks.length} Chunks Extracted
                      </span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                      {parsedData.source ? `Source / Reference: ${parsedData.source} • ` : ""}{parsedData.fileName}
                    </p>
                  </div>

                  <button 
                    onClick={() => { setParsedData(null); setDocFile(null); }}
                    className="btn-ai"
                    style={{ padding: "8px 14px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <RefreshCw size={14} /> Upload Another File
                  </button>
                </div>

                {/* Chunks List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {parsedData.chunks.map((chunk, idx) => {
                    const isPreview = previewModes[chunk.id] === "raw" ? false : true;
                    return (
                      <div 
                        key={chunk.id} 
                        style={{
                          background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border-color)",
                          padding: "20px", display: "flex", flexDirection: "column", gap: "14px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                        }}
                      >
                        {/* Chunk Card Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                            <span style={{
                              width: "24px", height: "24px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.15)",
                              color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.75rem", fontWeight: 800
                            }}>
                              {idx + 1}
                            </span>
                            <input 
                              type="text" 
                              className="search-input" 
                              style={{ fontWeight: 700, fontSize: "0.95rem", padding: "8px 12px" }}
                              value={chunk.title}
                              onChange={(e) => handleChunkChange(chunk.id, "title", e.target.value)}
                              placeholder="Chunk title..."
                            />
                          </div>

                          <button 
                            onClick={() => handleDeleteChunk(chunk.id)}
                            style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>

                        {/* Breadcrumb & Node Binding Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                              🎯 Linked Syllabus Node (Left Tree)
                            </label>
                            <select 
                              className="status-select" 
                              style={{ width: "100%", padding: "8px", fontSize: "0.82rem", background: "var(--bg-input)" }}
                              value={chunk.suggestedNodeId || ""}
                              onChange={(e) => {
                                const matchedNode = treeIssues.find(n => n.id === e.target.value);
                                handleChunkChange(chunk.id, "suggestedNodeId", e.target.value);
                                handleChunkChange(chunk.id, "suggestedNodeTitle", matchedNode?.title || "");
                              }}
                            >
                              <option value="">-- Auto Match / Unlinked Node --</option>
                              {treeIssues.map(node => (
                                <option key={node.id} value={node.id}>
                                  {node.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                              Reference / Source (e.g. Savindra Singh)
                            </label>
                            <input 
                              type="text" 
                              className="search-input" 
                              style={{ padding: "8px", fontSize: "0.82rem" }}
                              value={chunk.source || ""}
                              onChange={(e) => handleChunkChange(chunk.id, "source", e.target.value)}
                              placeholder="Savindra Singh, Vision IAS..."
                            />
                          </div>
                        </div>

                        {/* Markdown Editor / Preview Switcher */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                              Structured Notes Content (Tables, Outline & Headings Preserved)
                            </span>
                            <button 
                              type="button" 
                              onClick={() => toggleChunkPreview(chunk.id)}
                              className="btn-ai"
                              style={{ padding: "3px 8px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              {isPreview ? <Code size={12} /> : <Eye size={12} />}
                              {isPreview ? "Edit Raw Markdown" : "Preview Rendered Layout"}
                            </button>
                          </div>

                          {isPreview ? (
                            <div style={{
                              background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid var(--border-color)",
                              padding: "16px", maxHeight: "320px", overflowY: "auto", fontSize: "0.85rem", lineHeight: 1.6,
                              color: "var(--text-primary)"
                            }}>
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  table: ({node, ...props}) => <table style={{ borderCollapse: "collapse", width: "100%", margin: "12px 0", border: "1px solid var(--border-color)" }} {...props} />,
                                  th: ({node, ...props}) => <th style={{ background: "rgba(255,255,255,0.08)", padding: "6px 10px", border: "1px solid var(--border-color)", textAlign: "left", fontSize: "0.8rem", fontWeight: 700 }} {...props} />,
                                  td: ({node, ...props}) => <td style={{ padding: "6px 10px", border: "1px solid var(--border-color)", fontSize: "0.8rem" }} {...props} />,
                                  h1: ({node, ...props}) => <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "12px 0 6px", color: "#fff" }} {...props} />,
                                  h2: ({node, ...props}) => <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "10px 0 4px", color: "var(--color-emerald)" }} {...props} />,
                                  h3: ({node, ...props}) => <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "8px 0 4px", color: "#93c5fd" }} {...props} />,
                                  ul: ({node, ...props}) => <ul style={{ paddingLeft: "20px", margin: "6px 0" }} {...props} />,
                                  ol: ({node, ...props}) => <ol style={{ paddingLeft: "20px", margin: "6px 0" }} {...props} />
                                }}
                              >
                                {chunk.contentMarkdown}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <textarea 
                              className="markdown-textarea"
                              style={{ height: "240px", fontFamily: "monospace", fontSize: "0.82rem" }}
                              value={chunk.contentMarkdown}
                              onChange={(e) => handleChunkChange(chunk.id, "contentMarkdown", e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sticky Action Footer */}
                <div style={{
                  position: "sticky", bottom: "0", background: "var(--bg-secondary)", padding: "16px 20px",
                  borderRadius: "14px", border: "1px solid var(--border-color)", display: "flex",
                  alignItems: "center", justifyContent: "space-between", gap: "16px",
                  boxShadow: "0 -4px 20px rgba(0,0,0,0.5)", zIndex: 10
                }}>
                  <div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block" }}>
                      Ready to Embed & Index into pgvector
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-emerald)" }}>
                      {parsedData.chunks.length} structured chunks will be vector-indexed with gemini-embedding-2.
                    </span>
                  </div>

                  <button 
                    onClick={handleBatchIngest}
                    disabled={batchIngesting || parsedData.chunks.length === 0}
                    className="btn-save"
                    style={{ padding: "12px 24px", borderRadius: "10px", fontSize: "0.9rem", fontWeight: 700 }}
                  >
                    {batchIngesting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} style={{ marginRight: "8px" }} />
                        Vectorizing & Indexing Chunks...
                      </>
                    ) : (
                      <>
                        <Save size={18} style={{ marginRight: "8px" }} />
                        Approve & Ingest All ({parsedData.chunks.length}) Chunks into pgvector
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. RIGHT COLUMN: Recent Ingestions */}
      <div style={{ flex: 1, borderLeft: "1px solid var(--border-color)", background: "var(--bg-secondary)", padding: "32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
          Recent Ingestions
        </h2>
        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 20px 0" }}>
          Study chunks already vector-indexed.
        </p>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {recentContents.length > 0 ? (
            recentContents.map(chunk => (
              <div key={chunk.id} style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: 1.3 }}>{chunk.title}</strong>
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px",
                    background: chunk.language === "mr" ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
                    color: chunk.language === "mr" ? "#34d399" : "#60a5fa"
                  }}>
                    {chunk.language === "mr" ? "मराठी" : "EN"}
                  </span>
                </div>
                
                {chunk.issue && (
                  <div style={{ fontSize: "0.72rem", color: "var(--color-emerald)", fontWeight: 600 }}>
                    🎯 Link: {chunk.issue.title}
                  </div>
                )}
                
                {chunk.sourceUrl && (
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ExternalLink size={10} /> Source: <span>{chunk.sourceUrl}</span>
                  </div>
                )}
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "6px" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    Exam: <strong style={{ color: "var(--text-secondary)" }}>{chunk.exam}</strong>
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    {new Date(chunk.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No optional notes chunks found. Start by ingesting one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
