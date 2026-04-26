import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const detail = readFileSync(resolve('app/dashboard/journal/[id]/client-page.tsx'), 'utf8')
const detailRoute = readFileSync(resolve('app/api/journal/[id]/route.ts'), 'utf8')
const createRoute = readFileSync(resolve('app/api/journal/route.ts'), 'utf8')

assert(
  /PLANNED ENTRY|ENTRY PRICE/.test(detail) && /EXIT PRICE/.test(detail),
  'trade detail should label entry price and exit price as separate concepts'
)

assert(
  /trade\.pre_thesis \|\| trade\.notes|trade\.notes \|\| trade\.pre_thesis/.test(detail),
  'trade detail should display legacy notes as the pre-trade thesis fallback instead of duplicating/mislabeling it'
)

assert(
  /PRE-TRADE THESIS|PRE-TRADE PLAN/.test(detail) && !/<label[^>]*>NOTES<\/label>|>NOTES<\/p>/.test(detail),
  'edit/detail UI should use pre-trade thesis/plan copy instead of a vague duplicate NOTES field'
)

assert(
  /exit_price/.test(detail) && /closed_at/.test(detail) && /exit_date/.test(detail),
  'close form should send exit price plus close timestamps'
)

assert(
  /missingUpdateColumn/.test(detailRoute) && /pre_thesis/.test(detailRoute) && /post_right/.test(detailRoute) && /exit_date/.test(detailRoute) && /position_size/.test(detailRoute),
  'detail PATCH should retry missing newer journal fields against legacy trade schemas'
)

assert(
  /compatibleUpdateData/.test(detailRoute) && /compatibleUpdateData\.notes/.test(detailRoute),
  'detail PATCH legacy fallback should map pre-trade thesis/review text into notes where needed'
)

assert(
  /notes:\s*body\.notes \|\| body\.pre_thesis \|\| null/.test(createRoute),
  'create fallback should keep mapping pre_thesis into legacy notes'
)

console.log('journal field mapping tests passed')
