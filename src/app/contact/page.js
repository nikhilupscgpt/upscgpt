import Link from 'next/link';

export const metadata = {
  title: 'Contact Us & Grievance Redressal | UPSCGPT',
  description: 'Reach out to the UPSCGPT support desk for subscription assistance, technical queries, academic feedback, or statutory grievance redressal.',
  alternates: {
    canonical: 'https://www.upscgpt.in/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="contact-page-container">
      <div className="contact-header-block">
        <span className="contact-pill">SUPPORT &amp; GRIEVANCE REDRESSAL</span>
        <h1 className="contact-title">Get in Touch with UPSCGPT</h1>
        <p className="contact-subtitle">
          Have questions about your subscription, encounter a technical defect, or have academic feedback? Our team is dedicated to supporting serious Civil Services aspirants.
        </p>
      </div>

      <div className="contact-cards-grid">
        {/* Support Card 1: Student Support */}
        <div className="contact-box">
          <div className="box-icon">💬</div>
          <h3>Student Helpdesk &amp; Inquiries</h3>
          <p>
            For general platform inquiries, feedback on Prelims PYQ explanations, syllabus mapping suggestions, or bug reports:
          </p>
          <a href="mailto:support@upscgpt.in" className="contact-action-link">
            support@upscgpt.in &rarr;
          </a>
          <span className="box-sla">Average response time: 12&ndash;24 business hours</span>
        </div>

        {/* Support Card 2: Billing & Subscriptions */}
        <div className="contact-box">
          <div className="box-icon">💳</div>
          <h3>Billing, Invoices &amp; Razorpay</h3>
          <p>
            Need an invoice copy, have questions regarding your Pro subscription, or need assistance with a payment:
          </p>
          <a href="mailto:support@upscgpt.in?subject=Billing%20Support%20Request" className="contact-action-link">
            support@upscgpt.in &rarr;
          </a>
          <span className="box-sla">Priority payment support with Razorpay reference IDs</span>
        </div>

        {/* Support Card 3: Statutory Grievance Redressal */}
        <div className="contact-box grievance">
          <div className="box-icon">⚖️</div>
          <h3>Statutory Grievance Redressal Officer</h3>
          <p>
            In compliance with the <em>Information Technology Act, 2000</em> and the <em>Consumer Protection (E-Commerce) Rules, 2020</em>:
          </p>
          <div className="grievance-details">
            <p><strong>Designation:</strong> Grievance Redressal Officer</p>
            <p><strong>Platform:</strong> UPSCGPT Educational Services</p>
            <p><strong>Official Email:</strong> <a href="mailto:grievance@upscgpt.in">grievance@upscgpt.in</a></p>
            <p><strong>Operating Region:</strong> Maharashtra, India</p>
          </div>
          <span className="box-sla statutory">
            &bull; Acknowledgment within 48 hours &middot; Resolution within 30 days
          </span>
        </div>
      </div>

      {/* Official Business & Operating Entity Information */}
      <div className="entity-info-card">
        <h3>Official Business Information</h3>
        <p>
          UPSCGPT is an independent digital educational portal operated and maintained in India.
        </p>
        <div className="entity-meta-row">
          <div className="entity-meta-item">
            <span className="meta-label">Operating Domain</span>
            <span className="meta-value">https://www.upscgpt.in</span>
          </div>
          <div className="entity-meta-item">
            <span className="meta-label">Primary Business Activity</span>
            <span className="meta-value">Educational Technology &amp; Competitive Exam Preparation</span>
          </div>
          <div className="entity-meta-item">
            <span className="meta-label">Payment Aggregator</span>
            <span className="meta-value">Razorpay (RBI Regulated Payment Gateway)</span>
          </div>
          <div className="entity-meta-item">
            <span className="meta-label">Country of Origin</span>
            <span className="meta-value">India (IN)</span>
          </div>
        </div>
      </div>

      {/* Common Resolution Steps */}
      <div className="faq-section">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-list">
          <div className="faq-item">
            <h4>I paid on Razorpay, but my subscription is not showing active. What should I do?</h4>
            <p>
              Subscription activations are usually instantaneous. In rare instances of bank network latency, webhook confirmation may take up to 5 minutes. If your account still shows as free, please email <a href="mailto:support@upscgpt.in">support@upscgpt.in</a> with your <strong>Razorpay Payment ID</strong> (e.g. <code>pay_XXXXXXXXXX</code>) and we will activate your plan immediately.
            </p>
          </div>

          <div className="faq-item">
            <h4>How can I request a refund?</h4>
            <p>
              Please review our <Link href="/refund-policy">Cancellation &amp; Refund Policy</Link>. You can email our billing desk within 7 days of initial purchase with your transaction details.
            </p>
          </div>

          <div className="faq-item">
            <h4>Is UPSCGPT officially part of the UPSC?</h4>
            <p>
              No. UPSCGPT is a completely independent self-study ed-tech platform. We are not affiliated with, endorsed by, or connected to the Union Public Service Commission or any government department.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page-container {
          max-width: 1040px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          color: var(--text-primary, #ffffff);
          font-family: var(--font-outfit), system-ui, sans-serif;
        }

        .contact-header-block {
          text-align: center;
          margin-bottom: 48px;
        }

        .contact-pill {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.12);
          color: var(--color-blue, #38bdf8);
          border: 1px solid rgba(59, 130, 246, 0.3);
          margin-bottom: 14px;
        }

        .contact-title {
          font-size: clamp(2.2rem, 4.5vw, 3.2rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 0 0 14px 0;
          color: var(--text-primary, #ffffff);
        }

        .contact-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary, #94a3b8);
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .contact-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .contact-box {
          background: var(--bg-card, rgba(15, 23, 42, 0.75));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          border-radius: 20px;
          padding: 32px 26px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(20px);
        }

        .contact-box.grievance {
          border-color: rgba(245, 158, 11, 0.3);
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(245, 158, 11, 0.04));
        }

        .box-icon {
          font-size: 2.2rem;
          margin-bottom: 16px;
        }

        .contact-box h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0 0 10px 0;
          color: var(--text-primary, #ffffff);
        }

        .contact-box p {
          font-size: 0.92rem;
          line-height: 1.6;
          color: var(--text-secondary, #cbd5e1);
          margin: 0 0 16px 0;
          flex-grow: 1;
        }

        .contact-action-link {
          font-size: 0.98rem;
          font-weight: 800;
          color: var(--color-blue, #38bdf8);
          text-decoration: none;
          margin-bottom: 12px;
          display: inline-block;
        }

        .contact-action-link:hover {
          text-decoration: underline;
        }

        .box-sla {
          font-size: 0.76rem;
          color: var(--text-muted, #64748b);
          font-weight: 600;
        }

        .box-sla.statutory {
          color: #fbbf24;
          font-weight: 700;
        }

        .grievance-details {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 14px;
          font-size: 0.85rem;
        }

        .grievance-details p {
          margin: 0 0 4px 0;
          line-height: 1.4;
          color: var(--text-secondary, #cbd5e1);
        }

        .grievance-details p:last-child {
          margin-bottom: 0;
        }

        /* Entity Info Card */
        .entity-info-card {
          background: var(--bg-card, rgba(15, 23, 42, 0.6));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 48px;
        }

        .entity-info-card h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: var(--text-primary, #ffffff);
        }

        .entity-info-card p {
          font-size: 0.9rem;
          color: var(--text-muted, #64748b);
          margin: 0 0 20px 0;
        }

        .entity-meta-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .entity-meta-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .meta-value {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary, #ffffff);
        }

        /* FAQs */
        .faq-section {
          background: var(--bg-card, rgba(15, 23, 42, 0.6));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          border-radius: 20px;
          padding: 36px;
        }

        .faq-section h3 {
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0 0 20px 0;
          color: var(--text-primary, #ffffff);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .faq-item {
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          padding-bottom: 16px;
        }

        .faq-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .faq-item h4 {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary, #ffffff);
          margin: 0 0 6px 0;
        }

        .faq-item p {
          font-size: 0.9rem;
          color: var(--text-secondary, #cbd5e1);
          margin: 0;
          line-height: 1.55;
        }

        a {
          color: var(--color-blue, #38bdf8);
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .entity-info-card, .faq-section {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
