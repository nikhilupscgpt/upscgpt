import React from 'react';
import Link from 'next/link';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import '../prelims.css';
import { 
  ChevronRight, 
  Search,
  BookOpen,
  BrainCircuit,
  Layout,
  GraduationCap
} from 'lucide-react';
import PortalResponsiveLayout from '@/components/layout/PortalResponsiveLayout';

export default async function PreparePage({ searchParams }) {
  const { q, subject: activeSubjectTitle } = await searchParams;
  const search = q || "";
  const session = await getServerSession(authOptions);
  
  const issues = await prisma.issue.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } }
      ]
    }
  });

  const PRELIMS_SECTIONS = [
    {
      id: 'GS',
      title: 'General Studies',
      subjects: [
        { title: 'Indian History', categories: ['ANCIENT_INDIA', 'MEDIEVAL_INDIA', 'MODERN_INDIA', 'ART_CULTURE', 'HISTORY'] },
        { title: 'Geography', categories: ['GEOGRAPHY'] },
        { title: 'Polity & Governance', categories: ['POLITY', 'GOVERNANCE'] },
        { title: 'Economy & Agriculture', categories: ['ECONOMY', 'AGRICULTURE'] },
        { title: 'Environment & Ecology', categories: ['ENVIRONMENT', 'DISASTER_MANAGEMENT'] },
        { title: 'Science & Technology', categories: ['SCIENCE_TECHNOLOGY'] },
        { title: 'Current Affairs', categories: ['CURRENT_AFFAIRS', 'INTERNATIONAL_RELATIONS', 'INTERNAL_SECURITY', 'SOCIETY'] }
      ]
    },
    {
      id: 'CSAT',
      title: 'CSAT (Paper II)',
      subjects: [
        { title: 'Aptitude & Reasoning', categories: ['CSAT'] }
      ]
    }
  ];

  const organizedData = PRELIMS_SECTIONS.map(section => ({
    ...section,
    subjects: section.subjects.map(subject => ({
      ...subject,
      items: issues
        .filter(issue => subject.categories.includes(issue.category))
        .sort((a, b) => a.orderIndex - b.orderIndex)
    }))
  }));

  const allSubjects = organizedData.flatMap(section => section.subjects.map(s => ({ ...s, sectionTitle: section.title })));
  const activeSubject = allSubjects.find(s => s.title === activeSubjectTitle) || allSubjects[0];

  const sidebar = (
    <>
      <div style={{ padding: '32px 24px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layout size={20} color="#3b82f6" /> Study Vault
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>545 Precision Syllabus Nodes</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }} className="mt-sidebar-scroll">
        {organizedData.map(section => (
          <div key={section.id} style={{ marginBottom: '32px' }}>
            <div style={{ 
              fontSize: '0.65rem', 
              fontWeight: 900, 
              color: '#475569', 
              textTransform: 'uppercase', 
              letterSpacing: '1.5px', 
              marginBottom: '12px', 
              paddingLeft: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155' }}></div>
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.subjects.map(subject => (
                <Link 
                  key={subject.title}
                  href={`/prelims/prepare?subject=${encodeURIComponent(subject.title)}${search ? `&q=${search}` : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    background: activeSubject?.title === subject.title ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent)' : 'transparent',
                    color: activeSubject?.title === subject.title ? '#60a5fa' : '#94a3b8',
                    borderLeft: activeSubject?.title === subject.title ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  {subject.title}
                  <span style={{ fontSize: '0.7rem', opacity: activeSubject?.title === subject.title ? 1 : 0.4, fontWeight: 800 }}>
                    {subject.items.length}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)' }}>
        <form action="/prelims/prepare" method="GET" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input 
            name="q"
            placeholder="Quick search..." 
            defaultValue={search}
            style={{ 
              width: '100%', 
              padding: '12px 12px 12px 40px', 
              borderRadius: '12px', 
              background: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '0.8rem',
              outline: 'none',
              fontWeight: 600
            }} 
          />
          {activeSubjectTitle && <input type="hidden" name="subject" value={activeSubjectTitle} />}
        </form>
      </div>
    </>
  );

  return (
    <PortalResponsiveLayout sidebar={sidebar}>
      {/* Subtle Background Gradient */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '400px', 
        background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08), transparent)',
        pointerEvents: 'none'
      }}></div>

      <div className="mt-page-header" style={{ padding: '64px 80px', maxWidth: '1400px', position: 'relative' }}>
        {activeSubject ? (
          <div>
            <div style={{ marginBottom: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '2px' }}>{activeSubject.sectionTitle}</span>
                  <ChevronRight size={14} color="#1e293b" />
                </div>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-2px' }}>{activeSubject.title}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{activeSubject.items.length}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Strategic Nodes</div>
              </div>
            </div>

            {activeSubject.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '120px 0', background: 'rgba(255,255,255,0.01)', borderRadius: '40px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Search size={32} color="#1e293b" />
                </div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800 }}>No results found</h3>
                <p style={{ color: '#64748b', maxWidth: '300px', margin: '12px auto' }}>We couldn&apos;t find any topics matching your search in this subject.</p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px' 
              }}>
                {activeSubject.items.map(issue => (
                  <Link 
                    key={issue.id} 
                    href={`/prelims/prepare/${issue.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="prepare-card" style={{
                      background: 'transparent',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      padding: '12px 16px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      position: 'relative'
                    }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', opacity: 0.8 }}></span>
                        
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0, letterSpacing: '-0.1px' }}>
                            {issue.title}
                          </h4>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                            {issue.category.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                            — {issue.topic}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', opacity: 0.6, transition: 'opacity 0.2s' }} className="card-actions">
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <BookOpen size={12} /> Study
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <BrainCircuit size={12} /> Practice
                          </div>
                        </div>
                        
                        <div style={{ color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '120px 0' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.03)', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <GraduationCap size={64} color="#3b82f6" />
            </div>
            <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Welcome to Study Vault</h2>
            <p style={{ color: '#64748b', maxWidth: '450px', margin: '20px auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Select a strategic subject from the sidebar to begin your precision preparation. Every node is linked to PYQs and targeted practice.
            </p>
          </div>
        )}
      </div>
    </PortalResponsiveLayout>
  );
}
