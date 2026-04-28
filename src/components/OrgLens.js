"use client"
import { useState, useEffect } from 'react'

const CATEGORY_META = {
  MILITARY:     { label: 'Military & Security', icon: '🛡️', color: '#ef4444' },
  ECONOMIC:     { label: 'Economic',             icon: '💹', color: '#f59e0b' },
  REGIONAL:     { label: 'Regional',             icon: '🗺️', color: '#3b82f6' },
  ENVIRONMENTAL:{ label: 'Environment',          icon: '🌿', color: '#22c55e' },
  SCIENTIFIC:   { label: 'Scientific',           icon: '🔬', color: '#a855f7' },
}

const INDIA_ROLE_META = {
  MEMBER:            { label: 'Member',           color: '#22c55e', icon: '✅' },
  OBSERVER:          { label: 'Observer',         color: '#f59e0b', icon: '👁️' },
  DIALOGUE_PARTNER:  { label: 'Dialogue Partner', color: '#3b82f6', icon: '🤝' },
  NOT_MEMBER:        { label: 'Not a Member',     color: '#94a3b8', icon: '❌' },
}

function OrgCard({ org, onSelect, isActive }) {
  const cat = CATEGORY_META[org.category] || CATEGORY_META.REGIONAL
  const indiaRole = INDIA_ROLE_META[org.indiaRole] || INDIA_ROLE_META.NOT_MEMBER
  const memberCount = org.members?.split(',').length || 0

  return (
    <button
      onClick={() => onSelect(org)}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: '14px',
        border: isActive ? `2px solid ${cat.color}99` : '1px solid rgba(148,163,184,0.14)',
        background: isActive
          ? `linear-gradient(180deg, rgba(30,41,59,0.98), rgba(17,24,39,0.98))`
          : 'linear-gradient(180deg, rgba(30,41,59,0.94), rgba(17,24,39,0.9))',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: isActive ? `0 0 20px ${cat.color}22` : '0 4px 12px rgba(2,6,23,0.12)',
        transition: 'all 0.25s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: cat.color, fontWeight: 800 }}>{cat.icon} {org.category}</span>
            <span style={{ fontSize: '0.7rem', color: indiaRole.color, fontWeight: 700 }}>{indiaRole.icon} India: {indiaRole.label}</span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f8fafc', marginBottom: '2px' }}>{org.shortName}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{memberCount} members · Est. {org.founded}</div>
        </div>
        <span style={{ color: isActive ? cat.color : '#64748b', fontSize: '1.1rem' }}>{isActive ? '●' : '›'}</span>
      </div>
    </button>
  )
}

function OrgDetailCard({ org, onClose, onQuiz, quizLoading }) {
  if (!org) return null
  const cat = CATEGORY_META[org.category] || CATEGORY_META.REGIONAL
  const indiaRole = INDIA_ROLE_META[org.indiaRole] || INDIA_ROLE_META.NOT_MEMBER
  const members = org.members?.split(',').map(m => m.trim()) || []

  return (
    <div style={{
      borderRadius: '20px',
      border: `2px solid ${cat.color}55`,
      background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(9,18,36,0.98))',
      padding: '20px',
      boxShadow: `0 24px 48px ${cat.color}18`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: cat.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            {cat.icon} {cat.label} · Est. {org.founded}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1.2 }}>{org.shortName}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{org.name}</div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(148,163,184,0.1)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem' }}>✕</button>
      </div>

      {/* India Role Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${indiaRole.color}18`, border: `1px solid ${indiaRole.color}44`, borderRadius: '999px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, color: indiaRole.color, marginBottom: '14px' }}>
        🇮🇳 India&apos;s Role: {indiaRole.icon} {indiaRole.label}
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '14px' }}>{org.description}</p>

      {/* UPSC Context */}
      {org.upscContext && (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>⚡ UPSC Exam Context</div>
          <div style={{ fontSize: '0.8rem', color: '#a5b4fc', lineHeight: 1.6 }}>{org.upscContext}</div>
        </div>
      )}

      {/* Members Grid */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
          Members ({members.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
          {members.map(m => (
            <span key={m} style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: '6px', padding: '3px 8px', fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* HQ */}
      {org.hqCity && org.hqCity !== 'Variable' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.78rem', color: '#94a3b8' }}>
          <span>🏛️</span>
          <span>HQ: <strong style={{ color: '#e2e8f0' }}>{org.hqCity}</strong></span>
        </div>
      )}

      {/* Quiz Button */}
      <button
        onClick={() => onQuiz(org)}
        disabled={quizLoading}
        style={{
          width: '100%', padding: '12px', borderRadius: '12px',
          background: quizLoading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white', border: 'none', cursor: quizLoading ? 'not-allowed' : 'pointer',
          fontWeight: 800, fontSize: '0.88rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
          transition: 'all 0.2s'
        }}
      >
        {quizLoading ? '⏳ Generating Quiz...' : '🎯 Quick Quiz: Test Yourself'}
      </button>
    </div>
  )
}

export default function OrgLens({ onOrgSelect, activeOrg }) {
  const [orgs, setOrgs] = useState([])
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizQuestion, setQuizQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/organizations')
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setOrgs(data) : [])
      .catch(console.error)
  }, [])

  const categories = ['ALL', ...Object.keys(CATEGORY_META).filter(c => orgs.some(o => o.category === c))]
  const filtered = activeCategory === 'ALL' ? orgs : orgs.filter(o => o.category === activeCategory)

  const handleSelect = (org) => {
    setSelectedOrg(org)
    setQuizQuestion(null)
    setUserAnswer(null)
    onOrgSelect?.(org) // notify parent to highlight members on map
  }

  const handleQuiz = async (org) => {
    setQuizLoading(true)
    setQuizQuestion(null)
    setUserAnswer(null)
    setError(null)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: org.id, scopeType: 'ORGANIZATION' })
      })
      const data = await res.json()
      if (data.question) {
        setQuizQuestion(data.question)
      } else {
        setError(data.error || 'Failed to generate quiz.')
      }
    } catch (e) {
      console.error('Quiz generation failed', e)
      setError('Connection error. Please try again.')
    } finally {
      setQuizLoading(false)
    }
  }

  const handleAnswer = (label) => {
    if (userAnswer) return
    setUserAnswer(label)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(c => {
          const meta = CATEGORY_META[c]
          return (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: '999px',
                border: activeCategory === c ? `1px solid ${meta?.color || '#6366f1'}44` : '1px solid rgba(148,163,184,0.14)',
                background: activeCategory === c ? `${meta?.color || '#6366f1'}18` : 'transparent',
                color: activeCategory === c ? (meta?.color || '#818cf8') : '#64748b',
                fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {meta?.icon || '🌐'} {c === 'ALL' ? 'All' : meta?.label || c}
            </button>
          )
        })}
      </div>

      {/* Org Detail or List */}
      {selectedOrg ? (
        <>
          <OrgDetailCard
            org={selectedOrg}
            onClose={() => { setSelectedOrg(null); onOrgSelect?.(null) }}
            onQuiz={handleQuiz}
            quizLoading={quizLoading}
          />

          {/* Error Message */}
          {error && (
            <div style={{
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              padding: '12px',
              color: '#fca5a5',
              fontSize: '0.8rem',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Inline Quiz */}
          {quizQuestion && (
            <div style={{
              borderRadius: '16px',
              border: '2px solid rgba(99,102,241,0.3)',
              background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(17,24,39,0.98))',
              padding: '18px',
              boxShadow: '0 20px 40px rgba(99,102,241,0.15)',
            }}>
              <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
                🎯 UPSC Prelims Style · {quizQuestion.difficulty}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.7, fontWeight: 600, marginBottom: '16px', whiteSpace: 'pre-line' }}>
                {quizQuestion.question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {quizQuestion.options.map(opt => {
                  const isCorrect = opt.label === quizQuestion.correctLabel
                  const isChosen = opt.label === userAnswer
                  let bg = 'rgba(148,163,184,0.08)'
                  let border = '1px solid rgba(148,163,184,0.16)'
                  let color = '#cbd5e1'

                  if (userAnswer) {
                    if (isCorrect) { bg = 'rgba(34,197,94,0.12)'; border = '1px solid rgba(34,197,94,0.4)'; color = '#86efac' }
                    else if (isChosen) { bg = 'rgba(239,68,68,0.12)'; border = '1px solid rgba(239,68,68,0.4)'; color = '#fca5a5' }
                  }

                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleAnswer(opt.label)}
                      disabled={!!userAnswer}
                      style={{
                        padding: '10px 14px', borderRadius: '10px', border, background: bg,
                        color, fontSize: '0.82rem', fontWeight: 600, textAlign: 'left',
                        cursor: userAnswer ? 'default' : 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '10px'
                      }}
                    >
                      <span style={{ fontWeight: 900, fontSize: '0.78rem', minWidth: '20px' }}>({opt.label})</span>
                      {opt.text}
                      {userAnswer && isCorrect && <span style={{ marginLeft: 'auto' }}>✅</span>}
                      {userAnswer && isChosen && !isCorrect && <span style={{ marginLeft: 'auto' }}>❌</span>}
                    </button>
                  )
                })}
              </div>

              {userAnswer && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '12px', fontSize: '0.79rem', color: '#a5b4fc', lineHeight: 1.5 }}>
                  <strong style={{ color: '#c7d2fe' }}>Explanation:</strong> {quizQuestion.explanation}
                </div>
              )}

              {userAnswer && (
                <button
                  onClick={() => handleQuiz(selectedOrg)}
                  style={{ marginTop: '10px', width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ↻ Next Question
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => { setSelectedOrg(null); onOrgSelect?.(null) }}
            style={{ padding: '10px', borderRadius: '10px', background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.12)', color: '#64748b', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
          >
            ← Back to Organizations
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '0.82rem' }}>No organizations in this category.</div>
          ) : (
            filtered.map(org => (
              <OrgCard
                key={org.id}
                org={org}
                isActive={activeOrg?.id === org.id}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
