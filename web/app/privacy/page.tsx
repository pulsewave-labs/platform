import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00e5a0] hover:text-[#00cc8e] transition-colors text-[13px] mono mb-6">
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-[14px]">Last updated: February 18, 2026</p>
        </div>

        <div className="space-y-8 text-[14px] text-white/60 leading-relaxed">

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">1. Who We Are</h2>
            <p>
              PulseWave Labs ("we," "us," "our") operates the PulseWave trading signal platform. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website, platform, Telegram bot, and related services (the "Service"). By using the Service, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">2. Information We Collect</h2>

            <p className="font-semibold text-white mb-2">Information You Provide</p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li><strong className="text-white/70">Account registration:</strong> Email address, password (hashed, never stored in plaintext)</li>
              <li><strong className="text-white/70">Telegram linking:</strong> Telegram user ID and chat ID (when you connect via our bot)</li>
              <li><strong className="text-white/70">Payment information:</strong> Processed by Whop — we do not store credit card numbers, CVVs, or full card details</li>
              <li><strong className="text-white/70">Communications:</strong> Any messages you send to our support</li>
            </ul>

            <p className="font-semibold text-white mb-2">Information Collected Automatically</p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>IP address, browser type, device type, operating system</li>
              <li>Pages visited, features used, timestamps, session duration</li>
              <li>Referral source (how you found us)</li>
              <li>Cookies and similar tracking technologies (see Section 7)</li>
            </ul>

            <p className="font-semibold text-white mb-2">Information We Do NOT Collect</p>
            <ul className="list-disc list-inside space-y-1.5 text-white/55">
              <li>Exchange API keys, passwords, or credentials</li>
              <li>Your exchange balances, positions, or trading history</li>
              <li>Any information that would give us access to your funds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5 text-white/55">
              <li>Provide, operate, and maintain the Service</li>
              <li>Deliver trading signals to your Telegram account</li>
              <li>Process subscription payments</li>
              <li>Send account-related communications (billing, security, service updates)</li>
              <li>Respond to support requests</li>
              <li>Improve our platform, fix bugs, and develop new features</li>
              <li>Detect and prevent fraud, abuse, or unauthorized access</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (only with your consent; you can opt out anytime)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">4. Information Sharing</h2>
            <p className="mb-3">
              <strong className="text-white">We do not sell, rent, or trade your personal information.</strong> We share data only in these limited circumstances:
            </p>

            <p className="font-semibold text-white mb-2">Service Providers</p>
            <p className="mb-3">We use trusted third-party providers to operate our Service:</p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li><strong className="text-white/70">Supabase:</strong> Database hosting and authentication</li>
              <li><strong className="text-white/70">Vercel:</strong> Website hosting and deployment</li>
              <li><strong className="text-white/70">Railway:</strong> Signal engine hosting</li>
              <li><strong className="text-white/70">Whop:</strong> Payment processing and subscription management</li>
              <li><strong className="text-white/70">Telegram:</strong> Signal delivery</li>
            </ul>
            <p className="mb-3">These providers process data solely on our behalf and are contractually bound to protect it.</p>

            <p className="font-semibold text-white mb-2">Legal Requirements</p>
            <p>
              We may disclose information if required by law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of PulseWave Labs, our users, or the public.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">5. Data Security</h2>
            <p className="mb-3">We implement industry-standard security measures:</p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>All data transmitted over HTTPS/TLS encryption</li>
              <li>Passwords hashed using bcrypt (never stored in plaintext)</li>
              <li>Database access restricted with Row Level Security (RLS) policies</li>
              <li>Service role keys stored as encrypted environment variables</li>
              <li>No storage of payment card details (handled entirely by Whop)</li>
            </ul>
            <p>
              While we take reasonable measures to protect your data, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">6. Data Retention</h2>
            <ul className="list-disc list-inside space-y-1.5 text-white/55">
              <li><strong className="text-white/70">Account data:</strong> Retained while your account is active and for 30 days after deletion request</li>
              <li><strong className="text-white/70">Payment records:</strong> Retained for 7 years for tax and legal compliance</li>
              <li><strong className="text-white/70">Usage logs:</strong> Retained for 12 months, then deleted or anonymized</li>
              <li><strong className="text-white/70">Support communications:</strong> Retained for 2 years</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">7. Cookies</h2>
            <p className="mb-3">We use cookies for:</p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li><strong className="text-white/70">Essential cookies:</strong> Authentication, session management (required for the Service to function)</li>
              <li><strong className="text-white/70">Analytics cookies:</strong> Understanding usage patterns to improve the platform</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling essential cookies may prevent you from using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">8. Your Rights</h2>
            <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li><strong className="text-white/70">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-white/70">Correction:</strong> Update or correct inaccurate information</li>
              <li><strong className="text-white/70">Deletion:</strong> Request deletion of your personal data</li>
              <li><strong className="text-white/70">Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong className="text-white/70">Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
              <li><strong className="text-white/70">Restriction:</strong> Request that we limit processing of your data</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <strong className="text-white">hello@pulsewavelabs.io</strong>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">9. California Residents (CCPA)</h2>
            <p className="mb-3">If you are a California resident, you have additional rights under the California Consumer Privacy Act:</p>
            <ul className="list-disc list-inside space-y-1.5 text-white/55">
              <li>Right to know what personal information we collect, use, and disclose</li>
              <li>Right to request deletion of your personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">10. International Users (GDPR)</h2>
            <p className="mb-3">
              If you are located in the European Economic Area (EEA) or United Kingdom, we process your data under the following legal bases:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li><strong className="text-white/70">Contract performance:</strong> Processing necessary to provide the Service</li>
              <li><strong className="text-white/70">Legitimate interests:</strong> Improving our platform, preventing fraud</li>
              <li><strong className="text-white/70">Consent:</strong> Marketing communications</li>
              <li><strong className="text-white/70">Legal obligation:</strong> Tax and regulatory compliance</li>
            </ul>
            <p>
              Your data may be transferred to and processed in the United States. We ensure adequate protection through appropriate safeguards as required by GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">11. Children's Privacy</h2>
            <p>
              Our Service is not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. If we learn that we have collected data from someone under 18, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated via email or platform notification. The updated policy becomes effective 14 days after posting unless otherwise stated. Continued use of the Service constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">13. Contact</h2>
            <p>
              Privacy questions or data requests: <strong className="text-white">hello@pulsewavelabs.io</strong>
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
