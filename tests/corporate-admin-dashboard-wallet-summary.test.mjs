import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../pages/app/admin/index.vue', import.meta.url), 'utf8')

assert.match(
  source,
  /managedCompanyWallet/,
  'Corporate admin dashboard should derive a managed company wallet summary.',
)

assert.match(
  source,
  /walletAvailableSessions|sessionsAvailable/,
  'Corporate admin dashboard should expose available company-funded sessions.',
)

assert.match(
  source,
  /Session Wallet/,
  'Corporate admin dashboard overview should render a session wallet summary card.',
)

const walletTitleIndex = source.indexOf('Session Wallet')
const tabsIndex = source.indexOf('<Tabs v-else')

assert.ok(
  walletTitleIndex !== -1 && tabsIndex !== -1 && walletTitleIndex < tabsIndex,
  'Corporate admin dashboard should place the session wallet summary above the dashboard tabs.',
)

assert.match(
  source,
  /Manage Billing|Buy Sessions/,
  'Corporate admin dashboard wallet summary should include a billing utility action.',
)

assert.match(
  source,
  /CardHeader class="space-y-2 p-4 pb-2"/,
  'Corporate admin dashboard wallet summary should use a compact header spacing.',
)

assert.match(
  source,
  /text-2xl font-semibold leading-none/,
  'Corporate admin dashboard wallet summary should use a reduced primary balance size.',
)

assert.match(
  source,
  /rounded-xl border bg-muted\/30 px-3 py-2\.5/,
  'Corporate admin dashboard wallet summary should use tighter inner card padding.',
)

assert.doesNotMatch(
  source,
  /Company-funded balance ready for allocation and booking\./,
  'Corporate admin dashboard wallet summary should not render the helper description copy.',
)

assert.doesNotMatch(
  source,
  /Updated \{\{ formatDateTime\(managedCompanySubscription\.updatedAt \|\| managedCompanySubscription\.createdAt\) \}\}/,
  'Corporate admin dashboard wallet summary should not render the updated timestamp.',
)

assert.match(
  source,
  /companySubscriptionsApi\.getCompanySubscriptions\(resolvedCompanyId\)/,
  'Corporate admin dashboard should load company subscription data for the wallet summary.',
)

console.log('Corporate admin dashboard wallet summary verified.')
