'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import './admin-rag.css';

export default function ContentIngestionPage() {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'POLITY',
    examType: 'BOTH',
    sourceUrl: '',
    contentMarkdown: '',
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStats(null);
    try {
      const res = await fetch('/api/admin/ingest-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Ingestion failed');
      
      toast?.success('Content successfully ingested to Vector DB!');
      setStats(data.stats);
      setFormData({ ...formData, contentMarkdown: '', title: '', sourceUrl: '' });
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-rag-container">
      <div className="admin-rag-card">
        <div className="admin-rag-header">
          <h1 className="admin-rag-title">Content Intelligence Hub</h1>
          <p className="admin-rag-subtitle">Ingest core UPSC materials into the Vector Knowledge Base</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-rag-grid">
            <div className="admin-rag-group">
              <label className="admin-rag-label">Document Title</label>
              <input 
                required
                type="text" 
                className="admin-rag-input"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Fundamental Rights - Ch 7"
              />
            </div>
            <div className="admin-rag-group">
              <label className="admin-rag-label">Source URL (Optional)</label>
              <input 
                type="text" 
                className="admin-rag-input"
                value={formData.sourceUrl}
                onChange={e => setFormData({...formData, sourceUrl: e.target.value})}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="admin-rag-grid">
            <div className="admin-rag-group">
              <label className="admin-rag-label">UPSC Subject</label>
              <select 
                className="admin-rag-select"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              >
                <option value="POLITY">Polity & Governance</option>
                <option value="HISTORY">History & Culture</option>
                <option value="GEOGRAPHY">Geography</option>
                <option value="ECONOMY">Economy</option>
                <option value="ENVIRONMENT">Environment & Ecology</option>
                <option value="SCIENCE">Science & Tech</option>
                <option value="CURRENT_AFFAIRS">Current Affairs</option>
              </select>
            </div>
            <div className="admin-rag-group">
              <label className="admin-rag-label">Exam Target</label>
              <select 
                className="admin-rag-select"
                value={formData.examType}
                onChange={e => setFormData({...formData, examType: e.target.value})}
              >
                <option value="BOTH">Universal (Prelims & Mains)</option>
                <option value="PRELIMS">Prelims Centric</option>
                <option value="MAINS">Mains Centric</option>
              </select>
            </div>
          </div>

          <div className="admin-rag-group">
            <label className="admin-rag-label">Knowledge Corpus (Markdown / Text)</label>
            <textarea 
              required
              className="admin-rag-textarea"
              value={formData.contentMarkdown}
              onChange={e => setFormData({...formData, contentMarkdown: e.target.value})}
              placeholder="Paste syllabus notes, chapters, or detailed editorial analysis here..."
            />
          </div>

          <button 
            type="submit" 
            className="admin-rag-button"
            disabled={loading}
          >
            {loading ? 'Chunking & Vectorizing...' : 'Ingest into Neural Database'}
          </button>
        </form>

        {stats && (
          <div className="admin-rag-success">
             ✓ Successfully embedded and indexed {stats.saved} / {stats.total} content chunks.
          </div>
        )}
      </div>
    </div>
  );
}
