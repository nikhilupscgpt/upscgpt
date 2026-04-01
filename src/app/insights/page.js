"use client";

import Navigation from "@/components/Navigation";

export default function InsightsPage() {
  const insights = [
    {
      title: "Indo-Pacific Maritime Corridors",
      tag: "GEOPOLITICS",
      content: "Increased naval presence in the South China Sea is reshaping traditional trade routes. Focus on the Malacca Strait and the 'String of Pearls' vs 'Necklace of Diamonds' strategies for GS-2."
    },
    {
      title: "Himalayan Glacial Retreat",
      tag: "ENVIRONMENT",
      content: "Accelerated melting in the HKH region poses long-term threats to the Indus and Brahmaputra basins. Essential for GS-3 disaster management and ecology sections."
    },
    {
      title: "Critical Mineral Alliances",
      tag: "ECONOMY",
      content: "The race for Lithium and Cobalt in the 'Lithium Triangle' (South America) is impacting global supply chains. Understand the Minerals Security Partnership (MSP) for UPSC Prelims."
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
      <Navigation />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ marginBottom: '3rem', borderLeft: '4px solid #3b82f6', paddingLeft: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>Strategic Insights</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>High-priority briefing on global trends for UPSC GS-2 and GS-3.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {insights.map((insight, i) => (
            <div key={i} style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '20px', 
              padding: '1.5rem',
              transition: 'transform 0.2s'
            }}>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: '900', 
                color: '#3b82f6', 
                background: 'rgba(59, 130, 246, 0.1)', 
                padding: '4px 10px', 
                borderRadius: '100px',
                display: 'inline-block',
                marginBottom: '1rem'
              }}>
                {insight.tag}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.75rem' }}>{insight.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>{insight.content}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(251, 191, 36, 0.05)', border: '1px dashed #fbbf24', borderRadius: '24px', textAlign: 'center' }}>
          <h2 style={{ color: '#fbbf24', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Deep Analysis in Pipeline</h2>
          <p style={{ color: '#94a3b8' }}>Advanced AI synthesis for Mains Answer Writing models is coming soon for PRO users.</p>
        </div>
      </main>
    </div>
  );
}
