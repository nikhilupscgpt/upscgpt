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
          <a href="mailto:nikhil@upscgpt.in" className="contact-action-link">
            nikhil@upscgpt.in &rarr;
          </a>
          <span className="box-sla">Direct helpline: <a href="tel:+917709495797" style={{ color: 'inherit', fontWeight: 700 }}>+91 7709495797</a></span>
        </div>

        {/* Support Card 2: Billing & Subscriptions */}
        <div className="contact-box">
          <div className="box-icon">💳</div>
          <h3>Billing, Invoices &amp; Razorpay</h3>
          <p>
            Need an invoice copy, have questions regarding your Pro subscription, or need assistance with a payment:
          </p>
          <a href="mailto:nikhil@upscgpt.in?subject=Billing%20Support%20Request" className="contact-action-link">
            nikhil@upscgpt.in &rarr;
          </a>
          <span className="box-sla">Priority payment support &middot; WhatsApp: +91 7709495797</span>
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
            <p><strong>Official Email:</strong> <a href="mailto:nikhil@upscgpt.in">nikhil@upscgpt.in</a></p>
            <p><strong>Direct Helpline:</strong> <a href="tel:+917709495797">+91 7709495797</a></p>
            <p><strong>Operating Address:</strong> Nagpur, Maharashtra, India</p>
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
            <span className="meta-label">Official Email</span>
            <span className="meta-value">nikhil@upscgpt.in</span>
          </div>
          <div className="entity-meta-item">
            <span className="meta-label">Helpline Number</span>
            <span className="meta-value">+91 7709495797</span>
          </div>
          <div className="entity-meta-item">
            <span className="meta-label">Registered Location</span>
            <span className="meta-value">Nagpur, Maharashtra, India</span>
          </div>
          <div className="entity-meta-item">
            <span className="meta-label">Payment Aggregator</span>
            <span className="meta-value">Razorpay (RBI Regulated Payment Gateway)</span>
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
              Subscription activations are usually instantaneous. In rare instances of bank network latency, webhook confirmation may take up to 5 minutes. If your account still shows as free, please email <a href="mailto:nikhil@upscgpt.in">nikhil@upscgpt.in</a> or message WhatsApp at <strong>+91 7709495797</strong> with your <strong>Razorpay Payment ID</strong> (e.g. <code>pay_XXXXXXXXXX</code>) and we will activate your plan immediately.
            </p>
          </div>

          <div className="faq-item">
            <h4>How can I request a refund?</h4>
            <p>
              Please review our <Link href="/refund-policy">Cancellation &amp; Refund Policy</Link>. You can email our billing desk at <a href="mailto:nikhil@upscgpt.in">nikhil@upscgpt.in</a> within 7 days of initial purchase with your transaction details.
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
    </div>
  );
}
