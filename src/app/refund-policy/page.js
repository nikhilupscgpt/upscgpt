import Link from 'next/link';

export const metadata = {
  title: 'Cancellation and Refund Policy | UPSCGPT',
  description: 'Understand the cancellation, return, and refund policy for digital learning subscriptions on UPSCGPT in accordance with Razorpay merchant standards.',
  alternates: {
    canonical: 'https://www.upscgpt.in/refund-policy',
  },
};

export default function RefundPolicyPage() {
  const lastUpdated = 'November 4, 2026';

  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <span className="legal-badge">CONSUMER PROTECTION &amp; BILLING</span>
          <h1 className="legal-title">Cancellation &amp; Refund Policy</h1>
          <p className="legal-meta">Last Updated: {lastUpdated} &middot; Razorpay Merchant Compliant</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Overview of Digital Services</h2>
            <p>
              Thank you for subscribing to <strong>UPSCGPT</strong> (<Link href="https://www.upscgpt.in">https://www.upscgpt.in</Link>). We provide online digital educational access, including curated UPSC Prelims Previous Year Questions, AI-assisted option elimination matrices, topic-wise syllabus knowledge graph nodes, and interactive geography mapping tools.
            </p>
            <p>
              Because our offerings are intangible, digital web-based products, access to premium features is provisioned instantaneously upon payment confirmation via our certified payment gateway, <strong>Razorpay</strong>.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Subscription Cancellation Policy</h2>
            <p>
              Users have full freedom to manage their learning subscriptions:
            </p>
            <ul>
              <li>
                <strong>Self-Service Cancellation:</strong> You can cancel your subscription at any time by navigating to your account settings or emailing our support desk at <a href="mailto:nikhil@upscgpt.in">nikhil@upscgpt.in</a> (Helpline: <a href="tel:+917709495797">+91 7709495797</a>).
              </li>
              <li>
                <strong>Effective Date of Cancellation:</strong> When you cancel an active subscription, your cancellation prevents future recurring billing charges. Your premium access will remain completely active and uninterrupted until the conclusion of your current paid billing period (e.g., the end of your monthly or annual cycle).
              </li>
              <li>
                <strong>No Cancellation Fees:</strong> We do not levy any cancellation penalties or administrative fees for stopping subscription renewals.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Refund Eligibility Criteria</h2>
            <p>
              We want every aspirant to experience genuine academic value on UPSCGPT. We evaluate refund requests under the following transparent terms:
            </p>
            
            <div className="refund-scenario-grid">
              <div className="scenario-card eligible">
                <div className="scenario-header">
                  <span className="scenario-badge eligible">Eligible for Refund</span>
                  <h4>Technical Billing Errors &amp; Double Debits</h4>
                </div>
                <p>
                  If you were charged multiple times for a single subscription transaction due to a payment gateway timeout, network glitch, or accidental duplicate payment, we will immediately refund the duplicate transaction in full upon verification.
                </p>
              </div>

              <div className="scenario-card eligible">
                <div className="scenario-header">
                  <span className="scenario-badge eligible">Eligible for Refund</span>
                  <h4>Persistent Technical Access Failure</h4>
                </div>
                <p>
                  If you purchased a paid plan but your premium access was not unlocked due to a verified platform database error that our engineering team cannot resolve within 48 hours of reporting, you are entitled to a full refund.
                </p>
              </div>

              <div className="scenario-card neutral">
                <div className="scenario-header">
                  <span className="scenario-badge satisfaction">Satisfaction Review</span>
                  <h4>7-Day New Subscriber Window</h4>
                </div>
                <p>
                  If you are a first-time subscriber and find that the platform does not align with your preparation strategy, you may write to us within <strong>seven (7) days</strong> of initial subscription purchase detailing your feedback. We review such claims on a fair-use basis.
                </p>
              </div>

              <div className="scenario-card ineligible">
                <div className="scenario-header">
                  <span className="scenario-badge ineligible">Non-Refundable</span>
                  <h4>Discretionary Mid-Term Claims</h4>
                </div>
                <p>
                  Refund requests initiated beyond seven (7) days of initial purchase, or renewals that were not cancelled prior to the renewal date, are non-refundable. Partial month or mid-term pro-rata refunds are not granted.
                </p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. Step-by-Step: How to Request a Refund</h2>
            <p>
              To initiate an official refund inquiry, please follow these simple steps:
            </p>
            <ol className="refund-steps-list">
              <li>
                Send an email from your registered account address to <a href="mailto:nikhil@upscgpt.in" style={{ fontWeight: 700 }}>nikhil@upscgpt.in</a> with the subject line: <code>[Refund Request] - Your Registered Email / Mobile</code>.
              </li>
              <li>
                Include the <strong>Razorpay Payment ID</strong> (e.g., <code>pay_XXXXXXXXXX</code>) or transaction receipt received on email.
              </li>
              <li>
                Briefly mention the reason for your refund request (e.g., duplicate deduction, technical glitch, or cancellation).
              </li>
            </ol>
            <p>
              Our billing support team will review your request and respond with an official acknowledgment within <strong>twenty-four to forty-eight (24–48) hours</strong>. You can also reach our helpline via WhatsApp or call at <strong>+91 7709495797</strong> (Nagpur, Maharashtra, India).
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Refund Processing Timeline and Method</h2>
            <div className="legal-callout">
              <p>
                <strong>Statutory Banking &amp; Razorpay Processing SLA:</strong> Once a refund request is approved by our billing desk, the refund is initiated immediately through Razorpay. Per Reserve Bank of India (RBI) interbank settlement guidelines, the credited funds will reflect back in your <strong>original source payment method</strong> (original UPI ID, debit card, credit card, or net banking account) within <strong>five to seven (5–7) business days</strong>. UPSCGPT cannot refund amounts in cash or redirect payments to third-party bank accounts.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>6. Chargebacks and Fraud Prevention</h2>
            <p>
              We encourage students to contact us directly at <a href="mailto:nikhil@upscgpt.in">nikhil@upscgpt.in</a> to resolve any billing misunderstandings swiftly. Initiating fraudulent payment chargebacks without contacting customer support may lead to automatic suspension of your learning profile and examination history.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contact Billing Support</h2>
            <p>
              For any questions regarding your invoice, pricing plans, or payment status, please visit our <Link href="/contact">Contact Page</Link> or email our dedicated billing helpdesk at <a href="mailto:nikhil@upscgpt.in">nikhil@upscgpt.in</a>.
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .legal-page-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          color: var(--text-primary, #ffffff);
          font-family: var(--font-outfit), system-ui, sans-serif;
        }

        .legal-content-card {
          background: var(--bg-card, rgba(15, 23, 42, 0.75));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
        }

        .legal-header {
          margin-bottom: 36px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .legal-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(245, 158, 11, 0.14);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
          margin-bottom: 12px;
        }

        .legal-title {
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 0 0 10px 0;
          color: var(--text-primary, #ffffff);
        }

        .legal-meta {
          font-size: 0.88rem;
          color: var(--text-muted, #64748b);
          margin: 0;
        }

        .legal-section {
          margin-bottom: 34px;
        }

        .legal-section h2 {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary, #ffffff);
          margin: 0 0 14px 0;
        }

        .legal-section p {
          font-size: 0.96rem;
          line-height: 1.65;
          color: var(--text-secondary, #cbd5e1);
          margin: 0 0 14px 0;
        }

        .legal-section ul {
          margin: 0 0 16px 20px;
          padding: 0;
          color: var(--text-secondary, #cbd5e1);
          line-height: 1.65;
          font-size: 0.94rem;
        }

        .legal-section li {
          margin-bottom: 10px;
        }

        .refund-steps-list {
          margin: 0 0 18px 22px;
          padding: 0;
          color: var(--text-secondary, #cbd5e1);
          line-height: 1.7;
          font-size: 0.94rem;
        }

        .refund-steps-list li {
          margin-bottom: 10px;
        }

        code {
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.88rem;
          color: #38bdf8;
        }

        /* Scenarios Grid */
        .refund-scenario-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 18px 0 24px 0;
        }

        .scenario-card {
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          background: rgba(15, 23, 42, 0.5);
        }

        .scenario-card.eligible {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.04);
        }

        .scenario-card.neutral {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(59, 130, 246, 0.04);
        }

        .scenario-card.ineligible {
          border-color: rgba(239, 68, 68, 0.25);
          background: rgba(239, 68, 68, 0.03);
        }

        .scenario-header {
          margin-bottom: 10px;
        }

        .scenario-header h4 {
          margin: 8px 0 0 0;
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary, #ffffff);
        }

        .scenario-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 999px;
          display: inline-block;
        }

        .scenario-badge.eligible {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .scenario-badge.satisfaction {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .scenario-badge.ineligible {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .scenario-card p {
          font-size: 0.88rem;
          line-height: 1.5;
          margin: 0;
          color: var(--text-secondary, #94a3b8);
        }

        .legal-callout {
          background: rgba(59, 130, 246, 0.08);
          border-left: 4px solid var(--color-blue, #3b82f6);
          border-radius: 0 12px 12px 0;
          padding: 18px 22px;
          margin: 16px 0;
        }

        .legal-callout p {
          color: #e0f2fe;
          margin: 0;
          font-size: 0.94rem;
        }

        a {
          color: var(--color-blue, #38bdf8);
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        @media (max-width: 680px) {
          .refund-scenario-grid {
            grid-template-columns: 1fr;
          }
          .legal-content-card {
            padding: 28px 20px;
          }
        }
      `}</style>
    </div>
  );
}
