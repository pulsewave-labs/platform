import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const route = readFileSync(resolve('app/api/journal/route.ts'), 'utf8')
const client = readFileSync(resolve('app/dashboard/journal/client-page.tsx'), 'utf8')

assert(
  /entry_date\|opened_at|opened_at\|entry_date|missingOrderColumn/i.test(route),
  'journal GET should explicitly handle legacy schemas where entry_date is missing and opened_at is the order column'
)

assert(
  /buildJournalQuery\('entry_date'\)/.test(route) && /buildJournalQuery\('opened_at'\)/.test(route),
  'journal GET should retry ordering by opened_at when entry_date ordering fails'
)

assert(
  /status\.toLowerCase\(\)|normalizeTradeStatus|isOpenTrade/.test(client),
  'journal list should normalize trade status casing before counting/filtering open trades'
)

assert(
  /status.*!==.*closed|!== 'closed'|!== "closed"/.test(client),
  'journal list should treat non-closed saved trades as open/pending instead of hiding them behind exact status matching'
)

console.log('journal open listing fallback tests passed')
