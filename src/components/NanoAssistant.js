"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/context/TranslationContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NanoAssistant({ isOpen, onClose }) {
  const { lang } = useTranslation();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response, loading]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch('/api/nano', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, lang })
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      setResponse(data.result || data.error);
      setQuery("");
    } catch (err) {
      console.error("Nano API Error:", err);
      setResponse("⚠️ Connection to Cloud Nano failed. Please check your network or try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="nano-panel">
      <div className="nano-header">
        <div className="nano-title">
          <span className="nano-sparkles">✨</span>
          <strong>Ask Nano</strong>
          <span className="nano-badge">Premium Intelligence</span>
        </div>
        <button className="nano-close" onClick={onClose}>✕</button>
      </div>

      <div className="nano-body" ref={scrollRef}>
        <div className="nano-chat">
          {response ? (
            <div className="nano-message assistant">
              <div className="nano-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="nano-welcome">
              I am your premium AI assistant, now powered by the <strong>Gemma 4 News Engine</strong>. I can synthesize latest UPSC editorials, analyze strategic mapping theaters, and provide high-accuracy &quot;Crux&quot; for your Mains preparation. What strategic area shall we analyze today?
            </div>
          )}
          {loading && <div className="nano-message loading">Nano is thinking...</div>}
        </div>
      </div>

      <form className="nano-input-group" onSubmit={handleAsk}>
        <input
          type="text"
          className="nano-input"
          placeholder="Ask a strategic question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <button type="submit" className="nano-send" disabled={loading || !query.trim()}>
          {loading ? "..." : "Ask"}
        </button>
      </form>
    </div>
  );
}
