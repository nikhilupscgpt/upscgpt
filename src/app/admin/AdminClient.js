"use client"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import PinAdminClient from "./pin/PinAdminClient"
import { 
  Users, Map as MapIcon, ShieldCheck, HelpCircle, LogOut,
  Globe, Zap, BrainCircuit, Newspaper, BookOpen, Trophy, Layers
} from "lucide-react"

export default function AdminClient({ session }) {
  const [activeTab, setActiveTab] = useState("content") // content, users, ai
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiPrompts, setAiPrompts] = useState([])
  const [savingPromptId, setSavingPromptId] = useState(null)
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', tier: 'FREE' })

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("User fetch fail", e)
    }
  }

  const fetchAiPrompts = async () => {
    try {
      const res = await fetch("/api/admin/ai-prompts")
      const data = await res.json()
      if (Array.isArray(data.prompts)) setAiPrompts(data.prompts)
    } catch (e) {
      console.error("AI prompt fetch fail", e)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers()
      fetchAiPrompts()
    }
  }, [session])

  // --- USER ACTIONS ---
  const handleUserCreate = async (e) => {
    e.preventDefault()
    const res = await fetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(userFormData),
      headers: { "Content-Type": "application/json" }
    })
    if (res.ok) {
      setUserFormData({ name: '', email: '', password: '', tier: 'FREE' })
      fetchUsers()
      setStatus("User Created Successfully.")
    }
  }

  const grantPro = async (user, months) => {
    const now = new Date()
    const expiryDate = new Date()
    expiryDate.setMonth(now.getMonth() + months)

    setLoading(true)
    setStatus(`Granting ${months}m PRO Access to ${user.email}...`)
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        tier: 'PRO',
        validUntil: expiryDate.toISOString()
      }),
      headers: { "Content-Type": "application/json" }
    })

    if (res.ok) {
      setStatus(`PRO Access Granted: Valid until ${expiryDate.toLocaleDateString()}`)
      fetchUsers()
    } else {
      setStatus("Error granting PRO access.")
    }
    setLoading(false)
  }

  const toggleUserTier = async (user) => {
    const newTier = user.tier === 'PRO' ? 'FREE' : 'PRO'
    const payload = { tier: newTier }
    if (newTier === 'FREE') payload.validUntil = null

    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    })
    fetchUsers()
  }

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
    fetchUsers()
  }

  // --- AI PROMPT ACTIONS ---
  const handlePromptChange = (id, value) => {
    setAiPrompts(current => current.map(prompt => (
      prompt.id === id ? { ...prompt, value } : prompt
    )))
  }

  const handlePromptSave = async (prompt) => {
    setSavingPromptId(prompt.id)
    setStatus(`Saving AI prompt: ${prompt.label}...`)
    try {
      const res = await fetch("/api/admin/ai-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prompt.id, value: prompt.value })
      })
      if (res.ok) {
        setStatus(`AI prompt updated: ${prompt.label}`)
        fetchAiPrompts()
      } else {
        setStatus(`Failed to update AI prompt: ${prompt.label}`)
      }
    } catch (e) {
      setStatus(`Failed to update AI prompt: ${prompt.label}`)
    }
    setSavingPromptId(null)
  }

  const handlePromptReset = async (prompt) => {
    if (!confirm(`Reset "${prompt.label}" to its default value? This will remove any custom override.`)) return
    setSavingPromptId(prompt.id)
    setStatus(`Resetting AI prompt: ${prompt.label}...`)
    try {
      const res = await fetch("/api/admin/ai-prompts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prompt.id })
      })
      if (res.ok) {
        setStatus(`AI prompt reset to default: ${prompt.label}`)
        fetchAiPrompts()
      } else {
        setStatus(`Failed to reset AI prompt: ${prompt.label}`)
      }
    } catch (e) {
      setStatus(`Failed to reset AI prompt: ${prompt.label}`)
    }
    setSavingPromptId(null)
  }

  const sidebarItem = (id, icon, label) => (
    <button onClick={() => setActiveTab(id)} style={{
      display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
      background: activeTab === id ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
      color: activeTab === id ? '#3b82f6' : 'var(--text-secondary)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '8px'
    }}>
      {icon} {label}
    </button>
  )

  const cardStyle = {
    background: 'var(--bg-secondary)',
    padding: '32px',
    borderRadius: '28px',
    border: '1px solid var(--card-border)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  }

  const btnPrimary = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s'
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '290px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--card-border)',
        padding: '36px 22px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: '10px 0 30px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        <div style={{ marginBottom: '36px', paddingLeft: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#3b82f6', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ShieldCheck size={24}/>
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>UPSCGPT</h1>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.1em' }}>CONTROL CENTER V2</span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ margin: '0 0 8px 12px', fontSize: '0.65rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.1em' }}>MAPPING & ATLAS</div>
          {sidebarItem("content", <MapIcon size={20}/>, "Geographic & PIN Studio")}

          <div style={{ margin: '16px 0 8px 12px', fontSize: '0.65rem', fontWeight: 900, color: '#3b82f6', letterSpacing: '0.1em' }}>SYLLABUS ARCHITECTURE</div>
          <Link href="/admin/architect" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem',
              background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', transition: 'all 0.2s', marginBottom: '12px'
            }}>
              <BrainCircuit size={20}/> Neural Architect
            </button>
          </Link>

          <div style={{ margin: '12px 0 8px 12px', fontSize: '0.65rem', fontWeight: 900, color: '#8b5cf6', letterSpacing: '0.1em' }}>CONTENT & PYQ HUBS</div>
          <Link href="/admin/prelims-ingestion" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
              background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.2s', marginBottom: '6px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#3b82f6'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <Trophy size={20}/> Prelims & Test Pack CMS
            </button>
          </Link>

          <Link href="/admin/pyq" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
              background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.2s', marginBottom: '6px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#38bdf8'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <HelpCircle size={20}/> PYQ Central Editor
            </button>
          </Link>

          <Link href="/admin/content-ingestion" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
              background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.2s', marginBottom: '6px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f59e0b'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <Newspaper size={20}/> News Ingestion Hub
            </button>
          </Link>

          <Link href="/admin/news-streaks" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
              background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.2s', marginBottom: '6px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#06b6d4'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <Layers size={20}/> News Streaks Board
            </button>
          </Link>

          <Link href="/admin/optional-content" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
              background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.2s', marginBottom: '12px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#10b981'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <BookOpen size={20}/> Optional Ingestion Hub
            </button>
          </Link>

          <div style={{ margin: '12px 0 8px 12px', fontSize: '0.65rem', fontWeight: 900, color: '#64748b', letterSpacing: '0.1em' }}>PLATFORM TOOLS</div>
          {sidebarItem("users", <Users size={20}/>, "User Management")}
          {sidebarItem("ai", <BrainCircuit size={20}/>, "AI Prompt Control")}
        </nav>

        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
            <Globe size={18}/> Go to Live App
          </Link>
          <button onClick={() => signOut()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            <LogOut size={18}/> Logout Session
          </button>
        </div>
      </aside>

      {/* Primary Workspace */}
      <main style={{ flex: 1, padding: '36px 44px', maxWidth: '1440px', overflowX: 'hidden' }}>
        {status && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 22px', background: '#3b82f6', color: 'white', borderRadius: '16px', marginBottom: '28px', fontWeight: 700, boxShadow: '0 10px 15px -3px rgb(59 130 246 / 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18}/> {status}
            </div>
            <button onClick={() => setStatus("")} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          </div>
        )}

        {activeTab === 'content' && (
          <PinAdminClient embedded={true} />
        )}

        {activeTab === 'users' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Manual Access Grant</h2>
              <form onSubmit={handleUserCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input required placeholder="Full Name" value={userFormData.name} onChange={e=>setUserFormData({...userFormData, name: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                <input required placeholder="Email Address" type="email" value={userFormData.email} onChange={e=>setUserFormData({...userFormData, email: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                <select value={userFormData.tier} onChange={e=>setUserFormData({...userFormData, tier: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                  <option value="FREE">Free User</option><option value="PRO">Pro Lifetime Access</option>
                </select>
                <button type="submit" style={{ padding: '18px', background: 'white', color: 'black', borderRadius: '16px', border:'none', cursor: 'pointer', fontWeight: 800 }}>Provision Now</button>
              </form>
            </section>
            
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Global User Base ({(users || []).length})</h2>
              {(users || []).map(user => (
                <div key={user.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', marginBottom: '16px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{user.email} · <span style={{ color: user.tier === 'PRO' ? '#3b82f6' : 'var(--text-secondary)', fontWeight: 800 }}>{user.tier}</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    {user.tier !== 'PRO' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[3, 6, 12].map(m => (
                          <button key={m} disabled={loading} onClick={() => grantPro(user, m)} style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                            +{m}M
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.7rem' }}>PRO ACTIVE</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>Expires: {user.validUntil ? new Date(user.validUntil).toLocaleDateString() : 'Lifetime'}</div>
                        </div>
                        <button onClick={() => toggleUserTier(user)} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', color: '#f87171', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Revoke</button>
                      </div>
                    )}
                    <button onClick={() => deleteUser(user.id)} style={{ padding: '6px 12px', color: '#ef4444', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', opacity: 0.6 }}>Delete Account</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <BrainCircuit size={28} color="#3b82f6" /> AI Prompt Control
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                Every prompt below is tied to a real AI interaction in the app. Edit the prompt, save it, and the corresponding feature will use the new prompt on the next request.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {aiPrompts.map((prompt) => (
                  <div key={prompt.id} style={{ border: '1px solid var(--card-border)', borderRadius: '20px', padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{prompt.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 800, marginTop: '4px' }}>{prompt.area}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{prompt.description}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>{prompt.location}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: prompt.hasOverride ? '#16a34a' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {prompt.hasOverride ? 'CUSTOM OVERRIDE' : 'DEFAULT PROMPT'}
                      </div>
                    </div>
                    <textarea
                      value={prompt.value}
                      onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
                      style={{ width: '100%', minHeight: '220px', padding: '18px', borderRadius: '16px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '14px' }}
                    />
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handlePromptSave(prompt)}
                        disabled={savingPromptId === prompt.id}
                        style={{ ...btnPrimary, padding: '14px 20px', minWidth: '160px' }}
                      >
                        {savingPromptId === prompt.id ? 'Saving...' : 'Save Prompt'}
                      </button>
                      {prompt.hasOverride && (
                        <button
                          onClick={() => handlePromptReset(prompt)}
                          disabled={savingPromptId === prompt.id}
                          style={{ padding: '14px 20px', minWidth: '160px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s' }}
                        >
                          ↩ Reset to Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
