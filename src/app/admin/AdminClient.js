"use client"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import Papa from "papaparse"
import { 
  Users, Map as MapIcon, RefreshCw, CreditCard, MessageSquare, 
  Send, ShieldCheck, TrendingUp, HelpCircle, LogOut, ChevronRight,
  Globe, Zap, ZapOff, Trash2, Edit3, PlusCircle, CheckCircle, BrainCircuit,
  Newspaper, Search, FileText, Link2, Calendar, User, BookOpen, Filter, ChevronDown, ExternalLink, AlertCircle, Trophy
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
  const [lastSync, setLastSync] = useState(null)
  const [newsEngineStatus, setNewsEngineStatus] = useState(null)
  const [aiPrompts, setAiPrompts] = useState([])
  const [savingPromptId, setSavingPromptId] = useState(null)

  // News Engine V2 State
  const [issues, setIssues] = useState([])
  const [issueSearch, setIssueSearch] = useState('')
  const [issueCategoryFilter, setIssueCategoryFilter] = useState('')
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [ingestType, setIngestType] = useState('ARTICLE')
  const [ingestForm, setIngestForm] = useState({ title: '', url: '', source: '', contentType: 'NEWS', author: '', rawContent: '', publishedAt: '' })
  const [ingestLoading, setIngestLoading] = useState(false)
  const [ingestResult, setIngestResult] = useState(null)
  const [recentIngestions, setRecentIngestions] = useState([])
  const [issueDropdownOpen, setIssueDropdownOpen] = useState(false)

  // Test Admin State
  const [testPacks, setTestPacks] = useState([])
  const [testForm, setTestForm] = useState({ title: '', description: '', type: 'PRACTICE', durationMins: 0, passingScore: 70, issueId: '' })
  const [isCreatingTest, setIsCreatingTest] = useState(false)
  const [questions, setQuestions] = useState([])
  const [questionSearch, setQuestionSearch] = useState('')
  const [questionForm, setQuestionForm] = useState({ text: '', options: [{label:'a', text:''}, {label:'b', text:''}, {label:'c', text:''}, {label:'d', text:''}], correctLabel: 'a', explanation: '', difficulty: 'MEDIUM', gsPaper: '', issueId: '' })
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false)
  const [questionSheetUrl, setQuestionSheetUrl] = useState("")
  const [selectedTestPack, setSelectedTestPack] = useState(null)
  const [isEditingTestQuestions, setIsEditingTestQuestions] = useState(false)

  // Forms
  const [formData, setFormData] = useState({ 
    lat: '', lon: '', name: '', category: 'strait', tags: '', year: '', 
    prelims: '', mains: '', india: '',
    worldPart: 'POLITICAL', continent: '', admRegion: '', geoGroup: '', capital: ''
  })
  const [sheetUrl, setSheetUrl] = useState("")
  const [importModule, setImportModule] = useState("POLITICAL") // POLITICAL, PHYSICAL, NEWS
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', tier: 'FREE' })
  
  // Comms State
  const [commsForm, setCommsForm] = useState({ channel: 'EMAIL', type: 'MARKETING', recipients: 'PRO', content: '', templateName: '', params: [] })
  const [remoteSourceUrl, setRemoteSourceUrl] = useState("")
  const [dataSourceMode, setDataSourceMode] = useState("DATABASE") // DATABASE or REMOTE_CSV
  const [autoGeocode, setAutoGeocode] = useState(false)


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

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/admin/config")
      const data = await res.json()
      if (data.REMOTE_ATLAS_URL) setRemoteSourceUrl(data.REMOTE_ATLAS_URL)
      if (data.DATA_SOURCE_MODE) setDataSourceMode(data.DATA_SOURCE_MODE)
    } catch (e) { console.error("Config fetch fail", e) }
  }

  const fetchLastSync = async () => {
    try {
      const res = await fetch("/api/admin/news-sync")
      const data = await res.json()
      if (data && !data.error) setLastSync(data)
    } catch (e) { console.error("Last sync fetch fail", e) }
  }

  const fetchNewsEngineStatus = async () => {
    try {
      const res = await fetch("/api/admin/news-engine-status")
      const data = await res.json()
      if (!data.error) setNewsEngineStatus(data)
    } catch (e) { console.error("News engine status fetch fail", e) }
  }

  const fetchAiPrompts = async () => {
    try {
      const res = await fetch("/api/admin/ai-prompts")
      const data = await res.json()
      if (Array.isArray(data.prompts)) setAiPrompts(data.prompts)
    } catch (e) { console.error("AI prompt fetch fail", e) }
  }

  // --- NEWS ENGINE V2 ACTIONS ---
  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams();
      if (issueCategoryFilter) params.set('category', issueCategoryFilter);
      if (issueSearch) params.set('search', issueSearch);
      const res = await fetch(`/api/admin/issues?${params.toString()}`);
      const data = await res.json();
      if (data.success) setIssues(data.issues || []);
    } catch (e) { console.error('Issue fetch fail', e); }
  }

  const handleIngest = async () => {
    if (!selectedIssue || !ingestForm.title) return;
    setIngestLoading(true); setIngestResult(null);
    try {
      const res = await fetch('/api/admin/issues/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedIssue.id,
          type: ingestType,
          ...ingestForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIngestResult({ success: true, message: data.message });
        setIngestForm({ title: '', url: '', source: '', contentType: 'NEWS', author: '', rawContent: '', publishedAt: '' });
        setRecentIngestions(prev => [{ id: data.id, type: ingestType, title: ingestForm.title, linkedTo: data.linkedTo, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
        fetchIssues(); // Refresh counts
      } else {
        setIngestResult({ success: false, message: data.error });
      }
    } catch (e) {
      setIngestResult({ success: false, message: 'Network error' });
    }
    setIngestLoading(false);
  }

  const fetchTestPacks = async () => {
    try {
      const res = await fetch('/api/admin/tests');
      const data = await res.json();
      if (data.success) setTestPacks(data.testPacks || []);
    } catch (e) { console.error('Test fetch fail', e); }
  }

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (questionSearch) params.set('search', questionSearch);
      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      if (data.success) setQuestions(data.questions || []);
    } catch (e) { console.error('Question fetch fail', e); }
  }

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questionForm,
          issueId: questionForm.issueId || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Question Created Successfully.");
        setQuestionForm({ text: '', options: [{label:'a', text:''}, {label:'b', text:''}, {label:'c', text:''}, {label:'d', text:''}], correctLabel: 'a', explanation: '', difficulty: 'MEDIUM', gsPaper: '', issueId: '' });
        setIsCreatingQuestion(false);
        fetchQuestions();
      }
    } catch (e) { setStatus("Failed to create question."); }
    setLoading(false);
  }


  const handleGoogleSheetQuestionSync = () => {
    if (!questionSheetUrl) return;
    setLoading(true);
    setStatus("Syncing Questions from Google Sheet...");

    Papa.parse(questionSheetUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      error: (err) => {
        setStatus(`Sheet Error: ${err.message}. Ensure CSV link is correct.`);
        setLoading(false);
      },
      complete: async (results) => {
        const mappedQuestions = results.data.map(q => {
          const linkedIssue = issues.find(i => i.slug === q.issue_slug);
          return {
            text: q.text,
            options: [
              { label: 'a', text: q.option_a },
              { label: 'b', text: q.option_b },
              { label: 'c', text: q.option_c },
              { label: 'd', text: q.option_d }
            ],
            correctLabel: (q.correct_label || 'a').toLowerCase(),
            explanation: q.explanation || '',
            difficulty: q.difficulty || 'MEDIUM',
            gsPaper: q.gs_paper,
            issueId: linkedIssue?.id || null,
            tags: q.tags ? q.tags.split(',').map(t => t.trim()) : []
          };
        });

        try {
          const res = await fetch('/api/admin/questions/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: mappedQuestions })
          });
          const data = await res.json();
          if (data.success) {
            setStatus(data.message);
            fetchQuestions();
          } else {
            setStatus(`Import Error: ${data.error}`);
          }
        } catch (err) {
          setStatus("Network error during bulk import.");
        }
        setLoading(false);
      }
    });
  }

  const downloadQuestionTemplate = () => {
    const a = document.createElement('a');
    a.href = '/templates/questions_template.csv';
    a.download = 'upsc_questions_template.csv';
    a.click();
  }

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...testForm, 
          issueId: testForm.issueId || null,
          questions: [] 
        }) // Start with empty test, add questions later
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Test Pack Created Successfully.");
        setTestForm({ title: '', description: '', type: 'PRACTICE', durationMins: 0, passingScore: 70, issueId: '' });
        setIsCreatingTest(false);
        fetchTestPacks();
      }
    } catch (e) { setStatus("Failed to create test."); }
    setLoading(false);
  }

  const handleUpdateTestQuestions = async (testId, questionIds) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: testId, questionIds })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Test Pack Questions Updated.");
        fetchTestPacks();
        // Refresh the selected pack details
        const refreshedRes = await fetch(`/api/admin/tests?id=${testId}`);
        const refreshedData = await refreshedRes.json();
        if (refreshedData.success) setSelectedTestPack(refreshedData.testPack);
      }
    } catch (e) { setStatus("Failed to update test pack."); }
    setLoading(false);
  }

  useEffect(() => {
    const initAdmin = async () => {
      setLoading(true);
      await fetchEntries();
      if (session?.user?.role === 'ADMIN') {
        await Promise.all([
          fetchUsers(),
          fetchPaymentStats(),
          fetchLastSync(),
          fetchConfigs(),
          fetchNewsEngineStatus(),
          fetchAiPrompts(),
          fetchIssues(),
          fetchTestPacks(),
          fetchQuestions()
        ]);
      }
      setLoading(false);
    };
    
    initAdmin();
  }, [session])

  // Debounced issue search
  useEffect(() => {
    if (activeTab === 'newsv2') {
      const t = setTimeout(() => fetchIssues(), 300);
      return () => clearTimeout(t);
    }
  }, [issueSearch, issueCategoryFilter, activeTab])

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

  const handleSaveConfig = async (key, value) => {
    setLoading(true); setStatus(`Saving setting: ${key}...`);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        body: JSON.stringify({ key, value }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) setStatus(`Platform Setting Updated: ${key}`);
    } catch (e) { setStatus("Failed to save config."); }
    setLoading(false);
  }

  const handleSheetSync = (doGeocode = false) => {
    if (!sheetUrl) return;
    const isAiSync = doGeocode || autoGeocode;
    setLoading(true); 
    setStatus(isAiSync ? `AI is identifying & syncing ${importModule} locations...` : `Syncing ${importModule} Data...`);
    
    Papa.parse(sheetUrl, {
      download: true, header: true, skipEmptyLines: true,
      error: (err) => {
        console.error("Papa Parse Error:", err);
        setStatus(`Sheet Error: ${err.message}. Make sure the CSV is 'Published to the web'.`);
        setLoading(false);
      },
      complete: async (results) => {
        if (!results.data || results.data.length === 0) {
          console.warn("No data found in sheet.", results);
          setStatus("Sheet Sync Failed: No rows found in the CSV.");
          setLoading(false);
          return;
        }
        
        // Tag all entries with the selected module
        const taggedEntries = results.data.map(e => ({ ...e, worldPart: importModule }));
        
        try {
          const res = await fetch("/api/entries/bulk", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              entries: taggedEntries,
              autoGeocode: isAiSync,
              worldPart: importModule
            })
          })
          
          if (res.ok) { 
            setStatus(`${importModule} ${isAiSync ? 'AI Discovery' : 'Sync'} Complete!`); 
            fetchEntries(); 
          } else {
            const errorData = await res.json();
            console.error("Bulk API Full Error Payload:", errorData);
            setStatus(`Import failed: ${errorData.details || errorData.error || 'Check server logs for details'}`);
          }
        } catch (e) {
          console.error("Network Error during bulk sync:", e);
          setStatus("Network error during sync.");
        }
        setLoading(false);
      }
    });
  }

  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ ATTENTION: This will PERMANENTLY delete ALL map entries. This action cannot be undone. Are you absolutely sure?")) return;
    if (!window.confirm("FINAL CONFIRMATION: Wipe the entire strategic database?")) return;
    
    setLoading(true); setStatus("Wiping Global Registry...");
    try {
      const res = await fetch("/api/entries/bulk", { method: "DELETE" });
      if (res.ok) {
        setStatus("Strategic Database Wiped Successfully.");
        fetchEntries();
      } else {
        setStatus("Wipe Failed: Check server logs.");
      }
    } catch (e) {
      setStatus("Network error during wipe.");
    }
    setLoading(false);
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
        fetchLastSync();
        fetchNewsEngineStatus();
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
          {sidebarItem("newsv2", <Newspaper size={20}/>, "News Engine V2")}
          {sidebarItem("questions", <HelpCircle size={20}/>, "Question Bank")}
          {sidebarItem("tests", <Trophy size={20}/>, "Test Administration")}
          {sidebarItem("ai", <BrainCircuit size={20}/>, "AI Prompt Control")}
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: '#3b82f6' }}>Bulk Mapping Engine</h2>
                <div style={{ background: '#eff6ff', padding: '24px', borderRadius: '20px', border: '1px solid #bfdbfe', marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', display: 'block', marginBottom: '12px' }}>SELECT SUB-MODULE TARGET</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {['POLITICAL', 'PHYSICAL', 'NEWS'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setImportModule(m)}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem',
                          background: importModule === m ? '#3b82f6' : 'white',
                          color: importModule === m ? 'white' : '#64748b',
                          transition: 'all 0.2s'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <input placeholder="Paste Google Sheet CSV URL here..." value={sheetUrl} onChange={e=>setSheetUrl(e.target.value)} style={{ width: '100%', padding:'14px', borderRadius:'12px', border: '1px solid #cbd5e1', marginBottom:'16px' }} />
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleSheetSync(false)} disabled={loading} style={{ flex: 1, padding: '14px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                      Standard Sync
                    </button>
                    <button onClick={() => handleSheetSync(true)} disabled={loading} style={{ flex: 1.5, ...btnPrimary, padding: '14px' }}>
                      <Zap size={16}/> AI Geocode & Sync
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '16px', fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>
                    💡 Tip: If you don&apos;t have Lat/Lon, use <b>AI Geocode</b>. It will find coordinates and hierarchy automatically.
                  </div>

                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
                    <button 
                      onClick={handleDeleteAll} 
                      disabled={loading}
                      style={{ 
                        width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #fee2e2',
                        background: '#fef2f2', color: '#ef4444', fontWeight: 800, fontSize: '0.75rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <Trash2 size={16}/> Wipe Global Registry (Nuclear)
                    </button>
                  </div>
                </div>

                <div style={cardStyle}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', display:'flex', alignItems:'center', gap:'12px' }}><PlusCircle size={22} color="#3b82f6"/> {editingId ? "Edit Node" : "Individual Form"}</h2>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <input placeholder="Country / Name" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} style={{ flex: 2, padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0' }} />
                      <input placeholder="Capital" value={formData.capital} onChange={e=>setFormData({...formData, capital: e.target.value})} style={{ flex: 1, padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0' }} />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <input placeholder="Continent" value={formData.continent} onChange={e=>setFormData({...formData, continent: e.target.value})} style={{ padding:'12px', borderRadius:'12px', border: '1px solid #e2e8f0' }} />
                      <input placeholder="Adm. Region" value={formData.admRegion} onChange={e=>setFormData({...formData, admRegion: e.target.value})} style={{ padding:'12px', borderRadius:'12px', border: '1px solid #e2e8f0' }} />
                      <input placeholder="Geo-Political Group" value={formData.geoGroup} onChange={e=>setFormData({...formData, geoGroup: e.target.value})} style={{ padding:'12px', borderRadius:'12px', border: '1px solid #e2e8f0' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <input placeholder="Lat" type="number" step="any" value={formData.lat} onChange={e=>setFormData({...formData, lat: e.target.value})} style={{ flex:1, padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0' }} />
                      <input placeholder="Lon" type="number" step="any" value={formData.lon} onChange={e=>setFormData({...formData, lon: e.target.value})} style={{ flex:1, padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0' }} />
                    </div>
                    
                    <button type="submit" disabled={loading} style={{ padding: '18px', background: '#3b82f6', color: 'white', borderRadius: '16px', border:'none', cursor: 'pointer', fontWeight: 800 }}>
                      {editingId ? "Save Changes" : "Create Node"}
                    </button>
                  </form>
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

              {lastSync && (
                <div style={{ marginTop: '32px', padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Last Successful Sync</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{new Date(lastSync.createdAt).toLocaleString()}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{lastSync.details}</div>
                    </div>
                    <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>ACTIVE</div>
                  </div>
                </div>
              )}

              {newsEngineStatus && (
                <div style={{ marginTop: '24px', padding: '24px', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.05em' }}>Engine Status Snapshot</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '18px' }}>
                    {[
                      ['Articles', newsEngineStatus.stats.newsArticleCount],
                      ['Facts', newsEngineStatus.stats.newsFactCount],
                      ['Editorials', newsEngineStatus.stats.editorialCount],
                      ['Map Links', newsEngineStatus.stats.mapEntriesWithNews],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, marginBottom: '6px' }}>{label}</div>
                        <div style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 900 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ padding: '14px', borderRadius: '14px', background: newsEngineStatus.assessment.structuredPipelineHealthy ? '#ecfdf5' : '#fff7ed', color: newsEngineStatus.assessment.structuredPipelineHealthy ? '#166534' : '#9a3412' }}>
                      <div style={{ fontWeight: 800 }}>Structured news engine</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        {newsEngineStatus.assessment.structuredPipelineHealthy
                          ? `Working with stored articles/facts. Last structured sync: ${newsEngineStatus.latestStructuredSync ? new Date(newsEngineStatus.latestStructuredSync.createdAt).toLocaleString() : 'unknown'}`
                          : 'Not fully healthy yet. The structured NewsArticle/NewsFact pipeline has little or no stored output.'}
                      </div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '14px', background: newsEngineStatus.assessment.manualScraperHealthy ? '#eff6ff' : '#f8fafc', color: newsEngineStatus.assessment.manualScraperHealthy ? '#1d4ed8' : '#475569' }}>
                      <div style={{ fontWeight: 800 }}>Manual scrape engine</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        {newsEngineStatus.latestManualScrape
                          ? `Last admin scrape: ${new Date(newsEngineStatus.latestManualScrape.createdAt).toLocaleString()}`
                          : 'No manual scrape run has been logged yet.'}
                      </div>
                    </div>
                    {newsEngineStatus.latestNewsArticle && (
                      <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc', color: '#334155' }}>
                        <div style={{ fontWeight: 800 }}>Latest stored article</div>
                        <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{newsEngineStatus.latestNewsArticle.title}</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#64748b' }}>
                          {newsEngineStatus.latestNewsArticle.source} · Published {new Date(newsEngineStatus.latestNewsArticle.publishedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'newsv2' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
            {/* LEFT: Issue Picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section style={cardStyle}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <BookOpen size={24} color="#8b5cf6" /> Issue Graph
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Select an Issue node to attach content to.</p>

                {/* Category Filter */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {['', 'POLITY', 'GOVERNANCE', 'ECONOMY', 'SOCIETY', 'ENVIRONMENT', 'SCIENCE_TECHNOLOGY', 'INTERNATIONAL_RELATIONS', 'INTERNAL_SECURITY', 'HISTORY', 'GEOGRAPHY', 'CULTURE', 'ETHICS', 'AGRICULTURE'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setIssueCategoryFilter(cat)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
                        background: issueCategoryFilter === cat ? '#8b5cf6' : '#f1f5f9',
                        color: issueCategoryFilter === cat ? 'white' : '#64748b',
                        transition: 'all 0.15s'
                      }}
                    >
                      {cat || 'ALL'}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    placeholder="Search 545 Issue nodes..."
                    value={issueSearch}
                    onChange={e => setIssueSearch(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Issue List */}
                <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {issues.slice(0, 50).map(issue => (
                    <button
                      key={issue.id}
                      onClick={() => { setSelectedIssue(issue); setIngestResult(null); }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', padding: '12px 14px',
                        borderRadius: '12px', border: selectedIssue?.id === issue.id ? '2px solid #8b5cf6' : '1px solid #f1f5f9',
                        background: selectedIssue?.id === issue.id ? '#f5f3ff' : 'white',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>{issue.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 700, marginTop: '4px' }}>
                          {issue.gsPapers.join(', ')} · {issue.domain}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>{issue.topic}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
                        {issue._count.articles > 0 && <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#2563eb', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>{issue._count.articles}A</span>}
                        {issue._count.editorials > 0 && <span style={{ fontSize: '0.65rem', background: '#fce7f3', color: '#db2777', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>{issue._count.editorials}E</span>}
                      </div>
                    </button>
                  ))}
                  {issues.length > 50 && (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                      Showing 50 of {issues.length} — refine your search
                    </div>
                  )}
                  {issues.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No issues found.</div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT: Ingestion Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Selected Issue Banner */}
              {selectedIssue ? (
                <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', borderRadius: '24px', padding: '24px 28px', color: 'white' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.7, letterSpacing: '0.1em', marginBottom: '8px' }}>INGESTING TO</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.3 }}>{selectedIssue.title}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '6px' }}>
                    {selectedIssue.gsPapers.join(', ')} · {selectedIssue.domain} · {selectedIssue.topic}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>{selectedIssue._count.articles} Articles</span>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>{selectedIssue._count.editorials} Editorials</span>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>{selectedIssue.nodeType}</span>
                  </div>
                </div>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px', border: '2px dashed #e2e8f0' }}>
                  <BookOpen size={40} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                  <div style={{ color: '#94a3b8', fontWeight: 600 }}>Select an Issue from the left panel to begin ingestion</div>
                </div>
              )}

              {/* Ingestion Form */}
              {selectedIssue && (
                <section style={cardStyle}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <PlusCircle size={20} color="#8b5cf6" /> Add Content
                  </h3>

                  {/* Type Toggle */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                    {['ARTICLE', 'EDITORIAL'].map(t => (
                      <button
                        key={t}
                        onClick={() => setIngestType(t)}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                          background: ingestType === t ? 'white' : 'transparent',
                          color: ingestType === t ? '#7c3aed' : '#64748b',
                          boxShadow: ingestType === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        {t === 'ARTICLE' ? '📰 Article / News' : '📝 Editorial / Opinion'}
                      </button>
                    ))}
                  </div>

                  {/* Form Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Title */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>TITLE *</label>
                      <input
                        placeholder={ingestType === 'ARTICLE' ? 'Article headline...' : 'Editorial title...'}
                        value={ingestForm.title}
                        onChange={e => setIngestForm({...ingestForm, title: e.target.value})}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.92rem', fontWeight: 600 }}
                      />
                    </div>

                    {/* URL + Source */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>URL</label>
                        <div style={{ position: 'relative' }}>
                          <Link2 size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input
                            placeholder="https://..."
                            value={ingestForm.url}
                            onChange={e => setIngestForm({...ingestForm, url: e.target.value})}
                            style={{ width: '100%', padding: '12px 12px 12px 34px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>SOURCE</label>
                        <select
                          value={ingestForm.source}
                          onChange={e => setIngestForm({...ingestForm, source: e.target.value})}
                          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', background: 'white' }}
                        >
                          <option value="">Select source...</option>
                          <option value="The Hindu">The Hindu</option>
                          <option value="Indian Express">Indian Express</option>
                          <option value="PIB">PIB</option>
                          <option value="Livemint">Livemint</option>
                          <option value="Economic Times">Economic Times</option>
                          <option value="EPW">EPW</option>
                          <option value="Down to Earth">Down to Earth</option>
                          <option value="Frontline">Frontline</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Content Type (Article) / Author (Editorial) + Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {ingestType === 'ARTICLE' ? (
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>CONTENT TYPE</label>
                          <select
                            value={ingestForm.contentType}
                            onChange={e => setIngestForm({...ingestForm, contentType: e.target.value})}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', background: 'white' }}
                          >
                            <option value="NEWS">News</option>
                            <option value="PIB">PIB Release</option>
                            <option value="REPORT">Report</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>AUTHOR</label>
                          <div style={{ position: 'relative' }}>
                            <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                              placeholder="Author name..."
                              value={ingestForm.author}
                              onChange={e => setIngestForm({...ingestForm, author: e.target.value})}
                              style={{ width: '100%', padding: '12px 12px 12px 34px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>PUBLISHED DATE</label>
                        <input
                          type="date"
                          value={ingestForm.publishedAt}
                          onChange={e => setIngestForm({...ingestForm, publishedAt: e.target.value})}
                          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    {/* Raw Content */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>RAW CONTENT (Optional — for AI processing)</label>
                      <textarea
                        placeholder="Paste the full article/editorial text here. AI will process this into structured analysis..."
                        value={ingestForm.rawContent}
                        onChange={e => setIngestForm({...ingestForm, rawContent: e.target.value})}
                        style={{ width: '100%', minHeight: '160px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical' }}
                      />
                    </div>

                    {/* Result Message */}
                    {ingestResult && (
                      <div style={{
                        padding: '14px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: ingestResult.success ? '#ecfdf5' : '#fef2f2',
                        color: ingestResult.success ? '#166534' : '#991b1b',
                        border: `1px solid ${ingestResult.success ? '#bbf7d0' : '#fecaca'}`,
                      }}>
                        {ingestResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {ingestResult.message}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleIngest}
                      disabled={ingestLoading || !ingestForm.title}
                      style={{
                        ...btnPrimary,
                        padding: '16px',
                        fontSize: '1rem',
                        background: ingestLoading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                        opacity: !ingestForm.title ? 0.5 : 1,
                      }}
                    >
                      {ingestLoading ? 'Ingesting...' : `Ingest ${ingestType === 'ARTICLE' ? 'Article' : 'Editorial'}`}
                    </button>
                  </div>
                </section>
              )}

              {/* Recent Ingestions */}
              {recentIngestions.length > 0 && (
                <section style={cardStyle}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} color="#10b981" /> Recent Ingestions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recentIngestions.map((item, i) => (
                      <div key={i} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{item.title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>→ {item.linkedTo}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.65rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 700,
                            background: item.type === 'ARTICLE' ? '#dbeafe' : '#fce7f3',
                            color: item.type === 'ARTICLE' ? '#2563eb' : '#db2777'
                          }}>{item.type}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <BrainCircuit size={28} color="#3b82f6" /> AI Prompt Control
              </h2>
              <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '24px' }}>
                Every prompt below is tied to a real AI interaction in the app. Edit the prompt, save it, and the corresponding feature will use the new prompt on the next request.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {aiPrompts.map((prompt) => (
                  <div key={prompt.id} style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{prompt.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 800, marginTop: '4px' }}>{prompt.area}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>{prompt.description}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>{prompt.location}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: prompt.hasOverride ? '#16a34a' : '#64748b', whiteSpace: 'nowrap' }}>
                        {prompt.hasOverride ? 'CUSTOM OVERRIDE' : 'DEFAULT PROMPT'}
                      </div>
                    </div>
                    <textarea
                      value={prompt.value}
                      onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
                      style={{ width: '100%', minHeight: '220px', padding: '18px', borderRadius: '16px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '14px' }}
                    />
                    <button
                      onClick={() => handlePromptSave(prompt)}
                      disabled={savingPromptId === prompt.id}
                      style={{ ...btnPrimary, padding: '14px 20px', minWidth: '180px' }}
                    >
                      {savingPromptId === prompt.id ? 'Saving...' : 'Save Prompt'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
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

        {activeTab === 'questions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Bulk Ingestion</h2>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                <Globe size={40} style={{ margin: '0 auto 16px', color: '#94a3b8' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px' }}>Google Sheet Integration</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>Paste the <b>Published CSV URL</b> of your Google Sheet. It must have standard headers (text, option_a, etc.)</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    placeholder="Paste Google Sheet CSV URL here..." 
                    value={questionSheetUrl} 
                    onChange={e=>setQuestionSheetUrl(e.target.value)} 
                    style={{ width: '100%', padding:'14px', borderRadius:'12px', border: '1px solid #cbd5e1' }} 
                  />
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button 
                      onClick={handleGoogleSheetQuestionSync}
                      disabled={loading || !questionSheetUrl}
                      style={{ ...btnPrimary, padding: '12px 24px', flex: 1 }}
                    >
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync From Sheet
                    </button>
                    <button 
                      onClick={downloadQuestionTemplate}
                      style={{ background: 'white', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '12px', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <FileText size={16} /> Schema Template
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Question Creator</h2>
                <form onSubmit={handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <textarea required placeholder="Question Text..." value={questionForm.text} onChange={e=>setQuestionForm({...questionForm, text: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0', minHeight: '100px' }} />
                
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{opt.label}</div>
                    <input required placeholder={`Option ${opt.label}...`} value={opt.text} onChange={e => {
                      const newOpts = [...questionForm.options];
                      newOpts[idx].text = e.target.value;
                      setQuestionForm({...questionForm, options: newOpts});
                    }} style={{ flex: 1, padding:'10px', borderRadius:'10px', border: '1px solid #e2e8f0' }} />
                  </div>
                ))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <select value={questionForm.correctLabel} onChange={e=>setQuestionForm({...questionForm, correctLabel: e.target.value})} style={{ padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0' }}>
                    <option value="a">Correct: A</option><option value="b">Correct: B</option><option value="c">Correct: C</option><option value="d">Correct: D</option>
                  </select>
                  <select value={questionForm.difficulty} onChange={e=>setQuestionForm({...questionForm, difficulty: e.target.value})} style={{ padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0' }}>
                    <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                  </select>
                </div>

                <textarea placeholder="Explanation / Mission Debrief..." value={questionForm.explanation} onChange={e=>setQuestionForm({...questionForm, explanation: e.target.value})} style={{ padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0', minHeight: '80px' }} />
                
                <button type="submit" disabled={loading} style={{ ...btnPrimary, padding: '18px' }}>Save to Bank</button>
              </form>
            </div>
            </section>

            <section style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Question Bank</h2>
                <input placeholder="Search questions..." value={questionSearch} onChange={e=>setQuestionSearch(e.target.value)} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions.map(q => (
                  <div key={q.id} style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>{q.text}</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>{q.difficulty}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6' }}>{q.correctLabel.toUpperCase()}</span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>IN {q._count.testPacks} PACKS</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tests' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
            {/* Create Test Section */}
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display:'flex', alignItems:'center', gap:'12px' }}>
                <PlusCircle size={22} color="#3b82f6"/> Create Test Pack
              </h2>
              <form onSubmit={handleCreateTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input required placeholder="Test Title (e.g. GS1 Geography Foundation)" value={testForm.title} onChange={e=>setTestForm({...testForm, title: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0' }} />
                <textarea placeholder="Test Description..." value={testForm.description} onChange={e=>setTestForm({...testForm, description: e.target.value})} style={{ padding:'16px', borderRadius:'14px', border: '1px solid #e2e8f0', minHeight: '100px' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <select value={testForm.type} onChange={e=>setTestForm({...testForm, type: e.target.value})} style={{ padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0' }}>
                    <option value="PRACTICE">Practice (Learning)</option>
                    <option value="MOCK">Mock (Simulation)</option>
                  </select>
                  <input placeholder="Duration (mins)" type="number" value={testForm.durationMins} onChange={e=>setTestForm({...testForm, durationMins: e.target.value})} style={{ padding:'14px', borderRadius:'12px', border: '1px solid #e2e8f0' }} />
                </div>
                
                <button type="submit" disabled={loading} style={{ ...btnPrimary, padding: '18px' }}>
                  Generate Test Pack
                </button>
              </form>
            </section>

            {/* List Section */}
            <section style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Existing Test Packs</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {testPacks.map(tp => (
                  <div key={tp.id} style={{ 
                    padding: '20px', background: '#f8fafc', borderRadius: '20px', border: selectedTestPack?.id === tp.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }} onClick={async () => {
                    const res = await fetch(`/api/admin/tests?id=${tp.id}`);
                    const data = await res.json();
                    if (data.success) setSelectedTestPack(data.testPack);
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{tp.title}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', marginTop: '4px', textTransform: 'uppercase' }}>
                          {tp.type} · {tp._count.questions} QUESTIONS
                        </div>
                      </div>
                      <div style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800 }}>
                        {tp._count.attempts} ATTEMPTS
                      </div>
                    </div>
                    
                    {selectedTestPack?.id === tp.id && (
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>ASSIGNED QUESTIONS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {selectedTestPack.questions.map(q => (
                            <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.text}</span>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                const newIds = selectedTestPack.questions.filter(item => item.id !== q.id).map(item => item.id);
                                handleUpdateTestQuestions(tp.id, newIds);
                              }} style={{ color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={14}/></button>
                            </div>
                          ))}
                          {selectedTestPack.questions.length === 0 && <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No questions assigned.</div>}
                        </div>
                        
                        <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px' }}>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e40af', marginBottom: '12px' }}>ADD FROM BANK</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                            {questions.filter(q => !selectedTestPack.questions.some(item => item.id === q.id)).map(q => (
                              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.text}</span>
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  const newIds = [...selectedTestPack.questions.map(item => item.id), q.id];
                                  handleUpdateTestQuestions(tp.id, newIds);
                                }} style={{ color: '#3b82f6', border: 'none', background: 'transparent', cursor: 'pointer' }}><PlusCircle size={14}/></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {testPacks.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>No test packs created yet.</div>}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
