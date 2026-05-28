"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("credentials", {
      username, password, redirect: false
    })
    
    if (res?.error) {
      setError("Invalid credentials")
      setLoading(false)
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
      backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(59,130,246,0.6))', backdropFilter: 'blur(8px)' }}></div>
      
      <form onSubmit={handleLogin} style={{ 
        position: 'relative', zIndex: 10,
        background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
        padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '380px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--primary-gradient)', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', boxShadow: 'var(--primary-shadow)' }}>🌍</div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: 800 }}>Lecturer Login</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Secure access to the database</p>
        </div>

        {error && <div style={{ padding:'12px', background:'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '20px', fontSize: '0.85rem', borderRadius:'10px', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Username</label>
          <input required value={username} onChange={e=>setUsername(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
        </div>
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Secure Passkey</label>
          <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem' }}>
          {loading ? "Authenticating..." : "Access Dashboard"}
        </button>
      </form>
    </div>
  )
}
