'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import './admin-rag.css';

export default function ContentIngestionPage() {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'GEOGRAPHY',
    examType: 'BOTH',
    sourceUrl: '',
    contentMarkdown: '',
    isOptional: false,
    optionalSlug: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [optionals, setOptionals] = useState([]);

  useEffect(() => {
    fetch('/api/optionals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOptionals(data);
      })
      .catch(err => console.error('Error fetching optionals:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStats(null);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('subject', formData.subject);
      payload.append('examType', formData.examType);
      payload.append('sourceUrl', formData.sourceUrl);
      payload.append('contentMarkdown', formData.contentMarkdown);
      payload.append('isOptional', formData.isOptional);
      payload.append('optionalSlug', formData.optionalSlug);
      
      if (file) {
        payload.append('file', file);
      }

      const res = await fetch('/api/admin/ingest-content', {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Ingestion failed');
      
      toast.success('Content successfully ingested to Neural Base!');
      setStats(data.stats);
      setFormData({ ...formData, contentMarkdown: '', title: '', sourceUrl: '', isOptional: false });
      setFile(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-rag-container">
      <div className="admin-rag-card">
        <div className="admin-rag-header">
          <h1 className="admin-rag-title">Neural Ingestion Hub</h1>
          <p className="admin-rag-subtitle">Upload PDFs or paste text into the Strategic Knowledge Base</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-rag-form">
          <div className="admin-rag-grid">
            <div className="admin-rag-group">
              <label className="admin-rag-label">Document Title</label>
              <input 
                required
                type="text" 
                className="admin-rag-input"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Khullar - Indian Geography Ch 1"
              />
            </div>
            <div className="admin-rag-group">
              <label className="admin-rag-label">PDF Upload (Optional)</label>
              <div className="file-upload-zone">
                {file ? (
                  <div className="file-info">
                    <FileText size={18} color="#10b981" />
                    <span className="file-name">{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="remove-file">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="file-label">
                    <Upload size={18} />
                    <span>Select PDF File</span>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={e => setFile(e.target.files[0])} 
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="admin-rag-grid" style={{ marginTop: '1.5rem' }}>
            <div className="admin-rag-group">
              <label className="admin-rag-label">Target GS Subject</label>
              <select 
                className="admin-rag-select"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              >
                <option value="GEOGRAPHY">Geography</option>
                <option value="POLITY">Polity & Governance</option>
                <option value="HISTORY">History & Culture</option>
                <option value="ECONOMY">Economy</option>
                <option value="ENVIRONMENT">Environment & Ecology</option>
                <option value="SCIENCE">Science & Tech</option>
                <option value="CURRENT_AFFAIRS">Current Affairs</option>
              </select>
            </div>
            <div className="admin-rag-group">
              <label className="admin-rag-label">Strategic Category</label>
              <div className="optional-toggle-container">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={formData.isOptional}
                    onChange={e => setFormData({...formData, isOptional: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">Is Optional Subject?</span>
              </div>
              
              {formData.isOptional && (
                <select 
                  required
                  className="admin-rag-select"
                  style={{ marginTop: '10px' }}
                  value={formData.optionalSlug}
                  onChange={e => setFormData({...formData, optionalSlug: e.target.value})}
                >
                  <option value="">-- Choose Optional --</option>
                  {optionals.map(opt => (
                    <option key={opt.id} value={opt.slug}>{opt.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {!file && (
            <div className="admin-rag-group" style={{ marginTop: '1.5rem' }}>
              <label className="admin-rag-label">Manual Text (Markdown)</label>
              <textarea 
                className="admin-rag-textarea"
                value={formData.contentMarkdown}
                onChange={e => setFormData({...formData, contentMarkdown: e.target.value})}
                placeholder="Paste notes here if not uploading a PDF..."
              />
            </div>
          )}

          <button 
            type="submit" 
            className="admin-rag-button"
            disabled={loading}
            style={{ marginTop: '2rem' }}
          >
            {loading ? 'Processing Neural Vectors...' : 'Sync with Knowledge Base'}
          </button>
        </form>

        {stats && (
          <div className="admin-rag-success">
             <CheckCircle2 size={18} />
             <span>Successfully indexed {stats.saved} strategic segments.</span>
          </div>
        )}
      </div>
    </div>
  );
}
