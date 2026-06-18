'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  ChevronLeft, Search, BookOpen, History, Award, Focus, Sparkles, Cpu 
} from 'lucide-react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import SubjectChat from '@/components/content-portal/SubjectChat';
import { GEOGRAPHY_SYLLABUS } from '@/lib/syllabus-data';

export default function OptionalStudyClient({ optional, contents = [], pyqs = [], issues = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeLang = searchParams.get('lang') || 'en';

  const [activeTab, setActiveTab] = useState('notes'); // "notes" | "pyqs"
  const [selectedChunk, setSelectedChunk] = useState(contents[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const hasTree = issues && issues.length > 0;
  const isGeography = optional.slug === 'geography';

  // Find root nodes (Papers)
  const rootNodes = hasTree ? issues.filter(issue => !issue.parentIssueId) : [];

  const [activePaperId, setActivePaperId] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [activeSubtopicNode, setActiveSubtopicNode] = useState(null);
  const [matchingChunks, setMatchingChunks] = useState([]);
  const [suggestedChatQuery, setSuggestedChatQuery] = useState('');

  // Past Year Questions (PYQ) Filter and View States
  const [examFilter, setExamFilter] = useState('ALL'); 
  const [yearFilter, setYearFilter] = useState('ALL'); 
  const [paperFilter, setPaperFilter] = useState('ALL'); 
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [centerTab, setCenterTab] = useState('notes'); // 'notes' | 'pyqs'

  // UX Redesign States
  const [sidebarMode, setSidebarMode] = useState('syllabus'); // 'syllabus' | 'pyq'
  const [lastActiveSyllabusNode, setLastActiveSyllabusNode] = useState(null);

  const getFirstSubtopicNode = (paperId) => {
    if (!paperId) return null;
    const firstSection = issues.find(n => n.parentIssueId === paperId);
    if (firstSection) {
      const firstTopic = issues.find(n => n.parentIssueId === firstSection.id);
      if (firstTopic) {
        const firstSubtopic = issues.find(n => n.parentIssueId === firstTopic.id);
        if (firstSubtopic) {
          return firstSubtopic;
        }
      }
    }
    return null;
  };

  // Reset center tab to notes when subtopic changes
  useEffect(() => {
    setCenterTab('notes');
  }, [activeSubtopicNode]);

  // Auto-set active paper on mount
  useEffect(() => {
    if (rootNodes.length > 0 && !activePaperId) {
      setActivePaperId(rootNodes[0].id);
    }
  }, [rootNodes, activePaperId]);

  const getKeywords = (text) => {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 3 && !['with', 'from', 'their', 'under', 'between', 'about', 'geography', 'optional', 'paper'].includes(word));
  };

  // Sync active subtopic and matched notes when language or selected subtopic changes
  useEffect(() => {
    if (!hasTree) {
      if (contents.length > 0) {
        if (!selectedChunk || !contents.some(c => c.id === selectedChunk.id)) {
          setSelectedChunk(contents[0]);
        }
      } else {
        setSelectedChunk(null);
      }
      return;
    }

    // Initialize first subtopic if none selected
    if (!activeSubtopicNode && activePaperId) {
      const firstSection = issues.find(n => n.parentIssueId === activePaperId);
      if (firstSection) {
        const firstTopic = issues.find(n => n.parentIssueId === firstSection.id);
        if (firstTopic) {
          const firstSubtopic = issues.find(n => n.parentIssueId === firstTopic.id);
          if (firstSubtopic) {
            setActiveSubtopicNode(firstSubtopic);
            setLastActiveSyllabusNode(firstSubtopic);
          }
        }
      }
      return;
    }

    if (!activeSubtopicNode) return;

    const keywords = getKeywords(activeSubtopicNode.title);
    if (keywords.length === 0) {
      setMatchingChunks([]);
      setSelectedChunk(null);
      return;
    }

    const matches = contents.filter(chunk => {
      // 1. Prioritize explicit database links
      if (chunk.issueId && chunk.issueId === activeSubtopicNode.id) {
        return true;
      }
      
      // 2. Fallback to keyword search matching for backward compatibility
      if (chunk.sourceUrl?.includes('syllabus')) return false;
      const searchTarget = `${chunk.title} ${chunk.contentMarkdown}`.toLowerCase();
      
      const matched = keywords.filter(kw => searchTarget.includes(kw));
      if (keywords.length === 1) {
        return matched.length === 1;
      }
      if (keywords.length === 2) {
        return matched.length === 2;
      }
      const ratio = matched.length / keywords.length;
      return ratio >= 0.6 || matched.length >= 2;
    });

    setMatchingChunks(matches);
    if (matches.length > 0) {
      if (selectedChunk && matches.some(m => m.id === selectedChunk.id)) {
        // Keep current
      } else {
        setSelectedChunk(matches[0]);
      }
    } else {
      setSelectedChunk(null);
    }
  }, [contents, activeSubtopicNode, activePaperId, hasTree, issues]);

  // Auto expand chapters if search is active
  useEffect(() => {
    if (!searchTerm.trim() || !hasTree) return;
    const cleanSearch = searchTerm.toLowerCase();
    
    const newExpanded = {};
    issues.forEach(node => {
      if (node.title.toLowerCase().includes(cleanSearch) && node.parentIssueId) {
        newExpanded[node.parentIssueId] = true;
        const parent = issues.find(n => n.id === node.parentIssueId);
        if (parent && parent.parentIssueId) {
          newExpanded[parent.parentIssueId] = true;
        }
      }
    });
    setExpandedTopics(prev => ({ ...prev, ...newExpanded }));
  }, [searchTerm, issues, hasTree]);

  const handleSubtopicClick = (subtopicNode) => {
    setActiveSubtopicNode(subtopicNode);
    setLastActiveSyllabusNode(subtopicNode);
    setSuggestedChatQuery(
      activeLang === 'en' 
        ? `Explain the concepts, theories, and geographical significance of "${subtopicNode.title}" for Geography Optional Paper.`
        : `भूगोल वैकल्पिक विषयासाठी "${subtopicNode.title}" या संकल्पनेचे महत्त्व, सिद्धांत आणि स्पष्टीकरण सविस्तर स्पष्ट करा.`
    );
  };

  // Filter content chunks based on search (Fallback mode)
  const filteredChunks = contents.filter(chunk => {
    if (!searchTerm.trim()) return true;
    return (
      chunk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.contentMarkdown.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Get sorted list of unique years from the pyqs dataset
  const uniqueYears = [...new Set(pyqs.map(p => p.year))].sort((a, b) => b - a);

  // Group questions by exam, year, paper to find complete papers
  const papersMap = {};
  pyqs
    .filter(pyq => pyq.exam !== 'UPSC') // Remove UPSC optional papers as they are incomplete
    .forEach(pyq => {
      const key = `${pyq.exam}-${pyq.year}-${pyq.paper}`;
      if (!papersMap[key]) {
        papersMap[key] = {
          exam: pyq.exam,
          year: pyq.year,
          paper: pyq.paper,
          count: 0
        };
      }
      papersMap[key].count++;
    });
  
  // Convert map to array and sort by year desc, exam, paper
  const availablePapers = Object.values(papersMap).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (a.exam !== b.exam) return a.exam.localeCompare(b.exam);
    return a.paper.localeCompare(b.paper);
  });

  const handleSyllabusTabClick = () => {
    setSidebarMode('syllabus');
    if (lastActiveSyllabusNode) {
      setActiveSubtopicNode(lastActiveSyllabusNode);
    } else {
      const firstNode = getFirstSubtopicNode(activePaperId);
      if (firstNode) {
        setActiveSubtopicNode(firstNode);
        setLastActiveSyllabusNode(firstNode);
      }
    }
  };

  const handleMainsPyqTabClick = () => {
    setSidebarMode('pyq');
    setActiveSubtopicNode({
      id: 'ALL_PYQS',
      title: activeLang === 'en' ? 'All Past Year Papers' : 'सर्व मागील वर्षांचे पेपर्स'
    });
    
    // Automatically select the first paper if none is active yet
    if (examFilter === 'ALL' || yearFilter === 'ALL' || paperFilter === 'ALL') {
      if (availablePapers.length > 0) {
        const firstPaper = availablePapers[0];
        setExamFilter(firstPaper.exam);
        setYearFilter(String(firstPaper.year));
        setPaperFilter(firstPaper.paper);
      }
    }
  };

  // Filter base questions by user-selected Exam, Year, and Paper dropdowns/pills
  const filteredByScope = pyqs.filter(pyq => {
    if (pyq.exam === 'UPSC') return false; // Exclude UPSC questions from Mains PYQ
    if (examFilter !== 'ALL' && pyq.exam !== examFilter) return false;
    if (yearFilter !== 'ALL' && String(pyq.year) !== String(yearFilter)) return false;
    if (paperFilter !== 'ALL' && pyq.paper !== paperFilter) return false;
    return true;
  });

  // Filter PYQs based on active subtopic keywords + search query
  const filteredPyqs = filteredByScope.filter(pyq => {
    if (searchTerm.trim()) {
      return (
        pyq.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(pyq.year).includes(searchTerm)
      );
    }
    if (hasTree && activeSubtopicNode) {
      const keywords = getKeywords(activeSubtopicNode.title);
      if (keywords.length > 0) {
        const text = pyq.questionText.toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
      }
    }
    return true;
  });

  // Fallback: If no PYQs match the subtopic, show all scoped PYQs
  const displayPyqs = filteredPyqs.length > 0 ? filteredPyqs : filteredByScope.filter(pyq => {
    if (!searchTerm.trim()) return true;
    return (
      pyq.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(pyq.year).includes(searchTerm)
    );
  });

  const showFallbackPyqsMessage = hasTree && activeSubtopicNode && filteredPyqs.length === 0 && !searchTerm.trim();

  const activeSections = activePaperId 
    ? issues.filter(issue => issue.parentIssueId === activePaperId) 
    : [];

  return (
    <div className="optional-workspace-container">
      {/* 1. Left Syllabus Console */}
      <aside className="optional-sidebar">
        <div className="sidebar-header">
          <Link href="/mains/prepare" className="back-link">
            <ChevronLeft size={16} />
            <span>Mains Prepare Hub</span>
          </Link>
          
          <div className="subject-meta">
            <span className="subject-pill">Optional Subject</span>
            <h1 className="subject-title">{optional.name}</h1>
            <p className="subject-desc">{optional.description || 'Neural syllabus workspace'}</p>
          </div>

          {/* Segmented Control Switcher */}
          <div className="console-switcher">
            <button
              className={`console-switcher-btn ${sidebarMode === 'syllabus' ? 'active' : ''}`}
              onClick={handleSyllabusTabClick}
            >
              <BookOpen size={13} />
              <span>{activeLang === 'en' ? 'Syllabus Index' : 'अभ्यासक्रम सूची'}</span>
            </button>
            <button
              className={`console-switcher-btn ${sidebarMode === 'pyq' ? 'active' : ''}`}
              onClick={handleMainsPyqTabClick}
            >
              <History size={13} />
              <span>{activeLang === 'en' ? 'Mains PYQs' : 'मुख्य परीक्षा PYQs'}</span>
            </button>
          </div>



          {/* Paper Toggles */}
          {sidebarMode === 'syllabus' && hasTree && rootNodes.length > 1 && (
            <div className="paper-toggles">
              {rootNodes.map(rootNode => (
                <button 
                  key={rootNode.id}
                  className={`paper-toggle-btn ${activePaperId === rootNode.id ? 'active' : ''}`}
                  onClick={() => {
                    setActivePaperId(rootNode.id);
                    setActiveSubtopicNode(null);
                    setLastActiveSyllabusNode(null);
                  }}
                >
                  {rootNode.title.includes('Paper I') || rootNode.title.includes('पेपर १')
                    ? (activeLang === 'en' ? 'Paper I' : 'पेपर १')
                    : (rootNode.title.includes('Paper II') || rootNode.title.includes('पेपर २')
                        ? (activeLang === 'en' ? 'Paper II' : 'पेपर २')
                        : rootNode.title)
                  }
                </button>
              ))}
            </div>
          )}

          {/* Search bar */}
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder={sidebarMode === 'syllabus' ? (hasTree ? "Search syllabus..." : "Search curriculum note...") : (activeLang === 'en' ? "Search papers..." : "पेपर्स शोधा...")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Scrollable list content */}
        <div className="sidebar-list">
          {sidebarMode === 'syllabus' ? (
            hasTree ? (
              <div className="syllabus-tree-root">
                {activeSections.map(section => {
                  const chapters = issues.filter(issue => issue.parentIssueId === section.id);
                  
                  return (
                    <div key={section.id} className="syllabus-section">
                      <h3 className="section-header-title">
                        {activeLang === 'mr' && section.title_mr ? section.title_mr : (activeLang === 'hi' && section.title_hi ? section.title_hi : section.title)}
                      </h3>
                      <div className="section-topics-list">
                        {chapters.map(topic => {
                          const isExpanded = !!expandedTopics[topic.id];
                          const subtopics = issues.filter(issue => issue.parentIssueId === topic.id);
                          
                          const filteredSubtopics = subtopics.filter(sub => {
                            if (!searchTerm.trim()) return true;
                            const term = searchTerm.toLowerCase();
                            return sub.title.toLowerCase().includes(term) || 
                                   topic.title.toLowerCase().includes(term);
                          });
                          
                          if (searchTerm.trim() && filteredSubtopics.length === 0 && !topic.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return null;
                          }

                          return (
                            <div key={topic.id} className="topic-node">
                              <button 
                                className={`topic-header-btn ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => setExpandedTopics(prev => ({ ...prev, [topic.id]: !prev[topic.id] }))}
                              >
                                <span className="topic-title-text">
                                  {activeLang === 'mr' && topic.title_mr ? topic.title_mr : (activeLang === 'hi' && topic.title_hi ? topic.title_hi : topic.title)}
                                </span>
                                <span className="chevron-icon">{isExpanded ? '▼' : '▶'}</span>
                              </button>
                              
                              {isExpanded && (
                                <div className="subtopics-list">
                                  {filteredSubtopics.map(subNode => {
                                    const isActive = activeSubtopicNode?.id === subNode.id;
                                    return (
                                      <button
                                        key={subNode.id}
                                        onClick={() => handleSubtopicClick(subNode)}
                                        className={`subtopic-btn ${isActive ? 'active' : ''}`}
                                      >
                                        <span className="subtopic-bullet">•</span>
                                        <span className="subtopic-text">
                                          {activeLang === 'mr' && subNode.title_mr ? subNode.title_mr : (activeLang === 'hi' && subNode.title_hi ? subNode.title_hi : subNode.title)}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              filteredChunks.length > 0 ? (
                filteredChunks.map(chunk => {
                  const isSelected = selectedChunk?.id === chunk.id;
                  return (
                    <button 
                      key={chunk.id}
                      onClick={() => setSelectedChunk(chunk)}
                      className={`list-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="item-indicator"></div>
                      <div className="item-details">
                        <h4 className="item-title">{chunk.title}</h4>
                        {chunk.sourceUrl && <span className="item-source">Source: {chunk.sourceUrl}</span>}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="empty-list-state">
                  <p>No notes chunks match search query</p>
                </div>
              )
            )
          ) : (
            /* Complete Papers list for sidebarMode === 'pyq' */
            <div className="sidebar-papers-list fade-in">
              {availablePapers
                .filter(paper => {
                  if (!searchTerm.trim()) return true;
                  const term = searchTerm.toLowerCase();
                  return paper.exam.toLowerCase().includes(term) ||
                         String(paper.year).includes(term) ||
                         paper.paper.toLowerCase().includes(term);
                })
                .map((paper, idx) => {
                  const isSelected = examFilter === paper.exam && 
                                     String(yearFilter) === String(paper.year) && 
                                     paperFilter === paper.paper && 
                                     activeSubtopicNode?.id === 'ALL_PYQS';
                  return (
                    <button
                      key={idx}
                      className={`paper-list-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setActiveSubtopicNode({
                          id: 'ALL_PYQS',
                          title: activeLang === 'en' ? 'All Past Year Papers' : 'सर्व मागील वर्षांचे पेपर्स'
                        });
                        setExamFilter(paper.exam);
                        setYearFilter(String(paper.year));
                        setPaperFilter(paper.paper);
                      }}
                    >
                      <div className="paper-item-indicator"></div>
                      <div className="paper-item-details">
                        <div className="paper-item-header">
                          <span className="paper-exam-badge">{paper.exam}</span>
                          <span className="paper-year-text">{paper.year}</span>
                        </div>
                        <h4 className="paper-title-text">
                          {paper.paper === 'Paper I' 
                            ? (activeLang === 'en' ? 'Paper I' : 'पेपर १') 
                            : (paper.paper === 'Paper II' 
                              ? (activeLang === 'en' ? 'Paper II' : 'पेपर २') 
                              : paper.paper)}
                        </h4>
                        <span className="paper-questions-count">
                          {activeLang === 'en' ? `${paper.count} Questions` : `${paper.count} प्रश्न`}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {availablePapers.filter(paper => {
                  if (!searchTerm.trim()) return true;
                  const term = searchTerm.toLowerCase();
                  return paper.exam.toLowerCase().includes(term) ||
                         String(paper.year).includes(term) ||
                         paper.paper.toLowerCase().includes(term);
                }).length === 0 && (
                  <div className="empty-list-state">
                    <p>{activeLang === 'en' ? 'No papers match search query' : 'शोध क्वेरीशी कोणतेही पेपर्स जुळत नाहीत'}</p>
                  </div>
                )}
            </div>
          )}
        </div>
      </aside>

      {/* 2. Right Workspace Grid (Center Study Desk + Right RAG Panel) */}
      <div className="workspace-main-wrapper">
        <WorkspaceLayout
          themeColor="emerald"
          sidebarContent={
            <div className="optional-rag-card">
              <SubjectChat 
                subjectId={optional.id}
                displayName={optional.name}
                examType="MAINS"
                optionalSlug={optional.slug}
                suggestedQuery={suggestedChatQuery}
              />
            </div>
          }
        >
          {/* Study Desk Content */}
          <div className="study-desk-container">
            {activeSubtopicNode?.id === 'ALL_PYQS' ? (
              /* --- Mains PYQ Hub (Full unfiltered archive) --- */
              <div className="pyq-overview-view fade-in">
                <header className="doc-header">
                  <span className="doc-meta-tag">
                    <History size={12} />
                    <span>UPSC & MPSC Mains PYQ</span>
                  </span>
                  <h1 className="doc-title">{optional.name} Past Papers</h1>
                  <p className="doc-subtitle">Syllabus-linked past year papers and practice questions.</p>
                </header>

                {(() => {
                  const isPaperFullySelected = examFilter !== 'ALL' && yearFilter !== 'ALL' && paperFilter !== 'ALL';

                  if (!isPaperFullySelected) {
                    return (
                      <div className="desk-empty-state">
                        <Focus size={48} className="empty-icon" />
                        <h3>{activeLang === 'en' ? 'No past paper selected' : 'कोणताही मागील पेपर निवडलेला नाही'}</h3>
                        <p>{activeLang === 'en' ? 'Select a complete past paper from the left console to start the exam simulation.' : 'परीक्षा सिम्युलेशन सुरू करण्यासाठी डाव्या बाजूला असलेला मागील वर्षाचा संपूर्ण पेपर निवडा.'}</p>
                      </div>
                    );
                  }

                  // Render Simulated Exam Sheet
                  const getQuestionSortKey = (pyq) => {
                    const qNum = pyq.metadata?.questionNumber || '';
                    if (!qNum) return '99-z';
                    const mainMatch = qNum.match(/Q?(\d+)/i);
                    const mainNum = mainMatch ? parseInt(mainMatch[1]) : 99;
                    const subMatch = qNum.match(/\(([a-z])\)/i);
                    const subChar = subMatch ? subMatch[1] : 'z';
                    return `${String(mainNum).padStart(2, '0')}-${subChar}`;
                  };

                  const sortedPyqs = [...filteredByScope].sort((a, b) => {
                    return getQuestionSortKey(a).localeCompare(getQuestionSortKey(b));
                  });

                  // Group sorted questions by main question header (Question 1, Question 2, etc.)
                  const groupedQuestions = {};
                  sortedPyqs.forEach(pyq => {
                    const qNum = pyq.metadata?.questionNumber || '';
                    const mainMatch = qNum.match(/Q?(\d+)/i);
                    const mainKey = mainMatch ? `Question ${mainMatch[1]}` : 'Other';
                    if (!groupedQuestions[mainKey]) {
                      groupedQuestions[mainKey] = [];
                    }
                    groupedQuestions[mainKey].push(pyq);
                  });

                  const mainKeys = Object.keys(groupedQuestions).sort((a, b) => {
                    const getNum = (str) => {
                      const m = str.match(/\d+/);
                      return m ? parseInt(m[0]) : 99;
                    };
                    return getNum(a) - getNum(b);
                  });

                  const getSubQuestionLabel = (qNum) => {
                    if (!qNum) return '';
                    const subMatch = qNum.match(/\(([a-z])\)/i);
                    return subMatch ? `(${subMatch[1]})` : '';
                  };

                  return (
                    <div className="exam-sheet fade-in">
                      <div className="sheet-header">
                        <h2 className="sheet-exam-title">{examFilter} State Services Mains Examination - {yearFilter}</h2>
                        <h3 className="sheet-paper-title">
                          {optional.name} Optional - {paperFilter === 'Paper I' 
                            ? (activeLang === 'en' ? 'Paper I' : 'पेपर १') 
                            : (paperFilter === 'Paper II' 
                              ? (activeLang === 'en' ? 'Paper II' : 'पेपर २') 
                              : paperFilter)}
                        </h3>
                        <div className="sheet-meta-info">
                          <span>Time Allowed: 3 Hours</span>
                          <span>Maximum Marks: 250</span>
                        </div>
                      </div>

                      <div className="sheet-instructions">
                        <h4>Instructions:</h4>
                        <ul>
                          <li>There are EIGHT questions divided in two SECTIONS.</li>
                          <li>Candidate has to attempt FIVE questions in all.</li>
                          <li>Question Nos. 1 and 5 are compulsory and out of the remaining, THREE are to be attempted choosing at least ONE from each Section.</li>
                          <li>The number of marks carried by a question/part is indicated against it.</li>
                        </ul>
                      </div>

                      {mainKeys.length > 0 ? (
                        mainKeys.map(mainKey => {
                          const showSectionADivider = mainKey === 'Question 1';
                          const showSectionBDivider = mainKey === 'Question 5';
                          const subQs = groupedQuestions[mainKey];

                          // Sum of subparts marks
                          const totalMarks = subQs.reduce((sum, q) => sum + (q.marks || 0), 0);

                          return (
                            <div key={mainKey}>
                              {showSectionADivider && (
                                <div className="section-divider">
                                  <span className="section-divider-text">SECTION A</span>
                                </div>
                              )}
                              {showSectionBDivider && (
                                <div className="section-divider">
                                  <span className="section-divider-text">SECTION B</span>
                                </div>
                              )}

                              <div className="sheet-main-question">
                                <div className="sheet-main-question-header">
                                  <span>
                                    {mainKey === 'Question 1' && activeLang === 'mr' ? 'प्रश्न १' 
                                     : mainKey === 'Question 2' && activeLang === 'mr' ? 'प्रश्न २'
                                     : mainKey === 'Question 3' && activeLang === 'mr' ? 'प्रश्न ३'
                                     : mainKey === 'Question 4' && activeLang === 'mr' ? 'प्रश्न ४'
                                     : mainKey === 'Question 5' && activeLang === 'mr' ? 'प्रश्न ५'
                                     : mainKey === 'Question 6' && activeLang === 'mr' ? 'प्रश्न ६'
                                     : mainKey === 'Question 7' && activeLang === 'mr' ? 'प्रश्न ७'
                                     : mainKey === 'Question 8' && activeLang === 'mr' ? 'प्रश्न ८'
                                     : mainKey}
                                  </span>
                                  {totalMarks > 0 && <span>({activeLang === 'en' ? `Total Marks: ${totalMarks}` : `एकूण गुण: ${totalMarks}`})</span>}
                                </div>

                                <div className="sheet-sub-questions-list">
                                  {subQs.map(subQ => {
                                    const label = getSubQuestionLabel(subQ.metadata?.questionNumber);
                                    return (
                                      <div key={subQ.id} className="sheet-sub-question">
                                        <div className="sheet-sub-question-body">
                                          <p className="sheet-sub-question-text">
                                            {label ? <strong>{label} </strong> : null}
                                            {subQ.questionText}
                                          </p>
                                          {subQ.marks && (
                                            <span className="sheet-sub-question-marks">{subQ.marks} Marks</span>
                                          )}
                                        </div>

                                        <div className="sheet-question-actions">
                                          {subQ.modelAnswer && (
                                            <button
                                              className="sheet-action-btn"
                                              onClick={() => setExpandedAnswers(prev => ({ ...prev, [subQ.id]: !prev[subQ.id] }))}
                                            >
                                              <span>{expandedAnswers[subQ.id] 
                                                ? (activeLang === 'en' ? 'Hide Answer' : 'उत्तर लपवा') 
                                                : (activeLang === 'en' ? 'Answer' : 'उत्तर')}</span>
                                            </button>
                                          )}
                                        </div>

                                        {expandedAnswers[subQ.id] && subQ.modelAnswer && (
                                          <div className="pyq-board-answer fade-in">
                                            <h5>{activeLang === 'en' ? 'Study Guidance / Answer Structure:' : 'अभ्यास मार्गदर्शन / उत्तर आराखडा:'}</h5>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{subQ.modelAnswer}</ReactMarkdown>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="desk-empty-state">
                          <Focus size={48} className="empty-icon" />
                          <h3>No questions found for this paper</h3>
                          <p>Try adjusting your search queries or selecting another exam paper.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* --- Topic Study Workspace --- */
              activeSubtopicNode ? (
                <div className="topic-workspace fade-in">
                  <header className="topic-workspace-header">
                    <span className="doc-meta-tag">
                      <Cpu size={12} />
                      <span>{activeLang === 'en' ? `Syllabus Topic: ${activeSubtopicNode.title}` : `अभ्यासक्रम विषय: ${activeSubtopicNode.title}`}</span>
                    </span>
                    
                    {/* Workspace Tabs inside the desk */}
                    <div className="desk-tabs">
                      <button
                        className={`desk-tab-btn ${centerTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setCenterTab('notes')}
                      >
                        <BookOpen size={14} />
                        <span>{activeLang === 'en' ? 'Study Notes' : 'अभ्यास साहित्य'}</span>
                      </button>
                      <button
                        className={`desk-tab-btn ${centerTab === 'pyqs' ? 'active' : ''}`}
                        onClick={() => setCenterTab('pyqs')}
                      >
                        <History size={14} />
                        <span>{activeLang === 'en' ? `Mains PYQ (${filteredPyqs.length})` : `मुख्य परीक्षा PYQ (${filteredPyqs.length})`}</span>
                      </button>
                    </div>
                  </header>

                  {centerTab === 'notes' ? (
                    selectedChunk ? (
                      <article className="document-view">
                        <header className="doc-header">
                          {hasTree && matchingChunks.length > 1 && (
                            <div className="chunk-multi-switcher">
                              <span className="switcher-lbl">Related Notes:</span>
                              <div className="switcher-buttons">
                                 {matchingChunks.map((chunk, idx) => (
                                  <button
                                    key={chunk.id}
                                    onClick={() => setSelectedChunk(chunk)}
                                    className={`switcher-btn ${selectedChunk.id === chunk.id ? 'active' : ''}`}
                                  >
                                    Version {idx + 1}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <h1 className="doc-title">{selectedChunk.title}</h1>
                          {selectedChunk.sourceUrl && (
                            <div className="doc-citation">
                              <span>Academic Reference: <strong>{selectedChunk.sourceUrl}</strong></span>
                            </div>
                          )}
                        </header>

                        <section className="doc-body markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {selectedChunk.contentMarkdown}
                          </ReactMarkdown>
                        </section>
                      </article>
                    ) : (
                      <div className="ai-synthesis-card">
                        <div className="synthesis-badge">
                          <BookOpen size={16} />
                          <span>Study Base</span>
                        </div>
                        <h2>Study Material Coming Soon</h2>
                        <p className="synthesis-desc">
                          Comprehensive study notes for this subtopic are currently being compiled by our subject experts:
                        </p>
                        <div className="active-subtopic-box">
                          <strong>"{activeSubtopicNode.title}"</strong>
                        </div>
                        <p className="synthesis-help">
                          They will be uploaded shortly. In the meantime, explore other topics, check out the linked past papers, or ask the AI Assistant in the right panel.
                        </p>
                      </div>
                    )
                  ) : (
                    /* --- Mains PYQ Tab under active subtopic --- */
                    <div className="pyq-board-grid">
                      {filteredPyqs.length > 0 ? (
                        filteredPyqs.map((pyq, idx) => {
                          const qNum = pyq.metadata?.questionNumber || `Question ${idx + 1}`;
                          return (
                            <div key={pyq.id} className="pyq-board-card">
                              <div className="pyq-board-header">
                                <span className="pyq-index">{qNum}</span>
                                <div className="pyq-tags">
                                  <span className="tag-exam-badge">{pyq.exam || 'UPSC'}</span>
                                  <span className="tag-year">{pyq.year}</span>
                                  <span className="tag-paper">{pyq.paper}</span>
                                  {pyq.marks && <span className="tag-marks">{pyq.marks} Marks</span>}
                                </div>
                              </div>
                              <p className="pyq-board-text">{pyq.questionText}</p>
                              {pyq.modelAnswer && (
                                <div className="pyq-board-answer-toggle">
                                  <button
                                    className="toggle-answer-btn"
                                    onClick={() => setExpandedAnswers(prev => ({ ...prev, [pyq.id]: !prev[pyq.id] }))}
                                  >
                                    {expandedAnswers[pyq.id] 
                                      ? (activeLang === 'en' ? 'Hide Answer' : 'उत्तर लपवा') 
                                      : (activeLang === 'en' ? 'Answer' : 'उत्तर')}
                                  </button>
                                  {expandedAnswers[pyq.id] && (
                                    <div className="pyq-board-answer fade-in">
                                      <h5>{activeLang === 'en' ? 'Study Guidance / Answer Structure:' : 'अभ्यास मार्गदर्शन / उत्तर आराखडा:'}</h5>
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{pyq.modelAnswer}</ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="desk-empty-state" style={{ gridColumn: 'span 2' }}>
                          <Focus size={48} className="empty-icon" />
                          <h3>No past year questions found</h3>
                          <p>No questions have been directly mapped to this syllabus subtopic yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* --- Default Welcome Screen --- */
                <div className="desk-empty-state">
                  <Focus size={48} className="empty-icon" />
                  <h3>No topic selected</h3>
                  <p>Select a syllabus topic from the left console to start studying or click **Mains PYQs** in the sidebar switcher to browse complete papers.</p>
                </div>
              )
            )}
          </div>
        </WorkspaceLayout>
      </div>

      <style jsx global>{`
        .optional-workspace-container {
          min-height: 100vh;
          display: flex;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          padding-top: 80px;
        }

        /* Console Switcher Segmented Control */
        .console-switcher {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .console-switcher-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .console-switcher-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .console-switcher-btn.active {
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Sidebar Papers List styling */
        .sidebar-papers-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-bottom: 24px;
        }

        .paper-list-item {
          display: flex;
          text-align: left;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .paper-list-item:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
          transform: translateY(-1px);
        }

        .paper-list-item.selected {
          background: var(--bg-hover);
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.02);
        }

        .paper-item-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: transparent;
          transition: background 0.2s;
        }

        .paper-list-item.selected .paper-item-indicator {
          background: var(--color-emerald);
        }

        .paper-item-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .paper-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .paper-exam-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #fff;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .paper-year-text {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .paper-title-text {
          font-size: 0.88rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .paper-questions-count {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        /* Left Console Sidebar */
        .optional-sidebar {
          width: 340px;
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          backdrop-filter: blur(20px);
          position: fixed;
          top: 80px;
          bottom: 0;
          left: 0;
          overflow-y: auto;
          z-index: 40;
        }

        .subject-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .subject-pill {
          align-self: flex-start;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-emerald);
          border: 1px solid rgba(16, 185, 129, 0.15);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .subject-title {
          font-size: 1.6rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: var(--text-primary);
        }

        .subject-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        /* Workspace Filters (Lang & Exam) */
        .workspace-filters {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .filter-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .filter-lbl {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-buttons {
          display: flex;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 2px;
        }

        .filter-btn {
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 6px;
          background: transparent;
          color: var(--text-secondary);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Sidebar Tabs Toggle */
        .sidebar-tabs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          background: var(--bg-input);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .tab-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tab-toggle-btn.active {
          color: var(--text-primary);
          background: var(--bg-card);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        /* Sidebar list contents */
        .sidebar-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .list-item {
          display: flex;
          text-align: left;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .list-item:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
        }

        .list-item.selected {
          background: var(--bg-hover);
          border-color: var(--border-hover);
          box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.02);
        }

        .item-indicator {
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: transparent;
          transition: background 0.2s;
        }

        .list-item.selected .item-indicator {
          background: var(--color-emerald);
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-title {
          font-size: 0.88rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .item-source {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        /* PYQ mini cards on sidebar */
        .pyq-list-card {
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 14px;
        }

        .pyq-card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .pyq-year {
          font-size: 0.7rem;
          font-weight: 900;
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .pyq-paper {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .pyq-marks {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--color-blue);
          margin-left: auto;
        }

        .pyq-card-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.45;
        }

        .empty-list-state {
          text-align: center;
          padding: 40px 10px;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-style: italic;
        }

        /* Right split pane wrapper */
        .workspace-main-wrapper {
          margin-left: 340px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 32px 40px;
        }

        /* Study desk layout inside WorkspaceLayout children */
        .study-desk-container {
          width: 100%;
          min-height: calc(100vh - 160px);
          min-width: 0;
        }

        .optional-rag-card {
          background: rgba(15, 23, 42, 0.35);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          overflow: hidden;
          backdrop-filter: blur(16px);
          height: calc(100vh - 164px);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 112px;
        }

        /* Document details rendering panel */
        .document-view {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 36px;
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 30px rgba(0,0,0,0.15);
        }

        .doc-header {
          margin-bottom: 28px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .doc-meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 16px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .doc-title {
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin: 0 0 12px;
          color: var(--text-primary);
        }

        .doc-citation {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .doc-citation strong {
          color: var(--text-primary);
        }

        .doc-body {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.05rem;
        }

        /* PYQ full list board views */
        .pyq-overview-view {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .doc-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .pyq-board-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .pyq-board-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 28px;
          backdrop-filter: blur(16px);
        }

        .pyq-board-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .pyq-index {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .pyq-tags {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tag-year {
          font-size: 0.72rem;
          font-weight: 900;
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .tag-paper {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-muted);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .tag-marks {
          font-size: 0.72rem;
          font-weight: 900;
          color: var(--color-blue);
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .pyq-board-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0;
        }

        .pyq-board-answer {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid var(--border-color);
        }

        .pyq-board-answer h5 {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--color-emerald);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 10px;
        }

        .desk-empty-state {
          text-align: center;
          padding: 80px 40px;
          color: var(--text-muted);
          border: 1px dashed var(--border-color);
          border-radius: 24px;
          background: var(--bg-input);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .desk-empty-state .empty-icon {
          opacity: 0.3;
        }

        .desk-empty-state h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .desk-empty-state p {
          font-size: 0.9rem;
          max-width: 320px;
          margin: 0;
          line-height: 1.5;
        }

        /* Animations */
        .fade-in {
          animation: fadeInEffect 0.35s ease-out;
        }

        }

        /* Paper Toggles */
        .paper-toggles {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 3px;
        }

        .paper-toggle-btn {
          padding: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .paper-toggle-btn:hover {
          color: var(--text-primary);
        }

        .paper-toggle-btn.active {
          background: var(--color-emerald);
          color: #fff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        /* Syllabus Tree Root */
        .syllabus-tree-root {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding-bottom: 24px;
        }

        .syllabus-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-header-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 6px;
          margin: 0;
        }

        .section-topics-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Topic / Chapter node */
        .topic-node {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          overflow: hidden;
        }

        .topic-header-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .topic-header-btn:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .topic-header-btn.expanded {
          background: rgba(16, 185, 129, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .topic-title-text {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.3;
          flex: 1;
        }

        .chevron-icon {
          font-size: 0.6rem;
          color: var(--text-muted);
          margin-left: 6px;
        }

        /* Subtopics list */
        .subtopics-list {
          display: flex;
          flex-direction: column;
          padding: 4px;
          background: rgba(0, 0, 0, 0.15);
          gap: 2px;
        }

        .subtopic-btn {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          padding: 8px 10px;
          font-size: 0.76rem;
          font-weight: 500;
          color: var(--text-secondary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .subtopic-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .subtopic-btn.active {
          color: var(--color-emerald);
          font-weight: 700;
          background: rgba(16, 185, 129, 0.06);
          border-left: 2px solid var(--color-emerald);
          border-radius: 0 6px 6px 0;
          padding-left: 8px;
        }

        .subtopic-bullet {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1;
        }

        .subtopic-btn.active .subtopic-bullet {
          color: var(--color-emerald);
        }

        .subtopic-text {
          line-height: 1.35;
          flex: 1;
        }

        /* AI Synthesis Card */
        .ai-synthesis-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 40px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(15, 23, 42, 0.4) 100%);
          border: 1px dashed rgba(16, 185, 129, 0.2);
          border-radius: 24px;
          backdrop-filter: blur(16px);
          min-height: calc(100vh - 160px);
          gap: 16px;
        }

        .synthesis-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 4px 10px;
          border-radius: 12px;
        }

        .ai-synthesis-card h2 {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .synthesis-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          margin: 0;
          max-width: 420px;
        }

        .active-subtopic-box {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.1);
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 0.95rem;
          color: var(--color-emerald);
          max-width: 480px;
          word-break: break-word;
        }

        .synthesis-help {
          font-size: 0.82rem;
          color: var(--text-muted);
          max-width: 380px;
          line-height: 1.5;
          margin: 0;
        }

        .synthesis-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-emerald);
          color: #fff;
          font-weight: 700;
          font-size: 0.85rem;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
        }

        .synthesis-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        /* Chunk Multi-Switcher */
        .chunk-multi-switcher {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 12px;
          margin-bottom: 18px;
          align-self: flex-start;
        }

        .switcher-lbl {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .switcher-buttons {
          display: flex;
          gap: 6px;
        }

        .switcher-btn {
          padding: 3px 8px;
          font-size: 0.72rem;
          font-weight: 700;
          background: var(--bg-input);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .switcher-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .switcher-btn.active {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-emerald);
          border-color: rgba(16, 185, 129, 0.3);
        }

        /* PYQ Fallback message style */
        .pyq-fallback-info {
          background: rgba(59, 130, 246, 0.04);
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 10px;
          font-size: 0.74rem;
          color: var(--color-blue);
          line-height: 1.4;
          text-align: left;
        }

        .pyq-exam-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tag-exam-badge {
          font-size: 0.72rem;
          font-weight: 800;
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* PYQ Filter Bar */
        .pyq-filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 18px;
          margin-bottom: 24px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .filter-options {
          display: flex;
          gap: 4px;
        }

        .filter-btn {
          padding: 4px 10px;
          font-size: 0.72rem;
          font-weight: 600;
          background: var(--bg-input);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .filter-btn.active {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-emerald);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .filter-select {
          padding: 4px 8px;
          font-size: 0.72rem;
          font-weight: 600;
          background: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          outline: none;
        }

        .filter-select:hover {
          border-color: var(--border-hover);
        }

        .pyq-view-mode-toggle {
          margin-left: auto;
          display: flex;
          background: rgba(255, 255, 255, 0.04);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .view-mode-btn {
          padding: 4px 10px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .view-mode-btn.active {
          background: rgba(16, 185, 129, 0.15);
          color: var(--color-emerald);
        }

        /* Full Paper Exam Sheet */
        .exam-sheet {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 40px;
          margin-top: 10px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          position: relative;
          text-align: left;
        }

        .sheet-header {
          text-align: center;
          border-bottom: 2px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 24px;
          margin-bottom: 30px;
        }

        .sheet-exam-title {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0 0 6px 0;
          color: var(--text-primary);
        }

        .sheet-paper-title {
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-emerald);
          margin: 0 0 16px 0;
          letter-spacing: 0.02em;
        }

        .sheet-meta-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .sheet-instructions {
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 35px;
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .sheet-instructions h4 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .sheet-instructions ul {
          margin: 0;
          padding-left: 20px;
        }

        .section-divider {
          text-align: center;
          margin: 40px 0 24px 0;
          position: relative;
        }

        .section-divider::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          z-index: 1;
        }

        .section-divider-text {
          background: var(--bg-card);
          padding: 4px 18px;
          font-weight: 800;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          color: var(--color-emerald);
          text-transform: uppercase;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          position: relative;
          z-index: 2;
          display: inline-block;
        }

        /* Sheet Question Styles */
        .sheet-main-question {
          margin-bottom: 32px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 20px;
        }

        .sheet-main-question-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 10px;
          margin-bottom: 16px;
        }

        .sheet-sub-questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sheet-sub-question {
          border-left: 2px solid rgba(16, 185, 129, 0.15);
          padding-left: 16px;
          padding-top: 2px;
          padding-bottom: 2px;
          transition: all 0.2s ease;
        }

        .sheet-sub-question:hover {
          border-left-color: var(--color-emerald);
        }

        .sheet-sub-question-body {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .sheet-sub-question-text {
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }

        .sheet-sub-question-marks {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .sheet-question-actions {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .sheet-action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .sheet-action-btn:hover {
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.05);
        }

        /* Launcher Grid */
        .launcher-title {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }

        .launcher-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0 0 24px 0;
        }

        .launcher-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .launcher-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 160px;
          text-align: left;
        }

        .launcher-card:hover {
          transform: translateY(-2px);
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .launcher-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .launcher-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #fff;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .launcher-year {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .launcher-card-body h4 {
          margin: 14px 0 4px 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .launcher-card-body p {
          margin: 0;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* Accordion toggles */
        .pyq-board-answer-toggle {
          margin-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 12px;
        }

        .toggle-answer-btn {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          font-size: 0.72rem;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-answer-btn:hover {
          color: var(--color-emerald);
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
        }

        .pyq-board-answer {
          margin-top: 12px;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 14px 18px;
        }

        .pyq-board-answer h5 {
          margin: 0 0 10px 0;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-emerald);
          text-transform: uppercase;
        }

        @keyframes fadeInEffect {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .optional-sidebar { width: 300px; }
          .workspace-main-wrapper { margin-left: 300px; padding: 24px 20px; }
          .doc-title { font-size: 1.8rem; }
        }

        @media (max-width: 768px) {
          .optional-workspace-container { flex-direction: column; padding-top: 60px; }
          .optional-sidebar { position: relative; width: 100%; height: auto; top: 0; border-right: none; border-bottom: 1px solid var(--border-color); padding: 20px 16px; }
          .workspace-main-wrapper { margin-left: 0; padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
}
