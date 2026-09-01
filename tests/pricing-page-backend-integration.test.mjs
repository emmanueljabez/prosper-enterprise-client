import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const pricingPage = readFileSync(join(repoRoot, 'pages/pricing.vue'), 'utf8')

assert.doesNotMatch(
  pricingPage,
  /fetchPlansForAudience\('INDIVIDUAL'\)|fetchPlans\('CORPORATE'\)|formatPackagePrice|formatCurrencyLabel/,
  'enterprise solutions pricing page should not expose package-price fetching or formatted plan figures',
)

assert.doesNotMatch(
  pricingPage,
  /KES\s*[0-9{]|\$[0-9]|\/Month|\/Summit|\/Session|Per session/,
  'enterprise solutions pricing page should not display fixed public pricing figures',
)

assert.match(
  pricingPage,
  /customersuccess@prospermentor\.com/,
  'enterprise solution contact handoff should route enquiries to customer success',
)

assert.match(
  pricingPage,
  /mailto:\$\{CUSTOMER_SUCCESS_EMAIL\}/,
  'enterprise solution contact handoff should prepare a customer-success email draft.',
)

assert.match(
  pricingPage,
  /contactDraftPrepared/,
  'enterprise solution contact handoff should track the email draft state truthfully.',
)

assert.doesNotMatch(
  pricingPage,
  /contactSubmitted|will use this context/,
  'enterprise solution contact handoff should not claim a lead was captured by the frontend.',
)
