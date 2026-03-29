import { fetchAll } from './fetch-all.js'
import { scoreAll } from './scoring/engine.js'
import { generateAnalysis } from './ai/analyst.js'

export async function runAnalysis() {
  // 1. Fetch all data
  const snapshot = await fetchAll()

  // 2. Score everything
  console.log('\nScoring signals...')
  const scores = scoreAll(snapshot)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`BTC: $${snapshot.price?.toLocaleString() || '?'}`)
  console.log(`Composite: ${scores.composite > 0 ? '+' : ''}${scores.composite} — ${scores.bias} (${scores.confidence}% confidence)`)
  console.log(`${'='.repeat(60)}`)

  for (const [key, s] of Object.entries(scores.signals)) {
    const bar = s.score > 0 ? '🟢' : s.score < 0 ? '🔴' : '⚪'
    console.log(`${bar} ${key.padEnd(14)} ${(s.score > 0 ? '+' : '') + s.score.toString().padStart(4)} | ${s.reason}`)
  }

  // 3. AI analysis
  let analysis = null
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log(`\n${'─'.repeat(60)}`)
      console.log('Generating AI analysis...\n')
      analysis = await generateAnalysis(scores, snapshot)
      console.log(analysis)
      console.log(`${'─'.repeat(60)}`)
    } catch (e) {
      console.log(`AI analysis failed: ${e.message}`)
    }
  } else {
    console.log('\n(Set ANTHROPIC_API_KEY for AI narrative)')
  }

  // Always output JSON for piping
  if (process.env.OUTPUT_JSON) {
    const out = { timestamp: snapshot.timestamp, price: snapshot.price, scores, analysis }
    const fs = await import('fs')
    fs.writeFileSync(process.env.OUTPUT_JSON, JSON.stringify(out, null, 2))
    console.log(`\nJSON written to ${process.env.OUTPUT_JSON}`)
  }

  return { snapshot, scores, analysis }
}

// Run standalone
if (process.argv[1]?.endsWith('analyze.js')) {
  runAnalysis().catch(console.error)
}
