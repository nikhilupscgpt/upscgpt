'use client';

import React, { useMemo, useState } from 'react';
import GroupSilhouette from '@/components/environment-atlas/GroupSilhouette';
import {
  adaptSpecies,
  IUCN_SCALE_ORDER,
  truncateDescription,
} from '@/lib/environment/species-adapter';

export default function SpeciesBody({
  activeItem,
  displayIndex,
  totalCount,
  startWithCount,
  studyTab,
  onTabChange,
}) {
  const adapted = useMemo(() => adaptSpecies(activeItem), [activeItem]);

  const [imgFailed, setImgFailed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [showAllPoints, setShowAllPoints] = useState(false);
  const [revealedPyqs, setRevealedPyqs] = useState({});

  if (!adapted) return null;

  const { photo, protection, prelimsPoints, pastQuestions } = adapted;
  const showPhoto = Boolean(photo.url && photo.hasValidCredit && !imgFailed);

  const { text: truncatedDesc, isTruncated } = truncateDescription(adapted.description, 240);
  const visibleDesc = descExpanded ? adapted.description : truncatedDesc;

  const visiblePoints = showAllPoints ? prelimsPoints : prelimsPoints.slice(0, 5);

  const togglePyqAnswer = (id) => {
    setRevealedPyqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* Hero Photo 16:9 (max-height: 420px) with credit gate & silhouette fallback */}
      <div className="photo">
        {showPhoto ? (
          <img
            src={photo.url}
            alt={adapted.title}
            style={{
              objectPosition: `${photo.focusX}% ${photo.focusY}%`,
            }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="photo-fallback" aria-label={`${adapted.title} illustration`}>
            <GroupSilhouette group={adapted.category} size={96} />
            <span className="photo-fallback-label">
              {adapted.category || 'Species'} · Photo unavailable
            </span>
          </div>
        )}

        <div className="counter">
          {displayIndex} of {totalCount}
          {adapted.startWith && startWithCount > 0 && ` · Start with these ${startWithCount}`}
        </div>

        {showPhoto && (
          <div className="credit">
            Photo: {photo.author} · {photo.licence}
            {photo.sourceUrl && (
              <>
                {' · '}
                <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                  Source
                </a>
              </>
            )}
          </div>
        )}
      </div>

      {/* Title Block */}
      <div className="species-header">
        <div>
          <h1>{adapted.title}</h1>
          <div className="sci-row">
            {adapted.subtitle && <span className="sci">{adapted.subtitle}</span>}
            {adapted.category && (
              <>
                {adapted.subtitle && <span className="sci-dot">•</span>}
                <span className="cat-tag">{adapted.category}</span>
              </>
            )}
            {adapted.headlineStat && (
              <>
                <span className="sci-dot">•</span>
                <span className="headline-stat-pill">{adapted.headlineStat}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {adapted.description && (
        <p className="oneline">
          {visibleDesc}
          {isTruncated && (
            <>
              {' '}
              <button
                type="button"
                className="env-more-btn"
                onClick={() => setDescExpanded((v) => !v)}
              >
                {descExpanded ? 'Less' : 'More'}
              </button>
            </>
          )}
        </p>
      )}

      {/* How protected is it? */}
      <section className="sec" aria-labelledby="env-protection-heading">
        <h2 id="env-protection-heading">
          <span>How protected is it?</span>
          <button type="button" onClick={() => setShowExplain((v) => !v)}>
            {showExplain ? 'Hide' : 'What do these mean?'}
          </button>
        </h2>

        {showExplain && (
          <div className="explain">
            <p>
              <b>IUCN Red List</b> is a global extinction-risk assessment; <b>VU, EN, and CR</b> count as &ldquo;Threatened&rdquo;.
            </p>
            <p>
              <b>WPA 1972</b> is Indian criminal law (rationalised in the 2022 Amendment); Schedule I carries the highest penalties.
            </p>
            <p>
              <b>CITES</b> is an international treaty on cross-border wildlife trade; Appendix I bans commercial trade.
            </p>
          </div>
        )}

        <div className="prot">
          <div className="pbox">
            <div className="q">Risk level (IUCN)</div>
            <div className="a">
              <span
                className={`iucn-dot iucn-dot-${protection.iucnCode.toLowerCase()}`}
                aria-hidden="true"
              />
              <span>{protection.iucnLabel}</span>
            </div>
            <div className="why">{protection.iucnWhy}</div>
          </div>

          <div className="pbox">
            <div className="q">Indian law (WPA 1972)</div>
            <div className="a">{protection.wpa}</div>
            <div className="why">{protection.wpaWhy}</div>
          </div>

          <div className="pbox">
            <div className="q">Trade rules (CITES)</div>
            <div className="a">{protection.cites}</div>
            <div className="why">{protection.citesWhy}</div>
          </div>
        </div>

        {/* Single compact NE -> EX IUCN scale */}
        <div
          className="iucn-scale-wrap"
          role="img"
          aria-label={`IUCN Red List scale from Not Evaluated to Extinct; current status is ${protection.iucnLabel}`}
        >
          <div className="iucn-scale">
            {IUCN_SCALE_ORDER.map((step) => {
              const isActive = step.code === protection.iucnCode;
              return (
                <div
                  key={step.code}
                  className={`iucn-scale-step ${isActive ? 'active' : ''}`}
                  data-status={step.code.toLowerCase()}
                  title={`${step.code}: ${step.name}`}
                >
                  <span className="iucn-scale-bar" />
                  <span className="iucn-scale-code">{step.code}</span>
                </div>
              );
            })}
          </div>
          <div className="iucn-scale-legend" aria-hidden="true">
            <span>Lower risk (LC–NT)</span>
            <span>Threatened (VU–CR)</span>
            <span>Extinct (EW–EX)</span>
          </div>
        </div>
      </section>

      {/* Study Tabs: What Prelims asks | Past UPSC Questions */}
      <section className="sec" aria-label="Study notes and past questions">
        <div className="study-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={studyTab === 'notes'}
            className={`study-tab ${studyTab === 'notes' ? 'on' : ''}`}
            onClick={() => onTabChange('notes')}
          >
            What Prelims asks
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={studyTab === 'pyqs'}
            className={`study-tab ${studyTab === 'pyqs' ? 'on' : ''}`}
            onClick={() => onTabChange('pyqs')}
          >
            Past UPSC Questions
            {pastQuestions.length > 0 && (
              <span className="tab-count">{pastQuestions.length}</span>
            )}
          </button>
        </div>

        {studyTab === 'notes' ? (
          <div className="editorial-notes">
            {visiblePoints.length > 0 ? (
              visiblePoints.map((pt, idx) => (
                <div
                  key={`${adapted.slug}-pt-${idx}`}
                  className={`note-callout ${pt.kind === 'trap' ? 'trap' : ''}`}
                >
                  <div className="note-tag">
                    {pt.kind === 'trap' ? 'Common Prelims Trap' : 'Prelims Fact'}
                  </div>
                  <p className="note-headline">{pt.headline}</p>
                  {pt.explanation && <p className="note-detail">{pt.explanation}</p>}
                </div>
              ))
            ) : (
              <p className="env-empty-note">
                Key Prelims notes for this species are being curated.
              </p>
            )}

            {prelimsPoints.length > 5 && (
              <div>
                <button
                  type="button"
                  className="env-show-all-btn"
                  onClick={() => setShowAllPoints((v) => !v)}
                >
                  {showAllPoints ? 'Show fewer' : `Show all (${prelimsPoints.length})`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="pyqbox">
            {pastQuestions.length > 0 ? (
              <div className="pyq-list">
                {pastQuestions.map((q) => {
                  const isRevealed = Boolean(revealedPyqs[q.id]);
                  const hasAnswer = Boolean(q.answer || q.explanation);
                  return (
                    <div key={q.id} className="pyq-item">
                      {q.year && <div className="pyq-year">UPSC Prelims {q.year}</div>}
                      <p className="pyq-stem">{q.stem}</p>
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <ul className="pyq-options">
                          {q.options.map((opt, i) => (
                            <li key={i}>{opt}</li>
                          ))}
                        </ul>
                      )}
                      {hasAnswer && (
                        <div className="pyq-answer-wrap">
                          <button
                            type="button"
                            className="env-show-answer-btn"
                            onClick={() => togglePyqAnswer(q.id)}
                          >
                            {isRevealed ? 'Hide answer' : 'Show answer'}
                          </button>
                          {isRevealed && (
                            <div className="pyq-answer-box">
                              {q.answer && (
                                <div className="pyq-answer-line">
                                  <b>Answer:</b> {q.answer}
                                </div>
                              )}
                              {q.explanation && (
                                <div className="pyq-explanation-line">{q.explanation}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="env-empty-note">
                No direct UPSC CSE PYQ logged for this species yet — focus on its IUCN status, WPA schedule, and protected areas.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
