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
          <span className="legal-badge refund">CONSUMER PROTECTION &amp; BILLING</span>
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
    </div>
  );
}
