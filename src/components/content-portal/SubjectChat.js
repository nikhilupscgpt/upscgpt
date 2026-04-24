'use client';

import { useState } from 'react';
import { Send, Loader2, Focus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './../../app/content-portal/portal-rag.css';

export default function SubjectChat({ subject, examType }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content, subject, examType })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.response, 
        sources: data.sources 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', content: err.message || 'Failed to fetch RAG response' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-chat-wrapper">
      {/* Header */}
      <div className="chat-header">
        <h2 className="chat-subject-name">
          {subject.replace('_', ' ')} Neural Node
        </h2>
        <span className="chat-mode-badge">
          {examType === 'MAINS' ? 'Analytical Synthesis' : 'Factual Extraction'}
        </span>
      </div>

      {/* Chat Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
           <div className="chat-empty">
             <Focus className="chat-empty-icon" />
             <p className="chat-empty-text">Initialize a query vector for {subject.replace('_', ' ')}.</p>
           </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <div className="chat-bubble">
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
              
              {/* Citations block for AI responses */}
              {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                <div className="chat-sources">
                  <div className="chat-source-title">Retrieved Context Sources</div>
                  {msg.sources.map((s, idx) => (
                    <div key={idx} className="chat-source-item">
                      • {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                      ) : (
                         s.title
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="chat-msg ai">
            <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Loader2 className="animate-spin" size={16} /> Retrieving nearest vector blocks...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-form">
          <input
            type="text"
            className="chat-input"
            placeholder={`Query the embedded logic for ${subject}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-submit-btn"
            disabled={loading || !query.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
