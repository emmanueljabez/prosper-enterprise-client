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
  /contactToastVisible/,
  'enterprise solutions pricing page should keep a page-level success toast state',
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
  /contactToastVisible\.value = true/,
  'enterprise solution Contact Us dialog should surface successful captures as a success toast',
)

assert.match(
  pricingPage,
  /contactDialogOpen\.value = false/,
  'enterprise solution Contact Us dialog should dismiss after a successful capture',
)

assert.match(
  pricingPage,
  /:disabled="demoRequestStore\.isLoading"/,
  'enterprise solution Contact Us dialog should disable the submit button while submission is in flight',
)

assert.doesNotMatch(
  pricingPage,
  /contactSubmitted|Thank you\. We received your request|Submitted'/,
  'enterprise solution Contact Us dialog should no longer keep an inline success state after submission',
)

const toastIndex = pricingPage.indexOf('v-if="contactToastVisible"')
const dialogCloseIndex = pricingPage.indexOf('</Dialog>')

assert.ok(
  toastIndex > dialogCloseIndex,
  'enterprise solution Contact Us success toast should render outside the dialog so the dialog can dismiss',
)

assert.doesNotMatch(
  pricingPage,
  /mailto:|window\.location\.href|contactDraftPrepared|activeView/,
  'enterprise solution Contact Us should no longer rely on mailto or a separate contact view.',
)
