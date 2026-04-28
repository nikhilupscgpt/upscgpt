'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Focus, Zap, Lock, History, Award, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTier } from '@/hooks/useTier';
import './../../app/content-portal/portal-rag.css';

const PROGRESS_STEPS = [
  "Initializing Neural Vectors...",
  "Querying D.R. Khullar [Vision Engine]...",
  "Consulting UPSC Strategic History (PYQs)...",
  "Synthesizing Professor-Grade Response..."
];

export default function SubjectChat({ subjectId, displayName, examType, optionalSlug }) {
  const { isPro } = useTier();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Handle Progress Animation
  useEffect(() => {
    let interval;
    if (loading) {
      setProgressStep(0);
      interval = setInterval(() => {
        setProgressStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1800);
    } else {
      setProgressStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const currentQuery = query.trim();
    const userMessage = { role: 'user', content: currentQuery };
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery, subject: subjectId, examType, optionalSlug, history })
      });

      if (!response.ok) throw new Error('Generation Failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let sources = [];
      let pyqs = [];
      let isFirstChunk = true;

      // Create initial empty message
      setMessages(prev => [...prev, { role: 'ai', content: '', sources: [], pyqs: [] }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        
        if (isFirstChunk && chunk.startsWith('METADATA:')) {
          const jsonStr = chunk.split('\n')[0].replace('METADATA:', '');
          const metadata = JSON.parse(jsonStr);
          sources = metadata.sources || [];
          pyqs = metadata.pyqs || [];
          const remainingText = chunk.split('\n').slice(1).join('\n');
          aiContent += remainingText;
          isFirstChunk = false;
        } else {
          aiContent += chunk;
        }

        // Update the last message in real-time
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { 
            role: 'ai', 
            content: aiContent, 
            sources, 
            pyqs 
          };
          return newMsgs;
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', content: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-chat-wrapper">
      <div className="chat-header">
        <h2 className="chat-subject-name">{displayName || 'Subject'} Neural Lab</h2>
        <div className="chat-badges">
          {isPro && <span className="chat-mode-badge pro-glow"><Zap size={10} fill="black" /> PRO</span>}
          <span className="chat-mode-badge">{examType} Analysis</span>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <Focus className="chat-empty-icon" />
            <p className="chat-empty-text">Initialize a query vector for {displayName}.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="chat-bubble">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              
              {msg.pyqs && msg.pyqs.length > 0 && (
                <div className="chat-pyq-block">
                  <div className="pyq-header"><History size={14} /><span>Strategic Relevancy (PYQs)</span></div>
                  {msg.pyqs.map((p, idx) => (
                    <div key={idx} className="pyq-item">
                      <div className="pyq-meta">
                        <span className="pyq-year">{p.year}</span>
                        <span className="pyq-paper">{p.paper}</span>
                        {p.marks && <span className="pyq-marks">{p.marks}M</span>}
                      </div>
                      <p className="pyq-text">{p.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {msg.sources && msg.sources.length > 0 && (
              <div className="chat-sources">
                <div className="chat-source-title">Academic Citations</div>
                {msg.sources.map((s, idx) => (
                  <div key={idx} className="chat-source-item"><Award size={10} style={{ marginRight: '6px' }} />{s.title}</div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {loading && messages[messages.length - 1]?.role !== 'ai' && (
          <div className="chat-msg ai">
            <div className="chat-bubble loading-bubble">
               <div className="neural-progress">
                 <Cpu className="animate-pulse" size={16} />
                 <span>{PROGRESS_STEPS[progressStep]}</span>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-form">
          <input
            type="text"
            className="chat-input"
            placeholder={`Query ${displayName}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="chat-submit-btn" disabled={loading || !query.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
