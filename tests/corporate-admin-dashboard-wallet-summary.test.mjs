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
  'Corporate admin dashboard should render a session wallet summary card.',
)

assert.match(
  source,
  /xl:grid-cols-\[minmax\(0,1fr\)_360px\]/,
  'Corporate admin dashboard should render wallet in a compact top-row layout.',
)

assert.match(
  source,
  /CardHeader class=\"space-y-2 p-4 pb-2\"/,
  'Corporate admin dashboard wallet summary should use compact header spacing.',
)

assert.match(
  source,
  /text-2xl font-semibold leading-none/,
  'Corporate admin dashboard wallet summary should use reduced balance typography.',
)

assert.match(
  source,
  /Manage Billing|Buy Sessions/,
  'Corporate admin dashboard wallet summary should include a billing utility action.',
)

assert.doesNotMatch(
  source,
  /<Tabs v-else|TabsTrigger value="overview"|resolveAdminTab/,
  'Corporate admin dashboard should no longer rely on internal overview/employees/analytics tabs.',
)

assert.match(
  source,
  /<LineChart|<BarChart|<DonutChart|<VisSankey|#9a4884/,
  'Corporate admin dashboard should include chart-based visualizations.',
)

assert.match(
  source,
  /companySubscriptionsApi\.getCompanySubscriptions\(resolvedCompanyId\)/,
  'Corporate admin dashboard should load company subscription data for the wallet summary.',
)

assert.match(
  source,
  /DASHBOARD_DATE_PRESET_OPTIONS|Apply Filter|selectedStartDate|selectedEndDate/,
  'Corporate admin dashboard should expose a date-range filter control.',
)

assert.match(
  source,
  /dashboardApi\.getCompanyDashboard\(resolvedCompanyId, dateFilter\)/,
  'Corporate admin dashboard should request filtered data from backend using the selected date range.',
)

assert.match(
  source,
  /reviewAlertsApi\.getReviewAlertSummary\(resolvedCompanyId/,
  'Corporate admin dashboard should load review alert summary insights.',
)

assert.match(
  source,
  /pulsesApi\.getCompanyPulseSummary\(resolvedCompanyId/,
  'Corporate admin dashboard should load pulse completion insights.',
)

assert.match(
  source,
  /resolveActivityTimestamp[\s\S]*activity\.timestamp[\s\S]*activity\.createdAt[\s\S]*activity\.created_at/,
  'Corporate admin dashboard should normalize activity timestamp fields from backend responses.',
)

console.log('Corporate admin dashboard wallet card and visualization structure verified.')
