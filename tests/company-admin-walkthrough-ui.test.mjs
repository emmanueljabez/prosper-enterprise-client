import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const checklistUrl = new URL('../components/app/admin/onboarding/CompanyAdminChecklist.vue', import.meta.url)
const walkthroughUrl = new URL('../components/app/admin/onboarding/CompanyAdminWalkthrough.client.vue', import.meta.url)

assert.equal(existsSync(checklistUrl), true, 'Admin onboarding checklist component should exist.')
assert.equal(existsSync(walkthroughUrl), true, 'Admin onboarding walkthrough client component should exist.')

const checklistSource = readFileSync(checklistUrl, 'utf8')
const walkthroughSource = readFileSync(walkthroughUrl, 'utf8')

assert.match(
  checklistSource,
  /useCompanyWalkthroughStore/,
  'Checklist should use the company walkthrough store.',
)

assert.match(
  checklistSource,
  /Getting Started|Company setup checklist/,
  'Checklist should provide a visible getting-started surface.',
)

assert.match(
  checklistSource,
  /completionPercent/,
  'Checklist should render progress from the walkthrough store.',
)

assert.match(
  walkthroughSource,
  /VOnboardingWrapper/,
  'Walkthrough should render v-onboarding wrapper.',
)

assert.match(
  walkthroughSource,
  /VOnboardingStep/,
  'Walkthrough should use custom step UI through VOnboardingStep.',
)

for (const tourId of [
  'admin-dashboard-overview',
  'admin-wallet-overview',
  'admin-mentees-overview',
  'admin-programs-overview',
  'admin-matches-overview',
  'admin-analytics-overview',
]) {
  assert.match(walkthroughSource, new RegExp(tourId), `Walkthrough should define ${tourId}.`)
}

assert.match(
  walkthroughSource,
  /waitForFirstStepTarget/,
  'Walkthrough should wait for anchored DOM elements before starting a tour.',
)

assert.doesNotMatch(
  checklistSource + walkthroughSource,
  /Browse all mentors|marketplace/i,
  'Company admin walkthrough should not send admins into marketplace-first language.',
)

const sidebarSource = readFileSync(new URL('../layouts/components/sidebar.vue', import.meta.url), 'utf8')

assert.match(
  sidebarSource,
  /CompanyAdminWalkthrough/,
  'Corporate app layout should mount the company admin walkthrough client component.',
)

for (const anchor of [
  'admin-sidebar-wallet',
  'admin-nav-dashboard',
  'admin-nav-mentees',
  'admin-nav-programs',
  'admin-nav-billing',
  'admin-nav-mentors',
  'admin-nav-sessions',
]) {
  assert.match(sidebarSource, new RegExp(anchor), `Sidebar should expose ${anchor} walkthrough anchor.`)
}

const dashboardSource = readFileSync(new URL('../pages/app/admin/index.vue', import.meta.url), 'utf8')

assert.match(
  dashboardSource,
  /CompanyAdminChecklist/,
  'Corporate admin dashboard should render the company setup checklist.',
)

for (const anchor of [
  'admin-dashboard-header',
  'admin-dashboard-filters',
  'admin-dashboard-kpis',
  'admin-dashboard-wallet',
  'admin-dashboard-employee-onboarding',
  'admin-dashboard-program-funnel',
  'admin-dashboard-analytics',
]) {
  assert.match(dashboardSource, new RegExp(anchor), `Dashboard should expose ${anchor} walkthrough anchor.`)
}

const employeesSource = readFileSync(new URL('../pages/app/admin/employees.vue', import.meta.url), 'utf8')
const programsSource = readFileSync(new URL('../pages/app/admin/programs/index.vue', import.meta.url), 'utf8')
const matchesSource = readFileSync(new URL('../pages/app/admin/matches.vue', import.meta.url), 'utf8')
const analyticsSource = readFileSync(new URL('../pages/app/admin/analytics.vue', import.meta.url), 'utf8')

for (const anchor of [
  'admin-employees-header',
  'admin-employees-import',
  'admin-employees-invite',
  'admin-employees-allocation',
]) {
  assert.match(employeesSource, new RegExp(anchor), `Mentees page should expose ${anchor}.`)
}

for (const anchor of [
  'admin-programs-header',
  'admin-programs-create',
  'admin-programs-list',
]) {
  assert.match(programsSource, new RegExp(anchor), `Programs page should expose ${anchor}.`)
}

for (const anchor of [
  'admin-matches-header',
  'admin-matches-program-selector',
  'admin-matches-mentor-pool',
  'admin-matches-assignments',
]) {
  assert.match(matchesSource, new RegExp(anchor), `Matches page should expose ${anchor}.`)
}

for (const anchor of [
  'admin-analytics-header',
  'admin-analytics-filters',
  'admin-analytics-summary',
]) {
  assert.match(analyticsSource, new RegExp(anchor), `Analytics page should expose ${anchor}.`)
}

console.log('Company admin walkthrough UI components verified.')
