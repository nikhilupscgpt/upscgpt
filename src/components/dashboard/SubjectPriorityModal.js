'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Target, Sparkles, Sliders } from 'lucide-react';

const ALL_SUBJECTS = [
  { name: 'Indian Polity', icon: '🏛️', weight: 'High' },
  { name: 'Economy', icon: '📈', weight: 'High' },
  { name: 'Geography', icon: '🌍', weight: 'High' },
  { name: 'Environment', icon: '🌿', weight: 'High' },
  { name: 'Science & Technology', icon: '🔬', weight: 'High' },
  { name: 'Modern History', icon: '📜', weight: 'High' },
  { name: 'Ancient History', icon: '🏺', weight: 'Medium' },
  { name: 'Medieval History', icon: '🏰', weight: 'Medium' },
  { name: 'Art & Culture', icon: '🎨', weight: 'Medium' },
  { name: 'Agriculture', icon: '🌾', weight: 'Medium' },
];

export default function SubjectPriorityModal({ isOpen, onClose, selectedFocus = [], onSave }) {
  const [selected, setSelected] = useState(selectedFocus);

  useEffect(() => {
    if (isOpen) {
      setSelected(selectedFocus.length > 0 ? selectedFocus : ['Indian Polity', 'Economy']);
    }
  }, [isOpen, selectedFocus]);

  if (!isOpen) return null;

  const toggleSubject = (name) => {
    setSelected(prev => {
      if (prev.includes(name)) {
        // Keep at least 1 focus subject
        if (prev.length <= 1) return prev;
        return prev.filter(s => s !== name);
      } else {
        // Cap at 4 focus subjects for optimal balance
        if (prev.length >= 4) return prev;
        return [...prev, name];
      }
    });
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="pq-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-secondary, #0f172a)',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <Sliders size={14} /> Adaptive Drill Engine
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary, #f8fafc)' }}>
              Set High-Priority Subjects
            </h3>
          </div>
          <button
            type="button"
            className="pq-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
          Choose <strong>1 to 4 focus subjects</strong>. Your daily streak drill will automatically allocate <strong>60% of questions</strong> from your focus subjects, while maintaining a 40% background mix across other subjects for long-term retention.
        </p>

        {/* Subjects Selector Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
          {ALL_SUBJECTS.map(subj => {
            const isChecked = selected.includes(subj.name);
            return (
              <button
                key={subj.name}
                type="button"
                onClick={() => toggleSubject(subj.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isChecked
                    ? '1.5px solid #3b82f6'
                    : '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                  background: isChecked
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'var(--bg-primary, rgba(255, 255, 255, 0.02))',
                  color: isChecked ? '#3b82f6' : 'var(--text-primary, #f8fafc)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{subj.icon}</span>
                  <span>{subj.name}</span>
                </div>
                {isChecked && (
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected count info & action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
            {selected.length} of 4 subjects selected
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="pq-btn"
              onClick={onClose}
              style={{ padding: '9px 16px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="pq-btn pq-btn-primary"
              onClick={handleSave}
              style={{ padding: '9px 20px', fontSize: '0.85rem', fontWeight: 800 }}
            >
              Apply Priorities
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
