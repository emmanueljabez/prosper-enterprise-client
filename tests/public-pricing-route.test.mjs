import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const landingSource = readFileSync(new URL('../pages/landing.vue', import.meta.url), 'utf8')
const publicHeaderSource = readFileSync(new URL('../components/landing/PublicSiteHeader.vue', import.meta.url), 'utf8')
const pricingSource = readFileSync(new URL('../pages/pricing.vue', import.meta.url), 'utf8')
const authMiddlewareSource = readFileSync(new URL('../middleware/auth.global.ts', import.meta.url), 'utf8')

assert.match(
  `${landingSource}\n${publicHeaderSource}`,
  /go\('\/pricing'\)/,
  'Landing navigation should point to /pricing.',
)
assert.match(pricingSource, /fetchPlans\('CORPORATE'\)/, 'Public pricing should load corporate plans only.')
assert.match(pricingSource, /const corporatePlan = computed/, 'Public pricing should select a backend corporate enterprise plan.')
assert.doesNotMatch(pricingSource, /audienceTabs|selectedAudience|Individual Plans|Mentor Plans/, 'Public pricing should not render non-enterprise plan tabs.')
assert.match(pricingSource, /Buy Sessions/, 'Public pricing should expose the Buy Sessions CTA.')
assert.match(pricingSource, /sessionCount/, 'Public pricing should be session-based, not seat-based.')
assert.match(pricingSource, /\/app\/admin\/activate/, 'Public pricing should route authenticated company admins to activation.')
assert.match(authMiddlewareSource, /'\/pricing'/, 'The auth middleware should treat /pricing as public.')

console.log('Public pricing route verified.')
