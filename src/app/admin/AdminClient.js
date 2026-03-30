"use client"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import Papa from "papaparse"

export default function AdminClient({ session }) {
  const [activeTab, setActiveTab] = useState('content') // content, users
  const [entries, setEntries] = useState([])
  const [users, setUsers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ lat: '', lon: '', name: '', category: 'strait', tags: '', year: '', prelims: '', mains: '', india: '' })
  const [userFormData, setUserFormData] = useState({ email: '', name: '', tier: 'FREE', password: '' })
  const [sheetUrl, setSheetUrl] = useState("")
  const [status, setStatus] = useState("")

  const fetchEntries = () => fetch('/api/entries').then(r => r.json()).then(setEntries)
  const fetchUsers = () => fetch('/api/admin/users').then(r => r.json()).then(setUsers)
  
  useEffect(() => { 
    fetchEntries()
    if (session?.user?.role === 'ADMIN') fetchUsers()
  }, [session])

  // Geocoding
  const geocodeLocation = async (name) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`)
      const data = await res.json()
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
    } catch (e) { console.error("Geocoding failed", e) }
    return null
  }

  // Handle Entries
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("Saving...")
    let { lat, lon, name } = formData
    if (!lat || !lon) {
      const geo = await geocodeLocation(name)
      if (geo) { lat = geo.lat; lon = geo.lon; }
    }
    const payload = { ...formData, lat, lon }
    const url = editingId ? `/api/entries/${editingId}` : '/api/entries'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if(res.ok) {
      setFormData({ lat: '', lon: '', name: '', category: 'strait', tags: '', year: '', prelims: '', mains: '', india: '' })
      setEditingId(null)
      setStatus("Saved successfully!")
      fetchEntries()
    } else setStatus("Error saving.")
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id)
    setFormData({ ...entry })
    setActiveTab('content')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Manage Users
  const handleUserCreate = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userFormData)
    })
    if(res.ok) {
      setUserFormData({ email: '', name: '', tier: 'FREE', password: '' })
      fetchUsers()
      setStatus("User created.")
    } else setStatus("Error creating user.")
  }

  const toggleUserTier = async (user) => {
    const nextTier = user.tier === 'PRO' ? 'FREE' : 'PRO'
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH', headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: nextTier })
    })
    if (res.ok) fetchUsers()
  }

  const deleteUser = async (id) => {
    if(!confirm("Delete this user?")) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) fetchUsers()
  }

  // Google Sheets Sync
  const handleSheetSync = () => {
    if (!sheetUrl) return;
    setStatus("Downloading and parsing Google Sheet CSV...");
    
    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        if (!rows || rows.length === 0) {
          setStatus("Error: Google Sheet is empty or couldn't be read.");
          return;
        }

        const processed = []
        for (let i = 0; i < rows.length; i++) {
          const row = Object.fromEntries(Object.entries(rows[i]).map(([k, v]) => [(k || "").replace(/^\uFEFF/,'').trim().toLowerCase(), v]));
          let { lat, lon, name } = row;
          
          if ((!lat || !lon) && name) {
            setStatus(`Row ${i + 1}/${rows.length}: Geocoding ${name}...`)
            const geo = await geocodeLocation(name)
            if (geo) { lat = geo.lat; lon = geo.lon; }
            await new Promise(r => setTimeout(r, 1500))
          }
          processed.push({ ...row, lat, lon })
        }

        setStatus(`Saving ${processed.length} entries via Bulk API...`)
        const res = await fetch("/api/entries/bulk", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: processed })
        })

        if (res.ok) {
          setStatus(`Successfully synced ${processed.length} map entries from Google Sheets!`)
          setSheetUrl("")
          fetchEntries()
        } else setStatus("Sync failed.")
      },
      error: (err) => setStatus("Failed to download CSV: " + err.message)
    });
  }

  const handleBulkUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data; const processed = [];
        for (let i = 0; i < rows.length; i++) {
          const row = Object.fromEntries(Object.entries(rows[i]).map(([k, v]) => [(k || "").replace(/^\uFEFF/,'').trim().toLowerCase(), v]));
          let { lat, lon, name } = row;
          if ((!lat || !lon) && name) {
            setStatus(`Geocoding ${name}...`); const geo = await geocodeLocation(name);
            if (geo) { lat = geo.lat; lon = geo.lon; }
            await new Promise(r => setTimeout(r, 1000))
          }
          processed.push({ ...row, lat, lon })
        }
        await fetch("/api/entries/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries: processed }) })
        fetchEntries(); setStatus("Bulk imported!")
      }
    });
  }

  const handleBulkDelete = async () => {
    if(confirm("Wipe ALL map data?")) {
      await fetch('/api/entries/bulk', { method: "DELETE" }); fetchEntries();
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center', 
          background: 'white', padding: '24px 32px', 
          borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>UPSCGPT Command Center</h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
              <button 
                onClick={() => setActiveTab('content')}
                style={{ background: activeTab === 'content' ? '#3b82f6' : 'transparent', color: activeTab === 'content' ? 'white' : '#64748b', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >Mapping Data</button>
              <button 
                onClick={() => setActiveTab('users')}
                style={{ background: activeTab === 'users' ? '#3b82f6' : 'transparent', color: activeTab === 'users' ? 'white' : '#64748b', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >User Management</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/" style={{ padding: '10px 20px', background: 'white', border:'1px solid #cbd5e1', borderRadius:'12px', color:'#0f172a', fontWeight:600, fontSize:'0.9rem', textDecoration: 'none' }}>← Home</Link>
            <button onClick={() => signOut()} style={{ padding: '10px 20px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight:700 }}>Logout</button>
          </div>
        </header>

        {status && <div style={{ padding: '12px 24px', background: '#eff6ff', color: '#1e40af', borderRadius: '12px', marginBottom: '24px', fontWeight: 600 }}>{status}</div>}

        {activeTab === 'content' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
            {/* Editor Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 800 }}>{editingId ? "Edit Entry" : "Add Individual Entry"}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input placeholder="Location Name" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} style={{ padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input placeholder="Lat" type="number" step="any" value={formData.lat} onChange={e=>setFormData({...formData, lat: e.target.value})} style={{ flex:1, padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                    <input placeholder="Lon" type="number" step="any" value={formData.lon} onChange={e=>setFormData({...formData, lon: e.target.value})} style={{ flex:1, padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} style={{ padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }}>
                    <option value="strait">Strait</option><option value="conflict">Conflict</option>
                    <option value="nature">Nature</option><option value="island">Island</option><option value="mineral">Strategic Mineral</option>
                  </select>
                  <textarea placeholder="Prelims Fact" value={formData.prelims} onChange={e=>setFormData({...formData, prelims: e.target.value})} style={{ minHeight:'80px', padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                  <textarea placeholder="Mains Concept" value={formData.mains} onChange={e=>setFormData({...formData, mains: e.target.value})} style={{ minHeight:'80px', padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                  <textarea placeholder="India Focus" value={formData.india} onChange={e=>setFormData({...formData, india: e.target.value})} style={{ minHeight:'80px', padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" style={{ flex: 1, padding: '14px', background: '#3b82f6', color: 'white', borderRadius: '12px', border:'none', cursor: 'pointer', fontWeight: 800 }}>{editingId ? "Update Entry" : "Save to DB"}</button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ lat: '', lon: '', name: '', category: 'strait', tags: '', year: '', prelims: '', mains: '', india: '' }) }} style={{ padding: '14px', background: '#f1f5f9', color: '#64748b', borderRadius: '12px', border:'none', cursor: 'pointer' }}>Cancel</button>}
                  </div>
                </form>
              </div>

              <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 800 }}>Bulk Actions</h2>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Google Sheets Sync (CSV URL)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input placeholder="https://docs.google.com/..." value={sheetUrl} onChange={e=>setSheetUrl(e.target.value)} style={{ flex: 1, padding:'10px', borderRadius:'8px', border: '1px solid #cbd5e1' }} />
                    <button onClick={handleSheetSync} style={{ padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Sync Sheets</button>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Bulk CSV Upload</label>
                  <input type="file" accept=".csv" onChange={handleBulkUpload} style={{ width: '100%', marginBottom: '16px' }} />
                </div>

                <button onClick={handleBulkDelete} style={{ width: '100%', padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Wipe All Entries</button>
              </div>
            </div>            {/* Registry List */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                Live Registry <span>{(entries || []).length} items</span>
              </h2>
              <div style={{ maxHeight: '800px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(entries || []).map(e => (
                  <div key={e.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#1e293b' }}>{e.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.category} | {e.lat?.toFixed(2) || '0'}, {e.lon?.toFixed(2) || '0'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(e)} style={{ padding: '6px 12px', background: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => fetch(`/api/entries/${e.id}`, { method: 'DELETE' }).then(fetchEntries)} style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
            {/* Create User */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 800 }}>Manual User Add</h2>
              <form onSubmit={handleUserCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input required placeholder="Name" value={userFormData.name} onChange={e=>setUserFormData({...userFormData, name: e.target.value})} style={{ padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                <input required placeholder="Email" type="email" value={userFormData.email} onChange={e=>setUserFormData({...userFormData, email: e.target.value})} style={{ padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                <input placeholder="Assign Password" type="password" value={userFormData.password} onChange={e=>setUserFormData({...userFormData, password: e.target.value})} style={{ padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                <select value={userFormData.tier} onChange={e=>setUserFormData({...userFormData, tier: e.target.value})} style={{ padding:'12px', borderRadius:'10px', border: '1px solid #e2e8f0' }}>
                  <option value="FREE">Normal (Free)</option>
                  <option value="PRO">Access All (Pro)</option>
                </select>
                <button type="submit" style={{ padding: '14px', background: '#10b981', color: 'white', borderRadius: '12px', border:'none', cursor: 'pointer', fontWeight: 800 }}>Create Platform User</button>
              </form>
            </div>

            {/* User List */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: 800 }}>Platform Users</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(users || []).map(user => (
                  user && (
                    <div key={user.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: user.tier === 'PRO' ? '1px solid #c7d2fe' : '1px solid transparent' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#1e293b' }}>{user.name} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({user.email})</span></div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', background: user.tier === 'PRO' ? '#e0e7ff' : '#f1f5f9', color: user.tier === 'PRO' ? '#4338ca' : '#64748b', fontWeight: 700 }}>{user.tier} Tier</span>
                          <span style={{ marginLeft: '10px', color: '#94a3b8' }}>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => toggleUserTier(user)} style={{ padding: '6px 12px', background: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                          {user.tier === 'PRO' ? "Revoke Pro" : "Make Pro"}
                        </button>
                        <button onClick={() => deleteUser(user.id)} style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
