import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | UPSCGPT',
  description: 'Terms and conditions governing the use of the UPSCGPT learning platform, subscription services, and intellectual property.',
  alternates: {
    canonical: 'https://www.upscgpt.in/terms',
  },
};

export default function TermsPage() {
  const lastUpdated = 'November 4, 2026';

  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <span className="legal-badge">LEGAL AGREEMENT</span>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Last Updated: {lastUpdated} &middot; Effective Immediately</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              Welcome to <strong>UPSCGPT</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us,&rdquo; or the &ldquo;Platform&rdquo;), operated at <Link href="https://www.upscgpt.in">https://www.upscgpt.in</Link>. By accessing, browsing, registering an account, or purchasing a digital subscription on UPSCGPT, you (&ldquo;User,&rdquo; &ldquo;Student,&rdquo; or &ldquo;You&rdquo;) agree to be legally bound by these Terms of Service (&ldquo;Terms&rdquo;) and our <Link href="/privacy">Privacy Policy</Link>. If you do not agree with any part of these Terms, you must discontinue use of the Platform immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Statutory Non-Affiliation Disclaimer</h2>
            <div className="legal-callout">
              <p>
                <strong>IMPORTANT NOTICE:</strong> UPSCGPT is an independent ed-tech learning and exam preparation platform. UPSCGPT is <strong>NOT</strong> affiliated with, endorsed by, sponsored by, authorized by, or in any way officially associated with the <strong>Union Public Service Commission (UPSC)</strong>, the Government of India, or any state public service commission. Any reference to &ldquo;UPSC,&rdquo; &ldquo;Civil Services Examination,&rdquo; &ldquo;CSE,&rdquo; &ldquo;Prelims,&rdquo; &ldquo;Mains,&rdquo; or related terminology is strictly for nominative, educational, and descriptive identification purposes under Indian trademark law.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>3. Eligibility and Account Registration</h2>
            <p>
              To access personalized features, mock tests, and bookmarking tools on the Platform, you may be required to create an account via Google OAuth or authenticated credentials. By creating an account, you represent and warrant that:
            </p>
            <ul>
              <li>You are at least 18 years of age, or possess legal parental or guardian consent if under 18.</li>
              <li>All information provided during registration is accurate, current, and complete.</li>
              <li>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
              <li>Account sharing, credential distribution, or concurrent multi-device session exploitation is strictly prohibited and constitutes grounds for immediate suspension without refund.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Subscriptions, Pricing, and Payments (Razorpay)</h2>
            <p>
              UPSCGPT offers digital subscription plans (&ldquo;Pro Tier,&rdquo; &ldquo;Annual Pass&rdquo;) granting access to advanced analytics, AI-assisted option elimination matrices, syllabus knowledge graph nodes, and mock simulators.
            </p>
            <ul>
              <li><strong>Pricing & Currency:</strong> All prices listed on our <Link href="/pricing">Pricing Page</Link> are denominated in Indian Rupees (INR &middot; &#8377;) and are inclusive of applicable goods and services taxes unless explicitly specified otherwise.</li>
              <li><strong>Payment Processing:</strong> Payments are processed securely through certified Reserve Bank of India (RBI) compliant third-party payment aggregators, including <strong>Razorpay</strong>. UPSCGPT does not store, process, or have access to your raw credit/debit card numbers or bank account credentials.</li>
              <li><strong>Instant Digital Fulfillment:</strong> Because UPSCGPT delivers digital learning content, premium access is granted automatically upon successful payment confirmation.</li>
              <li><strong>Renewals and Cancellations:</strong> You may cancel recurring subscription renewals at any time from your account profile. Your access will remain active until the end of the current billing cycle.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Intellectual Property Rights</h2>
            <p>
              <strong>Past Year Questions (PYQs):</strong> Question texts from past Civil Services Examinations are public domain academic materials published by official conducting bodies. UPSCGPT claims no copyright over the verbatim stems of past government examination papers.
            </p>
            <p>
              <strong>Proprietary Content:</strong> All proprietary option elimination matrices, concept summaries, micro-theme classifications, pedagogical diagrams, interactive geospatial maps, UI designs, codebases, algorithms, and software architectures belong exclusively to UPSCGPT. You are granted a limited, personal, non-exclusive, non-transferable, and revocable license to access the content solely for individual educational preparation.
            </p>
            <p>
              You agree NOT to:
            </p>
            <ul>
              <li>Scrape, crawl, extract, copy, or redistribute questions, notes, or data from UPSCGPT using automated tools, bots, or scripts.</li>
              <li>Resell, sublicense, publish, or commercially exploit any proprietary notes or matrices generated on the Platform.</li>
              <li>Decompile, reverse-engineer, or attempt to extract the source code or database schemas powering the Platform.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. AI Output and Academic Accuracy Disclaimer</h2>
            <p>
              UPSCGPT leverages advanced artificial intelligence models (such as Google Gemini and Gemma) alongside human academic curation to synthesize syllabus outlines, current affairs linkages, and option elimination reasoning.
            </p>
            <p>
              While we strive for high precision, AI models may occasionally produce inaccuracies, omissions, or biased reasoning. The content provided on the Platform is intended as supplementary exam preparation material and does not constitute official legal, constitutional, or civil service counsel. Students are strongly advised to cross-reference with official UPSC answer keys, standard reference textbooks (NCERT, Laxmikanth, Ramesh Singh, etc.), and official government gazettes.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable Indian law:
            </p>
            <ul>
              <li>UPSCGPT and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, exam opportunities, or academic outcomes resulting from your use of the Platform.</li>
              <li>UPSCGPT does not guarantee or warrant that study materials on the Platform will guarantee qualification, selection, or specific marks in any examination.</li>
              <li>In no event shall our total aggregate liability exceed the total subscription fees actually paid by you to UPSCGPT during the three (3) months preceding the claim.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Termination of Access</h2>
            <p>
              We reserve the right, without prior notice or liability, to suspend, terminate, or restrict your access to the Platform if you violate these Terms, engage in fraudulent payment chargebacks, abuse platform infrastructure with bot traffic, or engage in defamatory conduct against the Platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by, construed, and enforced in accordance with the laws of the Republic of India, without regard to conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms or the Platform shall be subject to the exclusive jurisdiction of the competent civil courts in India.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Contact Us and Grievances</h2>
            <p>
              If you have any questions, concerns, or legal notices regarding these Terms, please reach out through our official <Link href="/contact">Contact Page</Link>, call our helpline at <a href="tel:+917709495797">+91 7709495797</a>, or email our support desk at <a href="mailto:nikhil@upscgpt.in">nikhil@upscgpt.in</a> (Operating Office: Nagpur, Maharashtra, India).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
