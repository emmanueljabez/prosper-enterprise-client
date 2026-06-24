import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const pricingPage = readFileSync(join(repoRoot, 'pages/pricing.vue'), 'utf8')

assert.match(
  pricingPage,
  /fetchPlansForAudience\('INDIVIDUAL'\)/,
  'pricing page should fetch individual mentee package plans from the backend-backed subscriptions store',
)

assert.doesNotMatch(
  pricingPage,
  /const\s+menteePlans\s*:\s*MenteePlan\[\]\s*=\s*\[/,
  'pricing page should not define hardcoded mentee package cards',
)
