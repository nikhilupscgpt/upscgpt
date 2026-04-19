"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "",
    examYear: 2025,
    preferences: { studyMode: "comprehensive" }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile({
            name: data.name || "",
            examYear: data.examYear || 2025,
            preferences: data.preferences || { studyMode: "comprehensive" }
          });
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load profile");
          setLoading(false);
        });
    }
  }, [status, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        await update({ name: profile.name });
      } else {
        const err = await res.json();
        toast.error(err.error || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    setSaving(true);
    try {
      // 1. Create Order
      const orderRes = await fetch("/api/payment/order", { method: "POST" });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) throw new Error(orderData.error || "Order creation failed");

      // 2. Configure Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "UPSC Atlas Portal",
        description: "PRO Tier Strategic Access",
        order_id: orderData.id,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success("Welcome to PRO, Strategist!");
              await update({ tier: 'PRO' });
            } else {
              toast.error(verifyData.error || "Verification failed");
            }
          } catch (err) {
            toast.error("Verification connection error");
          }
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: { color: "#3b82f6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.message || "Checkout session failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading Strategic Profile...</div>
      </div>
    );
  }

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
    color: 'white',
    fontFamily: "'Outfit', sans-serif"
  };

  const contentStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '4rem 2rem'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '2.5rem',
    backdropFilter: 'blur(20px)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px'
  };

  const tierBadgeStyle = {
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '900',
    background: session?.user?.tier === 'PRO' ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.1)',
    color: session?.user?.tier === 'PRO' ? 'black' : '#94a3b8'
  };

  return (
    <div style={containerStyle}>
      <Toaster position="bottom-right" />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <main style={contentStyle}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Student Profile</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Manage your UPSC preparation settings and account status.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Identity Card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{session?.user?.name}</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{session?.user?.email}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={tierBadgeStyle}>{session?.user?.tier} TIER</span>
                  <span style={{ ...tierBadgeStyle, background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>{session?.user?.role}</span>
                </div>
              </div>
            </div>

            {session?.user?.tier === 'FREE' && (
              <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px' }}>
                <h3 style={{ color: '#fbbf24', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem' }}>UPGRADE TO PRO</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(251, 191, 36, 0.8)', marginBottom: '1rem' }}>Get unlimited map exports, AI-evaluated mains answers, and daily high-priority geopolitical intel.</p>
                <button 
                  onClick={handleUpgrade}
                  disabled={saving}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#fbbf24', color: 'black', fontWeight: '900', border: 'none', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Processing..." : "Go Pro Now"}
                </button>
              </div>
            )}
          </div>

          {/* Settings Form */}
          <div style={cardStyle}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  style={inputStyle}
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label style={labelStyle}>Target Exam Year</label>
                <select 
                  value={profile.examYear} 
                  onChange={(e) => setProfile({...profile, examYear: parseInt(e.target.value)})}
                  style={inputStyle}
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Preparation Mode</label>
                <select 
                  value={profile.preferences.studyMode} 
                  onChange={(e) => setProfile({
                    ...profile, 
                    preferences: { ...profile.preferences, studyMode: e.target.value }
                  })}
                  style={inputStyle}
                >
                  <option value="comprehensive">Comprehensive (Integrates Prelims + Mains)</option>
                  <option value="prelims_focussed">Prelims Focussed (Fast pace)</option>
                  <option value="mains_focussed">Mains Focussed (Deep analysis)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                  color: 'white', fontWeight: '800', border: 'none', cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                {saving ? "Saving Changes..." : "Secure Update"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
