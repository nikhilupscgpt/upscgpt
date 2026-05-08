import Link from 'next/link';

export default function AnswerCard({ node, query, highlightText }) {
  if (!node) return null;

  const metadata = node.metadata || {};
  const themes = metadata.keyThemes || [];
  const subtopics = metadata.subtopics || [];
  const gsPapers = node.gsPapers || [];
  const examRelevance = (metadata.examRelevance || 'High').replace(/=GEMINI\(.*\)/, 'High'); // Clean up formula artifacts
  const linkedPyqs = node.linkedPyqs || [];

  return (
    <div className="answer-card-rich">
      <div className="answer-header">
        <div className="answer-title-row">
          <span className="answer-pin">📌</span>
          <h2 className="answer-title">{highlightText(node.title, query)}</h2>
        </div>
        <div className="answer-meta-row">
          <span className="meta-tag gs-tag">{gsPapers.join(', ') || 'GS General'}</span>
          <span className="meta-separator">•</span>
          <span className="meta-tag domain-tag">{node.domain}</span>
          <span className="meta-separator">•</span>
          <span className={`meta-tag relevance-tag ${examRelevance.toLowerCase()}`}>
            {examRelevance} Relevance
          </span>
        </div>
      </div>

      <div className="answer-body">
        {themes.length > 0 && (
          <div className="answer-section">
            <h4 className="section-label">Key Themes:</h4>
            <div className="theme-chips">
              {themes.map((theme, i) => (
                <span key={i} className="theme-chip-mini">{highlightText(theme, query)}</span>
              ))}
            </div>
          </div>
        )}

        {subtopics.length > 0 && (
          <div className="answer-section">
            <h4 className="section-label">Subtopics:</h4>
            <p className="subtopics-list">
              {subtopics.join(' • ')}
            </p>
          </div>
        )}

        <div className="answer-section pyq-section">
          <h4 className="section-label">📝 PYQs on this topic:</h4>
          {linkedPyqs.length > 0 ? (
            <ul className="linked-pyq-list">
              {linkedPyqs.map((pyq, i) => (
                <li key={i} className="linked-pyq-item">
                  <span className="pyq-year">{pyq.year} {pyq.paper}</span> — {pyq.questionText.substring(0, 100)}...
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-pyqs-note">No specific past questions indexed for this sub-node yet.</p>
          )}
        </div>
      </div>

      <div className="answer-footer">
        <Link href={`/issues/${node.slug}`} className="answer-cta primary">
          Open Full Node →
        </Link>
        <Link href={`/atlas?node=${node.slug}`} className="answer-cta secondary">
          View on Map 🗺️
        </Link>
      </div>

      <style jsx>{`
        .answer-card-rich {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), 0 0 20px rgba(56, 189, 248, 0.1);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .answer-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .answer-pin {
          font-size: 1.5rem;
        }

        .answer-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .answer-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .meta-tag {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .gs-tag { color: #38bdf8; }
        .domain-tag { color: #818cf8; }
        .relevance-tag.high { color: #fbbf24; }
        .relevance-tag.medium { color: #34d399; }
        .relevance-tag.low { color: #94a3b8; }

        .meta-separator {
          color: rgba(255, 255, 255, 0.2);
        }

        .answer-section {
          margin-bottom: 20px;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 10px 0;
        }

        .theme-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .theme-chip-mini {
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .subtopics-list {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0;
        }

        .linked-pyq-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .linked-pyq-item {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
          padding-left: 12px;
          border-left: 2px solid rgba(56, 189, 248, 0.3);
        }

        .pyq-year {
          font-weight: 700;
          color: #38bdf8;
        }

        .no-pyqs-note {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.3);
          font-style: italic;
        }

        .answer-footer {
          display: flex;
          gap: 16px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .answer-cta {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s;
        }

        .answer-cta.primary {
          background: #38bdf8;
          color: #0f172a;
        }

        .answer-cta.primary:hover {
          background: #7dd3fc;
          transform: translateY(-2px);
        }

        .answer-cta.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .answer-cta.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
