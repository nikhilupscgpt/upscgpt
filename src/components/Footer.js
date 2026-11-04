import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="upsc-global-footer">
      <div className="footer-container">
        {/* Top Grid */}
        <div className="footer-grid">
          {/* Brand & Mission Column */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="logo-main">upsc</span>
              <span className="logo-accent">gpt</span>
              <span className="logo-domain">.in</span>
            </div>
            <p className="footer-tagline">
              India&apos;s strategic, clutter-free learning platform for UPSC Civil Services Examination (CSE) aspirants. Topic-wise solved Prelims PYQs, syllabus knowledge graph, and spatial geography atlas.
            </p>
            <div className="footer-contact-mini">
              <div>Email: <a href="mailto:nikhil@upscgpt.in" className="footer-mail-link">nikhil@upscgpt.in</a></div>
              <div>Helpline: <a href="tel:+917709495797" className="footer-mail-link">+91 7709495797</a></div>
              <div>Location: Nagpur, Maharashtra, India</div>
            </div>
          </div>

          {/* Core Study Engines */}
          <div className="footer-col">
            <h4 className="footer-col-title">Study Engines</h4>
            <ul className="footer-nav-list">
              <li><Link href="/prelims/pyq">Prelims PYQ Explorer (2011–2025)</Link></li>
              <li><Link href="/atlas">Interactive Geography Atlas</Link></li>
              <li><Link href="/mapping">Places in News (PIN)</Link></li>
              <li><Link href="/prelims/mocks">Prelims Mock Simulator</Link></li>
              <li><Link href="/pricing">Pro Subscription Plans</Link></li>
            </ul>
          </div>

          {/* Syllabus Knowledge Base */}
          <div className="footer-col">
            <h4 className="footer-col-title">Syllabus Knowledge</h4>
            <ul className="footer-nav-list">
              <li><Link href="/prelims/pyq?subject=Indian+Polity">Indian Polity & Governance</Link></li>
              <li><Link href="/prelims/pyq?subject=Economy">Indian Economy & Banking</Link></li>
              <li><Link href="/prelims/pyq?subject=Geography">Physical & Human Geography</Link></li>
              <li><Link href="/prelims/pyq?subject=Environment">Environment & Biodiversity</Link></li>
              <li><Link href="/prelims/pyq?subject=Science+%26+Technology">Science & Technology</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance (Razorpay & India IT Act) */}
          <div className="footer-col">
            <h4 className="footer-col-title">Legal & Trust</h4>
            <ul className="footer-nav-list">
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy (DPDP 2023)</Link></li>
              <li><Link href="/refund-policy">Cancellation & Refund Policy</Link></li>
              <li><Link href="/contact">Contact Us & Grievances</Link></li>
              <li><Link href="/sitemap.xml">XML Sitemap</Link></li>
            </ul>
          </div>
        </div>

        {/* Statutory Non-Affiliation Disclaimer Banner */}
        <div className="statutory-disclaimer-box">
          <p className="disclaimer-heading">⚠️ STATUTORY NON-AFFILIATION DISCLAIMER</p>
          <p className="disclaimer-text">
            <strong>UPSCGPT (upscgpt.in)</strong> is an independent digital educational and learning platform developed exclusively for self-study and examination preparation assistance. UPSCGPT is <strong>NOT</strong> affiliated with, associated with, authorized by, endorsed by, sponsored by, or in any way officially connected with the <strong>Union Public Service Commission (UPSC)</strong>, the Government of India, or any state or central governmental body. All examination names, past question texts, syllabus terminology, and marks are the intellectual property of their respective official bodies and are referenced strictly under fair-use principles for nominative, educational, and descriptive study guidance.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Grievance */}
        <div className="footer-bottom-bar">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} UPSCGPT (upscgpt.in) &middot; Nagpur, Maharashtra &middot; Crafted for serious Civil Services aspirants.
          </p>
          <div className="footer-legal-pills">
            <span>IT Act 2000 &amp; DPDP 2023 Compliant</span>
            <span className="dot-sep">&bull;</span>
            <Link href="/contact">Grievance Redressal</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .upsc-global-footer {
          position: relative;
          z-index: 20;
          background: var(--bg-card, rgba(15, 23, 42, 0.95));
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          color: var(--text-secondary, #94a3b8);
          font-size: 0.88rem;
          line-height: 1.6;
          margin-top: 80px;
          padding: 60px 24px 32px;
          backdrop-filter: blur(20px);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1.2fr 1.2fr;
          gap: 40px;
          margin-bottom: 44px;
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          color: var(--text-primary, #ffffff);
        }

        .logo-main {
          font-family: var(--font-outfit), sans-serif;
        }

        .logo-accent {
          color: var(--color-blue, #38bdf8);
        }

        .logo-domain {
          font-size: 1rem;
          color: var(--text-muted, #64748b);
          font-weight: 700;
        }

        .footer-tagline {
          font-size: 0.85rem;
          color: var(--text-muted, #64748b);
          margin: 0 0 16px 0;
          max-width: 340px;
          line-height: 1.55;
        }

        .footer-contact-mini {
          font-size: 0.82rem;
          color: var(--text-muted, #64748b);
        }

        .footer-mail-link {
          color: var(--color-blue, #38bdf8);
          font-weight: 700;
          text-decoration: none;
        }

        .footer-mail-link:hover {
          text-decoration: underline;
        }

        .footer-col-title {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-primary, #ffffff);
          margin: 0 0 18px 0;
        }

        .footer-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-nav-list li a {
          color: var(--text-secondary, #94a3b8);
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.15s ease, transform 0.15s ease;
          display: inline-block;
        }

        .footer-nav-list li a:hover {
          color: var(--color-blue, #38bdf8);
          transform: translateX(2px);
        }

        /* Disclaimer Box */
        .statutory-disclaimer-box {
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 32px;
        }

        .disclaimer-heading {
          margin: 0 0 6px 0;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: #f59e0b;
        }

        .disclaimer-text {
          margin: 0;
          font-size: 0.76rem;
          color: var(--text-muted, #94a3b8);
          line-height: 1.55;
        }

        .disclaimer-text strong {
          color: var(--text-secondary, #cbd5e1);
        }

        /* Bottom Bar */
        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          font-size: 0.78rem;
          color: var(--text-muted, #64748b);
        }

        .footer-copy {
          margin: 0;
        }

        .footer-legal-pills {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-legal-pills a {
          color: var(--text-secondary, #94a3b8);
          text-decoration: none;
          font-weight: 600;
        }

        .footer-legal-pills a:hover {
          color: var(--color-blue, #38bdf8);
        }

        .dot-sep {
          opacity: 0.5;
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .brand-col {
            grid-column: span 2;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .brand-col {
            grid-column: span 1;
          }
          .footer-bottom-bar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
