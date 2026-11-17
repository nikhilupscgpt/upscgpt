'use client';

import React, { useMemo, useState } from 'react';
import analysisData from '@/lib/pyq/prelims-pyq-analysis.json';
import {
  BarChart3,
  Target,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const YEARS = analysisData.years || [
  2011, 2012, 2013, 2014, 2015,
  2016, 2017, 2018, 2019, 2020,
  2021, 2022, 2023, 2024, 2025,
];

function getTierColor(tier = '') {
  if (tier.includes('Tier 1')) {
    return {
      bg: 'rgba(16, 185, 129, 0.14)',
      border: 'rgba(16, 185, 129, 0.35)',
      text: '#10b981',
    };
  }
  if (tier.includes('Tier 2')) {
    return {
      bg: 'rgba(59, 130, 246, 0.14)',
      border: 'rgba(59, 130, 246, 0.35)',
      text: '#3b82f6',
    };
  }
  return {
    bg: 'rgba(148, 163, 184, 0.14)',
    border: 'rgba(148, 163, 184, 0.3)',
    text: 'var(--pq-muted, #64748b)',
  };
}

export default function PyqAnalysisPanel({
  subject = 'Indian Polity',
  activeTopic = 'ALL',
  subjectColor = '#3b82f6',
  onSelectTopicToPractice,
}) {
  const subjectData = analysisData.subjects?.[subject];
  const [analysisScope, setAnalysisScope] = useState('subject'); // 'subject' | 'theme'
  const [selectedThemeName, setSelectedThemeName] = useState(null);

  // Resolve active theme based on user selection or active sidebar topic
  const resolvedTheme = useMemo(() => {
    if (!subjectData?.themes?.length) return null;
    if (selectedThemeName) {
      const found = subjectData.themes.find((t) => t.themeName === selectedThemeName);
      if (found) return found;
    }
    if (activeTopic && activeTopic !== 'ALL') {
      const byTopic = subjectData.themes.find((t) =>
        t.subTopics?.some((st) => st.topic === activeTopic)
      );
      if (byTopic) return byTopic;
    }
    return subjectData.themes[0];
  }, [subjectData, selectedThemeName, activeTopic]);

  if (!subjectData) {
    return (
      <div className="pq-card" style={{ padding: 32, textAlign: 'center' }}>
        No 15-year analysis data found for {subject}.
      </div>
    );
  }

  const maxYearCount = Math.max(
    1,
    ...YEARS.map((y) => subjectData.yearCounts?.[y] || 0)
  );

  const openThemeDetail = (themeName) => {
    setSelectedThemeName(themeName);
    setAnalysisScope('theme');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top 2-Level Mode Switcher: 1. Whole Subject Analysis | 2. Theme-by-Theme Analysis */}
      <div
        className="pq-card"
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: subjectColor,
                marginBottom: 4,
              }}
            >
              UPSC CSE Prelims (2011–2025) · 15-Year Intelligence
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
              {subject} — {analysisScope === 'subject' ? 'Whole-Subject Analysis' : `Theme: ${resolvedTheme?.themeName}`}
            </h2>
          </div>

          <div
            style={{
              display: 'inline-flex',
              padding: 4,
              borderRadius: 11,
              background: 'var(--pq-surface-2, rgba(148, 163, 184, 0.12))',
              border: '1px solid var(--pq-border, rgba(148, 163, 184, 0.22))',
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setAnalysisScope('subject')}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: 'none',
                background: analysisScope === 'subject' ? subjectColor : 'transparent',
                color: analysisScope === 'subject' ? '#ffffff' : 'var(--pq-text)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              1. Whole Subject Overview
            </button>
            <button
              type="button"
              onClick={() => setAnalysisScope('theme')}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: 'none',
                background: analysisScope === 'theme' ? subjectColor : 'transparent',
                color: analysisScope === 'theme' ? '#ffffff' : 'var(--pq-text)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              2. Theme-Wise Analysis ({subjectData.themes.length})
            </button>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--pq-muted)' }}>
          {subjectData.overview}
        </p>

        {/* Theme Selector Pills (always visible so user can jump straight into any Theme) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingTop: 4 }}>
          {subjectData.themes.map((t) => {
            const isSelected = analysisScope === 'theme' && resolvedTheme?.themeName === t.themeName;
            return (
              <button
                key={t.themeName}
                type="button"
                onClick={() => openThemeDetail(t.themeName)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: isSelected
                    ? `1.5px solid ${subjectColor}`
                    : '1px solid var(--pq-border, rgba(148, 163, 184, 0.25))',
                  background: isSelected
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'var(--pq-surface-2, rgba(148, 163, 184, 0.08))',
                  color: 'var(--pq-text)',
                  fontSize: 12.5,
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                }}
              >
                <span>{t.themeName}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: 'rgba(148, 163, 184, 0.18)',
                    fontWeight: 700,
                  }}
                >
                  {t.totalQuestions}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {analysisScope === 'subject' ? (
        <>
          {/* LEVEL 1: WHOLE-SUBJECT ANALYSIS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
              gap: 12,
            }}
          >
            <div className="pq-card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--pq-muted)', fontWeight: 600 }}>
                Total CSE Questions (15Y)
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>
                {subjectData.totalQuestions}
              </div>
              <div style={{ fontSize: 12, color: 'var(--pq-muted)', marginTop: 2 }}>
                Avg {subjectData.avgPerYear} Qs / year
              </div>
            </div>

            <div className="pq-card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--pq-muted)', fontWeight: 600 }}>
                Recent 5Y Avg (2021–2025)
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: subjectColor }}>
                {subjectData.recent5YrAvg} <span style={{ fontSize: 14, fontWeight: 600 }}>/ yr</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--pq-muted)', marginTop: 2 }}>
                vs {subjectData.early10YrAvg}/yr in 2011–20 ({subjectData.trendDirection})
              </div>
            </div>

            <div className="pq-card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--pq-muted)', fontWeight: 600 }}>
                Peak Weightage Year
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>
                {subjectData.peakYear?.year || '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--pq-muted)', marginTop: 2 }}>
                {subjectData.peakYear?.count || 0} questions asked
              </div>
            </div>

            <div className="pq-card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--pq-muted)', fontWeight: 600 }}>
                2022–25 New-Pattern Share
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>
                {subjectData.patternBreakdown.recent2022_2025.newPatternSharePct}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--pq-muted)', marginTop: 2 }}>
                &lsquo;How many&rsquo;, Statement I/II &amp; Pairs
              </div>
            </div>
          </div>

          {/* 15-Year Trajectory Bar Chart */}
          <div className="pq-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BarChart3 size={18} color={subjectColor} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                Year-Wise Question Trajectory (2011–2025)
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
                gap: 6,
                alignItems: 'end',
                height: 140,
                paddingTop: 18,
              }}
            >
              {YEARS.map((yr) => {
                const count = subjectData.yearCounts?.[yr] || 0;
                const heightPct = Math.max(6, Math.round((count / maxYearCount) * 100));
                const isRecent = yr >= 2021;
                return (
                  <div
                    key={yr}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 800 }}>{count}</span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 28,
                        height: `${heightPct}%`,
                        borderRadius: '6px 6px 3px 3px',
                        background: isRecent ? subjectColor : 'rgba(148, 163, 184, 0.45)',
                      }}
                      title={`${yr}: ${count} questions`}
                    />
                    <span style={{ fontSize: 10.5, color: 'var(--pq-muted)', fontWeight: 600 }}>
                      &rsquo;{String(yr).slice(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme ROI Priority Ranking */}
          <div className="pq-card" style={{ padding: '18px 20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={18} color={subjectColor} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                  Theme ROI Priority Ranking — Click any Theme for Deep Analysis
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {subjectData.themeRoiRanking.map((row) => {
                const badgeStyle = getTierColor(row.roiTier);
                return (
                  <button
                    key={row.themeName}
                    type="button"
                    onClick={() => openThemeDetail(row.themeName)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px minmax(160px, 1.4fr) auto 1fr auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--pq-border, rgba(148, 163, 184, 0.2))',
                      background: 'var(--pq-surface-2, rgba(148, 163, 184, 0.05))',
                      color: 'var(--pq-text)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'rgba(148, 163, 184, 0.16)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      #{row.rank}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14.5 }}>{row.themeName}</div>
                      <div style={{ fontSize: 12, color: 'var(--pq-muted)' }}>
                        Top topic: {row.topSubTopic || '—'} · Active {row.yearsActiveOutOf15}/15 yrs
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: badgeStyle.bg,
                        border: `1px solid ${badgeStyle.border}`,
                        color: badgeStyle.text,
                      }}
                    >
                      {row.roiTier}
                    </span>
                    <div style={{ fontSize: 12.5 }}>
                      <b>{row.totalQuestions} Qs</b> ({row.shareOfSubjectPct}% share) ·{' '}
                      <span style={{ color: 'var(--pq-muted)' }}>
                        2021–25: {row.recent5YrQuestions} Qs ({row.recent5YrSharePct}%)
                      </span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: subjectColor,
                      }}
                    >
                      <span>Theme Analysis</span>
                      <ArrowRight size={14} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Column Qualitative Intelligence: Recurring Concepts, Traps, 2026 Predictions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 14,
            }}
          >
            <div className="pq-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Target size={17} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
                  High-Yield Recurring Concepts
                </h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5, lineHeight: 1.5 }}>
                {subjectData.recurringConcepts.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="pq-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={17} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
                  Signature UPSC Traps
                </h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5, lineHeight: 1.5 }}>
                {subjectData.traps.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="pq-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkles size={17} color={subjectColor} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
                  2026 Prelims Focus Predictions
                </h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5, lineHeight: 1.5 }}>
                {subjectData.predictions2026.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : resolvedTheme ? (
        <>
          {/* LEVEL 2: THEME-BY-THEME DEEP ANALYSIS */}
          <div className="pq-card" style={{ padding: '18px 20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: getTierColor(resolvedTheme.roiTier).bg,
                    border: `1px solid ${getTierColor(resolvedTheme.roiTier).border}`,
                    color: getTierColor(resolvedTheme.roiTier).text,
                    marginBottom: 6,
                  }}
                >
                  {resolvedTheme.roiTier}
                </span>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>
                  {resolvedTheme.themeName} — Theme Breakdown
                </h3>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--pq-muted)' }}>15Y Total:</span>{' '}
                  <b>{resolvedTheme.totalQuestions} Qs</b> ({resolvedTheme.shareOfSubjectPct}%)
                </div>
                <div>
                  <span style={{ color: 'var(--pq-muted)' }}>2021–25:</span>{' '}
                  <b>{resolvedTheme.recent5YrQuestions} Qs</b> ({resolvedTheme.recent5YrSharePct}%)
                </div>
                <div>
                  <span style={{ color: 'var(--pq-muted)' }}>Active:</span>{' '}
                  <b>{resolvedTheme.yearsActiveOutOf15}/15 yrs</b>
                </div>
                <div>
                  <span style={{ color: 'var(--pq-muted)' }}>Last Asked:</span>{' '}
                  <b>{resolvedTheme.lastAskedYear || '—'}</b>
                </div>
              </div>
            </div>

            {/* Sub-Topic Frequency Matrix */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13.5,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--pq-border, rgba(148, 163, 184, 0.25))',
                      textAlign: 'left',
                      color: 'var(--pq-muted)',
                      fontSize: 12,
                    }}
                  >
                    <th style={{ padding: '8px 10px' }}>Sub-Topic</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>2011–15</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>2016–20</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>2021–25</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Total Qs</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Last Asked</th>
                    <th style={{ padding: '8px 10px' }}>Priority</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedTheme.subTopics.map((st) => {
                    const stBadge = getTierColor(st.priority);
                    return (
                      <tr
                        key={st.topic}
                        style={{
                          borderBottom: '1px solid var(--pq-border, rgba(148, 163, 184, 0.14))',
                        }}
                      >
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 700 }}>{st.topic}</div>
                          {st.testedAnchors?.length > 0 && (
                            <div style={{ fontSize: 11.5, color: 'var(--pq-muted)', marginTop: 2 }}>
                              Tested: {st.testedAnchors.join(' · ')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {st.split5Yr.y2011_2015}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {st.split5Yr.y2016_2020}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>
                          {st.split5Yr.y2021_2025}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800 }}>
                          {st.total} ({st.shareOfSubjectPct}%)
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {st.lastAskedYear || '—'}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              background: stBadge.bg,
                              border: `1px solid ${stBadge.border}`,
                              color: stBadge.text,
                            }}
                          >
                            {st.priority}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          {onSelectTopicToPractice && (
                            <button
                              type="button"
                              onClick={() => onSelectTopicToPractice(st.topic)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 8,
                                border: `1px solid ${subjectColor}`,
                                background: 'transparent',
                                color: subjectColor,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Practice ({st.total}) →
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Theme Anchors & 2026 Theme Focus */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 14,
            }}
          >
            {resolvedTheme.testedAnchors?.length > 0 && (
              <div className="pq-card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Target size={17} color="#10b981" />
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
                    Recurring Tested Anchors in {resolvedTheme.themeName}
                  </h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {resolvedTheme.testedAnchors.map((a, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: 'var(--pq-surface-2, rgba(148, 163, 184, 0.12))',
                        border: '1px solid var(--pq-border, rgba(148, 163, 184, 0.25))',
                        fontSize: 12.5,
                        fontWeight: 600,
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resolvedTheme.focus2026?.length > 0 && (
              <div className="pq-card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <TrendingUp size={17} color={subjectColor} />
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
                    2026 Prelims Outlook for {resolvedTheme.themeName}
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5, lineHeight: 1.5 }}>
                  {resolvedTheme.focus2026.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
