'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'learning', label: 'Learning' },
  { id: 'product', label: 'Product' },
  { id: 'costs', label: 'Costs' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'security', label: 'Security' },
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

function deltaBadge(curr, prev) {
  if (prev === null || prev === undefined || Number(prev) === 0) {
    return null;
  }
  const c = Number(curr || 0);
  const p = Number(prev || 0);
  const pct = ((c - p) / Math.abs(p)) * 100;
  const sign = pct >= 0 ? '+' : '';
  const color = pct >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {sign}{pct.toFixed(1)}% vs prev
    </span>
  );
}

function StatCard({ title, value, sub, delta }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {delta}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
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
  const [partnerForm, setPartnerForm] = useState({ code: '', partnerName: '', commissionPct: '10', discountPct: '10' });
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">
                &larr; Admin
              </Link>
              <span className="text-slate-300">/</span>
              <h1 className="text-xl font-bold text-slate-900">Analytics &amp; Telemetry</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              IST ({data?.todayIst || 'Asia/Kolkata'}) &middot; Signed in as {adminEmail}
              {today.cachedAt ? ` \u00b7 Live today cached at ${new Date(today.cachedAt).toLocaleTimeString()}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    period === p.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => loadAnalytics(period)}
              className="px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6 overflow-x-auto border-t border-slate-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm">
            Failed to load analytics: {error}
          </div>
        )}

        {loading && !data ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            Loading telemetry...
          </div>
        ) : null}

        {data && activeTab === 'overview' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Live Today (IST, 60s Cache)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Active Learners Today"
                  value={formatNum(today.activeUsers)}
                  sub={`${formatNum(today.signups)} new signups today`}
                />
                <StatCard
                  title="Answers Today"
                  value={formatNum(today.answers)}
                  sub={`Accuracy: ${today.accuracyPct ?? 0}%`}
                />
                <StatCard
                  title="Revenue Today"
                  value={formatInr(today.revenuePaise)}
                  sub={`${formatNum(today.paidOrders)} paid \u00b7 ${formatNum(today.abandonedOrders)} abandoned`}
                />
                <StatCard
                  title="AI + Msg Cost Today"
                  value={formatInr(today.costPaise)}
                  sub={`${formatNum(today.securityEvents)} security events \u00b7 ${formatNum(today.openQuestionReports)} open flags`}
                />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Latest Completed {period.toUpperCase()} Rollup vs Previous
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Active Users"
                  value={formatNum(curr.active_users)}
                  delta={deltaBadge(curr.active_users, prev.active_users)}
                  sub={`Visitors: ${formatNum(curr.unique_visitors)} \u00b7 Sessions: ${formatNum(curr.sessions)}`}
                />
                <StatCard
                  title="Signups"
                  value={formatNum(curr.signups)}
                  delta={deltaBadge(curr.signups, prev.signups)}
                  sub={`New visitors: ${formatNum(curr.new_visitors)}`}
                />
                <StatCard
                  title="Subscriptions"
                  value={formatNum((curr.subs_new || 0) + (curr.subs_renewal || 0))}
                  delta={deltaBadge(
                    (curr.subs_new || 0) + (curr.subs_renewal || 0),
                    (prev.subs_new || 0) + (prev.subs_renewal || 0)
                  )}
                  sub={`New: ${formatNum(curr.subs_new)} \u00b7 Renewal: ${formatNum(curr.subs_renewal)} \u00b7 PRO EOD: ${formatNum(curr.active_pro_eod)}`}
                />
                <StatCard
                  title="Period Revenue"
                  value={formatInr(curr.revenue_paise)}
                  delta={deltaBadge(curr.revenue_paise, prev.revenue_paise)}
                  sub={`Abandoned carts: ${formatNum(curr.carts_abandoned)} \u00b7 Failed: ${formatNum(curr.payments_failed)}`}
                />
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                {period.toUpperCase()} Trend (`kpi_period`)
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Period Start (IST)</th>
                      <th className="px-4 py-2 text-right">Visitors</th>
                      <th className="px-4 py-2 text-right">Active Users</th>
                      <th className="px-4 py-2 text-right">Signups</th>
                      <th className="px-4 py-2 text-right">Carts</th>
                      <th className="px-4 py-2 text-right">Paid Subs</th>
                      <th className="px-4 py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.overview?.series || []).map((row) => (
                      <tr key={String(row.period_start)}>
                        <td className="px-4 py-2 font-mono text-xs">
                          {String(row.period_start).slice(0, 10)}
                        </td>
                        <td className="px-4 py-2 text-right">{formatNum(row.unique_visitors)}</td>
                        <td className="px-4 py-2 text-right">{formatNum(row.active_users)}</td>
                        <td className="px-4 py-2 text-right">{formatNum(row.signups)}</td>
                        <td className="px-4 py-2 text-right">{formatNum(row.carts)}</td>
                        <td className="px-4 py-2 text-right">
                          {formatNum((row.subs_new || 0) + (row.subs_renewal || 0))}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatInr(row.revenue_paise)}
                        </td>
                      </tr>
                    ))}
                    {(!data.overview?.series || data.overview.series.length === 0) && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          No completed rollup rows yet (runs nightly at 00:30 IST).
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
          <div className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Subject &amp; Module Performance (`learning_daily`)
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Module</th>
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-right">Answered</th>
                      <th className="px-4 py-2 text-right">Correct</th>
                      <th className="px-4 py-2 text-right">Accuracy</th>
                      <th className="px-4 py-2 text-right">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.learning?.subjects || []).map((row, idx) => {
                      const acc = row.answered > 0 ? ((row.correct / row.answered) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={`${row.module}-${row.subject}-${idx}`}>
                          <td className="px-4 py-2">{row.module}</td>
                          <td className="px-4 py-2 font-medium">{row.subject}</td>
                          <td className="px-4 py-2 text-right">{formatNum(row.answered)}</td>
                          <td className="px-4 py-2 text-right">{formatNum(row.correct)}</td>
                          <td className="px-4 py-2 text-right">{acc}%</td>
                          <td className="px-4 py-2 text-right">{formatNum(row.users)}</td>
                        </tr>
                      );
                    })}
                    {(!data.learning?.subjects || data.learning.subjects.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                          No learning rollups recorded in this window.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Check These Answer Keys (`QuestionStats` — negative discrimination / low accuracy)
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Source Type</th>
                      <th className="px-4 py-2 text-left">Question ID</th>
                      <th className="px-4 py-2 text-right">Attempts</th>
                      <th className="px-4 py-2 text-right">pCorrect</th>
                      <th className="px-4 py-2 text-right">Discrimination</th>
                      <th className="px-4 py-2 text-right">Median (s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.learning?.questionStats || []).map((q) => (
                      <tr key={`${q.sourceType}-${q.sourceId}`}>
                        <td className="px-4 py-2">{q.sourceType}</td>
                        <td className="px-4 py-2 font-mono text-xs">{q.sourceId}</td>
                        <td className="px-4 py-2 text-right">{formatNum(q.attempts)}</td>
                        <td className="px-4 py-2 text-right">{(Number(q.pCorrect || 0) * 100).toFixed(1)}%</td>
                        <td className={`px-4 py-2 text-right font-semibold ${Number(q.discrimination) < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {q.discrimination !== null && q.discrimination !== undefined ? Number(q.discrimination).toFixed(3) : '-'}
                        </td>
                        <td className="px-4 py-2 text-right">{formatNum(q.medianSec)}</td>
                      </tr>
                    ))}
                    {(!data.learning?.questionStats || data.learning.questionStats.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                          No question stats yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Open Question Reports (`QuestionReport`)
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Source</th>
                      <th className="px-4 py-2 text-left">Question ID</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                      <th className="px-4 py-2 text-left">Note</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.learning?.openReports || []).map((rep) => (
                      <tr key={rep.id}>
                        <td className="px-4 py-2">{rep.sourceType}</td>
                        <td className="px-4 py-2 font-mono text-xs">{rep.sourceId}</td>
                        <td className="px-4 py-2 font-medium">{rep.reason}</td>
                        <td className="px-4 py-2 text-xs text-slate-600">{rep.note || '-'}</td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => resolveQuestionReport(rep.id, 'fixed')}
                            className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Mark Fixed
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveQuestionReport(rep.id, 'rejected')}
                            className="px-2 py-1 text-xs rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!data.learning?.openReports || data.learning.openReports.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                          No open question reports.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {data && activeTab === 'product' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Feature Adoption (`feature_daily`)
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Module</th>
                    <th className="px-4 py-2 text-left">Feature</th>
                    <th className="px-4 py-2 text-right">Users</th>
                    <th className="px-4 py-2 text-right">Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.product?.features || []).map((f, i) => (
                    <tr key={`${f.module}-${f.feature}-${i}`}>
                      <td className="px-4 py-2">{f.module}</td>
                      <td className="px-4 py-2 font-mono text-xs">{f.feature}</td>
                      <td className="px-4 py-2 text-right">{formatNum(f.users)}</td>
                      <td className="px-4 py-2 text-right">{formatNum(f.events)}</td>
                    </tr>
                  ))}
                  {(!data.product?.features || data.product.features.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        No feature usage data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Zero-Result Searches (`search_zero`)
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Scope</th>
                    <th className="px-4 py-2 text-left">Query</th>
                    <th className="px-4 py-2 text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.product?.searchZero || []).map((s, i) => (
                    <tr key={`${s.scope}-${s.query}-${i}`}>
                      <td className="px-4 py-2">{s.scope}</td>
                      <td className="px-4 py-2">{s.query}</td>
                      <td className="px-4 py-2 text-right">{formatNum(s.count)}</td>
                    </tr>
                  ))}
                  {(!data.product?.searchZero || data.product.searchZero.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                        No zero-result searches recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {data && activeTab === 'costs' && (
          <div className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Variable Cost Breakdown (`cost_daily`)
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Provider</th>
                    <th className="px-4 py-2 text-left">Feature</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Cost (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.costs?.breakdown || []).map((c, i) => (
                    <tr key={`${c.category}-${c.provider}-${c.feature}-${i}`}>
                      <td className="px-4 py-2">{c.category}</td>
                      <td className="px-4 py-2">{c.provider}</td>
                      <td className="px-4 py-2">{c.feature}</td>
                      <td className="px-4 py-2 text-right">{formatNum(Math.round(c.quantity || 0))}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatInr(c.cost_paise)}</td>
                    </tr>
                  ))}
                  {(!data.costs?.breakdown || data.costs.breakdown.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        No cost rollup rows yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Messaging Deliverability (`message_daily`)
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Channel</th>
                    <th className="px-4 py-2 text-left">Purpose</th>
                    <th className="px-4 py-2 text-right">Sent</th>
                    <th className="px-4 py-2 text-right">Delivered</th>
                    <th className="px-4 py-2 text-right">Failed</th>
                    <th className="px-4 py-2 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.costs?.messages || []).map((m, i) => (
                    <tr key={`${m.channel}-${m.purpose}-${i}`}>
                      <td className="px-4 py-2 uppercase text-xs font-semibold">{m.channel}</td>
                      <td className="px-4 py-2">{m.purpose}</td>
                      <td className="px-4 py-2 text-right">{formatNum(m.sent)}</td>
                      <td className="px-4 py-2 text-right">{formatNum(m.delivered)}</td>
                      <td className="px-4 py-2 text-right text-rose-600">{formatNum(m.failed)}</td>
                      <td className="px-4 py-2 text-right">{formatInr(m.cost_paise)}</td>
                    </tr>
                  ))}
                  {(!data.costs?.messages || data.costs.messages.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                        No messaging rollup rows yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
              <div className="font-semibold text-sm">Emergency Kill Switches (`FeatureFlag`)</div>
              {opsStatus && <div className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded">{opsStatus}</div>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {flags.map((f) => (
                  <div key={f.key} className="border border-slate-200 rounded-lg p-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs font-semibold">{f.key}</div>
                      <div className="text-xs text-slate-500 mt-1">{f.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFlag(f.key, !f.enabled)}
                      className={`px-3 py-1 rounded text-xs font-semibold shrink-0 ${
                        f.enabled ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {f.enabled ? 'ENABLED' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {data && activeTab === 'marketing' && (
          <div className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Channel Attribution (`marketing_daily`)
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Source</th>
                      <th className="px-4 py-2 text-left">Campaign</th>
                      <th className="px-4 py-2 text-right">Visitors</th>
                      <th className="px-4 py-2 text-right">Signups</th>
                      <th className="px-4 py-2 text-right">Subs</th>
                      <th className="px-4 py-2 text-right">Revenue</th>
                      <th className="px-4 py-2 text-right">Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.marketing?.attribution || []).map((row, i) => (
                      <tr key={`${row.source}-${row.campaign}-${i}`}>
                        <td className="px-4 py-2">{row.source}</td>
                        <td className="px-4 py-2">{row.campaign}</td>
                        <td className="px-4 py-2 text-right">{formatNum(row.visitors)}</td>
                        <td className="px-4 py-2 text-right">{formatNum(row.signups)}</td>
                        <td className="px-4 py-2 text-right">{formatNum(row.subs)}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatInr(row.revenue_paise)}</td>
                        <td className="px-4 py-2 text-right">{formatInr(row.spend_paise)}</td>
                      </tr>
                    ))}
                    {(!data.marketing?.attribution || data.marketing.attribution.length === 0) && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          No marketing attribution rows yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
              <div className="font-semibold text-sm">Partner Codes (`PartnerCode`)</div>
              <form onSubmit={savePartner} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <input
                  type="text"
                  placeholder="CODE (e.g. TOPPER10)"
                  value={partnerForm.code}
                  onChange={(e) => setPartnerForm({ ...partnerForm, code: e.target.value })}
                  className="border border-slate-300 rounded px-2.5 py-1.5 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Partner Name"
                  value={partnerForm.partnerName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, partnerName: e.target.value })}
                  className="border border-slate-300 rounded px-2.5 py-1.5 text-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="Comm %"
                  value={partnerForm.commissionPct}
                  onChange={(e) => setPartnerForm({ ...partnerForm, commissionPct: e.target.value })}
                  className="border border-slate-300 rounded px-2.5 py-1.5 text-sm"
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={partnerForm.discountPct}
                  onChange={(e) => setPartnerForm({ ...partnerForm, discountPct: e.target.value })}
                  className="border border-slate-300 rounded px-2.5 py-1.5 text-sm"
                />
                <button type="submit" className="bg-indigo-600 text-white rounded px-3 py-1.5 text-sm font-medium hover:bg-indigo-700">
                  Save Partner
                </button>
              </form>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Code</th>
                      <th className="px-3 py-2 text-left">Partner</th>
                      <th className="px-3 py-2 text-right">Signups</th>
                      <th className="px-3 py-2 text-right">PRO</th>
                      <th className="px-3 py-2 text-right">Revenue</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partners.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2 font-mono text-xs font-semibold">{p.code}</td>
                        <td className="px-3 py-2">{p.partnerName}</td>
                        <td className="px-3 py-2 text-right">{formatNum(p.signups)}</td>
                        <td className="px-3 py-2 text-right">{formatNum(p.proUsers)}</td>
                        <td className="px-3 py-2 text-right">{formatInr(p.revenuePaise)}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => togglePartnerActive(p.id, !p.isActive)}
                            className={`px-2 py-0.5 rounded text-xs ${p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
                <div className="font-semibold text-sm">CSV Import (`MarketingSpend` &amp; `FixedCost`)</div>
                <form onSubmit={submitCsvImport} className="space-y-3">
                  <select
                    value={csvType}
                    onChange={(e) => setCsvType(e.target.value)}
                    className="border border-slate-300 rounded px-2.5 py-1.5 text-sm"
                  >
                    <option value="marketing_spend">MarketingSpend (date,channel,campaign,amount_inr)</option>
                    <option value="fixed_cost">FixedCost (month,item,amount_inr)</option>
                  </select>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={csvType === 'marketing_spend' ? 'date,channel,campaign,amount_inr\n2026-11-10,google_ads,Prelims_2027,1500' : 'month,item,amount_inr\n2026-11,Vercel Pro,1700'}
                    className="w-full border border-slate-300 rounded p-2 font-mono text-xs"
                    required
                  />
                  <button type="submit" className="bg-slate-900 text-white rounded px-3 py-1.5 text-sm font-medium hover:bg-slate-800">
                    Import CSV
                  </button>
                </form>
              </section>

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                  Google Search Console (`GscDailyMetric`)
                </div>
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Query</th>
                      <th className="px-3 py-2 text-left">Page</th>
                      <th className="px-3 py-2 text-right">Clicks</th>
                      <th className="px-3 py-2 text-right">Pos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.marketing?.gscMetrics || []).map((g) => (
                      <tr key={g.id}>
                        <td className="px-3 py-2 text-xs">{g.query}</td>
                        <td className="px-3 py-2 text-xs font-mono truncate max-w-[180px]">{g.page}</td>
                        <td className="px-3 py-2 text-right">{formatNum(g.clicks)}</td>
                        <td className="px-3 py-2 text-right">{Number(g.position || 0).toFixed(1)}</td>
                      </tr>
                    ))}
                    {(!data.marketing?.gscMetrics || data.marketing.gscMetrics.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                          No GSC metrics imported yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        )}

        {data && activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="OTP Verified"
                value={formatNum(data.security?.otpSummary?.verified)}
                sub="In selected lookback window"
              />
              <StatCard
                title="OTP Unverified / Expired"
                value={formatNum(data.security?.otpSummary?.unverified)}
                sub="In selected lookback window"
              />
              <StatCard
                title="Recent Security Events"
                value={formatNum(data.security?.events?.length)}
                sub="Latest 30 shown below"
              />
            </div>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                Recent Security Events (`SecurityEvent`)
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Kind</th>
                      <th className="px-4 py-2 text-left">User ID</th>
                      <th className="px-4 py-2 text-left">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.security?.events || []).map((ev) => (
                      <tr key={ev.id}>
                        <td className="px-4 py-2 text-xs text-slate-500">
                          {new Date(ev.at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">{ev.type}</td>
                        <td className="px-4 py-2 font-mono text-xs">{ev.userId || '-'}</td>
                        <td className="px-4 py-2 font-mono text-xs">{ev.ipFull || '-'}</td>
                      </tr>
                    ))}
                    {(!data.security?.events || data.security.events.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                          No recent security events.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
