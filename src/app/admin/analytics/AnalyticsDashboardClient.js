'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Layers,
  IndianRupee,
  Megaphone,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', Icon: BarChart3 },
  { id: 'learning', label: 'Learning', Icon: BookOpen },
  { id: 'product', label: 'Product', Icon: Layers },
  { id: 'costs', label: 'Costs & Ops', Icon: IndianRupee },
  { id: 'marketing', label: 'Marketing', Icon: Megaphone },
  { id: 'security', label: 'Security', Icon: ShieldAlert },
];

const PERIODS = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

function formatInr(paise) {
  const inr = Number(paise || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(inr);
}

function formatNum(n) {
  return new Intl.NumberFormat('en-IN').format(Number(n || 0));
}

function DeltaBadge({ curr, prev }) {
  if (prev === null || prev === undefined || Number(prev) === 0) return null;
  const c = Number(curr || 0);
  const p = Number(prev || 0);
  const pct = ((c - p) / Math.abs(p)) * 100;
  const sign = pct >= 0 ? '+' : '';
  const positive = pct >= 0;
  return (
    <span className={`ad-delta ${positive ? 'ad-delta-pos' : 'ad-delta-neg'}`}>
      {sign}{pct.toFixed(1)}% vs prev
    </span>
  );
}

function StatCard({ title, value, sub, curr, prev, accent }) {
  return (
    <div className="ad-card ad-stat-card" style={accent ? { borderTop: `2px solid ${accent}` } : undefined}>
      <div className="ad-stat-title">{title}</div>
      <div className="ad-stat-row">
        <div className="ad-stat-value">{value}</div>
        <DeltaBadge curr={curr} prev={prev} />
      </div>
      {sub ? <div className="ad-stat-sub">{sub}</div> : null}
    </div>
  );
}

export default function AnalyticsDashboardClient({ adminEmail }) {
  const [period, setPeriod] = useState('day');
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flags, setFlags] = useState([]);
  const [partners, setPartners] = useState([]);
  const [partnerForm, setPartnerForm] = useState({
    code: '',
    partnerName: '',
    commissionPct: '10',
    discountPct: '10',
  });
  const [csvType, setCsvType] = useState('marketing_spend');
  const [csvText, setCsvText] = useState('');
  const [opsStatus, setOpsStatus] = useState(null);

  const loadAnalytics = useCallback(async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const [mainRes, flagsRes, partnersRes] = await Promise.all([
        fetch(`/api/admin/analytics?period=${selectedPeriod}`, { cache: 'no-store' }),
        fetch('/api/admin/analytics/flags', { cache: 'no-store' }),
        fetch('/api/admin/analytics/partners', { cache: 'no-store' }),
      ]);
      if (!mainRes.ok) {
        const errJson = await mainRes.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${mainRes.status}`);
      }
      const json = await mainRes.json();
      setData(json);
      if (flagsRes.ok) {
        const fj = await flagsRes.json();
        setFlags(fj.flags || []);
      }
      if (partnersRes.ok) {
        const pj = await partnersRes.json();
        setPartners(pj.partners || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(period);
  }, [period, loadAnalytics]);

  async function toggleFlag(key, enabled) {
    setOpsStatus(null);
    const res = await fetch('/api/admin/analytics/flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, enabled }),
    });
    if (res.ok) {
      const { flag } = await res.json();
      setFlags((prevFlags) => prevFlags.map((f) => (f.key === key ? flag : f)));
      setOpsStatus(`Updated ${key} = ${enabled}`);
    }
  }

  async function savePartner(e) {
    e.preventDefault();
    setOpsStatus(null);
    const res = await fetch('/api/admin/analytics/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partnerForm),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setPartnerForm({ code: '', partnerName: '', commissionPct: '10', discountPct: '10' });
      setOpsStatus(`Saved partner code ${json.partner?.code}`);
      loadAnalytics(period);
    } else {
      setOpsStatus(json.error || 'Failed to save partner');
    }
  }

  async function togglePartnerActive(id, isActive) {
    const res = await fetch('/api/admin/analytics/partners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive }),
    });
    if (res.ok) loadAnalytics(period);
  }

  async function submitCsvImport(e) {
    e.preventDefault();
    setOpsStatus(null);
    const res = await fetch('/api/admin/analytics/import-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: csvType, csv: csvText }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setCsvText('');
      setOpsStatus(`Imported ${json.imported} ${csvType} row(s).`);
      loadAnalytics(period);
    } else {
      setOpsStatus(json.error || 'CSV import failed');
    }
  }

  async function resolveQuestionReport(reportId, status) {
    setOpsStatus(null);
    const res = await fetch('/api/admin/analytics/question-review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status }),
    });
    if (res.ok) {
      setOpsStatus(`Marked report ${reportId} as ${status}`);
      loadAnalytics(period);
    }
  }

  const today = data?.todayLive || {};
  const curr = data?.overview?.current || {};
  const prev = data?.overview?.previous || {};

  return (
    <div className="ad-shell">
      <header className="ad-header">
        <div className="ad-header-inner">
          <div>
            <div className="ad-breadcrumb">
              <Link href="/admin" className="ad-back-link">
                <ArrowLeft size={14} />
                <span>Admin</span>
              </Link>
              <span className="ad-sep">/</span>
              <h1 className="ad-title">Analytics &amp; Telemetry</h1>
            </div>
            <p className="ad-subtitle">
              IST ({data?.todayIst || 'Asia/Kolkata'}) &middot; Signed in as <strong>{adminEmail}</strong>
              {today.cachedAt
                ? ` \u00b7 Live today cached at ${new Date(today.cachedAt).toLocaleTimeString()}`
                : ''}
            </p>
          </div>

          <div className="ad-controls">
            <div className="ad-segmented">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`ad-seg-btn ${period === p.id ? 'active' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => loadAnalytics(period)}
              className="ad-refresh-btn"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'ad-spin' : ''} />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        <nav className="ad-tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`ad-tab-btn ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="ad-main">
        {error && (
          <div className="ad-alert ad-alert-error">
            <strong>Failed to load analytics:</strong> {error}
          </div>
        )}

        {opsStatus && <div className="ad-alert ad-alert-info">{opsStatus}</div>}

        {loading && !data ? (
          <div className="ad-card ad-empty">Loading telemetry...</div>
        ) : null}

        {data && activeTab === 'overview' && (
          <div className="ad-stack">
            <section>
              <h2 className="ad-section-label">Live Today (IST, 60s Cache)</h2>
              <div className="ad-grid-4">
                <StatCard
                  title="Active Learners Today"
                  value={formatNum(today.activeUsers)}
                  sub={`${formatNum(today.signups)} new signups today`}
                  accent="var(--color-blue)"
                />
                <StatCard
                  title="Answers Today"
                  value={formatNum(today.answers)}
                  sub={`Accuracy: ${today.accuracyPct ?? 0}%`}
                  accent="var(--color-emerald)"
                />
                <StatCard
                  title="Revenue Today"
                  value={formatInr(today.revenuePaise)}
                  sub={`${formatNum(today.paidOrders)} paid \u00b7 ${formatNum(today.abandonedOrders)} abandoned`}
                  accent="var(--color-purple)"
                />
                <StatCard
                  title="AI + Msg Cost Today"
                  value={formatInr(today.costPaise)}
                  sub={`${formatNum(today.securityEvents)} security events \u00b7 ${formatNum(today.openQuestionReports)} open flags`}
                  accent="var(--color-amber)"
                />
              </div>
            </section>

            <section>
              <h2 className="ad-section-label">
                Latest Completed {period.toUpperCase()} Rollup vs Previous
              </h2>
              <div className="ad-grid-4">
                <StatCard
                  title="Active Users"
                  value={formatNum(curr.active_users)}
                  curr={curr.active_users}
                  prev={prev.active_users}
                  sub={`Visitors: ${formatNum(curr.unique_visitors)} \u00b7 Sessions: ${formatNum(curr.sessions)}`}
                />
                <StatCard
                  title="Signups"
                  value={formatNum(curr.signups)}
                  curr={curr.signups}
                  prev={prev.signups}
                  sub={`New visitors: ${formatNum(curr.new_visitors)}`}
                />
                <StatCard
                  title="Subscriptions"
                  value={formatNum((curr.subs_new || 0) + (curr.subs_renewal || 0))}
                  curr={(curr.subs_new || 0) + (curr.subs_renewal || 0)}
                  prev={(prev.subs_new || 0) + (prev.subs_renewal || 0)}
                  sub={`New: ${formatNum(curr.subs_new)} \u00b7 Renewal: ${formatNum(curr.subs_renewal)} \u00b7 PRO EOD: ${formatNum(curr.active_pro_eod)}`}
                />
                <StatCard
                  title="Period Revenue"
                  value={formatInr(curr.revenue_paise)}
                  curr={curr.revenue_paise}
                  prev={prev.revenue_paise}
                  sub={`Abandoned carts: ${formatNum(curr.carts_abandoned)} \u00b7 Failed: ${formatNum(curr.payments_failed)}`}
                />
              </div>
            </section>

            <section className="ad-card ad-table-card">
              <div className="ad-card-header">{period.toUpperCase()} Trend (kpi_period)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Period Start (IST)</th>
                      <th className="num">Visitors</th>
                      <th className="num">Active Users</th>
                      <th className="num">Signups</th>
                      <th className="num">Carts</th>
                      <th className="num">Paid Subs</th>
                      <th className="num">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.overview?.series || []).map((row) => (
                      <tr key={String(row.period_start)}>
                        <td className="mono">{String(row.period_start).slice(0, 10)}</td>
                        <td className="num">{formatNum(row.unique_visitors)}</td>
                        <td className="num">{formatNum(row.active_users)}</td>
                        <td className="num">{formatNum(row.signups)}</td>
                        <td className="num">{formatNum(row.carts)}</td>
                        <td className="num">{formatNum((row.subs_new || 0) + (row.subs_renewal || 0))}</td>
                        <td className="num strong">{formatInr(row.revenue_paise)}</td>
                      </tr>
                    ))}
                    {(!data.overview?.series || data.overview.series.length === 0) && (
                      <tr>
                        <td colSpan={7} className="ad-empty-cell">
                          No completed rollup rows yet (nightly job runs at 00:30 IST).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {data && activeTab === 'learning' && (
          <div className="ad-stack">
            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Subject &amp; Module Performance (learning_daily)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Subject</th>
                      <th className="num">Answered</th>
                      <th className="num">Correct</th>
                      <th className="num">Accuracy</th>
                      <th className="num">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.learning?.subjects || []).map((row, idx) => {
                      const acc = row.answered > 0 ? ((row.correct / row.answered) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={`${row.module}-${row.subject}-${idx}`}>
                          <td>{row.module}</td>
                          <td className="strong">{row.subject}</td>
                          <td className="num">{formatNum(row.answered)}</td>
                          <td className="num">{formatNum(row.correct)}</td>
                          <td className="num">{acc}%</td>
                          <td className="num">{formatNum(row.users)}</td>
                        </tr>
                      );
                    })}
                    {(!data.learning?.subjects || data.learning.subjects.length === 0) && (
                      <tr>
                        <td colSpan={6} className="ad-empty-cell">No learning rollups recorded in this window.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Check These Answer Keys (QuestionStats)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Source Type</th>
                      <th>Question ID</th>
                      <th className="num">Attempts</th>
                      <th className="num">pCorrect</th>
                      <th className="num">Discrimination</th>
                      <th className="num">Median (s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.learning?.questionStats || []).map((q) => (
                      <tr key={`${q.sourceType}-${q.sourceId}`}>
                        <td>{q.sourceType}</td>
                        <td className="mono">{q.sourceId}</td>
                        <td className="num">{formatNum(q.attempts)}</td>
                        <td className="num">{(Number(q.pCorrect || 0) * 100).toFixed(1)}%</td>
                        <td className={`num ${Number(q.discrimination) < 0 ? 'bad strong' : ''}`}>
                          {q.discrimination !== null && q.discrimination !== undefined
                            ? Number(q.discrimination).toFixed(3)
                            : '-'}
                        </td>
                        <td className="num">{formatNum(q.medianSec)}</td>
                      </tr>
                    ))}
                    {(!data.learning?.questionStats || data.learning.questionStats.length === 0) && (
                      <tr>
                        <td colSpan={6} className="ad-empty-cell">No question stats yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Open Question Reports (QuestionReport)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Question ID</th>
                      <th>Reason</th>
                      <th>Note</th>
                      <th className="num">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.learning?.openReports || []).map((rep) => (
                      <tr key={rep.id}>
                        <td>{rep.sourceType}</td>
                        <td className="mono">{rep.sourceId}</td>
                        <td className="strong">{rep.reason}</td>
                        <td className="muted">{rep.note || '-'}</td>
                        <td className="num">
                          <div className="ad-btn-group">
                            <button
                              type="button"
                              onClick={() => resolveQuestionReport(rep.id, 'fixed')}
                              className="ad-btn ad-btn-good"
                            >
                              Mark Fixed
                            </button>
                            <button
                              type="button"
                              onClick={() => resolveQuestionReport(rep.id, 'rejected')}
                              className="ad-btn ad-btn-ghost"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!data.learning?.openReports || data.learning.openReports.length === 0) && (
                      <tr>
                        <td colSpan={5} className="ad-empty-cell">No open question reports.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {data && activeTab === 'product' && (
          <div className="ad-grid-2">
            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Feature Adoption (feature_daily)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Feature</th>
                      <th className="num">Users</th>
                      <th className="num">Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.product?.features || []).map((f, i) => (
                      <tr key={`${f.module}-${f.feature}-${i}`}>
                        <td>{f.module}</td>
                        <td className="mono">{f.feature}</td>
                        <td className="num">{formatNum(f.users)}</td>
                        <td className="num">{formatNum(f.events)}</td>
                      </tr>
                    ))}
                    {(!data.product?.features || data.product.features.length === 0) && (
                      <tr>
                        <td colSpan={4} className="ad-empty-cell">No feature usage data yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Zero-Result Searches (search_zero)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Scope</th>
                      <th>Query</th>
                      <th className="num">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.product?.searchZero || []).map((s, i) => (
                      <tr key={`${s.scope}-${s.query}-${i}`}>
                        <td>{s.scope}</td>
                        <td>{s.query}</td>
                        <td className="num">{formatNum(s.count)}</td>
                      </tr>
                    ))}
                    {(!data.product?.searchZero || data.product.searchZero.length === 0) && (
                      <tr>
                        <td colSpan={3} className="ad-empty-cell">No zero-result searches recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {data && activeTab === 'costs' && (
          <div className="ad-stack">
            <section className="ad-card ad-panel">
              <div className="ad-card-header-inline">Emergency Kill Switches (FeatureFlag)</div>
              <div className="ad-grid-3">
                {flags.map((f) => (
                  <div key={f.key} className="ad-flag-box">
                    <div>
                      <div className="mono strong">{f.key}</div>
                      <div className="ad-stat-sub">{f.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFlag(f.key, !f.enabled)}
                      className={`ad-btn ${f.enabled ? 'ad-btn-danger' : 'ad-btn-ghost'}`}
                    >
                      {f.enabled ? 'ENABLED' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Variable Cost Breakdown (cost_daily)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Provider</th>
                      <th>Feature</th>
                      <th className="num">Quantity</th>
                      <th className="num">Cost (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.costs?.breakdown || []).map((c, i) => (
                      <tr key={`${c.category}-${c.provider}-${c.feature}-${i}`}>
                        <td>{c.category}</td>
                        <td>{c.provider}</td>
                        <td>{c.feature}</td>
                        <td className="num">{formatNum(Math.round(c.quantity || 0))}</td>
                        <td className="num strong">{formatInr(c.cost_paise)}</td>
                      </tr>
                    ))}
                    {(!data.costs?.breakdown || data.costs.breakdown.length === 0) && (
                      <tr>
                        <td colSpan={5} className="ad-empty-cell">No cost rollup rows yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Messaging Deliverability (message_daily)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>Purpose</th>
                      <th className="num">Sent</th>
                      <th className="num">Delivered</th>
                      <th className="num">Failed</th>
                      <th className="num">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.costs?.messages || []).map((m, i) => (
                      <tr key={`${m.channel}-${m.purpose}-${i}`}>
                        <td className="strong uppercase">{m.channel}</td>
                        <td>{m.purpose}</td>
                        <td className="num">{formatNum(m.sent)}</td>
                        <td className="num">{formatNum(m.delivered)}</td>
                        <td className="num bad">{formatNum(m.failed)}</td>
                        <td className="num">{formatInr(m.cost_paise)}</td>
                      </tr>
                    ))}
                    {(!data.costs?.messages || data.costs.messages.length === 0) && (
                      <tr>
                        <td colSpan={6} className="ad-empty-cell">No messaging rollup rows yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {data && activeTab === 'marketing' && (
          <div className="ad-stack">
            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Channel Attribution (marketing_daily)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Campaign</th>
                      <th className="num">Visitors</th>
                      <th className="num">Signups</th>
                      <th className="num">Subs</th>
                      <th className="num">Revenue</th>
                      <th className="num">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.marketing?.attribution || []).map((row, i) => (
                      <tr key={`${row.source}-${row.campaign}-${i}`}>
                        <td>{row.source}</td>
                        <td>{row.campaign}</td>
                        <td className="num">{formatNum(row.visitors)}</td>
                        <td className="num">{formatNum(row.signups)}</td>
                        <td className="num">{formatNum(row.subs)}</td>
                        <td className="num strong">{formatInr(row.revenue_paise)}</td>
                        <td className="num">{formatInr(row.spend_paise)}</td>
                      </tr>
                    ))}
                    {(!data.marketing?.attribution || data.marketing.attribution.length === 0) && (
                      <tr>
                        <td colSpan={7} className="ad-empty-cell">No marketing attribution rows yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ad-card ad-panel">
              <div className="ad-card-header-inline">Partner Codes (PartnerCode)</div>
              <form onSubmit={savePartner} className="ad-form-grid">
                <input
                  type="text"
                  placeholder="CODE (e.g. TOPPER10)"
                  value={partnerForm.code}
                  onChange={(e) => setPartnerForm({ ...partnerForm, code: e.target.value })}
                  className="ad-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Partner Name"
                  value={partnerForm.partnerName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, partnerName: e.target.value })}
                  className="ad-input"
                  required
                />
                <input
                  type="number"
                  placeholder="Comm %"
                  value={partnerForm.commissionPct}
                  onChange={(e) => setPartnerForm({ ...partnerForm, commissionPct: e.target.value })}
                  className="ad-input"
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={partnerForm.discountPct}
                  onChange={(e) => setPartnerForm({ ...partnerForm, discountPct: e.target.value })}
                  className="ad-input"
                />
                <button type="submit" className="ad-btn ad-btn-primary">
                  Save Partner
                </button>
              </form>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Partner</th>
                      <th className="num">Signups</th>
                      <th className="num">PRO</th>
                      <th className="num">Revenue</th>
                      <th className="num">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((p) => (
                      <tr key={p.id}>
                        <td className="mono strong">{p.code}</td>
                        <td>{p.partnerName}</td>
                        <td className="num">{formatNum(p.signups)}</td>
                        <td className="num">{formatNum(p.proUsers)}</td>
                        <td className="num">{formatInr(p.revenuePaise)}</td>
                        <td className="num">
                          <button
                            type="button"
                            onClick={() => togglePartnerActive(p.id, !p.isActive)}
                            className={`ad-btn ${p.isActive ? 'ad-btn-good' : 'ad-btn-ghost'}`}
                          >
                            {p.isActive ? 'Active' : 'Paused'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="ad-grid-2">
              <section className="ad-card ad-panel">
                <div className="ad-card-header-inline">CSV Import (MarketingSpend &amp; FixedCost)</div>
                <form onSubmit={submitCsvImport} className="ad-stack-sm">
                  <select
                    value={csvType}
                    onChange={(e) => setCsvType(e.target.value)}
                    className="ad-input"
                  >
                    <option value="marketing_spend">MarketingSpend (date,channel,campaign,amount_inr)</option>
                    <option value="fixed_cost">FixedCost (month,item,amount_inr)</option>
                  </select>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={
                      csvType === 'marketing_spend'
                        ? 'date,channel,campaign,amount_inr\n2026-11-10,google_ads,Prelims_2027,1500'
                        : 'month,item,amount_inr\n2026-11,Vercel Pro,1700'
                    }
                    className="ad-input mono"
                    required
                  />
                  <button type="submit" className="ad-btn ad-btn-primary">
                    Import CSV
                  </button>
                </form>
              </section>

              <section className="ad-card ad-table-card">
                <div className="ad-card-header">Google Search Console (GscDailyMetric)</div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Query</th>
                        <th>Page</th>
                        <th className="num">Clicks</th>
                        <th className="num">Pos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.marketing?.gscMetrics || []).map((g) => (
                        <tr key={g.id}>
                          <td>{g.query}</td>
                          <td className="mono">{g.page}</td>
                          <td className="num">{formatNum(g.clicks)}</td>
                          <td className="num">{Number(g.position || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                      {(!data.marketing?.gscMetrics || data.marketing.gscMetrics.length === 0) && (
                        <tr>
                          <td colSpan={4} className="ad-empty-cell">No GSC metrics imported yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}

        {data && activeTab === 'security' && (
          <div className="ad-stack">
            <div className="ad-grid-3">
              <StatCard
                title="OTP Verified"
                value={formatNum(data.security?.otpSummary?.verified)}
                sub="In selected lookback window"
                accent="var(--color-emerald)"
              />
              <StatCard
                title="OTP Unverified / Expired"
                value={formatNum(data.security?.otpSummary?.unverified)}
                sub="In selected lookback window"
                accent="var(--color-amber)"
              />
              <StatCard
                title="Recent Security Events"
                value={formatNum(data.security?.events?.length)}
                sub="Latest 30 shown below"
                accent="var(--color-rose)"
              />
            </div>

            <section className="ad-card ad-table-card">
              <div className="ad-card-header">Recent Security Events (SecurityEvent)</div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>User ID</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.security?.events || []).map((ev) => (
                      <tr key={ev.id}>
                        <td className="muted">{new Date(ev.at).toLocaleString()}</td>
                        <td className="mono">{ev.type}</td>
                        <td className="mono">{ev.userId || '-'}</td>
                        <td className="mono">{ev.ipFull || '-'}</td>
                      </tr>
                    ))}
                    {(!data.security?.events || data.security.events.length === 0) && (
                      <tr>
                        <td colSpan={4} className="ad-empty-cell">No recent security events.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      <style jsx>{`
        .ad-shell {
          min-height: 100vh;
          background: var(--bg-primary, #050814);
          color: var(--text-primary, #ffffff);
          font-family: var(--font-body, sans-serif);
        }
        .ad-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(5, 8, 20, 0.88);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        }
        .ad-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 18px 24px 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .ad-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ad-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary, #94a3b8);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        }
        .ad-back-link:hover {
          color: #ffffff;
          border-color: var(--border-hover, rgba(255, 255, 255, 0.2));
        }
        .ad-sep {
          color: var(--text-muted, #64748b);
        }
        .ad-title {
          margin: 0;
          font-family: var(--font-display, sans-serif);
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .ad-subtitle {
          margin: 6px 0 0;
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
        }
        .ad-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ad-segmented {
          display: inline-flex;
          padding: 3px;
          border-radius: 10px;
          background: var(--bg-secondary, #0b1124);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        }
        .ad-seg-btn {
          border: 0;
          background: transparent;
          color: var(--text-secondary, #94a3b8);
          font-size: 13px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .ad-seg-btn.active {
          background: var(--brand-gradient, linear-gradient(135deg, #2563eb, #7c3aed));
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
        }
        .ad-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
          background: var(--bg-card, rgba(13, 21, 45, 0.7));
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
        }
        .ad-refresh-btn:hover {
          background: var(--bg-hover, rgba(18, 29, 60, 0.9));
        }
        .ad-tabs {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 12px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }
        .ad-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary, #94a3b8);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .ad-tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }
        .ad-tab-btn.active {
          color: #ffffff;
          background: rgba(59, 130, 246, 0.16);
          border-color: rgba(59, 130, 246, 0.45);
        }
        .ad-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ad-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ad-stack-sm {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ad-section-label {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary, #94a3b8);
        }
        .ad-grid-4 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px;
        }
        .ad-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 14px;
        }
        .ad-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 16px;
        }
        .ad-card {
          background: var(--bg-card, rgba(13, 21, 45, 0.72));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 14px;
          backdrop-filter: blur(12px);
        }
        .ad-stat-card {
          padding: 18px;
        }
        .ad-stat-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary, #94a3b8);
        }
        .ad-stat-row {
          margin-top: 8px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }
        .ad-stat-value {
          font-family: var(--font-display, sans-serif);
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
        }
        .ad-stat-sub {
          margin-top: 6px;
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
        }
        .ad-delta {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
        }
        .ad-delta-pos {
          color: #34d399;
          background: rgba(16, 185, 129, 0.14);
        }
        .ad-delta-neg {
          color: #fb7185;
          background: rgba(239, 68, 68, 0.14);
        }
        .ad-panel {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ad-table-card {
          overflow: hidden;
        }
        .ad-card-header {
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        }
        .ad-card-header-inline {
          font-size: 14px;
          font-weight: 600;
        }
        .ad-table-wrap {
          overflow-x: auto;
        }
        .ad-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .ad-table th {
          text-align: left;
          padding: 10px 16px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary, #94a3b8);
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        }
        .ad-table td {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #e2e8f0;
        }
        .ad-table th.num,
        .ad-table td.num {
          text-align: right;
        }
        .ad-table td.mono,
        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
        }
        .strong {
          font-weight: 600;
          color: #ffffff;
        }
        .muted {
          color: var(--text-secondary, #94a3b8);
        }
        .bad {
          color: #fb7185;
        }
        .uppercase {
          text-transform: uppercase;
        }
        .ad-empty-cell,
        .ad-empty {
          text-align: center;
          padding: 28px 16px;
          color: var(--text-muted, #64748b);
        }
        .ad-alert {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
        }
        .ad-alert-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fecaca;
        }
        .ad-alert-info {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: #bfdbfe;
        }
        .ad-flag-box {
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .ad-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }
        .ad-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
          background: var(--bg-input, rgba(13, 21, 45, 0.5));
          color: #ffffff;
          font-size: 13px;
        }
        .ad-btn-group {
          display: inline-flex;
          gap: 6px;
        }
        .ad-btn {
          border: 0;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .ad-btn-primary {
          background: var(--btn-primary-bg, #2563eb);
          color: #ffffff;
        }
        .ad-btn-good {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .ad-btn-danger {
          background: rgba(239, 68, 68, 0.22);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.45);
        }
        .ad-btn-ghost {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ad-spin {
          animation: adSpin 1s linear infinite;
        }
        @keyframes adSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
