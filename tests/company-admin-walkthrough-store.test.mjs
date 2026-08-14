import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const typesUrl = new URL('../types/company-walkthrough.ts', import.meta.url)
const storeUrl = new URL('../store/modules/company-walkthrough.ts', import.meta.url)

assert.equal(existsSync(typesUrl), true, 'Walkthrough types should live in a dedicated types file.')
assert.equal(existsSync(storeUrl), true, 'Walkthrough progress should live in a dedicated Pinia store.')

const typesSource = readFileSync(typesUrl, 'utf8')
const storeSource = readFileSync(storeUrl, 'utf8')
const companyRequestsSource = readFileSync(new URL('../http/requests/app/company.ts', import.meta.url), 'utf8')

for (const taskId of [
  'review_dashboard',
  'fund_session_wallet',
  'invite_mentees',
  'create_program',
  'match_mentors',
  'review_analytics',
]) {
  assert.match(typesSource, new RegExp(taskId), `Walkthrough task list should include ${taskId}.`)
}

assert.match(
  typesSource,
  /COMPANY_ADMIN_WALKTHROUGH_VERSION/,
  'Walkthrough progress should be versioned so future tours can reset intentionally.',
)

assert.match(
  storeSource,
  /defineStore\('company-walkthrough'/,
  'Walkthrough progress should use a named Pinia store.',
)

assert.match(
  storeSource,
  /localStorage\.getItem|localStorage\.setItem/,
  'Walkthrough progress should keep localStorage as a browser cache/fallback.',
)

assert.match(
  storeSource,
  /companyId[\s\S]*userId|userId[\s\S]*companyId/,
  'Walkthrough cache should be scoped to both company and user.',
)

assert.match(
  storeSource,
  /companyApi.*getWalkthroughProgress|companyApi.*updateWalkthroughProgress/,
  'Walkthrough progress should sync through the company request module.',
)

assert.match(
  companyRequestsSource,
  /getWalkthroughProgress[\s\S]*\/v1\/companies\/\$\{companyId\}\/walkthrough-progress/,
  'Company requests should expose a backend read path for walkthrough progress.',
)

assert.match(
  companyRequestsSource,
  /updateWalkthroughProgress[\s\S]*axiosInstance\.put\(`\/v1\/companies\/\$\{companyId\}\/walkthrough-progress`/,
  'Company requests should expose a backend write path for walkthrough progress.',
)

assert.match(
  storeSource,
  /completionPercent/,
  'Walkthrough store should expose checklist completion progress.',
)

assert.match(
  storeSource,
  /markTaskComplete/,
  'Walkthrough store should expose a task completion action.',
)

assert.match(
  storeSource,
  /startTour/,
  'Walkthrough store should expose a route-local tour start action.',
)

console.log('Company admin walkthrough store verified.')
