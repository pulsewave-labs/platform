import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00F0B5] hover:text-[#4DFFD0] transition-colors mb-6">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-[#8b95a5] text-lg">How we collect, use, and protect your information</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold mb-3 text-white">Personal Information</h3>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We collect personal information that you provide to us when you:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Create an account (email address, name)</li>
              <li>Contact our support team</li>
              <li>Subscribe to our newsletter</li>
              <li>Participate in surveys or feedback forms</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-white">Trading Data</h3>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              When you connect your exchange accounts through read-only API keys, we may collect:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Trading history and transaction data</li>
              <li>Portfolio balances and positions</li>
              <li>Order history (for journal and analysis purposes)</li>
              <li>Exchange account information (account IDs, not credentials)</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              <strong className="text-white">Important:</strong> We only use read-only API keys. We cannot place trades, withdraw funds, 
              or access your exchange credentials. Your funds remain secure on your chosen exchanges.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-white">Usage Data</h3>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We automatically collect information about how you interact with our Service:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>IP address, browser type, and device information</li>
              <li>Pages visited and features used within our platform</li>
              <li>Time stamps and session duration</li>
              <li>Clickstream data and user interactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. How We Use Your Information</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Provide and maintain our Service</li>
              <li>Generate trading signals and analysis</li>
              <li>Create your personalized trading journal</li>
              <li>Send you important account and service updates</li>
              <li>Respond to your support requests</li>
              <li>Improve our platform and develop new features</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed">
              We do not use your trading data for our own trading activities or share it with third parties for trading purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. Information Sharing and Disclosure</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
            </p>
            
            <h3 className="text-lg font-semibold mb-3 text-white">Service Providers</h3>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We work with trusted third-party service providers who assist us in operating our platform:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Cloud hosting and storage providers</li>
              <li>Payment processors</li>
              <li>Email and communication services</li>
              <li>Analytics and monitoring tools</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              These providers are contractually obligated to keep your information secure and use it only for the specified services.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-white">Legal Requirements</h3>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We may disclose your information if required to do so by law or in response to:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Subpoenas, court orders, or legal processes</li>
              <li>Requests from government agencies</li>
              <li>Compliance with regulatory requirements</li>
              <li>Protection of our rights, property, or safety</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-white">Aggregated Data</h3>
            <p className="text-[#8b95a5] leading-relaxed">
              We may share aggregated, anonymized data that cannot identify individual users for research, 
              marketing, or business development purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Data Security</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Encryption in transit and at rest using AES-256</li>
              <li>Secure API connections with TLS 1.3</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and employee training</li>
              <li>Multi-factor authentication for accounts</li>
              <li>Regular backups with encrypted storage</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed">
              While we strive to protect your information, no method of transmission over the internet 
              or electronic storage is 100% secure. We cannot guarantee absolute security but are committed 
              to maintaining the highest standards of data protection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Cookies and Tracking</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze usage patterns and improve our Service</li>
              <li>Provide personalized experiences</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              You can control cookie settings through your browser preferences. Disabling certain cookies 
              may limit functionality of our Service.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-white">Third-Party Analytics</h3>
            <p className="text-[#8b95a5] leading-relaxed">
              We may use third-party analytics services (such as Google Analytics) to understand how users 
              interact with our platform. These services may use cookies and collect usage data according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Your Rights and Choices</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            
            <h3 className="text-lg font-semibold mb-3 text-white">Access and Updates</h3>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>View and update your account information</li>
              <li>Request a copy of your personal data</li>
              <li>Correct inaccurate or outdated information</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-white">Data Deletion</h3>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Delete your account and associated data</li>
              <li>Request removal of specific information</li>
              <li>Opt-out of non-essential communications</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-white">Marketing Communications</h3>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              You can unsubscribe from marketing emails at any time by clicking the unsubscribe link 
              or contacting our support team. We will continue to send essential service-related communications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">7. Data Retention</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Account data: Retained while your account is active</li>
              <li>Trading data: Retained for analysis and journal purposes</li>
              <li>Support communications: Retained for 3 years</li>
              <li>Usage logs: Retained for 12 months</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed">
              When you delete your account, we will delete or anonymize your personal information within 30 days, 
              except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">8. Children's Privacy</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              Our Service is not intended for children under the age of 13, and we do not knowingly collect 
              personal information from children under 13. Our terms of service require users to be at least 18 years old.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              If we become aware that we have collected personal information from a child under 13, 
              we will take steps to delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">9. International Data Transfers</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have different data protection laws than your jurisdiction.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              We ensure that such transfers comply with applicable privacy laws and that your information 
              receives adequate protection through appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">10. Changes to This Privacy Policy</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Posting the updated policy on our website</li>
              <li>Sending an email notification to your registered address</li>
              <li>Displaying a notice on our platform</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed">
              Changes become effective 30 days after posting, unless otherwise specified. 
              Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">11. Contact Information</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="text-[#8b95a5] leading-relaxed space-y-2">
              <p><strong className="text-white">Email:</strong> privacy@pulsewavelabs.com</p>
              <p><strong className="text-white">Support:</strong> support@pulsewavelabs.com</p>
              <p><strong className="text-white">Data Protection Officer:</strong> dpo@pulsewavelabs.com</p>
            </div>
            <p className="text-[#8b95a5] leading-relaxed mt-4">
              We are committed to resolving any privacy concerns you may have and will respond to your inquiries within 30 days.
            </p>
          </section>

          <div className="border-t border-white/10 pt-8 mt-12">
            <p className="text-sm text-[#6b7280] leading-relaxed">
              <strong className="text-[#8b95a5]">Last updated:</strong> February 17, 2026
              <br />
              This Privacy Policy is effective immediately and replaces any previous version. 
              Please review it periodically to stay informed about our privacy practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}