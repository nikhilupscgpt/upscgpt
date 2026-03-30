"use client"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import Papa from "papaparse"
import { 
  Users, Map as MapIcon, RefreshCw, CreditCard, MessageSquare, 
  Send, ShieldCheck, TrendingUp, HelpCircle, LogOut, ChevronRight,
  Globe, Zap, ZapOff, Trash2, Edit3, PlusCircle, CheckCircle
} from "lucide-react"

export default function AdminClient({ session }) {
  const [activeTab, setActiveTab] = useState("content") // content, users, sync, payments, comms
  const [entries, setEntries] = useState([])
  const [editingId, setEditingId] = useState(null)
  
  // Data State
  const [users, setUsers] = useState([])
  const [paymentStats, setPaymentStats] = useState(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  // Forms
  const [formData, setFormData] = useState({ lat: '', lon: '', name: '', category: 'strait', tags: '', year: '', prelims: '', mains: '', india: '' })
  const [sheetUrl, setSheetUrl] = useState("")
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', tier: 'FREE' })
  
  // Comms State
  const [commsForm, setCommsForm] = useState({ channel: 'EMAIL', type: 'MARKETING', recipients: 'PRO', content: '', templateName: '', params: [] })


  const fetchEntries = async () => {
    const res = await fetch("/api/entries")
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
  }

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
  }

  const fetchPaymentStats = async () => {
    try {
      const res = await fetch("/api/admin/payments/stats")
      const data = await res.json()
      if (data.success) setPaymentStats(data)
    } catch (e) { console.error("Stats fail", e) }
  }

  useEffect(() => {
    fetchEntries()
    if (session?.user?.role === 'ADMIN') {
      fetchUsers()
      fetchPaymentStats()
    }
  }, [session])

  // --- MAPPING ACTIONS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setLoading(true); setStatus("Saving node...");
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/entries/${editingId}` : "/api/entries";
    const res = await fetch(url, { method, body: JSON.stringify(formData), headers: { "Content-Type": "application/json" } });
    if (res.ok) {
      setFormData({ lat: '', lon: '', name: '', category: 'strait', tags: '', year: '', prelims: '', mains: '', india: '' });
      setEditingId(null); setStatus("Saved Successfully!"); fetchEntries();
    } else { setStatus("Error occurred."); }
    setLoading(false);
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({ ...entry, lat: entry.lat || '', lon: entry.lon || '', year: entry.year || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleSheetSync = () => {
    if (!sheetUrl) return;
    setLoading(true); setStatus("AI Geocoding & Syncing Google Sheet...");
    Papa.parse(sheetUrl, {
      download: true, header: true, skipEmptyLines: true,
      complete: async (results) => {
        const res = await fetch("/api/entries/bulk", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: results.data })
        })
        if (res.ok) { setStatus("Google Sheets Sync Complete!"); fetchEntries(); }
        setLoading(false);
      }
    });
  }

  // --- USER ACTIONS ---
  const handleUserCreate = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", { method: "POST", body: JSON.stringify(userFormData), headers: { "Content-Type": "application/json" } });
    if (res.ok) { setUserFormData({ name: '', email: '', password: '', tier: 'FREE' }); fetchUsers(); setStatus("User Created Successfully."); }
  }

  const grantPro = async (user, months) => {
    const now = new Date();
    // If user has an existing validUntil in the future, we could extend, but default is reset from today
    const expiryDate = new Date();
    expiryDate.setMonth(now.getMonth() + months);
    
    setLoading(true); setStatus(`Granting ${months}m PRO Access to ${user.email}...`);
    const res = await fetch(`/api/admin/users/${user.id}`, { 
      method: "PATCH", 
      body: JSON.stringify({ 
        tier: 'PRO', 
        validUntil: expiryDate.toISOString() 
      }), 
      headers: { "Content-Type": "application/json" } 
    });
    
    if (res.ok) {
      setStatus(`PRO Access Granted: Valid until ${expiryDate.toLocaleDateString()}`);
      fetchUsers();
    } else {
      setStatus("Error granting PRO access.");
    }
    setLoading(false);
  }

  const toggleUserTier = async (user) => {
    const newTier = user.tier === 'PRO' ? 'FREE' : 'PRO';
    const payload = { tier: newTier };
    if (newTier === 'FREE') payload.validUntil = null;
    
    await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
    fetchUsers();
  }

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  }

  // --- SYNC ACTIONS ---
  const handleManualScrape = async () => {
    setLoading(true); setStatus("Launching AI News Scraper... checking Economy & IR feeds.");
    try {
      const res = await fetch("/api/admin/news-sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStatus(`Sync Complete! Fetched: ${data.stats.totalFetched}, Enriched: ${data.stats.totalEnriched}`);
        fetchEntries();
      }
    } catch (e) { setStatus("Sync Failed."); }
    setLoading(false);
  }

  // --- COMMS ACTIONS ---
  const handleSendComms = async () => {
    if (!commsForm.content && !commsForm.templateName) return;
    setLoading(true); setStatus("Processing Global Communication Queue...");
    try {
      const res = await fetch("/api/admin/comms/send", { method: "POST", body: JSON.stringify(commsForm), headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success) setStatus(`Communication Sent to ${data.count} users!`);
    } catch (e) { setStatus("Communication Failed."); }
    setLoading(false);
  }

  // UI Tokens
  const sidebarItem = (id, icon, label) => (
    <button onClick={() => setActiveTab(id)} style={{
      display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
      background: activeTab === id ? '#eff6ff' : 'transparent', color: activeTab === id ? '#3b82f6' : '#64748b', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '8px'
    }}>
      {icon} {label}
    </button>
  )

  const cardStyle = { background: 'white', padding: '32px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }
  const btnPrimary = { background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s' }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: '300px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '40px 24px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ marginBottom: '48px', paddingLeft: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#3b82f6', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ShieldCheck size={24}/>
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>UPSCGPT</h1>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.1em' }}>CONTROL CENTER V2</span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {sidebarItem("content", <MapIcon size={20}/>, "Geographic Content")}
          {sidebarItem("users", <Users size={20}/>, "User Management")}
          {sidebarItem("sync", <RefreshCw size={20} className={loading && activeTab==='sync'?'animate-spin':''}/>, "News Sync Engine")}
          {sidebarItem("payments", <CreditCard size={20}/>, "Payment Stats")}
          {sidebarItem("comms", <MessageSquare size={20}/>, "Communication")}
        </nav>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px' }}>
            <Globe size={18}/> Go to Live App
          </Link>
          <button onClick={() => signOut()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#ef4444', background: '#fef2f2', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            <LogOut size={18}/> Logout Session
          </button>
        </div>
      </aside>

      {/* Primary Workspace */}
      <main style={{ flex: 1, padding: '56px', maxWidth: '1200px' }}>
        {status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', background: '#3b82f6', color: 'white', borderRadius: '20px', marginBottom: '40px', fontWeight: 700, boxShadow: '0 10px 15px -3px rgb(59 130 246 / 0.3)' }}>
            <Zap size={20}/> {status}
          </div>
        )}

        {activeTab === 'content' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <section style={cardStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', display:'flex', alignItems:'center', gap:'12px' }}><PlusCircle size={22} color="#3b82f6"/> {editingId ? "Edit Strategic Node" : "Individual Entry"}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input placeholder="Location Name (e.g., Strait of Hormuz)" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <input placeholder="Lat" type="number" step="any" value={formData.lat} onChange={e=>setFormData({...formData, lat: e.target.value})} style={{ flex:1, padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }} />
                    <input placeholder="Lon" type="number" step="any" value={formData.lon} onChange={e=>setFormData({...formData, lon: e.target.value})} style={{ flex:1, padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0', background: 'white' }}>
                    <option value="strait">Choke Point / Strait</option><option value="conflict">Conflict Zone</option>
                    <option value="nature">Environmental / Nature</option><option value="island">Island Strategy</option><option value="mineral">Strategic Mineral</option>
                  </select>
                  <textarea placeholder="Prelims Points..." value={formData.prelims} onChange={e=>setFormData({...formData, prelims: e.target.value})} style={{ minHeight:'100px', padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }} />
                  <textarea placeholder="Mains Dimension..." value={formData.mains} onChange={e=>setFormData({...formData, mains: e.target.value})} style={{ minHeight:'100px', padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }} />
                  <textarea placeholder="India's Stake..." value={formData.india} onChange={e=>setFormData({...formData, india: e.target.value})} style={{ minHeight:'100px', padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }} />
                  <button type="submit" disabled={loading} style={{ padding: '18px', background: '#3b82f6', color: 'white', borderRadius: '16px', border:'none', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem' }}>
                    {editingId ? "Apply Changes" : "Commit to Database"}
                  </button>
                </form>
              </section>

              <section style={cardStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Bulk Operations</h2>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '12px' }}>GOOGLE SHEETS SYNC (CSV URL)</label>
                  <input placeholder="Paste CSV URL here..." value={sheetUrl} onChange={e=>setSheetUrl(e.target.value)} style={{ width: '100%', padding:'14px', borderRadius:'12px', border: '1px solid #cbd5e1', marginBottom:'16px' }} />
                  <button onClick={handleSheetSync} disabled={loading} style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Sync Now</button>
                </div>
              </section>
            </div>

            <section style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                Registry {(entries || []).length} items
              </h2>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '1100px' }}>
                {(entries || []).map(e => (
                  <div key={e.id} style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', marginBottom: '16px', border: '1px solid transparent', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                       onMouseEnter={e_target => e_target.currentTarget.style.borderColor = '#3b82f6'}
                       onMouseLeave={e_target => e_target.currentTarget.style.borderColor = 'transparent'}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>{e.name}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginTop: '4px', textTransform: 'uppercase' }}>{e.category}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(e)} style={{ background: 'white', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b82f6' }}><Edit3 size={18}/></button>
                      <button onClick={() => fetch(`/api/entries/${e.id}`, { method: 'DELETE' }).then(fetchEntries)} style={{ background: 'white', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Manual Access Grant</h2>
              <form onSubmit={handleUserCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input required placeholder="Full Name" value={userFormData.name} onChange={e=>setUserFormData({...userFormData, name: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }} />
                <input required placeholder="Email Address" type="email" value={userFormData.email} onChange={e=>setUserFormData({...userFormData, email: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }} />
                <select value={userFormData.tier} onChange={e=>setUserFormData({...userFormData, tier: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }}>
                  <option value="FREE">Free User</option><option value="PRO">Pro Lifetime Access</option>
                </select>
                <button type="submit" style={{ padding: '18px', background: '#0f172a', color: 'white', borderRadius: '16px', border:'none', cursor: 'pointer', fontWeight: 800 }}>Provision Now</button>
              </form>
            </section>
            
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Global User Base</h2>
              {(users || []).map(user => (
                <div key={user.id} style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{user.email} · <span style={{ color: user.tier === 'PRO' ? '#3b82f6' : '#64748b', fontWeight: 800 }}>{user.tier}</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    {user.tier !== 'PRO' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[3, 6, 12].map(m => (
                          <button key={m} onClick={() => grantPro(user, m)} style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                            +{m}M
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.7rem' }}>PRO ACTIVE</div>
                          <div style={{ color: '#64748b', fontSize: '0.65rem' }}>Expires: {user.validUntil ? new Date(user.validUntil).toLocaleDateString() : 'Lifetime'}</div>
                        </div>
                        <button onClick={() => toggleUserTier(user)} style={{ padding: '8px 12px', background: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Revoke</button>
                      </div>
                    )}
                    <button onClick={() => deleteUser(user.id)} style={{ padding: '6px 12px', color: '#ef4444', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', opacity: 0.6 }}>Delete Account</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'sync' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ ...cardStyle, textAlign: 'center', padding: '80px 48px' }}>
              <div style={{ background: '#eff6ff', width: '100px', height: '100px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', color: '#3b82f6' }}>
                <RefreshCw size={48} className={loading ? "animate-spin" : ""}/>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>Global Strategic Refresh</h2>
              <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '48px', lineHeight: 1.6 }}>Launch the UPSCGPT engine to scan GNews for today&apos;s geopolitical and economic triggers. Our AI will filter for UPSC relevance and rank the top strategic developments for the map.</p>
              <button disabled={loading} onClick={handleManualScrape} style={{ ...btnPrimary, width: '100%', fontSize: '1.25rem', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                {loading ? "AI Analyst is Ranking News..." : "Start World-Wide Sync Now"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div style={cardStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em' }}><TrendingUp size={16}/> TOTAL USERS</div><div style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '12px', color: '#0f172a' }}>{paymentStats?.stats.totalUsers || 0}</div></div>
            <div style={cardStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em' }}><ShieldCheck size={16}/> PRO AUDIENCE</div><div style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '12px', color: '#3b82f6' }}>{paymentStats?.stats.proUsers || 0}</div></div>
            <div style={cardStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em' }}><Zap size={16}/> CONVERSION</div><div style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '12px', color: '#10b981' }}>{paymentStats?.stats.proRate || 0}%</div></div>
            
            <section style={{ ...cardStyle, gridColumn: 'span 3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Razorpay Audit Log (Last 10)</h3>
                <Link href="https://dashboard.razorpay.com" target="_blank" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', textDecoration: 'none', borderBottom: '1.5px solid #3b82f6' }}>Full Razorpay Dashboard ↗</Link>
              </div>
              {(!paymentStats?.recentPayments || paymentStats?.recentPayments.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '48px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                  <CreditCard size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }}/>
                  <p style={{ color: '#94a3b8', fontWeight: 600 }}>Waiting for first Razorpay transaction...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {paymentStats.recentPayments.map(p => (
                    <div key={p.id} style={{ padding: '16px 24px', background: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800 }}>ID: {p.razorpayId.slice(0, 12)}...</div>
                      <div style={{ fontWeight: 900, color: '#10b981' }}>₹{p.amount / 100}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'comms' && (
          <div style={{ maxWidth: '900px' }}>
            <section style={cardStyle}>
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <MessageSquare size={32} color="#3b82f6"/> Global Communication Suite
                </h2>
                <p style={{ color: '#64748b', marginTop: '8px', fontWeight: 500 }}>Broadcast updates, newsletters, or custom alerts across all community channels.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '10px' }}>DELIVERY CHANNEL</label>
                  <select value={commsForm.channel} onChange={e=>setCommsForm({...commsForm, channel: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', transition: 'border-color 0.2s' }}>
                    <option value="EMAIL">Email (Next-Day Broadcast)</option>
                    <option value="WHATSAPP">WhatsApp (Real-time Template)</option>
                    <option value="SMS">SMS (Critical OTP/Alert)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '10px' }}>RECIPIENT FILTER</label>
                  <select value={commsForm.recipients} onChange={e=>setCommsForm({...commsForm, recipients: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc' }}>
                    <option value="PRO">Active Pro Subscribers Only</option>
                    <option value="FREE">Free Trial Users Only</option>
                    <option value="ALL">Total Community Presence</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '10px' }}>BROADCAST CONTENT (MARKDOWN SUPPORTED)</label>
                <textarea placeholder="Write your community update here..." value={commsForm.content} onChange={e=>setCommsForm({...commsForm, content: e.target.value})} style={{ width: '100%', minHeight: '300px', padding: '24px', borderRadius: '20px', border: '2px solid #f1f5f9', fontSize: '1.05rem', background: '#f8fafc', whiteSpace: 'pre-wrap' }} />
              </div>

              <button disabled={loading} onClick={handleSendComms} style={{ ...btnPrimary, width: '100%', fontSize: '1.2rem', padding: '22px' }}>
                <Send size={24}/> Dispatch Global Update Now
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
