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
  /useB2BDemoRequestStore/,
  'enterprise solutions pricing page should submit Contact Us enquiries through the B2B demo request store',
)

assert.match(
  pricingPage,
  /<Dialog\s+:open="contactDialogOpen"/,
  'enterprise solution Contact Us should open an in-page dialog instead of replacing the page content',
)

assert.match(
  pricingPage,
  /submitRequest\(/,
  'enterprise solution Contact Us dialog should call the API-backed submit action',
)

assert.match(
  pricingPage,
  /:disabled="demoRequestStore\.isLoading \|\| contactSubmitted"/,
  'enterprise solution Contact Us dialog should prevent duplicate submissions after a successful capture',
)

assert.doesNotMatch(
  pricingPage,
  /mailto:|window\.location\.href|contactDraftPrepared|activeView/,
  'enterprise solution Contact Us should no longer rely on mailto or a separate contact view.',
)
