import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const exists = path => existsSync(new URL(path, import.meta.url))

const corporateNavigationSource = read('../navigation/vertical/corporate-admin.ts')
const reportsIndexSource = read('../pages/app/admin/reports/index.vue')
const roleManagerSource = read('../utils/roleManager.ts')

const expectedReports = [
  ['Program Report', '/app/admin/reports/programs', '../pages/app/admin/reports/programs.vue', 'loadProgramReport'],
  ['Participant Report', '/app/admin/reports/participants', '../pages/app/admin/reports/participants.vue', 'loadParticipantReport'],
  ['Mentor Match Report', '/app/admin/reports/matches', '../pages/app/admin/reports/matches.vue', 'loadMatchReport'],
  ['Session Report', '/app/admin/reports/sessions', '../pages/app/admin/reports/sessions.vue', 'loadSessionReport'],
  ['Pulse Coverage Report', '/app/admin/reports/pulses', '../pages/app/admin/reports/pulses.vue', 'loadPulseCoverageReport'],
  ['Risk Signals Report', '/app/admin/reports/risk-signals', '../pages/app/admin/reports/risk-signals.vue', 'loadRiskSignalsReport'],
  ['Billing Transactions Report', '/app/admin/reports/billing-transactions', '../pages/app/admin/reports/billing-transactions.vue', 'loadBillingTransactionsReport'],
]

assert.match(
  corporateNavigationSource,
  /title:\s*'Reports'[\s\S]*?url:\s*'\/app\/admin\/reports'[\s\S]*?permission:\s*'admin:reports'/,
  'Corporate admin Reports sidebar item should link to the reports index, not analytics.',
)

assert.match(
  roleManagerSource,
  /'\/app\/admin\/reports':\s*\[\s*'admin:reports'\s*\]/,
  'Reports index route should be protected by admin:reports in roleManager.',
)

assert.match(
  roleManagerSource,
  /'\/app\/admin\/reports\/\*':\s*\[\s*'admin:reports'\s*\]/,
  'Dedicated report routes should be protected by admin:reports in roleManager.',
)

for (const [name, route, pagePath, loadAction] of expectedReports) {
  assert.match(
    reportsIndexSource,
    new RegExp(`<NuxtLink[\\s\\S]*?to="${route}"[\\s\\S]*?${name}[\\s\\S]*?</NuxtLink>`),
    `Reports index should include a link for ${name}.`,
  )

  assert.match(
    reportsIndexSource,
    /text-blue-600[\s\S]*?underline|underline[\s\S]*?text-blue-600/,
    'Report links should be blue and underlined.',
  )

  assert.ok(exists(pagePath), `${name} should have its own page file.`)

  const pageSource = read(pagePath)
  assert.match(
    pageSource,
    /permissions:\s*\[\s*'admin:reports'\s*\]/,
    `${name} should be protected by admin:reports.`,
  )
  assert.match(
    pageSource,
    new RegExp(`${loadAction}\\(`),
    `${name} should load data through the reports store action ${loadAction}.`,
  )
  assert.match(
    pageSource,
    /<Table[\s>]/,
    `${name} should render a row-based table, not only KPI cards.`,
  )
}

const reportsRequestSource = read('../http/requests/app/reports.ts')
const reportsStoreSource = read('../store/modules/reports.ts')

for (const [, , , loadAction] of expectedReports) {
  assert.match(
    reportsStoreSource,
    new RegExp(`async\\s+${loadAction}\\b`),
    `Reports store should expose ${loadAction}.`,
  )
}

assert.match(
  reportsRequestSource,
  /\/v1\/companies\/\$\{companyId\}\/reports\/\$\{reportPath\}/,
  'Reports request module should call dedicated company report backend endpoints.',
)

for (const reportPath of ['programs', 'participants', 'matches', 'sessions', 'pulses', 'risk-signals', 'billing-transactions']) {
  assert.match(
    reportsRequestSource,
    new RegExp(`['"]${reportPath}['"]`),
    `Reports request module should request the dedicated ${reportPath} report endpoint.`,
  )
}

console.log('Admin reports pages verified.')
