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

console.log('Company admin walkthrough UI components verified.')
