import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const routePath = join(__dirname, '..', 'app', 'api', 'journal', 'route.ts')
const source = readFileSync(routePath, 'utf8')

const fallbackMatch = source.match(/if \(error && \/([^/]+)\/i\.test\(error\.message \|\| ''\)\)/)
assert.ok(fallbackMatch, 'journal POST should retry inserts for missing legacy-schema columns')

const missingColumnPattern = new RegExp(fallbackMatch[1], 'i')

for (const column of ['position_size', 'entry_date', 'exit_date', 'screenshots', 'strategy', 'auto_imported']) {
  assert.ok(
    missingColumnPattern.test(`Could not find the '${column}' column of 'trades' in the schema cache`),
    `fallback should retry when Supabase reports missing ${column}`
  )
}

const compatiblePayloadMatch = source.match(/const compatibleTradeData = \{([\s\S]*?)\n      \}/)
assert.ok(compatiblePayloadMatch, 'journal POST should define a compatible legacy insert payload')
assert.ok(
  !/auto_imported\s*:/.test(compatiblePayloadMatch[1]),
  'compatible legacy payload should omit auto_imported'
)

console.log('journal legacy fallback tests passed')
