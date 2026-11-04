import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | UPSCGPT (DPDP Act 2023 Compliant)',
  description: 'Understand how UPSCGPT collects, stores, processes, and protects your personal learning data under the Indian Digital Personal Data Protection Act, 2023.',
  alternates: {
    canonical: 'https://www.upscgpt.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 4, 2026';

  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <span className="legal-badge privacy">DATA PRIVACY &amp; PROTECTION</span>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last Updated: {lastUpdated} &middot; Compliant with DPDP Act, 2023 &amp; IT Rules, 2011</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Introduction &amp; Commitment</h2>
            <p>
              At <strong>UPSCGPT</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;), operated via <Link href="https://www.upscgpt.in">https://www.upscgpt.in</Link>, your personal privacy and data sovereignty are paramount. This Privacy Policy details our practices concerning the collection, storage, processing, and safeguarding of personal data when you use our educational learning platform.
            </p>
            <p>
              This policy is formulated in strict accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000 (IT Act)</strong>, and the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</em>.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <p>
              We only collect personal information that is reasonably necessary to provide, personalize, and secure our ed-tech services:
            </p>
            <ul>
              <li>
                <strong>Identity and Account Data:</strong> When you register or sign in via Google OAuth or authenticated credentials, we receive your name, email address, and profile picture avatar.
              </li>
              <li>
                <strong>Academic &amp; Learning Analytics Data:</strong> To help you master the UPSC syllabus, our platform records your question attempts (correct/incorrect choices, time spent per question, streak counters, notebook highlights, and bookmarked questions).
              </li>
              <li>
                <strong>Billing &amp; Transaction Data:</strong> When purchasing a subscription, transactions are processed by certified payment gateways (such as <strong>Razorpay</strong>). We record transaction confirmation IDs, amounts paid, plan types, and expiry dates. <em>We never store your raw debit/credit card numbers, CVVs, or bank net-banking passwords.</em>
              </li>
              <li>
                <strong>Technical &amp; Log Data:</strong> Standard server logs, IP addresses, browser types, operating systems, and page interaction timestamps collected for cybersecurity, DDoS mitigation, and service optimization.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Legal Grounds &amp; Purpose of Processing</h2>
            <p>
              Under the DPDP Act, 2023, we process your personal data under the following legitimate grounds:
            </p>
            <ul>
              <li><strong>To Provide Educational Services:</strong> Delivering topic-wise PYQs, generating interactive option elimination logic, and syncing your study progress across devices.</li>
              <li><strong>To Maintain Your Study Habits:</strong> Calculating and rendering your daily 10-question study streaks and performance analytics.</li>
              <li><strong>To Process Transactions:</strong> Fulfilling paid subscription memberships and generating tax invoices.</li>
              <li><strong>To Ensure Security:</strong> Detecting and preventing unauthorized logins, bot scraping, payment fraud, and malicious abuse of our APIs.</li>
              <li><strong>Customer Support:</strong> Communicating service updates, responding to technical bug reports, and handling user grievances.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Third-Party Service Providers (Data Processors)</h2>
            <p>
              We do not sell, rent, or trade your personal data to advertisers or commercial brokers. We only share data with vetted third-party infrastructure providers necessary to operate the Platform:
            </p>
            <ul>
              <li><strong>Payment Aggregator:</strong> <em>Razorpay Software Private Limited</em> (PCI-DSS Level 1 compliant gateway for processing INR subscriptions).</li>
              <li><strong>Cloud Hosting &amp; Edge Network:</strong> <em>Vercel Inc.</em> (Hosts platform serverless functions and CDN edge networks).</li>
              <li><strong>Database Infrastructure:</strong> <em>PostgreSQL Cloud Instances (Neon/Supabase)</em> (Encrypted-at-rest database storage for accounts, PYQs, and bookmarks).</li>
              <li><strong>Authentication:</strong> <em>Google Identity Services</em> (For secure, verified single sign-on).</li>
              <li><strong>Transactional Email:</strong> <em>Resend / Sendgrid</em> (For delivering password resets, OTPs, and subscription receipts).</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Security Measures</h2>
            <p>
              We implement comprehensive physical, electronic, and managerial safeguards to protect your personal information:
            </p>
            <ul>
              <li>All web traffic between your browser and UPSCGPT is encrypted using modern <strong>TLS 1.3 / SSL encryption</strong>.</li>
              <li>User passwords and authentication tokens are salted and hashed using cryptographic standards (Bcrypt / Argon2).</li>
              <li>Payment webhook payloads are verified using HMAC-SHA256 timing-safe signatures to eliminate spoofing.</li>
              <li>Access to production databases is restricted to authorized engineers behind multi-factor authentication (MFA).</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Your Rights Under the DPDP Act, 2023</h2>
            <p>
              As a Data Principal under Indian law, you have enforceable legal rights regarding your personal information:
            </p>
            <ul>
              <li><strong>Right to Access:</strong> You can request a summary of the personal data we hold about you.</li>
              <li><strong>Right to Correction &amp; Erasure:</strong> You can edit your profile details or request the permanent deletion of your account and associated quiz history by contacting our support desk.</li>
              <li><strong>Right to Grievance Redressal:</strong> You have the right to lodge a complaint regarding data processing with our designated Grievance Officer.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Data Retention Policy</h2>
            <p>
              We retain your personal learning data for as long as your account remains active or as required to fulfill our legal and taxation obligations (e.g., maintaining billing logs for statutory tax audits). If you delete your account, your personal identifying records are purged or anonymized from active operational databases within thirty (30) days.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Grievance Officer Details</h2>
            <div className="legal-callout">
              <p>
                In compliance with Rule 3(2) of the <em>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</em> and the <em>DPDP Act, 2023</em>, the details of our designated Grievance Officer are:
              </p>
              <ul style={{ margin: '10px 0 0 20px' }}>
                <li><strong>Designation:</strong> Grievance Redressal Officer, UPSCGPT</li>
                <li><strong>Entity:</strong> UPSCGPT Educational Services</li>
                <li><strong>Email:</strong> <a href="mailto:nikhil@upscgpt.in" style={{ color: '#f59e0b', fontWeight: 'bold' }}>nikhil@upscgpt.in</a></li>
                <li><strong>Helpline:</strong> <a href="tel:+917709495797" style={{ color: '#f59e0b', fontWeight: 'bold' }}>+91 7709495797</a></li>
                <li><strong>Jurisdiction &amp; Address:</strong> Nagpur, Maharashtra, India</li>
                <li><strong>Statutory Response SLA:</strong> Acknowledgment within forty-eight (48) hours; resolution within thirty (30) days of receipt.</li>
              </ul>
            </div>
          </section>

          <section className="legal-section">
            <h2>9. Policy Revisions</h2>
            <p>
              We may periodically update this Privacy Policy to reflect modifications in regulatory standards or platform capabilities. Changes take effect immediately upon publication on this page with an updated &ldquo;Last Updated&rdquo; date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
