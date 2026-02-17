import Link from 'next/link'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00F0B5] hover:text-[#4DFFD0] transition-colors mb-6">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Risk Disclaimer</h1>
          <p className="text-[#8b95a5] text-lg">Important information about trading risks and limitations</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Trading Risk Disclosure</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              Trading cryptocurrencies and other financial instruments involves substantial risk of loss and is not suitable for all investors. 
              You should carefully consider your financial situation and risk tolerance before engaging in trading activities. 
              There is a possibility that you may sustain a loss equal to or greater than your entire investment.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              Past performance, whether actual or indicated by historical tests of strategies, is no guarantee of future performance or success. 
              Market conditions can change rapidly, and no trading strategy or system can guarantee profits or prevent losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Not Investment Advice</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              The signals, analysis, tools, and content provided by PulseWave Labs are for informational and educational purposes only 
              and should not be construed as investment advice, financial advice, trading advice, or any other type of advice.
            </p>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              <strong className="text-white">PulseWave Labs is not a registered investment advisor, broker-dealer, or financial planner.</strong> 
              We do not provide personalized investment recommendations or advice tailored to your specific financial situation.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              You should not make any investment decision based solely on the information provided by PulseWave Labs. 
              Always consult with a qualified financial advisor before making any investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Backtested Performance Limitations</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              Performance statistics and results shown on our platform may be based on backtested or simulated results, which are hypothetical in nature. 
              Backtested results have many inherent limitations, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>They are designed with the benefit of hindsight</li>
              <li>They do not account for slippage, spreads, or commissions</li>
              <li>They cannot fully account for the impact of market conditions and liquidity</li>
              <li>They may not reflect the psychological pressures of actual trading</li>
              <li>They assume perfect execution of trades</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed">
              No representation is being made that any account will achieve profits or losses similar to those shown in backtested results.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">No Guarantees</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              PulseWave Labs makes no warranties, express or implied, regarding the accuracy, completeness, or reliability of any information, 
              signals, or analysis provided. We do not guarantee:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Any specific trading results or profits</li>
              <li>That our signals will be profitable</li>
              <li>Continuous access to our platform or services</li>
              <li>That our platform will be error-free or uninterrupted</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Your Responsibility</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              You are solely responsible for your trading decisions and their outcomes. Before trading, you should:
            </p>
            <ul className="list-disc list-inside text-[#8b95a5] space-y-2 mb-4">
              <li>Understand the risks involved in cryptocurrency trading</li>
              <li>Only trade with money you can afford to lose</li>
              <li>Develop and stick to a risk management strategy</li>
              <li>Conduct your own research and analysis</li>
              <li>Seek professional financial advice when needed</li>
            </ul>
            <p className="text-[#8b95a5] leading-relaxed">
              <strong className="text-white">Never invest more than you can afford to lose.</strong> 
              Only trade with funds that you can lose without affecting your lifestyle or financial obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Third-Party Data Disclaimer</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              Our platform may use data from third-party sources including exchanges, data providers, and other financial services. 
              We cannot guarantee the accuracy, completeness, or timeliness of this data. Market data may be delayed, 
              and we are not responsible for any trading decisions made based on delayed or inaccurate data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Regulatory Status</h2>
            <p className="text-[#8b95a5] leading-relaxed mb-4">
              <strong className="text-white">PulseWave Labs is not a registered investment advisor under the Investment Advisers Act of 1940</strong> 
              or any state securities laws. We do not provide investment advisory services as defined by applicable securities regulations.
            </p>
            <p className="text-[#8b95a5] leading-relaxed">
              Our services are limited to providing educational content, technical analysis tools, and general market information. 
              We do not manage client accounts or provide personalized investment recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Contact Information</h2>
            <p className="text-[#8b95a5] leading-relaxed">
              If you have questions about this disclaimer or our services, please contact us at:
              <br />
              <strong className="text-white">Email:</strong> legal@pulsewavelabs.com
            </p>
          </section>

          <div className="border-t border-white/10 pt-8 mt-12">
            <p className="text-sm text-[#6b7280] leading-relaxed">
              <strong className="text-[#8b95a5]">Last updated:</strong> February 17, 2026
              <br />
              This disclaimer is subject to change without notice. Please review it periodically for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}