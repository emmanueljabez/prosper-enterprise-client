import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pricingSource = readFileSync(new URL('../pages/pricing.vue', import.meta.url), 'utf8')

assert.match(
  pricingSource,
  /#dd63c4/,
  'Pricing page should use the requested primary brand color.',
)
assert.match(
  pricingSource,
  /#016f56/,
  'Pricing page should use the requested secondary brand color.',
)
assert.match(
  pricingSource,
  /card\.featured\s*\?\s*'[^']*bg-\[#016f56\][^']*'\s*:\s*'[^']*bg-white/,
  'Highlighted solution card background should be selected from the featured/non-featured branch.',
)
assert.doesNotMatch(
  pricingSource,
  /#0B4F38|#01AB6D|#A03B93|#9b2f85|#f4c9ec|#015f4a/,
  'Pricing page should adapt reference and variant accents to the requested Prosper brand palette.',
)

console.log('Pricing highlighted card background verified.')
