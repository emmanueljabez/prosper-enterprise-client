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
  /useToast/,
  'enterprise solutions pricing page should show a toast after successful Contact Us submission',
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
  /toast\(\s*\{[\s\S]*title: 'Request submitted'[\s\S]*variant: 'success'[\s\S]*\}\s*\)/,
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

assert.doesNotMatch(
  pricingPage,
  /mailto:|window\.location\.href|contactDraftPrepared|activeView/,
  'enterprise solution Contact Us should no longer rely on mailto or a separate contact view.',
)
