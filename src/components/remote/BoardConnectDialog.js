'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tv, X, CheckCircle2, AlertCircle, RefreshCw, Unplug } from 'lucide-react';
import '@/app/remote/remote.css';

export default function BoardConnectDialog({
  isOpen,
  onClose,
  linkStatus = 'waiting',
  statusInfo = '',
  pairedCode = null,
  onConnect,
  onDisconnect,
}) {
  const [digits, setDigits] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setDigits(pairedCode || '');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, pairedCode]);

  useEffect(() => {
    if (statusInfo) {
      setErrorMsg(statusInfo);
    }
  }, [statusInfo]);

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setDigits(val);
    setErrorMsg('');

    // Auto-connect on the 6th digit as specified in section 7
    if (val.length === 6 && onConnect) {
      onConnect(val);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (digits.length === 6 && onConnect) {
      onConnect(digits);
    } else {
      setErrorMsg(`Please enter all 6 digits (${6 - digits.length} more needed)`);
    }
  };

  if (!isOpen) return null;

  const isConnected = linkStatus === 'connected';
  const isConnecting = linkStatus === 'connecting';

  return (
    <div
      className="pq-connect-dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="pq-connect-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pq-connect-dialog-header">
          <h3 className="pq-connect-dialog-title">
            <Tv size={20} color="#38bdf8" />
            <span>Connect to Smart Board</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="pq-connect-btn-secondary"
            style={{ padding: '4px 8px', borderRadius: 8 }}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <p className="pq-connect-dialog-sub">
          {isConnected
            ? `Paired with classroom screen (${pairedCode}). Everything you do on this iPad is mirrored live.`
            : 'Type the 6-digit code shown on the smart board to take control.'}
        </p>

        {!isConnected ? (
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={digits}
              onChange={handleChange}
              disabled={isConnecting}
              placeholder="••••••"
              className="pq-connect-code-input"
            />

            <div
              className={`pq-connect-status-hint ${
                errorMsg
                  ? 'is-error'
                  : isConnecting
                  ? 'is-active'
                  : ''
              }`}
            >
              {errorMsg ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <AlertCircle size={14} /> {errorMsg}
                </span>
              ) : isConnecting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <RefreshCw size={14} className="pq-spin" /> Connecting to board...
                </span>
              ) : digits.length > 0 && digits.length < 6 ? (
                `${6 - digits.length} more digit${6 - digits.length === 1 ? '' : 's'} needed`
              ) : (
                'Connects automatically on the 6th digit'
              )}
            </div>

            <div className="pq-connect-dialog-actions">
              <button
                type="submit"
                disabled={digits.length !== 6 || isConnecting}
                className="pq-connect-btn-primary"
              >
                {isConnecting ? 'Connecting...' : 'Connect to Board'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="pq-connect-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '12px 16px',
                borderRadius: 14,
                color: '#22c55e',
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              <CheckCircle2 size={20} />
              <span>Live Mirrored to Board ({pairedCode})</span>
            </div>

            <div className="pq-connect-dialog-actions">
              <button
                type="button"
                onClick={() => {
                  onDisconnect?.();
                  onClose();
                }}
                className="pq-connect-btn-secondary"
                style={{
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  flex: 1,
                }}
              >
                <Unplug size={16} /> Disconnect Board
              </button>
              <button
                type="button"
                onClick={onClose}
                className="pq-connect-btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
