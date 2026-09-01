import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const landingSource = readFileSync(new URL('../pages/landing.vue', import.meta.url), 'utf8')
const publicHeaderSource = readFileSync(new URL('../components/landing/PublicSiteHeader.vue', import.meta.url), 'utf8')
const pricingSource = readFileSync(new URL('../pages/pricing.vue', import.meta.url), 'utf8')
const authMiddlewareSource = readFileSync(new URL('../middleware/auth.global.ts', import.meta.url), 'utf8')

const countMatches = (source, pattern) => Array.from(source.matchAll(pattern)).length

assert.match(
  `${landingSource}\n${publicHeaderSource}`,
  /go\('\/pricing'\)/,
  'Landing navigation should point to /pricing.',
)
assert.match(pricingSource, /import PublicSiteHeader/, 'Public pricing should keep the shared public header component.')
assert.match(pricingSource, /import SocialFooter/, 'Public pricing should keep the shared footer component.')
assert.match(pricingSource, /<PublicSiteHeader\s*\/>/, 'Public pricing should render the shared header.')
assert.match(pricingSource, /<SocialFooter\s*\/>/, 'Public pricing should render the shared footer.')

assert.match(pricingSource, /const deliveryModels: DeliveryModel\[] = \[/, 'Public pricing should define delivery models.')
assert.equal(countMatches(pricingSource, /number:\s*'[123]'/g), 3, 'Public pricing should expose three delivery models.')
assert.match(pricingSource, /v-for="model in deliveryModels"/, 'Public pricing should render the delivery models from data.')

assert.match(pricingSource, /const solutionCards: SolutionCard\[] = \[/, 'Public pricing should define solution cards.')
assert.equal(
  countMatches(pricingSource, /id:\s*'(institutional|corporate|grant-funded)'/g),
  3,
  'Public pricing should expose institution, corporate, and donor-funded solution cards.',
)
assert.match(pricingSource, /v-for="card in solutionCards"/, 'Public pricing should render solution cards from data.')
assert.match(pricingSource, /toggleInclusion/, 'Public pricing should support expandable inclusion rows.')
assert.match(pricingSource, /includeInstitutionAssessment/, 'Public pricing should support the institutional assessment package toggle.')
assert.match(pricingSource, /activeView === 'solutions'/, 'Public pricing should keep the solutions view as the default surface.')
assert.match(pricingSource, /activeView\.value = 'contact'/, 'Public pricing should route solution CTAs into the contact view.')
assert.match(pricingSource, /Contact Us/, 'Public pricing should label solution CTAs clearly.')
assert.doesNotMatch(pricingSource, /mockup-banner|MOCKUP/, 'Public pricing should not render the mockup-only preview banner.')
assert.doesNotMatch(pricingSource, />\s*Mentee\s*<\/button>|Start Free Trial|Buy Sessions/, 'Public pricing should no longer render the old mentee package tabs or purchase CTAs.')
assert.match(authMiddlewareSource, /'\/pricing'/, 'The auth middleware should treat /pricing as public.')

console.log('Public pricing route verified.')
