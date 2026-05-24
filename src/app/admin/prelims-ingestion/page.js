'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  Search, ChevronDown, ChevronRight, Folder, FolderOpen, 
  FileText, Sparkles, Save, Plus, Trash2, Edit3, 
  Trophy, HelpCircle, AlertCircle, BookOpen, Clock, Check, X, ShieldCheck, Code
} from 'lucide-react';
import './prelims-cms.css';

// HTML toolbar template snippets for one-click insertion
const HTML_SNIPPETS = {
  bold: { before: '<strong>', after: '</strong>', label: 'B', title: 'Bold' },
  italic: { before: '<em>', after: '</em>', label: 'I', title: 'Italic' },
  underline: { before: '<u>', after: '</u>', label: 'U', title: 'Underline' },
  heading: { before: '<h3>', after: '</h3>', label: 'H3', title: 'Heading' },
  hlYellow: { before: '<mark class="hl-yellow">', after: '</mark>', label: '🟡', title: 'Highlight Yellow' },
  hlGreen: { before: '<mark class="hl-green">', after: '</mark>', label: '🟢', title: 'Highlight Green' },
  hlBlue: { before: '<mark class="hl-blue">', after: '</mark>', label: '🔵', title: 'Highlight Blue' },
  hlPurple: { before: '<mark class="hl-purple">', after: '</mark>', label: '🟣', title: 'Highlight Purple' },
  cardInfo: { insert: '<div class="card-info">\n<strong>ℹ️ Info</strong>\nYour info text here.\n</div>', label: 'Info', title: 'Info Card' },
  cardWarning: { insert: '<div class="card-warning">\n<strong>⚠️ Warning</strong>\nYour warning text here.\n</div>', label: 'Warn', title: 'Warning Card' },
  cardSuccess: { insert: '<div class="card-success">\n<strong>✅ Key Point</strong>\nYour success text here.\n</div>', label: 'Pass', title: 'Success Card' },
  cardTip: { insert: '<div class="card-tip">\n<strong>💡 Tip</strong>\nYour tip text here.\n</div>', label: 'Tip', title: 'Tip Card' },
  grid2: { insert: '<div class="grid-cols-2">\n<div>\n\n**Column 1**\n\nContent here.\n\n</div>\n<div>\n\n**Column 2**\n\nContent here.\n\n</div>\n</div>', label: '⬜⬜', title: '2-Column Grid' },
  listCustom: { insert: '<ul class="list-custom">\n<li>First item</li>\n<li>Second item</li>\n<li>Third item</li>\n</ul>', label: '◆ List', title: 'Premium List' },
  accordion: { insert: '<details class="disclosure">\n<summary>Click to expand</summary>\n<div>\n\nHidden content goes here.\n\n</div>\n</details>', label: '▸ Fold', title: 'Accordion' },
  table: { insert: '<table class="table-premium">\n<thead><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr></thead>\n<tbody>\n<tr><td>Row 1</td><td>Data</td><td>Data</td></tr>\n<tr><td>Row 2</td><td>Data</td><td>Data</td></tr>\n</tbody>\n</table>', label: '⊞ Table', title: 'Premium Table' },
};

function insertAtCursor(textareaId, snippet, currentValue, setValue) {
  const ta = document.getElementById(textareaId);
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = currentValue.substring(start, end);
  let newText;
  let cursorPos;
  if (snippet.insert) {
    newText = currentValue.substring(0, start) + snippet.insert + currentValue.substring(end);
    cursorPos = start + snippet.insert.length;
  } else {
    const wrapped = snippet.before + (selected || 'text') + snippet.after;
    newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
    cursorPos = start + wrapped.length;
  }
  setValue(newText);
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(cursorPos, cursorPos);
  });
}

const SUBJECT_MAPPING = {
  "Polity & Governance": ["POLITY", "GOVERNANCE"],
  "History & Culture": ["ANCIENT_INDIA", "MEDIEVAL_INDIA", "MODERN_INDIA", "ART_CULTURE", "HISTORY", "CULTURE"],
  "Geography": ["GEOGRAPHY"],
  "Economy & Agriculture": ["ECONOMY", "AGRICULTURE"],
  "Environment & Ecology": ["ENVIRONMENT", "DISASTER_MANAGEMENT"],
  "Science & Technology": ["SCIENCE_TECHNOLOGY"],
  "Current Affairs": ["CURRENT_AFFAIRS", "INTERNATIONAL_RELATIONS", "INTERNAL_SECURITY", "SOCIETY"],
  "CSAT": ["CSAT"]
};

export default function PrelimsCMSPage() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState('nodes'); // 'nodes' or 'tests'

  // Syllabus Nodes states
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Test Pack Center states
  const [globalTestPacks, setGlobalTestPacks] = useState([]);
  const [filteredTestPacks, setFilteredTestPacks] = useState([]);
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [activeTestFilter, setActiveTestFilter] = useState('ALL'); // ALL, SECTIONAL, FULL_LENGTH, TEST_SERIES
  const [selectedTestPack, setSelectedTestPack] = useState(null);
  const [testBankQuestions, setTestBankQuestions] = useState([]);
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Loading States
  const [listLoading, setListLoading] = useState(true);
  const [nodeLoading, setNodeLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Active Tab for Node Workspace
  const [activeTab, setActiveTab] = useState('notes'); // notes, mcqs

  // Tab 1: Notes State
  const [prelimsNote, setPrelimsNote] = useState('');
  const [noteStatus, setNoteStatus] = useState('DRAFT');
  const [editorMode, setEditorMode] = useState('markdown'); // 'markdown' | 'html'
  const [gdocUrl, setGdocUrl] = useState('');

  // Tab 2: MCQ State
  const [mcqList, setMcqList] = useState([]);
  const [mcqForm, setMcqForm] = useState({
    id: null,
    text: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctLabel: 'a',
    explanation: '',
    difficulty: 'MEDIUM',
    tags: ''
  });
  const [aiMcqCount, setAiMcqCount] = useState(5);

  // Test Pack Form State
  const [testForm, setTestForm] = useState({
    id: null,
    title: '',
    description: '',
    type: 'PRACTICE',
    subType: 'SECTIONAL',
    durationMins: 30,
    passingScore: 70,
    negativeMarking: 0.33,
    marksPerQuestion: 2.0,
    sourcing: 'pull', // 'pull', 'forge'
    forgeCount: 10,
    issueId: ''
  });
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Fetch initial directories on mount
  useEffect(() => {
    fetchNodesList();
    fetchGlobalTestPacks();
  }, []);

  const fetchNodesList = async () => {
    setListLoading(true);
    try {
      const res = await fetch('/api/admin/prelims-ingestion?list=true');
      const data = await res.json();
      if (data.success) {
        setNodes(data.issues || []);
        setFilteredNodes(data.issues || []);
      } else {
        toast.error('Failed to retrieve nodes');
      }
    } catch (err) {
      toast.error('Connection error loading nodes');
    } finally {
      setListLoading(false);
    }
  };

  const fetchGlobalTestPacks = async () => {
    try {
      const res = await fetch('/api/admin/tests');
      const data = await res.json();
      if (data.success) {
        setGlobalTestPacks(data.testPacks || []);
        setFilteredTestPacks(data.testPacks || []);
      }
    } catch (err) {
      toast.error('Connection error loading test packs');
    }
  };

  // Filter nodes when search term updates
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = nodes.filter(node => 
      node.title.toLowerCase().includes(term) ||
      node.domain.toLowerCase().includes(term) ||
      node.category.toLowerCase().includes(term)
    );
    setFilteredNodes(filtered);
    
    // Auto expand subjects if searching
    if (term) {
      const autoExpand = {};
      Object.keys(SUBJECT_MAPPING).forEach(sub => {
        autoExpand[sub] = true;
      });
      setExpandedSubjects(autoExpand);
    }
  }, [searchTerm, nodes]);

  // Filter global test packs in Test Pack Center mode
  useEffect(() => {
    const term = testSearchTerm.toLowerCase();
    const filtered = globalTestPacks.filter(tp => {
      const matchesSearch = 
        tp.title.toLowerCase().includes(term) || 
        (tp.description && tp.description.toLowerCase().includes(term));
      
      const matchesCategory = 
        activeTestFilter === 'ALL' || 
        tp.subType === activeTestFilter;
      
      return matchesSearch && matchesCategory;
    });
    setFilteredTestPacks(filtered);
  }, [testSearchTerm, activeTestFilter, globalTestPacks]);

  // Fetch questions for the global question selector in test builder
  const fetchTestBankQuestions = async (issueId) => {
    try {
      let url = '/api/admin/questions?limit=250';
      if (issueId) {
        url += `&issueId=${issueId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTestBankQuestions(data.questions || []);
      }
    } catch (err) {
      toast.error('Failed to load question bank');
    }
  };

  // Sync test builder question catalog whenever associated node/issueId updates
  useEffect(() => {
    if (activeMode === 'tests') {
      fetchTestBankQuestions(testForm.issueId);
    }
  }, [testForm.issueId, activeMode]);

  // Select Node and fetch details (Notes & MCQ Bank only)
  const handleSelectNode = async (node) => {
    setSelectedNode(node);
    setNodeLoading(true);
    // Reset Form states
    setPrelimsNote('');
    setGdocUrl('');
    setMcqList([]);
    resetMcqForm();

    try {
      const res = await fetch(`/api/admin/prelims-ingestion?issueId=${node.id}`);
      const data = await res.json();
      if (data.success) {
        const issueDetails = data.issue;
        setPrelimsNote(issueDetails.nodeContent?.prelimsNote || '');
        setNoteStatus(issueDetails.nodeContent?.status || 'DRAFT');
        setMcqList(issueDetails.questions || []);
      } else {
        toast.error('Failed to load node intelligence');
      }
    } catch (err) {
      toast.error('Connection error fetching node details');
    } finally {
      setNodeLoading(false);
    }
  };

  const toggleSubject = (subject) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  // TAB 1: NOTES HANDLERS
  const handleSaveNotes = async () => {
    if (!selectedNode) return;
    setActionLoading(true);
    const toastId = toast.loading('Syncing notes to database...');
    try {
      const res = await fetch('/api/admin/node-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedNode.id,
          prelimsNote,
          status: noteStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notes successfully synced!', { id: toastId });
        fetchNodesList(); // Refresh sidebar indicators
      } else {
        toast.error(data.error || 'Failed to sync notes', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error saving notes', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGdocIngest = async () => {
    if (!selectedNode || !gdocUrl) return;
    setActionLoading(true);
    const toastId = toast.loading('Ingesting Google Doc markdown...');
    try {
      const res = await fetch('/api/admin/issues/ingest-gdoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docUrl: gdocUrl,
          issueId: selectedNode.id,
          mode: 'PRELIMS'
        })
      });
      const data = await res.json();
      if (data.success) {
        setPrelimsNote(data.markdown);
        toast.success(`Doc ingested! Hosted ${data.imagesProcessed} inline graphics.`, { id: toastId });
        setGdocUrl('');
      } else {
        toast.error(data.error || 'Ingestion failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed connection to Ingestion server', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleForgeNotes = async () => {
    if (!selectedNode) return;
    setActionLoading(true);
    const toastId = toast.loading('AI synthesizing high-yield notes...');
    try {
      const res = await fetch('/api/admin/node-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedNode.id,
          generateType: 'PRELIMS'
        })
      });
      const data = await res.json();
      if (data.aiText) {
        setPrelimsNote(data.aiText);
        toast.success('AI notes draft compiled!', { id: toastId });
      } else {
        toast.error('Failed to generate AI notes', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error during AI notes generation', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // TAB 2: MCQ HANDLERS
  const resetMcqForm = () => {
    setMcqForm({
      id: null,
      text: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctLabel: 'a',
      explanation: '',
      difficulty: 'MEDIUM',
      tags: ''
    });
  };

  const handleSaveMCQ = async (e) => {
    e.preventDefault();
    if (!selectedNode) return;
    
    const { id, text, optA, optB, optC, optD, correctLabel, explanation, difficulty, tags } = mcqForm;
    if (!text || !optA || !optB || !optC || !optD) {
      toast.error('Please fill in the question and all 4 options');
      return;
    }

    setActionLoading(true);
    const isEdit = !!id;
    const toastId = toast.loading(isEdit ? 'Updating MCQ...' : 'Adding MCQ...');

    const payload = {
      text,
      options: [
        { label: 'a', text: optA },
        { label: 'b', text: optB },
        { label: 'c', text: optC },
        { label: 'd', text: optD }
      ],
      correctLabel,
      explanation,
      difficulty,
      issueId: selectedNode.id,
      gsPaper: selectedNode.gsPapers?.[0] || 'GS1',
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    };

    try {
      let res;
      if (isEdit) {
        payload.id = id;
        res = await fetch('/api/admin/questions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? 'MCQ updated!' : 'MCQ created!', { id: toastId });
        resetMcqForm();
        // Refresh question list
        handleSelectNode(selectedNode);
      } else {
        toast.error(data.error || 'Failed to save question', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error saving question', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditMCQ = (q) => {
    const opts = Array.isArray(q.options) ? q.options : JSON.parse(JSON.stringify(q.options || []));
    const optA = opts.find(o => o.label === 'a' || o.label === 'A')?.text || '';
    const optB = opts.find(o => o.label === 'b' || o.label === 'B')?.text || '';
    const optC = opts.find(o => o.label === 'c' || o.label === 'C')?.text || '';
    const optD = opts.find(o => o.label === 'd' || o.label === 'D')?.text || '';

    setMcqForm({
      id: q.id,
      text: q.text,
      optA,
      optB,
      optC,
      optD,
      correctLabel: q.correctLabel || 'a',
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'MEDIUM',
      tags: Array.isArray(q.tags) ? q.tags.join(', ') : ''
    });
    toast.success('MCQ loaded into form editor');
  };

  const handleDeleteMCQ = async (id) => {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;
    setActionLoading(true);
    const toastId = toast.loading('Deleting MCQ from bank...');
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('MCQ deleted!', { id: toastId });
        handleSelectNode(selectedNode);
      } else {
        toast.error(data.error || 'Delete failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Connection error deleting question', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleForgeMCQs = async () => {
    if (!selectedNode) return;
    setActionLoading(true);
    const toastId = toast.loading(`AI setting up ${aiMcqCount} UPSC MCQs...`);
    try {
      const res = await fetch('/api/admin/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedNode.id,
          count: parseInt(aiMcqCount) || 5
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully forged ${data.count} new UPSC MCQs!`, { id: toastId });
        handleSelectNode(selectedNode);
      } else {
        toast.error(data.error || 'AI generation failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error during AI question setting', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // TEST PACK CENTER HANDLERS
  const handleSelectTestPack = async (testPack) => {
    setSelectedTestPack(testPack);
    setTestLoading(true);
    setSelectedQuestionIds([]);
    try {
      const res = await fetch(`/api/admin/tests?id=${testPack.id}`);
      const data = await res.json();
      if (data.success) {
        const tp = data.testPack;
        setTestForm({
          id: tp.id,
          title: tp.title || '',
          description: tp.description || '',
          type: tp.type || 'PRACTICE',
          subType: tp.subType || 'FULL_LENGTH',
          durationMins: tp.durationMins || 30,
          passingScore: tp.passingScore || 70,
          negativeMarking: tp.negativeMarking || 0.33,
          marksPerQuestion: tp.marksPerQuestion || 2.0,
          sourcing: 'pull',
          forgeCount: 10,
          issueId: tp.issueId || ''
        });
        setSelectedQuestionIds(tp.questions?.map(q => q.id) || []);
      } else {
        toast.error('Failed to load test details');
      }
    } catch (err) {
      toast.error('Error loading test pack details');
    } finally {
      setTestLoading(false);
    }
  };

  const handleInitCreateTestPack = () => {
    setSelectedTestPack({ id: 'new' });
    setTestForm({
      id: null,
      title: '',
      description: '',
      type: 'PRACTICE',
      subType: 'SECTIONAL',
      durationMins: 30,
      passingScore: 70,
      negativeMarking: 0.33,
      marksPerQuestion: 2.0,
      sourcing: 'pull',
      forgeCount: 10,
      issueId: ''
    });
    setSelectedQuestionIds([]);
  };

  const handleToggleQuestionSelection = (qid) => {
    setSelectedQuestionIds(prev => 
      prev.includes(qid) ? prev.filter(id => id !== qid) : [...prev, qid]
    );
  };

  const handleSaveTestPack = async (e) => {
    e.preventDefault();
    if (!testForm.title) {
      toast.error('Please enter a test pack title');
      return;
    }

    setActionLoading(true);
    const toastId = toast.loading(testForm.id ? 'Updating test pack...' : 'Building test suite...');

    try {
      let finalQuestionIds = [...selectedQuestionIds];

      // Option A: Forge with AI first (only supported on fresh creations)
      if (testForm.sourcing === 'forge' && !testForm.id) {
        if (testForm.subType === 'SECTIONAL' && !testForm.issueId) {
          throw new Error('Please select an associated Syllabus Node to generate questions.');
        }

        toast.loading(`AI forging ${testForm.forgeCount} test questions...`, { id: toastId });
        const genRes = await fetch('/api/admin/questions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            issueId: testForm.issueId || undefined,
            count: parseInt(testForm.forgeCount) || 10
          })
        });
        const genData = await genRes.json();
        if (genData.success) {
          const generatedIds = genData.questions.map(q => q.id);
          finalQuestionIds = [...finalQuestionIds, ...generatedIds];
          toast.loading('Linking generated questions into test pack...', { id: toastId });
        } else {
          throw new Error(genData.error || 'AI MCQ generation failed');
        }
      }

      // Payload matching Prisma TestPack model
      const testPackPayload = {
        title: testForm.title,
        description: testForm.description,
        type: testForm.type,
        subType: testForm.subType,
        durationMins: parseInt(testForm.durationMins) || 30,
        passingScore: parseInt(testForm.passingScore) || 70,
        negativeMarking: parseFloat(testForm.negativeMarking) || 0.33,
        marksPerQuestion: parseFloat(testForm.marksPerQuestion) || 2.0,
        issueId: testForm.subType === 'SECTIONAL' ? (testForm.issueId || null) : null
      };

      if (testForm.id) {
        // Edit mode
        const updateRes = await fetch('/api/admin/tests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: testForm.id,
            questionIds: finalQuestionIds,
            ...testPackPayload
          })
        });
        const updateData = await updateRes.json();
        if (!updateData.success) {
          throw new Error(updateData.error || 'Failed to update test pack');
        }
        toast.success('Test pack updated successfully!', { id: toastId });
      } else {
        // Create mode
        const createRes = await fetch('/api/admin/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPackPayload)
        });
        const createData = await createRes.json();

        if (!createData.success) {
          throw new Error(createData.error || 'Failed to create test pack');
        }

        // Link question lists
        if (finalQuestionIds.length > 0) {
          const linkRes = await fetch('/api/admin/tests', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: createData.id,
              questionIds: finalQuestionIds
            })
          });
          const linkData = await linkRes.json();
          if (!linkData.success) {
            throw new Error('Test created, but failed to link selected questions.');
          }
        }
        toast.success('Test suite deployed successfully!', { id: toastId });
      }

      // Reload
      fetchGlobalTestPacks();
      handleInitCreateTestPack();
    } catch (err) {
      toast.error(err.message || 'Error occurred building test suite', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTestPack = async (id) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this test pack? This will permanently erase it.')) return;

    setActionLoading(true);
    const toastId = toast.loading('Deleting test pack...');
    try {
      const res = await fetch(`/api/admin/tests?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Test pack deleted!', { id: toastId });
        fetchGlobalTestPacks();
        handleInitCreateTestPack();
      } else {
        toast.error(data.error || 'Delete failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Connection error deleting test pack', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="cms-container">
      <Toaster position="top-right" reverseOrder={false} />

      {/* SIDEBAR */}
      <aside className="cms-sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ background: '#6366f1', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ShieldCheck size={18} />
            </div>
            <h1 className="sidebar-title" style={{ margin: 0, fontSize: '1.1rem' }}>Prelims Ingestion</h1>
          </div>
          <p className="sidebar-subtitle">Subject-Wise Fact & Quiz CMS</p>
        </div>

        {/* SIDEBAR MODE SELECTOR */}
        <div className="sidebar-mode-toggle">
          <button 
            className={`mode-btn ${activeMode === 'nodes' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('nodes');
              setSelectedTestPack(null);
            }}
          >
            <BookOpen size={14} /> Syllabus Nodes
          </button>
          <button 
            className={`mode-btn ${activeMode === 'tests' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('tests');
              setSelectedNode(null);
              handleInitCreateTestPack();
            }}
          >
            <Trophy size={14} /> Test Pack Center
          </button>
        </div>

        {activeMode === 'nodes' ? (
          /* SYLLABUS NODES MODE */
          <>
            <div className="sidebar-search">
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search Prelims syllabus..." 
                  style={{ paddingLeft: '36px' }}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="subject-list">
              {listLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', opacity: 0.4, fontSize: '0.85rem' }}>Loading Syllabus Matrix...</div>
              ) : (
                Object.entries(SUBJECT_MAPPING).map(([subjectName, categories]) => {
                  const subjectNodes = filteredNodes
                    .filter(node => categories.includes(node.category))
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

                  if (subjectNodes.length === 0 && searchTerm) return null;

                  const isExpanded = !!expandedSubjects[subjectName];

                  return (
                    <div key={subjectName} className={`subject-folder ${isExpanded ? 'expanded' : ''}`}>
                      <div className="subject-header" onClick={() => toggleSubject(subjectName)}>
                        <div className="subject-header-left">
                          {isExpanded ? <FolderOpen size={16} style={{ color: '#a855f7' }} /> : <Folder size={16} style={{ color: '#6366f1' }} />}
                          <span className="subject-title">{subjectName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="subject-badge">{subjectNodes.length}</span>
                          {isExpanded ? <ChevronDown size={14} style={{ opacity: 0.5 }} /> : <ChevronRight size={14} style={{ opacity: 0.5 }} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="node-sublist">
                          {subjectNodes.map(node => {
                            const status = node.nodeContent?.status;
                            const statusClass = !node.nodeContent?.prelimsNote ? 'empty' : (status === 'PUBLISHED' ? 'published' : 'draft');
                            
                            return (
                              <div 
                                key={node.id} 
                                className={`node-item ${selectedNode?.id === node.id ? 'active' : ''}`}
                                onClick={() => handleSelectNode(node)}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                  <div className={`status-dot ${statusClass}`}></div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="node-name">{node.title}</span>
                                    <span className="node-meta">
                                      {node.domain} • {node._count?.questions || 0} MCQs
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight size={12} style={{ opacity: 0.3, flexShrink: 0 }} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* TEST PACK CENTER MODE */
          <>
            <div className="sidebar-search">
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search test packs..." 
                  style={{ paddingLeft: '36px' }}
                  value={testSearchTerm}
                  onChange={e => setTestSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Subtype Filter Pills */}
            <div className="test-filters">
              {['ALL', 'SECTIONAL', 'FULL_LENGTH', 'TEST_SERIES'].map(filter => (
                <button
                  key={filter}
                  className={`filter-pill ${activeTestFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveTestFilter(filter)}
                >
                  {filter === 'ALL' ? 'All' : filter.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="test-list-scroll">
              {filteredTestPacks.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', opacity: 0.4, fontSize: '0.85rem' }}>No test packs found</div>
              ) : (
                filteredTestPacks.map(tp => (
                  <div
                    key={tp.id}
                    className={`test-item ${selectedTestPack?.id === tp.id ? 'active' : ''}`}
                    onClick={() => handleSelectTestPack(tp)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="test-item-title">{tp.title}</span>
                      <div className="test-item-meta">
                        <span className={`test-subtype-badge ${(tp.subType || 'FULL_LENGTH').toLowerCase()}`}>
                          {(tp.subType || 'FULL_LENGTH').replace('_', ' ')}
                        </span>
                        <span>• {tp._count?.questions || 0} Qs</span>
                        {tp.durationMins > 0 && <span>• {tp.durationMins}m</span>}
                      </div>
                    </div>
                    <ChevronRight size={12} style={{ opacity: 0.3 }} />
                  </div>
                ))
              )}
            </div>

            <div className="create-test-btn-container">
              <button 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleInitCreateTestPack}
              >
                <Plus size={16} /> Create Test Pack
              </button>
            </div>
          </>
        )}
      </aside>

      {/* MAIN WORKSPACE SCREEN */}
      <main className="cms-main">
        {activeMode === 'nodes' ? (
          /* SYLLABUS NODE WORKSPACE */
          selectedNode ? (
            <>
              {/* TOOLBAR HEADER */}
              <div className="cms-toolbar">
                <div className="toolbar-title-section">
                  <span className="toolbar-breadcrumbs">Syllabus Node: {selectedNode.category}</span>
                  <h2 className="toolbar-title">{selectedNode.title}</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="tab-nav">
                    <button 
                      className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                      onClick={() => setActiveTab('notes')}
                    >
                      <BookOpen size={14} /> Notes Ingestion
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'mcqs' ? 'active' : ''}`}
                      onClick={() => setActiveTab('mcqs')}
                    >
                      <HelpCircle size={14} /> MCQ Bank ({mcqList.length})
                    </button>
                  </div>

                  {activeTab === 'notes' && (
                    <button 
                      className="btn-primary" 
                      onClick={handleSaveNotes}
                      disabled={actionLoading}
                    >
                      <Save size={16} /> Sync Notes
                    </button>
                  )}
                </div>
              </div>

              {/* SCROLLABLE WORKSPACE CONTENT */}
              <div className="cms-workspace">
                {nodeLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
                    <div style={{ textAlign: 'center', opacity: 0.5 }}>
                      <div style={{ animation: 'spin 1s infinite linear', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 12px' }}></div>
                      <span>Fetching database records...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* TAB 1: NOTES WORKSPACE */}
                    {activeTab === 'notes' && (
                      <div className="notes-workspace">
                        {/* Left: Input / Edit / Ingest */}
                        <div className="notes-editor-pane">
                          <div className="pane-header">
                            <span>Syllabus Facts Editor</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.7rem' }}>Status:</span>
                              <select 
                                value={noteStatus}
                                onChange={e => setNoteStatus(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', borderRadius: '6px', color: 'white', padding: '2px 6px', fontSize: '0.7rem' }}
                              >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                              </select>
                            </div>
                          </div>

                          {/* Google Doc Integration */}
                          <div style={{ background: 'rgba(99, 102, 241, 0.04)', border: '1px dashed rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                              <FileText size={14} /> IMPORT HIGH-YIELD NOTES FROM GOOGLE DOC
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Paste shared Google Doc URL here..." 
                                style={{ flex: 1, height: '36px', background: 'rgba(0,0,0,0.2)' }}
                                value={gdocUrl}
                                onChange={e => setGdocUrl(e.target.value)}
                              />
                              <button 
                                className="btn-primary" 
                                style={{ height: '36px', marginTop: 0 }}
                                onClick={handleGdocIngest}
                                disabled={actionLoading || !gdocUrl}
                              >
                                Pull Doc
                              </button>
                            </div>
                            <span style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                              Link must have "Anyone with link can view" enabled. Inline charts are automatically archived.
                            </span>
                          </div>

                          {/* AI Generate Notes Prompt */}
                          <div style={{ marginBottom: '16px' }}>
                            <button 
                              className="btn-secondary" 
                              style={{ width: '100%', justifyContent: 'center' }}
                              onClick={handleForgeNotes}
                              disabled={actionLoading}
                            >
                              <Sparkles size={16} style={{ color: '#a855f7' }} /> AI Synthesis (Draft Core Notes)
                            </button>
                          </div>

                          {/* Editor Mode Toggle */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <button
                              onClick={() => setEditorMode('markdown')}
                              style={{
                                flex: 1, padding: '7px 0', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3px', transition: 'all 0.2s',
                                background: editorMode === 'markdown' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                color: editorMode === 'markdown' ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                                boxShadow: editorMode === 'markdown' ? '0 0 12px rgba(99,102,241,0.15)' : 'none'
                              }}
                            >
                              <Edit3 size={12} style={{ marginRight: '5px', verticalAlign: '-2px' }} /> Markdown
                            </button>
                            <button
                              onClick={() => setEditorMode('html')}
                              style={{
                                flex: 1, padding: '7px 0', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3px', transition: 'all 0.2s',
                                background: editorMode === 'html' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                                color: editorMode === 'html' ? '#d8b4fe' : 'rgba(255,255,255,0.4)',
                                boxShadow: editorMode === 'html' ? '0 0 12px rgba(168,85,247,0.15)' : 'none'
                              }}
                            >
                              <Code size={12} style={{ marginRight: '5px', verticalAlign: '-2px' }} /> HTML
                            </button>
                          </div>

                          {/* HTML Formatting Toolbar */}
                          {editorMode === 'html' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px', padding: '10px', background: 'rgba(168, 85, 247, 0.04)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '10px' }}>
                              {/* Text Formatting */}
                              <span style={{ fontSize: '0.6rem', color: '#a855f7', fontWeight: 700, width: '100%', marginBottom: '2px' }}>TEXT</span>
                              {['bold','italic','underline','heading'].map(k => (
                                <button key={k} title={HTML_SNIPPETS[k].title} onClick={() => insertAtCursor('prelims-note-editor', HTML_SNIPPETS[k], prelimsNote, setPrelimsNote)}
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e2e8f0', cursor: 'pointer', transition: 'all 0.15s' }}
                                >{HTML_SNIPPETS[k].label}</button>
                              ))}
                              {/* Highlights */}
                              <span style={{ fontSize: '0.6rem', color: '#a855f7', fontWeight: 700, width: '100%', marginTop: '6px', marginBottom: '2px' }}>HIGHLIGHTS</span>
                              {['hlYellow','hlGreen','hlBlue','hlPurple'].map(k => (
                                <button key={k} title={HTML_SNIPPETS[k].title} onClick={() => insertAtCursor('prelims-note-editor', HTML_SNIPPETS[k], prelimsNote, setPrelimsNote)}
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e2e8f0', cursor: 'pointer' }}
                                >{HTML_SNIPPETS[k].label}</button>
                              ))}
                              {/* Callouts */}
                              <span style={{ fontSize: '0.6rem', color: '#a855f7', fontWeight: 700, width: '100%', marginTop: '6px', marginBottom: '2px' }}>CALLOUT CARDS</span>
                              {['cardInfo','cardWarning','cardSuccess','cardTip'].map(k => (
                                <button key={k} title={HTML_SNIPPETS[k].title} onClick={() => insertAtCursor('prelims-note-editor', HTML_SNIPPETS[k], prelimsNote, setPrelimsNote)}
                                  style={{ padding: '4px 10px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e2e8f0', cursor: 'pointer' }}
                                >{HTML_SNIPPETS[k].label}</button>
                              ))}
                              {/* Layout Widgets */}
                              <span style={{ fontSize: '0.6rem', color: '#a855f7', fontWeight: 700, width: '100%', marginTop: '6px', marginBottom: '2px' }}>LAYOUT</span>
                              {['grid2','listCustom','accordion','table'].map(k => (
                                <button key={k} title={HTML_SNIPPETS[k].title} onClick={() => insertAtCursor('prelims-note-editor', HTML_SNIPPETS[k], prelimsNote, setPrelimsNote)}
                                  style={{ padding: '4px 10px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e2e8f0', cursor: 'pointer' }}
                                >{HTML_SNIPPETS[k].label}</button>
                              ))}
                            </div>
                          )}

                          <textarea 
                            id="prelims-note-editor"
                            className="markdown-editor"
                            placeholder={editorMode === 'html' ? 'Write HTML markup with rich formatting tags...' : 'Compose markdown summary node information...'}
                            value={prelimsNote}
                            onChange={e => setPrelimsNote(e.target.value)}
                            style={editorMode === 'html' ? { fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '0.8rem', letterSpacing: '-0.2px' } : {}}
                          />
                        </div>

                        {/* Right: Rendered Preview */}
                        <div className="notes-preview-pane">
                          <div className="pane-header">
                            <span>Live Notes Preview</span>
                            <span style={{ color: editorMode === 'html' ? '#d8b4fe' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {editorMode === 'html' ? <><Code size={12}/> HTML</> : <><Check size={12}/> MD</>}
                            </span>
                          </div>
                          <div className="markdown-preview">
                            {prelimsNote ? (
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {prelimsNote}
                              </ReactMarkdown>
                            ) : (
                              <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '40%' }}>
                                <BookOpen size={48} style={{ margin: '0 auto 12px' }} />
                                <span>Notes markdown text will render here.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: MCQ BANK */}
                    {activeTab === 'mcqs' && (
                      <div className="mcq-workspace">
                        {/* Left: Question List */}
                        <div className="mcq-list-pane">
                          <div className="pane-header" style={{ marginBottom: '12px' }}>
                            <span>Question Catalog ({mcqList.length})</span>
                          </div>

                          {/* AI MCQ Builder Widget */}
                          <div style={{ display: 'flex', gap: '10px', background: 'rgba(168, 85, 247, 0.04)', border: '1px dashed rgba(168, 85, 247, 0.2)', padding: '14px', borderRadius: '12px', marginBottom: '16px', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Sparkles size={14} /> AI MCQ GENERATOR ENGINE
                              </span>
                              <span style={{ fontSize: '0.6rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Generates UPSC fact-heavy questions linked to notes context.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <select 
                                value={aiMcqCount}
                                onChange={e => setAiMcqCount(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'white', padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                <option value="5">5 MCQs</option>
                                <option value="10">10 MCQs</option>
                                <option value="15">15 MCQs</option>
                              </select>
                              <button 
                                className="btn-primary" 
                                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', boxShadow: '0 4px 12px rgba(168,85,247,0.3)' }}
                                onClick={handleForgeMCQs}
                                disabled={actionLoading}
                              >
                                Forge
                              </button>
                            </div>
                          </div>

                          <div className="question-list-scroll">
                            {mcqList.length === 0 ? (
                              <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '30%' }}>
                                <HelpCircle size={48} style={{ margin: '0 auto 12px' }} />
                                <span>No questions in database. Trigger AI above or compose manually.</span>
                              </div>
                            ) : (
                              mcqList.map((q, idx) => {
                                const opts = Array.isArray(q.options) ? q.options : JSON.parse(JSON.stringify(q.options || []));
                                
                                return (
                                  <div key={q.id} className="question-card">
                                    <div className="question-card-header">
                                      <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 800 }}>UPSC MCQ #{idx + 1} ({q.difficulty})</span>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleEditMCQ(q)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Edit"><Edit3 size={14}/></button>
                                        <button onClick={() => handleDeleteMCQ(q.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }} title="Delete"><Trash2 size={14}/></button>
                                      </div>
                                    </div>
                                    <div className="question-card-title">{q.text}</div>
                                    <div>
                                      {opts.map(o => (
                                        <div 
                                          key={o.label} 
                                          className={`question-option ${q.correctLabel === o.label?.toLowerCase() ? 'correct' : ''}`}
                                        >
                                          <strong>{o.label?.toUpperCase()}:</strong> {o.text}
                                        </div>
                                      ))}
                                    </div>
                                    {q.explanation && (
                                      <div className="question-explanation">
                                        <strong>Strategic Explanation:</strong> {q.explanation}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Right: MCQ Form Composer */}
                        <div className="mcq-form-pane">
                          <div className="pane-header">
                            <span>{mcqForm.id ? 'Modify MCQ Block' : 'Manual Question Composer'}</span>
                            {mcqForm.id && <button onClick={resetMcqForm} style={{ fontSize: '0.7rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Cancel Edit</button>}
                          </div>

                          <form onSubmit={handleSaveMCQ} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '12px' }}>
                            <div className="form-group">
                              <label className="form-label">Question Text</label>
                              <textarea 
                                className="form-textarea"
                                rows="3"
                                placeholder="Enter UPSC type question..."
                                value={mcqForm.text}
                                onChange={e => setMcqForm({...mcqForm, text: e.target.value})}
                                required
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div className="form-group">
                                <label className="form-label">Option A</label>
                                <input 
                                  type="text"
                                  className="form-input"
                                  value={mcqForm.optA}
                                  onChange={e => setMcqForm({...mcqForm, optA: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Option B</label>
                                <input 
                                  type="text"
                                  className="form-input"
                                  value={mcqForm.optB}
                                  onChange={e => setMcqForm({...mcqForm, optB: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Option C</label>
                                <input 
                                  type="text"
                                  className="form-input"
                                  value={mcqForm.optC}
                                  onChange={e => setMcqForm({...mcqForm, optC: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Option D</label>
                                <input 
                                  type="text"
                                  className="form-input"
                                  value={mcqForm.optD}
                                  onChange={e => setMcqForm({...mcqForm, optD: e.target.value})}
                                  required
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div className="form-group">
                                <label className="form-label">Correct Option</label>
                                <select 
                                  className="form-select"
                                  value={mcqForm.correctLabel}
                                  onChange={e => setMcqForm({...mcqForm, correctLabel: e.target.value})}
                                >
                                  <option value="a">A</option>
                                  <option value="b">B</option>
                                  <option value="c">C</option>
                                  <option value="d">D</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label className="form-label">Difficulty</label>
                                <select 
                                  className="form-select"
                                  value={mcqForm.difficulty}
                                  onChange={e => setMcqForm({...mcqForm, difficulty: e.target.value})}
                                >
                                  <option value="EASY">Easy</option>
                                  <option value="MEDIUM">Medium</option>
                                  <option value="HARD">Hard</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="form-label">Strategic Explanation</label>
                              <textarea 
                                className="form-textarea"
                                rows="2"
                                placeholder="Explanation for students..."
                                value={mcqForm.explanation}
                                onChange={e => setMcqForm({...mcqForm, explanation: e.target.value})}
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label">Tags (comma separated)</label>
                              <input 
                                type="text"
                                className="form-input"
                                placeholder="e.g. Constitutional Body, Elections"
                                value={mcqForm.tags}
                                onChange={e => setMcqForm({...mcqForm, tags: e.target.value})}
                              />
                            </div>

                            <button 
                              type="submit" 
                              className="btn-primary" 
                              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                              disabled={actionLoading}
                            >
                              <Save size={16} /> {mcqForm.id ? 'Save MCQ Changes' : 'Deploy Question to Bank'}
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <BookOpen size={64} className="empty-icon" style={{ animation: 'bounce 2s infinite' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Syllabus Command Center</h3>
              <p className="sidebar-subtitle" style={{ maxWidth: '340px', marginTop: '10px', fontSize: '0.8rem', lineHeight: '1.5' }}>
                Select a syllabus node from the left Subject Directory to manage high-yield fact sheets and the node's practice MCQ catalog.
              </p>
            </div>
          )
        ) : (
          /* TEST PACK CENTER WORKSPACE */
          selectedTestPack ? (
            <>
              {/* TOOLBAR HEADER */}
              <div className="cms-toolbar">
                <div className="toolbar-title-section">
                  <span className="toolbar-breadcrumbs">Test Pack Center</span>
                  <h2 className="toolbar-title">
                    {selectedTestPack.id === 'new' ? 'Build New Test Suite' : `Modify Test: ${testForm.title}`}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedTestPack.id !== 'new' && (
                    <button 
                      className="btn-danger"
                      onClick={() => handleDeleteTestPack(selectedTestPack.id)}
                      disabled={actionLoading}
                      style={{ marginRight: '10px' }}
                    >
                      <Trash2 size={14} style={{ marginRight: '6px', display: 'inline' }} /> Delete Suite
                    </button>
                  )}
                  <button 
                    className="btn-primary" 
                    onClick={handleSaveTestPack}
                    disabled={actionLoading}
                  >
                    <Save size={16} /> {selectedTestPack.id === 'new' ? 'Deploy Test Suite' : 'Save Test Changes'}
                  </button>
                </div>
              </div>

              {/* WORKSPACE CONTENT */}
              <div className="cms-workspace">
                {testLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
                    <div style={{ textAlign: 'center', opacity: 0.5 }}>
                      <div style={{ animation: 'spin 1s infinite linear', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 12px' }}></div>
                      <span>Loading test parameters...</span>
                    </div>
                  </div>
                ) : (
                  <div className="test-workspace">
                    {/* Left Pane: Config Form */}
                    <div className="test-form-pane">
                      <div className="pane-header" style={{ marginBottom: '16px' }}>
                        <span>Test Parameters</span>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '14px' }}>
                        <div className="form-group">
                          <label className="form-label">Test Title</label>
                          <input 
                            type="text"
                            className="form-input"
                            placeholder="e.g. UPSC Geography Sectional Mock: Earth Interior"
                            value={testForm.title}
                            onChange={e => setTestForm({...testForm, title: e.target.value})}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea 
                            className="form-textarea"
                            rows="2"
                            placeholder="Describe coverage areas, scoring thresholds..."
                            value={testForm.description}
                            onChange={e => setTestForm({...testForm, description: e.target.value})}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Test Core Type</label>
                            <select 
                              className="form-select"
                              value={testForm.type}
                              onChange={e => setTestForm({...testForm, type: e.target.value})}
                            >
                              <option value="PRACTICE">Interactive Practice Quiz</option>
                              <option value="MOCK">Mock Exam Series</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Coverage subType</label>
                            <select 
                              className="form-select"
                              value={testForm.subType}
                              onChange={e => setTestForm({...testForm, subType: e.target.value})}
                            >
                              <option value="SECTIONAL">Sectional Test (Topic Specfic)</option>
                              <option value="FULL_LENGTH">Full Length Test (Subject Wide)</option>
                              <option value="TEST_SERIES">Test Series (Multi-topic Bundle)</option>
                            </select>
                          </div>
                        </div>

                        {/* Associated Node dropdown (Visible only for Sectional Tests) */}
                        {testForm.subType === 'SECTIONAL' && (
                          <div className="form-group" style={{ border: '1px solid rgba(168, 85, 247, 0.15)', background: 'rgba(168, 85, 247, 0.02)', padding: '12px', borderRadius: '10px' }}>
                            <label className="form-label" style={{ color: '#a855f7' }}>Associated Syllabus Node</label>
                            <select
                              className="form-select"
                              value={testForm.issueId || ''}
                              onChange={e => setTestForm({...testForm, issueId: e.target.value})}
                            >
                              <option value="">-- Choose Syllabus Node --</option>
                              {nodes
                                .sort((a,b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                .map(n => (
                                  <option key={n.id} value={n.id}>{n.category}: {n.title}</option>
                                ))
                              }
                            </select>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                              This will filter the question pool to only show questions belonging to this syllabus node.
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Duration (Mins)</label>
                            <input 
                              type="number"
                              className="form-input"
                              value={testForm.durationMins}
                              onChange={e => setTestForm({...testForm, durationMins: parseInt(e.target.value) || 0})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Passing Score (%)</label>
                            <input 
                              type="number"
                              className="form-input"
                              value={testForm.passingScore}
                              onChange={e => setTestForm({...testForm, passingScore: parseInt(e.target.value) || 0})}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Marks Per Question</label>
                            <input 
                              type="number"
                              step="0.1"
                              className="form-input"
                              value={testForm.marksPerQuestion}
                              onChange={e => setTestForm({...testForm, marksPerQuestion: parseFloat(e.target.value) || 0})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Negative Marking Ratio</label>
                            <input 
                              type="number"
                              step="0.01"
                              className="form-input"
                              value={testForm.negativeMarking}
                              onChange={e => setTestForm({...testForm, negativeMarking: parseFloat(e.target.value) || 0})}
                              required
                            />
                          </div>
                        </div>

                        {/* Sourcing card selector (Hidden when editing existing tests) */}
                        {!testForm.id && (
                          <div className="form-group">
                            <label className="form-label">Question Sourcing Method</label>
                            <div className="sourcing-cards">
                              <div 
                                className={`sourcing-card ${testForm.sourcing === 'pull' ? 'active' : ''}`}
                                onClick={() => setTestForm({...testForm, sourcing: 'pull'})}
                              >
                                <span className="sourcing-card-title">Pull Existing</span>
                                <span className="sourcing-card-desc">Choose from compiled question catalog</span>
                              </div>
                              <div 
                                className={`sourcing-card ${testForm.sourcing === 'forge' ? 'active' : ''}`}
                                onClick={() => setTestForm({...testForm, sourcing: 'forge'})}
                              >
                                <span className="sourcing-card-title">AI Bulk Forge</span>
                                <span className="sourcing-card-desc">Autogenerate N questions for this test</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {testForm.sourcing === 'forge' && !testForm.id && (
                          <div className="form-group" style={{ background: 'rgba(168,85,247,0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(168,85,247,0.2)' }}>
                            <label className="form-label">Number of Questions to Forge</label>
                            <select 
                              className="form-select"
                              value={testForm.forgeCount}
                              onChange={e => setTestForm({...testForm, forgeCount: parseInt(e.target.value) || 10})}
                            >
                              <option value="5">5 Questions</option>
                              <option value="10">10 Questions</option>
                              <option value="15">15 Questions</option>
                              <option value="20">20 Questions</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Pane: Question Selector */}
                    <div className="test-questions-pane">
                      <div className="pane-header" style={{ marginBottom: '12px' }}>
                        <span>
                          {testForm.sourcing === 'pull' || testForm.id ? `Select Questions (${selectedQuestionIds.length} chosen)` : 'AI Question Forge Details'}
                        </span>
                      </div>

                      {testForm.sourcing === 'pull' || testForm.id ? (
                        <>
                          <div style={{ marginBottom: '12px', position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                            <input
                              type="text"
                              className="search-input"
                              placeholder="Search database question text..."
                              style={{ paddingLeft: '32px', height: '34px' }}
                              value={questionSearchTerm}
                              onChange={e => setQuestionSearchTerm(e.target.value)}
                            />
                          </div>

                          <div className="question-list-scroll" style={{ flex: 1 }}>
                            {testForm.subType === 'SECTIONAL' && !testForm.issueId ? (
                              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
                                <AlertCircle size={24} style={{ margin: '0 auto 8px', color: '#a855f7' }} />
                                Please select an Associated Syllabus Node to load topic-specific questions.
                              </div>
                            ) : testBankQuestions.length === 0 ? (
                              <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '30%' }}>
                                <HelpCircle size={48} style={{ margin: '0 auto 12px' }} />
                                <span>No questions found matching criteria.</span>
                              </div>
                            ) : (
                              testBankQuestions
                                .filter(q => q.text.toLowerCase().includes(questionSearchTerm.toLowerCase()))
                                .map((q, idx) => (
                                  <div 
                                    key={q.id} 
                                    className={`question-select-row ${selectedQuestionIds.includes(q.id) ? 'active' : ''}`}
                                    onClick={() => handleToggleQuestionSelection(q.id)}
                                  >
                                    <input 
                                      type="checkbox"
                                      className="question-select-checkbox"
                                      checked={selectedQuestionIds.includes(q.id)}
                                      onChange={() => {}} // Controlled by row click
                                    />
                                    <div>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', display: 'flex', gap: '8px' }}>
                                        <span>MCQ #{idx + 1} ({q.difficulty})</span>
                                        {q.issue?.title && <span style={{ color: '#6366f1' }}>• {q.issue.title}</span>}
                                      </div>
                                      <div style={{ fontSize: '0.8rem', color: 'white', marginTop: '4px', lineHeight: '1.4' }}>{q.text}</div>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', opacity: 0.6 }}>
                          <Sparkles size={48} style={{ color: '#a855f7', animation: 'pulse 2s infinite', marginBottom: '12px' }} />
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, textAlign: 'center' }}>AI Generation Pipeline Active</div>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', maxWidth: '250px', marginTop: '6px' }}>
                            When you deploy this test, the UPSC AI engine will automatically forge {testForm.forgeCount} high-yield MCQs using syllabus context, placing them directly into this test pack.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Trophy size={64} className="empty-icon" style={{ animation: 'bounce 2s infinite' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Test Pack Center</h3>
              <p className="sidebar-subtitle" style={{ maxWidth: '340px', marginTop: '10px', fontSize: '0.8rem', lineHeight: '1.5' }}>
                Select a test pack from the sidebar directory to edit, or click the bottom "+ Create Test Pack" button to deploy sectional, full-length, or test series.
              </p>
            </div>
          )
        )}
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
