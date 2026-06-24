import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pricingSource = readFileSync(new URL('../pages/pricing.vue', import.meta.url), 'utf8')

const articleClassMatch = pricingSource.match(/<article[\s\S]*?class="([^"]*group relative[^"]*)"/)

assert.ok(articleClassMatch, 'Pricing plan cards should keep a stable article class declaration.')
assert.doesNotMatch(
  articleClassMatch[1],
  /\bbg-white\b/,
  'Pricing plan card base classes should not force bg-white because it overrides the highlighted card background.',
)
assert.match(
  pricingSource,
  /plan\.highlighted\s*\?\s*'[^']*bg-\[#006f58\][^']*'\s*:\s*'[^']*bg-white/,
  'Pricing plan card background should be selected in the highlighted/non-highlighted class branch.',
)

console.log('Pricing highlighted card background verified.')
