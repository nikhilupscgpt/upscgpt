"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isHiddenRoute =
    pathname &&
    (pathname === "/login" ||
      pathname === "/admin-login" ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/prelims/pyq/practice"));
  if (isHiddenRoute) return null;

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
    </footer>
  );
}
