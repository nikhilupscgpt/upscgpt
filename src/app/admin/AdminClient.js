"use client"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import Papa from "papaparse"

export default function AdminClient({ session }) {
  const [entries, setEntries] = useState([])
  const [formData, setFormData] = useState({ lat: '', lon: '', name: '', category: 'strait', tags: '', year: '', prelims: '', mains: '', india: '' })
  const [sheetUrl, setSheetUrl] = useState("")
  const [status, setStatus] = useState("")

  const fetchEntries = () => fetch('/api/entries').then(r => r.json()).then(setEntries)
  useEffect(() => { fetchEntries() }, [])

  // Auto-Geocoding Utility
  const geocodeLocation = async (name) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`)
      const data = await res.json()
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
    } catch (e) {
      console.error("Geocoding failed", e)
    }
    return null
  }

  // Single Entry Submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("Saving...")
    
    let { lat, lon, name } = formData

    // Check if auto-geocoding is needed
    if (!lat || !lon) {
      setStatus(`Auto-Geocoding "${name}"...`)
      const geo = await geocodeLocation(name)
      if (geo) {
        lat = geo.lat; lon = geo.lon;
        setStatus(`Found coordinates: [${lat.toFixed(2)}, ${lon.toFixed(2)}]`)
      } else {
        setStatus("Could not find coordinates automatically. Saved as draft.")
      }
    }

    const payload = { ...formData, lat, lon }
    const res = await fetch("/api/entries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    
    if(res.ok) {
        setFormData({ lat: '', lon: '', name: '', category: 'strait', tags: '', year: '', prelims: '', mains: '', india: '' })
        setStatus("Entry successfully saved to DB!")
        fetchEntries()
        setTimeout(() => setStatus(""), 4000)
    } else {
        setStatus("Error saving entry.")
    }
  }

  // Bulk CSV File Upload
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        const processed = []

        for (let i = 0; i < rows.length; i++) {
          // Normalize header keys (strip BOM, trim, lowercase)
          const row = Object.fromEntries(Object.entries(rows[i]).map(([k, v]) => [(k || "").replace(/^\uFEFF/,'').trim().toLowerCase(), v]));
          let { lat, lon, name } = row;
          
          if ((!lat || !lon) && name) {
            setStatus(`Row ${i + 1}/${rows.length}: Geocoding ${name}...`)
            const geo = await geocodeLocation(name)
            if (geo) { lat = geo.lat; lon = geo.lon; }
            await new Promise(r => setTimeout(r, 1500)) // 1.5s delay to be safe with Nominatim
          }
          processed.push({ ...row, lat, lon })
        }

        setStatus(`Saving ${processed.length} entries via Bulk API...`)
        const res = await fetch("/api/entries/bulk", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: processed })
        })

        if (res.ok) {
          setStatus(`Successfully batch imported ${processed.length} map entries!`)
          fetchEntries()
        } else {
          setStatus("Bulk import failed.")
        }
      }
    });
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

        // Check if it's an HTML page instead of CSV
        const firstRowKeys = Object.keys(rows[0]).map(k => (k||"").replace(/^\uFEFF/,'').trim().toLowerCase());
        if (!firstRowKeys.includes("name")) {
          alert("We couldn't detect a 'Name' column. Did you select 'Comma-separated values (.csv)' when publishing to web? Your link might be a webpage (.pubhtml) instead.");
          setStatus("Error: Invalid CSV format missing 'Name' column.");
          return;
        }

        const processed = []

        for (let i = 0; i < rows.length; i++) {
          // Normalize header keys (strip BOM, trim, lowercase)
          const row = Object.fromEntries(Object.entries(rows[i]).map(([k, v]) => [(k || "").replace(/^\uFEFF/,'').trim().toLowerCase(), v]));
          let { lat, lon, name } = row;
          
          if ((!lat || !lon) && name) {
            setStatus(`Row ${i + 1}/${rows.length}: Geocoding ${name}...`)
            const geo = await geocodeLocation(name)
            if (geo) { lat = geo.lat; lon = geo.lon; }
            await new Promise(r => setTimeout(r, 1500)) // 1.5s delay to be safe with Nominatim
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
          setSheetUrl("") // clear URL
          fetchEntries()
        } else {
          setStatus("Sheet Sync failed.")
        }
      },
      error: (err) => setStatus("Failed to download CSV from URL: " + err.message)
    });
  }

  const handleBulkDelete = async () => {
    if(confirm("Are you SURE you want to permanently delete ALL map entries?")) {
      setStatus("Deleting all entries...")
      await fetch('/api/entries/bulk', { method: "DELETE" })
      fetchEntries()
      setStatus("All entries deleted.")
      setTimeout(() => setStatus(""), 3000)
    }
  }

  const handleDelete = async (id) => {
    if(confirm("Delete this entry entirely from the map?")) {
      await fetch(`/api/entries/${id}`, { method: "DELETE" })
      fetchEntries()
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 32px', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center', 
          background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '24px 32px', 
          borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' 
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '6px', fontWeight: 800, background: 'linear-gradient(90deg, #0f172a, #3b82f6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Control Center</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Authenticated as <span style={{color:'#3b82f6', fontWeight:700}}>{session?.user?.name}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/" style={{ padding: '10px 20px', background: 'white', border:'1px solid #cbd5e1', borderRadius:'12px', color:'#0f172a', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', textDecoration: 'none', display: 'inline-block' }}>← Portal Home</Link>
            <button onClick={() => signOut()} style={{ padding: '10px 20px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '12px', cursor: 'pointer', fontWeight:600, fontSize:'0.9rem' }}>Disconnect Session</button>
          </div>
        </header>

        {status && <div style={{ 
          padding: '16px 24px', background: status.includes("Error") || status.includes("failed") ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
          color: status.includes("Error") ? '#ef4444' : '#4338ca', borderRadius: '16px', marginBottom: '32px', 
          fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px',
          border: `1px solid ${status.includes("Error") ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
        }}>
           {status}
        </div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* GOOGLE SHEETS SYNC PANEL */}
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ marginBottom: '10px', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Google Sheets Auto-Sync</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>Paste your published Google Sheet CSV link. The AI will download, geocode, and seamlessly synchronize your data.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="url" placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border)', outline: 'none' }} />
                <button onClick={handleSheetSync} style={{ background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>Sync Data</button>
              </div>
            </div>

            {/* BULK UPLOAD PANEL */}
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ marginBottom: '10px', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Bulk Data Upload</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>Upload a CSV with `name`, `category`, `tags`, `year`, `prelims`, `mains`, `india`. The AI will natively auto-geocode missing coordinate pairs.</p>
              <div style={{ border: '2px dashed #94a3b8', padding: '32px', textAlign: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }}>
                <input type="file" accept=".csv" onChange={handleBulkUpload} style={{ width: '100%', cursor: 'pointer', outline: 'none', border:'none', background:'transparent' }} />
              </div>
            </div>

            {/* SINGLE UPLOAD PANEL */}
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ marginBottom: '24px', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Add Individual Entry</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform:'uppercase' }}>Location Name *</label>
                    <input required placeholder="e.g. Strait of Hormuz" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform:'uppercase' }}>Category Layer</label>
                    <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px' }}>
                      <option value="strait">Strait / Point</option>
                      <option value="conflict">Conflict Region</option>
                      <option value="nature">Nature / Ecology</option>
                      <option value="island">Island</option>
                      <option value="mineral">Strategic Resource</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '12px', fontWeight: 600 }}>Coordinates <span style={{color: '#94a3b8', fontWeight: 400}}>(leave blank for AI Geocoding)</span></p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <input placeholder="Lat" type="number" step="any" value={formData.lat} onChange={e=>setFormData({...formData, lat: e.target.value})} style={{ flex:1, padding:'10px', borderRadius:'8px' }} />
                    <input placeholder="Lon" type="number" step="any" value={formData.lon} onChange={e=>setFormData({...formData, lon: e.target.value})} style={{ flex:1, padding:'10px', borderRadius:'8px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform:'uppercase' }}>Intelligence Tags</label>
                    <input placeholder="e.g., IR, Environment" value={formData.tags} onChange={e=>setFormData({...formData, tags: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform:'uppercase' }}>Target Year</label>
                    <input type="number" placeholder="2026" value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px' }} />
                  </div>
                </div>
                
                <div style={{background: 'rgba(16, 185, 129, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)'}}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#059669', marginBottom: '12px', textTransform:'uppercase' }}>Prelims Fact (Markdown)</label>
                  <textarea placeholder="Supports **bold**, bullets, etc." value={formData.prelims} onChange={e=>setFormData({...formData, prelims: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px', minHeight:'80px', background: 'rgba(255,255,255,0.8)' }} />
                </div>
                
                <div style={{background: 'rgba(59, 130, 246, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.1)'}}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', marginBottom: '12px', textTransform:'uppercase' }}>Mains Concept</label>
                  <textarea placeholder="Structural perspective." value={formData.mains} onChange={e=>setFormData({...formData, mains: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px', minHeight:'80px', background: 'rgba(255,255,255,0.8)' }} />
                </div>
                
                <div style={{background: 'rgba(245, 158, 11, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.1)'}}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#d97706', marginBottom: '12px', textTransform:'uppercase' }}>India Focus</label>
                  <textarea placeholder="Relevance to Indian geopolitics." value={formData.india} onChange={e=>setFormData({...formData, india: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px', minHeight:'80px', background: 'rgba(255,255,255,0.8)' }} />
                </div>
                
                <button type="submit" className="btn-primary" style={{ padding: '16px', borderRadius: '12px', fontSize: '1.05rem', marginTop: '8px' }}>🚀 Launch to Map Database</button>
              </form>
            </div>
          </div>

          <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.25rem', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems:'center', fontWeight: 800 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                Live Registry 
                <span style={{ fontSize: '0.8rem', background: 'var(--primary-gradient)', padding:'4px 12px', borderRadius:'12px', color: 'white', fontWeight: 600, boxShadow: 'var(--primary-shadow)' }}>{entries.length} items</span>
              </div>
              <button onClick={handleBulkDelete} style={{ background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>Wipe All</button>
            </h2>
            
            <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '12px' }}>
              {entries.map(e => (
                <div key={e.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '16px', position:'relative', transition: 'all 0.3s' }}>
                  <h4 style={{ margin: '0 0 8px 0', display:'flex', justifyContent:'space-between', alignItems: 'center', fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                    {e.name}
                    <button onClick={() => handleDelete(e.id)} style={{ background:'rgba(239, 68, 68, 0.1)', padding:'6px 12px', borderRadius:'8px', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'0.75rem', fontWeight: 700, transition: 'all 0.2s' }}>Remove</button>
                  </h4>
                  <div style={{ fontSize:'0.8rem', color:'#64748b', display: 'flex', gap: '8px', alignItems:'center', flexWrap: 'wrap' }}>
                    <span style={{ textTransform:'uppercase', fontWeight: 800, padding:'3px 8px', background:'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius:'6px' }}>{e.category}</span>
                    <span style={{ fontWeight: 700 }}>{e.year || 'N/A'}</span>
                    <span style={{fontFamily: 'monospace'}}>📌 {e.lat ? e.lat.toFixed(2) : '-'}, {e.lon ? e.lon.toFixed(2) : '-'}</span>
                  </div>
                  {e.tags && (
                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#4f46e5', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {e.tags.split(',').map(t => <span key={t} style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>#{t.trim()}</span>)}
                    </div>
                  )}
                </div>
              ))}
              
              {entries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.4)', borderRadius: '16px' }}>
                  <div style={{fontSize: '40px', marginBottom: '16px'}}>📭</div>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>Your database is pristine.<br/>Upload a CSV or add an entry manually!</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
