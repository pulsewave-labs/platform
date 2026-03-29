export const config = {
  // Proxy for Binance
  proxy: {
    host: 'ddc.oxylabs.io',
    port: 8001,
    auth: 'masonboroff:UQdolU8=g808',
    get url() { return `http://${this.auth}@${this.host}:${this.port}` }
  },

  // Binance Futures
  binanceFapi: 'https://fapi.binance.com/fapi/v1',
  binanceApi: 'https://api.binance.com/api/v3',

  // Bybit (no proxy needed)
  bybitApi: 'https://api.bybit.com/v5',

  // Coinglass (free tier)
  coinglassApi: 'https://open-api.coinglass.com/public/v2',

  // Deribit (options)
  deribitApi: 'https://www.deribit.com/api/v2/public',

  // Fear & Greed
  fngApi: 'https://api.alternative.me/fng',

  // Supabase
  supabaseUrl: 'https://iadevdgnaeykfqhxdpmy.supabase.co',
  supabaseKey: process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZGV2ZGduYWV5a2ZxaHhkcG15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwNTQzNSwiZXhwIjoyMDg2ODgxNDM1fQ.vC_YsztrIehF_PaZf9AlRbd6Imw_473Mw1kbJH2NMRw',

  // Anthropic
  anthropicKey: process.env.ANTHROPIC_API_KEY,

  // Update interval
  intervalMs: 15 * 60 * 1000, // 15 minutes
}
