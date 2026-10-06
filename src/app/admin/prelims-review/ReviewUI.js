'use client';

import { useState } from 'react';
import { publishDraft, rejectDraft } from './actions';

export default function ReviewUI({ initialDrafts }) {
    const [drafts, setDrafts] = useState(initialDrafts);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    if (drafts.length === 0) return <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>No pending drafts to review.</div>;

    const draft = drafts[currentIndex];
    const [editedData, setEditedData] = useState({
        ...draft,
        paper: 'GS1'
    });

    const handlePublish = async () => {
        setLoading(true);
        await publishDraft(draft.id, editedData);
        const newDrafts = drafts.filter(d => d.id !== draft.id);
        setDrafts(newDrafts);
        if (currentIndex >= newDrafts.length) setCurrentIndex(Math.max(0, newDrafts.length - 1));
        if (newDrafts.length > 0) setEditedData({ ...newDrafts[Math.min(currentIndex, newDrafts.length - 1)], paper: 'GS1' });
        setLoading(false);
    };

    const handleReject = async () => {
        setLoading(true);
        await rejectDraft(draft.id);
        const newDrafts = drafts.filter(d => d.id !== draft.id);
        setDrafts(newDrafts);
        if (currentIndex >= newDrafts.length) setCurrentIndex(Math.max(0, newDrafts.length - 1));
        if (newDrafts.length > 0) setEditedData({ ...newDrafts[Math.min(currentIndex, newDrafts.length - 1)], paper: 'GS1' });
        setLoading(false);
    };

    const updateField = (field, value) => setEditedData({ ...editedData, [field]: value });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', alignItems: 'start', fontFamily: 'system-ui, sans-serif' }}>
            {/* Left Col: The Question Viewer */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>Question #{editedData.questionNo || '?'}</h2>
                    <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '4px 12px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '12px', fontWeight: 'bold' }}>
                        {editedData.examName || 'UPSC'} {editedData.examYear || ''}
                    </span>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Question Stem (Editable)</label>
                    <textarea 
                        value={editedData.stem}
                        onChange={e => updateField('stem', e.target.value)}
                        style={{ width: '100%', minHeight: '140px', padding: '16px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Options</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {editedData.options.map((opt, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#94a3b8', width: '24px', textAlign: 'center' }}>{opt.label})</span>
                                <input 
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                        const newOpts = [...editedData.options];
                                        newOpts[i].text = e.target.value;
                                        updateField('options', newOpts);
                                    }}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: '15px' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Correct Answer</label>
                    <select 
                        value={editedData.correctLabel || ''} 
                        onChange={e => updateField('correctLabel', e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#34d399', fontWeight: 'bold', fontSize: '14px', width: '160px', cursor: 'pointer' }}
                    >
                        <option value="">Select...</option>
                        {editedData.options.map(o => <option key={o.label} value={o.label}>Option {o.label.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            {/* Right Col: Taxonomy & Actions */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #334155', paddingBottom: '12px', margin: '0 0 16px 0' }}>Taxonomy Tags</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px' }}>Subject</label>
                            <input 
                                type="text" 
                                value={editedData.srcSubject || ''}
                                onChange={e => updateField('srcSubject', e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: '14px' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px' }}>Topic</label>
                            <input 
                                type="text" 
                                value={editedData.srcTopic || ''}
                                onChange={e => updateField('srcTopic', e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: '14px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px' }}>Paper</label>
                            <select 
                                value={editedData.paper}
                                onChange={e => updateField('paper', e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: '14px', cursor: 'pointer' }}
                            >
                                <option value="GS1">GS Paper 1</option>
                                <option value="CSAT">CSAT</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={handleReject}
                        disabled={loading}
                        style={{ flex: 1, padding: '14px', background: '#334155', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Reject
                    </button>
                    <button 
                        onClick={handlePublish}
                        disabled={loading || !editedData.correctLabel}
                        style={{ flex: 2, padding: '14px', background: (loading || !editedData.correctLabel) ? '#0f172a' : '#059669', color: (loading || !editedData.correctLabel) ? '#475569' : 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (loading || !editedData.correctLabel) ? 'not-allowed' : 'pointer', boxShadow: (loading || !editedData.correctLabel) ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.2)', transition: 'all 0.2s' }}
                    >
                        {loading ? 'Publishing...' : 'Approve & Publish'}
                    </button>
                </div>
                
                {/* Navigation Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid #334155' }}>
                    <button 
                        onClick={() => {
                            if (currentIndex > 0) {
                                const prevIdx = currentIndex - 1;
                                setCurrentIndex(prevIdx);
                                setEditedData({ ...drafts[prevIdx], paper: 'GS1' });
                            }
                        }}
                        disabled={currentIndex === 0 || loading}
                        style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #475569', color: currentIndex === 0 ? '#475569' : '#e2e8f0', borderRadius: '6px', fontSize: '13px', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        ← Prev
                    </button>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>
                        {currentIndex + 1} / {drafts.length}
                    </span>
                    <button 
                        onClick={() => {
                            if (currentIndex < drafts.length - 1) {
                                const nextIdx = currentIndex + 1;
                                setCurrentIndex(nextIdx);
                                setEditedData({ ...drafts[nextIdx], paper: 'GS1' });
                            }
                        }}
                        disabled={currentIndex >= drafts.length - 1 || loading}
                        style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #475569', color: currentIndex >= drafts.length - 1 ? '#475569' : '#e2e8f0', borderRadius: '6px', fontSize: '13px', cursor: currentIndex >= drafts.length - 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}
