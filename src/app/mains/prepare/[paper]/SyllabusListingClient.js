'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, ChevronLeft, Globe, Layers, Sparkles, BookOpen } from 'lucide-react';

export default function SyllabusListingClient({ paper, paperInfo, issues }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubject, setActiveSubject] = useState(paperInfo.subjects[0] || null);
  const [transitioning, setTransitioning] = useState(false);

  // Helper to format domain name (e.g. "WORLD_HISTORY" -> "World History")
  const formatDomain = (domain) => {
    if (!domain) return 'Core Syllabus';
    return domain
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Reset active subject when paper changes
  useEffect(() => {
    setActiveSubject(paperInfo.subjects[0] || null);
  }, [paper, paperInfo.subjects]);

  const handleSubjectClick = (subject) => {
    setTransitioning(true);
    setActiveSubject(subject);
    setTimeout(() => setTransitioning(false), 200);
  };

  const getGroupedTopics = () => {
    if (!activeSubject) return [];

    const filtered = issues.filter(issue => {
      // For GS papers, match issue domain to active subject domains
      // For Essay paper, match issue domain to active essay subject domains (grouped conceptually)
      const matchesSubject = activeSubject.domains.includes(issue.domain);
      
      const matchesSearch = searchTerm === '' ||
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.topic.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSubject && matchesSearch;
    });

    // Group issues by topic
    const topicsMap = {};
    filtered.forEach(issue => {
      const topicName = issue.topic || 'General Topics';
      if (!topicsMap[topicName]) {
        topicsMap[topicName] = [];
      }
      topicsMap[topicName].push(issue);
    });

    // Convert map to array and sort topics by the minimum orderIndex of their items
    return Object.keys(topicsMap).map(name => {
      const items = topicsMap[name];
      const minOrder = Math.min(...items.map(i => i.orderIndex));
      return {
        name,
        items,
        minOrder
      };
    }).sort((a, b) => a.minOrder - b.minOrder);
  };

  const groupedTopics = getGroupedTopics();

  return (
    <div className="syllabus-container">
      {/* Sidebar Command Console */}
      <aside className="syllabus-sidebar">
        <div className="sidebar-header">
          <Link href="/mains/prepare" className="back-link">
            <ChevronLeft size={16} />
            <span>Mains Prepare</span>
          </Link>
          
          <div className="paper-info">
            <span className="paper-pill" style={{ color: paperInfo.color, background: `${paperInfo.color}15`, borderColor: `${paperInfo.color}30` }}>
              {paperInfo.code}
            </span>
            <h1 className="paper-title">{paperInfo.title}</h1>
          </div>

          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search syllabus nodes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <nav className="subjects-nav">
          <span className="section-label">Subjects & Sectors</span>
          {paperInfo.subjects.map(subject => {
            const count = issues.filter(i => subject.domains.includes(i.domain)).length;
            const isActive = activeSubject?.id === subject.id;
            return (
              <button
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className={`subject-btn ${isActive ? 'active' : ''}`}
                style={isActive ? { borderLeftColor: paperInfo.color } : {}}
              >
                <span className="subject-title">{subject.title}</span>
                <span className="subject-count">{count}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="syllabus-main">
        {transitioning ? (
          <div className="loading-state">
            <div className="shimmer header-shimmer" />
            <div className="shimmer card-shimmer" />
            <div className="shimmer card-shimmer" />
          </div>
        ) : activeSubject ? (
          <div className="active-subject-content">
            <header className="subject-header">
              <span className="neural-hub-tag" style={{ color: paperInfo.color }}>
                <Globe size={14} />
                <span>Neural Syllabus Node Grid</span>
              </span>
              <h2 className="subject-main-title">{activeSubject.title}</h2>
            </header>

            <div className="topics-list">
              {groupedTopics.length > 0 ? (
                groupedTopics.map(topic => (
                  <section key={topic.name} className="topic-section">
                    <div className="topic-divider">
                      <Layers size={16} className="topic-icon" style={{ color: paperInfo.color }} />
                      <h3 className="topic-name">{topic.name}</h3>
                      <div className="divider-line"></div>
                    </div>

                    <div className="nodes-grid">
                      {topic.items.map(issue => (
                        <div key={issue.id} className="node-wrapper">
                          <Link href={`/mains/node/${issue.slug}`} className="node-card">
                            <div className="node-card-content">
                              <div className="node-indicator" style={{ backgroundColor: paperInfo.color }} />
                              <div className="node-details">
                                <h4 className="node-title">{issue.title}</h4>
                                <span className="node-domain-badge" style={{ color: paperInfo.color, borderColor: `${paperInfo.color}25`, background: `${paperInfo.color}08` }}>
                                  {formatDomain(issue.domain)}
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={16} className="arrow-icon" style={{ color: paperInfo.color }} />
                          </Link>

                          {/* Child Subnodes (Static revision segments) */}
                          {issue.subNodes?.length > 0 && (
                            <div className="subnodes-container" style={{ borderLeftColor: `${paperInfo.color}30` }}>
                              {issue.subNodes.map(sub => (
                                <Link key={sub.id} href={`/mains/node/${issue.slug}#${sub.id}`} className="subnode-capsule">
                                  <div className="subnode-dot" style={{ background: paperInfo.color, boxShadow: `0 0 8px ${paperInfo.color}` }}></div>
                                  <span className="subnode-title">{sub.title}</span>
                                  <Sparkles size={12} className="sparkle-icon" style={{ color: paperInfo.color }} />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="empty-state">
                  <BookOpen size={48} className="empty-icon" />
                  <p>No study nodes found matching your query in this subject.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Globe size={48} className="empty-icon" />
            <p>Select a subject from the command console to begin studying.</p>
          </div>
        )}
      </main>

      <style jsx>{`
        .syllabus-container {
          min-height: 100vh;
          display: flex;
          background: #020617;
          color: #f8fafc;
          font-family: 'Outfit', sans-serif;
          padding-top: 80px;
        }

        .syllabus-sidebar {
          width: 360px;
          background: rgba(15, 23, 42, 0.4);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          backdrop-filter: blur(20px);
          position: fixed;
          top: 80px;
          bottom: 0;
          left: 0;
          overflow-y: auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
          margin-bottom: 24px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #f8fafc;
        }

        .paper-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .paper-pill {
          align-self: flex-start;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 8px;
          border: 1px solid;
          letter-spacing: 0.05em;
        }

        .paper-title {
          font-size: 1.5rem;
          font-weight: 900;
          line-height: 1.3;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .search-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 0.88rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .search-input:focus {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.03);
        }

        .subjects-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .section-label {
          font-size: 0.7rem;
          font-weight: 900;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 8px;
        }

        .subject-btn {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 12px;
          padding: 12px 16px;
          color: #94a3b8;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .subject-btn:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.02);
          transform: translateX(2px);
        }

        .subject-btn.active {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.04);
          border-left: 3px solid;
          border-radius: 4px 12px 12px 4px;
          box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.02);
        }

        .subject-count {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #64748b;
          transition: all 0.2s;
        }

        .subject-btn.active .subject-count {
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
        }

        .syllabus-main {
          margin-left: 360px;
          flex: 1;
          padding: 48px 80px 100px;
          max-width: 1200px;
        }

        .subject-header {
          margin-bottom: 48px;
        }

        .neural-hub-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .subject-main-title {
          font-size: 2.8rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin: 0;
          color: #f8fafc;
        }

        .topics-list {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .topic-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .topic-divider {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topic-name {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
          white-space: nowrap;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        .nodes-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .node-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        :global(.node-card) {
          position: relative;
          background: rgba(15, 23, 42, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          backdrop-filter: blur(16px);
        }

        :global(.node-card:hover) {
          background: rgba(15, 23, 42, 0.5);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
          transform: translateY(-2.5px);
        }

        .node-card-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .node-indicator {
          width: 3px;
          height: 32px;
          border-radius: 4px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
        }

        :global(.node-card:hover) .node-indicator {
          transform: scaleY(1.25);
          box-shadow: 0 0 10px currentColor;
        }

        .node-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .node-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0;
          color: #f1f5f9;
          transition: color 0.2s ease;
          line-height: 1.4;
          text-decoration: none !important;
        }

        :global(.node-card:hover) .node-title {
          color: #ffffff;
        }

        .node-domain-badge {
          display: inline-flex;
          align-self: flex-start;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 2px 10px;
          border-radius: 6px;
          border: 1px solid;
          transition: all 0.2s ease;
        }

        :global(.node-card:hover) .node-domain-badge {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .arrow-icon {
          opacity: 0.3;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        :global(.node-card:hover) .arrow-icon {
          transform: translateX(4px);
          opacity: 1;
        }

        .subnodes-container {
          margin-left: 20px;
          padding-left: 16px;
          border-left: 1px solid;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        :global(.subnode-capsule) {
          background: rgba(15, 23, 42, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none !important;
          transition: all 0.2s;
        }

        :global(.subnode-capsule:hover) {
          background: rgba(15, 23, 42, 0.4);
          border-color: rgba(255, 255, 255, 0.08);
        }

        :global(.subnode-capsule:hover) .sparkle-icon {
          opacity: 1;
        }

        .subnode-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .subnode-title {
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .sparkle-icon {
          margin-left: auto;
          opacity: 0.3;
          transition: opacity 0.2s;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: loading-shimmer 1.5s infinite;
          border-radius: 14px;
        }

        .header-shimmer {
          width: 40%;
          height: 48px;
          margin-bottom: 24px;
        }

        .card-shimmer {
          width: 100%;
          height: 80px;
        }

        @keyframes loading-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
          color: #64748b;
          border: 1px dashed rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          background: rgba(15, 23, 42, 0.15);
        }

        .empty-icon {
          margin: 0 auto 16px;
          opacity: 0.3;
        }

        @media (max-width: 1024px) {
          .syllabus-sidebar {
            width: 280px;
          }
          .syllabus-main {
            margin-left: 280px;
            padding: 32px 40px;
          }
          .subject-main-title {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 768px) {
          .syllabus-container {
            flex-direction: column;
            padding-top: 60px;
          }
          .syllabus-sidebar {
            position: relative;
            width: 100%;
            height: auto;
            top: 0;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            padding: 24px 16px;
          }
          .syllabus-main {
            margin-left: 0;
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
}
