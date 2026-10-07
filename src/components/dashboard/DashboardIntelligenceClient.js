'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Brain, Network, Newspaper, FileQuestion, 
  PenLine, CircleCheck, Zap, Flame, BarChart3, Search, 
  Bell, Moon, Sun, ChevronsLeft, ChevronsRight, TrendingUp, 
  Target, Clock, Send, BarChart2, History, Link as LinkIcon, 
  ArrowUpRight, Cpu
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DashboardIntelligenceClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [chatInp, setChatInp] = useState('');
  const [chatMsgs, setChatMsgs] = useState([]);
  
  useEffect(() => {
    console.log("[Dashboard] Component Mounted");
    setHasMounted(true);
    if (session?.user?.name) {
      setChatMsgs([
        { role: 'ai', content: `Good morning, ${session.user.name.split(' ')[0]}! Based on your weak nodes, I suggest focusing on **Monetary Policy & RBI Functions** today. This topic has appeared in **4 out of the last 7 Prelims** and you've not reviewed it in 9 days.`, tags: ['GS Paper 3', 'Economy', 'High Priority'] }
      ]);
    }
  }, [session]);

  useEffect(() => {
    if (hasMounted) {
      fetchDashboardData();
    }
  }, [hasMounted]);

  const fetchDashboardData = async () => {
    try {
      console.log("[Dashboard] Fetching Intelligence Metrics...");
      const res = await fetch('/api/user/intelligence/dashboard');
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const d = await res.json();
      console.log("[Dashboard] Data Loaded:", d);
      setData(d);
      setLoading(false);
    } catch (err) {
      console.error('[Dashboard] Critical Data Fetch Failure:', err);
      setLoading(false); // Stop loading even on error to show error state if needed
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleSendMessage = async () => {
    if (!chatInp.trim()) return;
    const userMsg = { role: 'user', content: chatInp };
    setChatMsgs(prev => [...prev, userMsg]);
    setChatInp('');
    setIsTyping(true);

    // Integrate with RAG API
    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content, subject: 'UPSC_GENERAL', examType: 'MAINS' })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Intelligence engine is currently offline.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      // Remove typing indicator when first chunk arrives
      setIsTyping(false);
      setChatMsgs(prev => [...prev, { role: 'ai', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Handle metadata if present
        if (chunk.includes('METADATA:')) {
           aiContent += chunk.split('\n').slice(1).join('\n');
        } else {
           aiContent += chunk;
        }

        setChatMsgs(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = aiContent;
          return updated;
        });
      }
      
      // Update Neural Answer Engine with the summary
      setNeuralContent(aiContent);
    } catch (err) {
      setIsTyping(false);
      setChatMsgs(prev => [...prev, { role: 'ai', content: 'Neural connection failed. Please try again.' }]);
    }
  };

  if (!hasMounted) return null;

  if (loading || !data || !data.kpis) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617] text-[#3b82f6]">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="animate-spin" size={48} />
          <span className="text-sm font-bold tracking-widest uppercase">Initializing Intelligence Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${theme}`} style={{ display: 'flex', height: 'calc(100vh - 72px)', width: '100vw', overflow: 'hidden' }}>
      <style jsx global>{`
        :root {
          --color-bg: #020617;
          --color-surface: #0f172a;
          --color-surface-2: #1e293b;
          --color-border: rgba(255, 255, 255, 0.1);
          --color-divider: rgba(255, 255, 255, 0.05);
          --color-text: #f8fafc;
          --color-text-muted: #94a3b8;
          --color-text-faint: #475569;
          --color-primary: #3b82f6;
          --color-primary-highlight: rgba(59, 130, 246, 0.15);
          --color-gold: #f59e0b;
          --color-gold-highlight: rgba(245, 158, 11, 0.15);
          --color-success: #10b981;
          --color-success-highlight: rgba(16, 185, 129, 0.15);
          --color-error: #ef4444;
          --color-error-highlight: rgba(239, 68, 68, 0.15);
          --color-orange: #f97316;
          --color-orange-highlight: rgba(249, 115, 22, 0.15);
          --color-purple: #8b5cf6;
          --color-purple-highlight: rgba(139, 92, 246, 0.15);
          --ai-glow: 0 0 30px rgba(59, 130, 246, 0.1), 0 0 60px rgba(59, 130, 246, 0.05);
        }

        [data-theme="light"] {
          --color-bg: #f8fafc;
          --color-surface: #ffffff;
          --color-surface-2: #f1f5f9;
          --color-border: #e2e8f0;
          --color-divider: #f1f5f9;
          --color-text: #0f172a;
          --color-text-muted: #64748b;
          --color-text-faint: #94a3b8;
          --color-primary: #3b82f6;
          --color-primary-highlight: rgba(59, 130, 246, 0.1);
          --color-gold: #d97706;
          --color-gold-highlight: #fef3c7;
          --color-success: #059669;
          --color-success-highlight: #d1fae5;
          --color-error: #dc2626;
          --color-error-highlight: #fee2e2;
          --color-orange: #ea580c;
          --color-orange-highlight: #ffedd5;
          --color-purple: #7c3aed;
          --color-purple-highlight: #ede9fe;
        }

        .dashboard-container { background: var(--color-bg); color: var(--color-text); font-family: 'Inter', sans-serif; padding-top: 0; }
        
        .sidebar { width: ${collapsed ? '70px' : '260px'}; background: var(--color-surface); border-right: 1px solid var(--color-divider); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; height: calc(100vh - 72px); }
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: calc(100vh - 72px); }
        .topbar { height: 60px; background: var(--color-surface); border-bottom: 1px solid var(--color-divider); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
        .scroll-area { flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; gap: 32px; }

        .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; margin: 2px 12px; border-radius: 10px; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; font-size: 0.85rem; font-weight: 500; white-space: nowrap; }
        .nav-item:hover { background: var(--color-surface-2); color: var(--color-text); }
        .nav-item.active { background: var(--color-primary-highlight); color: var(--color-primary); }
        .nav-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-faint); margin: 24px 24px 8px; }

        .kpi-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 20px; padding: 20px 24px; display: flex; flex-direction: column; gap: 8px; transition: all 0.3s; }
        .kpi-card:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .kpi-value { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }

        .ai-panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 24px; box-shadow: var(--ai-glow); overflow: hidden; display: flex; flex-direction: column; }
        .ai-header { padding: 16px 20px; background: linear-gradient(135deg, var(--color-primary-highlight), transparent); border-bottom: 1px solid var(--color-divider); display: flex; align-items: center; gap: 12px; }
        .ai-msgs { padding: 20px; display: flex; flex-direction: column; gap: 16px; height: 300px; overflow-y: auto; }
        .msg-bubble { padding: 12px 16px; border-radius: 18px; font-size: 0.85rem; line-height: 1.6; max-width: 85%; }
        .msg.ai .msg-bubble { background: var(--color-surface-2); border: 1px solid var(--color-border); color: var(--color-text); border-bottom-left-radius: 4px; }
        .msg.user { align-self: flex-end; }
        .msg.user .msg-bubble { background: var(--color-primary); color: white; border-bottom-right-radius: 4px; }

        .heatmap-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .heatmap-bar { height: 8px; background: var(--color-divider); border-radius: 4px; flex: 1; overflow: hidden; }
        .heatmap-fill { height: 100%; border-radius: 4px; transition: width 1s ease-out; }

        .pq-item { padding: 16px; border-radius: 16px; border: 1px solid var(--color-border); background: var(--color-surface-2); transition: all 0.2s; cursor: pointer; }
        .pq-item:hover { border-color: var(--color-gold); transform: scale(1.01); }

        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }
        .status-dot { width: 8px; height: 8px; background: var(--color-success); border-radius: 50%; box-shadow: 0 0 10px var(--color-success); animation: pulse-dot 2s infinite; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: '8px' }}></div>
          {!collapsed && <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px', fontFamily: 'monospace' }}>upsc<span style={{ color: 'var(--color-primary)' }}>gpt</span></span>}
        </div>

        <div className="nav-label">{!collapsed && 'Intelligence Hub'}</div>
        <div className={`nav-item ${activeNav === 'Dashboard' ? 'active' : ''}`} onClick={() => router.push('/dashboard')}>
          <LayoutDashboard size={18} /> {!collapsed && 'Dashboard'}
        </div>
        <div className={`nav-item ${activeNav === 'Tutor' ? 'active' : ''}`} onClick={() => router.push('/atlas')}>
          <Brain size={18} /> {!collapsed && 'AI Map Tutor'}
        </div>
        <div className={`nav-item ${activeNav === 'Graph' ? 'active' : ''}`} onClick={() => router.push('/atlas')}>
          <Network size={18} /> {!collapsed && 'Syllabus Graph'}
        </div>
        <div className={`nav-item ${activeNav === 'News' ? 'active' : ''}`} onClick={() => router.push('/issues')}>
          <Newspaper size={18} /> {!collapsed && 'News Briefs'}
        </div>

        <div className="nav-label">{!collapsed && 'Exam Prep'}</div>
        <div className="nav-item" onClick={() => router.push('/prelims')}> <FileQuestion size={18} /> {!collapsed && 'PYQ Vault'} </div>
        <div className="nav-item" onClick={() => router.push('/mains')}> <PenLine size={18} /> {!collapsed && 'Mains Studio'} </div>
        <div className="nav-item" onClick={() => router.push('/prelims')}> <CircleCheck size={18} /> {!collapsed && 'Mock Tests'} </div>
        <div className="nav-item" onClick={() => router.push('/prelims')}> <Zap size={18} /> {!collapsed && 'Daily Quiz'} <span style={{ marginLeft: 'auto', fontSize: '0.6rem', background: 'var(--color-primary)', color: 'white', padding: '1px 6px', borderRadius: '10px' }}>1</span></div>

        <div className="nav-label">{!collapsed && 'Analytics'}</div>
        <div className="nav-item" onClick={() => setActiveNav('Heatmap')}> <BarChart3 size={18} /> {!collapsed && 'Coverage Heat Map'} </div>
        <div className="nav-item" onClick={() => setActiveNav('Performance')}> <BarChart2 size={18} /> {!collapsed && 'Performance'} </div>

        <button onClick={() => setCollapsed(!collapsed)} style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid var(--color-divider)', color: 'var(--color-text-faint)' }}>
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <strong>Dashboard</strong> / Intelligence Overview
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} color="var(--color-text-faint)" />
              <input type="text" placeholder="Search syllabus..." style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.8rem', outline: 'none' }} />
            </div>
            <button onClick={toggleTheme} className="icon-btn">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Bell size={18} color="var(--color-text-muted)" />
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-highlight)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{session?.user?.name?.[0] || 'N'}</div>
          </div>
        </header>

        <div className="scroll-area">
          {/* KPI GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Nodes Covered</span>
                <Network size={16} color="var(--color-primary)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--color-primary)' }}>{data?.kpis?.nodes?.current || 0}<span style={{ fontSize: '1rem', color: 'var(--color-text-faint)' }}>/{data?.kpis?.nodes?.total || 559}</span></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}><TrendingUp size={12} /> {data?.kpis?.nodes?.delta || '+0'} this week</div>
            </div>
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Study Streak</span>
                <Flame size={16} color="var(--color-gold)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--color-gold)' }}>{data?.kpis?.streak?.current || 0}d</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}><Zap size={12} /> {data?.kpis?.streak?.label || 'Keep it up!'}</div>
            </div>
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Avg. Prelims Score</span>
                <Target size={16} color="var(--color-success)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{data?.kpis?.score?.current || 0}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}><TrendingUp size={12} /> {data?.kpis?.score?.delta || '0%'} vs last test</div>
            </div>
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>AI Sessions</span>
                <Brain size={16} color="var(--color-purple)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--color-purple)' }}>{data?.kpis?.ai?.current || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}><Clock size={12} /> {data?.kpis?.ai?.label || 'Start a session'}</div>
            </div>
          </div>
          {/* TACTICAL ROW 1: STREAK + PREDICTED */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
             {/* STREAK CALENDAR */}
             <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔥 Study Streak — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '32px' }}>
                   <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-gold)' }}>{data.kpis?.streak?.current || 0}</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Day Streak</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)' }}>{data.kpis?.streak?.label}</div>
                      </div>
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '6px' }}>
                        {Array.from({ length: 30 }).map((_, i) => {
                          const isActive = i < (data.kpis?.streak?.current || 0);
                          return (
                            <div key={i} style={{ aspectRatio: '1', borderRadius: '4px', background: isActive ? 'var(--color-gold)' : 'var(--color-surface-2)', opacity: isActive ? 1 : 0.3 }}></div>
                          );
                        })}
                      </div>
                   </div>
                </div>
             </div>

             <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎯 AI Predicted Questions
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}>View all 48</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.predictedQuestions?.map((pq, i) => (
                    <div key={i} className="pq-item">
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'var(--color-error-highlight)', color: 'var(--color-error)', padding: '2px 8px', borderRadius: '20px', border: '1px solid var(--color-error)' }}>{pq.tag}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-muted)' }}>{pq.subject}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', lineHeight: 1.5 }}>{pq.q}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* TACTICAL ROW 2: HEATMAP + NEWS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
             <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 900 }}>🗺️ Syllabus Coverage Heat Map</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  {data.heatmap.map(row => (
                    <div key={row.label} className="heatmap-row" style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.7rem', width: '100px', color: 'var(--color-text-muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.label}</span>
                      <div className="heatmap-bar">
                        <div className="heatmap-fill" style={{ width: `${row.pct}%`, background: row.pct > 75 ? 'var(--color-success)' : row.pct > 50 ? 'var(--color-primary)' : 'var(--color-orange)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, width: '35px', textAlign: 'right' }}>{row.pct}%</span>
                    </div>
                  ))}
                </div>
             </div>

             <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 900 }}>📰 Today's Syllabus-News</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {data.news?.map((n, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                       <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '6px' }}></div>
                       <div>
                         <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{n.title}</div>
                         <div style={{ fontSize: '0.6rem', color: 'var(--color-text-faint)' }}>{n.node} · 3h ago</div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* TACTICAL ROW 3: RECENT NODES */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 900 }}>🗂️ Recent Nodes</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>View all activity →</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {data.recentNodes?.map((node, i) => (
                <div key={i} onClick={() => router.push(`/issues/${node.id}`)} style={{ padding: '16px', borderRadius: '16px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-highlight)', padding: '2px 6px', borderRadius: '4px', marginBottom: '8px', display: 'inline-block' }}>{node.paper}</span>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>{node.title}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-faint)' }}>{node.pyqCount} PYQ links found</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
