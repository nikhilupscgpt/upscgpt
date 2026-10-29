"use client"
import { useState, useEffect, useCallback } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import PinAdminClient from "./pin/PinAdminClient"
import CommsAdminClient from "./comms/CommsAdminClient"
import { 
  Users, Map as MapIcon, ShieldCheck, HelpCircle, LogOut,
  Globe, Zap, BrainCircuit, Newspaper, BookOpen, Trophy, Layers, Video, Radio, Mail
} from "lucide-react"

export default function AdminClient({ session }) {
  const [activeTab, setActiveTab] = useState("content") // content, users, comms, ai
  const [prefillCommsEmail, setPrefillCommsEmail] = useState("")
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiPrompts, setAiPrompts] = useState([])
  const [savingPromptId, setSavingPromptId] = useState(null)
  const [userFormData, setUserFormData] = useState({ name: '', username: '', email: '', password: '', tier: 'FREE', role: 'FACULTY' })
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')
  const [editingUserId, setEditingUserId] = useState(null)
  const [editUserForm, setEditUserForm] = useState({ username: '', password: '', role: 'USER' })

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("User fetch fail", e)
    }
  }, [])

  const fetchAiPrompts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-prompts")
      const data = await res.json()
      if (Array.isArray(data.prompts)) setAiPrompts(data.prompts)
    } catch (e) {
      console.error("AI prompt fetch fail", e)
    }
  }, [])

  useEffect(() => {
    let ignore = false;
    async function initAdminData() {
      if (session?.user?.role !== 'ADMIN') return;
      try {
        const [uRes, pRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/ai-prompts"),
        ]);
        const [uData, pData] = await Promise.all([uRes.json(), pRes.json()]);
        if (!ignore) {
          if (Array.isArray(uData)) setUsers(uData);
          if (Array.isArray(pData?.prompts)) setAiPrompts(pData.prompts);
        }
      } catch (e) {
        console.error("Admin init data fail", e);
      }
    }
    initAdminData();
    return () => { ignore = true; };
  }, [session])

  // --- USER ACTIONS ---
  const handleUserCreate = async (e) => {
    e.preventDefault()
    if ((userFormData.role === 'FACULTY' || userFormData.role === 'ADMIN') && (!userFormData.username.trim() || !userFormData.password.trim())) {
      setStatus("⚠️ Please provide both a Username (min 3 chars) and Password (min 6 chars) for Faculty/Admin login.")
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...userFormData,
        tier: (userFormData.role === 'FACULTY' || userFormData.role === 'ADMIN') ? 'PRO' : userFormData.tier
      }
      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const createdRole = userFormData.role
        const createdUsername = userFormData.username
        setUserFormData({ name: '', username: '', email: '', password: '', tier: 'FREE', role: 'FACULTY' })
        fetchUsers()
        setStatus(
          createdRole === 'FACULTY'
            ? `✅ Faculty Account "${createdUsername}" provisioned! Login at /admin-login`
            : `✅ User "${data.username || data.email || 'Account'}" created successfully.`
        )
      } else {
        setStatus(`❌ Failed to create user: ${data.error || 'Validation error'}`)
      }
    } catch (err) {
      setStatus(`❌ Network error while creating user.`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUserCredentials = async (userId) => {
    setLoading(true)
    try {
      const payload = {
        role: editUserForm.role,
        username: editUserForm.username?.trim() || undefined,
        tier: (editUserForm.role === 'FACULTY' || editUserForm.role === 'ADMIN') ? 'PRO' : undefined,
      }
      if (editUserForm.password && editUserForm.password.trim().length > 0) {
        payload.password = editUserForm.password.trim()
      }
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus(`✅ Updated credentials & role (${data.role}) for ${data.name || data.username}`)
        setEditingUserId(null)
        setEditUserForm({ username: '', password: '', role: 'USER' })
        fetchUsers()
      } else {
        setStatus(`❌ Update failed: ${data.error || 'Could not update credentials'}`)
      }
    } catch (e) {
      setStatus("❌ Network error updating user credentials")
    } finally {
      setLoading(false)
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
          <div style={{ margin: '0 0 8px 12px', fontSize: '0.65rem', fontWeight: 900, color: '#10b981', letterSpacing: '0.1em' }}>BROADCAST &amp; RECORDING</div>
          <Link href="/admin/studio" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: '1.5px solid rgba(16, 185, 129, 0.4)', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.25) 100%)', color: '#34d399', transition: 'all 0.2s', marginBottom: '10px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 78, 59, 0.4) 100%)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.25) 100%)'; }}>
              <Video size={20}/> Lecture Studio
            </button>
          </Link>

          <Link href="/admin/recording-studio" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: '1.5px solid rgba(244, 63, 94, 0.45)', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem',
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(136, 19, 55, 0.28) 100%)', color: '#fb7185', transition: 'all 0.2s', marginBottom: '14px',
              boxShadow: '0 4px 16px rgba(244, 63, 94, 0.2)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(244, 63, 94, 0.28) 0%, rgba(136, 19, 55, 0.42) 100%)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(136, 19, 55, 0.28) 100%)'; }}>
              <Radio size={20}/> Recording Studio
            </button>
          </Link>

          <div style={{ margin: '8px 0 8px 12px', fontSize: '0.65rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.1em' }}>MAPPING & ATLAS</div>
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
          <Link href="/admin/monetisation" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
              background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', transition: 'all 0.2s', marginBottom: '6px'
            }}>
              <Zap size={20}/> Monetisation & Pricing
            </button>
          </Link>
          {sidebarItem("users", <Users size={20}/>, "User Management")}
          {sidebarItem("comms", <Mail size={20}/>, "User Comms & Mailing")}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Provision Faculty / User Account</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Faculty / Presenter accounts log in via <code>/admin-login</code> using their Username &amp; Password and have dedicated access only to Lecture &amp; Recording Studios.
              </p>
              <form onSubmit={handleUserCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.06em' }}>ACCOUNT ROLE</label>
                  <select
                    value={userFormData.role}
                    onChange={e => {
                      const newRole = e.target.value;
                      setUserFormData({
                        ...userFormData,
                        role: newRole,
                        tier: (newRole === 'FACULTY' || newRole === 'ADMIN') ? 'PRO' : userFormData.tier
                      });
                    }}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(168, 85, 247, 0.4)', background: 'rgba(15, 23, 42, 0.9)', color: 'white', fontWeight: 700 }}
                  >
                    <option value="FACULTY">🎓 Faculty / Presenter (Lecture &amp; Recording Studio Only)</option>
                    <option value="USER">👤 Standard Student User</option>
                    <option value="ADMIN">🛡️ Full Administrator</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.06em' }}>FULL NAME *</label>
                  <input required placeholder="e.g. Dr. Ramesh Sharma" value={userFormData.name} onChange={e=>setUserFormData({...userFormData, name: e.target.value})} style={{ width: '100%', padding:'14px 16px', borderRadius:'14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#c084fc', marginBottom: '6px', letterSpacing: '0.06em' }}>
                    LOGIN USERNAME {(userFormData.role === 'FACULTY' || userFormData.role === 'ADMIN') ? '* (MIN 3 CHARS)' : '(OPTIONAL)'}
                  </label>
                  <input
                    required={userFormData.role === 'FACULTY' || userFormData.role === 'ADMIN'}
                    minLength={3}
                    placeholder="e.g. faculty_geo"
                    value={userFormData.username}
                    onChange={e=>setUserFormData({...userFormData, username: e.target.value})}
                    style={{ width: '100%', padding:'14px 16px', borderRadius:'14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#c084fc', marginBottom: '6px', letterSpacing: '0.06em' }}>
                    LOGIN PASSWORD / PASSKEY {(userFormData.role === 'FACULTY' || userFormData.role === 'ADMIN') ? '* (MIN 6 CHARS)' : '(OPTIONAL)'}
                  </label>
                  <input
                    required={userFormData.role === 'FACULTY' || userFormData.role === 'ADMIN'}
                    minLength={6}
                    placeholder="Enter at least 6 characters"
                    type="text"
                    value={userFormData.password}
                    onChange={e=>setUserFormData({...userFormData, password: e.target.value})}
                    style={{ width: '100%', padding:'14px 16px', borderRadius:'14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.06em' }}>EMAIL ADDRESS (OPTIONAL FOR FACULTY)</label>
                  <input placeholder="faculty@example.com (optional)" type="email" value={userFormData.email} onChange={e=>setUserFormData({...userFormData, email: e.target.value})} style={{ width: '100%', padding:'14px 16px', borderRadius:'14px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>

                {userFormData.role === 'USER' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.06em' }}>SUBSCRIPTION TIER</label>
                    <select value={userFormData.tier} onChange={e=>setUserFormData({...userFormData, tier: e.target.value})} style={{ width: '100%', padding:'14px 16px', borderRadius:'14px', border: '1px solid var(--card-border)', background: 'rgba(15, 23, 42, 0.9)', color: 'white' }}>
                      <option value="FREE">Free Tier</option>
                      <option value="PRO">Pro Lifetime Access</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '16px',
                    background: userFormData.role === 'FACULTY'
                      ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
                      : 'white',
                    color: userFormData.role === 'FACULTY' ? 'white' : 'black',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    marginTop: '4px',
                    boxShadow: userFormData.role === 'FACULTY' ? '0 8px 24px rgba(168, 85, 247, 0.35)' : 'none'
                  }}
                >
                  {loading ? 'Provisioning...' : userFormData.role === 'FACULTY' ? '🎓 Create / Update Faculty Account' : 'Provision User Account'}
                </button>
              </form>
            </section>
            
            <section style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Global User Base ({(users || []).length})</h2>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'ALL', label: `All (${(users || []).length})` },
                    { id: 'FACULTY', label: `🎓 Faculty (${(users || []).filter(u => u.role === 'FACULTY').length})` },
                    { id: 'ADMIN', label: `🛡️ Admin (${(users || []).filter(u => u.role === 'ADMIN').length})` },
                    { id: 'USER', label: `👤 Students (${(users || []).filter(u => u.role === 'USER').length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setUserRoleFilter(tab.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: userRoleFilter === tab.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                        background: userRoleFilter === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: userRoleFilter === tab.id ? '#60a5fa' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {(users || [])
                .filter(u => userRoleFilter === 'ALL' ? true : u.role === userRoleFilter)
                .map(user => (
                <div key={user.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', marginBottom: '16px', border: user.role === 'FACULTY' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {user.name || user.username || 'Unnamed User'}
                        </span>
                        {user.username && (
                          <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', fontFamily: 'monospace' }}>
                            @{user.username}
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontWeight: 900,
                          background: user.role === 'FACULTY' ? 'rgba(168, 85, 247, 0.2)' : user.role === 'ADMIN' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(148, 163, 184, 0.12)',
                          color: user.role === 'FACULTY' ? '#c084fc' : user.role === 'ADMIN' ? '#fb7185' : '#94a3b8',
                          border: user.role === 'FACULTY' ? '1px solid rgba(168, 85, 247, 0.4)' : 'none'
                        }}>
                          {user.role === 'FACULTY' ? '🎓 FACULTY / PRESENTER' : user.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        {user.email || 'No email set (Username Login)'} · <span style={{ color: user.tier === 'PRO' ? '#3b82f6' : 'var(--text-secondary)', fontWeight: 800 }}>{user.tier}</span>
                      </div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => {
                            if (editingUserId === user.id) {
                              setEditingUserId(null);
                            } else {
                              setEditingUserId(user.id);
                              setEditUserForm({
                                username: user.username || '',
                                password: '',
                                role: user.role || 'USER'
                              });
                            }
                          }}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: '#c084fc',
                            border: '1px solid rgba(168, 85, 247, 0.35)',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          🔑 {editingUserId === user.id ? 'Close' : 'Role / Password'}
                        </button>
                        {user.email && (
                          <button
                            onClick={() => {
                              setPrefillCommsEmail(user.email);
                              setActiveTab('comms');
                            }}
                            style={{
                              padding: '6px 10px',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '10px',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title={`Send direct email to ${user.email}`}
                          >
                            <Mail size={12} /> Email
                          </button>
                        )}
                        <button onClick={() => deleteUser(user.id)} style={{ padding: '6px 12px', color: '#ef4444', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', opacity: 0.6 }}>Delete</button>
                      </div>
                    </div>
                  </div>

                  {editingUserId === user.id && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                      <select
                        value={editUserForm.role}
                        onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}
                        style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        <option value="USER">Role: USER</option>
                        <option value="FACULTY">Role: FACULTY (Studio)</option>
                        <option value="ADMIN">Role: ADMIN</option>
                      </select>
                      <input
                        placeholder="Username (min 3 chars)"
                        value={editUserForm.username}
                        onChange={e => setEditUserForm({ ...editUserForm, username: e.target.value })}
                        style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.8rem' }}
                      />
                      <input
                        placeholder="New Password (leave blank to keep)"
                        value={editUserForm.password}
                        onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })}
                        style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.8rem', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleSaveUserCredentials(user.id)}
                        style={{ padding: '10px 16px', borderRadius: '10px', background: '#a855f7', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'comms' && (
          <CommsAdminClient
            prefillEmail={prefillCommsEmail}
            onClearPrefill={() => setPrefillCommsEmail('')}
          />
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
