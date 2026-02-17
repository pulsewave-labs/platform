import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00F0B5] hover:text-[#4DFFD0] transition-colors mb-6">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-[#8b95a5] text-lg">Terms and conditions for using PulseWave Labs services</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              By accessing or using PulseWave Labs ("we," "us," "our") services, website, or platform (collectively, the "Service"), 
              you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, 
              then you may not access the Service.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              These Terms constitute a legally binding agreement between you and PulseWave Labs. 
              By using our Service, you represent that you are at least 18 years old and have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Description of Service</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              PulseWave Labs provides trading tools, technical analysis, market signals, and educational content related to cryptocurrency trading. 
              Our services include but are not limited to:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Algorithmic trading signals and analysis</li>
              <li>Risk management tools and calculators</li>
              <li>Trading journal and performance tracking</li>
              <li>Educational content and market insights</li>
              <li>Technical analysis tools and indicators</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed">
              <strong className="text-white">Important:</strong> Our services provide tools and information for educational and analytical purposes only. 
              We do not provide investment advice, manage client accounts, or make trading decisions on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. User Responsibilities</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              By using our Service, you agree to:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the Service in compliance with all applicable laws and regulations</li>
              <li>Not share your account access with others</li>
              <li>Not attempt to reverse engineer, hack, or compromise our platform</li>
              <li>Not use our Service for any illegal or unauthorized purposes</li>
              <li>Take full responsibility for your trading decisions and their outcomes</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed">
              You acknowledge that trading cryptocurrencies involves substantial risk and that you are solely responsible for 
              evaluating the risks and benefits of any trading decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Account Terms</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              To access certain features of our Service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Maintaining the confidentiality of your account information</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We reserve the right to terminate or suspend your account at any time for violations of these Terms or for any other reason, 
              with or without notice.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              Accounts that remain inactive for 12 months or more may be suspended. 
              We will provide notice before suspending inactive accounts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Payment and Refund Policy</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              Our Service operates on a subscription basis with the following terms:
            </p>
            
            <h3 className="text-lg font-semibold mb-3 text-white">Free Trial</h3>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              New users are eligible for a 14-day free trial. No credit card is required for the trial period. 
              The trial automatically expires without any charges unless you choose to subscribe.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-white">Subscription Terms</h3>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Subscriptions are billed monthly or annually in advance</li>
              <li>All fees are in USD unless otherwise specified</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Price changes will be communicated 30 days in advance</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-white">Refund Policy</h3>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We offer a 30-day money-back guarantee for new subscribers. To request a refund:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Contact support within 30 days of your first payment</li>
              <li>Refunds are processed to the original payment method</li>
              <li>Refunds may take 5-10 business days to appear on your statement</li>
              <li>Free trial users are not eligible for refunds as no payment was charged</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-white">Cancellation</h3>
            <p className="text-[#8b95a5] leading-relaxed">
              You may cancel your subscription at any time through your account settings or by contacting support. 
              Cancellation takes effect at the end of your current billing period. No partial refunds are provided for unused portions of subscription periods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Intellectual Property</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of PulseWave Labs and its licensors. 
              The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used without our prior written consent.
            </p>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              You are granted a limited, non-exclusive, non-transferable license to access and use the Service for your personal use only. 
              You may not:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Reproduce, distribute, or create derivative works from our content</li>
              <li>Reverse engineer or attempt to extract source code from our platform</li>
              <li>Use our signals or analysis for commercial redistribution</li>
              <li>Remove or alter any proprietary notices or labels</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">7. Limitation of Liability</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              <strong className="text-white">IMPORTANT:</strong> To the maximum extent permitted by applicable law, 
              PulseWave Labs shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              In any case, PulseWave Labs' total liability to you for all damages, losses, and causes of action 
              shall not exceed the total amount of subscription fees paid by you to PulseWave Labs in the twelve (12) months 
              preceding the incident giving rise to such liability.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              This limitation applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, 
              even if PulseWave Labs has been advised of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">8. Indemnification</h2>
            <p className="text-[#8b95a5] leading-relaxed">
              You agree to defend, indemnify, and hold harmless PulseWave Labs and its officers, directors, employees, and agents 
              from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees 
              arising out of or relating to your use of the Service, your trading activities, or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">9. Disclaimer of Warranties</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. PulseWave Labs expressly disclaims all warranties, 
              whether express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
              <li>Warranties regarding the accuracy, reliability, or completeness of any information</li>
              <li>Warranties that the Service will be uninterrupted, error-free, or secure</li>
              <li>Any warranties regarding trading results or profitability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">10. Governing Law</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
              without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms 
              will be brought exclusively in the courts of Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">11. Changes to Terms</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              By continuing to use the Service after the revised Terms become effective, 
              you agree to be bound by the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">12. Contact Information</h2>
            <p className="text-[#8b95a5] leading-relaxed">
              If you have any questions about these Terms, please contact us at:
              <br />
              <strong className="text-white">Email:</strong> legal@pulsewavelabs.com
              <br />
              <strong className="text-white">Support:</strong> support@pulsewavelabs.com
            </p>
          </section>

          <div className="border-t border-white/10 pt-8 mt-12">
            <p className="text-sm text-[#6b7280] leading-relaxed">
              <strong className="text-[#8b95a5]">Last updated:</strong> February 17, 2026
              <br />
              These Terms are effective immediately upon posting. Please review them periodically for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}