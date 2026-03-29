import { createServer } from 'http'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { runAnalysis } from './analyze.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3333

let latestSnapshot = null
let isRefreshing = false

async function refresh() {
  if (isRefreshing) return
  isRefreshing = true
  try {
    const result = await runAnalysis()
    latestSnapshot = {
      timestamp: result.snapshot.timestamp,
      snapshot: result.snapshot,
      scores: result.scores,
      analysis: result.analysis,
    }
    console.log(`\nSnapshot updated at ${new Date().toISOString()}`)
  } catch (e) {
    console.error('Refresh failed:', e.message)
  }
  isRefreshing = false
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (url.pathname === '/api/snapshot') {
    if (!latestSnapshot) {
      await refresh()
    }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(latestSnapshot))
    return
  }

  if (url.pathname === '/api/refresh') {
    await refresh()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, timestamp: latestSnapshot?.timestamp }))
    return
  }

  // Serve dashboard
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const html = readFileSync(join(__dirname, '../dashboard/index.html'), 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`PulseWave Intelligence running on http://localhost:${PORT}`)
  console.log('Fetching initial snapshot...')
  refresh()

  // Auto-refresh every 15 min
  setInterval(refresh, 15 * 60 * 1000)
})
