import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const invoiceSource = readFileSync(
  new URL('../pages/payment/invoice/[token].vue', import.meta.url),
  'utf8',
)
const publicHeaderSource = readFileSync(
  new URL('../components/landing/PublicSiteHeader.vue', import.meta.url),
  'utf8',
)
const authMiddlewareSource = readFileSync(
  new URL('../middleware/auth.global.ts', import.meta.url),
  'utf8',
)

assert.match(invoiceSource, /import PublicSiteHeader/, 'Invoice checkout should reuse the enterprise landing header.')
assert.match(invoiceSource, /import SocialFooter/, 'Invoice checkout should reuse the enterprise landing footer.')
assert.match(invoiceSource, /<PublicSiteHeader\s*\/>/, 'Invoice checkout should render the public header.')
assert.match(invoiceSource, /<SocialFooter\s*\/>/, 'Invoice checkout should render the public footer.')
assert.match(invoiceSource, /MENTORSHIP SESSION/, 'Invoice checkout should show the mentorship session eyebrow.')
assert.match(invoiceSource, /Select Payment/, 'Invoice checkout should keep the select payment section.')
assert.match(invoiceSource, /Secure, encrypted transaction/, 'Invoice checkout should show secure transaction copy.')
assert.doesNotMatch(invoiceSource, /truncate text-\[13px\]/, 'Invoice descriptions should wrap instead of being clipped.')
assert.doesNotMatch(invoiceSource, /lg:min-h-\[640px\]/, 'Desktop checkout card should not force an oversized height.')
assert.doesNotMatch(invoiceSource, /lg:py-20/, 'Desktop checkout page padding should stay compact enough to fit the card in the viewport.')
assert.doesNotMatch(invoiceSource, /lg:pt-\[120px\]/, 'Payment column should not use a large top offset that pushes content below the fold.')
assert.match(invoiceSource, /Choose M-PESA Payment Method/, 'M-Pesa selection should open a payment method dialog.')
assert.match(invoiceSource, /Pay With Phone Number/, 'M-Pesa dialog should expose the STK push path as phone-number payment.')
assert.match(invoiceSource, /Pay Via Paybill/, 'M-Pesa dialog should expose the Paybill path.')
assert.match(invoiceSource, /const selectedMpesaMethod = ref<'PAYBILL' \| 'STK'>\('PAYBILL'\)/, 'Paybill should be the default highlighted M-Pesa option.')
assert.match(invoiceSource, /const MPESA_PAYBILL_NUMBER = '4045031'/, 'M-Pesa Paybill number should match the configured business Paybill.')
assert.match(invoiceSource, /mpesaAccountNumber/, 'M-Pesa Paybill account number should be derived dynamically from invoice data.')
assert.match(invoiceSource, /invoice\.value\?\.mpesaAccountReference/, 'M-Pesa Paybill account number should prefer the backend-provided numeric account reference.')
assert.match(invoiceSource, /slice\(0,\s*8\)\.padEnd\(8,\s*'0'\)/, 'Frontend fallback M-Pesa account references should stay at 8 numeric digits.')
assert.match(invoiceSource, /STK Push Sent/, 'Phone-number M-Pesa payment should show the STK sent confirmation dialog state.')
assert.doesNotMatch(invoiceSource, /mpesaDialogStep === 'STK_SENT' \? 'Account Name' : 'Account Number'/, 'STK confirmation should label the dynamic account number instead of account name.')
assert.doesNotMatch(invoiceSource, /mpesaDialogStep === 'STK_SENT' \? 'Prosper Mentor' : mpesaAccountNumber/, 'STK confirmation should show the same dynamic account number used for Paybill reconciliation.')
assert.match(invoiceSource, /const handleInvoicePaid = \(\) => \{[\s\S]*mpesaDialogOpen\.value = false/, 'Successful invoice polling should dismiss any open M-Pesa dialog.')
assert.match(invoiceSource, /selectedMethod === 'MPESA'/, 'Invoice checkout should preserve M-Pesa selection logic.')
assert.match(invoiceSource, /selectedMethod === 'CARD'/, 'Invoice checkout should preserve card selection logic.')
assert.match(invoiceSource, /submitPayment/, 'Invoice checkout should preserve the existing payment submit flow.')

assert.match(publicHeaderSource, /useAuthStore/, 'Public header should read auth state.')
assert.match(publicHeaderSource, /initializeFromStorage/, 'Public header should initialize stored auth before deciding account links.')
assert.match(publicHeaderSource, /isAuthenticated/, 'Public header should derive authenticated account state.')
assert.match(publicHeaderSource, /Dashboard/, 'Public header should offer an app entry for authenticated users.')
assert.match(publicHeaderSource, /Sign In/, 'Public header should keep a sign-in action for guests.')
assert.match(publicHeaderSource, /Sign Up/, 'Public header should keep a sign-up action for guests.')

assert.match(
  authMiddlewareSource,
  /PUBLIC_PAYMENT_PREFIX[\s\S]*\/payment\//,
  'Public invoice payment links should bypass the global auth redirect.',
)

const invoiceTypesSource = readFileSync(
  new URL('../http/requests/app/invoices.ts', import.meta.url),
  'utf8',
)

assert.match(invoiceTypesSource, /mpesaAccountReference: string/, 'Public invoice payload should type the backend-provided numeric M-Pesa account reference.')

console.log('Payment invoice redesign contract verified.')
