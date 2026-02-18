import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00e5a0] hover:text-[#00cc8e] transition-colors text-[13px] mono mb-6">
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-white/40 text-[14px]">Last updated: February 18, 2026</p>
        </div>

        <div className="space-y-8 text-[14px] text-white/60 leading-relaxed">

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">1. Agreement to Terms</h2>
            <p className="mb-3">
              By accessing or using any services provided by PulseWave Labs ("Company," "we," "us," "our"), including our website, trading signal platform, Telegram bot, APIs, and all related services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms").
            </p>
            <p>
              If you do not agree to these Terms, you must not access or use the Service. You represent that you are at least 18 years of age, have the legal capacity to enter into binding agreements, and are not prohibited from using the Service under any applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">2. Description of Service</h2>
            <p className="mb-3">
              PulseWave Labs provides an automated cryptocurrency trading signal service. Our Service includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>Algorithmic trading signals delivered via Telegram and our web platform</li>
              <li>Historical trade performance data and analytics</li>
              <li>Signal dashboards displaying active and past signals</li>
              <li>Position sizing guidance and risk management information</li>
            </ul>
            <p>
              <strong className="text-white">Our Service provides information and signals only. We do not execute trades on your behalf, manage your funds, or have access to your exchange accounts.</strong> All trading decisions and execution are your sole responsibility. Our Service does not constitute investment advice — please refer to our Risk Disclaimer for full details.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">3. Subscription & Billing</h2>

            <p className="font-semibold text-white mb-2">Pricing</p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>Monthly plan: $149/month, billed monthly</li>
              <li>Annual plan: $1,490/year, billed annually (saves $298)</li>
              <li>All prices in USD</li>
            </ul>

            <p className="font-semibold text-white mb-2">Billing</p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>Subscriptions are billed in advance at the beginning of each billing period</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>We reserve the right to change pricing with 30 days written notice</li>
              <li>Continued use after a price change constitutes acceptance of the new pricing</li>
            </ul>

            <p className="font-semibold text-white mb-2">Refunds</p>
            <p className="mb-3">
              We offer a <strong className="text-white">7-day money-back guarantee</strong> for new subscribers on their first subscription period only. To request a refund, contact us at hello@pulsewavelabs.io within 7 days of your initial payment. Refunds are processed to the original payment method within 5–10 business days. No refunds are provided after the 7-day period, for renewal payments, or for annual subscriptions after 7 days from purchase.
            </p>

            <p className="font-semibold text-white mb-2">Cancellation</p>
            <p>
              You may cancel your subscription at any time through your account settings or by contacting hello@pulsewavelabs.io. Cancellation takes effect at the end of your current billing period. You will retain access until your paid period expires. No partial or prorated refunds for unused time.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">4. Account Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>You must provide accurate, current, and complete information during registration</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You are responsible for all activity that occurs under your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>One account per person — accounts are non-transferable</li>
              <li>You may not share, redistribute, resell, or rebroadcast signals to any third party</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms, redistribute signals, or engage in any abusive behavior, with or without notice and without refund.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">5. Prohibited Uses</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-white/55">
              <li>Redistribute, resell, or commercially exploit our signals or content</li>
              <li>Reverse engineer, decompile, or attempt to extract our algorithms or source code</li>
              <li>Use automated systems (bots, scrapers) to access our platform without authorization</li>
              <li>Circumvent or disable any security features of our platform</li>
              <li>Use the Service for any illegal purpose or in violation of any applicable law</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Create multiple accounts to abuse free trials or referral programs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">6. Signal Delivery</h2>
            <p className="mb-3">
              We deliver signals primarily through Telegram and our web dashboard. While we make commercially reasonable efforts to deliver signals promptly and accurately:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>We do not guarantee uninterrupted delivery of signals</li>
              <li>Delivery may be delayed or prevented by factors outside our control (Telegram outages, internet issues, exchange downtime)</li>
              <li>Signal parameters (entry, stop loss, take profit) are targets — actual execution prices will vary</li>
              <li>We may pause, modify, or discontinue signal delivery at any time for maintenance, strategy adjustments, or market conditions</li>
            </ul>
            <p>
              We are not liable for any losses resulting from delayed, missed, or failed signal delivery, regardless of the cause.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">7. Intellectual Property</h2>
            <p className="mb-3">
              All content, algorithms, strategies, code, designs, trade data, analytics, and materials on the Service are the exclusive property of PulseWave Labs and are protected by copyright, trademark, and trade secret laws.
            </p>
            <p>
              Your subscription grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial trading use only. You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any content from the Service without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">8. Limitation of Liability</h2>
            <p className="mb-3">
              <strong className="text-white">TO THE MAXIMUM EXTENT PERMITTED BY LAW, PULSEWAVE LABS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>Any trading losses, regardless of whether you followed our signals</li>
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, goodwill, or other intangible losses</li>
              <li>Damages arising from interrupted or delayed signal delivery</li>
              <li>Damages arising from unauthorized access to your account</li>
              <li>Any third-party claims related to your trading activity</li>
            </ul>
            <p>
              <strong className="text-white">In no event shall our total aggregate liability exceed the amount you paid to PulseWave Labs in the three (3) months preceding the event giving rise to the claim.</strong> This limitation applies regardless of the legal theory (contract, tort, negligence, strict liability, or otherwise).
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">9. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless PulseWave Labs and its officers, directors, employees, agents, and affiliates from any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from: (a) your use of the Service; (b) your trading activities and decisions; (c) your violation of these Terms; (d) your violation of any third-party rights; or (e) any content you submit or transmit through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">10. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">11. Dispute Resolution</h2>
            <p className="mb-3">
              Any dispute arising from or relating to these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. Arbitration shall take place in the State of Wyoming. The arbitrator's award shall be final and binding and may be entered in any court of competent jurisdiction.
            </p>
            <p>
              <strong className="text-white">You agree to waive any right to participate in a class action lawsuit or class-wide arbitration.</strong> All claims must be brought individually.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming, United States, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">13. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email or platform notification at least 14 days before taking effect. Your continued use of the Service after changes become effective constitutes acceptance. If you disagree with any changes, you must stop using the Service and cancel your subscription.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">14. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service ceases immediately. Sections related to intellectual property, limitation of liability, indemnification, disclaimer of warranties, and dispute resolution survive termination.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">15. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">16. Contact</h2>
            <p>
              Questions about these Terms: <strong className="text-white">hello@pulsewavelabs.io</strong>
            </p>
          </section>

          <div className="border-t border-white/[0.06] pt-6 mt-10">
            <p className="text-[12px] text-white/25">
              © 2026 PulseWave Labs. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
