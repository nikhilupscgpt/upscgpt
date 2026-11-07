'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, Sparkles, ArrowRight } from 'lucide-react';
import '@/app/remote/remote.css';

export default function JoinClient({ code: initialCode = '' }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = code.replace(/\D/g, '').slice(0, 6);
    if (clean.length === 6) {
      router.push(`/admin/pyq/present?board=${clean}`);
    }
  };

  return (
    <div className="pq-board-display-root">
      <div className="pq-board-waiting-card" style={{ maxWidth: 460 }}>
        <div className="pq-board-logo-pill">
          <Sparkles size={14} />
          <span>UPSCGPT REMOTE PRESENTING</span>
        </div>

        <h2 className="pq-board-waiting-title" style={{ fontSize: 28 }}>
          Pair with Classroom Screen
        </h2>
        <p className="pq-board-waiting-sub">
          Enter the 6-digit code shown on the smart board to start presenting.
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(val);
              if (val.length === 6) {
                router.push(`/admin/pyq/present?board=${val}`);
              }
            }}
            placeholder="••••••"
            className="pq-connect-code-input"
            autoFocus
          />

          <button
            type="submit"
            disabled={code.length !== 6}
            className="pq-connect-btn-primary"
            style={{ width: '100%', marginTop: 20, padding: 14 }}
          >
            <span>Start Presenting on Board</span> <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
