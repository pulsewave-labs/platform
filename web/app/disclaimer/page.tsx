import Link from 'next/link'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00e5a0] hover:text-[#00cc8e] transition-colors text-[13px] mono mb-6">
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Risk Disclaimer</h1>
          <p className="text-white/40 text-[14px]">Last updated: February 18, 2026</p>
        </div>

        <div className="space-y-8 text-[14px] text-white/60 leading-relaxed">

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Trading Risk Disclosure</h2>
            <p className="mb-3">
              Trading cryptocurrencies, forex, and other financial instruments involves substantial risk of loss and is not suitable for all investors.
              The use of leverage (including the 20× leverage referenced on this platform) significantly amplifies both potential gains and potential losses.
              You may lose more than your initial investment. You should carefully consider your financial situation, risk tolerance, and investment objectives before using any trading signals or tools.
            </p>
            <p>
              <strong className="text-white">There is no guarantee that any trading strategy, system, or signal service — including PulseWave — will be profitable.</strong> Past performance, whether actual or indicated by historical tests, simulations, or verified track records, is not indicative of future results. Market conditions change constantly, and strategies that performed well historically may underperform or fail entirely in the future.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Not Investment Advice</h2>
            <p className="mb-3">
              The signals, analysis, tools, performance data, and all content provided by PulseWave Labs ("we," "us," "our") are for <strong className="text-white">informational and educational purposes only</strong> and do not constitute investment advice, financial advice, trading advice, or any other form of professional advice.
            </p>
            <p className="mb-3">
              <strong className="text-white">PulseWave Labs is not a registered investment advisor, broker-dealer, financial planner, or commodity trading advisor.</strong> We are not registered with the SEC, CFTC, NFA, FINRA, or any state or international securities regulatory authority. We do not provide personalized investment recommendations.
            </p>
            <p>
              You should not make any investment or trading decision based solely on information provided by PulseWave Labs. Always conduct your own research and consult with a qualified, licensed financial advisor before making any investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Performance Results & Limitations</h2>
            <p className="mb-3">
              Performance statistics, trade histories, equity curves, and results displayed on this platform are based on a combination of backtested (simulated) results and/or verified historical signals. These results have significant inherent limitations:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>Backtested results are hypothetical and designed with the benefit of hindsight</li>
              <li>They may not fully account for slippage, partial fills, exchange outages, or liquidity constraints</li>
              <li>Simulated results assume perfect execution timing, which is not achievable in live markets</li>
              <li>They cannot account for the psychological and emotional pressures of trading real money</li>
              <li>Market microstructure, fees, and spreads may differ from assumptions used in testing</li>
              <li>Strategy performance can degrade as more participants follow the same signals</li>
              <li>Cryptocurrency markets are highly volatile and subject to manipulation, regulatory changes, and black swan events</li>
            </ul>
            <p>
              <strong className="text-white">No representation is being made that any account will or is likely to achieve profits or losses similar to those shown.</strong> Actual results will vary based on account size, execution timing, exchange used, market conditions, and other factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Leveraged Trading Risks</h2>
            <p className="mb-3">
              Our signals reference trading with leverage (up to 20×). Leveraged trading carries extreme risk:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>A 5% adverse move with 20× leverage can result in a 100% loss of your margin</li>
              <li>Liquidation can occur rapidly during volatile market conditions</li>
              <li>Exchange liquidation engines may execute at prices significantly worse than your stop loss</li>
              <li>Funding rates, maintenance margin requirements, and exchange-specific rules may impact your positions</li>
            </ul>
            <p>
              <strong className="text-white">Only trade with capital you can afford to lose entirely.</strong> Leveraged trading is not appropriate for most investors.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Signal Delivery & Execution</h2>
            <p className="mb-3">
              While we strive to deliver signals promptly, we cannot guarantee:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>Uninterrupted signal delivery — Telegram, our servers, or your internet connection may experience outages</li>
              <li>That you will be able to execute trades at the exact entry, stop loss, or take profit prices shown</li>
              <li>That signals will be delivered within any specific timeframe</li>
              <li>That exchange APIs, order books, or trading infrastructure will be available when signals fire</li>
            </ul>
            <p>
              You are solely responsible for executing trades based on signals received. We are not responsible for missed signals, delayed execution, or any losses resulting from technical issues on any platform.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">No Guarantees</h2>
            <p className="mb-3">
              PulseWave Labs makes <strong className="text-white">no warranties, express or implied</strong>, regarding:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>Any specific trading results, returns, or profits</li>
              <li>The accuracy, completeness, or timeliness of any signal or analysis</li>
              <li>Continuous, uninterrupted access to our platform or services</li>
              <li>That our platform will be error-free</li>
              <li>The suitability of our signals for your specific financial situation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Your Responsibility</h2>
            <p className="mb-3">
              You are solely and exclusively responsible for your trading decisions and their financial outcomes. Before trading, you should:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mb-3 text-white/55">
              <li>Fully understand the risks involved in cryptocurrency and leveraged trading</li>
              <li>Only trade with money you can afford to lose without impacting your financial obligations</li>
              <li>Implement your own risk management beyond what we suggest</li>
              <li>Verify all signal information independently before executing trades</li>
              <li>Consult with a licensed financial advisor</li>
              <li>Comply with all applicable laws and tax obligations in your jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Third-Party Services</h2>
            <p>
              Our platform interacts with third-party services including cryptocurrency exchanges (e.g., Bitget), messaging platforms (Telegram), and data providers (Binance, CoinGecko). We are not affiliated with, endorsed by, or responsible for these third-party services. Their availability, accuracy, and terms of service are beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Regulatory Notice</h2>
            <p className="mb-3">
              Cryptocurrency trading may not be legal in all jurisdictions. It is your responsibility to determine whether trading digital assets is legal in your jurisdiction and to comply with all applicable regulations, including tax reporting requirements.
            </p>
            <p>
              PulseWave Labs makes no representation that its services are appropriate or available for use in any particular jurisdiction. Users accessing the platform from jurisdictions where cryptocurrency trading is restricted or prohibited do so at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold mb-3 text-white">Contact</h2>
            <p>
              Questions about this disclaimer: <strong className="text-white">hello@pulsewavelabs.io</strong>
            </p>
          </section>

          <div className="border-t border-white/[0.06] pt-6 mt-10">
            <p className="text-[12px] text-white/25">
              © 2026 PulseWave Labs. This disclaimer is subject to change without notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
