'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Zap,
  Calendar,
  Lock,
} from 'lucide-react';

export default function PricingClient() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [freeLimits, setFreeLimits] = useState(null);
  const [userStatus, setUserStatus] = useState({ authenticated: false, isPro: false, validUntil: null });

  const [selectedPlanCode, setSelectedPlanCode] = useState('PRELIMS_PASS_2027');
  const [couponInput, setCouponInput] = useState('');
  const [couponQuote, setCouponQuote] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch('/api/monetisation/plans');
        const data = await res.json();
        if (res.ok) {
          setPlans(data.plans || []);
          setFreeLimits(data.freeLimits || {});
          setUserStatus(data.userStatus || { authenticated: false, isPro: false, validUntil: null });
          const highlighted = (data.plans || []).find((p) => p.highlight) || data.plans?.[0];
          if (highlighted) setSelectedPlanCode(highlighted.code);
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const handleApplyCoupon = async (planCodeOverride) => {
    const codeToTest = couponInput.trim();
    const targetPlan = planCodeOverride || selectedPlanCode;
    if (!codeToTest) {
      setCouponQuote(null);
      return;
    }
    setCouponBusy(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/monetisation/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode: targetPlan, couponCode: codeToTest }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponQuote(data);
        setFeedback({
          type: 'success',
          text: `Coupon ${data.coupon.code} applied! You save ₹${data.discountInr}.`,
        });
      } else {
        setCouponQuote(null);
        setFeedback({ type: 'error', text: data.error || 'Invalid coupon code.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Could not validate coupon right now.' });
    } finally {
      setCouponBusy(false);
    }
  };

  const handleCheckout = async (plan) => {
    if (!session?.user) {
      router.push('/login?callbackUrl=/pricing');
      return;
    }

    setSelectedPlanCode(plan.code);
    setCheckoutBusy(true);
    setFeedback(null);

    try {
      const activeCoupon =
        couponQuote?.valid && couponQuote?.planCode === plan.code
          ? couponQuote.coupon.code
          : couponInput.trim() || null;

      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode: plan.code,
          couponCode: activeCoupon,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Could not initiate checkout.');
      }

      if (orderData.isMock) {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            razorpay_signature: 'admin_dev_mock',
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.error || 'Verification failed.');
        }
        await updateSession({ tier: 'PRO', validUntil: verifyData.validUntil });
        setUserStatus({ authenticated: true, isPro: true, validUntil: verifyData.validUntil });
        setFeedback({ type: 'success', text: verifyData.message || 'Pass activated!' });
        setCheckoutBusy(false);
        return;
      }

      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Payment gateway script is still loading. Please try again in a moment.');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'UPSCGPT',
        description: orderData.planName || plan.name,
        order_id: orderData.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            await updateSession({ tier: 'PRO', validUntil: verifyData.validUntil });
            setUserStatus({ authenticated: true, isPro: true, validUntil: verifyData.validUntil });
            setFeedback({ type: 'success', text: verifyData.message || 'Welcome to Prelims Pass!' });
          } else {
            setFeedback({ type: 'error', text: verifyData.error || 'Payment verification failed.' });
          }
          setCheckoutBusy(false);
        },
        modal: {
          ondismiss: function () {
            setCheckoutBusy(false);
          },
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: { color: '#10b981' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Checkout failed.' });
      setCheckoutBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#f8fafc', padding: '32px 20px 90px' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        {/* TOP NAV */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <Link
            href="/prelims/pyq"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} /> Back to Prelims PYQ Explorer
          </Link>

          {userStatus.isPro && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '12.5px',
                fontWeight: 800,
              }}
            >
              <Zap size={14} />
              PRELIMS PASS ACTIVE
              {userStatus.validUntil &&
                ` · VALID TILL ${new Date(userStatus.validUntil).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}`}
            </div>
          )}
        </div>

        {/* HERO */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '14px',
            }}
          >
            <Sparkles size={13} /> UPSC PRELIMS GS · PYQ DEEP DIVES, PRACTICE & TEST SERIES
          </div>

          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Master Every UPSC PYQ Option by Option
          </h1>
          <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.6, color: '#94a3b8' }}>
            Every PYQ stem and answer key is free forever. Upgrade to the Prelims Pass for unlimited 8-part option breakdowns, value-addition notes, micro-theme analytics, and the PYQ-based Prelims Test Series.
          </p>
        </div>

        {/* COUPON BAR */}
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto 28px',
            background: '#0d1424',
            border: '1px solid #1e293b',
            borderRadius: '14px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Tag size={16} color="#38bdf8" style={{ flexShrink: 0, marginLeft: '6px' }} />
          <input
            type="text"
            placeholder="Have a coupon or referral code? (e.g. EARLY10)"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '13.5px',
              fontWeight: 700,
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleApplyCoupon(selectedPlanCode)}
            disabled={couponBusy}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              background: '#1e293b',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {couponBusy ? 'Checking...' : 'Apply'}
          </button>
        </div>

        {feedback && (
          <div
            style={{
              maxWidth: '640px',
              margin: '0 auto 24px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
              border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: feedback.type === 'success' ? '#34d399' : '#f87171',
              fontSize: '13.5px',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {feedback.text}
          </div>
        )}

        {/* PRICING CARDS GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontWeight: 700 }}>
            Loading current plans...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '22px',
              alignItems: 'stretch',
            }}
          >
            {/* FREE TIER CARD */}
            <div
              style={{
                background: '#0d1424',
                border: '1px solid #1e293b',
                borderRadius: '20px',
                padding: '28px 26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  DAILY STARTER
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900 }}>Free Account</h2>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Browse every UPSC PYQ stem and official answer key with a daily allowance of deep-dive explanations.
                </p>

                <div style={{ marginBottom: '22px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 900 }}>₹0</span>
                  <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '6px' }}>Forever free</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                    <CheckCircle2 size={16} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>All UPSC Prelims GS PYQ stems, options & answer keys</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                    <CheckCircle2 size={16} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>
                      <strong>{freeLimits?.freeDailyExplanations ?? 5} Deep-Dive Explanations / day</strong> (resets midnight IST)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                    <CheckCircle2 size={16} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>
                      {freeLimits?.freeDailyPracticeSets ?? 1} custom practice set / day (up to {freeLimits?.freeMaxQuestionsPerSet ?? 10} questions)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                    <CheckCircle2 size={16} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>Up to {freeLimits?.freeBookmarksLimit ?? 25} saved question bookmarks</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                    <CheckCircle2 size={16} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>Test 1 of the Prelims Test Series free (ranked)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/prelims/pyq"
                style={{
                  marginTop: '26px',
                  display: 'block',
                  textAlign: 'center',
                  padding: '13px 18px',
                  borderRadius: '12px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '14px',
                }}
              >
                Continue with Free Access
              </Link>
            </div>

            {/* DYNAMIC PAID PLANS */}
            {plans.map((plan) => {
              const isHighlighted = Boolean(plan.highlight);
              const hasCouponForPlan = couponQuote?.valid && couponQuote?.planCode === plan.code;
              const displayPrice = hasCouponForPlan ? couponQuote.finalPriceInr : plan.currentPriceInr;

              return (
                <div
                  key={plan.code}
                  onClick={() => setSelectedPlanCode(plan.code)}
                  style={{
                    background: isHighlighted
                      ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.11) 0%, #0d1424 45%)'
                      : '#0d1424',
                    border: isHighlighted ? '2px solid #10b981' : '1px solid #1e293b',
                    borderRadius: '20px',
                    padding: '28px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    boxShadow: isHighlighted ? '0 20px 50px rgba(16, 185, 129, 0.12)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          letterSpacing: '0.08em',
                          color: isHighlighted ? '#10b981' : '#38bdf8',
                        }}
                      >
                        {plan.badge || 'PRELIMS ACCESS'}
                      </span>

                      {plan.activeWindowLabel && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: 'rgba(251, 191, 36, 0.14)',
                            color: '#fbbf24',
                          }}
                        >
                          {plan.activeWindowLabel}
                        </span>
                      )}
                    </div>

                    <h2 style={{ margin: '0 0 6px', fontSize: '23px', fontWeight: 900 }}>{plan.name}</h2>
                    <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                      {plan.tagline}
                    </p>

                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '38px', fontWeight: 900, color: '#f8fafc' }}>
                        ₹{displayPrice}
                      </span>
                      {plan.mrpInr && plan.mrpInr > displayPrice && (
                        <span style={{ fontSize: '16px', color: '#64748b', textDecoration: 'line-through', fontWeight: 700 }}>
                          ₹{plan.mrpInr}
                        </span>
                      )}
                      <span style={{ fontSize: '12.5px', color: '#94a3b8', fontWeight: 700 }}>
                        {plan.validityMode === 'FIXED_DATE' && plan.validUntilDate
                          ? `One-time · Valid till ${new Date(plan.validUntilDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}`
                          : `One-time · ${plan.durationDays || 30} days access`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px', color: '#e2e8f0' }}>
                      {(plan.features || []).map((feat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                          <CheckCircle2
                            size={16}
                            color={isHighlighted ? '#10b981' : '#38bdf8'}
                            style={{ marginTop: '2px', flexShrink: 0 }}
                          />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={checkoutBusy}
                    style={{
                      marginTop: '26px',
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isHighlighted ? '#10b981' : '#3b82f6',
                      color: isHighlighted ? '#042f2e' : '#ffffff',
                      fontWeight: 900,
                      fontSize: '14.5px',
                      cursor: checkoutBusy ? 'wait' : 'pointer',
                    }}
                  >
                    {checkoutBusy && selectedPlanCode === plan.code
                      ? 'Opening Secure Checkout...'
                      : userStatus.isPro
                      ? `Extend with ${plan.name} (₹${displayPrice})`
                      : `Get ${plan.name} for ₹${displayPrice}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TRUST FOOTER */}
        <div
          style={{
            marginTop: '36px',
            padding: '18px 24px',
            borderRadius: '16px',
            background: '#0d1424',
            border: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '13px',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#10b981" />
            <span>
              <strong>One-Time Payment via Razorpay (UPI, GPay, PhonePe, Cards)</strong> — Zero auto-debit or hidden recurring charges.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="#38bdf8" />
            <span>Instant activation upon payment confirmation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
