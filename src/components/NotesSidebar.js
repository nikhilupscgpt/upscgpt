"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckSquare, Edit3, Bookmark, AlertCircle, Clock, CheckCircle2, Play, Sparkles } from "lucide-react";
import { toggleBookmark, updateIssueProgress, checkBookmarkStatus, checkIssueProgress } from "@/app/actions/user-activity";

const MAX_CHARS = 2000;

export default function NotesSidebar({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  entitySubject,
  entityTopic,
  questions = [],
  initialTab = "notes"
}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Note states
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [linkedNodes, setLinkedNodes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [notesListView, setNotesListView] = useState(false);
  const textareaRef = useRef(null);

  // Bookmark / Tracking states
  const [bookmarked, setBookmarked] = useState(false);
  const [progressStatus, setProgressStatus] = useState("UNSTARTED");
  const [loadingTracking, setLoadingTracking] = useState(false);

  // MCQ states
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [expandedMainsAnswers, setExpandedMainsAnswers] = useState({});

  // Sync initial tab when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Load Bookmark and Tracking status on entity change
  useEffect(() => {
    async function loadTracking() {
      if (!session || !entityId || !isOpen) return;
      setLoadingTracking(true);
      try {
        const typeMap = {
          article: "Article",
          editorial: "Editorial",
          issue: "Issue",
          streak: "Streak"
        };
        const apiType = typeMap[entityType] || "Article";
        const isBookmarked = await checkBookmarkStatus(entityId, apiType);
        setBookmarked(isBookmarked);

        if (entityType === "issue") {
          const status = await checkIssueProgress(entityId);
          setProgressStatus(status);
        }
      } catch (e) {
        console.error("Failed to load tracking status:", e);
      } finally {
        setLoadingTracking(false);
      }
    }
    loadTracking();
  }, [entityId, entityType, session, isOpen]);

  // Fetch personal notes
  const fetchNotes = useCallback(async () => {
    if (!session || !isOpen) return;
    setLoadingNotes(true);
    try {
      const params = new URLSearchParams();
      if (entityType && entityId) {
        params.set("entityType", entityType);
        params.set("entityId", entityId);
      }
      const res = await fetch(`/api/user/notes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
        if (data.notes?.length > 0 && !activeNote) {
          setActiveNote(data.notes[0]);
          setNoteContent(data.notes[0].content);
          setLinkedNodes(data.notes[0].linkedNodeIds || []);
          setIsAiGenerated(data.notes[0].isAiGenerated || false);
        }
      }
    } catch (e) {
      console.error("Failed to fetch notes:", e);
    } finally {
      setLoadingNotes(false);
    }
  }, [session, entityType, entityId, activeNote, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, fetchNotes]);

  // Auto-link syllabus nodes on note content changes
  useEffect(() => {
    if (!noteContent || noteContent.length < 20) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/user/notes/link-nodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteContent }),
        });
        if (res.ok) {
          const data = await res.json();
          setLinkedNodes(data.nodes || []);
        }
      } catch (e) { /* silent */ }
    }, 1500);
    return () => clearTimeout(timer);
  }, [noteContent]);

  const handleSaveNote = async () => {
    if (!noteContent.trim() || saving) return;
    setSaving(true);
    try {
      if (activeNote) {
        const res = await fetch("/api/user/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: activeNote.id,
            content: noteContent.trim(),
            linkedNodeIds: linkedNodes.map(n => n.id || n),
            isAiGenerated,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setActiveNote(data.note);
          setNotes(prev => prev.map(n => n.id === data.note.id ? data.note : n));
        }
      } else {
        const res = await fetch("/api/user/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: noteContent.trim(),
            entityType,
            entityId,
            linkedNodeIds: linkedNodes.map(n => n.id || n),
            isAiGenerated,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setActiveNote(data.note);
          setNotes(prev => [data.note, ...prev]);
        }
      }
    } catch (e) {
      console.error("Failed to save note:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!activeNote) return;
    if (!confirm("Delete this study note?")) return;
    try {
      await fetch(`/api/user/notes?noteId=${activeNote.id}`, { method: "DELETE" });
      setNotes(prev => prev.filter(n => n.id !== activeNote.id));
      setActiveNote(null);
      setNoteContent("");
      setLinkedNodes([]);
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  const handleAiSuggest = async () => {
    if (suggesting || !entityType || !entityId) return;
    setSuggesting(true);
    try {
      const res = await fetch("/api/user/notes/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestion) {
          setNoteContent(data.suggestion);
          setIsAiGenerated(true);
          if (textareaRef.current) textareaRef.current.focus();
        }
      }
    } catch (e) {
      console.error("AI suggest failed:", e);
    } finally {
      setSuggesting(false);
    }
  };

  const handleNewNote = () => {
    setActiveNote(null);
    setNoteContent("");
    setLinkedNodes([]);
    setIsAiGenerated(false);
    setNotesListView(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleBookmarkToggle = async () => {
    if (!session) {
      alert("Please sign in to bookmark.");
      return;
    }
    setBookmarked(prev => !prev);
    try {
      const typeMap = {
        article: "Article",
        editorial: "Editorial",
        issue: "Issue",
        streak: "Streak"
      };
      const apiType = typeMap[entityType] || "Article";
      const res = await toggleBookmark(entityId, apiType);
      if (res.success) {
        setBookmarked(res.bookmarked);
      }
    } catch (e) {
      setBookmarked(prev => !prev);
    }
  };

  const handleProgressCycle = async () => {
    if (!session) {
      alert("Please sign in to track progress.");
      return;
    }
    const states = ["UNSTARTED", "READING", "MASTERED", "REVISION_NEEDED"];
    const nextIndex = (states.indexOf(progressStatus) + 1) % states.length;
    const nextStatus = states[nextIndex];
    setProgressStatus(nextStatus);
    try {
      await updateIssueProgress(entityId, nextStatus);
    } catch (e) {
      setProgressStatus(progressStatus);
    }
  };

  // Parsing helper for questions
  const getOptionsArray = (options) => {
    if (!options) return [];
    try {
      const parsed = typeof options === 'string' ? JSON.parse(options) : options;
      if (Array.isArray(parsed)) {
        return parsed.map((opt, i) => {
          if (/^[A-D]\.\s*/i.test(opt)) {
            return { label: opt.charAt(0).toUpperCase(), text: opt.replace(/^[A-D]\.\s*/i, '') };
          }
          const labels = ['A', 'B', 'C', 'D'];
          return { label: labels[i] || `${i + 1}`, text: opt };
        });
      }
    } catch (e) {}
    return [];
  };

  const isMcqCorrect = (selected, correct) => {
    if (!selected || !correct) return false;
    return selected.trim().toLowerCase() === correct.trim().toLowerCase();
  };

  const isDbQuestionCorrect = (selectedOption, question) => {
    const selectedLabel = selectedOption.label.toUpperCase();
    const correctLabel = (question.correctLabel || '').trim().toUpperCase();
    return selectedLabel === correctLabel || isMcqCorrect(selectedOption.text, question.correctLabel);
  };

  const prelimsQuestions = questions.filter(q => {
    const opts = getOptionsArray(q.options);
    return opts.length > 0 || q.tags?.includes("prelims");
  });

  const mainsQuestions = questions.filter(q => {
    const opts = getOptionsArray(q.options);
    return opts.length === 0 && q.tags?.includes("mains");
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="workspace-overlay" onClick={onClose} />
      <div className="workspace-sidebar">
        
        {/* Header Title */}
        <div className="workspace-header">
          <span className="workspace-header-title">Study Workspace</span>
          <button className="workspace-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab Controls */}
        <div className="workspace-tabs">
          <button 
            className={`tab-btn ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => setActiveTab("practice")}
          >
            <CheckSquare size={16} />
            <span>Practice</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            <Edit3 size={16} />
            <span>Notes</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === "tracking" ? "active" : ""}`}
            onClick={() => setActiveTab("tracking")}
          >
            <Bookmark size={16} />
            <span>Tracking</span>
          </button>
        </div>

        {/* Scrollable Workspace Drawer Body */}
        <div className="workspace-body hide-scrollbar">
          
          {/* TAB 1: PRACTICE */}
          {activeTab === "practice" && (
            <div className="practice-container">
              {questions.length === 0 ? (
                <div className="practice-empty">
                  <span className="empty-icon">🎯</span>
                  <h4>No questions linked to this topic</h4>
                  <p>Read through the context carefully to extract dates, indicators, and cause-effect relationships.</p>
                </div>
              ) : (
                <div className="questions-list">
                  {prelimsQuestions.map((q) => {
                    const options = getOptionsArray(q.options);
                    const answered = selectedAnswers[q.id] !== undefined;
                    const selected = selectedAnswers[q.id];
                    return (
                      <div key={q.id} className="practice-card">
                        <div className="card-badge prelims">PRELIMS QUESTION</div>
                        <p className="question-text">{q.text}</p>
                        <div className="options-stack">
                          {options.map((opt, i) => {
                            const isCorrect = isDbQuestionCorrect(opt, q);
                            const isSelected = selected?.label === opt.label;
                            let btnClass = "interactive";
                            if (answered) {
                              if (isCorrect) btnClass = "correct";
                              else if (isSelected) btnClass = "incorrect";
                              else btnClass = "disabled";
                            }
                            return (
                              <button
                                key={i}
                                disabled={answered}
                                onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={`option-btn ${btnClass}`}
                              >
                                <strong>{opt.label}.</strong> {opt.text}
                              </button>
                            );
                          })}
                        </div>
                        {answered && (
                          <div className="explanation-box">
                            <span className={`status-text ${isDbQuestionCorrect(selected, q) ? "correct" : "incorrect"}`}>
                              {isDbQuestionCorrect(selected, q) ? "✓ Correct Option" : "✗ Incorrect Option"}
                            </span>
                            <p><strong>Answer:</strong> {q.correctLabel}</p>
                            <p><strong>Explanation:</strong> {q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {mainsQuestions.map((q) => {
                    const isExpanded = expandedMainsAnswers[q.id] === true;
                    return (
                      <div key={q.id} className="practice-card">
                        <div className="card-badge mains">MAINS EVALUATOR</div>
                        <p className="question-text">{q.text}</p>
                        <button 
                          onClick={() => setExpandedMainsAnswers(prev => ({ ...prev, [q.id]: !isExpanded }))}
                          className="reveal-btn"
                        >
                          <span>{isExpanded ? "Hide Model Framework" : "Reveal Model Framework"}</span>
                        </button>
                        {isExpanded && (
                          <div className="explanation-box markdown-framework">
                            <strong>Model Framework:</strong>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOTES */}
          {activeTab === "notes" && (
            <div className="notes-container">
              <div className="notes-editor-header">
                <span>{notesListView ? "All Notes" : activeNote ? "Edit Note" : "Create Study Note"}</span>
                <button 
                  className="list-toggle-btn"
                  onClick={() => setNotesListView(!notesListView)}
                >
                  {notesListView ? "✏️ Editor" : "📋 List"}
                </button>
              </div>

              {!notesListView ? (
                <>
                  <textarea
                    ref={textareaRef}
                    className="notes-textarea"
                    placeholder="Capture study pointers, timelines, and analysis hooks..."
                    value={noteContent}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CHARS) {
                        setNoteContent(e.target.value);
                        setIsAiGenerated(false);
                      }
                    }}
                    rows={8}
                  />
                  <div className="notes-char-counter">
                    <span>{noteContent.length}</span>/{MAX_CHARS}
                  </div>

                  <div className="notes-editor-actions">
                    <button
                      className="editor-btn ai-suggest"
                      onClick={handleAiSuggest}
                      disabled={suggesting}
                    >
                      {suggesting ? <span className="spinner" /> : <Sparkles size={14} />}
                      {suggesting ? "Analyzing..." : "AI Suggest"}
                    </button>
                    <button
                      className="editor-btn save"
                      onClick={handleSaveNote}
                      disabled={saving || !noteContent.trim()}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    {activeNote && (
                      <button className="editor-btn delete" onClick={handleDeleteNote}>
                        🗑️
                      </button>
                    )}
                    <button className="editor-btn new" onClick={handleNewNote}>
                      ＋
                    </button>
                  </div>

                  {/* Metadata tags */}
                  <div className="notes-metadata-tags">
                    {entitySubject && (
                      <div className="meta-tag subject-tag">
                        <strong>Subject:</strong> {entitySubject}
                      </div>
                    )}
                    {entityTopic && (
                      <div className="meta-tag topic-tag">
                        <strong>Topic:</strong> {entityTopic}
                      </div>
                    )}
                  </div>

                  {/* Syllabus Nodes */}
                  <div className="syllabus-nodes-section">
                    <div className="syllabus-header">🔗 Linked Syllabus Nodes</div>
                    {linkedNodes.length > 0 ? (
                      <div className="nodes-list">
                        {linkedNodes.map((node) => (
                          <Link 
                            key={node.id || node} 
                            href={`/issues/${node.slug || node}`}
                            className="syllabus-node-link"
                            onClick={onClose}
                          >
                            <span className="dot" />
                            <span>{node.title || node.id || node}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="nodes-empty">
                        Write 20+ characters to auto-link related syllabus topics.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="notes-list-view">
                  {loadingNotes ? (
                    <div className="loading">Loading notes...</div>
                  ) : notes.length === 0 ? (
                    <div className="empty">No notes taken yet.</div>
                  ) : (
                    notes.map((note) => (
                      <div 
                        key={note.id} 
                        className={`note-list-item ${activeNote?.id === note.id ? "active" : ""}`}
                        onClick={() => {
                          setActiveNote(note);
                          setNoteContent(note.content);
                          setLinkedNodes(note.linkedNodeIds || []);
                          setIsAiGenerated(note.isAiGenerated || false);
                          setNotesListView(false);
                        }}
                      >
                        <div className="item-header">
                          <span className="item-title">{note.entityTitle || "Untitled Note"}</span>
                          {note.isAiGenerated && <span className="ai-badge">AI</span>}
                        </div>
                        <p className="item-preview">{note.content.slice(0, 100)}...</p>
                        <span className="item-date">
                          {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRACKING */}
          {activeTab === "tracking" && (
            <div className="tracking-container">
              {loadingTracking ? (
                <div className="loading">Retrieving state...</div>
              ) : (
                <div className="tracking-content">
                  
                  {/* Bookmark Option */}
                  <div className="tracking-widget">
                    <h4>Bookmark Briefing</h4>
                    <p className="widget-desc">Save this content reference to your personal revision pile for quick retrieval.</p>
                    <button 
                      onClick={handleBookmarkToggle}
                      className={`bookmark-toggle-btn ${bookmarked ? "active" : ""}`}
                    >
                      <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
                      <span>{bookmarked ? "Bookmarked" : "Add Bookmark"}</span>
                    </button>
                  </div>

                  {/* Progress Status (Issues only) */}
                  {entityType === "issue" && (
                    <div className="tracking-widget">
                      <h4>Reading Progress</h4>
                      <p className="widget-desc">Track your study completion rate for this UPSC syllabus node.</p>
                      <button 
                        onClick={handleProgressCycle}
                        className={`progress-toggle-btn ${progressStatus.toLowerCase()}`}
                      >
                        {progressStatus === "READING" && <Clock size={16} />}
                        {progressStatus === "MASTERED" && <CheckCircle2 size={16} />}
                        {progressStatus === "UNSTARTED" && <Play size={16} />}
                        <span>Status: {progressStatus.replace("_", " ")}</span>
                      </button>
                    </div>
                  )}

                  {/* Aggregated Hub link */}
                  <div className="tracking-widget hub-widget">
                    <h4>View All Notes</h4>
                    <p className="widget-desc">Access your centralized intelligence board containing all your saved notes and templates.</p>
                    <Link href="/notes" className="hub-link" onClick={onClose}>
                      📋 Open Study Hub
                    </Link>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        .workspace-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 998;
          backdrop-filter: blur(4px); animation: fadeIn 0.2s ease;
        }
        .workspace-sidebar {
          position: fixed; top: 0; right: 0; width: 420px; max-width: 95vw; height: 100vh;
          background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(24px);
          border-left: 1px solid rgba(255,255,255,0.08); z-index: 999;
          display: flex; flex-direction: column; animation: slideIn 0.3s cubic-bezier(0.16,1,0.3,1);
          box-shadow: -20px 0 60px rgba(0,0,0,0.4);
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Header */
        .workspace-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 24px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .workspace-header-title { font-size: 1.15rem; font-weight: 850; color: #f1f5f9; letter-spacing: -0.02em; }
        .workspace-close {
          background: none; border: none; color: #64748b; font-size: 1.1rem;
          cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: 0.2s;
        }
        .workspace-close:hover { color: #f87171; background: rgba(248,113,113,0.1); }

        /* Tabs Control */
        .workspace-tabs {
          display: flex; gap: 4px; padding: 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(0, 0, 0, 0.15);
        }
        .tab-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: transparent; border: none; color: #64748b; padding: 10px 0;
          font-size: 0.78rem; font-weight: 800; cursor: pointer; border-radius: 8px;
          transition: all 0.2s ease; font-family: inherit;
        }
        .tab-btn:hover { color: #cbd5e1; background: rgba(255,255,255,0.03); }
        .tab-btn.active { color: #3b82f6; background: rgba(59,130,246,0.1); }

        /* Body */
        .workspace-body {
          flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }

        /* TAB: PRACTICE */
        .practice-container { display: flex; flex-direction: column; gap: 20px; }
        .practice-empty { text-align: center; padding: 40px 16px; color: #64748b; }
        .practice-empty .empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; opacity: 0.3; }
        .practice-empty h4 { color: #cbd5e1; font-size: 1rem; margin-bottom: 6px; }
        .practice-empty p { font-size: 0.8rem; line-height: 1.5; }
        
        .questions-list { display: flex; flex-direction: column; gap: 24px; }
        .practice-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          padding: 20px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;
        }
        .card-badge {
          align-self: flex-start; font-size: 0.55rem; font-weight: 900; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.05em;
        }
        .card-badge.prelims { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); }
        .card-badge.mains { color: #10b981; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
        .question-text { font-size: 0.9rem; font-weight: 750; color: #e2e8f0; line-height: 1.5; margin: 0; }
        
        .options-stack { display: flex; flex-direction: column; gap: 8px; }
        .option-btn {
          width: 100%; text-align: left; padding: 12px 16px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; color: #94a3b8;
          font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .option-btn.interactive:hover { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.04); color: white; }
        .option-btn.correct { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }
        .option-btn.incorrect { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #ef4444; }
        .option-btn.disabled { opacity: 0.35; cursor: not-allowed; }

        .explanation-box {
          background: rgba(0, 0, 0, 0.15); border: 1px solid rgba(255,255,255,0.04);
          padding: 14px; border-radius: 10px; font-size: 0.8rem; color: #94a3b8; line-height: 1.55;
        }
        .explanation-box .status-text { font-weight: 900; display: block; margin-bottom: 4px; font-size: 0.72rem; }
        .explanation-box .status-text.correct { color: #10b981; }
        .explanation-box .status-text.incorrect { color: #ef4444; }

        .reveal-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8; font-size: 0.8rem; font-weight: 800; padding: 10px 0; border-radius: 10px;
          cursor: pointer; font-family: inherit; transition: 0.2s;
        }
        .reveal-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .markdown-framework { border-color: rgba(16,185,129,0.15); }

        /* TAB: NOTES */
        .notes-container { display: flex; flex-direction: column; }
        .notes-editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .notes-editor-header span { font-size: 0.78rem; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; }
        .list-toggle-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #cbd5e1; font-size: 0.75rem; font-weight: 800; padding: 6px 12px; border-radius: 8px; cursor: pointer;
        }
        .list-toggle-btn:hover { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.3); color: #3b82f6; }
        
        .notes-textarea {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 16px; color: #e2e8f0; font-size: 0.95rem;
          font-family: inherit; line-height: 1.7; resize: vertical; min-height: 160px;
          outline: none; transition: border-color 0.2s;
        }
        .notes-textarea:focus { border-color: rgba(59,130,246,0.4); }
        .notes-char-counter { text-align: right; font-size: 0.7rem; color: #475569; margin-top: 6px; font-weight: 700; }

        .notes-editor-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .editor-btn {
          border: none; border-radius: 12px; padding: 10px 16px; font-size: 0.8rem;
          font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.2s; font-family: inherit;
        }
        .editor-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .editor-btn.ai-suggest {
          background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15));
          color: #a78bfa; border: 1px solid rgba(139,92,246,0.2);
        }
        .editor-btn.ai-suggest:hover:not(:disabled) { background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25)); }
        .editor-btn.save { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.2); flex: 1; }
        .editor-btn.save:hover:not(:disabled) { background: rgba(16,185,129,0.25); }
        .editor-btn.delete { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.15); padding: 10px 12px; }
        .editor-btn.delete:hover { background: rgba(239,68,68,0.2); }
        .editor-btn.new { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; }
        .editor-btn.new:hover { background: rgba(255,255,255,0.1); }
        .spinner {
          width: 14px; height: 14px; border: 2px solid rgba(167,139,250,0.3);
          border-top-color: #a78bfa; border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .notes-metadata-tags { display: flex; flex-direction: column; gap: 8px; margin-top: 20px; }
        .meta-tag { font-size: 0.72rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; }
        .meta-tag strong { color: #475569; text-transform: uppercase; font-size: 0.62rem; margin-right: 6px; letter-spacing: 0.05em; }
        .meta-tag.subject-tag { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.15); }
        .meta-tag.topic-tag { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.15); }

        .syllabus-nodes-section { margin-top: 24px; }
        .syllabus-header { font-size: 0.72rem; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
        .nodes-list { display: flex; flex-direction: column; gap: 6px; }
        .syllabus-node-link {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px; color: #cbd5e1; font-size: 0.82rem; font-weight: 600;
          text-decoration: none; transition: 0.2s; cursor: pointer;
        }
        .syllabus-node-link:hover { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.15); color: #93c5fd; }
        .syllabus-node-link .dot { width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; }
        .nodes-empty { font-size: 0.78rem; color: #475569; font-style: italic; }

        .notes-list-view { display: flex; flex-direction: column; gap: 8px; }
        .note-list-item {
          padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; cursor: pointer; transition: 0.2s;
        }
        .note-list-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
        .note-list-item.active { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.05); }
        .note-list-item .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .note-list-item .item-title { font-size: 0.75rem; font-weight: 800; color: #3b82f6; text-transform: uppercase; }
        .note-list-item .ai-badge { font-size: 0.55rem; font-weight: 900; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 2px 6px; border-radius: 4px; }
        .note-list-item .item-preview { font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin: 0 0 8px 0; }
        .note-list-item .item-date { font-size: 0.68rem; color: #475569; font-weight: 600; display: block; text-align: right; }

        /* TAB: TRACKING */
        .tracking-content { display: flex; flex-direction: column; gap: 20px; }
        .tracking-widget {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px;
        }
        .tracking-widget h4 { font-size: 0.95rem; font-weight: 800; color: white; margin: 0; }
        .widget-desc { font-size: 0.78rem; color: #64748b; line-height: 1.45; margin: 0 0 6px 0; }
        
        .bookmark-toggle-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
          color: #94a3b8; padding: 12px 18px; border-radius: 12px; font-size: 0.78rem;
          font-weight: 800; cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .bookmark-toggle-btn:hover { background: rgba(255,255,255,0.08); color: white; }
        .bookmark-toggle-btn.active { color: #fbbf24; background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.3); }

        .progress-toggle-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
          color: #94a3b8; padding: 12px 18px; border-radius: 12px; font-size: 0.78rem;
          font-weight: 800; cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .progress-toggle-btn:hover { background: rgba(255,255,255,0.08); color: white; }
        .progress-toggle-btn.reading { color: #3b82f6; background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); }
        .progress-toggle-btn.mastered { color: #10b981; background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); }
        .progress-toggle-btn.revision_needed { color: #ef4444; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); }

        .hub-widget { background: linear-gradient(135deg, rgba(59,130,246,0.05), rgba(99,102,241,0.05)); border-color: rgba(59,130,246,0.15); }
        .hub-link {
          text-align: center; display: block; border: 1px solid rgba(59,130,246,0.2);
          background: rgba(59,130,246,0.1); color: #60a5fa; padding: 12px 18px; border-radius: 12px;
          font-size: 0.78rem; font-weight: 800; text-decoration: none; transition: 0.2s;
        }
        .hub-link:hover { background: rgba(59,130,246,0.2); color: white; }

        .loading { font-size: 0.82rem; color: #64748b; font-style: italic; text-align: center; padding: 32px 0; }
        .empty { font-size: 0.82rem; color: #64748b; font-style: italic; text-align: center; padding: 32px 0; }

        @media (max-width: 480px) {
          .workspace-sidebar { width: 100vw; }
        }
      `}</style>
    </>
  );
}
