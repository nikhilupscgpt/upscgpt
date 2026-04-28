"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script";
import { Zap, Clock, CheckCircle, BookOpen, Activity, Settings, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "",
    examYear: 2025,
    preferences: { studyMode: "comprehensive" }
  });
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [optionals, setOptionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      const fetchData = async () => {
        try {
          const [profileRes, statsRes, optionalsRes] = await Promise.all([
            fetch("/api/user/profile"),
            fetch("/api/user/dashboard-stats"),
            fetch("/api/optionals")
          ]);
          
          const profileData = await profileRes.json();
          const statsData = await statsRes.json();
          const optionalsData = await optionalsRes.json();

          setOptionals(optionalsData);

          setProfile({
            name: profileData.name || "",
            examYear: profileData.examYear || 2025,
            preferences: profileData.preferences || { studyMode: "comprehensive" }
          });

          if (statsData.success) {
            setStats(statsData.stats);
            setActivity(statsData.recentActivity || []);
          }
        } catch (error) {
          console.error("Dashboard Fetch Error:", error);
          toast.error("Failed to load strategic data");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [status, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        await update({ name: profile.name });
      } else {
        const err = await res.json();
        toast.error(err.error || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    setSaving(true);
    try {
      const orderRes = await fetch("/api/payment/order", { method: "POST" });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Order creation failed");

      // SIMULATOR MODE: Bypass Razorpay modal if mock order
      if (orderData.isMock) {
        toast.loading("Simulating secure payment...", { id: "pay" });
        try {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderData.id,
              razorpay_payment_id: `mock_pay_${Date.now()}`,
              razorpay_signature: "mock_signature"
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            toast.success("Simulator: Upgrade Successful!", { id: "pay" });
            // FORCE RE-FETCH
            await update(); 
            window.location.reload(); // Hard reload to ensure all states sync
          } else {
            toast.error(verifyData.error || "Simulation failed", { id: "pay" });
            setSaving(false);
          }
        } catch (err) {
          toast.error("Simulator connection error", { id: "pay" });
          setSaving(false);
        }
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "UPSC Atlas Portal",
        description: "PRO Tier Strategic Access",
        order_id: orderData.id,
        handler: async function (response) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            toast.success("Welcome to PRO, Strategist!");
            await update({ tier: 'PRO' });
          }
        },
        prefill: { name: session?.user?.name, email: session?.user?.email },
        theme: { color: "#3b82f6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.message || "Checkout session failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '1px' }}>INITIALIZING STRATEGIC DASHBOARD...</div>
      </div>
    );
  }

  const isPro = session?.user?.tier === 'PRO' || session?.user?.role === 'ADMIN';

  return (
    <div className="profile-container">
      <Toaster position="bottom-right" />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <main className="profile-main">
        
        {/* HEADER SECTION */}
        <header className="profile-header">
          <div className="header-info">
            <div className="title-group">
              <h1 className="hero-title">Hello, {session?.user?.name}</h1>
              {isPro && (
                <span className="pro-badge">
                  <Zap size={10} fill="black" /> PRO MEMBER
                </span>
              )}
            </div>
            <p className="hero-subtitle">Tracking your neural progress for the {profile.examYear} Strategic Cycle.</p>
          </div>
          <button className="settings-toggle" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
            <Settings size={14} /> <span className="hide-mobile">ACCOUNT SETTINGS</span>
          </button>
        </header>

        <div className="dashboard-grid">
          
          {/* LEFT COLUMN: PROGRESS & ANALYTICS */}
          <div className="analytics-col">
            
            {/* OVERVIEW CARDS */}
            <div className="stats-grid">
              <div style={statCardStyle}>
                <div style={statIconStyle('#3b82f6')}><BookOpen size={20} /></div>
                <div className="stat-val">{stats?.totalProgress || 0}</div>
                <div className="stat-label">Issues Explored</div>
              </div>
              <div style={statCardStyle}>
                <div style={statIconStyle('#10b981')}><CheckCircle size={20} /></div>
                <div className="stat-val">{stats?.masteredCount || 0}</div>
                <div className="stat-label">Nodes Mastered</div>
              </div>
              <div style={statCardStyle}>
                <div style={statIconStyle('#f59e0b')}><TrendingUp size={20} /></div>
                <div className="stat-val">{Math.round(((stats?.masteredCount || 0) / 545) * 100)}%</div>
                <div className="stat-label">Global Coverage</div>
              </div>
            </div>

            {/* SYLLABUS HEATMAP */}
            <div style={bigCardStyle}>
              <h3 style={cardTitleStyle}>Syllabus Mastery Heatmap</h3>
              <div className="heatmap-list">
                {['GS1', 'GS2', 'GS3', 'GS4', 'OPTIONAL'].map(gs => {
                  const data = stats?.gsStats?.[gs];
                  if (gs === 'OPTIONAL' && !profile.preferences?.selectedOptional) return null;
                  if (!data) return null;

                  const percent = data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0;
                  
                  let label = gs;
                  if (gs === 'GS1') label = 'GS1: History';
                  if (gs === 'GS2') label = 'GS2: Polity';
                  if (gs === 'GS3') label = 'GS3: Economy';
                  if (gs === 'GS4') label = 'GS4: Ethics';
                  if (gs === 'OPTIONAL') {
                    const opt = optionals.find(o => o.id === profile.preferences?.selectedOptional);
                    label = opt ? `OPT: ${opt.name}` : 'Optional Subject';
                  }

                  return (
                    <div key={gs} className="heatmap-item">
                      <div className="heatmap-label">
                        <span>{label}</span>
                        <span className="percent-val">{percent}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${percent}%`, background: gs === 'OPTIONAL' ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : undefined }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DOMAIN BREAKDOWN */}
            <div style={bigCardStyle}>
              <h3 style={cardTitleStyle}>Domain Intelligence</h3>
              <div className="domain-grid">
                {Object.entries(stats?.domainStats || {}).slice(0, 8).map(([domain, data]) => (
                  <div key={domain} className="domain-card">
                    <div className="domain-label">{domain}</div>
                    <div className="domain-val">{data.mastered}/{data.total}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: ACTIVITY & UPGRADE */}
          <div className="sidebar-col">
            
            {/* UPGRADE PRO CARD */}
            {!isPro && (
              <div className="upgrade-card">
                <Zap size={32} style={{ color: '#fbbf24', marginBottom: '1rem' }} />
                <h3 className="upgrade-title">ELEVATE TO PRO</h3>
                <p className="upgrade-desc">Unlock unlimited neural RAG queries and priority intelligence syncing.</p>
                <button onClick={handleUpgrade} className="upgrade-btn">
                  Upgrade for ₹499/mo
                </button>
              </div>
            )}

            {/* RECENT ACTIVITY */}
            <div style={bigCardStyle}>
              <h3 className="card-title-with-icon">
                <Activity size={16} /> Recent Activity
              </h3>
              <div className="activity-list">
                {activity.length > 0 ? activity.map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-icon">
                      {act.action.includes('PRO') || act.action.includes('UPGRADE') ? <Zap size={16} color="#fbbf24" /> : <Clock size={16} color="#64748b" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="activity-action">
                        {act.action.replace(/_/g, ' ')}
                        {act.user && <span className="admin-user-tag"> • {act.user.name || act.user.email.split('@')[0]}</span>}
                      </div>
                      <div className="activity-msg">{act.message}</div>
                      <div className="activity-date">{new Date(act.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                )) : (
                  <div className="empty-msg">No recent activity vectors found.</div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SETTINGS SECTION */}
        <div className="settings-section">
          <h2 className="section-title">Account Configuration</h2>
          <div className="settings-grid">
            <div style={bigCardStyle}>
              <form onSubmit={handleSave} className="settings-form">
                <div>
                  <label style={labelStyle}>Display Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} style={inputStyle} />
                </div>
                <div className="form-row">
                  <div>
                    <label style={labelStyle}>Target Year</label>
                    <select value={profile.examYear} onChange={e => setProfile({...profile, examYear: parseInt(e.target.value)})} style={inputStyle}>
                      <option value={2025}>2025 Cycle</option>
                      <option value={2026}>2026 Cycle</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Optional Subject</label>
                    <select 
                      value={profile.preferences?.selectedOptional || ""} 
                      onChange={e => setProfile({...profile, preferences: {...profile.preferences, selectedOptional: e.target.value}})} 
                      style={inputStyle}
                    >
                      <option value="">Not Selected</option>
                      {optionals.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Study Mode</label>
                    <select value={profile.preferences.studyMode} onChange={e => setProfile({...profile, preferences: {...profile.preferences, studyMode: e.target.value}})} style={inputStyle}>
                      <option value="comprehensive">Comprehensive</option>
                      <option value="fast_track">Fast Track</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="save-btn">
                  {saving ? "SAVING..." : "SECURE UPDATE"}
                </button>
              </form>
            </div>
            <div style={bigCardStyle}>
               <h4 style={labelStyle}>Linked Accounts</h4>
               <div className="account-pill">
                 <div className="email-val">{session?.user?.email}</div>
                 <span className="primary-tag">PRIMARY</span>
               </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .profile-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
          color: white;
          font-family: 'Outfit', sans-serif;
        }

        .profile-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
        }

        .title-group { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
        .hero-title { font-size: 2.5rem; font-weight: 900; margin: 0; letter-spacing: -0.03em; }
        .pro-badge { padding: 4px 12px; border-radius: 100px; background: #fbbf24; color: black; font-size: 0.7rem; font-weight: 900; display: flex; align-items: center; gap: 4px; }
        .hero-subtitle { color: #64748b; font-size: 1.1rem; }

        .settings-toggle { display: flex; align-items: center; gap: 8px; color: #94a3b8; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; }

        .dashboard-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 2.5rem; }
        .analytics-col, .sidebar-col { display: flex; flex-direction: column; gap: 2rem; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .stat-val { font-size: 1.5rem; font-weight: 900; }
        .stat-label { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

        .heatmap-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .heatmap-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; font-weight: 800; }
        .percent-val { color: #10b981; }
        .progress-bar-bg { height: 8px; background: rgba(255,255,255,0.05); border-radius: 100px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); transition: width 1s ease; }

        .domain-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
        .domain-card { padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .domain-label { font-size: 0.6rem; font-weight: 900; color: #64748b; margin-bottom: 4px; }
        .domain-val { font-size: 1rem; font-weight: 900; }

        .upgrade-card { padding: 2rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 24px; text-align: center; }
        .upgrade-title { font-size: 1.25rem; font-weight: 900; color: #fbbf24; margin-bottom: 0.5rem; }
        .upgrade-desc { font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 1.5rem; line-height: 1.6; }
        .upgrade-btn { width: 100%; padding: 12px; border-radius: 12px; background: #fbbf24; color: black; font-weight: 900; border: none; cursor: pointer; }

        .card-title-with-icon { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 900; margin-bottom: 1.5rem; }
        .activity-list { display: flex; flex-direction: column; gap: 1rem; }
        .activity-item { display: flex; gap: 12px; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .activity-icon { padding: 8px; background: rgba(255,255,255,0.03); border-radius: 8px; height: fit-content; }
        .activity-action { font-size: 0.8rem; font-weight: 800; text-transform: capitalize; }
        .activity-msg { font-size: 0.75rem; color: #64748b; }
        .activity-date { font-size: 0.65rem; color: #475569; margin-top: 4px; }
        .admin-user-tag { font-size: 0.65rem; color: #3b82f6; font-weight: 900; opacity: 0.8; }
        .empty-msg { text-align: center; padding: 2rem; color: #475569; font-size: 0.8rem; }

        .settings-section { margin-top: 5rem; padding-top: 3rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .section-title { font-size: 1.5rem; font-weight: 900; margin-bottom: 2rem; }
        .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .settings-form { display: flex; flexDirection: column; gap: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .save-btn { width: 100%; padding: 12px; border-radius: 12px; background: #3b82f6; color: white; font-weight: 900; border: none; cursor: pointer; }

        .account-pill { padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        .email-val { font-size: 0.85rem; }
        .primary-tag { font-size: 0.6rem; font-weight: 900; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px; }

        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 1.8rem; }
          .profile-main { padding: 1.5rem 1rem; }
          .stats-grid { grid-template-columns: 1fr; gap: 1rem; }
          .hide-mobile { display: none; }
          .profile-header { align-items: center; }
        }
      `}</style>
    </div>
  );
}

// STYLES
const statCardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '20px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  backdropFilter: 'blur(10px)'
};

const statIconStyle = (color) => ({
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: `${color}15`,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '0.5rem'
});

const bigCardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
  padding: '2rem'
};

const cardTitleStyle = {
  fontSize: '1rem',
  fontWeight: 900,
  marginBottom: '1.5rem',
  letterSpacing: '0.5px'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.65rem',
  fontWeight: 900,
  color: '#64748b',
  textTransform: 'uppercase',
  marginBottom: '8px',
  letterSpacing: '1px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '0.9rem',
  outline: 'none'
};
