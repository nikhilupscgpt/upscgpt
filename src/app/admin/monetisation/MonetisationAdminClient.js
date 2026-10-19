'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Sliders,
  IndianRupee,
  Users,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export default function MonetisationAdminClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('plans'); // plans | schedule | coupons | limits | revenue
  const [banner, setBanner] = useState(null);

  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);

  // Manual Grant form state
  const [grantEmail, setGrantEmail] = useState('');
  const [grantPlanCode, setGrantPlanCode] = useState('PRELIMS_PASS_2027');
  const [grantCustomDate, setGrantCustomDate] = useState('');
  const [grantBusy, setGrantBusy] = useState(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/monetisation');
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
        setStats(data.stats || null);
        setRecentPayments(data.recentPayments || []);
      } else {
        setBanner({ type: 'error', text: data.error || 'Failed to load monetisation settings.' });
      }
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Network error loading monetisation config.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch('/api/admin/monetisation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
        setBanner({
          type: 'success',
          text: 'All monetisation plans, date schedules, coupons & free limits saved and live!',
        });
      } else {
        setBanner({ type: 'error', text: data.error || 'Failed to save changes.' });
      }
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Network error saving changes.' });
    } finally {
      setSaving(false);
    }
  };

  // --- PLAN HELPERS ---
  const updatePlan = (index, patch) => {
    setConfig((prev) => {
      const nextPlans = [...(prev.plans || [])];
      nextPlans[index] = { ...nextPlans[index], ...patch };
      return { ...prev, plans: nextPlans };
    });
  };

  const addNewPlan = () => {
    const newCode = `CUSTOM_PASS_${Date.now().toString().slice(-4)}`;
    setConfig((prev) => ({
      ...prev,
      plans: [
        ...(prev.plans || []),
        {
          code: newCode,
          name: 'New Custom Pass (e.g. Test Series 2027)',
          badge: 'LIMITED ACCESS',
          tagline: 'Custom Prelims Pass or Test Series Bundle',
          basePriceInr: 999,
          mrpInr: 1499,
          validityMode: 'FIXED_DATE',
          validUntilDate: '2027-06-30T23:59:59.000Z',
          durationDays: 180,
          active: true,
          highlight: false,
          features: [
            'Full Prelims Test Series Access',
            'Detailed 8-Part Explanations & Analytics',
          ],
          priceSchedule: [],
        },
      ],
    }));
  };

  const removePlan = (index) => {
    if (!confirm('Remove this plan?')) return;
    setConfig((prev) => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
    }));
  };

  // --- SCHEDULE HELPERS ---
  const addScheduleWindow = (planIndex) => {
    setConfig((prev) => {
      const nextPlans = [...(prev.plans || [])];
      const plan = { ...nextPlans[planIndex] };
      const schedule = Array.isArray(plan.priceSchedule) ? [...plan.priceSchedule] : [];
      schedule.push({
        id: `win_${Date.now().toString().slice(-5)}`,
        label: 'New Pricing Window',
        priceInr: plan.basePriceInr || 999,
        startsAt: '2027-01-01',
        endsAt: '2027-02-28',
      });
      plan.priceSchedule = schedule;
      nextPlans[planIndex] = plan;
      return { ...prev, plans: nextPlans };
    });
  };

  const updateScheduleWindow = (planIndex, winIndex, patch) => {
    setConfig((prev) => {
      const nextPlans = [...(prev.plans || [])];
      const plan = { ...nextPlans[planIndex] };
      const schedule = [...(plan.priceSchedule || [])];
      schedule[winIndex] = { ...schedule[winIndex], ...patch };
      plan.priceSchedule = schedule;
      nextPlans[planIndex] = plan;
      return { ...prev, plans: nextPlans };
    });
  };

  const removeScheduleWindow = (planIndex, winIndex) => {
    setConfig((prev) => {
      const nextPlans = [...(prev.plans || [])];
      const plan = { ...nextPlans[planIndex] };
      plan.priceSchedule = (plan.priceSchedule || []).filter((_, i) => i !== winIndex);
      nextPlans[planIndex] = plan;
      return { ...prev, plans: nextPlans };
    });
  };

  // --- COUPON HELPERS ---
  const addCoupon = () => {
    setConfig((prev) => ({
      ...prev,
      coupons: [
        ...(prev.coupons || []),
        {
          code: `UPSC${Math.floor(10 + Math.random() * 89)}`,
          description: 'Special Promotional Discount',
          discountType: 'PERCENT',
          discountValue: 15,
          maxDiscountInr: 400,
          minOrderInr: 199,
          maxUses: 200,
          usedCount: 0,
          validUntil: '2027-05-31T23:59:59.000Z',
          applicablePlans: (prev.plans || []).map((p) => p.code),
          active: true,
        },
      ],
    }));
  };

  const updateCoupon = (index, patch) => {
    setConfig((prev) => {
      const nextCoupons = [...(prev.coupons || [])];
      nextCoupons[index] = { ...nextCoupons[index], ...patch };
      return { ...prev, coupons: nextCoupons };
    });
  };

  const removeCoupon = (index) => {
    if (!confirm('Delete this coupon code?')) return;
    setConfig((prev) => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== index),
    }));
  };

  // --- FREE LIMITS HELPERS ---
  const updateFreeLimit = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      freeLimits: {
        ...(prev.freeLimits || {}),
        [key]: value,
      },
    }));
  };

  // --- MANUAL GRANT / REVOKE ---
  const handleManualPassAction = async (actionType) => {
    if (!grantEmail.trim()) {
      setBanner({ type: 'error', text: 'Please enter a user email address.' });
      return;
    }
    setGrantBusy(true);
    setBanner(null);
    try {
      const res = await fetch('/api/admin/monetisation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          email: grantEmail.trim(),
          planCode: grantPlanCode,
          customValidUntil: grantCustomDate ? new Date(grantCustomDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBanner({ type: 'success', text: data.message });
        setGrantEmail('');
        fetchAdminData();
      } else {
        setBanner({ type: 'error', text: data.error || 'Action failed.' });
      }
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Network error.' });
    } finally {
      setGrantBusy(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  if (loading || !config) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 700, color: '#94a3b8' }}>
          <RefreshCw size={18} className="spin" /> Loading Monetisation & Pricing Engine...
        </div>
      </div>
    );
  }

  const cardStyle = {
    background: '#0d1424',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: '22px',
    marginBottom: '18px',
  };

  const inputStyle = {
    width: '100%',
    background: '#070b14',
    color: '#f8fafc',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '13.5px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    color: '#94a3b8',
    marginBottom: '6px',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#f8fafc', padding: '28px 32px 80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: '#0d1424',
                border: '1px solid #1e293b',
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={15} /> Admin Home
            </Link>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                Monetisation & Pricing Control Center
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                100% dynamic backend configuration — edit plans, date-based price schedules, coupons, and free-tier limits without redeploying.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/pricing"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <ExternalLink size={15} /> View Live /pricing Page
            </Link>

            <button
              onClick={handleSaveConfig}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                borderRadius: '10px',
                background: '#10b981',
                color: '#042f2e',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 900,
                cursor: saving ? 'wait' : 'pointer',
              }}
            >
              <Save size={16} />
              {saving ? 'Saving Changes...' : 'Save & Publish All Changes'}
            </button>
          </div>
        </div>

        {/* STATUS BANNER */}
        {banner && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: banner.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${banner.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              color: banner.type === 'success' ? '#34d399' : '#f87171',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{banner.text}</span>
            <button
              onClick={() => setBanner(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 900 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* KPI SUMMARY STRIP */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ ...cardStyle, marginBottom: 0, padding: '16px 18px' }}>
              <div style={labelStyle}>Total Revenue</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>
                ₹{Number(stats.totalRevenueInr || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                ₹{Number(stats.last30dRevenueInr || 0).toLocaleString('en-IN')} in last 30 days
              </div>
            </div>

            <div style={{ ...cardStyle, marginBottom: 0, padding: '16px 18px' }}>
              <div style={labelStyle}>Active Pass Holders</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8' }}>
                {stats.activePassHolders}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                of {stats.totalUsers} registered users ({stats.conversionRate}%)
              </div>
            </div>

            <div style={{ ...cardStyle, marginBottom: 0, padding: '16px 18px' }}>
              <div style={labelStyle}>Paid Orders</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>
                {stats.totalOrders}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {stats.expiredPassUsers} expired passes
              </div>
            </div>

            <div style={{ ...cardStyle, marginBottom: 0, padding: '16px 18px' }}>
              <div style={labelStyle}>Free Paywall Status</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: config.freeLimits?.gatingEnabled ? '#fbbf24' : '#94a3b8' }}>
                {config.freeLimits?.gatingEnabled ? 'ACTIVE (ENFORCED)' : 'PAUSED (ALL FREE)'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {config.freeLimits?.freeDailyExplanations} free deep-dives / day
              </div>
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
          {[
            { id: 'plans', label: '1. Plans & Features', icon: <Sparkles size={15} /> },
            { id: 'schedule', label: '2. Date-Based Price Schedule', icon: <Calendar size={15} /> },
            { id: 'coupons', label: '3. Coupons & Discounts', icon: <Tag size={15} /> },
            { id: 'limits', label: '4. Free Limits & Paywall', icon: <Sliders size={15} /> },
            { id: 'revenue', label: '5. Grant Pass & Payments', icon: <Users size={15} /> },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: active ? '1px solid #3b82f6' : '1px solid transparent',
                  background: active ? 'rgba(59, 130, 246, 0.16)' : '#0d1424',
                  color: active ? '#60a5fa' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PLANS & FEATURES */}
        {activeTab === 'plans' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Subscription / Pass Plans</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Configure plan names, base prices, expiry dates, and bullet points shown on the student pricing page.
                </p>
              </div>
              <button
                onClick={addNewPlan}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} /> Add New Plan
              </button>
            </div>

            {(config.plans || []).map((plan, idx) => (
              <div key={plan.code || idx} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 900,
                        background: plan.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                        color: plan.active ? '#34d399' : '#94a3b8',
                      }}
                    >
                      {plan.active ? 'ACTIVE' : 'HIDDEN'}
                    </span>
                    <strong style={{ fontSize: '16px' }}>{plan.name}</strong>
                    <code style={{ fontSize: '12px', color: '#64748b' }}>({plan.code})</code>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(plan.highlight)}
                        onChange={(e) => updatePlan(idx, { highlight: e.target.checked })}
                      />
                      Highlight as Best Value
                    </label>

                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(plan.active)}
                        onChange={(e) => updatePlan(idx, { active: e.target.checked })}
                      />
                      Plan Enabled
                    </label>

                    <button
                      onClick={() => removePlan(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Delete Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Plan Code (ID)</label>
                    <input
                      style={inputStyle}
                      value={plan.code || ''}
                      onChange={(e) => updatePlan(idx, { code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Display Name</label>
                    <input
                      style={inputStyle}
                      value={plan.name || ''}
                      onChange={(e) => updatePlan(idx, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Top Badge Text</label>
                    <input
                      style={inputStyle}
                      value={plan.badge || ''}
                      onChange={(e) => updatePlan(idx, { badge: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Default Price (₹ INR)</label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={plan.basePriceInr ?? 999}
                      onChange={(e) => updatePlan(idx, { basePriceInr: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Strikethrough MRP (₹ INR)</label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={plan.mrpInr ?? 1999}
                      onChange={(e) => updatePlan(idx, { mrpInr: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Validity Type</label>
                    <select
                      style={inputStyle}
                      value={plan.validityMode || 'FIXED_DATE'}
                      onChange={(e) => updatePlan(idx, { validityMode: e.target.value })}
                    >
                      <option value="FIXED_DATE">Fixed Exam Expiry Date</option>
                      <option value="DURATION_DAYS">Fixed Duration (Days from purchase)</option>
                    </select>
                  </div>

                  {plan.validityMode === 'FIXED_DATE' ? (
                    <div>
                      <label style={labelStyle}>Valid Until Date (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        style={inputStyle}
                        value={(plan.validUntilDate || '2027-06-30').slice(0, 10)}
                        onChange={(e) =>
                          updatePlan(idx, { validUntilDate: `${e.target.value}T23:59:59.000Z` })
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <label style={labelStyle}>Duration (Days)</label>
                      <input
                        type="number"
                        style={inputStyle}
                        value={plan.durationDays ?? 30}
                        onChange={(e) => updatePlan(idx, { durationDays: Number(e.target.value) })}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Subtitle / Tagline</label>
                  <input
                    style={inputStyle}
                    value={plan.tagline || ''}
                    onChange={(e) => updatePlan(idx, { tagline: e.target.value })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Included Features (One feature per line)</label>
                  <textarea
                    rows={5}
                    style={{ ...inputStyle, fontFamily: 'inherit', lineHeight: 1.5 }}
                    value={(plan.features || []).join('\n')}
                    onChange={(e) =>
                      updatePlan(idx, {
                        features: e.target.value.split('\n').filter((line) => line.trim() !== ''),
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: DATE-BASED PRICE SCHEDULE */}
        {activeTab === 'schedule' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                Date-Based Price Variation Schedule (Towards Prelims)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Set automatic price changes by date window (IST). If today&apos;s date ({todayStr}) falls inside a window, that window&apos;s price overrides the plan&apos;s default price automatically.
              </p>
            </div>

            {(config.plans || []).map((plan, planIdx) => (
              <div key={plan.code || planIdx} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{plan.name}</strong>
                    <span style={{ marginLeft: '10px', fontSize: '12.5px', color: '#94a3b8' }}>
                      Fallback Base Price: ₹{plan.basePriceInr}
                    </span>
                  </div>
                  <button
                    onClick={() => addScheduleWindow(planIdx)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Add Date Window
                  </button>
                </div>

                {(plan.priceSchedule || []).length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#64748b', padding: '12px 0' }}>
                    No date windows configured. Using fallback base price ₹{plan.basePriceInr}.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(plan.priceSchedule || []).map((win, winIdx) => {
                      const isCurrent =
                        (!win.startsAt || todayStr >= win.startsAt.slice(0, 10)) &&
                        (!win.endsAt || todayStr <= win.endsAt.slice(0, 10));
                      return (
                        <div
                          key={win.id || winIdx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr auto',
                            gap: '10px',
                            alignItems: 'center',
                            padding: '12px',
                            borderRadius: '10px',
                            background: isCurrent ? 'rgba(16, 185, 129, 0.08)' : '#070b14',
                            border: isCurrent ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #1e293b',
                          }}
                        >
                          <div>
                            <label style={labelStyle}>
                              Window Label{' '}
                              {isCurrent && (
                                <span style={{ color: '#10b981', marginLeft: '6px' }}>● ACTIVE TODAY</span>
                              )}
                            </label>
                            <input
                              style={inputStyle}
                              value={win.label || ''}
                              onChange={(e) =>
                                updateScheduleWindow(planIdx, winIdx, { label: e.target.value })
                              }
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>Price (₹ INR)</label>
                            <input
                              type="number"
                              style={inputStyle}
                              value={win.priceInr ?? 999}
                              onChange={(e) =>
                                updateScheduleWindow(planIdx, winIdx, { priceInr: Number(e.target.value) })
                              }
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>Start Date</label>
                            <input
                              type="date"
                              style={inputStyle}
                              value={(win.startsAt || '').slice(0, 10)}
                              onChange={(e) =>
                                updateScheduleWindow(planIdx, winIdx, { startsAt: e.target.value })
                              }
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>End Date</label>
                            <input
                              type="date"
                              style={inputStyle}
                              value={(win.endsAt || '').slice(0, 10)}
                              onChange={(e) =>
                                updateScheduleWindow(planIdx, winIdx, { endsAt: e.target.value })
                              }
                            />
                          </div>

                          <button
                            onClick={() => removeScheduleWindow(planIdx, winIdx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              marginTop: '18px',
                            }}
                            title="Remove Window"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: COUPONS */}
        {activeTab === 'coupons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Discount & Referral Coupons</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Create percentage or flat INR discount codes with usage caps and expiry dates.
                </p>
              </div>
              <button
                onClick={addCoupon}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} /> Create Coupon
              </button>
            </div>

            {(config.coupons || []).map((coupon, idx) => (
              <div key={idx} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.14)',
                        color: '#38bdf8',
                        fontWeight: 900,
                        fontSize: '13px',
                      }}
                    >
                      {coupon.code}
                    </span>
                    <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                      Used {coupon.usedCount || 0} / {coupon.maxUses ?? '∞'} times
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(coupon.active)}
                        onChange={(e) => updateCoupon(idx, { active: e.target.checked })}
                      />
                      Active
                    </label>
                    <button
                      onClick={() => removeCoupon(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Coupon Code</label>
                    <input
                      style={inputStyle}
                      value={coupon.code || ''}
                      onChange={(e) => updateCoupon(idx, { code: e.target.value.toUpperCase().trim() })}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Discount Type</label>
                    <select
                      style={inputStyle}
                      value={coupon.discountType || 'PERCENT'}
                      onChange={(e) => updateCoupon(idx, { discountType: e.target.value })}
                    >
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="FLAT">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      {coupon.discountType === 'FLAT' ? 'Flat Discount (₹)' : 'Discount (%)'}
                    </label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={coupon.discountValue ?? 10}
                      onChange={(e) => updateCoupon(idx, { discountValue: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={coupon.maxDiscountInr ?? 300}
                      onChange={(e) => updateCoupon(idx, { maxDiscountInr: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Max Total Redemptions</label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={coupon.maxUses ?? 500}
                      onChange={(e) => updateCoupon(idx, { maxUses: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Valid Until Date</label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={(coupon.validUntil || '2026-12-31').slice(0, 10)}
                      onChange={(e) =>
                        updateCoupon(idx, { validUntil: `${e.target.value}T23:59:59.000Z` })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={labelStyle}>Description (shown at checkout)</label>
                  <input
                    style={inputStyle}
                    value={coupon.description || ''}
                    onChange={(e) => updateCoupon(idx, { description: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: FREE LIMITS & PAYWALL */}
        {activeTab === 'limits' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Free-Tier Limits & Paywall Rules</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Adjust how much free access students get each day (resets at midnight IST).
                </p>
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: config.freeLimits?.gatingEnabled ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '13px',
                }}
              >
                <input
                  type="checkbox"
                  checked={config.freeLimits?.gatingEnabled !== false}
                  onChange={(e) => updateFreeLimit('gatingEnabled', e.target.checked)}
                />
                Master Paywall Switch ({config.freeLimits?.gatingEnabled !== false ? 'ON' : 'OFF'})
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Visitor (Not Signed In) Daily Explanations</label>
                <input
                  type="number"
                  min={0}
                  style={inputStyle}
                  value={config.freeLimits?.anonDailyExplanations ?? 2}
                  onChange={(e) => updateFreeLimit('anonDailyExplanations', Number(e.target.value))}
                />
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                  After this, visitors are prompted to create a free account.
                </div>
              </div>

              <div>
                <label style={labelStyle}>Signed-In Free User Daily Explanations</label>
                <input
                  type="number"
                  min={0}
                  style={inputStyle}
                  value={config.freeLimits?.freeDailyExplanations ?? 5}
                  onChange={(e) => updateFreeLimit('freeDailyExplanations', Number(e.target.value))}
                />
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                  Number of 8-part PYQ deep-dive explanations unlocked per day for free users.
                </div>
              </div>

              <div>
                <label style={labelStyle}>Free Custom Practice Sets / Day</label>
                <input
                  type="number"
                  min={0}
                  style={inputStyle}
                  value={config.freeLimits?.freeDailyPracticeSets ?? 1}
                  onChange={(e) => updateFreeLimit('freeDailyPracticeSets', Number(e.target.value))}
                />
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                  How many custom PYQ quizzes a free user can start per day.
                </div>
              </div>

              <div>
                <label style={labelStyle}>Max Questions per Free Practice Set</label>
                <input
                  type="number"
                  min={1}
                  style={inputStyle}
                  value={config.freeLimits?.freeMaxQuestionsPerSet ?? 10}
                  onChange={(e) => updateFreeLimit('freeMaxQuestionsPerSet', Number(e.target.value))}
                />
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                  Caps quiz length for free users (Pass holders can select any size).
                </div>
              </div>

              <div>
                <label style={labelStyle}>Free Saved Bookmarks Limit</label>
                <input
                  type="number"
                  min={0}
                  style={inputStyle}
                  value={config.freeLimits?.freeBookmarksLimit ?? 25}
                  onChange={(e) => updateFreeLimit('freeBookmarksLimit', Number(e.target.value))}
                />
              </div>

              <div>
                <label style={labelStyle}>Free Full-Length Mock Tests Allowed</label>
                <input
                  type="number"
                  min={0}
                  style={inputStyle}
                  value={config.freeLimits?.freeMockTestsAllowed ?? 1}
                  onChange={(e) => updateFreeLimit('freeMockTestsAllowed', Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={labelStyle}>Paid-Only Feature Locks</div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(config.freeLimits?.lockMicroThemeAnalytics)}
                  onChange={(e) => updateFreeLimit('lockMicroThemeAnalytics', e.target.checked)}
                />
                Lock Micro-Theme Accuracy, Time-Spent & Weak-Area Analytics to Prelims Pass
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(config.freeLimits?.lockWrongAnswerQueue)}
                  onChange={(e) => updateFreeLimit('lockWrongAnswerQueue', e.target.checked)}
                />
                Lock Smart Wrong-Answer Re-Practice Queue to Prelims Pass
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(config.freeLimits?.lockSlidePdfExport)}
                  onChange={(e) => updateFreeLimit('lockSlidePdfExport', e.target.checked)}
                />
                Lock Printable A4 Lecture Slide / PDF Export to Prelims Pass
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: MANUAL PASS GRANT & RECENT PAYMENTS */}
        {activeTab === 'revenue' && (
          <div>
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800 }}>
                Grant or Revoke Prelims Pass Manually
              </h2>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94a3b8' }}>
                Instantly activate or extend a Pass for any student, topper, or partner by email address.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr auto auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Student Email</label>
                  <input
                    style={inputStyle}
                    placeholder="student@example.com"
                    value={grantEmail}
                    onChange={(e) => setGrantEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Plan</label>
                  <select
                    style={inputStyle}
                    value={grantPlanCode}
                    onChange={(e) => setGrantPlanCode(e.target.value)}
                  >
                    {(config.plans || []).map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Custom Expiry (Optional)</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={grantCustomDate}
                    onChange={(e) => setGrantCustomDate(e.target.value)}
                  />
                </div>

                <button
                  disabled={grantBusy}
                  onClick={() => handleManualPassAction('GRANT_PASS')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Grant Pass
                </button>

                <button
                  disabled={grantBusy}
                  onClick={() => handleManualPassAction('REVOKE_PASS')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Revoke
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 800 }}>Recent Payment Transactions</h2>
              {recentPayments.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#64748b', padding: '12px 0' }}>
                  No payments recorded yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'left', color: '#94a3b8' }}>
                        <th style={{ padding: '10px 8px' }}>Date</th>
                        <th style={{ padding: '10px 8px' }}>User</th>
                        <th style={{ padding: '10px 8px' }}>Amount</th>
                        <th style={{ padding: '10px 8px' }}>Razorpay Payment ID</th>
                        <th style={{ padding: '10px 8px' }}>Pass Valid Until</th>
                        <th style={{ padding: '10px 8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((pay) => (
                        <tr key={pay.id} style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.5)' }}>
                          <td style={{ padding: '10px 8px', color: '#cbd5e1' }}>
                            {new Date(pay.createdAt).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 8px', fontWeight: 700 }}>
                            {pay.user?.email || pay.user?.name || pay.userId}
                          </td>
                          <td style={{ padding: '10px 8px', fontWeight: 800, color: '#10b981' }}>
                            ₹{Math.round((Number(pay.amount) || 0) / 100)}
                          </td>
                          <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#94a3b8' }}>
                            {pay.razorpayId}
                          </td>
                          <td style={{ padding: '10px 8px', color: '#38bdf8' }}>
                            {pay.user?.validUntil
                              ? new Date(pay.user.validUntil).toLocaleDateString('en-IN')
                              : '—'}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 800,
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                              }}
                            >
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
