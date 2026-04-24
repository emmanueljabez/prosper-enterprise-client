import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const activateSource = readFileSync(new URL('../pages/app/admin/activate.vue', import.meta.url), 'utf8')
const loginSource = readFileSync(new URL('../pages/auth/login.vue', import.meta.url), 'utf8')
const authMiddlewareSource = readFileSync(new URL('../middleware/auth.global.ts', import.meta.url), 'utf8')
const roleManagerSource = readFileSync(new URL('../utils/roleManager.ts', import.meta.url), 'utf8')
const layoutSource = readFileSync(new URL('../layouts/default.vue', import.meta.url), 'utf8')
const authStoreSource = readFileSync(new URL('../store/modules/auth.ts', import.meta.url), 'utf8')

assert.match(activateSource, /Continue Payment|Buy Sessions/, 'Activation page should support invoice continuation and new purchase.')
assert.match(activateSource, /AuthSplitShell/, 'First-time company activation should use the shared auth shell.')
assert.match(activateSource, /normalizePaymentUrl/, 'Activation should normalize stale invoice links back to the current app origin.')
assert.match(activateSource, /pendingInvoiceSessionCount/, 'Activation should derive the pending session count from the company subscription payload.')
assert.doesNotMatch(activateSource, /v-if="!pendingInvoice"/, 'Activation should keep session quantity controls visible even when an invoice is already open.')
assert.match(
  activateSource,
  /createDirectPurchase\(companyId\.value,\s*selectedPlanId\.value,\s*sessionCount\.value,\s*successUrl,\s*cancelUrl\)/m,
  'Activation should create the company purchase directly from the authenticated company context.',
)
assert.doesNotMatch(activateSource, /resumeIntentPurchase\(/, 'Activation should not depend on signup-intent purchase resumption after login.')
assert.doesNotMatch(activateSource, /shouldRetryAsDirectPurchase/, 'Activation should not keep stale signup-intent retry logic in the authenticated flow.')
assert.match(
  activateSource,
  /toast\.error\('Company context not found\. Refresh your session and try again\.'\)/,
  'Activation should surface a concrete error when the company context is missing.',
)
assert.match(
  activateSource,
  /toast\.error\(resolvePurchaseErrorMessage\(error\) \|\| 'Failed to redirect to payment page\.'\)/,
  'Activation should show the purchase error instead of failing silently.',
)
assert.match(loginSource, /\/app\/admin\/activate/, 'Login should redirect incomplete company admins to activation.')
assert.match(
  authStoreSource,
  /responseProfile\.companyId \|\| responseProfile\.company_id \|\| responseProfile\.company\?\.id/,
  'Auth login should capture company context from nested profile.company.id responses.',
)
assert.match(
  authStoreSource,
  /companyId: resolveStoredCompanyId\(\)/,
  'Auth initialization should restore company context from stored profile data.',
)
assert.match(authMiddlewareSource, /navigateTo\('\/app\/admin\/activate'\)/, 'Auth middleware should gate inactive company admins.')
assert.match(roleManagerSource, /'\/app\/admin\/activate'/, 'RoleManager should allow the activation route.')
assert.match(layoutSource, /'\/app\/admin\/activate'/, 'The app layout should hide the sidebar for first-time company activation.')

console.log('Corporate activation page verified.')
