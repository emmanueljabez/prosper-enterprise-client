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
assert.match(pricingSource, /fetchPlansForAudience\('INDIVIDUAL'\)/, 'Public pricing should load individual mentee package plans.')
assert.match(pricingSource, /fetchPlans\('CORPORATE'\)/, 'Public pricing should also load corporate plans for the enterprise tab.')
assert.match(pricingSource, /const corporatePlan = computed/, 'Public pricing should select a backend corporate enterprise plan.')
assert.match(pricingSource, /activeTab = ref<PricingTab>\('mentee'\)/, 'Public pricing should default to the mentee package tab.')
assert.match(pricingSource, />\s*Mentee\s*<\/button>[\s\S]*>\s*Enterprise\s*<\/button>/, 'Public pricing should render only Mentee and Enterprise tabs.')
assert.doesNotMatch(pricingSource, /Mentor Plans|>\s*Mentor\s*<\/button>|audienceTabs|selectedAudience/, 'Public pricing should not render the removed mentor pricing tab.')
assert.doesNotMatch(pricingSource, /useCompanySignupStore|savePendingSelection|const sessionCount = ref|Buy Sessions/, 'Public pricing should not collect or persist a pre-login session purchase.')
assert.match(pricingSource, /Start Free Trial/, 'Public pricing should expose the free-trial CTA.')
assert.match(pricingSource, /\/auth\/signup\?audience=mentee&trial=1&product=FREE_TRIAL/, 'Public pricing free-trial CTA should route into the free-trial signup flow.')
assert.match(pricingSource, /Create Company Account/, 'Public pricing should invite new companies to create an account.')
assert.match(pricingSource, /Per session/, 'Public pricing should still show the corporate per-session price model.')
assert.match(pricingSource, /\/app\/admin\/billing/, 'Public pricing should route authenticated company admins to billing for optional purchases.')
assert.doesNotMatch(pricingSource, /\/app\/admin\/activate/, 'Public pricing should not route admins into mandatory activation checkout.')
assert.match(authMiddlewareSource, /'\/pricing'/, 'The auth middleware should treat /pricing as public.')

console.log('Public pricing route verified.')
