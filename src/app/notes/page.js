"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, Filter, Trash2, Edit, Copy, ExternalLink, Calendar, BookOpen, Layers } from "lucide-react";

export default function AllNotesPage() {
  const { data: session, status: authStatus } = useSession();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchNotes();
    }
  }, [authStatus]);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/user/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (e) {
      console.error("Failed to fetch notes:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`/api/user/notes?noteId=${noteId}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  const handleEditStart = (note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const handleEditSave = async () => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch("/api/user/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: editingNote.id, content: editContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => prev.map((n) => (n.id === data.note.id ? { ...n, content: data.note.content, updatedAt: data.note.updatedAt } : n)));
        setEditingNote(null);
      }
    } catch (e) {
      console.error("Failed to save note:", e);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Note copied to clipboard!");
  };

  const handleExportAll = () => {
    const text = filteredNotes
      .map((n) => {
        const date = new Date(n.createdAt).toLocaleDateString();
        return `### ${n.entityTitle} (${n.entityType.toUpperCase()}) - ${date}\nSubject: ${n.subject || "General"}\nTopic: ${n.topic || "General"}\nAI Generated: ${n.isAiGenerated ? "Yes" : "No"}\n\n${n.content}\n\n---\n`;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "upsc_atlas_study_notes.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get distinct subjects
  const subjects = ["all", ...new Set(notes.map((n) => n.subject).filter(Boolean))];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.entityTitle && n.entityTitle.toLowerCase().includes(search.toLowerCase())) ||
      (n.topic && n.topic.toLowerCase().includes(search.toLowerCase()));

    const matchesSubject = selectedSubject === "all" || n.subject === selectedSubject;
    const matchesType = selectedType === "all" || n.entityType === selectedType;

    return matchesSearch && matchesSubject && matchesType;
  });

  const getEntityUrl = (note) => {
    if (note.entityType === "article") return `/news/article/${note.id || note.entityTitle}`; // note endpoint handles lookup or direct link
    if (note.entityType === "streak") return `/news/streak/${note.id}`;
    if (note.entityType === "issue") return `/issues/${note.id}`; // slug fallback
    return "#";
  };

  if (authStatus === "loading" || (authStatus === "authenticated" && loading)) {
    return (
      <div className="notes-page-container loading-container">
        <div className="spinner"></div>
        <p>Retrieving your intelligence dashboard...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
            color: #94a3b8;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(59, 130, 246, 0.2);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="notes-page-container login-prompt">
        <h2>Authentication Required</h2>
        <p>Sign in to view and manage your personalized study notes.</p>
        <Link href="/login?callbackUrl=/notes" className="login-btn">
          Sign In
        </Link>
        <style jsx>{`
          .login-prompt {
            text-align: center;
            padding: 80px 20px;
            color: #94a3b8;
          }
          h2 { color: white; margin-bottom: 12px; }
          .login-btn {
            display: inline-block;
            margin-top: 24px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: white;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 800;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="notes-page-container">
      <div className="notes-page-header">
        <div>
          <h1>My Intelligence Hub</h1>
          <p className="subtitle">Manage, search, and export your personal UPSC study notes</p>
        </div>
        {filteredNotes.length > 0 && (
          <button className="export-btn" onClick={handleExportAll}>
            📥 Export Filtered ({filteredNotes.length})
          </button>
        )}
      </div>

      {/* Toolbar & Filters */}
      <div className="notes-toolbar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes content, topics, or titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-wrapper">
          <div className="filter-select">
            <Layers size={14} />
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="all">All Subjects</option>
              {subjects.filter(s => s !== "all").map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <BookOpen size={14} />
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="issue">Strategic Briefing</option>
              <option value="article">Current Article</option>
              <option value="editorial">Editorial Lens</option>
              <option value="streak">Live Streak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon">📝</div>
          <h3>No study notes found</h3>
          <p>Try adjusting your search query, selecting different filters, or start taking notes on briefings and articles!</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-card-header">
                <span className="entity-type-tag">{note.entityType}</span>
                {note.isAiGenerated && <span className="ai-badge">AI SUGGESTED</span>}
                <div className="card-actions">
                  <button onClick={() => copyToClipboard(note.content)} title="Copy content">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleEditStart(note)} title="Edit note">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="delete-btn" title="Delete note">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className="note-title">{note.entityTitle || "Untitled Reference"}</h4>

              <div className="note-meta">
                {note.subject && <span className="meta-tag subject">{note.subject}</span>}
                {note.topic && <span className="meta-tag topic">{note.topic}</span>}
              </div>

              <p className="note-content">{note.content}</p>

              <div className="note-card-footer">
                <span className="note-date">
                  <Calendar size={12} />
                  {new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {note.entityType && (
                  <Link href={`/news`} className="source-link">
                    Open Source <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingNote && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Note</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={8}
            />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setEditingNote(null)}>
                Cancel
              </button>
              <button className="modal-btn save" onClick={handleEditSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .notes-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 120px 24px 60px;
          color: #f8fafc;
          font-family: "Outfit", sans-serif;
        }

        .notes-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          letter-spacing: -0.03em;
        }

        .subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin-top: 4px;
        }

        .export-btn {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        /* Toolbar */
        .notes-toolbar {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
        }

        .search-wrapper input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 14px 16px 14px 48px;
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
        }

        .search-wrapper input:focus {
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
        }

        .filters-wrapper {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 0 16px;
          color: #94a3b8;
        }

        .filter-select select {
          background: transparent;
          border: none;
          color: white;
          padding: 14px 0;
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
          font-weight: 600;
        }

        /* Grid */
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .note-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .note-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(15, 23, 42, 0.55);
        }

        .note-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .entity-type-tag {
          font-size: 0.65rem;
          font-weight: 900;
          color: #3b82f6;
          text-transform: uppercase;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }

        .ai-badge {
          font-size: 0.6rem;
          font-weight: 900;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }

        .card-actions {
          margin-left: auto;
          display: flex;
          gap: 6px;
        }

        .card-actions button {
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .card-actions button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .card-actions button.delete-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .note-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: white;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .note-meta {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .meta-tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 6px;
        }

        .meta-tag.subject {
          background: rgba(59, 130, 246, 0.08);
          color: #60a5fa;
        }

        .meta-tag.topic {
          background: rgba(16, 185, 129, 0.08);
          color: #34d399;
        }

        .note-content {
          font-size: 0.92rem;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 24px;
          flex: 1;
          white-space: pre-wrap;
        }

        .note-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 16px;
          font-size: 0.75rem;
          color: #475569;
        }

        .note-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .source-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }

        .source-link:hover {
          color: #60a5fa;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          width: 500px;
          max-width: 90vw;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .modal-content h3 {
          margin-bottom: 20px;
          font-size: 1.25rem;
          font-weight: 850;
        }

        .modal-content textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px;
          color: white;
          font-family: inherit;
          line-height: 1.6;
          outline: none;
          resize: vertical;
          margin-bottom: 24px;
        }

        .modal-content textarea:focus {
          border-color: rgba(59, 130, 246, 0.4);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .modal-btn {
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-btn.cancel {
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
        }

        .modal-btn.cancel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .modal-btn.save {
          background: #3b82f6;
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .modal-btn.save:hover {
          background: #2563eb;
        }

        .empty-state-card {
          text-align: center;
          padding: 80px 24px;
          background: rgba(15, 23, 42, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state-card h3 {
          color: white;
          font-size: 1.25rem;
          margin-bottom: 8px;
        }

        .empty-state-card p {
          max-width: 440px;
          margin: 0 auto;
          font-size: 0.9rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
